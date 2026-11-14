import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppLanguage = 'en' | 'ar'
export type AppTheme = 'light' | 'dark'

interface PreferencesState {
  readonly language: AppLanguage
  readonly theme: AppTheme
  setLanguage: (language: AppLanguage) => void
  setTheme: (theme: AppTheme) => void
}

export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  language: 'en',
  theme: 'light',
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
}), { name: 'space-hackerz-preferences-v1' }))
