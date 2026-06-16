'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  poemId: string
  parentId: string   // the note being answered
  viewerId: string   // guaranteed signed-in (page only renders when allowed)
}

const MAX = 280

// A faint "reply" affordance under a note. Only rendered by the page for the
// poet or the note's original author, so each thread stays a 1:1 exchange.
export default function NoteReply({ poemId, parentId, viewerId }: Props) {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [body, setBody]     = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    const text = body.trim()
    if (!text || saving) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .insert({ poem_id: poemId, author_id: viewerId, body: text, parent_id: parentId })
    setSaving(false)
    if (!error) {
      setBody('')
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-body italic text-[11px] text-ink-muted/40 hover:text-ink-muted tracking-wider transition-colors"
      >
        reply
      </button>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value.slice(0, MAX))}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
          if (e.key === 'Escape') { setOpen(false); setBody('') }
        }}
        rows={1}
        autoFocus
        placeholder="reply…"
        className="w-full resize-none bg-transparent font-body italic text-sm text-ink-text placeholder:text-ink-muted/35 focus:outline-none leading-relaxed"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={saving || !body.trim()}
          className="font-body italic text-[11px] text-ink-muted/60 hover:text-ink-text tracking-wider transition-colors disabled:opacity-40"
        >
          {saving ? 'sending…' : 'send'}
        </button>
        <button
          onClick={() => { setOpen(false); setBody('') }}
          className="font-body italic text-[11px] text-ink-muted/30 hover:text-ink-muted tracking-wider transition-colors"
        >
          cancel
        </button>
      </div>
    </div>
  )
}
