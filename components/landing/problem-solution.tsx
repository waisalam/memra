'use client'

const WITHOUT = [
  { role: 'user', text: 'I run a barber shop in Mumbai' },
  { role: 'ai', text: "That's great! How can I help?" },
  { role: 'user', text: '...later...' },
  { role: 'user', text: 'What was my business again?' },
  { role: 'ai', text: "I don't have any information about your business.", bad: true },
]

const WITH = [
  { role: 'user', text: 'I run a barber shop in Mumbai' },
  { role: 'ai', text: "That's great! How can I help?" },
  { role: 'user', text: '...later...' },
  { role: 'user', text: 'What was my business again?' },
  { role: 'ai', text: 'You run a barber shop in Mumbai! How\'s it going?', good: true },
]

function ChatBubble({ msg }: { msg: typeof WITHOUT[0] }) {
  if (msg.role === 'user' && msg.text === '...later...') {
    return <div className="text-center text-xs text-zinc-700 py-1">— later —</div>
  }
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          msg.role === 'user'
            ? 'bg-zinc-700 text-zinc-200 rounded-br-sm'
            : (msg as { bad?: boolean }).bad
            ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-sm'
            : (msg as { good?: boolean }).good
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-bl-sm'
            : 'bg-zinc-800 text-zinc-300 rounded-bl-sm'
        }`}
      >
        {msg.text}
      </div>
    </div>
  )
}

export function ProblemSolution() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Your AI forgets. Memra fixes that.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Without */}
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✗</span>
              <h3 className="font-semibold text-red-400">Without Memra</h3>
            </div>
            <div className="space-y-2">
              {WITHOUT.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            </div>
            <p className="text-xs text-red-500/70 text-center pt-2">User frustrated. Context lost.</p>
          </div>

          {/* With */}
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <h3 className="font-semibold text-emerald-400">With Memra</h3>
            </div>
            <div className="space-y-2">
              {WITH.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            </div>
            <p className="text-xs text-emerald-500/70 text-center pt-2">AI remembers. User delighted.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
