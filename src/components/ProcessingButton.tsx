'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProcessingButtonProps {
  loading: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export default function ProcessingButton({
  loading,
  disabled,
  onClick,
  children,
  className,
}: ProcessingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all',
        'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {loading ? 'Processando...' : children}
    </button>
  )
}
