// src/features/game/GameplayScreen.tsx
// V2 — React Three Fiber 3D habitat gameplay screen.
// Fully replaces the Phaser-based version. The simulation engine is untouched.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { useGameProgressStore } from '@store/game-progress-store'
import { getAudioManager } from '@/services/audio-manager'
import { getEventDefinition } from '@/features/events/event-registry'

import { HabitatWorld } from '@/game3d/components/HabitatWorld'
import { CinematicIntro } from '@/game3d/components/CinematicIntro'
import { ResourceHUD } from './ResourceHUD'
import { TaskCorner } from './TaskCorner'
import { MissionAlertBanner } from './MissionAlertBanner'
import { CriticalFailureScreen } from './CriticalFailureScreen'
import { PauseMenuOverlay } from './PauseMenuOverlay'

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
}: BuildingPanelProps): JSX.Element {
  const info = BUILDING_INFO[buildingId]
  const icon = info?.icon ?? '🏗️'
  const label = info?.label ?? buildingId
  const tip = info?.tip ?? 'This module is part of the habitat system.'

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
      initializeMission()
    }
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

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleAdvanceDay = useCallback((): void => {
    getAudioManager().playSound('day_advance')
    advanceDay()
  }, [advanceDay])

  const handleEmergencyRation = useCallback((): void => {
    getAudioManager().playSound('click')
    emergencyRation()
  }, [emergencyRation])

  const handleBuildingClick = useCallback((buildingId: string): void => {
    if (gamePhase !== 'playing') return
    getAudioManager().playSound('click')
    setOpenBuildingId(buildingId)
  }, [gamePhase])

  // ── Cinematic intro ────────────────────────────────────────────────────────

  if (gamePhase === 'intro') {
    return (
      <CinematicIntro
        planetId={planetId}
        commanderName={commanderName || 'Commander'}
        onComplete={() => setGamePhase('playing')}
      />
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
          setGamePhase('intro')
        }}
        onBackToMap={() => navigate('/missions')}
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
          onBuildingClick={handleBuildingClick}
        />
      </div>

      {/* ── React overlays ─────────────────────────────────────────────────── */}

      {/* Resource HUD — top left */}
      <ResourceHUD
        oxygen={oxygenPct}
        water={waterPct}
        food={foodPct}
        energy={energyPct}
      />

      {/* Mission alert banner — top right */}
      <MissionAlertBanner eventId={firstEventId} day={currentMissionDay} />

      {/* Task corner — bottom right */}
      <TaskCorner
        currentResources={res}
        initialResources={init}
        currentDay={currentMissionDay}
        totalDays={missionDurationDays}
        activeEventIds={activeEventIds}
        activeFaultStates={[...activeFaultStates]}
      />

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

      {/* Virtual joystick — fixed bottom-left */}
      <div
        className="sh-joystick-outer"
        style={{ position: 'fixed', bottom: '32px', left: '32px', zIndex: 50 }}
        aria-label="Movement joystick"
      >
        <div className="sh-joystick-inner">
          {/* Direction indicators */}
          <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>▲</div>
          <div style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>▼</div>
          <div style={{ position: 'absolute', left: '-28px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>◀</div>
          <div style={{ position: 'absolute', right: '-28px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>▶</div>
        </div>
      </div>

      {/* Tools button — fixed bottom-right */}
      <button
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
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
      >
        🔧
      </button>

      {/* Bottom action bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: 'rgba(10,14,26,0.85)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 16px',
        }}
      >
        {/* Advance day */}
        <button
          onClick={handleAdvanceDay}
          aria-label="Advance one day"
          style={{
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
          ⏭️ Next Day
        </button>

        {/* Planet + day indicator */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Nunito, sans-serif', marginBottom: 2 }}>
            {planetId === 'moon' ? '🌙 Moon' : '🔴 Mars'}
          </p>
          <p style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
            Day {currentMissionDay} / {missionDurationDays}
          </p>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleEmergencyRation}
            aria-label="Emergency ration mode"
            title="Halve food consumption for one day"
            style={{
              fontSize: 13,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              background: 'rgba(245,166,35,0.15)',
              border: '1px solid rgba(245,166,35,0.4)',
              color: '#F5A623',
              borderRadius: 10,
              padding: '9px 12px',
              cursor: 'pointer',
            }}
          >
            🍱 Ration
          </button>
          {/* Pause button moved to fixed top-right overlay */}
          <button
            onClick={() => navigate('/missions')}
            aria-label="Return to mission map"
            style={{
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            🗺️
          </button>
        </div>
      </div>

      {/* ── Keyboard hint ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 54,
          right: 14,
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
        />
      )}

      {/* ── Pause overlay ───────────────────────────────────────────────────── */}
      {gamePhase === 'paused' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Inline pause wrapper so PauseMenuOverlay reads URL params correctly */}
          <PauseMenuOverlay />
        </div>
      )}
    </div>
  )
}
