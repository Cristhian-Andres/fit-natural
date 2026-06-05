import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2e7d32',
}

export const metadata: Metadata = {
  title: 'Fit Natural — Alimentos Saludables',
  description: 'Catálogo de productos naturales y saludables: granolas, snacks, lácteos, suplementos y más.',
  keywords: ['alimentación saludable', 'productos naturales', 'granola', 'yogurt griego', 'snacks saludables'],
  openGraph: {
    title: 'Fit Natural — Alimentos Saludables',
    description: 'Descubre nuestro catálogo de productos naturales y saludables.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
