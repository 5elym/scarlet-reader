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
