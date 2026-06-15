'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loadingMagic, setLoadingMagic] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  async function handleGoogle() {
    setLoadingGoogle(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  async function handleMagicLink() {
    if (!email.trim()) return
    setLoadingMagic(true)
    try {
      const res = await signIn('resend', { email, redirect: false, callbackUrl: '/dashboard' })
      if (res?.ok) setEmailSent(true)
    } finally {
      setLoadingMagic(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Left — auth card */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
          </svg>
          Back to home
        </Link>

        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="space-y-1">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Memra
            </Link>
            <h1 className="text-xl font-semibold text-zinc-100">Welcome back</h1>
            <p className="text-sm text-zinc-500">Sign in to your account to continue</p>
          </div>

          {emailSent ? (
            <div
              className="rounded-2xl p-6 space-y-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-zinc-100">Check your inbox</p>
                <p className="text-sm text-zinc-500 mt-1">Magic link sent to <span className="text-zinc-300">{email}</span></p>
              </div>
              <div className="flex gap-2">
                <a href="https://gmail.com" target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all text-center">
                  Open Gmail
                </a>
                <a href="https://outlook.com" target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all text-center">
                  Open Outlook
                </a>
              </div>
              <button onClick={() => setEmailSent(false)} className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
                ← Try a different email
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
            >
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 rounded-xl py-3 px-4 font-medium text-sm hover:bg-zinc-100 active:bg-zinc-200 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100"
              >
                {loadingGoogle ? (
                  <span className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Magic link */}
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
                <button
                  onClick={handleMagicLink}
                  disabled={loadingMagic || !email.trim()}
                  className="w-full rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-40 disabled:scale-100"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {loadingMagic ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending link…
                    </span>
                  ) : 'Send magic link'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-zinc-700">
            No password needed · No credit card required
          </p>
        </div>
      </div>

      {/* Right — branded panel (desktop only) */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden border-l border-[#111]">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }}
          />
          <div
            className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)' }}
          />
        </div>

        <div className="relative space-y-3">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Memra
          </span>
          <p className="text-zinc-500 text-sm">Persistent memory for AI agents</p>
        </div>

        <div className="relative space-y-8">
          {[
            { icon: '⚡', title: 'One API call', desc: 'Save and retrieve semantic memory with a single line of code.' },
            { icon: '🧠', title: 'Semantic search', desc: 'Find relevant context from any point in history, not just the last N messages.' },
            { icon: '🔌', title: 'Any AI provider', desc: 'Works with GPT, Claude, Groq, Gemini — bring your own model.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{f.title}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="relative rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm text-zinc-300 leading-relaxed">
            "We dropped 60% of our prompt tokens by switching from last-N to semantic memory. Memra just works."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-300">Alex K.</p>
              <p className="text-xs text-zinc-600">Founder, AI startup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
