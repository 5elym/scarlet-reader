import React from 'react'
import { Chapter } from '../../utils/chapter'

export default function SubChapterItem({
  chapter,
  currentHref,
  onSelect
}: {
  chapter: Chapter
  currentHref: string | null
  onSelect: (href: string) => void
}): React.JSX.Element {
  const isCurrent = currentHref === chapter.href

  return (
    <button
      onClick={() => onSelect(chapter.href)}
      className={`flex flex-col items-center text-center transition-all active:scale-95 ${
        isCurrent ? 'text-red-500' : 'text-zinc-400'
      }`}
    >
      {isCurrent && (
        <span className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em]">Current</span>
      )}
      <span className={`text-base tracking-wide ${isCurrent ? 'font-medium' : 'font-light'}`}>
        {chapter.label}
      </span>
    </button>
  )
}
