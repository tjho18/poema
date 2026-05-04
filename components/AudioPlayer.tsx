'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
}

export default function AudioPlayer({ src }: Props) {
  const audioRef    = useRef<HTMLAudioElement>(null)
  const [playing,   setPlaying  ] = useState(false)
  const [progress,  setProgress ] = useState(0)       // 0–1
  const [duration,  setDuration ] = useState(0)
  const [currentT,  setCurrentT ] = useState(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    function onTime()  { setCurrentT(el!.currentTime); setProgress(el!.duration ? el!.currentTime / el!.duration : 0) }
    function onMeta()  { setDuration(el!.duration) }
    function onEnded() { setPlaying(false); setProgress(0); setCurrentT(0); el!.currentTime = 0 }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnded)
    }
  }, [])

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else         { el.play();  setPlaying(true)  }
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Waveform bars — static decorative since we don't decode the audio buffer
  const bars = Array.from({ length: 36 }, (_, i) => {
    const x = Math.sin(i * 0.7) * 0.5 + 0.5
    return 0.15 + x * 0.7
  })

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '12px',
        padding:        '10px 14px',
        borderRadius:   '10px',
        background:     'rgba(185,122,85,0.08)',
        border:         '0.5px solid rgba(185,122,85,0.18)',
        maxWidth:       '280px',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause button */}
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play reading'}
        style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: '#B97A55',
          border: 'none', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="#FAF6EE">
            <rect x="0" y="0" width="3.5" height="12" rx="1" />
            <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="#FAF6EE">
            <path d="M0 0 L10 6 L0 12 Z" />
          </svg>
        )}
      </button>

      {/* Waveform + progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Waveform bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: '22px' }}>
          {bars.map((h, i) => {
            const barPct = i / bars.length
            const active = barPct <= progress
            return (
              <div
                key={i}
                style={{
                  width:        '2px',
                  height:       `${h * 100}%`,
                  borderRadius: '1px',
                  background:   active ? '#B97A55' : 'rgba(185,122,85,0.25)',
                  transition:   'background 100ms ease',
                  flexShrink:   0,
                }}
              />
            )
          })}
        </div>

        {/* Time */}
        <p style={{
          fontSize:      '9px',
          fontFamily:    'var(--font-geist), system-ui, sans-serif',
          color:         'rgba(27,26,46,0.35)',
          letterSpacing: '0.03em',
          lineHeight:    1,
        }}>
          {duration > 0 ? `${fmt(currentT)} / ${fmt(duration)}` : 'poet\'s reading'}
        </p>
      </div>
    </div>
  )
}
