'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Poem } from '@/lib/supabase'

interface PoemFormProps {
  poem?: Poem
}

export default function PoemForm({ poem }: PoemFormProps) {
  const router = useRouter()
  const isEdit = !!poem

  const [title, setTitle] = useState(poem?.title ?? '')
  const [content, setContent] = useState(poem?.content ?? '')
  const [tagInput, setTagInput] = useState(poem?.tags?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const parseTags = (raw: string) =>
    raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const tags = parseTags(tagInput)
    const payload = { title: title.trim(), content: content.trim(), tags }

    const { error } = isEdit
      ? await supabase.from('poems').update(payload).eq('id', poem!.id)
      : await supabase.from('poems').insert(payload)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const liveTags = parseTags(tagInput)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Title */}
      <div>
        <label className="block font-sans text-[10px] tracking-[0.25em] uppercase text-parchment-dim/50 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Poem title"
          className="w-full bg-ink-muted border border-parchment-dim/20 rounded-sm px-4 py-3 text-parchment font-serif text-lg focus:outline-none focus:border-gold/40 placeholder:text-parchment-dim/25 transition-colors"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block font-sans text-[10px] tracking-[0.25em] uppercase text-parchment-dim/50 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          rows={16}
          placeholder="Write your poem here…"
          className="w-full bg-ink-muted border border-parchment-dim/20 rounded-sm px-4 py-3 text-parchment font-body text-base leading-relaxed focus:outline-none focus:border-gold/40 placeholder:text-parchment-dim/25 transition-colors resize-y"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block font-sans text-[10px] tracking-[0.25em] uppercase text-parchment-dim/50 mb-2">
          Tags <span className="normal-case tracking-normal text-parchment-dim/30">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          placeholder="loneliness, love, existential"
          className="w-full bg-ink-muted border border-parchment-dim/20 rounded-sm px-4 py-3 text-parchment font-sans text-sm focus:outline-none focus:border-gold/40 placeholder:text-parchment-dim/25 transition-colors"
        />
        {/* Live tag preview */}
        {liveTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {liveTags.map(tag => (
              <span
                key={tag}
                className="text-[10px] tracking-[0.15em] uppercase font-sans text-gold-dim border border-gold-dim/30 px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400/80 font-sans text-xs">{error}</p>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gold/10 border border-gold/30 hover:bg-gold/20 hover:border-gold/50 text-gold font-sans text-xs tracking-[0.2em] uppercase py-3 rounded-sm transition-all duration-300 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish poem'}
        </button>
        <a
          href="/admin"
          className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-dim/40 hover:text-parchment-muted border border-parchment-dim/15 px-6 py-3 rounded-sm transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
