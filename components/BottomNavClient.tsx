'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  username: string | null
}

// Home icon: filled dot above 3 lines (simplified poem mark)
function HomeIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 50" width="18" height="16" aria-hidden="true">
      <circle cx="28" cy="7" r="5.5" fill={color} />
      <rect x="11" y="20" width="34" height="4" rx="2" fill={color} opacity="0.8" />
      <rect x="5"  y="30" width="46" height="4" rx="2" fill={color} />
      <rect x="9"  y="40" width="38" height="4" rx="2" fill={color} opacity="0.85" />
    </svg>
  )
}

// Explore icon: 2×2 grid
function ExploreIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      <rect x="0" y="0" width="6" height="6" rx="1.5" fill={color} />
      <rect x="8" y="0" width="6" height="6" rx="1.5" fill={color} />
      <rect x="0" y="8" width="6" height="6" rx="1.5" fill={color} />
      <rect x="8" y="8" width="6" height="6" rx="1.5" fill={color} />
    </svg>
  )
}

// Profile icon: simple person silhouette
function ProfileIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="5" r="3" fill={color} />
      <path d="M2 14 a6 6 0 0 1 12 0" fill={color} />
    </svg>
  )
}

function PenInButton({ bg }: { bg: string }) {
  return (
    <svg viewBox="0 0 400 400" width="15" height="15" aria-hidden="true">
      <g transform="translate(200,205) rotate(-42) scale(1.5) translate(-10,-100)">
        <path
          d="M 0,14 A 10,14 0 0 1 20,14 L 20,162 L 17,182 L 14,200 L 10,212 L 6,200 L 3,182 L 0,162 Z"
          fill={bg === 'dark' ? '#FAF7F2' : '#FAF6EE'}
        />
        <rect x="21" y="5" width="5.5" height="76" rx="2.75"
          fill={bg === 'dark' ? '#E8DFC8' : '#EADFC5'} />
        <circle cx="23.75" cy="83" r="4.5"
          fill={bg === 'dark' ? '#E8DFC8' : '#EADFC5'} />
        <circle cx="10" cy="212" r="4"
          fill={bg === 'dark' ? '#E8DFC8' : '#EADFC5'} />
      </g>
    </svg>
  )
}

export default function BottomNavClient({ username }: Props) {
  const pathname = usePathname()

  const isHome    = pathname === '/'
  const isExplore = pathname.startsWith('/explore')
  const isWrite   = pathname.startsWith('/write')
  const isProfile = username
    ? pathname === `/${username}` || pathname.startsWith('/dashboard') || pathname.startsWith('/settings')
    : pathname.startsWith('/signin') || pathname.startsWith('/signup')

  const dark = isWrite
  const bg        = dark ? 'rgba(8,7,20,0.97)'      : 'rgba(250,246,238,0.86)'
  const border    = dark ? 'rgba(232,223,200,0.07)' : 'rgba(27,26,46,0.08)'
  const baseColor = dark ? '#E8DFC8'                : '#1B1A2E'

  function labelStyle(active: boolean, accent?: string): React.CSSProperties {
    return {
      fontSize: '8px',
      fontFamily: 'var(--font-geist), system-ui, sans-serif',
      letterSpacing: '0.03em',
      marginTop: '2px',
      color: active ? (accent ?? baseColor) : `${baseColor}66`,
      fontWeight: active ? 500 : 400,
    }
  }

  const profileHref = username ? `/${username}` : '/signin'

  return (
    <nav
      style={{
        position:  'fixed',
        bottom:    0,
        left:      0,
        right:     0,
        zIndex:    40,
        height:    '50px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: bg,
        backdropFilter: 'blur(20px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.05)',
        borderTop:  `0.5px solid ${border}`,
        display:   'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding:   '0 8px',
      }}
    >
      {/* Home */}
      <Link href="/" aria-label="Home"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', opacity: isHome ? 1 : 0.35, flex: 1 }}
      >
        <HomeIcon color={baseColor} />
        <span style={labelStyle(isHome)}>home</span>
      </Link>

      {/* Explore */}
      <Link href="/explore" aria-label="Explore"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', opacity: isExplore ? 1 : 0.35, flex: 1 }}
      >
        <ExploreIcon color={baseColor} />
        <span style={labelStyle(isExplore)}>explore</span>
      </Link>

      {/* Write — floating pen button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}>
        <Link href="/write" aria-label="Write a poem"
          style={{
            width: '32px', height: '32px',
            background: '#C5865D',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '-18px', marginBottom: '1px',
            boxShadow: '0 6px 16px -8px rgba(185,122,85,0.55)',
            flexShrink: 0,
          }}
        >
          <PenInButton bg={dark ? 'dark' : 'light'} />
        </Link>
        <span style={labelStyle(isWrite, '#C5865D')}>write</span>
      </div>

      {/* Profile */}
      <Link href={profileHref} aria-label={username ? 'Profile' : 'Sign in'}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', opacity: isProfile ? 1 : 0.35, flex: 1 }}
      >
        <ProfileIcon color={baseColor} />
        <span style={labelStyle(isProfile)}>{username ? 'you' : 'sign in'}</span>
      </Link>

      {/* Home indicator bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '48px',
          height: '2.5px',
          background: baseColor,
          borderRadius: '2px',
          opacity: 0.12,
        }}
        aria-hidden="true"
      />
    </nav>
  )
}
