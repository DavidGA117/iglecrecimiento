import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const personas = await prisma.personas.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        abonos: {
          orderBy: { fecha: 'desc' }
        }
      }
    })

    const result = personas.map((p: any) => {
      const total = p.abonos.reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      const hotel = p.abonos.filter((a: any) => a.tipo === 'hotel').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      const transporte = p.abonos.filter((a: any) => a.tipo === 'transporte').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      const seminario = p.abonos.filter((a: any) => !a.tipo || a.tipo === 'seminario').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      
      return {
        id: p.id,
        nombre: p.nombre,
        telefono: p.telefono,
        objetivo: p.total_objetivo,
        total_abonado: total,
        total_objetivo: p.total_objetivo,
        abonos: p.abonos,
        desglose: { hotel, transporte, seminario }
      }
    })

    return NextResponse.json({ personas: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}