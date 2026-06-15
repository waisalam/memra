'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabsCtx { active: string; setActive: (id: string) => void }
const TabsContext = createContext<TabsCtx>({ active: '', setActive: () => {} })

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-lg bg-[#111111] border border-[#1e1e1e] mb-4">
      {children}
    </div>
  )
}

export function Tab({ id, label }: { id: string; label: string }) {
  const { active, setActive } = useContext(TabsContext)
  const on = active === id
  return (
    <button
      onClick={() => setActive(id)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
        on ? 'bg-[#1e1e1e] text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}

export function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useContext(TabsContext)
  if (active !== id) return null
  return <div>{children}</div>
}
