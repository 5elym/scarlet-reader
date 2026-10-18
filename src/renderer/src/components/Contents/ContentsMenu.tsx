import React from 'react'
import ChapterItem from './ChapterItem'
import { Chapter } from '../../utils/chapter'
import { useHardwareBack } from '../../utils/returnBack'

interface ContentsPageProps {
  isOpen: boolean
  onClose: () => void
  chapters: Chapter[]
  currentHref: string | null
  onSelectChapter: (href: string) => void
}

export default function ContentsPage({
  isOpen,
  onClose,
  chapters,
  currentHref,
  onSelectChapter
}: ContentsPageProps): React.JSX.Element {
  useHardwareBack(isOpen, onClose)

  return (
    <div
      className={`absolute inset-0 z-60 flex flex-col bg-black text-white transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between p-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Contents</h2>
        <button
          onClick={onClose}
          className="text-xs font-semibold tracking-widest text-zinc-300 transition-colors active:text-red-500"
        >
          CLOSE
        </button>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <div className="flex flex-col items-stretch gap-6 py-8">
          {chapters.length === 0 ? (
            <span className="text-center text-sm tracking-widest text-zinc-600">LOADING...</span>
          ) : (
            chapters.map((chapter, i) => (
              <ChapterItem
                key={i}
                chapter={chapter}
                currentHref={currentHref}
                onSelect={onSelectChapter}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
