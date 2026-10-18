import React from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

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
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={5}
          centerOnInit={true}
          doubleClick={{
            mode: 'toggle',
            step: 1,
            animationType: 'easeInOutQuad'
          }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <img
              src={image}
              alt="Zoomed EPUB illustration"
              className="max-w-full max-h-full object-contain pointer-events-auto"
            />
          </TransformComponent>
        </TransformWrapper>
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
