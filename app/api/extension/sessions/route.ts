export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/sessions', method: 'GET', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/sessions]', e)
    }
  })()
}

export async function GET(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type. Extension endpoints require an Extension key (mk_ext_...).', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated
  const { searchParams } = req.nextUrl
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const tool = searchParams.get('tool')
  const active = searchParams.get('active')
  const projectId = searchParams.get('projectId')

  const where: Record<string, unknown> = { accountId }
  if (tool) where.tool = tool
  if (active === 'true') where.isActive = true
  if (active === 'false') where.isActive = false
  if (projectId) where.projectId = projectId

  const sessions = await prisma.extensionSession.findMany({
    where,
    orderBy: { lastSavedAt: 'desc' },
    take: Math.min(limit, 50),
    select: {
      id: true,
      title: true,
      tool: true,
      projectId: true,
      workspacePath: true,
      messageCount: true,
      tokenCount: true,
      startedAt: true,
      lastSavedAt: true,
      isActive: true,
      summary: true,
    },
  })

  logCall(accountId, 200, Date.now() - start)
  return Response.json({
    sessions: sessions.map((s) => ({
      ...s,
      summary: s.summary ? s.summary.slice(0, 100) : null,
    })),
    count: sessions.length,
  })
}
