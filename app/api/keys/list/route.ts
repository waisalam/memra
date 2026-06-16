export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId, isActive: true },
    select: { id: true, key: true, name: true, createdAt: true, lastUsed: true, keyType: true },
    orderBy: { createdAt: 'desc' },
  })

  const masked = keys.map((k: typeof keys[number]) => {
    const prefix = k.key.startsWith('mk_mcp_') ? 'mk_mcp_' : k.key.startsWith('mk_mem_') ? 'mk_mem_' : 'mk_live_'
    return {
      ...k,
      key: `${prefix}${'*'.repeat(Math.max(0, k.key.length - prefix.length - 4))}${k.key.slice(-4)}`,
    }
  })

  return Response.json({ keys: masked })
}
