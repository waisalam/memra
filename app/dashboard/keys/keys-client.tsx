'use client'

import { useState } from 'react'

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

export function KeysClient({ initialKeys, userId }: { initialKeys: Key[]; userId: string }) {
  const [keys, setKeys] = useState<Key[]>(initialKeys)
  const [showModal, setShowModal] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  async function createKey() {
    if (!keyName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: keyName.trim() }),
      })
      const data = await res.json()
      if (data.apiKey) {
        setNewKey(data.apiKey.key)
        const masked = `mk_live_${'•'.repeat(Math.max(0, data.apiKey.key.length - 4))}${data.apiKey.key.slice(-4)}`
        setKeys((prev) => [
          {
            id: data.apiKey.id,
            key: data.apiKey.key,
            maskedKey: masked,
            name: data.apiKey.name,
            createdAt: data.apiKey.createdAt,
            lastUsed: null,
            isActive: true,
          },
          ...prev,
        ])
        setKeyName('')
      }
    } finally {
      setCreating(false)
    }
  }

  async function copyNewKey() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function closeModal() {
    setShowModal(false)
    setNewKey(null)
    setCopied(false)
    setKeyName('')
  }

  async function revokeKey(id: string) {
    setRevoking(id)
    try {
      await fetch(`/api/keys/revoke`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: id }),
      })
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, isActive: false } : k))
    } finally {
      setRevoking(null)
      setRevokeId(null)
    }
  }

  const activeKeys = keys.filter((k) => k.isActive)
  const revokedKeys = keys.filter((k) => !k.isActive)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">API Keys</h1>
          <p className="text-zinc-500 text-sm mt-1">{activeKeys.length} active key{activeKeys.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create new key
        </button>
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
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            Create API key
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e1e1e] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Name', 'Key', 'Created', 'Last used', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {keys.map((k) => (
                <tr key={k.id} className={`transition-colors ${k.isActive ? 'hover:bg-white/2' : 'opacity-50'}`}>
                  <td className="px-5 py-3.5 font-medium text-zinc-300">{k.name}</td>
                  <td className="px-5 py-3.5">
                    <code className="text-xs text-zinc-500 font-mono">{k.maskedKey}</code>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600 text-xs">{formatDate(k.createdAt)}</td>
                  <td className="px-5 py-3.5 text-zinc-600 text-xs">{timeAgo(k.lastUsed)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        k.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      {k.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {k.isActive && (
                      revokeId === k.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => revokeKey(k.id)}
                            disabled={revoking === k.id}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            {revoking === k.id ? 'Revoking…' : 'Confirm'}
                          </button>
                          <button onClick={() => setRevokeId(null)} className="text-xs text-zinc-600 hover:text-zinc-400">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevokeId(k.id)}
                          className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          Revoke
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create key modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] p-6 space-y-5" style={{ background: '#0a0a0a' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">Create API key</h2>
              <button onClick={closeModal} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {newKey ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Key created — copy it now
                  </div>
                  <p className="text-xs text-zinc-500">This key will only be shown once and cannot be retrieved later.</p>
                  <code className="block text-xs text-zinc-200 font-mono bg-black/40 rounded-lg px-3 py-2 break-all border border-zinc-800">
                    {newKey}
                  </code>
                  <button
                    onClick={copyNewKey}
                    className="w-full py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all"
                  >
                    {copied ? '✓ Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800"
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
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createKey}
                    disabled={creating || !keyName.trim()}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
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
