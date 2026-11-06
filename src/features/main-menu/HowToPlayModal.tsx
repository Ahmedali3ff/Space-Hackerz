// src/features/main-menu/HowToPlayModal.tsx
// Full-screen dark overlay modal for game instructions.
// Triggered by the ❓ button on MainMenuScreen.

import React from 'react'

interface HowToPlayModalProps {
  readonly onClose: () => void
}

interface SectionProps {
  readonly heading: string
  readonly bullets: ReadonlyArray<{ emoji: string; text: string }>
}

function HowToSection({ heading, bullets }: SectionProps): JSX.Element {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: 10,
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {heading}
      </p>
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {bullets.map((b) => (
          <div
            key={b.text}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 14,
              color: '#7EB8F7',
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1.5,
            }}
          >
            <span role="img" aria-hidden="true" style={{ flexShrink: 0 }}>
              {b.emoji}
            </span>
            <span>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps): JSX.Element {
  // Close on overlay click, but not on inner modal click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Close on Escape key
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to Play"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Inner modal */}
      <div
        style={{
          background: '#0D1B3E',
          border: '1px solid rgba(59,111,232,0.4)',
          borderRadius: 20,
          maxWidth: 640,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 32,
          position: 'relative',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            How to Play
          </h2>
          <button
            onClick={onClose}
            aria-label="Close How to Play"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(59,111,232,0.25)',
              border: '1px solid rgba(59,111,232,0.4)',
              color: '#FFFFFF',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Nunito, sans-serif',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Section 1: Controls */}
        <HowToSection
          heading="🎮 Controls"
          bullets={[
            { emoji: '🕹️', text: 'Move your astronaut with the joystick (left side)' },
            { emoji: '🖱️', text: 'Click on buildings to interact' },
            { emoji: '⏸', text: 'Pause button (top right) to pause' },
          ]}
        />

        {/* Section 2: Your Mission */}
        <HowToSection
          heading="🎯 Your Mission"
          bullets={[
            { emoji: '⚠️', text: 'Keep your crew alive! Manage 4 resources:' },
            { emoji: '💧', text: 'Water  🍖 Food  🫁 Oxygen  ⚡ Energy' },
            { emoji: '💀', text: 'If any resource hits 0% → Mission FAILED!' },
          ]}
        />

        {/* Section 3: Buildings */}
        <HowToSection
          heading="🏗️ Interact with Buildings"
          bullets={[
            { emoji: '🚶', text: 'Walk near a building → "Press E or Click" prompt appears' },
            { emoji: '🔧', text: 'Open the building panel → take action to fix problems' },
            { emoji: '⚡', text: 'React fast to events → "New Mission!" alerts' },
          ]}
        />

        {/* Section 4: Days & Time */}
        <HowToSection
          heading="📅 Days & Time"
          bullets={[
            { emoji: '▶️', text: 'Press "Advance Day" to progress time' },
            { emoji: '📉', text: 'Each day consumes resources' },
            { emoji: '🏆', text: 'Survive until the mission end day to WIN!' },
          ]}
        />

        {/* CTA button */}
        <button
          onClick={onClose}
          className="sh-btn-gold"
          style={{
            width: '100%',
            height: 48,
            fontSize: 16,
            marginTop: 8,
          }}
        >
          Got it! Let's Go 🚀
        </button>
      </div>
    </div>
  )
}
