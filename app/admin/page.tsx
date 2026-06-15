import { prisma } from '@/lib/prisma'

export default async function AdminOverviewPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [totalUsers, totalMemories, totalApiLogs, apiLogsToday, newUsersToday, contactsNew, recentLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.memory.count(),
      prisma.apiLog.count(),
      prisma.apiLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.contact.count({ where: { status: 'new' } }),
      prisma.apiLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, endpoint: true, method: true, statusCode: true, latencyMs: true, createdAt: true, user: { select: { email: true } } },
      }),
    ])

  const stats = [
    { label: 'Total Users', value: totalUsers, sub: `+${newUsersToday} today`, color: 'rgba(59,130,246,0.08)' },
    { label: 'Total Memories', value: totalMemories, sub: 'across all users', color: 'rgba(139,92,246,0.08)' },
    { label: 'API Calls Today', value: apiLogsToday, sub: `${totalApiLogs.toLocaleString()} all-time`, color: 'rgba(16,185,129,0.08)' },
    { label: 'Open Contacts', value: contactsNew, sub: 'pending review', color: 'rgba(251,146,60,0.08)' },
  ]

  function timeAgo(date: Date) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Admin Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#1e1e1e] p-5 space-y-3"
            style={{ background: s.color }}
          >
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-bold text-zinc-100 tabular-nums">{s.value.toLocaleString()}</p>
            <p className="text-xs text-zinc-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent API calls */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Recent API activity (all users)</h2>
          <a href="/admin/activity" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['User', 'Endpoint', 'Status', 'Latency', 'When'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 text-xs text-zinc-500 truncate max-w-[160px]">{log.user?.email ?? '—'}</td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-400 truncate max-w-[200px]">{log.endpoint}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      log.statusCode < 300 ? 'bg-green-500/10 text-green-400' : log.statusCode < 500 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-600 tabular-nums">{log.latencyMs}ms</td>
                  <td className="px-5 py-3 text-xs text-zinc-700 whitespace-nowrap">{timeAgo(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
