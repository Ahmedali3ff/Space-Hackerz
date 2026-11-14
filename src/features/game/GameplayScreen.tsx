// src/features/game/GameplayScreen.tsx
// V2 — React Three Fiber 3D habitat gameplay screen.
// Fully replaces the Phaser-based version. The simulation engine is untouched.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { useGameProgressStore } from '@store/game-progress-store'
import { useChallengeStore } from '@store/challenge-store'
import { getAudioManager } from '@/services/audio-manager'
import { getEventDefinition } from '@/features/events/event-registry'
import { CHALLENGES } from '@/game3d/challenges/challenge-definitions'

import { HabitatWorld } from '@/game3d/components/HabitatWorld'
import { CinematicIntro } from '@/game3d/components/CinematicIntro'
import { ResourceHUD } from './ResourceHUD'
import { TaskCorner } from './TaskCorner'
import { MissionAlertBanner } from './MissionAlertBanner'
import { ChallengeWidget } from './ChallengeWidget'
import { EventBus } from '@/game/EventBus'
import { CriticalFailureScreen } from './CriticalFailureScreen'
import { PauseMenuOverlay } from './PauseMenuOverlay'
import { MissionOperationsPanel } from './MissionOperationsPanel'
import { ACTION_BUILDINGS } from './MissionOperationsPanel'
import { useMissionOperationsStore } from '@store/mission-operations-store'
import { getMissionOperation } from '@data/missions/mission-operations'
import { getDefaultBaseConfig } from '@/utils/default-config'

// ── Building info ─────────────────────────────────────────────────────────────

interface BuildingInfo {
  readonly label: string
  readonly icon: string
  readonly resourceLabel: string
  readonly tip: string
}

const BUILDING_INFO: Readonly<Record<string, BuildingInfo>> = {
  'life-support': {
    label: 'Life Support Bay',
    icon: '🫁',
    resourceLabel: 'Oxygen',
    tip: 'Life support recycles CO₂ into breathable oxygen. Each crew member consumes ~0.84 kg of O₂ per day.',
  },
  'command-center': {
    label: 'Command Center',
    icon: '🖥️',
    resourceLabel: 'Energy',
    tip: 'The command center coordinates all habitat systems. Maintaining high energy ensures communications and control.',
  },
  'power-room': {
    label: 'Power Generator',
    icon: '⚡',
    resourceLabel: 'Energy',
    tip: 'Nuclear RTG generators provide baseload power day and night, regardless of solar conditions.',
  },
  'solar-panels': {
    label: 'Solar Array',
    icon: '☀️',
    resourceLabel: 'Energy',
    tip: 'Solar panels convert sunlight into electricity. On the Moon, panels work at ~100% efficiency in sunlight.',
  },
  'water-recycling': {
    label: 'Water Recycling',
    icon: '💧',
    resourceLabel: 'Water',
    tip: 'Water recyclers recover up to 93% of wastewater. Each crew member needs ~3 L/day to stay healthy.',
  },
  greenhouse: {
    label: 'Greenhouse',
    icon: '🌱',
    resourceLabel: 'Food',
    tip: 'Hydroponic crops grow 30% faster than on Earth with LED lighting. Food security is a mission priority.',
  },
  communications: {
    label: 'Communications Dish',
    icon: '📡',
    resourceLabel: 'Signal',
    tip: 'Earth comms have a 1.3-second delay from the Moon and up to 24 minutes from Mars. Plan your messages!',
  },
  airlock: {
    label: 'Airlock',
    icon: '🚪',
    resourceLabel: 'Safety',
    tip: 'Exit for EVA repairs and resource scouting outside the habitat. Always check your suit before going out!',
  },
}

// ── BuildingPanel ─────────────────────────────────────────────────────────────

interface BuildingPanelProps {
  readonly buildingId: string
  readonly oxygenPct: number
  readonly waterPct: number
  readonly foodPct: number
  readonly energyPct: number
  readonly activeEventIds: readonly string[]
  readonly onResolveEvent: (eventId: string, choiceId: string) => void
  readonly onEmergencyRation: () => void
  readonly onAdvanceDay: () => void
  readonly onClose: () => void
  readonly onFacilityAction: (actionId: string) => void
  readonly operationTaskId: string | null
}

