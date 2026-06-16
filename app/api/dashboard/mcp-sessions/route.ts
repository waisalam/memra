export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [sessions, total] = await prisma.$transaction([
    prisma.contextSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        tool: true,
        messageCount: true,
        tokenCount: true,
        summary: true,
        resumePrompt: true,
        createdAt: true,
      },
    }),
    prisma.contextSession.count({ where: { userId } }),
  ])

  return Response.json({ sessions, total })
}
