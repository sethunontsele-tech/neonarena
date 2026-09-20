import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BackroomsLevelId, BackroomsLevelConfig, BackroomsDoor, BackroomsElevator, BackroomsHazard, BackroomsItem } from './types';
import { backroomsAudio } from './backroomsAudio';
import { soundService } from '../../services/soundService';

export const LEVEL_CONFIGS: Record<BackroomsLevelId, BackroomsLevelConfig> = {
  0: {
    id: 0,
    name: 'LEVEL 0 — YELLOW HALLS',
    subtitle: 'Mono-Yellow Wallpaper // Buzzing Fluorescent Tubes // Liminal Infinite Corridors',
    theme: 'yellow_halls',
    wallColor: '#b59a4c',      // Iconic aged yellow wallpaper
    floorColor: '#6e5a32',     // Moist beige carpeting
    ceilingColor: '#a89d7b',   // Stained acoustic ceiling tiles
    ambientLight: '#383218',
    lightIntensity: 1.2,
    fogColor: '#2b2612',
    fogDensity: 0.045,
    corridorWidth: 5,
    roomSize: 10,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.15,
    hasSteamHazards: false,
    hasElectricHazards: true,
    bgmType: 'fluorescent_buzz'
  },
  1: {
    id: 1,
    name: 'LEVEL 1 — INDUSTRIAL WAREHOUSE',
    subtitle: 'Abandoned Metal Corridors // Overhead Pipes // Emergency Strobe Beacons',
    theme: 'industrial',
    wallColor: '#3a424a',      // Corrugated galvanized metal
    floorColor: '#202428',     // Poured industrial concrete
    ceilingColor: '#181b1e',   // Steel rafters and girders
    ambientLight: '#281c14',
    lightIntensity: 1.0,
    fogColor: '#1a1612',
    fogDensity: 0.05,
    corridorWidth: 6,
    roomSize: 14,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.25,
    hasSteamHazards: true,
    hasElectricHazards: false,
    bgmType: 'industrial_hum'
  },
  2: {
    id: 2,
    name: 'LEVEL 2 — MAINTENANCE TUNNELS',
    subtitle: 'Dark Claustrophobic Conduits // High-Voltage Breakers // Scorching Steam Pipes',
    theme: 'maintenance',
    wallColor: '#2b2622',      // Dark concrete tunnel walls
    floorColor: '#161412',     // Grimy utility trench
    ceilingColor: '#1a1715',   // Conduit clusters
    ambientLight: '#180e08',
    lightIntensity: 0.8,
    fogColor: '#120b06',
    fogDensity: 0.075,
    corridorWidth: 4,
    roomSize: 8,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.35,
    hasSteamHazards: true,
    hasElectricHazards: true,
    bgmType: 'industrial_hum'
  },
  3: {
    id: 3,
    name: 'LEVEL 3 — FLOODED AREA',
    subtitle: 'Submerged Concrete Chambers // Live Electric Cable Hazards // Murky Water Currents',
    theme: 'flooded',
    wallColor: '#27383c',      // Mossy waterlogged concrete
    floorColor: '#0f1a1d',     // Submerged foundation
    ceilingColor: '#182428',   // Dripping ceiling slabs
    ambientLight: '#0d1f24',
    lightIntensity: 0.9,
    fogColor: '#081418',
    fogDensity: 0.065,
    corridorWidth: 6,
    roomSize: 12,
    hasWater: true,
    waterLevel: 0.55,
    waterColor: '#083344',
    flickerRate: 0.2,
    hasSteamHazards: false,
    hasElectricHazards: true,
    bgmType: 'dripping_water'
  },
  4: {
    id: 4,
    name: 'LEVEL 4 — OFFICE ZONE',
    subtitle: 'Endless Cubicle Mazes // Retro CRT Monitors // Abandoned Executive Suites',
    theme: 'office',
    wallColor: '#8a949e',      // Off-white modular drywall
    floorColor: '#374151',     // Commercial grey carpet
    ceilingColor: '#9ca3af',   // Suspended grid drop-ceiling
    ambientLight: '#2c333d',
    lightIntensity: 1.4,
    fogColor: '#1f242d',
    fogDensity: 0.035,
    corridorWidth: 5,
    roomSize: 11,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.08,
    hasSteamHazards: false,
    hasElectricHazards: false,
    bgmType: 'muffled_office'
  },
  5: {
    id: 5,
    name: 'LEVEL 5 — INFINITE HOTEL',
    subtitle: 'Victorian Damask Wallpaper // Red Velvet Carpeting // Locked Suite Doors // Grand Ballroom',
    theme: 'hotel',
    wallColor: '#581c24',      // Burgundy Victorian wallpaper
    floorColor: '#3b0d11',     // Rich patterned red carpet
    ceilingColor: '#f1e2cc',   // Ornate plaster molding
    ambientLight: '#3d1c16',
    lightIntensity: 1.3,
    fogColor: '#240b0f',
    fogDensity: 0.04,
    corridorWidth: 5.5,
    roomSize: 12,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.1,
    hasSteamHazards: false,
    hasElectricHazards: false,
    bgmType: 'hotel_drone'
  },
  999: {
    id: 999,
    name: 'LEVEL 999 — THE ANOMALY CONTROL LAB',
    subtitle: 'SECRET REALITY CORE // Quantum Terminal Racks // Developer Void Room',
    theme: 'developer_lab',
    wallColor: '#09090b',      // Carbon monolithic panels
    floorColor: '#030712',     // Reflective black obsidian glass
    ceilingColor: '#020617',   // Glitching neon ceiling grid
    ambientLight: '#052e16',
    lightIntensity: 1.8,
    fogColor: '#02180c',
    fogDensity: 0.03,
    corridorWidth: 7,
    roomSize: 16,
    hasWater: false,
    waterLevel: 0,
    waterColor: '#000000',
    flickerRate: 0.05,
    hasSteamHazards: false,
    hasElectricHazards: false,
    bgmType: 'quantum_static'
  }
};

