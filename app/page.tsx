import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PUBLIC_PRODUCT_SELECT } from '@/lib/public-product'
import { SerializedProduct } from '@/types'
import Header from '@/components/catalog/Header'
import CatalogClient from '@/components/catalog/CatalogClient'
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

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Suspense: CatalogClient lee ?category= via useSearchParams sin
          forzar renderizado dinamico en el resto de la pagina (sigue ISR). */}
      <Suspense>
        <CatalogClient products={products} />
      </Suspense>
      <Footer />
    </div>
  )
}
