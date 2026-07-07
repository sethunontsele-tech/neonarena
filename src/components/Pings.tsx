import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export function Pings() {
  const pings = useGameStore(state => state.pings);
  const playerPosition = useGameStore(state => state.playerPosition);

  if (!pings || pings.length === 0) return null;

  return (
    <>
      {pings.map((ping) => {
        const dx = ping.position[0] - playerPosition[0];
        const dy = ping.position[1] - playerPosition[1];
        const dz = ping.position[2] - playerPosition[2];
        const distance = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));

        // Color based on type
        const color = ping.type === 'danger' ? '#ef4444' : (ping.type === 'loot' ? '#3b82f6' : '#10b981');
        const bgClass = ping.type === 'danger' ? 'bg-red-500/90' : (ping.type === 'loot' ? 'bg-blue-500/90' : 'bg-emerald-500/90');
        const textClass = ping.type === 'danger' ? 'text-red-200' : (ping.type === 'loot' ? 'text-blue-200' : 'text-emerald-200');
        const pulseBorder = ping.type === 'danger' ? 'border-red-500' : (ping.type === 'loot' ? 'border-blue-500' : 'border-emerald-500');

        return (
          <group key={ping.id} position={ping.position}>
            {/* Visual 3D marker */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[0.1, 0.8, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[0.7, 0.8, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>

            {/* 3D Vertical Light Beam */}
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.02, 0.1, 8, 8, 1, true]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>

            {/* Floating HUD Indicator */}
            <Html center distanceFactor={15}>
              <div id={`ping-${ping.id}`} className="flex flex-col items-center pointer-events-none select-none select-none font-sans">
                {/* Ping label & info box */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded shadow-lg border border-white/10 ${bgClass} backdrop-blur-md animate-bounce`}>
                  <span className="text-white font-black text-[10px] uppercase tracking-wider">{ping.label}</span>
                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded bg-black/30 ${textClass}`}>{distance}m</span>
                </div>

                {/* Vertical stem */}
                <div className="w-0.5 h-6 bg-gradient-to-b from-white/80 to-transparent shadow-sm" />

                {/* Radar target pulse circle */}
                <div className="relative flex items-center justify-center">
                  <div className={`absolute w-3 h-3 rounded-full border-2 ${pulseBorder} animate-ping`} />
                  <div className={`w-2.5 h-2.5 rounded-full border border-white bg-white shadow`} style={{ backgroundColor: color }} />
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
