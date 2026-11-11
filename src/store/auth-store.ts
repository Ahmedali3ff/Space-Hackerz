import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocalAccount { readonly username: string; readonly password: string }
interface AuthState {
  readonly currentUser: string | null
  readonly accounts: readonly LocalAccount[]
  signIn: (username: string, password: string) => boolean
  register: (username: string, password: string) => boolean
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  currentUser: null,
  accounts: [],
  signIn: (username, password) => {
    const normalized = username.trim().toLowerCase()
    const match = get().accounts.find((account) => account.username === normalized && account.password === password)
    if (!match) return false
    set({ currentUser: match.username })
    return true
  },
  register: (username, password) => {
    const normalized = username.trim().toLowerCase()
    if (normalized.length < 3 || password.length < 4 || get().accounts.some((account) => account.username === normalized)) return false
    set((state) => ({ accounts: [...state.accounts, { username: normalized, password }], currentUser: normalized }))
    return true
  },
  signOut: () => set({ currentUser: null }),
}), { name: 'space-hackerz-auth' }))
