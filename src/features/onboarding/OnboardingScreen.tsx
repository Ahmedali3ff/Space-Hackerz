// src/features/onboarding/OnboardingScreen.tsx
// Landing / welcome screen for ASTRA Mission Control Academy.
// Space+ light card layout: white Card, Nunito font, teal accent.
// PRESERVED: 'Begin Mission' button, '/select-planet' navigation,
//            sr-only h1 'ASTRA Mission Control', 'Explore'/'Survive'/'Learn' text.

import { useNavigate } from 'react-router-dom'
import { Rocket, Planet, Brain, Flask, ArrowRight } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Card } from '@/components/common/Card'
import { useMissionProgressStore } from '@store/mission-progress-store'

// No props — this is a route-level component
interface OnboardingScreenProps {}

// ── Feature chip ─────────────────────────────────────────────────────────────

interface FeatureChipProps {
  readonly icon: JSX.Element
  readonly label: string
}

function FeatureChip({ icon, label }: FeatureChipProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-spaceplus-border-light bg-spaceplus-card px-4 py-3 text-center shadow-card">
      <span className="text-spaceplus-accent-teal" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs font-semibold text-spaceplus-text-heading">{label}</span>
    </div>
  )
}

export function OnboardingScreen(_props: OnboardingScreenProps): JSX.Element {
  const navigate = useNavigate()
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const setCommanderName = useMissionProgressStore((s) => s.setCommanderName)

  const isReturningPlayer = commanderName.trim().length > 0
  const displayName = commanderName.trim()

  return (
    <AppShell title="Space Hackerz Mission Control" variant="light">
      <ScreenTransition routeKey="/">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
          {/* ── Welcome back card for returning players ── */}
          {isReturningPlayer && (
            <Card className="mx-auto w-full max-w-lg text-center mb-6 bg-spaceplus-accent-tealLight border-spaceplus-accent-teal/30">
              <p className="text-sm font-semibold text-spaceplus-text-heading mb-1">
                Welcome back, {displayName}! 👋
              </p>
              <p className="text-xs text-spaceplus-text-secondary mb-4">
                Ready to continue your cosmic journey?
              </p>
              <PrimaryButton
                variant="hint"
                size="md"
                onClick={() => navigate('/campaign-map')}
                ariaLabel="Continue Mission — go to campaign map"
              >
                <ArrowRight size={20} aria-hidden="true" />
                Continue Mission
              </PrimaryButton>
            </Card>
          )}

          {/* ── Main card ── */}
          <Card className="mx-auto w-full max-w-lg text-center">
            {/* Rocket logo */}
            <div className="mb-6 flex items-center justify-center" aria-hidden="true">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-spaceplus-accent-tealLight ring-2 ring-spaceplus-accent-teal/40">
                <Rocket size={42} weight="duotone" className="text-spaceplus-accent-teal" />
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display2 text-5xl font-extrabold text-spaceplus-text-heading">
              Space<span className="text-[#1FC8C0]">Hackerz</span>
            </h2>
            <p className="mt-1 font-display2 text-lg font-semibold text-spaceplus-text-secondary">
              Mission Control Academy
            </p>
            <p className="mt-4 font-display2 text-base font-medium tracking-wide text-spaceplus-accent-teal">
              Explore.&nbsp;&nbsp;Decide.&nbsp;&nbsp;Survive.&nbsp;&nbsp;Learn.
            </p>

            {/* Feature chips */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <FeatureChip
                icon={<Planet size={24} weight="duotone" />}
                label="Manage Resources"
              />
              <FeatureChip
                icon={<Rocket size={24} weight="duotone" />}
                label="Face Events"
              />
              <FeatureChip
                icon={<Flask size={24} weight="duotone" />}
                label="Discover Science"
              />
            </div>

            {/* Commander name input */}
            <div className="mt-6 text-left">
              <label
                htmlFor="commander-name"
                className="mb-1.5 block text-sm font-semibold text-spaceplus-text-heading"
              >
                Your Name, Commander
              </label>
              <input
                id="commander-name"
                type="text"
                value={commanderName}
                onChange={(e) => setCommanderName(e.target.value)}
                placeholder="Your name, Commander"
                className="w-full rounded-xl border border-spaceplus-border-light bg-spaceplus-surface px-4 py-2.5 text-sm text-spaceplus-text-body placeholder:text-spaceplus-text-muted focus:border-spaceplus-accent-teal focus:outline-none focus:ring-2 focus:ring-spaceplus-accent-teal/30"
              />
            </div>

            {/* CTA — PRESERVED: 'Begin Mission' button text + ariaLabel + navigation */}
            <div className="mt-6">
              <PrimaryButton
                variant="hint"
                size="lg"
                onClick={() => navigate('/select-planet')}
                ariaLabel="Begin Mission — go to planet selection"
              >
                <Rocket size={22} aria-hidden="true" />
                Begin Mission
              </PrimaryButton>
            </div>

            {/* Campaign entry */}
            <div className="mt-3">
              <PrimaryButton
                variant="secondary"
                size="md"
                onClick={() => navigate('/campaign-map')}
                ariaLabel="Play Campaign Mode — go to campaign map"
              >
                <ArrowRight size={20} aria-hidden="true" />
                Play Campaign Mode →
              </PrimaryButton>
            </div>

            {/* Decorative hint */}
            <p className="mt-5 text-xs text-spaceplus-text-muted">
              Moon or Mars? That's your first choice.
            </p>
          </Card>

          {/* Brain science note below card */}
          <div className="mt-6 flex items-center gap-2 text-sm text-spaceplus-text-secondary">
            <Brain size={18} className="text-spaceplus-accent-teal" aria-hidden="true" />
            <span>Every decision has a real scientific consequence.</span>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
