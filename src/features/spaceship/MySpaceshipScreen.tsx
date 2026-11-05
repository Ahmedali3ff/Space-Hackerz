// src/features/spaceship/MySpaceshipScreen.tsx
// Space+ "My Spaceship" — Commander profile, level progress, badges,
// mission history, and stat summary. Reads all data from useMissionProgressStore.

import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { ProgressBar } from '@/components/common/ProgressBar'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { getProgressToNextLevel, LEVELS } from '@data/levels/level-definitions'
import type { MissionDefinition } from '@data/missions/mission-definitions'

// ── Stat tile ─────────────────────────────────────────────────────────────────

interface StatTileProps {
  readonly emoji: string
  readonly label: string
  readonly value: string | number
}

function StatTile({ emoji, label, value }: StatTileProps): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-[#F4F7FA] rounded-2xl">
      <span className="text-2xl mb-1" aria-hidden="true">{emoji}</span>
      <span className="text-xl font-extrabold text-[#1A1D2E]">{value}</span>
      <span className="text-xs text-[#6B7280] mt-0.5">{label}</span>
    </div>
  )
}

// ── Badge item ─────────────────────────────────────────────────────────────────

interface BadgeItemProps {
  readonly mission: MissionDefinition
  readonly earned: boolean
}

function BadgeItem({ mission, earned }: BadgeItemProps): JSX.Element {
  const planetEmoji = mission.planet === 'moon' ? '🌕' : '🔴'

  return (
    <div
      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border ${
        earned
          ? 'border-[#1FC8C0] bg-[#E8FAF9]'
          : 'border-[#E5E7EB] bg-[#F9FAFB] opacity-40'
      }`}
      aria-label={earned ? `Badge earned: ${mission.rewards.badge}` : `Badge locked: ${mission.rewards.badge}`}
    >
      <span className="text-2xl" aria-hidden="true">
        {earned ? planetEmoji : '🔒'}
      </span>
      <span className={`text-xs font-semibold text-center leading-tight ${earned ? 'text-[#1A1D2E]' : 'text-[#9CA3AF]'}`}>
        {mission.rewards.badge}
      </span>
      <span className="text-[10px] text-[#9CA3AF]">M{mission.number}</span>
    </div>
  )
}

// ── History row ────────────────────────────────────────────────────────────────

interface HistoryRowProps {
  readonly mission: MissionDefinition
  readonly earnedStars: number
  readonly completedAt?: string
}

function HistoryRow({ mission, earnedStars, completedAt }: HistoryRowProps): JSX.Element {
  const dateLabel = completedAt !== undefined
    ? new Date(completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          {mission.planet === 'moon' ? '🌕' : '🔴'}
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1A1D2E]">{mission.title}</p>
          <p className="text-xs text-[#9CA3AF]">{dateLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: mission.rewards.stars }).map((_, i) => (
          <span key={i} className={`text-sm ${i < earnedStars ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}`}>
            ★
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

interface MySpaceshipScreenProps {}

export function MySpaceshipScreen(_props: MySpaceshipScreenProps): JSX.Element {
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const commanderTitle = useMissionProgressStore((s) => s.commanderTitle)
  const totalXP = useMissionProgressStore((s) => s.totalXP)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const missions = useMissionProgressStore((s) => s.missions)
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)

  const displayName = commanderName.trim().length > 0 ? commanderName : 'Commander'

  const levelProgress = getProgressToNextLevel(totalXP)
  const isMaxLevel = currentLevel >= LEVELS.length

  // Completed missions list sorted by completedAt (most recent first)
  const completedMissions = MISSIONS.filter(
    (m) => getMissionStatus(m.id) === 'completed',
  ).sort((a, b) => {
    const aDate = missions[a.id]?.completedAt ?? ''
    const bDate = missions[b.id]?.completedAt ?? ''
    return bDate.localeCompare(aDate)
  })

  // Stats
  const missionsCompleted = completedMissions.length
  const bestScore = missionsCompleted > 0
    ? Math.max(...completedMissions.map((m) => missions[m.id]?.earnedStars ?? 0))
    : 0

  const favPlanet: string =
    completedMissions.filter((m) => m.planet === 'moon').length >=
    completedMissions.filter((m) => m.planet === 'mars').length
      ? '🌕 Moon'
      : '🔴 Mars'

  return (
    <AppShell title="My Spaceship">
      <ScreenTransition routeKey="/spaceship">
        <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <SectionLabel className="block mb-1">Commander Profile</SectionLabel>
            <h1 className="font-display2 text-3xl font-extrabold text-[#1A1D2E] sm:text-4xl">
              My Spaceship
            </h1>
          </div>

          {/* Commander card */}
          <Card className="mb-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="w-20 h-20 flex-shrink-0 rounded-full bg-[#1FC8C0] flex items-center justify-center text-4xl"
                aria-hidden="true"
              >
                🚀
              </div>
              {/* Name + level */}
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-2xl text-[#1A1D2E] truncate">{displayName}</h2>
                <div className="inline-flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8FAF9] text-[#1FC8C0] text-xs font-bold">
                    Level {currentLevel} · {commanderTitle}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">{totalXP} XP total</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mt-5">
              {isMaxLevel ? (
                <p className="text-sm font-semibold text-[#F5A623]">
                  🌟 Maximum level reached — Admiral class!
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6B7280]">
                      Progress to Level {currentLevel + 1}
                    </span>
                    <span className="text-xs font-bold text-[#1FC8C0]">
                      {levelProgress.current} / {levelProgress.required} XP
                    </span>
                  </div>
                  <ProgressBar
                    value={levelProgress.current}
                    max={levelProgress.required > 0 ? levelProgress.required : 1}
                    label={`Level ${currentLevel + 1} progress`}
                  />
                </>
              )}
            </div>
          </Card>

          {/* Stats grid */}
          <Card className="mb-6">
            <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-3">
              Mission Stats
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile emoji="⭐" label="Total Stars" value={totalStars} />
              <StatTile emoji="🚀" label="Missions Done" value={missionsCompleted} />
              <StatTile emoji="🏆" label="Best Score" value={`${bestScore}★`} />
              <StatTile emoji="🌍" label="Fav Planet" value={missionsCompleted > 0 ? favPlanet : '—'} />
            </div>
          </Card>

          {/* Badges */}
          <Card className="mb-6">
            <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-3">
              My Badges
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {MISSIONS.map((mission) => {
                const isEarned = getMissionStatus(mission.id) === 'completed'
                return (
                  <BadgeItem key={mission.id} mission={mission} earned={isEarned} />
                )
              })}
            </div>
          </Card>

          {/* Mission history */}
          <Card>
            <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-3">
              Mission History
            </p>
            {completedMissions.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-4 text-center">
                No missions completed yet. Start your first mission!
              </p>
            ) : (
              <div>
                {completedMissions.slice(0, 5).map((mission) => (
                  <HistoryRow
                    key={mission.id}
                    mission={mission}
                    earnedStars={missions[mission.id]?.earnedStars ?? 0}
                    completedAt={missions[mission.id]?.completedAt}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
