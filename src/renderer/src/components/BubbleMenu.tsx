import React from 'react'

interface BubbleMenuProps {
  isOpen: boolean
  side?: 'left' | 'right'
  onClose: () => void
}

export default function BubbleMenu({
  isOpen,
  side = 'right',
  onClose
}: BubbleMenuProps): React.JSX.Element {
  // Placeholder menu items - wire these up to your actual logic later
  const menuItems = [
    { label: 'Library', icon: <LibraryIcon /> },
    { label: 'Appearance', icon: <FontIcon /> },
    { label: 'Table of Contents', icon: <ListIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> }
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
            <button className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-black text-white shadow-2xl transition-all active:scale-90 active:border-red-600 active:text-red-500">
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

// Placeholders
const LibraryIcon = (): React.JSX.Element => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)
const FontIcon = (): React.JSX.Element => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19V5m0 14l8-14 8 14M12 14h-8" />
  </svg>
)
const ListIcon = (): React.JSX.Element => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const SettingsIcon = (): React.JSX.Element => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
