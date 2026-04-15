import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <AdminLogin />
  }

  const { data: poems } = await supabase
    .from('poems')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminDashboard poems={poems ?? []} userEmail={user.email ?? ''} />
}
