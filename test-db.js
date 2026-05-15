const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    const personas = await prisma.personas.findMany()
    console.log('Personas:', JSON.stringify(personas, null, 2))
    
    const abonos = await prisma.abonos.findMany()
    console.log('Abonos:', JSON.stringify(abonos, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()