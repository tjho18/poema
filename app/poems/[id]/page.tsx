import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPoem } from '@/lib/db'
import { poemTitle, poemAuthor, poemTags } from '@/types/poem'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'

// Reads the database at request time, so `next build` never needs a connection.
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const poem = await getPoem(id)
  if (!poem) return { title: 'Poem not found — Poema' }

  const title = poemTitle(poem)
  const author = poemAuthor(poem)
  const firstLine = poem.content.split('\n').find(line => line.trim()) ?? ''

  // The card a shared link unfurls into, which is the whole point of this page:
  // a poem shared out of the app should arrive looking like a poem.
  return {
    title: `${title} — ${author} — Poema`,
    description: firstLine,
    openGraph: {
      title: `${title} — ${author}`,
      description: firstLine,
      type: 'article',
    },
    twitter: { card: 'summary', title, description: firstLine },
  }
}

export default async function PoemPage({ params }: Props) {
  const { id } = await params
  const poem = await getPoem(id)
  if (!poem) notFound()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="w-full max-w-lg mx-auto">
        <PoemDisplay
          title={poemTitle(poem)}
          content={poem.content}
          tags={poemTags(poem)}
          animate={false}
          showTags={true}
        />

        {/* The poem is by somebody. A single-author site never had to say so; a
            library of many poets does. */}
        <p className="mt-10 text-center font-body italic text-sm text-ink-muted">
          — {poemAuthor(poem).toLowerCase()}
        </p>

        <div className="flex justify-center gap-8 mt-16">
          <Link
            href="/explore"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← all poems
          </Link>
          <Link
            href="/"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            surprise me →
          </Link>
        </div>
      </div>
    </div>
  )
}
