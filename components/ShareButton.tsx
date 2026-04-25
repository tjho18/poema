'use client'

import { useState } from 'react'

interface Props {
  title: string
  poet: string
  className?: string
  url?: string       // share URL; defaults to current page
  iconOnly?: boolean // render paper-plane icon instead of text label
  // When provided, tries to share a beautiful image card first
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
    const url      = urlProp ?? window.location.href
    const shareText = `"${title}" by ${poet}`

    setState('loading')

    // ── 1. Try image card (mobile with file-share support) ──
    if (username && slug && navigator?.share) {
      let sharedAsImage = false

      try {
        const cardUrl = `/api/card/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`

        // Race the card fetch against an 8 s timeout so we never hang
        const res = await Promise.race([
          fetch(cardUrl),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
        ]) as Response

        if (res.ok) {
          const blob = await res.blob()
          const file = new File([blob], 'poem.png', { type: 'image/png' })

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], url, title: shareText })
            sharedAsImage = true
            setState('done')
            setTimeout(() => setState('idle'), 2000)
          }
        }
      } catch {
        // Card failed (timeout / font error / dismissed) — fall through
      }

      if (sharedAsImage) return

      // ── 2. Plain URL share (always works on iOS/Android) ──
      try {
        await navigator.share({ title: shareText, url })
      } catch {
        // User dismissed sheet — that's fine
      }
      setState('idle')
      return
    }

    // ── 3. Desktop fallback: copy link to clipboard ──
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  // ── Icon-only variant (paper plane on home / poet hero) ──
  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        aria-label="Share this poem"
        disabled={state === 'loading'}
        className={className ?? 'text-ink-muted/30 hover:text-ink-muted/60 transition-colors'}
      >
        {state === 'loading' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" strokeLinecap="round" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : state === 'copied' || state === 'done' ? (
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
