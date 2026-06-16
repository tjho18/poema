'use client'

import { useMemo, useState } from 'react'
import PoemCard from '@/components/PoemCard'
import MoodFilter, { type Mood } from '@/components/MoodFilter'
import type { PublicPoem } from '@/types/poem'

type Tab = 'all' | 'new'

interface Props {
  poems:      PublicPoem[]   // newest-first
  voiceCount: number
}

export default function ExploreClient({ poems, voiceCount }: Props) {
  const [tab,        setTab       ] = useState<Tab>('all')
  const [activeMood, setActiveMood] = useState<Mood | null>(null)

  // Shuffle once for the discovery ("all") tab; "new" keeps chronological order.
  const shuffled = useMemo(
    () => [...poems].map(p => ({ p, s: Math.random() })).sort((a, b) => a.s - b.s).map(({ p }) => p),
    [poems],
  )

  const base = tab === 'all' ? shuffled : poems
  const filtered = activeMood
    ? base.filter(p => p.tags?.some(t => t.toLowerCase() === activeMood))
    : base

  // Featured "dark" card only on the discovery tab.
  const showDark = tab === 'all' && filtered.length > 1
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 max-w-2xl mx-auto w-full">
        <h1
          className="font-serif italic text-[22px] leading-[30px] sm:text-[34px] sm:leading-[42px]"
          style={{ color: '#1B1A2E' }}
        >
          Explore
        </h1>
        <p
          className="font-serif font-serif--ui mt-1 text-[12px] sm:text-[14px]"
          style={{ color: '#A89F8C' }}
        >
          {voiceCount} {voiceCount === 1 ? 'voice' : 'voices'}
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(250,246,238,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Tabs */}
        <div className="flex px-4 gap-0 max-w-2xl mx-auto" style={{ borderBottom: '0.5px solid rgba(27,26,46,0.08)' }}>
          {(['all', 'new'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-serif italic text-[13px] sm:text-[15px]"
              style={{
                padding:       '10px 16px 8px',
                background:    'none',
                border:        'none',
                cursor:        'pointer',
                color:         tab === t ? '#1B1A2E' : 'rgba(27,26,46,0.38)',
                borderBottom:  tab === t ? '1.5px solid #B97A55' : '1.5px solid transparent',
                marginBottom:  '-0.5px',
                letterSpacing: '0.01em',
                transition:    'color 150ms ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mood filter — on both tabs */}
        <div className="py-3 max-w-2xl mx-auto">
          <MoodFilter active={activeMood} onChange={setActiveMood} />
        </div>
      </div>

      {/* Poem list */}
      {filtered.length === 0 ? (
        <p
          className="text-center font-serif italic mt-20"
          style={{ color: '#A89F8C', fontSize: '15px' }}
        >
          {activeMood ? 'No poems in this mood yet.' : 'No poems yet.'}
        </p>
      ) : (
        <div className="px-4 flex flex-col gap-3 pt-4 max-w-2xl mx-auto w-full">
          {/* Discovery tab leads with a featured card */}
          {tab === 'all' && featured && (
            <div style={{ marginRight: '8px' }}>
              <PoemCard poem={featured} variant={showDark ? 'dark' : 'light'} />
            </div>
          )}
          {(tab === 'all' ? rest : filtered).map(poem => (
            <div key={poem.id} style={{ marginRight: '8px' }}>
              <PoemCard poem={poem} variant="light" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
