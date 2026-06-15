import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import Link from 'next/link'

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const isNear = pct >= 80

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className={isNear ? 'text-amber-400' : 'text-zinc-400'}>{value.toLocaleString()}</span>
        <span className="text-zinc-600">{max.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div
          className={`h-2 rounded-full transition-all ${isNear ? 'bg-amber-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default async function UsagePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id
  const plan = (session.user.plan ?? 'free') as Plan
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

  const [totalMemories, agentGroups] = await Promise.all([
    prisma.memory.count({ where: { userId } }),
    prisma.memory.groupBy({
      by: ['agentId'],
      where: { userId },
      _count: { agentId: true },
      _max: { createdAt: true },
      orderBy: { _count: { agentId: 'desc' } },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Usage</h1>
        <p className="text-zinc-500 text-sm mt-1">Your current usage across all agents</p>
      </div>

      {/* Plan card */}
      <div className="rounded-2xl border border-[#1e1e1e] p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              {plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">Resets monthly</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              plan === 'pro'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {plan === 'pro' ? '✦ Pro' : 'Free'}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Memories stored</label>
            <ProgressBar value={totalMemories} max={limits.memories === Infinity ? 999999 : limits.memories} color="bg-blue-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Active agents</label>
            <ProgressBar value={agentGroups.length} max={limits.agents === Infinity ? 999 : limits.agents} color="bg-purple-500" />
          </div>
        </div>

        {plan === 'free' && (
          <div className="pt-2 border-t border-[#1e1e1e]">
            <Link
              href="/pricing"
              className="block w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              Upgrade to Pro — $29/month
            </Link>
            <p className="text-xs text-zinc-700 text-center mt-2">
              50,000 memories · 20 API keys · 100 agents
            </p>
          </div>
        )}
      </div>

      {/* Agent breakdown */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">Agent breakdown</h2>
        </div>
        {agentGroups.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 text-sm">No agent activity yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Agent ID', 'Messages', 'Last active', 'Share'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {agentGroups.map((g) => (
                <tr key={g.agentId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded">
                      {g.agentId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">{g._count.agentId.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-zinc-600 text-xs">
                    {g._max.createdAt ? timeAgo(g._max.createdAt) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full bg-blue-500"
                          style={{ width: `${(g._count.agentId / totalMemories) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-600">
                        {((g._count.agentId / totalMemories) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
