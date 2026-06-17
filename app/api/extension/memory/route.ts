export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { generateEmbedding } from '@/lib/embeddings'

function logCall(accountId: string, method: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/memory', method, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/memory]', e)
    }
  })()
}

function deriveUserId(accountId: string): string {
  return crypto
    .createHash('sha256')
    .update(accountId)
    .digest('hex')
    .slice(0, 16)
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type.', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated
  const userId = deriveUserId(accountId)

  const body = await req.json()
  const { userMessage, aiReply, agentId = 'extension' } = body

  if (!userMessage || !aiReply) {
    logCall(accountId, 'POST', 400, Date.now() - start)
    return Response.json({ error: 'userMessage and aiReply are required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(`${userMessage} ${aiReply}`)

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

  logCall(accountId, 'POST', 200, Date.now() - start)
  return Response.json({ success: true, saved: 2 })
}

type MemoryRow = {
  id: string
  content: string
  role: string
  createdAt: Date
  similarity: number
}

export async function GET(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type.', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated
  const userId = deriveUserId(accountId)

  const { searchParams } = req.nextUrl
  const query = searchParams.get('query')
  const limit = parseInt(searchParams.get('limit') ?? '5', 10)

  if (!query) {
    logCall(accountId, 'GET', 400, Date.now() - start)
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

  logCall(accountId, 'GET', 200, Date.now() - start)
  return Response.json({ context: memories, count: memories.length })
}
