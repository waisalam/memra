import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const plan = params.plan ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 50

  const where = {
    ...(search ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(plan ? { plan } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, email: true, name: true, plan: true, memoriesCount: true, createdAt: true, _count: { select: { apiKeys: true, memories: true } } },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  function timeAgo(date: Date) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const planBadge = (p: string) => {
    if (p === 'enterprise') return 'bg-amber-500/10 text-amber-400'
    if (p === 'pro') return 'bg-purple-500/10 text-purple-400'
    return 'bg-zinc-800 text-zinc-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">{total.toLocaleString()} total</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search email or name…"
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#3a3a3a] w-64"
        />
        <select
          name="plan"
          defaultValue={plan}
          className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          Filter
        </button>
      </form>

      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['User', 'Plan', 'Memories', 'API Keys', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-zinc-200">{u.name ?? '—'}</p>
                      <p className="text-xs text-zinc-600">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${planBadge(u.plan)}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm tabular-nums">{u._count.memories.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-sm tabular-nums">{u._count.apiKeys}</td>
                  <td className="px-5 py-3.5 text-zinc-600 text-xs">{timeAgo(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#1e1e1e] flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?search=${search}&plan=${plan}&page=${page - 1}`} className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a href={`?search=${search}&plan=${plan}&page=${page + 1}`} className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
