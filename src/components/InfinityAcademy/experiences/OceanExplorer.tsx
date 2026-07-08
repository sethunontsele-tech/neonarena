import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

export function OceanExplorer() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [depthZone, setDepthZone] = useState<'photic' | 'twilight' | 'abyssal'>('photic');
  const [sonarActive, setSonarActive] = useState(false);

  const whaleRef = useRef<THREE.Group>(null);
  const sharkRef = useRef<THREE.Group>(null);
  const bubblePointsRef = useRef<THREE.Points>(null);

  // Generate bubble particles
  const bubbleCount = 150;
  const bubbleData = useMemo(() => {
    const arr = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 5;      // X
      arr[i * 3 + 1] = Math.random() * 4 - 2;      // Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;  // Z
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Whale gentle swim path (sinusoidal banking and translation)
    if (whaleRef.current) {
      whaleRef.current.position.x = Math.sin(time * 0.15) * 2.2;
      whaleRef.current.position.z = Math.cos(time * 0.15) * 1.5 - 1;
      whaleRef.current.position.y = 0.5 + Math.sin(time * 0.3) * 0.25;
      whaleRef.current.rotation.y = time * 0.15 + Math.PI / 2;
      whaleRef.current.rotation.z = Math.sin(time * 0.3) * 0.12; // body roll
    }

    // Shark faster circling path
    if (sharkRef.current) {
      sharkRef.current.position.x = Math.cos(time * 0.4) * 1.8;
      sharkRef.current.position.z = Math.sin(time * 0.4) * 1.8 - 1.2;
      sharkRef.current.position.y = -0.3 + Math.sin(time * 0.8) * 0.1;
      sharkRef.current.rotation.y = -time * 0.4;
    }

    // Bubbles floating upwards
    if (bubblePointsRef.current) {
      const geo = bubblePointsRef.current.geometry;
      const posAttr = geo.attributes.position;
      for (let i = 0; i < bubbleCount; i++) {
        let y = posAttr.getY(i);
        y += delta * 0.6; // rise speed
        if (y > 2.5) y = -2.5; // wrap around
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  const triggerSonar = () => {
    if (sonarActive) return;
    setSonarActive(true);
    discoverObject('ocean_sonar_pulse');
    setTimeout(() => setSonarActive(false), 2000);
  };

  const selectZone = (zone: typeof depthZone) => {
    setDepthZone(zone);
    discoverObject(`ocean_zone_${zone}`);
  };

  const handleInspect = (item: string, desc: string, fact: string) => {
    setSelectedObject({
      id: `ocean_${item.toLowerCase()}`,
      name: item,
      category: 'Marine Biology & Oceanography',
      description: desc,
      funFact: fact,
    });
  };

  // Dynamic light color based on depth
  const lightColor = depthZone === 'photic' ? '#38bdf8' : depthZone === 'twilight' ? '#1d4ed8' : '#030712';
  const ambientIntensity = depthZone === 'photic' ? 0.9 : depthZone === 'twilight' ? 0.25 : 0.03;

  return (
    <group position={[0, 0.4, 0]}>
      {/* Ocean Depth HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">AQUATIC EXPEDITION</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🦈 Ocean Explorer</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Depth Zone</span>
            <button
              onClick={() => selectZone('photic')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                depthZone === 'photic' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>Photic Zone (0-200m)</span>
            </button>
            <button
              onClick={() => selectZone('twilight')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                depthZone === 'twilight' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>Twilight (200-1000m)</span>
            </button>
            <button
              onClick={() => selectZone('abyssal')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                depthZone === 'abyssal' ? 'bg-indigo-950/30 border-purple-900/40 text-purple-400' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>Abyssal (1000m+)</span>
            </button>
          </div>

          <button
            onClick={triggerSonar}
            className={`mt-1.5 w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${
              sonarActive 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-ping' 
                : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500/30 text-black'
            }`}
          >
            {sonarActive ? 'PULSING SONAR...' : 'TRIGGER SONAR 🔊'}
          </button>
        </div>
      </Html>

      {/* Volumetric Ocean Environment */}
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <pointLight position={[0, 4, 0]} intensity={depthZone === 'photic' ? 2 : 0.2} color="#38bdf8" />

      {/* Holographic Sonar Pulse visual ring */}
      {sonarActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[0.1, 2.5, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {/* Floating Bubbles Points System */}
      <points ref={bubblePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bubbleData, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#38bdf8" size={0.04} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </points>

      {/* --- MARINE FAUNA 1: WHALE MODEL (GROUPED BOXES/CYLINDERS) --- */}
      <group 
        ref={whaleRef} 
        onClick={() => handleInspect(
          'Blue Whale (Balaenoptera musculus)',
          'The largest animal ever known to have lived on Earth. These filter-feeders capture vast quantities of krill in their baleen plates, singing underwater songs that travel across entire ocean basins.',
          'A blue whale’s tongue can weigh as much as an entire elephant, and its heart is the size of a small car!'
        )}
      >
        {/* Main Body */}
        <mesh>
          <boxGeometry args={[0.3, 0.26, 1.1]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        {/* Head tapered */}
        <mesh position={[0, -0.02, -0.6]}>
          <boxGeometry args={[0.26, 0.2, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0.05, 0.65]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Left flipper */}
        <mesh position={[-0.22, -0.08, -0.1]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.18, 0.02, 0.15]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Right flipper */}
        <mesh position={[0.22, -0.08, -0.1]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.18, 0.02, 0.15]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* --- MARINE FAUNA 2: SHARK MODEL --- */}
      <group 
        ref={sharkRef}
        onClick={() => handleInspect(
          'Apex Reef Shark (Carcharhinus)',
          'Top-tier marine predators equipped with acute electro-receptive jelly pits (Ampullae of Lorenzini) that detect micro-volts of struggling prey.',
          'Sharks have been patrolling earth’s oceans for over 400 million years—making them older than dinosaurs and even trees!'
        )}
      >
        {/* Sleek torpedo body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.65, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.2} />
        </mesh>
        {/* Dorsal fin (Sharp) */}
        <mesh position={[0, 0.12, -0.05]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.02, 0.12, 0.08]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Caudal fin (tail swing) */}
        <mesh position={[0, 0, 0.38]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Coral Reef Base */}
      <group 
        position={[0, -0.55, -0.8]}
        onClick={() => handleInspect(
          'Reef Coral & Anemone Colonies',
          'Biologically active calcium-carbonate deposits engineered by tiny marine invertebrates. Coral reefs support over 25% of all oceanic life while covering less than 0.1% of the seafloor.',
          'Coral reefs act as natural breakwaters, absorbing up to 97% of wave energy and preventing coastal flooding!'
        )}
      >
        {/* Ground plateau */}
        <mesh>
          <cylinderGeometry args={[1.2, 1.3, 0.12, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Coral stalks */}
        <mesh position={[-0.4, 0.15, -0.1]}>
          <boxGeometry args={[0.1, 0.25, 0.1]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.9} />
        </mesh>
        <mesh position={[0.3, 0.22, 0.2]}>
          <cylinderGeometry args={[0.06, 0.08, 0.38, 8]} />
          <meshStandardMaterial color="#e11d48" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.12, -0.3]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ec4899" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
export default OceanExplorer;
