import Link from 'next/link'
import { Merge, Scissors, Archive, Layers, Image, FileText, Table } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  merge: Merge,
  scissors: Scissors,
  archive: Archive,
  layers: Layers,
  image: Image,
  'file-text': FileText,
  table: Table,
}

interface ToolCardProps {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

export default function ToolCard({ id, title, description, icon, color }: ToolCardProps) {
  const IconComponent = iconMap[icon] || FileText

  return (
    <Link href={`/tools?tool=${id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer h-full">
        <div className={cn('inline-flex p-3 rounded-lg mb-4', color)}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </div>
    </Link>
  )
}
