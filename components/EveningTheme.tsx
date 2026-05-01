'use client'

import { useEffect } from 'react'

// After 9pm local time, adds .evening to <html> for warmer parchment.
// One toggle, zero UI surface.
export default function EveningTheme() {
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 21 || hour < 5) {
      document.documentElement.classList.add('evening')
    }
  }, [])

  return null
}
