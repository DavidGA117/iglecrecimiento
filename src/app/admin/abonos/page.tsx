'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Loader2,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface Persona {
  id: string
  nombre: string
  total_objetivo: number
  total_abonado: number
}

interface Abono {
  id: string
  cantidad: number
  tipo: string
  fecha: Date
  registrado_por: string | null
  personas?: { nombre: string }
}

export default function AbonosPage() {
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<{ persona_id: string; cantidad: string; tipo: string }>({ persona_id: '', cantidad: '', tipo: 'seminario' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const [abonosRes, personasRes] = await Promise.all([
        fetch('/api/abonos'),
        fetch('/api/personas')
      ])
      const abonosData = await abonosRes.json()
      const personasData = await personasRes.json()
      setAbonos(abonosData.abonos || [])
      setPersonas(personasData.personas || [])
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAbonos = abonos.filter(a => 
    a.personas?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAbonos = abonos.reduce((sum, a) => sum + Number(a.cantidad), 0)

  const handleSubmit = async () => {
    if (!formData.persona_id || !formData.cantidad) {
      toast.error('Selecciona una persona y cantidad')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/abonos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: formData.persona_id,
          cantidad: parseFloat(formData.cantidad),
          tipo: formData.tipo
        })
      })

      if (res.ok) {
        toast.success('Abono registrado')
        setIsDialogOpen(false)
        setFormData({ persona_id: '', cantidad: '', tipo: 'seminario' })
        fetchData()
      } else {
        toast.error('Error al registrar abono')
      }
    } catch {
      toast.error('Error al registrar abono')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonos</h1>
          <p className="text-gray-600 mt-1">Registra y gestiona los abonos de los participantes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setFormData({ persona_id: '', cantidad: '', tipo: 'seminario' }); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Abono
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Abono</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Persona *</Label>
                <Select
                  value={formData.persona_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, persona_id: value || '' })}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Selecciona una persona" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.nombre} - ${Number(persona.total_abonado).toLocaleString('es-CO')} / ${Number(persona.total_objetivo).toLocaleString('es-CO')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Tipo de Abono</Label>
                <Select
                  value={formData.tipo || 'seminario'}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value || 'seminario' })}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="seminario">📚 Seminario</SelectItem>
                    <SelectItem value="hotel">🏨 Hotel</SelectItem>
                    <SelectItem value="transporte">🚌 Transporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Registrar Abono
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Total Abonado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalAbonos.toLocaleString('es-CO')}</p>
            <p className="text-blue-100 text-sm mt-1">{abonos.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Total Abonos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{abonos.length}</p>
            <p className="text-gray-500 text-sm mt-1">registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-purple-600">Ø</span>
              Promedio por Abono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              ${abonos.length > 0 ? (totalAbonos / abonos.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : 0}
            </p>
            <p className="text-gray-500 text-sm mt-1">por transacción</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredAbonos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay abonos registrados</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Registrado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbonos.map((abono) => (
                  <TableRow key={abono.id}>
                    <TableCell>
                      {abono.fecha ? new Date(abono.fecha).toLocaleDateString('es-CO') : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{abono.personas?.nombre || 'Sin nombre'}</TableCell>
                    <TableCell>
                      <Badge className={
                        abono.tipo === 'hotel' ? 'bg-purple-100 text-purple-700' :
                        abono.tipo === 'transporte' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {abono.tipo === 'hotel' ? '🏨 Hotel' :
                         abono.tipo === 'transporte' ? '🚌 Transporte' : '📚 Seminario'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">
                        +${Number(abono.cantidad).toLocaleString('es-CO')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{abono.registrado_por || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}