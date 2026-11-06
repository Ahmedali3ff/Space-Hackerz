// src/game3d/components/CinematicIntro.tsx
// Full-screen cinematic opening sequence with 3D ship landing, crew walkout,
// and dialog bubbles. Uses CSS transitions — no framer-motion dependency.
import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { LunarTerrain } from './LunarTerrain'
import { MarsTerrain } from './MarsTerrain'
import { KidAstronaut } from './KidAstronaut'

// ── Types ──────────────────────────────────────────────────────────────────────

interface CinematicIntroProps {
  readonly planetId: 'moon' | 'mars'
  readonly commanderName: string
  readonly onComplete: () => void
}

type Phase = 'blackout' | 'title' | 'landing' | 'walkout' | 'dialog' | 'ready'

interface DialogEntry {
  readonly speaker: string
  readonly emoji: string
  readonly color: string
  readonly text: string
}

// ── Dialog lines ───────────────────────────────────────────────────────────────

function buildDialogs(commanderName: string): readonly DialogEntry[] {
  return [
    {
      speaker: 'Commander',
      emoji: '👨‍🚀',
      color: '#3B82F6',
      text: `Mission Control, ${commanderName} reporting. We have landed! Initiating habitat setup.`,
    },
    {
      speaker: 'Engineer',
      emoji: '🔧',
      color: '#8B5CF6',
      text: 'Commander, all life support systems are nominal. Crew is ready for deployment!',
    },
    {
      speaker: 'Scientist',
      emoji: '🔬',
      color: '#10B981',
      text: "I'm detecting traces of water ice nearby. This is an incredible discovery!",
    },
    {
      speaker: 'Astro-AI',
      emoji: '🤖',
      color: '#1FC8C0',
      text: 'Day 1 objectives loaded. Remember: manage your resources carefully. Good luck, Commander!',
    },
  ] as const
}

// ── Landing ship component ─────────────────────────────────────────────────────

interface LandingShipProps {
  readonly phase: Phase
}

