// src/game3d/components/PowerGenerator.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface PowerGeneratorProps {
  readonly position: readonly [number, number, number]
  readonly energyPct: number
  readonly status: 'nominal' | 'warning' | 'critical'
  readonly highlighted?: boolean
  readonly onClick: () => void
}

export function PowerGenerator({
  position,
  energyPct,
  status,
  highlighted = false,
  onClick,
}: PowerGeneratorProps): JSX.Element {
  const boltRef = useRef<THREE.Mesh>(null)
  const highlightRef = useRef<THREE.Mesh>(null)
  const statusColor =
    status === 'nominal' ? '#1FC8C0' : status === 'warning' ? '#F5A623' : '#EF4444'
  const glowIntensity = 0.5 + (energyPct / 100) * 1.5

  useFrame((state) => {
    if (boltRef.current) {
      const mat = boltRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity =
        glowIntensity + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
    if (highlightRef.current) {
      const mat = highlightRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = highlighted
        ? 1.5 + Math.sin(state.clock.elapsedTime * 5) * 1.2
        : 0
      highlightRef.current.visible = highlighted
      if (highlighted) {
        highlightRef.current.rotation.z += 0.04
      }
    }
  })

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Main box */}
      <mesh
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[2, 2, 1.5]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Top warning panel */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[2, 0.1, 1.5]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Vent slots */}
      {[-0.4, 0, 0.4].map((offset) => (
        <mesh key={offset} position={[0.85, offset, 0]}>
          <boxGeometry args={[0.05, 0.25, 1.3]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
      ))}

      {/* Lightning bolt glow */}
      <mesh ref={boltRef} position={[0, 0.2, 0.8]}>
        <boxGeometry args={[0.3, 0.8, 0.05]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={glowIntensity}
        />
      </mesh>

      {/* Status ring at base */}
      <mesh position={[0, -0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.06, 6, 24]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Gold highlight ring */}
      <mesh
        ref={highlightRef}
        position={[0, 1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        visible={highlighted}
      >
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={highlighted ? 1.5 : 0}
          transparent
          opacity={highlighted ? 0.9 : 0}
        />
      </mesh>

      <Html position={[0, 2.0, 0]} center distanceFactor={16} zIndexRange={[10, 0]}>
        <div className="sh-world-label"
          style={{
            background: 'rgba(10,14,26,0.88)',
            border: `1px solid ${statusColor}`,
            borderRadius: 8,
            padding: '3px 10px',
            color: 'white',
            fontSize: 11,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          ⚡ Power Room
        </div>
      </Html>
    </group>
  )
}
