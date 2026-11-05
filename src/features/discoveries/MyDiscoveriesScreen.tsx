// src/features/discoveries/MyDiscoveriesScreen.tsx
// Space+ "My Discoveries" screen — shows science facts learned from each
// completed mission. Locked missions display a greyed-out placeholder.

import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { MissionStatus } from '@data/missions/mission-progress'

// ── Science facts derived from mission data ───────────────────────────────────

// Three educational bullet points extracted from each mission's description,
// objectives, and task descriptions.
const MISSION_FACTS: Readonly<Record<string, readonly string[]>> = {
  m01: [
    'The Moon has no atmosphere, so life-support systems must supply every breath of oxygen.',
    'Lunar surface temperatures swing from +127 °C in sunlight to −173 °C in shadow.',
    'Astronauts must carefully manage water and food — every gram counts on the Moon.',
  ],
  m02: [
    'Oxygen recyclers convert CO₂ back into breathable air, extending mission life.',
    'A single lunar day lasts about 29.5 Earth days, giving long periods of sunlight for solar panels.',
    'Keeping oxygen above 50% reserves ensures the crew can survive unexpected events.',
  ],
  m03: [
    'Lunar night lasts approximately 14 Earth days — solar panels produce zero power during this time.',
    'Batteries store energy during the lunar day to keep the habitat alive through the night.',
    'Emergency rations are pre-packed calorie-dense food packs designed for survival situations.',
  ],
  m04: [
    'Mars has a thin atmosphere mostly made of CO₂ — humans cannot breathe it directly.',
    'A Martian day (sol) is 24 hours and 37 minutes — only slightly longer than an Earth day.',
    'Dust storms on Mars can reduce sunlight by up to 99%, starving solar panels of energy.',
  ],
  m05: [
    'Mars gravity is 38% of Earth\'s — meaning a 60 kg person would weigh only about 23 kg on Mars.',
    'Martian temperatures can drop to −80 °C at night, requiring powerful heating systems.',
    'Managing multiple crises at once is the hallmark of a skilled mission commander.',
  ],
  m06: [
    'A 90-sol Mars mission covers nearly three Earth months of continuous survival.',
    'High mission scores require balancing resource efficiency with crew safety decisions.',
    'Mars pioneers will one day grow food in pressurised greenhouses using Martian soil.',
  ],
}

// ── Star row ──────────────────────────────────────────────────────────────────

interface StarRowProps {
  readonly earned: number
  readonly max: number
}

function StarRow({ earned, max }: StarRowProps): JSX.Element {
  return (
    <div className="flex items-center gap-1" aria-label={`${earned} of ${max} stars earned`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-base ${i < earned ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ── Discovery card ────────────────────────────────────────────────────────────

interface DiscoveryCardProps {
  readonly mission: MissionDefinition
  readonly status: MissionStatus
  readonly earnedStars: number
}

function DiscoveryCard({ mission, status, earnedStars }: DiscoveryCardProps): JSX.Element {
  const isLocked = status === 'locked'
  const facts = MISSION_FACTS[mission.id] ?? []
  const planetEmoji = mission.planet === 'moon' ? '🌕' : '🔴'

  if (isLocked) {
    return (
      <div className="relative opacity-50" aria-label={`Mission ${mission.number} locked`}>
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex items-center justify-center text-xl">
              🔒
            </div>
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-0.5">
                Mission {mission.number}
              </p>
              <h3 className="font-bold text-base text-[#9CA3AF]">{mission.title}</h3>
            </div>
          </div>
          <p className="text-sm text-[#9CA3AF] italic">
            Complete previous missions to unlock discoveries.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <Card accent="teal">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Planet sphere */}
        <div
          className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-2xl ${
            mission.planet === 'moon'
              ? 'bg-gradient-to-br from-[#D1D5DB] to-[#9CA3AF]'
              : 'bg-gradient-to-br from-[#F87171] to-[#B45309]'
          }`}
          aria-hidden="true"
        >
          {planetEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-0.5">
            Mission {mission.number}
          </p>
          <h3 className="font-bold text-base text-[#1A1D2E] leading-tight">{mission.title}</h3>
        </div>
        {/* Complete badge */}
        {status === 'completed' && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded-full">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Stars */}
      <div className="mb-4">
        <StarRow earned={earnedStars} max={mission.rewards.stars} />
      </div>

      {/* Science facts */}
      <div>
        <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-2">
          What You Learned
        </p>
        <ul className="space-y-2">
          {facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#E8FAF9] flex items-center justify-center text-[#1FC8C0] text-xs font-bold">
                {i + 1}
              </span>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

interface MyDiscoveriesScreenProps {}

export function MyDiscoveriesScreen(_props: MyDiscoveriesScreenProps): JSX.Element {
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const missions = useMissionProgressStore((s) => s.missions)

  return (
    <AppShell title="My Discoveries">
      <ScreenTransition routeKey="/discoveries">
        <div className="min-h-screen px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <SectionLabel className="block mb-1">Science Journal</SectionLabel>
            <h1 className="font-display2 text-3xl font-extrabold text-[#1A1D2E] sm:text-4xl">
              My Discoveries
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              What you have learned on your missions
            </p>
          </div>

          {/* Discovery cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((mission) => {
              const status = getMissionStatus(mission.id)
              const progress = missions[mission.id]
              const earnedStars = progress?.earnedStars ?? 0

              return (
                <DiscoveryCard
                  key={mission.id}
                  mission={mission}
                  status={status}
                  earnedStars={earnedStars}
                />
              )
            })}
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
