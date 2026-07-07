import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, DimensionType, DIMENSIONS } from '../store';
import { soundService } from '../services/soundService';

interface DimensionBlockProps {
  dimension: DimensionType;
  position: [number, number, number];
  variant?: 'anchor' | 'cube';
}

export const DimensionBlock: React.FC<DimensionBlockProps> = ({ dimension, position, variant = 'anchor' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const dimStats = DIMENSIONS[dimension] || DIMENSIONS.core || { name: 'CORE', gravity: -9.81, speedMultiplier: 1, manaRegen: 1, visuals: { color: '#00ffff', fog: 0.01, ambient: '#0a0a0a' } };
  
  const setTeleportState = useGameStore(state => state.setTeleportState);
  const teleportProgress = useGameStore(state => state.teleportProgress);
  const teleportTarget = useGameStore(state => state.teleportTarget);
  const setDimension = useGameStore(state => state.setDimension);
  const addEvent = useGameStore(state => state.addEvent);

  const [isHovered, setHovered] = useState(false);
  const [isNearby, setNearby] = useState(false);
  
  // Tracking holding state
  const isHolding = useRef(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (variant === 'anchor') {
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.z += delta * 0.2;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        // Cube pulsing
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 1.5;
      ringRef.current.rotation.y += delta;
    }

    // Interaction logic
    const keys = (window as any).keys || {}; // Fallback for interaction key
    const interactKeyDown = keys['e'] || keys['E'];

    if (isNearby && interactKeyDown) {
      if (!isHolding.current) {
        isHolding.current = true;
        setTeleportState(0.01, dimension);
        soundService.playSFX('ui_hover');
      } else if (teleportTarget === dimension) {
        const nextProgress = Math.min(100, teleportProgress + delta * 40);
        setTeleportState(nextProgress, dimension);
        
        if (nextProgress >= 100) {
          setDimension(dimension);
          addEvent(`DIMENSION SYNCHRONIZED: ${dimension.toUpperCase()}`);
          setTeleportState(0, null);
          isHolding.current = false;
          soundService.playSFX('dimension_shift');
        }
      }
    } else if (teleportTarget === dimension) {
      isHolding.current = false;
      setTeleportState(0, null);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <RigidBody 
          type="fixed" 
          colliders="cuboid" 
          sensor
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') setNearby(true);
          }}
          onIntersectionExit={(e) => {
            if (e.other.rigidBodyObject?.name === 'player') {
              setNearby(false);
              if (teleportTarget === dimension) setTeleportState(0, null);
            }
          }}
        >
          {/* Main Shape */}
          <mesh 
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            {variant === 'anchor' ? (
              <octahedronGeometry args={[1.5, 0]} />
            ) : (
              <boxGeometry args={[1.1, 1.1, 1.1]} />
            )}
            <MeshDistortMaterial 
              color={dimStats.visuals.color} 
              emissive={dimStats.visuals.color}
              emissiveIntensity={isHovered ? 4 : 2}
              distort={variant === 'anchor' ? 0.4 : 0.1}
              speed={2}
              roughness={0}
              metalness={1}
            />
          </mesh>

          {/* Orbiting Ring */}
          {variant === 'anchor' && (
            <mesh ref={ringRef}>
              <torusGeometry args={[2.5, 0.05, 16, 100]} />
              <meshBasicMaterial color={dimStats.visuals.color} transparent opacity={0.5} />
            </mesh>
          )}

          {/* Label */}
          <Text
            position={[0, variant === 'anchor' ? 3 : 2, 0]}
            fontSize={0.5}
            color="white"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
            anchorX="center"
            anchorY="middle"
          >
            {dimStats.name}
          </Text>
          
          <Text
            position={[0, variant === 'anchor' ? 2.4 : 1.4, 0]}
            fontSize={0.2}
            color={dimStats.visuals.color}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
            fillOpacity={isNearby ? 1 : 0.4}
          >
            {isNearby ? "HOLD [E] TO SYNC" : "APPROACH TO SYNC"}
          </Text>

          {/* Light Probe */}
          <pointLight color={dimStats.visuals.color} intensity={5} distance={10} />
        </RigidBody>
      </Float>
    </group>
  );
};
