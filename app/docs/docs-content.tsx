'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { CodeBlock } from '@/components/ui/code-block'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'

// ─── Code samples ───────────────────────────────────────────────────────────

const QUICKSTART_CODE = `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({ apiKey: 'mk_live_...' })

export async function chat(userId: string, userMessage: string) {
  // 1. Pull relevant memories before the model responds
  const { context } = await memory.getContext(userId, userMessage)

  // Memory goes in system prompt — NOT in the user message
  // This tells the AI what the context is and how to use it
  const systemPrompt = context.length > 0
    ? \`You are a helpful assistant with memory of past conversations.
Here is what you remember:
\${context.map((m, i) => \`\${i + 1}. [\${m.role}]: \${m.content}\`).join('\\n')}
Use this memory to give personalized responses.\`
    : \`You are a helpful assistant.\`

  // 2. Pass context as system prompt — works with any AI provider
  const aiReply = await yourAI.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  })

  // 3. Save this exchange to memory
  await memory.save(userId, userMessage, aiReply)

  return aiReply
}`

const CONSTRUCTOR_CODE = `import { MemoryClient } from '@memra-client/client'

const memory = new MemoryClient({
  apiKey: 'mk_live_...',           // required — from your dashboard
  baseUrl: 'https://memra.dev/api' // optional, this is the default
})`

const SAVE_SIG_CODE = `memory.save(
  userId: string,       // your end-user's identifier
  userMessage: string,  // the user's message text
  aiReply: string,      // the assistant's response text
  options?: {
    agentId?: string    // isolate memory per bot or context (default: 'default')
  }
): Promise<{ success: boolean; saved: number }>`

const SAVE_EXAMPLE_CODE = `const result = await memory.save(
  'user_abc123',
  'What is my current plan?',
  'You are on the Free plan — 500 memory slots available.',
  { agentId: 'support-bot' }
)
// => { success: true, saved: 2 }`

const CONTEXT_SIG_CODE = `memory.getContext(
  userId: string,
  query: string,         // the current message — used to find relevant memories
  options?: {
    agentId?: string     // filter to a specific agent namespace (default: 'default')
    limit?: number       // max memories returned (default: 5)
  }
): Promise<ContextResponse>`

const CONTEXT_TYPES_CODE = `interface ContextResponse {
  context: Memory[]   // semantically relevant memories, ranked by similarity
  count: number
  latencyMs: number   // end-to-end search latency, added client-side
}

interface Memory {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  similarity: number  // 0–1 cosine similarity score
}`

const CONTEXT_EXAMPLE_CODE = `const { context, latencyMs } = await memory.getContext(
  'user_abc123',
  'What plan am I on?',
  { agentId: 'support-bot', limit: 5 }
)

// context is sorted by similarity — highest first
context.forEach(m => {
  console.log(m.role + ':', m.content, '|', m.similarity.toFixed(2))
})`

const HISTORY_SIG_CODE = `memory.getHistory(
  userId: string,
  options?: {
    agentId?: string   // filter by agent (omit = return all agents)
    limit?: number     // number of messages to return (default: 20)
  }
): Promise<{
  history: Memory[]   // chronological order, oldest first
  count: number
}>`

const HISTORY_EXAMPLE_CODE = `const { history, count } = await memory.getHistory('user_abc123', {
  agentId: 'support-bot',
  limit: 50
})

console.log('Total messages:', count)
history.forEach(m => {
  console.log('[' + m.role + '] ' + m.content)
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

const HTTP_SAVE_CODE = `curl -X POST https://memra.dev/api/memory/save \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: mk_live_...' \\
  -d '{
    "userMessage": "What is my plan?",
    "aiReply": "You are on the Free plan.",
    "agentId": "support-bot"
  }'`

const HTTP_SAVE_RESPONSE = `{ "success": true, "saved": 2 }`

const HTTP_CONTEXT_CODE = `curl 'https://memra.dev/api/memory/context?query=account+plan&agentId=support-bot&limit=5' \\
  -H 'x-api-key: mk_live_...'`

const HTTP_CONTEXT_RESPONSE = `{
  "context": [
    {
      "id": "clx123abc",
      "content": "What is my plan?",
      "role": "user",
      "createdAt": "2026-06-15T10:00:00.000Z",
      "similarity": 0.94
    }
  ],
  "count": 1
}`

