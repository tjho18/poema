'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { useWriteSheet } from '@/contexts/WriteSheetContext'
import { createPoemAction } from '@/app/actions/poems'
import WriteEditor from '@/components/WriteEditor'
import AudioRecorder from '@/components/AudioRecorder'
import { hapticMedium } from '@/lib/haptics'

export default function WriteSheet() {
  const { isOpen, close, respondingTo, promptId, promptText } = useWriteSheet()
  const router = useRouter()
  const dragY   = useMotionValue(0)
  const opacity = useTransform(dragY, [0, 300], [1, 0])

  // After publish: show audio recorder before navigating
  const [pendingNav,  setPendingNav ] = useState<string | null>(null)
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [showAudio,   setShowAudio  ] = useState(false)

  async function handlePublished(url: string, poemId: string) {
    await hapticMedium()
    setPendingNav(url)
    setPublishedId(poemId)
    setShowAudio(true)
  }

  function handleAudioDone() {
    setShowAudio(false)
    close()
    if (pendingNav) {
      router.push(pendingNav)
      setPendingNav(null)
      setPublishedId(null)
    }
  }

  async function handleDismiss() {
    await hapticMedium()
    close()
  }

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      dragY.set(0)
      setShowAudio(false)
      setPendingNav(null)
      setPublishedId(null)
    }
  }, [isOpen, dragY])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key (desktop)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 49,
              background: 'rgba(0,0,0,0.45)',
            }}
            onClick={close}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="write-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            style={{
              position:      'fixed',
              left: 0, right: 0, bottom: 0,
              zIndex:        50,
              height:        '95dvh',
              background:    '#0C0B1A',
              borderRadius:  '20px 20px 0 0',
              overflow:      'hidden',
              display:       'flex',
              flexDirection: 'column',
              y:             dragY,
              opacity,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) close()
              else dragY.set(0)
            }}
          >
            {/* Grabber */}
            <div
              style={{
                display: 'flex', justifyContent: 'center',
                paddingTop: '10px', paddingBottom: '4px',
                flexShrink: 0, cursor: 'grab',
              }}
              aria-hidden="true"
            >
              <div style={{
                width: '36px', height: '4px', borderRadius: '2px',
                background: 'rgba(234,223,197,0.18)',
              }} />
            </div>

            {/* "In response to" banner */}
            {respondingTo && !showAudio && (
              <div style={{
                paddingLeft: '24px', paddingRight: '24px',
                paddingBottom: '10px', flexShrink: 0,
              }}>
                <p style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-geist), system-ui, sans-serif',
                  color: 'rgba(234,223,197,0.35)',
                  letterSpacing: '0.01em',
                }}>
                  in response to{' '}
                  <span style={{ color: '#B97A55', fontStyle: 'italic', fontFamily: 'var(--font-garamond), Georgia, serif' }}>
                    {respondingTo.title || 'untitled'}
                  </span>
                  {' '}by {(respondingTo.authorDisplayName || respondingTo.authorUsername).toLowerCase()}
                </p>
              </div>
            )}

            {/* Today's prompt banner */}
            {promptText && !respondingTo && !showAudio && (
              <div style={{
                paddingLeft: '24px', paddingRight: '24px',
                paddingBottom: '10px', flexShrink: 0,
              }}>
                <p style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-geist), system-ui, sans-serif',
                  color: 'rgba(234,223,197,0.28)',
                  letterSpacing: '0.01em',
                }}>
                  today · <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-garamond), Georgia, serif' }}>
                    {promptText}
                  </span>
                </p>
              </div>
            )}

            {/* Content: editor or audio recorder */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {showAudio && publishedId ? (
                <AudioRecorder
                  poemId={publishedId}
                  onDone={handleAudioDone}
                />
              ) : (
                <WriteEditor
                  action={createPoemAction}
                  onPublished={handlePublished}
                  onDismiss={handleDismiss}
                  respondingToPoemId={respondingTo?.id ?? null}
                  promptId={promptId ?? null}
                  sheetMode
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
