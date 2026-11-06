// src/features/base-configuration/BaseConfigurationScreen.tsx
// Configure habitat systems before launching — Space+ Card layout.
// Cards: Power Systems, Life Support & Agriculture, Mission Readiness sidebar.
// Duration selector wired to mission store (sets missionDurationDays).
// PRESERVED: all slider aria-labels, shielding buttons, 'Start Mission' button,
//            initializeMission call, navigation logic, Back button.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, BatteryHigh, Leaf, ShieldCheck, ArrowLeft, Rocket, Warning } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useMissionStore } from '@store/mission-store'
import { useMissionControl } from '@/hooks/useMissionControl'
import type { BaseConfig, ShieldingLevel } from '@simulation/types'

interface BaseConfigurationScreenProps {}

// ── Local default factory ──────────────────────────────────────────────────────

function getDefaultConfig(_crewSize: number): BaseConfig {
  return {
    solarPanelArea_m2: 50,
    batteryCapacity_kWh: 100,
    agricultureArea_m2: 10,
    shieldingLevel: 'medium',
    lifeSupportEfficiency: 0.85,
  }
}

// ── Range slider ───────────────────────────────────────────────────────────────

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
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-spaceplus-text-heading">
          {icon}
          {label}
        </label>
        <span className="text-base font-bold text-spaceplus-accent-teal tabular-nums">
          {value}
          <span className="ml-1 text-xs font-normal text-spaceplus-text-muted">{unit}</span>
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
        className="w-full cursor-pointer accent-spaceplus-accent-teal"
        style={{
          background: `linear-gradient(to right, #1FC8C0 ${pct}%, #DCE4F7 ${pct}%)`,
        }}
      />
      <p className="text-xs text-spaceplus-text-muted">{microCopy}</p>
    </div>
  )
}

