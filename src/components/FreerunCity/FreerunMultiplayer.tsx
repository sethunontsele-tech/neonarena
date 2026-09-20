import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { NetworkRunner, MultiplayerMode } from './types';

interface FreerunMultiplayerProps {
  runners: NetworkRunner[];
  mode: MultiplayerMode;
  playerPosition: [number, number, number];
  onPlayerTagged?: () => void;
}

export function FreerunMultiplayer({
  runners,
  mode,
  playerPosition,
  onPlayerTagged
}: FreerunMultiplayerProps) {
  const runnersRef = useRef<Record<string, THREE.Group>>({});

  // Simulate dynamic freerunning AI bots moving across rooftops
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    runners.forEach((runner, idx) => {
      const grp = runnersRef.current[runner.id];
      if (!grp) return;

      // Patrol circuits between rooftops
      const phase = time * 0.4 + idx * 1.5;
      const radius = 35 + (idx % 3) * 15;
      const targetX = Math.sin(phase) * radius + (idx === 0 ? -20 : (idx === 1 ? 30 : 0));
      const targetZ = Math.cos(phase) * radius + (idx === 2 ? -30 : 20);

      // Lerp position
      grp.position.x = THREE.MathUtils.lerp(grp.position.x, targetX, 0.04);
      grp.position.z = THREE.MathUtils.lerp(grp.position.z, targetZ, 0.04);

      // Determine height from rooftop elevation or ground
      const distFromCenter = Math.sqrt(grp.position.x ** 2 + grp.position.z ** 2);
      let targetY = distFromCenter < 25 ? 65 : (distFromCenter < 55 ? 35 : 15);
      grp.position.y = THREE.MathUtils.lerp(grp.position.y, targetY, 0.08);

      // Face direction
      grp.rotation.y = Math.atan2(
        targetX - grp.position.x,
        targetZ - grp.position.z
      );

      // Check Tag proximity
      if (mode === 'tag' && runner.isIt) {
        const distToPlayer = Math.sqrt(
          (grp.position.x - playerPosition[0]) ** 2 +
          (grp.position.y - playerPosition[1]) ** 2 +
          (grp.position.z - playerPosition[2]) ** 2
        );
        if (distToPlayer < 3.2 && onPlayerTagged) {
          onPlayerTagged();
        }
      }
    });
  });

  return (
    <group>
      {runners.map((runner) => (
        <group
          key={runner.id}
          ref={(el) => {
            if (el) runnersRef.current[runner.id] = el;
          }}
          position={runner.position}
        >
          {/* Runner Body */}
          <group position={[0, 0.9, 0]}>
            {/* Torso */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.6, 0.3]} />
              <meshStandardMaterial color={runner.outfit.hoodieColor} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color="#fcd34d" />
            </mesh>
            {/* Visor */}
            {runner.outfit.hasVisor && (
              <mesh position={[0, 0.52, 0.12]}>
                <boxGeometry args={[0.3, 0.08, 0.12]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
            )}
            {/* Legs */}
            <mesh position={[-0.15, -0.6, 0]}>
              <cylinderGeometry args={[0.08, 0.07, 0.6, 8]} />
              <meshStandardMaterial color={runner.outfit.pantsColor} />
            </mesh>
            <mesh position={[0.15, -0.6, 0]}>
              <cylinderGeometry args={[0.08, 0.07, 0.6, 8]} />
              <meshStandardMaterial color={runner.outfit.pantsColor} />
            </mesh>
          </group>

          {/* Name Tag Billboard */}
          <group position={[0, 2.2, 0]}>
            <mesh>
              <planeGeometry args={[2.2, 0.5]} />
              <meshBasicMaterial color="#09090b" transparent opacity={0.75} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* IT TAG AURA */}
          {mode === 'tag' && runner.isIt && (
            <group position={[0, 1, 0]}>
              <mesh>
                <sphereGeometry args={[1.6, 16, 16]} />
                <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.4} />
              </mesh>
              <pointLight color="#ef4444" intensity={3} distance={8} />
            </group>
          )}

          {/* Kinetic Neon Trail */}
          <mesh position={[0, 0.2, -0.4]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial color={runner.trailColor} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
