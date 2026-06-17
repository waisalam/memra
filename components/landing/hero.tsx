'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const CODE_LINES = [
  { text: "import { MemoryClient } from '@memra-client/client'", color: 'text-zinc-300' },
  { text: '', color: '' },
  { text: "const memory = new MemoryClient({", color: 'text-zinc-300' },
  { text: "  apiKey: 'mk_live_...'", color: 'text-amber-300' },
  { text: "})", color: 'text-zinc-300' },
  { text: '', color: '' },
  { text: "// Get relevant context", color: 'text-zinc-600' },
  { text: "const { context } = await memory", color: 'text-zinc-300' },
  { text: "  .getContext('user_123', userMsg)", color: 'text-blue-400' },
  { text: '', color: '' },
  { text: "// AI now remembers  ✓", color: 'text-emerald-400' },
]

function TypewriterCode() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const delay = setTimeout(() => {
      if (visibleLines < CODE_LINES.length) {
        const line = CODE_LINES[visibleLines]
        if (charIndex < line.text.length) {
          setCharIndex((c) => c + 1)
        } else {
          setTimeout(() => {
            setVisibleLines((l) => l + 1)
            setCharIndex(0)
          }, line.text === '' ? 50 : 120)
        }
      }
    }, visibleLines < CODE_LINES.length && CODE_LINES[visibleLines].text !== '' ? 30 : 0)
    return () => clearTimeout(delay)
  }, [visibleLines, charIndex])

  useEffect(() => {
    const t = setInterval(() => setShowCursor((c) => !c), 530)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl" style={{ background: '#0d0d0d' }}>
      {/* Traffic lights */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-zinc-600 font-mono">memra-demo.ts</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Connected
        </span>
      </div>

      {/* Code */}
      <div className="p-5 font-mono text-[13px] leading-6 min-h-[220px]">
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={line.color}>
            {line.text || ' '}
          </div>
        ))}
        {visibleLines < CODE_LINES.length && (
          <div className={CODE_LINES[visibleLines].color}>
            {CODE_LINES[visibleLines].text.slice(0, charIndex)}
            <span className={`inline-block w-[2px] h-[14px] align-middle ml-[1px] bg-blue-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}
      </div>
    </div>
  )
}

export function Hero({ ctaHref = '/login' }: { ctaHref?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <section className="relative flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(50%, 50%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
        {/* Left */}
        <div className="space-y-8">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: 'rgba(59,130,246,0.3)',
              background: 'rgba(59,130,246,0.08)',
              color: '#93c5fd',
            }}>
            <span className="text-yellow-400">⚡</span>
            Now in public beta — Try it free
            <span className="text-blue-400">→</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
            <span className="text-white">Give your AI</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              permanent memory
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
            Memra gives your AI a permanent memory — whether you&apos;re building AI apps with our API
            or using AI tools in VS Code with our extension.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 30px rgba(59,130,246,0.3)',
              }}
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-100 transition-all"
            >
              View docs
            </Link>
          </div>

          {/* Two products */}
          <div className="pt-2 space-y-3">
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Two products, one platform</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/keys?type=memory"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-blue-500/40 group"
                style={{ borderColor: '#1e3a5f', background: '#040d1a' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.12)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Memory API</p>
                  <p className="text-[11px] text-zinc-600">For AI apps you build</p>
                </div>
                <code className="text-[10px] text-blue-400/50 font-mono ml-auto hidden sm:block">mk_mem_</code>
              </Link>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ borderColor: '#1e5f3a', background: '#041a0f' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">VS Code Extension</p>
                  <p className="text-[11px] text-zinc-600">Auto-captures AI chats</p>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20 ml-auto shrink-0">SOON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — code window */}
        <div className="w-full">
          {mounted && <TypewriterCode />}
        </div>
      </div>
    </section>
  )
}
