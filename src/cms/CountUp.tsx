import { useEffect, useId, useRef, useState } from 'react'

/** Metrics that already finished counting this page session — never re-animate on scroll/remount. */
const playedOnce = new Set<string>()

function splitMetric(value: string) {
  const match = value.match(/^(.*?)(\d[\d\s]*)(.*)$/)
  if (!match) return { prefix: '', amount: null as number | null, suffix: value }
  const prefix = match[1]
  const digits = match[2]
  const suffix = match[3]
  /* Ranges like 2019–2027 must stay as labels, not counters. */
  if (/\d/.test(suffix)) return { prefix: '', amount: null, suffix: value }
  const gap = /\s$/.test(digits) && suffix && !/^\s/.test(suffix) ? ' ' : ''
  return {
    prefix,
    amount: Number(digits.replace(/\s/g, '')),
    suffix: `${gap}${suffix}`,
  }
}

export function CountUp({
  value,
  className,
  fromPrevious = false,
}: {
  value: string
  className?: string
  fromPrevious?: boolean
}) {
  const { prefix, amount, suffix } = splitMetric(value)
  const finalLabel = amount == null ? value : `${prefix}${amount}${suffix}`
  const instanceId = useId()
  /* One key per instance — identical values (e.g. two “+ 300”) must not share state. */
  const key = `cu:${instanceId}:${value}`
  const alreadyDone = !fromPrevious && amount != null && playedOnce.has(key)
  const startAtFinal = alreadyDone || amount == null || fromPrevious

  const [shown, setShown] = useState(startAtFinal ? finalLabel : `${prefix}0${suffix}`)
  const ref = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)
  const currentAmount = useRef(startAtFinal && amount != null ? amount : 0)
  const lastTarget = useRef<number | null>(startAtFinal && amount != null ? amount : null)
  const localPlayed = useRef(alreadyDone)

  useEffect(() => {
    if (amount == null) {
      setShown(value)
      return
    }

    const paint = (next: number) => {
      currentAmount.current = next
      setShown(`${prefix}${next}${suffix}`)
    }

    /* Already counted this session — keep the final figure, never restart. */
    if (!fromPrevious && (localPlayed.current || playedOnce.has(key))) {
      localPlayed.current = true
      playedOnce.add(key)
      paint(amount)
      return
    }

    const node = ref.current
    if (!node) {
      paint(amount)
      playedOnce.add(key)
      localPlayed.current = true
      return
    }

    const cancel = () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = 0
    }

    const run = () => {
      if (!fromPrevious) {
        if (localPlayed.current || playedOnce.has(key)) {
          paint(amount)
          return
        }
        localPlayed.current = true
        playedOnce.add(key)
      }

      cancel()

      const sameTarget = lastTarget.current === amount
      lastTarget.current = amount

      const origin = fromPrevious && sameTarget === false ? currentAmount.current : 0
      if (!fromPrevious) currentAmount.current = 0

      if (origin === amount) {
        paint(amount)
        return
      }

      const start = performance.now()
      const delta = Math.abs(amount - origin)
      const duration = Math.min(2200, 900 + Math.min(delta, 400) * 3)
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - (1 - t) ** 3
        paint(Math.round(origin + (amount - origin) * eased))
        if (t < 1) frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    }

    /* Filter totals (carte) must show the real figure immediately. Waiting on
       intersection left “0 INTERVENTIONS VISIBLES” while the list already had rows.
       Also skip the 0→N intro tween when the target has not changed — that tween
       produced garbage mid-frames (e.g. “-42”) in the a11y tree / first paint. */
    if (fromPrevious) {
      if (lastTarget.current == null || lastTarget.current === amount) {
        lastTarget.current = amount
        currentAmount.current = amount
        paint(amount)
        return
      }
      run()
      return () => cancel()
    }

    const inView = () => {
      const rect = node.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < (window.innerHeight || 0) + 120
    }

    /* If the metric is already on screen, count immediately — waiting on
       IntersectionObserver left many KPIs stuck at “0” / “+ 0”. */
    if (inView()) {
      run()
      return () => cancel()
    }

    paint(0)

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) || inView()) {
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.01, rootMargin: '160px 0px' },
    )
    observer.observe(node)

    /* Safety net: never leave a KPI stuck on 0 if the observer never fires. */
    const safety = window.setTimeout(() => {
      if (!localPlayed.current) run()
      observer.disconnect()
    }, 1600)

    return () => {
      cancel()
      observer.disconnect()
      window.clearTimeout(safety)
    }
  }, [amount, finalLabel, fromPrevious, key, prefix, suffix, value])

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  )
}
