import React from 'react'

interface ImageViewerProps {
  image: string
  closeImage: () => void
}

export default function ImageViewer({ image, closeImage }: ImageViewerProps): React.JSX.Element {
  return (
    <>
      <div
        id="zoom-container"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 cursor-zoom-out"
        onClick={(event) => {
          event.stopPropagation()
          closeImage()
        }}
      >
        <img
          src={image}
          alt="Zoomed EPUB illustration"
          className="max-w-full max-h-full object-contain touch-pinch-zoom"
        />
        <button
          className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-2"
          onClick={closeImage}
        >
          ✕
        </button>
      </div>
    </>
  )
}
