'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'

// ─── Code samples ───────────────────────────────────────────────────────────

const QUICKSTART_CODE = `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({ apiKey: 'mk_mem_...' })

export async function chat(userId: string, userMessage: string) {
  // 1. Get recent conversation + relevant older memories
  const { recentHistory, relevantMemories } = await memory.getContext(
    userId,
    userMessage
  )

  // 2. Build a system prompt that includes BOTH
  let memoryText = ''
  if (recentHistory.length > 0) {
    memoryText += 'Recent conversation:\\n'
    memoryText += recentHistory
      .map(m => \`[\${m.role}]: \${m.content}\`)
      .join('\\n')
    memoryText += '\\n\\n'
  }
  if (relevantMemories.length > 0) {
    memoryText += 'Relevant older memories:\\n'
    memoryText += relevantMemories
      .map(m => \`[\${m.role}]: \${m.content}\`)
      .join('\\n')
  }

  const systemPrompt = memoryText
    ? \`You are a helpful assistant with memory.
\${memoryText}
Use this to give personalized responses.\`
    : 'You are a helpful assistant.'

  // 3. Call your AI provider (works with any: OpenAI, Groq, etc.)
  const aiReply = await yourAI.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  })

  // 4. Save this exchange so AI remembers it next time
  await memory.save(userId, userMessage, aiReply)

  return aiReply
}`

const CONSTRUCTOR_CODE = `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({
  apiKey: 'mk_mem_...',                          // required — from your dashboard
  baseUrl: 'https://memra-rho.vercel.app/api'    // optional — this is the default
})`

const SAVE_SIG_CODE = `memory.save(
  userId: string,       // your end-user's identifier
  userMessage: string,  // the user's message text
  aiReply: string,      // the assistant's response text
  options?: {
    agentId?: string    // isolate memory per bot or context (default: 'default')
  }
): Promise<{ success: boolean; saved: number }>`

const SAVE_EXAMPLE_CODE = `// After your AI replies, save the exchange
const result = await memory.save(
  'user_abc123',
  'What is my current plan?',
  'You are on the Free plan — 500 memory slots available.',
  { agentId: 'support-bot' }
)
// => { success: true, saved: 2 }`

const CONTEXT_SIG_CODE = `memory.getContext(
  userId: string,
  query: string,           // the current message — used for semantic search
  options?: {
    agentId?: string       // filter to a specific agent (default: 'default')
    limit?: number         // max semantic results (default: 5)
    recentLimit?: number   // max recent messages (default: 10)
  }
): Promise<ContextResponse>`

const CONTEXT_TYPES_CODE = `interface ContextResponse {
  recentHistory: Memory[]      // last N messages chronologically
  relevantMemories: Memory[]   // semantic matches from older conversations
  context: Memory[]            // backwards compat — same as semantic results
  count: number
  latencyMs: number            // end-to-end latency, added client-side
}

interface Memory {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  similarity?: number  // 0–1 cosine score (only on semantic results)
}`

const CONTEXT_EXAMPLE_CODE = `// This is the key method — call it before every AI response
const { recentHistory, relevantMemories } = await memory.getContext(
  'user_abc123',
  'What plan am I on?',
  { limit: 5, recentLimit: 10 }
)

// recentHistory = last 10 messages in order (always includes recent chat)
// relevantMemories = semantically similar older messages (deduplicated)

// Use BOTH in your system prompt:
const systemPrompt = \`You remember everything.
Recent: \${recentHistory.map(m => m.content).join(' | ')}
Related: \${relevantMemories.map(m => m.content).join(' | ')}\``

const HISTORY_SIG_CODE = `memory.getHistory(
  userId: string,
  options?: {
    agentId?: string     // filter by agent (omit = all agents)
    limit?: number       // omit to get ALL messages
    order?: 'asc'|'desc' // default: 'asc' (oldest first)
    before?: string      // ISO date — get messages before this time
    after?: string       // ISO date — get messages after this time
  }
): Promise<{
  history: Memory[]     // every message for this user
  total: number         // total message count
  count: number         // messages in this response
}>`

