import { Prisma } from '@prisma/client'

// Campos seguros para exponer en el catalogo publico y las APIs sin autenticacion.
// Deliberadamente excluye costPrice y stock: son datos internos del negocio
// (margen y nivel exacto de inventario) que no deben llegar al navegador de
// ningun visitante, ni siquiera "ocultos" en el HTML/props de un componente.
export const PUBLIC_PRODUCT_SELECT = {
  id: true,
  name: true,
  category: true,
  emoji: true,
  description: true,
  flavors: true,
  imageUrl: true,
  imageBlur: true,
  images: true,
  imagesBlur: true,
  active: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  variants: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ProductSelect
