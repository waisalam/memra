export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CountUp } from '@/components/dashboard/count-up'

async function getDashboardData(accountId: string) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [totalMemories, apiKeys, userGroups, apiCallsToday, recentLogs, extensionSessionCount] = await Promise.all([
    prisma.memory.count({ where: { accountId } }),
    prisma.apiKey.findMany({
      where: { userId: accountId, isActive: true },
      select: { key: true, name: true },
      take: 1,
    }),
    prisma.memory.groupBy({
      by: ['userId'],
      where: { accountId },
      _count: { userId: true },
    }),
    prisma.apiLog.count({
      where: { userId: accountId, createdAt: { gte: todayStart } },
    }),
    prisma.apiLog.findMany({
      where: { userId: accountId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, endpoint: true, method: true, agentId: true, statusCode: true, latencyMs: true, createdAt: true },
    }),
    prisma.extensionSession.count({ where: { accountId } }),
  ])

  return { totalMemories, apiKeys, agentCount: userGroups.length, apiCallsToday, recentLogs, extensionSessionCount }
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function StatusBadge({ code }: { code: number }) {
  const ok = code >= 200 && code < 300
  const warn = code >= 400 && code < 500
  return (
    <span
      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
        ok ? 'bg-green-500/10 text-green-400' : warn ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
      }`}
    >
      {code}
    </span>
  )
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-400',
    POST: 'bg-green-500/10 text-green-400',
    DELETE: 'bg-red-500/10 text-red-400',
  }
  return (
    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${colors[method] ?? 'bg-zinc-800 text-zinc-400'}`}>
      {method}
    </span>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const data = await getDashboardData(session.user.id)  // session.user.id = Memra accountId
  const firstKey = data.apiKeys[0]?.key ?? null

  const stats = [
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
      label: 'Agent IDs',
      tooltip: "Each unique agentId your app passes to Memra counts as one agent. Example: 'support-bot', 'coding-assistant'",
      value: data.agentCount,
      sub: 'unique agent IDs',
      accent: 'rgba(16,185,129,0.06)',
      iconBg: 'rgba(16,185,129,0.12)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
    {
      label: 'API Calls Today',
      value: data.apiCallsToday,
      sub: 'requests today',
      accent: 'rgba(251,146,60,0.06)',
      iconBg: 'rgba(251,146,60,0.12)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="1.8">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
    },
  ]

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

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Memory API */}
        <a
          href="/dashboard/keys?type=memory"
          className="rounded-2xl border p-5 space-y-4 transition-all hover:border-blue-500/30 group"
          style={{ background: '#040d1a', borderColor: '#1e3a5f' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-blue-400" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              Memory API
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div>
            <p className="text-zinc-100 font-semibold">For AI apps you build</p>
            <p className="text-zinc-500 text-xs mt-1">Save and retrieve conversation memory from your own AI applications via API.</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">{data.totalMemories}</p>
              <p className="text-xs text-zinc-600">memories stored</p>
            </div>
            <code className="text-[10px] text-blue-400/60 font-mono">mk_mem_...</code>
          </div>
        </a>

        {/* VS Code Extension */}
        <a
          href="/dashboard/extension"
          className="rounded-2xl border p-5 space-y-4 transition-all hover:border-emerald-500/30 group"
          style={{ background: '#041a0f', borderColor: '#1e5f3a' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                Extension
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div>
            <p className="text-zinc-100 font-semibold">VS Code Extension</p>
            <p className="text-zinc-500 text-xs mt-1">Auto-captures every AI chat session in VS Code. Zero setup.</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">{data.extensionSessionCount}</p>
              <p className="text-xs text-zinc-600">sessions captured</p>
            </div>
            <code className="text-[10px] text-emerald-400/60 font-mono">mk_ext_...</code>
          </div>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#1e1e1e] p-4 sm:p-5 space-y-3 sm:space-y-4"
            style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.015), ${s.accent})` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 group relative">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider leading-tight">{s.label}</span>
                {'tooltip' in s && s.tooltip && (
                  <span className="relative">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" className="cursor-help shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg border border-[#2a2a2a] bg-[#111] px-3 py-2 text-[11px] text-zinc-300 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {s.tooltip}
                    </span>
                  </span>
                )}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-zinc-100 tabular-nums">
              <CountUp to={s.value ?? 0} />
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

      {/* Recent API activity */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Recent API activity</h2>
          <a href="/dashboard/activity" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </a>
        </div>
        {data.recentLogs.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-600 text-sm">
            No API calls yet — integrate Memra into your app to see activity here
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a] overflow-x-auto">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3 min-w-0">
                <MethodBadge method={log.method} />
                <span className="text-xs font-mono text-zinc-400 truncate flex-1 min-w-0">{log.endpoint}</span>
                {log.agentId && (
                  <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
                    {log.agentId}
                  </span>
                )}
                <StatusBadge code={log.statusCode} />
                <span className="text-[10px] text-zinc-600 shrink-0 tabular-nums">{log.latencyMs}ms</span>
                <span className="text-[10px] text-zinc-700 shrink-0 hidden sm:inline">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
