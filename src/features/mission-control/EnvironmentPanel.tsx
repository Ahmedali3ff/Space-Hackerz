// src/features/mission-control/EnvironmentPanel.tsx
// Displays planet environment status: solar cycle, temperature, fault states.
// Pure data derivation — no simulation layer imports.

import { Sun, Moon, ThermometerCold, ThermometerHot, Warning } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'
import { Panel } from '@/components/common/Panel'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StatReadout } from '@/components/common/StatReadout'
import type { PlanetProfile } from '@simulation/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSolarStatus(
  profile: PlanetProfile,
  missionDay: number,
): { label: string; status: 'good' | 'warn' | 'info' } {
  if (profile.id === 'moon') {
    const cycleDays = profile.solarCycleDays ?? 28
    const dayLength = profile.solarDayLength ?? 14
    const isLunarDay = missionDay % cycleDays < dayLength
    return isLunarDay
      ? { label: 'Lunar Day', status: 'good' }
      : { label: 'Lunar Night', status: 'warn' }
  }
  // Mars — always nominal for UI purposes (dust storms are handled as events)
  return { label: 'Sol Cycle — Nominal', status: 'info' }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EnvironmentPanelProps {}

export function EnvironmentPanel(_props: EnvironmentPanelProps): JSX.Element {
  const { selectedPlanetId, currentMissionDay, crewSize, activeFaultStates } =
    useMissionControl()

  const profile: PlanetProfile | null =
    selectedPlanetId === 'moon'
      ? MOON_PROFILE
      : selectedPlanetId === 'mars'
      ? MARS_PROFILE
      : null

  if (profile === null) {
    return (
      <Panel title="Environment" accent="none">
        <p className="text-sm text-text-muted">No planet selected.</p>
      </Panel>
    )
  }

  const solarInfo = getSolarStatus(profile, currentMissionDay)
  const SolarIcon = solarInfo.status === 'warn' ? Moon : Sun

  return (
    <Panel title="Environment" accent="none" className="flex flex-col gap-4">
      {/* Planet + day counter */}
      <div className="flex items-start justify-between gap-2">
        <StatReadout
          label="Destination"
          value={profile.displayName}
        />
        <StatReadout
          label={profile.timeUnitLabel}
          value={currentMissionDay}
        />
      </div>

      {/* Solar status */}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-text-muted">Solar Status</span>
        <StatusBadge
          status={solarInfo.status}
          label={solarInfo.label}
          icon={SolarIcon}
        />
      </div>

      {/* Temperature range */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <ThermometerCold size={18} aria-hidden="true" />
          <span>Min</span>
          <span className="hud-mono text-text-primary">{profile.temperatureRange.min}°C</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <ThermometerHot size={18} aria-hidden="true" />
          <span>Max</span>
          <span className="hud-mono text-text-primary">{profile.temperatureRange.max}°C</span>
        </div>
      </div>

      {/* Crew size */}
      <StatReadout
        label="Crew Aboard"
        value={crewSize}
        unit="members"
      />

      {/* Active fault states */}
      {activeFaultStates.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
          <span className="text-xs uppercase tracking-wide text-text-muted">Active Alerts</span>
          <div className="flex flex-wrap gap-2">
            {activeFaultStates.map((fault) => (
              <StatusBadge
                key={fault}
                status="crit"
                label={fault.replace(/_/g, ' ')}
                icon={Warning}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-border-subtle pt-3">
          <StatusBadge status="good" label="All systems nominal" />
        </div>
      )}
    </Panel>
  )
}
