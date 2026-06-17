export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/session/update', method: 'PATCH', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/session/update]', e)
    }
  })()
}

export async function PATCH(req: NextRequest) {
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
  const { sessionId, title } = body

  if (!sessionId) {
    logCall(accountId, 400, Date.now() - start)
    return Response.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const session = await prisma.extensionSession.findUnique({
    where: { id: sessionId },
    select: { id: true, accountId: true },
  })

  if (!session || session.accountId !== accountId) {
    logCall(accountId, 404, Date.now() - start)
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = String(title).slice(0, 60)

  if (Object.keys(updateData).length === 0) {
    logCall(accountId, 400, Date.now() - start)
    return Response.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await prisma.extensionSession.update({
    where: { id: sessionId },
    data: updateData,
    select: { id: true, title: true },
  })

  logCall(accountId, 200, Date.now() - start)
  return Response.json({ success: true, session: updated })
}
