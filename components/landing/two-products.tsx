import Link from 'next/link'

export function TwoProducts() {
  return (
    <section className="py-24 px-4" style={{ background: '#050505' }}>
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Heading */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One platform. Two powerful products.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Whether you&apos;re building AI apps or using AI coding tools, Memra gives your AI a memory.
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

          {/* MCP Server */}
          <div
            className="rounded-2xl border p-7 space-y-6 flex flex-col"
            style={{ background: '#0a0418', borderColor: '#3b1f6b' }}
          >
            <div className="space-y-3">
              <span
                className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest text-purple-400"
                style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                For VS Code AI Tools
              </span>
              <div>
                <h3 className="text-xl font-bold text-zinc-100">MCP Server</h3>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
                  Save your AI coding sessions and resume anywhere. Works natively in Claude Code, Cursor, and Windsurf via the Model Context Protocol.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto"
              style={{ background: '#060210', borderColor: '#3b1f6b' }}
            >
              <span className="text-zinc-600">{'# '}</span><span className="text-zinc-500">Install once globally</span>{'\n'}
              <span className="text-purple-400">npm</span>
              <span className="text-zinc-300"> install </span>
              <span className="text-purple-300">-g @memra/mcp-server</span>{'\n\n'}
              <span className="text-zinc-600">{'// '}</span><span className="text-zinc-500">Add to your AI tool config</span>{'\n'}
              <span className="text-zinc-300">{'{'}</span>{'\n'}
              <span className="text-zinc-300">{'  '}</span>
              <span className="text-green-400">&apos;mcpServers&apos;</span>
              <span className="text-zinc-300">{': {'}</span>{'\n'}
              <span className="text-zinc-300">{'    '}</span>
              <span className="text-green-400">&apos;memra&apos;</span>
              <span className="text-zinc-300">{': {'}</span>{'\n'}
              <span className="text-zinc-300">{'      '}</span>
              <span className="text-purple-300">command</span>
              <span className="text-zinc-300">: </span>
              <span className="text-green-400">&apos;memra-mcp&apos;</span>
              <span className="text-zinc-300">{','}</span>{'\n'}
              <span className="text-zinc-300">{'      '}</span>
              <span className="text-purple-300">env</span>
              <span className="text-zinc-300">{': { '}</span>
              <span className="text-green-400">MEMRA_API_KEY</span>
              <span className="text-zinc-300">{': '}</span>
              <span className="text-green-400">&apos;mk_mcp_...&apos;</span>
              <span className="text-zinc-300">{' }'}</span>{'\n'}
              <span className="text-zinc-300">{'    }'}</span>{'\n'}
              <span className="text-zinc-300">{'  }'}</span>{'\n'}
              <span className="text-zinc-300">{'}'}</span>
            </div>

            <ul className="space-y-2">
              {[
                'Works in Claude Code, Cursor, Windsurf, Continue.dev',
                'AI asks: "Save this session to Memra" — done',
                'Resume on any machine or tool',
                'Pro: AI-generated summaries + resume prompts',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <span className="text-purple-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex-1" />
            <Link
              href="/dashboard/keys?type=mcp"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', minHeight: '44px' }}
            >
              Get MCP key + install guide
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-zinc-600">
          Not sure which?{' '}
          <span className="text-zinc-400">Building an AI app</span>{' '}
          <span className="text-zinc-700">→</span>{' '}
          <span className="text-blue-400">Memory API</span>
          {'  ·  '}
          <span className="text-zinc-400">Using VS Code AI tools</span>{' '}
          <span className="text-zinc-700">→</span>{' '}
          <span className="text-purple-400">MCP Server</span>
        </p>
      </div>
    </section>
  )
}
