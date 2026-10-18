import React from 'react'

interface HeaderProps {
  bookCount: number
}

export default function Header({ bookCount }: HeaderProps): React.JSX.Element {
  return (
    <>
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
            {bookCount} {bookCount === 1 ? 'book' : 'books'}
          </span>
        </div>
      </header>
    </>
  )
}
