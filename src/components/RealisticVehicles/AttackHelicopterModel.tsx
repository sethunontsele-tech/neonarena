import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AttackHelicopterModelProps {
  color?: string;
  camo?: string;
  isDriving?: boolean;
  gunYaw?: number;
  gunPitch?: number;
  healthPercent?: number;
}

export const AttackHelicopterModel: React.FC<AttackHelicopterModelProps> = ({
  color = '#27272a',
  camo = 'stealth_matte',
  isDriving = false,
  gunYaw = 0,
  gunPitch = 0,
  healthPercent = 100,
}) => {
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);
  const chinGunRef = useRef<THREE.Group>(null);
  const sensorTurretRef = useRef<THREE.Group>(null);

  const mainColor = camo === 'urban_cyber' ? '#1e293b' :
                    camo === 'arctic_tiger' ? '#e2e8f0' :
                    camo === 'gold_elite' ? '#ca8a04' :
                    camo === 'battle_rust' ? '#78350f' :
                    color || '#27272a';

  useFrame((_, delta) => {
    // Spin main and tail rotors
    const rotorRpm = isDriving ? 32 : 12;
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y += rotorRpm * delta;
    }
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.x += rotorRpm * 1.5 * delta;
    }

    // Aim chin gun & sensor ball
    if (chinGunRef.current) {
      chinGunRef.current.rotation.y = THREE.MathUtils.lerp(chinGunRef.current.rotation.y, gunYaw, 0.1);
      chinGunRef.current.rotation.x = THREE.MathUtils.lerp(chinGunRef.current.rotation.x, gunPitch, 0.1);
    }
    if (sensorTurretRef.current) {
      sensorTurretRef.current.rotation.y = THREE.MathUtils.lerp(sensorTurretRef.current.rotation.y, gunYaw, 0.1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ================= FUSELAGE & STEPPED TANDEM COCKPIT ================= */}
      {/* Main Angular Armored Fuselage */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.8, 6.2]} />
        <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Stepped Tandem Cockpit Canopy (Pilot rear, Gunner front) */}
      <group position={[0, 1.8, -1.8]}>
        {/* Multi-Pane Tinted Bulletproof Glass */}
        <mesh position={[0, 0.3, 0]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[1.4, 0.9, 2.6]} />
          <meshPhysicalMaterial
            color="#0284c7"
            roughness={0.1}
            metalness={0.9}
            transmission={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Canopy Frame Struts */}
        <mesh position={[0, 0.32, 0]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[1.42, 0.92, 2.62]} />
          <meshStandardMaterial color="#09090b" wireframe />
        </mesh>
      </group>

      {/* Wire Strike Cutters (Top and bottom of nose) */}
      <mesh position={[0, 2.4, -2.8]}>
        <boxGeometry args={[0.04, 0.45, 0.12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
      </mesh>

      {/* ================= NOSE SENSOR BALL & 30mm CHIN GUN ================= */}
      {/* Target Acquisition & Designation Sight (TADS) Turret */}
      <group position={[0, 1.2, -3.3]} ref={sensorTurretRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* FLIR Thermal Sensor Lens (Cyan/Orange) */}
        <mesh position={[0.12, 0, -0.32]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.12, 0, -0.32]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Chin-Mounted 30mm Chain Gun */}
      <group position={[0, 0.45, -2.4]} ref={chinGunRef}>
        {/* Turret Mount */}
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.25, 0.4]} />
          <meshStandardMaterial color="#09090b" metalness={0.9} />
        </mesh>
        {/* 30mm Gun Barrel with Muzzle Flash Suppressor */}
        <mesh position={[0, -0.05, -1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
          <meshStandardMaterial color="#18181b" metalness={0.95} />
        </mesh>
        {/* Ammo Feed Chute */}
        <mesh position={[0.18, 0.1, -0.1]}>
          <boxGeometry args={[0.1, 0.2, 0.35]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* ================= TWIN TURBOSHAFT ENGINES ================= */}
      {/* Left Engine Pod with Exhaust Suppressor */}
      <group position={[-1.15, 2.0, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.45, 2.6, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Upturned Heat-Dissipating Exhaust Shroud */}
        <mesh position={[0, 0.2, 1.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.6, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
      </group>

      {/* Right Engine Pod */}
      <group position={[1.15, 2.0, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.45, 2.6, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 1.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.6, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
      </group>

      {/* ================= MAIN ROTOR ASSEMBLY & LONGBOW RADAR DOME ================= */}
      <group position={[0, 2.4, 0.1]}>
        {/* Main Rotor Mast Shaft & Swashplate */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.8, 12]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Longbow Millimeter-Wave Radar Dome (Top of Mast) */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* 4-Blade Spinning Rotor */}
        <group position={[0, 0.75, 0]} ref={mainRotorRef}>
          {/* Central Hub */}
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.15, 16]} />
            <meshStandardMaterial color="#111827" metalness={0.9} />
          </mesh>

          {/* 4 Carbon-Composite Rotor Blades */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <group key={`blade-${idx}`} rotation={[0, angle, 0]}>
              <mesh position={[4.6, 0, 0]} castShadow>
                <boxGeometry args={[8.6, 0.04, 0.35]} />
                <meshStandardMaterial color="#18181b" roughness={0.6} metalness={0.5} />
              </mesh>
              {/* High-visibility yellow blade tips */}
              <mesh position={[8.7, 0, 0]}>
                <boxGeometry args={[0.4, 0.045, 0.35]} />
                <meshBasicMaterial color="#eab308" />
              </mesh>
            </group>
          ))}

          {/* Translucent High-Speed Blade Motion Blur Disc */}
          {isDriving && (
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 9.0, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      </group>

      {/* ================= WEAPONS WINGS, HELLFIRES & HYDRA ROCKETS ================= */}
      {/* Left Stub Wing */}
      <group position={[-1.7, 1.2, 0]}>
        <mesh rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[1.6, 0.14, 0.9]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </mesh>
        {/* Quad Hellfire Missile Rail (Outer) */}
        <group position={[-0.8, -0.3, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.5]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {[-0.12, 0.12].map((x, i) =>
            [-0.15, 0.15].map((y, j) => (
              <mesh key={`hf-l-${i}-${j}`} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            ))
          )}
        </group>
        {/* 19-Tube Hydra 70 Rocket Pod (Inner) */}
        <group position={[-0.2, -0.3, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 1.5, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Right Stub Wing */}
      <group position={[1.7, 1.2, 0]}>
        <mesh rotation={[0, 0, 0.15]} castShadow>
          <boxGeometry args={[1.6, 0.14, 0.9]} />
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </mesh>
        {/* Quad Hellfire Missile Rail (Outer) */}
        <group position={[0.8, -0.3, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.5]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {[-0.12, 0.12].map((x, i) =>
            [-0.15, 0.15].map((y, j) => (
              <mesh key={`hf-r-${i}-${j}`} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            ))
          )}
        </group>
        {/* 19-Tube Hydra 70 Rocket Pod (Inner) */}
        <group position={[0.2, -0.3, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 1.5, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
        </group>
      </group>

      {/* ================= TAIL BOOM & ROTOR ASSEMBLY ================= */}
      <group position={[0, 1.5, 3.2]}>
        {/* Tapered Tail Boom */}
        <mesh position={[0, 0, 2.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.52, 5.4, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Swept Vertical Stabilizer Fin */}
        <mesh position={[0, 0.8, 5.2]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 1.8, 1.2]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} />
        </mesh>

        {/* Horizontal Stabilator */}
        <mesh position={[0, 0.1, 4.6]} castShadow>
          <boxGeometry args={[2.2, 0.08, 0.6]} />
          <meshStandardMaterial color={mainColor} roughness={0.4} />
        </mesh>

        {/* Tail Rotor Hub & Blades */}
        <group position={[0.25, 1.2, 5.4]} ref={tailRotorRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* 4 Blades */}
          {[0, Math.PI / 2].map((angle, idx) => (
            <mesh key={`tailblade-${idx}`} rotation={[angle, 0, 0]}>
              <boxGeometry args={[0.04, 2.2, 0.12]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ================= LANDING GEAR SPONSONS ================= */}
      {/* Front Left Heavy Combat Wheel */}
      <mesh position={[-1.2, 0.3, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      {/* Front Right Heavy Combat Wheel */}
      <mesh position={[1.2, 0.3, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      {/* Tail Wheel */}
      <mesh position={[0, 0.2, 4.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>

      {/* Damage smoke */}
      {healthPercent < 40 && (
        <pointLight position={[0, 2.0, 0]} color="#ef4444" intensity={4} distance={6} />
      )}
    </group>
  );
};
