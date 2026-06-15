export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const runtime = 'nodejs'

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { keyId } = await req.json()
    if (!keyId) return Response.json({ error: 'keyId is required' }, { status: 400 })

    const key = await prisma.apiKey.findUnique({ where: { id: keyId }, select: { userId: true } })
    if (!key || key.userId !== session.user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.apiKey.update({ where: { id: keyId }, data: { isActive: false } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
