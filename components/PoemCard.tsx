import Link from 'next/link'
import type { PublicPoem } from '@/types/poem'

interface Props {
  poem: PublicPoem
  variant?: 'dark' | 'light'
  href?: string
}

// Dark variant: first/featured card — ink background, cream text.
// Light variant: standard card — parchment background, ink text.
// Font sizes scale up from mobile (sm:) so the cards stay readable on web.
export default function PoemCard({ poem, variant = 'light', href }: Props) {
  const previewLines = poem.content.split('\n').slice(0, 4).join('\n')
  const target =
    href ??
    (poem.author_username && poem.slug
      ? `/${poem.author_username}/p/${poem.slug}`
      : `/poems/${poem.id}`)

  const authorName = (poem.author_display_name || poem.author_username).toLowerCase()

  if (variant === 'dark') {
    return (
      <Link
        href={target}
        className="block rounded-[12px] p-5 sm:p-8 active:scale-[0.985] transition-transform duration-[120ms]"
        style={{ backgroundColor: '#1B1A2E' }}
      >
        {poem.title && (
          <h2
            className="font-serif italic mb-3 text-[14px] leading-[20px] sm:text-[20px] sm:leading-[28px]"
            style={{ color: '#EADFC5' }}
          >
            {poem.title}
          </h2>
        )}
        <p
          className="font-serif mb-4 text-[11px] leading-[1.7] sm:text-[16px] sm:leading-[1.75]"
          style={{
            color: 'rgba(234,223,197,0.72)',
            whiteSpace: 'pre-wrap',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {previewLines}
        </p>
        <p
          className="font-serif-sc font-serif italic text-[10px] sm:text-[12px]"
          style={{ color: '#B97A55', letterSpacing: '0.04em' }}
        >
          — {authorName}
        </p>
      </Link>
    )
  }

  return (
    <Link
      href={target}
      className="block rounded-[12px] p-5 sm:p-8 bg-parchment active:scale-[0.985] transition-transform duration-[120ms]"
      style={{ border: '0.5px solid rgba(27,26,46,0.10)' }}
    >
      {poem.title && (
        <h2
          className="font-serif italic mb-3 text-[14px] leading-[20px] sm:text-[20px] sm:leading-[28px]"
          style={{ color: '#1B1A2E' }}
        >
          {poem.title}
        </h2>
      )}
      <p
        className="font-serif mb-4 text-[11px] leading-[1.7] sm:text-[16px] sm:leading-[1.75]"
        style={{
          color: '#2C2A40',
          whiteSpace: 'pre-wrap',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {previewLines}
      </p>
      <p
        className="font-serif-sc font-serif text-[10px] sm:text-[12px]"
        style={{ color: '#A89F8C', letterSpacing: '0.04em' }}
      >
        — {authorName}
      </p>
    </Link>
  )
}
