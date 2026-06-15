import type { Metadata } from 'next'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Memra',
  description: 'Simple, transparent pricing. Start free, scale as you grow.',
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for side projects and exploration.',
    features: [
      '500 memories stored',
      '3 API keys',
      '5 agents',
      'Semantic search',
      'Community support',
    ],
    cta: 'Get started free',
    href: '/login',
    gradient: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For production apps that need persistent memory at scale.',
    features: [
      '50,000 memories stored',
      '20 API keys',
      '100 agents',
      'Semantic search',
      'Priority support',
      'Usage analytics',
      'Custom agent IDs',
    ],
    cta: 'Coming soon',
    href: null,
    gradient: true,
    comingSoon: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams that need unlimited scale and dedicated infrastructure.',
    features: [
      'Unlimited memories',
      'Unlimited API keys',
      'Unlimited agents',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Dedicated support',
      'Custom contracts',
    ],
    cta: 'Contact us',
    href: '/contact',
    gradient: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-black tracking-tight">
              Simple,{' '}
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                transparent
              </span>{' '}
              pricing
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Start free. No credit card required. Upgrade when you need more.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: plan.gradient ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))' : 'rgba(255,255,255,0.02)',
                  border: plan.gradient ? '1px solid rgba(99,102,241,0.3)' : '1px solid #1e1e1e',
                }}
              >
                {plan.gradient && (
                  <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-purple-500/0" />
                )}
                {plan.gradient && !('comingSoon' in plan) && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    Most popular
                  </span>
                )}
                {'comingSoon' in plan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-0.5 rounded-full text-zinc-400 bg-zinc-800 border border-zinc-700">
                    Coming soon
                  </span>
                )}

                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-400 mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-100">{plan.price}</span>
                    {plan.period && <span className="text-zinc-500 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-zinc-500 text-sm mt-2">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.15)" />
                        <polyline points="8,12 11,15 16,9" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {'comingSoon' in plan ? (
                  <div
                    className="block w-full rounded-xl py-3 text-sm font-semibold text-center cursor-not-allowed select-none"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#52525b', border: '1px solid #2a2a2a' }}
                  >
                    Coming soon
                  </div>
                ) : (
                  <Link
                    href={plan.href!}
                    className="block w-full rounded-xl py-3 text-sm font-semibold text-center transition-all hover:opacity-90"
                    style={plan.gradient
                      ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#d4d4d8', border: '1px solid #2a2a2a' }
                    }
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center text-zinc-100 mb-8">Common questions</h2>
            {[
              { q: 'What counts as a "memory"?', a: 'Each message pair (user + AI reply) saves 2 memory records. The free plan gives you 500 records = 250 conversation turns.' },
              { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Upgrades take effect immediately. Downgrades apply at the end of the billing period.' },
              { q: 'What happens if I hit my limit?', a: 'The API returns a 429 with a clear error message. Your existing memories are safe — you just can\'t save new ones until you upgrade or free space.' },
              { q: 'Is there a free trial for Pro?', a: 'The Free plan is unlimited in time. Try it until you need more capacity, then upgrade.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-[#1e1e1e] p-5 space-y-2">
                <p className="font-medium text-zinc-200 text-sm">{q}</p>
                <p className="text-zinc-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
