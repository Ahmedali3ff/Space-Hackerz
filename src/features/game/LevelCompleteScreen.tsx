// src/features/game/LevelCompleteScreen.tsx
// Level completion celebration screen shown after a successful mission.
// Gold particle effect, star rating, XP summary, and story outro.

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star } from '@phosphor-icons/react'
import { getMissionById } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'
import { getAudioManager } from '@/services/audio-manager'

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

// ── Gold particle dots (CSS radial-gradient via inline bg) ────────────────────

function GoldParticles(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: [
          'radial-gradient(2px 2px at 15% 20%, rgba(255,215,0,0.6), transparent 60%)',
          'radial-gradient(2px 2px at 75% 15%, rgba(255,215,0,0.5), transparent 60%)',
          'radial-gradient(1.5px 1.5px at 40% 60%, rgba(245,166,35,0.7), transparent 60%)',
          'radial-gradient(2px 2px at 90% 45%, rgba(255,215,0,0.4), transparent 60%)',
          'radial-gradient(1.5px 1.5px at 25% 80%, rgba(255,215,0,0.5), transparent 60%)',
          'radial-gradient(2px 2px at 60% 85%, rgba(245,166,35,0.6), transparent 60%)',
          'radial-gradient(1px 1px at 50% 10%, rgba(255,215,0,0.8), transparent 60%)',
        ].join(', '),
        backgroundSize: '700px 700px',
        backgroundRepeat: 'repeat',
        animation: 'star-twinkle 2.5s ease-in-out infinite',
      }}
    />
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

  const starsEarned = calcStarsEarned(currentMissionDay, missionDurationDays)
  const xpEarned = starsEarned * 20 + (mission?.number ?? 1) * 10

  // Play sound and record completion on mount
  useEffect(() => {
    getAudioManager().playSound('level_complete')
  }, [])

  function handleContinueCampaign(): void {
    if (missionId) {
      completeMission(missionId, starsEarned)
    }
    navigate('/game/campaign')
  }

  function handleViewReport(): void {
    navigate('/debrief')
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
      {/* Star field + gold particles */}
      <div className="star-field" aria-hidden="true" />
      <GoldParticles />

      {/* Astronaut emoji floating */}
      <div
        className="text-6xl mb-4 animate-[float-astronaut_2s_ease-in-out_infinite_alternate]"
        role="img"
        aria-label="Celebrating astronaut"
      >
        👨‍🚀
      </div>

      {/* Mission complete heading */}
      <h1 className="relative z-10 gold-glow-text text-3xl font-black text-center mb-1">
        Mission Complete!
      </h1>
      <p className="relative z-10 text-lg font-bold text-white text-center mb-4">
        {mission.title}
      </p>

      {/* Stars */}
      <div className="relative z-10 flex gap-2 mb-4" aria-label={`${starsEarned} out of 3 stars`}>
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={36}
            weight={s <= starsEarned ? 'fill' : 'regular'}
            className={s <= starsEarned ? 'text-[#F5A623]' : 'text-[#2a2a4a]'}
          />
        ))}
      </div>

      {/* XP earned */}
      <div className="relative z-10 mb-4 flex items-center gap-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-5 py-2">
        <span className="text-[#F5A623] font-black text-xl">+{xpEarned}</span>
        <span className="text-white text-sm font-bold">XP Earned</span>
      </div>

      {/* Concept taught */}
      {mission.conceptTaught && (
        <div className="relative z-10 mb-4 bg-[#1FC8C0]/10 border border-[#1FC8C0]/30 rounded-xl px-4 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-0.5">
            Science Learned
          </p>
          <p className="text-sm text-white font-semibold">{mission.conceptTaught}</p>
        </div>
      )}

      {/* Story outro */}
      <div className="relative z-10 game-card p-4 max-w-sm w-full mb-6 text-center">
        <p className="text-sm text-white leading-relaxed italic">
          "{mission.storyOutro ?? 'Great work, Commander!'}"
        </p>
      </div>

      {/* Task summary */}
      <div className="relative z-10 game-card p-4 max-w-sm w-full mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#1FC8C0] font-bold mb-2">
          Tasks Completed
        </p>
        <ul className="space-y-1.5">
          {mission.tasks.map((task) => {
            const done = completedTaskIds.includes(task.id)
            return (
              <li key={task.id} className="flex items-center gap-2 text-xs">
                <span>{done ? '✅' : '⬜'}</span>
                <span className={done ? 'text-[#10B981]' : 'text-[#C4B5FD]'}>{task.label}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        <button onClick={handleContinueCampaign} className="game-btn-primary w-full text-sm">
          🗺️ Continue Campaign
        </button>
        <button onClick={handleViewReport} className="game-btn-teal w-full text-sm">
          📊 View Full Report
        </button>
      </div>
    </div>
  )
}
