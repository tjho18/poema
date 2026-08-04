import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCollection, getPoemsByIds } from '@/lib/db'
import { poemTitle, poemAuthor } from '@/types/poem'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

function collectionName(name: string): string {
  return name.trim() === '' ? 'untitled collection' : name
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const collection = await getCollection(id)
  if (!collection) return { title: 'Collection not found — Poema' }

  const name = collectionName(collection.name)
  const count = collection.poemIds.length
  const description = `${count === 1 ? '1 poem' : `${count} poems`}, gathered on Poema`

  return {
    title: `${name} — Poema`,
    description,
    openGraph: { title: name, description, type: 'article' },
    // Unlisted, not secret — but it should not turn up in a search result for
    // someone who was never sent the link.
    robots: { index: false, follow: false },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { id } = await params
  const collection = await getCollection(id)
  if (!collection) notFound()

  // In the reader's own order — see getPoemsByIds.
  const poems = await getPoemsByIds(collection.poemIds)

  return (
    <div className="min-h-screen px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            {collectionName(collection.name)}
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}, gathered on Poema
          </p>
        </div>

        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-20">
            {/* A collection can outlive its poems: one may have been unpublished
                or deleted since it was gathered. */}
            Nothing in this collection is published any more.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {poems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-8 mt-16">
          <Link
            href="/explore"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← all poems
          </Link>
        </div>
      </div>
    </div>
  )
}
