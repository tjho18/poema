'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poems: PublicPoem[]
}

function pickRandom(poems: PublicPoem[], excludeId?: string): PublicPoem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function HomeHeroClient({ poems }: Props) {
  const [currentPoem, setCurrentPoem] = useState<PublicPoem | null>(null)
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
    // Only fire if horizontal swipe clearly dominates and is long enough
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      cyclePoem()
    }
  }

  if (poems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <section
      className="min-h-[90vh] flex flex-col items-center w-full pt-24 pb-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Poem — takes all available vertical space, centred within it */}
      <div className="flex-1 flex items-center justify-center w-full">
        {currentPoem ? (
          <PoemDisplay
            title={currentPoem.title}
            content={currentPoem.content}
            tags={currentPoem.tags}
            animate={true}
          />
        ) : null}
      </div>

      {/* Bottom strip — author + mobile actions, always in normal flow */}
      {currentPoem && (
        <div className="flex flex-col items-center mt-10 gap-5">
          {/* Author byline */}
          <p className="font-body italic text-sm text-ink-muted tracking-wider">
            —{' '}
            <Link
              href={`/${currentPoem.author_username}`}
              className="hover:text-ink-text transition-colors"
            >
              {currentPoem.author_display_name || currentPoem.author_username}
            </Link>
          </p>

          {/* Desktop-only: text actions in a row */}
          <div className="hidden sm:flex items-center gap-2 text-ink-muted/50">
            <button
              onClick={cyclePoem}
              className="font-body italic text-sm hover:text-ink-muted transition-colors tracking-wider"
            >
              surprise me
            </button>
            {currentPoem.slug && (
              <>
                <span className="text-ink-muted/25 select-none">·</span>
                <ShareButton
                  title={currentPoem.title}
                  poet={currentPoem.author_display_name || currentPoem.author_username}
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${currentPoem.author_username}/p/${currentPoem.slug}`}
                  className="font-body italic text-sm hover:text-ink-muted transition-colors tracking-wider"
                />
              </>
            )}
          </div>

          {/* Mobile-only: share icon + scroll hint */}
          <div className="sm:hidden flex flex-col items-center gap-4">
            {currentPoem.slug && (
              <ShareButton
                title={currentPoem.title}
                poet={currentPoem.author_display_name || currentPoem.author_username}
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${currentPoem.author_username}/p/${currentPoem.slug}`}
                username={currentPoem.author_username}
                slug={currentPoem.slug}
                className="text-ink-muted/30 hover:text-ink-muted/60 transition-colors"
                iconOnly
              />
            )}
            <div className="animate-bounce text-ink-muted/20 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
