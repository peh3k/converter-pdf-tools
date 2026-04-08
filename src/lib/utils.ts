import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const toolsList = [
  {
    id: 'combine',
    title: 'Combinar PDF',
    description: 'Junte vários arquivos PDF em um único documento',
    icon: 'merge',
    color: 'bg-blue-500',
    accept: '.pdf',
    multiple: true,
  },
  {
    id: 'split',
    title: 'Separar PDF',
    description: 'Divida um PDF em partes por intervalos de páginas',
    icon: 'scissors',
    color: 'bg-green-500',
    accept: '.pdf',
    multiple: false,
  },
  {
    id: 'compress',
    title: 'Comprimir PDF',
    description: 'Reduza o tamanho do arquivo PDF',
    icon: 'archive',
    color: 'bg-yellow-500',
    accept: '.pdf',
    multiple: false,
  },
  {
    id: 'pages',
    title: 'Dividir Páginas',
    description: 'Extraia cada página como um PDF separado',
    icon: 'layers',
    color: 'bg-purple-500',
    accept: '.pdf',
    multiple: false,
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF para JPG',
    description: 'Converta páginas do PDF em imagens JPG',
    icon: 'image',
    color: 'bg-red-500',
    accept: '.pdf',
    multiple: false,
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG para PDF',
    description: 'Converta imagens JPG em um documento PDF',
    icon: 'file-text',
    color: 'bg-orange-500',
    accept: '.jpg,.jpeg',
    multiple: true,
  },
  {
    id: 'png-to-pdf',
    title: 'PNG para PDF',
    description: 'Converta imagens PNG em um documento PDF',
    icon: 'file-text',
    color: 'bg-teal-500',
    accept: '.png',
    multiple: true,
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel para PDF',
    description: 'Converta planilhas Excel em PDF',
    icon: 'table',
    color: 'bg-emerald-500',
    accept: '.xlsx,.xls,.csv',
    multiple: false,
  },
  {
    id: 'webp-to-pdf',
    title: 'WebP para PDF',
    description: 'Converta imagens WebP em um documento PDF',
    icon: 'image',
    color: 'bg-indigo-500',
    accept: '.webp',
    multiple: true,
  },
] as const

export type ToolId = typeof toolsList[number]['id']
