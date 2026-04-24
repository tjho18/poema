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
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-ink-text/10">
      <Link
        href="/"
        className="font-display italic text-xl tracking-widest text-ink-text hover:opacity-60 transition-opacity"
      >
        Poema
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
              className="text-xs sm:text-sm text-ink-muted/70 sm:text-ink-muted hover:text-ink-text transition-colors duration-200"
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
