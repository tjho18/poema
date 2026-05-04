'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ensureUniqueSlug } from '@/lib/slug'
import { generateTags } from '@/lib/tags'

/**
 * Creates or drafts a poem. Returns a redirect URL instead of calling redirect()
 * so it can be used both from the /write page (caller redirects) and from the
 * Write sheet modal (caller closes sheet + router.push).
 */
export async function createPoemAction(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: '/signin' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const title    = (formData.get('title')   as string ?? '').trim()
  const content  =  formData.get('content') as string ?? ''
  const intent   =  formData.get('intent')  as string
  const poemId   =  formData.get('poem_id') as string | null
  const isPublish = intent === 'publish'

  const slug = await ensureUniqueSlug(supabase, user.id, title || 'untitled')
  const tags = isPublish ? await generateTags(title, content) : []

  if (poemId) {
    // Update existing poem (edit mode)
    await supabase.from('poems').update({
      title,
      content,
      tags,
      status:       isPublish ? 'published' : 'draft',
      published_at: isPublish ? new Date().toISOString() : null,
    }).eq('id', poemId).eq('author_id', user.id)
  } else {
    // Insert new poem
    await supabase.from('poems').insert({
      title,
      content,
      tags,
      slug,
      author_id:    user.id,
      status:       isPublish ? 'published' : 'draft',
      published_at: isPublish ? new Date().toISOString() : null,
    })
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
    url: isPublish && profile?.username
      ? `/${profile.username}/p/${slug}`
      : '/dashboard',
  }
}
