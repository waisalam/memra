import Link from 'next/link'

export function Waitlist() {
  return (
    <section id="waitlist" className="py-24 px-6 bg-[#030303]">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">
            Get the VS Code Extension
          </h2>
          <p className="text-zinc-500 text-base">
            Auto-capture every AI conversation. Zero setup — install and forget.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://marketplace.visualstudio.com/items?itemName=memra.memra"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 30px rgba(16,185,129,0.2)', minHeight: '48px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            Install from Marketplace
          </a>
          <Link
            href="/dashboard/keys?type=extension"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-100 transition-all"
            style={{ minHeight: '48px' }}
          >
            Get Extension Key
          </Link>
        </div>

        <p className="text-zinc-700 text-sm">Works with GitHub Copilot · Claude Code · Cline · Continue</p>
      </div>
    </section>
  )
}
