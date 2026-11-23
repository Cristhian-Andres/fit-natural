import { waLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

const STEPS = [
  {
    title: 'Elige tus productos',
    text: 'Explora el catálogo y revisa presentaciones, sabores y precios de lo que te gusta.',
  },
  {
    title: 'Escríbenos por WhatsApp',
    text: 'Toca el botón de pedido y el mensaje sale listo con el producto que elegiste.',
  },
  {
    title: 'Confirmamos tu pedido',
    text: 'Te confirmamos disponibilidad, total y cómo recibirlo. Sin registros ni formularios.',
  },
]

export default function HowToOrder() {
  return (
    <section id="como-pedir" className="scroll-mt-16 bg-forest text-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime">Cómo pedir</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
              Pedir es tan simple como enviar un mensaje.
            </h2>
            <a
              href={waLink('¡Hola! Quiero hacer un pedido.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-sm font-semibold text-ink transition-colors hover:bg-cream-100"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Empezar pedido
            </a>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-[28px] bg-cream-100/10 sm:grid-cols-3 lg:col-span-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-forest p-6 sm:p-7">
                <span className="font-display text-5xl font-light italic text-lime">0{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-100/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
