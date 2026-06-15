export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return new Response('Forbidden', { status: 403 })
  }

  const logs = await prisma.apiLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100_000,
    select: {
      endpoint: true, method: true, agentId: true, statusCode: true,
      latencyMs: true, createdAt: true,
      user: { select: { email: true } },
    },
  })

  const rows = [
    ['email', 'endpoint', 'method', 'agentId', 'statusCode', 'latencyMs', 'createdAt'].join(','),
    ...logs.map((l) =>
      [l.user?.email ?? '', l.endpoint, l.method, l.agentId ?? '', l.statusCode, l.latencyMs, l.createdAt.toISOString()].join(',')
    ),
  ].join('\n')

  return new Response(rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="memra-all-activity-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
