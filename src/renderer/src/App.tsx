import { useState } from 'react'
import EPUBViewer from './components/EPUBViewer'

export default function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer>()

  const handleOpenFile = async (): Promise<void> => {
    const selectedPath = await window.api.openFileDialog()

    if (selectedPath) {
      const buffer = await window.api.readBinaryFile(selectedPath)
      setFilePath(selectedPath)
      setFileBuffer(buffer)
      console.log('User picked file:', selectedPath)
    }
  }

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <h1>Modern Reader</h1>
        <div className="w-screen h-screen">
          {!fileBuffer && (
            <button
              onClick={handleOpenFile}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-500"
            >
              Choose EPUB
            </button>
          )}

          {fileBuffer && <EPUBViewer buffer={fileBuffer} />}
        </div>

        {filePath && (
          <p style={{ marginTop: 20 }}>
            Selected: <code>{filePath}</code>
          </p>
        )}
      </div>
    </>
  )
}
