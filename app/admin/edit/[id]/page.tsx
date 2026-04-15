import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import PoemForm from '../../PoemForm'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Poem' }

export default async function EditPoemPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const { data: poem } = await supabase.from('poems').select('*').eq('id', id).single()
  if (!poem) notFound()

  return (
    <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="mb-10">
        <a href="/admin" className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-dim/40 hover:text-parchment-muted transition-colors">
          ← Back
        </a>
      </div>
      <h1 className="font-serif text-2xl text-parchment mb-10">Edit Poem</h1>
      <PoemForm poem={poem} />
    </div>
  )
}
