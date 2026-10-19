import React from 'react'

import { StoredBook } from '../../../utils/storage'
import { BookDetails } from './List'
import { BookOpen, X } from 'lucide-react'

interface BookProps {
  book: StoredBook
  details: BookDetails
  onSelect: (book: StoredBook) => void
  onDelete: (name: string) => void
}

export default function BookItem({
  book,
  details,
  onSelect,
  onDelete
}: BookProps): React.JSX.Element {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => onSelect(book)}
        className="flex w-full items-center gap-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 pr-14 text-left transition-colors hover:border-red-600/70"
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
      <button
        type="button"
        aria-label={`Delete ${details.title || book.name}`}
        title="Delete book"
        onClick={() => onDelete(book.name)}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-950/50 hover:text-red-400 active:scale-95"
      >
        <X size={18} strokeWidth={2} />
      </button>
    </li>
  )
}
