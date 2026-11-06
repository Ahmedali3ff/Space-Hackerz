// src/game3d/components/EarthInSky.tsx
import * as THREE from 'three'

export function EarthInSky(): JSX.Element {
  return (
    <group position={[60, 40, -80]}>
      {/* Main ocean sphere */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#1D4ED8"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* North America / land mass */}
      <mesh position={[-2, 2, 7.2]}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshStandardMaterial
          color="#166534"
          emissive="#166534"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Atlantic ocean highlight */}
      <mesh position={[3, -1, 7]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#1D4ED8"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* White polar ice cap */}
      <mesh position={[0, 7.8, 0]}>
        <sphereGeometry args={[2.2, 12, 8]} />
        <meshStandardMaterial
          color="#E5E7EB"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Atmosphere glow shell */}
      <mesh>
        <sphereGeometry args={[8.8, 32, 32]} />
        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
