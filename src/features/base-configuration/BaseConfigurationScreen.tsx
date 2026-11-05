// src/features/base-configuration/BaseConfigurationScreen.tsx
// Configure the habitat systems before launching the mission.
// Uses local draft state for the BaseConfig; commits only on "Start Mission".
// Does NOT import from src/simulation/ — defaults are defined locally.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, BatteryHigh, Leaf, ShieldCheck, ArrowLeft, Rocket, Warning } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Panel } from '@/components/common/Panel'
import { useMissionStore } from '@store/mission-store'
import { useMissionControl } from '@/hooks/useMissionControl'
import type { BaseConfig, ShieldingLevel } from '@simulation/types'

interface BaseConfigurationScreenProps {}

// ── Local default factory (mirrors simulation defaults; no simulation import) ──

function getDefaultConfig(_crewSize: number): BaseConfig {
  return {
    solarPanelArea_m2: 50,
    batteryCapacity_kWh: 100,
    agricultureArea_m2: 10,
    shieldingLevel: 'medium',
    lifeSupportEfficiency: 0.85,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface RangeSliderProps {
  readonly id: string
  readonly label: string
  readonly microCopy: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly unit: string
  readonly icon: JSX.Element
  readonly onChange: (value: number) => void
}

function RangeSlider({
  id,
  label,
  microCopy,
  value,
  min,
  max,
  step,
  unit,
  icon,
  onChange,
}: RangeSliderProps): JSX.Element {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-2 font-semibold text-text-primary">
          {icon}
          {label}
        </label>
        <span className="hud-mono text-lg font-bold text-accent-orbit">
          {value}
          <span className="ml-1 text-sm font-normal text-text-muted">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}: ${value} ${unit}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="w-full cursor-pointer accent-accent-orbit"
        style={{
          background: `linear-gradient(to right, var(--accent-orbit, #29E6F3) ${pct}%, var(--border-subtle, #243456) ${pct}%)`,
        }}
      />
      <p className="text-xs text-text-muted">{microCopy}</p>
    </div>
  )
}

// ── Shielding segmented control ──────────────────────────────────────────────

const SHIELDING_LEVELS: ReadonlyArray<{ id: ShieldingLevel; label: string }> = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
]

interface ShieldingControlProps {
  readonly value: ShieldingLevel
  readonly onChange: (level: ShieldingLevel) => void
}

