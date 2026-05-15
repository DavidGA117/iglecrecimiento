'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Credenciales incorrectas')
      } else {
        toast.success('Bienvenido al sistema')
        window.location.href = '/admin/dashboard'
      }
    } catch {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNC0xNHoiIGZpbGw9IiMwMDgiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-block mb-8">
              <div className="w-28 h-28 relative hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/images/logo.png" 
                  alt="Iglecrecimiento" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Iglecrecimiento
            </h1>
            <p className="text-gray-500 text-lg mt-2 font-light">
              Sistema de Administración
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-fade-in-up animation-delay-200">
            <CardHeader className="space-y-2 pb-5">
              <CardTitle className="text-2xl font-semibold text-gray-800 text-center">
                Bienvenido
              </CardTitle>
              <CardDescription className="text-gray-500 text-center text-base">
                Ingresa tus credenciales de administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-gray-700 font-medium text-base">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-gray-700 font-medium text-base">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    'Entrar al Sistema'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-1 shadow-xl animate-fade-in-up animation-delay-400">
            <Card className="bg-white border-0 shadow-none">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <p className="text-gray-700 font-medium text-lg">
                    ¿Eres participante del evento?
                  </p>
                  <p className="text-gray-500 text-base mt-1">
                    Consulta tu avance de pago sin necesidad de acceder al sistema
                  </p>
                </div>
                <Link href="/consulta">
                  <Button 
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Consultar Mis Datos
                  </Button>
                </Link>
                <p className="text-sm text-gray-400 text-center mt-4">
                  Solo ingresa tu nombre o teléfono
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-400 text-base">
            © 2024 Iglecrecimiento
          </p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif !important;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}