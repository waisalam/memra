export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  const logs = await prisma.apiLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10000,
    select: { endpoint: true, method: true, agentId: true, statusCode: true, latencyMs: true, createdAt: true },
  })

  const rows = [
    ['endpoint', 'method', 'agentId', 'statusCode', 'latencyMs', 'createdAt'].join(','),
    ...logs.map((l) =>
      [l.endpoint, l.method, l.agentId ?? '', l.statusCode, l.latencyMs, l.createdAt.toISOString()].join(',')
    ),
  ].join('\n')

  return new Response(rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="memra-activity-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
