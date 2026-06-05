import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SerializedProduct } from '@/types'
import ProductsTable from '@/components/admin/ProductsTable'

async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
    return products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  } catch {
    return []
  }
}

export default async function ProductosPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProductsTable products={products} />
      </div>
    </div>
  )
}
