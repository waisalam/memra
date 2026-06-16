export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await params
  const userId = session.user.id

  const ctx = await prisma.contextSession.findUnique({ where: { id: sessionId } })
  if (!ctx || ctx.userId !== userId) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  await prisma.contextSession.delete({ where: { id: sessionId } })
  return Response.json({ success: true })
}
