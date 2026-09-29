import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FighterJetModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  isBoosting?: boolean;
  pitch?: number;
  roll?: number;
  speed?: number;
  healthPercent?: number;
}

export const FighterJetModel: React.FC<FighterJetModelProps> = ({
  color = '#374151',
  camo = 'stealth_matte',
  isDriving = false,
  isBoosting = false,
  pitch = 0,
  roll = 0,
  speed = 0,
  healthPercent = 100,
}) => {
  const leftStabilatorRef = useRef<THREE.Mesh>(null);
  const rightStabilatorRef = useRef<THREE.Mesh>(null);
  const leftRudderRef = useRef<THREE.Mesh>(null);
  const rightRudderRef = useRef<THREE.Mesh>(null);
  const afterburnerConeRef = useRef<THREE.Group>(null);

  const mainColor = camo === 'urban_cyber' ? '#1e293b' :
                    camo === 'arctic_tiger' ? '#f1f5f9' :
                    camo === 'gold_elite' ? '#b45309' :
                    camo === 'battle_rust' ? '#581c87' :
                    color || '#1e293b';

  const accentColor = camo === 'urban_cyber' ? '#06b6d4' :
                      camo === 'arctic_tiger' ? '#64748b' :
                      camo === 'gold_elite' ? '#facc15' :
                      camo === 'battle_rust' ? '#c084fc' :
                      '#475569';

  useFrame((_, delta) => {
    // Dynamic control surface deflections
    if (leftStabilatorRef.current) {
      leftStabilatorRef.current.rotation.x = THREE.MathUtils.lerp(
        leftStabilatorRef.current.rotation.x,
        pitch * 0.5 - roll * 0.4,
        0.15
      );
    }
    if (rightStabilatorRef.current) {
      rightStabilatorRef.current.rotation.x = THREE.MathUtils.lerp(
        rightStabilatorRef.current.rotation.x,
        pitch * 0.5 + roll * 0.4,
        0.15
      );
    }
    if (leftRudderRef.current && rightRudderRef.current) {
      const yawDeflection = roll * 0.3;
      leftRudderRef.current.rotation.y = THREE.MathUtils.lerp(leftRudderRef.current.rotation.y, yawDeflection, 0.15);
      rightRudderRef.current.rotation.y = THREE.MathUtils.lerp(rightRudderRef.current.rotation.y, yawDeflection, 0.15);
    }

    // Afterburner flicker
    if (afterburnerConeRef.current) {
      const pulse = isBoosting ? 1.0 + Math.sin(Date.now() * 0.05) * 0.2 : 0.4;
      afterburnerConeRef.current.scale.set(pulse, pulse, pulse * (isBoosting ? 1.8 : 0.8));
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= STEALTH FUSELAGE ================= */}
      {/* Central Blended Chined Fuselage Body */}
      <mesh position={[0, 0.6, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.75, 7.8]} />
        <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Aerodynamic Forward Chined Nose Cone */}
      <mesh position={[0, 0.55, -4.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.9, 2.8, 8]} />
        <meshStandardMaterial color={mainColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Pitot Probe Air-data Sensor at tip */}
      <mesh position={[0, 0.55, -6.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* ================= COCKPIT & PILOT CANOPY ================= */}
      <group position={[0, 1.05, -1.8]}>
        {/* Iridescent Bubble Glass Canopy */}
        <mesh position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.48, 1.6, 12, 16]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.05}
            metalness={0.9}
            transmission={0.65}
            thickness={0.4}
            ior={1.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Ejection Seat Headrest & Pilot Silhouette */}
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.4, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        {/* Holographic Cockpit HUD Reflector Glass */}
        <mesh position={[0, 0.15, -0.6]} rotation={[0.4, 0, 0]}>
          <planeGeometry args={[0.25, 0.2]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ================= SWEPT CROPPED DELTA WINGS ================= */}
      {/* Left Wing with Leading-Edge Root Extension (LERX) */}
      <group position={[-2.8, 0.55, 0.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 3.6, 0.12]} />
          <meshStandardMaterial color={mainColor} roughness={0.35} metalness={0.65} />
        </mesh>
        {/* Leading edge trim */}
        <mesh position={[0, 0, -1.6]} rotation={[-Math.PI / 2, 0, 0.2]}>
          <boxGeometry args={[4.2, 0.2, 0.14]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} />
        </mesh>
      </group>

      {/* Right Wing with LERX */}
      <group position={[2.8, 0.55, 0.5]}>
        <mesh rotation={[-Math.PI / 2, 0, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 3.6, 0.12]} />
          <meshStandardMaterial color={mainColor} roughness={0.35} metalness={0.65} />
        </mesh>
        <mesh position={[0, 0, -1.6]} rotation={[-Math.PI / 2, 0, -0.2]}>
          <boxGeometry args={[4.2, 0.2, 0.14]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} />
        </mesh>
      </group>

      {/* ================= TWIN CANTED VERTICAL STABILIZERS ================= */}
      {/* Left Vertical Fin */}
      <group position={[-1.25, 1.45, 2.6]} rotation={[0, 0, -0.32]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.8, 1.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Articulated Rudder */}
        <mesh ref={leftRudderRef} position={[0, 0, 0.85]}>
          <boxGeometry args={[0.08, 1.6, 0.45]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} />
        </mesh>
      </group>

      {/* Right Vertical Fin */}
      <group position={[1.25, 1.45, 2.6]} rotation={[0, 0, 0.32]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.8, 1.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Articulated Rudder */}
        <mesh ref={rightRudderRef} position={[0, 0, 0.85]}>
          <boxGeometry args={[0.08, 1.6, 0.45]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} />
        </mesh>
      </group>

      {/* ================= ALL-MOVING HORIZONTAL STABILATORS ================= */}
      <mesh
        ref={leftStabilatorRef}
        position={[-1.85, 0.6, 3.4]}
        rotation={[-Math.PI / 2, 0, 0.15]}
        castShadow
      >
        <boxGeometry args={[1.8, 1.4, 0.08]} />
        <meshStandardMaterial color={secondaryColor(mainColor)} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh
        ref={rightStabilatorRef}
        position={[1.85, 0.6, 3.4]}
        rotation={[-Math.PI / 2, 0, -0.15]}
        castShadow
      >
        <boxGeometry args={[1.8, 1.4, 0.08]} />
        <meshStandardMaterial color={secondaryColor(mainColor)} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ================= UNDERWING WEAPON PYLONS & MISSILES ================= */}
      {/* AIM-120 AMRAAM Missiles Left Wing */}
      {[-2.2, -3.8].map((x, idx) => (
        <group key={`missile-l-${idx}`} position={[x, 0.32, 0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Missile Body */}
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          {/* Missile Radome Nose */}
          <mesh position={[0, -0.12, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.35, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Missile Fins */}
          <mesh position={[0, -0.12, 0.9]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.45, 0.45, 0.02]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      ))}

      {/* AIM-120 AMRAAM Missiles Right Wing */}
      {[2.2, 3.8].map((x, idx) => (
        <group key={`missile-r-${idx}`} position={[x, 0.32, 0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.12, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.35, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.12, 0.9]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.45, 0.45, 0.02]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      ))}

      {/* ================= TWIN 3D TURBOFAN AFTERBURNER EXHAUSTS ================= */}
      <group position={[0, 0.6, 4.0]}>
        {/* Left Nozzle */}
        <mesh position={[-0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.44, 0.8, 16, 1, true]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Right Nozzle */}
        <mesh position={[0.55, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.44, 0.8, 16, 1, true]} />
          <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* Dynamic Afterburner Flame & Shock Diamonds */}
        <group ref={afterburnerConeRef}>
          {/* Left Core Flame */}
          <mesh position={[-0.55, 0, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 2.4, 16]} />
            <meshBasicMaterial color={isBoosting ? '#00e5ff' : '#f97316'} transparent opacity={0.85} />
          </mesh>
          {/* Right Core Flame */}
          <mesh position={[0.55, 0, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.32, 2.4, 16]} />
            <meshBasicMaterial color={isBoosting ? '#00e5ff' : '#f97316'} transparent opacity={0.85} />
          </mesh>

          {/* Mach Shock Diamond Beads */}
          {isBoosting && [0.8, 1.4, 2.0].map((distZ, idx) => (
            <React.Fragment key={idx}>
              <mesh position={[-0.55, 0, distZ]}>
                <octahedronGeometry args={[0.16 - idx * 0.04]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0.55, 0, distZ]}>
                <octahedronGeometry args={[0.16 - idx * 0.04]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </React.Fragment>
          ))}
        </group>

        {/* Volumetric Afterburner Light */}
        <pointLight
          position={[0, 0, 2.2]}
          color={isBoosting ? '#38bdf8' : '#fb923c'}
          intensity={isBoosting ? 25 : isDriving ? 8 : 2}
          distance={16}
        />
      </group>

      {/* Critical damage smoke */}
      {healthPercent < 40 && (
        <pointLight position={[0, 1.0, 1.0]} color="#ef4444" intensity={5} distance={8} />
      )}
    </group>
  );
};

function secondaryColor(hex: string) {
  return '#1e293b';
}
