import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Iglecrecimiento', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de Abonos', pageWidth / 2, 30, { align: 'center' })

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(persona.nombre, 14, 55)

    doc.setDrawColor(41, 128, 185)
    doc.setLineWidth(0.5)
    doc.line(14, 60, pageWidth - 14, 60)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    
    const telefono = persona.telefono || 'No registrado'
    const objetivo = Number(persona.total_objetivo || 0)
    const totalAbonado = persona.abonos.reduce((sum, a) => sum + Number(a.cantidad), 0)
    const faltan = objetivo - totalAbonado

    doc.text(`Telefono: ${telefono}`, 14, 70)
    doc.text(`Objetivo: $${objetivo.toLocaleString('es-CO')}`, 14, 78)
    doc.text(`Total Abonado: $${totalAbonado.toLocaleString('es-CO')}`, 14, 86)
    doc.text(`Faltante: $${faltan.toLocaleString('es-CO')}`, 14, 94)

    const progreso = objetivo > 0 ? (totalAbonado / objetivo) * 100 : 0
    
    doc.setFillColor(236, 240, 241)
    doc.roundedRect(14, 100, pageWidth - 28, 15, 3, 3, 'F')
    doc.setFillColor(41, 128, 185)
    doc.roundedRect(14, 100, (pageWidth - 28) * (progreso / 100), 15, 3, 3, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`${progreso.toFixed(1)}% de progreso`, pageWidth / 2, 110, { align: 'center' })

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Historial de Abonos', 14, 130)

    if (persona.abonos.length === 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No hay abonos registrados', 14, 145)
    } else {
      const abonosData = persona.abonos.map(a => [
        new Date(a.fecha).toLocaleDateString('es-CO'),
        a.tipo === 'hotel' ? 'Hotel' : a.tipo === 'transporte' ? 'Transporte' : 'Seminario',
        `$${Number(a.cantidad).toLocaleString('es-CO')}`,
        a.registrado_por || '-'
      ])

      autoTable(doc, {
        startY: 135,
        head: [['Fecha', 'Concepto', 'Monto', 'Registrado']],
        body: abonosData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 10
        },
        footStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [245, 250, 255]
        }
      })
    }

    const fecha = new Date()
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Generado el ${fecha.toLocaleDateString('es-CO')} a las ${fecha.toLocaleTimeString('es-CO')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )

    const buffer = doc.output('arraybuffer')
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="abonos-${persona.nombre.replace(/\s+/g, '-')}.pdf"`)

    return new NextResponse(Buffer.from(buffer), { headers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}