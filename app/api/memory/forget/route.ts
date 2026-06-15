export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

export const runtime = 'nodejs'

export async function DELETE(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }
  const { userId } = validated

  const body = await req.json()
  const { agentId } = body

  const result = await prisma.memory.deleteMany({
    where: { userId, ...(agentId ? { agentId } : {}) },
  })

  if (result.count > 0) {
    prisma.user.update({
      where: { id: userId },
      data: { memoriesCount: { decrement: result.count } },
    }).catch(() => {})
  }

  return Response.json({ success: true, deleted: result.count })
}
