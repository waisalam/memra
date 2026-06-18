import { prisma } from './prisma'
import { PLAN_LIMITS } from './plans'

const LIMITS: Record<string, number> = {
  free: PLAN_LIMITS.free.apiCallsPerDay,
  pro: PLAN_LIMITS.pro.apiCallsPerDay,
  enterprise: Infinity,
}

export async function checkAndIncrementUsage(
  userId: string,
  plan: string
): Promise<{ callCount: number; limit: number; remaining: number }> {
  try {
    const month = new Date().toISOString().slice(0, 7)

    await prisma.apiUsage.upsert({
      where: { userId_month: { userId, month } },
      update: { callCount: { increment: 1 } },
      create: { userId, month, callCount: 1 },
    })

    const record = await prisma.apiUsage.findUnique({
      where: { userId_month: { userId, month } },
      select: { callCount: true },
    })

    const callCount = record?.callCount ?? 1
    const limit = LIMITS[plan] ?? LIMITS.free

    if (limit !== Infinity && callCount > limit) {
      throw new Error('RATE_LIMIT:Monthly limit reached')
    }

    return { callCount, limit, remaining: limit === Infinity ? Infinity : limit - callCount }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('RATE_LIMIT:')) throw err
    console.error('Rate limit check failed:', err)
    throw new Error('RATE_LIMIT:Rate limit check unavailable')
  }
}
