import { Settings } from 'lucide-react'
import React from 'react'

export default function SettingsButton(): React.JSX.Element {
  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-200 shadow-xl transition-colors hover:border-red-500 hover:text-red-400 active:scale-95"
      >
        <Settings size={20} strokeWidth={1.75} />
      </button>
    </>
  )
}
