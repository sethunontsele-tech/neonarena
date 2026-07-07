import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, PetType } from '../store';

export function AlienPet({ ownerPosition, type }: { ownerPosition: THREE.Vector3, type: PetType }) {
  const meshRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (meshRef.current) {
      // Follow logic with some "floaty" offset
      const targetPos = ownerPosition.clone().add(new THREE.Vector3(
        Math.cos(time.current * 0.5) * 2,
        2 + Math.sin(time.current * 1.5) * 0.5,
        Math.sin(time.current * 0.5) * 2
      ));
      
      meshRef.current.position.lerp(targetPos, 0.05);
      meshRef.current.rotation.y += delta;
      meshRef.current.rotation.z += delta * 0.5;
    }
  });

  const renderPet = () => {
    switch(type) {
      case 'slime':
        return (
          <Sphere args={[0.5, 16, 16]}>
            <meshStandardMaterial color="#4ade80" transparent opacity={0.8} roughness={0} metalness={0.5} />
          </Sphere>
        );
      case 'drone':
        return (
          <group>
            <Box args={[0.6, 0.2, 0.6]}>
              <meshStandardMaterial color="#3b82f6" metalness={1} roughness={0.2} />
            </Box>
            <Torus args={[0.4, 0.05, 8, 24]} rotation={[Math.PI/2, 0, 0]}>
              <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" />
            </Torus>
          </group>
        );
      case 'phoenix':
        return (
          <group>
            <Sphere args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={2} />
            </Sphere>
            <Trail width={1} length={5} color="#ef4444" attenuation={(t) => t * t}>
              <mesh position={[0,0,0]} />
            </Trail>
          </group>
        );
      case 'void_wisp':
        return (
          <Float speed={5} rotationIntensity={2} floatIntensity={2}>
             <Sphere args={[0.4, 32, 32]}>
              <meshStandardMaterial color="#8b5cf6" emissive="#6d28d9" transparent opacity={0.6} />
            </Sphere>
          </Float>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={meshRef}>
      <pointLight intensity={1} color="#ffffff" distance={5} />
      {renderPet()}
    </group>
  );
}
