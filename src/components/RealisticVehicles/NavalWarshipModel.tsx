import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NavalWarshipModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  speed?: number;
  healthPercent?: number;
}

export const NavalWarshipModel: React.FC<NavalWarshipModelProps> = ({
  color = '#475569',
  camo = 'stealth_matte',
  isDriving = false,
  speed = 0,
  healthPercent = 100,
}) => {
  const radarRef = useRef<THREE.Group>(null);
  const cannonRef = useRef<THREE.Group>(null);

  const mainColor = camo === 'urban_cyber' ? '#1e293b' :
                    camo === 'arctic_tiger' ? '#e2e8f0' :
                    camo === 'gold_elite' ? '#b45309' :
                    color || '#475569';

  useFrame((_, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += 3.5 * delta;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= WAVE-PIERCING STEALTH TUMBLEHOME HULL ================= */}
      {/* Main Warship Hull */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.6, 9.6]} />
        <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Reverse Inverted Wave-Piercing Bow */}
      <mesh position={[0, 1.1, -5.6]} rotation={[0.45, 0, 0]} castShadow>
        <boxGeometry args={[3.18, 1.8, 2.2]} />
        <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Waterline Antifouling Red Stripe */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3.25, 0.2, 9.8]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>

      {/* ================= FORWARD 76mm NAVAL GUN TURRET ================= */}
      <group position={[0, 2.0, -3.2]} ref={cannonRef}>
        {/* Faceted Stealth Housing */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.8, 1.8]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* 76mm Barrel */}
        <mesh position={[0, 0.1, -1.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 2.4, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} />
        </mesh>
      </group>

      {/* ================= 8-CELL VLS MISSILE SILO DECK ================= */}
      <group position={[0, 1.75, -1.4]}>
        <mesh>
          <boxGeometry args={[1.8, 0.1, 1.4]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* 8 Silo Hatch Doors */}
        {[-0.55, -0.18, 0.18, 0.55].map((x, i) =>
          [-0.35, 0.35].map((z, j) => (
            <mesh key={`vls-${i}-${j}`} position={[x, 0.06, z]}>
              <boxGeometry args={[0.3, 0.04, 0.5]} />
              <meshStandardMaterial color="#09090b" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* ================= BRIDGE & STEALTH RADAR SUPERSTRUCTURE ================= */}
      <group position={[0, 2.6, 0.8]}>
        {/* Bridge Deckhouse */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 1.4, 3.2]} />
          <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Bridge Tinted Navigation Windows */}
        <mesh position={[0, 0.3, -1.61]}>
          <boxGeometry args={[2.2, 0.45, 0.05]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Integrated Enclosed Stealth Mast */}
        <mesh position={[0, 1.4, -0.4]} castShadow>
          <coneGeometry args={[0.7, 2.0, 4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>

        {/* Rotating Surface Search Radar Bar */}
        <group position={[0, 2.6, -0.4]} ref={radarRef}>
          <mesh>
            <boxGeometry args={[1.6, 0.15, 0.2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          {/* Beacon light */}
          <pointLight position={[0, 0.2, 0]} color="#ef4444" intensity={2} distance={6} />
        </group>
      </group>

      {/* ================= STERN FLIGHT DECK & HELIPAD ================= */}
      <group position={[0, 1.72, 3.5]}>
        {/* Helipad Marking Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.15, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        {/* Helipad Letter "H" */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Water Spray & Wake Wash Light */}
      {isDriving && (
        <pointLight position={[0, 0.2, 5.0]} color="#38bdf8" intensity={8} distance={10} />
      )}
    </group>
  );
};
