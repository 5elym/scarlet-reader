import React from 'react'

import { BookText, House, List, Settings } from 'lucide-react'

interface BubbleMenuProps {
  isOpen: boolean
  side?: 'left' | 'right'
  onClose: () => void
  onHomeClick: () => void
}

export default function BubbleMenu({
  isOpen,
  side = 'right',
  onClose,
  onHomeClick
}: BubbleMenuProps): React.JSX.Element {
  // Placeholder menu items - wire these up to your actual logic later
  const menuItems = [
    { label: 'Library', icon: <House />, action: onHomeClick },
    { label: 'Book Information', icon: <BookText /> },
    { label: 'Contents', icon: <List /> },
    { label: 'Settings', icon: <Settings /> }
  ]
  return (
    <>
      {/* Blur EPUB */}
      <div
        onClick={onClose}
        className={`absolute inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Menu container */}
      <div
        className={`absolute top-1/2 z-50 flex -translate-y-1/2 flex-col gap-6 transition-all duration-300 ease-out ${
          side === 'right' ? 'right-6' : 'left-6'
        } ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : side === 'right'
              ? 'translate-x-12 opacity-0 pointer-events-none'
              : '-translate-x-12 opacity-0 pointer-events-none'
        }`}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 ${
              side === 'right' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <button
              onClick={item.action}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-black text-white shadow-2xl transition-all active:scale-90 active:border-red-600 active:text-red-500"
            >
              {item.icon}
            </button>

            <span className="text-sm font-medium tracking-widest text-zinc-200 drop-shadow-md">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
