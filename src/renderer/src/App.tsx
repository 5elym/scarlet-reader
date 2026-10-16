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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-200">
        {!fileBuffer ? (
          // Empty State: A clean card in the center of the screen
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-700 bg-slate-800 p-12 shadow-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white">Modern Reader</h1>

            <button
              onClick={handleOpenFile}
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
            >
              Choose EPUB
            </button>

            {filePath && (
              <p className="mt-4 max-w-sm truncate text-sm text-slate-400">
                Selected:{' '}
                <code className="rounded bg-slate-900 px-2 py-1 text-slate-300">{filePath}</code>
              </p>
            )}
          </div>
        ) : (
          // Reading State: Viewer takes up the entire window
          <div className="h-full w-full bg-white">
            <EPUBViewer buffer={fileBuffer} />
          </div>
        )}
      </div>
    </>
  )
}