const HISTORY_EXAMPLE_CODE = `// Get ALL chat history for a user (for showing in your UI)
const { history, total } = await memory.getHistory('user_abc123')

console.log('Total messages stored:', total)
history.forEach(m => {
  console.log('[' + m.role + '] ' + m.content)
})

// With filters:
const recent = await memory.getHistory('user_abc123', {
  agentId: 'support-bot',
  order: 'desc',   // newest first
  limit: 20,       // just the last 20
})`

const FORGET_SIG_CODE = `memory.forget(
  userId: string,
  options?: {
    agentId?: string   // omit to delete ALL memories for this user
  }
): Promise<{ success: boolean; deleted: number }>`

const FORGET_EXAMPLE_CODE = `// Clear only this agent's memory
await memory.forget('user_abc123', { agentId: 'support-bot' })

// Clear ALL memories for a user across every agent
const result = await memory.forget('user_abc123')
// => { success: true, deleted: 124 }`

const FULL_EXAMPLE_CODE = `// Complete working example — Next.js API route
import { NextResponse } from 'next/server'
import MemoryClient from '@memra-client/client'

const memory = new MemoryClient({
  apiKey: process.env.MEMRA_API_KEY || '',
})

export async function POST(req: Request) {
  const { query } = await req.json()

  // Step 1: Get memories (recent chat + relevant older ones)
  const { recentHistory, relevantMemories } = await memory.getContext(
    'user_123', query, { limit: 5, recentLimit: 10 }
  )

  // Step 2: Build the system prompt
  let memorySection = ''
  if (recentHistory.length > 0) {
    memorySection += 'Recent conversation:\\n'
      + recentHistory.map(m => \`[\${m.role}]: \${m.content}\`).join('\\n')
      + '\\n\\n'
  }
  if (relevantMemories.length > 0) {
    memorySection += 'Relevant older memories:\\n'
      + relevantMemories.map(m => \`[\${m.role}]: \${m.content}\`).join('\\n')
  }

  const systemPrompt = memorySection
    ? \`You are a helpful assistant with memory.\\n\${memorySection}\\nUse ALL of this to answer.\`
    : 'You are a helpful assistant.'

  // Step 3: Call any AI provider
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
    }),
  })
  const data = await aiResponse.json()
  const reply = data.choices[0].message.content

  // Step 4: Save so AI remembers next time
  await memory.save('user_123', query, reply)

  return NextResponse.json({ reply })
}`

const HTTP_SAVE_CODE = `curl -X POST https://memra-rho.vercel.app/api/memory/save \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: mk_mem_...' \\
  -d '{
    "userId": "user_123",
    "userMessage": "What is my plan?",
    "aiReply": "You are on the Free plan.",
    "agentId": "support-bot"
  }'`

const HTTP_SAVE_RESPONSE = `{ "success": true, "saved": 2 }`

const HTTP_CONTEXT_CODE = `curl 'https://memra-rho.vercel.app/api/memory/context?userId=user_123&query=account+plan&limit=5&recentLimit=10' \\
  -H 'x-api-key: mk_mem_...'`

const HTTP_CONTEXT_RESPONSE = `{
  "recentHistory": [
    { "id": "clx1", "content": "What is my plan?", "role": "user", "createdAt": "..." },
    { "id": "clx2", "content": "You are on Free.", "role": "assistant", "createdAt": "..." }
  ],
  "relevantMemories": [
    { "id": "clx0", "content": "I signed up yesterday", "role": "user", "similarity": 0.72 }
  ],
  "context": [...],
  "count": 1
}`

const HTTP_HISTORY_CODE = `# Get ALL messages for a user (no limit)
curl 'https://memra-rho.vercel.app/api/memory/history?userId=user_123' \\
  -H 'x-api-key: mk_mem_...'

# With pagination
curl 'https://memra-rho.vercel.app/api/memory/history?userId=user_123&limit=20&order=desc' \\
  -H 'x-api-key: mk_mem_...'`

