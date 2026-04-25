'use client'

import { useState } from 'react'

interface Props {
  title: string
  poet: string
  className?: string
  url?: string       // share URL; defaults to current page
  iconOnly?: boolean // render paper-plane icon instead of text label
  // When provided, the button will try to share a beautiful image card
  username?: string
  slug?: string
}

export default function ShareButton({
  title,
  poet,
  className,
  url: urlProp,
  iconOnly,
  username,
  slug,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'done'>('idle')

  async function handleShare() {
    const url = urlProp ?? window.location.href

    // ── Try image share (native mobile share sheet with card PNG) ──
    if (username && slug && navigator.share) {
      setState('loading')
      try {
        const cardUrl = `/api/card/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`
        const blob = await fetch(cardUrl).then(r => r.blob())
        const file = new File([blob], 'poem.png', { type: 'image/png' })

        // iOS 15+ / Android Chrome support sharing files
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], url, title: `"${title}" by ${poet}` })
          setState('done')
          setTimeout(() => setState('idle'), 2000)
          return
        }

        // File share not supported — fall through to URL share
      } catch {
        // User dismissed sheet or fetch failed — fall through silently
        setState('idle')
        return
      }
    }

    // ── URL share (Web Share API without file) ──
    if (navigator.share) {
      setState('loading')
      try {
        await navigator.share({ title: `"${title}" by ${poet}`, url })
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      } catch {
        // User dismissed
      } finally {
        setState('idle')
      }
      return
    }

    // ── Desktop fallback: copy link ──
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      // Clipboard blocked
    }
  }

  // ── Icon-only variant (paper plane on home hero) ──
  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        aria-label="Share this poem"
        disabled={state === 'loading'}
        className={className ?? 'text-ink-muted/30 hover:text-ink-muted/60 transition-colors'}
      >
        {state === 'loading' ? (
          // Thin spinner ring
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-spin"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : state === 'copied' || state === 'done' ? (
          // Checkmark
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

  // ── Text variant (poem detail pages) ──
  return (
    <button
      onClick={handleShare}
      disabled={state === 'loading'}
      className={className ?? 'font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors'}
    >
      {state === 'loading' ? 'sharing…'
        : state === 'copied' ? 'link copied'
        : state === 'done'   ? 'shared ✓'
        : 'send this poem'}
    </button>
  )
}
