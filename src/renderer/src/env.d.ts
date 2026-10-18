/// <reference types="vite/client" />

interface Window {
  api: {
    openFileDialog: () => Promise<string | null>
    readBinaryFile: (filePath: string) => Promise<ArrayBuffer>
    loadBooks: () => Promise<Array<{ name: string; buffer: ArrayBuffer }>>
    loadNotes: () => Promise<Record<string, Record<string, string>>>
    saveNotes: (notesData: Record<string, Record<string, string>>) => Promise<boolean>
  }
}
