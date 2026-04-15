import { createServerSupabaseClient } from '@/lib/supabase-server'
import GradientBackground from '@/components/GradientBackground'
import NavBar from '@/components/NavBar'
import PoemCard from '@/components/PoemCard'
import ExploreClient from './ExploreClient'
import type { Poem } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse all poems by mood and theme.',
}

export const revalidate = 60

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: poems } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  const allPoems: Poem[] = poems ?? []

  const tagSet = new Set<string>()
  allPoems.forEach(p => p.tags?.forEach((t: string) => tagSet.add(t)))
  const allTags = Array.from(tagSet).sort()

  return (
    <>
      <GradientBackground />
      <NavBar />
      <main className="relative z-10 min-h-screen px-6 pt-32 pb-24 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-parchment mb-4 gold-glow">
            All Poems
          </h1>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-dim/50">
            {allPoems.length} works
          </p>
        </div>

        {/* Client-side filter + grid */}
        <ExploreClient poems={allPoems} allTags={allTags} initialTag={tag ?? null} />
      </main>
    </>
  )
}
