import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ArmoredIFVModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  speed?: number;
  turretRotation?: number;
  healthPercent?: number;
}

export const ArmoredIFVModel: React.FC<ArmoredIFVModelProps> = ({
  color = '#334155',
  camo = 'digital_desert',
  isDriving = false,
  speed = 0,
  turretRotation = 0,
  healthPercent = 100,
}) => {
  const turretRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);

  const mainColor = camo === 'urban_cyber' ? '#1e293b' :
                    camo === 'arctic_tiger' ? '#cbd5e1' :
                    camo === 'gold_elite' ? '#b45309' :
                    camo === 'battle_rust' ? '#713f12' :
                    color || '#334155';

  const secondaryColor = camo === 'urban_cyber' ? '#0284c7' :
                         camo === 'arctic_tiger' ? '#64748b' :
                         '#1e293b';

  useFrame((_, delta) => {
    if (isDriving) {
      const rot = (speed || 5) * delta * 5;
      wheelsRef.current.forEach(w => {
        if (w) w.rotation.x += rot;
      });
    }
    if (turretRef.current) {
      turretRef.current.rotation.y = THREE.MathUtils.lerp(turretRef.current.rotation.y, turretRotation, 0.1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= 8x8 COMBAT CHASSIS ================= */}
      {/* Heavy Armored Hull */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 1.1, 6.4]} />
        <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Sloped Glacis Nose & Wire Cutter */}
      <mesh position={[0, 1.05, -3.4]} rotation={[-0.45, 0, 0]} castShadow>
        <boxGeometry args={[2.68, 0.9, 1.0]} />
        <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.7, -3.2]}>
        <boxGeometry args={[0.06, 0.8, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* Side Reactive Armor Panels */}
      {[-2.0, -0.8, 0.4, 1.6].map((z, idx) => (
        <React.Fragment key={`era-${idx}`}>
          <mesh position={[-1.4, 1.15, z]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.95]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.6} />
          </mesh>
          <mesh position={[1.4, 1.15, z]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.95]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.6} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 8 Heavy High-Traction Combat Run-Flat Wheels */}
      {[-2.2, -0.8, 0.8, 2.2].map((z, idx) => (
        <React.Fragment key={`axle-${idx}`}>
          {/* Left Wheel */}
          <mesh
            position={[-1.5, 0.5, z]}
            rotation={[0, 0, Math.PI / 2]}
            ref={el => { if (el) wheelsRef.current.push(el); }}
            castShadow
          >
            <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.95} />
          </mesh>
          {/* Right Wheel */}
          <mesh
            position={[1.5, 0.5, z]}
            rotation={[0, 0, Math.PI / 2]}
            ref={el => { if (el) wheelsRef.current.push(el); }}
            castShadow
          >
            <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.95} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ================= 30mm AUTOCANNON TURRET & TOW LAUNCHER ================= */}
      <group position={[0, 1.85, -0.4]} ref={turretRef}>
        {/* Turret Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.65, 2.0]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.7} />
        </mesh>

        {/* 30mm Bushmaster Autocannon */}
        <mesh position={[0.2, 0.1, -1.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.4, 12]} />
          <meshStandardMaterial color="#09090b" metalness={0.95} />
        </mesh>

        {/* TOW / Javelin Anti-Tank Missile Pod on Left Shoulder */}
        <group position={[-1.05, 0.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.45, 1.4]} />
            <meshStandardMaterial color="#14532d" roughness={0.5} />
          </mesh>
          {/* Front Dual Tube Caps */}
          {[-0.1, 0.1].map((y, i) => (
            <mesh key={i} position={[0, y, -0.71]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          ))}
        </group>

        {/* Electro-Optical Sensor Sight */}
        <mesh position={[0.4, 0.5, -0.4]}>
          <boxGeometry args={[0.35, 0.35, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.4, 0.5, -0.61]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Rear Slat Cage Armor (RPG Deflector) */}
      <mesh position={[0, 1.2, 3.4]}>
        <boxGeometry args={[2.5, 0.8, 0.2]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>

      {/* Xenon Headlights */}
      <pointLight position={[-1.1, 1.1, -3.6]} color="#e0f2fe" intensity={5} distance={15} />
      <pointLight position={[1.1, 1.1, -3.6]} color="#e0f2fe" intensity={5} distance={15} />
    </group>
  );
};
