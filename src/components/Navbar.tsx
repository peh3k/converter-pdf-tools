'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PDF Converter</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/tools" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Ferramentas
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4">
            <Link href="/tools" className="block text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Ferramentas
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
