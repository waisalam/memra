'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function VerifyPage() {
  const [cooldown, setCooldown] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
        </svg>
        Back to home
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center space-y-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold text-zinc-100">Check your inbox</h1>
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
            We sent a magic link to your email.<br />Click it to sign in — no password needed.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="https://gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:border-blue-500/50 hover:text-blue-400 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.147C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
            Gmail
          </a>
          <a
            href="https://outlook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:border-blue-500/50 hover:text-blue-400 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72q.06.04.1.1.04.06.04.13v.2z" />
            </svg>
            Outlook
          </a>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCooldown(60)}
            disabled={cooldown > 0}
            className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive it? Resend"}
          </button>
          <div>
            <Link href="/login" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
