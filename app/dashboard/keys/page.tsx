export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import { KeysClient } from './keys-client'

async function getKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, key: true, name: true, createdAt: true, lastUsed: true, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function KeysPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const keys = await getKeys(session.user.id)
  const plan = (session.user.plan ?? 'free') as Plan
  const keyLimit = PLAN_LIMITS[plan].apiKeys

  return (
    <KeysClient
      initialKeys={keys.map((k) => ({
        ...k,
        maskedKey: `mk_live_${'•'.repeat(Math.max(0, k.key.length - 4))}${k.key.slice(-4)}`,
      }))}
      userId={session.user.id}
      keyLimit={keyLimit}
    />
  )
}
