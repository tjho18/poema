import Link from 'next/link'
import type { Poem } from '@/lib/supabase'

interface PoemCardProps {
  poem: Poem
  index?: number
}

export default function PoemCard({ poem, index = 0 }: PoemCardProps) {
  // Show first ~3 lines as preview
  const preview = poem.content.split('\n').slice(0, 3).join('\n')
  const hasMore = poem.content.split('\n').length > 3

  return (
    <Link
      href={`/poems/${poem.id}`}
      className="poem-card group block border border-parchment-dim/15 rounded-sm p-8 bg-ink-soft hover:bg-ink-muted"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Title */}
      <h2 className="font-serif text-xl text-parchment mb-5 group-hover:text-gold transition-colors duration-300 leading-snug">
        {poem.title}
      </h2>

      {/* Preview */}
      <p className="font-body text-sm text-parchment-muted/80 leading-relaxed whitespace-pre-line mb-6 line-clamp-4">
        {preview}
        {hasMore && '…'}
      </p>

      {/* Tags */}
      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {poem.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-[10px] tracking-[0.15em] uppercase font-sans text-gold-dim border border-gold-dim/30 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Read cue */}
      <span className="text-xs tracking-[0.2em] uppercase font-sans text-parchment-dim/40 group-hover:text-gold/60 transition-colors duration-300">
        Read →
      </span>
    </Link>
  )
}
