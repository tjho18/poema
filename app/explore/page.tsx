import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

export const dynamic = 'force-dynamic'

// Stable daily index — same poem all day, different every day.
// Uses the date string as a simple seed so it never needs a DB column.
function dailyIndex(total: number): number {
  const seed = new Date().toDateString() // e.g. "Fri Apr 24 2026"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % total
}

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })

  const all: PublicPoem[] = error ? [] : (data ?? []) as PublicPoem[]

  // Pick poem of the day, then shuffle the rest
  const potd = all.length > 0 ? all[dailyIndex(all.length)] : null
  const rest = all
    .filter(p => p.id !== potd?.id)
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
          <p className="font-body italic text-ink-muted/60 text-sm">
            {all.length} {all.length === 1 ? 'voice' : 'voices'}
          </p>
        </div>

        {all.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">No poems yet.</p>
        ) : (
          <>
            {/* Poem of the day */}
            {potd && (
              <div className="mb-16">
                <p className="font-body italic text-xs text-ink-muted/50 tracking-widest text-center mb-6 uppercase">
                  poem of the day
                </p>
                <Link
                  href={`/${potd.author_username}/p/${potd.slug}`}
                  className="group block text-center px-6 py-10 rounded-sm border border-ink-text/8 hover:border-ink-text/20 transition-colors duration-300"
                >
                  {potd.title && (
                    <h2 className="font-display italic font-semibold text-2xl text-ink-text mb-6 tracking-wide group-hover:opacity-70 transition-opacity">
                      {potd.title}
                    </h2>
                  )}
                  <div className="font-body text-ink-text text-base leading-loose whitespace-pre-line mb-6 line-clamp-6">
                    {potd.content}
                  </div>
                  <p className="font-body italic text-sm text-ink-muted tracking-wider">
                    — {potd.author_display_name || potd.author_username}
                  </p>
                </Link>
              </div>
            )}

            {/* Divider */}
            {rest.length > 0 && (
              <div className="flex items-center gap-4 mb-10 text-ink-muted/30 text-xs italic tracking-widest">
                <span className="flex-1 h-px bg-ink-text/8" />
                more poems
                <span className="flex-1 h-px bg-ink-text/8" />
              </div>
            )}

            {/* Randomised rest */}
            <div className="divide-y divide-ink-text/10">
              {rest.map(poem => (
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
          </>
        )}
      </div>
    </div>
  )
}
