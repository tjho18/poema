export type PoemStatus = 'draft' | 'scheduled' | 'published'

export interface Poem {
  id: string
  title: string
  content: string
  tags: string[]
  author_id: string | null
  slug: string | null
  status: PoemStatus
  published_at: string | null
  scheduled_for: string | null
  collection_id: string | null
  collection_position: number | null
  created_at: string
  updated_at: string
  // Social features
  responding_to_poem_id: string | null
  form: string | null
  audio_url: string | null
  prompt_id: string | null
}

// Row shape returned by the public_poems view (poem + author join).
export interface PublicPoem extends Poem {
  author_username: string
  author_display_name: string | null
  author_avatar_url: string | null
}

// A daily prompt the whole community writes to.
export interface Prompt {
  id: string
  date: string
  text: string
  created_at: string
}

// Slim cross-reference for "in response to" display.
export interface PoemRef {
  id: string
  title: string | null
  slug: string | null
  author_username: string
  author_display_name: string | null
}
