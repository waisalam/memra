export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }
  const { userId } = validated

  const { searchParams } = req.nextUrl
  const agentId = searchParams.get('agentId') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  const history = await prisma.memory.findMany({
    where: { userId, ...(agentId ? { agentId } : {}) },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { id: true, content: true, role: true, agentId: true, createdAt: true },
  })

  return Response.json({ history, count: history.length })
}