function BuildingPanel({
  buildingId,
  oxygenPct,
  waterPct,
  foodPct,
  energyPct,
  activeEventIds,
  onResolveEvent,
  onEmergencyRation,
  onAdvanceDay,
  onClose,
  onFacilityAction,
  operationTaskId,
}: BuildingPanelProps): JSX.Element {
  const info = BUILDING_INFO[buildingId]
  const icon = info?.icon ?? '🏗️'
  const label = info?.label ?? buildingId
  const tip = info?.tip ?? 'This module is part of the habitat system.'

  // Challenge for this building
  const activeChallenges = useChallengeStore((s) => s.activeChallenges)
  const completeChallenge = useChallengeStore((s) => s.completeChallenge)
  const [completedReward, setCompletedReward] = useState<string | null>(null)

  const activeChallenge = activeChallenges.find((ac) => {
    const def = CHALLENGES.find((c) => c.id === ac.challengeId)
    return def?.targetBuildingId === buildingId
  })
  const challengeDef = activeChallenge !== undefined
    ? CHALLENGES.find((c) => c.id === activeChallenge.challengeId)
    : undefined

  function handleCompleteChallenge(): void {
    if (activeChallenge === undefined || challengeDef === undefined) return
    getAudioManager().playSound('level_complete')
    completeChallenge(activeChallenge.challengeId)
    setCompletedReward(challengeDef.reward)
  }

  const resourceValue = ((): { label: string; value: number; color: string } | null => {
    if (!info) return null
    switch (info.resourceLabel) {
      case 'Oxygen': return { label: 'Oxygen', value: oxygenPct, color: '#8B5CF6' }
      case 'Water':  return { label: 'Water',  value: waterPct,  color: '#3B82F6' }
      case 'Food':   return { label: 'Food',   value: foodPct,   color: '#10B981' }
      case 'Energy': return { label: 'Energy', value: energyPct, color: '#F59E0B' }
      default:       return null
    }
  })()

  const relevantEvents = activeEventIds
    .map((id) => getEventDefinition(id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined)

  const facilityAction: Readonly<Record<string, { id: string; label: string }>> = {
    'life-support': { id: 'generate-oxygen', label: 'Generate Oxygen' },
    'water-recycling': { id: 'recycle-water', label: 'Recycle Water' },
    greenhouse: { id: 'activate-hydroponics', label: 'Activate Hydroponics' },
    'power-room': { id: 'activate-backup', label: 'Activate Backup Power' },
    'solar-panels': { id: 'repair-solar', label: 'Repair Solar Panel' },
    communications: { id: 'stabilize-communication', label: 'Stabilize Communication' },
    'command-center': { id: 'reduce-consumption', label: 'Reduce Consumption' },
    airlock: { id: 'inspect-system', label: 'Inspect System' },
  }
  const taskBuildingId = operationTaskId !== null ? ACTION_BUILDINGS[operationTaskId] : undefined
  const operation = taskBuildingId === buildingId
    ? { id: operationTaskId as string, label: 'Perform Current Mission Task' }
    : facilityAction[buildingId]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} panel`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(10,14,26,0.97)',
          border: '1px solid rgba(31,200,192,0.3)',
          borderRadius: 20,
          padding: '20px 24px',
          width: '100%',
          maxWidth: 380,
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <h2 style={{ color: 'white', fontSize: 16, fontWeight: 900, fontFamily: 'Nunito, sans-serif', margin: 0 }}>
              {label}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Challenge card for this building */}
        {challengeDef !== undefined && completedReward === null && (
          <div
            style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.5)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <p style={{ color: '#F5A623', fontSize: 11, fontWeight: 900, fontFamily: 'Nunito, sans-serif', margin: 0 }}>
              {challengeDef.title}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Nunito, sans-serif', lineHeight: 1.45, margin: 0 }}>
              {challengeDef.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'Nunito, sans-serif' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>⏳ {activeChallenge!.daysRemaining} day{activeChallenge!.daysRemaining !== 1 ? 's' : ''} left</span>
            </div>
            <p style={{ color: '#EF4444', fontSize: 10, fontFamily: 'Nunito, sans-serif', margin: 0 }}>⚠️ {challengeDef.consequence}</p>
            <button
              onClick={handleCompleteChallenge}
              style={{
                background: '#FFD700',
                color: '#000',
                fontWeight: 900,
                fontSize: 13,
                fontFamily: 'Nunito, sans-serif',
                border: 'none',
                borderRadius: 10,
                padding: '10px 0',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {challengeDef.actionLabel}
            </button>
          </div>
        )}

        {/* Challenge reward message */}
        {completedReward !== null && (
          <div
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <p style={{ color: '#10B981', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif', margin: 0 }}>
              ✅ {completedReward}
            </p>
          </div>
        )}

        {/* Resource reading */}
        {resourceValue !== null && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ color: '#1FC8C0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Nunito, sans-serif', marginBottom: 8 }}>
              {resourceValue.label} Level
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: 10,
                  borderRadius: 5,
                  background: resourceValue.value < 20 ? '#EF4444' : resourceValue.color,
                  width: `${Math.max(0, Math.min(100, resourceValue.value))}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ color: resourceValue.color, fontSize: 16, fontWeight: 900, minWidth: 40, textAlign: 'right' }}>
                {Math.round(resourceValue.value)}%
              </span>
            </div>
          </div>
        )}

        {/* Astro-AI tip */}
        <div style={{ background: 'rgba(31,200,192,0.08)', border: '1px solid rgba(31,200,192,0.2)', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ color: '#1FC8C0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>
            🤖 Astro-AI
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.6, fontFamily: 'Nunito, sans-serif', margin: 0 }}>
            {tip}
          </p>
        </div>

        {/* Active events */}
        {relevantEvents.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: '#EF4444', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
              ⚠️ Active Alert
            </p>
            {relevantEvents.slice(0, 1).map((event) => (
              <div key={event.id} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>{event.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5, fontFamily: 'Nunito, sans-serif', marginBottom: 10 }}>{event.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {event.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => {
                        getAudioManager().playSound('click')
                        onResolveEvent(event.id, choice.id)
                        onClose()
                      }}
                      style={{
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: 'white',
                        fontSize: 12,
                        fontFamily: 'Nunito, sans-serif',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        {operation && <button onClick={() => { getAudioManager().playSound('success'); onFacilityAction(operation.id) }} style={{ width: '100%', background: 'linear-gradient(135deg,#1FC8C0,#0D9488)', color: 'white', fontWeight: 900, fontSize: 13, fontFamily: 'Nunito,sans-serif', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer' }}>⚙️ {operation.label}</button>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { getAudioManager().playSound('day_advance'); onAdvanceDay(); onClose() }}
            style={{ flex: 1, background: '#1FC8C0', color: 'black', fontWeight: 900, fontSize: 13, fontFamily: 'Nunito, sans-serif', border: 'none', borderRadius: 10, padding: '11px 0', cursor: 'pointer' }}
          >
            ⏭️ Next Day
          </button>
          <button
            onClick={() => { getAudioManager().playSound('click'); onEmergencyRation(); onClose() }}
            style={{ flex: 1, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.4)', color: '#F5A623', fontWeight: 700, fontSize: 13, fontFamily: 'Nunito, sans-serif', borderRadius: 10, padding: '11px 0', cursor: 'pointer' }}
          >
            🍱 Ration
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ color: 'rgba(31,200,192,0.8)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Nunito, sans-serif', padding: '4px 0', textAlign: 'center' }}
        >
          ← Back to Base
        </button>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameplayScreenProps {
  _props?: Record<string, never>
}

// ── Game phases ───────────────────────────────────────────────────────────────

type GamePhase = 'intro' | 'playing' | 'paused' | 'failed' | 'won'

// ── Main component ─────────────────────────────────────────────────────────────

export function GameplayScreen(_props: GameplayScreenProps): JSX.Element {
  const { levelId, missionId: missionIdParam } = useParams<{
    levelId?: string
    missionId?: string
  }>()
  const missionId = missionIdParam ?? levelId
  const navigate = useNavigate()

  const [gamePhase, setGamePhase] = useState<GamePhase>('intro')
  const [openBuildingId, setOpenBuildingId] = useState<string | null>(null)
  const [highlightedBuildingId, setHighlightedBuildingId] = useState<string | null>(null)
  const [pendingFacilityActionId, setPendingFacilityActionId] = useState<string | null>(null)
  const [joystickDir, setJoystickDir] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [nearBuilding, setNearBuilding] = useState<string | null>(null)
  // Show the mission operations brief as soon as a level starts. The player
  // should never have to discover the actual objectives behind a utility icon.
  const [showOperations, setShowOperations] = useState(true)
  const joystickActiveRef = useRef(false)
  const joystickStartRef = useRef<{ x: number; y: number } | null>(null)

  const {
    missionStarted,
    currentResources,
    currentMissionDay,
    activeEventIds,
    activeFaultStates,
    missionOutcome,
    missionDurationDays,
    commanderName,
    initializeMission,
    advanceDay,
    resolveEvent,
    emergencyRation,
  } = useMissionControl()

  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const initialResources = useMissionStore((s) => s.initialResources)
  const { completeLevel, unlockLevel } = useGameProgressStore()
  // Use getState() inside callbacks to always get fresh values
  const tickDay = useChallengeStore((s) => s.tickDay)
  const failChallenge = useChallengeStore((s) => s.failChallenge)
  const triggerChallenge = useChallengeStore((s) => s.triggerChallenge)
  const clearChallenges = useChallengeStore((s) => s.clearAll)
  const applyOperationAction = useMissionOperationsStore((s) => s.applyAction)
  const tickOperation = useMissionOperationsStore((s) => s.tick)
  const operationStatus = useMissionOperationsStore((s) => s.status)
  const operationResources = useMissionOperationsStore((s) => s.resources)
  const operationLevelId = useMissionOperationsStore((s) => s.activeLevelId)
  const operationTaskId = useMissionOperationsStore((s) => s.currentTaskId)
  const operationTimeRemaining = useMissionOperationsStore((s) => s.timeRemainingSeconds)
  const operationMission = getMissionOperation(levelId ?? missionId ?? 'level-1')
  const operationTask = operationMission?.actions.find((action) => action.id === operationTaskId)

  const planetId: 'moon' | 'mars' = selectedPlanetId === 'mars' ? 'mars' : 'moon'

  // ── Fallback resource snapshots ────────────────────────────────────────────

  const res = currentResources ?? {
    oxygen_kg: 0,
    water_kg: 0,
    food_kg: 0,
    energy_kWh: 0,
    cumulativeRadiation_mSv: 0,
  }
  const init = initialResources ?? {
    oxygen_kg: 100,
    water_kg: 100,
    food_kg: 100,
    energy_kWh: 100,
    cumulativeRadiation_mSv: 0,
  }

  function toPct(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0
  }

  const oxygenPct = toPct(res.oxygen_kg, init.oxygen_kg)
  const waterPct  = toPct(res.water_kg,  init.water_kg)
  const foodPct   = toPct(res.food_kg,   init.food_kg)
  const energyPct = toPct(res.energy_kWh, init.energy_kWh)

  // ── Crew mood derived from resources ──────────────────────────────────────

  const crewStatus: 'happy' | 'worried' | 'scared' = (() => {
    const min = Math.min(oxygenPct, waterPct, foodPct, energyPct)
    if (min < 15) return 'scared'
    if (min < 35) return 'worried'
    return 'happy'
  })()

  // ── Initialize simulation on mount ────────────────────────────────────────

  useEffect(() => {
    if (!missionStarted) {
      const setup = useMissionStore.getState()
      if (setup.baseConfig === null) {
        setup.setBaseConfig(getDefaultBaseConfig(Math.max(1, setup.crewSize || 4)))
      }
      initializeMission()
    }
    // Clear challenges whenever game (re)initializes
    clearChallenges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Mission outcome handler ───────────────────────────────────────────────

  useEffect(() => {
    if (missionOutcome === 'success' || missionOutcome === 'partial') {
      getAudioManager().playSound('level_complete')
      if (levelId) {
        completeLevel(levelId)
        const match = levelId.match(/level-(\d+)/)
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1
          unlockLevel(`level-${nextNum}`)
        }
      }
      setGamePhase('won')
      navigate(`/level-complete/${missionId ?? levelId ?? ''}`)
    } else if (missionOutcome === 'failure') {
      getAudioManager().playSound('game_over')
      setGamePhase('failed')
      navigate(`/game-over/${missionId ?? levelId ?? ''}`)
    }
  }, [missionOutcome, navigate, missionId, levelId, completeLevel, unlockLevel])

  // ── Fault state sound ─────────────────────────────────────────────────────

  useEffect(() => {
    if (activeFaultStates.length > 0 && gamePhase === 'playing') {
      getAudioManager().playSound('event_alert')
    }
  }, [activeFaultStates.length, gamePhase])

  // ── Esc key → pause ───────────────────────────────────────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        if (gamePhase === 'playing') {
          setGamePhase('paused')
          getAudioManager().playSound('click')
        } else if (gamePhase === 'paused') {
          setGamePhase('playing')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gamePhase])

  // ── Highlight building from ChallengeWidget ────────────────────────────────

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    function onHighlight(payload: { buildingId: string; actionId?: string }): void {
      setHighlightedBuildingId(payload.buildingId)
      if (payload.actionId !== undefined) setPendingFacilityActionId(payload.actionId)
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => setHighlightedBuildingId(null), 8000)
    }
    EventBus.on('highlight-building', onHighlight)
    return () => {
      EventBus.off('highlight-building', onHighlight)
      if (timer !== null) clearTimeout(timer)
    }
  }, [])

  // ── E key — interact with nearby building (placed after handleBuildingClick) ──
  // This useEffect is intentionally after handleBuildingClick useCallback below

  // ── Trigger a challenge on day 1 so player sees it immediately ────────────
  useEffect(() => {
    if (gamePhase === 'playing' && currentMissionDay === 1) {
      // Trigger harvest-crops challenge right away so player has something to do
      setTimeout(() => {
        triggerChallenge('harvest-crops', 1)
      }, 3000)
      setTimeout(() => {
        triggerChallenge('solar-storm', 1)
      }, 8000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentMissionDay])

  // The operations clock runs only while the player is inside the habitat.
  useEffect(() => {
    if (gamePhase !== 'playing' || operationStatus !== 'active') return
    const timer = window.setInterval(() => tickOperation(1), 1000)
    return () => window.clearInterval(timer)
  }, [gamePhase, operationStatus, tickOperation])

  useEffect(() => {
    if (operationStatus === 'lost' && gamePhase === 'playing') setShowOperations(true)
  }, [operationStatus, gamePhase])

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAdvanceDay = useCallback((): void => {
    getAudioManager().playSound('day_advance')
    advanceDay()

    // Tick challenge timers
    tickDay()

    // Fail expired challenges (check before tick takes effect — daysRemaining <= 1 means it'll hit 0 or below)
    useChallengeStore.getState().activeChallenges.forEach((ac) => {
      if (ac.daysRemaining <= 1) {
        failChallenge(ac.challengeId)
      }
    })

    // Trigger resource-based and day-threshold challenges
    if (currentResources !== null && initialResources !== null) {
      const oxyPct = initialResources.oxygen_kg > 0
        ? (currentResources.oxygen_kg / initialResources.oxygen_kg) * 100
        : 100
      const waterPct = initialResources.water_kg > 0
        ? (currentResources.water_kg / initialResources.water_kg) * 100
        : 100

      CHALLENGES.forEach((ch) => {
        if (ch.triggerCondition === 'low_oxygen' && oxyPct < (ch.triggerValue ?? 60)) {
          triggerChallenge(ch.id, currentMissionDay)
        }
        if (ch.triggerCondition === 'low_water' && waterPct < (ch.triggerValue ?? 55)) {
          triggerChallenge(ch.id, currentMissionDay)
        }
        if (ch.triggerCondition === 'day_threshold' && currentMissionDay >= (ch.triggerValue ?? 999)) {
          triggerChallenge(ch.id, currentMissionDay)
        }
      })

      // 25% chance random challenge each day
      if (Math.random() < 0.25) {
        const fresh = useChallengeStore.getState()
        const avail = CHALLENGES.filter(
          (c) =>
            c.triggerCondition === 'random' &&
            fresh.activeChallenges.find((a) => a.challengeId === c.id) === undefined &&
            !fresh.completedIds.includes(c.id),
        )
        if (avail.length > 0) {
          const pick = avail[Math.floor(Math.random() * avail.length)]
          if (pick !== undefined) {
            triggerChallenge(pick.id, currentMissionDay)
          }
        }
      }
    }
  }, [advanceDay, tickDay, failChallenge, triggerChallenge, currentResources, initialResources, currentMissionDay])

  const handleEmergencyRation = useCallback((): void => {
    getAudioManager().playSound('click')
    emergencyRation()
  }, [emergencyRation])

  const handleBuildingClick = useCallback((buildingId: string): void => {
    if (gamePhase !== 'playing') return
    getAudioManager().playSound('click')
    setOpenBuildingId(buildingId)
  }, [gamePhase])

  const handleFacilityAction = useCallback((actionId: string): void => {
    applyOperationAction(actionId)
    tickOperation()
    setPendingFacilityActionId(null)
  }, [applyOperationAction, tickOperation])

  // ── E key — interact with nearby building ──────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key.toLowerCase() === 'e' && nearBuilding && gamePhase === 'playing') {
        handleBuildingClick(nearBuilding)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nearBuilding, gamePhase, handleBuildingClick])

  // ── Cinematic intro ────────────────────────────────────────────────────────

  if (gamePhase === 'intro') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <CinematicIntro
          planetId={planetId}
          commanderName={commanderName || 'Commander'}
          onComplete={() => setGamePhase('playing')}
        />
        {showOperations && (
          <MissionOperationsPanel
            levelId={levelId ?? missionId ?? 'level-1'}
            onClose={() => setShowOperations(false)}
          />
        )}
      </div>
    )
  }

  // ── Critical failure screen ────────────────────────────────────────────────

  if (gamePhase === 'failed') {
    return (
      <CriticalFailureScreen
        faultStates={[...activeFaultStates]}
        dayReached={currentMissionDay}
        resources={res}
        initialResources={init}
        onRetry={() => {
          initializeMission()
          clearChallenges()
          setGamePhase('intro')
        }}
        onBackToMap={() => navigate('/campaign-map')}
      />
    )
  }

  // ── Main gameplay view ─────────────────────────────────────────────────────

  const firstEventId = activeEventIds.length > 0 ? activeEventIds[0] : null

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: planetId === 'mars' ? '#1a0808' : '#050810',
      }}
    >
      {/* ── 3D world (fills entire screen) ─────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <HabitatWorld
          planetId={planetId}
          resources={res}
          initialResources={init}
          crewStatus={crewStatus}
          commanderName={commanderName || 'Commander'}
          highlightedBuildingId={highlightedBuildingId}
          joystickDir={joystickDir}
          onBuildingClick={handleBuildingClick}
          onNearBuilding={setNearBuilding}
        />
      </div>

      {/* ── React overlays ─────────────────────────────────────────────────── */}

      {/* Resource HUD — fixed top-left */}
      <ResourceHUD
        oxygen={operationLevelId !== null ? operationResources.oxygen : oxygenPct}
        water={operationLevelId !== null ? operationResources.water : waterPct}
        food={operationLevelId !== null ? operationResources.food : foodPct}
        energy={operationLevelId !== null ? operationResources.energy : energyPct}
      />

      {/* Challenge Widget — fixed below ResourceHUD */}
      <ChallengeWidget onOpenBuilding={setOpenBuildingId} />

      {/* Mission alert banner — fixed top-right, offset from pause button */}
      <MissionAlertBanner eventId={firstEventId} day={currentMissionDay} />

      {/* Task corner — fixed bottom-right above action bar */}
      <TaskCorner
        currentResources={res}
        initialResources={init}
        currentDay={currentMissionDay}
        totalDays={missionDurationDays}
        activeEventIds={activeEventIds}
        activeFaultStates={[...activeFaultStates]}
      />

      {operationStatus === 'active' && (
        <div className={`sh-mission-clock ${operationTimeRemaining < 30 ? 'critical' : ''}`} role="timer" aria-label="Mission time remaining">
          <span>MISSION TIMER</span>
          <strong>{Math.floor(operationTimeRemaining / 60).toString().padStart(2, '0')}:{(operationTimeRemaining % 60).toString().padStart(2, '0')}</strong>
          <small>Complete all tasks before zero</small>
        </div>
      )}

      {operationTask && operationStatus === 'active' && (
        <div className={`sh-current-task ${operationTimeRemaining < 30 ? 'critical' : ''}`} role="status">
          <span className="sh-eyebrow">Your current task</span>
          <strong>{operationTask.label}</strong>
          <small>Move to the highlighted facility and interact with it</small>
          <b>⏱ {Math.floor(operationTimeRemaining / 60).toString().padStart(2, '0')}:{(operationTimeRemaining % 60).toString().padStart(2, '0')}</b>
          <button onClick={() => setShowOperations(true)}>View mission steps</button>
        </div>
      )}

      {/* ── Fixed HUD overlays ───────────────────────────────────────────── */}

      {/* Pause button — fixed top-right */}
      <button
        className="sh-pause-btn"
        style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 50 }}
        onClick={() => {
          getAudioManager().playSound('click')
          setGamePhase('paused')
        }}
        aria-label="Pause game"
      >
        ⏸
      </button>

      {/* ── Proximity prompt — appears when near a building ───────────────── */}
      {nearBuilding && gamePhase === 'playing' && (
        <div style={{
          position: 'fixed',
          bottom: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(10,14,26,0.92)',
          border: '1.5px solid #1FC8C0',
          borderRadius: 12,
          padding: '10px 20px',
          color: 'white',
          fontSize: 14,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeInUp 0.3s ease',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
          onClick={() => handleBuildingClick(nearBuilding)}
        >
          <span style={{ fontSize: 18 }}>🔘</span>
          Press <kbd style={{ background: 'rgba(31,200,192,0.2)', border: '1px solid #1FC8C0', borderRadius: 4, padding: '1px 6px', margin: '0 4px' }}>E</kbd>
          to enter{' '}
          <span style={{ color: '#1FC8C0' }}>
            {nearBuilding.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      )}

      {/* Virtual joystick — fixed bottom-left — FUNCTIONAL touch/mouse */}
      <div
        className="sh-joystick-outer"
        style={{ position: 'fixed', bottom: '16px', left: '16px', zIndex: 50, touchAction: 'none', userSelect: 'none' }}
        aria-label="Movement joystick"
        onMouseDown={(e) => {
          joystickActiveRef.current = true
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          joystickStartRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        }}
        onMouseMove={(e) => {
          if (!joystickActiveRef.current || !joystickStartRef.current) return
          const dx = (e.clientX - joystickStartRef.current.x) / 45
          const dy = (e.clientY - joystickStartRef.current.y) / 45
          const len = Math.sqrt(dx * dx + dy * dy)
          const nx = len > 1 ? dx / len : dx
          const ny = len > 1 ? dy / len : dy
          setJoystickDir({ x: nx, y: ny })
        }}
        onMouseUp={() => { joystickActiveRef.current = false; setJoystickDir({ x: 0, y: 0 }) }}
        onMouseLeave={() => { if (joystickActiveRef.current) { joystickActiveRef.current = false; setJoystickDir({ x: 0, y: 0 }) } }}
        onTouchStart={(e) => {
          void e.touches[0]
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          joystickStartRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          joystickActiveRef.current = true
        }}
        onTouchMove={(e) => {
          if (!joystickStartRef.current) return
          const t = e.touches[0]
          const dx = (t.clientX - joystickStartRef.current.x) / 45
          const dy = (t.clientY - joystickStartRef.current.y) / 45
          const len = Math.sqrt(dx * dx + dy * dy)
          const nx = len > 1 ? dx / len : dx
          const ny = len > 1 ? dy / len : dy
          setJoystickDir({ x: nx, y: ny })
          e.preventDefault()
        }}
        onTouchEnd={() => { joystickActiveRef.current = false; setJoystickDir({ x: 0, y: 0 }) }}
      >
        <div
          className="sh-joystick-inner"
          style={{
            transform: `translate(${joystickDir.x * 18}px, ${joystickDir.y * 18}px)`,
            transition: joystickActiveRef.current ? 'none' : 'transform 0.1s ease',
          }}
        >
          <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px', pointerEvents: 'none' }}>▲</div>
          <div style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px', pointerEvents: 'none' }}>▼</div>
          <div style={{ position: 'absolute', left: '-28px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px', pointerEvents: 'none' }}>◀</div>
          <div style={{ position: 'absolute', right: '-28px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px', pointerEvents: 'none' }}>▶</div>
        </div>
      </div>

      {/* Tools button — fixed bottom-right */}
      <button
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 50,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#1E3A6E',
          border: '2px solid rgba(59,111,232,0.5)',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Tools"
        onClick={() => { getAudioManager().playSound('click'); setShowOperations(true) }}
      >
        🔧
      </button>

      {/* Advance Day button — fixed bottom-center */}
      <button
        onClick={handleAdvanceDay}
        aria-label="Advance one day"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1FC8C0',
          color: 'black',
          fontWeight: 900,
          fontSize: 13,
          fontFamily: 'Nunito, sans-serif',
          border: 'none',
          borderRadius: 12,
          padding: '10px 18px',
          cursor: 'pointer',
          boxShadow: '0 0 14px rgba(31,200,192,0.4)',
        }}
      >
        ⏭️ Day {currentMissionDay}/{missionDurationDays} → Next
      </button>

      {/* Emergency ration — fixed above tools button */}
      <button
        onClick={handleEmergencyRation}
        aria-label="Emergency ration mode"
        title="Halve food consumption for one day"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          zIndex: 50,
          fontSize: 12,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          background: 'rgba(245,166,35,0.2)',
          border: '1px solid rgba(245,166,35,0.6)',
          color: '#F5A623',
          borderRadius: 10,
          padding: '8px 10px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        🍱 Ration
      </button>

      {/* ── Keyboard hint ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 90,
          right: 80,
          zIndex: 19,
          fontSize: 9,
          color: 'rgba(255,255,255,0.2)',
          textAlign: 'right',
          fontFamily: 'Nunito, sans-serif',
          lineHeight: 1.6,
          pointerEvents: 'none',
        }}
      >
        <p>Click buildings to interact</p>
        <p>Drag to orbit camera</p>
        <p>Esc — Pause</p>
      </div>

      {/* ── Building panel modal ────────────────────────────────────────────── */}
      {openBuildingId !== null && (
        <BuildingPanel
          buildingId={openBuildingId}
          oxygenPct={oxygenPct}
          waterPct={waterPct}
          foodPct={foodPct}
          energyPct={energyPct}
          activeEventIds={activeEventIds}
          onResolveEvent={resolveEvent}
          onEmergencyRation={handleEmergencyRation}
          onAdvanceDay={handleAdvanceDay}
          onClose={() => setOpenBuildingId(null)}
          onFacilityAction={handleFacilityAction}
          operationTaskId={pendingFacilityActionId ?? operationTaskId}
        />
      )}

      {showOperations && (
        <MissionOperationsPanel
          levelId={levelId ?? missionId ?? 'level-1'}
          onClose={() => setShowOperations(false)}
        />
      )}

      {/* ── Pause overlay ───────────────────────────────────────────────────── */}
      {gamePhase === 'paused' && (
        <PauseMenuOverlay
          onResume={() => setGamePhase('playing')}
          levelId={levelId ?? missionId ?? 'level-1'}
        />
      )}
    </div>
  )
}
