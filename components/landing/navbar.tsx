'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 transition-all"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #1a1a1a' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Memra
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Product', 'Docs', 'Pricing', 'Demo'].map((item) => (
            <Link
              key={item}
              href={item === 'Docs' ? '/docs' : item === 'Demo' ? '/demo' : `#${item.toLowerCase()}`}
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            Sign in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 20px rgba(59,130,246,0.2)',
            }}
          >
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-black border-b border-zinc-800 px-6 py-4 space-y-3 md:hidden">
          {['Product', 'Docs', 'Pricing', 'Demo'].map((item) => (
            <Link key={item} href={item === 'Docs' ? '/docs' : item === 'Demo' ? '/demo' : `#${item.toLowerCase()}`}
              className="block text-sm text-zinc-400 hover:text-zinc-100 transition-colors py-1"
              onClick={() => setMenuOpen(false)}>
              {item}
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            <Link href="/login" className="text-sm text-zinc-400 py-1">Sign in</Link>
            <Link href="/login"
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-white text-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
