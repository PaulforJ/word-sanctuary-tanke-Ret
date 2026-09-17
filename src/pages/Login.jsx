import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl text-[var(--color-primary)] mb-1">New Member Care</h1>
        <p className="text-sm text-[var(--color-ink)]/60 mb-8">Sign in to your team's dashboard.</p>

        <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)]/70 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-line)] rounded-md text-sm focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)]/70 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-line)] rounded-md text-sm focus:border-[var(--color-primary)] outline-none"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-coral)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[var(--color-primary)] text-white text-sm font-medium py-2.5 rounded-md hover:bg-[var(--color-primary-light)] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-[var(--color-ink)]/50 mt-4">
          Don't have an account yet? Ask your coordinator to create one for you in Supabase (see README).
        </p>
      </div>
    </div>
  )
}
