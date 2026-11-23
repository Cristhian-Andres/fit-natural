import { handleSchedule } from '@vercel/schedules'
import { prisma } from '@/lib/prisma'

// Supabase (plan gratuito) pausa el proyecto tras 7 dias sin actividad.
// Esta funcion privada la invoca solo el scheduler de Vercel (ver vercel.json)
// y hace una lectura real a la base para mantener el proyecto activo.
export const POST = handleSchedule(async (metadata) => {
  const products = await prisma.product.count()
  console.log(`[keep-alive] ${metadata.name} ${metadata.executionId}: ${products} productos`)
})
