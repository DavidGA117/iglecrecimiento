import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const personas = await prisma.personas.findMany()
    const abonos = await prisma.abonos.findMany()

    const totalRecaudado = abonos.reduce((sum, a) => sum + Number(a.cantidad), 0)
    const totalObjetivo = personas.reduce((sum, p) => sum + Number(p.total_objetivo), 0)

    return NextResponse.json({
      personas: personas.length,
      abonos: abonos.length,
      totalRecaudado,
      totalPendiente: totalObjetivo - totalRecaudado
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ personas: 0, abonos: 0, totalRecaudado: 0, totalPendiente: 0 })
  }
}