import Link from 'next/link'
import type { Poem } from '@/types/poem'

interface Byline {
  username: string
  displayName: string | null
}

interface Props {
  poem: Poem
  byline?: Byline
  // Override the default link URL. Defaults to /{username}/p/{slug}
  // when byline is provided, else falls back to /poems/{id}.
  href?: string
}

// No borders — cards are defined purely by spacing and typography weight.
// Hover: the faintest background tint, like a thumb resting on a page.
export default function PoemCard({ poem, byline, href }: Props) {
  const previewLines = poem.content.split('\n').slice(0, 3).join('\n')
  const target =
    href ??
    (byline && poem.slug
      ? `/${byline.username}/p/${poem.slug}`
      : `/poems/${poem.id}`)

  return (
    <Link
      href={target}
      className="group block px-6 py-7 rounded hover:bg-black/[0.025] transition-colors duration-300"
    >
      {poem.title && (
        <h2 className="font-display italic font-semibold text-lg text-ink-text mb-1 group-hover:opacity-70 transition-opacity duration-200">
          {poem.title}
        </h2>
      )}

      {byline && (
        <p className={`font-body italic text-xs text-ink-muted/70 mb-4 ${poem.title ? '' : 'mt-0'}`}>
          — {byline.displayName || byline.username}
        </p>
      )}
      {!byline && <div className="mb-4" />}

      <p className="font-body text-ink-muted text-base leading-relaxed whitespace-pre-line line-clamp-3">
        {previewLines}
      </p>

    </Link>
  )
}
