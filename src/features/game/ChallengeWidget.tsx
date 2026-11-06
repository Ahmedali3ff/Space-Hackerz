// src/features/game/ChallengeWidget.tsx
// Fixed-position overlay widget showing the first active challenge.
// Position: top:240px, left:16px, width:230px — just below ResourceHUD.

import { EventBus } from '@/game/EventBus'
import { useChallengeStore } from '@store/challenge-store'
import { CHALLENGES } from '@/game3d/challenges/challenge-definitions'

interface ChallengeWidgetProps {
  readonly onOpenBuilding: (buildingId: string) => void
}

export function ChallengeWidget({ onOpenBuilding }: ChallengeWidgetProps): JSX.Element | null {
  const activeChallenges = useChallengeStore((s) => s.activeChallenges)

  if (activeChallenges.length === 0) return null

  const first = activeChallenges[0]
  if (first === undefined) return null

  const def = CHALLENGES.find((c) => c.id === first.challengeId)
  if (def === undefined) return null

  const extraCount = activeChallenges.length - 1

  // Color by urgency
  const urgencyColor =
    first.daysRemaining <= 1
      ? '#EF4444'
      : first.daysRemaining <= 2
        ? '#F5A623'
        : '#FFB800'

  // Countdown bar width — clamp 0–100
  const barPct = Math.max(0, Math.min(100, (first.daysRemaining / def.timeLimit) * 100))

  function handleGoToBuilding(): void {
    EventBus.emit('highlight-building', { buildingId: def!.targetBuildingId })
    onOpenBuilding(def!.targetBuildingId)
  }

  return (
    <div
      aria-label={`Active challenge: ${def.title}`}
      style={{
        position: 'fixed',
        top: 240,
        left: 16,
        width: 230,
        zIndex: 20,
        background: 'rgba(10,14,26,0.94)',
        border: `1px solid ${urgencyColor}`,
        borderRadius: 14,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: `0 0 12px ${urgencyColor}44`,
      }}
    >
      {/* Title */}
      <p
        style={{
          color: urgencyColor,
          fontSize: 12,
          fontWeight: 900,
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {def.title}
      </p>

      {/* Description */}
      <p
        style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: 11,
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {def.description}
      </p>

      {/* Countdown label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Nunito, sans-serif' }}>
          ⏳ Time left
        </span>
        <span style={{ color: urgencyColor, fontSize: 11, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
          {first.daysRemaining} day{first.daysRemaining !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Countdown bar */}
      <div
        role="progressbar"
        aria-valuenow={first.daysRemaining}
        aria-valuemin={0}
        aria-valuemax={def.timeLimit}
        aria-label={`${first.daysRemaining} days remaining`}
        style={{
          height: 6,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: urgencyColor,
            width: `${barPct}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Consequence warning */}
      <p
        style={{
          color: '#EF4444',
          fontSize: 10,
          fontFamily: 'Nunito, sans-serif',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        ⚠️ {def.consequence}
      </p>

      {/* Go to building button */}
      <button
        onClick={handleGoToBuilding}
        aria-label={`Go to ${def.targetBuildingId.replace(/-/g, ' ')}`}
        style={{
          background: urgencyColor,
          color: '#000',
          fontWeight: 900,
          fontSize: 12,
          fontFamily: 'Nunito, sans-serif',
          border: 'none',
          borderRadius: 8,
          padding: '8px 0',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'center',
        }}
      >
        → Go to {def.targetBuildingId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </button>

      {/* Extra challenges badge */}
      {extraCount > 0 && (
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
            fontFamily: 'Nunito, sans-serif',
            textAlign: 'center',
            margin: 0,
          }}
        >
          +{extraCount} more challenge{extraCount !== 1 ? 's' : ''} pending
        </p>
      )}
    </div>
  )
}
