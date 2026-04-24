import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })

  const poems: PublicPoem[] = error ? [] : ((data ?? []) as PublicPoem[])
    .map(p => ({ p, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ p }) => p)

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-20 pb-16 sm:py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            Explore
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
          </p>
        </div>


        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">No poems yet.</p>
        ) : (
          <div className="divide-y divide-ink-text/10">
            {poems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={poem}
                byline={{
                  username:    poem.author_username,
                  displayName: poem.author_display_name,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
