import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { CreatureType, CreatureEntity } from './types';
import { useGameStore } from '../../store';

interface CreatureProps {
  creature: CreatureEntity;
  onInteract: (id: string) => void;
}

export const CreatureInstance: React.FC<CreatureProps> = ({ creature, onInteract }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  const [isMounted, setIsMounted] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Tail wagging / swaying
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 2.5) * 0.25;
    }

    // Dragon wing flaps
    if (wingsRef.current) {
      wingsRef.current.rotation.z = Math.sin(t * 4) * 0.4;
    }

    // Idle pacing if not mounted
    if (groupRef.current && !isMounted) {
      groupRef.current.position.x += Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={creature.position} rotation={[0, creature.rotation, 0]} scale={[creature.scale, creature.scale, creature.scale]}>
      <RigidBody type="fixed" colliders="cuboid" userData={{ name: `creature-${creature.id}` }}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            setIsMounted(!isMounted);
            onInteract(creature.id);
            useGameStore.getState().addEvent(`🦖 ${isMounted ? 'DISMOUNTED' : 'MOUNTED'} ${creature.name.toUpperCase()}!`);
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          {/* 1. T-REX APEX PREDATOR */}
          {creature.type === 't_rex' && (
            <group position={[0, 2.5, 0]}>
              {/* Massive Torso */}
              <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[2.2, 2.6, 4.2]} />
                <meshStandardMaterial color={creature.color} roughness={0.8} />
              </mesh>
              {/* Giant Jaw & Head */}
              <group position={[0, 2.6, -2.6]}>
                <mesh castShadow>
                  <boxGeometry args={[1.6, 1.8, 2.8]} />
                  <meshStandardMaterial color={creature.color} roughness={0.7} />
                </mesh>
                {/* Sharp White Teeth */}
                <mesh position={[0, -0.7, 0.4]}>
                  <boxGeometry args={[1.5, 0.2, 2.2]} />
                  <meshStandardMaterial color="#f8fafc" />
                </mesh>
                {/* Fierce Amber Eyes */}
                <mesh position={[0.82, 0.4, -0.4]}>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
                <mesh position={[-0.82, 0.4, -0.4]}>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
              </group>
              {/* Muscular Hind Legs */}
              <mesh position={[-1.4, -0.6, 0.6]} castShadow>
                <cylinderGeometry args={[0.7, 0.4, 3.2, 8]} />
                <meshStandardMaterial color={creature.color} />
              </mesh>
              <mesh position={[1.4, -0.6, 0.6]} castShadow>
                <cylinderGeometry args={[0.7, 0.4, 3.2, 8]} />
                <meshStandardMaterial color={creature.color} />
              </mesh>
              {/* Animated Tail */}
              <group ref={tailRef} position={[0, 1.6, 2.1]}>
                <mesh rotation={[Math.PI / 2 - 0.2, 0, 0]}>
                  <cylinderGeometry args={[0.9, 0.2, 5.0, 8]} />
                  <meshStandardMaterial color={creature.color} />
                </mesh>
              </group>
            </group>
          )}

          {/* 2. VELOCIRAPTOR */}
          {creature.type === 'velociraptor' && (
            <group position={[0, 1.2, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[1.0, 1.1, 2.2]} />
                <meshStandardMaterial color={creature.color} roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.3, -1.3]}>
                <boxGeometry args={[0.7, 0.8, 1.4]} />
                <meshStandardMaterial color={creature.color} />
              </mesh>
            </group>
          )}

          {/* 3. FIRE WYVERN DRAGON */}
          {creature.type === 'fire_dragon' && (
            <group position={[0, 4, 0]}>
              {/* Serpentine Body */}
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1.0, 0.7, 4.8, 8]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.6} />
              </mesh>
              {/* Horned Dragon Head */}
              <group position={[0, 0.8, -3.0]}>
                <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
                  <coneGeometry args={[1.0, 2.2, 6]} />
                  <meshStandardMaterial color="#991b1b" />
                </mesh>
                {/* Fire breath glow */}
                <pointLight position={[0, -0.4, -1.0]} color="#f97316" intensity={12} distance={10} />
              </group>
              {/* Animated Flapping Wings */}
              <group ref={wingsRef} position={[0, 1.2, 0]}>
                <mesh position={[-3.5, 0, 0]} rotation={[0, 0, -0.3]}>
                  <boxGeometry args={[6.0, 0.1, 3.0]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.5} />
                </mesh>
                <mesh position={[3.5, 0, 0]} rotation={[0, 0, 0.3]}>
                  <boxGeometry args={[6.0, 0.1, 3.0]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.5} />
                </mesh>
              </group>
            </group>
          )}

          {/* 4. DIRE WOLF & SPIRIT FOX */}
          {(creature.type === 'dire_wolf' || creature.type === 'spirit_fox') && (
            <group position={[0, 1.0, 0]}>
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.2, 1.2, 2.6]} />
                <meshStandardMaterial color={creature.color} roughness={0.8} />
              </mesh>
              {/* Head & Ears */}
              <mesh position={[0, 1.2, -1.4]} rotation={[Math.PI / 3, 0, 0]}>
                <coneGeometry args={[0.7, 1.2, 6]} />
                <meshStandardMaterial color={creature.color} />
              </mesh>
              {creature.type === 'spirit_fox' && (
                <Sparkles count={20} scale={[3, 3, 3]} size={4} speed={1} color="#67e8f9" />
              )}
            </group>
          )}

          {/* CREATURE INTERACTION PROMPT */}
          <group position={[0, 5, 0]}>
            <Text
              fontSize={0.6}
              color="#fbbf24"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.06}
              outlineColor="#000000"
            >
              {creature.name.toUpperCase()}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.4}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {isMounted ? '[CLICK] DISMOUNT' : '[CLICK] MOUNT & RIDE'}
            </Text>
          </group>
        </group>
      </RigidBody>
    </group>
  );
};

