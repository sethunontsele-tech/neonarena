import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

export function CodingIsland() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [activeLoopCount, setActiveLoopCount] = useState(3);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const botRef = useRef<THREE.Group>(null);
  const lastStepTime = useRef(0);

  const codingFacts = {
    id: 'compiler_loop',
    name: 'Algorithmic Loop Engine',
    category: 'Computer Science',
    description: `A loop is a programming structure that repeats a block of code a specified number of times until a condition is met. Currently compiled: 'for (let i = 0; i < ${activeLoopCount}; i++) { moveBot() }'. Current Loop Index: ${currentStep}.`,
    funFact: 'The first computer program ever written was for a mechanical computer (the Analytical Engine) in 1843 by Ada Lovelace. It was an algorithm to calculate Bernoulli numbers, containing nested loop instructions!'
  };

  const handleRunCode = () => {
    setRunning(true);
    setCurrentStep(0);
    lastStepTime.current = 0;
    discoverObject('compiler_loop');
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate bot's scanning visors
    if (botRef.current) {
      // Bob up and down
      botRef.current.position.y = Math.sin(time * 3) * 0.12 + 1.2;
      
      // If running, rotate bot step-by-step
      if (running) {
        if (lastStepTime.current === 0) {
          lastStepTime.current = time;
        }

        const elapsedSinceStep = time - lastStepTime.current;
        if (elapsedSinceStep > 1.2) {
          // Progress to next step of the loop
          if (currentStep < activeLoopCount - 1) {
            setCurrentStep(prev => prev + 1);
            lastStepTime.current = time;
          } else {
            // Loop completed!
            setRunning(false);
            setCurrentStep(activeLoopCount);
          }
        }

        // Spin bot during run to indicate processing
        botRef.current.rotation.y = time * 8;
      } else {
        botRef.current.rotation.y = time * 0.5;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Coding Island lights */}
      <pointLight position={[-10, 10, -5]} intensity={1.5} color="#6366f1" />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#818cf8" />

      {/* Floor Grid */}
      <gridHelper args={[12, 12, '#6366f1', '#1e1b4b']} position={[0, 0.01, 0]} />

      {/* --- 3D MINI ROBOT "BYTE" --- */}
      <group position={[0, 1.2, -1.5]} ref={botRef} onClick={() => setSelectedObject(codingFacts)}>
        {/* Robot head/body */}
        <mesh>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#6366f1" roughness={0.1} metalness={0.7} />
        </mesh>

        {/* Visor shield */}
        <mesh position={[0, 0.08, 0.32]}>
          <boxGeometry args={[0.55, 0.15, 0.15]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.0} />
        </mesh>

        {/* Glowing cyber scanning visor laser line */}
        <mesh position={[0, 0.08, 0.4]}>
          <boxGeometry args={[0.45, 0.03, 0.03]} />
          <meshBasicMaterial color={running ? '#ef4444' : '#22d3ee'} />
        </mesh>

        {/* Floating companion label */}
        <Html distanceFactor={8} position={[0, 0.8, 0]} center>
          <div className="bg-zinc-950/95 border border-indigo-500/40 px-3 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-wider text-indigo-300 whitespace-nowrap shadow-2xl flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${running ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            🤖 BYTEBOT {running ? '[Loop Executing]' : '[Standby Ready]'}
          </div>
        </Html>
      </group>

      {/* Visual representation of loop steps (floating steps rings on floor) */}
      <group position={[0, 0.02, -1.5]}>
        {Array.from({ length: activeLoopCount }).map((_, i) => {
          const isActive = running && currentStep === i;
          return (
            <mesh key={i} position={[(i - (activeLoopCount - 1) / 2) * 1.0, 0, 0]}>
              <ringGeometry args={[0.3, 0.35, 32]} />
              <meshBasicMaterial 
                color={isActive ? '#ef4444' : '#6366f1'} 
                transparent 
                opacity={isActive ? 0.8 : 0.25} 
              />
              <Html distanceFactor={8} position={[0, 0.1, 0]} center>
                <span className={`text-[7px] font-black font-mono px-1 py-0.5 rounded ${isActive ? 'bg-red-500 text-white' : 'bg-zinc-900 text-indigo-400'}`}>
                  i={i}
                </span>
              </Html>
            </mesh>
          );
        })}
      </group>

      {/* Coding compiler console UI */}
      <Html position={[1.5, 1.8, 1.2]} center distanceFactor={10}>
        <div className="bg-zinc-950/90 border border-indigo-500/30 p-5 rounded-3xl w-64 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Compiler Console</h4>
            <p className="text-[8px] font-bold text-indigo-400 uppercase">Loop logic compiler matrix</p>
          </div>

          {/* Code Viewer Screen */}
          <div className="bg-black/80 border border-white/10 p-3 rounded-2xl font-mono text-[9px] text-indigo-300 leading-normal flex flex-col gap-1">
            <div><span className="text-pink-400">let</span> count = <span className="text-amber-300 font-bold">{activeLoopCount}</span>;</div>
            <div className="text-zinc-500">// Standard loop syntax</div>
            <div><span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-amber-300">0</span>; i &lt; count; i++) &#123;</div>
            <div className="pl-3.5 text-cyan-400">ByteBot.moveStep(i);</div>
            <div>&#125;</div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-zinc-500 uppercase">Adjust Iteration Count</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[3, 5, 8].map((num) => (
                <button
                  key={num}
                  disabled={running}
                  onClick={() => {
                    setActiveLoopCount(num);
                    setCurrentStep(0);
                  }}
                  className={`px-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                    activeLoopCount === num
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/10 disabled:opacity-40'
                  }`}
                >
                  {num} Loops
                </button>
              ))}
            </div>
          </div>

          {/* Progress or status lines */}
          <div className="flex justify-between items-center text-[8px] font-black uppercase bg-black/40 px-3 py-2 rounded-xl">
            <span className="text-zinc-500">Loop Status</span>
            <span className={running ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>
              {running ? `Executing step ${currentStep}/${activeLoopCount}...` : 'Ready to compile'}
            </span>
          </div>

          <button
            onClick={handleRunCode}
            disabled={running}
            className="w-full bg-indigo-500 hover:bg-white text-black font-black text-[9px] uppercase tracking-widest py-2.5 rounded-xl transition-all disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.25)]"
          >
            🚀 RUN COMPILER CODE
          </button>
        </div>
      </Html>
    </group>
  );
}
