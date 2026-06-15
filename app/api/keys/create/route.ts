export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

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

  const rawKey = `mk_live_${crypto.randomUUID().replace(/-/g, '')}`

  const apiKey = await prisma.apiKey.create({
    data: { userId, name, key: rawKey },
    select: { id: true, key: true, name: true, createdAt: true },
  })

  return Response.json({ apiKey })
}
