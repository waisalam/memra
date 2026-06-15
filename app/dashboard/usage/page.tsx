import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import Link from 'next/link'
import { DeleteAgentButton } from './delete-agent-button'

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max === Infinity ? 0 : Math.min((value / max) * 100, 100)
  const isNear = pct >= 80

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className={isNear ? 'text-amber-400' : 'text-zinc-400'}>{value.toLocaleString()}</span>
        <span className="text-zinc-600">{max === Infinity ? '∞' : max.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div
          className={`h-2 rounded-full transition-all ${isNear ? 'bg-amber-500' : color}`}
          style={{ width: max === Infinity ? '0%' : `${pct}%` }}
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

  const accountId = session.user.id
  const plan = (session.user.plan ?? 'free') as Plan
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // 7-day window
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [totalMemories, userGroups, apiCallsToday, recentLogs] = await Promise.all([
    prisma.memory.count({ where: { accountId } }),
    prisma.memory.groupBy({
      by: ['userId'],
      where: { accountId },
      _count: { userId: true },
      _max: { createdAt: true },
      orderBy: { _count: { userId: 'desc' } },
    }),
    prisma.apiLog.count({
      where: { userId: accountId, createdAt: { gte: todayStart } },
    }),
    prisma.apiLog.findMany({
      where: { userId: accountId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Build 7-day chart data
  const dayLabels: string[] = []
  const dayCounts: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    dayLabels.push(label)
    const count = recentLogs.filter((l) => {
      const ld = new Date(l.createdAt)
      ld.setHours(0, 0, 0, 0)
      return ld.getTime() === d.getTime()
    }).length
    dayCounts.push(count)
  }
  const maxDay = Math.max(...dayCounts, 1)

  // Build combined per-agent data from both Memory and ApiLog tables
  // userGroups: per end-user memory counts from Memory table
  const allUsers = userGroups.map((g) => ({
    userId: g.userId,
    memories: g._count.userId,
    lastActive: g._max.createdAt ?? null,
  }))

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
              {plan === 'pro' ? 'Pro Plan' : plan === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">Resets monthly</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              plan === 'enterprise'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : plan === 'pro'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {plan === 'enterprise' ? '★ Enterprise' : plan === 'pro' ? '✦ Pro' : 'Free'}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Memories stored</label>
            <ProgressBar value={totalMemories} max={limits.memories} color="bg-blue-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Unique users</label>
            <ProgressBar value={userGroups.length} max={limits.agents} color="bg-purple-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">API calls today</label>
            <ProgressBar value={apiCallsToday} max={limits.apiCallsPerDay} color="bg-green-500" />
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
              50,000 memories · 20 API keys · 100 agents · 50,000 calls/day
            </p>
          </div>
        )}
      </div>

      {/* Memory limit upgrade banner */}
      {plan === 'free' && totalMemories >= limits.memories && (
        <div
          className="rounded-2xl border border-amber-500/20 p-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.05)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-400">Memory limit reached</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              You&apos;ve used all {limits.memories} free memories. New saves are blocked until you upgrade.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* 7-day API calls chart */}
      <div className="rounded-2xl border border-[#1e1e1e] p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">API calls — last 7 days</h2>
          <span className="text-xs text-zinc-600">{recentLogs.length.toLocaleString()} total</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-end gap-3" style={{ height: '170px' }}>
            {dayCounts.map((count, i) => {
              const barH = Math.max((count / maxDay) * 140, count > 0 ? 3 : 0)
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                  {count > 0 && (
                    <span className="text-[11px] text-zinc-400 tabular-nums font-medium">{count}</span>
                  )}
                  <div
                    className="w-full rounded-t-md bg-blue-500/50 hover:bg-blue-500/80 transition-colors"
                    style={{ height: `${barH}px` }}
                    title={`${count} calls`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex gap-3">
            {dayLabels.map((label, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User breakdown */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">Users breakdown</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Grouped by userId sent from your app</p>
        </div>
        {allUsers.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 text-sm">No user activity yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['User ID', 'Memories', 'Last active', 'Share', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {allUsers.map((g) => (
                  <tr key={g.userId} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded">
                        {g.userId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{g.memories.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-zinc-600 text-xs">
                      {g.lastActive ? timeAgo(g.lastActive) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {totalMemories > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-zinc-800">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${(g.memories / totalMemories) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600">
                            {((g.memories / totalMemories) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <DeleteAgentButton agentId={g.userId} count={g.memories} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
