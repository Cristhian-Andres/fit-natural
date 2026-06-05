import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import sharp from 'sharp'

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

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Process image with Sharp: resize + convert to WebP
  const processed = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  // Generate 10x10 blur placeholder
  const blurBuffer = await sharp(buffer)
    .resize(10, 10, { fit: 'cover' })
    .webp({ quality: 20 })
    .toBuffer()
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`

  // Upload to Supabase Storage
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.webp`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, processed, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl, blur: blurDataUrl })
}
