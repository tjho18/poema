import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth'
import UserMenu from '@/components/UserMenu'

// Masthead-style navbar: thin bottom rule like a newspaper header.
// Async server component — reads the session and renders a signed-in or
// signed-out variant accordingly.
export default async function NavBar() {
  const { user, profile } = await getCurrentProfile()
  const signedIn = Boolean(user && profile?.username)

  return (
    <nav
      className="hidden sm:flex fixed top-0 left-0 right-0 z-20 items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-sm border-b"
      style={{
        background: 'rgba(250,246,238,0.86)',
        borderBottomColor: 'rgba(27,26,46,0.08)',
        backdropFilter: 'blur(20px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.05)',
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 hover:opacity-60 transition-opacity"
      >
        {/* Pen icon */}
        <span className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ backgroundColor: '#F0E8D5' }}>
          <svg viewBox="0 0 400 400" width="28" height="28">
            <g transform="translate(200,205) rotate(-42) scale(1.5) translate(-10,-100)">
              <path d="M 0,14 A 10,14 0 0 1 20,14 L 20,162 L 17,182 L 14,200 L 10,212 L 6,200 L 3,182 L 0,162 Z" fill="#1A1A2E"/>
              <rect x="14" y="17" width="4" height="138" rx="2" fill="#252440" opacity="0.5"/>
              <rect x="21" y="5" width="5.5" height="76" rx="2.75" fill="#C5865D"/>
              <circle cx="23.75" cy="83" r="4.5" fill="#C5865D"/>
              <circle cx="10" cy="212" r="4" fill="#C5865D"/>
            </g>
          </svg>
        </span>
        <span className="font-display italic text-xl tracking-widest text-ink-text">Poema</span>
      </Link>

      <div className="flex items-center gap-5 sm:gap-7 text-sm text-ink-muted tracking-wider">
        {/* Explore + Following — hidden on mobile, visible from sm up */}
        <Link
          href="/explore"
          className="hidden sm:block hover:text-ink-text transition-colors duration-200"
        >
          Explore
        </Link>

        {signedIn ? (
          <>
            <Link
              href="/following"
              className="hidden sm:block hover:text-ink-text transition-colors duration-200"
            >
              Following
            </Link>
            <Link
              href="/write"
              className="text-ink-text border border-ink-text/30 px-3 py-1 rounded hover:border-ink-text transition-colors duration-200 text-sm"
            >
              Write
            </Link>
            <UserMenu
              username={profile!.username!}
              displayName={profile!.display_name || profile!.username!}
            />
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="hidden sm:inline text-sm text-ink-muted/70 sm:text-ink-muted hover:text-ink-text transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-xs sm:text-sm text-ink-text border border-ink-text/20 sm:border-ink-text/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded hover:border-ink-text transition-colors duration-200"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
