import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { contactId, status } = await req.json()
  if (!contactId || !['new', 'contacted', 'closed'].includes(status)) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  await prisma.contact.update({ where: { id: contactId }, data: { status } })
  return Response.json({ success: true })
}
