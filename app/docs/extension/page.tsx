import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VS Code Extension — Memra',
  description: 'Install the Memra VS Code Extension to auto-capture every AI chat session and restore context across sessions.',
}

const SECTIONS = [
  { id: 'what-is-it', label: 'What is it?' },
  { id: 'install', label: 'Installation' },
  { id: 'setup-api-key', label: 'Set up API Key' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'sessions-panel', label: 'Sessions Panel' },
  { id: 'resume-session', label: 'Resume a Session' },
  { id: 'supported-tools', label: 'Supported AI Tools' },
  { id: 'commands', label: 'Commands' },
  { id: 'plans', label: 'Plans & Limits' },
  { id: 'faq', label: 'FAQ' },
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
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
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
          <span className="text-sm text-zinc-300 font-medium">VS Code Extension</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://marketplace.visualstudio.com/items?itemName=memra.memra" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hidden sm:block">
            Install Extension →
          </a>
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto flex">
        <aside className="hidden lg:block w-56 shrink-0 sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto py-8 pr-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider px-3 pb-2">Extension Guide</p>
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

          {/* Hero */}
          <div className="mb-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-emerald-400 uppercase tracking-widest" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                VS Code Extension
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">LIVE</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-100">Memra for VS Code</h1>
            <P>
              Never lose your AI chat context again. The Memra extension auto-captures every conversation you have with AI in VS Code — and lets you restore that context in one click when you start a new session.
            </P>
          </div>

          {/* What is it */}
          <H2 id="what-is-it">What is it?</H2>
          <div className="space-y-4 mt-4">
            <P>
              Memra is a VS Code extension that runs silently in the background. It watches your AI conversations — GitHub Copilot, Claude Code, Cline, Continue — and saves every message to the Memra cloud automatically.
            </P>
            <P>
              When you open VS Code the next day, switch projects, or start a fresh chat — your previous context is one click away. No more re-explaining your project to the AI.
            </P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: '🔄 Auto-capture', desc: 'Every AI message is saved in real-time. No manual steps — just code normally.' },
                { title: '📋 One-click restore', desc: 'Click a past session to inject its context into your current AI chat.' },
                { title: '🛠️ Multi-tool support', desc: 'Works with Copilot, Claude Code, Cline, Continue — all at once.' },
                { title: '📁 Project-aware', desc: 'Sessions are grouped by project. Switch folders and the right sessions appear.' },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-xl border border-[#1e1e1e] p-4 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-sm font-semibold text-zinc-200">{title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Installation */}
          <H2 id="install">Installation</H2>
          <div className="space-y-4 mt-4">
            <P>Install in under 2 minutes:</P>
            <div className="space-y-6">
              <Step n={1} title="Install from the VS Code Marketplace">
                <P>
                  Open VS Code, go to the Extensions panel (<InlineCode>Ctrl+Shift+X</InlineCode>), search for <strong className="text-zinc-200">Memra</strong>, and click <strong className="text-zinc-200">Install</strong>.
                </P>
                <P>
                  Or install directly from the{' '}
                  <a href="https://marketplace.visualstudio.com/items?itemName=memra.memra" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                    VS Code Marketplace →
                  </a>
                </P>
              </Step>
              <Step n={2} title="Get your Extension API key">
                <P>
                  Go to{' '}
                  <Link href="/dashboard/keys?type=extension" className="text-emerald-400 hover:text-emerald-300">
                    Dashboard → Extension Keys
                  </Link>{' '}
                  and create a new key. It will start with <InlineCode>mk_ext_</InlineCode>. Copy it.
                </P>
                <Callout type="info">
                  You can only have <strong>1 active extension key</strong> per account. If you need a new one, revoke the old one first.
                </Callout>
              </Step>
              <Step n={3} title="Set the API key in VS Code">
                <P>
                  Open the Command Palette (<InlineCode>Ctrl+Shift+P</InlineCode>), type <strong className="text-zinc-200">Memra: Set API Key</strong>, and paste your key.
                </P>
                <Code>{`Ctrl+Shift+P → "Memra: Set API Key" → paste mk_ext_... → Enter`}</Code>
              </Step>
              <Step n={4} title="That's it — Memra runs automatically">
                <P>
                  You&apos;ll see a <strong className="text-zinc-200">Memra</strong> status bar item at the bottom of VS Code. Start chatting with any AI tool — sessions are captured automatically.
                </P>
              </Step>
            </div>
          </div>

          {/* Setup API Key detail */}
          <H2 id="setup-api-key">Set up API Key</H2>
          <div className="space-y-4 mt-4">
            <P>The extension needs an API key to communicate with Memra&apos;s cloud. Here&apos;s how to get one:</P>
            <ol className="space-y-3">
              {[
                ['Sign in', 'Go to memra-rho.vercel.app and sign in with Google'],
                ['Navigate to Extension Keys', 'Dashboard → Extension Keys tab'],
                ['Create key', 'Click "Create Extension key", give it a name, and copy the key (starts with mk_ext_)'],
                ['Paste in VS Code', 'Ctrl+Shift+P → "Memra: Set API Key" → paste → Enter'],
              ].map(([title, desc], i) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0 mt-0.5" style={{ background: 'rgba(16,185,129,0.2)' }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium">{title}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Callout type="warning">
              Never share your API key. It gives access to your session data. If compromised, revoke it in the dashboard and create a new one.
            </Callout>
          </div>

          {/* How it works */}
          <H2 id="how-it-works">How it Works</H2>
          <div className="space-y-4 mt-4">
            <P>
              Once installed and configured, Memra runs completely in the background. Here&apos;s what happens:
            </P>
            <H3>Auto-capture</H3>
            <P>
              The extension watches for AI conversations using file watchers and the VS Code Chat API. Each tool stores chat data differently — Memra knows where to look:
            </P>
            <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">AI Tool</th>
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">How Memra captures it</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {[
                    ['Claude Code', 'Watches ~/.claude/projects/**/*.jsonl for conversation logs'],
                    ['Continue', 'Watches ~/.continue/sessions/*.json for session history'],
                    ['Cline', 'Watches globalStorage tasks for api_conversation_history.json'],
                    ['GitHub Copilot', 'Uses the VS Code @memra chat participant API'],
                  ].map(([tool, how]) => (
                    <tr key={tool}>
                      <td className="px-4 py-2.5 text-zinc-300 font-medium">{tool}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H3>Project-aware sessions</H3>
            <P>
              Each workspace folder gets a unique project ID. When you open a different folder, the current session ends and a new one starts for that project. Sessions are grouped per project — so when you come back to a project, you see only that project&apos;s history.
            </P>

            <H3>Real-time sync</H3>
            <P>
              Every message is sent to the Memra API as it happens. You can see your sessions updating live in the{' '}
              <Link href="/dashboard/extension" className="text-emerald-400 hover:text-emerald-300">dashboard</Link>.
            </P>
          </div>

          {/* Sessions panel */}
          <H2 id="sessions-panel">Sessions Panel</H2>
          <div className="space-y-4 mt-4">
            <P>
              After installing, you&apos;ll see a <strong className="text-zinc-200">Memra: Sessions</strong> panel in the VS Code sidebar. It shows all your captured sessions for the current project.
            </P>
            <P>Each session shows:</P>
            <ul className="space-y-2">
              {[
                'Session title — auto-generated from the first message',
                'Message count — how many messages were captured',
                'AI tool — which tool was used (Copilot, Claude, Cline, etc.)',
                'Date — when the session happened',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <span className="text-emerald-400 mt-0.5 shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
            <P>
              Click the <strong className="text-zinc-200">refresh</strong> icon at the top of the panel to fetch the latest sessions from the cloud.
            </P>
          </div>

          {/* Resume a session */}
          <H2 id="resume-session">Resume a Session</H2>
          <div className="space-y-4 mt-4">
            <P>
              This is the core feature. When you click on a past session in the Memra panel, the extension restores that context into your current AI chat:
            </P>

            <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
              <p className="text-sm font-semibold text-zinc-200">When you click a session, you get a choice:</p>
              <div className="space-y-3">
                {[
                  { tool: 'Claude Code', desc: 'Context is copied to your clipboard. Paste it with Ctrl+V into your Claude Code chat to continue where you left off.' },
                  { tool: 'GitHub Copilot', desc: 'Context is automatically injected into the Copilot chat input. Just press Enter to continue.' },
                  { tool: 'Clipboard Only', desc: 'Copies the context to clipboard so you can paste it into any AI tool manually.' },
                ].map(({ tool, desc }) => (
                  <div key={tool} className="flex items-start gap-3">
                    <span className="text-emerald-400 text-sm mt-0.5 shrink-0">→</span>
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">{tool}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <P>
              The restored context includes a summary of what was discussed, key decisions made, and where you left off — so the AI can pick up exactly where your last session ended.
            </P>

            <Callout type="tip">
              You can also use the command <InlineCode>Memra: Copy Resume Prompt</InlineCode> from the Command Palette to copy the most recent session&apos;s context without opening the sidebar.
            </Callout>
          </div>

          {/* Supported tools */}
          <H2 id="supported-tools">Supported AI Tools</H2>
          <div className="space-y-4 mt-4">
            <P>Memra captures conversations from these VS Code AI tools:</P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'GitHub Copilot', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', status: 'Chat participant + auto-paste' },
                { name: 'Claude Code', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', status: 'File watcher + clipboard' },
                { name: 'Cline', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', status: 'File watcher + clipboard' },
                { name: 'Continue', color: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', status: 'File watcher + clipboard' },
              ].map(({ name, color, bg, border, status }) => (
                <div key={name} className="rounded-xl border p-3 flex items-center gap-3" style={{ background: bg, borderColor: border }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color }}>{name}</p>
                    <p className="text-[11px] text-zinc-600">{status}</p>
                  </div>
                </div>
              ))}
            </div>
            <P>
              More tools will be supported as they add chat APIs or local storage. The extension is designed to detect and capture any AI tool that stores conversations locally.
            </P>
          </div>

          {/* Commands */}
          <H2 id="commands">Commands</H2>
          <div className="space-y-4 mt-4">
            <P>Open the Command Palette (<InlineCode>Ctrl+Shift+P</InlineCode>) and type &ldquo;Memra&rdquo; to see all available commands:</P>
            <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">Command</th>
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">What it does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {[
                    ['Memra: Set API Key', 'Configure your extension API key (mk_ext_...)'],
                    ['Memra: Show Status', 'Shows current connection status, active session, and message count'],
                    ['Memra: Copy Resume Prompt', 'Copies the most recent session context to your clipboard'],
                    ['Memra: Focus on Sessions View', 'Opens the Memra sessions sidebar panel'],
                    ['Memra: Start New Session', 'Manually starts a new session (normally automatic)'],
                    ['Memra: View Sessions in Dashboard', 'Opens the Memra web dashboard in your browser'],
                  ].map(([cmd, desc]) => (
                    <tr key={cmd}>
                      <td className="px-4 py-2.5 text-zinc-300 font-medium font-mono">{cmd}</td>
                      <td className="px-4 py-2.5 text-zinc-500">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plans */}
          <H2 id="plans">Plans &amp; Limits</H2>
          <div className="space-y-4 mt-4">
            <P>The extension is included with every Memra plan:</P>
            <div className="rounded-xl border border-[#1e1e1e] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-zinc-900/30">
                    <th className="text-left px-4 py-2.5 text-zinc-500 font-medium">Feature</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Free</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Pro</th>
                    <th className="text-center px-4 py-2.5 text-zinc-500 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {[
                    ['Stored sessions', '5', '50', 'Unlimited'],
                    ['Auto-capture', '✓', '✓', '✓'],
                    ['Session restore', '✓', '✓', '✓'],
                    ['AI resume prompts', '✗', '✓', '✓'],
                    ['AI session summaries', '✗', '✓', '✓'],
                    ['Extension API keys', '1', '1', '1'],
                    ['Web dashboard', '✓', '✓', '✓'],
                  ].map(([feature, free, pro, enterprise]) => (
                    <tr key={feature}>
                      <td className="px-4 py-2.5 text-zinc-400">{feature}</td>
                      <td className="px-4 py-2.5 text-center text-zinc-500">{free}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-400">{pro}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-400">{enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              When you hit the session limit on the free plan, the extension will show a notification with an option to upgrade. You can also delete old sessions from the{' '}
              <Link href="/dashboard/extension" className="text-emerald-400 hover:text-emerald-300">web dashboard</Link>{' '}
              to free up space.
            </P>
          </div>

          {/* FAQ */}
          <H2 id="faq">FAQ</H2>
          <div className="space-y-6 mt-4">
            {[
              {
                q: 'Does Memra read my code?',
                a: 'No. Memra only captures AI chat messages — the conversations you have with Copilot, Claude Code, etc. It does not read, index, or upload your source code files.',
              },
              {
                q: 'What data is stored?',
                a: 'Only the text of AI chat messages (user prompts and AI responses), along with metadata like timestamps and which tool was used. Messages are stored encrypted in transit and at rest.',
              },
              {
                q: 'Can I use the extension with multiple AI tools at once?',
                a: 'Yes. Memra captures from all supported tools simultaneously. If you use Copilot and Claude Code in the same session, messages from both appear in the same session timeline.',
              },
              {
                q: 'What happens when I switch projects?',
                a: 'The current session ends automatically and a new session starts for the new project. Each project has its own session history.',
              },
              {
                q: 'Can I delete a session?',
                a: 'Yes. From the web dashboard at Dashboard → Extension Sessions, you can delete individual sessions. You can also delete from the sessions panel in VS Code.',
              },
              {
                q: 'Does it slow down VS Code?',
                a: 'No. The extension is lightweight (~31KB). File watchers and API calls are asynchronous and don\'t block the editor.',
              },
              {
                q: 'I clicked a session but nothing happened',
                a: 'Make sure you have an AI chat panel open. For Claude Code, the context is copied to clipboard — press Ctrl+V. For Copilot, it auto-fills the chat input.',
              },
              {
                q: 'Why does it say "Invalid Date" in the sidebar?',
                a: 'This is a display formatting issue that occurs with certain timezones. The sessions are captured correctly — the dates display properly in the web dashboard.',
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
            style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <p className="text-lg font-bold text-zinc-100">Ready to get started?</p>
            <p className="text-sm text-zinc-500">Install the extension and set up your key in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://marketplace.visualstudio.com/items?itemName=memra.memra"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                Install from Marketplace →
              </a>
              <Link
                href="/dashboard/keys?type=extension"
                className="px-6 py-3 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
              >
                Get Extension Key
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-zinc-700">
            <span>Memra VS Code Extension — v0.1.0</span>
            <Link href="/docs" className="hover:text-zinc-500 transition-colors">← Back to docs</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
