import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPoetByUsername, getPoemByAuthorAndSlug, getRespondingTo, getResponses } from '@/lib/queries'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import AudioPlayer from '@/components/AudioPlayer'
import RespondButton from '@/components/RespondButton'
import type { RespondingTo } from '@/contexts/WriteSheetContext'

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

  const [respondingTo, responses] = await Promise.all([
    poem.responding_to_poem_id ? getRespondingTo(poem.responding_to_poem_id) : null,
    getResponses(poem.id),
  ])

  const displayName = poet.display_name || poet.username

  // Build a RespondingTo ref for the respond button
  const poemRef: RespondingTo = {
    id:                poem.id,
    title:             poem.title,
    slug:              poem.slug,
    authorUsername:    poet.username,
    authorDisplayName: poet.display_name ?? null,
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="w-full max-w-lg mx-auto">

        {/* "In response to" attribution */}
        {respondingTo && (
          <p
            className="text-center mb-8 font-body italic"
            style={{ fontSize: '12px', color: 'rgba(27,26,46,0.38)', letterSpacing: '0.01em' }}
          >
            in response to{' '}
            <Link
              href={`/${respondingTo.author_username}/p/${respondingTo.slug}`}
              className="transition-colors"
              style={{ color: '#B97A55' }}
            >
              {respondingTo.title || 'untitled'}
            </Link>
            {' '}by {(respondingTo.author_display_name || respondingTo.author_username).toLowerCase()}
          </p>
        )}

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

        {/* Audio player */}
        {poem.audio_url && (
          <div className="flex justify-center mt-8">
            <AudioPlayer src={poem.audio_url} />
          </div>
        )}

        {/* Action row */}
        <div className="flex justify-center gap-8 mt-10 items-center flex-wrap">
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

        {/* Respond button */}
        <div className="flex justify-center mt-8">
          <RespondButton poem={poemRef} />
        </div>

        {/* Responses */}
        {responses.length > 0 && (
          <div className="mt-16">
            <p
              className="text-center font-body italic mb-8"
              style={{ fontSize: '11px', color: 'rgba(27,26,46,0.30)', letterSpacing: '0.06em' }}
            >
              responses
            </p>
            <div className="flex flex-col gap-10">
              {responses.map(r => (
                <div key={r.id} className="text-center">
                  <Link href={`/${r.author_username}/p/${r.slug}`}>
                    <p
                      className="font-body italic mb-1 hover:text-ink-text transition-colors"
                      style={{ fontSize: '15px', color: 'rgba(27,26,46,0.75)' }}
                    >
                      {r.title || r.content.split('\n').find((l: string) => l.trim()) || 'untitled'}
                    </p>
                    <p
                      className="font-body italic"
                      style={{ fontSize: '11px', color: 'rgba(27,26,46,0.35)', letterSpacing: '0.01em' }}
                    >
                      — {(r.author_display_name || r.author_username).toLowerCase()}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
