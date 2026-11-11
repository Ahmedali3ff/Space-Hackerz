// src/features/game/PauseMenuOverlay.tsx
// In-game pause overlay — uses callbacks, NOT navigate(-1).

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissionControl } from '@/hooks/useMissionControl'
import { getAudioManager } from '@/services/audio-manager'

interface PauseMenuOverlayProps {
  readonly onResume: () => void
  readonly levelId?: string
}

export function PauseMenuOverlay({ onResume, levelId }: PauseMenuOverlayProps): JSX.Element {
  const navigate = useNavigate()
  const { currentMissionDay, missionDurationDays } = useMissionControl()
  const [muted, setMutedState] = useState(false)
  const resumeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { resumeBtnRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onResume()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onResume])

  function handleResume(): void {
    getAudioManager().playSound('click')
    onResume()
  }

  function handleRestart(): void {
    getAudioManager().playSound('click')
    navigate(`/game/cinematic/${levelId ?? 'level-1'}`)
  }

  function handleMainMenu(): void {
    getAudioManager().playSound('click')
    navigate('/campaign-map')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pause menu"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5,10,26,0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div style={{
        background: '#0D1B3E',
        border: '1px solid rgba(59,111,232,0.4)',
        borderRadius: 20,
        padding: '32px 28px',
        width: 320,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>⏸</span>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '4px 0 2px' }}>Game Paused</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            Day {currentMissionDay} / {missionDurationDays}
          </p>
        </div>

        <button ref={resumeBtnRef} onClick={handleResume}
          style={{ background: 'linear-gradient(135deg,#1FC8C0,#0D9488)', border: 'none', borderRadius: 50, padding: '14px 0', color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'Nunito,sans-serif', boxShadow: '0 4px 16px rgba(31,200,192,0.4)' }}>
          ▶ Resume Mission
        </button>

        <button onClick={handleRestart}
          style={{ background: 'rgba(59,111,232,0.2)', border: '1px solid rgba(59,111,232,0.5)', borderRadius: 50, padding: '12px 0', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
          🔄 Restart Mission
        </button>

        <button onClick={() => { setMutedState(m => { getAudioManager().setMuted(!m); return !m }) }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, padding: '12px 0', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
          {muted ? '🔇 Unmute Sound' : '🔊 Mute Sound'}
        </button>

        <button onClick={handleMainMenu}
          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 50, padding: '12px 0', color: '#EF4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
          🗺️ Quit to Map
        </button>

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Press Esc to resume</p>
      </div>
    </div>
  )
}
