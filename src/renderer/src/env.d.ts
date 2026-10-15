/// <reference types="vite/client" />

interface Window {
  api: {
    openFileDialog: () => Promise<string | null>
    readBinaryFile: (filePath: string) => Promise<ArrayBuffer>
  }
}
