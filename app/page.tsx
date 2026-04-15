import { createServerSupabaseClient } from '@/lib/supabase-server'
import GradientBackground from '@/components/GradientBackground'
import NavBar from '@/components/NavBar'
import HomeClient from './HomeClient'
import type { Poem } from '@/lib/supabase'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: poems } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  const allPoems: Poem[] = poems ?? []

  // Collect unique tags
  const tagSet = new Set<string>()
  allPoems.forEach(p => p.tags?.forEach((t: string) => tagSet.add(t)))
  const allTags = Array.from(tagSet).sort()

  return (
    <>
      <GradientBackground />
      <NavBar />
      <main className="relative z-10">
        <HomeClient poems={allPoems} allTags={allTags} />
      </main>
    </>
  )
}
