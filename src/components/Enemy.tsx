/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore, EnemyData } from '../store';
import { Text } from '@react-three/drei';

const ENEMY_SPEED = 3;
const CHASE_DIST = 15; // Reduced from 20
const SHOOT_DIST = 15;
const SHOOT_COOLDOWN = 3500; // Increased from 2000 for less aggressive shooting

import { useVisibilityCulling } from '../utils/useFrustumCulling';

export function Enemy({ data }: { data: EnemyData }) {
  const body = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();
  const { camera } = useThree();
  
  const isVisible = useVisibilityCulling(
    () => {
      if (!body.current) return data.position;
      const trans = body.current.translation();
      return [trans.x, trans.y, trans.z];
    },
    { radius: 3, maxDistance: 180, checkEvery: 2 }
  );

  const skin = useMemo(() => {
    const skins: ('neon' | 'gold' | 'stealth' | 'glitch')[] = ['neon', 'gold', 'stealth', 'glitch'];
    return skins[Math.floor(Math.random() * skins.length)];
  }, []);

  const isGlitch = data.isGlitch || skin === 'glitch';
  
  const gameState = useGameStore(state => state.gameState);
  const playerState = useGameStore(state => state.playerState);
  const hitPlayer = useGameStore(state => state.hitPlayer);
  const addLaser = useGameStore(state => state.addLaser);
  const addParticles = useGameStore(state => state.addParticles);
  const isTargeted = useGameStore(state => state.targetedEnemyId === data.id);
  const isTimeWarpActive = useGameStore(state => state.isTimeWarpActive);
  const moddedBotScale = useGameStore(state => state.moddedBotScale);
  const moddedBotSpeedMultiplier = useGameStore(state => state.moddedBotSpeedMultiplier);
  const moddedIsAggressiveBots = useGameStore(state => state.moddedIsAggressiveBots);

  const lastShootTime = useRef(0);
  const patrolTarget = useRef(new THREE.Vector3());
  const lastPatrolChange = useRef(0);
  const state = useRef<'patrol' | 'chase'>('patrol');

  const groupRef = useRef<THREE.Group>(null);

  // Initialize patrol target
  useMemo(() => {
    patrolTarget.current.set(
      data.position[0] + (Math.random() - 0.5) * 10,
      data.position[1],
      data.position[2] + (Math.random() - 0.5) * 10
    );
  }, [data.position]);

  const isReplaying = useGameStore(state => state.isReplaying);
  
  useFrame((state_fiber) => {
    if (!body.current) return;
    
    if (isReplaying) {
      // In replay mode, we manually set the position from the snapshot
      body.current.setNextKinematicTranslation({ x: data.position[0], y: data.position[1], z: data.position[2] });
      return;
    }

    if (gameState !== 'playing' || data.state === 'disabled') {
      if (body.current) {
        body.current.setLinvel({ x: 0, y: body.current.linvel().y, z: 0 }, true);
      }
      return;
    }

    const pos = body.current.translation();
    const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z);

    // Time Warp Logic: Slow down if near player and time warp is active
    let localSpeed = ENEMY_SPEED * moddedBotSpeedMultiplier;
    let localShootCooldown = SHOOT_COOLDOWN;
    
    if (moddedIsAggressiveBots) {
      localSpeed *= 1.8;
      localShootCooldown *= 0.4;
    }
    
    if (isTimeWarpActive) {
      const playerPos = camera.position.clone();
      const distToPlayer = currentPos.distanceTo(playerPos);
      if (distToPlayer < 12) {
        localSpeed *= 0.2;
        localShootCooldown *= 5;
      }
    }
    
    let closestTargetPos: THREE.Vector3 | null = null;
    let closestDist = CHASE_DIST;

    // Check player
    if (playerState === 'active') {
      const playerPos = camera.position.clone();
      playerPos.y = pos.y; // Ignore height difference for distance
      const distToPlayer = currentPos.distanceTo(playerPos);
      if (distToPlayer < closestDist) {
        closestDist = distToPlayer;
        closestTargetPos = playerPos;
      }
    }

    // Check other enemies
    const allEnemies = useGameStore.getState().enemies;
    allEnemies.forEach(e => {
      if (e.id !== data.id && e.state === 'active') {
        const ePos = new THREE.Vector3(e.position[0], pos.y, e.position[2]);
        const distToEnemy = currentPos.distanceTo(ePos);
        if (distToEnemy < closestDist) {
          closestDist = distToEnemy;
          closestTargetPos = ePos;
        }
      }
    });

    // AI Logic
    if (closestTargetPos) {
      state.current = 'chase';
    } else if (state.current === 'chase') {
      state.current = 'patrol';
      patrolTarget.current.set(
        currentPos.x + (Math.random() - 0.5) * 40,
        currentPos.y,
        currentPos.z + (Math.random() - 0.5) * 40
      );
      lastPatrolChange.current = Date.now();
    }

    const direction = new THREE.Vector3();

    if (state.current === 'chase' && closestTargetPos) {
      direction.subVectors(closestTargetPos, currentPos).normalize();
      
      // Shooting logic
      const now = Date.now();
      if (closestDist < SHOOT_DIST && now - lastShootTime.current > localShootCooldown) {
        // Raycast to check line of sight
        const rayDir = new THREE.Vector3().subVectors(closestTargetPos, currentPos).normalize();
        
        // Add random spread so they miss sometimes
        const spread = 0.15;
        rayDir.x += (Math.random() - 0.5) * spread;
        rayDir.y += (Math.random() - 0.5) * spread;
        rayDir.z += (Math.random() - 0.5) * spread;
        rayDir.normalize();
        
        // Offset start position to avoid hitting self
        const startPos = new THREE.Vector3(currentPos.x, currentPos.y + 0.5, currentPos.z);
        startPos.add(rayDir.clone().multiplyScalar(1.5));

        const ray = new rapier.Ray(startPos, rayDir);
        const hit = world.castRay(ray, SHOOT_DIST, true);

        if (hit) {
          const collider = hit.collider;
          const rb = collider.parent();
          if (rb && rb.userData) {
            const userData = rb.userData as { name?: string };
            if (userData.name === 'player') {
              // Hit player!
              hitPlayer();
              addParticles([camera.position.x, camera.position.y, camera.position.z], '#ff0000');
              addLaser(
                [startPos.x, startPos.y, startPos.z],
                [camera.position.x, camera.position.y, camera.position.z],
                '#ff0000'
              );
              lastShootTime.current = now;
            } else if (userData.name?.startsWith('bot-')) {
              // Hit another enemy!
              useGameStore.getState().hitEnemy(userData.name);
              const hitPoint = ray.pointAt(hit.timeOfImpact);
              addParticles([hitPoint.x, hitPoint.y, hitPoint.z], '#ff0000');
              addLaser(
                [startPos.x, startPos.y, startPos.z],
                [hitPoint.x, hitPoint.y, hitPoint.z],
                '#ff0000'
              );
              lastShootTime.current = now;
            } else {
              // Hit wall or obstacle
              const hitPoint = ray.pointAt(hit.timeOfImpact);
              addParticles([hitPoint.x, hitPoint.y, hitPoint.z], '#ff0000');
              addLaser(
                [startPos.x, startPos.y, startPos.z],
                [hitPoint.x, hitPoint.y, hitPoint.z],
                '#ff0000'
              );
              lastShootTime.current = now;
            }
          } else {
            // Hit wall or obstacle
            const hitPoint = ray.pointAt(hit.timeOfImpact);
            addParticles([hitPoint.x, hitPoint.y, hitPoint.z], '#ff0000');
            addLaser(
              [startPos.x, startPos.y, startPos.z],
              [hitPoint.x, hitPoint.y, hitPoint.z],
              '#ff0000'
            );
            lastShootTime.current = now;
          }
        }
      }
    } else {
      // Patrol
      const now = Date.now();
      // Change target if reached or if stuck for 4 seconds
      if (currentPos.distanceTo(patrolTarget.current) < 2 || now - lastPatrolChange.current > 4000) {
        patrolTarget.current.set(
          currentPos.x + (Math.random() - 0.5) * 60,
          currentPos.y,
          currentPos.z + (Math.random() - 0.5) * 60
        );
        lastPatrolChange.current = now;
      }
      direction.subVectors(patrolTarget.current, currentPos).normalize();
    }

    // Apply movement
    const velocity = body.current.linvel();
    body.current.setLinvel({
      x: direction.x * localSpeed,
      y: velocity.y,
      z: direction.z * localSpeed
    }, true);

    // Rotate to face direction
    if (groupRef.current && direction.lengthSq() > 0.1) {
      const targetRotation = Math.atan2(direction.x, direction.z);
      // Simple lerp for rotation
      const currentRotation = groupRef.current.rotation.y;
      // Handle angle wrap-around
      let diff = targetRotation - currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * 0.1;
    }
  });

  const color = data.state === 'disabled' ? '#444' : '#ff0055';

  return (
    <RigidBody
      ref={body}
      colliders={false}
      mass={1}
      type="dynamic"
      position={data.position}
      enabledRotations={[false, false, false]}
      userData={{ name: data.id }}
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
      <group ref={groupRef} position={[0, 0, 0]} visible={isVisible} scale={[moddedBotScale, moddedBotScale, moddedBotScale]}>
        {/* Body */}
        <mesh castShadow position={[0, 1, 0]}>
          {isGlitch ? (
            <boxGeometry args={[0.8, 1.8, 0.8]} />
          ) : skin === 'stealth' ? (
            <coneGeometry args={[0.6, 2, 8]} />
          ) : (
            <capsuleGeometry args={[0.5, 1]} />
          )}
          <meshStandardMaterial 
            color={isGlitch ? '#ff0000' : (skin === 'gold' ? '#ffd700' : color)} 
            roughness={skin === 'gold' ? 0.1 : 0.3} 
            metalness={skin === 'gold' ? 1 : 0.8} 
            emissive={isTargeted ? '#00ffff' : (isGlitch ? '#ff0000' : (skin === 'gold' ? '#ffd700' : color))}
            emissiveIntensity={isTargeted ? 1.5 : (data.state === 'disabled' ? 0 : (isGlitch ? 2 : (skin === 'neon' ? 0.8 : 0.4)))}
            transparent={skin === 'stealth' || isGlitch}
            opacity={isGlitch ? 0.8 : (skin === 'stealth' ? 0.4 : 1)}
          />
        </mesh>

        {/* Targeted Outline/Indicator */}
        {isTargeted && (
          <mesh position={[0, 1, 0]}>
            {isGlitch ? (
              <boxGeometry args={[0.9, 1.9, 0.9]} />
            ) : skin === 'stealth' ? (
              <coneGeometry args={[0.7, 2.1, 8]} />
            ) : (
              <capsuleGeometry args={[0.55, 1.1]} />
            )}
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
          </mesh>
        )}
        
        {/* Eye/Visor */}
        <mesh position={[0, 1.6, 0.45]}>
          <boxGeometry args={[0.6, 0.2, 0.2]} />
          <meshBasicMaterial color={data.state === 'disabled' ? '#111' : (skin === 'gold' ? '#fff' : '#00ffff')} />
        </mesh>

        {/* Username Label */}
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.3}
          color={data.state === 'active' ? (data.team === 'amber' ? '#f59e0b' : (data.team === 'blue' ? '#3b82f6' : '#ff0055')) : '#666666'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {data.id}
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
      </group>
    </RigidBody>
  );
}
