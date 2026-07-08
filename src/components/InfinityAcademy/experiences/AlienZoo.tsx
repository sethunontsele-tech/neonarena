import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface AlienSpecies {
  name: string;
  origin: string;
  atmosphere: string;
  diet: string;
  fact: string;
  description: string;
  color: string;
}

export function AlienZoo() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const alienDatabase: Record<string, AlienSpecies> = {
    jelly: {
      name: 'Nebula Silk Jelly',
      origin: 'Orion Nebula (Gaseous)',
      atmosphere: 'Highly Pressurized Hydrogen',
      diet: 'Supernova Photons & Solar Dust',
      fact: 'Silk jellies synthesize light directly in their cellular membrane, making them glow with biological neon fluorescence.',
      description: 'A floating, translucent, bioluminescent siphonophore-like entity that drifts on gravity waves in deep stellar nurseries.',
      color: '#d946ef'
    },
    crawler: {
      name: 'Plasma Arachnid',
      origin: 'Proxima Centauri b (Rocky)',
      atmosphere: 'Methane-Rich Nitrogen',
      diet: 'Charged Radioactive Minerals',
      fact: 'Its shell is reinforced with layers of heavy carbon nanotubes, granting it complete immunity to high stellar radiation and vacuums.',
      description: 'A multi-legged crystalline crawling insectoid with glowing energy nodes that discharge micro-arcs of harmless static plasma.',
      color: '#a855f7'
    }
  };

  const [activeAlienKey, setActiveAlienKey] = useState<keyof typeof alienDatabase>('jelly');
  const activeAlien = alienDatabase[activeAlienKey];
  const [habitatTemp, setHabitatTemp] = useState(22);
  const [alienMood, setAlienMood] = useState('Dormant');

  const alienRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // animate creatures based on type
    if (activeAlienKey === 'jelly' && alienRef.current) {
      alienRef.current.position.y = 0.4 + Math.sin(time * 1.5) * 0.15;
      alienRef.current.rotation.y = time * 0.2;
      alienRef.current.rotation.z = Math.sin(time * 0.5) * 0.08;
    } else if (activeAlienKey === 'crawler' && alienRef.current) {
      alienRef.current.position.y = -0.2;
      alienRef.current.rotation.y = time * 0.3;
      if (coreRef.current) {
        coreRef.current.scale.setScalar(1 + Math.sin(time * 5) * 0.05);
      }
    }
  });

  const handleFeed = (foodType: string) => {
    setAlienMood(`Absorbing ${foodType}...`);
    discoverObject(`feed_alien_${foodType}`);
    setTimeout(() => {
      setAlienMood('Active & Radiating');
      setTimeout(() => setAlienMood('Stable'), 2000);
    }, 1500);
  };

  const selectAlien = (key: keyof typeof alienDatabase) => {
    setActiveAlienKey(key);
    setAlienMood('Dormant');
    discoverObject(`alien_zoo_${key}`);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: `alien_${activeAlienKey}`,
      name: activeAlien.name,
      category: 'Exo-Zoology',
      description: activeAlien.description,
      funFact: activeAlien.fact,
    });
  };

  return (
    <group position={[0, 0, -1]}>
      {/* Habitat Control HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-fuchsia-400 uppercase">Exo-Zoology Habitat</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">👽 Alien Zoo</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Subject</span>
            {Object.entries(alienDatabase).map(([key, alien]) => (
              <button
                key={key}
                onClick={() => selectAlien(key as any)}
                style={{ borderColor: activeAlienKey === key ? alien.color : 'rgba(255,255,255,0.05)' }}
                className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                  activeAlienKey === key
                    ? 'bg-zinc-900 text-white font-black'
                    : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{alien.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-col gap-1 text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            <div>🪐 <span className="text-white">Origin:</span> {activeAlien.origin}</div>
            <div>💨 <span className="text-white">Atmosphere:</span> {activeAlien.atmosphere}</div>
            <div>🌡️ <span className="text-white">Temp:</span> {habitatTemp}°C</div>
            <div className="text-[7.5px] text-fuchsia-400 font-bold border border-fuchsia-500/20 rounded p-1.5 bg-fuchsia-500/5 mt-1">
              VITALS: {alienMood}
            </div>
          </div>

          <div className="flex gap-2.5 mt-1">
            <button
              onClick={() => handleFeed('Charged Photons')}
              className="flex-1 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              FEED 🌌
            </button>
            <button
              onClick={() => {
                setHabitatTemp(prev => (prev === 22 ? 80 : prev === 80 ? -40 : 22));
                discoverObject('alien_temp_shifted');
              }}
              className="flex-1 py-1.5 bg-zinc-900 border border-white/10 hover:border-white/30 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              TEMP 🌡️
            </button>
          </div>
        </div>
      </Html>

      {/* Holographic Containment Forcefield Unit */}
      <group position={[0, -0.4, 0]}>
        {/* Base Ring Pod */}
        <mesh>
          <cylinderGeometry args={[0.7, 0.72, 0.15, 32]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.5} />
        </mesh>
        
        {/* Forcefield ring */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.68, 0.68, 1.2, 16, 1, true]} />
          <meshBasicMaterial color={activeAlien.color} transparent opacity={0.08} wireframe side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3D Alien Creature Models */}
      <group ref={alienRef} position={[0, 0.2, 0]} onClick={handleInspect}>
        
        {/* --- CREATURE 1: BIOLUMINESCENT JELLY --- */}
        {activeAlienKey === 'jelly' && (
          <group>
            {/* Main bell dome */}
            <mesh ref={coreRef}>
              <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial 
                color={activeAlien.color} 
                roughness={0.1} 
                transparent 
                opacity={0.85} 
                emissive={activeAlien.color} 
                emissiveIntensity={1.2} 
              />
            </mesh>
            {/* Hanging tentacles */}
            <mesh position={[-0.1, -0.2, 0]}>
              <cylinderGeometry args={[0.01, 0.005, 0.4, 4]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0.1, -0.2, 0]}>
              <cylinderGeometry args={[0.01, 0.005, 0.4, 4]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, -0.25, 0.1]}>
              <cylinderGeometry args={[0.01, 0.005, 0.4, 4]} />
              <meshBasicMaterial color="#d946ef" />
            </mesh>
          </group>
        )}

        {/* --- CREATURE 2: PLASMA ARACHNID --- */}
        {activeAlienKey === 'crawler' && (
          <group>
            {/* Central energy core */}
            <mesh ref={coreRef}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color="#c084fc" 
                emissive="#a855f7" 
                emissiveIntensity={1.5} 
                roughness={0.1} 
              />
            </mesh>
            {/* Crystalline Legs */}
            <mesh position={[-0.18, -0.05, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.015, 0.015, 0.35, 4]} />
              <meshStandardMaterial color="#581c87" roughness={0.1} />
            </mesh>
            <mesh position={[0.18, -0.05, 0]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.015, 0.015, 0.35, 4]} />
              <meshStandardMaterial color="#581c87" roughness={0.1} />
            </mesh>
            <mesh position={[-0.12, -0.05, 0.12]} rotation={[-0.4, 0, -0.6]}>
              <cylinderGeometry args={[0.015, 0.015, 0.35, 4]} />
              <meshStandardMaterial color="#581c87" roughness={0.1} />
            </mesh>
            <mesh position={[0.12, -0.05, 0.12]} rotation={[-0.4, 0, 0.6]}>
              <cylinderGeometry args={[0.015, 0.015, 0.35, 4]} />
              <meshStandardMaterial color="#581c87" roughness={0.1} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
export default AlienZoo;
