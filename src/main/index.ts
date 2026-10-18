import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import fs from 'fs'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500, //900,
    height: 844, //670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function IPCEvents(): void {
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Books & Documents', extensions: ['epub', 'pdf'] },
        { name: 'EPUB Books', extensions: ['epub'] },
        { name: 'PDF Documents', extensions: ['pdf'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Read binary file data into an ArrayBuffer
  ipcMain.handle('file:readBinary', async (_, filePath: string) => {
    const buffer = await fs.promises.readFile(filePath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  })

  // Creating directory and saving/loading notes
  const documentsPath = app.getPath('documents')
  const appFolder = path.join(documentsPath, 'ScarletReader')
  const booksFolder = path.join(appFolder, 'Books')
  const notesFilePath = path.join(appFolder, 'notes.json')

  // Create the folders when Electron boots
  if (!fs.existsSync(booksFolder)) {
    fs.mkdirSync(booksFolder, { recursive: true })
  }

  ipcMain.handle('load-books', async () => {
    const files = await fs.promises.readdir(booksFolder, { withFileTypes: true })
    const books: Array<{ name: string; buffer: ArrayBuffer }> = []

    for (const file of files) {
      if (!file.isFile() || !file.name.toLowerCase().endsWith('.epub')) continue

      const contents = await fs.promises.readFile(path.join(booksFolder, file.name))
      books.push({
        name: file.name,
        buffer: contents.buffer.slice(
          contents.byteOffset,
          contents.byteOffset + contents.byteLength
        )
      })
    }

    return books
  })

  ipcMain.handle('load-notes', async () => {
    try {
      if (fs.existsSync(notesFilePath)) {
        const data = fs.readFileSync(notesFilePath, 'utf-8')
        return JSON.parse(data)
      }
      return {}
    } catch (error) {
      console.log(error)
      return {}
    }
  })

  ipcMain.handle('save-notes', async (_, notesData) => {
    try {
      fs.writeFileSync(notesFilePath, JSON.stringify(notesData, null, 2))
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  IPCEvents()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