// ── Shielding segmented control ────────────────────────────────────────────────

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
      <div className="flex items-center gap-2 text-sm font-semibold text-spaceplus-text-heading">
        <ShieldCheck size={18} weight="duotone" aria-hidden="true" className="text-spaceplus-accent-teal" />
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
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal
              ${value === level.id
                ? 'border-spaceplus-accent-teal bg-spaceplus-accent-tealLight text-spaceplus-accent-tealDark'
                : 'border-spaceplus-border-light bg-spaceplus-surface text-spaceplus-text-secondary hover:border-spaceplus-border-medium hover:text-spaceplus-text-heading'
              }`}
          >
            {level.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-spaceplus-text-muted">
        Better shielding keeps your crew safer from radiation — but uses more mass and power.
      </p>
    </div>
  )
}

// ── Duration selector ──────────────────────────────────────────────────────────

type MissionDuration = 30 | 60 | 90

const DURATION_OPTIONS: ReadonlyArray<{ value: MissionDuration; label: string; preview: string }> = [
  { value: 30, label: '30 Days', preview: '⚡ Quick mission. Great for beginners.' },
  { value: 60, label: '60 Days', preview: '🚀 Standard challenge. Balanced experience.' },
  { value: 90, label: '90 Days', preview: '⭐ Expert mode. Maximum score bonus.' },
]

interface DurationSelectorProps {
  readonly value: MissionDuration
  readonly onChange: (d: MissionDuration) => void
}

function DurationSelector({ value, onChange }: DurationSelectorProps): JSX.Element {
  const selected = DURATION_OPTIONS.find((o) => o.value === value) ?? DURATION_OPTIONS[0]!
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#1A1D2E]">Mission Length</p>
      <div className="flex gap-2" role="group" aria-label="Mission duration">
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0] ${
              value === opt.value
                ? 'bg-[#1FC8C0] text-white font-semibold border-[#1FC8C0]'
                : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#1FC8C0]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#6B7280]">{selected.preview}</p>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export function BaseConfigurationScreen(_props: BaseConfigurationScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const crewSize = useMissionStore((s) => s.crewSize)
  const setBaseConfig = useMissionStore((s) => s.setBaseConfig)
  const missionDurationDays = useMissionStore((s) => s.missionDurationDays)
  const setMissionDuration = useMissionStore((s) => s.setMissionDuration)
  const { initializeMission } = useMissionControl()

  const [draft, setDraft] = useState<BaseConfig>(() => getDefaultConfig(crewSize))
  // missionDuration is now persisted in the store; local state removed

  const isSetupValid = selectedPlanetId !== null && crewSize >= 1

  const planetLabel = selectedPlanetId === 'moon' ? 'The Moon' : selectedPlanetId === 'mars' ? 'Mars' : '—'

  function patchDraft(patch: Partial<BaseConfig>): void {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function handleStartMission(): void {
    if (!isSetupValid) return
    setBaseConfig(draft)
    setMissionDuration(missionDurationDays as 30 | 60 | 90)
    initializeMission()
    // Go to Phaser game — level-1 by default, or derived from current mission
    navigate('/game/level-1')
  }

  return (
    <AppShell title="Configure Your Base" variant="light">
      <ScreenTransition routeKey="/configure-base">
        <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-4xl flex-col items-stretch px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <SectionLabel className="block mb-2">Step 3 of 3 — Base Setup</SectionLabel>
            <h2 className="font-display2 text-4xl font-extrabold text-spaceplus-text-heading sm:text-5xl">
              Configure Your Base
            </h2>
            <p className="mt-3 text-lg text-spaceplus-text-secondary">
              Set up your habitat systems before launch. Every choice is a trade-off.
            </p>
          </div>

          {/* ── Guard message ── */}
          {!isSetupValid && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-xl border border-spaceplus-status-warning/50 bg-spaceplus-status-warningBg px-4 py-3 text-sm text-spaceplus-status-warning"
            >
              <Warning size={20} weight="fill" aria-hidden="true" />
              Please select a planet and crew size first before configuring your base.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Main config — 2 columns on lg ── */}
            <div className="space-y-6 lg:col-span-2">
              {/* Power systems */}
              <Card accent="teal">
                <SectionLabel className="block mb-4">Power Systems</SectionLabel>
                <div className="space-y-6">
                  <RangeSlider
                    id="solar-panels"
                    label="Solar Panels"
                    microCopy="More panels = more power. On Mars, panels generate less due to distance from the Sun."
                    value={draft.solarPanelArea_m2}
                    min={0}
                    max={200}
                    step={10}
                    unit="m²"
                    icon={<Sun size={18} weight="duotone" aria-hidden="true" className="text-spaceplus-accent-teal" />}
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
                    icon={<BatteryHigh size={18} weight="duotone" aria-hidden="true" className="text-spaceplus-accent-teal" />}
                    onChange={(v) => patchDraft({ batteryCapacity_kWh: v })}
                  />
                </div>
              </Card>

              {/* Life support */}
              <Card>
                <SectionLabel className="block mb-4">Life Support &amp; Agriculture</SectionLabel>
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
                    icon={<Leaf size={18} weight="duotone" aria-hidden="true" className="text-spaceplus-accent-teal" />}
                    onChange={(v) => patchDraft({ agricultureArea_m2: v })}
                  />
                  <RangeSlider
                    id="life-support-efficiency"
                    label="Life Support Efficiency"
                    microCopy="Higher efficiency means less waste — your crew recycles more and needs less resupply."
                    value={draft.lifeSupportEfficiency}
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    unit=""
                    icon={<ShieldCheck size={18} weight="duotone" aria-hidden="true" className="text-spaceplus-accent-teal" />}
                    onChange={(v) => patchDraft({ lifeSupportEfficiency: v })}
                  />
                </div>
              </Card>

              {/* Radiation shielding */}
              <Card>
                <ShieldingControl
                  value={draft.shieldingLevel}
                  onChange={(level) => patchDraft({ shieldingLevel: level })}
                />
              </Card>
            </div>

            {/* ── Mission readiness sidebar ── */}
            <div className="flex flex-col gap-4">
              <Card accent="teal" className="flex flex-col gap-4">
                <SectionLabel className="block">Mission Readiness</SectionLabel>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Planet</span>
                    <span className="font-semibold text-spaceplus-text-heading">{planetLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Crew</span>
                    <span className="font-semibold text-spaceplus-text-heading">{crewSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Solar Panels</span>
                    <span className="font-semibold text-spaceplus-text-heading">{draft.solarPanelArea_m2} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Battery</span>
                    <span className="font-semibold text-spaceplus-text-heading">{draft.batteryCapacity_kWh} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Shielding</span>
                    <span className="font-semibold text-spaceplus-text-heading capitalize">{draft.shieldingLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Duration</span>
                    <span className="font-semibold text-spaceplus-text-heading">{missionDurationDays} days</span>
                  </div>
                </div>

                <div className="border-t border-spaceplus-border-light pt-4">
                  <DurationSelector value={missionDurationDays as MissionDuration} onChange={setMissionDuration} />
                </div>
              </Card>

            </div>
          </div>

          {/* ── Navigation ── always visible ── */}
          <div className="mt-10 flex items-center justify-between gap-4">
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
                  ? 'Launch your mission'
                  : 'Complete base configuration first'
              }
            >
              <Rocket size={22} aria-hidden="true" />
              Launch Mission
            </PrimaryButton>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
