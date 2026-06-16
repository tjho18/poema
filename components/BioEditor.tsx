'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBio } from '@/lib/profileActions'

interface Props {
  bio: string | null
  canEdit: boolean   // true only for the poet viewing their own page
}

const MAX = 300

// Bio block on the poet page. Read-only for visitors; for the owner it turns
// into an inline editor so they can add or change their bio in place.
export default function BioEditor({ bio, canEdit }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState<string | null>(bio)
  const [value, setValue]     = useState(bio ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)

  // ── Visitor view: just the bio (or nothing) ──
  if (!canEdit) {
    if (!current) return null
    return (
      <p className="mt-4 font-body italic text-sm text-ink-muted/70 text-center max-w-sm leading-relaxed whitespace-pre-line">
        {current}
      </p>
    )
  }

  async function save() {
    if (saving) return
    setSaving(true)
    const res = await updateBio(value)
    setSaving(false)
    if ('ok' in res) {
      setCurrent(value.trim() || null)
      setEditing(false)
      router.refresh()
    }
  }

  // ── Owner, editing ──
  if (editing) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-sm">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value.slice(0, MAX))}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
            if (e.key === 'Escape') { setValue(current ?? ''); setEditing(false) }
          }}
          rows={3}
          autoFocus
          placeholder="a poet who…"
          className="w-full resize-none bg-transparent text-center font-body italic text-sm text-ink-text placeholder:text-ink-muted/35 focus:outline-none leading-relaxed border-b border-ink-text/15 pb-2"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="font-body italic text-xs text-ink-muted/70 hover:text-ink-text tracking-widest transition-colors disabled:opacity-40"
          >
            {saving ? 'saving…' : 'save'}
          </button>
          <button
            onClick={() => { setValue(current ?? ''); setEditing(false) }}
            className="font-body italic text-xs text-ink-muted/40 hover:text-ink-muted tracking-widest transition-colors"
          >
            cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Owner, has a bio: show it with a quiet "edit" ──
  if (current) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group mt-4 max-w-sm flex flex-col items-center"
      >
        <span className="font-body italic text-sm text-ink-muted/70 text-center leading-relaxed whitespace-pre-line">
          {current}
        </span>
        <span className="mt-1 font-body italic text-[11px] text-ink-muted/30 group-hover:text-ink-muted/60 tracking-widest transition-colors">
          edit
        </span>
      </button>
    )
  }

  // ── Owner, no bio yet: invite them to add one ──
  return (
    <button
      onClick={() => setEditing(true)}
      className="mt-4 font-body italic text-xs text-ink-muted/40 hover:text-ink-muted tracking-widest transition-colors"
    >
      ＋ add a bio
    </button>
  )
}