const HTTP_HISTORY_RESPONSE = `{
  "history": [
    { "id": "clx1", "content": "Hello", "role": "user", "createdAt": "..." },
    { "id": "clx2", "content": "Hi! How can I help?", "role": "assistant", "createdAt": "..." }
  ],
  "total": 142,
  "count": 142
}`

const HTTP_FORGET_CODE = `curl -X DELETE https://memra-rho.vercel.app/api/memory/forget \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: mk_mem_...' \\
  -d '{ "userId": "user_123", "agentId": "support-bot" }'`

const HTTP_FORGET_RESPONSE = `{ "success": true, "deleted": 14 }`

const ERROR_429_CODE = `{
  "error": "Memory limit reached",
  "limit": 100,
  "plan": "free",
  "upgrade": "https://memra-rho.vercel.app/pricing"
}`

// ─── Nav ────────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Getting started',
    items: [
      { id: 'intro', label: 'Introduction' },
      { id: 'install', label: 'Installation' },
      { id: 'quickstart', label: 'Quick start' },
      { id: 'full-example', label: 'Full example' },
    ],
  },
  {
    label: 'SDK Reference',
    items: [
      { id: 'memoryClient', label: 'MemoryClient' },
      { id: 'save', label: '.save()' },
      { id: 'getContext', label: '.getContext()' },
      { id: 'getHistory', label: '.getHistory()' },
      { id: 'forget', label: '.forget()' },
    ],
  },
  {
    label: 'REST API',
    items: [
      { id: 'rest', label: 'Endpoints' },
      { id: 'errors', label: 'Error codes' },
    ],
  },
]

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ParamDef {
  name: string
  type: string
  required?: boolean
  desc: string
}

