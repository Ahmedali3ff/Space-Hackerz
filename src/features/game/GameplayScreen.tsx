// src/features/game/GameplayScreen.tsx
// Phaser 3 top-down astronaut game embedded in a React shell.
// The player controls an astronaut character with WASD/arrow keys.
// React overlays show resource HUD, alerts, and building panels.
// All simulation state comes from useMissionControl().

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Phaser from 'phaser'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { useGameProgressStore } from '@store/game-progress-store'
import { getMissionById } from '@data/missions/mission-definitions'
import { getAudioManager } from '@/services/audio-manager'
import { getEventDefinition } from '@/features/events/event-registry'
import { EventBus } from '@game/EventBus'
import { createPhaserConfig } from '@game/config/PhaserConfig'

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameplayScreenProps {
  _props?: Record<string, never>
}

// ── Building metadata ─────────────────────────────────────────────────────────

interface BuildingInfo {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly resourceLabel: string
  readonly tip: string
}

const BUILDING_INFO: Record<string, BuildingInfo> = {
  'life-support': {
    id: 'life-support',
    label: 'Life Support Bay',
    icon: '🫁',
    resourceLabel: 'Oxygen',
    tip: 'Life support recycles CO₂ into breathable oxygen. Each crew member consumes ~0.84 kg of O₂ per day.',
  },
  'command-center': {
    id: 'command-center',
    label: 'Command Center',
    icon: '🖥️',
    resourceLabel: 'Energy',
    tip: 'The command center coordinates all habitat systems. Maintaining high energy ensures communications and control.',
  },
  'crew-quarters': {
    id: 'crew-quarters',
    label: 'Crew Quarters',
    icon: '👥',
    resourceLabel: 'Morale',
    tip: 'Rest is critical on long missions. Crew fatigue increases errors and resource waste.',
  },
  'water-recycling': {
    id: 'water-recycling',
    label: 'Water Recycling',
    icon: '💧',
    resourceLabel: 'Water',
    tip: 'Water recyclers recover up to 93% of wastewater. Each crew member needs ~3 L/day to stay healthy.',
  },
  'solar-panels': {
    id: 'solar-panels',
    label: 'Solar Array Alpha',
    icon: '☀️',
    resourceLabel: 'Energy',
    tip: 'Solar panels convert sunlight into electricity. On the Moon, panels work at ~100% efficiency in sunlight.',
  },
  'solar-panels-2': {
    id: 'solar-panels-2',
    label: 'Solar Array Beta',
    icon: '☀️',
    resourceLabel: 'Energy',
    tip: 'A second solar array provides redundancy. Mars dust storms can reduce solar output by up to 99%.',
  },
  'communications': {
    id: 'communications',
    label: 'Communications Dish',
    icon: '📡',
    resourceLabel: 'Signal',
    tip: 'Earth comms have a 1.3-second delay from the Moon and up to 24 minutes from Mars. Plan your messages!',
  },
  'power-room': {
    id: 'power-room',
    label: 'Power Generator',
    icon: '⚡',
    resourceLabel: 'Energy',
    tip: 'Nuclear RTG generators provide baseload power day and night, regardless of solar conditions.',
  },
  'hydroponics': {
    id: 'hydroponics',
    label: 'Hydroponics Bay',
    icon: '🌱',
    resourceLabel: 'Food',
    tip: 'Hydroponic crops grow 30% faster than on Earth with LED lighting. Food security is a mission priority.',
  },
}

// ── ResourceHUD ───────────────────────────────────────────────────────────────

interface ResourceHUDProps {
  readonly oxygen: number
  readonly water: number
  readonly food: number
  readonly energy: number
}

