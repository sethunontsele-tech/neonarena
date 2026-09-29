import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BotOpponent } from './types';

interface MiniRoyaleBots3DProps {
  bots: BotOpponent[];
  playerPos: [number, number, number];
}

export const MiniRoyaleBots3D: React.FC<MiniRoyaleBots3DProps> = ({ bots, playerPos }) => {
  const botsGroupRef = useRef<THREE.Group>(null);

  // Subtle breathing / idle animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (botsGroupRef.current) {
      botsGroupRef.current.children.forEach((child, i) => {
        const bot = bots[i];
        if (bot && bot.alive) {
          // Bob arms slightly while moving
          const armL = child.getObjectByName('armL');
          const armR = child.getObjectByName('armR');
          if (armL && armR) {
            armL.rotation.x = Math.sin(t * 8 + i) * 0.3;
            armR.rotation.x = -Math.sin(t * 8 + i) * 0.3;
          }
        }
      });
    }
  });

  return (
    <group ref={botsGroupRef} name="mini_royale_bots">
      {bots.map((bot) => {
        if (!bot.alive) return null;

        // Calculate distance to player for nameplate visibility
        const distToPlayer = Math.hypot(bot.x - playerPos[0], bot.z - playerPos[2]);
        const showNameplate = distToPlayer < 75;

        // Angle facing target
        const angleToTarget = Math.atan2(bot.targetX - bot.x, bot.targetZ - bot.z);

        return (
          <group 
            key={bot.id} 
            position={[bot.x, 0, bot.z]} 
            rotation={[0, angleToTarget, 0]}
          >
            {/* Body Torso */}
            <mesh position={[0, 2.3, 0]} castShadow>
              <boxGeometry args={[1.4, 1.8, 0.9]} />
              <meshStandardMaterial color={bot.color} roughness={0.7} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 3.6, 0]} castShadow>
              <sphereGeometry args={[0.5, 12, 10]} />
              <meshStandardMaterial color="#f5c6a0" roughness={0.8} />
            </mesh>

            {/* Tactical Helmet / Hat */}
            {bot.hasHat && (
              <mesh position={[0, 4.05, 0]} castShadow>
                <cylinderGeometry args={[0.56, 0.62, 0.42, 12]} />
                <meshStandardMaterial color={bot.hatColor} roughness={0.6} />
              </mesh>
            )}

            {/* Legs */}
            <mesh position={[-0.32, 0.65, 0]} castShadow>
              <boxGeometry args={[0.45, 1.3, 0.45]} />
              <meshStandardMaterial color="#1e1e2f" roughness={0.8} />
            </mesh>
            <mesh position={[0.32, 0.65, 0]} castShadow>
              <boxGeometry args={[0.45, 1.3, 0.45]} />
              <meshStandardMaterial color="#1e1e2f" roughness={0.8} />
            </mesh>

            {/* Arms */}
            <mesh name="armL" position={[-1.0, 2.3, 0]} castShadow>
              <boxGeometry args={[0.35, 1.4, 0.35]} />
              <meshStandardMaterial color={bot.color} roughness={0.7} />
            </mesh>
            <mesh name="armR" position={[1.0, 2.3, 0]} castShadow>
              <boxGeometry args={[0.35, 1.4, 0.35]} />
              <meshStandardMaterial color={bot.color} roughness={0.7} />
            </mesh>

            {/* Weapon Model held by Bot */}
            <mesh position={[0.5, 2.0, 0.8]} rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 0.22, 1.2]} />
              <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* 3D Billboard Floating Nameplate & Health Bar */}
            {showNameplate && (
              <group position={[0, 5.2, 0]}>
                <Text
                  color="#ffffff"
                  fontSize={0.55}
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.06}
                  outlineColor="#000000"
                >
                  {bot.name}
                </Text>
                {/* Health Bar background */}
                <mesh position={[0, -0.45, 0]}>
                  <planeGeometry args={[2.0, 0.22]} />
                  <meshBasicMaterial color="#000000" opacity={0.6} transparent />
                </mesh>
                {/* Health Bar fill */}
                <mesh position={[-(2.0 * (1 - bot.health / bot.maxHealth)) / 2, -0.45, 0.01]}>
                  <planeGeometry args={[2.0 * Math.max(0, bot.health / bot.maxHealth), 0.18]} />
                  <meshBasicMaterial color={bot.health > 50 ? '#22c55e' : bot.health > 25 ? '#eab308' : '#ef4444'} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
