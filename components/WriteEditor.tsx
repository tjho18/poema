'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSmartPunctuation } from '@/hooks/useSmartPunctuation'
import type { Poem } from '@/types/poem'

interface Props {
  initialData?: Poem
  action: (formData: FormData) => Promise<void>
  editing?: boolean
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function WriteEditor({ initialData, action, editing = false }: Props) {
  const router = useRouter()
  const { transform } = useSmartPunctuation()

  const [title, setTitle]         = useState(initialData?.title ?? '')
  const [body, setBody]           = useState(initialData?.content ?? '')
  const [words, setWords]         = useState(wordCount(initialData?.content ?? ''))
  const [savedTime, setSavedTime] = useState<string | null>(null)
  const [pendingIntent, setPendingIntent] = useState<string | null>(null)
  const [unsavedSince, setUnsavedSince]   = useState<string | null>(null)

  const formRef    = useRef<HTMLFormElement>(null)
  const debounce   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved  = useRef(initialData?.content ?? '')

  // Autosave — 2s debounce after last keystroke
  const autosave = useCallback(async (currentTitle: string, currentBody: string) => {
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    fd.set('title', currentTitle)
    fd.set('content', currentBody)
    fd.set('intent', 'draft')
    try {
      await action(fd)
      lastSaved.current = currentBody
      setSavedTime(nowTime())
      setUnsavedSince(null)
    } catch {
      // silent — save will retry on next keystroke
    }
  }, [action])

  function scheduleAutosave(newTitle: string, newBody: string) {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => autosave(newTitle, newBody), 2000)
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value
    const { value } = transform(raw)
    // Preserve cursor when no transform happened, set corrected when it did
    setBody(value)
    setWords(wordCount(value))
    setUnsavedSince(value !== lastSaved.current ? nowTime() : null)
    scheduleAutosave(title, value)
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const { value } = transform(raw)
    setTitle(value)
    scheduleAutosave(value, body)
  }

  async function submit(intent: string) {
    if (pendingIntent) return
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    fd.set('title', title)
    fd.set('content', body)
    fd.set('intent', intent)
    setPendingIntent(intent)
    try {
      await action(fd)
    } finally {
      setPendingIntent(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        submit('publish')
      }
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (debounce.current) clearTimeout(debounce.current)
        autosave(title, body)
      }
      if (e.key === 'Escape') {
        const hasChanges = body !== lastSaved.current
        if (hasChanges) {
          if (confirm('You have unsaved changes. Go back?')) router.back()
        } else {
          router.back()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [title, body, autosave, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const publishLabel = editing && initialData?.status === 'published' ? 'Save changes' : 'Publish'
  const canPublish   = body.trim().length > 0 && !pendingIntent

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0C0B1A', paddingTop: '64px', paddingBottom: '96px' }}
    >
      <form ref={formRef} className="flex flex-col flex-1 px-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => {
              const hasChanges = body !== lastSaved.current
              if (hasChanges) {
                if (confirm('You have unsaved changes. Go back?')) router.back()
              } else {
                router.back()
              }
            }}
            className="font-sans"
            style={{ fontSize: '16px', color: 'rgba(234,223,197,0.35)', lineHeight: 1 }}
            aria-label="Go back"
          >
            ←
          </button>

          <div className="flex items-center gap-4">
            {/* Word counter */}
            <span
              className="font-sans font-serif--ui"
              style={{ fontSize: '11px', color: 'rgba(234,223,197,0.35)' }}
              aria-label={`${words} words`}
            >
              {body.trim() === '' ? '0 words' : words}
            </span>

            {/* Publish pill */}
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => submit('publish')}
              className="font-sans rounded-full transition-opacity duration-200"
              style={{
                fontSize: '12px',
                letterSpacing: '0.02em',
                padding: '6px 16px',
                backgroundColor: canPublish ? '#B97A55' : 'transparent',
                color: canPublish ? '#FAF6EE' : 'rgba(234,223,197,0.18)',
                border: canPublish ? 'none' : '0.5px solid rgba(234,223,197,0.18)',
                cursor: canPublish ? 'pointer' : 'default',
              }}
            >
              {pendingIntent === 'publish' ? '…' : publishLabel}
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          name="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="untitled"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="bg-transparent border-none outline-none font-serif italic w-full"
          style={{
            fontSize: '22px',
            lineHeight: '30px',
            color: title ? '#EADFC5' : 'rgba(234,223,197,0.22)',
            caretColor: '#B97A55',
          } as React.CSSProperties}
        />

        {/* Divider */}
        <div
          className="my-5 w-full"
          style={{ borderTop: '0.5px solid rgba(234,223,197,0.10)' }}
        />

        {/* Body */}
        <textarea
          name="content"
          value={body}
          onChange={handleBodyChange}
          placeholder=""
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          rows={20}
          className="bg-transparent border-none outline-none font-serif resize-none flex-1 w-full"
          style={{
            fontSize: '15px',
            lineHeight: '30px',
            color: '#EADFC5',
            caretColor: '#B97A55',
          }}
        />
      </form>

      {/* Draft saved indicator */}
      {savedTime && (
        <p
          className="fixed bottom-8 left-6 font-serif italic pointer-events-none"
          style={{ fontSize: '10px', color: 'rgba(234,223,197,0.18)' }}
        >
          draft saved · {savedTime}
        </p>
      )}
    </div>
  )
}
