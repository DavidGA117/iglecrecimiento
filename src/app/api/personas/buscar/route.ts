import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase()

    if (!query) {
      return NextResponse.json({ personas: [] })
    }

    const personas = await prisma.personas.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { telefono: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        total_objetivo: true,
        total_abonado: true
      }
    })

    return NextResponse.json({ personas })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 })
  }
}