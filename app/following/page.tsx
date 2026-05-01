import { requireUser } from '@/lib/auth'
import { getFollowingFeed } from '@/lib/queries'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoemCard from '@/components/PoemCard'
import type { PublicPoem } from '@/types/poem'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Following — Poema' }

export default async function FollowingPage() {
  const { user } = await requireUser()
  const poems: PublicPoem[] = await getFollowingFeed(user.id)

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-20 pb-16 sm:py-24">
      <GradientBackground />
      <NavBar />

      <div className="max-w-xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display italic text-3xl text-ink-text tracking-wide">
            Following
          </h1>
        </div>

        {poems.length === 0 ? (
          <p className="text-center font-body italic text-ink-muted mt-20">
            follow some poets to see their poems here.
          </p>
        ) : (
          <div className="divide-y divide-ink-text/10">
            {poems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={poem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
