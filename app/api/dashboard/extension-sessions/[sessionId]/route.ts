export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await params
  const accountId = session.user.id

  const extSession = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    include: {
      extensionMessages: {
        orderBy: { savedAt: 'asc' },
        select: { role: true, content: true, savedAt: true },
      },
    },
  })

  if (!extSession || extSession.accountId !== accountId) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  return Response.json({
    ...extSession,
    messages: extSession.extensionMessages,
    extensionMessages: undefined,
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await params
  const accountId = session.user.id

  const extSession = await prisma.extensionSession.findUnique({ where: { id: sessionId } })
  if (!extSession || extSession.accountId !== accountId) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  await prisma.extensionSession.delete({ where: { id: sessionId } })
  return Response.json({ success: true })
}
