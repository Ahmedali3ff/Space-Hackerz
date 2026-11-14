import { Html } from '@react-three/drei'

interface FacilityUnitProps {
  readonly position: readonly [number, number, number]
  readonly kind: 'water' | 'greenhouse'
  readonly highlighted?: boolean
  readonly onClick: () => void
}

export function FacilityUnit({ position, kind, highlighted = false, onClick }: FacilityUnitProps): JSX.Element {
  const water = kind === 'water'
  const accent = water ? '#38BDF8' : '#4ADE80'
  return <group position={position} onClick={onClick}>
    {water ? <>
      <mesh position={[-.65, 1, 0]} castShadow><cylinderGeometry args={[.62, .62, 2.2, 16]} /><meshStandardMaterial color="#0E7490" metalness={.55} roughness={.25} /></mesh>
      <mesh position={[.65, 1, 0]} castShadow><cylinderGeometry args={[.62, .62, 2.2, 16]} /><meshStandardMaterial color="#0369A1" metalness={.55} roughness={.25} /></mesh>
      <mesh position={[0, 2.05, 0]}><torusGeometry args={[.75, .09, 8, 24]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} /></mesh>
      <mesh position={[0, .5, .65]}><boxGeometry args={[1.9, .12, .12]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.7} /></mesh>
    </> : <>
      <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[2.8, 2, 2.2]} /><meshPhysicalMaterial color="#14532D" transparent opacity={.42} roughness={.12} transmission={.15} /></mesh>
      {[-.75, 0, .75].map((x) => <group key={x} position={[x, .5, 0]}><mesh><cylinderGeometry args={[.08, .1, 1.2, 8]} /><meshStandardMaterial color="#854D0E" /></mesh><mesh position={[0, .7, 0]}><sphereGeometry args={[.34, 10, 8]} /><meshStandardMaterial color="#22C55E" emissive="#16A34A" emissiveIntensity={.3} /></mesh></group>)}
      <mesh position={[0, 2.05, 0]}><boxGeometry args={[3, .08, 2.4]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.55} transparent opacity={.7} /></mesh>
    </>}
    <mesh position={[0, .05, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, .08, 8, 32]} /><meshStandardMaterial color={highlighted ? '#FFD700' : accent} emissive={highlighted ? '#FFD700' : accent} emissiveIntensity={highlighted ? 2 : 1} /></mesh>
    <Html position={[0, 2.8, 0]} center distanceFactor={16} zIndexRange={[10, 0]}><div className="sh-world-label" style={{ borderColor: accent }}>{water ? '💧 Water Recycling' : '🌱 Hydroponics Greenhouse'}</div></Html>
  </group>
}
