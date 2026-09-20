import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ActiveWorldEvent, WorldEventType } from './types';
import { useGameStore } from '../../store';

export const WorldEventsManager: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<ActiveWorldEvent | null>(null);
  const [eventTimeRemaining, setEventTimeRemaining] = useState(120);

  // Parachuting supply drop crate position
  const [crateY, setCrateY] = useState(80);
  const crateLandingPos: [number, number, number] = [20, 0.5, -120];

  // Boss Health
  const [bossHealth, setBossHealth] = useState(10000);
  const maxBossHealth = 10000;

  // Food drops positions
  const foodDrops = useRef<Array<{ id: number; pos: [number, number, number]; type: 'burger' | 'pizza' | 'potion' }>>([
    { id: 1, pos: [5, 1, -150], type: 'burger' },
    { id: 2, pos: [-10, 1, -140], type: 'pizza' },
    { id: 3, pos: [15, 1, -160], type: 'potion' },
    { id: 4, pos: [-25, 1, -170], type: 'burger' },
    { id: 5, pos: [0, 1, -180], type: 'potion' }
  ]);

  // Tick down timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEventTimeRemaining(prev => {
        if (prev <= 1) {
          // Trigger next random event
          const eventTypes: WorldEventType[] = ['supply_drop', 'food_rain', 'titan_boss', 'meteor_shower'];
          const nextType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          triggerEvent(nextType);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerEvent = (type: WorldEventType) => {
    let title = 'WORLD EVENT';
    let desc = '';
    let reward = '';

    if (type === 'supply_drop') {
      title = 'GOLDEN SUPPLY AIRDROP INCOMING';
      desc = 'A military transport plane dropped a high-tier gold supply crate in the Central Plains!';
      reward = 'Legendary Sci-Fi Plasma Rifle & 2,500 Gold';
      setCrateY(90);
    } else if (type === 'food_rain') {
      title = 'FOOD RAINING FROM THE SKY';
      desc = 'Mystical food clouds are showering the city with giant burgers, pizzas & healing waters!';
      reward = '+100% Max Stamina & Instant Full HP';
    } else if (type === 'titan_boss') {
      title = 'COLOSSAL TITAN WORLD BOSS AWAKENED';
      desc = 'An ancient level 99 Titan Behemoth has emerged in the Colosseum! Rally your clan!';
      reward = 'Titan Shard Armor & 10,000 Clan XP';
      setBossHealth(10000);
    } else {
      title = 'COSMIC METEOR SHOWER';
      desc = 'Glowing celestial meteors are crashing into the desert! Mine the cosmic crystals!';
      reward = 'Cosmic Aether Ore & Speed Boost';
    }

    setCurrentEvent({
      id: `event_${Date.now()}`,
      type,
      title,
      description: desc,
      position: crateLandingPos,
      timeRemainingSeconds: 120,
      rewardText: reward,
      intensity: 1.0
    });

    useGameStore.getState().addEvent(`⚡ ${title}! ${desc}`);
  };

  // Animate falling parachute crate
  useFrame((_, delta) => {
    if (currentEvent?.type === 'supply_drop' && crateY > 1.2) {
      setCrateY(prev => Math.max(1.0, prev - delta * 8));
    }
  });

  return (
    <group name="world-events-system">
      {/* 1. SUPPLY DROP CRATE WITH PARACHUTE & RED SMOKE BEACON */}
      {currentEvent?.type === 'supply_drop' && (
        <group position={[crateLandingPos[0], crateY, crateLandingPos[2]]}>
          <RigidBody type="fixed" colliders="cuboid">
            {/* Gold Cargo Crate */}
            <mesh castShadow>
              <boxGeometry args={[3, 3, 3]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Parachute Canopy if still in air */}
            {crateY > 2 && (
              <group position={[0, 6, 0]}>
                <mesh>
                  <coneGeometry args={[5, 3.5, 12, 1, true]} />
                  <meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </RigidBody>
          {/* Signal Smoke Flare */}
          <pointLight color="#ef4444" intensity={15} distance={30} />
          <Sparkles count={40} scale={[4, 15, 4]} size={8} speed={1.5} color="#ef4444" />
          <group position={[0, 4, 0]}>
            <Text fontSize={0.8} color="#facc15" anchorX="center" anchorY="middle">
              AIRDROP CRATE [CLICK TO LOOT]
            </Text>
          </group>
        </group>
      )}

      {/* 2. FOOD FROM THE SKY */}
      {currentEvent?.type === 'food_rain' && (
        <group>
          {foodDrops.current.map((item) => (
            <group key={item.id} position={item.pos}>
              <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                {item.type === 'burger' ? (
                  <mesh castShadow>
                    <cylinderGeometry args={[1.2, 1.2, 0.7, 12]} />
                    <meshStandardMaterial color="#d97706" />
                  </mesh>
                ) : item.type === 'pizza' ? (
                  <mesh castShadow rotation={[0.4, 0, 0]}>
                    <coneGeometry args={[1.2, 0.2, 3]} />
                    <meshStandardMaterial color="#ea580c" />
                  </mesh>
                ) : (
                  <mesh castShadow>
                    <octahedronGeometry args={[0.8]} />
                    <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.5} />
                  </mesh>
                )}
              </Float>
              <pointLight color="#38bdf8" intensity={4} distance={6} />
              <group position={[0, 2, 0]}>
                <Text fontSize={0.4} color="#fef08a" anchorX="center" anchorY="middle">
                  {item.type.toUpperCase()} [+HP]
                </Text>
              </group>
            </group>
          ))}
        </group>
      )}

      {/* 3. TITAN WORLD BOSS IN COLOSSEUM */}
      {currentEvent?.type === 'titan_boss' && (
        <group position={[240, 0, -280]}>
          <RigidBody type="fixed" colliders="cuboid">
            <group position={[0, 10, 0]}>
              {/* Giant Boss Torso */}
              <mesh castShadow>
                <boxGeometry args={[8, 14, 6]} />
                <meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Horned Crown */}
              <mesh position={[0, 9, 0]}>
                <coneGeometry args={[3, 5, 4]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              {/* Glowing Core */}
              <pointLight color="#ef4444" intensity={25} distance={40} />
            </group>
          </RigidBody>
          {/* Boss Health Bar Display */}
          <group position={[0, 24, 0]}>
            <Text fontSize={2.5} color="#ef4444" anchorX="center" anchorY="middle" outlineWidth={0.2} outlineColor="#000">
              WORLD BOSS: GIGAS THE DESTROYER
            </Text>
            <Text position={[0, -1.8, 0]} fontSize={1.4} color="#ffffff" anchorX="center" anchorY="middle">
              HP: {bossHealth} / {maxBossHealth}
            </Text>
          </group>
        </group>
      )}
    </group>
  );
};
