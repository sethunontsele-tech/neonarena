import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { TransformationId, TransformationConfig } from './types';
import { TITAN_TRANSFORMATIONS } from './configs';
import { useGameStore } from '../../store';

interface TitanTransformProps {
  activeForm: TransformationId | null;
  playerPos: [number, number, number];
  playerRot: number;
  onDeactivate: () => void;
}

export const TitanTransformationAvatar: React.FC<TitanTransformProps> = ({
  activeForm,
  playerPos,
  playerRot,
  onDeactivate
}) => {
  const tailsGroupRef = useRef<THREE.Group>(null);
  const breathBeamRef = useRef<THREE.Mesh>(null);
  const steamPlumeRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);

  const config = TITAN_TRANSFORMATIONS.find(t => t.id === activeForm);

  // Animation frame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Kyubi animated tails
    if (tailsGroupRef.current) {
      tailsGroupRef.current.children.forEach((tail, idx) => {
        tail.rotation.z = Math.sin(t * 3 + idx * 0.7) * 0.35;
        tail.rotation.y = Math.cos(t * 2 + idx * 0.5) * 0.25;
      });
    }

    // Godzilla atomic breath pulsing
    if (breathBeamRef.current) {
      breathBeamRef.current.scale.x = 1 + Math.sin(t * 12) * 0.2;
      breathBeamRef.current.scale.y = 1 + Math.cos(t * 12) * 0.2;
    }

    // Celestial wings flapping
    if (wingsRef.current) {
      wingsRef.current.rotation.y = Math.sin(t * 4) * 0.3;
    }
  });

  if (!activeForm || !config) return null;

  return (
    <group position={playerPos} rotation={[0, playerRot, 0]}>
      {/* Dynamic Transformation Aura Light */}
      <pointLight
        position={[0, 4, 0]}
        color={config.auraColor}
        intensity={18}
        distance={25}
      />

      {/* Atmospheric Aura Sparkles */}
      <Sparkles
        count={50}
        scale={[6 * config.heightMultiplier, 8 * config.heightMultiplier, 6 * config.heightMultiplier]}
        size={6}
        speed={1.5}
        color={config.auraColor}
      />

      {/* 1. COLOSSAL ARMORED TITAN */}
      {activeForm === 'colossal_titan' && (
        <group scale={[config.heightMultiplier, config.heightMultiplier, config.heightMultiplier]}>
          {/* Muscular Armored Torso */}
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[3.2, 4.2, 2.0]} />
            <meshStandardMaterial color="#991b1b" roughness={0.7} />
          </mesh>
          {/* Bone Armor Plates */}
          <mesh position={[0, 4.8, 1.05]}>
            <boxGeometry args={[2.6, 3.2, 0.4]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.4} />
          </mesh>
          {/* Titan Head with glowing white eyes */}
          <mesh position={[0, 7.2, 0]} castShadow>
            <boxGeometry args={[1.6, 1.8, 1.6]} />
            <meshStandardMaterial color="#991b1b" roughness={0.6} />
          </mesh>
          <mesh position={[0.4, 7.4, 0.82]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.4, 7.4, 0.82]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Muscular Arms */}
          <mesh position={[-2.2, 4.2, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.5, 3.8, 8]} />
            <meshStandardMaterial color="#991b1b" />
          </mesh>
          <mesh position={[2.2, 4.2, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.5, 3.8, 8]} />
            <meshStandardMaterial color="#991b1b" />
          </mesh>
          {/* Giant Legs */}
          <mesh position={[-0.9, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.65, 4.0, 8]} />
            <meshStandardMaterial color="#7f1d1d" />
          </mesh>
          <mesh position={[0.9, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.65, 4.0, 8]} />
            <meshStandardMaterial color="#7f1d1d" />
          </mesh>
          {/* Superheated Steam Plumes */}
          <group ref={steamPlumeRef} position={[0, 7.5, 0]}>
            <Sparkles count={35} scale={[4, 5, 4]} size={8} speed={2} color="#fee2e2" />
          </group>
        </group>
      )}

      {/* 2. KURAMA NINE-TAILED CHAKRA AVATAR */}
      {activeForm === 'nine_tailed_fox' && (
        <group scale={[config.heightMultiplier, config.heightMultiplier, config.heightMultiplier]}>
          {/* Golden Chakra Beast Body */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[1.4, 1.8, 3.2, 12]} />
            <meshStandardMaterial 
              color="#f97316" 
              emissive="#ea580c" 
              emissiveIntensity={0.8} 
              roughness={0.2} 
            />
          </mesh>
          {/* Fox Head & Ears */}
          <group position={[0, 4.4, 0.5]}>
            <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
              <coneGeometry args={[1.2, 1.8, 6]} />
              <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.8} />
            </mesh>
            {/* Pointed Fox Ears */}
            <mesh position={[-0.8, 1.2, -0.4]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.35, 1.2, 4]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[0.8, 1.2, -0.4]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.35, 1.2, 4]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
          {/* 9 Undulating Chakra Tails */}
          <group ref={tailsGroupRef} position={[0, 2.0, -1.6]}>
            {[-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2].map((xOff, idx) => (
              <mesh key={idx} position={[xOff, 1.2 + Math.abs(xOff) * 0.4, -0.2]} rotation={[-Math.PI / 3, 0, xOff * 0.3]}>
                <cylinderGeometry args={[0.25, 0.05, 4.5, 8]} />
                <meshStandardMaterial 
                  color="#fbbf24" 
                  emissive="#f59e0b" 
                  emissiveIntensity={0.9} 
                />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* 3. GODZILLA / KAIJU ATOMIC LEVIATHAN */}
      {activeForm === 'godzilla_kaiju' && (
        <group scale={[config.heightMultiplier, config.heightMultiplier, config.heightMultiplier]}>
          {/* Reptilian Heavy Torso */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[1.8, 2.4, 4.2, 10]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
          {/* Luminescent Blue Dorsal Spines */}
          {[-1.2, -0.4, 0.4, 1.2, 2.0, 2.8].map((yOff, idx) => (
            <mesh key={idx} position={[0, yOff + 2, -1.6]} rotation={[-Math.PI / 3, 0, 0]}>
              <coneGeometry args={[0.6, 1.4, 4]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          ))}
          {/* Atomic Breath Heat Ray projecting forward */}
          <mesh ref={breathBeamRef} position={[0, 4.8, 12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.3, 24, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, 4.8, 6]} color="#06b6d4" intensity={25} distance={30} />
        </group>
      )}

      {/* 4. SUPER SAIYAN GOD AWAKENED */}
      {activeForm === 'saiyan_god' && (
        <group>
          {/* Golden Ki Flame Aura Column */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[2.5, 3.0, 5.0, 16]} />
            <meshBasicMaterial color="#facc15" wireframe transparent opacity={0.4} />
          </mesh>
          {/* Golden Spiky Hair Glow */}
          <mesh position={[0, 4.0, 0]}>
            <octahedronGeometry args={[1.2]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Instant Transmission Energy Shockwaves */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 4, 32]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>
      )}

      {/* 5. CELESTIAL ARCHANGEL OF INFINITY */}
      {activeForm === 'celestial_archangel' && (
        <group>
          {/* Glowing Luminous Wings */}
          <group ref={wingsRef} position={[0, 3.2, -0.6]}>
            <mesh position={[-2.4, 1.2, 0]} rotation={[0, 0, -0.4]}>
              <boxGeometry args={[4.2, 1.8, 0.1]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} />
            </mesh>
            <mesh position={[2.4, 1.2, 0]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[4.2, 1.8, 0.1]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} />
            </mesh>
          </group>
          {/* Halo Ring */}
          <mesh position={[0, 4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.8, 0.08, 16, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* TITAN STATUS OVERHEAD LABEL */}
      <group position={[0, 6 * (config.heightMultiplier > 2 ? 1.8 : 1.2), 0]}>
        <Text
          fontSize={1.2}
          color={config.auraColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.15}
          outlineColor="#000000"
        >
          {config.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.65}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ULTIMATE: {config.ultimateAttack.toUpperCase()}
        </Text>
      </group>
    </group>
  );
};
