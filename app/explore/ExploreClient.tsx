'use client'

import { useState } from 'react'
import type { Poem } from '@/lib/supabase'
import PoemCard from '@/components/PoemCard'
import TagFilter from '@/components/TagFilter'

interface ExploreClientProps {
  poems: Poem[]
  allTags: string[]
  initialTag: string | null
}

export default function ExploreClient({ poems, allTags, initialTag }: ExploreClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(initialTag)

  const filtered = activeTag
    ? poems.filter(p => p.tags?.includes(activeTag))
    : poems

  return (
    <>
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-12">
          <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        </div>
      )}

      {/* Count */}
      {activeTag && (
        <p className="text-center text-xs font-sans tracking-[0.2em] uppercase text-parchment-dim/40 mb-8">
          {filtered.length} poem{filtered.length !== 1 ? 's' : ''} tagged &ldquo;{activeTag}&rdquo;
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center font-serif text-xl text-parchment-muted mt-20">
          No poems found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((poem, i) => (
            <PoemCard key={poem.id} poem={poem} index={i} />
          ))}
        </div>
      )}
    </>
  )
}
