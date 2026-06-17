import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Extension API Docs — Memra',
  description: 'API reference for the Memra VS Code Extension. Capture, resume, and manage AI chat sessions automatically.',
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'session-start', label: 'Start Session' },
  { id: 'session-message', label: 'Send Message' },
  { id: 'session-end', label: 'End Session' },
  { id: 'session-resume', label: 'Resume Session' },
  { id: 'list-sessions', label: 'List Sessions' },
  { id: 'session-detail', label: 'Session Detail' },
  { id: 'memory-bridge', label: 'Memory Bridge' },
  { id: 'plan-limits', label: 'Plan Limits' },
]

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-xl border border-[#1e1e1e] bg-[#080808] p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-blue-300 px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold text-zinc-100 pt-10 pb-3 border-b border-[#1a1a1a] scroll-mt-20">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400 leading-relaxed">{children}</p>
}

function EndpointHeader({ method, path }: { method: string; path: string }) {
  const colors: Record<string, string> = {
    GET: 'text-blue-400 bg-blue-500/10',
    POST: 'text-green-400 bg-green-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
  }
  return (
    <div className="flex items-center gap-2 mt-4 mb-3">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors[method] ?? 'text-zinc-400 bg-zinc-800'}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-zinc-300">{path}</code>
    </div>
  )
}

