export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name = 'Default Key' } = body

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({
      data: { id: userId, email: `${userId}@memra.dev` },
    })
  }

  const plan = (user.plan ?? 'free') as Plan
  const keyLimit = PLAN_LIMITS[plan]?.apiKeys ?? PLAN_LIMITS.free.apiKeys

  if (keyLimit !== Infinity) {
    const activeKeyCount = await prisma.apiKey.count({ where: { userId, isActive: true } })
    if (activeKeyCount >= keyLimit) {
      return Response.json(
        {
          error: `API key limit reached. ${
            plan === 'free'
              ? `Free plan allows ${keyLimit} keys. Upgrade to Pro for more.`
              : `Your plan allows ${keyLimit} keys.`
          }`,
        },
        { status: 429 }
      )
    }
  }

  const rawKey = `mk_live_${crypto.randomUUID().replace(/-/g, '')}`

  const apiKey = await prisma.apiKey.create({
    data: { userId, name, key: rawKey },
    select: { id: true, key: true, name: true, createdAt: true },
  })

  return Response.json({ apiKey })
}
