import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PUBLIC_PRODUCT_SELECT } from '@/lib/public-product'
import { SerializedProduct } from '@/types'
import Header from '@/components/catalog/Header'
import Hero from '@/components/catalog/Hero'
import CatalogClient from '@/components/catalog/CatalogClient'
import HowToOrder from '@/components/catalog/HowToOrder'
import Footer from '@/components/catalog/Footer'

export const revalidate = 60

async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: PUBLIC_PRODUCT_SELECT,
      orderBy: { sortOrder: 'asc' },
    })
    return products.map(p => ({
      ...p,
      images: (p as Record<string, unknown>).images as string[] ?? [],
      imagesBlur: (p as Record<string, unknown>).imagesBlur as string[] ?? [],
      // No se exponen al publico: se rellenan con 0, el catalogo nunca los usa.
      stock: 0,
      costPrice: 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  } catch {
    return []
  }
}

// Un producto con imagen por categoria, en el orden del catalogo.
function pickFeatured(products: SerializedProduct[], count = 3): SerializedProduct[] {
  const seen = new Set<string>()
  const featured: SerializedProduct[] = []
  for (const p of products) {
    if (!p.imageUrl || seen.has(p.category)) continue
    seen.add(p.category)
    featured.push(p)
    if (featured.length === count) break
  }
  return featured
}

export default async function HomePage() {
  const products = await getProducts()
  const totalCategories = new Set(products.map(p => p.category)).size

  return (
    <div className="flex min-h-screen flex-col bg-cream font-body text-ink">
      <Header />
      <main className="flex-1">
        <Hero
          featured={pickFeatured(products)}
          totalProducts={products.length}
          totalCategories={totalCategories}
        />
        {/* Suspense: CatalogClient lee ?category= via useSearchParams sin
            forzar renderizado dinamico en el resto de la pagina (sigue ISR). */}
        <Suspense>
          <CatalogClient products={products} />
        </Suspense>
        <HowToOrder />
      </main>
      <Footer />
    </div>
  )
}
