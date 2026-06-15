'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

type Log = {
  id: string
  endpoint: string
  method: string
  agentId: string | null
  statusCode: number
  latencyMs: number
  createdAt: Date
}

type Filters = {
  endpoint: string
  agentId: string
  status: string
  dateFrom: string
  dateTo: string
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
    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${ok ? 'bg-green-500/10 text-green-400' : warn ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
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

export function ActivityTable({
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
  filters: Filters
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
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const goPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(p))
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl border border-[#1e1e1e] p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Endpoint…"
            defaultValue={filters.endpoint}
            onChange={(e) => update('endpoint', e.target.value)}
            className="col-span-2 sm:col-span-1 lg:col-span-2 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a]"
          />
          <input
            type="text"
            placeholder="Agent ID…"
            defaultValue={filters.agentId}
            onChange={(e) => update('agentId', e.target.value)}
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
          <div className="flex gap-2 col-span-2 sm:col-span-1">
            <input
              type="date"
              defaultValue={filters.dateFrom}
              onChange={(e) => update('dateFrom', e.target.value)}
              className="flex-1 min-w-0 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
            />
            <input
              type="date"
              defaultValue={filters.dateTo}
              onChange={(e) => update('dateTo', e.target.value)}
              className="flex-1 min-w-0 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {logs.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 text-sm">No logs match your filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Method', 'Endpoint', 'Agent ID', 'Status', 'Latency', 'Time'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <MethodBadge method={log.method} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300 max-w-[200px] truncate">
                      {log.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      {log.agentId ? (
                        <span className="font-mono text-xs text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                          {log.agentId}
                        </span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge code={log.statusCode} />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">{log.latencyMs}ms</td>
                    <td className="px-4 py-3 text-xs text-zinc-600 whitespace-nowrap">{timeAgo(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#1e1e1e] flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => goPage(page + 1)}
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
