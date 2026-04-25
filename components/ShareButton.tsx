'use client'

import { useState } from 'react'

interface Props {
  title: string
  poet: string
  className?: string
  url?: string       // share URL; defaults to current page
  iconOnly?: boolean // render paper-plane icon instead of text label
  username?: string  // unused for now, kept for future card feature
  slug?: string
}

export default function ShareButton({ title, poet, className, url: urlProp, iconOnly }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url  = urlProp ?? window.location.href
    const text = `"${title}" by ${poet}`

    // Native share sheet on iOS/Android
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch {
        // User dismissed — no action needed
      }
      return
    }

    // Desktop fallback: copy link
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      className={className ?? 'font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors'}
    >
      {copied ? 'link copied' : 'send this poem'}
    </button>
  )
}
