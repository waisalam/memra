export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

export const runtime = 'nodejs'

type MemoryRow = {
  id: string
  content: string
  role: string
  createdAt: Date
  similarity: number
}

function logCall(accountId: string, callerUserId: string | null, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/memory/context', method: 'GET', agentId: callerUserId, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog context]', e)
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
  const query = searchParams.get('query')
  const userId = searchParams.get('userId') ?? 'default'
  const agentId = searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') ?? '5', 10)
  const recentLimit = parseInt(searchParams.get('recentLimit') ?? '10', 10)

  if (!query) {
    logCall(accountId, userId, 400, Date.now() - start)
    return Response.json({ error: 'query is required' }, { status: 400 })
  }

  const recentWhere: Record<string, unknown> = { accountId, userId }
  if (agentId) recentWhere.agentId = agentId

  const [recentHistory, embedding] = await Promise.all([
    prisma.memory.findMany({
      where: recentWhere,
      orderBy: { createdAt: 'desc' },
      take: recentLimit,
      select: { id: true, content: true, role: true, createdAt: true },
    }),
    generateEmbedding(query),
  ])

  const embeddingStr = `[${embedding.join(',')}]`

  const relevantMemories = agentId
    ? await prisma.$queryRawUnsafe<MemoryRow[]>(
        `SELECT id, content, role, "createdAt",
                1 - (embedding <=> $1::vector) as similarity
         FROM "Memory"
         WHERE "accountId" = $2
           AND "userId" = $3
           AND "agentId" = $5
           AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT $4`,
        embeddingStr,
        accountId,
        userId,
        limit,
        agentId
      )
    : await prisma.$queryRawUnsafe<MemoryRow[]>(
        `SELECT id, content, role, "createdAt",
                1 - (embedding <=> $1::vector) as similarity
         FROM "Memory"
         WHERE "accountId" = $2
           AND "userId" = $3
           AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT $4`,
        embeddingStr,
        accountId,
        userId,
        limit
      )

  const recentIds = new Set(recentHistory.map((m) => m.id))
  const dedupedRelevant = relevantMemories.filter((m) => !recentIds.has(m.id))

  logCall(accountId, userId, 200, Date.now() - start)
  return Response.json({
    recentHistory: recentHistory.reverse(),
    relevantMemories: dedupedRelevant,
    context: relevantMemories,
    count: relevantMemories.length,
  })
}
