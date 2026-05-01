'use client'

import { useState } from 'react'
import PoemCard from '@/components/PoemCard'
import MoodFilter, { type Mood } from '@/components/MoodFilter'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poems: PublicPoem[]
  voiceCount: number
}

export default function ExploreClient({ poems, voiceCount }: Props) {
  const [activeMood, setActiveMood] = useState<Mood | null>(null)

  const filtered = activeMood
    ? poems.filter(p => p.tags?.some(t => t.toLowerCase() === activeMood))
    : poems

  // First card is dark variant only when there are multiple results
  const showDark = filtered.length > 1
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <h1
          className="font-serif italic"
          style={{ fontSize: '22px', lineHeight: '30px', color: '#1B1A2E' }}
        >
          Explore
        </h1>
        <p
          className="font-serif font-serif--ui mt-1"
          style={{ fontSize: '12px', color: '#A89F8C' }}
        >
          {voiceCount} {voiceCount === 1 ? 'voice' : 'voices'} · today
        </p>
      </div>

      {/* Sticky MoodFilter */}
      <div
        className="sticky top-0 z-20 py-3"
        style={{
          background: 'rgba(250,246,238,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          marginTop: '0',
          marginBottom: '16px',
        }}
      >
        <MoodFilter active={activeMood} onChange={setActiveMood} />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p
          className="text-center font-serif italic mt-20"
          style={{ color: '#A89F8C', fontSize: '15px' }}
        >
          No poems in this mood yet.
        </p>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {featured && (
            <div style={{ marginRight: '8px' }}>
              <PoemCard poem={featured} variant={showDark ? 'dark' : 'light'} />
            </div>
          )}
          {rest.map(poem => (
            <div key={poem.id} style={{ marginRight: '8px' }}>
              <PoemCard poem={poem} variant="light" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
