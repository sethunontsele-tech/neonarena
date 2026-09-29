import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CombatMechModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  aimAngle?: number;
  healthPercent?: number;
}

export const CombatMechModel: React.FC<CombatMechModelProps> = ({
  color = '#475569',
  camo = 'urban_cyber',
  isDriving = false,
  aimAngle = 0,
  healthPercent = 100,
}) => {
  const torsoRef = useRef<THREE.Group>(null);
  const minigunBarrelsRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const mainColor = camo === 'urban_cyber' ? '#18181b' :
                    camo === 'arctic_tiger' ? '#f1f5f9' :
                    camo === 'gold_elite' ? '#b45309' :
                    color || '#475569';

  const glowColor = camo === 'urban_cyber' ? '#00e5ff' :
                    camo === 'arctic_tiger' ? '#38bdf8' :
                    '#ef4444';

  useFrame((_, delta) => {
    // Torso aiming tracking
    if (torsoRef.current) {
      torsoRef.current.rotation.y = THREE.MathUtils.lerp(torsoRef.current.rotation.y, aimAngle, 0.1);
    }
    // Minigun spinning
    if (minigunBarrelsRef.current && isDriving) {
      minigunBarrelsRef.current.rotation.z += 25 * delta;
    }
    // Mech walking step motion
    if (isDriving) {
      const step = Math.sin(Date.now() * 0.008);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = step * 0.35;
        rightLegRef.current.rotation.x = -step * 0.35;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= HIP PELVIS ASSEMBLY ================= */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[1.4, 0.6, 1.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* ================= ARTICULATED REVERSE-JOINT LEGS ================= */}
      {/* Left Leg */}
      <group position={[-1.0, 1.8, 0]} ref={leftLegRef}>
        {/* Upper Thigh */}
        <mesh position={[0, -0.4, 0.2]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 1.2, 0.6]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Knee Hydraulic Piston */}
        <mesh position={[0, -0.8, -0.1]} rotation={[-0.7, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {/* Heavy Stabilizing Foot Pad */}
        <mesh position={[0, -1.6, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.3, 1.4]} />
          <meshStandardMaterial color="#09090b" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[1.0, 1.8, 0]} ref={rightLegRef}>
        {/* Upper Thigh */}
        <mesh position={[0, -0.4, 0.2]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 1.2, 0.6]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Knee Hydraulic Piston */}
        <mesh position={[0, -0.8, -0.1]} rotation={[-0.7, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {/* Heavy Foot Pad */}
        <mesh position={[0, -1.6, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.3, 1.4]} />
          <meshStandardMaterial color="#09090b" roughness={0.8} />
        </mesh>
      </group>

      {/* ================= ROTATING ARMORED TORSO & COCKPIT ================= */}
      <group position={[0, 2.4, 0]} ref={torsoRef}>
        {/* Main Chest Chassis */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.6, 2.2]} />
          <meshStandardMaterial color={mainColor} roughness={0.35} metalness={0.75} />
        </mesh>

        {/* Angular Cockpit Optical Visor Slit */}
        <mesh position={[0, 1.0, -1.12]}>
          <boxGeometry args={[1.2, 0.18, 0.05]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={4} />
        </mesh>

        {/* Shoulder Micro-Missile Pod (Left Shoulder) */}
        <group position={[-1.5, 1.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.7, 1.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* 6 Missile Launch Cells */}
          {[-0.2, 0, 0.2].map((x, i) =>
            [-0.15, 0.15].map((y, j) => (
              <mesh key={`pod-${i}-${j}`} position={[x, y, -0.66]}>
                <circleGeometry args={[0.07, 12]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            ))
          )}
        </group>

        {/* Right Arm: Heavy Rotary Minigun */}
        <group position={[1.6, 0.6, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.8, 0.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Spinning 6-Barrel Cluster */}
          <group position={[0, -0.2, -0.9]} ref={minigunBarrelsRef}>
            {[0, 1, 2, 3, 4, 5].map(idx => {
              const a = (idx * Math.PI) / 3;
              return (
                <mesh
                  key={`barrel-${idx}`}
                  position={[Math.cos(a) * 0.16, Math.sin(a) * 0.16, -0.9]}
                  rotation={[Math.PI / 2, 0, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
                  <meshStandardMaterial color="#09090b" metalness={0.95} />
                </mesh>
              );
            })}
          </group>
        </group>

        {/* Left Arm: Heavy Plasma Cannon */}
        <group position={[-1.6, 0.6, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.8, 0.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Plasma Emitter Barrel & Glowing Coils */}
          <mesh position={[0, -0.1, -1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 2.4, 16]} />
            <meshStandardMaterial color="#09090b" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.1, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26, 0.04, 8, 16]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[0, -0.1, -1.6]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.04, 8, 16]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
