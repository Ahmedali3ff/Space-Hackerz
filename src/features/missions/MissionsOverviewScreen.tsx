// src/features/missions/MissionsOverviewScreen.tsx
// Mission Hub — Space+ light layout showing 6 mission cards with progression.
// Complete = teal checkmark overlay. Active = teal border + Start Mission button.
// Locked = greyed out with Lock icon.

import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, Rocket, Star } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { StarScore } from '@/components/common/StarScore'
import { UserChip } from '@/components/common/UserChip'
import { StatusDot } from '@/components/common/StatusDot'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { MissionStatus } from '@data/missions/mission-progress'

interface MissionsOverviewScreenProps {}

// ── Difficulty dots ────────────────────────────────────────────────────────────

const DIFFICULTY_COUNT: Readonly<Record<MissionDefinition['difficulty'], number>> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

interface DifficultyDotsProps {
  readonly difficulty: MissionDefinition['difficulty']
}

function DifficultyDots({ difficulty }: DifficultyDotsProps): JSX.Element {
  const count = DIFFICULTY_COUNT[difficulty]
  const total = 3

  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty: ${difficulty}`}>
      {Array.from({ length: total }).map((_, i) => (
        <StatusDot
          key={i}
          status={i < count ? 'good' : 'locked'}
          label=""
          size="sm"
        />
      ))}
      <span className="ml-1 text-xs text-spaceplus-text-secondary capitalize">{difficulty}</span>
    </div>
  )
}

// ── Mission card ───────────────────────────────────────────────────────────────

interface MissionCardProps {
  readonly mission: MissionDefinition
  readonly status: MissionStatus
  readonly onStart: (missionId: string) => void
}

function MissionCard({ mission, status, onStart }: MissionCardProps): JSX.Element {
  const isLocked = status === 'locked'
  const isComplete = status === 'completed'
  const isActive = status === 'active'

  const planetBadgeClass = mission.planet === 'moon' ? 'sp-badge-teal' : 'sp-badge-amber'
  const planetLabel = mission.planet === 'moon' ? 'Moon' : 'Mars'

  return (
    <div className="relative">
      <Card
        accent={isActive ? 'teal' : 'none'}
        className={`${isLocked ? 'opacity-60' : ''} ${isActive ? 'shadow-cardHover' : ''}`}
      >
        {/* Complete overlay badge */}
        {isComplete && (
          <div
            className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-spaceplus-status-successBg px-2 py-1"
            aria-label="Mission complete"
          >
            <CheckCircle size={16} weight="fill" className="text-spaceplus-status-success" />
            <span className="text-xs font-bold text-spaceplus-status-success">Done</span>
          </div>
        )}

        {/* Locked indicator */}
        {isLocked && (
          <div className="absolute right-4 top-4" aria-label="Mission locked">
            <Lock size={18} className="text-spaceplus-text-muted" />
          </div>
        )}

        {/* Mission number badge */}
        <div className="mb-3 flex items-center gap-2">
          <span className="sp-badge-teal">{String(mission.number).padStart(2, '0')}</span>
          <span className={planetBadgeClass}>{planetLabel}</span>
        </div>

        {/* Title */}
        <h3 className={`font-display2 text-base font-bold mb-1 ${isLocked ? 'text-spaceplus-text-muted' : 'text-spaceplus-text-heading'}`}>
          {mission.title}
        </h3>
        <p className={`text-xs mb-3 ${isLocked ? 'text-spaceplus-text-muted' : 'text-spaceplus-text-secondary'}`}>
          {mission.subtitle}
        </p>

        {/* Difficulty + task count */}
        <div className="flex items-center justify-between mb-3">
          <DifficultyDots difficulty={mission.difficulty} />
          <span className="text-xs text-spaceplus-text-muted">{mission.tasks.length} tasks</span>
        </div>

        {/* Star reward */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: mission.rewards.stars }).map((_, i) => (
            <Star key={i} size={14} weight="fill" color="#FFB300" aria-hidden="true" />
          ))}
          <span className="text-xs text-spaceplus-text-muted ml-1">
            {mission.rewards.stars} star{mission.rewards.stars !== 1 ? 's' : ''} reward
          </span>
        </div>

        {/* Action */}
        {isActive && (
          <PrimaryButton
            variant="hint"
            size="md"
            onClick={() => { onStart(mission.id) }}
            ariaLabel={`Start mission: ${mission.title}`}
          >
            <Rocket size={16} aria-hidden="true" />
            Start Mission
          </PrimaryButton>
        )}

        {isLocked && (
          <p className="text-xs text-spaceplus-text-muted">
            Complete previous mission to unlock
          </p>
        )}

        {isComplete && (
          <div className="flex items-center gap-1 text-xs text-spaceplus-status-success">
            <CheckCircle size={14} weight="fill" />
            <span>Mission Complete — {mission.rewards.badge}</span>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export function MissionsOverviewScreen(_props: MissionsOverviewScreenProps): JSX.Element {
  const navigate = useNavigate()
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const commanderTitle = useMissionProgressStore((s) => s.commanderTitle)
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const startMission = useMissionProgressStore((s) => s.startMission)

  function handleStartMission(missionId: string): void {
    startMission(missionId)
    navigate('/select-planet')
  }

  const displayName = commanderName.trim().length > 0 ? commanderName : 'Commander'

  return (
    <AppShell title="Mission Control Academy" variant="light">
      <ScreenTransition routeKey="/missions">
        <div className="min-h-screen px-6 py-10">
          {/* ── Header ── */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SectionLabel className="block mb-1">Your Cosmic Journey</SectionLabel>
              <h1 className="font-display2 text-3xl font-extrabold text-spaceplus-text-heading sm:text-4xl">
                Mission Control Academy
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <StarScore score={totalStars} size="md" />
              {commanderName.trim().length > 0 && (
                <UserChip name={displayName} level={currentLevel} levelTitle={commanderTitle} size="md" />
              )}
            </div>
          </div>

          {/* ── Mission grid ── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((mission) => {
              const status = getMissionStatus(mission.id)
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  status={status}
                  onStart={handleStartMission}
                />
              )
            })}
          </div>

          {/* ── Footer actions ── */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/star-map')}
              ariaLabel="View Star Map"
            >
              🗺 View Star Map →
            </PrimaryButton>
            <PrimaryButton
              variant="ghost"
              size="md"
              onClick={() => navigate('/')}
              ariaLabel="Back to home"
            >
              Back to Home
            </PrimaryButton>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
