'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Props {
  poemId: string
  // Reader view: whether the current viewer has liked this poem.
  initialLiked?: boolean
  // Poet view: when the viewer is the poem's author, we show the count
  // instead of an interactive heart. `count` being a number switches modes.
  count?: number
  // Resolved server-side: null = signed out, string = user id, undefined = unknown.
  viewerId?: string | null
  // When true, fetch the viewer's liked-state on mount (used where we can't
  // know it server-side, e.g. the homepage hero cycling through poems).
  lookupLiked?: boolean
}

// A hairline heart. Outline when unliked; fills with ink when liked.
// Never red — it stays inside the typographic, book-like palette.
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"
      className="transition-all duration-300"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function LikeButton({ poemId, initialLiked = false, count, viewerId, lookupLiked }: Props) {
  const [liked, setLiked]     = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  // Self-fetch liked state when the caller can't supply it (hero feed).
  useEffect(() => {
    if (!lookupLiked || !viewerId) return
    let active = true
    setLiked(false) // reset while we re-check for the new poem
    createClient()
      .from('likes')
      .select('poem_id', { count: 'exact', head: true })
      .eq('poem_id', poemId)
      .eq('user_id', viewerId)
      .then(({ count: c }) => { if (active) setLiked((c ?? 0) > 0) })
    return () => { active = false }
  }, [lookupLiked, viewerId, poemId])

  // ── Poet view: static count, no toggle (only the poet ever sees this) ──
  if (typeof count === 'number') {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-body italic text-xs text-ink-muted/50 tracking-widest"
        title="only you can see this"
      >
        <Heart filled />
        {count}
      </span>
    )
  }

  // ── Signed out: quiet link to sign in ──
  if (viewerId === null) {
    return (
      <Link
        href="/signin"
        aria-label="Sign in to appreciate this poem"
        className="inline-flex items-center text-ink-muted/40 hover:text-ink-muted transition-colors"
      >
        <Heart filled={false} />
      </Link>
    )
  }

  async function toggle() {
    if (loading || !viewerId) return
    setLoading(true)
    const next = !liked
    setLiked(next) // optimistic
    const supabase = createClient()
    if (next) {
      await supabase.from('likes').insert({ user_id: viewerId, poem_id: poemId })
    } else {
      await supabase.from('likes').delete().eq('user_id', viewerId).eq('poem_id', poemId)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? 'Remove appreciation' : 'Appreciate this poem'}
      className={`inline-flex items-center transition-colors ${
        liked ? 'text-ink-text' : 'text-ink-muted/40 hover:text-ink-muted'
      }`}
    >
      <Heart filled={liked} />
    </button>
  )
}
