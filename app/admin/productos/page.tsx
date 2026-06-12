import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SerializedProduct } from '@/types'
import ProductsManager from '@/components/admin/ProductsManager'

async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    })
    return products.map(p => ({
      ...p,
      images: (p as Record<string, unknown>).images as string[] ?? [],
      imagesBlur: (p as Record<string, unknown>).imagesBlur as string[] ?? [],
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} en total</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-1.5"
        >
          <span className="text-base">+</span>
          <span className="hidden sm:inline">Nuevo producto</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Manager con filtros, tabla/tarjetas y paginación */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <ProductsManager products={products} />
      </div>
    </div>
  )
}
