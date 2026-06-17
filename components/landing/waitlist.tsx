'use client'

import { useState } from 'react'

export function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="waitlist" className="py-24 px-6 bg-[#030303]">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">
            Get early access to the VS Code Extension
          </h2>
          <p className="text-zinc-500 text-base">
            Be the first to know when it launches
          </p>
        </div>

        {submitted ? (
          <div
            className="rounded-2xl border p-6 space-y-2"
            style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}
          >
            <p className="text-emerald-400 font-semibold">You&apos;re on the list!</p>
            <p className="text-zinc-500 text-sm">We&apos;ll email you when it launches.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              style={{ minHeight: '48px' }}
            />
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', minHeight: '48px' }}
            >
              {submitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </section>
  )
}
