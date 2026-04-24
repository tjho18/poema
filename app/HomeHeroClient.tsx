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
      className="min-h-[90vh] flex flex-col items-center justify-center w-full pt-24 pb-8 relative"
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
            <p className="mt-10 font-body italic text-sm text-ink-muted tracking-wider">
              — <Link
                href={`/${currentPoem.author_username}`}
                className="hover:text-ink-text transition-colors"
              >
                {currentPoem.author_display_name || currentPoem.author_username}
              </Link>
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-5 mt-12">
        {currentPoem?.slug && (
          <ShareButton
            title={currentPoem.title}
            poet={currentPoem.author_display_name || currentPoem.author_username}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${currentPoem.author_username}/p/${currentPoem.slug}`}
            className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
          />
        )}
      </div>

      {/* Scroll hint — mobile only, fades after first scroll */}
      <div className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-ink-muted/25 pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  )
}
