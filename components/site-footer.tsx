import Link from 'next/link'

const COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Demo', href: '/demo' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '/contact' },
      { label: 'GitHub', href: 'https://github.com', external: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-black px-6 pt-12 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Memra
            </Link>
            <p className="text-zinc-600 text-sm leading-relaxed max-w-[200px]">
              Persistent semantic memory for AI agents. One API call.
            </p>
          </div>

          {/* Columns */}
          {COLS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{col.heading}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={'external' in link ? '_blank' : undefined}
                      rel={'external' in link ? 'noopener noreferrer' : undefined}
                      className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-700">© 2025 Memra. All rights reserved.</p>
          <p className="text-xs text-zinc-800">Built for developers who ship fast.</p>
        </div>
      </div>
    </footer>
  )
}
