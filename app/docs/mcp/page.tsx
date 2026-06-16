import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCP Server Docs — Memra',
  description: 'Set up the Memra MCP Server to save and resume AI coding sessions in Claude Code, Cursor, Windsurf, and more.',
}

const SECTIONS = [
  { id: 'what-is-mcp', label: 'What is the MCP Server?' },
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'installation', label: 'Installation' },
  { id: 'claude-code', label: 'Claude Code Setup' },
  { id: 'cursor', label: 'Cursor Setup' },
  { id: 'windsurf', label: 'Windsurf Setup' },
  { id: 'continue', label: 'Continue.dev Setup' },
  { id: 'how-memory-works', label: 'How Memory Works' },
  { id: 'saving-memories', label: 'Saving Memories' },
  { id: 'loading-context', label: 'Loading Context' },
  { id: 'switching-tools', label: 'Switching Between Tools' },
  { id: 'session-management', label: 'Session Management' },
  { id: 'tools-reference', label: 'MCP Tools Reference' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'faq', label: 'FAQ' },
]

function Code({ children, lang = '' }: { children: string; lang?: string }) {
  void lang
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

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', icon: 'ℹ️', label: 'Note', color: '#60a5fa' },
    warning: { bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.2)', icon: '⚠️', label: 'Warning', color: '#fb923c' },
    tip: { bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.2)', icon: '💡', label: 'Tip', color: '#34d399' },
  }[type]
  return (
    <div className="rounded-xl p-4 space-y-1" style={{ background: styles.bg, border: `1px solid ${styles.border}` }}>
      <p className="text-xs font-bold" style={{ color: styles.color }}>{styles.icon} {styles.label}</p>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-bold text-zinc-100 pt-10 pb-3 border-b border-[#1a1a1a] scroll-mt-20">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-zinc-200 mt-6 mb-2">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-400 leading-relaxed">{children}</p>
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}
        >
          {n}
        </div>
        <div className="flex-1 w-px bg-[#1a1a1a] mt-2" />
      </div>
      <div className="pb-6 flex-1 space-y-2">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  )
}

function ToolRow({ name, trigger, description, plan }: { name: string; trigger: string; description: string; plan: 'all' | 'pro' }) {
  return (
    <tr className="border-b border-[#1a1a1a]">
      <td className="px-4 py-3 align-top">
        <InlineCode>{name}</InlineCode>
      </td>
      <td className="px-4 py-3 text-xs text-zinc-500 align-top italic">&ldquo;{trigger}&rdquo;</td>
      <td className="px-4 py-3 text-xs text-zinc-400 align-top leading-relaxed">{description}</td>
      <td className="px-4 py-3 align-top">
        {plan === 'pro' ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-purple-400" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>Pro</span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-400" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>Free</span>
        )}
      </td>
    </tr>
  )
}

