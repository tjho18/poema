import { neon } from '@neondatabase/serverless'
import type { Poem, PoemCollection } from '@/types/poem'

/**
 * Reads the iOS app's database directly.
 *
 * Not through Neon's Data API, and this is the whole reason this file exists:
 * that API rejects every request without a JWT —
 *
 *   HTTP 400 — missing authentication credentials:
 *              required authorization bearer token in JWT format
 *
 * — and a visitor to a public poem page has no account, so there is no token to
 * send. The iOS app mints one from a Better Auth session; a stranger following a
 * shared link has neither. Pointing `supabase-js` at the Data API therefore
 * cannot work for public pages, however similar the two APIs look.
 *
 * A direct connection has no such problem, and it runs only on the server, so
 * the credential never reaches a browser. Every page using it must be dynamic
 * (`export const dynamic = 'force-dynamic'`) so `next build` never tries to
 * reach the database.
 *
 * One consequence to hold onto: this connects as the database owner, so **row
 * level security does not apply**. That is what makes `getCollection` possible
 * at all — and it also means every query here must scope itself deliberately.
 * Nothing in this file may return unpublished work or anyone's private rows,
 * which is why they all read `public_poems` and never `poems`.
 */
let client: ReturnType<typeof neon> | null = null

function sql() {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. It is the Neon connection string for the same ' +
        'database the iOS app writes to (Neon console → Connection Details).'
    )
  }
  client = neon(url)
  return client
}

export async function getPoem(id: string): Promise<Poem | null> {
  // A malformed id would make Postgres raise on the uuid cast rather than return
  // nothing, which is a 500 where a 404 belongs.
  if (!isUuid(id)) return null
  const rows = (await sql()`
    select * from public_poems where id = ${id}::uuid limit 1
  `) as Poem[]
  return rows[0] ?? null
}

/**
 * The poem at `poema.app/{username}/{slug}` — the canonical public URL.
 *
 * This, not `/poems/[id]`, is the shape the iOS app builds when it shares a
 * poem (`PoemWebConfig.poemURL`), so it is the one that has to exist for
 * `servesPoemPages` to be flipped on. The id route stays as a permalink.
 *
 * Handles are matched case-insensitively, as the app matches them.
 */
export async function getPoemBySlug(
  username: string,
  slug: string
): Promise<Poem | null> {
  const rows = (await sql()`
    select * from public_poems
    where lower(author_username) = lower(${username}) and slug = ${slug}
    limit 1
  `) as Poem[]
  return rows[0] ?? null
}

export async function getPoems(limit = 60): Promise<Poem[]> {
  return (await sql()`
    select * from public_poems
    order by published_at desc nulls last, created_at desc
    limit ${limit}
  `) as Poem[]
}

export async function getPoemsByTag(tag: string, limit = 60): Promise<Poem[]> {
  return (await sql()`
    select * from public_poems
    where tags @> array[${tag}]::text[]
    order by published_at desc nulls last, created_at desc
    limit ${limit}
  `) as Poem[]
}

export async function getAllTags(): Promise<string[]> {
  const rows = (await sql()`
    select distinct unnest(tags) as tag from public_poems order by tag
  `) as { tag: string }[]
  return rows.map(row => row.tag).filter(Boolean)
}

/**
 * A shared collection.
 *
 * Collections live in `app_records`, whose RLS scopes rows to the reader who
 * wrote them — which is why the iOS app can only share one as text. Those rows
 * are unreadable *through the API*, but not to a direct connection, so a
 * collection can have a public page after all, with no migration.
 *
 * Unlisted rather than public: the key is the collection's own UUID, so the page
 * is reachable only by someone the reader gave the link to. Nothing here lists or
 * enumerates collections, and the owner's `user_id` is never selected.
 */
export async function getCollection(id: string): Promise<PoemCollection | null> {
  if (!isUuid(id)) return null
  const rows = (await sql()`
    select value from app_records
    where record_type = 'collection' and key = ${id}
    limit 1
  `) as { value: PoemCollection }[]
  return rows[0]?.value ?? null
}

/**
 * The poems of a collection, in the order the reader arranged them.
 *
 * Postgres answers `= any(...)` in whatever order it likes, and a collection's
 * order is the point of it, so the order is reapplied here — the same reason
 * `PoemDataService.getPoems(ids:)` does it in the app.
 */
export async function getPoemsByIds(ids: string[]): Promise<Poem[]> {
  const valid = ids.filter(isUuid)
  if (valid.length === 0) return []
  const rows = (await sql()`
    select * from public_poems where id = any(${valid}::uuid[])
  `) as Poem[]
  const byId = new Map(rows.map(row => [row.id, row]))
  return valid
    .map(id => byId.get(id))
    .filter((poem): poem is Poem => Boolean(poem))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}
