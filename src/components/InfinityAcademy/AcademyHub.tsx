import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore, ActiveDimensionType } from './eduStore';
import { BiologyKingdom } from './BiologyKingdom';
import { MathMountains } from './MathMountains';
import { PhysicsLabs } from './PhysicsLabs';
import { ChemistryCenter } from './ChemistryCenter';
import { HistoryPortals } from './HistoryPortals';
import { GeographyPlanet } from './GeographyPlanet';
import { CodingIsland } from './CodingIsland';
import { LanguageCity } from './LanguageCity';
import { ArtsDistrict } from './ArtsDistrict';
import { AURA3DModel } from './AURA';
import { Html } from '@react-three/drei';

// Import newly created immersive experiences
import { AnatomyExplorer } from './experiences/AnatomyExplorer';
import { PianoTeacher } from './experiences/PianoTeacher';
import { DinosaurSafari } from './experiences/DinosaurSafari';
import { OceanExplorer } from './experiences/OceanExplorer';
import { SpaceshipBridge } from './experiences/SpaceshipBridge';
import { AlienZoo } from './experiences/AlienZoo';
import { TinyCityBuilder } from './experiences/TinyCityBuilder';
import { CastleDefense } from './experiences/CastleDefense';
import { PaintingStudio } from './experiences/PaintingStudio';
import { MicroscopeWorld } from './experiences/MicroscopeWorld';
import { WeatherMachine } from './experiences/WeatherMachine';
import { TimeMachine } from './experiences/TimeMachine';

