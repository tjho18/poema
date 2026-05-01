import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/auth'
import { ensureUniqueSlug } from '@/lib/slug'
import { generateTags } from '@/lib/tags'
import WriteEditor from '@/components/WriteEditor'

export const metadata = { title: 'Write — Poema' }
export const dynamic  = 'force-dynamic'

export default async function WritePage() {
  const { user, profile } = await requireUser()

  async function createPoem(formData: FormData) {
    'use server'
    const supabase = await createServerSupabaseClient()
    const { data: { user: me } } = await supabase.auth.getUser()
    if (!me) redirect('/signin')

    const title   = (formData.get('title') as string ?? '').trim()
    const content = (formData.get('content') as string ?? '')
    const intent  = formData.get('intent') as string

    const slug = await ensureUniqueSlug(supabase, me.id, title || 'untitled')
    const isPublish = intent === 'publish'

    const tags = isPublish ? await generateTags(title, content) : []

    const { data: inserted } = await supabase.from('poems').insert({
      title,
      content,
      tags,
      slug,
      author_id: me.id,
      status: isPublish ? 'published' : 'draft',
      published_at: isPublish ? new Date().toISOString() : null,
    }).select('id').single()

    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/dashboard')
    if (profile.username) {
      revalidatePath(`/${profile.username}`)
      revalidatePath(`/${profile.username}/poems`)
      if (isPublish) revalidatePath(`/${profile.username}/p/${slug}`)
    }

    redirect(isPublish && profile.username
      ? `/${profile.username}/p/${slug}`
      : '/dashboard')
  }

  return <WriteEditor action={createPoem} />
}
