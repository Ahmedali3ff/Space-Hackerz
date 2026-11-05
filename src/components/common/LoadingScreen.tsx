// src/components/common/LoadingScreen.tsx
// Branded Suspense fallback — shown while lazy-loaded routes are loading.
// Respects prefers-reduced-motion: spinner is static when reduced motion is on.

import { useEffect, useState } from 'react'

function useReducedMotionMediaQuery(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent): void => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

export function LoadingScreen(): JSX.Element {
  const reducedMotion = useReducedMotionMediaQuery()

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-space-void"
      role="status"
    >
      {/* ASTRA wordmark */}
      <span
        className="font-display text-5xl font-bold tracking-widest text-accent-orbit"
        aria-hidden="true"
      >
        ASTRA
      </span>

      {/* Animated ring — static when reducedMotion */}
      <div className="mt-8" aria-hidden="true">
        {reducedMotion ? (
          <div className="h-10 w-10 rounded-full border-2 border-accent-orbit opacity-60" />
        ) : (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border-subtle border-t-accent-orbit" />
        )}
      </div>

      {/* Screen-reader text */}
      <span className="sr-only">Loading mission data...</span>
    </div>
  )
}
