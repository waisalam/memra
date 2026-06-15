'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/keys',
    label: 'API Keys',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="17" r="4" />
        <path d="M9.5 14.5l9-9m0 0l3 3-3.5 3.5-3-3M15 5l3 3" />
      </svg>
    ),
  },
  {
    href: '/dashboard/activity',
    label: 'Activity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="4" />
        <path d="M1 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
        <path d="M17 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/usage',
    label: 'Usage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

const EXTERNAL = [
  {
    href: '/docs',
    label: 'Docs',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/demo',
    label: 'Demo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
  },
]

interface Props {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  plan?: string
}

export function Sidebar({ userName, userEmail, userImage, plan = 'free' }: Props) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)
  const [open, setOpen] = useState(false)

  // close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Memra
          </Link>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10">
            beta
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          onClick={() => setOpen(false)}
          style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-white/6 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/3'
              }`}
              style={{ ...(active ? { borderLeft: '2px solid #3b82f6', paddingLeft: '10px' } : {}), minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              <span className={active ? 'text-blue-400' : 'text-zinc-600'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div className="pt-5 pb-1">
          <p className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider px-3 pb-1">Resources</p>
        </div>

        {EXTERNAL.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 rounded-lg text-sm text-zinc-600 hover:text-zinc-300 hover:bg-white/3 transition-all group"
            style={{ minHeight: '44px' }}
          >
            <span className="text-zinc-700 group-hover:text-zinc-500">{item.icon}</span>
            {item.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        ))}

        <div className="pt-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 rounded-lg text-sm text-zinc-700 hover:text-zinc-400 hover:bg-white/2 transition-all"
            style={{ minHeight: '44px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
            Back to site
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#1a1a1a] space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="w-full h-full object-cover" />
            ) : (
              (userName ?? userEmail ?? '?')[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{userName ?? userEmail}</p>
            <span className={`text-[10px] font-medium ${plan === 'pro' ? 'text-purple-400' : 'text-zinc-600'}`}>
              {plan === 'pro' ? '✦ Pro' : 'Free plan'}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full text-left px-3 rounded-lg text-xs text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
          style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
        >
          {signingOut ? 'Signing out…' : '← Sign out'}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger — mobile only, fixed top-left */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg border border-[#1a1a1a] bg-black/90 text-zinc-400 hover:text-zinc-100 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-[#1a1a1a] bg-[#030303]">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 flex flex-col border-r border-[#1a1a1a] bg-[#030303] z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
