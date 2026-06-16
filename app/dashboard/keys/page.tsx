export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'
import { KeysClient } from './keys-client'

async function getKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, key: true, name: true, createdAt: true, lastUsed: true, isActive: true, keyType: true },
    orderBy: { createdAt: 'desc' },
  })
}

function maskKey(key: string, keyType: string) {
  const prefix = keyType === 'mcp' ? 'mk_mcp_' : key.startsWith('mk_mem_') ? 'mk_mem_' : 'mk_mem_'
  return `${prefix}${'•'.repeat(Math.max(0, key.length - prefix.length - 4))}${key.slice(-4)}`
}

export default async function KeysPage(props: { searchParams: Promise<{ type?: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  const sp = await props.searchParams
  const initialTab = sp.type === 'mcp' ? 'mcp' : 'memory'

  const keys = await getKeys(session.user.id)
  const plan = (session.user.plan ?? 'free') as Plan
  const keyLimit = PLAN_LIMITS[plan].apiKeys

  return (
    <KeysClient
      initialKeys={keys.map((k) => {
        const kt = (k.keyType ?? 'memory') as 'memory' | 'mcp'
        return {
          ...k,
          keyType: kt,
          maskedKey: maskKey(k.key, kt),
        }
      })}
      userId={session.user.id}
      keyLimit={keyLimit}
      initialTab={initialTab}
    />
  )
}
