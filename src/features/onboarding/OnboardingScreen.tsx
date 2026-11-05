// src/features/onboarding/OnboardingScreen.tsx
// Landing / welcome screen for ASTRA Mission Control Academy.
// Single entry point: the "Begin Mission" CTA navigates to planet selection.

import { useNavigate } from 'react-router-dom'
import { Rocket } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'

// No props — this is a route-level component
interface OnboardingScreenProps {}

export function OnboardingScreen(_props: OnboardingScreenProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <AppShell title="ASTRA Mission Control">
      <ScreenTransition routeKey="/">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16 text-center">
          {/* ── Brand mark ── */}
          <div className="mb-6 flex items-center justify-center">
            <span
              className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-accent-ignition/10 ring-2 ring-accent-ignition/40"
              aria-hidden="true"
            >
              <Rocket size={48} weight="duotone" className="text-accent-ignition" />
            </span>
          </div>

          {/* ── Title ── */}
          <h2 className="font-display text-6xl font-bold tracking-tight text-text-primary sm:text-7xl">
            ASTRA
          </h2>
          <p className="mt-2 font-display text-2xl font-semibold tracking-widest text-text-secondary sm:text-3xl">
            Mission Control Academy
          </p>

          {/* ── Tagline ── */}
          <p className="mt-6 font-mono text-lg font-medium tracking-widest text-accent-orbit sm:text-xl">
            Explore.&nbsp;&nbsp;Decide.&nbsp;&nbsp;Survive.&nbsp;&nbsp;Learn.
          </p>

          {/* ── Intro copy ── */}
          <div className="glass-panel mx-auto mt-10 max-w-2xl rounded-xl p-6 text-left">
            <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
              You are a <span className="font-semibold text-text-primary">mission commander</span>{' '}
              tasked with leading a brave crew on a journey to another world. Manage your oxygen,
              water, food, and power — and respond to emergencies that could end the mission in an
              instant.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Every decision you make has a real scientific consequence. Your crew is counting on
              you.
            </p>
            <p className="mt-4 text-base font-semibold leading-relaxed text-text-primary sm:text-lg">
              Are you ready to launch?
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="mt-10">
            <PrimaryButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/select-planet')}
              ariaLabel="Begin Mission — go to planet selection"
            >
              <Rocket size={22} aria-hidden="true" />
              Begin Mission
            </PrimaryButton>
          </div>

          {/* ── Decorative planet hint ── */}
          <p className="mt-8 text-sm text-text-muted">
            Moon or Mars? That's your first choice.
          </p>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
