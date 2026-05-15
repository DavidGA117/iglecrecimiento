'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Loader2,
  UserPlus,
  FileDown
} from 'lucide-react'
import { toast } from 'sonner'

interface Persona {
  id: string
  nombre: string
  telefono: string | null
  total_objetivo: number
  total_abonado: number
  created_at: Date | null
  desglose?: { hotel: number; transporte: number; seminario: number }
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [formData, setFormData] = useState({ nombre: '', telefono: '', total_objetivo: '', cantidad_abono: '', tipo_abono: 'seminario' })
  const [saving, setSaving] = useState(false)

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas')
      const data = await res.json()
      setPersonas(data.personas || [])
    } catch {
      toast.error('Error al cargar personas')
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

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSaving(true)
    try {
      let personaId = editingPersona?.id

      if (!editingPersona) {
        const res = await fetch('/api/personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            telefono: formData.telefono || null,
            total_objetivo: formData.total_objetivo || 0
          })
        })

        if (!res.ok) {
          const errorData = await res.json()
          toast.error('Error al crear persona: ' + (errorData.error || 'Error'))
          setSaving(false)
          return
        }

        const data = await res.json()
        if (!data.persona?.id) {
          toast.error('Error: No se получил el ID de la persona')
          setSaving(false)
          return
        }
        personaId = data.persona.id
      } else {
        await fetch(`/api/personas/${editingPersona.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            telefono: formData.telefono || null,
            total_objetivo: formData.total_objetivo || 0
          })
        })
      }

      if (formData.cantidad_abono && personaId) {
        const abonoRes = await fetch('/api/abonos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona_id: personaId,
            cantidad: parseFloat(formData.cantidad_abono),
            tipo: formData.tipo_abono
          })
        })
        if (!abonoRes.ok) {
          const errorData = await abonoRes.json()
          toast.error('Error al crear abono: ' + (errorData.error || 'Error desconocido'))
          setSaving(false)
          return
        }
      }

      toast.success(editingPersona ? 'Persona actualizada' : 'Persona creada')
      setIsDialogOpen(false)
      resetForm()
      fetchPersonas()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta persona?')) return

    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Persona eliminada')
        fetchPersonas()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const openEdit = (persona: Persona) => {
    setEditingPersona(persona)
    setFormData({
      nombre: persona.nombre,
      telefono: persona.telefono || '',
      total_objetivo: String(persona.total_objetivo),
      cantidad_abono: '',
      tipo_abono: 'seminario'
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingPersona(null)
    setFormData({ nombre: '', telefono: '', total_objetivo: '', cantidad_abono: '', tipo_abono: 'seminario' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
          <p className="text-gray-600 mt-1">Gestiona los participantes del evento</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { resetForm(); setIsDialogOpen(true) }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nueva Persona
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPersona ? 'Editar Persona' : 'Nueva Persona'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Label htmlFor="total_objetivo">Total Objetivo</Label>
                <Input
                  id="total_objetivo"
                  type="number"
                  value={formData.total_objetivo}
                  onChange={(e) => setFormData({ ...formData, total_objetivo: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="cantidad_abono" className="text-blue-700 font-semibold">
                  {editingPersona ? 'Agregar Abono' : 'Abono Inicial'}
                </Label>
                <p className="text-xs text-blue-600 mb-2">
                  {editingPersona ? 'Registrar un nuevo pago' : 'Cantidad que entrega ahora'}
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="cantidad_abono"
                      type="number"
                      step="0.01"
                      value={formData.cantidad_abono}
                      onChange={(e) => setFormData({ ...formData, cantidad_abono: e.target.value })}
                      placeholder="0.00"
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={formData.tipo_abono}
                    onChange={(e) => setFormData({ ...formData, tipo_abono: e.target.value })}
                    className="px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="seminario">Seminario</option>
                    <option value="hotel">Hotel</option>
                    <option value="transporte">Transporte</option>
                  </select>
                </div>
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingPersona ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={() => window.open('/api/reporte/abonos', '_blank')}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredPersonas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay personas registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-center">🏨 Hotel</TableHead>
                  <TableHead className="text-center">🚌 Transp.</TableHead>
                  <TableHead className="text-center">📚 Semin.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonas.map((persona: any) => {
                  const progreso = persona.total_objetivo > 0 
                    ? (Number(persona.total_abonado) / Number(persona.total_objetivo)) * 100 
                    : 0
                  return (
                    <TableRow key={persona.id}>
                      <TableCell className="font-medium">{persona.nombre}</TableCell>
                      <TableCell>{persona.telefono || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span className={(persona.desglose?.hotel || 0) > 0 ? "text-purple-600 font-medium" : "text-gray-400"}>
                          ${Number(persona.desglose?.hotel || 0).toLocaleString('es-CO')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={(persona.desglose?.transporte || 0) > 0 ? "text-orange-600 font-medium" : "text-gray-400"}>
                          ${Number(persona.desglose?.transporte || 0).toLocaleString('es-CO')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={(persona.desglose?.seminario || 0) > 0 ? "text-green-600 font-medium" : "text-gray-400"}>
                          ${Number(persona.desglose?.seminario || 0).toLocaleString('es-CO')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">
                          ${Number(persona.total_abonado).toLocaleString('es-CO')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progreso} className="h-2 w-20" />
                          <span className="text-sm text-gray-600">{progreso.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 border-green-200"
                            onClick={() => window.open(`/api/reporte/persona/${persona.id}`, '_blank')}
                            title="Descargar PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEdit(persona)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(persona.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}