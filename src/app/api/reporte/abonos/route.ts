import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const personas = await prisma.personas.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        abonos: {
          orderBy: { fecha: 'desc' }
        }
      }
    })

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Reporte de Abonos - Iglecrecimiento', 14, 22)
    
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 14, 30)

    let yPos = 40

    for (const persona of personas) {
      if (persona.abonos.length === 0) continue

      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 150)
      doc.text(persona.nombre, 14, yPos)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      if (persona.telefono) {
        doc.text(`Teléfono: ${persona.telefono}`, 14, yPos + 6)
      }
      doc.text(`Objetivo: $${Number(persona.total_objetivo).toLocaleString('es-CO')}`, 14, yPos + 12)

      const abonosData = persona.abonos.map((a: any) => [
        a.fecha ? new Date(a.fecha).toLocaleDateString('es-CO') : '-',
        a.tipo === 'hotel' ? '🏨 Hotel' : a.tipo === 'transporte' ? '🚌 Transporte' : '📚 Seminario',
        `$${Number(a.cantidad).toLocaleString('es-CO')}`,
        a.registrado_por || '-'
      ])

      const totalAbonado = persona.abonos.reduce((sum: number, a: any) => sum + Number(a.cantidad), 0)

      autoTable(doc, {
        startY: yPos + 18,
        head: [['Fecha', 'Tipo', 'Cantidad', 'Registrado por']],
        body: abonosData,
        foot: [['', 'Total', `$${totalAbonado.toLocaleString('es-CO')}`, '']],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 40 }
        }
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    const buffer = doc.output('arraybuffer')
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'attachment; filename="reporte-abonos.pdf"')

    return new NextResponse(Buffer.from(buffer), { headers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}