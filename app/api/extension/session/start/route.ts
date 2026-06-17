export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'

function logCall(accountId: string, statusCode: number, latencyMs: number) {
  ;(async () => {
    try {
      await prisma.apiLog.create({
        data: { userId: accountId, endpoint: '/api/extension/session/start', method: 'POST', statusCode, latencyMs },
      })
    } catch (e) {
      console.error('[ApiLog extension/session/start]', e)
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
    return Response.json({ error: 'Wrong API key type. Extension endpoints require an Extension key (mk_ext_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated

  const body = await req.json()
  const { tool, sessionHash, title, projectId, workspacePath } = body

  if (!tool || !sessionHash) {
    logCall(accountId, 400, Date.now() - start)
    return Response.json({ error: 'tool and sessionHash are required' }, { status: 400 })
  }

  const existing = await prisma.extensionSession.findFirst({
    where: { sessionHash, accountId, isActive: true },
  })

  if (existing) {
    logCall(accountId, 200, Date.now() - start)
    return Response.json({
      sessionId: existing.id,
      isNew: false,
      resumePrompt: null,
    })
  }

  const autoTitle = title ?? 'Untitled Session'

  const session = await prisma.extensionSession.create({
    data: {
      accountId,
      sessionHash,
      tool,
      title: autoTitle,
      projectId: projectId ?? null,
      workspacePath: workspacePath ?? null,
      messages: [],
    },
  })

  let resumePrompt: string | null = null
  const resumeWhere: Record<string, unknown> = {
    accountId,
    id: { not: session.id },
    isActive: false,
    resumePrompt: { not: null },
  }
  if (projectId) {
    resumeWhere.projectId = projectId
  }

  const previousSession = await prisma.extensionSession.findFirst({
    where: resumeWhere,
    orderBy: { lastSavedAt: 'desc' },
    select: { resumePrompt: true },
  })
  if (previousSession?.resumePrompt) {
    resumePrompt = previousSession.resumePrompt
  }

  logCall(accountId, 200, Date.now() - start)
  return Response.json({
    sessionId: session.id,
    isNew: true,
    resumePrompt,
  })
}
