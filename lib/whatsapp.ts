import { fmt } from './utils'

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '573148375549'
export const INSTAGRAM_URL = 'https://www.instagram.com/fitnatural_pop/'

export function waLink(text?: string): string {
  return `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

interface OrderDetails {
  name: string
  variant?: string
  flavor?: string
  price?: number | null
  /** true cuando el precio es "desde" (varias presentaciones sin elegir) */
  fromPrice?: boolean
}

export function productOrderLink({ name, variant, flavor, price, fromPrice }: OrderDetails): string {
  const details = [
    variant && `Presentación: ${variant}`,
    flavor && `Sabor: ${flavor}`,
    price ? `Precio: ${fromPrice ? 'desde ' : ''}${fmt(price)}` : null,
  ].filter(Boolean)

  const text = [`¡Hola! Quiero pedir *${name}*.`, ...details, '¿Tienen disponibilidad?'].join('\n')
  return waLink(text)
}
