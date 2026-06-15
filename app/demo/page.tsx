'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant'
  content: string
  provider?: string
  latencyMs?: number
  timestamp: Date
}

interface MemoryItem {
  id: string
  content: string
  role: string
  similarity?: number
  createdAt: string
}

interface Config {
  apiKey: string
  userId: string
  agentId: string
}

interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function similarityBar(score: number) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return { pct, color }
}

let toastId = 0

export default function DemoPage() {
  const [config, setConfig] = useState<Config>({ apiKey: '', userId: '', agentId: 'default' })
  const [configSaved, setConfigSaved] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [retrievedContext, setRetrievedContext] = useState<MemoryItem[]>([])
  const [contextOpen, setContextOpen] = useState(false)
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [memoryView, setMemoryView] = useState<'context' | 'history' | null>(null)
  const [totalSaved, setTotalSaved] = useState(0)
  const [lastLatency, setLastLatency] = useState<number | null>(null)
  const [lastProvider, setLastProvider] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  function pushToast(type: Toast['type'], message: string) {
    const id = ++toastId
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  useEffect(() => {
    const saved = localStorage.getItem('memra-demo-config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Config
        setConfig(parsed)
        setConfigSaved(true)
      } catch {}
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function saveConfig() {
    if (!config.userId.trim()) { pushToast('error', 'User ID is required'); return }
    localStorage.setItem('memra-demo-config', JSON.stringify(config))
    setConfigSaved(true)
    pushToast('success', 'Configuration saved')
  }

  async function testConnection() {
    if (!config.apiKey || !config.userId) { pushToast('error', 'Enter API key and User ID first'); return }
    setTesting(true)
    try {
      const res = await fetch(
        `/api/memory/history?userId=${encodeURIComponent(config.userId)}&agentId=${encodeURIComponent(config.agentId)}&limit=1`,
        { headers: { 'x-api-key': config.apiKey } }
      )
      if (res.ok) {
        setConnectionStatus('ok')
        pushToast('success', 'Connected to Memra API')
      } else {
        setConnectionStatus('error')
        pushToast('error', `Connection failed (${res.status}) — check your API key`)
      }
    } catch {
      setConnectionStatus('error')
      pushToast('error', 'Network error — check your connection')
    } finally {
      setTesting(false)
    }
  }

  const fetchTotalSaved = useCallback(async () => {
    if (!config.apiKey || !config.userId) return
    const res = await fetch(
      `/api/memory/history?userId=${encodeURIComponent(config.userId)}&agentId=${encodeURIComponent(config.agentId)}&limit=100`,
      { headers: { 'x-api-key': config.apiKey } }
    )
    if (res.ok) {
      const data = await res.json()
      setTotalSaved(data.count ?? 0)
    }
  }, [config])

  async function generateKey() {
    if (!config.userId.trim()) { pushToast('error', 'Enter a User ID first'); return }
    setGeneratingKey(true)
    setGeneratedKey(null)
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: config.userId.trim(), name: 'Demo Key' }),
      })
      const data = await res.json()
      if (data.apiKey?.key) {
        setGeneratedKey(data.apiKey.key)
        setConfig((c) => ({ ...c, apiKey: data.apiKey.key }))
        setConfigSaved(false)
        pushToast('success', 'API key created — copy it now')
      } else {
        pushToast('error', 'Failed to create API key')
      }
    } catch {
      pushToast('error', 'Network error while creating key')
    } finally {
      setGeneratingKey(false)
    }
  }

  async function copyKey() {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  async function sendMessage() {
    if (!input.trim() || !config.apiKey || !config.userId || isTyping) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }])
    setIsTyping(true)
    setContextOpen(false)

    const t0 = Date.now()

    try {
      const ctxRes = await fetch(
        `/api/memory/context?userId=${encodeURIComponent(config.userId)}&agentId=${encodeURIComponent(config.agentId)}&query=${encodeURIComponent(userMsg)}&limit=5`,
        { headers: { 'x-api-key': config.apiKey } }
      )
      const ctxData = ctxRes.ok ? await ctxRes.json() : { context: [] }
      setRetrievedContext(ctxData.context ?? [])
      if ((ctxData.context ?? []).length > 0) setContextOpen(true)

      const t1 = Date.now()

      const chatRes = await fetch('/api/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMsg,
          context: ctxData.context ?? [],
          agentId: config.agentId,
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const chatData = await chatRes.json()
      const aiReply = chatData.reply ?? 'AI unavailable — both providers failed.'
      const t2 = Date.now()

      setLastProvider(chatData.provider ?? null)
      setLastLatency(t2 - t0)

      if (chatData.error) pushToast('error', `AI error: ${chatData.error}`)

      await fetch('/api/memory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey },
        body: JSON.stringify({
          userId: config.userId,
          agentId: config.agentId,
          userMessage: userMsg,
          aiReply,
        }),
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiReply,
          provider: chatData.provider,
          latencyMs: t2 - t0,
          timestamp: new Date(),
        },
      ])

      await fetchTotalSaved()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: new Date() },
      ])
      pushToast('error', 'Request failed — check console for details')
    } finally {
      setIsTyping(false)
    }
  }

  async function fetchContext() {
    if (!config.apiKey || !config.userId) { pushToast('error', 'Configure API key and User ID first'); return }
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const query = lastUser?.content ?? 'recent conversation'
    const res = await fetch(
      `/api/memory/context?userId=${encodeURIComponent(config.userId)}&agentId=${encodeURIComponent(config.agentId)}&query=${encodeURIComponent(query)}&limit=10`,
      { headers: { 'x-api-key': config.apiKey } }
    )
    if (res.ok) {
      const data = await res.json()
      setMemories(data.context ?? [])
      setMemoryView('context')
    } else {
      pushToast('error', 'Failed to fetch context')
    }
  }

  async function viewHistory() {
    if (!config.apiKey || !config.userId) { pushToast('error', 'Configure API key and User ID first'); return }
    const res = await fetch(
      `/api/memory/history?userId=${encodeURIComponent(config.userId)}&agentId=${encodeURIComponent(config.agentId)}&limit=30`,
      { headers: { 'x-api-key': config.apiKey } }
    )
    if (res.ok) {
      const data = await res.json()
      setMemories(data.history ?? [])
      setMemoryView('history')
    } else {
      pushToast('error', 'Failed to fetch history')
    }
  }

  async function clearMemory() {
    if (!clearConfirm) { setClearConfirm(true); return }
    setClearing(true)
    try {
      const res = await fetch('/api/memory/forget', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey },
        body: JSON.stringify({ userId: config.userId, agentId: config.agentId }),
      })
      if (res.ok) {
        const data = await res.json()
        setMemories([])
        setTotalSaved(0)
        setMessages([])
        setRetrievedContext([])
        setMemoryView(null)
        pushToast('success', `Cleared ${data.deleted} memories`)
      } else {
        pushToast('error', 'Failed to clear memories')
      }
    } catch {
      pushToast('error', 'Network error while clearing')
    } finally {
      setClearing(false)
      setClearConfirm(false)
    }
  }

  const toastColors: Record<Toast['type'], string> = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  }
  const toastIcons: Record<Toast['type'], string> = { success: '✓', error: '✗', info: 'ℹ' }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans">
      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur-sm transition-all ${toastColors[t.type]}`}
          >
            <span className="font-bold mt-0.5">{toastIcons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-zinc-100 font-semibold tracking-tight">Memra</span>
            <span className="text-zinc-600 text-sm">/ playground</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {totalSaved > 0 && (
              <span>{totalSaved} memories</span>
            )}
            {lastLatency && (
              <span>{lastLatency}ms</span>
            )}
            {lastProvider && (
              <Badge variant={lastProvider === 'groq' ? 'blue' : 'purple'}>
                {lastProvider}
              </Badge>
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'ok'
                    ? 'bg-emerald-500'
                    : connectionStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-zinc-700'
                }`}
              />
              <span>
                {connectionStatus === 'ok' ? 'connected' : connectionStatus === 'error' ? 'error' : 'not connected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-4">

        {/* ── Panel 1: Config ── */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Configuration</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">User ID</label>
                <Input
                  placeholder="user_123"
                  value={config.userId}
                  onChange={(e) => { setConfig((c) => ({ ...c, userId: e.target.value })); setConfigSaved(false) }}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Agent ID</label>
                <Input
                  placeholder="default"
                  value={config.agentId}
                  onChange={(e) => { setConfig((c) => ({ ...c, agentId: e.target.value })); setConfigSaved(false) }}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">API Key</label>
                <Input
                  type="password"
                  placeholder="mk_live_..."
                  value={config.apiKey}
                  onChange={(e) => { setConfig((c) => ({ ...c, apiKey: e.target.value })); setConfigSaved(false) }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveConfig} className="flex-1" size="sm">
                {configSaved ? '✓ Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
                {testing ? '…' : 'Test'}
              </Button>
            </div>
          </section>

          {/* Generate key */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">Generate API Key</h2>
            <p className="text-xs text-zinc-500">Creates a new key for the User ID above.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={generateKey}
              disabled={generatingKey}
            >
              {generatingKey ? 'Creating…' : 'Generate Key'}
            </Button>

            {generatedKey && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                <p className="text-xs text-emerald-400 font-medium">Key created — copy it now</p>
                <code className="block text-[11px] text-zinc-300 break-all font-mono">{generatedKey}</code>
                <button
                  onClick={copyKey}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {copiedKey ? '✓ Copied!' : 'Copy to clipboard'}
                </button>
              </div>
            )}
          </section>
        </aside>

        {/* ── Panel 2: Chat ── */}
        <main className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden" style={{ minHeight: '600px' }}>
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Chat</h2>
          </div>

          {/* Context ribbon */}
          {retrievedContext.length > 0 && (
            <div className="px-4 pt-3">
              <button
                onClick={() => setContextOpen((o) => !o)}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{retrievedContext.length} relevant {retrievedContext.length === 1 ? 'memory' : 'memories'} retrieved</span>
                <span className="ml-auto">{contextOpen ? '↑' : '↓'}</span>
              </button>
              {contextOpen && (
                <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                  {retrievedContext.map((m) => {
                    const { pct, color } = similarityBar(m.similarity ?? 0)
                    return (
                      <div key={m.id} className="flex items-center gap-2 rounded-md bg-zinc-800/50 px-3 py-1.5 text-xs">
                        <span className="text-zinc-500 shrink-0">{m.role}</span>
                        <span className="text-zinc-300 truncate flex-1">{m.content}</span>
                        {m.similarity != null && (
                          <span className={`shrink-0 font-medium ${color.replace('bg-', 'text-')}`}>{pct}%</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: '440px' }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 pt-16">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm">Send a message to start</p>
                {(!config.apiKey || !config.userId) && (
                  <p className="text-xs text-zinc-700">Configure User ID and API key first</p>
                )}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      {msg.provider && (
                        <span className="text-[10px] text-zinc-600">{msg.provider}</span>
                      )}
                      {msg.latencyMs && (
                        <span className="text-[10px] text-zinc-700">{msg.latencyMs}ms</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 border-t border-zinc-800">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[42px] max-h-[120px] transition-colors"
                placeholder={config.apiKey && config.userId ? 'Type a message…' : 'Configure User ID and API key to start'}
                value={input}
                disabled={!config.apiKey || !config.userId || isTyping}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                }}
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={isTyping || !input.trim() || !config.apiKey || !config.userId}
                className="shrink-0 h-[42px] px-4"
              >
                Send
              </Button>
            </div>
          </div>
        </main>

        {/* ── Panel 3: Memory Inspector ── */}
        <aside className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden" style={{ minHeight: '600px' }}>
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Memory</h2>
          </div>

          <div className="px-4 pt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={fetchContext}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  memoryView === 'context'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                Semantic
              </button>
              <button
                onClick={viewHistory}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  memoryView === 'history'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                History
              </button>
            </div>

            {/* Clear with inline confirm */}
            {clearConfirm ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                <p className="text-xs text-red-400">Delete all memories for this agent? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={clearMemory}
                    disabled={clearing}
                    className="flex-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 transition-colors disabled:opacity-50"
                  >
                    {clearing ? 'Clearing…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="flex-1 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="w-full rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-600 hover:border-red-900 hover:text-red-400 transition-colors"
              >
                Clear memory
              </button>
            )}
          </div>

          {/* Memory list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 mt-3 space-y-2">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-700 gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                <p className="text-xs">Click Semantic or History</p>
              </div>
            ) : (
              memories.map((m) => {
                const { pct, color } = similarityBar(m.similarity ?? 0)
                return (
                  <div key={m.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium uppercase tracking-wide ${m.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {m.role}
                      </span>
                      {m.similarity != null && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 rounded-full bg-zinc-800">
                            <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-500">{pct}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">{m.content}</p>
                    <p className="text-[10px] text-zinc-700">{timeAgo(m.createdAt)}</p>
                  </div>
                )
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
