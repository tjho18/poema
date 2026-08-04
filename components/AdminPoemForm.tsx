'use client'

import { useState } from 'react'
import type { Poem } from '@/types/poem'

interface Props {
  initialData?: Poem
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function AdminPoemForm({ initialData, action, submitLabel }: Props) {
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(', ') ?? ''
  )

  return (
    <form action={action} className="space-y-7 max-w-2xl">
      <div>
        <label htmlFor="title" className="block font-body italic text-sm text-ink-muted mb-2">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title ?? ''}
          placeholder="The title of the poem"
          className="w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-display italic text-xl focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/40"
        />
      </div>

      <div>
        <label htmlFor="content" className="block font-body italic text-sm text-ink-muted mb-2">
          Content
          <span className="ml-2 text-ink-muted/50 not-italic text-xs">(line breaks preserved exactly)</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          defaultValue={initialData?.content ?? ''}
          rows={16}
          placeholder={"the room breathes\nwhere you used to sleep —"}
          className="w-full bg-transparent border border-ink-text/20 rounded px-4 py-3 text-ink-text font-body text-base leading-loose focus:outline-none focus:border-ink-text transition-colors resize-y placeholder:text-ink-muted/40"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block font-body italic text-sm text-ink-muted mb-2">
          Tags
          <span className="ml-2 text-ink-muted/50 not-italic text-xs">comma-separated</span>
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="loneliness, love, existential"
          className="w-full bg-transparent border-b border-ink-text/30 pb-2 text-ink-text font-body text-sm focus:outline-none focus:border-ink-text transition-colors placeholder:text-ink-muted/40"
        />
        {/* Live tag preview as italic annotations */}
        {tagsInput.trim() && (
          <div className="flex flex-wrap gap-x-3 mt-2">
            {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="font-body italic text-xs text-ink-muted">
                [{tag}]
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="border border-ink-text text-ink-text font-body px-7 py-2.5 rounded text-sm tracking-wider hover:bg-ink-text hover:text-white transition-colors duration-200"
      >
        {submitLabel}
      </button>
    </form>
  )
}
