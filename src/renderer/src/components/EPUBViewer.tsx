import { useEffect, useRef, useState } from 'react'
import ePub, { Rendition } from 'epubjs'
import { addHighlight, applyGlobalNotes } from '../utils/annotation'
import SelectionMenu from './SelectionMenu'
import BubbleMenu from './BubbleMenu'
import ContentsMenu from './Contents/ContentsMenu'
import NoteEditor from './Notes/NoteEditor'
import NoteViewer from './Notes/NoteViewer'

interface EPUBViewerProps {
  buffer: ArrayBuffer
  onExit: () => void
}

export default function EPUBViewer({ buffer, onExit }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const selectionRef = useRef<string | null>(null)
  const globalNotesRef = useRef<Record<string, string>>({})
  const [activeNote, setActiveNote] = useState<{ term: string; note: string } | null>(null)

  const [showMenu, setShowMenu] = useState(false)
  const [showContents, setShowContents] = useState(false)
  const [chapters, setChapters] = useState<{ label: string; href: string }[]>([])
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [currentSelection, setCurrentSelection] = useState<string | null>(null)
  const [isTypingNote, setIsTypingNote] = useState(false)

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

  const handleCreateNote = (userNote: string): void => {
    if (!renditionRef.current) return

    const contents = renditionRef.current.getContents()[0]

    const iframeWindow = contents.window
    const selectedText = iframeWindow.getSelection()?.toString().trim().toLowerCase()

    if (selectedText) {
      globalNotesRef.current[selectedText] = userNote
      applyGlobalNotes(contents.document, globalNotesRef.current)
    }

    setIsTypingNote(false)
    handleCancelSelection()
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

    rendition.themes.default({
      // Base body styling for readability on black
      body: {
        color: '#e4e4e7 !important', // Tailwind zinc-200
        background: 'transparent',
        'font-family':
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important'
      },
      'p, div, li, blockquote': {
        color: '#e4e4e7 !important'
      },
      // Paragraph spacing and line height for comfortable reading
      p: {
        'line-height': '1.8 !important',
        'font-size': '1.1rem !important',
        'margin-bottom': '1em !important'
      },
      'em, i': {
        color: '#a1a1aa !important', // Tailwind zinc-400
        'font-style': 'italic !important'
      },
      // Colour chapter titles
      'h1, h2, h3, h4, h5, h6': {
        color: '#dc2626 !important', // Tailwind red-600
        'text-align': 'center !important',
        'font-weight': '300 !important',
        'letter-spacing': '0.1em !important',
        'margin-top': '2em !important',
        'margin-bottom': '2em !important'
      },
      // Fix links just in case
      a: {
        color: '#ef4444 !important',
        'text-decoration': 'none !important'
      },
      'img, svg': {
        'max-width': '100% !important',
        'max-height': '80vh !important', // Prevents tall images from causing vertical scrolling
        width: 'auto !important', // Overrides hardcoded publisher widths
        height: 'auto !important', // Overrides hardcoded publisher heights
        'object-fit': 'contain !important', // Ensures the image keeps its aspect ratio
        display: 'block !important',
        margin: '0 auto !important',
        'page-break-inside': 'avoid !important',
        'break-inside': 'avoid !important'
      }
    })

    rendition.hooks.content.register((contents) => {
      const doc = contents.document

      // Colour chapter numbers
      const blocks = doc.querySelectorAll('p, div')
      blocks.forEach((el: HTMLElement) => {
        const text = el.textContent?.trim() || ''

        // Regex looks for standalone chapter markers
        if (
          /^(Chapter\s+[a-z0-9]+|Prologue|Epilogue|Part\s+[a-z0-9]+)$/i.test(text) &&
          text.length < 30
        ) {
          el.style.color = '#dc2626'
          el.style.textAlign = 'center'
          el.style.fontWeight = '300'
          el.style.letterSpacing = '0.1em'
          el.style.marginTop = '2em'
          el.style.marginBottom = '2em'
        }
      })

      // Colour lead ins
      const spans = doc.querySelectorAll('span')
      spans.forEach((span: HTMLElement) => {
        const text = span.textContent?.trim() || ''

        // If the span contains text, is purely uppercase, and is a few letters long
        if (text.length > 2 && text === text.toUpperCase() && !/\d/.test(text)) {
          span.style.color = '#dc2626'
          span.style.letterSpacing = '0.05em'
        }
      })

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false)
      const textNodes: Node[] = []
      let node

      // Gather all text nodes that contain straight (") or smart (“ ”) quotes
      while ((node = walker.nextNode())) {
        if (node.nodeValue && /["“]/.test(node.nodeValue)) {
          if (node.parentElement && !['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
            textNodes.push(node)
          }
        }
      }

      // Loop through the text and recolour the dialogue
      textNodes.forEach((textNode) => {
        const text = textNode.nodeValue || ''

        // This Regex matches either straight " or smart “” quotes, and everything inside them
        const quoteRegex = /(["“][^"”]+["”])/g

        if (quoteRegex.test(text)) {
          const wrapper = doc.createElement('span')

          wrapper.innerHTML = text.replace(
            quoteRegex,
            '<span style="color: #dc2626 !important; font-weight: 400;">$1</span>'
          )

          textNode.parentNode?.replaceChild(wrapper, textNode)
        }
      })

      applyGlobalNotes(doc, globalNotesRef.current)
    })

    renditionRef.current = rendition
    rendition.display()

    book.loaded.navigation.then((nav) => {
      // Recursive search for chapters
      const extractChapters = (tocArray): { label: string; href: string }[] => {
        return tocArray.map((item) => ({
          label: item.label,
          href: item.href,
          subitems:
            item.subitems && item.subitems.length > 0 ? extractChapters(item.subitems) : undefined
        }))
      }

      setChapters(extractChapters(nav.toc))
    })

    rendition.on('relocated', (location) => {
      setCurrentLocation(location.start.href)
    })

    rendition.on('click', (e: MouseEvent) => {
      // Global Notes
      const target = e.target as HTMLElement
      const noteSpan = target.closest('.global-note')
      if (noteSpan) {
        const term = noteSpan.getAttribute('data-term')?.toLowerCase()
        if (term && globalNotesRef.current[term]) {
          // Show the note UI and STOP the page from turning
          setActiveNote({ term, note: globalNotesRef.current[term] })
          return
        }
      }

      // Check for selected text
      const iframeWindow = e.view as Window
      const nativeSelection = iframeWindow?.getSelection()?.toString()

      // When selection is present
      if (nativeSelection && nativeSelection.length > 0) {
        return
      }

      // When selection is automatically cleared on click
      if (selectionRef.current) {
        setCurrentSelection(null)
        selectionRef.current = null
        return
      }

      const screenWidth = window.innerWidth
      const clickX = e.clientX % screenWidth

      if (clickX > screenWidth * 0.35 && clickX < screenWidth * 0.65) {
        setShowMenu((prev) => !prev)
      } else if (clickX >= screenWidth * 0.65) {
        rendition.next()
      } else {
        rendition.prev()
      }
    })

    rendition.on('selected', (cfiRange: string) => {
      console.log('User highlighted this location:', cfiRange)
      setCurrentSelection(cfiRange)
      selectionRef.current = cfiRange
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

        {currentSelection && (
          <SelectionMenu
            onHighlight={() => handleApplyHighlight('#fde047')}
            onAddNote={() => setIsTypingNote(true)}
            onCancel={handleCancelSelection}
          />
        )}
        {currentSelection && isTypingNote && (
          <NoteEditor onSave={handleCreateNote} onCancel={() => setIsTypingNote(false)} />
        )}
        {/* Note popup */}
        {activeNote && <NoteViewer onClose={() => setActiveNote(null)} note={activeNote} />}

        {/* Nav menu */}
        <BubbleMenu
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onHomeClick={onExit}
          onContentsClick={() => setShowContents(true)}
        />
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
