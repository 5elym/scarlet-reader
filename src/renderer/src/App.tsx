import { useEffect, useState } from 'react'
import EPUBViewer from './components/EPUBViewer'
import { initialiseAppStorage, openFilePicker } from './utils/storage'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { pageStack } from './utils/returnBack'
import Header from './components/Library/Header'
import List from './components/Library/BookList/List'
import SettingsButton from './components/Library/SettingsButton'
import { loadBooks, StoredBook } from './utils/storage'

export default function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer>()
  const [books, setBooks] = useState<StoredBook[] | null>(null)
  const [booksError, setBooksError] = useState<string | null>(null)

  useEffect(() => {
    const loadLibrary = async (): Promise<void> => {
      try {
        await initialiseAppStorage()
        setBooks(await loadBooks())
      } catch (error) {
        console.error('Failed to load books:', error)
        setBooksError('Your books could not be loaded.')
        setBooks([])
      }
    }

    void loadLibrary()
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
            <Header bookCount={books?.length ?? 0} />

            <List
              books={books}
              error={booksError}
              filePath={filePath}
              openFile={handleOpenFile}
              onSelectBook={(book) => setFileBuffer(book.buffer)}
            />

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
