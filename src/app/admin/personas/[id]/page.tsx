'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, ArrowLeft, User, Phone, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Persona {
  id: string
  nombre: string
  telefono: string | null
  total_objetivo: number
  total_abonado: number
  created_at: Date | null
  abonos: Array<{
    id: string
    cantidad: number
    fecha: Date
    registrado_por: string | null
  }>
}

export default function PersonaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')
  const router = useRouter()

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      fetchPersona(p.id)
    })
  }, [params])

  const fetchPersona = async (personaId: string) => {
    try {
      const res = await fetch(`/api/personas/${personaId}`)
      const data = await res.json()
      if (data.persona) {
        setPersona(data.persona)
      } else {
        toast.error('Persona no encontrada')
        router.push('/admin/personas')
      }
    } catch {
      toast.error('Error al cargar persona')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!persona) return null

  const progreso = persona.total_objetivo > 0 
    ? (Number(persona.total_abonado) / Number(persona.total_objetivo)) * 100 
    : 0
  const pendiente = Number(persona.total_objetivo) - Number(persona.total_abonado)

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/personas')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Personas
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              {persona.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{persona.telefono || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de registro</p>
                  <p className="font-medium">
                    {persona.created_at ? new Date(persona.created_at).toLocaleDateString('es-CO') : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Progreso de pago</span>
                <span className="font-medium text-blue-600">{progreso.toFixed(1)}%</span>
              </div>
              <Progress value={progreso} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500 pt-2">
                <span>Abonado: ${Number(persona.total_abonado).toLocaleString('es-CO')}</span>
                <span>Objetivo: ${Number(persona.total_objetivo).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600">Total Abonado</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${Number(persona.total_abonado).toLocaleString('es-CO')}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-sm text-orange-600">Pendiente</p>
                <p className="text-2xl font-bold text-orange-700">
                  ${pendiente.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Abonos</CardTitle>
          </CardHeader>
          <CardContent>
            {persona.abonos.length > 0 ? (
              <div className="space-y-3">
                {persona.abonos.map((abono: any) => (
                  <div key={abono.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-600">
                        +${Number(abono.cantidad).toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {abono.fecha ? new Date(abono.fecha).toLocaleDateString('es-CO') : '-'}
                      </p>
                    </div>
                    <Badge variant="outline">{abono.registrado_por || 'Sistema'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay abonos registrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}