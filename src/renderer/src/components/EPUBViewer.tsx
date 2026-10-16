import { useEffect, useRef, useState } from 'react'
import ePub, { Rendition } from 'epubjs'
import { addHighlight } from '../utils/annotation'
import SelectionMenu from './SelectionMenu'

interface EPUBViewerProps {
  buffer: ArrayBuffer
}

export default function EPUBViewer({ buffer }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const selectionRef = useRef<string | null>(null)

  const [showUI, setShowUI] = useState(true)
  const [currentSelection, setCurrentSelection] = useState<string | null>(null)

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

  useEffect(() => {
    if (!viewerRef.current) return
    console.log('Buffer exists! Showing EPUB.')

    const book = ePub(buffer)
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none'
    })
    renditionRef.current = rendition
    rendition.display()

    rendition.on('click', (e: MouseEvent) => {
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
      const clickX = e.clientX

      if (clickX > screenWidth * 0.35 && clickX < screenWidth * 0.65) {
        setShowUI((prev) => !prev)
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
      <div className="relative h-full w-full bg-[#F4F1EA]">
        {/* The Book Container (Takes up 100% of screen) */}
        <div ref={viewerRef} className="absolute inset-0 z-0" />

        {currentSelection && (
          <SelectionMenu
            onHighlight={() => handleApplyHighlight('#fde047')}
            onCancel={handleCancelSelection}
          />
        )}

        {/* Top Navigation Overlay */}
        <div
          className={`absolute top-0 left-0 z-10 w-full transform bg-white/95 px-6 py-4 shadow-sm backdrop-blur transition-transform duration-300 ${
            showUI ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between pt-safe">
            {' '}
            {/* pt-safe handles mobile notches later */}
            <button className="text-slate-600 font-medium">Library</button>
            <span className="text-sm font-bold text-slate-800 tracking-wide">Modern Reader</span>
            <button className="text-slate-600 font-medium">Aa</button> {/* Typography Menu */}
          </div>
        </div>

        {/* Bottom Progress Overlay */}
        <div
          className={`absolute bottom-0 left-0 z-10 w-full transform bg-white/95 px-6 py-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur transition-transform duration-300 ${
            showUI ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between pb-safe">
            <span className="text-xs text-slate-500">Chapter 1</span>
            <span className="text-xs font-semibold text-slate-900">4%</span>
            <span className="text-xs text-slate-500">12 mins left</span>
          </div>
        </div>
      </div>
    </>
  )
}
