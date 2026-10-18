import React, { useState } from 'react'
import { useHardwareBack } from '../../utils/returnBack'

interface NoteEditorProps {
  onSave: (note: string) => void
  onCancel: () => void
  isOpen: boolean
}

export default function NoteEditor({
  onSave,
  onCancel,
  isOpen
}: NoteEditorProps): React.JSX.Element {
  const [text, setText] = useState('')

  useHardwareBack(isOpen, onCancel)

  return (
    <div className="absolute inset-0 z-70 flex flex-col bg-black/90 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col mx-auto mt-24 gap-4">
        <div className="flex justify-between items-end">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Global Note
          </label>
          <span className="text-xs text-zinc-600">{text.length}/200</span>
        </div>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your definition here. It will appear everywhere this word is mentioned..."
          className="h-40 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-zinc-200 focus:border-red-500 focus:outline-none"
        />

        <div className="flex justify-end gap-6 pt-2">
          <button
            onClick={onCancel}
            className="text-xs font-semibold tracking-widest text-zinc-400 transition-colors active:text-zinc-200"
          >
            CANCEL
          </button>
          <button
            onClick={() => onSave(text)}
            disabled={!text.trim()}
            className="text-xs font-semibold tracking-widest text-red-500 transition-colors disabled:opacity-50 active:text-red-400"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}