export function AcademyHub() {
  const activeDimension = useEduStore(state => state.activeDimension);
  const setDimension = useEduStore(state => state.setDimension);
  const unlockedDimensions = useEduStore(state => state.unlockedDimensions);
  const setSelectedObject = useEduStore(state => state.setSelectedObject);

  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 1.8, 6.5));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.2, 0));

  const portalHubRef = useRef<THREE.Group>(null);
  const [hoveredPortal, setHoveredPortal] = useState<string | null>(null);

  // Position cameras based on active dimension to simulate deep flight transitions
  useEffect(() => {
    if (activeDimension === 'hub') {
      targetCamPos.current.set(0, 2, 7.5);
      targetCamLook.current.set(0, 1.2, 0);
    } else if (activeDimension === 'biology') {
      targetCamPos.current.set(0, 1.5, 4.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'math') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'physics') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'chemistry') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'history') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'geography') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'space') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'coding') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'language') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else if (activeDimension === 'arts') {
      targetCamPos.current.set(0, 1.5, 3.5);
      targetCamLook.current.set(0, 1, -2);
    } else {
      targetCamPos.current.set(0, 2.5, 6);
      targetCamLook.current.set(0, 1.5, -2);
    }
  }, [activeDimension]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Smoothly interpolate (LERP) camera position and orientation
    camera.position.lerp(targetCamPos.current, 0.08);
    
    // We can calculate lookAt target
    const currentLook = new THREE.Vector3(0, 1, 0);
    currentLook.lerp(targetCamLook.current, 0.08);
    camera.lookAt(currentLook);

    // Slowly rotate portals hub
    if (portalHubRef.current && activeDimension === 'hub') {
      portalHubRef.current.rotation.y = Math.sin(time * 0.1) * 0.15;
    }
  });

  const portalsList: Array<{ id: ActiveDimensionType; name: string; color: string; position: [number, number, number]; desc: string }> = [
    { id: 'biology', name: 'Biology Kingdom', color: '#ec4899', position: [-4.2, 1.2, -1.5], desc: 'Shrink into cell matrices and explore human physiology.' },
    { id: 'math', name: 'Mathematical Mountains', color: '#f59e0b', position: [-3.5, 1.2, -3.0], desc: 'Solve three-dimensional geometry, logic & algebraic structures.' },
    { id: 'physics', name: 'Physics Labs', color: '#a855f7', position: [-2.0, 1.2, -4.0], desc: 'Experiment with gravitational acceleration, mass drops, and levers.' },
    { id: 'chemistry', name: 'Chemistry Center', color: '#10b981', position: [0.0, 1.2, -4.5], desc: 'Synthesize elements and study safe atomic bonding.' },
    { id: 'history', name: 'History Time Portals', color: '#e11d48', position: [2.0, 1.2, -4.0], desc: 'Unravel civilizations of Ancient Egypt and historic milestones.' },
    { id: 'geography', name: 'Geography Planet', color: '#06b6d4', position: [3.5, 1.2, -3.0], desc: 'Examine tectonic shifts, climates, and oceanic topography.' },
    { id: 'space', name: 'Space Dimension', color: '#3b82f6', position: [4.2, 1.2, -1.5], desc: 'Orbits, stellar nurseries, and astronaut navigation.' },
    { id: 'coding', name: 'Coding Island', color: '#6366f1', position: [-3.0, 1.2, 1.5], desc: 'Program mini-robots and study computational logic trees.' },
    { id: 'language', name: 'Language City', color: '#14b8a6', position: [0.0, 1.2, 2.5], desc: 'Master global phonetic ciphers and translational matrices.' },
    { id: 'arts', name: 'Creative Arts District', color: '#f43f5e', position: [3.0, 1.2, 1.5], desc: 'Experiment with light spectrum colors and volumetric sculptures.' },
  ];

  return (
    <group>
      {/* 1. Global space particles background */}
      <SpaceParticles />

      {/* 2. Floating AI teacher model */}
      <AURA3DModel />

      {/* 3. Base Glowing Holographic Grid Floor */}
      <gridHelper args={[30, 30, '#111827', '#1e293b']} position={[0, -0.01, 0]} />
      
      {/* Holographic glowing guide concentric rings on the lobby floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.55, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3, 3.05, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} />
      </mesh>

      {/* Primary lobby pedestal platform */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2, 2.1, 0.2, 32]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* --- HUB / PORTAL ROOM ACTIVE --- */}
      {activeDimension === 'hub' && (
        <group ref={portalHubRef}>
          {/* Main lobby header floating console */}
          <Html position={[0, 4, -4.5]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">DIMENSIONAL GATEWAYS ONLINE</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                INFINITY PORTALS
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 bg-zinc-950/80 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur">
                Approach and activate any gateway node to begin
              </p>
            </div>
          </Html>

          {/* Interactive Portals */}
          {portalsList.map((portal) => {
            const isHovered = hoveredPortal === portal.id;
            const isUnlocked = unlockedDimensions.includes(portal.id);

            return (
              <group 
                key={portal.id} 
                position={portal.position}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnlocked) {
                    setDimension(portal.id);
                  }
                }}
                onPointerOver={() => setHoveredPortal(portal.id)}
                onPointerOut={() => setHoveredPortal(null)}
              >
                {/* Visual Portal Gateway Arch (Torus) */}
                <mesh rotation={[0, Math.atan2(portal.position[0], -portal.position[2] + 4.5), 0]}>
                  <torusGeometry args={[0.95, 0.06, 16, 64]} />
                  <meshStandardMaterial 
                    color={portal.color} 
                    emissive={portal.color}
                    emissiveIntensity={isHovered ? 2.2 : 0.8}
                    roughness={0.1}
                    metalness={0.9}
                  />
                </mesh>

                {/* Spinning portal center event horizon vortex */}
                <mesh 
                  rotation={[0, Math.atan2(portal.position[0], -portal.position[2] + 4.5), 0]}
                  position={[0, 0, -0.01]}
                >
                  <circleGeometry args={[0.9, 32]} />
                  <meshBasicMaterial 
                    color={portal.color}
                    transparent
                    opacity={isHovered ? 0.45 : 0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Pedestal platform of the portal */}
                <mesh position={[0, -1.1, 0]}>
                  <cylinderGeometry args={[0.45, 0.5, 0.15, 16]} />
                  <meshStandardMaterial color="#18181b" roughness={0.4} />
                </mesh>

                {/* Floating portal tags */}
                <Html distanceFactor={8} position={[0, 1.4, 0]} center>
                  <div className={`flex flex-col items-center text-center transition-all duration-300 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}>
                    <span 
                      style={{ color: portal.color, textShadow: `0 0 10px ${portal.color}80` }}
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      GATEWAY {isUnlocked ? 'READY' : 'ENCRYPTED'}
                    </span>
                    <button 
                      style={{ border: `1px solid ${portal.color}40`, backgroundColor: 'rgba(9, 9, 11, 0.9)' }}
                      className="mt-1.5 px-4 py-2 rounded-2xl text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {portal.name}
                    </button>
                    {isHovered && (
                      <div className="w-48 bg-zinc-950/95 border border-white/10 p-2.5 rounded-2xl mt-2 text-[9px] font-medium text-zinc-400 leading-normal uppercase shadow-2xl">
                        {portal.desc}
                      </div>
                    )}
                  </div>
                </Html>
              </group>
            );
          })}
        </group>
      )}

      {/* --- CONNECTED DIMENSION: BIOLOGY KINGDOM SCENE --- */}
      {activeDimension === 'biology' && (
        <group>
          {/* Main header showing active biome */}
          <Html position={[0, 5, -5]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-pink-400 uppercase animate-pulse">BIOME ACTIVE - 100,000X MAGNIFICATION</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                BIOLOGY KINGDOM
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 bg-zinc-950/80 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur">
                Click on any microscopic structure to run biological scanning
              </p>
            </div>
          </Html>

          {/* Render the core biology meshes */}
          <BiologyKingdom />

          {/* Quick return teleport pedestal */}
          <group 
            position={[0, 0, 1]}
            onClick={(e) => {
              e.stopPropagation();
              setDimension('hub');
            }}
          >
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.8, 0.85, 0.1, 32]} />
              <meshStandardMaterial color="#18181b" roughness={0.4} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[0.7, 0.75, 32]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
            </mesh>
            <Html distanceFactor={6} position={[0, 0.8, 0]} center>
              <button className="bg-zinc-950/95 border border-cyan-400/40 hover:border-cyan-400 px-4 py-2 rounded-2xl text-[9px] font-black text-cyan-400 hover:text-white uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xl whitespace-nowrap">
                ↩ Teleport to Hub Lobby
              </button>
            </Html>
          </group>
        </group>
      )}

      {/* --- CONNECTED DIMENSION: MATHEMATICAL MOUNTAINS --- */}
      {activeDimension === 'math' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-400 uppercase animate-pulse">ALGEBRAIC VECTORS LAB</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                MATHEMATICAL MOUNTAINS
              </h1>
            </div>
          </Html>
          <MathMountains />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: PHYSICS LABORATORIES --- */}
      {activeDimension === 'physics' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-purple-400 uppercase animate-pulse">GRAVITY drop chamber</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                PHYSICS LABORATORIES
              </h1>
            </div>
          </Html>
          <PhysicsLabs />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: CHEMISTRY RESEARCH CENTER --- */}
      {activeDimension === 'chemistry' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase animate-pulse">SYNTHESIZER ENGAGED</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(16,182,129,0.3)]">
                CHEMISTRY CENTER
              </h1>
            </div>
          </Html>
          <ChemistryCenter />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: HISTORY TIME PORTALS --- */}
      {activeDimension === 'history' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase animate-pulse">EGYPTIAN ROSETTA CIPHER</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                HISTORY TIME PORTALS
              </h1>
            </div>
          </Html>
          <HistoryPortals />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: GEOGRAPHY PLANET --- */}
      {activeDimension === 'geography' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">TECTONIC PLATE SCANNER</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                GEOGRAPHY PLANET
              </h1>
            </div>
          </Html>
          <GeographyPlanet />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: SPACE DIMENSION --- */}
      {activeDimension === 'space' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase animate-pulse">ORBITAL GRAVITATIONAL SIMULATOR</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                SPACE EXPLORATION
              </h1>
            </div>
          </Html>
          <group position={[0, 1, -2]}>
            {/* Sun Star */}
            <mesh onClick={() => setSelectedObject({
              id: 'star',
              name: 'Main-Sequence Yellow Dwarf Star',
              category: 'Astrophysics',
              description: 'A luminous sphere of plasma held together by its own gravity, generating light and heat through nuclear fusion of hydrogen into helium.',
              funFact: 'The Sun accounts for 99.86% of the entire mass of our Solar System!'
            })}>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshBasicMaterial color="#fcd34d" />
            </mesh>

            {/* Orbit paths torus */}
            <mesh rotation={[Math.PI / 2, 0.2, 0]}>
              <torusGeometry args={[1.5, 0.01, 8, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>

            {/* Planet */}
            <PlanetOrbiter />
          </group>
        </group>
      )}

      {/* --- CONNECTED DIMENSION: CODING ISLAND --- */}
      {activeDimension === 'coding' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase animate-pulse">ALGORITHMIC COMPILER LOGIC</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                CODING ISLAND
              </h1>
            </div>
          </Html>
          <CodingIsland />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: LANGUAGE CITY --- */}
      {activeDimension === 'language' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-teal-400 uppercase animate-pulse">PHONETIC LEXICON MATRIX</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                LANGUAGE CITY
              </h1>
            </div>
          </Html>
          <LanguageCity />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: CREATIVE ARTS DISTRICT --- */}
      {activeDimension === 'arts' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase animate-pulse">CHROMATIC SPECTRUM MIXER</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                CREATIVE ARTS DISTRICT
              </h1>
            </div>
          </Html>
          <ArtsDistrict />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: ANATOMY EXPLORER --- */}
      {activeDimension === 'anatomy' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-pink-400 uppercase animate-pulse">PHYSIOLOGY SCANNER</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                ANATOMY EXPLORER
              </h1>
            </div>
          </Html>
          <AnatomyExplorer />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: PIANO TEACHER --- */}
      {activeDimension === 'piano' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">SONIC PATTERN HARMONY</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                PIANO TEACHER
              </h1>
            </div>
          </Html>
          <PianoTeacher />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: CHEMISTRY LAB --- */}
      {activeDimension === 'chemistry_lab' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase animate-pulse">MOLECULAR BONDING SIMULATION</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(16,182,129,0.3)]">
                CHEMISTRY CENTER
              </h1>
            </div>
          </Html>
          <ChemistryCenter />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: SOLAR SYSTEM --- */}
      {activeDimension === 'solar_system' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase animate-pulse">SOLAR GRAVITATIONAL ORBITS</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                SOLAR SYSTEM ROOM
              </h1>
            </div>
          </Html>
          <group position={[0, 1, -2]}>
            {/* Sun Star */}
            <mesh onClick={() => setSelectedObject({
              id: 'star',
              name: 'Main-Sequence Yellow Dwarf Star',
              category: 'Astrophysics',
              description: 'A luminous sphere of plasma held together by its own gravity, generating light and heat through nuclear fusion of hydrogen into helium.',
              funFact: 'The Sun accounts for 99.86% of the entire mass of our Solar System!'
            })}>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshBasicMaterial color="#fcd34d" />
            </mesh>

            {/* Orbit paths torus */}
            <mesh rotation={[Math.PI / 2, 0.2, 0]}>
              <torusGeometry args={[1.5, 0.01, 8, 64]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>

            {/* Planet */}
            <PlanetOrbiter />
          </group>
        </group>
      )}

      {/* --- CONNECTED DIMENSION: DINOSAUR SAFARI --- */}
      {activeDimension === 'dinosaur' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-emerald-400 uppercase animate-pulse">CRETACEOUS CHRONO-PORTAL</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(16,182,129,0.35)]">
                DINOSAUR SAFARI
              </h1>
            </div>
          </Html>
          <DinosaurSafari />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: OCEAN EXPLORER --- */}
      {activeDimension === 'ocean' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase animate-pulse">AQUATIC DEPTH PROBE</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                OCEAN EXPLORER
              </h1>
            </div>
          </Html>
          <OceanExplorer />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: SPACESHIP BRIDGE --- */}
      {activeDimension === 'spaceship' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase animate-pulse">ORBITAL INTERCEPT STEERING</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                SPACESHIP BRIDGE
              </h1>
            </div>
          </Html>
          <SpaceshipBridge />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: ALIEN ZOO --- */}
      {activeDimension === 'alien_zoo' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-fuchsia-400 uppercase animate-pulse">BIOLUMINESCENT FORCEFIELDS</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(217,70,239,0.35)]">
                ALIEN ZOO
              </h1>
            </div>
          </Html>
          <AlienZoo />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: TINY CITY BUILDER --- */}
      {activeDimension === 'city_builder' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">METROPOLIS SMARTGRID CORE</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                TINY CITY BUILDER
              </h1>
            </div>
          </Html>
          <TinyCityBuilder />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: CASTLE DEFENSE --- */}
      {activeDimension === 'castle_defense' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-500 uppercase animate-pulse">TACTICAL FORTRESS SHIELD</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                CASTLE DEFENSE
              </h1>
            </div>
          </Html>
          <CastleDefense />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: 3D PAINTING STUDIO --- */}
      {activeDimension === 'painting_studio' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-pink-500 uppercase animate-pulse">VECTOR SPLINE CANVAS</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(236,72,153,0.35)]">
                PAINTING STUDIO
              </h1>
            </div>
          </Html>
          <PaintingStudio />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: MICROSCOPE WORLD --- */}
      {activeDimension === 'microscope' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">MOLECULAR NUCLEOTIDE PROBE</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                MICROSCOPE WORLD
              </h1>
            </div>
          </Html>
          <MicroscopeWorld />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: WEATHER MACHINE --- */}
      {activeDimension === 'weather_machine' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">ATMOSPHERIC VORTEX COILS</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                WEATHER MACHINE
              </h1>
            </div>
          </Html>
          <WeatherMachine />
        </group>
      )}

      {/* --- CONNECTED DIMENSION: TIME MACHINE --- */}
      {activeDimension === 'time_machine' && (
        <group>
          <Html position={[0, 4.5, -4]} center distanceFactor={10}>
            <div className="flex flex-col items-center text-center select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase animate-pulse">TEMPORAL TACHYON COORDINATOR</span>
              <h1 className="text-4xl font-black text-white italic tracking-wider uppercase mt-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                TIME MACHINE
              </h1>
            </div>
          </Html>
          <TimeMachine />
        </group>
      )}

      {/* Central Teleport back pedestal for all active dimensions */}
      {activeDimension !== 'hub' && (
        <group 
          position={[0, 0, 1.8]}
          onClick={(e) => {
            e.stopPropagation();
            setDimension('hub');
          }}
        >
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.8, 0.85, 0.1, 32]} />
            <meshStandardMaterial color="#18181b" roughness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.7, 0.75, 32]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
          </mesh>
          <Html distanceFactor={6} position={[0, 0.8, 0]} center>
            <button className="bg-zinc-950/95 border border-cyan-400/40 hover:border-cyan-400 px-4 py-2 rounded-2xl text-[9px] font-black text-cyan-400 hover:text-white uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xl whitespace-nowrap">
              ↩ Teleport to Hub Lobby
            </button>
          </Html>
        </group>
      )}
    </group>
  );
}

// Particle system to create a majestic stellar space background
function SpaceParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const count = 350;
  const positions = React.useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Position particles in a large sphere surrounding the lobby
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 10 + Math.random() * 25;

      array[i * 3] = Math.sin(phi) * Math.sin(theta) * dist;
      array[i * 3 + 1] = Math.cos(phi) * dist;
      array[i * 3 + 2] = Math.sin(phi) * Math.cos(theta) * dist;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#22d3ee" 
        size={0.06} 
        sizeAttenuation 
        transparent 
        opacity={0.65} 
      />
    </points>
  );
}

// Orbiting planet helper component
function PlanetOrbiter() {
  const meshRef = useRef<THREE.Mesh>(null);
  const setSelectedObject = useEduStore(state => state.setSelectedObject);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const radius = 1.5;
    const x = Math.sin(time * 0.5) * radius;
    const z = Math.cos(time * 0.5) * radius;
    const y = Math.sin(time * 0.5) * radius * 0.2; // slight inclination

    meshRef.current.position.set(x, y, z);
  });

  return (
    <mesh 
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedObject({
          id: 'gas_giant',
          name: 'Habitable Exo-Planet Simulator',
          category: 'Astro-biology',
          description: 'A rocky, liquid-water terrestrial planet orbiting in the habitable "Goldilocks Zone" of its parent star.',
          funFact: 'To be habitable, a planet must have atmospheric pressure sufficient to support liquid water on its surface!'
        });
      }}
    >
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#60a5fa" roughness={0.3} />
    </mesh>
  );
}
