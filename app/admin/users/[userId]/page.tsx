import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PlanChanger } from './plan-changer'
import { DeleteUser } from './delete-user'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { memories: true, apiKeys: true, apiLogs: true } },
      apiKeys: { select: { id: true, name: true, isActive: true, lastUsed: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!user) notFound()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const apiCallsToday = await prisma.apiLog.count({ where: { userId, createdAt: { gte: todayStart } } })

  function timeAgo(date: Date | null) {
    if (!date) return '—'
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const planBadge = (p: string) => {
    if (p === 'enterprise') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    if (p === 'pro') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    return 'bg-zinc-800 text-zinc-500'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
          ← Users
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{user.name ?? 'Unnamed user'}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{user.email}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${planBadge(user.plan)}`}>
          {user.plan}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Memories', value: user._count.memories },
          { label: 'API Keys', value: user._count.apiKeys },
          { label: 'Total API Calls', value: user._count.apiLogs },
          { label: 'API Calls Today', value: apiCallsToday },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#1e1e1e] p-5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs text-zinc-600 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Plan management */}
      <div className="rounded-2xl border border-[#1e1e1e] p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="text-sm font-semibold text-zinc-200">Plan Management</h2>
        <PlanChanger userId={userId} currentPlan={user.plan} />
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">API Keys ({user.apiKeys.length})</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {user.apiKeys.length === 0 ? (
            <div className="py-8 text-center text-zinc-600 text-sm">No API keys</div>
          ) : (
            user.apiKeys.map((k) => (
              <div key={k.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{k.name}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Created {timeAgo(k.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {k.lastUsed && <span className="text-xs text-zinc-600">Used {timeAgo(k.lastUsed)}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${k.isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-600'}`}>
                    {k.isActive ? 'active' : 'revoked'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 p-6 space-y-4" style={{ background: 'rgba(239,68,68,0.03)' }}>
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        <p className="text-xs text-zinc-600">Permanently delete this user and all their data. This action is irreversible.</p>
        <DeleteUser userId={userId} email={user.email} />
      </div>
    </div>
  )
}
