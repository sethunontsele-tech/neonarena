import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

type ChronoEra = 'jurassic' | 'egypt' | 'moon' | 'cyber';

interface EraDetail {
  name: string;
  year: string;
  description: string;
  fact: string;
  color: string;
}

export function TimeMachine() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [activeEra, setActiveEra] = useState<ChronoEra>('moon');
  const [warpActive, setWarpActive] = useState(false);

  const eras: Record<ChronoEra, EraDetail> = {
    jurassic: {
      name: 'Prehistoric Jurassic',
      year: '150 Million BCE',
      description: 'The age of giant cycads, massive sauropods, and pterodactyls soaring across unpolluted thermal skies.',
      fact: 'During the Jurassic era, the Earth had no polar ice caps, meaning global sea levels were hundreds of feet higher than today!',
      color: '#15803d'
    },
    egypt: {
      name: 'Giza Plateau',
      year: '2560 BCE',
      description: 'The height of Old Kingdom monument construction. Highly aligned megaliths are erected to serve as celestial beacons.',
      fact: 'The Great Pyramid of Giza was the tallest man-made structure for over 3,800 years until Lincoln Cathedral in England was built in 1311 AD!',
      color: '#eab308'
    },
    moon: {
      name: 'Sea of Tranquility',
      year: '1969 CE',
      description: 'Apollo 11 makes history as humans establish a permanent physical presence beyond earth gravity.',
      fact: 'Because there is no wind or water on the Moon to cause erosion, the footprints left by Apollo astronauts will likely remain pristine for millions of years!',
      color: '#38bdf8'
    },
    cyber: {
      name: 'Neo Tokyo Horizon',
      year: '2099 CE',
      description: 'A glowing hyper-dense grid powered by localized thermal fusion, hyperloop transport pipelines, and atmospheric hover cars.',
      fact: 'Future cyber-grids are projected to operate entirely on localized hydrogen micro-reactors, eliminating electrical transmission lines entirely!',
      color: '#ec4899'
    }
  };

  const activeEraDetail = eras[activeEra];

  const chronoRingsRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate time machine core
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 2;
    }

    // Warp sequence spin velocity
    if (chronoRingsRef.current) {
      const speed = warpActive ? 15 : 1;
      chronoRingsRef.current.rotation.y = time * speed;
      chronoRingsRef.current.rotation.x = Math.sin(time) * 0.2;
    }
  });

  const travelToEra = (era: ChronoEra) => {
    if (warpActive) return;
    setWarpActive(true);
    discoverObject('temporal_warp_sequence');

    setTimeout(() => {
      setActiveEra(era);
      discoverObject(`time_machine_travel_${era}`);
      setWarpActive(false);
    }, 1800);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'chrono_stabilizer',
      name: 'Chrono-Stabilizer Core',
      category: 'Quantum Mechanics',
      description: 'A theoretical quantum coordinate controller aligning tachyon pulses with localized gravity coordinates.',
      funFact: 'Einstein’s General Relativity proves that gravity dilates time. If you orbit near a dense black hole, one hour for you could equal several years back on Earth!'
    });
  };

  return (
    <group position={[0, 0, -1]}>
      {/* Time Control HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Chronology Drive</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">⏳ Time Machine</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Temporal Coordinate</span>
            {Object.entries(eras).map(([key, era]) => (
              <button
                key={key}
                disabled={warpActive}
                onClick={() => travelToEra(key as any)}
                style={{ borderColor: activeEra === key ? era.color : 'rgba(255,255,255,0.05)' }}
                className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                  activeEra === key
                    ? 'bg-zinc-900 text-white font-black'
                    : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{era.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-col gap-1 text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            <div>📅 <span className="text-white">Coordinate:</span> {activeEraDetail.year}</div>
            <div className="text-[7.5px] text-cyan-400 font-bold border border-cyan-500/20 rounded p-1.5 bg-cyan-500/5 mt-1">
              STATUS: {warpActive ? 'TACHYON WARPING...' : 'TEMPORALLY LOCKED'}
            </div>
          </div>
        </div>
      </Html>

      {/* Main Quantum Ring Pedestal */}
      <group position={[0, -0.4, 0]} onClick={handleInspect}>
        {/* Core stand */}
        <mesh>
          <cylinderGeometry args={[0.55, 0.6, 0.15, 16]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} />
        </mesh>

        {/* Warp Light Beam during travel */}
        {warpActive && (
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2.4, 16, 1, true]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Central Rotating Time Rings */}
      <group ref={chronoRingsRef} position={[0, 0, 0]}>
        {/* Neon vertical rings */}
        <mesh>
          <torusGeometry args={[0.35, 0.02, 8, 32]} />
          <meshBasicMaterial color={activeEraDetail.color} transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.015, 8, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>

        {/* Temporal glowing crystal core */}
        <mesh ref={coreRef} position={[0, 0.05, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshStandardMaterial 
            color={activeEraDetail.color} 
            emissive={activeEraDetail.color} 
            emissiveIntensity={1.5} 
            roughness={0.1} 
          />
        </mesh>
      </group>

      {/* --- TEMPORAL ERA HOLOGRAPHIC SCENERY (Renders based on selected era) --- */}

      {/* 1. Prehistoric Era Scene */}
      {activeEra === 'jurassic' && !warpActive && (
        <group position={[0, -0.4, -0.6]}>
          {/* Fern mesh columns */}
          <mesh position={[-0.4, 0.2, 0]}>
            <coneGeometry args={[0.08, 0.4, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          <mesh position={[0.4, 0.25, 0.1]}>
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      )}

      {/* 2. Ancient Egypt Scene */}
      {activeEra === 'egypt' && !warpActive && (
        <group position={[0, -0.4, -0.6]}>
          {/* Wireframe pyramid shape */}
          <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.45, 0.6, 4]} />
            <meshStandardMaterial color="#ca8a04" wireframe />
          </mesh>
        </group>
      )}

      {/* 3. Moon Landing Scene */}
      {activeEra === 'moon' && !warpActive && (
        <group position={[0, -0.4, -0.6]}>
          {/* Grey lunar craters base */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.04, 16]} />
            <meshStandardMaterial color="#71717a" roughness={0.9} />
          </mesh>
          {/* Apollo lander boxes */}
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* 4. Future Cyber Scene */}
      {activeEra === 'cyber' && !warpActive && (
        <group position={[0, -0.4, -0.6]}>
          {/* Glowing neon towers */}
          <mesh position={[-0.45, 0.35, 0]}>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.45, 0.45, 0.1]}>
            <boxGeometry args={[0.15, 0.9, 0.15]} />
            <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}
export default TimeMachine;
