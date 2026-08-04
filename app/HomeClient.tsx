'use client'

import { useEffect, useState, useCallback } from 'react'
import GradientBackground from '@/components/GradientBackground'
import NavBar from '@/components/NavBar'
import PoemDisplay from '@/components/PoemDisplay'
import type { Poem } from '@/types/poem'
import { poemTitle, poemTags } from '@/types/poem'

interface Props {
  poems: Poem[]
  allTags: string[]
}

function pickRandom(poems: Poem[], excludeId?: string): Poem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function HomeClient({ poems, allTags }: Props) {
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null)

  // Pick a new random poem
  const cyclePoem = useCallback(() => {
    const next = pickRandom(poems, currentPoem?.id)
    if (next) setCurrentPoem(next)
  }, [poems, currentPoem?.id])

  // On mount: pick the initial random poem
  useEffect(() => {
    const initial = pickRandom(poems)
    setCurrentPoem(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (poems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <NavBar />
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative px-6 py-24">
      <GradientBackground />
      <NavBar />

      {/* Poem */}
      <div className="flex-1 flex items-center justify-center w-full">
        {currentPoem ? (
          <PoemDisplay
            title={poemTitle(currentPoem)}
            content={currentPoem.content}
            tags={poemTags(currentPoem)}
            animate={true}
          />
        ) : null}
      </div>

      {/* "Read me anything" button — plain border, inverts on hover */}
      <div className="mt-16">
        <button
          onClick={cyclePoem}
          className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          another poem
        </button>
      </div>

      {/* Subtle link to explore */}
      <div className="mt-6">
        <a
          href="/explore"
          className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          all poems →
        </a>
      </div>
    </main>
  )
}
