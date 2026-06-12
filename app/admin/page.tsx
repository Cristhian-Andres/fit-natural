import { prisma } from '@/lib/prisma'
import { SerializedProduct } from '@/types'
import Dashboard from '@/components/admin/Dashboard'

async function getAllProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
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

export default async function AdminDashboardPage() {
  const products = await getAllProducts()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Resumen general · {products.length} productos registrados
        </p>
      </div>
      <Dashboard products={products} />
    </div>
  )
}
