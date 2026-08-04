import Link from 'next/link'
import { poemTitle, poemTags, type Poem } from '@/types/poem'

interface Props {
  poem: Poem
}

// No borders — cards are defined purely by spacing and typography weight.
// Hover: the faintest background tint, like a thumb resting on a page.
export default function PoemCard({ poem }: Props) {
  const previewLines = poem.content.split('\n').slice(0, 3).join('\n')

  return (
    <Link
      href={`/poems/${poem.id}`}
      className="group block px-6 py-7 rounded hover:bg-black/[0.025] transition-colors duration-300"
    >
      <h2 className="font-display italic font-semibold text-lg text-ink-text mb-4 group-hover:opacity-70 transition-opacity duration-200">
        {poemTitle(poem)}
      </h2>

      <p className="font-body text-ink-muted text-base leading-relaxed whitespace-pre-line line-clamp-3">
        {previewLines}
      </p>

      {poemTags(poem).length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-5">
          {poemTags(poem).map(tag => (
            <span key={tag} className="font-body italic text-xs text-ink-muted/70">
              [{tag}]
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
