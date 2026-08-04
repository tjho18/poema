import Link from 'next/link'
import { getPoems, getPoemsByTag, getAllTags } from '@/lib/db'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'
import type { Poem } from '@/types/poem'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tag?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const { tag } = await searchParams
  const activeTag = tag ?? ''
  // Newest first, from the same database the app publishes into.
  const poems: Poem[] = activeTag ? await getPoemsByTag(activeTag) : await getPoems()
  // The full set regardless of the current filter, so the chips don't vanish.
  const allTags = await getAllTags()

  return (
    <div className="min-h-screen px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            Poems
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
            {activeTag && ` tagged "${activeTag}"`}
          </p>
        </div>

        {/* Tag filter — URL-based, italic brackets style matching TagFilter component */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-12" role="group" aria-label="Filter by mood">
            <Link
              href="/explore"
              className={[
                'font-body text-sm transition-all duration-200',
                !activeTag
                  ? 'font-bold not-italic text-ink-text border-b border-ink-text pb-px'
                  : 'italic text-ink-muted hover:text-ink-text',
              ].join(' ')}
            >
              [all]
            </Link>
            {allTags.map(tag => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className={[
                  'font-body text-sm transition-all duration-200',
                  activeTag === tag
                    ? 'font-bold not-italic text-ink-text border-b border-ink-text pb-px'
                    : 'italic text-ink-muted hover:text-ink-text',
                ].join(' ')}
              >
                [{tag}]
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">
            {activeTag ? `No poems tagged "${activeTag}" yet.` : 'No poems yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {poems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
