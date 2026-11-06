// src/game3d/components/HabitatDome.tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface HabitatDomeProps {
  readonly position: readonly [number, number, number]
  readonly name: string
  readonly status: 'nominal' | 'warning' | 'critical'
  readonly color?: string
  readonly highlighted?: boolean
  readonly onClick: () => void
}

export function HabitatDome({
  position,
  name,
  status,
  color = '#E5E7EB',
  highlighted = false,
  onClick,
}: HabitatDomeProps): JSX.Element {
  const glowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const highlightRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const statusColor =
    status === 'nominal' ? '#1FC8C0' : status === 'warning' ? '#F5A623' : '#EF4444'

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      if (status === 'critical') {
        mat.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.7
      } else {
        mat.emissiveIntensity = 1.2
      }
    }
    if (groupRef.current) {
      const target = hovered ? 1.06 : 1.0
      groupRef.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        0.12,
      )
    }
    if (highlightRef.current) {
      // Pulsing gold ring when highlighted
      const mat = highlightRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = highlighted
        ? 1.5 + Math.sin(state.clock.elapsedTime * 5) * 1.2
        : 0
      highlightRef.current.visible = highlighted
      // Rotate the ring
      if (highlighted) {
        highlightRef.current.rotation.z += 0.04
      }
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Base cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 1.2, 16]} />
        <meshStandardMaterial color="#D1D5DB" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Dome top — clickable */}
      <mesh
        position={[0, 0.6, 0]}
        castShadow
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.25}
          transparent
          opacity={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[1.65, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.35}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Status ring */}
      <mesh
        ref={glowRef}
        position={[0, 0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1.65, 0.1, 8, 40]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Gold highlight ring — visible when building is targeted by a challenge */}
      <mesh
        ref={highlightRef}
        position={[0, 1.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        visible={highlighted}
      >
        <torusGeometry args={[2.1, 0.12, 8, 40]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={highlighted ? 1.5 : 0}
          transparent
          opacity={highlighted ? 0.9 : 0}
        />
      </mesh>

      {/* Windows (4 cardinal directions) */}
      {([0, 90, 180, 270] as const).map((angle) => (
        <mesh
          key={angle}
          position={[
            Math.cos((angle * Math.PI) / 180) * 1.52,
            0.55,
            Math.sin((angle * Math.PI) / 180) * 1.52,
          ]}
        >
          <circleGeometry args={[0.22, 8]} />
          <meshStandardMaterial
            color="#93C5FD"
            emissive="#60A5FA"
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}

      {/* Label */}
      <Html position={[0, 3.0, 0]} center distanceFactor={14}>
        <div
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
          {name}
        </div>
      </Html>
    </group>
  )
}
