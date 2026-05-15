import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const abonos = await prisma.abonos.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        personas: {
          select: { nombre: true }
        }
      }
    })

    return NextResponse.json({ abonos })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener abonos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { persona_id, cantidad, tipo, registrado_por } = body

    if (!persona_id || !cantidad) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const cantidadNum = Number(cantidad)

    const abono = await prisma.abonos.create({
      data: {
        cantidad: cantidadNum,
        tipo: tipo || 'seminario',
        registrado_por: registrado_por || session.user.name || 'Admin',
        personas: {
          connect: { id: persona_id }
        }
      }
    })

    const persona = await prisma.personas.findUnique({
      where: { id: persona_id }
    })

    if (persona) {
      await prisma.personas.update({
        where: { id: persona_id },
        data: {
          total_abonado: Number(persona.total_abonado) + cantidadNum
        }
      })
    }

    return NextResponse.json({ abono })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al crear abono' }, { status: 500 })
  }
}