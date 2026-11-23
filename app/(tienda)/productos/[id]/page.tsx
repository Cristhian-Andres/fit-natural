import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PUBLIC_PRODUCT_SELECT } from '@/lib/public-product'
import { ChevronRight } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import { SerializedProduct } from '@/types'
import Header from '@/components/catalog/Header'
import ProductGallery from '@/components/catalog/ProductGallery'
import ProductCard from '@/components/catalog/ProductCard'
import PurchasePanel from '@/components/catalog/PurchasePanel'
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return {}
  return {
    title: `${product.name} — Fit Natural`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} — Fit Natural`,
      description: product.description.slice(0, 160),
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const cat = CATEGORIES[product.category] ?? CATEGORIES.all

  // Galeria: usa images[] si existe, si no cae a imageUrl
  const hasGallery = product.images?.filter(Boolean).length > 0
  const galleryImages = hasGallery
    ? product.images.filter(Boolean)
    : product.imageUrl ? [product.imageUrl] : []
  const galleryBlurs = hasGallery
    ? product.imagesBlur ?? []
    : product.imageBlur ? [product.imageBlur] : []

  return (
    <div className="flex min-h-screen flex-col bg-cream font-body text-ink">
      <Header />

      <main className="flex-1 pb-24 md:pb-0">
        <nav aria-label="Ruta" className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 text-sm text-ink-muted">
            <li><Link href="/" className="hover:text-ink">Catálogo</Link></li>
            <li><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              <Link href={`/?category=${product.category}#catalogo`} className="hover:text-ink">
                {cat.name}
              </Link>
            </li>
            <li className="hidden sm:block"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="hidden truncate text-ink sm:block">{product.name}</li>
          </ol>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-5 sm:px-6 md:grid-cols-12 md:gap-10 md:pt-8 lg:gap-16 lg:px-8 lg:pb-24">
          <div className="animate-fade-up md:col-span-7 md:self-start md:sticky md:top-24">
            <ProductGallery images={galleryImages} blurs={galleryBlurs} alt={product.name} />
          </div>
          {/* Sin animacion con transform: rompería el CTA position:fixed de movil */}
          <div className="md:col-span-5 md:pt-4">
            <PurchasePanel product={product} />
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-ink/10">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest">Sigue explorando</p>
                  <h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                    También te puede gustar
                  </h2>
                </div>
                <Link
                  href={`/?category=${product.category}#catalogo`}
                  className="hidden shrink-0 pb-1 text-sm font-semibold text-ink underline-offset-4 hover:underline sm:block"
                >
                  Ver todo {cat.name.toLowerCase()} →
                </Link>
              </div>
              <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                {related.slice(0, 8).map(p => (
                  <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
                    <ProductCard product={p} sizes="(max-width: 768px) 45vw, 25vw" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
