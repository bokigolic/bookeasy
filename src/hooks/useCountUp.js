import { useEffect, useState } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Uses cubic ease-out: cubic-bezier(0.4, 0, 0.2, 1)
 */
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return }
    if (target === 0) { setValue(0); return }

    let raf
    const startTime = performance.now()

    const update = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      // cubic-bezier(0.4, 0, 0.2, 1) approximation
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(update)
      else setValue(target)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
