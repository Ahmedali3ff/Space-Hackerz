// src/features/game/GameplayScreen.tsx
// 2.5D interactive gameplay screen — the heart of the campaign experience.
// Uses useMissionControl() for all simulation state.
// Split: RoomCard is in a separate file (RoomCard.tsx).

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PauseCircle, Lightning, Drop, Plant, BatteryFull } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'
import { getMissionById } from '@data/missions/mission-definitions'
import { getAudioManager } from '@/services/audio-manager'
import { RoomCard } from './RoomCard'
import type { RoomCardProps } from './RoomCard'

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameplayScreenProps {
  // intentionally empty — reads from URL params
}

// ── Room definitions ──────────────────────────────────────────────────────────

interface RoomDef {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly resourceKey: 'oxygen_kg' | 'water_kg' | 'food_kg' | 'energy_kWh'
  readonly tip: string
}

const ROOM_DEFS: readonly RoomDef[] = [
  {
    id: 'command',
    name: 'Command Center',
    icon: '🖥️',
    resourceKey: 'energy_kWh',
    tip: 'The command center monitors all systems. Keep power high to maintain communications.',
  },
  {
    id: 'life-support',
    name: 'Life Support Bay',
    icon: '🫧',
    resourceKey: 'oxygen_kg',
    tip: 'Life support recycles CO₂ into oxygen. Watch the oxygen levels carefully!',
  },
  {
    id: 'agriculture',
    name: 'Agriculture Module',
    icon: '🌱',
    resourceKey: 'food_kg',
    tip: 'Growing food in space uses LED lights and carefully controlled nutrients.',
  },
]

// ── Resource threshold helper ─────────────────────────────────────────────────

function getStatusColor(
  value: number,
  max: number,
): RoomCardProps['statusColor'] {
  const pct = max > 0 ? value / max : 0
  if (pct > 0.5) return 'good'
  if (pct > 0.2) return 'warn'
  if (pct > 0) return 'crit'
  return 'neutral'
}

// ── HudBar sub-component ──────────────────────────────────────────────────────

interface HudBarProps {
  readonly day: number
  readonly totalDays: number
  readonly resources: {
    readonly oxygen_kg: number
    readonly water_kg: number
    readonly food_kg: number
    readonly energy_kWh: number
  }
  readonly initialResources: {
    readonly oxygen_kg: number
    readonly water_kg: number
    readonly food_kg: number
    readonly energy_kWh: number
  }
  readonly onPause: () => void
  readonly onAdvance: () => void
}

