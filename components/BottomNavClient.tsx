'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWriteSheet } from '@/contexts/WriteSheetContext'
import { hapticMedium } from '@/lib/haptics'

interface Props {
  username: string | null
}

// ── SF Symbol–style icons ────────────────────────────────────────────────────
// Stroke-based (inactive) · Filled (active) — matching HIG visual weight.

function BookIcon({ active, color }: { active: boolean; color: string }) {
  return active ? (
    // book.closed.fill
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v13H6.5A2.5 2.5 0 0 0 4 17.5V4.5Z"
        fill={color}
      />
      <path
        d="M4 18.5A2.5 2.5 0 0 0 6.5 21H20v-6H6.5A2.5 2.5 0 0 0 4 18.5Z"
        fill={color}
        opacity="0.7"
      />
      <line x1="8"  y1="6.5" x2="15.5" y2="6.5" stroke="rgba(250,246,238,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8"  y1="9.5" x2="15.5" y2="9.5" stroke="rgba(250,246,238,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8"  y1="12.5" x2="12"  y2="12.5" stroke="rgba(250,246,238,0.5)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ) : (
    // book.closed
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19v13H6.5A2.5 2.5 0 0 0 4 17.5V4.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 18.5A2.5 2.5 0 0 0 6.5 21H19v-4H6.5A2.5 2.5 0 0 0 4 18.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="7.5" y1="6.5"  x2="14.5" y2="6.5"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7.5" y1="9.5"  x2="14.5" y2="9.5"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7.5" y1="12.5" x2="11.5" y2="12.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function GridIcon({ active, color }: { active: boolean; color: string }) {
  return active ? (
    // square.grid.2x2.fill
    <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true">
      <rect x="1"  y="1"  width="9" height="9" rx="2.5" fill={color} />
      <rect x="12" y="1"  width="9" height="9" rx="2.5" fill={color} />
      <rect x="1"  y="12" width="9" height="9" rx="2.5" fill={color} />
      <rect x="12" y="12" width="9" height="9" rx="2.5" fill={color} />
    </svg>
  ) : (
    // square.grid.2x2
    <svg viewBox="0 0 22 22" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="1.75"  y="1.75"  width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="12.75" y="1.75"  width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="1.75"  y="12.75" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="12.75" y="12.75" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function PersonIcon({ active, color }: { active: boolean; color: string }) {
  return active ? (
    // person.fill
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="7.5" r="4" fill={color} />
      <path
        d="M3 20.5a9 9 0 0 1 18 0"
        fill={color}
        opacity="0.85"
      />
    </svg>
  ) : (
    // person
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="7.5" r="3.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M3.5 21a8.5 8.5 0 0 1 17 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg viewBox="0 0 400 400" width="15" height="15" aria-hidden="true">
      <g transform="translate(200,205) rotate(-42) scale(1.5) translate(-10,-100)">
        <path
          d="M 0,14 A 10,14 0 0 1 20,14 L 20,162 L 17,182 L 14,200 L 10,212 L 6,200 L 3,182 L 0,162 Z"
          fill="#FAF6EE"
        />
        <rect x="21" y="5" width="5.5" height="76" rx="2.75" fill="#EADFC5" />
        <circle cx="23.75" cy="83" r="4.5" fill="#EADFC5" />
        <circle cx="10" cy="212" r="4" fill="#EADFC5" />
      </g>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BottomNavClient({ username }: Props) {
  const pathname = usePathname()
  const { open: openSheet } = useWriteSheet()

  const isHome    = pathname === '/'
  const isExplore = pathname.startsWith('/explore')
  const isProfile = username
    ? pathname === `/${username}` || pathname.startsWith('/dashboard') || pathname.startsWith('/settings')
    : pathname.startsWith('/signin') || pathname.startsWith('/signup')

  // Tab bar is always parchment-light (the write button being dark is handled by the sheet)
  const bg        = 'rgba(250,246,238,0.86)'
  const border    = 'rgba(27,26,46,0.08)'
  const baseColor = '#1B1A2E'

  function labelStyle(active: boolean): React.CSSProperties {
    return {
      fontSize:   '10px',
      fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
      letterSpacing: '0.01em',
      marginTop:  '3px',
      color:      active ? baseColor : `${baseColor}55`,
      fontWeight: active ? 600 : 400,
      transition: 'color 200ms ease',
    }
  }

  const profileHref = username ? `/${username}` : '/signin'

  // Each tab needs a minimum 44×44pt touch target (HIG)
  const tabBase: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '1px',
    flex:           1,
    minHeight:      '44px',
    cursor:         'pointer',
    WebkitTapHighlightColor: 'transparent',
  }

  return (
    <nav
      style={{
        position:            'fixed',
        bottom:              0,
        left:                0,
        right:               0,
        zIndex:              40,
        background:          bg,
        backdropFilter:      'blur(20px) saturate(1.05)',
        WebkitBackdropFilter:'blur(20px) saturate(1.05)',
        borderTop:           `0.5px solid ${border}`,
        display:             'flex',
        alignItems:          'stretch',
        // Safe area: pad the nav height so content sits above the home indicator
        paddingBottom:       'env(safe-area-inset-bottom)',
        // Tab strip itself: 50px; total height grows with safe area
      }}
    >
      {/* Inner row — fixed 50px regardless of safe area */}
      <div style={{ display: 'flex', width: '100%', height: '50px', alignItems: 'center' }}>
        {/* Home */}
        <Link href="/" aria-label="Home" style={tabBase}>
          <BookIcon active={isHome} color={baseColor} />
          <span style={labelStyle(isHome)}>home</span>
        </Link>

        {/* Explore */}
        <Link href="/explore" aria-label="Explore" style={tabBase}>
          <GridIcon active={isExplore} color={baseColor} />
          <span style={labelStyle(isExplore)}>explore</span>
        </Link>

        {/* Write — floating terracotta button */}
        <div style={{ ...tabBase, position: 'relative' }}>
          <button
            type="button"
            aria-label="Write a poem"
            onClick={async () => {
              await hapticMedium()
              openSheet()
            }}
            style={{
              width:           '36px',
              height:          '36px',
              background:      '#C5865D',
              borderRadius:    '10px',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              marginTop:       '-18px',
              marginBottom:    '2px',
              boxShadow:       '0 6px 16px -8px rgba(185,122,85,0.6)',
              border:          'none',
              cursor:          'pointer',
              flexShrink:      0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <PenIcon />
          </button>
          <span style={{ ...labelStyle(false), color: '#B97A55', fontWeight: 500 }}>
            write
          </span>
        </div>

        {/* Profile / Sign in */}
        <Link href={profileHref} aria-label={username ? 'Profile' : 'Sign in'} style={tabBase}>
          <PersonIcon active={isProfile} color={baseColor} />
          <span style={labelStyle(isProfile)}>{username ? 'you' : 'sign in'}</span>
        </Link>
      </div>
    </nav>
  )
}
