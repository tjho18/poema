import { createServerSupabaseClient } from '@/lib/supabase-server'
import ExploreClient from './ExploreClient'
import NavBar from '@/components/NavBar'
import type { PublicPoem } from '@/types/poem'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Explore — Poema' }

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })

  const poems: PublicPoem[] = (error ? [] : (data ?? []) as PublicPoem[])
    .map(p => ({ p, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ p }) => p)

  const voiceCount = new Set(poems.map(p => p.author_id)).size

  return (
    <>
      <NavBar />
      <ExploreClient poems={poems} voiceCount={voiceCount} />
    </>
  )
}
