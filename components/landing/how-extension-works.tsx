'use client'

const STEPS = [
  {
    icon: '🔌',
    title: 'Install the extension + enter API key',
    desc: 'One-click install from the VS Code Marketplace. Paste your Memra extension key and you\'re done.',
  },
  {
    icon: '💬',
    title: 'Code normally with any AI in VS Code',
    desc: 'Use GitHub Copilot, Claude Code, Cline, Continue — the extension works silently in the background.',
  },
  {
    icon: '🧠',
    title: 'Context follows you across sessions and tools',
    desc: 'Every conversation is saved. When you start a new session, your AI picks up exactly where you left off.',
  },
]

export function HowExtensionWorks() {
  return (
    <section className="py-28 px-6 bg-[#020202]">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Never lose your AI context again</h2>
          <p className="text-zinc-500 text-lg">Install once. The extension handles everything.</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center space-y-4">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-300"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  {i + 1}
                </div>
              </div>
              <h3 className="font-semibold text-zinc-100">{step.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Supported tools */}
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Works with</p>
          <p className="text-zinc-400 text-sm">
            GitHub Copilot · Claude Code · Cline · Continue · and more
          </p>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div
            className="rounded-2xl border p-5 space-y-2"
            style={{ borderColor: '#3f1e1e', background: 'rgba(239,68,68,0.03)' }}
          >
            <p className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Without Memra</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Re-explain your project every session — 10-20 minutes wasted
            </p>
          </div>
          <div
            className="rounded-2xl border p-5 space-y-2"
            style={{ borderColor: '#1e5f3a', background: 'rgba(16,185,129,0.03)' }}
          >
            <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">With Memra</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AI picks up exactly where you left off — instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
