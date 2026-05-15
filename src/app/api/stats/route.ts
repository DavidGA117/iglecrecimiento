import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const personas = await prisma.personas.findMany()
    const abonos = await prisma.abonos.findMany({
      orderBy: { fecha: 'desc' },
      take: 10,
      include: { personas: { select: { nombre: true } } }
    })

    const totalRecaudado = abonos.reduce((sum: number, a: any) => sum + Number(a.cantidad), 0)
    const totalObjetivo = personas.reduce((sum: number, p: any) => sum + Number(p.total_objetivo), 0)

    const personasConMasAbono = personas
      .map((p: any) => ({
        nombre: p.nombre,
        abonado: Number(p.total_abonado),
        objetivo: Number(p.total_objetivo),
        progreso: Number(p.total_objetivo) > 0 ? (Number(p.total_abonado) / Number(p.total_objetivo)) * 100 : 0
      }))
      .sort((a, b) => b.abonado - a.abonado)
      .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalRecaudado,
        totalPendiente: totalObjetivo - totalRecaudado,
        numeroPersonas: personas.length,
        numeroAbonos: abonos.length,
        promedioAbonos: personas.length > 0 ? totalRecaudado / personas.length : 0
      },
      ultimosAbonos: abonos,
      personasConMasAbono
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener stats' }, { status: 500 })
  }
}