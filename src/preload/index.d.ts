import { ElectronAPI } from '@electron-toolkit/preload'

export interface ReaderAPI {
  openFileDialog: () => Promise<string | null>
  readBinaryFile: (filePath: string) => Promise<ArrayBuffer>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