export const OpenWorldCreaturesManager: React.FC = () => {
  const initialCreatures: CreatureEntity[] = [
    {
      id: 'dino_rex_1',
      type: 't_rex',
      name: 'Apex Tyrannosaurus Rex',
      position: [-240, 0.2, 120],
      rotation: -Math.PI / 4,
      health: 2000,
      maxHealth: 2000,
      isHostile: false,
      isTamed: true,
      isMounted: false,
      scale: 1.4,
      color: '#047857'
    },
    {
      id: 'dino_raptor_1',
      type: 'velociraptor',
      name: 'Swiftclaw Raptor',
      position: [-270, 0.2, 90],
      rotation: 0.5,
      health: 600,
      maxHealth: 600,
      isHostile: false,
      isTamed: true,
      isMounted: false,
      scale: 1.2,
      color: '#b45309'
    },
    {
      id: 'dragon_wyvern_1',
      type: 'fire_dragon',
      name: 'Ignis Prime Wyvern',
      position: [260, 20, 220],
      rotation: Math.PI / 2,
      health: 3500,
      maxHealth: 3500,
      isHostile: false,
      isTamed: true,
      isMounted: false,
      scale: 1.8,
      color: '#dc2626'
    },
    {
      id: 'dire_wolf_1',
      type: 'dire_wolf',
      name: 'Shadowfang Dire Wolf',
      position: [200, 0.2, 180],
      rotation: 0,
      health: 450,
      maxHealth: 450,
      isHostile: false,
      isTamed: true,
      isMounted: false,
      scale: 1.3,
      color: '#475569'
    },
    {
      id: 'spirit_fox_1',
      type: 'spirit_fox',
      name: 'Celestial Kitsune Fox',
      position: [140, 0.2, 20],
      rotation: -0.8,
      health: 500,
      maxHealth: 500,
      isHostile: false,
      isTamed: true,
      isMounted: false,
      scale: 1.1,
      color: '#06b6d4'
    }
  ];

  return (
    <group name="open-world-wildlife-group">
      {initialCreatures.map((creature) => (
        <CreatureInstance
          key={creature.id}
          creature={creature}
          onInteract={() => {}}
        />
      ))}
    </group>
  );
};
