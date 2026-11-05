// src/features/game/CinematicIntroScreen.tsx
// Story intro screen shown before gameplay for each mission.
// Full-screen dark background with planet CSS orb, typewriter text reveal,
// and a "Begin Mission" CTA that navigates to gameplay.

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMissionById } from '@data/missions/mission-definitions'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'

// ── Props ─────────────────────────────────────────────────────────────────────

interface CinematicIntroScreenProps {
  // intentionally empty — reads from URL params
}

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 40): string {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    // Respect prefers-reduced-motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplayed(text)
      return
    }

    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return displayed
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function CinematicIntroScreen(_props: CinematicIntroScreenProps): JSX.Element {
  const { missionId } = useParams<{ missionId: string }>()
  const navigate = useNavigate()

  const mission = missionId ? getMissionById(missionId) : undefined
  const startMissionProgress = useMissionProgressStore((s) => s.startMission)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)
  const setMissionDuration = useMissionStore((s) => s.setMissionDuration)
  const setCrewSize = useMissionStore((s) => s.setCrewSize)

  const introText = mission?.storyIntro ?? mission?.description ?? 'Your mission begins now.'
  const displayedText = useTypewriter(introText, 38)

  // Planet orb CSS class
  const planetClass =
    mission?.bgTheme === 'moon'
      ? 'moon-planet'
      : mission?.bgTheme === 'mars'
      ? 'mars-planet'
      : 'purple-planet'

  function handleBeginMission(): void {
    if (!mission) return
    // Pre-populate store with mission defaults so initializeMission() works
    selectPlanet(mission.planet)
    setMissionDuration(mission.duration)
    setCrewSize(2) // default crew for campaign
    startMissionProgress(mission.id)
    navigate(`/game/play/${mission.id}`)
  }

  function handleSkipIntro(): void {
    if (!mission) return
    selectPlanet(mission.planet)
    setMissionDuration(mission.duration)
    setCrewSize(2)
    startMissionProgress(mission.id)
    navigate(`/game/play/${mission.id}`)
  }

  if (!mission) {
    return (
      <div className="game-bg min-h-screen flex items-center justify-center">
        <p className="text-white">Mission not found.</p>
      </div>
    )
  }

  return (
    <div className="game-bg min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Star field */}
      <div className="star-field" aria-hidden="true" />

      {/* Planet orb — animated float */}
      <div
        className={`${planetClass} mb-6 animate-[float-astronaut_3s_ease-in-out_infinite_alternate]`}
        aria-hidden="true"
        style={{ width: 140, height: 140 }}
      />

      {/* Mission number badge */}
      <div className="relative z-10 mb-3">
        <span className="text-xs uppercase tracking-widest text-[#F5A623] font-bold">
          Mission {mission.number} of 8
        </span>
      </div>

      {/* Mission title */}
      <h1 className="relative z-10 text-2xl font-black text-white text-center leading-tight mb-2">
        {mission.title}
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-sm text-[#C4B5FD] mb-6 text-center">
        {mission.subtitle}
      </p>

      {/* Typewriter story intro */}
      <div
        className="relative z-10 game-card p-5 max-w-sm w-full mb-6 min-h-[80px]"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-white leading-relaxed">
          {displayedText}
          <span className="animate-pulse text-[#1FC8C0]" aria-hidden="true">
            {displayedText.length < introText.length ? '|' : ''}
          </span>
        </p>
      </div>

      {/* Concept taught badge */}
      {mission.conceptTaught && (
        <div className="relative z-10 mb-6 flex items-center gap-2 bg-[#1FC8C0]/10 border border-[#1FC8C0]/30 rounded-xl px-4 py-2">
          <span className="text-[#1FC8C0] text-xs font-bold">📚 You will learn:</span>
          <span className="text-white text-xs font-semibold">{mission.conceptTaught}</span>
        </div>
      )}

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleBeginMission}
          className="game-btn-primary w-full text-sm"
        >
          🚀 Begin Mission
        </button>
        <button
          onClick={handleSkipIntro}
          className="text-sm text-[#C4B5FD] hover:text-white transition-colors py-2"
        >
          Skip Intro
        </button>
      </div>
    </div>
  )
}
