import { prisma } from '@/lib/prisma'
import { SerializedProduct } from '@/types'
import Header from '@/components/catalog/Header'
import CatalogClient from '@/components/catalog/CatalogClient'
import Footer from '@/components/catalog/Footer'

export const revalidate = 60

async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
    return products.map(p => ({
      ...p,
      images: (p as Record<string, unknown>).images as string[] ?? [],
      imagesBlur: (p as Record<string, unknown>).imagesBlur as string[] ?? [],
      stock: (p as Record<string, unknown>).stock as number ?? 0,
      costPrice: (p as Record<string, unknown>).costPrice as number ?? 0,
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
      <CatalogClient products={products} />
      <Footer />
    </div>
  )
}
