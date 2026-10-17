import React from 'react'

interface NoteViewerProps {
  onClose: () => void
  note: Record<string, string>
}

export default function NoteViewer({ onClose, note }: NoteViewerProps): React.JSX.Element {
  return (
    <>
      <div
        className="absolute inset-0 z-[75] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm transition-opacity"
        onClick={onClose} // Close if they tap the background
      >
        {/* The Card */}
        <div
          className="flex w-full max-w-sm flex-col gap-3 border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Prevent background tap from closing when tapping inside the card
        >
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">{note.term}</h3>
          <p className="text-base leading-relaxed text-zinc-200">{note.note}</p>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="text-[10px] font-semibold tracking-widest text-zinc-500 transition-colors active:text-zinc-300"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
