export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

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

  const { accountId, plan } = validated

  try {
    await checkAndIncrementUsage(accountId, plan)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('RATE_LIMIT:')) {
      logCall(accountId, null, 429, Date.now() - start)
      return Response.json(
        { error: 'Monthly API limit reached', plan, upgradeUrl: 'https://memra-rho.vercel.app/pricing' },
        { status: 429 }
      )
    }
  }

  const { searchParams } = req.nextUrl
  const userId = searchParams.get('userId') ?? 'default'
  const agentId = searchParams.get('agentId')
  const limitParam = searchParams.get('limit')
  const before = searchParams.get('before')
  const after = searchParams.get('after')
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc' as const

  const where: Record<string, unknown> = { accountId, userId }
  if (agentId) where.agentId = agentId
  if (before) where.createdAt = { ...(where.createdAt as object ?? {}), lt: new Date(before) }
  if (after) where.createdAt = { ...(where.createdAt as object ?? {}), gt: new Date(after) }

  const findArgs: Record<string, unknown> = {
    where,
    orderBy: { createdAt: order },
    select: { id: true, content: true, role: true, userId: true, agentId: true, createdAt: true },
  }
  if (limitParam) {
    findArgs.take = parseInt(limitParam, 10)
  }

  const [history, total] = await Promise.all([
    prisma.memory.findMany(findArgs as Parameters<typeof prisma.memory.findMany>[0]),
    prisma.memory.count({ where: { accountId, userId, ...(agentId ? { agentId } : {}) } }),
  ])

  logCall(accountId, userId, 200, Date.now() - start)
  return Response.json({
    history,
    total,
    count: history.length,
  })
}
