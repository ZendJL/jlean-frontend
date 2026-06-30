'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth.store'
import { authApi } from '@/lib/api/auth.api'
import Logo from '@/components/ui/Logo'

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== password2) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const data = await authApi.register({ email, password })
      setAuth(data.accessToken, data.refreshToken)
      window.location.href = '/onboarding'
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Registration failed')
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
            <h1 className="text-xl font-semibold text-text">Create your account</h1>
            <p className="text-text-muted text-sm mt-1">
              Start tracking your nutrition today.
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
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Confirm password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="••••••••"
              required
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-text-faint text-xs">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}