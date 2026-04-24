import Link from 'next/link'
import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poems: PublicPoem[]
}

// Stable daily poem — same for all visitors today, different tomorrow.
function dailyIndex(total: number): number {
  const seed = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % total
}

export default function PlatformFeed({ poems }: Props) {
  if (poems.length === 0) return null

  const potd = poems[dailyIndex(poems.length)]
  const rest = poems.filter(p => p.id !== potd.id)

  return (
    <section className="w-full max-w-xl mx-auto mt-24 mb-16">

      {/* ── Explore heading — desktop only ── */}
      <div className="hidden sm:flex items-center gap-4 mb-10">
        <span className="flex-1 h-px bg-ink-text/10" />
        <Link
          href="/explore"
          className="font-display italic text-xl text-ink-text/80 tracking-widest hover:text-ink-text transition-colors duration-200"
        >
          Explore
        </Link>
        <span className="flex-1 h-px bg-ink-text/10" />
      </div>

      {/* ── Poem of the day ── */}
      <p className="font-body italic text-xs text-ink-muted/50 tracking-widest text-center mb-6 uppercase">
        poem of the day
      </p>

      <Link
        href={`/${potd.author_username}/p/${potd.slug}`}
        className="group block text-center px-6 py-10 mb-14 border-t border-ink-text/10 sm:rounded-sm sm:border sm:border-ink-text/10 sm:hover:border-ink-text/25 transition-colors duration-300"
      >
        {potd.title && (
          <h2 className="font-display italic font-semibold text-2xl text-ink-text mb-6 tracking-wide group-hover:opacity-70 transition-opacity duration-200">
            {potd.title}
          </h2>
        )}
        <div className="font-body text-ink-text text-base leading-loose whitespace-pre-line mb-6 line-clamp-5">
          {potd.content}
        </div>
        <p className="font-body italic text-sm text-ink-muted tracking-wider">
          — {potd.author_display_name || potd.author_username}
        </p>
      </Link>

      {/* ── More poems ── */}
      {rest.length > 0 && (
        <>
          <div className="divide-y divide-ink-text/10">
            {rest.map(p => (
              <PoemCard
                key={p.id}
                poem={p}
                byline={{ username: p.author_username, displayName: p.author_display_name }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
