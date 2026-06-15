export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const accountId = session.user.id
  const { agentId, userId: callerUserId } = await req.json()
  // Support both userId (new) and agentId (legacy) as the end-user identifier
  const targetUserId = callerUserId ?? agentId

  if (!targetUserId) return Response.json({ error: 'userId is required' }, { status: 400 })

  const result = await prisma.memory.deleteMany({ where: { accountId, userId: targetUserId } })

  if (result.count > 0) {
    prisma.user.update({
      where: { id: accountId },
      data: { memoriesCount: { decrement: result.count } },
    }).catch(() => {})
  }

  return Response.json({ success: true, deleted: result.count })
}
