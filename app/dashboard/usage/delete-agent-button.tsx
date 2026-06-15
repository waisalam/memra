'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteAgentButton({ agentId, count }: { agentId: string; count: number }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleDelete() {
    startTransition(async () => {
      try {
        await fetch('/api/memory/delete-agent', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        })
        setConfirming(false)
        router.refresh()
      } catch {
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Delete {count} memories?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-[11px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[11px] px-2.5 py-1 rounded border border-[#2a2a2a] text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-colors"
    >
      Delete memories
    </button>
  )
}
