import { prisma } from './prisma'
import { PLAN_LIMITS, type Plan } from './plans'

export type ValidatedKey = {
  accountId: string
  plan: Plan
  keyType: 'memory' | 'mcp'
}

export async function validateApiKey(request: Request): Promise<ValidatedKey | null> {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) return null

  const record = await prisma.apiKey.findUnique({
    where: { key: apiKey, isActive: true },
    select: {
      userId: true,
      id: true,
      keyType: true,
      user: { select: { plan: true, memoriesCount: true } },
    },
  })

  if (!record) return null

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsed: new Date() },
  })

  return {
    accountId: record.userId,
    plan: (record.user.plan ?? 'free') as Plan,
    keyType: (record.keyType ?? 'memory') as 'memory' | 'mcp',
  }
}

export async function checkMemoryLimit(accountId: string, plan: Plan): Promise<boolean> {
  const limit = PLAN_LIMITS[plan]?.memories ?? PLAN_LIMITS.free.memories
  if (limit === Infinity) return true

  const count = await prisma.memory.count({ where: { accountId } })
  return count < limit
}
