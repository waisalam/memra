export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { McpSessionsClient } from './mcp-sessions-client'

export default async function McpPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id

  const [sessions, total, mcpKeyCount] = await prisma.$transaction([
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
    prisma.apiKey.count({ where: { userId, keyType: 'mcp', isActive: true } }),
  ])

  return (
    <McpSessionsClient
      initialSessions={sessions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      total={total}
      hasMcpKey={mcpKeyCount > 0}
    />
  )
}
