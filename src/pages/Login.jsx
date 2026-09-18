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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-6">
      {/* Background photo, slow continuous zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
        style={{ backgroundImage: "url('/pastor-hero.jpg')" }}
        aria-hidden="true"
      />
      {/* Brand-toned overlay for legibility, not plain black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,31,29,0.55) 0%, rgba(15,31,29,0.78) 55%, rgba(15,31,29,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm animate-card-rise">
        <div className="text-center mb-7">
          <p className="text-[11px] tracking-wide text-[#E7DFC8]/70 mb-2">Word Sanctuary Global · Tanke</p>
          <h1 className="font-display text-3xl leading-tight text-white">
            Word Sanctuary Tanke
            <br />Retention
          </h1>
          <p className="text-sm text-[#E7DFC8]/80 mt-3 max-w-xs mx-auto">
            Every visitor seen, every new member followed up until they feel at home.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex flex-col gap-4 shadow-xl"
        >
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 border border-white/30 rounded-md text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/90 border border-white/30 rounded-md text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {error && <p className="text-sm text-[#FFB4A0]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[var(--color-gold)] text-[#1F1608] text-sm font-semibold py-2.5 rounded-md hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-white/60 mt-5 text-center">
          Don't have an account yet? Ask your coordinator to add you.
        </p>
      </div>
    </div>
  )
}
