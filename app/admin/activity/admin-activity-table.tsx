'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useEffect } from 'react'

type Log = {
  id: string
  endpoint: string
  method: string
  agentId: string | null
  statusCode: number
  latencyMs: number
  createdAt: Date
  user: { email: string } | null
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function AdminActivityTable({
  logs,
  total,
  page,
  pageSize,
  totalPages,
  filters,
}: {
  logs: Log[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  filters: { user: string; endpoint: string; status: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.set('page', '1')
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname, searchParams]
  )

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => router.refresh())
    }, 30_000)
    return () => clearInterval(id)
  }, [router])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#1e1e1e] p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="User email…"
            defaultValue={filters.user}
            onChange={(e) => update('user', e.target.value)}
            className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a]"
          />
          <input
            type="text"
            placeholder="Endpoint…"
            defaultValue={filters.endpoint}
            onChange={(e) => update('endpoint', e.target.value)}
            className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a]"
          />
          <select
            defaultValue={filters.status}
            onChange={(e) => update('status', e.target.value)}
            className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
          >
            <option value="">All statuses</option>
            <option value="ok">2xx OK</option>
            <option value="error">4xx/5xx Error</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['User', 'Method', 'Endpoint', 'Status', 'Latency', 'When'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-500 max-w-[140px] truncate">{log.user?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                      log.method === 'POST' ? 'bg-green-500/10 text-green-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400 max-w-[200px] truncate">{log.endpoint}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      log.statusCode < 300 ? 'bg-green-500/10 text-green-400' :
                      log.statusCode < 500 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 tabular-nums">{log.latencyMs}ms</td>
                  <td className="px-4 py-3 text-xs text-zinc-700 whitespace-nowrap">{timeAgo(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#1e1e1e] flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page - 1))
                  startTransition(() => router.push(`${pathname}?${params.toString()}`))
                }}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(page + 1))
                  startTransition(() => router.push(`${pathname}?${params.toString()}`))
                }}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
