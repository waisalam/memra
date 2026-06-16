'use client'

import { useState } from 'react'

interface Session {
  id: string
  title: string | null
  tool: string | null
  messageCount: number
  tokenCount: number
  summary: string | null
  resumePrompt: string | null
  createdAt: string
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TOOL_META: Record<string, { label: string; color: string; bg: string }> = {
  claude: { label: 'Claude Code', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  cursor: { label: 'Cursor', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  windsurf: { label: 'Windsurf', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
}

function ToolBadge({ tool }: { tool: string | null }) {
  const t = tool ? TOOL_META[tool] ?? null : null
  if (!t) return <span className="text-xs text-zinc-600 font-mono">{tool ?? 'unknown'}</span>
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: t.color, background: t.bg }}
    >
      {t.label}
    </span>
  )
}

function NoKeyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
          <circle cx="7" cy="17" r="4" /><path d="M9.5 14.5l9-9m0 0l3 3-3.5 3.5-3-3M15 5l3 3" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-100">Set up the MCP Server</h2>
        <p className="text-zinc-500 text-sm max-w-xs">
          Use Memra inside Claude Code, Cursor, or Windsurf to save and resume AI sessions.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-3 text-left">
        {[
          { n: 1, label: 'Create an MCP key', sub: 'Go to MCP Keys tab' },
          { n: 2, label: 'Install the server', sub: 'npm install -g @memra/mcp-server' },
          { n: 3, label: 'Add to your AI tool config', sub: '{ "mcpServers": { "memra": {...} } }' },
          { n: 4, label: 'Start saving context', sub: 'Ask your AI to "save context to memra"' },
        ].map(({ n, label, sub }) => (
          <div key={n} className="flex items-start gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 shrink-0 mt-0.5"
              style={{ background: 'rgba(139,92,246,0.2)' }}
            >
              {n}
            </span>
            <div>
              <p className="text-sm text-zinc-300 font-medium">{label}</p>
              <p className="text-xs text-zinc-600 font-mono mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/dashboard/keys?type=mcp"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', minHeight: '44px' }}
      >
        Create MCP Key →
      </a>
      <a href="/docs/mcp" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
        View full setup guide
      </a>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
      </div>
      <div>
        <p className="text-zinc-300 font-medium">No sessions saved yet</p>
        <p className="text-zinc-600 text-sm mt-1">Ask your AI tool to &quot;save context to memra&quot; to see sessions here.</p>
      </div>
      <a href="/docs/mcp" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
        See how it works →
      </a>
    </div>
  )
}

export function McpSessionsClient({
  initialSessions,
  total,
  hasMcpKey,
}: {
  initialSessions: Session[]
  total: number
  hasMcpKey: boolean
}) {
  const [sessions, setSessions] = useState(initialSessions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  if (!hasMcpKey) return <NoKeyState />
  if (sessions.length === 0) return <EmptyState />

  async function copyResume(session: Session) {
    const text = session.resumePrompt ?? session.summary ?? session.title ?? ''
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(session.id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function deleteSession(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/dashboard/mcp-sessions/${id}`, { method: 'DELETE' })
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">MCP Sessions</h1>
        <p className="text-zinc-500 text-sm mt-1">{total} session{total !== 1 ? 's' : ''} saved</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Title', 'Tool', 'Messages', 'Tokens', 'Saved', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {sessions.map((s) => (
                <>
                  <tr
                    key={s.id}
                    className="hover:bg-white/2 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  >
                    <td className="px-5 py-3.5 text-zinc-300 font-medium max-w-[220px] truncate">
                      {s.title ?? 'Untitled session'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <ToolBadge tool={s.tool} />
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{s.messageCount}</td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{s.tokenCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-zinc-600 text-xs whitespace-nowrap">{timeAgo(s.createdAt)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyResume(s)}
                          className="text-xs text-zinc-500 hover:text-blue-400 transition-colors whitespace-nowrap"
                          style={{ minHeight: '44px' }}
                          title={s.resumePrompt ? 'Copy resume prompt' : 'Copy summary'}
                        >
                          {copied === s.id ? '✓ Copied' : 'Copy resume'}
                        </button>
                        {confirmDeleteId === s.id ? (
                          <>
                            <button
                              onClick={() => deleteSession(s.id)}
                              disabled={deletingId === s.id}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              style={{ minHeight: '44px' }}
                            >
                              {deletingId === s.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-zinc-600 hover:text-zinc-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(s.id)}
                            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                            style={{ minHeight: '44px' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-expand`}>
                      <td colSpan={6} className="px-5 py-4 bg-zinc-900/40 border-b border-[#1a1a1a]">
                        <div className="space-y-3 max-w-2xl">
                          {s.summary && (
                            <div>
                              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">Summary</p>
                              <p className="text-sm text-zinc-400 leading-relaxed">{s.summary}</p>
                            </div>
                          )}
                          {s.resumePrompt && (
                            <div>
                              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">Resume Prompt</p>
                              <pre className="text-xs text-zinc-400 font-mono bg-black/30 rounded-lg p-3 border border-zinc-800 whitespace-pre-wrap leading-relaxed">
                                {s.resumePrompt}
                              </pre>
                            </div>
                          )}
                          {!s.summary && !s.resumePrompt && (
                            <p className="text-sm text-zinc-600">No summary available (Pro feature).</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-[#1a1a1a]">
          {sessions.map((s) => (
            <div key={s.id}>
              <button
                className="w-full px-4 py-3.5 flex items-start gap-3 text-left hover:bg-white/2 transition-colors"
                style={{ minHeight: '56px' }}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{s.title ?? 'Untitled'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ToolBadge tool={s.tool} />
                    <span className="text-xs text-zinc-600">{timeAgo(s.createdAt)}</span>
                  </div>
                </div>
                <span className="text-zinc-600 text-xs pt-1">{expandedId === s.id ? '▲' : '▼'}</span>
              </button>
              {expandedId === s.id && (
                <div className="px-4 pb-4 space-y-3 bg-white/1">
                  <div className="flex gap-2 text-xs text-zinc-600">
                    <span>{s.messageCount} messages</span>
                    <span>·</span>
                    <span>{s.tokenCount.toLocaleString()} tokens</span>
                  </div>
                  {s.summary && <p className="text-xs text-zinc-400 leading-relaxed">{s.summary}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyResume(s)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-medium text-white text-center"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', minHeight: '44px' }}
                    >
                      {copied === s.id ? '✓ Copied' : 'Copy resume'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(confirmDeleteId === s.id ? null : s.id)}
                      className="flex-1 py-2.5 rounded-lg text-xs border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
                      style={{ minHeight: '44px' }}
                    >
                      {confirmDeleteId === s.id ? 'Confirm delete?' : 'Delete'}
                    </button>
                  </div>
                  {confirmDeleteId === s.id && (
                    <button
                      onClick={() => deleteSession(s.id)}
                      disabled={deletingId === s.id}
                      className="w-full py-2.5 rounded-lg text-xs bg-red-600 text-white"
                      style={{ minHeight: '44px' }}
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Yes, delete session'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
