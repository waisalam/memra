export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, endpoint: string, method: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint, method, statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/sessions/[id]]', e)
    }
  })()
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type.', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId, plan } = validated
  const { sessionId } = await params

  const session = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    include: {
      extensionMessages: {
        orderBy: { savedAt: 'asc' },
        ...(plan === 'free' ? { take: 20 } : {}),
        select: { id: true, role: true, content: true, tool: true, tokens: true, savedAt: true },
      },
    },
  })

  if (!session || session.accountId !== accountId) {
    logCall(accountId, `/api/extension/sessions/${sessionId}`, 'GET', 404, Date.now() - start)
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  logCall(accountId, `/api/extension/sessions/${sessionId}`, 'GET', 200, Date.now() - start)
  return Response.json({
    ...session,
    messages: session.extensionMessages,
    extensionMessages: undefined,
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type.', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated
  const { sessionId } = await params
  const { searchParams } = req.nextUrl
  const permanent = searchParams.get('permanent') === 'true'

  const session = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    select: { id: true, accountId: true },
  })

  if (!session || session.accountId !== accountId) {
    logCall(accountId, `/api/extension/sessions/${sessionId}`, 'DELETE', 404, Date.now() - start)
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  if (permanent) {
    await prisma.extensionSession.delete({ where: { id: sessionId } })
  } else {
    await prisma.extensionSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    })
  }

  logCall(accountId, `/api/extension/sessions/${sessionId}`, 'DELETE', 200, Date.now() - start)
  return Response.json({ success: true, permanent })
}
