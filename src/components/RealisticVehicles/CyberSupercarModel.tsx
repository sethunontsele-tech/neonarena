import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CyberSupercarModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  isBoosting?: boolean;
  speed?: number;
  steeringAngle?: number;
  healthPercent?: number;
}

export const CyberSupercarModel: React.FC<CyberSupercarModelProps> = ({
  color = '#ef4444',
  camo = 'urban_cyber',
  isDriving = false,
  isBoosting = false,
  speed = 0,
  steeringAngle = 0,
  healthPercent = 100,
}) => {
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearWingRef = useRef<THREE.Group>(null);
  const rotatingWheelsRef = useRef<THREE.Mesh[]>([]);

  const mainColor = camo === 'urban_cyber' ? '#09090b' :
                    camo === 'arctic_tiger' ? '#f8fafc' :
                    camo === 'gold_elite' ? '#d97706' :
                    camo === 'battle_rust' ? '#451a03' :
                    color || '#ef4444';

  const accentColor = camo === 'urban_cyber' ? '#00e5ff' :
                      camo === 'arctic_tiger' ? '#38bdf8' :
                      camo === 'gold_elite' ? '#fde047' :
                      '#ef4444';

  useFrame((_, delta) => {
    // Steer front wheels
    if (frontLeftWheelRef.current && frontRightWheelRef.current) {
      frontLeftWheelRef.current.rotation.y = THREE.MathUtils.lerp(frontLeftWheelRef.current.rotation.y, steeringAngle, 0.2);
      frontRightWheelRef.current.rotation.y = THREE.MathUtils.lerp(frontRightWheelRef.current.rotation.y, steeringAngle, 0.2);
    }

    // Rotate all wheels with speed
    if (isDriving) {
      const rot = (speed || 8) * delta * 8;
      rotatingWheelsRef.current.forEach(w => {
        if (w) w.rotation.x += rot;
      });
    }

    // Active rear aero-wing elevates with speed
    if (rearWingRef.current) {
      const targetHeight = (isDriving && speed > 5) || isBoosting ? 1.45 : 1.15;
      rearWingRef.current.position.y = THREE.MathUtils.lerp(rearWingRef.current.position.y, targetHeight, 0.1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= SCULPTED AERODYNAMIC WIDEBODY ================= */}
      {/* Lower Main Monocoque Chassis */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.5, 4.8]} />
        <meshStandardMaterial color={mainColor} roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Aerodynamic Hood & Carbon Front Splitter */}
      <mesh position={[0, 0.45, -2.1]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <meshStandardMaterial color={mainColor} roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Carbon Splitter Plate */}
      <mesh position={[0, 0.22, -2.6]}>
        <boxGeometry args={[2.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>

      {/* Aerodynamic Greenhouse Cabin & Windshield */}
      <mesh position={[0, 1.0, -0.2]} castShadow>
        <boxGeometry args={[1.7, 0.55, 2.2]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.05}
          metalness={0.9}
          transmission={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Side Air Scoop Intakes */}
      {[-1.22, 1.22].map((x, i) => (
        <mesh key={`scoop-${i}`} position={[x, 0.6, 0.6]}>
          <boxGeometry args={[0.15, 0.35, 1.1]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}

      {/* ================= ACTIVE REAR AERO-WING & DIFFUSER ================= */}
      <group position={[0, 1.15, 2.1]} ref={rearWingRef}>
        {/* Carbon Wing Blade */}
        <mesh castShadow>
          <boxGeometry args={[2.3, 0.08, 0.45]} />
          <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Twin Vertical Stanchion Struts */}
        {[-0.65, 0.65].map((x, i) => (
          <mesh key={i} position={[x, -0.25, 0]}>
            <boxGeometry args={[0.04, 0.5, 0.15]} />
            <meshStandardMaterial color="#18181b" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Rear Aerodynamic Carbon Diffuser */}
      <mesh position={[0, 0.3, 2.45]}>
        <boxGeometry args={[2.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#09090b" />
      </mesh>

      {/* ================= WHEELS WITH CERAMIC BRAKES ================= */}
      {/* Front Left */}
      <group position={[-1.22, 0.4, -1.5]} ref={frontLeftWheelRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} ref={el => { if (el) rotatingWheelsRef.current.push(el); }} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.35, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        {/* Colored Brake Caliper */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.25]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[1.22, 0.4, -1.5]} ref={frontRightWheelRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} ref={el => { if (el) rotatingWheelsRef.current.push(el); }} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.35, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.25]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Rear Left */}
      <group position={[-1.22, 0.4, 1.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} ref={el => { if (el) rotatingWheelsRef.current.push(el); }} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.4, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
      </group>

      {/* Rear Right */}
      <group position={[1.22, 0.4, 1.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} ref={el => { if (el) rotatingWheelsRef.current.push(el); }} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.4, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
      </group>

      {/* ================= LIGHTING & EXHAUST ================= */}
      {/* Front LED Matrix Headlights */}
      <pointLight position={[-0.9, 0.5, -2.5]} color="#ffffff" intensity={6} distance={15} />
      <pointLight position={[0.9, 0.5, -2.5]} color="#ffffff" intensity={6} distance={15} />

      {/* Full-Width Cyber Rear Tail-Light Blade */}
      <mesh position={[0, 0.72, 2.44]}>
        <boxGeometry args={[2.1, 0.06, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
      </mesh>

      {/* Neon Underglow Ground Effect */}
      <pointLight position={[0, 0.1, 0]} color={accentColor} intensity={5} distance={5} />

      {/* Quad Titanium Exhaust Tips & Nitro Boost Flame */}
      <group position={[0, 0.4, 2.45]}>
        {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.2, 12, 1, true]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.95} />
          </mesh>
        ))}
        {isBoosting && (
          <pointLight position={[0, 0, 0.8]} color="#06b6d4" intensity={15} distance={8} />
        )}
      </group>
    </group>
  );
};
