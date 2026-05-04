'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import PoemDisplay from '@/components/PoemDisplay'
import ShareButton from '@/components/ShareButton'
import FollowButton from '@/components/FollowButton'
import type { Poem } from '@/types/poem'
import type { SocialLinks } from '@/types/profile'

interface Props {
  poems: Poem[]
  username: string
  displayName: string
  bio: string | null
  poetId: string
  viewerIsOwner: boolean
  initialFollowing: boolean
  socialLinks?: SocialLinks
  tipUrl?: string | null
}

function pickRandom(poems: Poem[], excludeId?: string): Poem | null {
  const pool = poems.length > 1 ? poems.filter(p => p.id !== excludeId) : poems
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function TwitterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function WebsiteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

export default function PoetHomeClient({
  poems,
  username,
  displayName,
  bio,
  poetId,
  viewerIsOwner,
  initialFollowing,
  socialLinks = {},
  tipUrl,
}: Props) {
  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const cyclePoem = useCallback(() => {
    const next = pickRandom(poems, currentPoem?.id)
    if (next) setCurrentPoem(next)
  }, [poems, currentPoem?.id])

  useEffect(() => {
    setCurrentPoem(pickRandom(poems))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      cyclePoem()
    }
  }

  const hasSocialLinks = socialLinks.twitter || socialLinks.instagram || socialLinks.website

  if (poems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-display italic text-3xl text-ink-text mb-3 tracking-wide">{displayName}</h1>
        <p className="font-body italic text-ink-muted text-lg">No poems yet.</p>
      </div>
    )
  }

  return (
    <section
      className="min-h-[80vh] flex flex-col items-center justify-center w-full pt-24 pb-12"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        {currentPoem ? (
          <div className="flex flex-col items-center">
            <PoemDisplay
              title={currentPoem.title}
              content={currentPoem.content}
              tags={currentPoem.tags}
              animate={true}
            />

            {/* Signature + inline follow */}
            <div className="mt-10 flex items-baseline gap-3">
              <p className="font-body italic text-sm text-ink-muted tracking-wider">
                — {displayName}
              </p>
              {!viewerIsOwner && (
                <FollowButton
                  poetId={poetId}
                  initialFollowing={initialFollowing}
                  followerCount={0}
                />
              )}
            </div>

            {/* Bio */}
            {bio && (
              <p className="mt-3 font-body italic text-xs text-ink-muted/60 text-center max-w-xs leading-relaxed">
                {bio}
              </p>
            )}

            {/* Social links */}
            {hasSocialLinks && (
              <div className="mt-4 flex items-center gap-4">
                {socialLinks.twitter && (
                  <a
                    href={`https://x.com/${socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    style={{ color: 'rgba(27,26,46,0.35)', transition: 'color 150ms ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1B1A2E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(27,26,46,0.35)' }}
                  >
                    <TwitterIcon />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    style={{ color: 'rgba(27,26,46,0.35)', transition: 'color 150ms ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1B1A2E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(27,26,46,0.35)' }}
                  >
                    <InstagramIcon />
                  </a>
                )}
                {socialLinks.website && (
                  <a
                    href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    style={{ color: 'rgba(27,26,46,0.35)', transition: 'color 150ms ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1B1A2E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(27,26,46,0.35)' }}
                  >
                    <WebsiteIcon />
                  </a>
                )}
              </div>
            )}

            {/* Tip jar */}
            {tipUrl && (
              <a
                href={tipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 font-body italic"
                style={{
                  fontSize:      '11px',
                  color:         'rgba(27,26,46,0.30)',
                  letterSpacing: '0.02em',
                  transition:    'color 150ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#B97A55' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(27,26,46,0.30)' }}
              >
                support this poet ↗
              </a>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-5 mt-16">
        <button
          onClick={cyclePoem}
          className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          another poem
        </button>

        {currentPoem?.slug && (
          <ShareButton
            title={currentPoem.title}
            poet={displayName}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/p/${currentPoem.slug}`}
            username={username}
            slug={currentPoem.slug}
            className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
          />
        )}

        <Link
          href={`/${username}/poems`}
          className="font-body italic text-sm text-ink-muted/60 hover:text-ink-muted transition-colors tracking-widest"
        >
          all poems →
        </Link>
      </div>
    </section>
  )
}
