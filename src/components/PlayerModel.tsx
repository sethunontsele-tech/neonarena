/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as THREE from 'three';
import React, { Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import { SkinType, PatternType, AccessoryType, EntityState } from '../store';
import { ModernPlayer } from './ModernPlayer';

interface PlayerModelProps {
  skin: SkinType;
  color: string;
  pattern: PatternType;
  accessories: AccessoryType[];
  state: EntityState;
  isMe?: boolean;
  isGlitch?: boolean;
  infectionTimer?: number;
  activeStreakPower?: string | null;
}

function AlienMesh({ color }: { color: string }) {
  const materials = useLoader(MTLLoader, '/alien/Alien Animal.mtl');
  const obj = useLoader(OBJLoader, '/alien/alien.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return (
    <primitive 
      object={obj.clone()} 
      scale={0.15} 
      position={[0, -1, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

export function PlayerModel({ skin, color, pattern, accessories, state, isMe, isGlitch, infectionTimer = 0, activeStreakPower }: PlayerModelProps) {
  const isPlayerDisabled = state === 'disabled';
  const isGodMode = activeStreakPower === 'GOD MODE';
  const baseColor = isGlitch ? '#ff0000' : (isGodMode ? '#ffd700' : (isPlayerDisabled ? '#444' : color));

  // Pulse effect for infection
  const pulseScale = isGlitch ? 1.0 : 1.0 + (infectionTimer / 100) * 0.1 * Math.sin(Date.now() * 0.01);

  const materialProps = {
    color: isGlitch ? '#ff0000' : (
           isGodMode ? '#ffd700' : (
           skin === 'gold' ? '#ffd700' : 
           skin === 'ruby' ? '#ff0000' :
           skin === 'emerald' ? '#00ff44' :
           skin === 'diamond' ? '#b9f2ff' :
           skin === 'void' ? '#000000' :
           baseColor)),
    roughness: isGlitch || isGodMode ? 0.1 : (
               skin === 'gold' ? 0.1 : 
               skin === 'diamond' ? 0.05 :
               skin === 'void' ? 1 :
               0.3),
    metalness: isGlitch || isGodMode ? 0.9 : (
               skin === 'gold' ? 1 : 
               skin === 'ruby' ? 0.8 :
               skin === 'emerald' ? 0.6 :
               skin === 'diamond' ? 0.9 :
               skin === 'void' ? 0 :
               0.8),
    emissive: isGlitch ? '#ff0000' : (
              isGodMode ? '#ffd700' : (
              skin === 'gold' ? '#ffd700' : 
              skin === 'ruby' ? '#660000' :
              skin === 'emerald' ? '#00ff44' :
              skin === 'diamond' ? '#ffffff' :
              skin === 'void' ? '#000000' :
              baseColor)),
    emissiveIntensity: isPlayerDisabled ? 0 : 
                       (isGlitch ? 2.0 : (
                        isGodMode ? 1.5 : (
                        skin === 'neon' ? 0.8 : 
                        skin === 'emerald' ? 1.2 :
                        skin === 'void' ? 0 :
                        0.4 + (infectionTimer / 100) * 1.5))), // Pulse more as infection increases
    transparent: isGlitch || skin === 'stealth' || skin === 'diamond',
    opacity: isGlitch ? 0.8 : (skin === 'stealth' ? 0.4 : skin === 'diamond' ? 0.6 : 1),
  };

  return (
    <group scale={pulseScale}>
      {/* Main Body */}
      {skin === 'vijo_pro' ? (
        <ModernPlayer />
      ) : skin === 'alien' ? (
        <Suspense fallback={<mesh position={[0, 1, 0]}><capsuleGeometry args={[0.5, 1]} /><meshStandardMaterial color={color} wireframe /></mesh>}>
          <AlienMesh color={color} />
        </Suspense>
      ) : (
        <mesh castShadow position={[0, 1, 0]}>
          {isGlitch || skin === 'glitch' ? (
            <boxGeometry args={[0.8, 1.8, 0.8]} />
          ) : skin === 'stealth' ? (
            <coneGeometry args={[0.6, 2, 8]} />
          ) : skin === 'void' ? (
            <boxGeometry args={[0.4, 2.2, 0.4]} />
          ) : skin === 'steve' || skin === 'alex' ? (
            <boxGeometry args={[0.6, 1.8, 0.4]} />
          ) : (
            <capsuleGeometry args={[0.5, 1]} />
          )}
          <meshStandardMaterial 
            {...materialProps} 
            color={skin === 'steve' ? '#2e7d32' : skin === 'alex' ? '#ff8a65' : materialProps.color}
          />
        </mesh>
      )}

      {/* Minecraft Head */}
      {(skin === 'steve' || skin === 'alex') && (
        <mesh castShadow position={[0, 2.1, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={skin === 'steve' ? '#8d6e63' : '#ffcc80'} />
        </mesh>
      )}

      {/* Minecraft Arms */}
      {(skin === 'steve' || skin === 'alex') && (
        <>
          <mesh castShadow position={[-0.45, 1.2, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color={skin === 'steve' ? '#1976d2' : '#ffffff'} />
          </mesh>
          <mesh castShadow position={[0.45, 1.2, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color={skin === 'steve' ? '#1976d2' : '#ffffff'} />
          </mesh>
        </>
      )}

      {/* Pattern Overlays */}
      {!isPlayerDisabled && pattern !== 'none' && (
        <group position={[0, 1, 0]}>
          {pattern === 'stripes' && [0, 1, 2, 3].map(i => (
            <mesh key={i} position={[0, -0.6 + i * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.51, 0.02, 8, 32]} />
              <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
          ))}
          {pattern === 'dots' && Array.from({ length: 12 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                Math.cos(i) * 0.48, 
                -0.8 + Math.random() * 1.6, 
                Math.sin(i) * 0.48
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
            </mesh>
          ))}
          {pattern === 'grid' && (
            <mesh>
              <capsuleGeometry args={[0.51, 1.01]} />
              <meshBasicMaterial color="#00ffff" wireframe opacity={0.2} transparent />
            </mesh>
          )}
          {pattern === 'circuit' && Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, -0.5 + i * 0.3, 0.48]}>
              <boxGeometry args={[0.4, 0.02, 0.05]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
            </mesh>
          ))}
        </group>
      )}

      {/* Accessories */}
      {!isPlayerDisabled && accessories.map(acc => (
        <group key={acc}>
          {acc === 'hat' && (
            <group position={[0, 2, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
                <meshStandardMaterial color="#222" />
              </mesh>
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            </group>
          )}
          {acc === 'glasses' && (
            <group position={[0, 1.6, 0.45]}>
              <mesh position={[-0.15, 0, 0.05]}>
                <boxGeometry args={[0.2, 0.15, 0.05]} />
                <meshBasicMaterial color="#111" />
              </mesh>
              <mesh position={[0.15, 0, 0.05]}>
                <boxGeometry args={[0.2, 0.15, 0.05]} />
                <meshBasicMaterial color="#111" />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.1, 0.02, 0.02]} />
                <meshBasicMaterial color="#111" />
              </mesh>
            </group>
          )}
          {acc === 'backpack' && (
            <mesh position={[0, 1.2, -0.4]}>
              <boxGeometry args={[0.6, 0.8, 0.3]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          )}
          {acc === 'horns' && (
            <group position={[0, 1.9, 0]}>
              <mesh position={[-0.3, 0, 0.2]} rotation={[0.4, 0, -0.4]}>
                <coneGeometry args={[0.1, 0.4, 8]} />
                <meshStandardMaterial color="#ff0000" />
              </mesh>
              <mesh position={[0.3, 0, 0.2]} rotation={[0.4, 0, 0.4]}>
                <coneGeometry args={[0.1, 0.4, 8]} />
                <meshStandardMaterial color="#ff0000" />
              </mesh>
            </group>
          )}
          {acc === 'halo' && (
            <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.03, 8, 32]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
            </mesh>
          )}
        </group>
      ))}

      {/* Eye/Visor */}
      <mesh position={[0, 1.6, 0.45]}>
        <boxGeometry args={[0.6, 0.2, 0.2]} />
        <meshBasicMaterial color={isPlayerDisabled ? '#111' : (skin === 'gold' ? '#fff' : '#ffffff')} />
      </mesh>
    </group>
  );
}
