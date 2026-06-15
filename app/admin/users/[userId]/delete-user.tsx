'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteUser({ userId, email }: { userId: string; email: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const res = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        router.push('/admin/users')
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-400">Type the email to confirm: <span className="font-mono">{email}</span></p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Deleting…' : 'Confirm delete'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2 rounded-lg text-sm border border-[#2a2a2a] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
    >
      Delete user
    </button>
  )
}
