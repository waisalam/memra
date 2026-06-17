export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, name = 'Default Key', keyType: rawKeyType } = body
  const keyType = rawKeyType === 'mcp' ? 'mcp' : rawKeyType === 'extension' ? 'extension' : 'memory'

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

  if (keyType === 'extension') {
    const extKeyCount = await prisma.apiKey.count({ where: { userId, keyType: 'extension', isActive: true } })
    const extLimit = PLAN_LIMITS[plan]?.extensionKeys ?? 1
    if (extKeyCount >= extLimit) {
      return Response.json(
        { error: 'You can only have 1 active extension key. Revoke the existing one to create a new one.' },
        { status: 429 }
      )
    }
  }

  const prefix = keyType === 'mcp' ? 'mk_mcp_' : keyType === 'extension' ? 'mk_ext_' : 'mk_mem_'
  const rawKey = `${prefix}${crypto.randomUUID().replace(/-/g, '')}`

  const apiKey = await prisma.apiKey.create({
    data: { userId, name, key: rawKey, keyType },
    select: { id: true, key: true, name: true, createdAt: true, keyType: true },
  })

  return Response.json({ apiKey })
}
