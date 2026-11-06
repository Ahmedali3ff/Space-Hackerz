// src/game3d/components/HabitatWorld.tsx
// Main React Three Fiber Canvas scene — full 3D habitat world.
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls, Sparkles } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'

import { LunarTerrain } from './LunarTerrain'
import { MarsTerrain } from './MarsTerrain'
import { HabitatDome } from './HabitatDome'
import { SolarArray } from './SolarArray'
import { SatelliteDish } from './SatelliteDish'
import { PowerGenerator } from './PowerGenerator'
import { KidAstronaut } from './KidAstronaut'
import { EarthInSky } from './EarthInSky'
import type { ResourceSnapshot } from '@simulation/types'

// ── Props ──────────────────────────────────────────────────────────────────────

export interface HabitatWorldProps {
  readonly planetId: 'moon' | 'mars'
  readonly resources: ResourceSnapshot
  readonly initialResources: ResourceSnapshot
  readonly crewStatus: 'happy' | 'worried' | 'scared'
  readonly commanderName: string
  readonly highlightedBuildingId?: string | null
  readonly onBuildingClick: (buildingId: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatus(value: number, max: number): 'nominal' | 'warning' | 'critical' {
  const pct = max > 0 ? value / max : 0
  if (pct < 0.15) return 'critical'
  if (pct < 0.35) return 'warning'
  return 'nominal'
}

// ── Inner scene — separated from Canvas so hooks work correctly ───────────────

function SceneContent({
  planetId,
  resources,
  initialResources,
  crewStatus,
  commanderName,
  onBuildingClick,
  highlightedId,
}: HabitatWorldProps & { readonly highlightedId: string | null | undefined }): JSX.Element {
  const oxygenStatus = getStatus(resources.oxygen_kg, initialResources.oxygen_kg)
  const waterStatus = getStatus(resources.water_kg, initialResources.water_kg)
  const foodStatus = getStatus(resources.food_kg, initialResources.food_kg)
  const energyStatus = getStatus(resources.energy_kWh, initialResources.energy_kWh)
  const energyPct =
    initialResources.energy_kWh > 0
      ? (resources.energy_kWh / initialResources.energy_kWh) * 100
      : 50

  return (
    <>
      {/* ── Lighting ───────────────────────────────────────────────────────── */}
      <ambientLight intensity={planetId === 'mars' ? 0.25 : 0.35} />
      <directionalLight
        position={[50, 60, 20]}
        intensity={planetId === 'mars' ? 1.0 : 1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color={planetId === 'mars' ? '#ffaa55' : '#ffffff'}
      />
      <pointLight
        position={[0, 8, 0]}
        intensity={0.4}
        color={planetId === 'mars' ? '#ff8844' : '#aaccff'}
      />
      {/* Rim light from the opposite side */}
      <directionalLight
        position={[-30, 20, -30]}
        intensity={planetId === 'mars' ? 0.15 : 0.2}
        color={planetId === 'mars' ? '#ff6633' : '#4466ff'}
      />

      {/* ── Sky ────────────────────────────────────────────────────────────── */}
      <Stars radius={200} depth={80} count={4000} factor={4} fade speed={0.5} />
      {planetId === 'moon' && <EarthInSky />}

      {/* Mars atmosphere haze */}
      {planetId === 'mars' && (
        <mesh>
          <sphereGeometry args={[95, 32, 32]} />
          <meshBasicMaterial
            color="#92400E"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Mars dust particles */}
      {planetId === 'mars' && (
        <Sparkles
          count={180}
          scale={35}
          size={1.8}
          speed={0.25}
          color="#f97316"
          opacity={0.35}
        />
      )}

      {/* ── Terrain ────────────────────────────────────────────────────────── */}
      {planetId === 'moon' ? <LunarTerrain /> : <MarsTerrain />}

      {/* ── Habitat domes ──────────────────────────────────────────────────── */}
      <HabitatDome
        position={[-6, 0, -4]}
        name="Life Support"
        status={oxygenStatus}
        color="#E0F2FE"
        highlighted={highlightedId === 'life-support'}
        onClick={() => onBuildingClick('life-support')}
      />
      <HabitatDome
        position={[0, 0, -5]}
        name="Command Center"
        status="nominal"
        color="#F0FDF4"
        highlighted={highlightedId === 'command-center'}
        onClick={() => onBuildingClick('command-center')}
      />
      <HabitatDome
        position={[10, 0, 0]}
        name="Water Recycling"
        status={waterStatus}
        color="#EFF6FF"
        highlighted={highlightedId === 'water-recycling'}
        onClick={() => onBuildingClick('water-recycling')}
      />
      <HabitatDome
        position={[-6, 0, 4]}
        name="Greenhouse"
        status={foodStatus}
        color="#F0FFF4"
        highlighted={highlightedId === 'greenhouse'}
        onClick={() => onBuildingClick('greenhouse')}
      />

      {/* ── Special buildings ──────────────────────────────────────────────── */}
      <SolarArray
        position={[-11, 0, 0]}
        energyPct={energyPct}
        status={energyStatus}
        highlighted={highlightedId === 'solar-panels'}
        onClick={() => onBuildingClick('solar-panels')}
      />
      <PowerGenerator
        position={[6, 0, -4]}
        energyPct={energyPct}
        status={energyStatus}
        highlighted={highlightedId === 'power-room'}
        onClick={() => onBuildingClick('power-room')}
      />
      <SatelliteDish
        position={[6, 0, 4]}
        highlighted={highlightedId === 'communications'}
        onClick={() => onBuildingClick('communications')}
      />

      {/* ── Airlock — simple module ─────────────────────────────────────────── */}
      <group
        position={[0, 0, 6]}
        onClick={() => onBuildingClick('airlock')}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[2.5, 2, 1.5]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Airlock door */}
        <mesh position={[0, 0, 0.76]}>
          <boxGeometry args={[1.0, 1.6, 0.05]} />
          <meshStandardMaterial color="#1FC8C0" emissive="#1FC8C0" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* ── Connecting habitat tunnels ──────────────────────────────────────── */}
      <mesh position={[-3, 0.2, -4.5]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[3, 0.2, -4.5]} rotation={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ── Kid astronauts ─────────────────────────────────────────────────── */}
      <KidAstronaut
        position={[1, 0, 1]}
        name={commanderName || 'Commander'}
        suitColor="#1E40AF"
        status={crewStatus}
        isPlayer
        phaseOffset={0}
      />
      <KidAstronaut
        position={[-2, 0, 2]}
        name="Engineer"
        suitColor="#7C3AED"
        status={crewStatus}
        phaseOffset={1}
      />
      <KidAstronaut
        position={[2.5, 0, -1]}
        name="Scientist"
        suitColor="#059669"
        status={crewStatus}
        phaseOffset={2}
      />

      {/* ── Post processing via tone-mapping only (no postprocessing peer dep) ── */}
      {/* Bloom effect is approximated by emissiveIntensity on glowing materials */}

      {/* ── Camera controls ─────────────────────────────────────────────────── */}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={45}
        target={[0, 1, 0]}
      />
    </>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function HabitatWorld(props: HabitatWorldProps): JSX.Element {
  return (
    <Canvas
      camera={{ position: [0, 12, 22], fov: 58 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{
        width: '100%',
        height: '100%',
        background: props.planetId === 'mars' ? '#1a0808' : '#050810',
      }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} highlightedId={props.highlightedBuildingId ?? null} />
      </Suspense>
    </Canvas>
  )
}
