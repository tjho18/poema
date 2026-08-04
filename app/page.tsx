import { getPoems } from '@/lib/db'
import HomeClient from './HomeClient'
import type { Poem } from '@/types/poem'

export const dynamic = 'force-dynamic' // revalidate every minute

export default async function HomePage() {
  const poems: Poem[] = await getPoems()

  return <HomeClient poems={poems} allTags={[]} />
}
