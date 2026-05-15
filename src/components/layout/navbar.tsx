'use client'

import Link from 'next/link'
import { Building2, Home, Search, LogIn } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-md hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Iglecrecimiento</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link 
            href="/consulta" 
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Consultar</span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}