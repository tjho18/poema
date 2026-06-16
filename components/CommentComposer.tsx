'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Props {
  poemId: string
  viewerId: string | null   // null = signed out
}

const MAX = 280

// A single quiet line that grows into a small note field.
// Matches the typographic, low-chrome grammar of the rest of the site.
export default function CommentComposer({ poemId, viewerId }: Props) {
  const router = useRouter()
  const [body, setBody]       = useState('')
  const [saving, setSaving]   = useState(false)

  if (viewerId === null) {
    return (
      <p className="text-center font-body italic text-xs text-ink-muted/40 tracking-wider">
        <Link href="/signin" className="hover:text-ink-muted transition-colors underline-offset-4 hover:underline">
          sign in
        </Link>{' '}
        to leave a note
      </p>
    )
  }

  async function submit() {
    const text = body.trim()
    if (!text || saving) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .insert({ poem_id: poemId, author_id: viewerId, body: text })
    setSaving(false)
    if (!error) {
      setBody('')
      router.refresh() // re-render server list with the new note
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value.slice(0, MAX))}
        onKeyDown={e => {
          // Enter submits; Shift+Enter makes a new line
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        rows={1}
        placeholder="leave a note…"
        className="w-full max-w-sm resize-none bg-transparent text-center font-body italic text-sm text-ink-text placeholder:text-ink-muted/35 focus:outline-none leading-relaxed"
      />
      {body.trim() && (
        <button
          onClick={submit}
          disabled={saving}
          className="font-body italic text-xs text-ink-muted/60 hover:text-ink-text tracking-widest transition-colors disabled:opacity-40"
        >
          {saving ? 'leaving…' : 'leave note'}
        </button>
      )}
    </div>
  )
}
