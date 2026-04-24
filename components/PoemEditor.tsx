'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import type { Poem } from '@/types/poem'

interface Props {
  initialData?: Poem
  // Server action receives the FormData. The "intent" field tells it whether
  // to save as draft or publish.
  action: (formData: FormData) => Promise<void>
  editing?: boolean
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-20"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface FormActionsProps {
  editing: boolean
  initialStatus?: string
}

function FormActions({ editing, initialStatus }: FormActionsProps) {
  const { pending, data } = useFormStatus()
  const pendingIntent = pending ? (data?.get('intent') as string | null) : null

  return (
    <div className="flex items-center gap-5 pt-4 border-t border-ink-text/10">
      {/* Save draft */}
      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className={`border border-ink-text/30 text-ink-muted font-body px-5 py-2 rounded text-sm tracking-wider transition-all duration-200 ${
            pending
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:border-ink-text hover:text-ink-text'
          }`}
        >
          Save draft
        </button>
        {pendingIntent === 'draft' && (
          <span className="text-ink-muted/50">
            <Spinner />
          </span>
        )}
      </div>

      {/* Publish */}
      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className={`border border-ink-text bg-ink-text text-white font-body px-7 py-2 rounded text-sm tracking-wider transition-all duration-200 ${
            pending ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          {editing && initialStatus === 'published' ? 'Save changes' : 'Publish'}
        </button>
        {pendingIntent === 'publish' && (
          <span className="text-ink-muted/50">
            <Spinner />
          </span>
        )}
      </div>

      <Link
        href="/dashboard"
        className="ml-auto font-body italic text-sm text-ink-muted hover:text-ink-text transition-colors"
      >
        cancel
      </Link>
    </div>
  )
}

export default function PoemEditor({ initialData, action, editing = false }: Props) {
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

      <FormActions editing={editing} initialStatus={initialData?.status} />
    </form>
  )
}
