'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSmartPunctuation } from '@/hooks/useSmartPunctuation'
import type { Poem } from '@/types/poem'

interface Props {
  initialData?:  Poem
  /** Server action. Returns { url } for sheet mode; caller may also redirect(). */
  action:        (formData: FormData) => Promise<{ url: string } | void>
  editing?:      boolean
  /** Sheet mode: called with the redirect URL after a successful publish */
  onPublished?:  (url: string) => void
  /** Sheet mode: called when user taps the dismiss/back button */
  onDismiss?:    () => void
  /** True when rendered inside the WriteSheet overlay */
  sheetMode?:    boolean
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function nativeConfirm(message: string): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dialog = await import('@capacitor/dialog' as any)
      const { value } = await dialog.Dialog.confirm({
        title: 'Unsaved changes', message, okButtonTitle: 'Discard',
      })
      return value
    }
  } catch {}
  return window.confirm(message)
}

export default function WriteEditor({
  initialData,
  action,
  editing   = false,
  onPublished,
  onDismiss,
  sheetMode = false,
}: Props) {
  const router = useRouter()
  const { transform } = useSmartPunctuation()

  const [title,        setTitle       ] = useState(initialData?.title   ?? '')
  const [body,         setBody        ] = useState(initialData?.content ?? '')
  const [words,        setWords       ] = useState(wordCount(initialData?.content ?? ''))
  const [savedTime,    setSavedTime   ] = useState<string | null>(null)
  const [pendingIntent,setPendingIntent] = useState<string | null>(null)
  const [kbOffset,     setKbOffset    ] = useState(0)   // visual viewport keyboard height

  const formRef   = useRef<HTMLFormElement>(null)
  const debounce  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved = useRef(initialData?.content ?? '')

  // ─── Keyboard avoidance via visualViewport ────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    function onResize() {
      setKbOffset(Math.max(0, window.innerHeight - vv!.height - vv!.offsetTop))
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
    }
  }, [])

  // ─── Autosave — 2s debounce ───────────────────────────────────────────────
  const autosave = useCallback(async (t: string, b: string) => {
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    fd.set('title',   t)
    fd.set('content', b)
    fd.set('intent',  'draft')
    if (initialData?.id) fd.set('poem_id', initialData.id)
    try {
      await action(fd)
      lastSaved.current = b
      setSavedTime(nowTime())
    } catch {}
  }, [action, initialData?.id])

  function scheduleAutosave(t: string, b: string) {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => autosave(t, b), 2000)
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value } = transform(e.target.value)
    setBody(value)
    setWords(wordCount(value))
    scheduleAutosave(title, value)
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = transform(e.target.value)
    setTitle(value)
    scheduleAutosave(value, body)
  }

  async function submit(intent: string) {
    if (pendingIntent) return
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    fd.set('title',   title)
    fd.set('content', body)
    fd.set('intent',  intent)
    if (initialData?.id) fd.set('poem_id', initialData.id)
    setPendingIntent(intent)
    try {
      const result = await action(fd)
      // Sheet mode: action returns { url } rather than redirecting
      if (intent === 'publish' && onPublished && result && 'url' in result) {
        onPublished(result.url as string)
      }
    } finally {
      setPendingIntent(null)
    }
  }

  async function handleBack() {
    const hasChanges = body !== lastSaved.current
    if (hasChanges) {
      const ok = await nativeConfirm('You have unsaved changes. Discard and go back?')
      if (!ok) return
    }
    if (onDismiss) {
      onDismiss()
    } else {
      router.back()
    }
  }

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
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
      if (e.key === 'Escape' && !sheetMode) {
        handleBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [title, body, autosave, sheetMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const publishLabel = editing && initialData?.status === 'published' ? 'Save' : 'Publish'
  const canPublish   = body.trim().length > 0 && !pendingIntent

  return (
    <div
      className="flex flex-col select-none"
      style={{
        height:          '100%',
        backgroundColor: '#0C0B1A',
        paddingTop:      sheetMode
          ? '12px'
          : `max(64px, calc(env(safe-area-inset-top) + 52px))`,
        paddingBottom:   `calc(${kbOffset}px + ${sheetMode ? '16px' : '96px'})`,
        transition:      'padding-bottom 200ms ease',
        overflow:        'hidden',
        display:         'flex',
        flexDirection:   'column',
      }}
    >
      <form ref={formRef} className="flex flex-col flex-1 px-6 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          {/* Back / Cancel */}
          <button
            type="button"
            onClick={handleBack}
            className="font-sans"
            style={{
              fontSize:   sheetMode ? '17px' : '16px',
              color:      'rgba(234,223,197,0.40)',
              lineHeight: 1,
              // 44pt minimum touch target
              minWidth:  '44px',
              minHeight: '44px',
              display:   'flex',
              alignItems:    'center',
              justifyContent: 'flex-start',
            }}
            aria-label={sheetMode ? 'Cancel' : 'Go back'}
          >
            {sheetMode ? (
              <span style={{ fontSize: '15px', letterSpacing: '0.01em' }}>Cancel</span>
            ) : (
              '←'
            )}
          </button>

          <div className="flex items-center gap-4">
            {/* Word counter */}
            <span
              className="font-sans"
              style={{ fontSize: '11px', color: 'rgba(234,223,197,0.35)' }}
              aria-label={`${words} words`}
            >
              {words > 0 ? words : ''}
            </span>

            {/* Publish pill */}
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => submit('publish')}
              className="font-sans rounded-full transition-all duration-200"
              style={{
                fontSize:        '13px',
                letterSpacing:   '0.02em',
                padding:         '7px 18px',
                minHeight:       '34px',
                backgroundColor: canPublish ? '#B97A55' : 'transparent',
                color:           canPublish ? '#FAF6EE' : 'rgba(234,223,197,0.18)',
                border:          canPublish ? 'none' : '0.5px solid rgba(234,223,197,0.18)',
                cursor:          canPublish ? 'pointer' : 'default',
              }}
            >
              {pendingIntent === 'publish' ? '…' : publishLabel}
            </button>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <input
          name="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="untitled"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          className="bg-transparent border-none outline-none font-serif italic w-full flex-shrink-0"
          style={{
            fontSize:   '22px',
            lineHeight: '30px',
            color:      title ? '#EADFC5' : 'rgba(234,223,197,0.22)',
            caretColor: '#B97A55',
          } as React.CSSProperties}
        />

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div
          className="my-5 w-full flex-shrink-0"
          style={{ borderTop: '0.5px solid rgba(234,223,197,0.10)' }}
        />

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <textarea
          name="content"
          value={body}
          onChange={handleBodyChange}
          placeholder="begin here…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          className="bg-transparent border-none outline-none font-serif resize-none flex-1 w-full"
          style={{
            fontSize:   '15px',
            lineHeight: '30px',
            color:      '#EADFC5',
            caretColor: '#B97A55',
            overflowY:  'auto',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        />
      </form>

      {/* Draft saved indicator */}
      {savedTime && (
        <p
          className="px-6 pt-2 font-serif italic pointer-events-none flex-shrink-0"
          style={{ fontSize: '10px', color: 'rgba(234,223,197,0.18)' }}
        >
          draft saved · {savedTime}
        </p>
      )}
    </div>
  )
}
