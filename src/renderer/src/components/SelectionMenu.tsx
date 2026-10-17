interface SelectionMenuProps {
  onHighlight: () => void
  onAddNote: () => void
  onCancel: () => void
  onCopy?: () => void
}

export default function SelectionMenu({
  onHighlight,
  onCancel,
  onCopy,
  onAddNote
}: SelectionMenuProps): React.JSX.Element {
  return (
    <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 transform items-center gap-1 rounded-full border border-zinc-800 bg-black/80 p-1.5 shadow-2xl backdrop-blur-md">
      <button
        onClick={onHighlight}
        className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-zinc-900 hover:text-red-400"
      >
        Highlight
      </button>

      {onCopy && (
        <button
          onClick={onCopy}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          Copy
        </button>
      )}

      {onAddNote && (
        <button
          onClick={onAddNote}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        >
          Note
        </button>
      )}

      <button
        onClick={onCancel}
        className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
      >
        Dismiss
      </button>
    </div>
  )
}
