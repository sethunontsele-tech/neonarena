import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundService } from '../../services/soundService';
import { backroomsAudio } from './backroomsAudio';

interface BackroomsPortalProps {
  position?: [number, number, number];
  playerPos: [number, number, number];
  onEnter: () => void;
}

export function BackroomsPortal({
  position = [0, 1.6, -45],
  playerPos,
  onEnter
}: BackroomsPortalProps) {
  const portalMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Compute distance to player
  const dist = Math.hypot(playerPos[0] - position[0], playerPos[2] - position[2]);
  const isNear = dist < 5.0;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (portalMeshRef.current) {
      portalMeshRef.current.rotation.y = Math.sin(t * 1.5) * 0.15;
      const scale = 1 + Math.sin(t * 4) * 0.04;
      portalMeshRef.current.scale.set(scale, scale, 1);
    }
    if (lightRef.current) {
      // Fluorescent anomaly flicker
      lightRef.current.intensity = 2.5 + Math.sin(t * 18) * 1.2;
    }
  });

  const handleTriggerEnter = () => {
    try {
      soundService.playSFX('dimension_shift');
      backroomsAudio.playEntityRoar('smiler');
    } catch (e) {}
    onEnter();
  };

  return (
    <group position={position} name="backrooms_no_clip_portal">
      {/* Concrete & Yellow Wallpaper Ruptured Gateway Frame */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4.2, 4.8, 0.6]} />
        <meshStandardMaterial color="#27272a" roughness={0.8} />
      </mesh>

      {/* Ripped Yellow Wallpaper Inset */}
      <mesh position={[0, 0.4, 0.31]}>
        <planeGeometry args={[3.2, 4.0]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.9} />
      </mesh>

      {/* Swirling No-Clip Void Vortex */}
      <mesh
        ref={portalMeshRef}
        position={[0, 0.4, 0.35]}
        onClick={handleTriggerEnter}
      >
        <planeGeometry args={[2.8, 3.6]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </mesh>

      {/* Overhead Flickering Fluorescent Tube */}
      <group position={[0, 2.9, 0.4]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 12]} />
          <meshBasicMaterial color="#fef9c3" />
        </mesh>
        <pointLight ref={lightRef} color="#fef08a" intensity={3.5} distance={14} />
      </group>

      {/* Hazard Warning Stripe Header */}
      <mesh position={[0, 2.6, 0.32]}>
        <planeGeometry args={[3.4, 0.4]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {/* Interactive In-World Prompt */}
      {isNear && (
        <Html position={[0, 1.8, 0.8]} center distanceFactor={14}>
          <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
            <div className="bg-black/95 border-2 border-amber-400 p-3 rounded-2xl shadow-[0_0_35px_rgba(234,179,8,0.6)] flex flex-col items-center gap-1.5 text-center min-w-[240px]">
              <span className="text-amber-400 font-mono font-black text-xs tracking-widest uppercase flex items-center gap-1.5">
                ⚠️ REALITY TEAR DETECTED
              </span>
              <span className="text-zinc-300 font-mono text-[10px]">
                Breach into the Infinite Liminal Backrooms Dimension
              </span>
              <button
                onClick={handleTriggerEnter}
                className="mt-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-mono font-black text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-1.5 animate-pulse"
              >
                <span>🌀 NO-CLIP NOW [PRESS E]</span>
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
