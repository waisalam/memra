export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, checkMemoryLimit } from '@/lib/validateApiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { PLAN_LIMITS } from '@/lib/plans'

export const runtime = 'nodejs'

function logCall(accountId: string, callerUserId: string | null, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/memory/save', method: 'POST', agentId: callerUserId, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog save]', e)
    }
  })()
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'memory') {
    return Response.json({ error: 'Wrong API key type. Memory endpoints require a Memory key (mk_mem_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId, plan } = validated

  const withinLimit = await checkMemoryLimit(accountId, plan)
  if (!withinLimit) {
    const limit = PLAN_LIMITS[plan].memories
    logCall(accountId, null, 429, Date.now() - start)
    return Response.json(
      { error: 'Memory limit reached', limit, plan, upgrade: 'https://memra.dev/pricing' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { userId = 'default', agentId = 'default', userMessage, aiReply } = body

  if (!userMessage || !aiReply) {
    logCall(accountId, userId, 400, Date.now() - start)
    return Response.json({ error: 'userMessage and aiReply are required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(`${userMessage} ${aiReply}`)
  const embeddingStr = `[${embedding.join(',')}]`

  const userMemory = await prisma.memory.create({
    data: { accountId, userId, agentId, role: 'user', content: userMessage },
  })

await prisma.$executeRawUnsafe(
  `UPDATE "Memory" SET embedding = $1::vector WHERE id = $2`,
  `[${embedding.join(',')}]`,
  userMemory.id
)

  await prisma.memory.create({
    data: { accountId, userId, agentId, role: 'assistant', content: aiReply },
  })

  prisma.user.update({
    where: { id: accountId },
    data: { memoriesCount: { increment: 2 } },
  }).catch(() => {})

  logCall(accountId, userId, 200, Date.now() - start)
  return Response.json({ success: true, saved: 2 })
}
