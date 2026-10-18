import { BookOpen } from 'lucide-react'
import ePub from 'epubjs'
import React, { useEffect, useState } from 'react'
import { StoredBook } from '../../utils/storage'

interface BookDetails {
  book: StoredBook
  title: string
  author: string
  coverUrl: string | null
}

interface BookListProps {
  books: StoredBook[] | null
  error: string | null
  filePath: string | null
  openFile: () => void
  onSelectBook: (book: StoredBook) => void
}

export default function BookList({
  books,
  error,
  filePath,
  openFile,
  onSelectBook
}: BookListProps): React.JSX.Element {
  const [bookDetails, setBookDetails] = useState<BookDetails[]>([])

  useEffect(() => {
    if (!books) {
      setBookDetails([])
      return
    }

    let cancelled = false
    const epubBooks: ReturnType<typeof ePub>[] = []

    const loadBookDetails = async (): Promise<void> => {
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
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Recently added
        </h2>

        {books === null ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading your library…</p>
        ) : books.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {books.map((book) => {
              const details = bookDetails.find((item) => item.book === book)

              return (
                <li key={book.name}>
                  <button
                    onClick={() => onSelectBook(book)}
                    className="flex w-full items-center gap-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 text-left transition-colors hover:border-red-600/70"
                  >
                    <span className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-black text-zinc-500">
                      {details?.coverUrl ? (
                        <img
                          src={details.coverUrl}
                          alt={`${details.title} cover`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen size={24} strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-lg font-medium text-zinc-200">
                        {details?.title || book.name.replace(/\.epub$/i, '')}
                      </span>
                      <span className="truncate text-sm text-zinc-500">
                        {details?.author || 'Loading author…'}
                      </span>
                      <span className="text-sm text-zinc-500">0% complete</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-500">
              <BookOpen size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium text-zinc-200">
              {error ? 'Library unavailable' : 'Your library is empty'}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
              {error || 'Choose an EPUB to start building your reading collection.'}
            </p>
            <button
              onClick={openFile}
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
        )}
      </main>
    </>
  )
}
