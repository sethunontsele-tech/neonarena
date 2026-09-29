import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CombatMotorbikeModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  speed?: number;
  steeringAngle?: number;
  healthPercent?: number;
}

export const CombatMotorbikeModel: React.FC<CombatMotorbikeModelProps> = ({
  color = '#ef4444',
  camo = 'urban_cyber',
  isDriving = false,
  speed = 0,
  steeringAngle = 0,
  healthPercent = 100,
}) => {
  const frontForkRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Mesh>(null);
  const rearWheelRef = useRef<THREE.Mesh>(null);

  const mainColor = camo === 'urban_cyber' ? '#18181b' :
                    camo === 'arctic_tiger' ? '#f8fafc' :
                    camo === 'gold_elite' ? '#d97706' :
                    color || '#ef4444';

  const accentColor = camo === 'urban_cyber' ? '#00e5ff' :
                      camo === 'arctic_tiger' ? '#38bdf8' :
                      '#ef4444';

  useFrame((_, delta) => {
    if (frontForkRef.current) {
      frontForkRef.current.rotation.y = THREE.MathUtils.lerp(frontForkRef.current.rotation.y, steeringAngle, 0.2);
    }
    if (isDriving) {
      const rot = (speed || 8) * delta * 10;
      if (frontWheelRef.current) frontWheelRef.current.rotation.x += rot;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x += rot;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= TRELLIS FRAME & EXPOSED ENGINE ================= */}
      {/* Central Trellis Frame */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 1.8]} />
        <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Exposed V-Twin Cylinder Blocks */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.6, -0.1]} rotation={[0, 0, i === 0 ? -0.3 : 0.3]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.45, 12]} />
          <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.9} />
        </mesh>
      ))}

      {/* Aerodynamic Fuel Tank & Seat */}
      <mesh position={[0, 1.05, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.35, 1.2]} />
        <meshStandardMaterial color={mainColor} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Rider Leather Saddle */}
      <mesh position={[0, 0.95, 0.4]}>
        <boxGeometry args={[0.38, 0.15, 0.6]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      {/* ================= FRONT FORK & WHEEL ================= */}
      <group position={[0, 0.5, -1.2]} ref={frontForkRef}>
        {/* Twin Inverted Heavy Gold Forks */}
        {[-0.22, 0.22].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0.1]} rotation={[-0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
            <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}

        {/* Front Wheel with Drilled Brake Discs */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} ref={frontWheelRef} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.25, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>

        {/* Glowing Rim Light */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.42, 0.02, 8, 32]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Aerodynamic Headlight Cowl */}
        <mesh position={[0, 0.7, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.3, 0.3]} />
          <meshStandardMaterial color={mainColor} />
        </mesh>
        <pointLight position={[0, 0.7, -0.4]} color="#ffffff" intensity={5} distance={15} />
      </group>

      {/* ================= REAR SWINGARM & WHEEL ================= */}
      <group position={[0, 0.5, 1.2]}>
        {/* Single-Sided Swingarm */}
        <mesh position={[0.22, 0.05, -0.6]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 1.1]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        {/* Extra Thick Rear Drag Tire */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} ref={rearWheelRef} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.38, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.45, 0.02, 8, 32]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Dual Stainless Exhaust Pipes */}
      <mesh position={[0.28, 0.45, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.1, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} />
      </mesh>
    </group>
  );
};
