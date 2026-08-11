import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SerializedProduct } from '@/types'
import ProductForm from '@/components/admin/ProductForm'

async function getProduct(id: string): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!product) return null
    return {
      ...product,
      images: (product as Record<string, unknown>).images as string[] ?? [],
      imagesBlur: (product as Record<string, unknown>).imagesBlur as string[] ?? [],
      stock: (product as Record<string, unknown>).stock as number ?? 0,
      costPrice: (product as Record<string, unknown>).costPrice as number ?? 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }
  } catch {
    return null
  }
}

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-gray-400 hover:text-gray-600">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Editar producto</h1>
        <p className="text-gray-500 text-sm mt-1">{product.name}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProductForm product={product} />
      </div>
    </div>
  )
}
