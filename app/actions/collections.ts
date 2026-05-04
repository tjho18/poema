'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── Create a new collection ────────────────────────────────────────────────
export async function createCollection(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name      = (formData.get('name')      as string).trim()
  const isPublic  = formData.get('is_public') === 'true'

  if (!name) throw new Error('Collection name is required')

  const { data, error } = await supabase
    .from('reader_collections')
    .insert({ reader_id: user.id, name, is_public: isPublic })
    .select('id')
    .single()

  if (error) throw error

  revalidatePath('/collections')
  return { id: data.id }
}

// ── Rename / toggle visibility ─────────────────────────────────────────────
export async function updateCollection(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id       = formData.get('collection_id') as string
  const name     = (formData.get('name')         as string).trim()
  const isPublic = formData.get('is_public') === 'true'

  const { error } = await supabase
    .from('reader_collections')
    .update({ name: name || undefined, is_public: isPublic })
    .eq('id', id)
    .eq('reader_id', user.id)   // ownership check

  if (error) throw error

  revalidatePath('/collections')
}

// ── Delete a collection ────────────────────────────────────────────────────
export async function deleteCollection(collectionId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reader_collections')
    .delete()
    .eq('id', collectionId)
    .eq('reader_id', user.id)

  if (error) throw error

  revalidatePath('/collections')
}

// ── Add a poem to a collection ─────────────────────────────────────────────
export async function addPoemToCollection(collectionId: string, poemId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: col } = await supabase
    .from('reader_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('reader_id', user.id)
    .single()
  if (!col) throw new Error('Collection not found')

  const { error } = await supabase
    .from('reader_collection_poems')
    .upsert({ collection_id: collectionId, poem_id: poemId }, { onConflict: 'collection_id,poem_id' })

  if (error) throw error

  revalidatePath('/collections')
  return { ok: true }
}

// ── Remove a poem from a collection ───────────────────────────────────────
export async function removePoemFromCollection(collectionId: string, poemId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: col } = await supabase
    .from('reader_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('reader_id', user.id)
    .single()
  if (!col) throw new Error('Collection not found')

  const { error } = await supabase
    .from('reader_collection_poems')
    .delete()
    .eq('collection_id', collectionId)
    .eq('poem_id', poemId)

  if (error) throw error

  revalidatePath('/collections')
  return { ok: true }
}

// ── Get current user's collections (for picker UI) ────────────────────────
export async function getMyCollections() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reader_collections')
    .select('id, name, is_public')
    .eq('reader_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
