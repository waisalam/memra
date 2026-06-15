export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey, checkMemoryLimit } from '@/lib/validateApiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { PLAN_LIMITS } from '@/lib/plans'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const { userId, plan } = validated

  const withinLimit = await checkMemoryLimit(userId, plan)
  if (!withinLimit) {
    const limit = PLAN_LIMITS[plan].memories
    return Response.json(
      {
        error: 'Memory limit reached',
        limit,
        plan,
        upgrade: 'https://memra.dev/pricing',
      },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { agentId = 'default', userMessage, aiReply } = body

  if (!userMessage || !aiReply) {
    return Response.json({ error: 'userMessage and aiReply are required' }, { status: 400 })
  }

  const embedding = await generateEmbedding(`${userMessage} ${aiReply}`)
  const embeddingStr = `[${embedding.join(',')}]`

  const userMemory = await prisma.memory.create({
    data: { userId, agentId, role: 'user', content: userMessage },
  })

  await prisma.$queryRaw`
    UPDATE "Memory"
    SET embedding = ${embeddingStr}::vector
    WHERE id = ${userMemory.id}
  `

  await prisma.memory.create({
    data: { userId, agentId, role: 'assistant', content: aiReply },
  })

  // Keep memoriesCount in sync (best-effort, non-blocking)
  prisma.user.update({
    where: { id: userId },
    data: { memoriesCount: { increment: 2 } },
  }).catch(() => {})

  return Response.json({ success: true, saved: 2 })
}
