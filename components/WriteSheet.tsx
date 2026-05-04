'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { useWriteSheet } from '@/contexts/WriteSheetContext'
import { createPoemAction } from '@/app/actions/poems'
import WriteEditor from '@/components/WriteEditor'
import { hapticMedium } from '@/lib/haptics'

// iOS-style modal sheet that slides up from the bottom.
// Renders over everything (z-50), backdrop fades in.
// Swipe down from grabber or drag sheet to dismiss.

export default function WriteSheet() {
  const { isOpen, close } = useWriteSheet()
  const router = useRouter()
  const dragY   = useMotionValue(0)
  const opacity = useTransform(dragY, [0, 300], [1, 0])

  async function handlePublished(url: string) {
    await hapticMedium()
    close()
    router.push(url)
  }

  async function handleDismiss() {
    await hapticMedium()
    close()
  }

  // Reset drag on close
  useEffect(() => {
    if (!isOpen) dragY.set(0)
  }, [isOpen, dragY])

  // Trap scroll inside sheet
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Keyboard: Escape closes sheet (desktop)
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
              position:   'fixed',
              inset:      0,
              zIndex:     49,
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
              position:     'fixed',
              left:         0,
              right:        0,
              bottom:       0,
              zIndex:       50,
              // Let the sheet fill ~95% of screen height — leaves a sliver of page visible at top
              height:       '95dvh',
              background:   '#0C0B1A',
              borderRadius: '20px 20px 0 0',
              overflow:     'hidden',
              display:      'flex',
              flexDirection: 'column',
              y:            dragY,
              opacity,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                close()
              } else {
                dragY.set(0)
              }
            }}
          >
            {/* Grabber handle */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'center',
                paddingTop:     '10px',
                paddingBottom:  '4px',
                flexShrink:     0,
                // Extend tap target upward for easier drag
                cursor:         'grab',
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  width:        '36px',
                  height:       '4px',
                  borderRadius: '2px',
                  background:   'rgba(234,223,197,0.18)',
                }}
              />
            </div>

            {/* WriteEditor fills the rest */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <WriteEditor
                action={createPoemAction}
                onPublished={handlePublished}
                onDismiss={handleDismiss}
                sheetMode
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
