'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Update the signed-in user's own bio. Used by the inline editor on the
// poet page so a poet can add/edit their bio without leaving their profile.
export async function updateBio(
  bio: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const trimmed = bio.trim().slice(0, 300)

  const { error } = await supabase
    .from('profiles')
    .update({ bio: trimmed || null })
    .eq('id', user.id)
  if (error) return { error: error.message }

  // Refresh the poet's public page so the new bio shows for everyone.
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle<{ username: string | null }>()
  if (profile?.username) revalidatePath(`/${profile.username}`)

  return { ok: true }
}
