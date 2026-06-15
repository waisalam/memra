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
    select: { id: true, key: true, name: true, createdAt: true, lastUsed: true },
    orderBy: { createdAt: 'desc' },
  })

  const masked = keys.map((k: typeof keys[number]) => ({
    ...k,
    key: `mk_live_${'*'.repeat(Math.max(0, k.key.length - 4))}${k.key.slice(-4)}`,
  }))

  return Response.json({ keys: masked })
}
