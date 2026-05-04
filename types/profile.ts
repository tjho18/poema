export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  slug: string | null
  avatar_url: string | null
  website: string | null
  created_at: string
  // Social features
  social_links: SocialLinks
  tip_url: string | null
}

export interface SocialLinks {
  twitter?:   string  // handle without @
  instagram?: string  // handle without @
  website?:   string  // full URL
}
