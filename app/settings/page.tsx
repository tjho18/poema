import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/auth'
import NavBar from '@/components/NavBar'
import type { SocialLinks } from '@/types/profile'

export const metadata = { title: 'Settings — Poema' }
export const dynamic  = 'force-dynamic'

export default async function SettingsPage() {
  const { user, profile } = await requireUser()
  const socialLinks: SocialLinks = profile.social_links ?? {}
  const tipUrl: string = profile.tip_url ?? ''

  async function updateProfile(formData: FormData) {
    'use server'
    const supabase = await createServerSupabaseClient()
    const { data: { user: me } } = await supabase.auth.getUser()
    if (!me) redirect('/signin')

    const displayName = (formData.get('display_name') as string).trim()
    const bio         = (formData.get('bio')          as string).trim()
    const twitter     = (formData.get('twitter')      as string).trim().replace(/^@/, '')
    const instagram   = (formData.get('instagram')    as string).trim().replace(/^@/, '')
    const website     = (formData.get('website')      as string).trim()
    const tip_url     = (formData.get('tip_url')      as string).trim()

    const social_links: Record<string, string> = {}
    if (twitter)   social_links.twitter   = twitter
    if (instagram) social_links.instagram = instagram
    if (website)   social_links.website   = website

    await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        bio:          bio || null,
        social_links,
        tip_url:      tip_url || null,
      })
      .eq('id', me.id)

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    if (profile.username) revalidatePath(`/${profile.username}`)
    redirect('/settings')
  }

  const inputClass = "w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-body italic text-sm focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/30"

  return (
    <div className="min-h-screen px-4 sm:px-8 pt-20 pb-16 sm:py-24">
      <NavBar />
      <div className="max-w-md mx-auto">

        <div className="mb-12 border-b border-ink-text/10 pb-6">
          <h1 className="font-display italic text-2xl text-ink-text tracking-wide">Settings</h1>
          <p className="font-body italic text-ink-muted text-xs mt-1">@{profile.username}</p>
        </div>

        <form action={updateProfile} className="space-y-10">

          {/* ── Identity ── */}
          <section className="space-y-8">
            <p className="font-body text-xs text-ink-muted/50 tracking-widest uppercase">Identity</p>

            <div>
              <label htmlFor="display_name" className="block font-body italic text-sm text-ink-muted mb-2">
                Display name
                <span className="ml-2 text-ink-muted/50 not-italic text-xs">how your name appears to readers</span>
              </label>
              <input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={profile.display_name ?? ''}
                placeholder={profile.username ?? ''}
                maxLength={60}
                className="w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-display italic text-xl focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/30"
              />
              <p className="mt-2 font-body text-xs text-ink-muted/60">
                If left blank, your username <span className="italic">@{profile.username}</span> is shown instead.
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block font-body italic text-sm text-ink-muted mb-2">
                Bio
                <span className="ml-2 text-ink-muted/50 not-italic text-xs">a few words about you</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={300}
                defaultValue={profile.bio ?? ''}
                placeholder="a poet who…"
                className="w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-body italic text-sm focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/30 resize-none"
              />
            </div>
          </section>

          {/* ── Links ── */}
          <section className="space-y-6">
            <p className="font-body text-xs text-ink-muted/50 tracking-widest uppercase">Links</p>

            <div>
              <label htmlFor="twitter" className="block font-body italic text-sm text-ink-muted mb-2">
                Twitter / X
              </label>
              <div className="flex items-end gap-2 border-b border-ink-text/30 pb-2 focus-within:border-ink-text transition-colors">
                <span className="font-body italic text-sm text-ink-muted/50 pb-0.5">@</span>
                <input
                  id="twitter"
                  name="twitter"
                  type="text"
                  defaultValue={socialLinks.twitter ?? ''}
                  placeholder="handle"
                  maxLength={50}
                  className="flex-1 bg-transparent border-none outline-none text-ink-text font-body italic text-sm placeholder:text-ink-muted/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="instagram" className="block font-body italic text-sm text-ink-muted mb-2">
                Instagram
              </label>
              <div className="flex items-end gap-2 border-b border-ink-text/30 pb-2 focus-within:border-ink-text transition-colors">
                <span className="font-body italic text-sm text-ink-muted/50 pb-0.5">@</span>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  defaultValue={socialLinks.instagram ?? ''}
                  placeholder="handle"
                  maxLength={50}
                  className="flex-1 bg-transparent border-none outline-none text-ink-text font-body italic text-sm placeholder:text-ink-muted/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block font-body italic text-sm text-ink-muted mb-2">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                defaultValue={socialLinks.website ?? ''}
                placeholder="https://yoursite.com"
                maxLength={200}
                className={inputClass}
              />
            </div>
          </section>

          {/* ── Support ── */}
          <section className="space-y-4">
            <p className="font-body text-xs text-ink-muted/50 tracking-widest uppercase">Support</p>
            <div>
              <label htmlFor="tip_url" className="block font-body italic text-sm text-ink-muted mb-2">
                Tip jar link
                <span className="ml-2 text-ink-muted/50 not-italic text-xs">Ko-fi, Buy Me a Coffee, Venmo, etc.</span>
              </label>
              <input
                id="tip_url"
                name="tip_url"
                type="url"
                defaultValue={tipUrl}
                placeholder="https://ko-fi.com/yourname"
                maxLength={300}
                className={inputClass}
              />
              <p className="mt-2 font-body text-xs text-ink-muted/60">
                Shown as a quiet link on your profile — readers support you directly.
              </p>
            </div>
          </section>

          <button
            type="submit"
            className="border border-ink-text bg-ink-text text-white font-body px-7 py-2 rounded text-sm tracking-wider hover:opacity-80 transition-opacity duration-200"
          >
            Save
          </button>
        </form>

      </div>
    </div>
  )
}
