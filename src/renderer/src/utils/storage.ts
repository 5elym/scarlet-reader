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
  try {
    await Filesystem.requestPermissions()

    // Create the main app folder and the Books subfolder.
    await Filesystem.mkdir({
      path: BOOKS_DIR,
      directory: Directory.Documents,
      recursive: true
    })

    console.log('Main folders created!.')
  } catch (error) {
    console.log('Storage already exists or permission denied.', error)
  }
}

export const loadBooks = async (): Promise<StoredBook[]> => {
  if (!Capacitor.isNativePlatform()) {
    return await window.api.loadBooks()
  }

  // Get files in Books dir
  const result = await Filesystem.readdir({
    path: BOOKS_DIR,
    directory: Directory.Documents
  })

  // Get data from each epub file in Books dir
  const books: StoredBook[] = []
  for (const file of result.files) {
    if (!file.name.toLowerCase().endsWith('.epub')) continue

    const content = await Filesystem.readFile({
      path: `${BOOKS_DIR}/${file.name}`,
      directory: Directory.Documents
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

export const openFilePicker = async (): Promise<ArrayBuffer | null> => {
  try {
    const result = await FilePicker.pickFiles({
      limit: 1,
      readData: true // TODO: not recommended
    })

    const file = result.files[0]

    if (file && file.name.endsWith('.epub') && file.data) {
      // The native picker gives us Base64 data, convert to ArrayBuffer for epub.js
      const binaryString = window.atob(file.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      return bytes.buffer
    } else {
      alert('Please select a valid .epub file')
    }
  } catch (error) {
    console.log('User canceled file picking or it failed:', error)
  }

  return null
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
