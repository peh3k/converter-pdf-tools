import ToolCard from '@/components/ToolCard'
import { toolsList } from '@/lib/utils'
import { Shield, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Todas as ferramentas de PDF
            <br />
            <span className="text-blue-200">em um só lugar</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Converta, combine, separe e comprima seus arquivos PDF de forma gratuita, rápida e segura.
          </p>
          <Link
            href="/tools"
            className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Começar agora
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Nossas Ferramentas
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Escolha a ferramenta que você precisa. Todas as conversões são feitas de forma segura no servidor.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsList.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex p-3 bg-green-100 rounded-xl mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rápido</h3>
              <p className="text-gray-600">
                Processamento instantâneo dos seus arquivos com tecnologia de ponta.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguro</h3>
              <p className="text-gray-600">
                Seus arquivos são protegidos e excluídos automaticamente após o processamento.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                <Lock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privado</h3>
              <p className="text-gray-600">
                Não armazenamos seus documentos. Sua privacidade é nossa prioridade.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
