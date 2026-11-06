// src/features/game/CriticalFailureScreen.tsx
// Dramatic full-screen overlay when the mission fails critically.
import type { ResourceSnapshot } from '@simulation/types'

interface CriticalFailureScreenProps {
  readonly faultStates: readonly string[]
  readonly dayReached: number
  readonly resources: ResourceSnapshot
  readonly initialResources: ResourceSnapshot
  readonly onRetry: () => void
  readonly onBackToMap: () => void
}

interface CauseInfo {
  readonly message: string
  readonly icon: string
  readonly fact: string
}

const CAUSE_MESSAGES: Readonly<Record<string, CauseInfo>> = {
  OXYGEN_DEPLETED: {
    message: 'Your crew ran out of oxygen',
    icon: '🫁',
    fact: 'Real space stations carry 1–2 months of emergency oxygen reserves. The ISS generates O₂ by splitting water molecules using electricity.',
  },
  WATER_DEPLETED: {
    message: 'Your crew ran out of water',
    icon: '💧',
    fact: 'The ISS recycles 90% of all water, including sweat and urine! Water is so precious that not a single drop can be wasted in space.',
  },
  FOOD_DEPLETED: {
    message: 'Your crew ran out of food',
    icon: '🍖',
    fact: 'NASA grows fresh vegetables on the ISS using LED grow lights. Astronauts can harvest lettuce, radishes, and even hot peppers!',
  },
  POWER_CRITICAL: {
    message: 'All power systems failed',
    icon: '⚡',
    fact: 'The ISS has 8 enormous solar arrays generating up to 120 kilowatts — enough to power 40 average homes. Backup batteries keep systems alive during eclipse.',
  },
} as const

export function CriticalFailureScreen({
  faultStates,
  dayReached,
  resources,
  initialResources,
  onRetry,
  onBackToMap,
}: CriticalFailureScreenProps): JSX.Element {
  const firstFault = faultStates[0] ?? 'UNKNOWN'
  const cause: CauseInfo = CAUSE_MESSAGES[firstFault] ?? {
    message: 'Mission failed due to system overload',
    icon: '🚨',
    fact: 'Space missions require careful resource management at all times. Even a small mistake can have big consequences!',
  }

  function pct(v: number, max: number): number {
    return max > 0 ? Math.round((v / max) * 100) : 0
  }

  const resourceRows = [
    {
      label: '🫁 Oxygen',
      val: resources.oxygen_kg,
      max: initialResources.oxygen_kg,
    },
    {
      label: '💧 Water',
      val: resources.water_kg,
      max: initialResources.water_kg,
    },
    {
      label: '🍖 Food',
      val: resources.food_kg,
      max: initialResources.food_kg,
    },
    {
      label: '⚡ Energy',
      val: resources.energy_kWh,
      max: initialResources.energy_kWh,
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mission failed"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,0,0,0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: 'Nunito, sans-serif',
        padding: '24px 16px',
        animation: 'critFlash 0.6s ease',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @keyframes critFlash {
          0%   { background: rgba(239,68,68,0.8); }
          100% { background: rgba(10,0,0,0.97); }
        }
      `}</style>

      {/* Icon */}
      <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>
        {cause.icon}💥
      </div>

      {/* Title */}
      <h1
        style={{
          color: '#EF4444',
          fontSize: 32,
          fontWeight: 900,
          textAlign: 'center',
          textShadow: '0 0 30px rgba(239,68,68,0.6)',
          marginBottom: 8,
        }}
      >
        Mission Critical Failure
      </h1>

      <p
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {cause.message}
      </p>

      <p
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        Reached Day {dayReached}
      </p>

      {/* Resource status */}
      <div
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 24,
          minWidth: 300,
          maxWidth: 380,
          width: '100%',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 12,
          }}
        >
          Final Resource Status
        </p>
        {resourceRows.map(({ label, val, max }) => {
          const p = pct(val, max)
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {label}
              </span>
              <span
                style={{
                  color: p < 10 ? '#EF4444' : '#F5A623',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {p}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Educational fact */}
      <div
        style={{
          background: 'rgba(31,200,192,0.1)',
          border: '1px solid rgba(31,200,192,0.3)',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 32,
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#1FC8C0',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 6,
            letterSpacing: '0.08em',
          }}
        >
          🔬 Did You Know?
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {cause.fact}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onRetry}
          className="game-btn-primary"
          style={{ fontSize: 16, padding: '14px 32px' }}
        >
          🔄 Try Again
        </button>
        <button
          onClick={onBackToMap}
          className="game-btn-teal"
          style={{ fontSize: 16, padding: '14px 32px' }}
        >
          🗺️ Back to Map
        </button>
      </div>
    </div>
  )
}
