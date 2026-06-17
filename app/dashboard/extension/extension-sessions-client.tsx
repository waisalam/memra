'use client'

import { useState } from 'react'

interface Session {
  id: string
  title: string
  tool: string
  messageCount: number
  tokenCount: number
  summary: string | null
  resumePrompt: string | null
  isActive: boolean
  startedAt: string
  lastSavedAt: string
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const TOOL_META: Record<string, { label: string; color: string; bg: string }> = {
  copilot: { label: 'Copilot', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  claude: { label: 'Claude', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  cline: { label: 'Cline', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  continue: { label: 'Continue', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  other: { label: 'Other', color: '#71717a', bg: 'rgba(113,113,122,0.12)' },
}

function ToolBadge({ tool }: { tool: string }) {
  const t = TOOL_META[tool] ?? TOOL_META.other
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: t.color, background: t.bg }}
    >
      {t.label}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      {active ? 'Active' : 'Ended'}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-100">No sessions yet</h2>
        <p className="text-zinc-500 text-sm max-w-xs">
          Install the Memra VS Code extension to start capturing your AI chat sessions automatically.
        </p>
      </div>
      <button
        disabled
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-60"
        style={{ minHeight: '44px' }}
      >
        Install Extension — Coming Soon
      </button>
    </div>
  )
}

export function ExtensionSessionsClient({
  initialSessions,
  total,
  activeSessions,
  totalMessages,
  topTool,
  hasExtKey,
}: {
  initialSessions: Session[]
  total: number
  activeSessions: number
  totalMessages: number
  topTool: string
  hasExtKey: boolean
}) {
  const [sessions, setSessions] = useState(initialSessions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [toolFilter, setToolFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewingMessages, setViewingMessages] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string; savedAt: string }>>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const filteredSessions = sessions.filter((s) => {
    if (toolFilter !== 'all' && s.tool !== toolFilter) return false
    if (statusFilter === 'active' && !s.isActive) return false
    if (statusFilter === 'ended' && s.isActive) return false
    return true
  })

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
      await fetch(`/api/dashboard/extension-sessions/${id}`, { method: 'DELETE' })
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  async function viewMessages(sessionId: string) {
    setViewingMessages(sessionId)
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/dashboard/extension-sessions/${sessionId}`)
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const stats = [
    { label: 'Total Sessions', value: total, color: '#34d399', bg: 'rgba(16,185,129,0.06)', iconBg: 'rgba(16,185,129,0.12)' },
    { label: 'Total Messages', value: totalMessages, color: '#60a5fa', bg: 'rgba(59,130,246,0.06)', iconBg: 'rgba(59,130,246,0.12)' },
    { label: 'Active Sessions', value: activeSessions, color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', iconBg: 'rgba(251,191,36,0.12)' },
    { label: 'Top Tool', value: topTool === 'none' ? '—' : (TOOL_META[topTool]?.label ?? topTool), color: '#a78bfa', bg: 'rgba(139,92,246,0.06)', iconBg: 'rgba(139,92,246,0.12)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-100">VS Code Extension Sessions</h1>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20">COMING SOON</span>
        </div>
        <p className="text-zinc-500 text-sm mt-1">Every AI chat session captured automatically</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#1e1e1e] p-4 space-y-2"
            style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.015), ${s.bg})` }}
          >
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600">Tool:</span>
          {['all', 'copilot', 'claude', 'cline', 'continue'].map((t) => (
            <button
              key={t}
              onClick={() => setToolFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                toolFilter === t ? 'bg-white/8 text-zinc-100' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {t === 'all' ? 'All' : TOOL_META[t]?.label ?? t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600">Status:</span>
          {['all', 'active', 'ended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-white/8 text-zinc-100' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!hasExtKey && sessions.length === 0 ? (
        <EmptyState />
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-[#1e1e1e] py-12 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-zinc-500 text-sm">No sessions match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-[#1e1e1e] overflow-hidden transition-colors hover:border-[#2a2a2a]"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="px-5 py-4 flex items-start gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-200 truncate">{s.title}</p>
                    <ToolBadge tool={s.tool} />
                    <StatusBadge active={s.isActive} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span>{s.messageCount} messages</span>
                    <span>{s.tokenCount.toLocaleString()} tokens</span>
                    <span>Started {timeAgo(s.startedAt)}</span>
                    <span>Last activity {timeAgo(s.lastSavedAt)}</span>
                  </div>
                  {s.summary && (
                    <p className="text-xs text-zinc-500 leading-relaxed">{s.summary.slice(0, 100)}{s.summary.length > 100 ? '...' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => viewMessages(s.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                    style={{ minHeight: '36px' }}
                  >
                    View Messages
                  </button>
                  <button
                    onClick={() => copyResume(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/5 transition-colors"
                    style={{ minHeight: '36px' }}
                  >
                    {copied === s.id ? 'Copied!' : 'Copy Resume'}
                  </button>
                  {confirmDeleteId === s.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteSession(s.id)}
                        disabled={deletingId === s.id}
                        className="px-2 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300"
                        style={{ minHeight: '36px' }}
                      >
                        {deletingId === s.id ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-400"
                        style={{ minHeight: '36px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="px-2 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-red-400 transition-colors"
                      style={{ minHeight: '36px' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {expandedId === s.id && (
                <div className="px-5 py-4 border-t border-[#1a1a1a] bg-zinc-900/40 space-y-3 max-w-2xl">
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message viewer slide-over */}
      {viewingMessages && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-lg h-full flex flex-col border-l border-[#1e1e1e]"
            style={{ background: '#0a0a0a' }}
          >
            <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-zinc-200">Session Messages</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const md = messages.map((m) => `**${m.role}:** ${m.content}`).join('\n\n---\n\n')
                    navigator.clipboard.writeText(md)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-zinc-800 hover:text-zinc-200 transition-colors"
                  style={{ minHeight: '36px' }}
                >
                  Export as Markdown
                </button>
                <button
                  onClick={() => { setViewingMessages(null); setMessages([]) }}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMessages ? (
                <div className="text-center py-12 text-zinc-600 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-sm">No messages found</div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-500/10 text-zinc-200 border border-blue-500/20'
                          : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(m.savedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => { setViewingMessages(null); setMessages([]) }} />
        </div>
      )}
    </div>
  )
}