function ResourceHUD({ oxygen, water, food, energy }: ResourceHUDProps): JSX.Element {
  const bars: Array<{ label: string; icon: string; value: number; color: string }> = [
    { label: 'O₂',    icon: '🫁', value: oxygen, color: '#1FC8C0' },
    { label: 'H₂O',   icon: '💧', value: water,  color: '#38BDF8' },
    { label: 'Food',  icon: '🌱', value: food,   color: '#10B981' },
    { label: 'Power', icon: '⚡', value: energy,  color: '#F5A623' },
  ]

  return (
    <div
      className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2.5 min-w-[130px]"
      aria-label="Resource status"
    >
      {bars.map((bar) => {
        const pct = Math.max(0, Math.min(100, bar.value))
        const isLow = pct < 20
        const isCrit = pct < 10
        const barColor = isCrit ? '#EF4444' : isLow ? '#F59E0B' : bar.color
        return (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-sm leading-none w-4 text-center">{bar.icon}</span>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wide">{bar.label}</span>
                <span
                  className="text-[9px] font-bold tabular-nums"
                  style={{ color: barColor }}
                >
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── MissionAlert ──────────────────────────────────────────────────────────────

interface MissionAlertProps {
  readonly activeEventIds: readonly string[]
  readonly missionDay: number
  readonly totalDays: number
}

function MissionAlert({ activeEventIds, missionDay, totalDays }: MissionAlertProps): JSX.Element {
  const hasEvent = activeEventIds.length > 0
  const firstEvent = hasEvent ? getEventDefinition(activeEventIds[0]) : undefined

  return (
    <div
      className={[
        'absolute top-3 right-3 z-20 rounded-xl px-3 py-2 text-xs font-bold backdrop-blur-sm max-w-[200px]',
        hasEvent
          ? 'bg-[#EF4444]/20 border border-[#EF4444]/60 text-[#EF4444] animate-pulse'
          : 'bg-black/50 border border-white/10 text-white/60',
      ].join(' ')}
      role={hasEvent ? 'alert' : undefined}
    >
      {hasEvent ? (
        <span>⚠️ {firstEvent?.title ?? 'Event Alert!'}</span>
      ) : (
        <span>✅ All systems nominal</span>
      )}
      <div className="text-white/40 font-normal mt-0.5">
        Day {missionDay} / {totalDays}
      </div>
    </div>
  )
}

// ── VirtualJoystick ───────────────────────────────────────────────────────────

function VirtualJoystick(): JSX.Element {
  return (
    <div
      className="absolute bottom-16 left-4 z-20 pointer-events-none"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        {/* Inner knob */}
        <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30" />
      </div>
      <p className="text-[8px] text-white/30 text-center mt-1 tracking-wide">WASD / ↑↓←→</p>
    </div>
  )
}

// ── InteractPrompt ────────────────────────────────────────────────────────────

interface InteractPromptProps {
  readonly nearBuildingId: string | null
}

function InteractPrompt({ nearBuildingId }: InteractPromptProps): JSX.Element | null {
  if (!nearBuildingId) return null
  const info = BUILDING_INFO[nearBuildingId]
  const label = info?.label ?? nearBuildingId

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/70 border border-[#1FC8C0]/50 rounded-full px-4 py-2 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <kbd className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded font-mono">E</kbd>
      <span className="text-xs text-white font-semibold">Interact with</span>
      <span className="text-xs text-[#1FC8C0] font-bold">{label}</span>
    </div>
  )
}

// ── BuildingPanel ─────────────────────────────────────────────────────────────

interface BuildingPanelProps {
  readonly buildingId: string
  readonly oxygen: number
  readonly water: number
  readonly food: number
  readonly energy: number
  readonly activeEventIds: readonly string[]
  readonly onResolveEvent: (eventId: string, choiceId: string) => void
  readonly onClose: () => void
  readonly onAstroAI: () => void
}

function BuildingPanel({
  buildingId,
  oxygen,
  water,
  food,
  energy,
  activeEventIds,
  onResolveEvent,
  onClose,
}: BuildingPanelProps): JSX.Element {
  const info = BUILDING_INFO[buildingId]
  const icon = info?.icon ?? '🏗️'
  const label = info?.label ?? buildingId
  const tip = info?.tip ?? 'This module is part of the habitat system.'

  // Pick the relevant resource value for this building
  const resourceValue = (() => {
    if (!info) return null
    switch (info.resourceLabel) {
      case 'Oxygen':  return { label: 'Oxygen',  value: oxygen,  color: '#1FC8C0' }
      case 'Water':   return { label: 'Water',   value: water,   color: '#38BDF8' }
      case 'Food':    return { label: 'Food',    value: food,    color: '#10B981' }
      case 'Energy':  return { label: 'Energy',  value: energy,  color: '#F5A623' }
      default:        return null
    }
  })()

  // Find events relevant to this building
  const relevantEvents = activeEventIds
    .map((id) => getEventDefinition(id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} panel`}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0E1A] border border-[#1FC8C0]/30 rounded-2xl p-5 w-full max-w-sm mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-base font-black text-white">{label}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="text-white/40 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Resource reading */}
        {resourceValue !== null && (
          <div className="bg-white/5 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-1">
              {resourceValue.label} Level
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(0, Math.min(100, resourceValue.value))}%`,
                    backgroundColor: resourceValue.value < 20 ? '#EF4444' : resourceValue.color,
                  }}
                />
              </div>
              <span
                className="text-sm font-black tabular-nums"
                style={{ color: resourceValue.color }}
              >
                {Math.round(resourceValue.value)}%
              </span>
            </div>
          </div>
        )}

        {/* Educational tip */}
        <div className="bg-[#1FC8C0]/10 border border-[#1FC8C0]/20 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-1">
            🤖 Astro-AI
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{tip}</p>
        </div>

        {/* Active event choices */}
        {relevantEvents.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-[#EF4444] font-bold">
              ⚠️ Active Alert
            </p>
            {relevantEvents.slice(0, 1).map((event) => (
              <div key={event.id} className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-3 py-3">
                <p className="text-xs font-bold text-white mb-2">{event.title}</p>
                <p className="text-xs text-white/60 mb-3 leading-relaxed">{event.description}</p>
                <div className="flex flex-col gap-1.5">
                  {event.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => {
                        getAudioManager().playSound('click')
                        onResolveEvent(event.id, choice.id)
                        onClose()
                      }}
                      className="text-xs text-left bg-white/10 hover:bg-[#1FC8C0]/20 border border-white/10 hover:border-[#1FC8C0]/40 rounded-lg px-3 py-2 text-white transition-colors"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="text-xs text-[#1FC8C0] hover:text-white transition-colors text-center py-1"
        >
          ← Back to Base
        </button>
      </div>
    </div>
  )
}

// ── GameplayScreen (main) ─────────────────────────────────────────────────────

export function GameplayScreen(_props: GameplayScreenProps): JSX.Element {
  const { levelId, missionId: missionIdParam } = useParams<{ levelId?: string; missionId?: string }>()
  // missionId resolves from either param
  const missionId = missionIdParam ?? levelId
  const navigate = useNavigate()

  const canvasRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  const [sceneReady, setSceneReady] = useState(false)
  const [nearBuildingId, setNearBuildingId] = useState<string | null>(null)
  const [openBuildingId, setOpenBuildingId] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

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
    resolveEvent,
    emergencyRation,
  } = useMissionControl()

  const initialResources = useMissionStore((s) => s.initialResources)
  const { completeLevel, unlockLevel } = useGameProgressStore()

  const mission = missionId ? getMissionById(missionId) : undefined
  const planetType: 'moon' | 'mars' = selectedPlanetId === 'mars' ? 'mars' : 'moon'

  // ── Resource percentages (0–100) ─────────────────────────────────────────

  const res = currentResources ?? {
    oxygen_kg: 0, water_kg: 0, food_kg: 0, energy_kWh: 0, cumulativeRadiation_mSv: 0,
  }
  const init = initialResources ?? {
    oxygen_kg: 100, water_kg: 100, food_kg: 100, energy_kWh: 100, cumulativeRadiation_mSv: 0,
  }

  function toPct(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0
  }

  const oxygenPct = toPct(res.oxygen_kg, init.oxygen_kg)
  const waterPct  = toPct(res.water_kg,  init.water_kg)
  const foodPct   = toPct(res.food_kg,   init.food_kg)
  const energyPct = toPct(res.energy_kWh, init.energy_kWh)

  // ── Initialize simulation on mount ────────────────────────────────────────
  // Only initialize if the mission hasn't already been started by BaseConfigurationScreen
  useEffect(() => {
    if (!missionStarted) {
      initializeMission()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Phaser initialization ─────────────────────────────────────────────────

  useEffect(() => {
    console.log('[GameplayScreen] Mount — canvasRef.current:', canvasRef.current)
    console.log('[GameplayScreen] Dimensions:', window.innerWidth, window.innerHeight)
    console.log('[GameplayScreen] Planet type:', planetType)
    
    if (!canvasRef.current) {
      console.error('[GameplayScreen] canvasRef.current is NULL — Phaser cannot mount!')
      return
    }
    
    if (gameRef.current) {
      console.log('[GameplayScreen] Game already exists — skipping initialization')
      return
    }

    console.log('[GameplayScreen] Creating Phaser game...')
    const config = createPhaserConfig(canvasRef.current, 800, 600, planetType)
    console.log('[GameplayScreen] Config:', config)
    
    gameRef.current = new Phaser.Game(config)
    console.log('[GameplayScreen] Game instance created:', gameRef.current)
    console.log('[GameplayScreen] Phaser version:', Phaser.VERSION)

    // Start scene with planet data
    gameRef.current.events.once('ready', () => {
      console.log('[GameplayScreen] Phaser "ready" event fired')
      const scene = gameRef.current?.scene.getScene('MainGameScene')
      console.log('[GameplayScreen] MainGameScene instance:', scene)
      if (scene) {
        console.log('[GameplayScreen] Starting MainGameScene with planetId:', planetType)
        scene.scene.start('MainGameScene', { planetId: planetType })
      } else {
        console.error('[GameplayScreen] MainGameScene NOT FOUND in scene manager!')
      }
    })

    return () => {
      console.log('[GameplayScreen] Unmounting — destroying Phaser game')
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── EventBus: Phaser → React ──────────────────────────────────────────────

  useEffect(() => {
    function onSceneReady(): void {
      setSceneReady(true)
    }

    function onNearBuilding(d: { buildingId: string | null }): void {
      setNearBuildingId(d.buildingId)
    }

    function onPlayerInteracted(d: { buildingId: string }): void {
      setOpenBuildingId(d.buildingId)
      getAudioManager().playSound('click')
    }

    function onPauseRequested(): void {
      handlePause()
    }

    EventBus.on('scene-ready', onSceneReady)
    EventBus.on('near-building', onNearBuilding)
    EventBus.on('player-interacted', onPlayerInteracted)
    EventBus.on('pause-requested', onPauseRequested)

    return () => {
      EventBus.off('scene-ready', onSceneReady)
      EventBus.off('near-building', onNearBuilding)
      EventBus.off('player-interacted', onPlayerInteracted)
      EventBus.off('pause-requested', onPauseRequested)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── EventBus: React → Phaser (resource sync) ──────────────────────────────

  useEffect(() => {
    if (!sceneReady) return
    EventBus.emit('resources-updated', {
      oxygen: oxygenPct,
      water: waterPct,
      food: foodPct,
      energy: energyPct,
    })
  }, [sceneReady, oxygenPct, waterPct, foodPct, energyPct])

  useEffect(() => {
    if (!sceneReady) return
    EventBus.emit('day-advanced', { day: currentMissionDay })
  }, [sceneReady, currentMissionDay])

  // ── Mission outcome handler ───────────────────────────────────────────────

  useEffect(() => {
    if (missionOutcome === 'success' || missionOutcome === 'partial') {
      getAudioManager().playSound('level_complete')
      // Unlock next level from levelId (e.g. 'level-3' → unlock 'level-4')
      if (levelId) {
        completeLevel(levelId)
        const match = levelId.match(/level-(\d+)/)
        if (match) {
          const nextNum = parseInt(match[1], 10) + 1
          unlockLevel(`level-${nextNum}`)
        }
      }
      navigate(`/level-complete/${missionId ?? levelId ?? ''}`)
    } else if (missionOutcome === 'failure') {
      getAudioManager().playSound('game_over')
      navigate('/game/game-over')
    }
  }, [missionOutcome, navigate, missionId, levelId, completeLevel, unlockLevel])

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleAdvanceDay = useCallback((): void => {
    getAudioManager().playSound('day_advance')
    advanceDay()
    EventBus.emit('day-advanced', { day: currentMissionDay + 1 })
  }, [advanceDay, currentMissionDay])

  const handleEmergencyRation = useCallback((): void => {
    getAudioManager().playSound('click')
    emergencyRation()
  }, [emergencyRation])

  function handlePause(): void {
    getAudioManager().playSound('click')
    setIsPaused(true)
    navigate(`/game/pause/${missionId ?? levelId ?? ''}`)
  }

  function handleResumeFromPause(): void {
    setIsPaused(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0E1A]">
      {/* Phaser canvas container */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1, background: '#0A0E1A' }}
      />

      {/* Loading overlay */}
      {!sceneReady && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0A0E1A]">
          <div className="text-4xl mb-4 animate-bounce">🚀</div>
          <p className="text-white/60 text-sm font-semibold tracking-widest uppercase">
            Deploying Habitat…
          </p>
          <p className="text-white/30 text-xs mt-2">
            {planetType === 'moon' ? '🌙 Lunar Base' : '🔴 Mars Base'}
            {mission ? ` — ${mission.title}` : ''}
          </p>
        </div>
      )}

      {/* React overlays (only shown when scene is ready) */}
      {sceneReady && (
        <>
          {/* Resource HUD — top-left */}
          <ResourceHUD
            oxygen={oxygenPct}
            water={waterPct}
            food={foodPct}
            energy={energyPct}
          />

          {/* Mission alert — top-right */}
          <MissionAlert
            activeEventIds={activeEventIds}
            missionDay={currentMissionDay}
            totalDays={missionDurationDays}
          />

          {/* Virtual joystick — bottom-left */}
          <VirtualJoystick />

          {/* Interact prompt — center-bottom */}
          <InteractPrompt nearBuildingId={nearBuildingId} />

          {/* Bottom action bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-2 bg-black/70 backdrop-blur-sm border-t border-white/10 px-4 py-2">
            {/* Advance day */}
            <button
              onClick={handleAdvanceDay}
              className="flex items-center gap-2 bg-[#1FC8C0] hover:bg-[#17a8a0] text-black font-black text-xs px-4 py-2 rounded-xl transition-colors"
              aria-label="Advance one day"
            >
              ⏭️ Next Day
            </button>

            {/* Mission title */}
            <div className="text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-widest">
                {planetType === 'moon' ? '🌙 Moon' : '🔴 Mars'}
              </p>
              {mission && (
                <p className="text-[10px] text-white/60 font-semibold truncate max-w-[140px]">
                  {mission.title}
                </p>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEmergencyRation}
                className="text-xs bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#F59E0B] font-bold px-2 py-1.5 rounded-lg transition-colors"
                title="Emergency Ration — halve food consumption"
                aria-label="Emergency ration"
              >
                🍱 Ration
              </button>
              <button
                onClick={handlePause}
                className="text-white/50 hover:text-white transition-colors text-xl leading-none"
                aria-label="Pause game"
              >
                ⏸
              </button>
              <button
                onClick={() => navigate('/missions')}
                className="text-white/30 hover:text-white/60 transition-colors text-base leading-none"
                aria-label="Return to mission map"
              >
                🔧
              </button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-14 right-3 z-20 text-[8px] text-white/25 text-right pointer-events-none">
            <p>WASD / Arrow keys — Move</p>
            <p>E — Interact</p>
            <p>Esc — Pause</p>
          </div>

          {/* Building panel (modal) */}
          {openBuildingId !== null && (
            <BuildingPanel
              buildingId={openBuildingId}
              oxygen={oxygenPct}
              water={waterPct}
              food={foodPct}
              energy={energyPct}
              activeEventIds={activeEventIds}
              onResolveEvent={resolveEvent}
              onClose={() => setOpenBuildingId(null)}
              onAstroAI={() => {}}
            />
          )}

          {/* Pause indicator (when paused mid-navigation) */}
          {isPaused && (
            <div
              className="absolute inset-0 z-25 bg-black/40 flex items-center justify-center"
              onClick={handleResumeFromPause}
            >
              <p className="text-white/40 text-xs">Tap to resume</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
