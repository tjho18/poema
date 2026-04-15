'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Poem } from '@/lib/supabase'
import PoemDisplay from '@/components/PoemDisplay'
import TagFilter from '@/components/TagFilter'

interface HomeClientProps {
  poems: Poem[]
  allTags: string[]
}

export default function HomeClient({ poems, allTags }: HomeClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [featured, setFeatured] = useState<Poem | null>(() =>
    poems.length > 0 ? poems[Math.floor(Math.random() * poems.length)] : null
  )
  const [animKey, setAnimKey] = useState(0)

  const filtered = activeTag
    ? poems.filter(p => p.tags?.includes(activeTag))
    : poems

  const pickRandom = useCallback(() => {
    const pool = activeTag ? filtered : poems
    if (pool.length === 0) return
    const next = pool[Math.floor(Math.random() * pool.length)]
    setFeatured(next)
    setAnimKey(k => k + 1)
  }, [poems, filtered, activeTag])

  const handleTagSelect = (tag: string | null) => {
    setActiveTag(tag)
    if (tag) {
      const pool = tag ? poems.filter(p => p.tags?.includes(tag)) : poems
      if (pool.length > 0) {
        setFeatured(pool[Math.floor(Math.random() * pool.length)])
        setAnimKey(k => k + 1)
      }
    }
  }

  if (poems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <p className="font-serif text-2xl text-parchment-muted mb-4">No poems yet.</p>
        <p className="font-sans text-sm text-parchment-dim/50 tracking-widest uppercase">
          Add your first poem in the{' '}
          <Link href="/admin" className="text-gold hover:underline">admin panel</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-32">

      {/* Featured poem */}
      {featured && (
        <div key={animKey} className="page-enter w-full max-w-2xl mb-20 text-center">
          <Link href={`/poems/${featured.id}`} className="group block">
            <h1 className="font-serif text-3xl md:text-4xl text-parchment mb-10 gold-glow leading-tight group-hover:text-gold transition-colors duration-500">
              {featured.title}
            </h1>
          </Link>

          <div className="text-center">
            <PoemDisplay content={featured.content} animate />
          </div>

          {/* Tags on featured */}
          {featured.tags && featured.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-8">
              {featured.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] tracking-[0.2em] uppercase font-sans text-gold-dim border border-gold-dim/30 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-16 bg-gradient-to-b from-gold/20 to-transparent mb-10" />

      {/* Controls */}
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">

        {/* Read me anything */}
        <button
          onClick={pickRandom}
          className="group font-sans text-xs tracking-[0.3em] uppercase text-parchment-muted hover:text-gold border border-parchment-dim/20 hover:border-gold/40 px-8 py-3 rounded-full transition-all duration-300"
        >
          <span className="mr-2 text-gold/60 group-hover:text-gold transition-colors">◈</span>
          Read me anything
        </button>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="w-full">
            <p className="text-center text-[10px] tracking-[0.3em] uppercase font-sans text-parchment-dim/40 mb-4">
              Browse by mood
            </p>
            <TagFilter tags={allTags} activeTag={activeTag} onSelect={handleTagSelect} />
          </div>
        )}

        {/* Explore link */}
        <Link
          href="/explore"
          className="font-sans text-xs tracking-[0.25em] uppercase text-parchment-dim/40 hover:text-parchment-muted transition-colors duration-300 mt-2"
        >
          View all {poems.length} poems →
        </Link>
      </div>
    </div>
  )
}