function ParamTable({ rows }: { rows: ParamDef[] }) {
  return (
    <div className="rounded-xl border border-[#1e1e1e] overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e1e1e] bg-[#0d0d0d]">
            {['Parameter', 'Type', 'Description'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[#080808] divide-y divide-[#111111]">
          {rows.map(r => (
            <tr key={r.name}>
              <td className="px-4 py-3 font-mono text-xs text-zinc-200">
                {r.name}
                {r.required && (
                  <span className="ml-2 text-[9px] font-sans font-semibold text-red-400 uppercase tracking-wide">req</span>
                )}
              </td>
              <td className="px-4 py-3">
                <code className="text-xs text-sky-300 font-mono">{r.type}</code>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 leading-relaxed">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-zinc-100 mb-2 mt-0">{children}</h2>
  )
}

function SectionH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-400 mb-3 mt-8 uppercase tracking-wider">
      {children}
    </h3>
  )
}

function MethodTag({ children }: { children: ReactNode }) {
  return (
    <code
      className="text-xs font-mono px-2 py-0.5 rounded"
      style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}
    >
      {children}
    </code>
  )
}

function Divider() {
  return <div className="border-t border-[#111111] my-12" />
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip'; children: ReactNode }) {
  const s = {
    info: { bg: 'rgba(59,130,246,0.04)', border: 'rgba(59,130,246,0.12)', color: '#60a5fa', icon: 'ℹ️' },
    warning: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: '⚠️' },
    tip: { bg: 'rgba(52,211,153,0.05)', border: 'rgba(52,211,153,0.2)', color: '#34d399', icon: '💡' },
  }[type]
  return (
    <div className="rounded-xl border p-4 mt-4 text-xs leading-relaxed" style={{ background: s.bg, borderColor: s.border }}>
      <p className="font-semibold mb-1.5" style={{ color: s.color }}>{s.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <div className="text-zinc-400">{children}</div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DocsContent() {
  const [active, setActive] = useState('intro')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-8% 0px -80% 0px' }
    )
    ALL_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex max-w-[1280px] mx-auto px-4 sm:px-8 pt-24 pb-24">
      {/* ── Left sidebar ── */}
      <aside className="hidden lg:block w-52 shrink-0 sticky top-24 self-start max-h-[calc(100vh-96px)] overflow-y-auto pr-4">
        <nav className="space-y-7">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-700 mb-2 px-2">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors cursor-pointer ${
                        active === item.id
                          ? 'text-blue-400 bg-blue-500/[0.08]'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* VS Code Extension link */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2 px-2">
              VS Code Extension
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/docs/extension"
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-sm text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
                >
                  Extension Guide
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 leading-none">LIVE</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=memra.memra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-2 py-1.5 rounded text-sm text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors block"
                >
                  Install Extension →
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 lg:pl-12 max-w-3xl">

        {/* ── Introduction ── */}
        <section id="intro" className="mb-12 scroll-mt-24">
          <div className="mb-6">
            <Badge variant="blue" className="mb-4">v1</Badge>
            <SectionH2>Introduction</SectionH2>
            <p className="text-zinc-500 leading-relaxed">
              Memra gives your AI app a memory. When a user talks to your AI, Memra saves the conversation.
              Next time that user comes back, your AI remembers what they said — their name, preferences,
              what they were working on. Everything.
            </p>
          </div>

          <div
            className="rounded-xl border p-4 mb-8 text-sm text-zinc-400 leading-relaxed"
            style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.12)' }}
          >
            <p className="font-semibold text-blue-400 mb-2">How it works in 30 seconds:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>User says &ldquo;My name is Wais&rdquo; → your AI replies → Memra saves both messages</li>
              <li>User comes back tomorrow, asks &ldquo;What&apos;s my name?&rdquo;</li>
              <li>Your app calls <code className="text-sky-300">memory.getContext()</code> → gets back &ldquo;My name is Wais&rdquo;</li>
              <li>You put that in the system prompt → AI answers &ldquo;Your name is Wais!&rdquo;</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {[
              { step: '1', title: 'Save', desc: 'After each AI response, save the exchange with memory.save(). Two lines of code.' },
              { step: '2', title: 'Retrieve', desc: 'Before the next response, call memory.getContext(). It returns recent chat + relevant older memories.' },
              { step: '3', title: 'Inject', desc: 'Put the memories in your system prompt. Your AI now remembers everything.' },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-xl border border-[#1e1e1e] p-4"
                style={{ background: 'rgba(255,255,255,0.015)' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {step}
                </div>
                <p className="text-sm font-semibold text-zinc-200 mb-1">{title}</p>
                <p className="text-xs text-zinc-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Installation ── */}
        <section id="install" className="mb-12 scroll-mt-24">
          <SectionH2>Installation</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Install the Memra client package. Works with any JavaScript/TypeScript project — Next.js, Express, anything.
          </p>
          <Tabs defaultTab="npm">
            <TabList>
              <Tab id="npm" label="npm" />
              <Tab id="pnpm" label="pnpm" />
              <Tab id="yarn" label="yarn" />
            </TabList>
            <TabPanel id="npm">
              <CodeBlock code="npm install @memra-client/client" language="bash" />
            </TabPanel>
            <TabPanel id="pnpm">
              <CodeBlock code="pnpm add @memra-client/client" language="bash" />
            </TabPanel>
            <TabPanel id="yarn">
              <CodeBlock code="yarn add @memra-client/client" language="bash" />
            </TabPanel>
          </Tabs>
          <p className="text-xs text-zinc-700 mt-4">
            Then get your API key from the <Link href="/dashboard/keys" className="text-blue-400 hover:text-blue-300">dashboard</Link> (starts with <code className="text-zinc-500">mk_mem_</code>).
          </p>
        </section>

        <Divider />

        {/* ── Quick start ── */}
        <section id="quickstart" className="mb-12 scroll-mt-24">
          <SectionH2>Quick start</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            This is all you need. Four steps: create the client, get context, call your AI, save the exchange.
          </p>
          <CodeBlock code={QUICKSTART_CODE} language="ts" filename="handler.ts" />
          <Callout type="tip">
            <code className="text-sky-300">recentHistory</code> gives the AI the last 10 messages in order — so it always knows the recent conversation.{' '}
            <code className="text-sky-300">relevantMemories</code> gives it related messages from older chats. Together they fix the &ldquo;what&apos;s my name?&rdquo; problem.
          </Callout>
        </section>

        <Divider />

        {/* ── Full example ── */}
        <section id="full-example" className="mb-12 scroll-mt-24">
          <SectionH2>Full working example</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            A complete Next.js API route you can copy-paste. This is exactly how the{' '}
            <Link href="/demo" className="text-blue-400 hover:text-blue-300">demo</Link> works.
          </p>
          <CodeBlock code={FULL_EXAMPLE_CODE} language="ts" filename="app/api/chat/route.ts" />
        </section>

        <Divider />

        {/* ── MemoryClient ── */}
        <section id="memoryClient" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="purple">class</Badge>
          </div>
          <SectionH2>MemoryClient</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Create one instance and reuse it. Don&apos;t create a new one for every request.
          </p>

          <SectionH3>Constructor</SectionH3>
          <CodeBlock code={CONSTRUCTOR_CODE} language="ts" />

          <SectionH3>Options</SectionH3>
          <ParamTable rows={[
            { name: 'apiKey', type: 'string', required: true, desc: 'Your Memory API key from the dashboard. Starts with mk_mem_' },
            { name: 'baseUrl', type: 'string', desc: 'API base URL. Default: https://memra-rho.vercel.app/api' },
          ]} />
        </section>

        <Divider />

        {/* ── save() ── */}
        <section id="save" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="green">method</Badge>
            <MethodTag>POST /memory/save</MethodTag>
          </div>
          <SectionH2>memory.save()</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Call this after every AI response. It saves both the user message and AI reply to memory.
            Each message gets turned into a vector embedding so it can be found later with semantic search.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={SAVE_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'Your user\'s ID. Each user gets their own isolated memory — they can\'t see each other\'s data.' },
            { name: 'userMessage', type: 'string', required: true, desc: 'What the user said.' },
            { name: 'aiReply', type: 'string', required: true, desc: 'What your AI replied.' },
            { name: 'options.agentId', type: 'string', desc: 'If your app has multiple bots (e.g. support-bot, coding-bot), use this to keep their memories separate. Default: \'default\'' },
          ]} />

          <SectionH3>Example</SectionH3>
          <CodeBlock code={SAVE_EXAMPLE_CODE} language="ts" />
        </section>

        <Divider />

        {/* ── getContext() ── */}
        <section id="getContext" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="green">method</Badge>
            <MethodTag>GET /memory/context</MethodTag>
          </div>
          <SectionH2>memory.getContext()</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            <strong className="text-zinc-300">This is the most important method.</strong> Call it before every AI response.
            It returns two things:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl border border-emerald-500/20 p-4" style={{ background: 'rgba(16,185,129,0.04)' }}>
              <p className="text-sm font-semibold text-emerald-400 mb-1">recentHistory</p>
              <p className="text-xs text-zinc-500">The last 10 messages in chronological order. The AI always knows what was just said.</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 p-4" style={{ background: 'rgba(59,130,246,0.04)' }}>
              <p className="text-sm font-semibold text-blue-400 mb-1">relevantMemories</p>
              <p className="text-xs text-zinc-500">Semantically similar messages from older conversations. Found via vector search.</p>
            </div>
          </div>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={CONTEXT_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'The user whose memories to search.' },
            { name: 'query', type: 'string', required: true, desc: 'The current user message. Used to find related older memories.' },
            { name: 'options.agentId', type: 'string', desc: 'Filter to a specific bot\'s memories. Default: \'default\'' },
            { name: 'options.limit', type: 'number', desc: 'How many semantic results to return. Default: 5' },
            { name: 'options.recentLimit', type: 'number', desc: 'How many recent messages to return. Default: 10' },
          ]} />

          <SectionH3>Response types</SectionH3>
          <CodeBlock code={CONTEXT_TYPES_CODE} language="ts" />

          <SectionH3>Example</SectionH3>
          <CodeBlock code={CONTEXT_EXAMPLE_CODE} language="ts" />

          <Callout type="warning">
            Always put memory in the <strong>system prompt</strong>, not the user message. If you put it in the user message,
            the AI treats it as something the user said — not as context it should use.
          </Callout>
        </section>

        <Divider />

        {/* ── getHistory() ── */}
        <section id="getHistory" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="green">method</Badge>
            <MethodTag>GET /memory/history</MethodTag>
          </div>
          <SectionH2>memory.getHistory()</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Returns the complete chat history for a user — every message they ever sent and received.
            Use this to show past conversations in your UI. <strong className="text-zinc-300">You don&apos;t need your own database for chat storage</strong> — Memra stores it all.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={HISTORY_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'The user whose history to fetch.' },
            { name: 'options.agentId', type: 'string', desc: 'Filter by bot. Omit to get all bots\' messages together.' },
            { name: 'options.limit', type: 'number', desc: 'Omit to get ALL messages. Set a number to limit.' },
            { name: 'options.order', type: "'asc' | 'desc'", desc: "'asc' = oldest first (default, good for chat UI). 'desc' = newest first." },
            { name: 'options.before', type: 'string', desc: 'ISO date. Get messages before this time (for pagination).' },
            { name: 'options.after', type: 'string', desc: 'ISO date. Get messages after this time (for pagination).' },
          ]} />

          <SectionH3>Example</SectionH3>
          <CodeBlock code={HISTORY_EXAMPLE_CODE} language="ts" />

          <Callout type="tip">
            <code className="text-sky-300">getHistory()</code> is for your UI — showing users their past conversations.{' '}
            <code className="text-sky-300">getContext()</code> is for the AI — giving it the right memories before it responds.
            They serve different purposes.
          </Callout>
        </section>

        <Divider />

        {/* ── forget() ── */}
        <section id="forget" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="red">method</Badge>
            <MethodTag>DELETE /memory/forget</MethodTag>
          </div>
          <SectionH2>memory.forget()</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Permanently deletes memories. Use this for GDPR compliance, when a user asks to be forgotten,
            or when you want to start fresh. <strong className="text-zinc-300">This cannot be undone.</strong>
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={FORGET_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'The user whose memories to delete.' },
            { name: 'options.agentId', type: 'string', desc: 'Only delete this bot\'s memories. Omit to delete ALL memories for this user.' },
          ]} />

          <SectionH3>Example</SectionH3>
          <CodeBlock code={FORGET_EXAMPLE_CODE} language="ts" />
        </section>

        <Divider />

        {/* ── REST API ── */}
        <section id="rest" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="yellow">HTTP</Badge>
          </div>
          <SectionH2>REST API</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Don&apos;t want to use the npm package? Call the API directly with curl, Python, Go — any language.
            All endpoints need your API key in the <code className="text-sky-300 text-sm">x-api-key</code> header.
          </p>

          <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] px-5 py-4 mb-8 space-y-1.5 font-mono text-xs">
            <p className="text-zinc-700 text-[10px] uppercase tracking-widest font-semibold mb-3">Base URL</p>
            <p className="text-zinc-300">https://memra-rho.vercel.app/api</p>
          </div>

          <div className="rounded-xl border border-[#1e1e1e] overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#0d0d0d]">
                  {['Method', 'Endpoint', 'Description'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#080808] divide-y divide-[#111111]">
                {[
                  { method: 'POST', path: '/memory/save', desc: 'Save a user message + AI reply' },
                  { method: 'GET', path: '/memory/context', desc: 'Get recent chat + relevant older memories' },
                  { method: 'GET', path: '/memory/history', desc: 'Get complete chat history for a user' },
                  { method: 'DELETE', path: '/memory/forget', desc: 'Delete memories' },
                ].map(r => (
                  <tr key={r.path}>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-semibold ${r.method === 'POST' ? 'text-blue-400' : r.method === 'GET' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{r.path}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-zinc-200 mb-3">POST /memory/save</h3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'Your user\'s ID.' },
            { name: 'userMessage', type: 'string', required: true, desc: 'What the user said.' },
            { name: 'aiReply', type: 'string', required: true, desc: 'What the AI replied.' },
            { name: 'agentId', type: 'string', desc: 'Bot namespace. Default: \'default\'' },
          ]} />
          <CodeBlock code={HTTP_SAVE_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_SAVE_RESPONSE} language="json" />

          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">GET /memory/context</h3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User to search.' },
            { name: 'query', type: 'string', required: true, desc: 'The search query.' },
            { name: 'agentId', type: 'string', desc: 'Filter by bot. Default: \'default\'' },
            { name: 'limit', type: 'number', desc: 'Max semantic results. Default: 5' },
            { name: 'recentLimit', type: 'number', desc: 'Max recent messages. Default: 10' },
          ]} />
          <CodeBlock code={HTTP_CONTEXT_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_CONTEXT_RESPONSE} language="json" />

          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">GET /memory/history</h3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User whose history to fetch.' },
            { name: 'agentId', type: 'string', desc: 'Filter by bot. Omit for all.' },
            { name: 'limit', type: 'number', desc: 'Omit to get ALL messages.' },
            { name: 'order', type: "'asc'|'desc'", desc: 'Default: asc (oldest first).' },
            { name: 'before', type: 'string', desc: 'ISO date for pagination.' },
            { name: 'after', type: 'string', desc: 'ISO date for pagination.' },
          ]} />
          <CodeBlock code={HTTP_HISTORY_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_HISTORY_RESPONSE} language="json" />

          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">DELETE /memory/forget</h3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User whose memories to delete.' },
            { name: 'agentId', type: 'string', desc: 'Delete only this bot\'s memories. Omit to delete everything.' },
          ]} />
          <CodeBlock code={HTTP_FORGET_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_FORGET_RESPONSE} language="json" />
        </section>

        <Divider />

        {/* ── Error codes ── */}
        <section id="errors" className="mb-12 scroll-mt-24">
          <SectionH2>Error codes</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            When something goes wrong, the API returns a JSON object with an <code className="text-sky-300 text-sm">error</code> field.
            The SDK throws an error automatically — wrap calls in try/catch.
          </p>

          <div className="rounded-xl border border-[#1e1e1e] overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#0d0d0d]">
                  {['Status', 'What went wrong', 'How to fix'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#080808] divide-y divide-[#111111]">
                {[
                  { status: '400', style: 'text-orange-400', meaning: 'Missing required field', fix: 'Check that you\'re sending userMessage, aiReply, query, etc.' },
                  { status: '401', style: 'text-red-400', meaning: 'Bad API key', fix: 'Check your mk_mem_ key is correct and active in the dashboard.' },
                  { status: '403', style: 'text-purple-400', meaning: 'Wrong key type', fix: 'You\'re using an extension key (mk_ext_) on a memory endpoint. Use mk_mem_ instead.' },
                  { status: '429', style: 'text-amber-400', meaning: 'Memory limit reached', fix: 'Your plan\'s storage is full. Delete old memories or upgrade.' },
                ].map(r => (
                  <tr key={r.status}>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-sm ${r.style}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs font-medium">{r.meaning}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">{r.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-zinc-200 mb-3">429 — Limit reached</h3>
          <CodeBlock code={ERROR_429_CODE} language="json" />
        </section>

      </main>
    </div>
  )
}
