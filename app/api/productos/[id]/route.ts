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

// CUID format: c + 24 alphanumeric characters
const CUID_RE = /^c[a-z0-9]{20,30}$/i

const variantSchema = z.object({
  label:     z.string().min(1).max(100),
  price:     z.number().int().min(0).max(100_000_000),
  sortOrder: z.number().int().min(0).optional(),
})

const updateSchema = z.object({
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    if (!CUID_RE.test(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    if (!CUID_RE.test(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    let body: unknown
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 422 })
    }

    const { name, category, emoji, description, flavors, imageUrl, imageBlur,
            images, imagesBlur, stock, costPrice, active, sortOrder, variants } = parsed.data

    await prisma.variant.deleteMany({ where: { productId: params.id } })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product.update as any)({
      where: { id: params.id },
      data: {
        name, category, emoji, description,
        flavors, imageUrl, imageBlur,
        images: images ?? [], imagesBlur: imagesBlur ?? [],
        stock: stock ?? 0, costPrice: costPrice ?? 0,
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
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    if (!CUID_RE.test(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    revalidateTag('products')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
