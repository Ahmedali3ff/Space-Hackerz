// src/features/settings/GameSettingsScreen.tsx
// Simple settings placeholder with back navigation.

import { useNavigate } from 'react-router-dom'
import { getAudioManager } from '@/services/audio-manager'
import { useState } from 'react'

export function GameSettingsScreen(): JSX.Element {
  const navigate = useNavigate()
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)

  function handleVolumeChange(v: number): void {
    setVolume(v)
    getAudioManager().setVolume(v)
  }

  function handleMuteToggle(): void {
    const next = !muted
    setMuted(next)
    getAudioManager().setMuted(next)
  }

  return (
    <div
      className="sh-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(13,27,62,0.95)',
          border: '1px solid rgba(59,111,232,0.35)',
          borderRadius: 20,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚙️</div>
          <h1
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: 900,
              margin: 0,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Settings
          </h1>
          <p style={{ color: '#7EB8F7', fontSize: 14, marginTop: 6 }}>
            Adjust your game preferences
          </p>
        </div>

        {/* Audio section */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <p
            style={{
              color: '#1FC8C0',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            🔊 Audio
          </p>

          {/* Volume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="settings-volume"
              style={{ color: 'white', fontSize: 13, fontWeight: 600 }}
            >
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              id="settings-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              style={{ accentColor: '#1FC8C0', width: '100%' }}
              aria-label="Master volume"
            />
          </div>

          {/* Mute toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Mute All Sounds</span>
            <button
              onClick={handleMuteToggle}
              role="switch"
              aria-checked={muted}
              aria-label="Mute all sounds"
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: muted ? '#7C3AED' : 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: 3,
                  left: muted ? 23 : 3,
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            background: '#1FC8C0',
            color: 'black',
            fontWeight: 900,
            fontSize: 15,
            fontFamily: 'Nunito, sans-serif',
            border: 'none',
            borderRadius: 12,
            padding: '14px 0',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
