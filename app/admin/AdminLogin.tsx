'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-parchment mb-2">Admin</h1>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-parchment-dim/50">
            Poema dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-ink-muted border border-parchment-dim/20 rounded-sm px-4 py-3 text-parchment font-sans text-sm focus:outline-none focus:border-gold/50 placeholder:text-parchment-dim/30 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-ink-muted border border-parchment-dim/20 rounded-sm px-4 py-3 text-parchment font-sans text-sm focus:outline-none focus:border-gold/50 placeholder:text-parchment-dim/30 transition-colors"
          />

          {error && (
            <p className="text-red-400/80 font-sans text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gold/10 border border-gold/30 hover:bg-gold/20 hover:border-gold/50 text-gold font-sans text-xs tracking-[0.2em] uppercase py-3 rounded-sm transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
