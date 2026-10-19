import { ElectronAPI } from '@electron-toolkit/preload'

export interface ReaderAPI {
  openFileDialog: () => Promise<string | null>
  readBinaryFile: (filePath: string) => Promise<ArrayBuffer>
  importBook: () => Promise<boolean>
  deleteBook: (name: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
