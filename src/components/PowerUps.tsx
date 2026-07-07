import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, PowerUpType } from '../store';
import { RigidBody } from '@react-three/rapier';

const POWERUP_CONFIG: Record<PowerUpType, { color: string, emissive: string }> = {
  speed: { color: '#3b82f6', emissive: '#60a5fa' },
  damage: { color: '#ef4444', emissive: '#f87171' },
  shield: { color: '#fbbf24', emissive: '#fcd34d' },
  infinite_ammo: { color: '#10b981', emissive: '#34d399' },
  gravity_well: { color: '#8b5cf6', emissive: '#a78bfa' },
  vampirism: { color: '#ec4899', emissive: '#f472b6' },
  invisible: { color: '#94a3b8', emissive: '#cbd5e1' },
};

function PowerUpItem({ id, type, position }: { id: string, type: PowerUpType, position: [number, number, number] }) {
  const collectPowerUp = useGameStore(state => state.collectPowerUp);
  const config = POWERUP_CONFIG[type];

  return (
    <RigidBody
      type="fixed"
      colliders="ball"
      sensor
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === 'player') {
          collectPowerUp(id);
        }
      }}
      position={position}
    >
      <Float speed={5} rotationIntensity={2} floatIntensity={1}>
        <Sphere args={[0.6, 32, 32]}>
          <MeshDistortMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={2}
            speed={4}
            distort={0.4}
            transparent
            opacity={0.8}
          />
        </Sphere>
        <pointLight intensity={2} color={config.emissive} distance={5} />
      </Float>
    </RigidBody>
  );
}

export function PowerUps() {
  const powerUps = useGameStore(state => state.powerUps);

  return (
    <group name="powerups">
      {powerUps.map((pu) => (
        <PowerUpItem key={pu.id} {...pu} />
      ))}
    </group>
  );
}
