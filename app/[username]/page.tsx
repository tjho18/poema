import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPoetByUsername, getPoemsByPoet } from '@/lib/queries'
import type { SocialLinks } from '@/types/profile'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NavBar from '@/components/NavBar'
import GradientBackground from '@/components/GradientBackground'
import PoetHomeClient from './PoetHomeClient'

interface Props {
  params: Promise<{ username: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) return { title: 'Not found — Poema' }
  const name = poet.display_name || poet.username
  return {
    title: `${name} — Poema`,
    description: `Poems by ${name}`,
  }
}

export default async function PoetLandingPage({ params }: Props) {
  const { username } = await params
  const poet = await getPoetByUsername(username)
  if (!poet?.username) notFound()

  if (username !== poet.username) redirect(`/${poet.username}`)

  const poems = await getPoemsByPoet(poet.id)

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null

  const viewerIsOwner = currentUserId === poet.id

  // Is current user following this poet?
  let initialFollowing = false
  if (currentUserId && !viewerIsOwner) {
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUserId)
      .eq('followee_id', poet.id)
    initialFollowing = (followingCount ?? 0) > 0
  }

  const socialLinks: SocialLinks = poet.social_links ?? {}
  const tipUrl: string | null   = poet.tip_url ?? null

  return (
    <main className="min-h-screen flex flex-col items-center relative px-6">
      <GradientBackground />
      <NavBar />
      <PoetHomeClient
        poems={poems}
        username={poet.username}
        displayName={poet.display_name || poet.username}
        bio={poet.bio ?? null}
        poetId={poet.id}
        viewerIsOwner={viewerIsOwner}
        initialFollowing={initialFollowing}
        socialLinks={socialLinks}
        tipUrl={tipUrl}
      />
    </main>
  )
}
