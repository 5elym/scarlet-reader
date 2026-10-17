import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

const APP_DIR = 'ScarletReader'
const BOOKS_DIR = `${APP_DIR}/Books`
const NOTES_FILE = `${APP_DIR}/notes.json`

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

export const loadGlobalNotes = async (): Promise<Record<string, Record<string, string>>> => {
  if (!Capacitor.isNativePlatform()) {
    // @ts-ignore: Electron API is provided by preload.
    return await window.api.loadNotes()
  }

  try {
    const result = await Filesystem.readFile({
      path: NOTES_FILE,
      directory: Directory.Documents,
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
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })
    return true
  } catch (error) {
    console.error('Failed to save notes:', error)
    return false
  }
}
