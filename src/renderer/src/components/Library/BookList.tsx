import { BookOpen } from 'lucide-react'
import React from 'react'

interface BookListProps {
  filePath: string | null
  openFile: () => void
}

export default function BookList({ filePath, openFile }: BookListProps): React.JSX.Element {
  return (
    <>
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
      </main>
    </>
  )
}
