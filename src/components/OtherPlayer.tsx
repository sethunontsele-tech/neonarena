/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore, DIMENSIONS } from '../store';
import { PlayerModel } from './PlayerModel';
import { Text } from '@react-three/drei';
import { BLOCK_COLORS } from './Arena';

import { useVisibilityCulling } from '../utils/useFrustumCulling';

export function OtherPlayer({ id, data: replayData }: { id: string, data?: any }) {
  const storeData = useGameStore(state => state.otherPlayers[id]);
  const data = replayData || storeData;
  const body = useRef<RapierRigidBody>(null);

  const isVisible = useVisibilityCulling(
    () => {
      if (!body.current) return data?.position;
      const trans = body.current.translation();
      return [trans.x, trans.y, trans.z];
    },
    { radius: 3, maxDistance: 200, checkEvery: 2 }
  );

  const isTargeted = useGameStore(state => state.targetedEnemyId === id);
  const isTimeWarpActive = useGameStore(state => state.isTimeWarpActive);
  const isWallHackActive = useGameStore(state => state.activeStreakPower === 'WALL HACK');
  const groupRef = useRef<THREE.Group>(null);
  const weaponGroupRef = useRef<THREE.Group>(null);
  
  const dimColor = data?.currentDimension ? (DIMENSIONS[data.currentDimension as any]?.visuals?.color || '#ffffff') : '#ffffff';
  const isVijo = data?.currentDimension === 'edge';

  useFrame((_, delta) => {
    if (!body.current || !data) return;
    
    // Smoothly interpolate position
    const currentPos = body.current.translation();
    const targetPos = new THREE.Vector3(...data.position);
    
    // Time warp slows down other players
    const timeWarpFactor = isTimeWarpActive ? 0.3 : 1.0;
    
    // Frame-rate independent lerp
    const lerpFactor = (1.0 - Math.exp(-20 * delta)) * timeWarpFactor;
    const newPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z).lerp(targetPos, lerpFactor);
    
    body.current.setNextKinematicTranslation({ x: newPos.x, y: newPos.y, z: newPos.z });

    // Smoothly interpolate rotation
    if (groupRef.current) {
      // Handle angle wrap-around
      let diff = data.rotation - groupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * lerpFactor;
      
      // Dash effect
      if (data.isDashing) {
        groupRef.current.scale.set(1.2, 0.8, 1.2);
        if (Math.random() > 0.5) {
          useGameStore.getState().addParticles([newPos.x, newPos.y, newPos.z], '#00d4ff');
        }
      } else if (data.isSliding) {
        groupRef.current.scale.set(1.1, 0.5, 1.1);
        groupRef.current.position.y = -0.5;
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 10);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 10);
      }
    }

    // Smoothly interpolate weapon animation
    if (weaponGroupRef.current) {
      if (data.isAttacking) {
        weaponGroupRef.current.rotation.x = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.x, Math.PI / 4, delta * 20);
        weaponGroupRef.current.rotation.y = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.y, -Math.PI / 2, delta * 20);
      } else {
        weaponGroupRef.current.rotation.x = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.x, 0, delta * 15);
        weaponGroupRef.current.rotation.y = THREE.MathUtils.lerp(weaponGroupRef.current.rotation.y, 0, delta * 15);
      }
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
      <group ref={groupRef} position={[0, 0, 0]} visible={isVisible}>
        <PlayerModel 
          skin={data.skin} 
          color={data.color} 
          pattern={data.pattern} 
          accessories={data.accessories} 
          state={data.state} 
          isGlitch={data.isGlitch}
        />

        {/* Targeted Outline/Indicator */}
        {isTargeted && (
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.55, 1.1]} />
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
          </mesh>
        )}

        {/* Wall Hack Outline */}
        {isWallHackActive && (
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.52, 1.02]} />
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} depthTest={false} />
          </mesh>
        )}

        {/* Dimension Outline */}
        {data.currentDimension !== 'core' && (
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.53, 1.03]} />
            <meshBasicMaterial color={dimColor} wireframe transparent opacity={isVijo ? 0.8 : 0.4} />
          </mesh>
        )}
        
        {isVijo && (
          <pointLight position={[0, 1, 0]} color="#ffffff" intensity={2} distance={10} />
        )}

        {/* Username Label */}
        <Text
          position={[0, 3.1, 0]}
          fontSize={0.2}
          color="#ffffff"
          fillOpacity={0.6}
          anchorX="center"
          anchorY="middle"
        >
          {data.playerClass?.toUpperCase()}
        </Text>
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
          <group position={[0, 2.4, 0]} scale={isTargeted ? 1.5 : 1}>
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
          <group 
            ref={weaponGroupRef}
            position={[0.4, 1.2, 0.5]} 
          >
            {data.weapon === 'sword' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                <mesh position={[0.4, 0, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.05, 0.1]} />
                  <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[-0.1, 0, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.08, 0.08]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
              </group>
            ) : data.weapon === 'axe' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.05, 0.05]} />
                  <meshStandardMaterial color="#4d2600" />
                </mesh>
                <mesh position={[0.3, 0.15, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.4, 0.05]} />
                  <meshStandardMaterial color="#888" metalness={0.9} />
                </mesh>
              </group>
            ) : data.weapon === 'knife' ? (
              <group rotation={[0, -Math.PI / 2, 0]}>
                <mesh position={[0.15, 0, 0]} castShadow>
                  <boxGeometry args={[0.3, 0.03, 0.05]} />
                  <meshStandardMaterial color="#aaa" metalness={1} />
                </mesh>
                <mesh position={[-0.05, 0, 0]} castShadow>
                  <boxGeometry args={[0.15, 0.05, 0.05]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
              </group>
            ) : (
              <>
                <mesh>
                  <boxGeometry args={[0.1, 0.15, 0.4]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, 0.05, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                  <meshStandardMaterial color="#111" />
                </mesh>
              </>
            )}
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