function ShieldingControl({ value, onChange }: ShieldingControlProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold text-text-primary">
        <ShieldCheck size={20} weight="duotone" aria-hidden="true" className="text-accent-orbit" />
        Radiation Shielding
      </div>
      <div
        role="group"
        aria-label="Radiation shielding level"
        className="flex gap-2"
      >
        {SHIELDING_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            aria-pressed={value === level.id}
            onClick={() => onChange(level.id)}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit
              ${value === level.id
                ? 'border-accent-orbit/70 bg-accent-orbit/10 text-accent-orbit shadow-glow-orbit'
                : 'border-border-subtle bg-space-panel text-text-secondary hover:border-border-strong hover:text-text-primary'
              }`}
          >
            {level.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        Better shielding keeps your crew safer from radiation — but uses more mass and power.
      </p>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function BaseConfigurationScreen(_props: BaseConfigurationScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const crewSize = useMissionStore((s) => s.crewSize)
  const setBaseConfig = useMissionStore((s) => s.setBaseConfig)
  const { initializeMission } = useMissionControl()

  const [draft, setDraft] = useState<BaseConfig>(() => getDefaultConfig(crewSize))

  const isSetupValid = selectedPlanetId !== null && crewSize >= 1

  function patchDraft(patch: Partial<BaseConfig>): void {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function handleStartMission(): void {
    if (!isSetupValid) return
    setBaseConfig(draft)
    initializeMission()
    navigate('/mission')
  }

  return (
    <AppShell title="ASTRA — Configure Your Base">
      <ScreenTransition routeKey="/configure-base">
        <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-3xl flex-col items-stretch px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl font-bold text-text-primary sm:text-5xl">
              Configure Your Base
            </h2>
            <p className="mt-3 text-lg text-text-secondary">
              Set up your habitat systems before launch. Every choice is a trade-off.
            </p>
          </div>

          {/* ── Guard message ── */}
          {!isSetupValid && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl border border-status-warn/50 bg-status-warn/10 px-4 py-3 text-sm text-status-warn"
            >
              <Warning size={20} weight="fill" aria-hidden="true" />
              Please select a planet and crew size first before configuring your base.
            </div>
          )}

          <div className="space-y-6">
            {/* ── Power systems ── */}
            <Panel title="Power Systems" accent="orbit">
              <div className="space-y-6">
                <RangeSlider
                  id="solar-panels"
                  label="Solar Panels"
                  microCopy="More panels = more power. Great for sunny days! On Mars, panels generate less due to distance from the Sun."
                  value={draft.solarPanelArea_m2}
                  min={0}
                  max={200}
                  step={10}
                  unit="m²"
                  icon={<Sun size={20} weight="duotone" aria-hidden="true" className="text-accent-orbit" />}
                  onChange={(v) => patchDraft({ solarPanelArea_m2: v })}
                />
                <RangeSlider
                  id="battery-storage"
                  label="Battery Storage"
                  microCopy="Stores energy for lunar night or Martian dust storms. More capacity = more survival time without sunlight."
                  value={draft.batteryCapacity_kWh}
                  min={0}
                  max={500}
                  step={10}
                  unit="kWh"
                  icon={<BatteryHigh size={20} weight="duotone" aria-hidden="true" className="text-accent-orbit" />}
                  onChange={(v) => patchDraft({ batteryCapacity_kWh: v })}
                />
              </div>
            </Panel>

            {/* ── Life support ── */}
            <Panel title="Life Support &amp; Agriculture" accent="none">
              <div className="space-y-6">
                <RangeSlider
                  id="agriculture-area"
                  label="Agriculture Area"
                  microCopy="Grow your own food to stay self-sufficient. More area = more food grown daily, but needs water and power."
                  value={draft.agricultureArea_m2}
                  min={0}
                  max={50}
                  step={1}
                  unit="m²"
                  icon={<Leaf size={20} weight="duotone" aria-hidden="true" className="text-accent-orbit" />}
                  onChange={(v) => patchDraft({ agricultureArea_m2: v })}
                />
                <RangeSlider
                  id="life-support-efficiency"
                  label="Life Support Efficiency"
                  microCopy="Higher efficiency means less waste of oxygen and water — your crew recycles more and needs less resupply."
                  value={draft.lifeSupportEfficiency}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  unit=""
                  icon={<ShieldCheck size={20} weight="duotone" aria-hidden="true" className="text-accent-orbit" />}
                  onChange={(v) => patchDraft({ lifeSupportEfficiency: v })}
                />
              </div>
            </Panel>

            {/* ── Radiation shielding ── */}
            <Panel accent="none">
              <ShieldingControl
                value={draft.shieldingLevel}
                onChange={(level) => patchDraft({ shieldingLevel: level })}
              />
            </Panel>
          </div>

          {/* ── Navigation ── */}
          <div className="mt-10 flex items-center gap-4">
            <PrimaryButton
              variant="ghost"
              size="md"
              onClick={() => navigate('/select-crew')}
              ariaLabel="Back to crew selection"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back
            </PrimaryButton>

            <PrimaryButton
              variant="primary"
              size="lg"
              disabled={!isSetupValid}
              onClick={handleStartMission}
              ariaLabel={
                isSetupValid
                  ? 'Start the mission'
                  : 'Select a planet and crew size first'
              }
            >
              <Rocket size={22} aria-hidden="true" />
              Start Mission
            </PrimaryButton>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
