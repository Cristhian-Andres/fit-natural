export interface Variant {
  id: string
  label: string
  price: number
  sortOrder: number
  productId: string
}

export interface Product {
  id: string
  name: string
  category: string
  emoji: string
  description: string
  flavors: string[]
  imageUrl: string | null
  imageBlur: string | null
  active: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  variants: Variant[]
}

export type ProductWithVariants = Product & { variants: Variant[] }

// Serialized version safe to pass from Server → Client components
export type SerializedProduct = Omit<ProductWithVariants, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}
