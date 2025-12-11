import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [targetFormat, setTargetFormat] = useState('jpeg')
  const [quality, setQuality] = useState(0.9)
  const [isConverting, setIsConverting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const fileInputRef = useRef(null)

  const formats = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WEBP' },
    { value: 'gif', label: 'GIF' },
    { value: 'bmp', label: 'BMP' },
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setDownloadUrl(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please select a valid image file')
    }
  }

  const convertImage = async () => {
    if (!selectedFile) return

    setIsConverting(true)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        let mimeType = `image/${targetFormat}`
        let qualityOption = null

        // Set quality for formats that support it
        if (targetFormat === 'jpeg' || targetFormat === 'webp') {
          qualityOption = quality
        }

        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob)
            setDownloadUrl(url)
            setIsConverting(false)
          },
          mimeType,
          qualityOption
        )
      }

      img.onerror = () => {
        alert('Error loading image')
        setIsConverting(false)
      }

      img.src = preview
    } catch (error) {
      console.error('Conversion error:', error)
      alert('Error converting image')
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `converted-image.${targetFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setDownloadUrl(null)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const resetConverter = () => {
    setSelectedFile(null)
    setPreview(null)
    setDownloadUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Image Converter</h1>
          <p className="subtitle">Transform your images with style</p>
        </header>

        <div className="converter-card">
          {!preview ? (
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="drop-zone-content">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="drop-zone-text">Drag & drop your image here</p>
                <p className="drop-zone-subtext">or</p>
                <button
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            <div className="preview-section">
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                {downloadUrl && (
                  <div className="success-overlay">
                    <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p>Conversion Complete!</p>
                  </div>
                )}
              </div>

              <div className="controls">
                <div className="control-group">
                  <label className="control-label">Output Format</label>
                  <select
                    className="select-input"
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                  >
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
                  <div className="control-group">
                    <label className="control-label">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="slider"
                    />
                  </div>
                )}

                <div className="button-group">
                  <button
                    className="btn-secondary"
                    onClick={resetConverter}
                    disabled={isConverting}
                  >
                    Reset
                  </button>
                  <button
                    className="btn-primary"
                    onClick={convertImage}
                    disabled={isConverting}
                  >
                    {isConverting ? 'Converting...' : 'Convert Image'}
                  </button>
                </div>

                {downloadUrl && (
                  <button
                    className="btn-download"
                    onClick={handleDownload}
                  >
                    <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Converted Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Convert images to JPEG, PNG, WEBP, GIF, and more</p>
        </footer>
      </div>
    </div>
  )
}

export default App



