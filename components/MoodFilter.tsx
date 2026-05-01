'use client'

const MOODS = ['longing', 'wonder', 'solitude', 'joy'] as const
export type Mood = typeof MOODS[number]

interface Props {
  active: Mood | null   // null = "all"
  onChange: (mood: Mood | null) => void
}

export default function MoodFilter({ active, onChange }: Props) {
  return (
    <div className="relative">
      {/* Edge fades */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-4"
        style={{ background: 'linear-gradient(to right, #FAF6EE, transparent)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-4"
        style={{ background: 'linear-gradient(to left, #FAF6EE, transparent)' }} />

      <div
        className="flex gap-2 overflow-x-auto px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        role="group"
        aria-label="Filter by mood"
      >
        {/* "All" chip — filled when active (null state) */}
        <button
          onClick={() => onChange(null)}
          aria-pressed={active === null}
          className="flex-shrink-0 font-serif italic rounded-full transition-colors duration-200"
          style={{
            fontSize: '9px',
            lineHeight: '18px',
            padding: '4px 11px',
            backgroundColor: active === null ? '#1B1A2E' : 'transparent',
            color: active === null ? '#FAF6EE' : 'rgba(27,26,46,0.5)',
            border: active === null ? 'none' : '0.5px solid rgba(27,26,46,0.20)',
          }}
        >
          all
        </button>

        {MOODS.map(mood => {
          const isActive = active === mood
          return (
            <button
              key={mood}
              onClick={() => onChange(isActive ? null : mood)}
              aria-pressed={isActive}
              className="flex-shrink-0 font-serif italic rounded-full transition-colors duration-200"
              style={{
                fontSize: '9px',
                lineHeight: '18px',
                padding: '4px 11px',
                border: isActive
                  ? '0.5px solid #C5865D'
                  : '0.5px solid rgba(27,26,46,0.20)',
                color: isActive ? '#C5865D' : 'rgba(27,26,46,0.5)',
                backgroundColor: 'transparent',
              }}
            >
              {mood}
            </button>
          )
        })}
      </div>
    </div>
  )
}
