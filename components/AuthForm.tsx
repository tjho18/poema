'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

interface Props {
  mode: Mode
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const search = useSearchParams()
  const nextParam = search.get('next') ?? '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [info,  setInfo]        = useState('')
  const [loading, setLoading]   = useState(false)

  const supabase = createClient()

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}`
      : undefined

  async function handleGoogle() {
    setError(''); setInfo(''); setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, the browser navigates away — no further state handling needed.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectTo },
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setInfo('Account created. Check your email to confirm, then sign in.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(nextParam || '/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display italic text-3xl text-ink-text mb-1 text-center tracking-wide">
          Poema
        </h1>
        <p className="font-body italic text-ink-muted text-sm text-center mb-10">
          {mode === 'signin' ? 'sign in' : 'create an account'}
        </p>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-ink-text/25 text-ink-text font-body px-4 py-2.5 rounded text-sm tracking-wider hover:border-ink-text transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6 text-ink-muted/60 text-xs italic tracking-widest">
          <span className="flex-1 h-px bg-ink-text/10" />
          or
          <span className="flex-1 h-px bg-ink-text/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block font-body text-sm text-ink-muted mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-body text-sm text-ink-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-ink-text/25 rounded px-4 py-2.5 text-ink-text font-body text-base focus:outline-none focus:border-ink-text transition-colors"
            />
          </div>

          {error && <p className="text-red-700 font-body text-sm">{error}</p>}
          {info  && <p className="font-body italic text-ink-muted text-sm">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-ink-text text-ink-text font-body px-4 py-2.5 rounded text-sm tracking-wider hover:bg-ink-text hover:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-ink-muted">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <Link href="/signup" className="italic text-ink-text hover:opacity-60 transition-opacity">
                create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/signin" className="italic text-ink-text hover:opacity-60 transition-opacity">
                sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
