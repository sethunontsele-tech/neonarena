import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface RealisticHumanoidProps {
  variant?: 'spec_ops' | 'pilot' | 'exosuit' | 'cyber_ninja' | 'gem_armor' | 'standard';
  baseColor?: string;
  accentColor?: string;
  isEnemy?: boolean;
  team?: 'blue' | 'amber' | 'none';
  isAttacking?: boolean;
  isMoving?: boolean;
  isDisabled?: boolean;
  isGlitch?: boolean;
  activePower?: string | null;
  scale?: number;
}

export const RealisticHumanoidModel: React.FC<RealisticHumanoidProps> = ({
  variant = 'spec_ops',
  baseColor = '#222831',
  accentColor = '#00ffff',
  isEnemy = false,
  team = 'none',
  isAttacking = false,
  isMoving = false,
  isDisabled = false,
  isGlitch = false,
  activePower = null,
  scale = 1
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Derive theme colors
  const primaryColor = isDisabled ? '#333333' : isGlitch ? '#ff0033' : baseColor;
  const glowColor = isDisabled ? '#111111' : isGlitch ? '#ff0000' : isEnemy ? '#ff0055' : (team === 'amber' ? '#f59e0b' : (team === 'blue' ? '#00e5ff' : accentColor));

  // Frame animation for natural breathing & tactical walk cycle
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (isDisabled) {
      if (rootRef.current) {
        rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, Math.PI / 2.2, delta * 4);
        rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, 0.2, delta * 4);
      }
      return;
    }

    // Walking / Running animation
    if (isMoving) {
      const walkSpeed = 12;
      const legAngle = Math.sin(time * walkSpeed) * 0.55;
      const armAngle = Math.cos(time * walkSpeed) * 0.45;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle;

      if (leftArmRef.current) leftArmRef.current.rotation.x = -armAngle * 0.7;
      if (rightArmRef.current && !isAttacking) {
        rightArmRef.current.rotation.x = armAngle * 0.7 - 0.4;
      }

      if (torsoRef.current) {
        torsoRef.current.position.y = 0.95 + Math.abs(Math.sin(time * walkSpeed * 2)) * 0.05;
        torsoRef.current.rotation.y = Math.sin(time * walkSpeed) * 0.08;
      }
    } else {
      // Idle tactical breathing
      const breath = Math.sin(time * 2) * 0.03;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.95 + breath;
        torsoRef.current.rotation.y = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 0.7) * 0.08;
        headRef.current.rotation.x = -Math.sin(time * 1.5) * 0.03;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current && !isAttacking) rightArmRef.current.rotation.x = -0.3;
    }

    // Aiming / firing pose
    if (isAttacking && rightArmRef.current && leftArmRef.current) {
      rightArmRef.current.rotation.x = -Math.PI / 2.2;
      rightArmRef.current.rotation.y = -0.25;
      leftArmRef.current.rotation.x = -Math.PI / 2.5;
      leftArmRef.current.rotation.y = 0.35;
    }
  });

  return (
    <group ref={rootRef} scale={scale} dispose={null}>
      {/* ================= TORSO & CHEST RIG ================= */}
      <group ref={torsoRef} position={[0, 0.95, 0]}>
        {/* Inner Tactical Combat Undershirt */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.22, 0.2, 0.55, 12]} />
          <meshStandardMaterial color={primaryColor} roughness={0.7} />
        </mesh>

        {/* Heavy Ballistic Plate Carrier (Vest) */}
        <mesh position={[0, 0.28, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.46, 0.26]} />
          <meshStandardMaterial color="#1a1f29" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Front Ceramic Armor Glacis Plate */}
        <mesh position={[0, 0.3, 0.16]} castShadow>
          <boxGeometry args={[0.34, 0.36, 0.04]} />
          <meshStandardMaterial color="#12161f" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Tactical MOLLE Pouches (3x Rifle Ammo Mags) */}
        {[-0.1, 0, 0.1].map((offset, i) => (
          <mesh key={`mag-${i}`} position={[offset, 0.18, 0.19]} castShadow>
            <boxGeometry args={[0.07, 0.14, 0.06]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
        ))}

        {/* Chest Tactical Comms Radio with Whip Antenna */}
        <group position={[-0.14, 0.38, 0.16]}>
          <mesh>
            <boxGeometry args={[0.06, 0.1, 0.04]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0.01, 0.1, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 6]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
        </group>

        {/* Glowing Tactical Team Beacon / Reactor Core */}
        <mesh position={[0, 0.35, 0.18]}>
          <boxGeometry args={[0.08, 0.04, 0.02]} />
          <meshStandardMaterial 
            color={glowColor} 
            emissive={glowColor} 
            emissiveIntensity={isDisabled ? 0 : 2.5} 
            toneMapped={false}
          />
        </mesh>

        {/* Rear Tactical Assault Pack / Hydration Backpack */}
        <mesh position={[0, 0.28, -0.18]} castShadow>
          <boxGeometry args={[0.32, 0.42, 0.14]} />
          <meshStandardMaterial color="#1e2430" roughness={0.6} />
        </mesh>

        {/* Tactical Utility Belt */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.1, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Belt Metal Buckle */}
        <mesh position={[0, 0, 0.23]}>
          <boxGeometry args={[0.08, 0.06, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Medical IFAK Pouch (Rear Belt) */}
        <mesh position={[0.1, -0.02, -0.22]}>
          <boxGeometry args={[0.12, 0.09, 0.06]} />
          <meshStandardMaterial color="#991b1b" roughness={0.7} />
        </mesh>

        {/* ================= HEAD & HELMET ================= */}
        <group ref={headRef} position={[0, 0.58, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.08, 10]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>

          {/* Head Base (Balaclava) */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} />
          </mesh>

          {/* FAST High-Cut Tactical Helmet */}
          <mesh position={[0, 0.13, -0.01]} castShadow>
            <sphereGeometry args={[0.175, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Side ARC Accessory Rails */}
          {[-0.17, 0.17].map((xSide, i) => (
            <mesh key={`rail-${i}`} position={[xSide, 0.12, 0]} rotation={[0, 0, xSide > 0 ? -0.2 : 0.2]}>
              <boxGeometry args={[0.02, 0.04, 0.12]} />
              <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.5} />
            </mesh>
          ))}

          {/* Tactical Comms Earcups */}
          {[-0.16, 0.16].map((xSide, i) => (
            <mesh key={`ear-${i}`} position={[xSide, 0.07, 0]}>
              <boxGeometry args={[0.03, 0.07, 0.06]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          ))}

          {/* Flexible Headset Boom Microphone */}
          <mesh position={[-0.14, 0.03, 0.1]} rotation={[0.3, -0.4, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Flip-Down Dual-Lens Night Vision Goggles (NVGs) */}
          <group position={[0, 0.13, 0.16]}>
            {/* NVG Shroud Mount */}
            <mesh position={[0, 0.02, -0.02]}>
              <boxGeometry args={[0.06, 0.05, 0.03]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>

            {/* Dual Optical Lenses */}
            {[-0.055, 0.055].map((xOff, i) => (
              <group key={`nvg-${i}`} position={[xOff, -0.02, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.025, 0.08, 12]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.7} />
                </mesh>
                {/* Glowing Emerald / Cyan Night Vision Lens */}
                <mesh position={[0, 0, 0.042]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.005, 12]} />
                  <meshStandardMaterial 
                    color={glowColor} 
                    emissive={glowColor} 
                    emissiveIntensity={isDisabled ? 0 : 2} 
                    toneMapped={false} 
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>

        {/* ================= LEFT ARM ================= */}
        <group ref={leftArmRef} position={[-0.27, 0.42, 0]}>
          {/* Shoulder Pauldron */}
          <mesh castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1e2430" roughness={0.5} />
          </mesh>
          {/* Bicep */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.065, 0.055, 0.22, 8]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          {/* Elbow Guard */}
          <mesh position={[0, -0.27, -0.02]}>
            <boxGeometry args={[0.09, 0.08, 0.06]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.38, 0.04]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Tactical Glove Hand */}
          <mesh position={[0, -0.5, 0.08]}>
            <boxGeometry args={[0.07, 0.09, 0.08]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
        </group>

        {/* ================= RIGHT ARM & WEAPON ================= */}
        <group ref={rightArmRef} position={[0.27, 0.42, 0]}>
          {/* Shoulder Pauldron */}
          <mesh castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1e2430" roughness={0.5} />
          </mesh>
          {/* Bicep */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.065, 0.055, 0.22, 8]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          {/* Elbow Guard */}
          <mesh position={[0, -0.27, -0.02]}>
            <boxGeometry args={[0.09, 0.08, 0.06]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.38, 0.04]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Tactical Glove Hand */}
          <mesh position={[0, -0.5, 0.08]}>
            <boxGeometry args={[0.07, 0.09, 0.08]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>

          {/* Tactical M4 / Neon Blaster Carbine in Hand */}
          <group position={[-0.05, -0.5, 0.2]} rotation={[0, 0, -0.1]}>
            {/* Receiver & Stock */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.1, 0.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Extended Fluted Barrel */}
            <mesh position={[0, 0.02, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Flash Hider / Suppressor */}
            <mesh position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* Holographic Sight */}
            <mesh position={[0, 0.08, 0.05]}>
              <boxGeometry args={[0.04, 0.05, 0.1]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} />
            </mesh>
            {/* Glowing Holo Reticle Dot */}
            <mesh position={[0, 0.08, 0.1]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
            {/* Curved Magazine */}
            <mesh position={[0, -0.1, 0.1]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.035, 0.15, 0.07]} />
              <meshStandardMaterial color="#1e2430" roughness={0.7} />
            </mesh>
            {/* Laser Designator Rail Module */}
            <mesh position={[0.03, 0.04, 0.2]}>
              <boxGeometry args={[0.02, 0.03, 0.08]} />
              <meshStandardMaterial color="#090d16" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= LEGS & COMBAT BOOTS ================= */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.9, 0]}>
        {/* Thigh (Tactical Pants) */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.42, 10]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        {/* Knee Armor Guard */}
        <mesh position={[0, -0.42, 0.06]}>
          <boxGeometry args={[0.12, 0.12, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.075, 0.36, 10]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        {/* Heavy Lugged Combat Boot */}
        <group position={[0, -0.84, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.11, 0.14, 0.22]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Boot Toe Cap */}
          <mesh position={[0, -0.03, 0.08]}>
            <boxGeometry args={[0.1, 0.08, 0.08]} />
            <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.9, 0]}>
        {/* Thigh with Drop-Leg Sidearm Holster */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.42, 10]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        {/* Drop-Leg Tactical Holster */}
        <group position={[0.1, -0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 0.16, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          {/* Sidearm Pistol Grip */}
          <mesh position={[0, 0.08, 0.02]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.035, 0.08, 0.04]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
        </group>
        {/* Knee Armor Guard */}
        <mesh position={[0, -0.42, 0.06]}>
          <boxGeometry args={[0.12, 0.12, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.075, 0.36, 10]} />
          <meshStandardMaterial color={primaryColor} roughness={0.8} />
        </mesh>
        {/* Heavy Lugged Combat Boot */}
        <group position={[0, -0.84, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.11, 0.14, 0.22]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Boot Toe Cap */}
          <mesh position={[0, -0.03, 0.08]}>
            <boxGeometry args={[0.1, 0.08, 0.08]} />
            <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
