/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { PlayerModel } from './PlayerModel';
import { Text } from '@react-three/drei';
import { BLOCK_COLORS } from './Arena';

export function OtherPlayer({ id }: { id: string }) {
  const data = useGameStore(state => state.otherPlayers[id]);
  const body = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!body.current || !data) return;
    
    // Smoothly interpolate position
    const currentPos = body.current.translation();
    const targetPos = new THREE.Vector3(...data.position);
    
    // Frame-rate independent lerp
    const lerpFactor = 1.0 - Math.exp(-20 * delta);
    const newPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z).lerp(targetPos, lerpFactor);
    
    body.current.setNextKinematicTranslation({ x: newPos.x, y: newPos.y, z: newPos.z });

    // Smoothly interpolate rotation
    if (groupRef.current) {
      // Handle angle wrap-around
      let diff = data.rotation - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * lerpFactor;
    }
  });

  if (!data) return null;

  const color = data.state === 'disabled' ? '#444' : data.color;

  return (
    <RigidBody
      ref={body}
      colliders={false}
      type="kinematicPosition"
      position={data.position}
      enabledRotations={[false, false, false]}
      userData={{ name: data.id }}
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
      <group ref={groupRef} position={[0, 0, 0]}>
        <PlayerModel 
          skin={data.skin} 
          color={data.color} 
          pattern={data.pattern} 
          accessories={data.accessories} 
          state={data.state} 
        />

        {/* Username Label */}
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.3}
          color={data.state === 'active' ? (data.team === 'amber' ? '#f59e0b' : (data.team === 'blue' ? '#3b82f6' : data.color)) : '#666666'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {data.name}
        </Text>

        {/* Health Bar */}
        {data.state === 'active' && (
          <group position={[0, 2.4, 0]}>
            {/* Background */}
            <mesh>
              <planeGeometry args={[1.2, 0.15]} />
              <meshBasicMaterial color="#000000" opacity={0.5} transparent />
            </mesh>
            {/* Foreground (Health) */}
            <mesh position={[-(1.2 * (1 - data.health / 100)) / 2, 0, 0.01]}>
              <planeGeometry args={[1.2 * (data.health / 100), 0.1]} />
              <meshBasicMaterial color={data.health > 50 ? "#00ff00" : data.health > 20 ? "#ffff00" : "#ff0000"} />
            </mesh>
          </group>
        )}

        {/* Held Weapon or Block Visual for others */}
        {!data.isBuildMode ? (
          <group position={[0.4, 1.2, 0.5]}>
            <mesh>
              <boxGeometry args={[0.1, 0.15, 0.4]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 0.05, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        ) : (
          <group position={[0.4, 1.2, 0.5]}>
            <mesh scale={0.4}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={data.selectedBlock ? BLOCK_COLORS[data.selectedBlock] : '#ffffff'} />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
}
