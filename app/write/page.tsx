import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createPoemAction } from '@/app/actions/poems'
import WriteEditor from '@/components/WriteEditor'

export const metadata = { title: 'Write — Poema' }
export const dynamic  = 'force-dynamic'

export default async function WritePage() {
  await requireUser() // ensures auth, redirects to /signin if not signed in

  // Wrap the shared action to call redirect() — needed for the full page route.
  // The sheet uses createPoemAction directly and handles navigation client-side.
  async function createAndRedirect(formData: FormData) {
    'use server'
    const { url } = await createPoemAction(formData)
    redirect(url)
  }

  return <WriteEditor action={createAndRedirect} />
}
