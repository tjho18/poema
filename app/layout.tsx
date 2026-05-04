import type { Metadata } from 'next'
import { EB_Garamond } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Grain from '@/components/Grain'
import BottomNav from '@/components/BottomNav'
import EveningTheme from '@/components/EveningTheme'
import PushNotificationSetup from '@/components/PushNotificationSetup'
import StatusBarManager from '@/components/StatusBarManager'
import WriteSheet from '@/components/WriteSheet'
import { WriteSheetProvider } from '@/contexts/WriteSheetContext'
import { getTodayPrompt } from '@/lib/queries'

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
})

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Poema',
  description: 'A quiet place for poems.',
  openGraph: {
    siteName: 'Poema',
    type: 'website',
  },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch today's prompt server-side so it's available in the Write sheet
  const todayPrompt = await getTodayPrompt().catch(() => null)

  return (
    <html lang="en" className={`${garamond.variable} ${geist.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/api/icon/180" />
        <link rel="apple-touch-icon" sizes="152x152" href="/api/icon/152" />
        <link rel="apple-touch-icon" sizes="167x167" href="/api/icon/167" />
        <meta name="theme-color" content="#FAF6EE" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="bg-parchment text-poem-ink min-h-screen antialiased">
        <WriteSheetProvider
          promptId={todayPrompt?.id ?? null}
          promptText={todayPrompt?.text ?? null}
        >
          <Grain />
          <EveningTheme />
          <PushNotificationSetup />
          <StatusBarManager />
          {children}
          <BottomNav />
          <WriteSheet />
        </WriteSheetProvider>
      </body>
    </html>
  )
}
