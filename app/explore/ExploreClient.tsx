'use client'

import { useState } from 'react'
import Link from 'next/link'
import PoemCard from '@/components/PoemCard'
import MoodFilter, { type Mood } from '@/components/MoodFilter'
import type { PublicPoem, Prompt } from '@/types/poem'

type Tab = 'all' | 'today'

interface Props {
  poems:        PublicPoem[]
  voiceCount:   number
  todayPrompt:  Prompt | null
  promptPoems:  PublicPoem[]
}

export default function ExploreClient({ poems, voiceCount, todayPrompt, promptPoems }: Props) {
  const [tab,        setTab       ] = useState<Tab>('all')
  const [activeMood, setActiveMood] = useState<Mood | null>(null)

  const filtered = activeMood
    ? poems.filter(p => p.tags?.some(t => t.toLowerCase() === activeMood))
    : poems

  const showDark = filtered.length > 1
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
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
        <div className="flex px-4 gap-0" style={{ borderBottom: '0.5px solid rgba(27,26,46,0.08)' }}>
          {(['all', 'today'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-serif italic"
              style={{
                fontSize:      '13px',
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
              {t === 'today' && todayPrompt ? "today’s prompt" : t}
            </button>
          ))}
        </div>

        {/* Mood filter — only on "all" tab */}
        {tab === 'all' && (
          <div className="py-3">
            <MoodFilter active={activeMood} onChange={setActiveMood} />
          </div>
        )}
      </div>

      {/* ── All tab ── */}
      {tab === 'all' && (
        filtered.length === 0 ? (
          <p
            className="text-center font-serif italic mt-20"
            style={{ color: '#A89F8C', fontSize: '15px' }}
          >
            No poems in this mood yet.
          </p>
        ) : (
          <div className="px-4 flex flex-col gap-3 pt-4">
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
        )
      )}

      {/* ── Today's prompt tab ── */}
      {tab === 'today' && (
        <div className="px-4 pt-6">
          {todayPrompt ? (
            <>
              {/* Prompt display */}
              <div
                className="text-center mb-10"
                style={{ padding: '24px 20px', borderRadius: '12px', background: 'rgba(185,122,85,0.06)', border: '0.5px solid rgba(185,122,85,0.15)' }}
              >
                <p
                  className="font-serif italic"
                  style={{ fontSize: '11px', color: 'rgba(27,26,46,0.35)', letterSpacing: '0.06em', marginBottom: '8px' }}
                >
                  today's prompt
                </p>
                <p
                  className="font-serif italic"
                  style={{ fontSize: '20px', lineHeight: '30px', color: '#1B1A2E' }}
                >
                  {todayPrompt.text}
                </p>
              </div>

              {/* Responses */}
              {promptPoems.length === 0 ? (
                <p
                  className="text-center font-serif italic mt-12"
                  style={{ color: '#A89F8C', fontSize: '14px' }}
                >
                  Be the first to respond.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {promptPoems.map(poem => (
                    <PoemCard key={poem.id} poem={poem} variant="light" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p
              className="text-center font-serif italic mt-20"
              style={{ color: '#A89F8C', fontSize: '15px' }}
            >
              No prompt today — write freely.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
