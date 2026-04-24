import { getHeroPool } from '@/lib/queries'
import HomeHeroClient from './HomeHeroClient'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PlatformFeed from '@/components/PlatformFeed'
import FadeInSection from '@/components/FadeInSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const heroPool = await getHeroPool(40)

  return (
    <main className="min-h-screen flex flex-col items-center relative px-6">
      <GradientBackground />
      <NavBar />
      <HomeHeroClient poems={heroPool} />
      <FadeInSection className="w-full">
        <PlatformFeed poems={heroPool} />
      </FadeInSection>
    </main>
  )
}
