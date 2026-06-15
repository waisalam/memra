import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, plan } = await req.json()
  if (!userId || !['free', 'pro', 'enterprise'].includes(plan)) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: userId }, data: { plan } })
  return Response.json({ success: true })
}
