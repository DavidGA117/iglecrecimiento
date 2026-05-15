'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Search, User, DollarSign, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Persona {
  id: string
  nombre: string
  telefono: string | null
  total_objetivo: number
  total_abonado: number
  desglose?: { hotel: number; transporte: number; seminario: number }
}

export default function ConsultaPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/public/consulta')
      const data = await res.json()
      setPersonas(data.personas || [])
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonas()
  }, [])

  const filteredPersonas = personas.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.telefono && p.telefono.includes(searchTerm))
  )

  const selectedProgress = selectedPersona 
    ? selectedPersona.total_objetivo > 0 
      ? (Number(selectedPersona.total_abonado) / Number(selectedPersona.total_objetivo)) * 100 
      : 0
    : 0

  const selectedPending = selectedPersona 
    ? Number(selectedPersona.total_objetivo) - Number(selectedPersona.total_abonado)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Consulta tu Avance</h1>
          <p className="text-gray-500 text-lg mt-1">Busca tu nombre o teléfono para ver tu progreso</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Participantes Registrados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Nombre</TableHead>
                          <TableHead className="font-semibold">Teléfono</TableHead>
                          <TableHead className="font-semibold">Objetivo</TableHead>
                          <TableHead className="font-semibold">Abonado</TableHead>
                          <TableHead className="font-semibold">Progreso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPersonas.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No se encontraron participantes
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPersonas.map((persona: any) => {
                            const progreso = persona.total_objetivo > 0 
                              ? (Number(persona.total_abonado) / Number(persona.total_objetivo)) * 100 
                              : 0
                            return (
                              <TableRow 
                                key={persona.id} 
                                className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedPersona?.id === persona.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedPersona(persona)}
                              >
                                <TableCell className="font-medium">{persona.nombre}</TableCell>
                                <TableCell className="text-gray-600">{persona.telefono || '-'}</TableCell>
                                <TableCell className="text-gray-600">
                                  ${Number(persona.total_objetivo).toLocaleString('es-CO')}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-700">
                                    ${Number(persona.total_abonado).toLocaleString('es-CO')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={progreso} className="h-2 w-16" />
                                    <span className="text-sm font-medium text-gray-600">
                                      {progreso.toFixed(0)}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedPersona ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl sticky top-24">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    {selectedPersona.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
{selectedPersona.telefono && (
                    <div className="text-center text-gray-600">
                      Teléfono: {selectedPersona.telefono}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
                        <DollarSign className="h-4 w-4" />
                        Total Abonado
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ${Number(selectedPersona.total_abonado).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <div className="text-gray-500 text-sm mb-1">Total Objetivo</div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${Number(selectedPersona.total_objetivo).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-semibold text-blue-600">{selectedProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={selectedProgress} className="h-3" />
                    <p className="text-center text-gray-500 text-sm">
                      Te faltan <span className="font-semibold text-orange-600">${selectedPending.toLocaleString('es-CO')}</span> por pagar
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-gray-600 mb-3">Desglose por concepto</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🏨</div>
                        <div className="text-xs text-gray-500">Hotel</div>
                        <div className="font-semibold text-purple-600">${Number(selectedPersona.desglose?.hotel || 0).toLocaleString('es-CO')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🚌</div>
                        <div className="text-xs text-gray-500">Transporte</div>
                        <div className="font-semibold text-orange-600">${Number(selectedPersona.desglose?.transporte || 0).toLocaleString('es-CO')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📚</div>
                        <div className="text-xs text-gray-500">Seminario</div>
                        <div className="font-semibold text-green-600">${Number(selectedPersona.desglose?.seminario || 0).toLocaleString('es-CO')}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Selecciona un participante</p>
                  <p className="text-gray-400 text-sm mt-1">Haz click en una fila para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}