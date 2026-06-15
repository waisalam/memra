'use client'

import { useEffect, useRef, useState } from 'react'

export function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(ease * to))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [to, duration])

  return <>{value.toLocaleString()}</>
}
