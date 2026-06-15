import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CountUp } from '@/components/dashboard/count-up'

async function getDashboardData(userId: string) {
  const [totalMemories, apiKeys, recentMemories] = await Promise.all([
    prisma.memory.count({ where: { userId } }),
    prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: { key: true, name: true },
      take: 1,
    }),
    prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, content: true, role: true, agentId: true, createdAt: true },
    }),
  ])

  const agentGroups = await prisma.memory.groupBy({
    by: ['agentId'],
    where: { userId },
    _count: { agentId: true },
  })

  return { totalMemories, apiKeys, recentMemories, agentCount: agentGroups.length }
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const STAT_CARDS = (data: Awaited<ReturnType<typeof getDashboardData>>) => [
  {
    label: 'Total Memories',
    value: data.totalMemories,
    sub: 'messages stored',
    accent: 'rgba(59,130,246,0.06)',
    iconBg: 'rgba(59,130,246,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
      </svg>
    ),
  },
  {
    label: 'API Keys',
    value: data.apiKeys.length,
    sub: 'active keys',
    accent: 'rgba(139,92,246,0.06)',
    iconBg: 'rgba(139,92,246,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
        <circle cx="7" cy="17" r="4"/><path d="M9.5 14.5l9-9m0 0l3 3-3.5 3.5-3-3M15 5l3 3"/>
      </svg>
    ),
  },
  {
    label: 'Active Agents',
    value: data.agentCount,
    sub: 'unique agents',
    accent: 'rgba(16,185,129,0.06)',
    iconBg: 'rgba(16,185,129,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    label: 'Avg Latency',
    value: null,
    displayText: '~125ms',
    sub: 'semantic search',
    accent: 'rgba(251,146,60,0.06)',
    iconBg: 'rgba(251,146,60,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
  },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const data = await getDashboardData(session.user.id)
  const firstKey = data.apiKeys[0]?.key ?? null
  const stats = STAT_CARDS(data)

  const codeSnippet = `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({
  apiKey: '${firstKey ?? 'YOUR_API_KEY_HERE'}'
})

// Save a conversation turn
await memory.save('user_123', userMessage, aiReply)

// Get relevant context before your AI responds
const { context } = await memory.getContext('user_123', query)`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Your Memra account at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#1e1e1e] p-5 space-y-4"
            style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.015), ${s.accent})` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.iconBg }}>
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-zinc-100 tabular-nums">
              {'displayText' in s && s.displayText ? s.displayText : <CountUp to={s.value ?? 0} />}
            </div>
            <p className="text-xs text-zinc-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Quick start</h2>
            <p className="text-xs text-zinc-600 mt-0.5">Paste this into your project</p>
          </div>
          {!firstKey && (
            <a href="/dashboard/keys" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Create API key →
            </a>
          )}
        </div>
        <div className="relative">
          <pre className="p-5 text-xs text-zinc-300 overflow-x-auto font-mono leading-relaxed bg-[#0d0d0d]">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">Recent activity</h2>
        </div>
        {data.recentMemories.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-600 text-sm">
            No memories yet — start chatting in the{' '}
            <a href="/demo" className="text-blue-400 hover:underline">playground</a>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {data.recentMemories.map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-start gap-4">
                <span
                  className={`shrink-0 mt-0.5 text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    m.role === 'user'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {m.role}
                </span>
                <p className="flex-1 text-sm text-zinc-400 truncate">{m.content}</p>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-full">
                    {m.agentId}
                  </span>
                  <span className="text-[10px] text-zinc-700">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
