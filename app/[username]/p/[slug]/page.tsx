import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getPoetByUsername,
  getPoemByAuthorAndSlug,
  getRespondingTo,
  getResponses,
  getComments,
  getLikeCount,
  getViewerLiked,
} from '@/lib/queries'
import { getCurrentProfile } from '@/lib/auth'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import AudioPlayer from '@/components/AudioPlayer'
import RespondButton from '@/components/RespondButton'
import LikeButton from '@/components/LikeButton'
import CommentComposer from '@/components/CommentComposer'
import DeleteNoteButton from '@/components/DeleteNoteButton'
import NoteReply from '@/components/NoteReply'
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

  const { user } = await getCurrentProfile()
  const viewerId = user?.id ?? null
  const viewerIsAuthor = viewerId === poet.id

  const [respondingTo, responses, comments, likeData] = await Promise.all([
    poem.responding_to_poem_id ? getRespondingTo(poem.responding_to_poem_id) : null,
    getResponses(poem.id),
    getComments(poem.id),
    viewerIsAuthor
      ? getLikeCount(poem.id).then(count => ({ count }))
      : viewerId
        ? getViewerLiked(poem.id, viewerId).then(liked => ({ liked }))
        : Promise.resolve({ liked: false }),
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
          {'count' in likeData ? (
            <LikeButton poemId={poem.id} count={likeData.count} />
          ) : (
            <LikeButton poemId={poem.id} viewerId={viewerId} initialLiked={likeData.liked} />
          )}
          <ShareButton title={poem.title || poem.content.split('\n').find(l => l.trim()) || 'a poem'} poet={displayName ?? poet.username ?? ''} />
          <Link
            href={`/${poet.username}`}
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            surprise me →
          </Link>
        </div>

        {/* Margin notes — short reader reactions, distinct from poem responses */}
        <div className="mt-16 max-w-sm mx-auto">
          {comments.length > 0 && (
            <>
              <p
                className="text-center font-body italic mb-8"
                style={{ fontSize: '11px', color: 'rgba(27,26,46,0.30)', letterSpacing: '0.06em' }}
              >
                notes
              </p>
              <div className="flex flex-col gap-8 mb-10">
                {comments.map(note => {
                  const noteCanDelete = viewerIsAuthor || note.author_id === viewerId
                  const canReply = !!viewerId && (viewerIsAuthor || note.author_id === viewerId)
                  return (
                    <div key={note.id} className="border-l border-ink-text/10 pl-4">
                      {/* The note */}
                      <p className="font-body italic text-sm text-ink-text/75 leading-relaxed whitespace-pre-line">
                        {note.body}
                      </p>
                      <p className="font-body italic text-[11px] text-ink-muted/40 tracking-wider mt-1.5">
                        —{' '}
                        <Link
                          href={`/${note.author_username}`}
                          className="hover:text-ink-muted transition-colors"
                        >
                          {(note.author_display_name || note.author_username).toLowerCase()}
                        </Link>
                        {noteCanDelete && <DeleteNoteButton commentId={note.id} />}
                      </p>

                      {/* Replies — poet ⇄ reader thread (poet shown in terracotta) */}
                      {note.replies.length > 0 && (
                        <div className="mt-4 ml-3 pl-4 border-l border-ink-text/[0.07] flex flex-col gap-4">
                          {note.replies.map(r => {
                            const rCanDelete = viewerIsAuthor || r.author_id === viewerId
                            const isPoet = r.author_id === poet.id
                            return (
                              <div key={r.id}>
                                <p className="font-body italic text-sm text-ink-text/70 leading-relaxed whitespace-pre-line">
                                  {r.body}
                                </p>
                                <p
                                  className="font-body italic text-[11px] tracking-wider mt-1.5"
                                  style={{ color: isPoet ? '#B97A55' : 'rgba(27,26,46,0.40)' }}
                                >
                                  —{' '}
                                  <Link href={`/${r.author_username}`} className="hover:opacity-70 transition-opacity">
                                    {(r.author_display_name || r.author_username).toLowerCase()}
                                  </Link>
                                  {rCanDelete && <DeleteNoteButton commentId={r.id} />}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Reply affordance — only poet or the note's author */}
                      {canReply && (
                        <div className="mt-3 ml-3 pl-4">
                          <NoteReply poemId={poem.id} parentId={note.id} viewerId={viewerId!} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
          <CommentComposer poemId={poem.id} viewerId={viewerId} />
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
