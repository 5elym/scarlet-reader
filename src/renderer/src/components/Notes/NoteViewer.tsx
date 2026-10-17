import React from 'react'
import { motion } from 'framer-motion'

interface NoteViewerProps {
  onClose: () => void
  note: Record<string, string>
}

export default function NoteViewer({ onClose, note }: NoteViewerProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 z-75 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '-100vh' }}
        animate={{ y: 0 }}
        exit={{ y: '-100vh' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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
      </motion.div>
    </motion.div>
  )
}
