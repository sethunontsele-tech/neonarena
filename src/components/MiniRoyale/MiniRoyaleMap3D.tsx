import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { 
  MAP_SIZE, 
  BUILDING_CONFIGS, 
  WATER_AREAS, 
  ROAD_CONFIGS 
} from './data';
import { LootItemData, TreeData, RockData } from './types';

interface MiniRoyaleMap3DProps {
  zoneRadius?: number;
  zoneCenter?: [number, number];
  lootItems?: LootItemData[];
  onPickupLoot?: (loot: LootItemData) => void;
  playerPos?: [number, number, number];
}

export const MiniRoyaleMap3D: React.FC<MiniRoyaleMap3DProps> = ({
  zoneRadius = 500,
  zoneCenter = [0, 0],
  lootItems = [],
  onPickupLoot,
  playerPos = [0, 0, 0]
}) => {
  // Generate procedural displaced heightmap terrain
  const groundGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 100, 100);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h = Math.sin(x * 0.015) * Math.cos(y * 0.015) * 3 +
                Math.sin(x * 0.04 + 2) * Math.cos(y * 0.025) * 1.5 +
                Math.sin(x * 0.08) * Math.cos(y * 0.06) * 0.5;
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Generate deterministic dirt patches
  const dirtPatches = useMemo(() => {
    const patches = [];
    const seedPoints = [
      [-150, 120, 12], [220, -180, 15], [50, 70, 10], [-280, -220, 18],
      [180, 240, 14], [-80, -140, 11], [320, 80, 16], [-350, 200, 13],
      [40, -260, 12], [-180, 40, 10], [280, -80, 15], [-60, 280, 14]
    ];
    for (let i = 0; i < seedPoints.length; i++) {
      const [x, z, r] = seedPoints[i];
      patches.push({ id: `patch_${i}`, x, z, r });
    }
    return patches;
  }, []);

  // Generate trees
  const trees = useMemo(() => {
    const items: TreeData[] = [];
    // Deterministic pseudo-random distribution
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 180; i++) {
      const x = (random() - 0.5) * MAP_SIZE * 0.92;
      const z = (random() - 0.5) * MAP_SIZE * 0.92;
      // Skip if too close to central buildings
      const nearBuilding = BUILDING_CONFIGS.some(b => Math.hypot(x - b.x, z - b.z) < 18);
      if (nearBuilding) continue;

      items.push({
        x,
        z,
        trunkH: 3.5 + random() * 3,
        isPine: random() > 0.45,
        scale: 0.8 + random() * 0.4
      });
    }
    return items;
  }, []);

  // Generate rocks
  const rocks = useMemo(() => {
    const items: RockData[] = [];
    let seed = 1337;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < 75; i++) {
      const x = (random() - 0.5) * MAP_SIZE * 0.88;
      const z = (random() - 0.5) * MAP_SIZE * 0.88;
      const nearBuilding = BUILDING_CONFIGS.some(b => Math.hypot(x - b.x, z - b.z) < 16);
      if (nearBuilding) continue;

      items.push({
        x,
        z,
        size: 1.2 + random() * 2.8,
        colorHex: 0x666666 + Math.floor(random() * 0x222222)
      });
    }
    return items;
  }, []);

  // Loot bobbing animation ref
  const lootGroupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lootGroupRef.current) {
      lootGroupRef.current.children.forEach((child, idx) => {
        child.position.y = 1.2 + Math.sin(t * 2.5 + idx * 0.3) * 0.2;
        child.rotation.y = t * 1.5 + idx;
      });
    }
  });

  return (
    <group name="mini_royale_world">
      {/* 1. DISPLACED TERRAIN */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh 
          geometry={groundGeometry} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
        >
          <meshStandardMaterial 
            color="#4a7c3f" 
            roughness={0.85} 
            metalness={0.05} 
          />
        </mesh>
      </RigidBody>

      {/* Dirt patches on terrain */}
      {dirtPatches.map(p => (
        <mesh 
          key={p.id} 
          position={[p.x, 0.12, p.z]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[p.r, 16]} />
          <meshStandardMaterial color="#6b5a3e" roughness={0.9} />
        </mesh>
      ))}

      {/* 2. ROADS WITH YELLOW CENTERLINE */}
      {ROAD_CONFIGS.map((road, i) => (
        <group key={`road_${i}`} position={[road.x, 0.08, road.z]} rotation={[0, road.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[road.length, road.width]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
          </mesh>
          {/* Dashed Centerline */}
          {Array.from({ length: Math.floor(road.length / 14) }).map((_, di) => (
            <mesh
              key={`dash_${di}`}
              position={[(di - Math.floor(road.length / 28)) * 14, 0.02, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[6, 0.35]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3. WATER BODIES WITH SHORELINES */}
      {WATER_AREAS.map((water, i) => (
        <group key={`water_${i}`} position={[water.x, 0.2, water.z]}>
          {/* Water Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[water.r, 32]} />
            <meshStandardMaterial 
              color="#2277aa" 
              roughness={0.1} 
              metalness={0.3} 
              transparent 
              opacity={0.78} 
            />
          </mesh>
          {/* Sandy Shore */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[water.r, water.r + 3.5, 32]} />
            <meshStandardMaterial color="#c2b280" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 4. 38 ENTERABLE BUILDINGS (With walk-through door openings!) */}
      {BUILDING_CONFIGS.map((b, i) => {
        const wallThickness = 0.45;
        const doorWidth = 3.2;
        const doorHeight = 4.8;
        const frontLeftW = (b.w - doorWidth) / 2;
        const aboveDoorH = b.h - doorHeight;

        return (
          <group key={`bld_${i}`} position={[b.x, 0, b.z]}>
            {/* Interior Wooden Floor */}
            <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[b.w - wallThickness * 2, b.d - wallThickness * 2]} />
              <meshStandardMaterial color="#8B7355" roughness={0.7} />
            </mesh>

            {/* Back Wall (Full) */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, b.h / 2, -b.d / 2]} castShadow receiveShadow>
                <boxGeometry args={[b.w, b.h, wallThickness]} />
                <meshStandardMaterial color={b.color} roughness={0.7} />
              </mesh>
            </RigidBody>

            {/* Left Wall (Full) */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[-b.w / 2, b.h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, b.h, b.d]} />
                <meshStandardMaterial color={b.color} roughness={0.7} />
              </mesh>
            </RigidBody>

            {/* Right Wall (Full) */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[b.w / 2, b.h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[wallThickness, b.h, b.d]} />
                <meshStandardMaterial color={b.color} roughness={0.7} />
              </mesh>
            </RigidBody>

            {/* Front Wall - Left of Door */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[-b.w / 2 + frontLeftW / 2, b.h / 2, b.d / 2]} castShadow receiveShadow>
                <boxGeometry args={[frontLeftW, b.h, wallThickness]} />
                <meshStandardMaterial color={b.color} roughness={0.7} />
              </mesh>
            </RigidBody>

            {/* Front Wall - Right of Door */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[b.w / 2 - frontLeftW / 2, b.h / 2, b.d / 2]} castShadow receiveShadow>
                <boxGeometry args={[frontLeftW, b.h, wallThickness]} />
                <meshStandardMaterial color={b.color} roughness={0.7} />
              </mesh>
            </RigidBody>

            {/* Lintel Wall Section Above Door */}
            {aboveDoorH > 0 && (
              <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, doorHeight + aboveDoorH / 2, b.d / 2]} castShadow>
                  <boxGeometry args={[doorWidth, aboveDoorH, wallThickness]} />
                  <meshStandardMaterial color={b.color} roughness={0.7} />
                </mesh>
              </RigidBody>
            )}

            {/* Windows on side walls */}
            <mesh position={[-b.w / 2 - 0.05, b.h * 0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[2.2, 2.2]} />
              <meshStandardMaterial color="#88ccff" transparent opacity={0.5} roughness={0.1} />
            </mesh>
            <mesh position={[b.w / 2 + 0.05, b.h * 0.55, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[2.2, 2.2]} />
              <meshStandardMaterial color="#88ccff" transparent opacity={0.5} roughness={0.1} />
            </mesh>

            {/* Pyramidal / Hip Roof */}
            <mesh position={[0, b.h + 2.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[Math.max(b.w, b.d) * 0.78, 4.4, 4]} />
              <meshStandardMaterial color={b.roofColor} roughness={0.65} />
            </mesh>
          </group>
        );
      })}

      {/* 5. 200 TREES (Pine & Deciduous) */}
      {trees.map((t, i) => (
        <group key={`tree_${i}`} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Trunk */}
          <RigidBody type="fixed" colliders="hull">
            <mesh position={[0, t.trunkH / 2, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.55, t.trunkH, 8]} />
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </mesh>
          </RigidBody>

          {/* Foliage */}
          {t.isPine ? (
            <group position={[0, t.trunkH - 0.5, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[2.8, 3.2, 7]} />
                <meshStandardMaterial color="#1a5e1a" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.8, 0]} castShadow>
                <coneGeometry args={[2.2, 2.8, 7]} />
                <meshStandardMaterial color="#226e22" roughness={0.8} />
              </mesh>
              <mesh position={[0, 3.4, 0]} castShadow>
                <coneGeometry args={[1.5, 2.2, 7]} />
                <meshStandardMaterial color="#2d832d" roughness={0.8} />
              </mesh>
            </group>
          ) : (
            <mesh position={[0, t.trunkH + 1.8, 0]} castShadow>
              <sphereGeometry args={[2.6, 8, 8]} />
              <meshStandardMaterial color="#2e7d32" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}

      {/* 6. COVER ROCKS */}
      {rocks.map((r, i) => (
        <RigidBody key={`rock_${i}`} type="fixed" colliders="hull" position={[r.x, r.size * 0.45, r.z]}>
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[r.size, 0]} />
            <meshStandardMaterial color={r.colorHex} roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}

      {/* 7. LOOT PICKUP CRATES & LIGHT BEAMS */}
      <group ref={lootGroupRef}>
        {lootItems.map((item) => {
          if (item.collected) return null;
          return (
            <group key={item.id} position={[item.x, 1.2, item.z]}>
              {/* Loot Crate */}
              <mesh castShadow>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial 
                  color={item.color} 
                  emissive={item.color} 
                  emissiveIntensity={0.6} 
                  roughness={0.3} 
                />
              </mesh>
              {/* Vertical Sky Light Beam */}
              <mesh position={[0, 6, 0]}>
                <cylinderGeometry args={[0.08, 0.45, 12, 8]} />
                <meshBasicMaterial color={item.color} transparent opacity={0.35} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 8. COMBAT VEHICLES AT MAIN OUTPOSTS */}
      <group position={[35, 0.8, -60]}>
        {/* Battle Buggy */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.4, 1.0, 4.2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Buggy Wheels */}
        {[-1.2, 1.2].map((wx, wxi) =>
          [-1.5, 1.5].map((wz, wzi) => (
            <mesh 
              key={`wheel_${wxi}_${wzi}`} 
              position={[wx, 0.1, wz]} 
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.6, 0.6, 0.45, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          ))
        )}
      </group>

      {/* 9. SHORTER / TALL RED DANGER ZONE WALL */}
      <group position={[zoneCenter[0], 0, zoneCenter[1]]}>
        {/* Red Energy Wall Cylinder */}
        <mesh position={[0, 80, 0]}>
          <cylinderGeometry args={[zoneRadius, zoneRadius, 160, 64, 1, true]} />
          <meshBasicMaterial 
            color="#ef4444" 
            transparent 
            opacity={0.16} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Ground Perimeter Energy Ring */}
        <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(1, zoneRadius - 2), zoneRadius + 2, 64]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.5} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>
    </group>
  );
};
