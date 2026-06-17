export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body

  if (!email?.trim()) {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  await prisma.contact.create({
    data: {
      name: email.trim().split('@')[0],
      email: email.trim().toLowerCase(),
      message: 'Extension waitlist',
      status: 'waitlist',
    },
  })

  return Response.json({ success: true })
}