export default function McpDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top nav */}
      <nav className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between sticky top-0 z-40 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Memra
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Docs</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-sm text-zinc-300 font-medium">MCP Server</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/keys?type=mcp" className="text-xs text-purple-400 hover:text-purple-300 transition-colors hidden sm:block">
            Get MCP key →
          </Link>
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto flex">
        {/* Left sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto py-8 pr-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-purple-500/70 uppercase tracking-wider px-3 pb-2">MCP Server</p>
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

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-10 max-w-3xl">

          {/* Hero */}
          <div className="mb-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-purple-400 uppercase tracking-widest" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                MCP Server
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">NEW</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-100">MCP Server</h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Save your AI coding sessions and resume them from any tool — Claude Code, Cursor, Windsurf, or Continue.dev.
              Uses the open{' '}
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                Model Context Protocol
              </a>{' '}
              standard.
            </p>
          </div>

          {/* Section: What is MCP Server */}
          <H2 id="what-is-mcp">What is the MCP Server?</H2>
          <div className="space-y-4 mt-4">
            <P>
              The Memra MCP Server is a local process that connects your VS Code AI tools to Memra&apos;s cloud memory.
              When you ask your AI assistant to &ldquo;save this session&rdquo; or &ldquo;resume my last work&rdquo;,
              the MCP server handles the API calls automatically.
            </P>
            <Callout type="info">
              <strong>What is MCP?</strong> The Model Context Protocol (MCP) is an open standard by Anthropic that lets AI
              tools talk to external services. Think of it as a plugin system — once installed, the AI can call Memra tools
              just like any other function. No copy-pasting, no manual uploads.
            </Callout>
            <P>
              The MCP server runs locally as a background process. Your AI tool communicates with it over standard I/O,
              and it forwards requests to the Memra API using your MCP key.
            </P>
          </div>

          {/* Section: Prerequisites */}
          <H2 id="prerequisites">Prerequisites</H2>
          <div className="space-y-3 mt-4">
            <P>Before installing, make sure you have:</P>
            <ul className="space-y-2">
              {[
                ['Node.js 18+', 'Run: node --version to check'],
                ['npm or npx', 'Comes with Node.js'],
                ['A Memra account', 'Free at memra-rho.vercel.app/login'],
                ['An MCP API key', 'Create one at Dashboard → MCP Keys (mk_mcp_...)'],
                ['A supported AI tool', 'Claude Code, Cursor, Windsurf, or Continue.dev'],
              ].map(([item, note]) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-purple-400 text-sm mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-zinc-400">
                    <span className="text-zinc-300 font-medium">{item}</span>
                    {' — '}
                    <span className="text-zinc-500">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Callout type="warning">
              MCP keys start with <InlineCode>mk_mcp_...</InlineCode>. Memory API keys (<InlineCode>mk_mem_...</InlineCode>) will
              be rejected with a 403 error. Make sure to create an MCP key specifically.
            </Callout>
          </div>

          {/* Section: Installation */}
          <H2 id="installation">Installation</H2>
          <div className="space-y-4 mt-4">
            <P>The MCP server ships as a local folder (<InlineCode>mcp-server/</InlineCode>) inside the Memra project. No global install needed — you point your AI tool directly at the built file.</P>
            <div className="space-y-6">
              <Step n={1} title="Build the MCP server">
                <Code lang="bash">{`cd /path/to/memra/mcp-server
npm install
npm run build`}</Code>
                <P>This creates <InlineCode>mcp-server/dist/index.js</InlineCode> — the file your AI tool will run.</P>
              </Step>
              <Step n={2} title="Verify the build">
                <Code lang="bash">node /path/to/memra/mcp-server/dist/index.js</Code>
                <P>You should see: <InlineCode>🧠 Memra MCP Server v0.1.0</InlineCode> followed by a missing key error (expected — you haven&apos;t set the key yet).</P>
              </Step>
              <Step n={3} title="Get your MCP key">
                <P>
                  Go to{' '}
                  <Link href="/dashboard/keys?type=mcp" className="text-purple-400 hover:text-purple-300">
                    Dashboard → MCP Keys
                  </Link>{' '}
                  and create a new key. It will start with <InlineCode>mk_mcp_</InlineCode>.
                  Copy it — you&apos;ll need it in the next step.
                </P>
              </Step>
            </div>
          </div>

          {/* Section: Claude Code Setup */}
          <H2 id="claude-code">Claude Code Setup</H2>
          <div className="space-y-4 mt-4">
            <div className="space-y-6">
              <Step n={1} title="Open your Claude Code MCP config">
                <P>Claude Code reads MCP servers from <InlineCode>~/.claude/claude_desktop_config.json</InlineCode> (macOS/Linux) or <InlineCode>%APPDATA%\Claude\claude_desktop_config.json</InlineCode> (Windows).</P>
                <Code lang="bash">
                  {`# macOS/Linux
code ~/.claude/claude_desktop_config.json

# Windows
code %APPDATA%\\Claude\\claude_desktop_config.json`}
                </Code>
              </Step>
              <Step n={2} title="Add the Memra server">
                <P>Use the full absolute path to the built <InlineCode>dist/index.js</InlineCode> file:</P>
                <Code lang="json">
                  {`{
  "mcpServers": {
    "memra": {
      "command": "node",
      "args": ["/full/path/to/memra/mcp-server/dist/index.js"],
      "env": {
        "MEMRA_API_KEY": "mk_mcp_your_key_here"
      }
    }
  }
}

// Windows example:
// "args": ["C:\\\\Users\\\\you\\\\Desktop\\\\memra\\\\mcp-server\\\\dist\\\\index.js"]`}
                </Code>
              </Step>
              <Step n={3} title="Restart Claude Code">
                <P>Close and reopen Claude Code. The MCP server will start automatically.</P>
              </Step>
              <Step n={4} title="Verify connection">
                <P>In a new Claude Code conversation, type:</P>
                <Code lang="">&gt; List my Memra sessions</Code>
                <P>Claude should respond with your sessions (or &ldquo;No sessions found&rdquo; if this is your first time).</P>
              </Step>
              <Step n={5} title="Save your first session">
                <Code lang="">&gt; Save this conversation to Memra as "Project setup session"</Code>
              </Step>
            </div>
            <Callout type="warning">
              Never commit your MCP key to git. Add <InlineCode>.claude/claude_desktop_config.json</InlineCode> to your <InlineCode>.gitignore</InlineCode> if your home directory is under version control.
            </Callout>
          </div>

          {/* Section: Cursor Setup */}
          <H2 id="cursor">Cursor Setup</H2>
          <div className="space-y-4 mt-4">
            <div className="space-y-6">
              <Step n={1} title="Open Cursor Settings">
                <P>Go to <strong className="text-zinc-300">Settings → Features → MCP Servers</strong> or open <InlineCode>~/.cursor/mcp.json</InlineCode> directly.</P>
              </Step>
              <Step n={2} title="Add Memra to your MCP config">
                <Code lang="json">
                  {`{
  "mcpServers": {
    "memra": {
      "command": "node",
      "args": ["/full/path/to/memra/mcp-server/dist/index.js"],
      "env": {
        "MEMRA_API_KEY": "mk_mcp_your_key_here"
      }
    }
  }
}`}
                </Code>
              </Step>
              <Step n={3} title="Enable the server">
                <P>In Cursor settings, toggle the Memra server on. You should see a green dot when it connects.</P>
              </Step>
              <Step n={4} title="Test it">
                <P>Open Cursor Composer and type:</P>
                <Code lang="">&gt; Save this session to Memra</Code>
              </Step>
              <Step n={5} title="Resume a session">
                <Code lang="">&gt; Resume my last Memra session</Code>
              </Step>
            </div>
          </div>

          {/* Section: Windsurf Setup */}
          <H2 id="windsurf">Windsurf Setup</H2>
          <div className="space-y-4 mt-4">
            <div className="space-y-6">
              <Step n={1} title="Open Windsurf MCP settings">
                <P>Go to <strong className="text-zinc-300">Settings → MCP</strong> or edit <InlineCode>~/.codeium/windsurf/mcp_config.json</InlineCode>.</P>
              </Step>
              <Step n={2} title="Add Memra">
                <Code lang="json">
                  {`{
  "mcpServers": {
    "memra": {
      "command": "node",
      "args": ["/full/path/to/memra/mcp-server/dist/index.js"],
      "env": {
        "MEMRA_API_KEY": "mk_mcp_your_key_here"
      }
    }
  }
}`}
                </Code>
              </Step>
              <Step n={3} title="Restart Windsurf">
                <P>Reload the Windsurf window (<InlineCode>Ctrl+Shift+P</InlineCode> → &ldquo;Reload Window&rdquo;).</P>
              </Step>
              <Step n={4} title="Test in Cascade">
                <Code lang="">&gt; Save this session to Memra</Code>
              </Step>
            </div>
          </div>

          {/* Section: Continue.dev Setup */}
          <H2 id="continue">Continue.dev Setup</H2>
          <div className="space-y-4 mt-4">
            <div className="space-y-6">
              <Step n={1} title="Edit ~/.continue/config.json">
                <Code lang="json">
                  {`{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "node",
          "args": ["/full/path/to/memra/mcp-server/dist/index.js"],
          "env": {
            "MEMRA_API_KEY": "mk_mcp_your_key_here"
          }
        }
      }
    ]
  }
}`}
                </Code>
              </Step>
              <Step n={2} title="Reload the Continue extension">
                <P>Use the VS Code command palette: <InlineCode>Continue: Reload</InlineCode></P>
              </Step>
              <Step n={3} title="Use Memra tools in chat">
                <Code lang="">&gt; Save this conversation to Memra</Code>
              </Step>
            </div>
          </div>

          {/* Section: How Memory Works */}
          <H2 id="how-memory-works">How Memory Works</H2>
          <div className="space-y-4 mt-4">
            <P>
              The MCP Server gives your AI access to two types of persistent storage:
            </P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: '💬 Context Sessions',
                  desc: 'Full conversation snapshots. Saved on demand, with an AI-generated summary and resume prompt (Pro). Use these to pick up exactly where you left off.',
                  accent: '#7c3aed',
                },
                {
                  title: '🧠 Memories',
                  desc: 'Discrete facts, decisions, or snippets you want your AI to always remember — project architecture, your coding style, recurring preferences.',
                  accent: '#2563eb',
                },
              ].map(({ title, desc, accent }) => (
                <div
                  key={title}
                  className="rounded-xl border p-4 space-y-2"
                  style={{ borderColor: `${accent}30`, background: `${accent}08` }}
                >
                  <p className="text-sm font-semibold text-zinc-200">{title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <P>
              Memories are stored as vector embeddings in a pgvector database. When your AI retrieves context,
              Memra performs a semantic search — so even if you don&apos;t remember exactly how you phrased something,
              the right context surfaces automatically.
            </P>
          </div>

          {/* Section: Saving Memories */}
          <H2 id="saving-memories">Saving Memories</H2>
          <div className="space-y-4 mt-4">
            <P>Tell your AI to save a memory using natural language:</P>
            <Code lang="">
              {`> Remember that we're using Prisma with a Neon PostgreSQL database
> Save to Memra: our auth is handled by NextAuth v5 with Google provider
> Memra: store that we prefer functional components over class components`}
            </Code>
            <H3>What to save</H3>
            <ul className="space-y-2">
              {[
                'Project architecture decisions',
                'Tech stack and library choices',
                'Coding conventions and style preferences',
                'Recurring bugs and their fixes',
                'API endpoints and data models',
                'Deployment setup and environment variables (not secrets!)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-purple-400 shrink-0 mt-0.5">·</span>
                  {item}
                </li>
              ))}
            </ul>
            <Callout type="warning">
              Never save secrets, API keys, or passwords to Memra. Memories are accessible via API and may be
              included in future AI context.
            </Callout>
          </div>

          {/* Section: Loading Context */}
          <H2 id="loading-context">Loading Context</H2>
          <div className="space-y-4 mt-4">
            <P>Your AI can retrieve context automatically or on demand:</P>
            <H3>Pattern 1 — Explicit retrieval</H3>
            <Code lang="">{`> What do we have saved about authentication?
> Recall our Memra memories about the database setup`}</Code>
            <H3>Pattern 2 — Resume a session</H3>
            <Code lang="">{`> Resume my last Memra session
> Load the session titled "Stripe integration work"`}</Code>
            <H3>Pattern 3 — Automatic (with a system prompt)</H3>
            <P>Add this to your AI tool&apos;s system prompt to auto-load memories:</P>
            <Code lang="">{`At the start of each conversation, call the memra_get_memory tool
to retrieve relevant context for the current task.`}</Code>
          </div>

          {/* Section: Switching Between Tools */}
          <H2 id="switching-tools">Switching Between AI Tools</H2>
          <div className="space-y-4 mt-4">
            <P>
              One of the biggest benefits of Memra is cross-tool memory. Start in Claude Code, continue in Cursor,
              pick up in Windsurf — your sessions and memories follow you everywhere.
            </P>
            <Code lang="">{`Claude Code session 1
└── "Save to Memra: we decided to use tRPC over REST"

Cursor session (later)
└── "What do we have saved about API architecture?"
    └── Memra returns: "tRPC over REST" ✓

Windsurf (next day)
└── "Resume my last Memra session"
    └── Loads Claude Code session context ✓`}</Code>
            <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">Feature</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Free</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {[
                    ['Save sessions', '✓ (5 max)', '✓ Unlimited'],
                    ['Save memories', '✓', '✓'],
                    ['Resume sessions', '✓', '✓'],
                    ['AI-generated summaries', '✗', '✓'],
                    ['Resume prompts', '✗', '✓'],
                    ['Cross-tool sync', '✓', '✓'],
                    ['Monthly API calls', '200', '10,000'],
                  ].map(([f, free, pro]) => (
                    <tr key={f}>
                      <td className="px-4 py-2.5 text-zinc-400">{f}</td>
                      <td className="px-4 py-2.5 text-center text-zinc-500">{free}</td>
                      <td className="px-4 py-2.5 text-center text-purple-400">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Session Management */}
          <H2 id="session-management">Session Management</H2>
          <div className="space-y-4 mt-4">
            <P>View and manage your sessions from the dashboard or via your AI tool:</P>
            <Code lang="">{`# List all sessions
> List my Memra sessions

# Get a specific session
> Show me the session titled "Auth refactor"

# Delete a session
> Delete the oldest Memra session`}</Code>
            <P>
              You can also manage sessions visually at{' '}
              <Link href="/dashboard/mcp" className="text-purple-400 hover:text-purple-300">
                Dashboard → MCP Sessions
              </Link>.
              From there you can view summaries, copy resume prompts, and delete sessions.
            </P>
            <Callout type="tip">
              On the free plan, you can store up to 5 sessions. Saving a new session when at the limit will
              prompt you to delete an old one or upgrade.
            </Callout>
          </div>

          {/* Section: Tools Reference */}
          <H2 id="tools-reference">MCP Tools Reference</H2>
          <div className="space-y-4 mt-4">
            <P>The MCP server exposes 5 tools. Your AI calls these automatically based on your natural language requests.</P>
            <div className="rounded-xl border border-[#1e1e1e] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Tool</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Example trigger</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  <ToolRow
                    name="memra_save_context"
                    trigger="Save this session to Memra"
                    description="Saves the current conversation as a context session. Includes message count, token estimate, and tool name."
                    plan="all"
                  />
                  <ToolRow
                    name="memra_resume"
                    trigger="Resume my last Memra session"
                    description="Returns the resume prompt and last 5 messages from your most recent (or specified) session. Requires Pro for AI-generated resume prompts."
                    plan="pro"
                  />
                  <ToolRow
                    name="memra_list_sessions"
                    trigger="List my Memra sessions"
                    description="Returns a paginated list of your saved sessions with titles, tools, message counts, and summaries."
                    plan="all"
                  />
                  <ToolRow
                    name="memra_save_memory"
                    trigger="Remember that we use tRPC"
                    description="Saves a discrete memory (fact, decision, preference). Stored as a vector embedding for semantic retrieval."
                    plan="all"
                  />
                  <ToolRow
                    name="memra_get_memory"
                    trigger="What do we have saved about auth?"
                    description="Retrieves semantically relevant memories for a given query. Returns the most relevant stored facts."
                    plan="all"
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Troubleshooting */}
          <H2 id="troubleshooting">Troubleshooting</H2>
          <div className="space-y-6 mt-4">
            {[
              {
                problem: 'AI says "memra tool not found" or "no MCP tools available"',
                fix: [
                  'Make sure memra-mcp is installed globally: run memra-mcp --version',
                  'Restart your AI tool completely (not just reload)',
                  'Check the MCP config file path is correct for your OS',
                  'Verify the JSON in the config file is valid (no trailing commas)',
                ],
              },
              {
                problem: 'Error: "Wrong API key type" (403)',
                fix: [
                  'You\'re using a Memory key (mk_mem_...) instead of an MCP key (mk_mcp_...)',
                  'Go to Dashboard → MCP Keys and create a new MCP key',
                  'Update your MEMRA_API_KEY in the MCP config',
                ],
              },
              {
                problem: 'Error: "Invalid or missing API key" (401)',
                fix: [
                  'Double-check that MEMRA_API_KEY is set correctly in your MCP config',
                  'Make sure there are no extra spaces or quotes around the key',
                  'Verify the key is still active at Dashboard → MCP Keys',
                ],
              },
              {
                problem: 'Error: "Monthly API limit reached" (429)',
                fix: [
                  'You\'ve used all your monthly MCP API calls (200 on free plan)',
                  'Upgrade to Pro for 10,000 calls/month at /pricing',
                  'Limits reset on the 1st of each month',
                ],
              },
              {
                problem: 'Session save fails with "session limit reached"',
                fix: [
                  'Free plan allows 5 sessions maximum',
                  'Delete old sessions from Dashboard → MCP Sessions',
                  'Or upgrade to Pro for unlimited sessions',
                ],
              },
              {
                problem: 'node: cannot find module / path not found',
                fix: [
                  'Make sure you ran: cd mcp-server && npm install && npm run build',
                  'Use the absolute path to dist/index.js — not a relative path',
                  'On Windows use double backslashes: C:\\\\Users\\\\you\\\\memra\\\\mcp-server\\\\dist\\\\index.js',
                  'Verify the file exists: ls /path/to/memra/mcp-server/dist/index.js',
                ],
              },
            ].map(({ problem, fix }) => (
              <div key={problem} className="space-y-2">
                <p className="text-sm font-semibold text-zinc-200">❌ {problem}</p>
                <ul className="space-y-1">
                  {fix.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                      <span className="text-zinc-700 shrink-0 mt-0.5">{i + 1}.</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Section: FAQ */}
          <H2 id="faq">FAQ</H2>
          <div className="space-y-6 mt-4">
            {[
              {
                q: 'Is the MCP server free?',
                a: 'Yes. The free plan includes 200 MCP API calls/month and up to 5 saved sessions. Pro ($9/month) gives you 10,000 calls, unlimited sessions, and AI-generated summaries.',
              },
              {
                q: 'Does Memra store my code?',
                a: 'Memra stores what your AI sends it — typically conversation messages, not raw files. If your AI includes code snippets in the conversation, those will be stored. Never ask your AI to send secrets or credentials.',
              },
              {
                q: 'Can I use Memra with multiple AI tools simultaneously?',
                a: 'Yes. Install the MCP server on each machine/tool with the same API key. Sessions and memories are shared across all tools connected to the same account.',
              },
              {
                q: 'What\'s the difference between a session and a memory?',
                a: 'A session is a full conversation snapshot — used to resume where you left off. A memory is a discrete fact or decision — used to give your AI persistent context across many conversations.',
              },
              {
                q: 'Do I need a separate key for each AI tool?',
                a: 'No. One MCP key works across all tools. You can create multiple keys for organization (e.g., one per machine), but it\'s not required.',
              },
              {
                q: 'How is this different from the Memory API?',
                a: 'The Memory API is for developers building AI applications — you call it from your own code. The MCP Server is for developers using AI coding assistants — it works inside Claude Code, Cursor, Windsurf, etc. without writing any code.',
              },
              {
                q: 'Is the MCP server open source?',
                a: 'The package is available on npm as @memra/mcp-server. Source available upon request.',
              },
              {
                q: 'What happens to my data if I cancel Pro?',
                a: 'Your sessions and memories are retained. You\'ll be limited to 5 sessions (oldest may need to be deleted) and 200 API calls/month.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="space-y-2">
                <p className="text-sm font-semibold text-zinc-200">{q}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="mt-14 rounded-2xl border p-8 text-center space-y-5"
            style={{ background: 'rgba(139,92,246,0.04)', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <p className="text-lg font-bold text-zinc-100">Ready to get started?</p>
            <p className="text-sm text-zinc-500">Create your MCP key and start saving sessions in under 5 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/keys?type=mcp"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                Create MCP Key →
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
            <span>Memra MCP Server — v1.0</span>
            <Link href="/docs" className="hover:text-zinc-500 transition-colors">← Back to docs</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
