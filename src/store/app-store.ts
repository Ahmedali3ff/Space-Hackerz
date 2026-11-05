// src/store/app-store.ts
// Zustand store for application-level UI state.
// Tracks loading, global errors, and panel visibility.

import { create } from 'zustand'

// ── State shape ──────────────────────────────────────────────────────────────

interface AppState {
  readonly isLoading: boolean
  readonly globalError: string | null
  readonly astroAIPanelOpen: boolean
}

// ── Actions shape ────────────────────────────────────────────────────────────

interface AppActions {
  setLoading: (loading: boolean) => void
  setGlobalError: (message: string) => void
  clearError: () => void
  toggleAstroAIPanel: () => void
  openAstroAIPanel: () => void
  closeAstroAIPanel: () => void
}

type AppStore = AppState & AppActions

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()((set, get) => ({
  isLoading: false,
  globalError: null,
  astroAIPanelOpen: false,

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
}))
