// src/components/layout/ScreenTransition.tsx
// Wraps each routed screen in a framer-motion AnimatePresence.
// Uses fade + slight scale (0.98 → 1) on enter/exit.
// When reducedMotion is true the animation collapses to an instant cross-fade
// (no scale, duration 0.01s) so content is never hidden.

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ScreenTransitionProps {
  readonly children: ReactNode
  readonly routeKey: string
}

export function ScreenTransition({
  children,
  routeKey,
}: ScreenTransitionProps): JSX.Element {
  const { reducedMotion } = useReducedMotion()

  const variants = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
      }

  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.25, ease: 'easeInOut' }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={transition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
