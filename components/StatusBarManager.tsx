'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWriteSheet } from '@/contexts/WriteSheetContext'

// Sets Capacitor StatusBar style to match the current route's background color:
// - dusk screens (/write, write sheet open) → Light (white icons)
// - parchment screens (everything else)    → Dark (dark icons)
export default function StatusBarManager() {
  const pathname = usePathname()
  const { isOpen: sheetOpen } = useWriteSheet()

  useEffect(() => {
    const dark = pathname.startsWith('/write') || sheetOpen

    async function setBar() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
        await StatusBar.setBackgroundColor({
          color: dark ? '#0C0B1A' : '#FAF6EE',
        })
      } catch {}
    }

    setBar()
  }, [pathname, sheetOpen])

  return null
}
