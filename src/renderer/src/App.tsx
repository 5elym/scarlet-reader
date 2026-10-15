import { useState } from 'react'

export default function App(): React.JSX.Element {
  const [filePath, setFilePath] = useState<string | null>(null)

  const handleOpenFile = async (): Promise<void> => {
    const selectedPath = await window.api.openFileDialog()

    if (selectedPath) {
      setFilePath(selectedPath)
      console.log('User picked file:', selectedPath)
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#fff' }}>
      <h1>Modern Reader</h1>
      <button
        onClick={handleOpenFile}
        style={{ padding: '10px 18px', cursor: 'pointer', borderRadius: 6 }}
      >
        Choose Book (EPUB / PDF)
      </button>

      {filePath && (
        <p style={{ marginTop: 20 }}>
          Selected: <code>{filePath}</code>
        </p>
      )}
    </div>
  )
}
