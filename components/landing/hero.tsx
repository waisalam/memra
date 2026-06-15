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
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
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
            Memra adds persistent semantic memory to any AI agent or chatbot with a single API call.
            No more context loss. No more users repeating themselves.
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

          {/* Social proof */}
          <div className="pt-2">
            <p className="text-xs text-zinc-600 mb-3">Trusted by developers building the next generation of AI</p>
            <div className="flex flex-wrap gap-3">
              {['YC Startup', 'AI Agent Co', 'DevTools Inc', 'LLM Labs'].map((name) => (
                <div key={name} className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-700 bg-zinc-900/40">
                  {name}
                </div>
              ))}
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
