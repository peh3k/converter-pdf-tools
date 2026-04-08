'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileText, Image, Table } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  accept: string
  multiple: boolean
  onFilesChange: (files: File[]) => void
  maxSizeMB?: number
}

export default function FileUpload({ accept, multiple, onFilesChange, maxSizeMB = 50 }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxSize = maxSizeMB * 1024 * 1024

  const validateFiles = (newFiles: File[]): File[] => {
    const valid: File[] = []
    for (const file of newFiles) {
      if (file.size > maxSize) {
        setError(`${file.name} excede o tamanho máximo de ${maxSizeMB}MB`)
        continue
      }
      valid.push(file)
    }
    return valid
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(newFiles)
    const validated = validateFiles(fileArray)

    if (validated.length === 0) return

    const updated = multiple ? [...files, ...validated] : validated
    setFiles(updated)
    onFilesChange(updated)
  }, [files, multiple, onFilesChange, maxSize])

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange(updated)
    setError(null)
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />
    return <Table className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700">
          Arraste e solte seus arquivos aqui
        </p>
        <p className="text-sm text-gray-500 mt-1">
          ou clique para selecionar • Máx. {maxSizeMB}MB por arquivo
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Formatos aceitos: {accept}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
          </h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[400px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
