import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

interface GravityPlanet {
  name: string;
  gravity: number; // m/s^2
  color: string;
}

export function PhysicsLabs() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const planetsList: GravityPlanet[] = [
    { name: 'Earth', gravity: 9.81, color: '#3b82f6' },
    { name: 'Moon', gravity: 1.62, color: '#9ca3af' },
    { name: 'Jupiter', gravity: 24.79, color: '#f59e0b' }
  ];

  const [activePlanetIdx, setActivePlanetIdx] = useState(0);
  const [vacuumActive, setVacuumActive] = useState(true);
  const [isFalling, setIsFalling] = useState(false);

  // Vertical position trackers
  const [ballY, setBallY] = useState(3.5);
  const [featherY, setFeatherY] = useState(3.5);

  const ballVelocity = useRef(0);
  const featherVelocity = useRef(0);
  const startY = 3.5;

  const currentPlanet = planetsList[activePlanetIdx];

  const physicsFacts = {
    id: 'gravity_simulation',
    name: 'Galileo Gravity Chamber',
    category: 'Kinetic Physics',
    description: `A state-of-the-art gravity drop simulator showing falling bodies. Active gravity: ${currentPlanet.gravity} m/s² (${currentPlanet.name}). Currently in a ${vacuumActive ? 'Vacuum Chamber' : 'Normal Atmosphere'}.`,
    funFact: 'In 1971, Apollo 15 Astronaut David Scott dropped a hammer and a feather on the Moon. In the moon\'s vacuum environment, they hit the surface at the exact same moment, proving Galileo\'s theory!'
  };

  const handleReset = () => {
    setBallY(startY);
    setFeatherY(startY);
    ballVelocity.current = 0;
    featherVelocity.current = 0;
    setIsFalling(false);
  };

  const handleDrop = () => {
    handleReset();
    setIsFalling(true);
    discoverObject('gravity_simulation');
  };

  useFrame((state, delta) => {
    // Cap delta to prevent crazy physics jumps
    const dt = Math.min(delta, 0.05);

    if (isFalling) {
      const g = currentPlanet.gravity;

      // Ball physics (always minimal drag due to density)
      const ballDrag = 0.05; 
      const ballAcc = g - (ballVelocity.current * ballDrag);
      ballVelocity.current += ballAcc * dt;
      const nextBallY = Math.max(0.1, ballY - ballVelocity.current * dt);
      setBallY(nextBallY);

      // Feather physics (heavily affected by air drag unless in vacuum)
      const featherDrag = vacuumActive ? 0.05 : 3.8; 
      const featherAcc = g - (featherVelocity.current * featherDrag);
      featherVelocity.current += featherAcc * dt;
      const nextFeatherY = Math.max(0.05, featherY - featherVelocity.current * dt);
      setFeatherY(nextFeatherY);

      // Stop once both hit floor
      if (nextBallY <= 0.11 && nextFeatherY <= 0.06) {
        setIsFalling(false);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Physics laboratory lights */}
      <pointLight position={[-6, 12, -4]} intensity={1.5} color="#c084fc" />
      <pointLight position={[6, 12, 4]} intensity={1.5} color="#a855f7" />

      {/* Physics lab platform grid */}
      <gridHelper args={[10, 10, '#a855f7', '#3b0764']} position={[0, 0.01, 0]} />

      {/* --- Chamber structure --- */}
      <group position={[0, 0, -1.5]}>
        {/* Support columns of the drop tower */}
        <mesh position={[-1.2, 1.8, 0]}>
          <boxGeometry args={[0.08, 3.8, 0.08]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.4} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]}>
          <boxGeometry args={[0.08, 3.8, 0.08]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[2.5, 0.1, 0.3]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>

        {/* Drop Chamber Vacuum Tube (Transparent cylinder) */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 3.6, 16, 1, true]} />
          <meshStandardMaterial 
            color="#a855f7" 
            transparent 
            opacity={0.08} 
            side={THREE.DoubleSide} 
          />
        </mesh>

        {/* Ball (Left side) */}
        <mesh position={[-0.45, ballY, 0]} onClick={() => setSelectedObject(physicsFacts)}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.1} metalness={0.9} />
          <Html distanceFactor={8} position={[0, 0.3, 0]} center>
            <span className="text-[7px] font-black text-zinc-300 uppercase bg-black/60 px-1 py-0.5 rounded">Bowling Ball</span>
          </Html>
        </mesh>

        {/* Feather (Right side - represented as flat shape or cylinder) */}
        <mesh position={[0.45, featherY, 0]} onClick={() => setSelectedObject(physicsFacts)}>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.2} />
          <Html distanceFactor={8} position={[0, 0.3, 0]} center>
            <span className="text-[7px] font-black text-pink-300 uppercase bg-black/60 px-1 py-0.5 rounded">Feather</span>
          </Html>
        </mesh>

        {/* Height tick marks labels on column */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Html key={i} position={[-1.3, i + 0.5, 0]} center distanceFactor={8}>
            <span className="text-[8px] font-mono font-bold text-zinc-600">{i}m</span>
          </Html>
        ))}

        {/* Landing plates */}
        <mesh position={[-0.45, 0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.28, 0.05, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.45, 0.05, 0]}>
          <cylinderGeometry args={[0.25, 0.28, 0.05, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {/* Interactive Controls UI */}
        <Html position={[0, 2, 2.5]} center distanceFactor={10}>
          <div className="bg-zinc-950/90 border border-purple-500/30 p-5 rounded-3xl w-60 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
            <div className="border-b border-white/10 pb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Gravity Lab Accelerator</h4>
              <p className="text-[8px] font-bold text-purple-400 uppercase">Test acceleration dynamics</p>
            </div>

            {/* Planet selections */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black text-zinc-500 uppercase">Select Celestial Gravity</span>
              <div className="grid grid-cols-3 gap-1.5">
                {planetsList.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setActivePlanetIdx(idx);
                      handleReset();
                    }}
                    className={`px-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                      activePlanetIdx === idx
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="text-[8px] font-mono font-bold text-zinc-400 text-center uppercase">
                g = <span className="text-purple-300">{currentPlanet.gravity.toFixed(2)} m/s²</span>
              </div>
            </div>

            {/* Atmosphere slider button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black text-zinc-500 uppercase">Atmosphere Settings</span>
              <button
                onClick={() => {
                  setVacuumActive(!vacuumActive);
                  handleReset();
                }}
                className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  vacuumActive
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
                    : 'bg-red-500/15 border-red-400/40 text-red-400'
                }`}
              >
                {vacuumActive ? '💨 Vacuum Chamber Active' : '🍂 Normal Atmosphere (Air Drag)'}
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={handleDrop}
                disabled={isFalling}
                className="bg-purple-500 hover:bg-white text-black font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition-all disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                DROP TEST
              </button>
              <button
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
