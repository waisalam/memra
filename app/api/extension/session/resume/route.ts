export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/session/resume', method: 'GET', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/session/resume]', e)
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

  const { accountId, plan } = validated
  const { searchParams } = req.nextUrl
  const sessionId = searchParams.get('sessionId')
  const projectId = searchParams.get('projectId')

  const messageLimit = plan === 'free' ? 5 : 10

  let session
  if (sessionId) {
    session = await prisma.extensionSession.findUnique({
      where: { id: sessionId },
      include: {
        extensionMessages: {
          orderBy: { savedAt: 'desc' },
          take: messageLimit,
          select: { role: true, content: true, savedAt: true },
        },
      },
    })
    if (!session || session.accountId !== accountId) {
      logCall(accountId, 404, Date.now() - start)
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }
  } else {
    const where: Record<string, unknown> = { accountId }
    if (projectId) {
      where.projectId = projectId
    }

    session = await prisma.extensionSession.findFirst({
      where,
      orderBy: { lastSavedAt: 'desc' },
      include: {
        extensionMessages: {
          orderBy: { savedAt: 'desc' },
          take: messageLimit,
          select: { role: true, content: true, savedAt: true },
        },
      },
    })
    if (!session) {
      logCall(accountId, 404, Date.now() - start)
      return Response.json({ error: 'No sessions found' }, { status: 404 })
    }
  }

  const messages = session.extensionMessages.reverse()

  logCall(accountId, 200, Date.now() - start)

  if (plan === 'free') {
    return Response.json({
      sessionId: session.id,
      title: session.title,
      projectId: session.projectId,
      summary: session.summary,
      messages,
      upgradeMessage: 'Upgrade to Pro for AI-generated resume prompts',
    })
  }

  return Response.json({
    sessionId: session.id,
    title: session.title,
    projectId: session.projectId,
    summary: session.summary,
    resumePrompt: session.resumePrompt,
    messages,
  })
}
