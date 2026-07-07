import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

export function HallwayEntity() {
  const { scene } = useThree();
  const playerPosition = useGameStore(state => state.playerPosition);
  const gameState = useGameStore(state => state.gameState);
  const mapSeed = useGameStore(state => state.mapSeed);

  const groupRef = useRef<THREE.Group>(null);
  
  // Patrol targets
  const [patrolTarget, setPatrolTarget] = useState<THREE.Vector3>(() => new THREE.Vector3(20, 0, -20));
  const [isAlerted, setIsAlerted] = useState(false);
  const lastDamageTime = useRef(0);
  const lastAlertEventTime = useRef(0);

  // Pick a fresh random target on the floor
  const findNewPatrolTarget = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    setPatrolTarget(new THREE.Vector3(x, 1.6, z));
  };

  // Reset entity position and state when map changes
  useEffect(() => {
    if (groupRef.current) {
      // Spawn at a decent distance from the origin
      const angle = Math.random() * Math.PI * 2;
      groupRef.current.position.set(Math.cos(angle) * 45, 1.6, Math.sin(angle) * 45);
      findNewPatrolTarget();
      setIsAlerted(false);
    }
  }, [mapSeed]);

  useFrame((state, delta) => {
    if (!groupRef.current || gameState !== 'playing') return;

    const entityPos = groupRef.current.position;
    const playerPos = new THREE.Vector3(...playerPosition);
    const distToPlayer = entityPos.distanceTo(playerPos);

    // 1. Line Of Sight (Raycasting)
    let hasLineOfSight = false;
    
    // Only raycast if player is within maximum awareness bounds
    if (distToPlayer < 35) {
      const dirToPlayer = new THREE.Vector3().subVectors(playerPos, entityPos).normalize();
      const raycaster = new THREE.Raycaster(entityPos, dirToPlayer, 0.1, 40);

      // Collect all obstacles in the scene
      const colliders: THREE.Object3D[] = [];
      scene.traverse((node) => {
        if (node.name === 'obstacle' || node.name === 'player') {
          colliders.push(node);
        }
      });

      const hits = raycaster.intersectObjects(colliders, true);
      if (hits.length > 0) {
        const closestHit = hits[0];
        // If the closest hit is indeed the player
        if (closestHit.object.name === 'player' || closestHit.distance >= distToPlayer - 1.2) {
          hasLineOfSight = true;
        }
      }
    }

    // 2. State Machine: Patrol or Chase
    const speed = hasLineOfSight ? 6.2 : 3.0;
    
    if (hasLineOfSight) {
      if (!isAlerted) {
        setIsAlerted(true);
        const now = Date.now();
        if (now - lastAlertEventTime.current > 15000) {
          lastAlertEventTime.current = now;
          useGameStore.getState().addEvent('⚠️ WARNING: ANOMALY SPOTTED YOU! ESCAPE IMMEDIATELY!');
          try {
            soundService.playSFX('infection');
          } catch (e) {}
        }
      }

      // Move directly toward player
      const dir = new THREE.Vector3().subVectors(playerPos, entityPos).normalize();
      // Keep Y coordinate locked for levitation elevation
      dir.y = 0;
      entityPos.addScaledVector(dir, speed * delta);

      // Rotate to point at player
      const targetRotation = Math.atan2(dir.x, dir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1);
    } else {
      if (isAlerted) {
        setIsAlerted(false);
      }

      // Move toward patrol target
      const dir = new THREE.Vector3().subVectors(patrolTarget, entityPos).normalize();
      dir.y = 0;
      entityPos.addScaledVector(dir, speed * delta);

      // Rotate toward motion vector
      if (dir.lengthSq() > 0.01) {
        const targetRotation = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.05);
      }

      // If reached target, assign a new one
      const distToTarget = entityPos.distanceTo(patrolTarget);
      if (distToTarget < 2.5) {
        findNewPatrolTarget();
      }
    }

    // 3. Contact Damage Ticking
    if (distToPlayer < 2.0) {
      const now = Date.now();
      if (now - lastDamageTime.current > 1400) {
        lastDamageTime.current = now;
        useGameStore.getState().takeDamage(15);
        useGameStore.getState().addEvent('⚠️ INTRUSION CONTACT: DECAYING REALITY ANOMALY INTERACTION!');
        try {
          soundService.playSFX('hit');
        } catch (e) {}
      }
    }

    // Outer orbiting particles animation
    const coreMesh = groupRef.current.getObjectByName('glitchCore');
    if (coreMesh) {
      coreMesh.rotation.y += 0.05;
      coreMesh.rotation.x += 0.02;
    }
  });

  if (gameState !== 'playing') return null;

  return (
    <group ref={groupRef} position={[25, 1.6, 25]}>
      {/* Visual Glitch Monolith / Shadow entity */}
      <mesh name="hallway_entity_body" castShadow>
        <boxGeometry args={[1.0, 3.2, 1.0]} />
        <meshStandardMaterial 
          color="#000000" 
          roughness={0.01} 
          metalness={1.0} 
        />
      </mesh>

      {/* Orbiting Glitch Shards */}
      <group name="glitchCore">
        <mesh position={[0.9, 0.4, 0.9]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#ef4444" wireframe />
        </mesh>
        <mesh position={[-0.9, -0.4, -0.9]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="#f43f5e" wireframe />
        </mesh>
        <mesh position={[0.9, -0.6, -0.9]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshBasicMaterial color="#fda4af" wireframe />
        </mesh>
      </group>

      {/* Spooky Glowing Red Core Eye */}
      <mesh position={[0, 1.0, 0.51]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
        <pointLight color="#ef4444" intensity={3.5} distance={15} />
      </mesh>

      {/* Indicator Sign */}
      <Html position={[0, 2.2, 0]} center distanceFactor={15}>
        <div className={`transition-all duration-300 font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow-lg whitespace-nowrap select-none pointer-events-none border ${
          isAlerted
            ? 'bg-rose-950/95 text-rose-300 border-rose-500/50 animate-bounce'
            : 'bg-zinc-950/90 text-zinc-400 border-zinc-500/30'
        }`}>
          {isAlerted ? '💀 [ANOMALY ACTIVE - AGGRESSIVE]' : '👾 [ANOMALY PATROLLING corridors]'}
        </div>
      </Html>
    </group>
  );
}
export default HallwayEntity;
