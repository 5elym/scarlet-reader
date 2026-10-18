import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ePub, { Rendition } from 'epubjs'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { addHighlight, applyGlobalNotes } from '../utils/annotation'
import SelectionMenu from './SelectionMenu'
import BubbleMenu from './NavMenu/BubbleMenu'
import ContentsMenu from './Contents/ContentsMenu'
import NoteEditor from './Notes/NoteEditor'
import NoteViewer from './Notes/NoteViewer'
import {
  clickEvent,
  configureImageZoom,
  colourText,
  relocatedEvent,
  selectedEvent,
  setTheme
} from '../utils/rendition'
import { Chapter } from '../utils/chapter'
import { loadGlobalNotes, saveGlobalNotes } from '../utils/storage'
import { useHardwareBack } from '../utils/returnBack'
import ImageViewer from './ImageViewer'

interface EPUBViewerProps {
  buffer: ArrayBuffer
  onExit: () => void
}

export default function EPUBViewer({ buffer, onExit }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const selectionRef = useRef<string | null>(null)
  const globalNotesRef = useRef<Record<string, string>>({})
  const dbKeyRef = useRef<string | null>(null)
  const zoomedImageRef = useRef(false)

  const [activeNote, setActiveNote] = useState<{ term: string; note: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showContents, setShowContents] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [currentSelection, setCurrentSelection] = useState<string | null>(null)
  const [isTypingNote, setIsTypingNote] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  useHardwareBack(true, () => {})

  const handleSetZoomedImage = (image: string | null): void => {
    zoomedImageRef.current = !!image
    if (image) setShowMenu(false)
    setZoomedImage(image)
  }

  const handleApplyHighlight = (color?: string): void => {
    if (!renditionRef.current || !currentSelection) return

    addHighlight(renditionRef.current, currentSelection, { color })
    setCurrentSelection(null)
  }

  const handleCancelSelection = (): void => {
    if (renditionRef.current) {
      const contents = renditionRef.current.getContents()
      contents[0]?.window.getSelection()?.removeAllRanges()
    }
    setCurrentSelection(null)
    selectionRef.current = null
  }

  const handleSelectChapter = (href: string): void => {
    if (renditionRef.current) {
      renditionRef.current.display(href)
      setShowContents(false)
      setShowMenu(false)
    }
  }

  const handleCreateNote = async (userNote: string): Promise<void> => {
    if (!renditionRef.current) return

    const contents = renditionRef.current.getContents()[0]
    const range = currentSelection ? renditionRef.current.getRange(currentSelection) : null
    const selectedText = range?.toString().trim().toLowerCase()

    if (selectedText && dbKeyRef.current) {
      globalNotesRef.current[selectedText] = userNote

      try {
        const allSavedNotes = await loadGlobalNotes()
        allSavedNotes[dbKeyRef.current] = globalNotesRef.current

        await saveGlobalNotes(allSavedNotes)
      } catch (error) {
        console.error('Failed to save note to disk:', error)
      }

      applyGlobalNotes(contents.document, globalNotesRef.current)
    }

    setIsTypingNote(false)
    handleCancelSelection()
  }

  const handleDeleteNote = async (note: Record<string, string>): Promise<void> => {
    if (!renditionRef.current) return

    const contents = renditionRef.current.getContents()[0]

    try {
      const allSavedNotes = await loadGlobalNotes()
      if (!dbKeyRef.current) return

      delete allSavedNotes[dbKeyRef.current][note.term]
      globalNotesRef.current = allSavedNotes[dbKeyRef.current]

      await saveGlobalNotes(allSavedNotes)

      setActiveNote(null)
      applyGlobalNotes(contents.document, globalNotesRef.current)
    } catch (error) {
      console.error('Failed to delete note: ' + error)
    }
  }

  useEffect(() => {
    if (!viewerRef.current) return
    console.log('Buffer exists! Showing EPUB.')

    const book = ePub(buffer)
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
      manager: 'default'
    })

    setTheme(rendition)
    colourText(rendition, globalNotesRef)
    configureImageZoom(rendition, handleSetZoomedImage)
    relocatedEvent(rendition, setCurrentLocation)
    clickEvent(
      rendition,
      globalNotesRef,
      selectionRef,
      setActiveNote,
      setCurrentSelection,
      setShowMenu,
      zoomedImageRef
    )
    selectedEvent(rendition, selectionRef, setCurrentSelection)

    renditionRef.current = rendition // TODO: May need to swap this around later
    rendition.display()

    book.loaded.metadata.then(async (meta) => {
      // Create key
      const author = meta.creator || 'Unknown Author'
      const baseTitle = (meta.title || 'Unknown Book').split(/[:(]/)[0].trim()
      const currentBookKey = `notes_${author.split(' ').join('_')}_${baseTitle}`
      dbKeyRef.current = currentBookKey

      try {
        const allSavedNotes = await loadGlobalNotes()

        if (allSavedNotes[currentBookKey]) {
          globalNotesRef.current = allSavedNotes[currentBookKey]

          if (renditionRef.current) {
            const contents = renditionRef.current.getContents()[0]
            if (contents) applyGlobalNotes(contents.document, globalNotesRef.current)
          }
        } else {
          globalNotesRef.current = {}
        }
      } catch (err) {
        console.error('Failed to load notes from disk:', err)
      }
    })

    book.loaded.navigation.then((nav) => {
      // Recursive search for chapters
      const extractChapters = (tocArray): Chapter[] => {
        return tocArray.map((item) => ({
          label: item.label,
          href: item.href,
          subitems:
            item.subitems && item.subitems.length > 0 ? extractChapters(item.subitems) : undefined
        }))
      }

      setChapters(extractChapters(nav.toc))
    })

    return () => {
      console.log('Cleaning up book...')
      book.destroy()
    }
  }, [buffer])

  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
        {/* Book container (Takes up 100% of screen) */}
        <div ref={viewerRef} className="absolute inset-0 z-0 overflow-hidden" />

        {zoomedImage && (
          <ImageViewer image={zoomedImage} closeImage={() => handleSetZoomedImage(null)} />
        )}

        <AnimatePresence>
          {currentSelection && (
            <SelectionMenu
              onHighlight={() => handleApplyHighlight('#fde047')}
              onAddNote={() => setIsTypingNote(true)}
              onCancel={handleCancelSelection}
            />
          )}
        </AnimatePresence>

        {currentSelection && isTypingNote && (
          <NoteEditor
            onSave={handleCreateNote}
            isOpen={isTypingNote}
            onCancel={() => setIsTypingNote(false)}
          />
        )}
        {/* Note popup */}
        <AnimatePresence>
          {activeNote && (
            <NoteViewer
              key={activeNote.term}
              onClose={() => setActiveNote(null)}
              onDelete={handleDeleteNote}
              note={activeNote}
            />
          )}
        </AnimatePresence>

        {/* Nav menu */}
        {!zoomedImage && (
          <BubbleMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onHomeClick={onExit}
            onContentsClick={() => setShowContents(true)}
          />
        )}
        <ContentsMenu
          isOpen={showContents}
          onClose={() => setShowContents(false)}
          chapters={chapters}
          currentHref={currentLocation}
          onSelectChapter={handleSelectChapter}
        />
      </div>
    </>
  )
}

// Hello world
