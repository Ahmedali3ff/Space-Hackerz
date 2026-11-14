// src/game3d/components/SolarArray.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface SolarArrayProps {
  readonly position: readonly [number, number, number]
  readonly energyPct: number
  readonly status: 'nominal' | 'warning' | 'critical'
  readonly highlighted?: boolean
  readonly onClick: () => void
}

export function SolarArray({
  position,
  energyPct,
  status,
  highlighted = false,
  onClick,
}: SolarArrayProps): JSX.Element {
  const panel1Ref = useRef<THREE.Mesh>(null)
  const highlightRef = useRef<THREE.Mesh>(null)
  const statusColor =
    status === 'nominal' ? '#1FC8C0' : status === 'warning' ? '#F5A623' : '#EF4444'
  const glowIntensity = (energyPct / 100) * 1.6

  // Slowly track the sun
  useFrame((state) => {
    if (panel1Ref.current) {
      panel1Ref.current.rotation.x =
        Math.PI / 6 + Math.sin(state.clock.elapsedTime * 0.05) * 0.1
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
      {/* Support poles */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#6B7280" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Solar panel */}
      <mesh ref={panel1Ref} position={[1, 2.2, 0]} castShadow>
        <boxGeometry args={[3.5, 0.06, 2]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#1D4ED8"
          emissiveIntensity={glowIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Grid lines on panel */}
      <mesh position={[1, 2.24, 0]}>
        <boxGeometry args={[3.5, 0.01, 0.04]} />
        <meshStandardMaterial color="#93C5FD" emissive="#93C5FD" emissiveIntensity={0.5} />
      </mesh>

      {/* Status ring base */}
      <mesh position={[1, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.06, 6, 24]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Gold highlight ring */}
      <mesh
        ref={highlightRef}
        position={[1, 1.5, 0]}
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

      {/* Invisible click target */}
      <mesh
        position={[1, 1.5, 0]}
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[5, 4, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html position={[1, 3.5, 0]} center distanceFactor={16} zIndexRange={[10, 0]}>
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
          ☀️ Solar Array
        </div>
      </Html>
    </group>
  )
}
