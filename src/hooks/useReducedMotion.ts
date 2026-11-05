// src/hooks/useReducedMotion.ts
// The single source of truth for reduce-motion across the UI and (later) 3D.
// Detects the OS preference on mount, lets the player override it via a HUD
// toggle, and persists the choice to localStorage + an html dataset flag the
// CSS reduced-motion block reads from. SSR/jsdom-safe (jsdom has no matchMedia).

import { useEffect, useCallback } from 'react'
import { useAppStore } from '@store/app-store'

const STORAGE_KEY = 'spaceplus-reduce-motion'

export interface ReducedMotionApi {
  readonly reducedMotion: boolean
  readonly toggleReducedMotion: () => void
}

/**
 * Read the persisted preference, falling back to the OS preference, falling
 * back to false. All window/localStorage access is guarded.
 */
function readInitialPreference(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
  } catch {
    // localStorage may be blocked (private mode) — fall through to OS query.
  }
  // No persisted choice: honour the OS setting if available.
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

/**
 * Apply the flag everywhere it needs to be observed: the store (UI reads it),
 * the html dataset (CSS reduced-motion block reads it), and localStorage.
 */
function applyPreference(value: boolean): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.reduceMotion = value ? 'true' : ''
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Persisting is best-effort; the in-session flag still works.
    }
  }
}

export function useReducedMotion(): ReducedMotionApi {
  const reducedMotion = useAppStore((s) => s.reducedMotion)
  const setReducedMotion = useAppStore((s) => s.setReducedMotion)

  // Detect once on mount. Does NOT call matchMedia at module load (jsdom-safe).
  useEffect(() => {
    const detected = readInitialPreference()
    setReducedMotion(detected)
    applyPreference(detected)
    // setReducedMotion is stable for the life of the store; this runs once.
  }, [setReducedMotion])

  const toggleReducedMotion = useCallback((): void => {
    const next = !useAppStore.getState().reducedMotion
    setReducedMotion(next)
    applyPreference(next)
  }, [setReducedMotion])

  return { reducedMotion, toggleReducedMotion }
}
