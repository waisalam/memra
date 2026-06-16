export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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

  const { sessionId } = await params
  const session = await prisma.contextSession.findUnique({ where: { id: sessionId } })

  if (!session || session.userId !== accountId) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  if (plan === 'free') {
    const { messages: _messages, ...rest } = session
    return Response.json({
      ...rest,
      messages: null,
      upgradeNote: 'Full conversation history requires Memra Pro',
    })
  }

  return Response.json(session)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const validated = await validateApiKey(req)
  if (!validated) {
    return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (validated.keyType !== 'mcp') {
    return Response.json({ error: 'Wrong API key type. Context endpoints require an MCP key (mk_mcp_...). Get one at: https://memra-rho.vercel.app/dashboard/keys', code: 'WRONG_KEY_TYPE' }, { status: 403 })
  }

  const { accountId } = validated
  const { sessionId } = await params

  const session = await prisma.contextSession.findUnique({ where: { id: sessionId } })
  if (!session || session.userId !== accountId) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  await prisma.contextSession.delete({ where: { id: sessionId } })
  return Response.json({ success: true, deleted: 1 })
}
