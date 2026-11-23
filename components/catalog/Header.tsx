import Image from 'next/image'
import Link from 'next/link'
import { INSTAGRAM_URL, waLink } from '@/lib/whatsapp'
import { InstagramIcon, WhatsAppIcon } from './icons'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Fit Natural, inicio">
          <span className="relative h-9 w-9 overflow-hidden rounded-full bg-[#8bc34a] ring-1 ring-ink/10">
            <Image
              src="/logo-fit-natural.jpeg"
              alt=""
              width={36}
              height={36}
              className="h-full w-full scale-[1.4] object-cover"
              priority
            />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Fit Natural
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/#catalogo" className="transition-colors hover:text-ink">Catálogo</Link>
          <Link href="/#como-pedir" className="transition-colors hover:text-ink">Cómo pedir</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Fit Natural"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a
            href={waLink('¡Hola! Quiero hacer un pedido.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-cream-100 transition-colors hover:bg-forest-dark"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Hacer pedido</span>
            <span className="sm:hidden">Pedir</span>
          </a>
        </div>
      </div>
    </header>
  )
}
