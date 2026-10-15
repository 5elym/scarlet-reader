import { useEffect, useRef } from 'react'
import ePub from 'epubjs'

interface EPUBViewerProps {
  buffer: ArrayBuffer
}

export default function EPUBViewer({ buffer }: EPUBViewerProps): React.JSX.Element {
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!viewerRef.current) return
    console.log('Buffer exists! Showing EPUB.')

    const book = ePub(buffer)
    const rendition = book.renderTo(viewerRef.current, { width: '100%', height: '100%' })
    rendition.display()

    return () => {
      console.log('Cleaning up book...')
      book.destroy()
    }
  }, [buffer])

  return (
    <>
      {/* Container that EPUB is injected into */}
      <div ref={viewerRef} className="w-full h-full overflow-hidden" />

      {/* Container for pagination buttons */}
      <div className="flex flex-row">
        <button className="flex" />
        <button className="flex" />
      </div>
    </>
  )
}
