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

export async function GET(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }
  const { userId } = validated

  const { searchParams } = req.nextUrl
  const query = searchParams.get('query')
  const agentId = searchParams.get('agentId') ?? 'default'
  const limit = parseInt(searchParams.get('limit') ?? '5', 10)

  if (!query) {
    return Response.json({ error: 'query is required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(query)
  const embeddingStr = `[${embedding.join(',')}]`

  const memories = await prisma.$queryRaw<MemoryRow[]>`
    SELECT id, content, role, "createdAt",
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM "Memory"
    WHERE "userId" = ${userId}
      AND "agentId" = ${agentId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `

  return Response.json({ context: memories, count: memories.length })
}
