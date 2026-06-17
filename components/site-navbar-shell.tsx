'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Props {
  isLoggedIn: boolean
  user: User | null
}

const NAV_LINKS = [
  { label: 'Product', href: '/' },
  { label: 'Extension', href: '/docs/extension' },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Demo', href: '/demo' },
]

export default function SiteNavbarShell({ isLoggedIn, user }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = () => { setAvatarOpen(false); setMenuOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  async function handleSignOut(e: React.MouseEvent) {
    e.stopPropagation()
    setSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  const initial = (user?.name ?? user?.email ?? 'U')[0].toUpperCase()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #1a1a1a' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight shrink-0"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Memra
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                Dashboard
              </Link>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden transition-opacity hover:opacity-80"
                >
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </button>
                {avatarOpen && (
                  <div className="absolute right-0 top-10 w-52 rounded-xl border border-[#2a2a2a] bg-[#111] shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1e1e1e]">
                      <p className="text-xs font-medium text-zinc-300 truncate">{user?.name ?? user?.email}</p>
                      <p className="text-xs text-zinc-600 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/keys"
                      className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      API Keys
                    </Link>
                    <div className="border-t border-[#1e1e1e]">
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        {signingOut ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Sign in
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-16 left-0 right-0 border-b border-zinc-800 px-6 py-4 space-y-3 md:hidden"
          style={{ background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(20px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-sm text-zinc-400 hover:text-zinc-100 transition-colors py-1.5"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-zinc-500 py-1 text-left"
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-zinc-400 py-1" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
