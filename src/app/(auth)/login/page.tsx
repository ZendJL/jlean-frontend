'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth.store'
import { authApi } from '@/lib/api/auth.api'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authApi.login({ email, password })
      setAuth(data.accessToken, data.refreshToken)
      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 space-y-6">

        <div className="flex flex-col items-center gap-3">
          <Logo size={40} />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-text">Sign in to JLean</h1>
            <p className="text-text-muted text-sm mt-1">
              Track your nutrition and reach your goals.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-[#0f1117] font-semibold rounded-lg py-2.5 text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-text-faint text-xs">
          Don't have an account?{' '}
          <a href="/register" className="text-primary hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}