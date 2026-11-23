import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PUBLIC_PRODUCT_SELECT } from '@/lib/public-product'
import { CATEGORIES } from '@/lib/constants'
import { fmt } from '@/lib/utils'
import { SerializedProduct } from '@/types'
import ProductGallery from '@/components/catalog/ProductGallery'
import ProductCard from '@/components/catalog/ProductCard'
import Footer from '@/components/catalog/Footer'

export const revalidate = 60

function serialize(p: Record<string, unknown> & { createdAt: Date; updatedAt: Date }): SerializedProduct {
  return {
    ...p,
    images: (p.images as string[]) ?? [],
    imagesBlur: (p.imagesBlur as string[]) ?? [],
    // No se exponen al publico: se rellenan con 0, esta pagina nunca los usa.
    stock: 0,
    costPrice: 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  } as SerializedProduct
}

async function getProduct(id: string): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id, active: true },
      select: PUBLIC_PRODUCT_SELECT,
    })
    if (!product) return null
    return serialize(product)
  } catch {
    return null
  }
}

async function getRelatedProducts(category: string, excludeId: string): Promise<SerializedProduct[]> {
  try {
    const sameCategory = await prisma.product.findMany({
      where: { active: true, category, id: { not: excludeId } },
      select: PUBLIC_PRODUCT_SELECT,
      orderBy: { sortOrder: 'asc' },
      take: 8,
    })

    let related = sameCategory
    if (related.length < 4) {
      const fillerIds = [excludeId, ...related.map(p => p.id)]
      const filler = await prisma.product.findMany({
        where: { active: true, id: { notIn: fillerIds } },
        select: PUBLIC_PRODUCT_SELECT,
        orderBy: { sortOrder: 'asc' },
        take: 8 - related.length,
      })
      related = [...related, ...filler]
    }

    return related.map(serialize)
  } catch {
    return []
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)

  const cat = CATEGORIES[product.category] ?? CATEGORIES.all
  const minPrice = product.variants.length ? Math.min(...product.variants.map(v => v.price)) : null

  // Build gallery: use images[] if available, else fall back to imageUrl
  const galleryImages = product.images?.filter(Boolean).length
    ? product.images.filter(Boolean)
    : product.imageUrl ? [product.imageUrl] : []
  const galleryBlurs = product.images?.filter(Boolean).length
    ? product.imagesBlur ?? []
    : product.imageBlur ? [product.imageBlur] : []

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? '573148375549'
  const waText = encodeURIComponent(
    `Hola! Me interesa el producto: *${product.name}*${minPrice ? ` (desde ${fmt(minPrice)})` : ''}. ¿Tienen disponibilidad?`
  )
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header sticky */}
      <header className="bg-brand-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-brand-200 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Catálogo</span>
          </Link>
          <span className="text-brand-400">›</span>
          <Link
            href={`/?category=${product.category}`}
            className="text-brand-200 hover:text-white transition-colors text-sm hidden sm:inline"
          >
            {cat.name}
          </Link>
          <span className="text-brand-400 hidden sm:inline">›</span>
          <p className="text-sm font-medium truncate flex-1">{product.name}</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-28 md:pb-12">
        <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">

          {/* ── Galería ── */}
          <div className="mb-6 md:mb-0 md:sticky md:top-20">
            <ProductGallery
              images={galleryImages}
              blurs={galleryBlurs}
              alt={product.name}
              emoji={product.emoji}
              bgColor={cat.light}
            />
          </div>

          {/* ── Info del producto ── */}
          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-7 space-y-5">
            {/* Categoría */}
            <Link href={`/?category=${product.category}`}>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full hover:opacity-80 transition-opacity"
                style={{ background: cat.light, color: cat.color }}
              >
                {cat.emoji} {cat.name}
              </span>
            </Link>

            {/* Nombre */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Precio */}
            {minPrice && (
              <p className="text-3xl font-bold text-brand-700">
                {product.variants.length === 1
                  ? fmt(product.variants[0].price)
                  : `Desde ${fmt(minPrice)}`}
              </p>
            )}

            <div className="border-t border-gray-100" />

            {/* Descripción */}
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>

            {/* Sabores */}
            {product.flavors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Sabores disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map(f => (
                    <span
                      key={f}
                      className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Presentaciones y precios */}
            {product.variants.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Presentaciones</p>
                <div className="space-y-2">
                  {product.variants.map(v => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                    >
                      <span className="text-sm text-gray-700">{v.label}</span>
                      <span className="text-brand-700 font-bold text-sm">{fmt(v.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100" />

            {/* Botón WhatsApp — visible en desktop */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex w-full items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-md"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.002 0C5.373 0 .001 5.373.001 12c0 2.117.554 4.104 1.523 5.827L0 24l6.335-1.524A11.955 11.955 0 0012.002 24c6.628 0 12-5.373 12-12s-5.372-12-11.998-12zm0 21.818a9.809 9.809 0 01-4.996-1.368l-.357-.213-3.722.896.924-3.634-.232-.373A9.796 9.796 0 012.183 12c0-5.417 4.402-9.818 9.819-9.818 5.416 0 9.818 4.401 9.818 9.818 0 5.416-4.402 9.818-9.818 9.818z"/>
              </svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        {/* ── Productos relacionados ── */}
        {related.length > 0 && (
          <section className="mt-10 md:mt-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                También te puede interesar
              </h2>
              <Link
                href={`/?category=${product.category}`}
                className="text-sm font-medium text-brand-700 hover:underline whitespace-nowrap ml-3"
              >
                Ver más {cat.name.toLowerCase()} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      {/* Espaciador para que el CTA fijo de móvil no tape el footer */}
      <div className="h-24 md:hidden" />

      {/* ── CTA fijo en móvil ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-30">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors text-base"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.002 0C5.373 0 .001 5.373.001 12c0 2.117.554 4.104 1.523 5.827L0 24l6.335-1.524A11.955 11.955 0 0012.002 24c6.628 0 12-5.373 12-12s-5.372-12-11.998-12zm0 21.818a9.809 9.809 0 01-4.996-1.368l-.357-.213-3.722.896.924-3.634-.232-.373A9.796 9.796 0 012.183 12c0-5.417 4.402-9.818 9.819-9.818 5.416 0 9.818 4.401 9.818 9.818 0 5.416-4.402 9.818-9.818 9.818z"/>
          </svg>
          Pedir por WhatsApp
        </a>
      </div>
    </div>
  )
}
