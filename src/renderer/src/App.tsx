import { useEffect, useState } from 'react'
import EPUBViewer from './components/EPUBViewer'
import { deleteBook, importBook, initialiseAppStorage } from './utils/storage'
import { App as CapacitorApp } from '@capacitor/app'
import { pageStack } from './utils/returnBack'
import Header from './components/Library/Header'
import List from './components/Library/BookList/List'
import SettingsButton from './components/Library/SettingsButton'
import { loadBooks, StoredBook } from './utils/storage'
import Settings from './components/Settings'

export default function App(): React.JSX.Element {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer>()
  const [books, setBooks] = useState<StoredBook[] | null>(null)
  const [booksError, setBooksError] = useState<string | null>(null)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false)

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

  const handleImportBook = async (): Promise<void> => {
    try {
      const imported = await importBook()
      if (!imported) return

      setBooks(await loadBooks())
      setBooksError(null)
    } catch (error) {
      console.error('Failed to import book:', error)
      setBooksError('The selected EPUB could not be imported.')
    }
  }

  const handleDeleteBook = async (name: string): Promise<void> => {
    try {
      await deleteBook(name)

      setBooks(await loadBooks())
      setBooksError(null)
    } catch (error) {
      console.error(`Failed to delete "${name}":`, error)
      setBooksError('The selected book could not be deleted.')
    }
  }

  const handleCloseSettings = (): void => {
    setSettingsMenuOpen(false)
  }

  return (
    <>
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-black text-zinc-200">
        {fileBuffer ? (
          <div className="h-full w-full bg-black">
            <EPUBViewer
              buffer={fileBuffer}
              onExit={() => {
                setFileBuffer(undefined)
              }}
              onOpenSettings={() => setSettingsMenuOpen(true)}
            />
          </div>
        ) : (
          <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-6 pb-28 pt-10 sm:px-10">
            <Header bookCount={books?.length ?? 0} />

            <List
              books={books}
              error={booksError}
              onImportBook={handleImportBook}
              onDeleteBook={handleDeleteBook}
              onSelectBook={(book) => setFileBuffer(book.buffer)}
            />

            <SettingsButton open={() => setSettingsMenuOpen(true)} />
          </div>
        )}
        {settingsMenuOpen && (
          <div className="absolute inset-0 z-100">
            <Settings isOpen={settingsMenuOpen} onClose={handleCloseSettings} />
          </div>
        )}
      </div>
    </>
  )
}
