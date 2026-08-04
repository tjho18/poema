/**
 * A published poem, shaped like a row of the `public_poems` view the iOS app
 * reads. Field names are the database's, not this app's, so a query can be
 * `select *` and stay honest.
 *
 * `title` is nullable and `tags` can come back null: the app publishes untitled
 * poems, and stopped generating tags when the Supabase edge function went away.
 */
export interface Poem {
  id: string
  slug: string | null
  title: string | null
  content: string
  tags: string[] | null
  author_id: string | null
  author_username: string | null
  author_display_name: string | null
  published_at: string | null
  created_at: string
}

/**
 * A reader's collection, exactly as the iOS app stores it in `app_records.value`.
 * This shape must track `PoemCollection` in the app — it is the same JSON.
 */
export interface PoemCollection {
  id: string
  name: string
  poemIds: string[]
  createdAt: string
  updatedAt: string
}

/** Poems can be published untitled; the app shows them this way too. */
export function poemTitle(poem: Poem): string {
  return poem.title && poem.title.trim() !== '' ? poem.title : 'untitled'
}

/** The poet's name as the app renders it: display name, else handle. */
export function poemAuthor(poem: Poem): string {
  return poem.author_display_name ?? poem.author_username ?? 'unknown'
}

/** Never null downstream, so components don't each guard it. */
export function poemTags(poem: Poem): string[] {
  return poem.tags ?? []
}
