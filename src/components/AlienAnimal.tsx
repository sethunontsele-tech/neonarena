
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { soundService } from '../services/soundService';

const AlienModel: React.FC = () => {
  const materials = useLoader(MTLLoader, '/alien/Alien Animal.mtl');
  const obj = useLoader(OBJLoader, '/alien/alien.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return (
    <primitive 
      object={obj} 
      scale={0.4} 
      position={[0, -2.5, 0]} 
      rotation={[0, Math.PI, 0]} 
    />
  );
};

export const AlienAnimal: React.FC = () => {
  const alienPredatorActive = useGameStore(state => state.alienPredatorActive);
  const playerPosition = useGameStore(state => state.playerPosition);
  const takeDamage = useGameStore(state => state.takeDamage);
  const addEvent = useGameStore(state => state.addEvent);
  
  const rbRef = useRef<RapierRigidBody>(null);
  const lastAttackRef = useRef(0);
  const [spawned, setSpawned] = useState(false);

  useEffect(() => {
    if (alienPredatorActive && !spawned && rbRef.current) {
      const spawnPos: [number, number, number] = [
        playerPosition[0] + (Math.random() > 0.5 ? 20 : -20),
        5,
        playerPosition[2] + (Math.random() > 0.5 ? 20 : -20)
      ];
      rbRef.current.setTranslation({ x: spawnPos[0], y: spawnPos[1], z: spawnPos[2] }, true);
      setSpawned(true);
      addEvent("A PREDATOR HAS DETECTED YOUR SIGNAL!");
      soundService.playSFX('ui_hover');
    } else if (!alienPredatorActive) {
      setSpawned(false);
    }
  }, [alienPredatorActive, spawned, playerPosition, addEvent]);

  useFrame((state) => {
    if (!alienPredatorActive || !rbRef.current) return;

    const currentPos = rbRef.current.translation();
    const targetPos = new THREE.Vector3(playerPosition[0], playerPosition[1], playerPosition[2]);
    const creaturePos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
    
    const dist = creaturePos.distanceTo(targetPos);
    
    if (dist > 2) {
      const dir = targetPos.clone().sub(creaturePos).normalize();
      const speed = 12;
      rbRef.current.setLinvel({ x: dir.x * speed, y: rbRef.current.linvel().y, z: dir.z * speed }, true);
      const angle = Math.atan2(dir.x, dir.z);
      rbRef.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle), true);
    } else {
      const now = Date.now();
      if (now - lastAttackRef.current > 1000) {
        takeDamage(25);
        lastAttackRef.current = now;
        addEvent("YOU ARE BEING CONSUMED!");
        soundService.playSFX('hit');
        useGameStore.setState({ beingEaten: true });
        setTimeout(() => useGameStore.setState({ beingEaten: false }), 800);
      }
    }
  });

  if (!alienPredatorActive) return null;

  return (
    <RigidBody 
      ref={rbRef}
      colliders="cuboid" 
      lockRotations 
      enabledRotations={[false, true, false]}
      name="alien_predator"
    >
      <Suspense fallback={<mesh><boxGeometry args={[1, 2, 1]} /><meshStandardMaterial color="red" wireframe /></mesh>}>
        <AlienModel />
      </Suspense>
      <pointLight color="#ff0000" intensity={10} distance={15} />
    </RigidBody>
  );
};
