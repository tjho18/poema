import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getMyPoems } from '@/lib/queries'
import DeletePoemButton from '@/components/DeletePoemButton'
import NavBar from '@/components/NavBar'
import type { Poem } from '@/types/poem'

export const metadata = { title: 'Dashboard — Poema' }
export const dynamic  = 'force-dynamic'

export default async function DashboardPage() {
  const { user, profile } = await requireUser()
  const poems = await getMyPoems(user.id)

  const supabase = await createServerSupabaseClient()

  const drafts    = poems.filter(p => p.status === 'draft')
  const scheduled = poems.filter(p => p.status === 'scheduled')
  const published = poems.filter(p => p.status === 'published')

  async function deletePoem(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const sb = await createServerSupabaseClient()
    const { data: { user: me } } = await sb.auth.getUser()
    if (!me) redirect('/signin')
    await sb.from('poems').delete().eq('id', id).eq('author_id', me.id)
    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/explore')
    if (profile.username) {
      revalidatePath(`/${profile.username}`)
      revalidatePath(`/${profile.username}/poems`)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 pt-20 pb-16 sm:py-24">
      <NavBar />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-ink-text/10 pb-6">
          <div>
            <h1 className="font-display italic text-2xl text-ink-text tracking-widest">
              {profile.display_name || profile.username}
            </h1>
            <p className="font-body italic text-ink-muted text-xs mt-0.5">your dashboard</p>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href={`/${profile.username}`}
              className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors tracking-wider"
              target="_blank"
            >
              view your page ↗
            </Link>
            <Link
              href="/write"
              className="font-body text-sm text-ink-text border border-ink-text px-5 py-2 rounded hover:bg-ink-text hover:text-white transition-colors duration-200 tracking-wider"
            >
              + new poem
            </Link>
          </div>
        </div>

        {poems.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-body italic text-ink-muted text-lg mb-6">Nothing yet.</p>
            <Link href="/write" className="font-body text-sm text-ink-text underline underline-offset-4 hover:opacity-60 tracking-wider">
              Write your first poem →
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {drafts.length > 0 && (
              <Section title="Drafts" poems={drafts} profileUsername={profile.username!} deletePoem={deletePoem} showView={false} />
            )}
            {scheduled.length > 0 && (
              <Section title="Scheduled" poems={scheduled} profileUsername={profile.username!} deletePoem={deletePoem} showView={false} />
            )}
            {published.length > 0 && (
              <Section title="Published" poems={published} profileUsername={profile.username!} deletePoem={deletePoem} showView={true} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  poems: Poem[]
  profileUsername: string
  deletePoem: (formData: FormData) => Promise<void>
  showView: boolean
}

function Section({ title, poems, profileUsername, deletePoem, showView }: SectionProps) {
  return (
    <section>
      <p className="font-body italic text-ink-muted text-xs tracking-widest mb-4 uppercase">
        {title} · {poems.length}
      </p>
      <div className="divide-y divide-ink-text/10">
        {poems.map(poem => (
          <div
            key={poem.id}
            className="flex items-center justify-between py-4 hover:bg-black/[0.015] transition-colors -mx-3 px-3 rounded"
          >
            <div className="min-w-0 flex-1 mr-4">
              <p className="font-display italic font-semibold text-ink-text truncate">
                {poem.title || <span className="text-ink-muted/40 font-normal">untitled</span>}
              </p>
              <div className="flex gap-3 mt-1 flex-wrap items-baseline">
                {poem.tags.map(tag => (
                  <span key={tag} className="font-body italic text-xs text-ink-muted/70">
                    [{tag}]
                  </span>
                ))}
                <span className="font-body text-xs text-ink-muted/40">
                  {new Date(poem.updated_at ?? poem.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <Link
                href={`/write/${poem.id}`}
                className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors"
              >
                edit
              </Link>
              {showView && poem.slug && (
                <Link
                  href={`/${profileUsername}/p/${poem.slug}`}
                  className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors"
                  target="_blank"
                >
                  view
                </Link>
              )}
              <form action={deletePoem}>
                <input type="hidden" name="id" value={poem.id} />
                <DeletePoemButton title={poem.title} />
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
