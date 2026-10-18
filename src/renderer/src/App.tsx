import { useEffect, useState } from 'react'
import EPUBViewer from './components/EPUBViewer'
import { initialiseAppStorage, openFilePicker } from './utils/storage'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { pageStack } from './utils/returnBack'
import { BookOpen, Settings } from 'lucide-react'

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
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-black text-zinc-200">
        {!fileBuffer ? (
          <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-6 pb-28 pt-10 sm:px-10">
            <header className="border-b border-zinc-800/80 pb-6">
              <p className="text-[10px] text-center font-semibold uppercase tracking-[0.3em] text-red-500">
                Scarlet Reader
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-light tracking-wide text-white">Library</h1>
                  <p className="mt-1 text-sm text-zinc-500">Your reading collection</p>
                </div>
                <span className="pb-1 text-xs uppercase tracking-widest text-zinc-600">
                  0 books
                </span>
              </div>
            </header>

            <main className="flex flex-1 flex-col pt-7">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Recently added
              </h2>

              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-12 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-500">
                  <BookOpen size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-zinc-200">Your library is empty</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
                  Choose an EPUB to start building your reading collection.
                </p>
                <button
                  onClick={handleOpenFile}
                  className="mt-7 rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:border-red-600/70 hover:text-red-400 active:scale-95"
                >
                  Choose EPUB
                </button>
                {filePath && (
                  <p className="mt-4 max-w-xs truncate text-xs tracking-widest text-zinc-600">
                    {filePath.split('/').pop() || filePath.split('\\').pop()}
                  </p>
                )}
              </div>
            </main>

            <button
              type="button"
              aria-label="Settings"
              className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-200 shadow-xl transition-colors hover:border-red-500 hover:text-red-400 active:scale-95"
            >
              <Settings size={20} strokeWidth={1.75} />
            </button>
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
