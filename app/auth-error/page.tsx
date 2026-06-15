'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  Configuration: { title: 'Server configuration error', desc: 'There is a problem with the authentication setup. Please try again or contact support.' },
  AccessDenied: { title: 'Access denied', desc: 'You do not have permission to sign in to this account.' },
  Verification: { title: 'Link expired', desc: 'The magic link has expired or has already been used. Please request a new one.' },
  OAuthCallback: { title: 'OAuth error', desc: 'There was a problem with the sign-in provider. Please try again.' },
  Default: { title: 'Something went wrong', desc: 'An unexpected error occurred during sign in. Please try again.' },
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error') ?? 'Default'
  const { title, desc } = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default

  return (
    <>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="0.5" fill="#f87171" stroke="#f87171" strokeWidth="1" />
        </svg>
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{desc}</p>
      </div>

      <div className="space-y-2">
        <Link
          href="/login"
          className="block w-full rounded-xl py-3 px-4 text-sm font-semibold text-white text-center hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          Try again
        </Link>
        <Link
          href="/"
          className="block w-full rounded-xl py-3 px-4 text-sm text-zinc-500 hover:text-zinc-300 text-center border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          Back to home
        </Link>
      </div>

      <p className="text-xs text-zinc-800">
        Error code: <code className="text-zinc-700">{errorCode}</code>
      </p>
    </>
  )
}

export default function AuthErrorPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
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
        className="w-full max-w-sm rounded-2xl p-8 text-center space-y-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.12)', backdropFilter: 'blur(20px)' }}
      >
        {mounted ? (
          <Suspense fallback={<div className="text-zinc-600 text-sm py-4">Loading…</div>}>
            <ErrorContent />
          </Suspense>
        ) : (
          <div className="text-zinc-600 text-sm py-4">Loading…</div>
        )}
      </div>
    </div>
  )
}
