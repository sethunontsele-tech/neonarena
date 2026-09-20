import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParkourAction, CharacterOutfit, ViewMode } from './types';

interface FreerunCharacter3DProps {
  action: ParkourAction;
  velocity: [number, number, number];
  isGrounded: boolean;
  outfit: CharacterOutfit;
  viewMode: ViewMode;
  isFlowStateActive: boolean;
  bailTimer: number;
}

export function FreerunCharacter3D({
  action,
  velocity,
  isGrounded,
  outfit,
  viewMode,
  isFlowStateActive,
  bailTimer
}: FreerunCharacter3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Procedural Parkour Kinematics
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const speed = Math.sqrt(velocity[0] ** 2 + velocity[2] ** 2);

    // Reset base rotations
    if (torsoRef.current) {
      torsoRef.current.rotation.set(0, 0, 0);
      torsoRef.current.position.set(0, 0.9, 0);
    }

    // 1. BAIL / RAGDOLL SYSTEM
    if (action === 'bail' || bailTimer > 0) {
      if (groupRef.current) {
        groupRef.current.rotation.x = Math.sin(time * 12) * 1.2 + 1.2;
        groupRef.current.rotation.z = Math.cos(time * 10) * 0.8;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 1.1;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.9;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 1.5;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -1.5;
      return;
    } else {
      if (groupRef.current) {
        groupRef.current.rotation.z = 0;
      }
    }

    // 2. SPRINTING & RUNNING
    if ((action === 'run' || action === 'sprint') && isGrounded) {
      const runFrequency = action === 'sprint' ? 14 : 9;
      const legSwing = Math.sin(time * runFrequency) * (action === 'sprint' ? 1.0 : 0.6);
      const armSwing = Math.sin(time * runFrequency) * (action === 'sprint' ? 0.9 : 0.5);

      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      if (torsoRef.current) {
        // Torso forward lean into the sprint
        torsoRef.current.rotation.x = action === 'sprint' ? 0.35 : 0.18;
      }
    }

    // 3. VAULTING (Kong / Dash Vault)
    else if (action === 'vault') {
      if (torsoRef.current) {
        torsoRef.current.rotation.x = 0.9; // Horizontal dive
        torsoRef.current.position.y = 0.6;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.2; // Hands pushing down
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.2;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -1.4; // Tucked knees
      if (rightLegRef.current) rightLegRef.current.rotation.x = -1.4;
    }

    // 4. POWER SLIDE
    else if (action === 'slide') {
      if (torsoRef.current) {
        torsoRef.current.rotation.x = -0.6; // Leaned back
        torsoRef.current.position.y = 0.35;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -1.3; // Extended forward
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.z = 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -0.8;
    }

    // 5. WALL-RUNNING (Left & Right)
    else if (action === 'wallrun_left') {
      if (groupRef.current) groupRef.current.rotation.z = 0.42; // Bank against wall
      const wallRunFreq = 16;
      const legCycle = Math.sin(time * wallRunFreq) * 0.9;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legCycle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legCycle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
    } else if (action === 'wallrun_right') {
      if (groupRef.current) groupRef.current.rotation.z = -0.42;
      const wallRunFreq = 16;
      const legCycle = Math.sin(time * wallRunFreq) * 0.9;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legCycle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legCycle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
    }

    // 6. WALL CLIMB & LEDGE GRAB
    else if (action === 'wallclimb' || action === 'ledge_grab' || action === 'ledge_climb') {
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -2.8; // Arms reaching up
      if (rightArmRef.current) rightArmRef.current.rotation.x = -2.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.2;
    }

    // 7. AERIAL FLIPS & SPINS
    else if (action === 'frontflip') {
      if (groupRef.current) groupRef.current.rotation.x = (time * 16) % (Math.PI * 2);
      if (leftLegRef.current) leftLegRef.current.rotation.x = -1.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -1.2;
    } else if (action === 'backflip') {
      if (groupRef.current) groupRef.current.rotation.x = -((time * 16) % (Math.PI * 2));
      if (leftLegRef.current) leftLegRef.current.rotation.x = -1.0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -1.0;
    } else if (action === 'sideflip') {
      if (groupRef.current) groupRef.current.rotation.z = (time * 16) % (Math.PI * 2);
    } else if (action === 'spin_360') {
      if (groupRef.current) groupRef.current.rotation.y = (time * 18) % (Math.PI * 2);
    }

    // 8. ROLLS & PRECISION LANDINGS
    else if (action === 'roll') {
      if (torsoRef.current) {
        torsoRef.current.rotation.x = (time * 14) % (Math.PI * 2);
        torsoRef.current.position.y = 0.4;
      }
    } else if (action === 'precision') {
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.45;
        torsoRef.current.rotation.x = 0.4;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -1.1;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -1.1;
    }

    // IDLE
    else {
      const breathing = Math.sin(time * 2.5) * 0.03;
      if (torsoRef.current) torsoRef.current.position.y = 0.9 + breathing;
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, -0.1);
    }
  });

  // In first-person view, only render hands/arms when climbing or vaulting
  if (viewMode === 'first_person' && action !== 'vault' && action !== 'ledge_grab' && action !== 'wallclimb') {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* TORSO & CLOTHING */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        {/* Upper Torso / Hoodie / Jacket */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.54, 0.58, 0.32]} />
          <meshStandardMaterial color={outfit.topColor} roughness={0.6} />
        </mesh>

        {/* Hoodie Pocket / Trim */}
        <mesh position={[0, 0.15, 0.17]}>
          <boxGeometry args={[0.34, 0.22, 0.04]} />
          <meshStandardMaterial color={outfit.topAccent} />
        </mesh>

        {/* HEAD & FACE ACCESSOIRES */}
        <group ref={headRef} position={[0, 0.68, 0]}>
          {/* Head Base */}
          <mesh castShadow>
            <sphereGeometry args={[0.19, 24, 24]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.8} />
          </mesh>

          {/* Cyber Visor */}
          {outfit.headwear === 'cyber_visor' && (
            <mesh position={[0, 0.02, 0.14]}>
              <boxGeometry args={[0.34, 0.1, 0.15]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.8} roughness={0.1} />
            </mesh>
          )}

          {/* Neon Face Mask */}
          {outfit.headwear === 'neon_mask' && (
            <mesh position={[0, -0.05, 0.13]}>
              <boxGeometry args={[0.26, 0.16, 0.14]} />
              <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.2} />
            </mesh>
          )}

          {/* Beanie or Baseball Cap */}
          {(outfit.headwear === 'beanie' || outfit.headwear === 'baseball_cap') && (
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.21, 16, 16]} />
              <meshStandardMaterial color={outfit.headwearColor} roughness={0.8} />
            </mesh>
          )}

          {/* Headphones */}
          {outfit.headwear === 'headphones' && (
            <group>
              <mesh position={[-0.21, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[0.21, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
              </mesh>
            </group>
          )}
        </group>

        {/* BACK ACCESSORY (Backpack / Drone) */}
        {outfit.backAccessory === 'street_backpack' && (
          <mesh position={[0, 0.25, -0.22]} castShadow>
            <boxGeometry args={[0.36, 0.44, 0.18]} />
            <meshStandardMaterial color={outfit.backColor} roughness={0.7} />
          </mesh>
        )}
        {outfit.backAccessory === 'neon_wings' && (
          <group position={[0, 0.35, -0.18]}>
            <mesh position={[-0.45, 0.15, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.6, 0.08, 0.02]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.45, 0.15, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.6, 0.08, 0.02]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
            </mesh>
          </group>
        )}

        {/* ARMS & GLOVES */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.34, 0.45, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.5, 12]} />
            <meshStandardMaterial color={outfit.topColor} />
          </mesh>
          {/* Glove */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.34, 0.45, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.5, 12]} />
            <meshStandardMaterial color={outfit.topColor} />
          </mesh>
          {/* Glove */}
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>

      {/* LEGS & SNEAKERS */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.16, 0.85, 0]}>
        {/* Cargo Joggers Leg */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.8, 12]} />
          <meshStandardMaterial color={outfit.pantsColor} roughness={0.8} />
        </mesh>
        {/* Parkour Sneaker */}
        <group position={[0, -0.85, 0.06]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.12, 0.28]} />
            <meshStandardMaterial color={outfit.shoesColor} />
          </mesh>
          {/* White Rubber Grip Outsole */}
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.15, 0.03, 0.29]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.16, 0.85, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.8, 12]} />
          <meshStandardMaterial color={outfit.pantsColor} roughness={0.8} />
        </mesh>
        {/* Parkour Sneaker */}
        <group position={[0, -0.85, 0.06]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.12, 0.28]} />
            <meshStandardMaterial color={outfit.shoesColor} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[0.15, 0.03, 0.29]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* KINETIC FLOW STATE NEON TRAIL */}
      {isFlowStateActive && (
        <group position={[0, 0.2, -0.3]}>
          <mesh>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial 
              color={outfit.neonTrail === 'cyan_lightning' ? '#06b6d4' : (outfit.neonTrail === 'magenta_flame' ? '#ec4899' : '#f59e0b')} 
              transparent 
              opacity={0.35} 
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
