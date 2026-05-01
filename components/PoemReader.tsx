'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { PublicPoem } from '@/types/poem'
import { savePoem } from '@/app/actions/saves'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

interface Props {
  poems: PublicPoem[]
}

const SETTLE = [0.32, 0.72, 0, 1] as const

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// 5 progress ticks on the right edge
function ProgressTicks({ active }: { active: number }) {
  return (
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: '1px',
            height: '6px',
            borderRadius: '1px',
            backgroundColor: '#A89F8C',
            opacity: i === active ? 1 : 0.25,
            transition: 'opacity 300ms ease',
          }}
        />
      ))}
    </div>
  )
}

export default function PoemReader({ poems }: Props) {
  const [queue, setQueue]             = useState<PublicPoem[]>([])
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [tickIdx, setTickIdx]         = useState(0)
  const [poemKey, setPoemKey]         = useState(0) // forces AnimatePresence remount
  const [hasNavigated, setHasNavigated] = useState(false)
  const transitioning                  = useRef(false)
  const touchStartY                    = useRef(0)
  const touchStartX                    = useRef(0)

  // Build initial queue of 8
  useEffect(() => {
    if (poems.length === 0) return
    setQueue(shuffle(poems).slice(0, Math.min(8, poems.length)))
    setCurrentIdx(0)
  }, [poems])

  // Refill when < 3 remain ahead
  useEffect(() => {
    if (queue.length === 0) return
    const ahead = queue.length - 1 - currentIdx
    if (ahead < 3) {
      const existing = new Set(queue.map(p => p.id))
      const fresh = shuffle(poems.filter(p => !existing.has(p.id))).slice(0, 8)
      if (fresh.length > 0) setQueue(prev => [...prev, ...fresh])
    }
  }, [currentIdx, queue, poems])

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (transitioning.current) return
    const next = dir === 'next' ? currentIdx + 1 : currentIdx - 1
    if (next < 0 || next >= queue.length) return

    transitioning.current = true
    setCurrentIdx(next)
    setPoemKey(k => k + 1)
    setTickIdx(t => dir === 'next' ? (t + 1) % 5 : (t + 4) % 5)
    setHasNavigated(true)
    setTimeout(() => { transitioning.current = false }, 600)
  }, [currentIdx, queue.length])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowUp')   navigate('prev')
      if (e.key === 'ArrowDown') navigate('next')
      if (e.key === ' ')         { e.preventDefault(); navigate('next') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // Long-press to save (500ms)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Show hint only if the user has never navigated before — once they have,
  // we set a localStorage flag and never show it again.
  useEffect(() => {
    try {
      const seen = localStorage.getItem('poema:swipe-hint-seen')
      if (!seen) setShowHint(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (hasNavigated) {
      try { localStorage.setItem('poema:swipe-hint-seen', '1') } catch {}
      // Fade out after the first navigation
      const t = setTimeout(() => setShowHint(false), 400)
      return () => clearTimeout(t)
    }
  }, [hasNavigated])
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  async function triggerSave() {
    longPressFired.current = true
    await hapticTap()
    if (!poem) return
    const result = await savePoem(poem.id)
    if (result.saved) {
      await hapticSuccess()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
    longPressFired.current = false
    longPressTimer.current = setTimeout(triggerSave, 500)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    if (longPressFired.current) return // long-press already handled
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
    if (Math.abs(dy) > dx && Math.abs(dy) > 50) {
      navigate(dy < 0 ? 'next' : 'prev')
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    // Movement cancels long-press intent
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    if (dy > 10 || dx > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }
  }

  // Tap zones: bottom-third = next, top-third = prev, center = nothing
  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (longPressFired.current) return
    const { clientY } = e
    const h = window.innerHeight
    if (clientY > h * 0.66)  navigate('next')
    if (clientY < h * 0.33)  navigate('prev')
  }

  const poem = queue[currentIdx]

  if (poems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-serif italic text-poem-base text-whisper">No poems yet.</p>
      </div>
    )
  }

  const authorName = poem
    ? (poem.author_display_name || poem.author_username).toLowerCase()
    : ''

  // Extract mood from tags for attribution
  const moodWords = ['longing', 'wonder', 'solitude', 'joy']
  const mood = poem?.tags?.find(t => moodWords.includes(t.toLowerCase())) ?? ''

  return (
    <div
      className="relative flex flex-col select-none"
      style={{ height: '100dvh', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onTap}
      role="main"
      aria-live="polite"
    >
      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(27,26,46,0.05) 100%)',
        }}
      />

      {/* Progress ticks */}
      <ProgressTicks active={tickIdx} />

      {/* Saved bookmark — settles into the right margin briefly */}
      <AnimatePresence>
        {savedFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.24, ease: SETTLE }}
            className="absolute z-30 pointer-events-none"
            style={{ right: '24px', top: '40%' }}
            aria-hidden="true"
          >
            <svg width="14" height="20" viewBox="0 0 14 20" fill="#B97A55">
              <path d="M0 0 L14 0 L14 18 L7 14 L0 18 Z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poem — fixed top anchor, long poems clip naturally at bottom */}
      <div
        className="flex-1 flex flex-col items-center overflow-hidden"
        style={{ paddingTop: '22vh', paddingBottom: '80px' }}
      >
        <AnimatePresence mode="wait">
          {poem && (
            <motion.div
              key={poemKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: SETTLE,
              }}
              className="flex flex-col items-center px-6"
            >
              {/* Title */}
              {poem.title && (
                <h1
                  className="font-serif italic text-center text-poem-ink mb-4"
                  style={{ fontSize: '18px', lineHeight: '26px', letterSpacing: '0.005em' }}
                >
                  {poem.title}
                </h1>
              )}

              {/* Body — stanza-aware truncation: show whole stanzas only,
                  never break mid-line. If clipped, append a · ornament. */}
              <div
                className="font-serif text-center max-w-poem mx-auto"
                style={{
                  fontSize: '15px',
                  lineHeight: '27.75px',
                  color: '#2C2A40',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {(() => {
                  const stanzas = poem.content.split(/\n\s*\n/)
                  const MAX_LINES = 9
                  const shown: string[] = []
                  let lineCount = 0
                  for (const stanza of stanzas) {
                    const lines = stanza.split('\n').length
                    if (lineCount + lines > MAX_LINES) break
                    shown.push(stanza)
                    lineCount += lines
                  }
                  // If nothing fit (single huge stanza), fall back to first 6 lines + line break
                  const body = shown.length > 0
                    ? shown.join('\n\n')
                    : poem.content.split('\n').slice(0, 6).join('\n')
                  const clipped = body.length < poem.content.trim().length
                  return (
                    <>
                      {body}
                      {clipped && (
                        <span style={{ display: 'block', marginTop: '12px', color: '#A89F8C', fontSize: '14px', letterSpacing: '0.3em' }}>
                          · · ·
                        </span>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Attribution */}
              <div className="mt-8 flex flex-col items-center gap-6">
                <p
                  className="font-serif italic text-center"
                  style={{ fontSize: '10px', color: '#AAA' }}
                >
                  — {authorName}
                </p>

                {/* Ornament */}
                <span className="text-whisper" style={{ fontSize: '16px', lineHeight: 1 }}>·</span>

                {/* Write CTA */}
                <Link
                  href="/write"
                  onClick={e => e.stopPropagation()}
                  className="font-serif italic text-terracotta"
                  style={{
                    fontSize: '13px',
                    borderBottom: '0.5px solid currentColor',
                    paddingBottom: '2px',
                    transition: 'border-bottom-width 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderBottomWidth = '1px' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderBottomWidth = '0.5px' }}
                >
                  write something
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom hint */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none">
        <AnimatePresence>
          {showHint && (
            <motion.p
              key="swipe-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: hasNavigated ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: hasNavigated ? 0 : 1.5, duration: 0.6 }}
              className="font-sans uppercase tracking-[0.18em] text-whisper/60"
              style={{ fontSize: '10px' }}
            >
              swipe for next poem
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
