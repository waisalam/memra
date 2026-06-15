'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function ContactStatusChanger({ contactId, currentStatus }: { contactId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function save(newStatus: string) {
    setStatus(newStatus)
    startTransition(async () => {
      await fetch('/api/admin/contacts/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, status: newStatus }),
      })
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      {['new', 'contacted', 'closed'].map((s) => (
        <button
          key={s}
          onClick={() => save(s)}
          disabled={isPending || status === s}
          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors capitalize disabled:opacity-50 ${
            status === s
              ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
              : 'border-[#2a2a2a] text-zinc-600 hover:text-zinc-300 hover:border-[#3a3a3a]'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
