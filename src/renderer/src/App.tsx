import { useEffect, useState } from 'react'
import EPUBViewer from './components/EPUBViewer'
import { initialiseAppStorage, openFilePicker } from './utils/storage'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { pageStack } from './utils/returnBack'

export default function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer>()

  useEffect(() => {
    initialiseAppStorage() // Documents/ScarletReader/Books
  }, [])

  // Hijack back button or gesture on mobile device
  useEffect(() => {
    CapacitorApp.addListener('backButton', () => {
      if (pageStack.length > 0) {
        const topAction = pageStack[pageStack.length - 1]
        topAction()
      } else {
        CapacitorApp.exitApp()
      }
    })

    return () => {
      CapacitorApp.removeAllListeners()
    }
  }, [])

  const handleOpenFile = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const selectedPath = await window.api.openFileDialog()

      if (selectedPath) {
        const buffer = await window.api.readBinaryFile(selectedPath)
        setFilePath(selectedPath)
        setFileBuffer(buffer)
        console.log('User picked file:', selectedPath)
      }
      return
    }

    const buffer = await openFilePicker()
    if (buffer) {
      setFileBuffer(buffer)
    }
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-zinc-200">
        {!fileBuffer ? (
          <div className="flex w-full max-w-sm flex-col items-center gap-10 p-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-light tracking-[0.2em] text-white uppercase">Reader</h1>
              <div className="h-px w-12 bg-red-600/50" />
            </div>

            <button
              onClick={handleOpenFile}
              className="w-full rounded-full border border-zinc-800 bg-black px-8 py-4 text-sm font-medium tracking-widest text-white transition-all active:scale-95 active:border-red-600 active:text-red-500 outline-none"
            >
              CHOOSE EPUB
            </button>

            {filePath && (
              <p className="mt-4 max-w-xs text-center text-xs tracking-widest text-zinc-600 truncate">
                {filePath.split('/').pop() || filePath.split('\\').pop()}{' '}
              </p>
            )}
          </div>
        ) : (
          <div className="h-full w-full bg-black">
            <EPUBViewer
              buffer={fileBuffer}
              onExit={() => {
                setFileBuffer(undefined)
                setFilePath(null)
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}
