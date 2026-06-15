import type { Metadata } from 'next'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'
import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact — Memra',
  description: 'Get in touch with the Memra team for enterprise pricing and custom plans.',
}

const FEATURES = [
  'Unlimited memories & API calls',
  'Unlimited API keys & agents',
  'Dedicated infrastructure',
  'SLA guarantee',
  'Custom data retention',
  'Dedicated support channel',
  'Custom contracts & billing',
  'Self-host option',
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3 mb-14">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm mb-2"
              style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)', color: '#c4b5fd' }}
            >
              Enterprise Plan
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              Get{' '}
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                custom pricing
              </span>{' '}
              activated
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-lg mx-auto">
              Fill in the form and we&apos;ll get back to you within 24 hours to set up
              your Enterprise account with dedicated infrastructure and custom terms.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left — what's included */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl p-6 space-y-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e' }}
              >
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  What&apos;s included
                </p>
                <ul className="space-y-3">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <circle cx="12" cy="12" r="10" fill="rgba(139,92,246,0.15)" />
                        <polyline points="8,12 11,15 16,9" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-2xl p-5 space-y-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e' }}
              >
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prefer email?</p>
                <p className="text-sm text-zinc-400">
                  Reach us directly at{' '}
                  <a
                    href="mailto:waisalam9523@gmail.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    waisalam9523@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">
              ← Back to pricing
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
