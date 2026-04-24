'use client'

import { useEffect, useState } from 'react'

interface Props {
  title: string
  content: string      // raw text with \n line breaks
  tags?: string[]
  animate?: boolean    // false on static detail pages
  showTags?: boolean
}

export default function PoemDisplay({
  title,
  content,
  tags = [],
  animate = true,
  showTags = false,
}: Props) {
  const [key, setKey] = useState(0)

  // Bumping `key` forces React to remount <article>, resetting all CSS animations.
  useEffect(() => {
    if (animate) setKey(k => k + 1)
  }, [content, animate])

  // Normalize line endings (Windows \r\n → \n) before splitting
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  return (
    <article key={key} className="max-w-lg mx-auto px-6 text-center select-text">
      {/* Title: only rendered when the poem has one */}
      {title && (
        <h1 className="font-display italic font-semibold text-2xl md:text-3xl text-ink-text mb-10 tracking-wide">
          {title}
        </h1>
      )}

      {/* Poem body: regular Garamond, generous line height.
          Empty lines become stanza-break spacers so the poet's
          intentional breathing room is preserved on screen. */}
      <div className="font-body text-lg md:text-xl leading-loose text-ink-text">
        {lines.map((line, i) =>
          line.trim() === '' ? (
            // Stanza break — visible gap between stanzas
            <div key={i} className="h-6" />
          ) : (
            <p
              key={i}
              className={animate ? 'poem-line' : 'opacity-100'}
              style={animate ? { animationDelay: `${i * 150}ms` } : undefined}
            >
              {line}
            </p>
          )
        )}
      </div>

      {/* Tags: tiny italic annotations below the poem */}
      {showTags && tags.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-10">
          {tags.map(tag => (
            <span key={tag} className="font-body italic text-sm text-ink-muted">
              [{tag}]
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
