'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, FileText, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatFileSize } from '@/lib/utils'

interface Conversion {
  id: string
  type: string
  inputFileName: string
  outputFileName: string
  fileSize: number
  status: string
  createdAt: string
}

interface DashboardData {
  user: { id: string; name: string; email: string }
  conversions: Conversion[]
  stats: { type: string; _count: { type: number } }[]
  totalConversions: number
}

const typeLabels: Record<string, string> = {
  combine: 'Combinar PDF',
  split: 'Separar PDF',
  compress: 'Comprimir PDF',
  pages: 'Dividir Páginas',
  'pdf-to-jpg': 'PDF para JPG',
  'jpg-to-pdf': 'JPG para PDF',
  'png-to-pdf': 'PNG para PDF',
  'excel-to-pdf': 'Excel para PDF',
  'webp-to-pdf': 'WebP para PDF',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {data.user.name}!
        </h1>
        <p className="text-gray-600 mt-1">Acompanhe suas conversões e atividades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Conversões</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalConversions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipos Diferentes</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Conversão</p>
              <p className="text-lg font-bold text-gray-900">
                {data.conversions.length > 0 ? formatDate(data.conversions[0].createdAt) : 'Nenhuma'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          {['combine', 'compress', 'pdf-to-jpg', 'jpg-to-pdf'].map(toolId => (
            <Link
              key={toolId}
              href={`/tools?tool=${toolId}`}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {typeLabels[toolId]}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Conversion History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Conversões</h2>
        </div>
        {data.conversions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma conversão realizada ainda</p>
            <Link href="/tools" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
              Começar a converter
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.conversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeLabels[conv.type] || conv.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                      {conv.inputFileName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatFileSize(conv.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(conv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
