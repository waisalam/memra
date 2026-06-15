'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 10000, suffix: '+', label: 'memories stored', sublabel: 'and counting' },
  { value: 50, suffix: 'ms', label: 'avg latency', sublabel: 'semantic search' },
  { value: 99.9, suffix: '%', label: 'uptime', sublabel: 'SLA guaranteed' },
  { value: 2, suffix: ' lines', label: 'to integrate', sublabel: 'seriously, that\'s it' },
]

function CountUp({ to, suffix, started }: { to: number; suffix: string; started: boolean }) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!started) return
    const dur = 1400
    const start = performance.now()
    function step(now: number) {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setVal(Number((ease * to).toFixed(to % 1 !== 0 ? 1 : 0)))
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [started, to])

  return <>{val.toLocaleString()}{suffix}</>
}

export function Stats() {
  const ref = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-20 px-6 border-y border-[#1a1a1a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center space-y-1">
            <div className="text-4xl font-black"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <CountUp to={s.value} suffix={s.suffix} started={started} />
            </div>
            <p className="text-zinc-300 text-sm font-medium">{s.label}</p>
            <p className="text-zinc-700 text-xs">{s.sublabel}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
