import React, { useState } from 'react'
import { Chapter } from '../../utils/chapter'
import SubChapterItem from './SubChapterItem'

interface ChapterGroupProps {
  chapter: Chapter
  currentHref: string | null
  onSelect: (href: string) => void
}

export default function ChapterItem({
  chapter,
  currentHref,
  onSelect
}: ChapterGroupProps): React.JSX.Element {
  const hasSubitems = chapter.subitems && chapter.subitems.length > 0
  const isExactlyCurrent = currentHref === chapter.href

  // Check if any of this group's children are the current chapter
  const isParentOfCurrent = hasSubitems
    ? chapter.subitems!.some((sub) => sub.href === currentHref)
    : false

  const [isExpanded, setIsExpanded] = useState(isParentOfCurrent)
  const [prevHref, setPrevHref] = useState(currentHref)

  // Auto-expand if the new page is inside this part
  if (currentHref !== prevHref) {
    setPrevHref(currentHref)
    if (isParentOfCurrent) {
      setIsExpanded(true)
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      <button
        onClick={() => (hasSubitems ? setIsExpanded(!isExpanded) : onSelect(chapter.href))}
        className={`flex flex-col items-center gap-1 text-center transition-all active:scale-95 ${
          isExactlyCurrent || isParentOfCurrent ? 'text-red-500' : 'text-zinc-300'
        }`}
      >
        {isExactlyCurrent && !hasSubitems && (
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Current</span>
        )}
        <span
          className={`text-lg tracking-wide ${isExactlyCurrent || isParentOfCurrent ? 'font-medium' : 'font-light'}`}
        >
          {chapter.label}
        </span>
        {hasSubitems && (
          <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">
            {isExpanded ? 'Hide Chapters' : 'View Chapters'}
          </span>
        )}
      </button>

      {hasSubitems && isExpanded && (
        <div className="mt-6 flex w-full flex-col items-center gap-5 border-l border-zinc-800 pl-4">
          {chapter.subitems!.map((sub, index) => (
            <SubChapterItem
              key={index}
              chapter={sub}
              currentHref={currentHref}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
