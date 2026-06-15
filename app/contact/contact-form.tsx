'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function submit() {
    setError('')
    setState('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setState('error')
        return
      }
      setState('success')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className="rounded-2xl p-8 text-center space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e' }}
      >
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">We got your message!</h3>
          <p className="text-zinc-500 text-sm mt-1">
            We&apos;ll review your inquiry and get back to you within 24 hours at{' '}
            <span className="text-zinc-300">{form.email}</span>.
          </p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 transition-colors"

  return (
    <div
      className="rounded-2xl p-8 space-y-6"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={set('name')}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">
            Work email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={set('email')}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Company name</label>
          <input
            type="text"
            placeholder="Acme Corp"
            value={form.company}
            onChange={set('company')}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Phone number</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={set('phone')}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500">
          Why do you need Enterprise? <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Tell us about your use case, expected volume, team size, and any specific requirements (e.g. self-hosting, custom SLA, dedicated support)..."
          value={form.message}
          onChange={set('message')}
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      {state === 'error' && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={state === 'loading'}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
      >
        {state === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Sending…
          </span>
        ) : (
          'Send inquiry'
        )}
      </button>

      <p className="text-center text-xs text-zinc-700">
        We typically respond within 24 hours.
      </p>
    </div>
  )
}
