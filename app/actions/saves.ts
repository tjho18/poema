'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function savePoem(poemId: string): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { saved: false, error: 'not-signed-in' }

  // Idempotent: if already saved, do nothing and report success
  const { error } = await supabase
    .from('saves')
    .upsert(
      { reader_id: user.id, poem_id: poemId },
      { onConflict: 'reader_id,poem_id', ignoreDuplicates: true },
    )

  if (error) return { saved: false, error: error.message }
  return { saved: true }
}
