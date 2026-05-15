'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  ArrowUpRight
} from 'lucide-react'
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const [data, setData] = useState<{
    stats: { totalRecaudado: number; totalPendiente: number; numeroPersonas: number; numeroAbonos: number; promedioAbonos: number }
    ultimosAbonos: Array<{ id: string; cantidad: number; fecha: string; personas?: { nombre: string } }>
    personasConMasAbono: Array<{ nombre: string; abonado: number; objetivo: number; progreso: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
  }

  const pieData = data.personasConMasAbono.map((p, i) => ({
    name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
    value: p.abonado,
    color: COLORS[i % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen del sistema de abonos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${data.stats.totalRecaudado.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-blue-500 mr-1" />
              Total collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendiente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${data.stats.totalPendiente.toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-gray-500 mt-1">Por Cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Personas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.numeroPersonas}
            </div>
            <p className="text-xs text-gray-500 mt-1">Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio por Persona</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${data.stats.promedioAbonos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Abonado promedio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personas con Más Avance</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value || 0).toLocaleString('es-CO')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Abonos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ultimosAbonos.length > 0 ? (
                data.ultimosAbonos.map((abono) => (
                  <div key={abono.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{abono.personas?.nombre || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">
                        {abono.fecha ? new Date(abono.fecha).toLocaleDateString('es-CO') : 'Sin fecha'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      +${Number(abono.cantidad).toLocaleString('es-CO')}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay abonos registrados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso por Persona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.personasConMasAbono.length > 0 ? (
              data.personasConMasAbono.map((persona, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{persona.nombre}</span>
                    <span className="text-sm text-gray-600">
                      ${persona.abonado.toLocaleString('es-CO')} / ${persona.objetivo.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(persona.progreso, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay personas registradas</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}