import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#000] px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Memra
          </span>
          <span className="text-zinc-700 text-sm">© 2025 Memra. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Docs', href: '/docs' },
            { label: 'GitHub', href: 'https://github.com' },
          ].map((link) => (
            <Link key={link.label} href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
