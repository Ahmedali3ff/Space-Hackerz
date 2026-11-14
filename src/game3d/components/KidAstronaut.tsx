// src/game3d/components/KidAstronaut.tsx
// Kid-sized astronaut character with round helmet, colored suit, and animated face emoji.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface KidAstronautProps {
  readonly position: readonly [number, number, number]
  readonly name: string
  readonly suitColor: string
  readonly status?: 'happy' | 'worried' | 'scared'
  readonly isPlayer?: boolean
  readonly phaseOffset?: number
}

export function KidAstronaut({
  position,
  name,
  suitColor,
  status = 'happy',
  isPlayer = false,
  phaseOffset = 0,
}: KidAstronautProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)

  const faceEmoji = status === 'happy' ? '😊' : status === 'worried' ? '😟' : '😱'

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime + phaseOffset
    // Bob up and down
    groupRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.07
    // Slight sway
    groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.04
    // Arm swing
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 1.4) * 0.3
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -Math.sin(t * 1.4) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Helmet sphere */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.52, 20, 20]} />
        <meshStandardMaterial color="white" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Visor */}
      <mesh position={[0, 1.68, 0.38]}>
        <sphereGeometry
          args={[0.33, 16, 10, 0, Math.PI * 2, 0.3, Math.PI * 0.55]}
        />
        <meshStandardMaterial
          color="#1E3A5F"
          metalness={0.9}
          roughness={0.05}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* NASA patch on helmet */}
      <mesh position={[0.28, 1.78, 0.38]} rotation={[0, -0.6, 0]}>
        <circleGeometry args={[0.1, 8]} />
        <meshStandardMaterial
          color="#DC2626"
          emissive="#DC2626"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Helmet light */}
      <mesh position={[-0.3, 1.85, 0.3]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial
          color="#FDE047"
          emissive="#FDE047"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Body / torso */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.72, 0.82, 0.52]} />
        <meshStandardMaterial color={suitColor} metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Chest patch / mission emblem */}
      <mesh position={[0, 1.0, 0.27]}>
        <circleGeometry args={[0.14, 8]} />
        <meshStandardMaterial
          color="#1FC8C0"
          emissive="#1FC8C0"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Life support backpack */}
      <mesh position={[0, 0.88, -0.32]}>
        <boxGeometry args={[0.48, 0.58, 0.2]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Backpack tank indicator */}
      <mesh position={[0, 0.95, -0.43]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
        <meshStandardMaterial
          color="#1FC8C0"
          emissive="#1FC8C0"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.5, 0.88, 0]}>
        <capsuleGeometry args={[0.12, 0.52, 4, 8]} />
        <meshStandardMaterial color={suitColor} />
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.5, 0.88, 0]}>
        <capsuleGeometry args={[0.12, 0.52, 4, 8]} />
        <meshStandardMaterial color={suitColor} />
      </mesh>

      {/* Left glove */}
      <mesh position={[-0.5, 0.5, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Right glove */}
      <mesh position={[0.5, 0.5, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="white" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.2, 0.26, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
        <meshStandardMaterial color={suitColor} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.2, 0.26, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
        <meshStandardMaterial color={suitColor} />
      </mesh>

      {/* Left boot */}
      <mesh position={[-0.2, 0.0, 0.05]}>
        <boxGeometry args={[0.28, 0.12, 0.4]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Right boot */}
      <mesh position={[0.2, 0.0, 0.05]}>
        <boxGeometry args={[0.28, 0.12, 0.4]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Face emoji inside visor */}
      <Html position={[0, 1.68, 0.42]} center distanceFactor={8} zIndexRange={[10, 0]}>
        <div
          style={{
            fontSize: 17,
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {faceEmoji}
        </div>
      </Html>

      {/* Name tag above helmet */}
      <Html position={[0, 2.45, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
        <div
          style={{
            background: isPlayer ? '#1FC8C0' : 'rgba(10,14,26,0.82)',
            border: isPlayer ? 'none' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '2px 8px',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {isPlayer ? `${name} ← YOU` : name}
        </div>
      </Html>
    </group>
  )
}
