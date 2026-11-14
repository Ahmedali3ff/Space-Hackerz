// src/features/main-menu/HowToPlayModal.tsx
// Full-screen dark overlay modal for the SPACE HACKERZ mission brief.

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
      aria-label="About Space HackerZ"
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
            About Space HackerZ
          </h2>
          <button
            onClick={onClose}
            aria-label="Close About Space HackerZ"
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

        {/* Section 1: Identity */}
        <HowToSection
          heading="🚀 Our mission"
          bullets={[
            { emoji: '🌍', text: 'SPACE HACKERZ is an interactive survival simulator about life beyond Earth.' },
            { emoji: '🧑‍🚀', text: 'You command the crew, protect the habitat, and make the decisions that keep it alive.' },
          ]}
        />

        {/* Section 2: Experience */}
        <HowToSection
          heading="🧪 Real systems, real consequences"
          bullets={[
            { emoji: '💧', text: 'Water, food, oxygen, and energy change with every decision.' },
            { emoji: '⚠️', text: 'A rushed or incorrect action can create a real mission failure.' },
          ]}
        />

        {/* Section 3: Player role */}
        <HowToSection
          heading="🎯 Your role"
          bullets={[
            { emoji: '🕹️', text: 'Explore the habitat, walk to facilities, and interact with the system you need.' },
            { emoji: '🔧', text: 'Complete each task in order before the mission timer reaches zero.' },
          ]}
        />

        {/* Section 4: Progress */}
        <HowToSection
          heading="🏆 Progress is earned"
          bullets={[
            { emoji: '⭐', text: 'Your stars depend on completed objectives, correct decisions, and remaining time.' },
            { emoji: '📡', text: 'Every explorer builds an individual mission record.' },
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
          Enter Mission Control 🚀
        </button>
      </div>
    </div>
  )
}
