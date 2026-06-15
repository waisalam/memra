'use client'

import { useState, useEffect, useRef } from 'react'

interface Key {
  id: string
  key: string
  maskedKey: string
  name: string
  createdAt: Date
  lastUsed: Date | null
  isActive: boolean
}

function timeAgo(date: Date | null) {
  if (!date) return 'Never'
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const cb = useRef(onExpire)
  cb.current = onExpire

  useEffect(() => {
    if (remaining <= 0) { cb.current(); return }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const pct = (remaining / seconds) * 100
  const color = remaining > 20 ? '#3b82f6' : remaining > 10 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15" fill="none" strokeWidth="3"
          stroke={color}
          strokeDasharray={`${2 * Math.PI * 15}`}
          strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ color }} className="text-xs font-mono tabular-nums">{remaining}s</span>
    </div>
  )
}

export function KeysClient({ initialKeys, userId, keyLimit }: { initialKeys: Key[]; userId: string; keyLimit: number }) {
  const [keys, setKeys] = useState<Key[]>(initialKeys)
  // session-only store: keyId → plaintext key
  const [sessionKeys, setSessionKeys] = useState<Record<string, string>>({})

  const [showModal, setShowModal] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [modalKey, setModalKey] = useState<string | null>(null)       // plaintext key shown in modal
  const [modalKeyId, setModalKeyId] = useState<string | null>(null)   // which key row triggered modal
  const [copied, setCopied] = useState(false)
  const [keyExpired, setKeyExpired] = useState(false)

  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  // expanded row on mobile
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openCreateModal() {
    setShowModal(true)
    setModalKey(null)
    setModalKeyId(null)
    setKeyName('')
    setKeyExpired(false)
    setCopied(false)
    setCreateError(null)
  }

  async function createKey() {
    if (!keyName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: keyName.trim() }),
      })
      const data = await res.json()
      if (res.status === 429) {
        setCreateError(data.error ?? 'API key limit reached. Upgrade to create more.')
        return
      }
      if (data.apiKey) {
        const plainKey = data.apiKey.key
        const masked = `mk_live_${'•'.repeat(Math.max(0, plainKey.length - 4))}${plainKey.slice(-4)}`
        const newKeyRow: Key = {
          id: data.apiKey.id,
          key: plainKey,
          maskedKey: masked,
          name: data.apiKey.name,
          createdAt: data.apiKey.createdAt,
          lastUsed: null,
          isActive: true,
        }
        setKeys((prev) => [newKeyRow, ...prev])
        setSessionKeys((prev) => ({ ...prev, [data.apiKey.id]: plainKey }))
        setModalKey(plainKey)
        setModalKeyId(data.apiKey.id)
        setKeyExpired(false)
        setCopied(false)
        setKeyName('')
      }
    } finally {
      setCreating(false)
    }
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function closeModal() {
    setShowModal(false)
    setModalKey(null)
    setModalKeyId(null)
    setKeyExpired(false)
    setCopied(false)
    setKeyName('')
  }

  function handleKeyExpire() {
    setKeyExpired(true)
  }

  function revealKey(id: string) {
    const plain = sessionKeys[id]
    if (!plain) return
    setModalKey(plain)
    setModalKeyId(id)
    setKeyExpired(false)
    setCopied(false)
    setShowModal(true)
  }

  async function revokeKey(id: string) {
    setRevoking(id)
    try {
      await fetch('/api/keys/revoke', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: id }),
      })
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, isActive: false } : k))
      setSessionKeys((prev) => { const n = { ...prev }; delete n[id]; return n })
    } finally {
      setRevoking(null)
      setRevokeId(null)
    }
  }

  async function revokeAndRegenerate(id: string, name: string) {
    setRegeneratingId(id)
    try {
      // revoke old
      await fetch('/api/keys/revoke', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: id }),
      })
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, isActive: false } : k))
      setSessionKeys((prev) => { const n = { ...prev }; delete n[id]; return n })

      // create new with same name
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
      })
      const data = await res.json()
      if (data.apiKey) {
        const plainKey = data.apiKey.key
        const masked = `mk_live_${'•'.repeat(Math.max(0, plainKey.length - 4))}${plainKey.slice(-4)}`
        const newKeyRow: Key = {
          id: data.apiKey.id,
          key: plainKey,
          maskedKey: masked,
          name: data.apiKey.name,
          createdAt: data.apiKey.createdAt,
          lastUsed: null,
          isActive: true,
        }
        setKeys((prev) => [newKeyRow, ...prev])
        setSessionKeys((prev) => ({ ...prev, [data.apiKey.id]: plainKey }))
        setModalKey(plainKey)
        setModalKeyId(data.apiKey.id)
        setKeyExpired(false)
        setCopied(false)
        setShowModal(true)
      }
    } finally {
      setRegeneratingId(null)
    }
  }

  const activeKeys = keys.filter((k) => k.isActive)
  const revokedKeys = keys.filter((k) => !k.isActive)
  const atKeyLimit = keyLimit !== Infinity && activeKeys.length >= keyLimit
  const limitLabel = keyLimit === Infinity ? '∞' : keyLimit

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">API Keys</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {activeKeys.length} / {limitLabel} active keys
          </p>
        </div>
        {atKeyLimit ? (
          <a
            href="/pricing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-amber-400 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-all shrink-0"
            style={{ minHeight: '44px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="hidden sm:inline">Key limit reached — Upgrade</span>
            <span className="sm:hidden">Upgrade</span>
          </a>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', minHeight: '44px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="hidden sm:inline">Create new key</span>
            <span className="sm:hidden">New key</span>
          </button>
        )}
      </div>

      {/* Keys table */}
      {activeKeys.length === 0 && revokedKeys.length === 0 ? (
        <div className="rounded-2xl border border-[#1e1e1e] py-16 text-center space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <circle cx="7" cy="17" r="4"/><path d="M9.5 14.5l9-9m0 0l3 3-3.5 3.5-3-3M15 5l3 3"/>
            </svg>
          </div>
          <div>
            <p className="text-zinc-300 font-medium">No API keys yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create your first API key to start using Memra</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', minHeight: '44px' }}
          >
            Create API key
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Warning banner */}
          <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-xs text-amber-400/80">If you lost your key, revoke it and create a new one. Keys cannot be recovered after the modal closes.</p>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {['Name', 'Key', 'Created', 'Last used', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {keys.map((k) => (
                  <tr key={k.id} className={`transition-colors ${k.isActive ? 'hover:bg-white/2' : 'opacity-50'}`}>
                    <td className="px-5 py-3.5 font-medium text-zinc-300 whitespace-nowrap">{k.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-zinc-500 font-mono">{k.maskedKey}</code>
                        {k.isActive && sessionKeys[k.id] && (
                          <button
                            onClick={() => revealKey(k.id)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 rounded whitespace-nowrap"
                          >
                            Re-reveal
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 text-xs whitespace-nowrap">{formatDate(k.createdAt)}</td>
                    <td className="px-5 py-3.5 text-zinc-600 text-xs whitespace-nowrap">{timeAgo(k.lastUsed)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${k.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        {k.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {k.isActive && (
                        <div className="flex items-center gap-3">
                          {revokeId === k.id ? (
                            <>
                              <button onClick={() => revokeKey(k.id)} disabled={revoking === k.id} className="text-xs text-red-400 hover:text-red-300 transition-colors" style={{ minHeight: '44px' }}>
                                {revoking === k.id ? 'Revoking…' : 'Confirm revoke'}
                              </button>
                              <button onClick={() => setRevokeId(null)} className="text-xs text-zinc-600 hover:text-zinc-400">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setRevokeId(k.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors" style={{ minHeight: '44px' }}>
                                Revoke
                              </button>
                              <button
                                onClick={() => revokeAndRegenerate(k.id, k.name)}
                                disabled={regeneratingId === k.id}
                                className="text-xs text-zinc-500 hover:text-blue-400 transition-colors whitespace-nowrap"
                                style={{ minHeight: '44px' }}
                              >
                                {regeneratingId === k.id ? 'Regenerating…' : 'Revoke & Regenerate'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-[#1a1a1a]">
            {keys.map((k) => (
              <div key={k.id} className={k.isActive ? '' : 'opacity-50'}>
                <button
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/2 transition-colors"
                  style={{ minHeight: '56px' }}
                  onClick={() => setExpandedId(expandedId === k.id ? null : k.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${k.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    <span className="text-sm font-medium text-zinc-300">{k.name}</span>
                  </div>
                  <span className="text-zinc-600 text-xs">{expandedId === k.id ? '▲' : '▼'}</span>
                </button>
                {expandedId === k.id && (
                  <div className="px-4 pb-4 space-y-3 bg-white/1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-zinc-500 font-mono break-all">{k.maskedKey}</code>
                      {k.isActive && sessionKeys[k.id] && (
                        <button onClick={() => revealKey(k.id)} className="text-[10px] text-blue-400 border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 rounded shrink-0">
                          Re-reveal
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                      <div>Created: {formatDate(k.createdAt)}</div>
                      <div>Last used: {timeAgo(k.lastUsed)}</div>
                    </div>
                    {k.isActive && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => revokeAndRegenerate(k.id, k.name)}
                          disabled={regeneratingId === k.id}
                          className="flex-1 py-2.5 rounded-lg text-xs font-medium text-white text-center"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', minHeight: '44px' }}
                        >
                          {regeneratingId === k.id ? 'Working…' : 'Regenerate'}
                        </button>
                        <button
                          onClick={() => setRevokeId(revokeId === k.id ? null : k.id)}
                          className="flex-1 py-2.5 rounded-lg text-xs border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-colors"
                          style={{ minHeight: '44px' }}
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                    {revokeId === k.id && k.isActive && (
                      <div className="flex gap-2">
                        <button onClick={() => revokeKey(k.id)} disabled={revoking === k.id} className="flex-1 py-2.5 rounded-lg text-xs bg-red-600 text-white" style={{ minHeight: '44px' }}>
                          {revoking === k.id ? 'Revoking…' : 'Confirm revoke'}
                        </button>
                        <button onClick={() => setRevokeId(null)} className="flex-1 py-2.5 rounded-lg text-xs border border-zinc-800 text-zinc-500" style={{ minHeight: '44px' }}>Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] p-6 space-y-5" style={{ background: '#0a0a0a' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">
                {modalKey ? 'API key created' : 'Create API key'}
              </h2>
              <button onClick={closeModal} className="text-zinc-600 hover:text-zinc-300 transition-colors p-1" style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {modalKey ? (
              <div className="space-y-4">
                {/* Countdown + key display */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      {keyExpired ? 'Key hidden for security' : 'Copy your key now'}
                    </div>
                    {!keyExpired && (
                      <CountdownTimer seconds={60} onExpire={handleKeyExpire} />
                    )}
                  </div>

                  {keyExpired ? (
                    <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-4 text-center space-y-2">
                      <p className="text-xs text-zinc-500">Key hidden after 60 seconds.</p>
                      <p className="text-xs text-amber-400">If you didn't copy it, use "Revoke &amp; Regenerate" to get a new one.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500">This key will be hidden after the timer ends. Copy it now.</p>
                      <code className="block text-xs text-zinc-200 font-mono bg-black/40 rounded-lg px-3 py-2.5 break-all border border-zinc-800 leading-relaxed">
                        {modalKey}
                      </code>
                      <button
                        onClick={() => copyKey(modalKey)}
                        className="w-full py-3 rounded-lg border text-sm font-medium transition-all"
                        style={{
                          minHeight: '44px',
                          borderColor: copied ? 'rgba(52,211,153,0.4)' : '#3f3f46',
                          background: copied ? 'rgba(52,211,153,0.08)' : 'transparent',
                          color: copied ? '#34d399' : '#d4d4d8',
                        }}
                      >
                        {copied ? '✓ Copied!' : 'Copy to clipboard'}
                      </button>
                    </>
                  )}
                </div>

                {/* Revoke & regenerate from modal */}
                {keyExpired && modalKeyId && (
                  <button
                    onClick={() => {
                      const key = keys.find((k) => k.id === modalKeyId)
                      if (!key) return
                      closeModal()
                      revokeAndRegenerate(modalKeyId, key.name)
                    }}
                    className="w-full py-3 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', minHeight: '44px' }}
                  >
                    Revoke &amp; Regenerate
                  </button>
                )}

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800"
                  style={{ minHeight: '44px' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Key name</label>
                  <input
                    type="text"
                    placeholder="e.g. Production, Development"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createKey()}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ minHeight: '44px' }}
                    autoFocus
                  />
                </div>
                {createError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="shrink-0 mt-0.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div className="space-y-1.5">
                      <p className="text-xs text-amber-400">{createError}</p>
                      <a href="/pricing" className="text-xs text-blue-400 hover:text-blue-300 underline">
                        Upgrade your plan →
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 transition-colors" style={{ minHeight: '44px' }}>
                    Cancel
                  </button>
                  <button
                    onClick={createKey}
                    disabled={creating || !keyName.trim()}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', minHeight: '44px' }}
                  >
                    {creating ? 'Creating…' : 'Create key'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
