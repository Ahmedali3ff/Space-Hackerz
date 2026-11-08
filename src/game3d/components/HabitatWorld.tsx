// src/game3d/components/HabitatWorld.tsx
// Main React Three Fiber Canvas scene — full 3D habitat world.
// Features: real WASD/arrow key + joystick player movement, third-person camera,
//           building proximity detection, challenge highlight rings.

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
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

// ── Building definitions (position + id) ──────────────────────────────────────
const BUILDING_POSITIONS: Record<string, [number, number, number]> = {
  'life-support':   [-6, 0, -4],
  'command-center': [0, 0, -5],
  'water-recycling':[10, 0, 0],
  'greenhouse':     [-6, 0, 4],
  'solar-panels':   [-11, 0, 0],
  'power-room':     [6, 0, -4],
  'communications': [6, 0, 4],
  'airlock':        [0, 0, 6],
}
const INTERACTION_RADIUS = 4.5

// ── Props ──────────────────────────────────────────────────────────────────────
export interface HabitatWorldProps {
  readonly planetId: 'moon' | 'mars'
  readonly resources: ResourceSnapshot
  readonly initialResources: ResourceSnapshot
  readonly crewStatus: 'happy' | 'worried' | 'scared'
  readonly commanderName: string
  readonly highlightedBuildingId?: string | null
  readonly joystickDir?: { x: number; y: number }  // -1 to 1 from virtual joystick
  readonly onBuildingClick: (buildingId: string) => void
  readonly onNearBuilding?: (buildingId: string | null) => void  // proximity callback
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getStatus(value: number, max: number): 'nominal' | 'warning' | 'critical' {
  const pct = max > 0 ? value / max : 0
  if (pct < 0.15) return 'critical'
  if (pct < 0.35) return 'warning'
  return 'nominal'
}

// ── Player controller — handles movement + camera follow ─────────────────────
interface PlayerControllerProps {
  readonly joystickDir?: { x: number; y: number }
  readonly onPositionChange: (pos: THREE.Vector3) => void
  readonly onNearBuilding: (id: string | null) => void
  readonly status: 'happy' | 'worried' | 'scared'
  readonly name: string
}

function PlayerController({ joystickDir, onPositionChange, onNearBuilding, status }: PlayerControllerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const pos = useRef(new THREE.Vector3(1, 0, 3))
  const vel = useRef(new THREE.Vector3())
  const facing = useRef(0) // Y rotation
  const keysRef = useRef<Set<string>>(new Set())
  const lastNearRef = useRef<string | null>(null)
  const { camera } = useThree()

  const SPEED = 6
  const CAMERA_DISTANCE = 10
  const CAMERA_HEIGHT = 6

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current.add(e.key.toLowerCase()) }
    const up   = (e: KeyboardEvent) => { keysRef.current.delete(e.key.toLowerCase()) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const keys = keysRef.current

    // Compute movement direction from keyboard + joystick
    let dx = 0
    let dz = 0

    if (keys.has('w') || keys.has('arrowup'))    dz -= 1
    if (keys.has('s') || keys.has('arrowdown'))  dz += 1
    if (keys.has('a') || keys.has('arrowleft'))  dx -= 1
    if (keys.has('d') || keys.has('arrowright')) dx += 1

    // Virtual joystick input
    if (joystickDir) {
      dx += joystickDir.x
      dz += joystickDir.y
    }

    const isMoving = dx !== 0 || dz !== 0

    if (isMoving) {
      // Normalise diagonal
      const len = Math.sqrt(dx * dx + dz * dz)
      dx /= len; dz /= len

      // Update facing angle
      facing.current = Math.atan2(dx, dz)
      groupRef.current.rotation.y = facing.current

      // Move
      vel.current.set(dx * SPEED * delta, 0, dz * SPEED * delta)
      pos.current.add(vel.current)

      // World bounds clamp
      pos.current.x = Math.max(-18, Math.min(18, pos.current.x))
      pos.current.z = Math.max(-14, Math.min(14, pos.current.z))

      // Walking arm swing
      const t = Date.now() / 200
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = Math.sin(t) * 0.6
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t) * 0.6
    } else {
      // Idle bob
      const t = Date.now() / 600
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = Math.sin(t) * 0.15
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t) * 0.15
    }

    // Apply position to group
    groupRef.current.position.set(pos.current.x, 0, pos.current.z)

    // Bob y slightly
    groupRef.current.position.y = isMoving
      ? Math.abs(Math.sin(Date.now() / 150)) * 0.06
      : Math.sin(Date.now() / 800) * 0.04

    // Third-person camera follow
    const behind = new THREE.Vector3(
      Math.sin(facing.current) * CAMERA_DISTANCE,
      CAMERA_HEIGHT,
      Math.cos(facing.current) * CAMERA_DISTANCE,
    )
    const targetCamPos = pos.current.clone().add(behind)
    camera.position.lerp(targetCamPos, 0.08)
    const lookTarget = pos.current.clone().add(new THREE.Vector3(0, 1.5, 0))
    camera.lookAt(lookTarget)

    // Notify parent of position
    onPositionChange(pos.current.clone())

    // Proximity detection
    let nearest: string | null = null
    let nearestDist = INTERACTION_RADIUS
    for (const [id, bpos] of Object.entries(BUILDING_POSITIONS)) {
      const dist = Math.sqrt(
        (pos.current.x - bpos[0]) ** 2 + (pos.current.z - bpos[2]) ** 2
      )
      if (dist < nearestDist) { nearestDist = dist; nearest = id }
    }
    if (nearest !== lastNearRef.current) {
      lastNearRef.current = nearest
      onNearBuilding(nearest)
    }
  })

  const faceEmoji = status === 'happy' ? '😊' : status === 'worried' ? '😟' : '😱'
  void faceEmoji

  return (
    <group ref={groupRef} position={[1, 0, 3]}>
      {/* Helmet */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.52, 20, 20]} />
        <meshStandardMaterial color="white" metalness={0.1} roughness={0.4} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 1.68, 0.38]}>
        <sphereGeometry args={[0.33, 16, 10, 0, Math.PI * 2, 0.3, Math.PI * 0.55]} />
        <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.05} transparent opacity={0.88} />
      </mesh>
      {/* NASA patch */}
      <mesh position={[0.28, 1.78, 0.38]} rotation={[0, -0.6, 0]}>
        <circleGeometry args={[0.1, 8]} />
        <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.4} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.72, 0.82, 0.52]} />
        <meshStandardMaterial color="#1E40AF" metalness={0.1} roughness={0.6} />
      </mesh>
      {/* NASA text on suit */}
      <mesh position={[0, 0.88, 0.27]}>
        <boxGeometry args={[0.4, 0.12, 0.02]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.2} />
      </mesh>
      {/* Backpack */}
      <mesh position={[0, 0.88, -0.32]}>
        <boxGeometry args={[0.48, 0.58, 0.2]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.5, 0.88, 0]}>
        <capsuleGeometry args={[0.12, 0.52, 4, 8]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.5, 0.88, 0]}>
        <capsuleGeometry args={[0.12, 0.52, 4, 8]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, 0.26, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, 0.26, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
        <meshStandardMaterial color="#1E40AF" />
      </mesh>
      {/* Face emoji */}
      {/* Using a simple colored sphere as face indicator instead of Html to avoid depth issues */}
      <mesh position={[0, 1.68, 0.42]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={status === 'happy' ? '#10B981' : status === 'worried' ? '#F59E0B' : '#EF4444'}
          emissive={status === 'happy' ? '#10B981' : status === 'worried' ? '#F59E0B' : '#EF4444'}
          emissiveIntensity={1.0}
        />
      </mesh>
      {/* Player indicator ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <ringGeometry args={[0.5, 0.65, 24]} />
        <meshBasicMaterial color="#1FC8C0" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// ── Inner scene ────────────────────────────────────────────────────────────────
function SceneContent({
  planetId, resources, initialResources, crewStatus, commanderName,
  onBuildingClick, highlightedId, joystickDir, onNearBuilding,
}: HabitatWorldProps & {
  readonly highlightedId: string | null | undefined
  readonly joystickDir: { x: number; y: number }
  readonly onNearBuilding: (id: string | null) => void
}): JSX.Element {
  const oxygenStatus = getStatus(resources.oxygen_kg, initialResources.oxygen_kg)
  const waterStatus  = getStatus(resources.water_kg,  initialResources.water_kg)
  const foodStatus   = getStatus(resources.food_kg,   initialResources.food_kg)
  const energyStatus = getStatus(resources.energy_kWh, initialResources.energy_kWh)
  const energyPct    = initialResources.energy_kWh > 0
    ? (resources.energy_kWh / initialResources.energy_kWh) * 100 : 50

  const [, setPlayerPos] = useState(new THREE.Vector3(1, 0, 3))

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={planetId === 'mars' ? 0.25 : 0.35} />
      <directionalLight position={[50, 60, 20]} intensity={planetId === 'mars' ? 1.0 : 1.3}
        castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        color={planetId === 'mars' ? '#ffaa55' : '#ffffff'} />
      <pointLight position={[0, 8, 0]} intensity={0.4} color={planetId === 'mars' ? '#ff8844' : '#aaccff'} />
      <directionalLight position={[-30, 20, -30]} intensity={0.2} color={planetId === 'mars' ? '#ff6633' : '#4466ff'} />

      {/* Sky */}
      <Stars radius={200} depth={80} count={4000} factor={4} fade speed={0.5} />
      {planetId === 'moon' && <EarthInSky />}
      {planetId === 'mars' && (
        <mesh>
          <sphereGeometry args={[95, 32, 32]} />
          <meshBasicMaterial color="#92400E" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
      {planetId === 'mars' && (
        <Sparkles count={180} scale={35} size={1.8} speed={0.25} color="#f97316" opacity={0.35} />
      )}

      {/* Terrain */}
      {planetId === 'moon' ? <LunarTerrain /> : <MarsTerrain />}

      {/* Habitat domes */}
      <HabitatDome position={[-6, 0, -4]} name="Life Support" status={oxygenStatus} color="#E0F2FE"
        highlighted={highlightedId === 'life-support'} onClick={() => onBuildingClick('life-support')} />
      <HabitatDome position={[0, 0, -5]} name="Command Center" status="nominal" color="#F0FDF4"
        highlighted={highlightedId === 'command-center'} onClick={() => onBuildingClick('command-center')} />
      <HabitatDome position={[10, 0, 0]} name="Water Recycling" status={waterStatus} color="#EFF6FF"
        highlighted={highlightedId === 'water-recycling'} onClick={() => onBuildingClick('water-recycling')} />
      <HabitatDome position={[-6, 0, 4]} name="Greenhouse" status={foodStatus} color="#F0FFF4"
        highlighted={highlightedId === 'greenhouse'} onClick={() => onBuildingClick('greenhouse')} />

      {/* Special buildings */}
      <SolarArray position={[-11, 0, 0]} energyPct={energyPct} status={energyStatus}
        highlighted={highlightedId === 'solar-panels'} onClick={() => onBuildingClick('solar-panels')} />
      <PowerGenerator position={[6, 0, -4]} energyPct={energyPct} status={energyStatus}
        highlighted={highlightedId === 'power-room'} onClick={() => onBuildingClick('power-room')} />
      <SatelliteDish position={[6, 0, 4]}
        highlighted={highlightedId === 'communications'} onClick={() => onBuildingClick('communications')} />

      {/* Airlock */}
      <group position={[0, 0, 6]} onClick={() => onBuildingClick('airlock')}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 2, 1.5]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.76]}>
          <boxGeometry args={[1.0, 1.6, 0.05]} />
          <meshStandardMaterial color="#1FC8C0" emissive="#1FC8C0" emissiveIntensity={0.4} />
        </mesh>
        {highlightedId === 'airlock' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
            <torusGeometry args={[2.2, 0.14, 8, 40]} />
            <meshStandardMaterial color="#FFB800" emissive="#FFB800" emissiveIntensity={2.0} />
          </mesh>
        )}
      </group>

      {/* Connecting tunnels */}
      <mesh position={[-3, 0.2, -4.5]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[3, 0.2, -4.5]} rotation={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Player-controlled commander */}
      <PlayerController
        joystickDir={joystickDir}
        onPositionChange={setPlayerPos}
        onNearBuilding={onNearBuilding}
        status={crewStatus}
        name={commanderName || 'Commander'}
      />

      {/* NPC crew members */}
      <KidAstronaut position={[-2, 0, 2]} name="Engineer" suitColor="#7C3AED" status={crewStatus} phaseOffset={1} />
      <KidAstronaut position={[2.5, 0, -1]} name="Scientist" suitColor="#059669" status={crewStatus} phaseOffset={2} />
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
      style={{ width: '100%', height: '100%', background: props.planetId === 'mars' ? '#1a0808' : '#050810' }}
    >
      <Suspense fallback={null}>
        <SceneContent
          {...props}
          highlightedId={props.highlightedBuildingId ?? null}
          joystickDir={props.joystickDir ?? { x: 0, y: 0 }}
          onNearBuilding={props.onNearBuilding ?? (() => {})}
        />
      </Suspense>
    </Canvas>
  )
}
