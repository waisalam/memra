import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DemoClient } from './demo-client'

export default async function DemoPage() {
  const session = await auth()
  const isLoggedIn = !!session

  let usedToday = 0
  if (session?.user?.id) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    usedToday = await prisma.apiLog.count({
      where: {
        userId: session.user.id,
        endpoint: '/api/chat/respond',
        createdAt: { gte: todayStart },
      },
    })
  }

  const messageLimit = isLoggedIn ? 50 : 5

  return (
    <DemoClient
      isLoggedIn={isLoggedIn}
      messageLimit={messageLimit}
      usedToday={usedToday}
      accountId={session?.user?.id ?? null}
    />
  )
}
