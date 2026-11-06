// src/features/game/ResourceHUD.tsx
// Top-left HUD overlay — four animated resource bars for the 3D gameplay view.

interface ResourceHUDProps {
  readonly oxygen: number
  readonly water: number
  readonly food: number
  readonly energy: number
  readonly maxOxygen: number
  readonly maxWater: number
  readonly maxFood: number
  readonly maxEnergy: number
}

interface ResourceBar {
  readonly icon: string
  readonly label: string
  readonly value: number
  readonly max: number
  readonly baseColor: string
}

export function ResourceHUD({
  oxygen,
  water,
  food,
  energy,
  maxOxygen,
  maxWater,
  maxFood,
  maxEnergy,
}: ResourceHUDProps): JSX.Element {
  const bars: readonly ResourceBar[] = [
    { icon: '🫁', label: 'Oxygen', value: oxygen, max: maxOxygen, baseColor: '#8B5CF6' },
    { icon: '💧', label: 'Water',  value: water,  max: maxWater,  baseColor: '#3B82F6' },
    { icon: '🍖', label: 'Food',   value: food,   max: maxFood,   baseColor: '#10B981' },
    { icon: '⚡', label: 'Energy', value: energy, max: maxEnergy, baseColor: '#F59E0B' },
  ]

  return (
    <div
      aria-label="Resource status"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 215,
      }}
    >
      {bars.map((b) => {
        const pct =
          b.max > 0 ? Math.round(Math.max(0, Math.min(100, (b.value / b.max) * 100))) : 0
        const color = pct < 15 ? '#EF4444' : pct < 35 ? '#F5A623' : b.baseColor
        const isCritical = pct < 15

        return (
          <div
            key={b.label}
            style={{
              background: 'rgba(10,14,26,0.85)',
              backdropFilter: 'blur(8px)',
              border: isCritical
                ? '1px solid rgba(239,68,68,0.6)'
                : '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: isCritical ? 'hudPulse 1s ease-in-out infinite' : 'none',
            }}
          >
            <span style={{ fontSize: 20, width: 24, textAlign: 'center' }}>{b.icon}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {b.label}
                </span>
                <span
                  style={{ color, fontSize: 12, fontWeight: 700 }}
                  aria-label={`${b.label} ${pct}%`}
                >
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={b.label}
              >
                <div
                  style={{
                    height: 7,
                    borderRadius: 4,
                    background: color,
                    width: `${pct}%`,
                    transition: 'width 0.6s ease, background 0.3s ease',
                    boxShadow: isCritical ? `0 0 8px ${color}` : 'none',
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes hudPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%       { box-shadow: 0 0 0 4px rgba(239,68,68,0.3); }
        }
      `}</style>
    </div>
  )
}
