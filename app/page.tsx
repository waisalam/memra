import type { Metadata } from 'next'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ProblemSolution } from '@/components/landing/problem-solution'
import { Features } from '@/components/landing/features'
import { CodeShowcase } from '@/components/landing/code-showcase'
import { Pricing } from '@/components/landing/pricing'
import { Stats } from '@/components/landing/stats'
import { TwoProducts } from '@/components/landing/two-products'
import Link from 'next/link'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Memra — Persistent Memory for AI Agents',
  description:
    'Add persistent semantic memory to any AI agent with a single API call. Powered by pgvector. Works with any AI provider.',
}

export default async function LandingPage() {
  const session = await auth()
  const ctaHref = session ? '/dashboard' : '/login'

  return (
    <div className="bg-black text-white">
      <SiteNavbar />
      <Hero ctaHref={ctaHref} />
      <HowItWorks />
      <ProblemSolution />
      <Features />
      <TwoProducts />
      <CodeShowcase />
      <Pricing ctaHref={ctaHref} />
      <Stats />

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
            }}
          />
        </div>
        <div className="relative max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-black leading-tight">
            Ready to give your AI
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {' '}
              a memory?
            </span>
          </h2>
          <p className="text-zinc-400 text-lg">
            Join developers building smarter AI applications with Memra.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 0 50px rgba(59,130,246,0.25)',
            }}
          >
            Get started for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </Link>
          <p className="text-zinc-700 text-sm">No credit card required · Free forever plan</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
