import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TankModelProps {
  color?: string;
  camo?: string;
  turretRotation?: number;
  gunElevation?: number;
  recoil?: number;
  isDriving?: boolean;
  speed?: number;
  healthPercent?: number;
}

export const TankModel: React.FC<TankModelProps> = ({
  color = '#3f4e38',
  camo = 'digital_desert',
  turretRotation = 0,
  gunElevation = 0,
  recoil = 0,
  isDriving = false,
  speed = 0,
  healthPercent = 100,
}) => {
  const leftTreadRef = useRef<THREE.Group>(null);
  const rightTreadRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);
  const barrelRef = useRef<THREE.Group>(null);

  // Wheel references for rotation
  const wheelsRef = useRef<THREE.Mesh[]>([]);

  // Camo color adjustments
  const mainColor = camo === 'urban_cyber' ? '#263238' :
                    camo === 'arctic_tiger' ? '#eceff1' :
                    camo === 'stealth_matte' ? '#18181b' :
                    camo === 'gold_elite' ? '#d97706' :
                    camo === 'battle_rust' ? '#78350f' :
                    color || '#4b5563';

  const secondaryColor = camo === 'urban_cyber' ? '#00e5ff' :
                         camo === 'arctic_tiger' ? '#78909c' :
                         camo === 'stealth_matte' ? '#27272a' :
                         camo === 'gold_elite' ? '#fde047' :
                         camo === 'battle_rust' ? '#451a03' :
                         '#2d3748';

  useFrame((_, delta) => {
    if (isDriving) {
      // Rotate road wheels when driving
      const rotSpeed = (speed || 5) * delta * 4;
      wheelsRef.current.forEach(wheel => {
        if (wheel) wheel.rotation.x += rotSpeed;
      });
    }

    if (turretRef.current) {
      turretRef.current.rotation.y = THREE.MathUtils.lerp(turretRef.current.rotation.y, turretRotation, 0.1);
    }
    if (barrelRef.current) {
      barrelRef.current.rotation.x = THREE.MathUtils.lerp(barrelRef.current.rotation.x, gunElevation, 0.1);
      // Apply firing recoil offset
      barrelRef.current.position.z = THREE.MathUtils.lerp(barrelRef.current.position.z, -recoil * 0.4, 0.2);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= LOWER HULL & TRACK SYSTEM ================= */}
      {/* Main Armored Chassis Hull */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.8, 5.8]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Sloped Front Glacis Plate */}
      <mesh position={[0, 0.9, -3.0]} rotation={[-0.45, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.18, 0.7, 1.2]} />
        <meshStandardMaterial color={mainColor} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Front Tow Rings / Shackles */}
      {[-1.1, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 0.6, -3.5]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Explosive Reactive Armor (ERA) Bricks on front glacis */}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => (
        <mesh key={`era-front-${i}`} position={[x, 1.05, -2.85]} rotation={[-0.45, 0, 0]} castShadow>
          <boxGeometry args={[0.38, 0.12, 0.45]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.6} metalness={0.5} />
        </mesh>
      ))}

      {/* Rear Engine Deck Grilles */}
      <mesh position={[0, 1.28, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.4]} />
        <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.3} wireframe />
      </mesh>

      {/* Rear Auxiliary Fuel Drums */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={`fuel-${i}`} position={[x, 0.95, 3.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.9, 16]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* ================= CATERPILLAR TRACKS & WHEELS ================= */}
      {/* Left Track & Sponson */}
      <group position={[-1.75, 0.5, 0]} ref={leftTreadRef}>
        {/* Armored Side Skirt Plate with ERA tiles */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 5.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} metalness={0.6} />
        </mesh>
        {/* ERA tiles along side skirt */}
        {[-2.2, -1.4, -0.6, 0.2, 1.0, 1.8].map((z, idx) => (
          <mesh key={`side-era-l-${idx}`} position={[-0.12, 0.4, z]} castShadow>
            <boxGeometry args={[0.08, 0.45, 0.65]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.7} metalness={0.4} />
          </mesh>
        ))}

        {/* Continuous Rubber Track Loop (simplified high-detail hull) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.85, 6.0]} />
          <meshStandardMaterial color="#18181b" roughness={0.95} metalness={0.1} />
        </mesh>

        {/* 6 Dual Road Wheels */}
        {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((z, idx) => (
          <mesh
            key={`wheel-l-${idx}`}
            position={[0, -0.05, z]}
            rotation={[0, 0, Math.PI / 2]}
            ref={(el) => { if (el) wheelsRef.current.push(el); }}
            castShadow
          >
            <cylinderGeometry args={[0.42, 0.42, 0.6, 16]} />
            <meshStandardMaterial color="#27272a" roughness={0.8} metalness={0.6} />
          </mesh>
        ))}
        {/* Drive Sprocket Rear */}
        <mesh position={[0, 0.2, 2.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.58, 12]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Front Idler Wheel */}
        <mesh position={[0, 0.2, -2.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.58, 12]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Track & Sponson */}
      <group position={[1.75, 0.5, 0]} ref={rightTreadRef}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 5.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} metalness={0.6} />
        </mesh>
        {[-2.2, -1.4, -0.6, 0.2, 1.0, 1.8].map((z, idx) => (
          <mesh key={`side-era-r-${idx}`} position={[0.12, 0.4, z]} castShadow>
            <boxGeometry args={[0.08, 0.45, 0.65]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.7} metalness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.85, 6.0]} />
          <meshStandardMaterial color="#18181b" roughness={0.95} metalness={0.1} />
        </mesh>
        {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((z, idx) => (
          <mesh
            key={`wheel-r-${idx}`}
            position={[0, -0.05, z]}
            rotation={[0, 0, Math.PI / 2]}
            ref={(el) => { if (el) wheelsRef.current.push(el); }}
            castShadow
          >
            <cylinderGeometry args={[0.42, 0.42, 0.6, 16]} />
            <meshStandardMaterial color="#27272a" roughness={0.8} metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.2, 2.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.58, 12]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, -2.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 0.58, 12]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ================= ROTATING TURRET ASSEMBLY ================= */}
      <group position={[0, 1.45, -0.3]} ref={turretRef}>
        {/* Turret Base Ring */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 0.2, 24]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Angular Stealth Composite Turret Body */}
        <mesh position={[0, 0.35, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.7, 3.2]} />
          <meshStandardMaterial color={mainColor} roughness={0.45} metalness={0.6} />
        </mesh>

        {/* Turret Front Cheeks (Angled Armor Wedges) */}
        <mesh position={[-0.85, 0.32, -1.3]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.1, 0.65, 1.4]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.65} />
        </mesh>
        <mesh position={[0.85, 0.32, -1.3]} rotation={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[1.1, 0.65, 1.4]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.65} />
        </mesh>

        {/* Commander's Panoramic Thermal Sight & Cupola */}
        <group position={[0.7, 0.85, 0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.38, 0.3, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Cyan Thermal Optics Lens */}
          <mesh position={[0, 0.05, -0.35]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* Gunner's Primary Sight Unit */}
        <group position={[-0.7, 0.75, -0.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.3, 0.5]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.26]}>
            <planeGeometry args={[0.25, 0.15]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Pintle-Mounted .50 Cal Remote Weapon Station (RWS) */}
        <group position={[-0.6, 1.1, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.2, 0.4]} />
            <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Ammo Box */}
          <mesh position={[-0.18, 0, 0]}>
            <boxGeometry args={[0.15, 0.22, 0.25]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
        </group>

        {/* Smoke Grenade Discharger Banks (Cheek Launchers) */}
        {[-1.25, 1.25].map((x, sideIdx) => (
          <group key={`smoke-${sideIdx}`} position={[x, 0.6, -0.6]} rotation={[0, sideIdx === 0 ? 0.35 : -0.35, 0]}>
            {[-0.15, 0, 0.15].map((offZ, tubeIdx) => (
              <mesh key={`tube-${tubeIdx}`} position={[0, tubeIdx * 0.12, offZ]} rotation={[Math.PI / 4, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
                <meshStandardMaterial color="#1f2937" metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Radio Antennas with Strobe Light */}
        <group position={[1.0, 0.7, 1.4]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.015, 0.03, 1.8, 6]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Turret Rear Bustle Rack (Storage Basket) */}
        <mesh position={[0, 0.4, 1.8]}>
          <boxGeometry args={[2.2, 0.4, 0.6]} />
          <meshStandardMaterial color="#1f2937" wireframe />
        </mesh>

        {/* ================= 120mm SMOOTHBORE MAIN CANNON ================= */}
        <group position={[0, 0.25, -1.6]} ref={barrelRef}>
          {/* Heavy Gun Mantlet Armor Shield */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.85, 0.55, 0.6]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Main Barrel Shaft */}
          <mesh position={[0, 0, -2.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.17, 4.6, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Barrel Thermal Sleeve Segments */}
          <mesh position={[0, 0, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
            <meshStandardMaterial color={mainColor} roughness={0.6} metalness={0.5} />
          </mesh>

          {/* Bore Evacuator / Fume Extractor Cylinder */}
          <mesh position={[0, 0, -3.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Multi-Slotted Muzzle Brake */}
          <mesh position={[0, 0, -4.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.16, 0.5, 16]} />
            <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Muzzle Opening Hole */}
          <mesh position={[0, 0, -5.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Recoil Flash light on fire */}
          {recoil > 0.05 && (
            <pointLight position={[0, 0, -5.4]} color="#ff7700" intensity={18} distance={15} />
          )}
        </group>
      </group>

      {/* Volumetric Xenon Headlights */}
      <group position={[0, 0.9, -3.2]}>
        <pointLight position={[-1.2, 0, 0]} color="#e0f2fe" intensity={6} distance={18} />
        <pointLight position={[1.2, 0, 0]} color="#e0f2fe" intensity={6} distance={18} />
        <mesh position={[-1.2, 0, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
        </mesh>
      </group>

      {/* Critical Damage Smoke / Fire */}
      {healthPercent < 40 && (
        <pointLight position={[0, 1.8, 0]} color="#ef4444" intensity={4} distance={6} />
      )}
    </group>
  );
};
