export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { generateEmbedding } from '@/lib/embeddings'

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

  const { accountId } = validated

  const { searchParams } = req.nextUrl
  const query = searchParams.get('query')
  const userId = searchParams.get('userId') ?? 'default'
  const limit = parseInt(searchParams.get('limit') ?? '5', 10)

  if (!query) {
    logCall(accountId, userId, 400, Date.now() - start)
    return Response.json({ error: 'query is required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(query)
  const embeddingStr = `[${embedding.join(',')}]`

  const memories = await prisma.$queryRaw<MemoryRow[]>`
    SELECT id, content, role, "createdAt",
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM "Memory"
    WHERE "accountId" = ${accountId}
      AND "userId" = ${userId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `

  logCall(accountId, userId, 200, Date.now() - start)
  return Response.json({ context: memories, count: memories.length })
}
