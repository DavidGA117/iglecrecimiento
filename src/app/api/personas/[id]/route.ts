import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const persona = await prisma.personas.findUnique({
      where: { id },
      include: {
        abonos: {
          orderBy: { fecha: 'desc' }
        }
      }
    })

    if (!persona) {
      return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ persona })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener persona' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nombre, telefono, total_objetivo } = body

    const persona = await prisma.personas.update({
      where: { id },
      data: {
        nombre,
        telefono: telefono || null,
        total_objetivo: total_objetivo ? parseFloat(total_objetivo) : 0
      }
    })

    return NextResponse.json({ persona })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al actualizar persona' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    await prisma.personas.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al eliminar persona' }, { status: 500 })
  }
}