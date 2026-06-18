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
        data: { userId: accountId, endpoint: '/api/memory/forget', method: 'DELETE', agentId: callerUserId, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog forget]', e)
    }
  })()
}

export async function DELETE(req: NextRequest) {
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

  const body = await req.json()
  const { userId } = body

  const result = await prisma.memory.deleteMany({
    where: { accountId, ...(userId ? { userId } : {}) },
  })

  if (result.count > 0) {
    prisma.user.update({
      where: { id: accountId },
      data: { memoriesCount: { decrement: result.count } },
    }).catch(() => {})
  }

  logCall(accountId, userId ?? null, 200, Date.now() - start)
  return Response.json({ success: true, deleted: result.count })
}
