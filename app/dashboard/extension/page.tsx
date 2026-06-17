export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import { ExtensionSessionsClient } from './extension-sessions-client'

export default async function ExtensionPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const accountId = session.user.id
  const plan = (session.user.plan ?? 'free') as Plan
  const sessionLimit = PLAN_LIMITS[plan]?.extensionSessions ?? PLAN_LIMITS.free.extensionSessions

  const [sessions, total, activeSessions, extKeyCount, toolStats] = await Promise.all([
    prisma.extensionSession.findMany({
      where: { accountId },
      orderBy: { lastSavedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        tool: true,
        messageCount: true,
        tokenCount: true,
        summary: true,
        resumePrompt: true,
        isActive: true,
        startedAt: true,
        lastSavedAt: true,
      },
    }),
    prisma.extensionSession.count({ where: { accountId } }),
    prisma.extensionSession.count({ where: { accountId, isActive: true } }),
    prisma.apiKey.count({ where: { userId: accountId, keyType: 'extension', isActive: true } }),
    prisma.extensionSession.groupBy({
      by: ['tool'],
      where: { accountId },
      _count: { tool: true },
      orderBy: { _count: { tool: 'desc' } },
      take: 1,
    }),
  ])

  const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0)
  const topTool = toolStats[0]?.tool ?? 'none'

  return (
    <ExtensionSessionsClient
      initialSessions={sessions.map((s) => ({
        ...s,
        startedAt: s.startedAt.toISOString(),
        lastSavedAt: s.lastSavedAt.toISOString(),
      }))}
      total={total}
      activeSessions={activeSessions}
      totalMessages={totalMessages}
      topTool={topTool}
      hasExtKey={extKeyCount > 0}
      plan={plan}
      sessionLimit={sessionLimit === Infinity ? -1 : sessionLimit}
    />
  )
}
