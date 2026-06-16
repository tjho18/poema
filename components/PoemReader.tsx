'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import type { PublicPoem } from '@/types/poem'
import { savePoem } from '@/app/actions/saves'
import { hapticTap, hapticSuccess, hapticSelection } from '@/lib/haptics'

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
            display:         'block',
            width:           '1px',
            height:          '6px',
            borderRadius:    '1px',
            backgroundColor: '#A89F8C',
            opacity:         i === active ? 1 : 0.25,
            transition:      'opacity 300ms ease',
          }}
        />
      ))}
    </div>
  )
}

// Pull-to-refresh indicator: circular progress arc
function PullIndicator({ progress }: { progress: number }) {
  const r    = 7
  const circ = 2 * Math.PI * r
  return (
    <motion.div
      style={{
        position:      'absolute',
        top:           'max(16px, env(safe-area-inset-top))',
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        10,
        opacity:       Math.min(progress / 60, 1),
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle
          cx="10" cy="10" r={r}
          fill="none" stroke="#A89F8C" strokeWidth="1.5" opacity="0.3"
        />
        <circle
          cx="10" cy="10" r={r}
          fill="none" stroke="#A89F8C" strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${circ * Math.min(progress / 80, 1)} ${circ}`}
          transform="rotate(-90 10 10)"
        />
      </svg>
    </motion.div>
  )
}

export default function PoemReader({ poems }: Props) {
  const [queue,        setQueue       ] = useState<PublicPoem[]>([])
  const [currentIdx,   setCurrentIdx  ] = useState(0)
  const [tickIdx,      setTickIdx     ] = useState(0)
  const [poemKey,      setPoemKey     ] = useState(0)
  const [hasNavigated, setHasNavigated] = useState(false)
  const [pullY,        setPullY       ] = useState(0)
  const [refreshing,   setRefreshing  ] = useState(false)

  const transitioning    = useRef(false)
  const touchStartY      = useRef(0)
  const touchStartX      = useRef(0)
  const isPulling        = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ── Build initial queue ────────────────────────────────────────────────────
  useEffect(() => {
    if (poems.length === 0) return
    setQueue(shuffle(poems).slice(0, Math.min(8, poems.length)))
    setCurrentIdx(0)
  }, [poems])

  // ── Refill when < 3 ahead ─────────────────────────────────────────────────
  useEffect(() => {
    if (queue.length === 0) return
    const ahead = queue.length - 1 - currentIdx
    if (ahead < 3) {
      const existing = new Set(queue.map(p => p.id))
      const fresh = shuffle(poems.filter(p => !existing.has(p.id))).slice(0, 8)
      if (fresh.length > 0) setQueue(prev => [...prev, ...fresh])
    }
  }, [currentIdx, queue, poems])

  // ── Navigation with selection haptic ──────────────────────────────────────
  const navigate = useCallback(async (dir: 'next' | 'prev') => {
    if (transitioning.current) return
    const next = dir === 'next' ? currentIdx + 1 : currentIdx - 1
    if (next < 0 || next >= queue.length) return

    transitioning.current = true
    hapticSelection() // fire-and-forget — never blocks UI
    setCurrentIdx(next)
    setPoemKey(k => k + 1)
    setTickIdx(t => dir === 'next' ? (t + 1) % 5 : (t + 4) % 5)
    setHasNavigated(true)
    // Scroll back to top for the incoming poem
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
    setTimeout(() => { transitioning.current = false }, 600)
  }, [currentIdx, queue.length])

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  async function triggerRefresh() {
    setRefreshing(true)
    await hapticTap()
    setQueue(shuffle(poems).slice(0, Math.min(8, poems.length)))
    setCurrentIdx(0)
    setPoemKey(k => k + 1)
    await new Promise(r => setTimeout(r, 350))
    setRefreshing(false)
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────
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

  // ── Long-press to save (500 ms) ───────────────────────────────────────────
  const [savedFlash, setSavedFlash] = useState(false)
  const [showHint,   setShowHint  ] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('poema:swipe-hint-seen')
      if (!seen) setShowHint(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (hasNavigated) {
      try { localStorage.setItem('poema:swipe-hint-seen', '1') } catch {}
      const t = setTimeout(() => setShowHint(false), 400)
      return () => clearTimeout(t)
    }
  }, [hasNavigated])

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

  // ── Touch handlers ────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current    = e.touches[0].clientY
    touchStartX.current    = e.touches[0].clientX
    longPressFired.current = false
    isPulling.current      = false
    longPressTimer.current = setTimeout(triggerSave, 500)
  }

  function onTouchMove(e: React.TouchEvent) {
    const dy = e.touches[0].clientY - touchStartY.current
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)

    if (Math.abs(dy) > 10 || dx > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    }

    // Pull-to-refresh when at first poem + pulling down
    if (currentIdx === 0 && dy > 0 && !refreshing) {
      isPulling.current = true
      setPullY(dy)
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    const dy = e.changedTouches[0].clientY - touchStartY.current
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)

    // Pull-to-refresh threshold: 80 px
    if (isPulling.current && pullY > 80 && currentIdx === 0) {
      isPulling.current = false
      setPullY(0)
      triggerRefresh()
      return
    }

    setPullY(0)
    isPulling.current = false

    if (longPressFired.current) return

    // Only navigate when the scroll container is at its boundary —
    // don't hijack scrolling mid-poem
    const scrollEl = scrollContainerRef.current
    const atTop    = !scrollEl || scrollEl.scrollTop <= 2
    const atBottom = !scrollEl || scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2

    if (Math.abs(dy) > dx && Math.abs(dy) > 50) {
      if (dy < 0 && atBottom) navigate('next')   // swipe up at bottom → next poem
      if (dy > 0 && atTop)    navigate('prev')   // swipe down at top → prev poem
    }
  }

  // ── Tap zones: top-third = prev, bottom-third = next ─────────────────────
  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (longPressFired.current) return
    const { clientY } = e
    const h = window.innerHeight
    if (clientY > h * 0.66) navigate('next')
    if (clientY < h * 0.33) navigate('prev')
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

  const moodWords = ['longing', 'wonder', 'solitude', 'joy']
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mood = poem?.tags?.find(t => moodWords.includes(t.toLowerCase())) ?? ''

  // Subtle downward nudge while pulling
  const pullTranslate = Math.min(pullY * 0.28, 22)

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

      {/* Pull-to-refresh arc */}
      <PullIndicator progress={pullY} />

      {/* Progress ticks */}
      <ProgressTicks active={tickIdx} />

      {/* Saved bookmark flash */}
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

      {/* Poem — safe-area-aware padding */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col items-center overflow-y-auto"
        style={{
          paddingTop:    'max(22vh, calc(env(safe-area-inset-top) + 80px))',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          transform:     `translateY(${pullTranslate}px)`,
          transition:    pullY === 0 ? 'transform 300ms ease' : 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AnimatePresence mode="wait">
          {poem && (
            <motion.div
              key={poemKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: SETTLE }}
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

              {/* Body — full poem, no truncation */}
              <div
                className="font-serif text-center max-w-poem mx-auto"
                style={{
                  fontSize:   '15px',
                  lineHeight: '27.75px',
                  color:      '#2C2A40',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {poem.content}
              </div>

              {/* Attribution */}
              <div className="mt-8 flex flex-col items-center gap-6">
                <p
                  className="font-serif italic text-center"
                  style={{ fontSize: '10px', color: '#AAA' }}
                >
                  — {authorName}
                </p>
                <span className="text-whisper" style={{ fontSize: '16px', lineHeight: 1 }}>·</span>
                <Link
                  href="/write"
                  onClick={e => e.stopPropagation()}
                  className="font-serif italic text-terracotta"
                  style={{
                    fontSize:      '13px',
                    borderBottom:  '0.5px solid currentColor',
                    paddingBottom: '2px',
                    transition:    'border-bottom-width 150ms ease',
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
