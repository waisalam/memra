export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/validateApiKey'
import { checkAndIncrementUsage } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl
  const limit = Math.min(Number(searchParams.get('limit') ?? 10), 20)
  const tool = searchParams.get('tool') ?? undefined

  const where = { userId: accountId, ...(tool ? { tool } : {}) }

  const [sessions, total] = await prisma.$transaction([
    prisma.contextSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        tool: true,
        messageCount: true,
        tokenCount: true,
        createdAt: true,
        summary: true,
      },
    }),
    prisma.contextSession.count({ where }),
  ])

  const formatted = sessions.map((s) => ({
    ...s,
    summary: s.summary ? s.summary.slice(0, 100) + '...' : null,
  }))

  return Response.json({ sessions: formatted, count: total })
}