const HTTP_HISTORY_CODE = `curl 'https://memra.dev/api/memory/history?agentId=support-bot&limit=20' \\
  -H 'x-api-key: mk_live_...'`

const HTTP_FORGET_CODE = `curl -X DELETE https://memra.dev/api/memory/forget \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: mk_live_...' \\
  -d '{ "agentId": "support-bot" }'`

const HTTP_FORGET_RESPONSE = `{ "success": true, "deleted": 14 }`

const ERROR_429_CODE = `{
  "error": "Memory limit reached",
  "limit": 500,
  "plan": "free",
  "upgrade": "https://memra.dev/pricing"
}`

// ─── Nav ────────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Getting started',
    items: [
      { id: 'intro', label: 'Introduction' },
      { id: 'install', label: 'Installation' },
      { id: 'quickstart', label: 'Quick start' },
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
              Memra gives AI assistants persistent memory. Each conversation turn is embedded
              and stored as a vector, then retrieved with semantic search when your agent needs
              context — across sessions, users, and agents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {[
              { step: '1', title: 'Save', desc: 'After each AI response, store the exchange with memory.save().' },
              { step: '2', title: 'Retrieve', desc: 'Before the next response, call memory.getContext() to get relevant memories.' },
              { step: '3', title: 'Inject', desc: 'Add the context to your system prompt. Your AI now remembers.' },
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
            Install the official Memra client from npm. Works with Node.js and any bundler.
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
            Package: <code className="text-zinc-500">@memra-client/client</code> · TypeScript included
          </p>
        </section>

        <Divider />

        {/* ── Quick start ── */}
        <section id="quickstart" className="mb-12 scroll-mt-24">
          <SectionH2>Quick start</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Add persistent memory to any AI handler in three lines. Get your API key from the{' '}
            <a href="/dashboard/keys" className="text-blue-400 hover:text-blue-300 transition-colors">dashboard</a>.
          </p>
          <CodeBlock code={QUICKSTART_CODE} language="ts" filename="handler.ts" />
        </section>

        <Divider />

        {/* ── MemoryClient ── */}
        <section id="memoryClient" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="purple">class</Badge>
          </div>
          <SectionH2>MemoryClient</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            The main entry point. Create one instance per application and reuse it.
          </p>

          <SectionH3>Constructor</SectionH3>
          <CodeBlock code={CONSTRUCTOR_CODE} language="ts" />

          <SectionH3>Options</SectionH3>
          <ParamTable rows={[
            { name: 'apiKey', type: 'string', required: true, desc: 'Your API key from the Memra dashboard. Prefix: mk_live_' },
            { name: 'baseUrl', type: 'string', desc: 'API base URL. Default: https://memra.dev/api' },
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
            Saves a conversation exchange to persistent memory. Stores two records — one for the
            user message and one for the AI reply — both embedded as semantic vectors for future retrieval.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={SAVE_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'Your application\'s identifier for this user. Scopes memories to a single user.' },
            { name: 'userMessage', type: 'string', required: true, desc: 'The user\'s message text.' },
            { name: 'aiReply', type: 'string', required: true, desc: 'The AI assistant\'s response text.' },
            { name: 'options.agentId', type: 'string', desc: 'Namespace to isolate memories by bot or context. Default: \'default\'' },
          ]} />

          <SectionH3>Returns</SectionH3>
          <CodeBlock code="{ success: boolean; saved: number }" language="ts" />
          <p className="text-xs text-zinc-600 mt-2 mb-6">
            <code className="text-zinc-500">saved</code> is always <code className="text-zinc-500">2</code> — user message and AI reply are stored as separate records.
          </p>

          <SectionH3>Example</SectionH3>
          <CodeBlock code={SAVE_EXAMPLE_CODE} language="ts" />

          <SectionH3>Errors</SectionH3>
          <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
            <table className="w-full text-xs">
              <tbody className="bg-[#080808] divide-y divide-[#111111]">
                {[
                  { status: '400', label: 'Bad request', desc: 'Missing userMessage or aiReply in request body.' },
                  { status: '401', label: 'Unauthorized', desc: 'Invalid or missing x-api-key.' },
                  { status: '429', label: 'Limit reached', desc: 'Memory limit for your plan reached. See error body for upgrade link.' },
                ].map(r => (
                  <tr key={r.status}>
                    <td className="px-4 py-3 w-16">
                      <span className={`font-mono font-semibold ${r.status === '429' ? 'text-amber-400' : r.status === '401' ? 'text-red-400' : 'text-orange-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-medium">{r.label}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            Performs a semantic search over this user's stored memories and returns the most
            relevant ones for the given query. Call this before generating an AI response to
            inject relevant history.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={CONTEXT_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User identifier. Scopes the search to this user\'s memories.' },
            { name: 'query', type: 'string', required: true, desc: 'The current user message. Used to find semantically relevant memories.' },
            { name: 'options.agentId', type: 'string', desc: 'Filter memories to this agent namespace. Default: \'default\'' },
            { name: 'options.limit', type: 'number', desc: 'Max number of memories to return. Default: 5' },
          ]} />

          <SectionH3>Response types</SectionH3>
          <CodeBlock code={CONTEXT_TYPES_CODE} language="ts" />
          <div
            className="rounded-xl border p-4 mt-3 mb-6 text-xs text-zinc-400 leading-relaxed"
            style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.12)' }}
          >
            <strong className="text-blue-400">Note:</strong> The response field is{' '}
            <code className="text-sky-300">context</code>, not <code className="text-sky-300">memories</code>.
            Memories in <code className="text-sky-300">context</code> include a <code className="text-sky-300">similarity</code> score (0–1).
            The <code className="text-sky-300">latencyMs</code> field is added client-side by the SDK.
          </div>

          <SectionH3>Example</SectionH3>
          <CodeBlock code={CONTEXT_EXAMPLE_CODE} language="ts" />

          <div
            className="rounded-xl border p-4 mt-4 text-xs leading-relaxed"
            style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}
          >
            <p className="font-semibold text-amber-400 mb-1.5">⚠ Common mistake</p>
            <p className="text-zinc-400">
              Always inject memory into the system prompt, not the user message. Putting context
              in the user message looks like random text to the AI — it won&apos;t use it correctly.
            </p>
          </div>
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
            Returns messages in chronological order (oldest first). Unlike{' '}
            <code className="text-sky-300 text-sm">getContext()</code>, this is not semantic — it
            returns a time-ordered list, useful for replaying conversation history or building a
            chat timeline.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={HISTORY_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User identifier.' },
            { name: 'options.agentId', type: 'string', desc: 'Filter by agent. Omit to return history across all agents.' },
            { name: 'options.limit', type: 'number', desc: 'Number of messages to return. Default: 20' },
          ]} />

          <p className="text-xs text-zinc-600 mt-2 mb-6">
            History memories do not have a <code className="text-zinc-500">similarity</code> field — that is only present on <code className="text-zinc-500">getContext()</code> results.
          </p>

          <SectionH3>Example</SectionH3>
          <CodeBlock code={HISTORY_EXAMPLE_CODE} language="ts" />
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
            Permanently deletes memories. Pass an <code className="text-sky-300 text-sm">agentId</code> to
            scope deletion to a single agent, or omit it to delete all memories for this user.
            This action cannot be undone.
          </p>

          <SectionH3>Signature</SectionH3>
          <CodeBlock code={FORGET_SIG_CODE} language="ts" />

          <SectionH3>Parameters</SectionH3>
          <ParamTable rows={[
            { name: 'userId', type: 'string', required: true, desc: 'User identifier.' },
            { name: 'options.agentId', type: 'string', desc: 'Scope deletion to this agent. Omit to delete ALL memories for this user.' },
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
            Use the REST API directly from any language or tool. All endpoints require an
            API key passed in the <code className="text-sky-300 text-sm">x-api-key</code> header.
            The user's identity is derived from the API key — you do not need to pass a userId
            in the request body or query string.
          </p>

          <div className="rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] px-5 py-4 mb-8 space-y-1.5 font-mono text-xs">
            <p className="text-zinc-700 text-[10px] uppercase tracking-widest font-semibold mb-3">Base URL</p>
            <p className="text-zinc-300">https://memra.dev/api</p>
          </div>

          {/* Endpoints table */}
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
                  { method: 'POST', path: '/memory/save', desc: 'Save a conversation turn' },
                  { method: 'GET', path: '/memory/context', desc: 'Semantic search — returns most relevant memories' },
                  { method: 'GET', path: '/memory/history', desc: 'Chronological message history' },
                  { method: 'DELETE', path: '/memory/forget', desc: 'Delete memories (by agent or all)' },
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

          {/* POST /memory/save */}
          <h3 className="text-base font-semibold text-zinc-200 mb-3">POST /memory/save</h3>
          <ParamTable rows={[
            { name: 'userMessage', type: 'string', required: true, desc: 'The user\'s message text.' },
            { name: 'aiReply', type: 'string', required: true, desc: 'The AI assistant\'s response text.' },
            { name: 'agentId', type: 'string', desc: 'Memory namespace. Default: \'default\'' },
          ]} />
          <CodeBlock code={HTTP_SAVE_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_SAVE_RESPONSE} language="json" />

          {/* GET /memory/context */}
          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">GET /memory/context</h3>
          <ParamTable rows={[
            { name: 'query', type: 'string', required: true, desc: 'The search query — finds semantically similar memories.' },
            { name: 'agentId', type: 'string', desc: 'Filter to this agent namespace. Default: \'default\'' },
            { name: 'limit', type: 'number', desc: 'Max results. Default: 5' },
          ]} />
          <CodeBlock code={HTTP_CONTEXT_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_CONTEXT_RESPONSE} language="json" />

          {/* GET /memory/history */}
          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">GET /memory/history</h3>
          <ParamTable rows={[
            { name: 'agentId', type: 'string', desc: 'Filter by agent. Omit for all agents.' },
            { name: 'limit', type: 'number', desc: 'Messages to return. Default: 20' },
          ]} />
          <CodeBlock code={HTTP_HISTORY_CODE} language="bash" />

          {/* DELETE /memory/forget */}
          <h3 className="text-base font-semibold text-zinc-200 mb-3 mt-8">DELETE /memory/forget</h3>
          <ParamTable rows={[
            { name: 'agentId', type: 'string', desc: 'Agent to clear. Omit to delete ALL memories for this user.' },
          ]} />
          <CodeBlock code={HTTP_FORGET_CODE} language="bash" className="mb-2" />
          <CodeBlock code={HTTP_FORGET_RESPONSE} language="json" />
        </section>

        <Divider />

        {/* ── Error codes ── */}
        <section id="errors" className="mb-12 scroll-mt-24">
          <SectionH2>Error codes</SectionH2>
          <p className="text-zinc-500 leading-relaxed mb-6">
            All errors return JSON with an <code className="text-sky-300 text-sm">error</code> field.
            The SDK throws on non-2xx status codes.
          </p>

          <div className="rounded-xl border border-[#1e1e1e] overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] bg-[#0d0d0d]">
                  {['Status', 'Meaning', 'Endpoints'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#080808] divide-y divide-[#111111]">
                {[
                  { status: '400', style: 'text-orange-400', meaning: 'Missing required fields', endpoints: 'save (userMessage/aiReply), context (query)' },
                  { status: '401', style: 'text-red-400',    meaning: 'Invalid or missing API key', endpoints: 'All endpoints' },
                  { status: '429', style: 'text-amber-400',  meaning: 'Memory limit reached', endpoints: 'save only' },
                ].map(r => (
                  <tr key={r.status}>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-sm ${r.style}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs font-medium">{r.meaning}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">{r.endpoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-zinc-200 mb-3">429 — Limit reached</h3>
          <p className="text-xs text-zinc-600 mb-3">
            Returned only by <code className="text-zinc-500">POST /memory/save</code> when the user has
            reached their plan limit. Existing memories are safe — only new saves are blocked.
          </p>
          <CodeBlock code={ERROR_429_CODE} language="json" />

          <div
            className="rounded-xl border p-5 mt-6"
            style={{ background: 'rgba(139,92,246,0.04)', borderColor: 'rgba(139,92,246,0.12)' }}
          >
            <p className="text-xs text-zinc-400 leading-relaxed">
              Free plan includes <strong className="text-zinc-200">500 memory records</strong>{' '}
              (250 conversation turns). When the limit is reached, the 429 response includes a{' '}
              <code className="text-sky-300">limit</code>, <code className="text-sky-300">plan</code>,
              and <code className="text-sky-300">upgrade</code> URL.{' '}
              <a href="/pricing" className="text-purple-400 hover:text-purple-300 transition-colors">
                View pricing →
              </a>
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
