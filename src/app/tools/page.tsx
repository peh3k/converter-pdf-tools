'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import ProcessingButton from '@/components/ProcessingButton'
import ToolCard from '@/components/ToolCard'
import { toolsList } from '@/lib/utils'
import { Download, CheckCircle, ArrowLeft } from 'lucide-react'

function ToolsContent() {
  const searchParams = useSearchParams()
  const toolParam = searchParams.get('tool')
  const [selectedTool, setSelectedTool] = useState<string | null>(toolParam)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'download' | 'multi'; url?: string; files?: { name: string; data: string }[]; originalSize?: number; compressedSize?: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ranges, setRanges] = useState('1-3')

  const tool = toolsList.find(t => t.id === selectedTool)

  const handleProcess = async () => {
    if (!tool || files.length === 0) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()

      if (['combine'].includes(tool.id)) {
        files.forEach(f => formData.append('files', f))
      } else if (['jpg-to-pdf', 'png-to-pdf', 'webp-to-pdf', 'pdf-to-jpg', 'excel-to-pdf'].includes(tool.id)) {
        files.forEach(f => formData.append('files', f))
        formData.append('type', tool.id)
      } else {
        formData.append('file', files[0])
      }

      if (tool.id === 'split') {
        const rangesParsed = ranges.split(',').map(r => {
          const [start, end] = r.trim().split('-').map(Number)
          return { start, end: end || start }
        })
        formData.append('ranges', JSON.stringify(rangesParsed))
      }

      let endpoint = ''
      switch (tool.id) {
        case 'combine': endpoint = '/api/pdf/combine'; break
        case 'split': endpoint = '/api/pdf/split'; break
        case 'compress': endpoint = '/api/pdf/compress'; break
        case 'pages': endpoint = '/api/pdf/pages'; break
        default: endpoint = '/api/pdf/convert'; break
      }

      const res = await fetch(endpoint, { method: 'POST', body: formData })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro no processamento')
      }

      const contentType = res.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const data = await res.json()
        setResult({ type: 'multi', files: data.files })
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const originalSize = parseInt(res.headers.get('x-original-size') || '0')
        const compressedSize = parseInt(res.headers.get('x-compressed-size') || '0')
        setResult({ type: 'download', url, originalSize, compressedSize })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const downloadBase64 = (name: string, data: string) => {
    const isPdf = name.endsWith('.pdf')
    const byteCharacters = atob(data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: isPdf ? 'application/pdf' : 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    if (result?.files) {
      result.files.forEach(f => downloadBase64(f.name, f.data))
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (!selectedTool || !tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Ferramentas de PDF</h1>
        <p className="text-gray-600 text-center mb-12">Selecione a ferramenta que deseja usar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsList.map((t) => (
            <div key={t.id} onClick={() => setSelectedTool(t.id)} className="cursor-pointer">
              <ToolCard {...t} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => { setSelectedTool(null); setFiles([]); setResult(null); setError(null) }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às ferramentas
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.title}</h1>
        <p className="text-gray-600 mb-8">{tool.description}</p>

        <FileUpload
          accept={tool.accept}
          multiple={tool.multiple}
          onFilesChange={setFiles}
        />

        {tool.id === 'split' && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalos de páginas (ex: 1-3, 4-6, 7-10)
            </label>
            <input
              type="text"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              placeholder="1-3, 4-6"
            />
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <ProcessingButton
            loading={loading}
            disabled={files.length === 0}
            onClick={handleProcess}
          >
            Processar {tool.title}
          </ProcessingButton>
        </div>

        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Processamento concluído!</span>
            </div>

            {result.type === 'download' && result.url && (
              <div>
                {result.originalSize && result.compressedSize && result.originalSize > 0 && (
                  <p className="text-sm text-gray-600 mb-3">
                    Tamanho original: {formatSize(result.originalSize)} → Comprimido: {formatSize(result.compressedSize)}
                    {' '}({Math.round((1 - result.compressedSize / result.originalSize) * 100)}% de redução)
                  </p>
                )}
                <a
                  href={result.url}
                  download
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Baixar arquivo
                </a>
              </div>
            )}

            {result.type === 'multi' && result.files && (
              <div className="space-y-3">
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4"
                >
                  <Download className="h-5 w-5" />
                  Baixar todos ({result.files.length} arquivos)
                </button>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-green-100">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => downloadBase64(file.name, file.data)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <ToolsContent />
    </Suspense>
  )
}