interface ProceduralLevelsProps {
  levelId: BackroomsLevelId;
  seed: number;
  playerPos: [number, number, number];
  onInteractElevator: (targetLevel: BackroomsLevelId) => void;
  onPickupItem: (item: BackroomsItem) => void;
  onTakeHazardDamage: (damage: number, type: string) => void;
  onUnlockSecret: () => void;
}

export function ProceduralLevels({
  levelId,
  seed,
  playerPos,
  onInteractElevator,
  onPickupItem,
  onTakeHazardDamage,
  onUnlockSecret
}: ProceduralLevelsProps) {
  const config = LEVEL_CONFIGS[levelId] || LEVEL_CONFIGS[0];

  // Procedural generation parameters
  const GRID_SIZE = 14; // 14x14 grid of cells
  const CELL_SIZE = config.roomSize;
  const HALF_GRID = (GRID_SIZE * CELL_SIZE) / 2;

  // Track doors and their open states
  const [doors, setDoors] = useState<BackroomsDoor[]>([]);
  const [items, setItems] = useState<BackroomsItem[]>([]);
  const [elevators, setElevators] = useState<BackroomsElevator[]>([]);
  const [hazards, setHazards] = useState<BackroomsHazard[]>([]);

  // Fluorescent lights state
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const lightMeshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // PRNG
  const rng = useMemo(() => {
    let s = (seed * 9301 + 49297 + levelId * 233) % 233280;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }, [seed, levelId]);

  // Generate Maze Layout, Rooms, Doors, Items, Elevators once per level change
  const layout = useMemo(() => {
    const r = rng;
    const walls: {
      position: [number, number, number];
      size: [number, number, number];
      color: string;
      isPillar?: boolean;
    }[] = [];

    const generatedDoors: BackroomsDoor[] = [];
    const generatedItems: BackroomsItem[] = [];
    const generatedHazards: BackroomsHazard[] = [];
    const generatedElevators: BackroomsElevator[] = [];
    const lightPositions: [number, number, number][] = [];

    const wallH = 3.6;

    // Grid layout matrix: 0 = empty corridor/room, 1 = solid wall
    const grid: number[][] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[x] = [];
      for (let z = 0; z < GRID_SIZE; z++) {
        // Outer boundaries are solid walls
        if (x === 0 || x === GRID_SIZE - 1 || z === 0 || z === GRID_SIZE - 1) {
          grid[x][z] = 1;
        } else if (x % 2 === 0 && z % 2 === 0) {
          // Structural repeating pillars
          grid[x][z] = 1;
        } else {
          grid[x][z] = r() > 0.68 ? 1 : 0;
        }
      }
    }

    // Ensure spawn area [center] is clear
    const mid = Math.floor(GRID_SIZE / 2);
    grid[mid][mid] = 0;
    grid[mid + 1][mid] = 0;
    grid[mid - 1][mid] = 0;
    grid[mid][mid + 1] = 0;
    grid[mid][mid - 1] = 0;

    // Build 3D wall segments from grid
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const wx = x * CELL_SIZE - HALF_GRID;
        const wz = z * CELL_SIZE - HALF_GRID;

        if (grid[x][z] === 1) {
          walls.push({
            position: [wx, wallH / 2, wz],
            size: [CELL_SIZE * 0.96, wallH, CELL_SIZE * 0.96],
            color: config.wallColor,
            isPillar: x % 2 === 0 && z % 2 === 0
          });
        } else {
          // Open cell: place lights every 2-3 cells
          if ((x + z) % 3 === 0) {
            lightPositions.push([wx, wallH - 0.25, wz]);
          }

          // Random loot item spawn
          if (r() < 0.16) {
            const itemTypeRoll = r();
            let itype: BackroomsItem['type'] = 'almond_water';
            let iname = 'Almond Water';
            let idesc = 'Restores 40 Sanity & 30 Health';
            let iicon = '💧';

            if (itemTypeRoll < 0.35) {
              itype = 'almond_water';
            } else if (itemTypeRoll < 0.6) {
              itype = 'battery';
              iname = 'Neon Battery Pack';
              idesc = 'Recharges flashlight battery to 100%';
              iicon = '🔋';
            } else if (itemTypeRoll < 0.8) {
              itype = 'medkit';
              iname = 'Sterile Medkit';
              idesc = 'Restores 50 Health instantly';
              iicon = '🩹';
            } else if (itemTypeRoll < 0.95) {
              itype = 'adrenaline';
              iname = 'Adrenaline Syringe';
              idesc = 'Boosts sprint speed by 50% for 12 seconds';
              iicon = '⚡';
            } else {
              itype = 'glitch_artifact';
              iname = 'Anomalous Glitch Shard';
              idesc = 'Exotic Backrooms material for weapon power';
              iicon = '💎';
            }

            generatedItems.push({
              id: `item_${x}_${z}`,
              type: itype,
              name: iname,
              description: idesc,
              position: [wx + (r() - 0.5) * (CELL_SIZE * 0.5), 0.5, wz + (r() - 0.5) * (CELL_SIZE * 0.5)],
              icon: iicon,
              count: 1
            });
          }

          // Random doorway spawn
          if (r() < 0.14) {
            const reqKey = r() < 0.35 ? (r() < 0.5 ? 'keycard_red' : 'keycard_blue') : 'none';
            generatedDoors.push({
              id: `door_${x}_${z}`,
              position: [wx, 1.4, wz + CELL_SIZE * 0.45],
              rotation: r() > 0.5 ? 0 : Math.PI / 2,
              isOpen: false,
              isLocked: reqKey !== 'none',
              requiredKey: reqKey,
              label: reqKey !== 'none' ? `LOCKED: ${reqKey.toUpperCase()} REQUIRED` : `ROOM ${x * 10 + z}`
            });
          }

          // Hazards (Steam or Live wires)
          if (config.hasSteamHazards && r() < 0.1) {
            generatedHazards.push({
              id: `hazard_steam_${x}_${z}`,
              type: 'steam_pipe',
              position: [wx, 1.5, wz],
              active: true,
              damage: 18,
              radius: 3.5
            });
          } else if (config.hasElectricHazards && r() < 0.12) {
            generatedHazards.push({
              id: `hazard_wire_${x}_${z}`,
              type: 'live_wire',
              position: [wx, 0.2, wz],
              active: true,
              damage: 22,
              radius: 4.0
            });
          }
        }
      }
    }

    // Always spawn at least two Elevators:
    // 1. One near the edge leading to Next Level
    const nextLvl: BackroomsLevelId = levelId === 5 ? 999 : ((levelId + 1) as BackroomsLevelId);
    generatedElevators.push({
      id: 'elevator_next',
      position: [HALF_GRID - CELL_SIZE * 1.5, 1.5, HALF_GRID - CELL_SIZE * 1.5],
      currentLevel: levelId,
      targetLevel: nextLvl,
      isOpen: true,
      isMoving: false,
      availableLevels: [0, 1, 2, 3, 4, 5, 999]
    });

    // 2. One leading to Previous Level / Surface
    const prevLvl: BackroomsLevelId = levelId === 0 ? 0 : ((levelId - 1) as BackroomsLevelId);
    generatedElevators.push({
      id: 'elevator_prev',
      position: [-HALF_GRID + CELL_SIZE * 1.5, 1.5, -HALF_GRID + CELL_SIZE * 1.5],
      currentLevel: levelId,
      targetLevel: prevLvl,
      isOpen: true,
      isMoving: false,
      availableLevels: [0, 1, 2, 3, 4, 5, 999]
    });

    // Spawn guaranteed Keycard if doors are locked
    generatedItems.push({
      id: 'guaranteed_red_key',
      type: 'keycard_red',
      name: 'Red Security Keycard',
      description: 'Unlocks high-security blast doors & maintenance zones',
      position: [-CELL_SIZE * 2, 0.4, CELL_SIZE * 2],
      icon: '🔴',
      count: 1
    });

    generatedItems.push({
      id: 'guaranteed_blue_key',
      type: 'keycard_blue',
      name: 'Blue Maintenance Keycard',
      description: 'Accesses electrical breaker stations and pump rooms',
      position: [CELL_SIZE * 2, 0.4, -CELL_SIZE * 2],
      icon: '🔵',
      count: 1
    });

    return {
      walls,
      lightPositions,
      doors: generatedDoors,
      items: generatedItems,
      hazards: generatedHazards,
      elevators: generatedElevators
    };
  }, [seed, levelId, config, CELL_SIZE, GRID_SIZE, HALF_GRID, rng]);

  // Sync state
  useEffect(() => {
    setDoors(layout.doors);
    setItems(layout.items);
    setHazards(layout.hazards);
    setElevators(layout.elevators);
  }, [layout]);

  // Start Level BGM & Hum
  useEffect(() => {
    backroomsAudio.startAmbientHum(config.theme, 0.08);
    return () => {
      backroomsAudio.stopAmbientHum();
    };
  }, [config.theme]);

  // Frame loop for light flickering, water ripples, hazard damage checks
  const lastHazardTick = useRef(0);
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // 1. Fluorescent tube flicker oscillation
    if (layout.lightPositions.length > 0) {
      const flickerRand = Math.sin(t * 15) * Math.cos(t * 27);
      const isFlickering = flickerRand > 0.85;

      lightRefs.current.forEach((light, i) => {
        if (light) {
          // Individual phase shift for natural desynchronized flickering
          const individualFlicker = Math.sin(t * 20 + i * 1.7);
          const shouldDrop = individualFlicker > 0.88;
          light.intensity = shouldDrop ? config.lightIntensity * 0.15 : config.lightIntensity;
        }
      });

      if (isFlickering && Math.random() < 0.03) {
        backroomsAudio.playFlicker();
      }
    }

    // 2. Proximity hazard damage check
    const now = Date.now();
    if (now - lastHazardTick.current > 1000) {
      lastHazardTick.current = now;
      hazards.forEach((h) => {
        const dist = Math.hypot(playerPos[0] - h.position[0], playerPos[2] - h.position[2]);
        if (dist < h.radius) {
          onTakeHazardDamage(h.damage, h.type === 'steam_pipe' ? 'SCALDING STEAM' : 'HIGH VOLTAGE CURRENT');
          try {
            soundService.playSFX('hit');
          } catch (e) {}
        }
      });
    }
  });

  // Toggle Door Open/Close
  const handleToggleDoor = (doorId: string) => {
    setDoors((prev) =>
      prev.map((d) => {
        if (d.id === doorId) {
          if (d.isLocked) {
            soundService.playSFX('ui_tab');
            return d;
          }
          const nextOpen = !d.isOpen;
          backroomsAudio.playDoorSound(nextOpen);
          return { ...d, isOpen: nextOpen };
        }
        return d;
      })
    );
  };

  // Pickup an item
  const handlePickup = (item: BackroomsItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    onPickupItem(item);
    backroomsAudio.playDrinkAlmondWater();
  };

  return (
    <group name="backrooms_procedural_world">
      {/* Dynamic Ambient Lighting */}
      <ambientLight color={config.ambientLight} intensity={config.lightIntensity * 0.7} />
      <fog attach="fog" args={[config.fogColor, 2, 45]} />

      {/* Main Floor Mesh */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        name="backrooms_floor"
      >
        <planeGeometry args={[GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE]} />
        <meshStandardMaterial
          color={config.floorColor}
          roughness={config.hasWater ? 0.2 : 0.85}
          metalness={config.theme === 'industrial' ? 0.3 : 0.05}
        />
      </mesh>

      {/* Ceiling Mesh with Tile Panels */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 3.6, 0]}
        receiveShadow
        name="backrooms_ceiling"
      >
        <planeGeometry args={[GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE]} />
        <meshStandardMaterial
          color={config.ceilingColor}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Water Layer for Flooded Area (Level 3) */}
      {config.hasWater && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, config.waterLevel, 0]}
          name="backrooms_water_surface"
        >
          <planeGeometry args={[GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE]} />
          <meshStandardMaterial
            color={config.waterColor}
            transparent
            opacity={0.7}
            roughness={0.05}
            metalness={0.8}
          />
        </mesh>
      )}

      {/* Procedural Walls and Pillars */}
      {layout.walls.map((w, idx) => (
        <mesh
          key={idx}
          position={w.position}
          castShadow
          receiveShadow
          name="obstacle"
        >
          <boxGeometry args={w.size} />
          <meshStandardMaterial
            color={w.color}
            roughness={config.theme === 'hotel' ? 0.5 : 0.8}
            metalness={config.theme === 'developer_lab' ? 0.8 : 0.1}
          />

          {/* Hotel decorative trim or Industrial hazard striping */}
          {config.theme === 'industrial' && (
            <mesh position={[0, -w.size[1] / 2 + 0.3, w.size[2] / 2 + 0.02]}>
              <planeGeometry args={[w.size[0], 0.4]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          )}
        </mesh>
      ))}

      {/* Fluorescent Light Fixtures and Lamps */}
      {layout.lightPositions.map((pos, idx) => (
        <group key={`light_${idx}`} position={pos}>
          {/* Long rectangular fluorescent fixture */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.8, 0.15, 0.6]} />
            <meshStandardMaterial color="#262626" />
          </mesh>
          {/* Glowing tube bulb */}
          <mesh
            ref={(el) => (lightMeshRefs.current[idx] = el)}
            position={[0, 0.05, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.08, 0.08, 1.6, 12]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Point Light source */}
          <pointLight
            ref={(el) => (lightRefs.current[idx] = el)}
            color="#fef9c3"
            intensity={config.lightIntensity}
            distance={16}
            decay={2}
          />
        </group>
      ))}

      {/* Interactable Doors */}
      {doors.map((door) => {
        const dist = Math.hypot(playerPos[0] - door.position[0], playerPos[2] - door.position[2]);
        const isNear = dist < 3.5;

        return (
          <group key={door.id} position={door.position} rotation={[0, door.rotation, 0]}>
            {/* Door Frame */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[2.2, 2.6, 0.2]} />
              <meshStandardMaterial color="#1c1917" />
            </mesh>
            {/* Moving Door Panel */}
            <mesh
              position={[door.isOpen ? 1.6 : 0, 0.2, 0.05]}
              onClick={() => handleToggleDoor(door.id)}
            >
              <boxGeometry args={[1.9, 2.4, 0.1]} />
              <meshStandardMaterial
                color={door.isLocked ? '#7f1d1d' : config.theme === 'hotel' ? '#450a0a' : '#44403c'}
                roughness={0.4}
              />
              {/* Door Handle */}
              <mesh position={[0.7, 0, 0.1]}>
                <boxGeometry args={[0.1, 0.25, 0.1]} />
                <meshStandardMaterial color="#eab308" metalness={0.9} />
              </mesh>
            </mesh>

            {/* In-world HTML Prompt */}
            {isNear && (
              <Html position={[0, 1.8, 0]} center distanceFactor={12}>
                <button
                  onClick={() => handleToggleDoor(door.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all ${
                    door.isLocked
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                      : 'bg-black/90 text-amber-300 border border-amber-500/50 hover:bg-amber-500 hover:text-black'
                  }`}
                >
                  {door.isLocked ? `🔒 ${door.label}` : door.isOpen ? '🚪 [E] CLOSE DOOR' : '🚪 [E] OPEN DOOR'}
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* Collectible Items */}
      {items.map((item) => {
        const dist = Math.hypot(playerPos[0] - item.position[0], playerPos[2] - item.position[2]);
        const isNear = dist < 3.0;

        return (
          <group key={item.id} position={item.position}>
            {/* Spinning floating item model */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.18, 0.22, 0.5, 16]} />
              <meshStandardMaterial
                color={item.type === 'almond_water' ? '#38bdf8' : item.type.includes('keycard') ? '#ef4444' : '#eab308'}
                emissive={item.type === 'almond_water' ? '#0284c7' : '#ca8a04'}
                emissiveIntensity={0.6}
              />
            </mesh>

            {/* Hovering Item Label & Pickup Button */}
            <Html position={[0, 0.9, 0]} center distanceFactor={12}>
              <div
                onClick={() => handlePickup(item)}
                className={`cursor-pointer px-2.5 py-1 rounded-full font-mono text-[10px] font-black uppercase whitespace-nowrap shadow-lg flex items-center gap-1.5 transition-all ${
                  isNear
                    ? 'bg-amber-400 text-black border-2 border-white scale-110 animate-pulse'
                    : 'bg-black/85 text-zinc-300 border border-white/20'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
                {isNear && <span className="bg-black text-amber-400 px-1 rounded text-[8px]">[E] TAKE</span>}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Elevators to Next / Previous Levels */}
      {elevators.map((elev) => {
        const dist = Math.hypot(playerPos[0] - elev.position[0], playerPos[2] - elev.position[2]);
        const isNear = dist < 4.5;

        return (
          <group key={elev.id} position={elev.position}>
            {/* Elevator Shaft Enclosure */}
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[3.8, 3.4, 3.8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Elevator Interior Chamber */}
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[3.2, 3.0, 3.2]} />
              <meshStandardMaterial color="#0f172a" side={THREE.BackSide} />
            </mesh>
            {/* Warm overhead elevator light */}
            <pointLight position={[0, 2.8, 0]} color="#fde047" intensity={2.0} distance={6} />

            {/* Elevator Control Panel & Interaction UI */}
            {isNear && (
              <Html position={[0, 2.0, 0]} center distanceFactor={12}>
                <div className="bg-zinc-950/95 border-2 border-amber-500/80 p-3 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)] flex flex-col gap-2 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center gap-1">
                      🛗 LIMINAL ELEVATOR CAR
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 rounded font-mono">
                      LVL {levelId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {elev.availableLevels.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          backroomsAudio.playElevatorChime();
                          onInteractElevator(lvl);
                        }}
                        className={`py-1 px-2 rounded font-mono text-[10px] font-bold text-left transition-all ${
                          lvl === levelId
                            ? 'bg-amber-500 text-black font-black'
                            : 'bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {lvl === 999 ? '★ LAB 999' : `LVL ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Environmental Hazards (Steam and Sparks) */}
      {hazards.map((h) => (
        <group key={h.id} position={h.position}>
          {h.type === 'steam_pipe' ? (
            <>
              {/* Overhead Pipe */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 3.5, 16]} />
                <meshStandardMaterial color="#78350f" metalness={0.8} />
              </mesh>
              {/* Steam plume */}
              <mesh position={[0, -0.6, 0]}>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
              </mesh>
            </>
          ) : (
            <>
              {/* Dangling live wire */}
              <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
                <meshStandardMaterial color="#172554" />
              </mesh>
              {/* Electric spark puddle */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <circleGeometry args={[1.8, 24]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
              </mesh>
              <pointLight color="#38bdf8" intensity={2.5} distance={5} />
            </>
          )}
        </group>
      ))}

      {/* Level 4 Office Furniture Decor */}
      {config.theme === 'office' && (
        <group name="office_props">
          {[-15, 0, 15].map((x) =>
            [-15, 0, 15].map((z) => (
              <group key={`desk_${x}_${z}`} position={[x, 0, z]}>
                {/* Office Desk */}
                <mesh position={[0, 0.75, 0]}>
                  <boxGeometry args={[2.2, 0.1, 1.2]} />
                  <meshStandardMaterial color="#713f12" />
                </mesh>
                {/* CRT Monitor */}
                <mesh position={[0, 1.15, 0]}>
                  <boxGeometry args={[0.6, 0.5, 0.5]} />
                  <meshStandardMaterial color="#d1d5db" />
                </mesh>
                {/* Glowing Green CRT Screen */}
                <mesh position={[0, 1.15, 0.26]}>
                  <planeGeometry args={[0.45, 0.35]} />
                  <meshBasicMaterial color="#22c55e" />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}

      {/* Secret Developer Room Lore & Trophy Pedestal (Level 999) */}
      {levelId === 999 && (
        <group position={[0, 0, 0]} name="secret_developer_lab">
          {/* Central Monolith Core */}
          <mesh position={[0, 2.5, 0]}>
            <octahedronGeometry args={[1.8]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.8} wireframe />
          </mesh>
          <pointLight position={[0, 2.5, 0]} color="#10b981" intensity={5} distance={20} />

          <Html position={[0, 4.2, 0]} center distanceFactor={14}>
            <div className="bg-black/95 border-2 border-emerald-500 p-4 rounded-3xl text-emerald-400 font-mono text-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
              <div className="text-sm font-black uppercase tracking-widest mb-1">
                ★ SECRET CONTROL LAB ACCESSED ★
              </div>
              <div className="text-[10px] text-zinc-400 max-w-xs mb-3">
                You bypassed reality boundaries and breached Level 999. The core master seed of Neon Arena lies here.
              </div>
              <button
                onClick={onUnlockSecret}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-lg"
              >
                CLAIM SECRET BACKROOMS TROPHY
              </button>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
