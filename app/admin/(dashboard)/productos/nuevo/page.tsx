import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-gray-400 hover:text-gray-600">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nuevo producto</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <ProductForm />
      </div>
    </div>
  )
}
