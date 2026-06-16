import { getHeroPool } from '@/lib/queries'
import { getCurrentProfile } from '@/lib/auth'
import PoemReader from '@/components/PoemReader'
import NavBar from '@/components/NavBar'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [poems, { user }] = await Promise.all([
    getHeroPool(40),
    getCurrentProfile(),
  ])

  return (
    <>
      {/* Desktop only — mobile uses BottomNav from layout */}
      <NavBar />
      <main style={{ height: '100dvh', overflow: 'hidden', background: '#FAF6EE' }}>
        <PoemReader poems={poems} viewerId={user?.id ?? null} />
      </main>
    </>
  )
}
