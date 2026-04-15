import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
      {/* Subtle backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 to-transparent pointer-events-none" />

      <Link
        href="/"
        className="relative font-serif text-xl tracking-[0.15em] text-gold hover:text-gold-light transition-colors duration-300 gold-glow"
      >
        Poema
      </Link>

      <div className="relative flex items-center gap-8">
        <Link
          href="/explore"
          className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-muted hover:text-parchment transition-colors duration-300"
        >
          Explore
        </Link>
        <Link
          href="/admin"
          className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-muted hover:text-parchment transition-colors duration-300"
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
