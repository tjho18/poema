'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ensureUniqueSlug } from '@/lib/slug'
import { generateTags } from '@/lib/tags'

// ── Form detection ────────────────────────────────────────────────────────────
// Rough classification from line count — good enough for browse-by-form.
function detectForm(content: string): string {
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  if (lines.length <= 2)  return 'couplet'
  if (lines.length === 3) return 'haiku'
  if (lines.length === 4) return 'quatrain'
  if (lines.length === 14) return 'sonnet'
  const stanzas = content.split(/\n\s*\n/).filter(s => s.trim().length > 0)
  if (stanzas.length > 1 && stanzas.every(s => s.split('\n').filter(l => l.trim()).length === 4))
    return 'ballad'
  return 'free verse'
}

/**
 * Create or update a poem. Returns { url, poemId } instead of calling redirect()
 * so it works both from the /write page (caller redirects) and the Write sheet
 * (caller closes sheet + router.push).
 */
export async function createPoemAction(
  formData: FormData
): Promise<{ url: string; poemId: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: '/signin', poemId: '' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const title                = (formData.get('title')   as string ?? '').trim()
  const content              =  formData.get('content') as string ?? ''
  const intent               =  formData.get('intent')  as string
  const poemId               =  formData.get('poem_id') as string | null
  const respondingToPoemId   =  formData.get('responding_to_poem_id') as string | null
  const promptId             =  formData.get('prompt_id') as string | null
  const isPublish            = intent === 'publish'

  const slug = await ensureUniqueSlug(supabase, user.id, title || 'untitled')
  const tags = isPublish ? await generateTags(title, content) : []
  const form = isPublish ? detectForm(content) : null

  let resultId = poemId ?? ''

  if (poemId) {
    // Update existing poem (edit mode)
    await supabase.from('poems').update({
      title,
      content,
      tags,
      form,
      status:       isPublish ? 'published' : 'draft',
      published_at: isPublish ? new Date().toISOString() : null,
    }).eq('id', poemId).eq('author_id', user.id)
  } else {
    // Insert new poem
    const { data: inserted } = await supabase.from('poems').insert({
      title,
      content,
      tags,
      slug,
      form,
      author_id:              user.id,
      status:                 isPublish ? 'published' : 'draft',
      published_at:           isPublish ? new Date().toISOString() : null,
      responding_to_poem_id:  respondingToPoemId || null,
      prompt_id:              promptId || null,
    }).select('id').single()

    if (inserted) resultId = inserted.id
  }

  revalidatePath('/')
  revalidatePath('/explore')
  revalidatePath('/dashboard')
  if (profile?.username) {
    revalidatePath(`/${profile.username}`)
    revalidatePath(`/${profile.username}/poems`)
    if (isPublish) revalidatePath(`/${profile.username}/p/${slug}`)
  }

  return {
    poemId: resultId,
    url: isPublish && profile?.username
      ? `/${profile.username}/p/${slug}`
      : '/dashboard',
  }
}

/**
 * Attach an audio URL to a poem after recording.
 * Only the poem's author can call this.
 */
export async function attachAudio(
  poemId: string,
  audioUrl: string
): Promise<{ ok: boolean }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const { error } = await supabase
    .from('poems')
    .update({ audio_url: audioUrl })
    .eq('id', poemId)
    .eq('author_id', user.id)

  if (error) return { ok: false }
  return { ok: true }
}
