import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const personas = await prisma.personas.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        abonos: {
          orderBy: { fecha: 'desc' },
          take: 5
        }
      }
    })

    const result = personas.map((p: any) => {
      const hotel = p.abonos.filter((a: any) => a.tipo === 'hotel').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      const transporte = p.abonos.filter((a: any) => a.tipo === 'transporte').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      const seminario = p.abonos.filter((a: any) => !a.tipo || a.tipo === 'seminario').reduce((sum: number, a: any) => sum + Number(a.cantidad || 0), 0)
      
      return {
        ...p,
        total_abonado: hotel + transporte + seminario,
        desglose: { hotel, transporte, seminario }
      }
    })

    return NextResponse.json({ personas: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener personas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, telefono, total_objetivo } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const persona = await prisma.personas.create({
      data: {
        nombre,
        telefono: telefono || null,
        total_objetivo: total_objetivo ? parseFloat(total_objetivo) : 0,
        total_abonado: 0
      }
    })

    return NextResponse.json({ persona })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al crear persona' }, { status: 500 })
  }
}