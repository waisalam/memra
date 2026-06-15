export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ActivityTable } from './activity-table'

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id
  const params = await searchParams

  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 50
  const endpoint = params.endpoint ?? ''
  const agentId = params.agentId ?? ''
  const status = params.status ?? ''
  const dateFrom = params.dateFrom ?? ''
  const dateTo = params.dateTo ?? ''

  const where = {
    userId,
    ...(endpoint ? { endpoint: { contains: endpoint } } : {}),
    ...(agentId ? { agentId } : {}),
    ...(status === 'ok' ? { statusCode: { gte: 200, lt: 300 } } : {}),
    ...(status === 'error' ? { statusCode: { gte: 400 } } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
          },
        }
      : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.apiLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, endpoint: true, method: true, agentId: true, statusCode: true, latencyMs: true, createdAt: true },
    }),
    prisma.apiLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">API Activity</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {total.toLocaleString()} total requests
          </p>
        </div>
        <a
          href={`/api/activity/export?userId=${userId}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 hover:border-[#3a3a3a] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </a>
      </div>

      <ActivityTable
        logs={logs}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        filters={{ endpoint, agentId, status, dateFrom, dateTo }}
      />
    </div>
  )
}
