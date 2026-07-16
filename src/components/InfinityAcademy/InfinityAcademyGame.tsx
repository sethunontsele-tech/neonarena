import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Bot, Dna, Compass, ArrowRight, ShieldAlert, Zap, Globe, Layers } from 'lucide-react';
import { AcademyHub } from './AcademyHub';
import { EduOverlay } from './EduOverlay';
import { AURAChatPanel } from './AURA';
import { useEduStore } from './eduStore';
import { MixedRealityCameras } from '../MixedRealityCameras';
import { VREducationCreatorStudio } from './VREducationCreatorStudio';

export function InfinityAcademyGame({ onBackToLobby }: { onBackToLobby?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const activeDimension = useEduStore(state => state.activeDimension);
  const showMRCameras = useEduStore(state => state.showMRCameras);
  const setMRCamerasActive = useEduStore(state => state.setMRCamerasActive);
  const showCreatorStudio = useEduStore(state => state.showCreatorStudio);
  const setCreatorStudioActive = useEduStore(state => state.setCreatorStudioActive);

  const loadingSequence = [
    "Locating primary Academy coordination grid...",
    "Replicating quantum cell mechanics in Biology Kingdom...",
    "Synthesizing algebraic vector structures inside Mathematical Mountains...",
    "Synchronizing with A.U.R.A neural tutoring array...",
    "Calibrating Quest style motion controller sensors...",
    "Metaverse dimensions stable. Booting visor..."
  ];

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSequence.length - 1) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none font-sans overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d405_1px,transparent_1px),linear-gradient(to_bottom,#06b6d405_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        {/* Glowing orb behind load logo */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <div className="relative flex flex-col items-center max-w-md">
          {/* Futuristic load emblem */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-cyan-500/5 border border-cyan-400/40 rounded-3xl flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
              <Layers className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">HOLOGRAPHIC INITIALIZATION</span>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase italic mt-2.5 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            INFINITY ACADEMY
          </h1>
          <span className="text-[9px] font-bold text-fuchsia-400 tracking-[0.35em] uppercase mt-1">Virtual Reality Universe</span>

          {/* Load indicator */}
          <div className="w-64 bg-white/5 h-1 border border-white/5 rounded-full overflow-hidden mt-12 relative">
            <div 
              className="bg-cyan-400 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${((loadingStep + 1) / loadingSequence.length) * 100}%` }}
            />
          </div>

          {/* Load text */}
          <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-4 h-6 animate-pulse">
            {loadingSequence[loadingStep]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black font-sans select-none overflow-hidden flex">
      {/* 1. Main 3D Interactive WebXR/Three.js viewport */}
      <div className="relative flex-1 h-full">
        <Canvas 
          shadows={false}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ fov: 60 }}
          onCreated={({ scene }) => {
            scene.background = new THREE.Color('#030712'); // Dark cosmic gray-blue
          }}
        >
          {/* Subtle global ambient light */}
          <ambientLight intensity={0.4} />
          
          {/* Primary directional sun to cast organic shades */}
          <directionalLight position={[5, 12, 4]} intensity={1.5} color="#e0f2fe" />
          
          {/* Academy Portal Hub & Connected Dimension */}
          <AcademyHub />
        </Canvas>

        {/* Quest-style Vision Visor HUD Overlay */}
        <EduOverlay />
      </div>

      {/* 2. Right Side Companion Sidebar: Handles A.U.R.A Chat and Legacy navigation */}
      <div className="w-96 bg-zinc-950 border-l border-white/10 p-5 flex flex-col justify-between items-center relative backdrop-blur-3xl shrink-0">
        {/* Subtle cyber background line patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_90%,#ffffff02_95%)] bg-[size:100%_4px]" />

        {/* Sidebar Header */}
        <div className="w-full relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '40s' }} />
              </div>
              <div>
                <h2 className="text-xs font-black text-white uppercase italic tracking-wider">INFINITY ACADEMY VR</h2>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">3D METAVERSE EDUCATION</span>
              </div>
            </div>
            {onBackToLobby && (
              <button 
                onClick={onBackToLobby}
                className="px-2.5 py-1.5 bg-zinc-900 border border-white/10 hover:border-cyan-500/40 text-[8px] font-black text-zinc-400 hover:text-white uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Exit Academy
              </button>
            )}
          </div>
          <div className="mt-4 p-3.5 bg-cyan-950/10 border border-cyan-500/20 rounded-2xl">
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Bot className="w-3.5 h-3.5" />
              Active Lesson Guide
            </span>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold uppercase">
              {activeDimension === 'hub' 
                ? "Welcome to the Lobby! Approach any gateway portal to explore specialized sciences."
                : activeDimension === 'biology'
                ? "Locate and scan the Mitochondria organelle, inspect the DNA spiral nucleotides, or heart blood paths."
                : "Explore mathematical vector cubes or chemical bonds."
              }
            </p>
          </div>
        </div>

        {/* AI Teacher Dialogue Center */}
        <div className="w-full my-4 relative z-10">
          <AURAChatPanel />
        </div>

        {/* Footer info */}
        <div className="w-full relative z-10 text-center text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] pt-4 border-t border-white/5">
          Virtual Classroom Portal Engine © 2026
        </div>
      </div>
      {showMRCameras && (
        <MixedRealityCameras onClose={() => setMRCamerasActive(false)} />
      )}
      {showCreatorStudio && (
        <VREducationCreatorStudio onClose={() => setCreatorStudioActive(false)} />
      )}
    </div>
  );
}
export default InfinityAcademyGame;
