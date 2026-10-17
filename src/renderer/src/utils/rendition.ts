import { Rendition } from 'epubjs'
import { applyGlobalNotes } from './annotation'

export function setTheme(rendition: Rendition): void {
  rendition.themes.default({
    // Base body styling for readability on black
    body: {
      color: '#e4e4e7 !important', // Tailwind zinc-200
      background: 'transparent',
      'font-family':
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    'p, div, li': {
      color: '#e4e4e7 !important'
    },
    'blockquote, [class*="extract"], [class*="epigraph"], [class*="quote"]': {
      'font-style': 'italic !important',
      color: '#a1a1aa !important',
      'margin-left': '8% !important',
      'margin-right': '8% !important',
      'margin-bottom': '2em !important',
      'padding-left': '1em !important',
      'border-left': '2px solid #dc2626 !important' // A red accent line on the left
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
}

export function register(rendition: Rendition, notesRef): void {
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

    applyGlobalNotes(doc, notesRef.current)
  })
}

export function relocatedEvent(rendition: Rendition, setCurrentLocation): void {
  rendition.on('relocated', (location) => {
    setCurrentLocation(location.start.href)
  })
}

export function clickEvent(
  rendition: Rendition,
  notesRef,
  selectionRef,
  setActiveNote,
  setCurrentSelection,
  setShowMenu
): void {
  rendition.on('click', (e: MouseEvent) => {
    // Global Notes
    const target = e.target as HTMLElement
    const noteSpan = target.closest('.global-note')
    if (noteSpan) {
      const term = noteSpan.getAttribute('data-term')?.toLowerCase()
      if (term && notesRef.current[term]) {
        // Show the note UI and STOP the page from turning
        setActiveNote({ term, note: notesRef.current[term] })
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
}

export function selectedEvent(rendition: Rendition, selectionRef, setCurrentSelection): void {
  rendition.on('selected', (cfiRange: string) => {
    console.log('User highlighted this location:', cfiRange)
    setCurrentSelection(cfiRange)
    selectionRef.current = cfiRange
  })
}
