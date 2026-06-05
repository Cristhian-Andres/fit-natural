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

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { variants: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, category, emoji, description, flavors, imageUrl, imageBlur, active, sortOrder, variants } = body

  const product = await prisma.product.create({
    data: {
      name,
      category,
      emoji: emoji ?? '🌿',
      description,
      flavors: flavors ?? [],
      imageUrl,
      imageBlur,
      active: active ?? true,
      sortOrder: sortOrder ?? 0,
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
  return NextResponse.json(product, { status: 201 })
}
