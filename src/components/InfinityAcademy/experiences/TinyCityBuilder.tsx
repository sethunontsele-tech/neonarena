import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface PlacedBuilding {
  id: number;
  type: 'tower' | 'park' | 'hyperloop';
  gridPos: [number, number]; // X, Z grid
  height: number;
}

export function TinyCityBuilder() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [activeTool, setActiveTool] = useState<'tower' | 'park' | 'hyperloop'>('tower');
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>([
    { id: 1, type: 'tower', gridPos: [-1, -1], height: 0.6 },
    { id: 2, type: 'park', gridPos: [1, -1], height: 0.1 },
    { id: 3, type: 'hyperloop', gridPos: [0, 1], height: 0.25 },
  ]);

  const trainRef = useRef<THREE.Mesh>(null);
  const hoverCarRef = useRef<THREE.Mesh>(null);
  const idCounter = useRef(4);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Loop hyperloop train
    if (trainRef.current) {
      trainRef.current.position.x = Math.sin(time * 1.5) * 0.8;
      trainRef.current.position.z = Math.cos(time * 1.5) * 0.8;
      trainRef.current.rotation.y = -time * 1.5;
    }

    // Flying car traffic
    if (hoverCarRef.current) {
      hoverCarRef.current.position.x = Math.cos(time * 0.8) * 1.1;
      hoverCarRef.current.position.z = Math.sin(time * 0.8) * 0.6;
      hoverCarRef.current.position.y = 0.45 + Math.sin(time * 3) * 0.05;
      hoverCarRef.current.rotation.y = -time * 0.8 + Math.PI / 2;
    }
  });

  const handleGridClick = (gridX: number, gridZ: number) => {
    // Check if building already exists at spot
    const exists = placedBuildings.find(b => b.gridPos[0] === gridX && b.gridPos[1] === gridZ);
    if (exists) {
      // Remove it (bulldozer action)
      setPlacedBuildings(prev => prev.filter(b => b.id !== exists.id));
      discoverObject('city_builder_bulldoze');
    } else {
      setPlacedBuildings(prev => [
        ...prev,
        {
          id: idCounter.current++,
          type: activeTool,
          gridPos: [gridX, gridZ],
          height: activeTool === 'tower' ? 0.5 + Math.random() * 0.6 : activeTool === 'hyperloop' ? 0.3 : 0.08
        }
      ]);
      discoverObject(`city_build_${activeTool}`);
    }
  };

  const clearGrid = () => {
    setPlacedBuildings([]);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'tiny_city_core',
      name: 'Futuristic Micro-Grid Core',
      category: 'Urban Engineering',
      description: 'A modular tabletop simulator replicating sustainable smart cities. Scaled skyscraper pods incorporate integrated carbon scrubbers, solar tiles, and hydrogen transit routes.',
      funFact: 'Futuristic hyperloops utilize magnetic levitation inside partial-vacuum tubes to transport passenger pods at speeds exceeding 700 miles per hour!'
    });
  };

  return (
    <group position={[0, -0.2, -1]}>
      {/* City Toolkit HUD */}
      <Html position={[1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Urban Planner</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🏰 Tiny City Builder</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Building tool</span>
            <button
              onClick={() => setActiveTool('tower')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTool === 'tower' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>🏢 Fusion Skyscraper</span>
            </button>
            <button
              onClick={() => setActiveTool('hyperloop')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTool === 'hyperloop' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>🚝 Hyperloop Node</span>
            </button>
            <button
              onClick={() => setActiveTool('park')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTool === 'park' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>🌳 Bio-Dome Park</span>
            </button>
          </div>

          <div className="flex gap-2 border-t border-white/5 pt-2">
            <button
              onClick={clearGrid}
              className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              CLEAR GRID
            </button>
            <div className="flex-1 text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-center border border-white/5 rounded-xl">
              BUILDS: {placedBuildings.length}
            </div>
          </div>
        </div>
      </Html>

      {/* Main Tabletop Platform */}
      <group onClick={handleInspect}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[2.6, 0.1, 2.6]} />
          <meshStandardMaterial color="#1c1917" roughness={0.6} />
        </mesh>
        {/* Holographic glowing borders */}
        <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} wireframe />
        </mesh>
      </group>

      {/* Grid Click Targets for building placement (3x3 grid) */}
      {[-1, 0, 1].map((x) =>
        [-1, 0, 1].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x * 0.7, -0.08, z * 0.7]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              handleGridClick(x, z);
            }}
          >
            <planeGeometry args={[0.6, 0.6]} />
            <meshBasicMaterial 
              color="#06b6d4" 
              transparent 
              opacity={0.03} 
              hovered-opacity={0.25}
              side={THREE.DoubleSide} 
            />
          </mesh>
        ))
      )}

      {/* Placed Buildings render */}
      {placedBuildings.map((building) => {
        const xPos = building.gridPos[0] * 0.7;
        const zPos = building.gridPos[1] * 0.7;

        return (
          <group key={building.id} position={[xPos, building.height / 2 - 0.08, zPos]}>
            {building.type === 'tower' && (
              <mesh>
                <boxGeometry args={[0.3, building.height, 0.3]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} emissive="#0284c7" emissiveIntensity={0.15} />
              </mesh>
            )}

            {building.type === 'hyperloop' && (
              <group>
                {/* Loop pillar */}
                <mesh>
                  <cylinderGeometry args={[0.1, 0.1, building.height, 8]} />
                  <meshStandardMaterial color="#78716c" metalness={0.8} />
                </mesh>
                {/* Ring torus top */}
                <mesh position={[0, building.height / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.12, 0.03, 8, 16]} />
                  <meshBasicMaterial color="#06b6d4" />
                </mesh>
              </group>
            )}

            {building.type === 'park' && (
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#10b981" transparent opacity={0.65} roughness={0.3} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Animated loops */}
      {placedBuildings.some(b => b.type === 'hyperloop') && (
        <group>
          {/* Hyperloop Ring Tube Visual */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
            <torusGeometry args={[0.8, 0.015, 8, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
          </mesh>
          {/* Loop train block */}
          <mesh ref={trainRef} position={[0, 0.22, 0]}>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {/* Flying Hover Car */}
      <mesh ref={hoverCarRef}>
        <boxGeometry args={[0.08, 0.02, 0.04]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>
    </group>
  );
}
export default TinyCityBuilder;
