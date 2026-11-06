// src/game3d/components/MarsTerrain.tsx
import { useMemo } from 'react'

export function MarsTerrain(): JSX.Element {
  const rocks = useMemo(
    () =>
      [
        [-8, 6, 0.5],
        [12, -8, 0.65],
        [-15, 3, 0.4],
        [7, 12, 0.55],
        [-5, -15, 0.5],
        [20, 5, 0.6],
        [-20, 8, 0.45],
        [3, 18, 0.55],
        [14, 14, 0.65],
        [-12, -10, 0.42],
        [5, -5, 0.35],
        [-3, 7, 0.5],
        [22, -12, 0.7],
        [-10, 20, 0.4],
      ] as const,
    [],
  )

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#92400E" roughness={0.98} metalness={0} />
      </mesh>

      {/* Dust layer overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#B45309"
          transparent
          opacity={0.25}
          roughness={1}
        />
      </mesh>

      {/* Volcanic ridge — left */}
      <mesh position={[-22, 0.5, -8]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[8, 1, 3]} />
        <meshStandardMaterial color="#78350F" roughness={1} />
      </mesh>

      {/* Volcanic ridge — right */}
      <mesh position={[20, 0.4, 10]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[6, 0.8, 2.5]} />
        <meshStandardMaterial color="#7C2D12" roughness={1} />
      </mesh>

      {/* Rocks */}
      {rocks.map(([x, z, s], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#78350F' : '#92400E'}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}
