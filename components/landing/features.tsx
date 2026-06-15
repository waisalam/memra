'use client'

const FEATURES = [
  {
    icon: '⚡',
    color: '#f59e0b',
    title: 'Lightning Fast',
    desc: '~125ms average. Semantic search powered by pgvector. Fast enough for real-time conversations.',
  },
  {
    icon: '🧠',
    color: '#3b82f6',
    title: 'Semantic Search',
    desc: 'Not just last N messages. We find the most RELEVANT memories using vector similarity, not recency.',
  },
  {
    icon: '🔌',
    color: '#8b5cf6',
    title: 'Any AI Provider',
    desc: 'Works with GPT-4, Claude, Gemini, Groq, Llama. One SDK. Any model.',
  },
  {
    icon: '🔑',
    color: '#10b981',
    title: 'Per-Agent Memory',
    desc: 'Separate memory spaces per agent ID. Customer support bot ≠ coding assistant.',
  },
  {
    icon: '🔒',
    color: '#ec4899',
    title: 'Secure by Default',
    desc: 'API key auth. Data isolated per key owner. GDPR-compliant deletion built in.',
  },
  {
    icon: '📦',
    color: '#06b6d4',
    title: 'npm Package',
    desc: 'Two lines of code. No infrastructure to manage. Just install and go.',
  },
]

export function Features() {
  return (
    <section id="product" className="py-28 px-6 bg-[#030303]">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Everything your AI needs to remember</h2>
          <p className="text-zinc-500 text-lg">Battle-tested infrastructure for production AI memory.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-[#1e1e1e] bg-[#111] p-6 space-y-4 hover:border-transparent transition-all cursor-default"
              style={{
                ['--hover-shadow' as string]: `0 0 0 1px ${f.color}40, 0 0 30px ${f.color}15`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${f.color}40, 0 0 30px ${f.color}15`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = ''
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}25` }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">{f.title}</h3>
                <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
