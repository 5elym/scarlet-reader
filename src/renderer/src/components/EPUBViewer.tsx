import { useEffect, useRef, useState } from 'react'
import ePub, { Rendition } from 'epubjs'
import { addHighlight } from '../utils/annotation'
import SelectionMenu from './SelectionMenu'
import BubbleMenu from './BubbleMenu'

interface EPUBViewerProps {
  buffer: ArrayBuffer
}

export default function EPUBViewer({ buffer }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const selectionRef = useRef<string | null>(null)

  const [showUI, setShowUI] = useState(false)
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
      spread: 'none',
      flow: 'paginated',
      manager: 'default'
    })

    rendition.themes.default({
      'html, body': {
        overflow: 'hidden !important'
      },
      // Base body styling for readability on black
      body: {
        color: '#e4e4e7', // Tailwind zinc-200
        background: 'transparent',
        'font-family':
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important'
      },
      // Paragraph spacing and line height for comfortable reading
      p: {
        'line-height': '1.8 !important',
        'font-size': '1.1rem !important',
        'margin-bottom': '1em !important'
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
      const clickX = e.clientX % screenWidth

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
      <div className="relative h-full w-full overflow-hidden">
        {/* The Book Container (Takes up 100% of screen) */}
        <div ref={viewerRef} className="absolute inset-0 z-0 overflow-hidden" />

        {currentSelection && (
          <SelectionMenu
            onHighlight={() => handleApplyHighlight('#fde047')}
            onCancel={handleCancelSelection}
          />
        )}

        {/* Top Navigation Overlay */}
        <BubbleMenu isOpen={showUI} onClose={() => setShowUI(false)} />
      </div>
    </>
  )
}

// Hello world
