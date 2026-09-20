import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store';

interface FloodProps {
  isActive: boolean;
  onGameOver?: (score: number) => void;
}

export const TheGreatFloodMode: React.FC<FloodProps> = ({ isActive }) => {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const [waterY, setWaterY] = useState(-1);
  const [survivalTime, setSurvivalTime] = useState(0);

  // Animate rising water when mode is active
  useFrame((_, delta) => {
    if (!isActive) return;

    // Water rises steadily up to 110 meters (engulfing all but the highest peaks and skyscraper roofs!)
    setWaterY(prev => {
      const nextY = Math.min(110, prev + delta * 0.35);
      return nextY;
    });

    setSurvivalTime(prev => prev + delta);

    if (waterMeshRef.current) {
      waterMeshRef.current.position.y = waterY;
    }

    // Check player position to see if they're submerged
    const playerPos = useGameStore.getState().playerPosition;
    if (playerPos[1] < waterY - 1.5) {
      // Submerged in deep water
      useGameStore.getState().takeDamage(delta * 12);
    }
  });

  if (!isActive) return null;

  return (
    <group name="the-great-flood-survival">
      {/* Colossal Rising Flood Water Plane */}
      <mesh ref={waterMeshRef} position={[0, waterY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.08}
          metalness={0.7}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Atmospheric Storm Rainfall & Lightning */}
      <Sparkles
        count={200}
        scale={[600, 100, 600]}
        size={5}
        speed={4}
        color="#38bdf8"
        position={[0, waterY + 40, 0]}
      />

      {/* Floating Emergency Life Rafts & Supply Buoys */}
      {[[-30, 20], [40, -50], [0, 80], [-80, -100]].map(([x, z], idx) => (
        <group key={idx} position={[x, waterY + 0.4, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.6, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
          <pointLight color="#f97316" intensity={6} distance={12} />
        </group>
      ))}

      {/* High-Altitude Rescue Beacons on Megacity Roof */}
      <group position={[0, 102, -220]}>
        <pointLight color="#22c3ee" intensity={15} distance={40} />
        <Text fontSize={2.0} color="#22c3ee" anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#000">
          RESCUE EVACUATION ZONE - REACH HIGH GROUND!
        </Text>
      </group>
    </group>
  );
};