function LandingShip({ phase }: LandingShipProps): JSX.Element {
  const shipRef = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Mesh>(null)
  const targetY = phase === 'blackout' || phase === 'title' ? 30 : 0.5

  useFrame(() => {
    if (!shipRef.current) return
    shipRef.current.position.y = THREE.MathUtils.lerp(
      shipRef.current.position.y,
      targetY,
      0.04,
    )

    if (dustRef.current) {
      const mat = dustRef.current.material as THREE.MeshBasicMaterial
      mat.opacity =
        shipRef.current.position.y < 2
          ? Math.max(0, 1 - shipRef.current.position.y / 2) * 0.6
          : 0
    }
  })

  return (
    <group ref={shipRef} position={[0, 30, -8]}>
      {/* Rocket body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 1.2, 5, 12]} />
        <meshStandardMaterial color="#E5E7EB" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[0.8, 2, 12]} />
        <meshStandardMaterial color="#E5E7EB" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* NASA logo patch */}
      <mesh position={[0, 1, 0.82]}>
        <circleGeometry args={[0.35, 12]} />
        <meshStandardMaterial
          color="#DC2626"
          emissive="#DC2626"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Engine glow */}
      <mesh position={[0, -2.8, 0]}>
        <coneGeometry args={[0.6, 1.5, 8]} />
        <meshStandardMaterial
          color="#F97316"
          emissive="#F97316"
          emissiveIntensity={2.0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Engine exhaust outer */}
      <mesh position={[0, -3.5, 0]}>
        <coneGeometry args={[0.9, 1.5, 8]} />
        <meshStandardMaterial
          color="#FCD34D"
          emissive="#FCD34D"
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Landing legs (4) */}
      {[0, 90, 180, 270].map((angle) => (
        <mesh
          key={angle}
          position={[
            Math.cos((angle * Math.PI) / 180) * 1.5,
            -2.5,
            Math.sin((angle * Math.PI) / 180) * 1.5,
          ]}
          rotation={[
            0,
            0,
            angle > 90 && angle < 270 ? 0.4 : -0.4,
          ]}
        >
          <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
          <meshStandardMaterial
            color="#9CA3AF"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Landing dust ring */}
      <mesh ref={dustRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
        <ringGeometry args={[1.5, 4, 32]} />
        <meshBasicMaterial
          color="#D1D5DB"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CinematicIntro({
  planetId,
  commanderName,
  onComplete,
}: CinematicIntroProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('blackout')
  const [dialogIdx, setDialogIdx] = useState(-1)
  const [showWalkout, setShowWalkout] = useState(false)
  const dialogs = buildDialogs(commanderName)

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete()
      return
    }

    const timers = [
      setTimeout(() => setPhase('title'), 600),
      setTimeout(() => setPhase('landing'), 3000),
      setTimeout(() => {
        setPhase('walkout')
        setShowWalkout(true)
      }, 7500),
      setTimeout(() => {
        setPhase('dialog')
        setDialogIdx(0)
      }, 11500),
      setTimeout(() => setDialogIdx(1), 15000),
      setTimeout(() => setDialogIdx(2), 18000),
      setTimeout(() => setDialogIdx(3), 20500),
      setTimeout(() => setPhase('ready'), 23500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [prefersReducedMotion, onComplete])

  const currentDialog =
    dialogIdx >= 0 && dialogIdx < dialogs.length ? dialogs[dialogIdx] : null

  const bgColor = planetId === 'mars' ? '#1a0808' : '#050810'

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* ── 3D Scene ─────────────────────────────────────────────────────── */}
      <Canvas
        camera={{ position: [0, 8, 18], fov: 60 }}
        shadows
        style={{ position: 'absolute', inset: 0 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[40, 50, 20]}
          intensity={1.0}
          castShadow
          color={planetId === 'mars' ? '#ffaa55' : '#ffffff'}
        />
        <Stars radius={200} depth={60} count={3000} factor={4} />
        {planetId === 'moon' ? <LunarTerrain /> : <MarsTerrain />}
        <LandingShip phase={phase} />
        {showWalkout && (
          <>
            <KidAstronaut
              position={[1, 0, 1]}
              name={commanderName || 'Commander'}
              suitColor="#1E40AF"
              status="happy"
              isPlayer
              phaseOffset={0}
            />
            <KidAstronaut
              position={[-2, 0, 2]}
              name="Engineer"
              suitColor="#7C3AED"
              status="happy"
              phaseOffset={1}
            />
            <KidAstronaut
              position={[2.5, 0, -1]}
              name="Scientist"
              suitColor="#059669"
              status="happy"
              phaseOffset={2}
            />
          </>
        )}
      </Canvas>

      {/* ── Black overlay — fades out ────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'black',
          pointerEvents: 'none',
          opacity: phase === 'blackout' ? 1 : 0,
          transition: 'opacity 1.2s ease',
          zIndex: 30,
        }}
      />

      {/* ── Mission title ────────────────────────────────────────────────── */}
      {(phase === 'title' || phase === 'landing') && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 20,
            animation: 'cinFadeInUp 1s ease',
          }}
        >
          <p
            style={{
              color: '#1FC8C0',
              fontSize: 13,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
            }}
          >
            Year 2047 — Mission Day 1
          </p>
          <h1
            style={{
              color: 'white',
              fontSize: 36,
              fontWeight: 900,
              fontFamily: 'Nunito, sans-serif',
              margin: '8px 0 0',
              textShadow: '0 0 30px rgba(255,255,255,0.3)',
            }}
          >
            {planetId === 'moon' ? '🌙 Lunar Base Alpha' : '🔴 Mars Colony One'}
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontFamily: 'Nunito, sans-serif',
              marginTop: 8,
            }}
          >
            Commander {commanderName} — stand by for landing…
          </p>
        </div>
      )}

      {/* ── Dialog bubble ────────────────────────────────────────────────── */}
      {currentDialog && (
        <div
          key={dialogIdx}
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,14,26,0.92)',
            border: `2px solid ${currentDialog.color}`,
            borderRadius: 16,
            padding: '16px 24px',
            maxWidth: 480,
            zIndex: 20,
            animation: 'cinFadeInUp 0.4s ease',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>{currentDialog.emoji}</span>
            <span
              style={{
                color: currentDialog.color,
                fontWeight: 700,
                fontSize: 13,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {currentDialog.speaker}
            </span>
          </div>
          <p
            style={{
              color: 'white',
              fontSize: 15,
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {currentDialog.text}
          </p>
        </div>
      )}

      {/* ── Ready to play ─────────────────────────────────────────────────── */}
      {phase === 'ready' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: '10%',
            zIndex: 20,
          }}
        >
          <h2
            style={{
              color: '#FFD700',
              fontSize: 28,
              fontWeight: 900,
              fontFamily: 'Nunito, sans-serif',
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
              marginBottom: 24,
            }}
          >
            🚀 Mission Started!
          </h2>
          <button
            onClick={onComplete}
            className="game-btn-primary"
            style={{ fontSize: 18, padding: '16px 48px' }}
          >
            Begin Mission ▶
          </button>
        </div>
      )}

      {/* ── Skip button — always visible ─────────────────────────────────── */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 40,
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 8,
          padding: '8px 18px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          fontFamily: 'Nunito, sans-serif',
          cursor: 'pointer',
        }}
      >
        Skip Intro ▶▶
      </button>

      {/* ── Keyframes ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes cinFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
