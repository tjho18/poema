import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPoet, getPoemsByPoet } from '@/lib/db'
import { poetName, poemTitle, poemTags } from '@/types/poem'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemDisplay from '@/components/PoemDisplay'
import PoemCard from '@/components/PoemCard'

/**
 * `poema.app/{username}` — a poet.
 *
 * Opens with a poem, not a list. A page that begins with a table of contents asks
 * the visitor to choose before they have read anything, and they mostly choose to
 * leave; a page that begins with a poem gets read. The rest of the work sits
 * underneath for anyone the first poem convinced.
 *
 * The newest poem leads, rather than the best-loved. "Best" would need something
 * to rank by, and nothing in Poema ranks on purpose — the feeds were deliberately
 * unranked so no poem stays buried. Newest is also self-updating: a poet who
 * publishes gets a new first impression for free.
 */
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const poet = await getPoet(username)
  if (!poet) return { title: 'Poet not found — Poema' }

  const name = poetName(poet)
  const description = poet.bio?.trim() || `Poems by ${name} on Poema`

  return {
    title: `${name} — Poema`,
    description,
    openGraph: { title: name, description, type: 'profile' },
    twitter: { card: 'summary', title: name, description },
  }
}

export default async function PoetPage({ params }: Props) {
  const { username } = await params
  const poet = await getPoet(username)
  if (!poet) notFound()

  const poems = await getPoemsByPoet(username)
  const [lead, ...rest] = poems
  const name = poetName(poet)

  return (
    <div className="min-h-screen px-6 py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-4xl mx-auto">
        {/* The poem first. Everything about who wrote it comes after it. */}
        {lead ? (
          <div className="max-w-lg mx-auto mb-16">
            <PoemDisplay
              title={poemTitle(lead)}
              content={lead.content}
              tags={poemTags(lead)}
              animate={false}
              showTags={true}
            />
          </div>
        ) : null}

        <div className="text-center mb-16">
          <h1 className="font-display text-3xl text-ink-accent mb-3 tracking-wide">
            {name}
          </h1>
          {poet.username ? (
            <p className="font-body text-ink-muted text-sm mb-4">@{poet.username}</p>
          ) : null}
          {poet.bio?.trim() ? (
            <p className="font-body italic text-ink-muted text-sm max-w-md mx-auto leading-relaxed">
              {poet.bio}
            </p>
          ) : null}

          <PoetLinks poet={poet} />
        </div>

        {rest.length > 0 ? (
          <>
            <p className="text-center font-body text-ink-muted/70 text-xs tracking-widest mb-8">
              {rest.length === 1 ? 'ONE MORE POEM' : `${rest.length} MORE POEMS`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map(poem => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          </>
        ) : null}

        {poems.length === 0 ? (
          <p className="text-center font-body text-ink-muted mt-8">
            {name} hasn&apos;t published anything yet.
          </p>
        ) : null}

        <div className="flex justify-center gap-8 mt-16">
          <Link
            href="/explore"
            className="font-body italic text-xs text-ink-muted/60 hover:text-ink-muted tracking-widest transition-colors"
          >
            ← all poems
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * The poet's own links, which is most of the reason a poet shares their page.
 * Handles are stored bare, so each becomes a URL here — the same mapping
 * `PoetLinkKind` performs in the app.
 */
function PoetLinks({ poet }: { poet: Awaited<ReturnType<typeof getPoet>> }) {
  if (!poet) return null
  const links = poet.social_links ?? {}

  const entries: { label: string; href: string }[] = []
  const handle = (key: string, prefix: string) => {
    const value = links[key]?.trim()
    if (value) entries.push({ label: key, href: prefix + value })
  }
  handle('twitter', 'https://x.com/')
  handle('instagram', 'https://instagram.com/')
  handle('threads', 'https://www.threads.net/@')
  handle('tiktok', 'https://www.tiktok.com/@')
  handle('youtube', 'https://www.youtube.com/@')

  const substack = links.substack?.trim()
  if (substack) {
    entries.push({
      label: 'substack',
      href: substack.includes('.') ? withScheme(substack) : `https://${substack}.substack.com`,
    })
  }
  const site = links.website?.trim() ?? poet.website?.trim()
  if (site) entries.push({ label: 'website', href: withScheme(site) })
  if (poet.tip_url?.trim()) {
    entries.push({ label: 'support this poet', href: withScheme(poet.tip_url.trim()) })
  }

  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
      {entries.map(entry => (
        <a
          key={entry.label}
          href={entry.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body italic text-xs text-ink-muted/70 hover:text-ink-text tracking-wide transition-colors"
        >
          {entry.label}
        </a>
      ))}
    </div>
  )
}

/** People type "poema.app", not "https://poema.app". */
function withScheme(value: string): string {
  return /^https?:\/\//.test(value) ? value : `https://${value}`
}
