// src/store/app-store.ts
// Zustand store for application-level UI state.
// Tracks loading, global errors, and panel visibility.

import { create } from 'zustand'

// ── State shape ──────────────────────────────────────────────────────────────

interface AppState {
  readonly isLoading: boolean
  readonly globalError: string | null
  readonly astroAIPanelOpen: boolean
  // Manual reduce-motion override (OS preference detected in useReducedMotion
  // on mount; this flag is the single source of truth for the UI/3D layer).
  readonly reducedMotion: boolean
}

// ── Actions shape ────────────────────────────────────────────────────────────

interface AppActions {
  setLoading: (loading: boolean) => void
  setGlobalError: (message: string) => void
  clearError: () => void
  toggleAstroAIPanel: () => void
  openAstroAIPanel: () => void
  closeAstroAIPanel: () => void
  setReducedMotion: (value: boolean) => void
}

type AppStore = AppState & AppActions

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()((set, get) => ({
  isLoading: false,
  globalError: null,
  astroAIPanelOpen: false,
  reducedMotion: false,

  setLoading: (loading: boolean): void => {
    set({ isLoading: loading })
  },

  setGlobalError: (message: string): void => {
    set({ globalError: message })
  },

  clearError: (): void => {
    set({ globalError: null })
  },

  toggleAstroAIPanel: (): void => {
    set({ astroAIPanelOpen: !get().astroAIPanelOpen })
  },

  openAstroAIPanel: (): void => {
    set({ astroAIPanelOpen: true })
  },

  closeAstroAIPanel: (): void => {
    set({ astroAIPanelOpen: false })
  },

  setReducedMotion: (value: boolean): void => {
    set({ reducedMotion: value })
  },
}))
