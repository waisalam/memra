export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const accountId = session.user.id

  const [callerUsers, totalMemories] = await Promise.all([
    prisma.memory.groupBy({
      by: ['userId'],
      where: { accountId },
      _count: { userId: true },
      _max: { createdAt: true },
      orderBy: { _count: { userId: 'desc' } },
    }),
    prisma.memory.count({ where: { accountId } }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
        <p className="text-zinc-500 text-sm mt-1">
          End-users from your app that have called the Memra API
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          className="rounded-2xl border border-[#1e1e1e] p-5 space-y-3"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.015), rgba(59,130,246,0.06))' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Unique Users</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8">
                <circle cx="9" cy="7" r="4"/><path d="M1 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100 tabular-nums">{callerUsers.length}</p>
          <p className="text-xs text-zinc-600">distinct user IDs</p>
        </div>
        <div
          className="rounded-2xl border border-[#1e1e1e] p-5 space-y-3"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.015), rgba(139,92,246,0.06))' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Memories</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100 tabular-nums">{totalMemories.toLocaleString()}</p>
          <p className="text-xs text-zinc-600">memories across all users</p>
        </div>
      </div>

      {/* How it works callout */}
      <div
        className="rounded-2xl border p-4 flex items-start gap-3 text-xs leading-relaxed"
        style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-zinc-400">
          Each row is a <span className="text-zinc-200 font-medium">userId</span> your app passed when calling the API
          (e.g. <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">memory.getContext(&quot;alam&quot;, query)</code>).
          This lets you see which of your end-users are actively using memory.
        </p>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">User breakdown</h2>
        </div>

        {callerUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 flex items-center justify-center mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5">
                <circle cx="9" cy="7" r="4"/><path d="M1 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/>
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 font-medium">No users yet</p>
              <p className="text-zinc-600 text-sm mt-1">
                Pass a <code className="text-zinc-500">userId</code> when calling the API to see them here
              </p>
            </div>
            <div
              className="mx-auto max-w-sm rounded-xl border p-3 text-xs font-mono text-left"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: '#1e1e1e' }}
            >
              <span className="text-zinc-600"># Example</span>
              <br />
              <span className="text-blue-400">GET</span> <span className="text-zinc-400">/api/memory/context</span>
              <br />
              <span className="text-zinc-600">  ?userId=</span><span className="text-emerald-400">alam</span>
              <span className="text-zinc-600">&amp;query=...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['User ID', 'API Calls', 'Last Active', 'Share'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {callerUsers.map((u) => {
                  const pct = totalMemories > 0 ? (u._count.userId / totalMemories) * 100 : 0
                  return (
                    <tr key={u.userId} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded">
                          {u.userId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400 tabular-nums">
                        {u._count.userId.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 text-xs whitespace-nowrap">
                        {u._max.createdAt ? timeAgo(u._max.createdAt) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-zinc-800">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600 tabular-nums">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
