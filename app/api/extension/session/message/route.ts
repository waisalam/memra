export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/session/message', method: 'POST', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/session/message]', e)
    }
  })()
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'extension') {
    return Response.json({ error: 'Wrong API key type. Extension endpoints require an Extension key (mk_ext_...).', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated

  const body = await req.json()
  const { sessionId, role, content, tool } = body

  if (!sessionId || !role || !content || !tool) {
    logCall(accountId, 400, Date.now() - start)
    return Response.json({ error: 'sessionId, role, content, and tool are required' }, { status: 400 })
  }

  const session = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    select: { id: true, accountId: true, messageCount: true, messages: true, title: true },
  })

  if (!session || session.accountId !== accountId) {
    logCall(accountId, 404, Date.now() - start)
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  const tokens = Math.round(content.split(/\s+/).length * 1.3)

  await prisma.extensionMessage.create({
    data: {
      sessionId,
      accountId,
      role,
      content,
      tool,
      tokens,
    },
  })

  const existingMessages = (session.messages as Array<{ role: string; content: string }>) ?? []
  const updatedMessages = [...existingMessages, { role, content: content.slice(0, 500) }]

  const updateData: Record<string, unknown> = {
    messages: updatedMessages,
    messageCount: { increment: 1 },
    tokenCount: { increment: tokens },
  }

  // Auto-set title from first user message if title is default
  if (session.title === 'Untitled Session' && role === 'user') {
    updateData.title = content.slice(0, 60)
  }

  await prisma.extensionSession.update({
    where: { id: sessionId },
    data: updateData,
  })

  logCall(accountId, 200, Date.now() - start)
  return Response.json({
    success: true,
    messageCount: session.messageCount + 1,
    tokenCount: tokens,
  })
}
