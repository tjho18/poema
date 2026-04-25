import type { Metadata } from 'next'
import { EB_Garamond } from 'next/font/google'
import './globals.css'

// EB Garamond: one typeface for everything — titles, body, UI.
// The full range of weights and italic style gives us all the typographic
// distinction we need without introducing a second font.
const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Poema',
  description: 'A quiet place for poems.',
  openGraph: {
    siteName: 'Poema',
    type: 'website',
  },
  // PWA
  applicationName: 'Poema',
  appleWebApp: {
    capable: true,
    title: 'Poema',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={garamond.variable}>
      <head>
        {/* Apple PWA icons — one per common size */}
        <link rel="apple-touch-icon" sizes="180x180" href="/api/icon/180" />
        <link rel="apple-touch-icon" sizes="152x152" href="/api/icon/152" />
        <link rel="apple-touch-icon" sizes="167x167" href="/api/icon/167" />
        <meta name="theme-color" content="#F7F7F5" />
      </head>
      <body className="bg-ink-bg text-ink-text min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
