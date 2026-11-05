// src/features/game/PauseMenuOverlay.tsx
// Pause/settings overlay — fixed full-screen, keyboard Escape to resume.
// Accessible: role='dialog', aria-modal, focus management.
// Reads missionId from URL params to enable restart navigation.

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMissionControl } from '@/hooks/useMissionControl'
import { getMissionById } from '@data/missions/mission-definitions'
import { getAudioManager } from '@/services/audio-manager'

// ── Props ─────────────────────────────────────────────────────────────────────

interface PauseMenuOverlayProps {
  // intentionally empty — reads from URL params
}

// ── Main overlay ──────────────────────────────────────────────────────────────

export function PauseMenuOverlay(_props: PauseMenuOverlayProps): JSX.Element {
  const { missionId } = useParams<{ missionId: string }>()
  const navigate = useNavigate()

  const { currentMissionDay, missionDurationDays, crewSize } = useMissionControl()

  const mission = missionId ? getMissionById(missionId) : undefined

  const [showSettings, setShowSettings] = useState(false)
  const [volume, setVolumeState] = useState(0.8)
  const [muted, setMutedState] = useState(false)

  const resumeBtnRef = useRef<HTMLButtonElement>(null)

  // Trap focus inside overlay on mount
  useEffect(() => {
    resumeBtnRef.current?.focus()
  }, [])

  // Escape key → resume
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        navigate(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  function handleResume(): void {
    getAudioManager().playSound('click')
    navigate(-1)
  }

  function handleRestart(): void {
    getAudioManager().playSound('click')
    navigate(`/game/cinematic/${missionId ?? ''}`)
  }

  function handleMainMenu(): void {
    navigate('/missions')
  }

  function handleVolumeChange(v: number): void {
    setVolumeState(v)
    getAudioManager().setVolume(v)
  }

  function handleMuteToggle(): void {
    const next = !muted
    setMutedState(next)
    getAudioManager().setMuted(next)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pause menu"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="game-card w-full max-w-xs mx-4 p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-black text-white mb-1">⏸ Paused</h2>
          {mission && (
            <p className="text-xs text-[#C4B5FD]">{mission.title}</p>
          )}
        </div>

        {/* Mission info */}
        <div className="bg-[#0A0E1A] rounded-xl px-4 py-3 text-xs text-[#C4B5FD] flex justify-between">
          <span>Day <strong className="text-white">{currentMissionDay}</strong> / {missionDurationDays}</span>
          <span>Crew: <strong className="text-white">{crewSize}</strong></span>
        </div>

        {/* Main actions */}
        <div className="flex flex-col gap-2">
          <button
            ref={resumeBtnRef}
            onClick={handleResume}
            className="game-btn-teal w-full text-sm"
          >
            ▶ Resume Mission
          </button>
          <button
            onClick={handleRestart}
            className="game-btn-primary w-full text-sm"
          >
            🔄 Restart Mission
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-[#C4B5FD] hover:text-white transition-colors py-2 text-center"
          >
            ⚙️ Settings {showSettings ? '▲' : '▼'}
          </button>
          <button
            onClick={handleMainMenu}
            className="text-sm text-[#EF4444]/80 hover:text-[#EF4444] transition-colors py-1 text-center"
          >
            🏠 Main Menu
          </button>
        </div>

        {/* Settings sub-panel */}
        {showSettings && (
          <div className="bg-[#0A0E1A] rounded-xl px-4 py-3 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[#C4B5FD] font-bold">Audio</p>

            {/* Volume slider */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="volume-slider"
                className="text-xs text-white font-semibold"
              >
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-[#1FC8C0]"
                aria-label="Master volume"
              />
            </div>

            {/* Mute toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-semibold">Mute All</span>
              <button
                onClick={handleMuteToggle}
                role="switch"
                aria-checked={muted}
                className={[
                  'w-10 h-5 rounded-full transition-colors',
                  muted ? 'bg-[#7C3AED]' : 'bg-[#1a1a3a]',
                ].join(' ')}
              >
                <span
                  className={[
                    'block w-4 h-4 rounded-full bg-white transition-transform mx-0.5',
                    muted ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
