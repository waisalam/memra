'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function PlanChanger({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const [plan, setPlan] = useState(currentPlan)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function save() {
    startTransition(async () => {
      const res = await fetch('/api/admin/users/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={plan}
        onChange={(e) => { setPlan(e.target.value); setSaved(false) }}
        className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-[#3a3a3a]"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <button
        onClick={save}
        disabled={isPending || plan === currentPlan}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 transition-colors"
      >
        {isPending ? 'Saving…' : saved ? '✓ Saved' : 'Change plan'}
      </button>
    </div>
  )
}
