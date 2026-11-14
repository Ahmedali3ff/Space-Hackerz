// src/services/api-client.ts
// Thin HTTP client for the Space+ Express/SQLite backend.
// All calls are fire-and-forget safe — they return null on any error so the
// app works fully offline without throwing.

// ── Shared types (mirrored from server/types/api.types.ts) ───────────────────
// Kept here so Vite never needs to bundle server-side modules.

export interface PlayerRecord {
  id: string
  name: string
  total_xp: number
  current_level: number
  commander_title: string
  total_stars: number
  created_at: string
  updated_at: string
}

export interface XPResult {
  newXP: number
  newLevel: number
  leveledUp: boolean
  newTitle: string
}

export interface MissionProgressPayload {
  playerId: string
  missionId: string
  status: string
  tasksComplete: string[]
  starsEarned: number
  completedAt: string | null
}

export interface MissionRunPayload {
  id: string
  playerId: string
  missionId: string
  planetId: string
  crewSize: number
  missionDurationDays: number
  daysSurvived: number
  finalScore: number
  starsEarned: number
  outcome: string
  eventsResolved: number
}

export interface LeaderboardEntry {
  player_id: string
  name: string
  total_stars: number
  current_level: number
  commander_title: string
}
export interface AuthResponse { token: string; account: { id: string; player: PlayerRecord | null } }

// ── Base URL ──────────────────────────────────────────────────────────────────

const BASE =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ??
  ((import.meta as { env?: { PROD?: boolean } }).env?.PROD ? '/api' : 'http://localhost:3001')

export function setAuthToken(token: string): void { localStorage.setItem('space-hackerz-auth-token', token) }
export function clearAuthToken(): void { localStorage.removeItem('space-hackerz-auth-token') }

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('space-hackerz-auth-token') ? { Authorization: `Bearer ${localStorage.getItem('space-hackerz-auth-token')}` } : {}), ...options?.headers },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    // Network error or server not running — fail silently
    return null
  }
}

// ── API client ────────────────────────────────────────────────────────────────

export const apiClient = {
  register: (data: { name: string; email: string; password: string }): Promise<AuthResponse | null> => apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }): Promise<AuthResponse | null> => apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getPlayer: (): Promise<PlayerRecord | null> =>
    apiFetch<PlayerRecord>('/api/players'),

  upsertPlayer: (name: string): Promise<PlayerRecord | null> =>
    apiFetch<PlayerRecord>('/api/players', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  addXP: (amount: number): Promise<XPResult | null> =>
    apiFetch<XPResult>('/api/players/xp', {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),

  saveMissionProgress: (data: MissionProgressPayload): Promise<unknown> =>
    apiFetch('/api/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveMissionRun: (data: MissionRunPayload): Promise<unknown> =>
    apiFetch('/api/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLeaderboard: (): Promise<LeaderboardEntry[] | null> =>
    apiFetch<LeaderboardEntry[]>('/api/scores/leaderboard'),

  getMyMissionProgress: (): Promise<Array<{ mission_id: string; status: string; tasks_complete: string; stars_earned: number; completed_at: string | null }> | null> => apiFetch('/api/missions/me'),
}
