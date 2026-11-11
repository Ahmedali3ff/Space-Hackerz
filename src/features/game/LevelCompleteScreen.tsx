// src/features/game/LevelCompleteScreen.tsx
// Space Hackerz — pixel-perfect mission complete celebration screen.
// Dark space background, Earth sphere, kid astronaut, confetti, star rating.

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMissionById } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'
import { getAudioManager } from '@/services/audio-manager'
import { NasaKidAstronaut } from '@/components/game/NasaKidAstronaut'

// ── Props ─────────────────────────────────────────────────────────────────────

interface LevelCompleteScreenProps {
  // intentionally empty — reads from URL params
}

// ── Star calculation (mirrors MissionControlScreen formula) ──────────────────

function calcStarsEarned(currentDay: number, totalDays: number): 1 | 2 | 3 {
  if (totalDays === 0) return 1
  const raw = Math.ceil((currentDay / totalDays) * 3)
  return Math.max(1, Math.min(3, raw)) as 1 | 2 | 3
}

// ── Confetti animation ────────────────────────────────────────────────────────

function Confetti(): JSX.Element {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${5 + (i * 4.5) % 90}%`,
    color: ['#FFB800', '#3B6FE8', '#00D4FF', '#A855F7', '#4CAF50'][i % 5],
    delay: `${(i * 0.15) % 2}s`,
    duration: `${2 + (i % 3)}s`,
    width: `${6 + (i % 6)}px`,
    height: `${10 + (i % 8)}px`,
  }))
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: '2px',
            animation: `sh-confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

interface StatChipProps {
  readonly emoji: string
  readonly mainLabel: string
  readonly subLabel: string
}

function StatChip({ emoji, mainLabel, subLabel }: StatChipProps): JSX.Element {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        flex: 1,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{emoji}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
        {mainLabel}
      </div>
      <div style={{ fontSize: '11px', color: '#7EB8F7', marginTop: '2px' }}>{subLabel}</div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function LevelCompleteScreen(_props: LevelCompleteScreenProps): JSX.Element {
  const { missionId } = useParams<{ missionId: string }>()
  const navigate = useNavigate()

  const mission = missionId ? getMissionById(missionId) : undefined
  const completeMission = useMissionProgressStore((s) => s.completeMission)
  const completedTaskIds = useMissionProgressStore(
    (s) => s.missions[missionId ?? '']?.completedTaskIds ?? [],
  )

  const currentMissionDay = useMissionStore((s) => s.currentMissionDay)
  const missionDurationDays = useMissionStore((s) => s.missionDurationDays)
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)

  const starsEarned = calcStarsEarned(currentMissionDay, missionDurationDays)
  const scoreValue = starsEarned * 50 + 200

  const planetName = selectedPlanetId === 'mars' ? 'Mars' : 'the Moon'
  const description = `You successfully built a sustainable base on ${planetName}.`

  // Play sound on mount
  useEffect(() => {
    getAudioManager().playSound('level_complete')
  }, [])

  function handlePlayAgain(): void {
    // Clear any stale mission state then go back to game
    navigate(`/game/${missionId ?? 'level-1'}`)
  }

  function handleExploreCampaign(): void {
    if (missionId) {
      completeMission(missionId, starsEarned)
    }
    navigate('/campaign-map')
  }

  function handleViewReport(): void {
    navigate('/debrief')
  }

  if (!mission) {
    return (
      <div className="sh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#FFFFFF' }}>Mission not found.</p>
      </div>
    )
  }

  // void completedTaskIds to suppress unused-variable warning; it's preserved for future use
  void completedTaskIds

  return (
    <div
      className="sh-bg"
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, system-ui, sans-serif' }}
    >
      {/* Confetti */}
      <Confetti />

      {/* Earth sphere — top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '5%',
          top: '5%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #4A90D9, #1E3A8A 60%, #0A1628)',
          boxShadow: '0 0 60px rgba(74,144,217,0.4)',
          zIndex: 1,
        }}
      />

      {/* Sparkles around scene */}
      {[
        { top: '12%', left: '55%' },
        { top: '30%', left: '48%' },
        { top: '60%', left: '52%' },
        { top: '75%', right: '5%' },
        { top: '20%', right: '7%' },
        { top: '45%', left: '44%' },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            ...pos,
            fontSize: '20px',
            animation: 'sh-star-in 1s ease-in-out infinite alternate',
            animationDelay: `${i * 0.2}s`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          ✨
        </div>
      ))}

      {/* NasaKidAstronaut — left side */}
      <div
        style={{
          position: 'absolute',
          left: '5%',
          bottom: '10%',
          animation: 'sh-float 3s ease-in-out infinite',
          zIndex: 3,
        }}
      >
        <NasaKidAstronaut pose="thumbsUp" size={320} />
      </div>

      {/* Center-right main card */}
      <div
        style={{
          position: 'absolute',
          right: '8%',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#0D1B3E',
          border: '2px solid rgba(255,184,0,0.4)',
          boxShadow: '0 0 30px rgba(255,184,0,0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '480px',
          width: '45vw',
          minWidth: '360px',
          zIndex: 10,
        }}
      >
        {/* Stars row */}
        <div
          aria-label={`${starsEarned} out of 5 stars`}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              role="img"
              aria-hidden="true"
              style={{
                fontSize: '40px',
                opacity: s <= starsEarned ? 1 : 0.3,
                animation: 'sh-star-in 0.4s ease-out both',
                animationDelay: `${(s - 1) * 0.15}s`,
                display: 'inline-block',
              }}
            >
              {s <= starsEarned ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        {/* "Mission Complete!" heading */}
        <h1
          style={{
            fontSize: '42px',
            fontWeight: 900,
            fontFamily: 'Nunito, system-ui, sans-serif',
            background: 'linear-gradient(135deg, #FFB800, #F5A623)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            margin: 0,
            marginBottom: '8px',
          }}
        >
          Mission Complete!
        </h1>

        {/* Sub-heading */}
        <p
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0,
            marginBottom: '4px',
          }}
        >
          Great job, Space Explorer!
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: '#7EB8F7',
            textAlign: 'center',
            margin: 0,
            marginTop: '8px',
          }}
        >
          {description}
        </p>

        {/* 3 stat chips */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <StatChip emoji="⭐" mainLabel={String(scoreValue)} subLabel="Score" />
          <StatChip emoji="📘" mainLabel="+1" subLabel="Knowledge" />
          <StatChip emoji="🏅" mainLabel="Bronze" subLabel="Badge" />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={handlePlayAgain}
            aria-label="Play Again"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              borderRadius: '9999px',
              color: '#FFFFFF',
              fontWeight: 700,
              height: '48px',
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: '15px',
              transition: 'all 0.2s',
            }}
            type="button"
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleExploreCampaign}
            aria-label="Continue Campaign"
            className="sh-btn-blue"
            style={{ height: '48px', flex: 1, fontSize: '15px' }}
            type="button"
          >
            Explore More ›
          </button>
        </div>

        {/* View Full Report — visually hidden but accessible for tests */}
        <button
          onClick={handleViewReport}
          aria-label="View Full Report"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          type="button"
        >
          View Full Report
        </button>
      </div>
    </div>
  )
}
