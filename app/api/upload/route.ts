import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import sharp from 'sharp'

const MAX_BYTES     = 8 * 1024 * 1024  // 8 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// Validate file by magic bytes — MIME header can be spoofed, bytes cannot
function isAllowedImage(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true                   // JPEG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true // PNG
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&           // WebP
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true // GIF
  return false
}

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
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Early size rejection via Content-Length header
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 8 MB)' }, { status: 413 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })

    // MIME type allowlist
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 415 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Actual byte size check after reading
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 8 MB)' }, { status: 413 })
    }

    // Magic bytes validation (prevents malicious files disguised as images)
    if (!isAllowedImage(buffer)) {
      return NextResponse.json({ error: 'El contenido del archivo no es una imagen válida' }, { status: 415 })
    }

    // Strip EXIF/metadata, resize, convert to WebP
    const processed = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: 'cover' })
      .webp({ quality: 20 })
      .toBuffer()
    const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`

    // Sanitize filename — no path traversal, no special chars
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.\-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .slice(0, 80)
    const fileName = `${Date.now()}-${safeName}.webp`

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, processed, { contentType: 'image/webp', upsert: false })

    if (uploadError) {
      console.error('[upload]', uploadError.message)
      return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return NextResponse.json({ url: publicUrl, blur: blurDataUrl })

  } catch (err) {
    console.error('[upload] unexpected:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
