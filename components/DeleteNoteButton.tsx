'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  commentId: string
}

// A faint × shown only to people allowed to remove a note (its author or
// the poem's author). RLS is the real guard; this is just the affordance.
export default function DeleteNoteButton({ commentId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (busy) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    setBusy(false)
    if (!error) router.refresh()
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label="Remove note"
      className="ml-2 text-ink-muted/25 hover:text-ink-muted/70 transition-colors text-xs leading-none align-middle"
    >
      ×
    </button>
  )
}
