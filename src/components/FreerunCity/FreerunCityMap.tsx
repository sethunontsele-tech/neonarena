import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WeatherType, TimeOfDay, CollectibleItem } from './types';

interface FreerunCityMapProps {
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  collectibles: CollectibleItem[];
  onCollect?: (id: string) => void;
  activeCheckpointIndex?: number;
  currentChallengeCheckpoints?: [number, number, number][];
}

// Building definition with rooftop features
interface BuildingData {
  id: string;
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  windowColor: string;
  hasGarden?: boolean;
  hasHelipad?: boolean;
  hasWaterTower?: boolean;
  hasConstruction?: boolean;
  hasACUnits?: boolean;
  hasSolarPanels?: boolean;
  hasAntenna?: boolean;
  name?: string;
}

export function FreerunCityMap({
  weather,
  timeOfDay,
  collectibles,
  activeCheckpointIndex = -1,
  currentChallengeCheckpoints = []
}: FreerunCityMapProps) {

  // Generate procedural buildings across a 300m x 300m vertical metropolis
  const buildings: BuildingData[] = useMemo(() => {
    const list: BuildingData[] = [
      // Central Megatower (The Neon Apex Spire)
      { id: 'b_apex_spire', pos: [0, 65, 0], size: [28, 130, 28], color: '#0f172a', windowColor: '#38bdf8', hasAntenna: true, hasHelipad: true, name: 'Apex Spire' },
      
      // Northern Highrise District
      { id: 'b_north_1', pos: [-35, 45, -50], size: [24, 90, 24], color: '#1e1b4b', windowColor: '#818cf8', hasACUnits: true, hasSolarPanels: true, name: 'Vanguard Tower' },
      { id: 'b_north_2', pos: [35, 50, -50], size: [22, 100, 26], color: '#172554', windowColor: '#60a5fa', hasAntenna: true, hasACUnits: true, name: 'Horizon Center' },
      { id: 'b_north_3', pos: [0, 40, -85], size: [32, 80, 24], color: '#18181b', windowColor: '#fbbf24', hasGarden: true, name: 'Zenith Sky Garden' },
      
      // Construction Zone (North-West)
      { id: 'b_const_1', pos: [-75, 42, -45], size: [26, 84, 26], color: '#27272a', windowColor: '#f59e0b', hasConstruction: true, name: 'Titan Crane Site' },
      { id: 'b_const_2', pos: [-80, 30, -10], size: [22, 60, 22], color: '#1f2937', windowColor: '#f97316', hasACUnits: true },

      // Rooftop Garden & Residential Quarter (East)
      { id: 'b_east_1', pos: [65, 28, -15], size: [24, 56, 28], color: '#064e3b', windowColor: '#34d399', hasGarden: true, hasSolarPanels: true, name: 'Emerald Loft' },
      { id: 'b_east_2', pos: [70, 35, 25], size: [22, 70, 22], color: '#1e293b', windowColor: '#38bdf8', hasWaterTower: true, hasACUnits: true },
      { id: 'b_east_3', pos: [75, 22, -60], size: [28, 44, 24], color: '#312e81', windowColor: '#a78bfa', hasGarden: true },

      // Southern Commercial Hub
      { id: 'b_south_1', pos: [-25, 36, 50], size: [26, 72, 26], color: '#1c1917', windowColor: '#f43f5e', hasHelipad: true, hasACUnits: true, name: 'Crimson Tech' },
      { id: 'b_south_2', pos: [25, 32, 55], size: [24, 64, 24], color: '#111827', windowColor: '#22d3ee', hasWaterTower: true, hasSolarPanels: true },
      { id: 'b_south_3', pos: [0, 25, 90], size: [34, 50, 26], color: '#0f172a', windowColor: '#ec4899', hasACUnits: true, hasGarden: true, name: 'Neon Metro Plaza' },

      // West Industrial & Alley District
      { id: 'b_west_1', pos: [-55, 26, 25], size: [24, 52, 26], color: '#262626', windowColor: '#eab308', hasACUnits: true, hasWaterTower: true },
      { id: 'b_west_2', pos: [-60, 20, 65], size: [26, 40, 28], color: '#18181b', windowColor: '#06b6d4', hasSolarPanels: true },
      
      // Mid-tier connectors & apartment blocks
      { id: 'b_mid_1', pos: [-38, 24, -10], size: [18, 48, 20], color: '#1e293b', windowColor: '#38bdf8', hasACUnits: true },
      { id: 'b_mid_2', pos: [38, 25, -12], size: [18, 50, 20], color: '#1e1b4b', windowColor: '#c084fc', hasACUnits: true },
      { id: 'b_mid_3', pos: [-15, 18, -40], size: [16, 36, 18], color: '#0f172a', windowColor: '#4ade80', hasWaterTower: true },
      { id: 'b_mid_4', pos: [15, 20, 20], size: [16, 40, 18], color: '#18181b', windowColor: '#facc15', hasACUnits: true },

      // Low level tenements & alleyways (height 16m - 24m)
      { id: 'b_low_1', pos: [-35, 11, 80], size: [20, 22, 20], color: '#27272a', windowColor: '#fb923c' },
      { id: 'b_low_2', pos: [35, 12, 85], size: [20, 24, 20], color: '#1f2937', windowColor: '#a855f7' },
      { id: 'b_low_3', pos: [-85, 14, 30], size: [22, 28, 22], color: '#172554', windowColor: '#38bdf8' },
      { id: 'b_low_4', pos: [85, 15, -15], size: [22, 30, 22], color: '#064e3b', windowColor: '#4ade80' },
      { id: 'b_low_5', pos: [-25, 10, -110], size: [24, 20, 24], color: '#1c1917', windowColor: '#e11d48' },
      { id: 'b_low_6', pos: [25, 10, -110], size: [24, 20, 24], color: '#18181b', windowColor: '#0ea5e9' },
    ];
    return list;
  }, []);

  // Sky bridges connecting high roofs across urban canyons
  const skybridges = useMemo(() => [
    { start: [0, 100, 0] as [number, number, number], end: [-35, 88, -50] as [number, number, number], width: 4 },
    { start: [0, 100, 0] as [number, number, number], end: [35, 96, -50] as [number, number, number], width: 4 },
    { start: [35, 98, -50] as [number, number, number], end: [0, 78, -85] as [number, number, number], width: 3.5 },
    { start: [-35, 88, -50] as [number, number, number], end: [-75, 82, -45] as [number, number, number], width: 3 },
    { start: [0, 60, 0] as [number, number, number], end: [-25, 70, 50] as [number, number, number], width: 4 },
    { start: [-25, 70, 50] as [number, number, number], end: [25, 62, 55] as [number, number, number], width: 3 },
    { start: [38, 48, -12] as [number, number, number], end: [65, 54, -15] as [number, number, number], width: 3.5 },
    { start: [-38, 46, -10] as [number, number, number], end: [-55, 50, 25] as [number, number, number], width: 3.5 },
  ], []);

  // Grindable neon pipes and ziplines
  const grindPipes = useMemo(() => [
    { start: [10, 102, 10], end: [65, 57, -10], color: '#06b6d4' },
    { start: [-10, 102, -10], end: [-70, 85, -40], color: '#f59e0b' },
    { start: [-30, 73, 50], end: [-55, 53, 30], color: '#ec4899' },
    { start: [30, 65, 55], end: [70, 71, 28], color: '#10b981' },
    { start: [0, 80, -85], end: [70, 45, -60], color: '#a855f7' },
  ], []);

  // Bounce/Launch fan vents that launch traceurs vertically
  const launchPads = useMemo(() => [
    { pos: [0, 1, 35] as [number, number, number], power: 25, label: 'Street Air Blast' },
    { pos: [-38, 25, 0] as [number, number, number], power: 22, label: 'Alley Launch' },
    { pos: [38, 26, 0] as [number, number, number], power: 22, label: 'East Launch' },
    { pos: [0, 26, 90] as [number, number, number], power: 24, label: 'Plaza Launch' },
    { pos: [-15, 37, -40] as [number, number, number], power: 26, label: 'North Chasm Boost' },
    { pos: [65, 57, -15] as [number, number, number], power: 28, label: 'Garden Spire Launch' },
  ], []);

  // Weather parameters
  const isRain = weather === 'rain' || weather === 'storm';
  const groundRoughness = isRain ? 0.05 : 0.8;
  const groundMetalness = isRain ? 0.9 : 0.2;

  // Time of Day Lighting
  const skyColor = timeOfDay === 'night' 
    ? '#020617' 
    : (timeOfDay === 'sunset' ? '#451a03' : (timeOfDay === 'dawn' ? '#1e1b4b' : '#0284c7'));
  const ambientLightIntensity = timeOfDay === 'night' ? 0.4 : (timeOfDay === 'sunset' ? 0.7 : 0.9);
  const sunColor = timeOfDay === 'sunset' ? '#f97316' : (timeOfDay === 'night' ? '#38bdf8' : '#ffffff');

  return (
    <group>
      {/* Sky & Atmospheric Lighting */}
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight 
        position={[60, 150, 40]} 
        intensity={timeOfDay === 'night' ? 0.5 : 1.4} 
        color={sunColor} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={350}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {/* City Fog */}
      <fog attach="fog" args={[skyColor, 60, 240]} />

      {/* Cyberpunk Ground Level Street & Underground Entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color={isRain ? '#090d16' : '#18181b'} 
          roughness={groundRoughness} 
          metalness={groundMetalness}
        />
      </mesh>

      {/* Street Asphalt Grid Markings */}
      <gridHelper args={[400, 80, '#38bdf8', '#1e293b']} position={[0, 0.05, 0]} />

      {/* Underground Metro Entrance (Plaza South) */}
      <group position={[0, 0, 115]}>
        {/* Subway Pit */}
        <mesh position={[0, -2.5, 0]}>
          <boxGeometry args={[14, 5, 20]} />
          <meshStandardMaterial color="#09090b" roughness={0.9} />
        </mesh>
        {/* Stairs Ramp */}
        <mesh position={[0, -1.2, 5]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[10, 1, 12]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
        {/* Metro Glowing Canopy */}
        <mesh position={[0, 2.5, -2]}>
          <boxGeometry args={[15, 0.4, 16]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.6} emissive="#06b6d4" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 1, -2]} color="#06b6d4" intensity={3} distance={15} />
      </group>

      {/* BUILDINGS & ROOFTOPS */}
      {buildings.map((b) => {
        const roofY = b.pos[1] + b.size[1] / 2;
        return (
          <group key={b.id} position={[b.pos[0], 0, b.pos[2]]}>
            {/* Main Building Body */}
            <mesh position={[0, b.pos[1], 0]} castShadow receiveShadow>
              <boxGeometry args={[b.size[0], b.size[1], b.size[2]]} />
              <meshStandardMaterial color={b.color} roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Glowing Windows Banding */}
            <mesh position={[0, b.pos[1], 0]}>
              <boxGeometry args={[b.size[0] + 0.1, b.size[1] * 0.92, b.size[2] + 0.1]} />
              <meshStandardMaterial 
                color={b.windowColor} 
                emissive={b.windowColor} 
                emissiveIntensity={timeOfDay === 'night' ? 0.7 : 0.2} 
                wireframe 
                transparent 
                opacity={0.35} 
              />
            </mesh>

            {/* Rooftop Parapet Border (Vaultable Wall Lip) */}
            <mesh position={[0, roofY + 0.45, 0]}>
              <boxGeometry args={[b.size[0] + 0.4, 0.9, b.size[2] + 0.4]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
            {/* Rooftop walkable surface */}
            <mesh position={[0, roofY, 0]} receiveShadow>
              <boxGeometry args={[b.size[0] - 0.6, 0.2, b.size[2] - 0.6]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>

            {/* ROOFTOP PARKOUR FEATURES */}

            {/* 1. Helipad with safety markings */}
            {b.hasHelipad && (
              <group position={[0, roofY + 0.15, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[b.size[0] * 0.35, 32]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                  <ringGeometry args={[b.size[0] * 0.3, b.size[0] * 0.34, 32]} />
                  <meshBasicMaterial color="#facc15" />
                </mesh>
              </group>
            )}

            {/* 2. Rooftop Garden (Greenery, Trees, Pergola) */}
            {b.hasGarden && (
              <group position={[0, roofY + 0.1, 0]}>
                {/* Grass Turf */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[b.size[0] - 2, b.size[2] - 2]} />
                  <meshStandardMaterial color="#059669" roughness={0.9} />
                </mesh>
                {/* Garden Pergola Beam */}
                <mesh position={[0, 2, 0]}>
                  <boxGeometry args={[b.size[0] * 0.5, 0.3, 4]} />
                  <meshStandardMaterial color="#e2e8f0" />
                </mesh>
                <mesh position={[-b.size[0] * 0.22, 1, 0]}>
                  <boxGeometry args={[0.3, 2, 0.3]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[b.size[0] * 0.22, 1, 0]}>
                  <boxGeometry args={[0.3, 2, 0.3]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
                {/* Glowing Fountains / Trees */}
                <mesh position={[0, 1.2, 0]}>
                  <sphereGeometry args={[1.5, 16, 16]} />
                  <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.5} />
                </mesh>
              </group>
            )}

            {/* 3. AC Units & Ventilation Ducts (Vault Obstacles) */}
            {b.hasACUnits && (
              <group position={[0, roofY, 0]}>
                {/* Vaultable Long Duct */}
                <mesh position={[b.size[0] * 0.2, 0.6, 0]} castShadow>
                  <boxGeometry args={[2.5, 1.1, b.size[2] * 0.5]} />
                  <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* AC Condenser Box */}
                <mesh position={[-b.size[0] * 0.25, 0.8, b.size[2] * 0.2]} castShadow>
                  <boxGeometry args={[2.8, 1.5, 2.2]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[-b.size[0] * 0.25, 0.8, -b.size[2] * 0.2]} castShadow>
                  <boxGeometry args={[2.8, 1.5, 2.2]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
              </group>
            )}

            {/* 4. Water Tower */}
            {b.hasWaterTower && (
              <group position={[-b.size[0] * 0.25, roofY, -b.size[2] * 0.25]}>
                {/* 4 Legs */}
                <mesh position={[0, 2, 0]}>
                  <cylinderGeometry args={[2.5, 2.5, 3.5, 16]} />
                  <meshStandardMaterial color="#78350f" roughness={0.9} />
                </mesh>
                <mesh position={[0, 4.2, 0]}>
                  <coneGeometry args={[2.6, 1.2, 16]} />
                  <meshStandardMaterial color="#451a03" />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                  <cylinderGeometry args={[2.8, 2.8, 0.2, 4]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
              </group>
            )}

            {/* 5. Solar Panels */}
            {b.hasSolarPanels && (
              <group position={[b.size[0] * 0.22, roofY + 0.6, -b.size[2] * 0.2]}>
                <mesh rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[b.size[0] * 0.4, 0.15, 3.5]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
                </mesh>
              </group>
            )}

            {/* 6. Spire Antenna with Aircraft Warning Beacon */}
            {b.hasAntenna && (
              <group position={[0, roofY, 0]}>
                <mesh position={[0, 12, 0]}>
                  <cylinderGeometry args={[0.15, 0.8, 24, 8]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
                </mesh>
                {/* Glowing beacon light */}
                <mesh position={[0, 24, 0]}>
                  <sphereGeometry args={[0.5, 16, 16]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <pointLight position={[0, 24, 0]} color="#ef4444" intensity={4} distance={30} />
              </group>
            )}

            {/* 7. Construction Crane Site */}
            {b.hasConstruction && (
              <group position={[0, roofY, 0]}>
                {/* Yellow Crane Mast */}
                <mesh position={[0, 15, 0]}>
                  <boxGeometry args={[2, 30, 2]} />
                  <meshStandardMaterial color="#eab308" metalness={0.8} />
                </mesh>
                {/* Crane Horizontal Jib (Runnable Beam!) */}
                <mesh position={[12, 30, 0]}>
                  <boxGeometry args={[32, 1.2, 1.2]} />
                  <meshStandardMaterial color="#ca8a04" />
                </mesh>
                {/* Counterweight */}
                <mesh position={[-6, 30.5, 0]}>
                  <boxGeometry args={[4, 2, 2.5]} />
                  <meshStandardMaterial color="#4b5563" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* SKY BRIDGES (Parkour Walkways Across Buildings) */}
      {skybridges.map((sb, i) => {
        const startVec = new THREE.Vector3(...sb.start);
        const endVec = new THREE.Vector3(...sb.end);
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const distance = startVec.distanceTo(endVec);

        return (
          <group key={`bridge_${i}`} position={midPoint}>
            <mesh
              onUpdate={(self) => {
                self.lookAt(endVec);
              }}
              receiveShadow
            >
              <boxGeometry args={[sb.width, 0.4, distance]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Glowing Handrails */}
            <mesh
              onUpdate={(self) => {
                self.lookAt(endVec);
              }}
              position={[-sb.width / 2, 0.6, 0]}
            >
              <boxGeometry args={[0.1, 0.8, distance]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
            <mesh
              onUpdate={(self) => {
                self.lookAt(endVec);
              }}
              position={[sb.width / 2, 0.6, 0]}
            >
              <boxGeometry args={[0.1, 0.8, distance]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* GRIND PIPES (Neon Tubes for Rail Grinds) */}
      {grindPipes.map((gp, i) => {
        const s = new THREE.Vector3(...gp.start);
        const e = new THREE.Vector3(...gp.end);
        const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
        const dist = s.distanceTo(e);

        return (
          <group key={`pipe_${i}`} position={mid}>
            <mesh
              onUpdate={(self) => {
                self.lookAt(e);
              }}
            >
              <cylinderGeometry args={[0.16, 0.16, dist, 12]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color={gp.color} emissive={gp.color} emissiveIntensity={1.4} roughness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* LAUNCH PADS (Fan Vents) */}
      {launchPads.map((lp, i) => (
        <group key={`launch_${i}`} position={lp.pos}>
          {/* Fan Base */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[1.6, 1.8, 0.3, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          {/* Kinetic Glowing Core */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.05, 24]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          {/* Upward Hologram Arrows */}
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.6, 1.2, 4]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          <pointLight position={[0, 0.8, 0]} color="#06b6d4" intensity={2} distance={8} />
        </group>
      ))}

      {/* COLLECTIBLE ITEMS (Neon Datashards, Spray Cans, Quantum Orbs) */}
      {collectibles.map((item) => {
        if (item.collected) return null;
        const color = item.type === 'datashard' ? '#06b6d4' : (item.type === 'spray_can' ? '#f59e0b' : '#ec4899');

        return (
          <group key={item.id} position={item.position}>
            {/* Floating rotating item */}
            <mesh position={[0, 0.5, 0]} rotation={[0, Date.now() * 0.002, 0]}>
              {item.type === 'datashard' && <octahedronGeometry args={[0.5, 0]} />}
              {item.type === 'spray_can' && <cylinderGeometry args={[0.2, 0.2, 0.8, 12]} />}
              {item.type === 'quantum_orb' && <icosahedronGeometry args={[0.45, 1]} />}
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} roughness={0.1} />
            </mesh>
            {/* Glowing Aura Ring */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.65, 0.75, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, 0.5, 0]} color={color} intensity={2} distance={6} />
          </group>
        );
      })}

      {/* ACTIVE CHALLENGE CHECKPOINT RINGS */}
      {currentChallengeCheckpoints.map((cp, idx) => {
        const isCurrent = idx === activeCheckpointIndex;
        const color = isCurrent ? '#f59e0b' : '#38bdf8';
        return (
          <group key={`cp_${idx}`} position={cp}>
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[2.5, 0.2, 16, 32]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {isCurrent && (
              <pointLight color="#f59e0b" intensity={4} distance={15} />
            )}
          </group>
        );
      })}

      {/* RAIN & STORM PARTICLES */}
      {isRain && (
        <points position={[0, 70, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from({ length: 3000 * 3 }, () => (Math.random() - 0.5) * 200)
                ),
                3
              ]}
            />
          </bufferGeometry>
          <pointsMaterial color="#93c5fd" size={0.3} transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
}
