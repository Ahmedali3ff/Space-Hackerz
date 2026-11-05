// src/features/game/GameOverScreen.tsx
// Game failure screen — shows failure reason, day reached, educational tip.
// Derives failure reason from activeFaultStates in useMissionStore.

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from '@phosphor-icons/react'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { getAudioManager } from '@/services/audio-manager'
import type { FaultState } from '@simulation/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameOverScreenProps {
  // intentionally empty — reads from stores
}

// ── Fault-state → human-readable message ──────────────────────────────────────

const FAULT_MESSAGES: Readonly<Record<string, string>> = {
  OXYGEN_DEPLETED: 'Your crew ran out of oxygen',
  WATER_DEPLETED: 'Your crew ran out of water',
  FOOD_DEPLETED: 'Your crew ran out of food',
  POWER_CRITICAL: 'Power reached critical levels',
  RADIATION_CRITICAL: 'Radiation became critical',
}

const FAULT_TIPS: Readonly<Record<string, string>> = {
  OXYGEN_DEPLETED:
    'Oxygen is produced by electrolysis of water or by plants. When it runs out, crew health fails immediately. Always watch the O₂ bar!',
  WATER_DEPLETED:
    'Water is critical for drinking, oxygen production, and cooling. Space stations recycle nearly 90% of water to conserve it.',
  FOOD_DEPLETED:
    'Food provides the energy astronauts need. Emergency rations can halve consumption when supplies run low.',
  POWER_CRITICAL:
    'Power runs life support, heating, and communications. During lunar night or dust storms, battery reserves are the only source.',
  RADIATION_CRITICAL:
    'Cosmic rays and solar flares are invisible dangers in space. Shielding and sheltering protocols protect the crew.',
}

function getFailureReason(faults: readonly FaultState[]): string {
  if (faults.length === 0) return 'The mission could not be completed'
  const msg = FAULT_MESSAGES[faults[0]]
  return msg ?? 'The mission could not be completed'
}

function getFaultTip(faults: readonly FaultState[]): string {
  if (faults.length === 0) return 'Every resource matters in space. Plan carefully and respond to events quickly!'
  const tip = FAULT_TIPS[faults[0]]
  return tip ?? 'Every resource matters in space. Plan carefully and respond to events quickly!'
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function GameOverScreen(_props: GameOverScreenProps): JSX.Element {
  const navigate = useNavigate()

  const activeFaultStates = useMissionStore((s) => s.activeFaultStates)
  const currentMissionDay = useMissionStore((s) => s.currentMissionDay)
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId)

  // Play sound on mount
  useEffect(() => {
    getAudioManager().playSound('game_over')
  }, [])

  const failureReason = getFailureReason(activeFaultStates)
  const tip = getFaultTip(activeFaultStates)

  function handleTryAgain(): void {
    if (currentMissionId) {
      navigate(`/game/cinematic/${currentMissionId}`)
    } else {
      navigate('/game/campaign')
    }
  }

  function handleReturnToCampaign(): void {
    navigate('/game/campaign')
  }

  return (
    <div
      className="game-bg min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden"
      style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
    >
      {/* Star field */}
      <div className="star-field" aria-hidden="true" />

      {/* Failure emoji */}
      <div
        className="relative z-10 text-6xl mb-4"
        role="img"
        aria-label="Mission failed"
      >
        💔
      </div>

      {/* Heading */}
      <h1 className="relative z-10 text-3xl font-black text-[#EF4444] text-center mb-2">
        Mission Failed
      </h1>

      {/* Failure reason */}
      <p className="relative z-10 text-base font-semibold text-white text-center mb-2">
        {failureReason}
      </p>

      {/* Day reached */}
      <p className="relative z-10 text-sm text-[#C4B5FD] mb-6 text-center">
        You survived <strong className="text-white">{currentMissionDay}</strong> days
      </p>

      {/* 1 star consolation */}
      <div
        className="relative z-10 flex gap-2 mb-6"
        aria-label="1 out of 3 stars"
      >
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={30}
            weight={s === 1 ? 'fill' : 'regular'}
            className={s === 1 ? 'text-[#F5A623]' : 'text-[#2a2a4a]'}
          />
        ))}
      </div>

      {/* What went wrong — educational tip */}
      <div className="relative z-10 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-5 py-4 max-w-sm w-full mb-4">
        <p className="text-[10px] uppercase tracking-widest text-[#EF4444] font-bold mb-1">
          What happened?
        </p>
        <p className="text-xs text-white leading-relaxed">{tip}</p>
      </div>

      {/* Additional fault states */}
      {activeFaultStates.length > 1 && (
        <div className="relative z-10 game-card p-3 max-w-sm w-full mb-6">
          <p className="text-[10px] uppercase tracking-widest text-[#C4B5FD] font-bold mb-2">
            Other issues
          </p>
          <ul className="space-y-1">
            {activeFaultStates.slice(1).map((fault) => (
              <li key={fault} className="text-xs text-[#EF4444] flex items-start gap-2">
                <span>⚠️</span>
                <span>{FAULT_MESSAGES[fault] ?? fault}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        <button onClick={handleTryAgain} className="game-btn-primary w-full text-sm">
          🔄 Try Again
        </button>
        <button onClick={handleReturnToCampaign} className="game-btn-teal w-full text-sm">
          🗺️ Return to Campaign
        </button>
      </div>
    </div>
  )
}
