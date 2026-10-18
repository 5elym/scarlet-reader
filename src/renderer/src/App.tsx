import { useEffect, useState } from 'react'
import EPUBViewer from './components/EPUBViewer'
import { initialiseAppStorage, openFilePicker } from './utils/storage'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { pageStack } from './utils/returnBack'
import Header from './components/Library/Header'
import BookList from './components/Library/BookList'
import SettingsButton from './components/Library/SettingsButton'

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
            <Header />

            <BookList filePath={filePath} openFile={handleOpenFile} />

            <SettingsButton />
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
