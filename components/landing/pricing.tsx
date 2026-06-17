'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Perfect for side projects',
    features: [
      { text: '1,000 memories', ok: true },
      { text: '1,000 API calls/month', ok: true },
      { text: '1 agent', ok: true },
      { text: 'Semantic search', ok: true },
      { text: 'npm package', ok: true },
      { text: 'Priority support', ok: false },
      { text: 'Custom retention', ok: false },
    ],
    extensionFeatures: [
      { text: '10 extension sessions', ok: true },
      { text: '100 messages/session', ok: true },
      { text: 'AI resume prompts', ok: false },
    ],
    cta: 'Start free',
    ctaStyle: 'border',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 23 },
    desc: 'For production applications',
    features: [
      { text: '500,000 memories', ok: true },
      { text: '100,000 API calls/month', ok: true },
      { text: 'Unlimited agents', ok: true },
      { text: 'Semantic search', ok: true },
      { text: 'npm package', ok: true },
      { text: 'Priority support', ok: true },
      { text: '90-day retention', ok: true },
    ],
    extensionFeatures: [
      { text: 'Unlimited extension sessions', ok: true },
      { text: '10,000 messages/session', ok: true },
      { text: 'AI resume prompts', ok: true },
    ],
    cta: 'Get started',
    ctaStyle: 'gradient',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    desc: 'For teams and high volume',
    features: [
      { text: 'Unlimited everything', ok: true },
      { text: 'Self-host option', ok: true },
      { text: 'SLA guarantee', ok: true },
      { text: 'Dedicated support', ok: true },
      { text: 'Custom retention', ok: true },
      { text: 'SSO', ok: true },
    ],
    extensionFeatures: [
      { text: 'Unlimited everything', ok: true },
      { text: 'AI resume prompts', ok: true },
    ],
    cta: 'Contact us',
    ctaStyle: 'border',
    popular: false,
    href: '/contact',
  },
]

export function Pricing({ ctaHref = '/login' }: { ctaHref?: string }) {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-28 px-6 bg-[#030303]">
      <div className="max-w-5xl mx-auto space-y-14">
        <div className="text-center space-y-5">
          <h2 className="text-4xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="text-zinc-500 text-lg">Start free. Scale when you&apos;re ready.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2">
            <button
              onClick={() => setYearly(false)}
              className={`text-sm font-medium transition-colors ${!yearly ? 'text-zinc-100' : 'text-zinc-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly((y) => !y)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{ background: yearly ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#27272a' }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: yearly ? '22px' : '4px' }}
              />
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${yearly ? 'text-zinc-100' : 'text-zinc-600'}`}
            >
              Yearly
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 space-y-6 relative ${
                plan.popular
                  ? 'border-2 scale-[1.02] shadow-2xl'
                  : 'border border-[#1e1e1e] bg-[#111111]'
              }`}
              style={plan.popular ? {
                borderImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6) 1',
                background: '#111',
                boxShadow: '0 0 60px rgba(59,130,246,0.1), 0 0 0 1px rgba(139,92,246,0.3)',
              } : {}}
            >
              {plan.popular && !('comingSoon' in plan) && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    Most Popular
                  </span>
                </div>
              )}
              {'comingSoon' in plan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700">
                    Coming soon
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-bold text-zinc-100">{plan.name}</h3>
                <p className="text-zinc-600 text-sm">{plan.desc}</p>
              </div>

              <div>
                {plan.price.monthly === null ? (
                  <div className="text-3xl font-black text-zinc-100">Custom</div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-zinc-100">
                      ${yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-zinc-600 text-sm mb-1.5">/ month</span>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5">
                <li className="text-[10px] font-semibold text-blue-400/60 uppercase tracking-wider pb-0.5">Memory API</li>
                {plan.features.map((f) => (
                  <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span className={`shrink-0 ${f.ok ? 'text-emerald-400' : 'text-zinc-700'}`}>
                      {f.ok ? '✓' : '✗'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {'extensionFeatures' in plan && (
                <ul className="space-y-2.5 pt-2 border-t border-zinc-800/60">
                  <li className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider pb-0.5">
                    <span className="text-emerald-400/60">VS Code Extension</span>
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 normal-case">Included</span>
                  </li>
                  {plan.extensionFeatures.map((f: { text: string; ok: boolean }) => (
                    <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <span className={`shrink-0 ${f.ok ? 'text-emerald-400' : 'text-zinc-700'}`}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              )}

              {'comingSoon' in plan ? (
                <div
                  className="block w-full py-3 rounded-xl text-sm font-semibold text-center cursor-not-allowed select-none"
                  style={{ background: 'rgba(255,255,255,0.03)', color: '#52525b', border: '1px solid #2a2a2a' }}
                >
                  Coming soon
                </div>
              ) : (
                <Link
                  href={'href' in plan ? plan.href! : ctaHref}
                  className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 ${
                    plan.ctaStyle === 'gradient'
                      ? 'text-white'
                      : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                  style={plan.ctaStyle === 'gradient' ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' } : {}}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
