import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ActiveUnitInstance, UnitDefinition, ClusterCommandType } from './types';

interface BoardUnit3DProps {
  unit: ActiveUnitInstance;
  def: UnitDefinition;
  isSelected: boolean;
  isHero: boolean;
  squadLabel?: string;
  onClick: (e: any) => void;
}

export const BoardUnit3D: React.FC<BoardUnit3DProps> = ({
  unit,
  def,
  isSelected,
  isHero,
  squadLabel,
  onClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth movement interpolation toward unit.position
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, unit.position[0], 0.2);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, unit.position[1], 0.2);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, unit.position[2], 0.2);

    // Face toward movement direction or target
    if (unit.isMoving && unit.targetPosition) {
      const dx = unit.targetPosition[0] - unit.position[0];
      const dz = unit.targetPosition[2] - unit.position[2];
      if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
        const targetRot = Math.atan2(-dz, dx);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.15);
      }
    } else {
      // Default face toward enemy base (Player faces +X, Enemy faces -X)
      const defaultRot = unit.team === 'player' ? 0 : Math.PI;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, defaultRot, 0.1);
    }

    // Walking / bobbing animation
    const time = state.clock.getElapsedTime() * 7;
    if (bodyRef.current) {
      if (unit.isMoving) {
        bodyRef.current.position.y = Math.sin(time) * 0.12;
        bodyRef.current.rotation.z = Math.cos(time * 0.5) * 0.08;
      } else {
        // Idle breathing
        bodyRef.current.position.y = Math.sin(time * 0.3) * 0.04;
      }
    }

    // Wing flapping for flying units
    if (wingsRef.current && def.isFlying) {
      wingsRef.current.rotation.z = Math.sin(time * 1.5) * 0.45;
    }

    // Attack lunge animation
    if (weaponRef.current) {
      if (unit.isAttacking) {
        weaponRef.current.rotation.x = THREE.MathUtils.lerp(weaponRef.current.rotation.x, -1.2, 0.4);
      } else {
        weaponRef.current.rotation.x = THREE.MathUtils.lerp(weaponRef.current.rotation.x, 0, 0.2);
      }
    }

    // Aura spin for heroes or selected units
    if (auraRef.current) {
      auraRef.current.rotation.z += delta * 1.5;
    }
  });

  const hpPercent = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
  const isPlayer = unit.team === 'player';
  const teamColor = isPlayer ? '#38bdf8' : '#f43f5e';
  const scale = isHero ? 1.45 : def.role === 'Heavy' ? 1.3 : 1.0;

  return (
    <group 
      ref={groupRef} 
      position={unit.position} 
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      scale={[scale, scale, scale]}
    >
      {/* SELECTION RING / CLUSTER RING */}
      {isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.35, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* TEAM / HERO BASE RING */}
      <mesh ref={auraRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.88, 24]} />
        <meshBasicMaterial 
          color={isHero ? '#f59e0b' : teamColor} 
          transparent 
          opacity={isHero ? 0.9 : 0.6} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 3D UNIT BODY ANCHOR */}
      <group ref={bodyRef}>
        {/* HERO CROWN OR CREST */}
        {isHero && (
          <group position={[0, 2.4, 0]}>
            <mesh>
              <cylinderGeometry args={[0.25, 0.18, 0.2, 6]} />
              <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={0.6} metalness={0.8} />
            </mesh>
            <pointLight distance={3} intensity={1.5} color="#fbbf24" />
          </group>
        )}

        {/* ================= MODEL TYPE VARIATIONS ================= */}

        {/* 1. PALADIN / KNIGHT HERO */}
        {def.modelType === 'hero_paladin' && (
          <group position={[0, 0.8, 0]}>
            {/* Torso & Armor */}
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.9, 0.5]} />
              <meshStandardMaterial color={def.modelColor} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Golden Pauldrons */}
            <mesh position={[-0.45, 0.35, 0]}>
              <boxGeometry args={[0.3, 0.35, 0.4]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} />
            </mesh>
            <mesh position={[0.45, 0.35, 0]}>
              <boxGeometry args={[0.3, 0.35, 0.4]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} />
            </mesh>
            {/* Helmet */}
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[0.45, 0.45, 0.45]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
            </mesh>
            {/* Broadsword (Weapon) */}
            <group ref={weaponRef} position={[0.45, 0.1, 0.3]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.1, 1.1, 0.2]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} metalness={0.9} />
              </mesh>
            </group>
            {/* Tower Shield */}
            <mesh position={[-0.5, 0.1, 0.2]}>
              <boxGeometry args={[0.1, 0.9, 0.6]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.6} />
            </mesh>
          </group>
        )}

        {/* 2. MAGE / SORCERER */}
        {(def.modelType === 'hero_mage' || def.modelType === 'support_cleric') && (
          <group position={[0, 0.8, 0]}>
            {/* Flowing Robe Cone */}
            <mesh castShadow>
              <coneGeometry args={[0.55, 1.2, 8]} />
              <meshStandardMaterial color={def.modelColor} />
            </mesh>
            {/* Hood / Head */}
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.26, 12, 12]} />
              <meshStandardMaterial color={def.emissiveColor || '#818cf8'} />
            </mesh>
            {/* Magic Staff */}
            <group ref={weaponRef} position={[0.45, 0.2, 0.2]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              {/* Floating Glowing Crystal Top */}
              <mesh position={[0, 1.15, 0]}>
                <octahedronGeometry args={[0.2]} />
                <meshStandardMaterial 
                  color={def.emissiveColor || '#c084fc'} 
                  emissive={def.emissiveColor || '#a855f7'} 
                  emissiveIntensity={1.2} 
                />
              </mesh>
            </group>
          </group>
        )}

        {/* 3. CYBER VALKYRIE / DRONE */}
        {(def.modelType === 'hero_valkyrie' || def.modelType === 'cyber_drone') && (
          <group position={[0, 1.0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.35, 0.2, 0.8, 8]} />
              <meshStandardMaterial color={def.modelColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.8} />
            </mesh>
            {/* Holographic Wings */}
            <group ref={wingsRef} position={[0, 0.2, -0.2]}>
              <mesh position={[-0.7, 0.3, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[1.2, 0.25, 0.05]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} />
              </mesh>
              <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[1.2, 0.25, 0.05]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} />
              </mesh>
            </group>
            {/* Plasma Thruster Glow */}
            <pointLight position={[0, -0.5, 0]} color="#06b6d4" distance={2} intensity={2} />
          </group>
        )}

        {/* 4. DRAGON / FLYING CREATURE */}
        {(def.modelType === 'creature_dragon' || def.modelType === 'creature_griffin' || def.modelType === 'hero_dragonkin') && (
          <group position={[0, 0.9, 0]}>
            {/* Body */}
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.6, 1.4]} />
              <meshStandardMaterial color={def.modelColor} roughness={0.4} />
            </mesh>
            {/* Neck & Head */}
            <group position={[0, 0.35, 0.7]} rotation={[0.4, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.18, 0.28, 0.8, 8]} />
                <meshStandardMaterial color={def.modelColor} />
              </mesh>
              <mesh position={[0, 0.45, 0.1]}>
                <boxGeometry args={[0.35, 0.3, 0.5]} />
                <meshStandardMaterial color={def.emissiveColor || def.modelColor} />
              </mesh>
            </group>
            {/* Wings */}
            <group ref={wingsRef} position={[0, 0.3, 0]}>
              <mesh position={[-1.2, 0.4, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[1.8, 0.05, 1.0]} />
                <meshStandardMaterial color={def.emissiveColor || def.modelColor} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[1.2, 0.4, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[1.8, 0.05, 1.0]} />
                <meshStandardMaterial color={def.emissiveColor || def.modelColor} side={THREE.DoubleSide} />
              </mesh>
            </group>
            {/* Tail */}
            <mesh position={[0, -0.1, -1.0]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.2, 1.1, 6]} />
              <meshStandardMaterial color={def.modelColor} />
            </mesh>
          </group>
        )}

        {/* 5. HEAVY GOLEM / BEHEMOTH */}
        {(def.modelType === 'soldier_golem' || def.modelType === 'creature_behemoth') && (
          <group position={[0, 0.85, 0]}>
            {/* Massive Stone Torso */}
            <mesh castShadow>
              <boxGeometry args={[1.1, 1.0, 0.8]} />
              <meshStandardMaterial color={def.modelColor} roughness={0.9} metalness={0.2} />
            </mesh>
            {/* Massive Fists */}
            <mesh position={[-0.75, -0.1, 0.2]}>
              <boxGeometry args={[0.45, 0.7, 0.45]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0.75, -0.1, 0.2]}>
              <boxGeometry args={[0.45, 0.7, 0.45]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            {/* Glowing Eye Visor */}
            <mesh position={[0, 0.3, 0.42]}>
              <boxGeometry args={[0.45, 0.12, 0.1]} />
              <meshStandardMaterial color="#ef4444" emissive="#f87171" emissiveIntensity={1.0} />
            </mesh>
          </group>
        )}

        {/* 6. QUADRUPED WOLF / BEAST */}
        {def.modelType === 'creature_wolf' && (
          <group position={[0, 0.5, 0]}>
            {/* Body */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.5, 1.2]} />
              <meshStandardMaterial color={def.modelColor} roughness={0.7} />
            </mesh>
            {/* Head & Ears */}
            <mesh position={[0, 0.3, 0.65]} rotation={[Math.PI / 3, 0, 0]}>
              <coneGeometry args={[0.26, 0.5, 4]} />
              <meshStandardMaterial color={def.modelColor} />
            </mesh>
            {/* 4 Legs */}
            <mesh position={[-0.25, -0.35, 0.4]}><cylinderGeometry args={[0.08, 0.08, 0.5]} /><meshStandardMaterial color={def.modelColor} /></mesh>
            <mesh position={[0.25, -0.35, 0.4]}><cylinderGeometry args={[0.08, 0.08, 0.5]} /><meshStandardMaterial color={def.modelColor} /></mesh>
            <mesh position={[-0.25, -0.35, -0.4]}><cylinderGeometry args={[0.08, 0.08, 0.5]} /><meshStandardMaterial color={def.modelColor} /></mesh>
            <mesh position={[0.25, -0.35, -0.4]}><cylinderGeometry args={[0.08, 0.08, 0.5]} /><meshStandardMaterial color={def.modelColor} /></mesh>
          </group>
        )}

        {/* 7. ARCHER / RANGER */}
        {def.modelType === 'soldier_archer' && (
          <group position={[0, 0.7, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.28, 0.85, 8]} />
              <meshStandardMaterial color={def.modelColor} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color="#fcd34d" />
            </mesh>
            {/* Longbow in hand */}
            <group ref={weaponRef} position={[0.3, 0.15, 0.2]} rotation={[0, -0.4, 0]}>
              <mesh>
                <torusGeometry args={[0.45, 0.03, 6, 16, Math.PI]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
            </group>
          </group>
        )}

        {/* 8. STANDARD SWORDSMAN FOOTMAN */}
        {(def.modelType === 'soldier_swordsman' || def.modelType === 'hero_warrior') && (
          <group position={[0, 0.75, 0]}>
            {/* Torso */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.75, 0.4]} />
              <meshStandardMaterial color={def.modelColor} metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Helmet */}
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.35, 0.35, 0.35]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} />
            </mesh>
            {/* Sword */}
            <group ref={weaponRef} position={[0.38, 0.1, 0.2]}>
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[0.08, 0.8, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
              </mesh>
            </group>
            {/* Shield */}
            <mesh position={[-0.38, 0.1, 0.15]}>
              <boxGeometry args={[0.08, 0.6, 0.45]} />
              <meshStandardMaterial color={teamColor} metalness={0.4} />
            </mesh>
          </group>
        )}

        {/* 9. SPECIAL SPECTRAL WRAITH */}
        {def.modelType === 'special_wraith' && (
          <group position={[0, 0.9, 0]}>
            <mesh castShadow rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.45, 1.2, 8]} />
              <meshBasicMaterial color={def.modelColor} transparent opacity={0.75} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial color="#e9d5ff" emissive="#c084fc" emissiveIntensity={1.0} />
            </mesh>
          </group>
        )}
      </group>

      {/* FLOATING HEALTH BAR & SQUAD BADGE */}
      <group position={[0, 2.1 + (isHero ? 0.6 : 0), 0]}>
        {/* Health Bar Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.4, 0.2]} />
          <meshBasicMaterial color="#09090b" side={THREE.DoubleSide} />
        </mesh>
        {/* Health Fill */}
        <mesh position={[(hpPercent - 1) * 0.65, 0, 0.01]}>
          <planeGeometry args={[1.3 * hpPercent, 0.15]} />
          <meshBasicMaterial color={hpPercent > 0.4 ? (isPlayer ? '#38bdf8' : '#ef4444') : '#eab308'} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
