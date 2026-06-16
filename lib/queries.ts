import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Poem, PublicPoem, Prompt, PoemRef, PoemComment } from '@/types/poem'
import type { Profile } from '@/types/profile'

// Platform-wide feed: latest published poems across all poets.
export async function getRecentPlatformPoems(limit = 30): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
    .limit(limit)
  return (data as PublicPoem[]) ?? []
}

// The hero poem on the homepage — we load the latest N and let the client
// pick a random one (keeps the "another poem" cycle quick without re-fetch).
export async function getHeroPool(limit = 40): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
    .limit(limit)
  return (data as PublicPoem[]) ?? []
}

// Look up a poet's profile by username (case-insensitive).
export async function getPoetByUsername(username: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle<Profile>()
  return data ?? null
}

// All published poems by a given poet.
export async function getPoemsByPoet(authorId: string): Promise<Poem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', authorId)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
  return (data as Poem[]) ?? []
}

// Fetch a specific poem by author + slug, but only if it's readable
// under RLS (either published-and-due, or the current user owns it).
export async function getPoemByAuthorAndSlug(
  authorId: string,
  slug: string,
): Promise<Poem | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', authorId)
    .eq('slug', slug)
    .maybeSingle<Poem>()
  return data ?? null
}

// All of a user's own poems (any status) — for dashboard.
export async function getMyPoems(userId: string): Promise<Poem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('poems')
    .select('*')
    .eq('author_id', userId)
    .order('updated_at', { ascending: false })
  return (data as Poem[]) ?? []
}

// Today's daily prompt (returns null if none seeded for today).
export async function getTodayPrompt(): Promise<Prompt | null> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('date', today)
    .maybeSingle<Prompt>()
  return data ?? null
}

// All published poems written for a given prompt.
export async function getPromptPoems(promptId: string): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .eq('prompt_id', promptId)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
  return (data as PublicPoem[]) ?? []
}

// The poem a given poem is "responding to" (for attribution display).
export async function getRespondingTo(poemId: string): Promise<PoemRef | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('id, title, slug, author_username, author_display_name')
    .eq('id', poemId)
    .maybeSingle()
  if (!data) return null
  return {
    id:                  data.id,
    title:               data.title ?? null,
    slug:                data.slug ?? null,
    author_username:     data.author_username,
    author_display_name: data.author_display_name ?? null,
  }
}

// Poems that are responses to a given poem.
export async function getResponses(poemId: string): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .eq('responding_to_poem_id', poemId)
    .order('published_at', { ascending: false, nullsFirst: false })
  return (data as PublicPoem[]) ?? []
}

// Margin notes (comments) on a poem, oldest first, with author names embedded.
export async function getComments(poemId: string): Promise<PoemComment[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('comments')
    .select('id, body, created_at, author_id, author:profiles(username, display_name)')
    .eq('poem_id', poemId)
    .order('created_at', { ascending: true })

  type Row = {
    id: string
    body: string
    created_at: string
    author_id: string
    author: { username: string; display_name: string | null } | null
  }

  return ((data as Row[] | null) ?? []).map(r => ({
    id:                  r.id,
    body:                r.body,
    created_at:          r.created_at,
    author_id:           r.author_id,
    author_username:     r.author?.username ?? '',
    author_display_name: r.author?.display_name ?? null,
  }))
}

// Number of likes on a poem. RLS means a non-zero result only comes back
// for the poem's author (counts are private to the poet).
export async function getLikeCount(poemId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('likes')
    .select('poem_id', { count: 'exact', head: true })
    .eq('poem_id', poemId)
  return count ?? 0
}

// Whether a specific viewer has liked a poem.
export async function getViewerLiked(poemId: string, userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('likes')
    .select('poem_id', { count: 'exact', head: true })
    .eq('poem_id', poemId)
    .eq('user_id', userId)
  return (count ?? 0) > 0
}

// Feed of published poems from poets the user follows.
export async function getFollowingFeed(userId: string): Promise<PublicPoem[]> {
  const supabase = await createServerSupabaseClient()
  // Get followee IDs
  const { data: follows } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId)
  const followeeIds = (follows ?? []).map((f: { followee_id: string }) => f.followee_id)
  if (followeeIds.length === 0) return []
  const { data } = await supabase
    .from('public_poems')
    .select('*')
    .in('author_id', followeeIds)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at',   { ascending: false })
  return (data as PublicPoem[]) ?? []
}
