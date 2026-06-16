export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

type Message = { role: string; content: string }

export async function POST(req: NextRequest) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'mcp') {
    return Response.json({ error: 'Wrong API key type. Context endpoints require an MCP key (mk_mcp_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId, plan } = validated

  try {
    await checkAndIncrementUsage(accountId, plan)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('RATE_LIMIT:')) {
      return Response.json(
        { error: 'Monthly API limit reached', plan, upgradeUrl: 'https://usememra.com/pricing' },
        { status: 429 }
      )
    }
  }

  if (plan === 'free') {
    return Response.json(
      { error: 'Resume prompts require Memra Pro', upgradeUrl: 'https://usememra.com/pricing' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { sessionId } = body

  let session
  if (sessionId) {
    session = await prisma.contextSession.findUnique({ where: { id: sessionId } })
    if (!session || session.userId !== accountId) {
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }
  } else {
    session = await prisma.contextSession.findFirst({
      where: { userId: accountId },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (!session) {
    return Response.json(
      {
        error: 'No sessions found. Save a context session first.',
        saveUrl: 'https://usememra.com/context',
      },
      { status: 404 }
    )
  }

  const messages = session.messages as Message[]

  return Response.json({
    sessionId: session.id,
    title: session.title,
    tool: session.tool,
    resumePrompt: session.resumePrompt,
    summary: session.summary,
    messageCount: session.messageCount,
    lastFiveMessages: messages.slice(-5),
  })
}
