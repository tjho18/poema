import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminLoginForm from '@/components/AdminLoginForm'
import DeletePoemButton from '@/components/DeletePoemButton'
import type { Poem } from '@/types/poem'
import { poemTitle, poemTags } from '@/types/poem'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return <AdminLoginForm />
  }

  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  const poems: Poem[] = error ? [] : (data ?? [])

  async function signOut() {
    'use server'
    const sb = await createServerSupabaseClient()
    await sb.auth.signOut()
    revalidatePath('/admin')
    redirect('/admin')
  }

  async function deletePoem(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const sb = await createServerSupabaseClient()
    await sb.from('poems').delete().eq('id', id)
    revalidatePath('/admin')
    revalidatePath('/explore')
    revalidatePath('/')
  }

  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Masthead header */}
        <div className="flex items-center justify-between mb-12 border-b border-ink-text/10 pb-6">
          <div>
            <Link href="/" className="font-display italic text-2xl text-ink-text tracking-widest">
              Poema
            </Link>
            <p className="font-body italic text-ink-muted text-xs mt-0.5">admin dashboard</p>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/admin/new"
              className="font-body text-sm text-ink-text border border-ink-text px-5 py-2 rounded hover:bg-ink-text hover:text-white transition-colors duration-200 tracking-wider"
            >
              + new poem
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors tracking-wider"
              >
                sign out
              </button>
            </form>
          </div>
        </div>

        {/* Poem list */}
        {poems.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-body italic text-ink-muted text-lg mb-6">No poems yet.</p>
            <Link href="/admin/new" className="font-body text-sm text-ink-text underline underline-offset-4 hover:opacity-60 tracking-wider">
              Write the first one →
            </Link>
          </div>
        ) : (
          <div>
            <p className="font-body italic text-ink-muted text-xs tracking-widest mb-6 uppercase">
              {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
            </p>
            <div className="divide-y divide-ink-text/10">
              {poems.map(poem => (
                <div
                  key={poem.id}
                  className="flex items-center justify-between py-4 hover:bg-black/[0.015] transition-colors -mx-3 px-3 rounded"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="font-display italic font-semibold text-ink-text truncate">
                      {poemTitle(poem)}
                    </p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {poemTags(poem).map((tag: string) => (
                        <span key={tag} className="font-body italic text-xs text-ink-muted/70">
                          [{tag}]
                        </span>
                      ))}
                      <span className="font-body text-xs text-ink-muted/40">
                        {new Date(poem.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <Link
                      href={`/admin/edit/${poem.id}`}
                      className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors"
                    >
                      edit
                    </Link>
                    <Link
                      href={`/poems/${poem.id}`}
                      className="font-body text-sm text-ink-muted hover:text-ink-text transition-colors"
                      target="_blank"
                    >
                      view
                    </Link>
                    <form action={deletePoem}>
                      <input type="hidden" name="id" value={poem.id} />
                      <DeletePoemButton title={poemTitle(poem)} />
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
