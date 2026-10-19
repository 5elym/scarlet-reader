import React from 'react'
import { useHardwareBack } from '../utils/returnBack'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function Settings({ onClose, isOpen }: SettingsProps): React.JSX.Element {
  useHardwareBack(isOpen, onClose)

  return (
    <div className="flex h-full flex-col bg-black p-6 text-zinc-200">
      <header className="flex items-start justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <p className="text-[10px] text-center font-semibold uppercase tracking-[0.3em] text-red-500">
            Scarlet Reader
          </p>
          <h1 className="mt-3 text-2xl font-light tracking-wide text-white">Settings</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold tracking-widest text-zinc-300 transition-colors active:text-red-500"
        >
          CLOSE
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto py-6">
        <section className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Font Size</h2>
            <p className="mt-1 text-xs text-zinc-500">Adjust the reading text size</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Decrease font size"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg text-zinc-300 transition-colors active:border-red-600/70 active:text-red-400"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm text-zinc-400">A</span>
            <button
              type="button"
              aria-label="Increase font size"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg text-zinc-300 transition-colors active:border-red-600/70 active:text-red-400"
            >
              +
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-200">Pagination</h2>
          <p className="mt-1 text-xs text-zinc-500">Choose how to move through the book</p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center justify-between rounded-lg border border-red-600/60 bg-red-950/20 px-4 py-3 text-left text-sm text-zinc-200"
            >
              <span>Scroll with tap</span>
              <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left text-sm text-zinc-400 transition-colors active:border-zinc-700 active:text-zinc-200"
            >
              <span>Tap only</span>
              <span className="h-2 w-2 rounded-full border border-zinc-600" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
