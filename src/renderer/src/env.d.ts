/// <reference types="vite/client" />

interface Window {
  api: {
    openFileDialog: () => Promise<string | null>
    readBinaryFile: (filePath: string) => Promise<ArrayBuffer>
    loadBooks: () => Promise<Array<{ name: string; buffer: ArrayBuffer }>>
    importBook: () => Promise<boolean>
    deleteBook: (name: string) => Promise<void>
    loadNotes: () => Promise<Record<string, Record<string, string>>>
    saveNotes: (notesData: Record<string, Record<string, string>>) => Promise<boolean>
    loadSettings: () => Promise<Record<string, { fontSize: number; isPaginated: boolean }>>
    saveSettings: (
      settingsData: Record<string, { fontSize: number; isPaginated: boolean }>
    ) => Promise<boolean>
  }
}
