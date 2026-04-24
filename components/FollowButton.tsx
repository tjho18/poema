'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type DisplayState = 'follow' | 'followed' | 'following'

interface Props {
  poetId: string
  initialFollowing: boolean
  followerCount: number
}

export default function FollowButton({ poetId, initialFollowing }: Props) {
  const [display, setDisplay]   = useState<DisplayState>(initialFollowing ? 'following' : 'follow')
  const [loading, setLoading]   = useState(false)
  const [userId, setUserId]     = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const me = data.user?.id ?? null
      setUserId(me)
      if (!me) return
      supabase
        .from('follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('follower_id', me)
        .eq('followee_id', poetId)
        .then(({ count: c }) => {
          setDisplay((c ?? 0) > 0 ? 'following' : 'follow')
        })
    })
  }, [poetId])

  // Still resolving auth
  if (userId === undefined) return null

  // Not logged in — quiet link to sign in
  if (userId === null) {
    return (
      <Link
        href="/signin"
        className="font-body italic text-sm text-ink-muted/60 hover:text-ink-text transition-colors tracking-widest"
      >
        + follow
      </Link>
    )
  }

  // Own page — parent guards this but double-check
  if (userId === poetId) return null

  async function toggle() {
    if (loading || !userId) return
    setLoading(true)
    const supabase = createClient()
    const isFollowing = display === 'following'

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('followee_id', poetId)
      setDisplay('follow')
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: userId, followee_id: poetId })
      // Brief "followed ✓" flash before settling on "following"
      setDisplay('followed')
      setTimeout(() => setDisplay('following'), 1200)
    }
    setLoading(false)
  }

  const label =
    display === 'following' ? 'following'
    : display === 'followed' ? 'followed ✓'
    : '+ follow'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`font-body italic text-xs tracking-widest transition-colors duration-200 ${
        display === 'follow'
          ? 'text-ink-muted/40 hover:text-ink-muted'
          : 'text-ink-muted/50'
      }`}
    >
      {label}
    </button>
  )
}
