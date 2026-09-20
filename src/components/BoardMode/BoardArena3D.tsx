import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ActiveUnitInstance, DefensiveStructure, BoardEnvironmentConfig } from './types';
import { BOARD_UNITS } from './unitCatalog';
import { BoardUnit3D } from './BoardUnit3D';

interface BoardArena3DProps {
  units: ActiveUnitInstance[];
  structures: DefensiveStructure[];
  selectedUnitIds: string[];
  environment: BoardEnvironmentConfig;
  isTabletopVR: boolean;
  isMixedReality: boolean;
  onSelectUnit: (id: string, shiftKey: boolean) => void;
  onBoardClick: (point: [number, number, number]) => void;
  onStructureClick: (structureId: string) => void;
}

export const BoardArena3D: React.FC<BoardArena3DProps> = ({
  units,
  structures,
  selectedUnitIds,
  environment,
  isTabletopVR,
  isMixedReality,
  onSelectUnit,
  onBoardClick,
  onStructureClick
}) => {
  const controlsRef = useRef<any>(null);
  const nexusPlayerRef = useRef<THREE.Mesh>(null);
  const nexusEnemyRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Spin nexus power crystals
    if (nexusPlayerRef.current) {
      nexusPlayerRef.current.rotation.y += delta * 0.8;
      nexusPlayerRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.2;
    }
    if (nexusEnemyRef.current) {
      nexusEnemyRef.current.rotation.y -= delta * 0.8;
      nexusEnemyRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 1.5) * 0.2;
    }
  });

  return (
    <>
      {/* Dynamic Environment Ambient & Directional Lighting */}
      <ambientLight color={environment.ambientLight} intensity={0.8} />
      <directionalLight 
        position={[-15, 30, 20]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color="#ffffff"
      />
      <pointLight position={[0, 15, 0]} intensity={1.2} color={environment.themeColor} distance={45} />

      {/* Orbit & Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        maxPolarAngle={Math.PI / 2.15}
        minDistance={isTabletopVR ? 10 : 14}
        maxDistance={isTabletopVR ? 45 : 75}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
      />

      {/* STRATEGY TABLETOP WOODEN / MARBLE FRAME (Visible in Tabletop & VR) */}
      <group position={[0, -0.4, 0]}>
        {/* Table Beveled Border Frame */}
        <mesh position={[0, -0.6, 0]} receiveShadow>
          <boxGeometry args={[74, 1.2, 42]} />
          <meshStandardMaterial 
            color={isMixedReality ? '#18181b' : '#0f172a'} 
            roughness={0.4} 
            metalness={0.7} 
          />
        </mesh>
        {/* Brass Ornate Trim */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[72.8, 0.15, 40.8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* MAIN BATTLEFIELD PLAYING SURFACE */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onBoardClick([e.point.x, 0, e.point.z]);
        }}
      >
        <planeGeometry args={[70, 38, 32, 32]} />
        <meshStandardMaterial 
          color={environment.floorColor} 
          roughness={0.8} 
          metalness={0.1} 
        />
      </mesh>

      {/* HOLOGRAPHIC STRATEGY GRID */}
      <gridHelper args={[70, 35, environment.themeColor, '#334155']} position={[0, 0.02, 0]} />

      {/* ================= THREE STRATEGIC LANES ================= */}
      {[-14, 0, 14].map((laneZ, idx) => (
        <group key={`lane_${idx}`} position={[0, 0.03, laneZ]}>
          {/* Lane Road Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[66, 4.2]} />
            <meshStandardMaterial 
              color="#1e293b" 
              roughness={0.6} 
            />
          </mesh>
          {/* Glowing Center Lane Energy Guideline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[66, 0.3]} />
            <meshBasicMaterial 
              color={environment.laneColor} 
              transparent 
              opacity={0.65} 
            />
          </mesh>
          {/* Lane Bridge over River / Void Chasm */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[5.0, 0.3, 5.0]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* CENTRAL DIVIDING RIVER / VOID CHASM */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 38]} />
        <meshStandardMaterial 
          color="#0284c7" 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.85} 
        />
      </mesh>

      {/* ================= DEFENSIVE STRUCTURES (TOWERS & CITADELS) ================= */}
      {structures.map((struct) => {
        if (struct.destroyed) return null;

        const isPlayer = struct.team === 'player';
        const teamColor = isPlayer ? '#38bdf8' : '#f43f5e';
        const isNexus = struct.type === 'nexus';
        const isGuardian = struct.type === 'guardian';
        const hpPercent = Math.max(0, struct.hp / struct.maxHp);

        return (
          <group 
            key={struct.id} 
            position={struct.position}
            onClick={(e) => {
              e.stopPropagation();
              onStructureClick(struct.id);
            }}
          >
            {/* Range Indicator Circle on Ground */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[struct.range - 0.2, struct.range, 36]} />
              <meshBasicMaterial color={teamColor} transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>

            {/* BASE PLINTH */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[isNexus ? 3.2 : 1.6, isNexus ? 3.8 : 2.0, 0.8, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* MAIN STRUCTURE BODY */}
            {isNexus ? (
              // CITADEL NEXUS
              <group position={[0, 2.8, 0]}>
                {/* 4 Corner Pylons */}
                {[-2, 2].map((xP, i) => (
                  <React.Fragment key={i}>
                    {[-2, 2].map((zP, j) => (
                      <mesh key={`${i}_${j}`} position={[xP, 0, zP]} castShadow>
                        <boxGeometry args={[0.6, 4.0, 0.6]} />
                        <meshStandardMaterial color="#334155" metalness={0.8} />
                      </mesh>
                    ))}
                  </React.Fragment>
                ))}
                {/* Rotating Core Crystal */}
                <mesh ref={isPlayer ? nexusPlayerRef : nexusEnemyRef} position={[0, 0.8, 0]}>
                  <octahedronGeometry args={[1.6]} />
                  <meshStandardMaterial 
                    color={teamColor} 
                    emissive={teamColor} 
                    emissiveIntensity={1.2} 
                    roughness={0.1} 
                    metalness={0.9} 
                  />
                </mesh>
                <pointLight position={[0, 1, 0]} color={teamColor} distance={12} intensity={2.5} />
              </group>
            ) : isGuardian ? (
              // GUARDIAN SPIRE
              <group position={[0, 2.2, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.7, 1.2, 3.8, 8]} />
                  <meshStandardMaterial color="#334155" metalness={0.6} />
                </mesh>
                {/* Floating Spire Head */}
                <mesh position={[0, 2.2, 0]}>
                  <octahedronGeometry args={[0.75]} />
                  <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.9} />
                </mesh>
                <pointLight position={[0, 2.2, 0]} color={teamColor} distance={8} intensity={1.8} />
              </group>
            ) : (
              // OUTER TOWER (ARCANE / PRISM / TESLA)
              <group position={[0, 1.8, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.6, 1.0, 3.0, 8]} />
                  <meshStandardMaterial color="#475569" metalness={0.5} />
                </mesh>
                <mesh position={[0, 1.8, 0]}>
                  <coneGeometry args={[0.8, 1.4, 6]} />
                  <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.6} />
                </mesh>
                <pointLight position={[0, 2.0, 0]} color={teamColor} distance={6} intensity={1.5} />
              </group>
            )}

            {/* FLOATING STRUCTURE HEALTH BAR */}
            <group position={[0, isNexus ? 6.2 : 4.8, 0]}>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[isNexus ? 3.6 : 2.4, 0.35]} />
                <meshBasicMaterial color="#09090b" side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[(hpPercent - 1) * (isNexus ? 1.7 : 1.15), 0, 0.01]}>
                <planeGeometry args={[(isNexus ? 3.4 : 2.3) * hpPercent, 0.28]} />
                <meshBasicMaterial color={isPlayer ? '#38bdf8' : '#ef4444'} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* ================= ACTIVE UNITS ================= */}
      {units.map((unit) => {
        const def = BOARD_UNITS.find(u => u.id === unit.unitId);
        if (!def) return null;

        const isSelected = selectedUnitIds.includes(unit.instanceId);

        return (
          <BoardUnit3D
            key={unit.instanceId}
            unit={unit}
            def={def}
            isSelected={isSelected}
            isHero={def.isHero}
            squadLabel={unit.squadId}
            onClick={(e) => onSelectUnit(unit.instanceId, e.shiftKey)}
          />
        );
      })}
    </>
  );
};
