// src/game3d/components/LunarTerrain.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

export function LunarTerrain(): JSX.Element {
  const rocks = useMemo(() => {
    const positions: Array<[number, number, number, number]> = []
    const seeds: Array<[number, number, number]> = [
      [-8, 6, 0.4], [12, -8, 0.6], [-15, 3, 0.35], [7, 12, 0.5], [-5, -15, 0.45],
      [20, 5, 0.55], [-20, 8, 0.4], [3, 18, 0.5], [14, 14, 0.6], [-12, -10, 0.38],
      [5, -5, 0.3], [-3, 7, 0.45], [18, -3, 0.5], [-7, -7, 0.35],
    ]
    seeds.forEach(([x, z, s]) => positions.push([x, 0, z, s]))
    return positions
  }, [])

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 1, 1]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.95} metalness={0} />
      </mesh>

      {/* Crater 1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, -0.1, 10]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color="#6B7280" roughness={1} />
      </mesh>

      {/* Crater 2 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18, -0.1, -12]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#6B7280" roughness={1} />
      </mesh>

      {/* Crater 3 — small */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -0.09, -16]}>
        <circleGeometry args={[1.8, 24]} />
        <meshStandardMaterial color="#6B7280" roughness={1} />
      </mesh>

      {/* Rocks */}
      {rocks.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#6B7280" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// Silence unused import warning — THREE is needed for side-effects
void THREE.REVISION
