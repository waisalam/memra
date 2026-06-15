import { PLAN_LIMITS } from '@/lib/plans'

export default function AdminSettingsPage() {
  const limits = PLAN_LIMITS

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform configuration</p>
      </div>

      {/* Plan limits overview */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-zinc-200">Plan Limits</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Defined in <code className="text-zinc-500">lib/plans.ts</code></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Plan', 'Memories', 'API Keys', 'Agents', 'API Calls/Day'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {(Object.entries(limits) as [string, typeof limits.free][]).map(([plan, l]) => (
                <tr key={plan} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      plan === 'enterprise' ? 'bg-amber-500/10 text-amber-400' :
                      plan === 'pro' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{l.memories === Infinity ? '∞' : l.memories.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{l.apiKeys === Infinity ? '∞' : l.apiKeys}</td>
                  <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{l.agents === Infinity ? '∞' : l.agents}</td>
                  <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{l.apiCallsPerDay === Infinity ? '∞' : l.apiCallsPerDay.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environment */}
      <div className="rounded-2xl border border-[#1e1e1e] p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="text-sm font-semibold text-zinc-200">Environment</h2>
        <div className="space-y-2">
          {[
            { key: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL },
            { key: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL },
            { key: 'GROQ_API_KEY', value: process.env.GROQ_API_KEY ? '••••••••' : 'not set' },
            { key: 'OPENROUTER_API_KEY', value: process.env.OPENROUTER_API_KEY ? '••••••••' : 'not set' },
          ].map(({ key, value }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
              <code className="text-xs text-zinc-500 font-mono">{key}</code>
              <code className={`text-xs font-mono ${value ? 'text-zinc-300' : 'text-red-400'}`}>
                {value ?? 'not set'}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/20 p-6 space-y-4" style={{ background: 'rgba(239,68,68,0.03)' }}>
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        <p className="text-xs text-zinc-600">
          Destructive operations are not available from the UI. Use the database or Prisma Studio for bulk deletes.
        </p>
        <a
          href="https://prisma.io/studio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          Open Prisma Studio ↗
        </a>
      </div>
    </div>
  )
}