function HudBar({ day, totalDays, resources, initialResources, onPause, onAdvance }: HudBarProps): JSX.Element {
  const bars: Array<{ icon: JSX.Element; value: number; max: number; color: string; label: string }> = [
    { icon: <Lightning size={12} weight="fill" />, value: resources.energy_kWh, max: initialResources.energy_kWh, color: '#F5A623', label: 'Power' },
    { icon: <Drop size={12} weight="fill" />, value: resources.oxygen_kg, max: initialResources.oxygen_kg, color: '#1FC8C0', label: 'O₂' },
    { icon: <Drop size={12} weight="fill" />, value: resources.water_kg, max: initialResources.water_kg, color: '#38BDF8', label: 'H₂O' },
    { icon: <Plant size={12} weight="fill" />, value: resources.food_kg, max: initialResources.food_kg, color: '#10B981', label: 'Food' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0A0E1A]/90 backdrop-blur-sm border-b border-[#7C3AED]/30 px-3 py-2">
      <div className="flex items-center gap-3">
        {/* Day counter */}
        <div className="flex-shrink-0 text-center">
          <p className="text-[9px] uppercase tracking-widest text-[#C4B5FD]">Day</p>
          <p className="text-lg font-black text-white leading-none">{day}</p>
          <p className="text-[9px] text-[#C4B5FD]">/ {totalDays}</p>
        </div>

        {/* Resource mini-bars */}
        <div className="flex-1 grid grid-cols-4 gap-1.5">
          {bars.map((bar) => {
            const pct = bar.max > 0 ? Math.min(1, bar.value / bar.max) : 0
            return (
              <div key={bar.label} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <span style={{ color: bar.color }}>{bar.icon}</span>
                  <span className="text-[9px] text-[#C4B5FD] font-semibold">{bar.label}</span>
                </div>
                <div className="h-1.5 bg-[#1a1a3a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct * 100}%`, backgroundColor: bar.color }}
                  />
                </div>
                <span className="text-[8px] text-[#C4B5FD] tabular-nums">
                  {Math.round(bar.value)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={onPause}
            aria-label="Pause"
            className="text-[#C4B5FD] hover:text-white transition-colors"
          >
            <PauseCircle size={22} />
          </button>
          <button
            onClick={onAdvance}
            aria-label="Advance Day"
            className="game-btn-primary text-[9px] px-2 py-1 rounded-lg"
          >
            <BatteryFull size={12} />
          </button>
        </div>
      </div>
    </header>
  )
}

// ── EventAlertBanner sub-component ───────────────────────────────────────────

interface EventAlertBannerProps {
  readonly eventId: string
  readonly missionId: string
}

function EventAlertBanner({ eventId, missionId }: EventAlertBannerProps): JSX.Element {
  const navigate = useNavigate()
  return (
    <div
      role="alert"
      className="mx-4 mb-3 flex items-center justify-between gap-3 bg-[#EF4444]/15 border border-[#EF4444] rounded-xl px-4 py-2.5 animate-pulse"
    >
      <span className="text-sm font-bold text-[#EF4444]">⚠️ ALERT: Event Requires Attention!</span>
      <button
        onClick={() => navigate(`/game/event/${missionId}/${eventId}`)}
        className="text-xs font-bold text-white bg-[#EF4444] px-3 py-1 rounded-lg hover:bg-[#DC2626] transition-colors"
      >
        Respond Now
      </button>
    </div>
  )
}

// ── SidePanel sub-component ───────────────────────────────────────────────────

interface SidePanelProps {
  readonly selectedRoomId: string | null
  readonly tasks: ReadonlyArray<{ readonly id: string; readonly label: string }>
  readonly completedTaskIds: readonly string[]
  readonly planetType: 'moon' | 'mars'
  readonly missionDay: number
}

function SidePanel({ selectedRoomId, tasks, completedTaskIds, planetType, missionDay }: SidePanelProps): JSX.Element {
  const room = ROOM_DEFS.find((r) => r.id === selectedRoomId)
  const astroTip =
    planetType === 'moon'
      ? `Day ${missionDay}: On the Moon, power management is key during the 14-day lunar night. Keep batteries charged!`
      : `Day ${missionDay}: Mars dust storms can reduce solar power by up to 99%. Always maintain backup energy reserves.`

  return (
    <aside className="flex flex-col gap-3">
      {/* Room inspect panel */}
      {room && (
        <div className="game-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-1">
            Inspecting
          </p>
          <p className="text-sm font-bold text-white mb-1">
            {room.icon} {room.name}
          </p>
          <p className="text-xs text-[#C4B5FD] leading-relaxed">{room.tip}</p>
        </div>
      )}

      {/* Mission tasks checklist */}
      <div className="game-card p-3">
        <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-2">
          Mission Tasks
        </p>
        <ul className="space-y-1.5">
          {tasks.map((task) => {
            const done = completedTaskIds.includes(task.id)
            return (
              <li key={task.id} className="flex items-center gap-2">
                <span className={done ? 'text-[#10B981]' : 'text-[#C4B5FD]'}>
                  {done ? '✅' : '⬜'}
                </span>
                <span
                  className={`text-xs ${done ? 'text-[#10B981] line-through' : 'text-white'}`}
                >
                  {task.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Astro-AI hint */}
      <div className="bg-[#1FC8C0]/10 border border-[#1FC8C0]/30 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-1">
          🤖 Astro-AI
        </p>
        <p className="text-xs text-white leading-relaxed">{astroTip}</p>
      </div>
    </aside>
  )
}

// ── BottomActionBar sub-component ─────────────────────────────────────────────

interface BottomActionBarProps {
  readonly onAdvanceDay: () => void
  readonly onEmergencyRation: () => void
  readonly onEndMission: () => void
}

function BottomActionBar({ onAdvanceDay, onEmergencyRation, onEndMission }: BottomActionBarProps): JSX.Element {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0E1A]/90 backdrop-blur-sm border-t border-[#7C3AED]/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <button onClick={onAdvanceDay} className="game-btn-primary flex-1 text-sm">
          ⏭️ Advance Day
        </button>
        <button
          onClick={onEmergencyRation}
          className="game-btn-teal px-3 py-3 text-xs font-bold"
          title="Emergency Ration — halve food consumption"
        >
          🍱 Ration
        </button>
        <button
          onClick={onEndMission}
          className="text-xs text-[#C4B5FD] hover:text-white px-3 py-3 transition-colors"
        >
          End
        </button>
      </div>
    </footer>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function GameplayScreen(_props: GameplayScreenProps): JSX.Element {
  const { missionId } = useParams<{ missionId: string }>()
  const navigate = useNavigate()

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const {
    missionStarted,
    currentResources,
    currentMissionDay,
    activeEventIds,
    missionOutcome,
    missionDurationDays,
    selectedPlanetId,
    initializeMission,
    advanceDay,
    emergencyRation,
    endMission,
  } = useMissionControl()

  const initialResources = useMissionStore((s) => s.initialResources)

  const mission = missionId ? getMissionById(missionId) : undefined
  const completedTaskIds = useMissionProgressStore(
    (s) => s.missions[missionId ?? '']?.completedTaskIds ?? [],
  )

  // Initialize mission on mount if not started
  useEffect(() => {
    if (!missionStarted) {
      initializeMission()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to mission outcome
  useEffect(() => {
    if (missionOutcome === 'success') {
      getAudioManager().playSound('level_complete')
      navigate(`/game/level-complete/${missionId}`)
    } else if (missionOutcome === 'failure') {
      getAudioManager().playSound('game_over')
      navigate('/game/game-over')
    }
  }, [missionOutcome, navigate, missionId])

  function handleAdvanceDay(): void {
    getAudioManager().playSound('day_advance')
    advanceDay()
  }

  function handleEmergencyRation(): void {
    getAudioManager().playSound('click')
    emergencyRation()
  }

  function handleEndMission(): void {
    endMission()
    navigate('/debrief')
  }

  const resources = currentResources ?? {
    oxygen_kg: 0,
    water_kg: 0,
    food_kg: 0,
    energy_kWh: 0,
    cumulativeRadiation_mSv: 0,
  }

  const initRes = initialResources ?? {
    oxygen_kg: 100,
    water_kg: 100,
    food_kg: 100,
    energy_kWh: 100,
    cumulativeRadiation_mSv: 0,
  }

  const tasks = mission?.tasks ?? []
  const planetType: 'moon' | 'mars' = selectedPlanetId === 'mars' ? 'mars' : 'moon'

  return (
    <div className="game-bg min-h-screen">
      {/* Star field */}
      <div className="star-field" aria-hidden="true" />

      {/* Fixed HUD */}
      <HudBar
        day={currentMissionDay}
        totalDays={missionDurationDays}
        resources={resources}
        initialResources={initRes}
        onPause={() => navigate(`/game/pause/${missionId ?? ''}`)}
        onAdvance={handleAdvanceDay}
      />

      {/* Main scrollable content — pad for fixed header + footer */}
      <main className="relative z-10 pt-24 pb-24 px-4">
        {/* Mission title */}
        {mission && (
          <p className="text-xs text-[#C4B5FD] mb-3 font-semibold">
            {mission.planet === 'moon' ? '🌙' : '🔴'} {mission.title}
          </p>
        )}

        {/* Active event alert */}
        {activeEventIds.length > 0 && missionId && (
          <EventAlertBanner eventId={activeEventIds[0]} missionId={missionId} />
        )}

        {/* Two-column layout: rooms + side panel */}
        <div className="grid grid-cols-3 gap-3">
          {/* Room grid (2 cols) */}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {ROOM_DEFS.map((room) => {
              const value = resources[room.resourceKey]
              const max = initRes[room.resourceKey]
              const statusColor = getStatusColor(value, max)
              return (
                <RoomCard
                  key={room.id}
                  roomId={room.id}
                  name={room.name}
                  icon={room.icon}
                  statusColor={statusColor}
                  isSelected={selectedRoomId === room.id}
                  onClick={() => {
                    setSelectedRoomId(room.id === selectedRoomId ? null : room.id)
                    getAudioManager().playSound('click')
                  }}
                />
              )
            })}
          </div>

          {/* Side panel */}
          <SidePanel
            selectedRoomId={selectedRoomId}
            tasks={tasks}
            completedTaskIds={completedTaskIds}
            planetType={planetType}
            missionDay={currentMissionDay}
          />
        </div>
      </main>

      {/* Fixed bottom action bar */}
      <BottomActionBar
        onAdvanceDay={handleAdvanceDay}
        onEmergencyRation={handleEmergencyRation}
        onEndMission={handleEndMission}
      />
    </div>
  )
}
