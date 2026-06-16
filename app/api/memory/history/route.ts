export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

export const runtime = 'nodejs'

function logCall(accountId: string, callerUserId: string | null, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/memory/history', method: 'GET', agentId: callerUserId, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog history]', e)
    }
  })()
}

export async function GET(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }
  if (validated.keyType !== 'memory') {
    return Response.json({ error: 'Wrong API key type. Memory endpoints require a Memory key (mk_mem_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated

  const { searchParams } = req.nextUrl
  const userId = searchParams.get('userId') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  const history = await prisma.memory.findMany({
    where: { accountId, ...(userId ? { userId } : {}) },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true, content: true, role: true, userId: true, agentId: true, createdAt: true },
  })

  logCall(accountId, userId ?? null, 200, Date.now() - start)
  return Response.json({ history, count: history.length })
}
