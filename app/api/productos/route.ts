import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAuthUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

const variantSchema = z.object({
  label:     z.string().min(1).max(100),
  price:     z.number().int().min(0).max(100_000_000),
  sortOrder: z.number().int().min(0).optional(),
})

const productSchema = z.object({
  name:        z.string().min(2).max(200),
  category:    z.string().min(1).max(50),
  emoji:       z.string().max(4).optional().default('🌿'),
  description: z.string().min(5).max(2000),
  flavors:     z.array(z.string().max(60)).max(20).optional().default([]),
  imageUrl:    z.string().url().nullable().optional(),
  imageBlur:   z.string().max(500).nullable().optional(),
  images:      z.array(z.string().url()).max(3).optional().default([]),
  imagesBlur:  z.array(z.string().max(500)).max(3).optional().default([]),
  stock:       z.number().int().min(0).max(1_000_000).optional().default(0),
  costPrice:   z.number().int().min(0).max(100_000_000).optional().default(0),
  active:      z.boolean().optional().default(true),
  sortOrder:   z.number().int().min(0).max(10_000).optional().default(0),
  variants:    z.array(variantSchema).min(1).max(20),
})

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let body: unknown
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 })
    }

    const { name, category, emoji, description, flavors, imageUrl, imageBlur,
            images, imagesBlur, stock, costPrice, active, sortOrder, variants } = parsed.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product.create as any)({
      data: {
        name, category, emoji, description,
        flavors, imageUrl, imageBlur,
        images, imagesBlur, stock, costPrice,
        active, sortOrder,
        variants: {
          create: variants.map((v, i) => ({
            label: v.label, price: v.price, sortOrder: v.sortOrder ?? i,
          })),
        },
      },
      include: { variants: true },
    })

    revalidateTag('products')
    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
