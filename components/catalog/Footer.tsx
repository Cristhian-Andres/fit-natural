import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { INSTAGRAM_URL, waLink } from '@/lib/whatsapp'
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon } from './icons'

const CATEGORY_LINKS = Object.entries(CATEGORIES).filter(([key]) => key !== 'all')

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink text-cream-100">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-3xl font-medium tracking-tight">Fit Natural</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-100/60">
              Alimentos naturales y saludables para comer rico todos los días.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href={waLink('¡Hola! Quiero hacer un pedido.')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Fit Natural"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream-100/15 text-cream-100/80 transition-colors hover:border-lime hover:text-lime"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Fit Natural"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream-100/15 text-cream-100/80 transition-colors hover:border-lime hover:text-lime"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav className="md:col-span-6" aria-label="Categorías">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cream-100/40">Categorías</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
              {CATEGORY_LINKS.map(([key, cat]) => (
                <li key={key}>
                  <Link
                    href={`/?category=${key}#catalogo`}
                    className="text-cream-100/70 transition-colors hover:text-cream-100"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cream-100/40">Tienda</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/#catalogo" className="text-cream-100/70 hover:text-cream-100">Catálogo</Link></li>
              <li><Link href="/#como-pedir" className="text-cream-100/70 hover:text-cream-100">Cómo pedir</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream-100/10 pt-6 text-xs text-cream-100/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Fit Natural. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <span>Sitio por Cristhian Luna</span>
            <a href="https://www.facebook.com/CHRISTHNN?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook de Cristhian Luna" className="hover:text-cream-100">
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/cristhian_lunaa" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Cristhian Luna" className="hover:text-cream-100">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href="https://www.linkedin.com/in/cristhian-lunaa/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Cristhian Luna" className="hover:text-cream-100">
              <LinkedInIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
