import ePub, { Book } from 'epubjs'
import React, { useEffect, useState } from 'react'
import { StoredBook } from '../../../utils/storage'
import NoBooksView from './NoBooksView'
import BookItem from './BookItem'

export interface BookDetails {
  book: StoredBook
  title: string
  author: string
  coverUrl: string | null
}

interface ListProps {
  books: StoredBook[] | null
  error: string | null
  onImportBook: () => void
  onDeleteBook: (name: string) => void
  onSelectBook: (book: StoredBook) => void
}

export default function List({
  books,
  error,
  onImportBook,
  onDeleteBook,
  onSelectBook
}: ListProps): React.JSX.Element {
  const [bookDetails, setBookDetails] = useState<BookDetails[]>([])

  useEffect(() => {
    if (!books) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBookDetails([]) // TODO: Probably change
      return
    }

    let cancelled = false
    const epubBooks: Book[] = []

    const loadBookDetails = async (): Promise<void> => {
      // Get details for all books at the same time
      const details = await Promise.all(
        books.map(async (book): Promise<BookDetails> => {
          const epubBook = ePub(book.buffer)
          epubBooks.push(epubBook)

          try {
            const [metadata, coverUrl] = await Promise.all([
              epubBook.loaded.metadata,
              epubBook.coverUrl()
            ])

            return {
              book,
              title: metadata.title || book.name.replace(/\.epub$/i, ''),
              author: metadata.creator || 'Unknown author',
              coverUrl
            }
          } catch (error) {
            console.error(`Failed to read metadata for "${book.name}":`, error)
            epubBook.destroy()
            return {
              book,
              title: book.name.replace(/\.epub$/i, ''),
              author: 'Unknown author',
              coverUrl: null
            }
          }
        })
      )

      if (!cancelled) setBookDetails(details)
    }

    void loadBookDetails()

    return () => {
      cancelled = true
      epubBooks.forEach((book) => book.destroy())
    }
  }, [books])

  return (
    <>
      <main className="flex flex-1 flex-col pt-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Recently added
          </h2>
          {books && books.length > 0 && (
            <button
              type="button"
              onClick={onImportBook}
              className="text-xs font-semibold uppercase tracking-widest text-red-500 transition-colors active:text-red-400"
            >
              Import EPUB
            </button>
          )}
        </div>

        {books === null ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading your library…</p>
        ) : books.length > 0 ? (
          <>
            {error && (
              <p role="alert" className="mb-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {bookDetails.map((details) => (
                <BookItem
                  key={details.book.name}
                  book={details.book}
                  details={details}
                  onSelect={onSelectBook}
                  onDelete={onDeleteBook}
                />
              ))}
            </ul>
          </>
        ) : (
          <NoBooksView error={error} onImportBook={onImportBook} />
        )}
      </main>
    </>
  )
}
