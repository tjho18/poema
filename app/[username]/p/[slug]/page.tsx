import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPoetByUsername, getPoemByAuthorAndSlug } from '@/lib/queries'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  const poet = await getPoetByUsername(username)
  if (!poet) return { title: 'Not found — Poema' }
  const poem = await getPoemByAuthorAndSlug(poet.id, slug)
  if (!poem) return { title: 'Not found — Poema' }
  const firstLine = poem.content.split('\n').find(l => l.trim()) ?? ''
  const displayTitle = poem.title || firstLine || 'untitled'
  const poetName = poet.display_name || poet.username
  return {
    title: `${displayTitle} — ${poetName}`,
    description: firstLine,
    openGraph: {
      title: displayTitle,
      description: firstLine,
      type: 'article',
    },
  }
}

export default async function PoemDetailPage({ params }: Props) {
  const { username, slug } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) notFound()
  if (username !== poet.username) redirect(`/${poet.username}/p/${slug}`)

  const poem = await getPoemByAuthorAndSlug(poet.id, slug)
  if (!poem) notFound()

  const displayName = poet.display_name || poet.username

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="w-full max-w-lg mx-auto">
        <PoemDisplay
          title={poem.title}
          content={poem.content}
          tags={poem.tags}
          animate={false}
          showTags={false}
        />

        <p className="text-center mt-8 font-body italic text-sm text-ink-muted tracking-wider">
          — <Link href={`/${poet.username}`} className="hover:text-ink-text transition-colors">{displayName}</Link>
        </p>

        <div className="flex justify-center gap-8 mt-16">
          <Link
            href={`/${poet.username}/poems`}
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← all poems
          </Link>
          <ShareButton title={poem.title || poem.content.split('\n').find(l => l.trim()) || 'a poem'} poet={displayName ?? poet.username ?? ''} />
          <Link
            href={`/${poet.username}`}
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            surprise me →
          </Link>
        </div>
      </div>
    </div>
  )
}
