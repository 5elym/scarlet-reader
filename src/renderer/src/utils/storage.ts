import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { FilePicker } from '@capawesome/capacitor-file-picker'

const APP_DIR = 'ScarletReader'
const BOOKS_DIR = `${APP_DIR}/Books`
const NOTES_FILE = `notes.json`

export interface StoredBook {
  name: string
  buffer: ArrayBuffer
}

export const initialiseAppStorage = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return

  try {
    await Filesystem.readdir({
      path: BOOKS_DIR,
      directory: Directory.Data
    })
  } catch {
    await Filesystem.mkdir({
      path: BOOKS_DIR,
      directory: Directory.Data,
      recursive: true
    })
  }
}

export const loadBooks = async (): Promise<StoredBook[]> => {
  if (!Capacitor.isNativePlatform()) {
    return await window.api.loadBooks()
  }

  // Get files in Books dir
  const result = await Filesystem.readdir({
    path: BOOKS_DIR,
    directory: Directory.Data
  })

  // Get data from each epub file in Books dir
  const books: StoredBook[] = []
  for (const file of result.files) {
    if (!file.name.toLowerCase().endsWith('.epub')) continue

    const content = await Filesystem.readFile({
      path: `${BOOKS_DIR}/${file.name}`,
      directory: Directory.Data
    })

    const binaryString = window.atob(content.data.toString())
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    books.push({ name: file.name, buffer: bytes.buffer })
  }

  return books
}

const getAvailableBookName = (fileName: string, existingNames: string[]): string => {
  const normalizedNames = new Set(existingNames.map((name) => name.toLowerCase()))
  const extension = fileName.slice(fileName.lastIndexOf('.'))
  const baseName = fileName.slice(0, -extension.length)
  let candidate = fileName
  let suffix = 1

  while (normalizedNames.has(candidate.toLowerCase())) {
    candidate = `${baseName} (${suffix})${extension}`
    suffix++
  }

  return candidate
}

export const importBook = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return await window.api.importBook()
  }

  const result = await FilePicker.pickFiles({ limit: 1 })
  const file = result.files[0]

  if (!file) return false
  if (!file.name.toLowerCase().endsWith('.epub')) {
    throw new Error('The selected file is not an EPUB.')
  }
  if (!file.path) {
    throw new Error('The selected EPUB does not have an accessible file path.')
  }

  const safeName = file.name.replace(/[\\/]/g, '_')
  const existingFiles = await Filesystem.readdir({
    path: BOOKS_DIR,
    directory: Directory.Data
  })
  const name = getAvailableBookName(
    safeName,
    existingFiles.files.map((existingFile) => existingFile.name)
  )
  const destination = await Filesystem.getUri({
    path: `${BOOKS_DIR}/${name}`,
    directory: Directory.Data
  })

  await FilePicker.copyFile({
    from: file.path,
    to: destination.uri
  })

  return true
}

export const deleteBook = async (name: string): Promise<void> => {
  if (name !== name.replace(/[\\/]/g, '') || !name.toLowerCase().endsWith('.epub')) {
    throw new Error('Invalid book name.')
  }

  if (!Capacitor.isNativePlatform()) {
    await window.api.deleteBook(name)
    return
  }

  await Filesystem.deleteFile({
    path: `${BOOKS_DIR}/${name}`,
    directory: Directory.Data
  })
}

export const loadGlobalNotes = async (): Promise<Record<string, Record<string, string>>> => {
  if (!Capacitor.isNativePlatform()) {
    // @ts-ignore: Electron API is provided by preload.
    return await window.api.loadNotes()
  }

  try {
    const result = await Filesystem.readFile({
      path: NOTES_FILE,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    })
    return JSON.parse(result.data as string)
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const saveGlobalNotes = async (
  notesData: Record<string, Record<string, string>>
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // @ts-ignore: Electron API is provided by preload.
    return await window.api.saveNotes(notesData)
  }

  try {
    await Filesystem.writeFile({
      path: NOTES_FILE,
      data: JSON.stringify(notesData, null, 2),
      directory: Directory.Data,
      encoding: Encoding.UTF8
    })
    return true
  } catch (error) {
    console.error('Failed to save notes:', error)
    return false
  }
}
