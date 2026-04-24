'use client'

import { useState } from 'react'

interface Props {
  title: string
  poet: string
  className?: string
  url?: string      // override URL; defaults to current page
  iconOnly?: boolean // render paper-plane icon instead of text
}

export default function ShareButton({ title, poet, className, url: urlProp, iconOnly }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url  = urlProp ?? window.location.href
    const text = `"${title}" by ${poet}`

    // Web Share API — opens native sheet on mobile (iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        // User dismissed the sheet — no action needed
      }
      return
    }

    // Fallback: copy link to clipboard on desktop
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — silently fail
    }
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        aria-label="Share this poem"
        className={className ?? 'text-ink-muted/30 hover:text-ink-muted/60 transition-colors'}
      >
        {copied ? (
          // Tiny checkmark feedback
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          // Paper plane
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className={className ?? "font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"}
    >
      {copied ? 'link copied' : 'send this poem'}
    </button>
  )
}
