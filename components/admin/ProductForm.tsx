'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { SerializedProduct } from '@/types'
import { CATEGORY_OPTIONS } from '@/lib/constants'
import { fmt } from '@/lib/utils'
import MultiImageUpload from './MultiImageUpload'

const MAX_IMAGES = 3

const variantSchema = z.object({
  label: z.string().min(1, 'Requerido'),
  price: z.coerce.number().int().min(100, 'Mínimo $100'),
})

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  emoji: z.string().min(1).max(4).default('🌿'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  flavors: z.string().optional(),
  images: z.array(z.string()).max(MAX_IMAGES).default([]),
  imagesBlur: z.array(z.string()).max(MAX_IMAGES).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  costPrice: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  variants: z.array(variantSchema).min(1, 'Agrega al menos una presentación'),
})

type FormValues = z.infer<typeof schema>

function padArray(arr: string[], length: number): string[] {
  return [...arr, ...Array(Math.max(0, length - arr.length)).fill('')]
}

interface Props {
  product?: SerializedProduct
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [uploadingSlots, setUploadingSlots] = useState([false, false, false])

  // Build initial images from existing data
  const initialImages = product?.images?.filter(Boolean).length
    ? padArray(product.images.filter(Boolean), MAX_IMAGES)
    : product?.imageUrl
      ? padArray([product.imageUrl], MAX_IMAGES)
      : padArray([], MAX_IMAGES)

  const initialBlurs = product?.imagesBlur?.filter(Boolean).length
    ? padArray(product.imagesBlur.filter(Boolean), MAX_IMAGES)
    : product?.imageBlur
      ? padArray([product.imageBlur], MAX_IMAGES)
      : padArray([], MAX_IMAGES)

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      category: product?.category ?? '',
      emoji: product?.emoji ?? '🌿',
      description: product?.description ?? '',
      flavors: product?.flavors.join(', ') ?? '',
      images: initialImages,
      imagesBlur: initialBlurs,
      stock: product?.stock ?? 0,
      costPrice: product?.costPrice ?? 0,
      active: product?.active ?? true,
      sortOrder: product?.sortOrder ?? 0,
      variants: product?.variants.map(v => ({ label: v.label, price: v.price })) ?? [{ label: '', price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const images = watch('images')
  const imagesBlur = watch('imagesBlur')
  const costPrice = watch('costPrice') ?? 0
  const firstVariantPrice = Number(watch('variants.0.price')) || 0
  const ganancia = firstVariantPrice - costPrice
  const margen = firstVariantPrice > 0 ? ((ganancia / firstVariantPrice) * 100).toFixed(1) : '0'

  async function onSubmit(data: FormValues) {
    setSaving(true)
    try {
      const cleanImages = (data.images ?? []).filter(Boolean)
      const cleanBlurs = data.imagesBlur.filter(Boolean)
      const payload = {
        ...data,
        flavors: data.flavors ? data.flavors.split(',').map(f => f.trim()).filter(Boolean) : [],
        images: cleanImages,
        imagesBlur: cleanBlurs,
        // Keep imageUrl/imageBlur in sync with first image for card thumbnails
        imageUrl: cleanImages[0] || null,
        imageBlur: cleanBlurs[0] || null,
      }
      const url = isEdit ? `/api/productos/${product!.id}` : '/api/productos'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al guardar')
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            {...register('name')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Granola Artesanal"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            {...register('category')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">Seleccionar...</option>
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
          <input
            {...register('emoji')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="🌿"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="Descripción del producto..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Flavors */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sabores <span className="text-gray-400 font-normal">(separados por coma)</span>
          </label>
          <input
            {...register('flavors')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Vainilla, Chocolate, Fresa"
          />
        </div>

        {/* Sort Order & Active */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input
            type="number"
            {...register('sortOrder')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('active')} className="w-4 h-4 accent-brand-600" />
            <span className="text-sm font-medium text-gray-700">Producto activo</span>
          </label>
        </div>
      </div>

      {/* ── Inventario y Costos ── */}
      <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-base">📦</span> Inventario y Costos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad en stock
            </label>
            <input
              type="number"
              min={0}
              {...register('stock')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              placeholder="0"
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
          </div>

          {/* Precio de costo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio de costo (COP)
            </label>
            <input
              type="number"
              min={0}
              {...register('costPrice')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              placeholder="0"
            />
            {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice.message}</p>}
          </div>
        </div>

        {/* Ganancia calculada */}
        {firstVariantPrice > 0 && costPrice > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Precio venta</p>
              <p className="text-sm font-bold text-gray-800">{fmt(firstVariantPrice)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Costo</p>
              <p className="text-sm font-bold text-gray-800">{fmt(costPrice)}</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${ganancia >= 0 ? 'bg-brand-50 border-brand-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs text-gray-500 mb-0.5">Ganancia ({margen}%)</p>
              <p className={`text-sm font-bold ${ganancia >= 0 ? 'text-brand-700' : 'text-red-600'}`}>
                {fmt(ganancia)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Multi Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del producto</label>
        <MultiImageUpload
          values={images}
          blurs={imagesBlur}
          uploading={uploadingSlots}
          onChange={(imgs, blrs) => { setValue('images', imgs); setValue('imagesBlur', blrs) }}
          onUploadingChange={setUploadingSlots}
        />
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Presentaciones / Precios *
          </label>
          <button
            type="button"
            onClick={() => append({ label: '', price: 0 })}
            className="text-xs text-brand-600 hover:text-brand-800 font-medium"
          >
            + Agregar
          </button>
        </div>
        {errors.variants?.root && (
          <p className="text-red-500 text-xs mb-2">{errors.variants.root.message}</p>
        )}
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`variants.${i}.label`)}
                  placeholder="Ej: 300gr, Unidad..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.variants?.[i]?.label && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.variants[i]?.label?.message}</p>
                )}
              </div>
              <div className="w-32">
                <input
                  type="number"
                  {...register(`variants.${i}.price`)}
                  placeholder="Precio COP"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.variants?.[i]?.price && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.variants[i]?.price?.message}</p>
                )}
              </div>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2 py-2 text-sm">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 pb-4">
        <button
          type="submit"
          disabled={saving || uploadingSlots.some(Boolean)}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">
          Cancelar
        </button>
      </div>
    </form>
  )
}
