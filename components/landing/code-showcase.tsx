'use client'

import { useState } from 'react'

const TABS = ['Node.js', 'Python', 'curl'] as const
type Tab = typeof TABS[number]

const CODE: Record<Tab, string> = {
  'Node.js': `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({ apiKey: process.env.MEMRA_KEY })

export async function chat(userId: string, userMessage: string) {
  // Get relevant past context
  const { context } = await memory.getContext(userId, userMessage)

  // Build prompt with memory
  const systemPrompt = context.length > 0
    ? \`Previous context:\\n\${context.map(m => m.content).join('\\n')}\`
    : 'No previous context.'

  // Your AI call — works with any provider
  const reply = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })

  // Save to memory
  await memory.save(userId, userMessage, reply.choices[0].message.content ?? '')

  return reply
}`,
  Python: `import requests

MEMRA_KEY = "mk_live_your_key"
BASE_URL = "https://memra.dev/api"

def get_context(query: str):
    res = requests.get(f"{BASE_URL}/memory/context",
        params={"query": query},
        headers={"x-api-key": MEMRA_KEY}
    )
    return res.json()["context"]

def save_memory(user_msg: str, ai_reply: str):
    requests.post(f"{BASE_URL}/memory/save",
        json={
            "userMessage": user_msg,
            "aiReply": ai_reply,
        },
        headers={"x-api-key": MEMRA_KEY}
    )`,
  curl: `# Save a memory
curl -X POST https://memra.dev/api/memory/save \\
  -H "x-api-key: mk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user_123",
    "userMessage": "I run a barber shop in Mumbai",
    "aiReply": "That sounds great! Tell me more."
  }'

# Get relevant context
curl "https://memra.dev/api/memory/context?userId=user_123&query=what+is+my+business" \\
  -H "x-api-key: mk_live_your_key"`,
}

export function CodeShowcase() {
  const [tab, setTab] = useState<Tab>('Node.js')
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(CODE[tab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Works with your entire stack</h2>
          <p className="text-zinc-500 text-lg">Drop in one function call. Remove the rest.</p>
        </div>

        <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e] bg-[#0d0d0d]">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tab === t
                      ? 'bg-white/8 text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={copy}
              className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>Copied</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
              )}
            </button>
          </div>

          {/* Code */}
          <pre className="p-6 text-xs text-zinc-300 overflow-x-auto font-mono leading-6 bg-[#080808]">
            <code>{CODE[tab]}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
