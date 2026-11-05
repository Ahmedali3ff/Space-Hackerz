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

export interface MissionProgressRecord {
  player_id: string
  mission_id: string
  status: string
  tasks_complete: string
  stars_earned: number
  completed_at: string | null
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
