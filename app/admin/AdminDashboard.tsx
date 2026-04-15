'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Poem } from '@/lib/supabase'

interface AdminDashboardProps {
  poems: Poem[]
  userEmail: string
}

export default function AdminDashboard({ poems, userEmail }: AdminDashboardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('poems').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
  }

  return (
    <div className="min-h-screen px-6 py-16 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-parchment-dim/15">
        <div>
          <h1 className="font-serif text-2xl text-parchment mb-1">Dashboard</h1>
          <p className="font-sans text-xs text-parchment-dim/40 tracking-widest">{userEmail}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-sans text-xs tracking-[0.15em] uppercase text-parchment-dim/50 hover:text-parchment-muted transition-colors">
            ← Site
          </Link>
          <button
            onClick={handleSignOut}
            className="font-sans text-xs tracking-[0.15em] uppercase text-parchment-dim/50 hover:text-red-400/70 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* New poem button */}
      <div className="flex items-center justify-between mb-8">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-dim/50">
          {poems.length} poem{poems.length !== 1 ? 's' : ''}
        </p>
        <Link
          href="/admin/new"
          className="font-sans text-xs tracking-[0.2em] uppercase bg-gold/10 border border-gold/30 hover:bg-gold/20 text-gold px-5 py-2 rounded-sm transition-all duration-300"
        >
          + New poem
        </Link>
      </div>

      {/* Poem list */}
      {poems.length === 0 ? (
        <p className="text-center font-serif text-xl text-parchment-muted mt-20">
          No poems yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {poems.map(poem => (
            <div
              key={poem.id}
              className="flex items-center justify-between gap-4 border border-parchment-dim/10 rounded-sm px-5 py-4 bg-ink-soft hover:border-parchment-dim/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-serif text-parchment truncate">{poem.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-sans text-[10px] text-parchment-dim/40 tracking-wide">
                    {new Date(poem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  {poem.tags && poem.tags.length > 0 && (
                    <p className="font-sans text-[10px] text-gold-dim/60 tracking-wide">
                      {poem.tags.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/poems/${poem.id}`}
                  target="_blank"
                  className="font-sans text-[10px] tracking-[0.15em] uppercase text-parchment-dim/40 hover:text-parchment-muted transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/admin/edit/${poem.id}`}
                  className="font-sans text-[10px] tracking-[0.15em] uppercase text-gold-dim hover:text-gold transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(poem.id, poem.title)}
                  disabled={deleting === poem.id}
                  className="font-sans text-[10px] tracking-[0.15em] uppercase text-parchment-dim/40 hover:text-red-400/70 transition-colors disabled:opacity-30"
                >
                  {deleting === poem.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
