// src/game3d/components/SatelliteDish.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface SatelliteDishProps {
  readonly position: readonly [number, number, number]
  readonly highlighted?: boolean
  readonly onClick: () => void
}

export function SatelliteDish({ position, highlighted = false, onClick }: SatelliteDishProps): JSX.Element {
  const dishRef = useRef<THREE.Mesh>(null)
  const highlightRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (dishRef.current) {
      dishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4
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
      {/* Pole */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.15, 3.5, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Horizontal arm */}
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Dish bowl */}
      <mesh
        ref={dishRef}
        position={[0, 2.5, 0]}
        rotation={[-Math.PI / 4, 0, 0]}
        castShadow
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#E5E7EB"
          metalness={0.4}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Signal glow at tip */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#1FC8C0"
          emissive="#1FC8C0"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Signal ring */}
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.03, 6, 20]} />
        <meshStandardMaterial
          color="#1FC8C0"
          emissive="#1FC8C0"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Gold highlight ring */}
      <mesh
        ref={highlightRef}
        position={[0, 2.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        visible={highlighted}
      >
        <torusGeometry args={[1.4, 0.1, 8, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={highlighted ? 1.5 : 0}
          transparent
          opacity={highlighted ? 0.9 : 0}
        />
      </mesh>

      <Html position={[0, 5, 0]} center distanceFactor={14}>
        <div
          style={{
            background: 'rgba(10,14,26,0.88)',
            border: '1px solid #1FC8C0',
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
          📡 Comms Tower
        </div>
      </Html>
    </group>
  )
}
