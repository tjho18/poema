'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import FollowButton from '@/components/FollowButton'
import type { Poem } from '@/types/poem'

interface Props {
  poems: Poem[]
  username: string
  displayName: string
  bio: string | null
  poetId: string
  viewerIsOwner: boolean
  initialFollowing: boolean
}

function pickRandom(poems: Poem[], excludeId?: string): Poem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function PoetHomeClient({
  poems,
  username,
  displayName,
  bio,
  poetId,
  viewerIsOwner,
  initialFollowing,
}: Props) {
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const cyclePoem = useCallback(() => {
    const next = pickRandom(poems, currentPoem?.id)
    if (next) setCurrentPoem(next)
  }, [poems, currentPoem?.id])

  useEffect(() => {
    setCurrentPoem(pickRandom(poems))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      cyclePoem()
    }
  }

  if (poems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-display italic text-3xl text-ink-text mb-3 tracking-wide">{displayName}</h1>
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <section
      className="min-h-[80vh] flex flex-col items-center justify-center w-full pt-24 pb-12"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        {currentPoem ? (
          <div className="flex flex-col items-center">
            <PoemDisplay
              title={currentPoem.title}
              content={currentPoem.content}
              tags={currentPoem.tags}
              animate={true}
            />

            {/* Signature + inline follow */}
            <div className="mt-10 flex items-baseline gap-3">
              <p className="font-body italic text-sm text-ink-muted tracking-wider">
                — {displayName}
              </p>
              {!viewerIsOwner && (
                <FollowButton
                  poetId={poetId}
                  initialFollowing={initialFollowing}
                  followerCount={0}
                />
              )}
            </div>

            {/* Bio — only shown if the poet has written one */}
            {bio && (
              <p className="mt-3 font-body italic text-xs text-ink-muted/60 text-center max-w-xs leading-relaxed">
                {bio}
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-5 mt-16">
        <button
          onClick={cyclePoem}
          className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          another poem
        </button>

        {currentPoem?.slug && (
          <ShareButton
            title={currentPoem.title}
            poet={displayName}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/p/${currentPoem.slug}`}
            className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
          />
        )}

        <Link
          href={`/${username}/poems`}
          className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          all poems →
        </Link>
      </div>
    </section>
  )
}
