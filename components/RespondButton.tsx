'use client'

import { useWriteSheet, type RespondingTo } from '@/contexts/WriteSheetContext'
import { hapticMedium } from '@/lib/haptics'

interface Props {
  poem: RespondingTo
  variant?: 'inline' | 'subtle'
}

// Opens the Write sheet pre-linked to this poem.
export default function RespondButton({ poem, variant = 'inline' }: Props) {
  const { openWithResponse } = useWriteSheet()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await hapticMedium()
    openWithResponse(poem)
  }

  if (variant === 'subtle') {
    return (
      <button
        onClick={handleClick}
        style={{
          background:    'none',
          border:        'none',
          cursor:        'pointer',
          fontFamily:    'var(--font-garamond), Georgia, serif',
          fontStyle:     'italic',
          fontSize:      '12px',
          color:         'rgba(27,26,46,0.35)',
          letterSpacing: '0.01em',
          padding:       '0',
          minHeight:     '44px',
          minWidth:      '44px',
          display:       'flex',
          alignItems:    'center',
          transition:    'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#B97A55' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(27,26,46,0.35)' }}
        aria-label="Respond with a poem"
      >
        respond
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background:    'none',
        border:        '0.5px solid rgba(27,26,46,0.15)',
        borderRadius:  '20px',
        cursor:        'pointer',
        fontFamily:    'var(--font-garamond), Georgia, serif',
        fontStyle:     'italic',
        fontSize:      '12px',
        color:         'rgba(27,26,46,0.55)',
        padding:       '6px 14px',
        minHeight:     '34px',
        letterSpacing: '0.01em',
        transition:    'all 150ms ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#B97A55'
        el.style.color = '#B97A55'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(27,26,46,0.15)'
        el.style.color = 'rgba(27,26,46,0.55)'
      }}
      aria-label="Respond with a poem"
    >
      ↩ respond
    </button>
  )
}
