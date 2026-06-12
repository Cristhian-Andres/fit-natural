import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, category, emoji, description, flavors, imageUrl, imageBlur, images, imagesBlur, stock, costPrice, active, sortOrder, variants } = body

  // Delete and recreate variants for simplicity
  await prisma.variant.deleteMany({ where: { productId: params.id } })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (prisma.product.update as any)({
    where: { id: params.id },
    data: {
      name,
      category,
      emoji,
      description,
      flavors,
      imageUrl,
      imageBlur,
      images: images ?? [],
      imagesBlur: imagesBlur ?? [],
      stock: stock ?? 0,
      costPrice: costPrice ?? 0,
      active,
      sortOrder,
      variants: {
        create: (variants ?? []).map((v: { label: string; price: number; sortOrder?: number }, i: number) => ({
          label: v.label,
          price: v.price,
          sortOrder: v.sortOrder ?? i,
        })),
      },
    },
    include: { variants: true },
  })

  revalidateTag('products')
  return NextResponse.json(product)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.product.delete({ where: { id: params.id } })

  revalidateTag('products')
  return NextResponse.json({ success: true })
}