export default function ExtensionDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between sticky top-0 z-40 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Memra
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Docs</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-sm text-zinc-300 font-medium">Extension API</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/keys?type=extension" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hidden sm:block">
            Get Extension key →
          </Link>
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto flex">
        <aside className="hidden lg:block w-56 shrink-0 sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto py-8 pr-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider px-3 pb-2">Extension API</p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/3 rounded-lg transition-all"
              >
                {s.label}
              </a>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-10 max-w-3xl">
          <div className="mb-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-emerald-400 uppercase tracking-widest" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                Extension API
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20">COMING SOON</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-100">Extension API Reference</h1>
            <P>
              API endpoints for the Memra VS Code Extension. These endpoints power automatic session capture, message saving, and cross-session context injection.
            </P>
          </div>

          {/* Overview */}
          <H2 id="overview">Overview</H2>
          <div className="space-y-4 mt-4">
            <P>
              The Extension API provides 7 endpoints for managing VS Code AI chat sessions. The extension captures conversations from Copilot, Claude Code, Cline, Continue, and other AI tools — saving them to Memra automatically.
            </P>
            <P>
              All endpoints require an Extension API key (<InlineCode>mk_ext_...</InlineCode>). The user ID is automatically derived from the account — it is never passed in the request body.
            </P>
          </div>

          {/* Authentication */}
          <H2 id="authentication">Authentication</H2>
          <div className="space-y-4 mt-4">
            <P>All extension endpoints require the <InlineCode>x-api-key</InlineCode> header with an extension key:</P>
            <Code>{`// Headers
x-api-key: mk_ext_your_key_here

// Key types (extension endpoints ONLY accept mk_ext_ keys)
mk_mem_  → Memory API keys (rejected with 403)
mk_mcp_  → MCP Server keys (rejected with 403)
mk_ext_  → Extension keys  ✓`}</Code>
            <P>Create extension keys at <Link href="/dashboard/keys?type=extension" className="text-emerald-400 hover:text-emerald-300">Dashboard → Extension Keys</Link>.</P>
          </div>

          {/* Session Start */}
          <H2 id="session-start">Start Session</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="POST" path="/api/extension/session/start" />
            <P>Creates a new session or resumes an existing one by session hash.</P>
            <Code>{`// Request body
{
  "tool": "copilot" | "claude" | "cline" | "continue" | "other",
  "sessionHash": "unique-session-id-from-vscode",
  "title": "Optional session title"
}

// Response
{
  "sessionId": "clxyz...",
  "isNew": true,
  "resumePrompt": "Previous session context..." // if available
}`}</Code>
            <Code>{`// TypeScript example
const res = await fetch('https://memra-rho.vercel.app/api/extension/session/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'mk_ext_your_key'
  },
  body: JSON.stringify({
    tool: 'copilot',
    sessionHash: crypto.randomUUID(),
    title: 'Working on auth flow'
  })
})
const { sessionId, isNew, resumePrompt } = await res.json()`}</Code>
          </div>

          {/* Session Message */}
          <H2 id="session-message">Send Message</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="POST" path="/api/extension/session/message" />
            <P>Saves a single message to a session. Call this for each user/assistant message in the conversation.</P>
            <Code>{`// Request body
{
  "sessionId": "clxyz...",
  "role": "user" | "assistant",
  "content": "The message content",
  "tool": "copilot"
}

// Response
{
  "success": true,
  "messageCount": 15,
  "tokenCount": 195
}`}</Code>
            <Code>{`// TypeScript example
await fetch('https://memra-rho.vercel.app/api/extension/session/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'mk_ext_your_key'
  },
  body: JSON.stringify({
    sessionId: 'clxyz...',
    role: 'user',
    content: 'How do I implement JWT auth?',
    tool: 'copilot'
  })
})`}</Code>
          </div>

          {/* Session End */}
          <H2 id="session-end">End Session</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="POST" path="/api/extension/session/end" />
            <P>Ends a session. Pro/Team plans get an AI-generated summary and resume prompt via Groq.</P>
            <Code>{`// Request body
{ "sessionId": "clxyz..." }

// Response
{
  "success": true,
  "summary": "Built JWT authentication with...",
  "resumePrompt": "Continue working on JWT auth..."
}`}</Code>
          </div>

          {/* Session Resume */}
          <H2 id="session-resume">Resume Session</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="GET" path="/api/extension/session/resume" />
            <P>Gets the resume prompt and recent messages from a session. Omit <InlineCode>sessionId</InlineCode> to get the most recent session.</P>
            <Code>{`// Query params (all optional)
?sessionId=clxyz...

// Response (Pro/Team)
{
  "sessionId": "clxyz...",
  "title": "Auth flow work",
  "summary": "...",
  "resumePrompt": "...",
  "messages": [{ "role": "user", "content": "...", "savedAt": "..." }]
}

// Response (Free) — no resumePrompt, last 5 messages only
{
  "sessionId": "clxyz...",
  "title": "Auth flow work",
  "summary": "...",
  "messages": [...],
  "upgradeMessage": "Upgrade to Pro for AI-generated resume prompts"
}`}</Code>
          </div>

          {/* List Sessions */}
          <H2 id="list-sessions">List Sessions</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="GET" path="/api/extension/sessions" />
            <P>Returns a paginated list of sessions.</P>
            <Code>{`// Query params
?limit=10        // default 10, max 50
&tool=copilot     // filter by tool
&active=true      // filter by status

// Response
{
  "sessions": [{
    "id": "clxyz...",
    "title": "Auth flow work",
    "tool": "copilot",
    "messageCount": 42,
    "tokenCount": 5460,
    "startedAt": "2024-01-15T...",
    "lastSavedAt": "2024-01-15T...",
    "isActive": false,
    "summary": "First 100 chars of summary..."
  }],
  "count": 10
}`}</Code>
          </div>

          {/* Session Detail */}
          <H2 id="session-detail">Session Detail</H2>
          <div className="space-y-4 mt-4">
            <EndpointHeader method="GET" path="/api/extension/sessions/:sessionId" />
            <P>Returns full session with all messages. Free plan gets last 20 messages only.</P>
            <EndpointHeader method="DELETE" path="/api/extension/sessions/:sessionId" />
            <P>Soft-deletes a session (sets isActive=false). Add <InlineCode>?permanent=true</InlineCode> for hard delete.</P>
            <Code>{`// DELETE response
{ "success": true, "permanent": false }`}</Code>
          </div>

          {/* Memory Bridge */}
          <H2 id="memory-bridge">Memory Bridge</H2>
          <div className="space-y-4 mt-4">
            <P>These endpoints bridge the extension to the existing Memory API. The user ID is auto-derived from your account — you never pass it.</P>
            <EndpointHeader method="POST" path="/api/extension/memory" />
            <P>Saves a memory (same as Memory API save, but auth via extension key).</P>
            <Code>{`// Request body
{
  "userMessage": "We decided to use Prisma with PostgreSQL",
  "aiReply": "Got it, I'll remember that for future sessions"
}

// Response
{ "success": true, "saved": 2 }`}</Code>
            <EndpointHeader method="GET" path="/api/extension/memory" />
            <P>Retrieves semantically relevant context (same as Memory API context).</P>
            <Code>{`// Query params
?query=database setup&limit=5

// Response
{
  "context": [{ "id": "...", "content": "...", "role": "user", "similarity": 0.87 }],
  "count": 3
}`}</Code>
          </div>

          {/* Plan Limits */}
          <H2 id="plan-limits">Plan Limits</H2>
          <div className="space-y-4 mt-4">
            <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">Limit</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Free</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Pro</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {[
                    ['Sessions', '10', 'Unlimited', 'Unlimited'],
                    ['Messages per session', '100', '10,000', 'Unlimited'],
                    ['Resume messages returned', '5', '10', '10'],
                    ['Session detail messages', '20', 'All', 'All'],
                    ['AI summary + resume prompt', '✗', '✓', '✓'],
                  ].map(([feature, free, pro, team]) => (
                    <tr key={feature}>
                      <td className="px-4 py-2.5 text-zinc-400">{feature}</td>
                      <td className="px-4 py-2.5 text-center text-zinc-500">{free}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-400">{pro}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-400">{team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-14 rounded-2xl border p-8 text-center space-y-5"
            style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <p className="text-lg font-bold text-zinc-100">Ready to get started?</p>
            <p className="text-sm text-zinc-500">Create your Extension key and start capturing sessions.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/keys?type=extension"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                Create Extension Key →
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-zinc-700">
            <span>Memra Extension API — v1.0</span>
            <Link href="/docs" className="hover:text-zinc-500 transition-colors">← Back to docs</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
