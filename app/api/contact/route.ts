export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, company, phone, message, plan } = body

  if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })
  if (!email?.trim()) return Response.json({ error: 'Email is required' }, { status: 400 })
  if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return Response.json({ error: 'Invalid email address' }, { status: 400 })

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      message: message.trim(),
      plan: plan?.trim() || 'enterprise',
    },
    select: { id: true, createdAt: true },
  })

  return Response.json({ success: true, id: contact.id }, { status: 201 })
}

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      message: true,
      plan: true,
      status: true,
      createdAt: true,
    },
  })

  return Response.json({ contacts, count: contacts.length })
}
