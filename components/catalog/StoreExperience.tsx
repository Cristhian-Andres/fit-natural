'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { INSTAGRAM_URL, waLink } from '@/lib/whatsapp'
import { InstagramIcon, WhatsAppIcon } from './icons'

const INTRO_MS = 3000
const INTRO_FADE_MS = 500
const PROMO_DELAY_MS = 10_000

const PHRASE = ['Disfruta', 'de', 'una', 'alimentación', 'sana', 'y', 'consciente.']
// Palabras resaltadas en lima: "sana y consciente."
const HIGHLIGHT_FROM = 4

type IntroState = 'show' | 'leaving' | 'done'

// Se monta una vez por carga de pagina (el layout de la tienda persiste al
// navegar entre catalogo y fichas), asi que el loader y la invitacion
// aparecen en cada carga o recarga, pero no en cada cambio de pagina interno.
export default function StoreExperience() {
  const [intro, setIntro] = useState<IntroState>('show')
  const [progressStarted, setProgressStarted] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Loader: 3 s completos desde que la app esta lista; la barra de progreso
  // arranca en el mismo momento para terminar justo cuando se desvanece.
  useEffect(() => {
    let fade: ReturnType<typeof setTimeout>
    const frame = requestAnimationFrame(() => setProgressStarted(true))
    const t = setTimeout(() => {
      setIntro('leaving')
      fade = setTimeout(() => setIntro('done'), INTRO_FADE_MS)
    }, INTRO_MS)
    return () => { cancelAnimationFrame(frame); clearTimeout(t); clearTimeout(fade) }
  }, [])

  // Invitacion: 10 s de navegacion despues de que la tienda es visible.
  useEffect(() => {
    if (intro !== 'done') return
    const t = setTimeout(() => setPromoOpen(true), PROMO_DELAY_MS)
    return () => clearTimeout(t)
  }, [intro])

  const closePromo = useCallback(() => setPromoOpen(false), [])

  // Bloquea el scroll del fondo mientras hay una capa encima.
  const locked = intro !== 'done' || promoOpen
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [locked])

  useEffect(() => {
    if (!promoOpen) return
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePromo() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [promoOpen, closePromo])

  return (
    <>
      {intro !== 'done' && (
        <div
          data-intro-loader
          role="status"
          aria-label="Cargando Fit Natural"
          className={`fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-forest px-6 font-body text-cream-100 transition-opacity duration-500 ${
            intro === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {/* Formas organicas de fondo */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-lime/20 blur-3xl sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 animate-float rounded-full bg-lime/10 blur-3xl [animation-delay:-3s] sm:h-[28rem] sm:w-[28rem]" />

          <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
            <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
              <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-lime/50" />
              <span className="absolute inset-3 animate-pulse-soft rounded-full bg-lime/15" />
              <span className="relative h-20 w-20 animate-pop-in overflow-hidden rounded-full bg-[#8bc34a] ring-4 ring-cream-100/10 sm:h-24 sm:w-24">
                <Image
                  src="/logo-fit-natural.jpeg"
                  alt=""
                  width={96}
                  height={96}
                  priority
                  className="h-full w-full scale-[1.4] object-cover"
                />
              </span>
            </div>

            <p className="mt-6 animate-fade-up text-[11px] font-bold uppercase tracking-[0.3em] text-lime [animation-delay:200ms]">
              Fit Natural
            </p>

            <h2 className="mt-3 font-display text-[2rem] font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              {PHRASE.map((word, i) => (
                <Fragment key={word}>
                  {/* En pantallas medianas y grandes, "sana y consciente." va en su propia linea */}
                  {i === HIGHLIGHT_FROM && <br className="hidden sm:inline" />}
                  <span
                    className={`inline-block animate-fade-up ${i >= HIGHLIGHT_FROM ? 'italic text-lime' : ''}`}
                    style={{ animationDelay: `${400 + i * 170}ms` }}
                  >
                    {word}
                    {i < PHRASE.length - 1 && ' '}
                  </span>
                </Fragment>
              ))}
            </h2>

            <p className="mt-4 animate-fade-up text-sm text-cream-100/70 [animation-delay:1800ms] sm:text-base">
              Alimentos naturales y saludables para tu día a día
            </p>

            <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-cream-100/15 sm:w-60">
              <div
                className="h-full origin-left rounded-full bg-lime ease-linear"
                style={{
                  transform: progressStarted ? 'scaleX(1)' : 'scaleX(0)',
                  transition: `transform ${INTRO_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {promoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="promo-title"
          className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4 font-body sm:p-6"
        >
          <div className="absolute inset-0 animate-fade-in bg-ink/55 backdrop-blur-sm" onClick={closePromo} />

          <div ref={dialogRef} tabIndex={-1} className="relative w-full max-w-md animate-modal-in outline-none overflow-hidden rounded-[28px] bg-cream-100 shadow-2xl shadow-ink/30 md:grid md:max-w-3xl md:grid-cols-5">
            <button
              type="button"
              onClick={closePromo}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-cream-100/90 text-ink transition hover:bg-cream-200 md:bg-transparent"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Panel de marca */}
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-forest md:col-span-2 md:h-auto md:min-h-[26rem]">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-lime/25 blur-2xl" />
              <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-lime/15 blur-2xl" />
              <div className="relative flex items-center gap-4 md:flex-col md:gap-5">
                <span className="relative block h-20 w-20 overflow-hidden rounded-full bg-[#8bc34a] ring-4 ring-cream-100/15 md:h-28 md:w-28">
                  <Image src="/logo-fit-natural.jpeg" alt="" width={112} height={112} className="h-full w-full scale-[1.4] object-cover" />
                </span>
                <div className="text-left md:text-center">
                  <p className="font-display text-2xl font-medium text-cream-100">Fit Natural</p>
                  <p className="text-sm text-lime">@fitnatural_pop</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 sm:p-8 md:col-span-3 md:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest">Únete a la comunidad</p>
              <h2 id="promo-title" className="mt-2 font-display text-3xl font-medium leading-[1.1] tracking-tight text-ink sm:text-4xl">
                Come rico, <em className="font-normal italic text-forest">vive sano</em>.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                Síguenos en Instagram para enterarte de novedades y productos nuevos. Y si ya
                se te antojó algo, haz tu pedido por WhatsApp en un minuto.
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closePromo}
                  className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-ink text-sm font-semibold text-cream-100 transition-colors hover:bg-forest-dark"
                >
                  <InstagramIcon className="h-5 w-5" />
                  Seguir en Instagram
                </a>
                <a
                  href={waLink('¡Hola! Vengo de la tienda online y quiero hacer un pedido.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closePromo}
                  className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-forest text-sm font-semibold text-cream-100 transition-colors hover:bg-forest-light"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Hacer un pedido
                </a>
                <button
                  type="button"
                  onClick={closePromo}
                  className="h-10 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Seguir viendo el catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
