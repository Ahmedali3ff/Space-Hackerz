// src/data/missions/mission-progress.ts
// Type definitions for mission progress state — NO store logic here.
// Used by mission-progress-store.ts and any component that reads progress.

// ── Status literal ────────────────────────────────────────────────────────────

export type MissionStatus = 'locked' | 'active' | 'completed'

// ── Progress shape ────────────────────────────────────────────────────────────

export interface MissionProgress {
  readonly missionId: string
  readonly status: MissionStatus
  readonly completedTaskIds: readonly string[]
  readonly earnedStars: number
  /** ISO-8601 date string set when the mission is completed */
  readonly completedAt?: string
}
