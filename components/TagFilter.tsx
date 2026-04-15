'use client'

interface TagFilterProps {
  tags: string[]
  activeTag: string | null
  onSelect: (tag: string | null) => void
}

export default function TagFilter({ tags, activeTag, onSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelect(null)}
        className={`tag-pill px-4 py-1.5 rounded-full border text-xs tracking-[0.15em] uppercase font-sans ${
          activeTag === null
            ? 'active border-gold text-gold bg-gold/20'
            : 'border-parchment-dim/30 text-parchment-muted'
        }`}
      >
        All
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
          className={`tag-pill px-4 py-1.5 rounded-full border text-xs tracking-[0.15em] uppercase font-sans ${
            activeTag === tag
              ? 'active border-gold text-gold bg-gold/20'
              : 'border-parchment-dim/30 text-parchment-muted'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
