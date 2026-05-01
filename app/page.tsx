import { getHeroPool } from '@/lib/queries'
import PoemReader from '@/components/PoemReader'
import NavBar from '@/components/NavBar'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const poems = await getHeroPool(40)

  return (
    <>
      {/* Desktop only — mobile uses BottomNav from layout */}
      <NavBar />
      <main style={{ height: '100dvh', overflow: 'hidden', background: '#FAF6EE' }}>
        <PoemReader poems={poems} />
      </main>
    </>
  )
}
