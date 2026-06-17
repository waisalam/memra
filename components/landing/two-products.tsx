import Link from 'next/link'

export function TwoProducts() {
  return (
    <section className="py-24 px-4" style={{ background: '#050505' }}>
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Heading */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One platform. Two powerful products.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Whether you&apos;re building AI apps or using AI in VS Code — Memra gives your AI a memory.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memory API */}
          <div
            className="rounded-2xl border p-7 space-y-6 flex flex-col"
            style={{ background: '#040d1a', borderColor: '#1e3a5f' }}
          >
            <div className="space-y-3">
              <span
                className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest text-blue-400"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
              >
                For AI App Developers
              </span>
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Memory API</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
                  Add persistent memory to any AI application. Save conversations, retrieve context, and give every user their own memory layer.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto"
              style={{ background: '#020810', borderColor: '#1e3a5f' }}
            >
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">npm install @memra/client</span>{'\n'}
              <span className="text-blue-400">import</span>
              <span className="text-zinc-300"> {'{ MemoryClient }'} </span>
              <span className="text-blue-400">from</span>
              <span className="text-green-400"> &apos;@memra/client&apos;</span>{'\n\n'}
              <span className="text-blue-400">const</span>
              <span className="text-zinc-300"> memory </span>
              <span className="text-blue-400">=</span>
              <span className="text-blue-300"> new MemoryClient</span>
              <span className="text-zinc-300">{'({'}</span>{'\n'}
              <span className="text-zinc-300">{'  '}</span>
              <span className="text-purple-300">apiKey</span>
              <span className="text-zinc-300">: </span>
              <span className="text-green-400">&apos;mk_mem_...&apos;</span>{'\n'}
              <span className="text-zinc-300">{'}'}</span>){'\n\n'}
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">Save + retrieve in 2 lines</span>{'\n'}
              <span className="text-blue-400">await</span>
              <span className="text-zinc-300"> memory.</span>
              <span className="text-blue-300">save</span>
              <span className="text-zinc-300">(userId, msg, reply)</span>{'\n'}
              <span className="text-blue-400">const</span>
              <span className="text-zinc-300"> ctx </span>
              <span className="text-blue-400">=</span>
              <span className="text-blue-400"> await</span>
              <span className="text-zinc-300"> memory.</span>
              <span className="text-blue-300">getContext</span>
              <span className="text-zinc-300">(userId, query)</span>
            </div>

            <ul className="space-y-2">
              {[
                'Semantic search over conversation history',
                'Per-user memory isolation',
                'Works with any LLM or framework',
                'REST API — no SDK required',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex-1" />
            <Link
              href="/dashboard/keys?type=memory"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', minHeight: '44px' }}
            >
              Get Memory API key
            </Link>
          </div>

          {/* VS Code Extension */}
          <div
            className="rounded-2xl border p-7 space-y-6 flex flex-col"
            style={{ background: '#041a0f', borderColor: '#1e5f3a' }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  For VS Code Users
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100">VS Code Extension</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
                  Auto-captures every AI conversation in VS Code. Works with Copilot, Claude Code, Cline, and Continue. Zero setup — install and forget.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto"
              style={{ background: '#021008', borderColor: '#1e5f3a' }}
            >
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">Install from VS Code Marketplace</span>{'\n'}
              <span className="text-emerald-400">ext install</span>
              <span className="text-zinc-300"> memra.vscode-extension</span>{'\n\n'}
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">Add your extension key</span>{'\n'}
              <span className="text-zinc-300">{'{'}</span>{'\n'}
              <span className="text-zinc-300">{'  '}</span>
              <span className="text-emerald-300">memra.apiKey</span>
              <span className="text-zinc-300">: </span>
              <span className="text-green-400">&apos;mk_ext_...&apos;</span>{'\n'}
              <span className="text-zinc-300">{'}'}</span>{'\n\n'}
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">That&apos;s it. Sessions auto-save.</span>
            </div>

            <ul className="space-y-2">
              {[
                'Auto-saves every chat session',
                'Injects context on new sessions',
                'Works with all VS Code AI tools',
                'Cross-session memory with semantic search',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex-1" />
            <a
              href="https://marketplace.visualstudio.com/items?itemName=memra.memra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', minHeight: '44px' }}
            >
              Install from VS Code Marketplace
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-zinc-600">
          Not sure which?{' '}
          <span className="text-zinc-400">Building an AI app</span>{' '}
          <span className="text-zinc-700">→</span>{' '}
          <span className="text-blue-400">Memory API</span>
          {'  ·  '}
          <span className="text-zinc-400">Using AI in VS Code</span>{' '}
          <span className="text-zinc-700">→</span>{' '}
          <span className="text-emerald-400">Extension</span>
        </p>
      </div>
    </section>
  )
}
