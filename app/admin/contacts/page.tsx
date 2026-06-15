import { prisma } from '@/lib/prisma'
import { ContactStatusChanger } from './contact-status-changer'

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const status = params.status ?? ''

  const contacts = await prisma.contact.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
  })

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400',
    contacted: 'bg-amber-500/10 text-amber-400',
    closed: 'bg-zinc-800 text-zinc-500',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Contact Requests</h1>
        <p className="text-zinc-500 text-sm mt-1">{contacts.length} requests</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'new', 'contacted', 'closed'].map((s) => (
          <a
            key={s}
            href={s ? `?status=${s}` : '?'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === s
                ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                : 'border border-[#2a2a2a] text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s || 'All'}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-[#1e1e1e] py-16 text-center text-zinc-600 text-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
            No contact requests
          </div>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#1e1e1e] p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-zinc-200">{c.name}</p>
                    {c.company && <span className="text-xs text-zinc-600">· {c.company}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${statusColors[c.status] ?? 'bg-zinc-800 text-zinc-500'}`}>
                      {c.status}
                    </span>
                    {c.plan && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">
                        {c.plan}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600">
                    <a href={`mailto:${c.email}`} className="text-blue-400 hover:underline">{c.email}</a>
                    {c.phone && <span>{c.phone}</span>}
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                </div>
                <ContactStatusChanger contactId={c.id} currentStatus={c.status} />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{c.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
