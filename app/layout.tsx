import type { Metadata } from 'next'
import { Playfair_Display, Lora, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Poema',
    template: '%s — Poema',
  },
  description: 'A personal poetry collection. Words written in ink.',
  openGraph: {
    title: 'Poema',
    description: 'A personal poetry collection. Words written in ink.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${playfair.variable} ${lora.variable} ${inter.variable}`}>
      <body className="bg-ink text-parchment min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
