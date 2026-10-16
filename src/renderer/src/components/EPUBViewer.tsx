import { useEffect, useRef } from 'react'
import ePub, { Rendition } from 'epubjs'

interface EPUBViewerProps {
  buffer: ArrayBuffer
}

export default function EPUBViewer({ buffer }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)

  useEffect(() => {
    if (!viewerRef.current) return
    console.log('Buffer exists! Showing EPUB.')

    const book = ePub(buffer)
    const rendition = book.renderTo(viewerRef.current, { width: '100%', height: '100%' })
    renditionRef.current = rendition
    rendition.display()

    return () => {
      console.log('Cleaning up book...')
      book.destroy()
    }
  }, [buffer])

  const handleNext = (): void => {
    if (renditionRef.current) {
      renditionRef.current.next()
    }
  }

  const handlePrev = (): void => {
    if (renditionRef.current) {
      renditionRef.current.prev()
    }
  }

  return (
    <>
      <div className="flex h-full w-full flex-col bg-[#F4F1EA]">
        {/* Container that EPUB is injected into */}
        <div ref={viewerRef} className="flex-1 w-full overflow-hidden" />

        {/* Bottom Navigation Bar */}
        <div className="flex h-16 w-full shrink-0 items-center justify-between border-t border-slate-300/50 bg-white/80 px-8 shadow-sm backdrop-blur-sm">
          <button
            onClick={handlePrev}
            className="rounded-md px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            ← Previous
          </button>

          <span className="text-sm font-medium tracking-wide text-slate-400">Reading</span>

          <button
            onClick={handleNext}
            className="rounded-md px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Next →
          </button>
        </div>
      </div>
    </>
  )
}
