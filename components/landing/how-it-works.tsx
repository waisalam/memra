'use client'

const STEPS = [
  {
    num: '1',
    title: 'Install',
    desc: 'Add the npm package to your project',
    code: 'npm install @memra-client/client',
    icon: '📦',
  },
  {
    num: '2',
    title: 'Save conversations',
    desc: 'Store every exchange with one line',
    code: "await memory.save(userId, userMsg, aiReply)",
    icon: '💾',
  },
  {
    num: '3',
    title: 'Retrieve context',
    desc: 'Semantic search finds relevant memories',
    code: "const { context } = await memory.getContext(userId, query)",
    icon: '🔍',
  },
]

export function HowItWorks() {
  return (
    <section id="product" className="py-28 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Dead simple to integrate</h2>
          <p className="text-zinc-500 text-lg">Three steps. Two minutes. Production ready.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40" />

          {STEPS.map((step, i) => (
            <div key={i} className="relative space-y-4 text-center">
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white relative"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {step.num}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{step.title}</h3>
                <p className="text-zinc-500 text-sm mt-1">{step.desc}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                <code className="text-xs text-zinc-300 font-mono">{step.code}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
