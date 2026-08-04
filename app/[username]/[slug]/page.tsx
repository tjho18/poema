import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPoemBySlug } from '@/lib/db'
import { poemTitle, poemAuthor, poemTags } from '@/types/poem'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'

/**
 * `poema.app/{username}/{slug}` — the canonical public poem page.
 *
 * This is the URL the iOS app already builds when it shares a poem
 * (`PoemWebConfig.poemURL`), so it is the route that has to exist before
 * `servesPoemPages` can be flipped to true. `/poems/[id]` stays as a permalink
 * for links that carry an id instead.
 *
 * Two dynamic segments this shallow will catch any two-part path, but Next
 * matches literal segments first, so /explore, /admin/... and /collections/...
 * are unaffected.
 */
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  const poem = await getPoemBySlug(username, slug)
  if (!poem) return { title: 'Poem not found — Poema' }

  const title = poemTitle(poem)
  const author = poemAuthor(poem)
  const firstLine = poem.content.split('\n').find(line => line.trim()) ?? ''

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

export default async function PoemBySlugPage({ params }: Props) {
  const { username, slug } = await params
  const poem = await getPoemBySlug(username, slug)
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
