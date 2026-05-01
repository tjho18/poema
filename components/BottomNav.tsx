import { getCurrentProfile } from '@/lib/auth'
import BottomNavClient from './BottomNavClient'

// Server wrapper reads auth, hands the username to the client tab strip.
// Hidden on desktop (sm+) — desktop uses NavBar.
export default async function BottomNav() {
  const { profile } = await getCurrentProfile()
  return (
    <div className="sm:hidden">
      <BottomNavClient username={profile?.username ?? null} />
    </div>
  )
}
