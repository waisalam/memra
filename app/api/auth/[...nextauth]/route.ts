import { handlers } from '@/auth'
import type { NextRequest } from 'next/server'

export function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handlers.GET as any)(req)
}

export function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handlers.POST as any)(req)
}
