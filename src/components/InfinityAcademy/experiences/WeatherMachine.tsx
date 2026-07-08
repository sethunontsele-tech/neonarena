import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

export function WeatherMachine() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [weatherType, setWeatherType] = useState<'rain' | 'snow' | 'tornado' | 'aurora'>('rain');
  const [lightningFlash, setLightningFlash] = useState(false);

  const particlePointsRef = useRef<THREE.Points>(null);
  const tornadoRef = useRef<THREE.Group>(null);

  const particleCount = 200;
  const particleData = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;       // X
      arr[i * 3 + 1] = Math.random() * 4 - 2;       // Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;   // Z
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Particle dynamics (rain falling fast vs snow drifting slowly)
    if (particlePointsRef.current) {
      const geo = particlePointsRef.current.geometry;
      const posAttr = geo.attributes.position;
      const speed = weatherType === 'rain' ? delta * 4 : delta * 0.8;

      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y -= speed;
        // Add subtle wind drift for snow
        if (weatherType === 'snow') {
          let x = posAttr.getX(i);
          x += Math.sin(time + i) * 0.005;
          posAttr.setX(i, x);
        }
        if (y < -2) y = 2; // wrap around
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 2. Spinning Tornado funnel mechanics
    if (tornadoRef.current && weatherType === 'tornado') {
      tornadoRef.current.rotation.y = time * 8;
      tornadoRef.current.position.x = Math.sin(time * 1.2) * 0.15;
    }

    // Trigger occasional lightning flash for rain storms
    if (weatherType === 'rain' && Math.random() < 0.005 && !lightningFlash) {
      setLightningFlash(true);
      discoverObject('weather_lightning_flash');
      setTimeout(() => setLightningFlash(false), 150);
    }
  });

  const selectWeather = (type: typeof weatherType) => {
    setWeatherType(type);
    discoverObject(`weather_machine_${type}`);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'weather_core',
      name: 'Atmospheric Micro-Core',
      category: 'Meteorology & Physics',
      description: 'An advanced weather simulator reproducing thermal precipitation, barometric vortices, and ionospheric ionization (auroras).',
      funFact: 'Tornadoes are measured on the Enhanced Fujita (EF) scale based on damage. Wind velocities inside a rare EF5 tornado can exceed 200 miles per hour!'
    });
  };

  return (
    <group position={[0, 0, -1]}>
      {/* Weather Controls HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Aerosol Science</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🌦️ Weather Machine</h3>

          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Climate Type</span>
            <button
              onClick={() => selectWeather('rain')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                weatherType === 'rain' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>⛈️ Thundery Rain</span>
            </button>
            <button
              onClick={() => selectWeather('snow')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                weatherType === 'snow' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>❄️ Glacial Drift</span>
            </button>
            <button
              onClick={() => selectWeather('tornado')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                weatherType === 'tornado' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>🌪️ Vortex Tornado</span>
            </button>
            <button
              onClick={() => selectWeather('aurora')}
              className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                weatherType === 'aurora' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-black' : 'bg-zinc-900 border-white/5 text-zinc-500'
              }`}
            >
              <span>🌌 Aurora Borealis</span>
            </button>
          </div>
        </div>
      </Html>

      {/* Global lightning flash light */}
      {lightningFlash && <pointLight position={[0, 4, 0]} intensity={8} color="#e0f2fe" />}

      {/* Base Pedestal platform */}
      <mesh position={[0, -0.4, 0]} onClick={handleInspect}>
        <cylinderGeometry args={[0.7, 0.72, 0.15, 16]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.4} />
      </mesh>

      {/* --- CLIMATE RENDERERS --- */}

      {/* 1. Precipitation Particles */}
      {(weatherType === 'rain' || weatherType === 'snow') && (
        <points ref={particlePointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particleData, 3]} />
          </bufferGeometry>
          <pointsMaterial 
            color={weatherType === 'rain' ? '#38bdf8' : '#fafafa'} 
            size={weatherType === 'rain' ? 0.025 : 0.05} 
            transparent 
            opacity={0.6} 
            blending={THREE.AdditiveBlending} 
          />
        </points>
      )}

      {/* 2. Vortex Tornado Funnel */}
      {weatherType === 'tornado' && (
        <group ref={tornadoRef} position={[0, 0.3, 0]}>
          {/* Funnel rendered as multi-layered spinning cones */}
          {Array.from({ length: 12 }, (_, i) => {
            const h = 0.15;
            const y = (i - 6) * h;
            const r = (i + 1) * 0.06;

            return (
              <mesh key={i} position={[0, y, 0]}>
                <cylinderGeometry args={[r, r - 0.05, h, 8, 1, true]} />
                <meshStandardMaterial color="#a1a1aa" transparent opacity={0.3} wireframe />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 3. Celestial Aurora Borealis (Procedural vertical light ribbon sheets) */}
      {weatherType === 'aurora' && (
        <group position={[0, 0.6, 0]}>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[0, 0, -i * 0.3]} rotation={[0, 0, Math.sin(i) * 0.1]}>
              <planeGeometry args={[1.6, 1.2]} />
              <meshBasicMaterial 
                color="#4ade80" 
                transparent 
                opacity={0.12} 
                blending={THREE.AdditiveBlending} 
                side={THREE.DoubleSide} 
                wireframe
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
export default WeatherMachine;
