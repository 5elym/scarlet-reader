import { Rendition } from 'epubjs'

export interface HighlightOptions {
  color?: string
  className?: string
}

/**
 * Applies a visual highlight to an EPUB rendition and clears browser selection.
 */
export function addHighlight(
  rendition: Rendition,
  cfiRange: string,
  options: HighlightOptions = { color: '#fef08a' } // default light yellow
): void {
  // 1. Draw annotation inside the iframe
  rendition.annotations.highlight(
    cfiRange,
    {},
    () => {
      console.log('Tapped highlight at:', cfiRange)
    },
    options.className,
    { fill: options.color, 'fill-opacity': '0.4' }
  )

  // Clear native selection highlight
  const contents = rendition.getContents()
  if (contents) {
    contents.window.getSelection()?.removeAllRanges()
  }
}

export function applyGlobalNotes(doc: Document, notes: Record<string, string>): void {
  // Refresh note styling
  doc.querySelectorAll('.global-note').forEach((noteSpan) => {
    noteSpan.replaceWith(doc.createTextNode(noteSpan.textContent || ''))
  })

  const terms = Object.keys(notes)
  if (terms.length === 0) return

  terms.sort((a, b) => b.length - a.length) // Longest words first
  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi')

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
  const nodes: Node[] = []
  let n

  while ((n = walker.nextNode())) {
    // Avoid double-wrapping text inside already styled elements
    if (n.parentElement && !['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) {
      if (n.nodeValue?.match(regex)) nodes.push(n)
    }
  }

  nodes.forEach((node) => {
    const text = node.nodeValue || ''
    const wrapper = doc.createElement('span')
    wrapper.innerHTML = text.replace(
      regex,
      `<span class="global-note" data-term="$1" style="border-bottom: 1px dashed #dc2626; cursor: pointer;">$1</span>`
    )
    node.parentNode?.replaceChild(wrapper, node)
  })
}
