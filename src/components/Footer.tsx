import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">PDF Converter</span>
            </div>
            <p className="text-sm text-gray-600">
              Ferramentas gratuitas para converter, combinar, separar e comprimir seus arquivos PDF.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ferramentas</h3>
            <ul className="space-y-2">
              <li><Link href="/tools?tool=combine" className="text-sm text-gray-600 hover:text-blue-600">Combinar PDF</Link></li>
              <li><Link href="/tools?tool=split" className="text-sm text-gray-600 hover:text-blue-600">Separar PDF</Link></li>
              <li><Link href="/tools?tool=compress" className="text-sm text-gray-600 hover:text-blue-600">Comprimir PDF</Link></li>
              <li><Link href="/tools?tool=pdf-to-jpg" className="text-sm text-gray-600 hover:text-blue-600">PDF para JPG</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Segurança</h3>
            <p className="text-sm text-gray-600">
              Seus arquivos são processados de forma segura e excluídos automaticamente após o download. Não armazenamos seus documentos.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} PDF Converter. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
