import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { 
  BookOpen, Sparkles, Award, Zap, Compass, RotateCcw,
  Activity, ArrowLeft, Eye, Grid, Cpu, Globe, FlaskConical, Play
} from 'lucide-react';
import { soundService } from '../services/soundService';

type AcademyRegion = 
  | 'biology' | 'math' | 'physics' | 'history' | 'geography'
  | 'language' | 'chemistry' | 'coding' | 'space' | 'arts';

interface RegionData {
  id: AcademyRegion;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  bgGradient: string;
  description: string;
  objective: string;
  rewardCoins: number;
  rewardXP: number;
}

const REGIONS: Record<AcademyRegion, RegionData> = {
  biology: {
    id: 'biology',
    name: 'Biology Kingdom',
    icon: 'heart',
    emoji: '🧬',
    color: '#ec4899',
    bgGradient: 'from-pink-900/30 to-rose-900/10',
    description: 'Walk inside a giant human heart, shrink down to explore organelles, and analyze living micro-cellular cells.',
    objective: 'Explore the heart chamber valves and adjust the arterial pressure to achieve cardiac homeostasis.',
    rewardCoins: 250,
    rewardXP: 500
  },
  math: {
    id: 'math',
    name: 'Mathematical Mountains',
    icon: 'triangle',
    emoji: '📐',
    color: '#8b5cf6',
    bgGradient: 'from-violet-900/30 to-indigo-900/10',
    description: 'Solve trigonometric, calculus, and spatial geometry riddles to ascend the vector peak.',
    objective: 'Solve the right-triangle climbing angle so your grappling line reaches the peak.',
    rewardCoins: 200,
    rewardXP: 450
  },
  physics: {
    id: 'physics',
    name: 'Physics Laboratories',
    icon: 'activity',
    emoji: '⚛️',
    color: '#3b82f6',
    bgGradient: 'from-blue-900/30 to-cyan-900/10',
    description: 'Play with Newtonian gravity modifiers, acceleration, kinetic velocity vectors, and dimensional wormholes.',
    objective: 'Calibrate gravity and angle to launch a carbon projectile directly into the energy portal receptor.',
    rewardCoins: 300,
    rewardXP: 600
  },
  history: {
    id: 'history',
    name: 'History Time Portals',
    icon: 'clock',
    emoji: '⏳',
    color: '#f59e0b',
    bgGradient: 'from-amber-900/30 to-yellow-900/10',
    description: 'Step through wormholes to inspect the Roman Empire, watch ancient library reconstructions, and participate in the Space Race.',
    objective: 'Match timeline artifacts to their correct historical era to restore temporal stability.',
    rewardCoins: 150,
    rewardXP: 400
  },
  geography: {
    id: 'geography',
    name: 'Geography Planet',
    icon: 'globe',
    emoji: '🌍',
    color: '#10b981',
    bgGradient: 'from-emerald-900/30 to-teal-900/10',
    description: 'Explore active tectonic plate shifts, weather patterns, and ocean currents across a spherical globe.',
    objective: 'Assemble continent tectonic plates to prevent a seismic tsunami event.',
    rewardCoins: 200,
    rewardXP: 450
  },
  language: {
    id: 'language',
    name: 'Language City',
    icon: 'message-square',
    emoji: '💬',
    color: '#14b8a6',
    bgGradient: 'from-teal-900/30 to-indigo-950/10',
    description: 'Immerse yourself in multilingual sign translation, grammatical logic constructs, and foreign syntax cities.',
    objective: 'Translate the city portal runic text by matching linguistic syntactic connectors.',
    rewardCoins: 150,
    rewardXP: 400
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemistry Research Centers',
    icon: 'flask',
    emoji: '🧪',
    color: '#f43f5e',
    bgGradient: 'from-rose-900/30 to-red-950/10',
    description: 'Mix stable molecules, inspect covalent electronic bonds, and solve atom bindings.',
    objective: 'Combine Hydrogen and Oxygen atoms in the precise stoichiometric ratio to synthesize pure Water molecules.',
    rewardCoins: 250,
    rewardXP: 550
  },
  coding: {
    id: 'coding',
    name: 'Coding Island',
    icon: 'cpu',
    emoji: '💻',
    color: '#06b6d4',
    bgGradient: 'from-cyan-900/30 to-slate-900/10',
    description: 'Construct visual logical sequences, program pathfinding scripts, and activate virtual circuit pathways.',
    objective: 'Chain conditional blocks to guide the tactical probe out of the network grid labyrinth.',
    rewardCoins: 350,
    rewardXP: 700
  },
  space: {
    id: 'space',
    name: 'Space Stations',
    icon: 'rocket',
    emoji: '🚀',
    color: '#a855f7',
    bgGradient: 'from-purple-900/30 to-violet-950/10',
    description: 'Fly through scale representations of the solar system, map nebula formations, and study gravity sinks.',
    objective: 'Navigate the research probe through planetary gravity assist vectors to map Saturn’s rings.',
    rewardCoins: 300,
    rewardXP: 600
  },
  arts: {
    id: 'arts',
    name: 'Creative Arts Districts',
    icon: 'palette',
    emoji: '🎨',
    color: '#fb7185',
    bgGradient: 'from-pink-900/20 to-zinc-900/10',
    description: 'Create dimensional geometric digital sculptures and compose adaptive frequency audio synthesizers.',
    objective: 'Harmonize the primary visual frequency spectrum by adjusting the RGB resonance sliders.',
    rewardCoins: 180,
    rewardXP: 400
  }
};

export function InfinityAcademyVR() {
  const [selectedRegion, setSelectedRegion] = useState<AcademyRegion | null>(null);
  const [vrMode, setVrMode] = useState<boolean>(false);
  const [labCompleted, setLabCompleted] = useState<boolean>(false);
  
  // Simulation States
  // Biology: Heart BPM
  const [bpm, setBpm] = useState<number>(75);
  // Math: Grappling ladder right triangle
  const [mathAngle, setMathAngle] = useState<number>(45);
  // Physics: Portal angle & velocity
  const [physicsAngle, setPhysicsAngle] = useState<number>(30);
  const [physicsVelocity, setPhysicsVelocity] = useState<number>(10);
  // Chemistry: stoichiometric mixer
  const [chemH, setChemH] = useState<number>(0);
  const [chemO, setChemO] = useState<number>(0);
  // Coding: algorithm stack
  const [codingStack, setCodingStack] = useState<string[]>([]);

  const leaveGame = useGameStore(state => state.leaveGame);
  const addCoins = useGameStore(state => state.addCoins);
  const addEvent = useGameStore(state => state.addEvent);

  const activeRegionData = selectedRegion ? REGIONS[selectedRegion] : null;

  const handleCompleteLab = () => {
    if (!activeRegionData) return;
    setLabCompleted(true);
    addCoins(activeRegionData.rewardCoins);
    
    // Add XP directly to state
    useGameStore.setState(state => ({
      xp: state.xp + activeRegionData.rewardXP,
      credits: state.credits + Math.floor(activeRegionData.rewardCoins / 2)
    }));
    
    addEvent(`🎓 INFINITY ACADEMY: Completed ${activeRegionData.name} (+${activeRegionData.rewardCoins} Coins / +${activeRegionData.rewardXP} XP)`);
    try {
      soundService.playSFX('achievement');
    } catch(e) {}
  };

  const handleResetLab = () => {
    setLabCompleted(false);
    setBpm(75);
    setMathAngle(45);
    setPhysicsAngle(30);
    setPhysicsVelocity(10);
    setChemH(0);
    setChemO(0);
    setCodingStack([]);
  };

  const renderSimulator = () => {
    if (!selectedRegion) return null;

    switch (selectedRegion) {
      case 'biology':
        return (
          <div className="flex flex-col gap-4 bg-black/60 p-6 rounded-2xl border border-pink-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">AORTA VALVE FLUIDICS</span>
              <span className="text-xl font-mono text-white font-black">{bpm} BPM</span>
            </div>
            
            {/* Visual Beat Pulse */}
            <div className="h-32 bg-pink-950/20 rounded-xl border border-pink-900/30 flex items-center justify-center relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.25, 1, 1.15, 1], opacity: [0.6, 1, 0.6, 0.9, 0.6] }}
                transition={{ duration: 60 / bpm, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.6)]"
              >
                <Activity size={32} className="text-white" />
              </motion.div>
              {/* Dynamic Blood Particles */}
              <div className="absolute inset-x-0 bottom-2 flex justify-around pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-10, -100], opacity: [0, 1, 0] }}
                    transition={{ duration: (60 / bpm) * 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2.5 h-2.5 bg-red-400 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/50 uppercase font-black">Adjust Arterial Pressure (Heart Rate)</label>
              <input
                type="range"
                min={40}
                max={160}
                value={bpm}
                onChange={(e) => {
                  setBpm(Number(e.target.value));
                  if (Number(e.target.value) >= 115 && Number(e.target.value) <= 125) {
                    // Perfect target for cellular stability!
                  }
                }}
                className="w-full h-1 bg-pink-900/40 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <p className="text-[9px] text-pink-400/80 leading-relaxed uppercase">
                Target: 120 BPM is required to activate cellular mitosic replication. Current homeostasis: {bpm === 120 ? '🌟 STABLE 🌟' : 'UNBALANCED'}
              </p>
            </div>

            <button
              onClick={handleCompleteLab}
              disabled={bpm !== 120 || labCompleted}
              className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                bpm === 120 && !labCompleted
                  ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                  : 'bg-zinc-800 text-white/20 cursor-not-allowed'
              }`}
            >
              {labCompleted ? 'Homeostasis Achieved! ✓' : 'Stabilize Cellular Pulse (120 BPM)'}
            </button>
          </div>
        );

      case 'math':
        const climbHypotenuse = Math.round(50 / Math.sin((mathAngle * Math.PI) / 180));
        const climbBase = Math.round(50 / Math.tan((mathAngle * Math.PI) / 180));
        const angleSolved = mathAngle === 60;
        return (
          <div className="flex flex-col gap-4 bg-black/60 p-6 rounded-2xl border border-violet-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-violet-400 font-bold uppercase tracking-wider">TRIGONOMETRIC ASCENT ARRAY</span>
              <span className="text-sm font-mono text-white font-black">Angle: {mathAngle}°</span>
            </div>

            {/* Simulated Right Triangle climbing mountain */}
            <div className="h-32 bg-violet-950/20 rounded-xl border border-violet-900/30 relative flex items-end justify-start p-4 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full text-violet-500/10" xmlns="http://www.w3.org/2000/svg">
                <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="currentColor" strokeWidth="2" />
                <line x1="90%" y1="90%" x2="90%" y2="10%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="currentColor" strokeWidth="2" />
              </svg>
              
              {/* Climbing vector visualization */}
              <div className="absolute left-[10%] bottom-[10%] flex flex-col gap-1 text-[10px] text-white">
                <span className="text-violet-400 font-black">θ = {mathAngle}°</span>
                <span className="opacity-50">Height = 50m</span>
                <span className="opacity-50">Base = {climbBase}m</span>
                <span className="text-emerald-400 font-black">Grapple Length = {climbHypotenuse}m</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-white/50 uppercase font-black">Calibrate Ascent Slope Angle</label>
              <input
                type="range"
                min={15}
                max={75}
                value={mathAngle}
                onChange={(e) => setMathAngle(Number(e.target.value))}
                className="w-full h-1 bg-violet-900/40 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <p className="text-[9px] text-violet-400/80 uppercase">
                Target: Adjust slope angle to 60° for optimal stress vector distribution. Current: {angleSolved ? '🌟 OPTIMAL (60°) 🌟' : 'SUBOPTIMAL VECTORS'}
              </p>
            </div>

            <button
              onClick={handleCompleteLab}
              disabled={!angleSolved || labCompleted}
              className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                angleSolved && !labCompleted
                  ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                  : 'bg-zinc-800 text-white/20 cursor-not-allowed'
              }`}
            >
              {labCompleted ? 'Vector Ascent Completed! ✓' : 'Engage Ascent Grapple (60°)'}
            </button>
          </div>
        );

      case 'physics':
        const hitPortal = physicsAngle === 45 && physicsVelocity === 20;
        return (
          <div className="flex flex-col gap-4 bg-black/60 p-6 rounded-2xl border border-blue-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">PROJECTILE TRAJECTORY LAB</span>
              <span className="text-xs font-mono text-white/60">θ={physicsAngle}° | V={physicsVelocity} m/s</span>
            </div>

            {/* Launch vector simulation path */}
            <div className="h-32 bg-blue-950/20 rounded-xl border border-blue-900/30 relative overflow-hidden flex items-end">
              {/* Particle Target Portal */}
              <div className="absolute right-12 top-8 w-8 h-8 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-blue-500/40 rounded-full" />
              </div>
              
              {/* Projected path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {hitPortal ? (
                  <path d="M 20 120 Q 150 20, 265 48" fill="none" stroke="#22d3ee" strokeWidth="3" className="animate-pulse" />
                ) : (
                  <line x1="20" y1="120" x2="100" y2={120 - physicsAngle} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" />
                )}
              </svg>
              
              <span className="absolute bottom-2 left-4 text-[8px] uppercase font-black tracking-wider text-white/30">Launch core</span>
              <span className="absolute top-2 right-4 text-[8px] uppercase font-black tracking-wider text-blue-400">Portal Target (45°, 20m/s)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/50 uppercase font-black">Launch Angle ({physicsAngle}°)</label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={physicsAngle}
                  onChange={(e) => setPhysicsAngle(Number(e.target.value))}
                  className="w-full h-1 bg-blue-900/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/50 uppercase font-black">Velocity ({physicsVelocity} m/s)</label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={physicsVelocity}
                  onChange={(e) => setPhysicsVelocity(Number(e.target.value))}
                  className="w-full h-1 bg-blue-900/40 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleCompleteLab}
              disabled={!hitPortal || labCompleted}
              className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                hitPortal && !labCompleted
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-zinc-800 text-white/20 cursor-not-allowed'
              }`}
            >
              {labCompleted ? 'Portal Conjunction Stable! ✓' : 'Launch Particle Beam (Match Portal)'}
            </button>
          </div>
        );

      case 'chemistry':
        const formulaAssembled = chemH === 2 && chemO === 1;
        return (
          <div className="flex flex-col gap-4 bg-black/60 p-6 rounded-2xl border border-rose-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">COVALENT MOLECULAR BINDER</span>
              <span className="text-sm font-mono text-white font-black">Binding: H₂O</span>
            </div>

            {/* Atomic canvas */}
            <div className="h-32 bg-rose-950/10 rounded-xl border border-rose-900/30 relative flex items-center justify-center gap-6 overflow-hidden">
              <motion.div 
                animate={formulaAssembled ? { rotate: 360 } : {}}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="relative flex items-center justify-center w-20 h-20 border border-white/5 rounded-full"
              >
                {/* Central Oxygen atom */}
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  O
                </div>
                {/* Hydrogen orbiting */}
                {Array.from({ length: chemH }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-5 h-5 bg-white rounded-full flex items-center justify-center text-black font-black text-[8px] shadow-[0_0_10px_white]"
                    style={{
                      top: i === 0 ? '-10px' : 'auto',
                      bottom: i === 1 ? '-10px' : 'auto',
                      left: i === 2 ? '-10px' : 'auto',
                    }}
                  >
                    H
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="text-[10px] text-white flex flex-col gap-1 uppercase font-semibold">
                <span>Hydrogen: {chemH} atoms</span>
                <span>Oxygen: {chemO} atoms</span>
                <span className={`font-black ${formulaAssembled ? 'text-emerald-400' : 'text-red-400'}`}>
                  Formula: {formulaAssembled ? 'PURE WATER (H₂O) ✓' : 'UNSTABLE RADICAL ✖'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/50 uppercase font-black">Hydrogen</span>
                <div className="flex gap-2">
                  <button onClick={() => setChemH(Math.max(0, chemH - 1))} className="bg-white/5 hover:bg-white/10 w-6 h-6 rounded font-black text-white">-</button>
                  <span className="font-mono text-white text-sm font-black w-4 text-center">{chemH}</span>
                  <button onClick={() => setChemH(chemH + 1)} className="bg-white/5 hover:bg-white/10 w-6 h-6 rounded font-black text-white">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-white/50 uppercase font-black">Oxygen</span>
                <div className="flex gap-2">
                  <button onClick={() => setChemO(Math.max(0, chemO - 1))} className="bg-white/5 hover:bg-white/10 w-6 h-6 rounded font-black text-white">-</button>
                  <span className="font-mono text-white text-sm font-black w-4 text-center">{chemO}</span>
                  <button onClick={() => setChemO(chemO + 1)} className="bg-white/5 hover:bg-white/10 w-6 h-6 rounded font-black text-white">+</button>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteLab}
              disabled={!formulaAssembled || labCompleted}
              className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                formulaAssembled && !labCompleted
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-zinc-800 text-white/20 cursor-not-allowed'
              }`}
            >
              {labCompleted ? 'Molecular Synthesis Complete! ✓' : 'Synthesize Pure H₂O'}
            </button>
          </div>
        );

      case 'coding':
        const scriptCorrect = codingStack.length === 3 && codingStack[0] === 'IF_BLOCKED' && codingStack[1] === 'TURN_LEFT' && codingStack[2] === 'SPEED_BOOST';
        return (
          <div className="flex flex-col gap-4 bg-black/60 p-6 rounded-2xl border border-cyan-500/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">VISUAL SYNTAX ENGINE</span>
              <span className="text-xs font-mono text-white/60">Algorithm Stack</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2">
                <span className="text-[8px] text-white/40 uppercase font-black">Blocks</span>
                {['IF_BLOCKED', 'TURN_LEFT', 'SPEED_BOOST', 'EMIT_PORTAL'].map(block => (
                  <button
                    key={block}
                    onClick={() => setCodingStack([...codingStack, block])}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded py-1 px-2 text-[9px] font-black text-cyan-400 text-left truncate uppercase"
                  >
                    + {block.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="col-span-2 bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 h-44 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                  <span className="text-[8px] text-cyan-400 uppercase font-black">Workspace Executable</span>
                  {codingStack.length > 0 && (
                    <button onClick={() => setCodingStack([])} className="text-[8px] text-red-400 uppercase font-black underline">Clear</button>
                  )}
                </div>
                {codingStack.map((block, idx) => (
                  <div key={idx} className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[9px] text-white flex items-center justify-between font-mono">
                    <span>{idx + 1}: {block}</span>
                    <span className="text-cyan-400">⚡</span>
                  </div>
                ))}
                {codingStack.length === 0 && (
                  <div className="text-white/20 text-[9px] italic py-8 text-center uppercase">Click blocks to build algorithm</div>
                )}
              </div>
            </div>

            <p className="text-[9px] text-cyan-400 leading-relaxed uppercase">
              Target sequence: 1. IF BLOCKED, 2. TURN LEFT, 3. SPEED BOOST. Current sequence is {scriptCorrect ? 'CORRECT ✓' : 'INCOMPLETE ✖'}
            </p>

            <button
              onClick={handleCompleteLab}
              disabled={!scriptCorrect || labCompleted}
              className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                scriptCorrect && !labCompleted
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-zinc-800 text-white/20 cursor-not-allowed'
              }`}
            >
              {labCompleted ? 'Probe Labyrinth Solved! ✓' : 'Execute Logical Routine'}
            </button>
          </div>
        );

      default:
        // Other regions: auto-solvable simple informational panel
        return (
          <div className="flex flex-col gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/10 text-center">
            <Compass size={40} className="mx-auto text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h4 className="text-lg font-black uppercase text-white tracking-tighter">{activeRegionData?.name} Lab System</h4>
            <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto uppercase">
              Initializing neural classroom stream. Walk inside physical models, collect educational artifacts, and interface with historical portals.
            </p>
            <button
              onClick={handleCompleteLab}
              disabled={labCompleted}
              className="py-3 bg-amber-400 hover:bg-amber-300 text-black rounded-xl font-black uppercase text-xs tracking-widest w-full max-w-xs mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {labCompleted ? 'Research Module Synthesized! ✓' : 'Download Educational Core'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`absolute inset-0 bg-zinc-950 text-white pointer-events-auto flex flex-col z-[55] ${vrMode ? 'grid grid-cols-2' : ''}`}>
      
      {/* Dynamic Render: Standard viewport or split screen VR headset cardboard mode */}
      {Array.from({ length: vrMode ? 2 : 1 }).map((_, screenIdx) => (
        <div key={screenIdx} className={`h-full flex flex-col p-8 overflow-y-auto ${vrMode ? 'border-r border-white/10 last:border-r-0 scale-95 origin-center' : ''}`}>
          
          {/* Main header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="text-amber-400" size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Infinity Academy VR // Education Center</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                {selectedRegion ? REGIONS[selectedRegion].name : 'Academy Hub'}
              </h2>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setVrMode(!vrMode)}
                className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  vrMode 
                    ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                }`}
              >
                VR Cardboard Mode: {vrMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={leaveGame}
                className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-500 hover:text-black transition-all"
              >
                Exit Academy
              </button>
            </div>
          </div>

          {/* Left panel / Content Grid */}
          {!selectedRegion ? (
            // Academy Regions Hub Menu Selection
            <div className="flex-1 flex flex-col gap-6">
              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-indigo-500/5 rounded-3xl border border-white/10 max-w-4xl">
                <h3 className="text-xl font-black text-amber-400 uppercase tracking-tight mb-2 flex items-center gap-2">
                  <Sparkles size={18} /> Welcome to Infinity Academy VR
                </h3>
                <p className="text-xs text-white/60 leading-relaxed uppercase">
                  Explore a massive open world where learning is an immersive 3D adventure. Step into live classrooms, interact with kinetic physics components, build stoichiometric covalent chemical atoms, and solve logical puzzles across 10 subject regions!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(Object.keys(REGIONS) as AcademyRegion[]).map((key) => {
                  const reg = REGIONS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedRegion(key);
                        handleResetLab();
                      }}
                      className="group relative flex flex-col p-6 rounded-3xl border border-white/10 hover:border-white bg-white/5 transition-all duration-300 text-left cursor-pointer hover:scale-[1.02]"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{reg.emoji}</div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1 group-hover:text-amber-400 transition-colors">{reg.name}</h4>
                      <p className="text-[10px] text-white/50 leading-tight uppercase line-clamp-3 mb-4">{reg.description}</p>
                      
                      <div className="mt-auto flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Award size={10} /> +{reg.rewardCoins} Coins
                        </span>
                        <span className="text-[8px] text-white/30 uppercase font-black">ENTER LAB</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Active region classroom simulator view
            <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-6xl">
              
              {/* Back to hub & descriptive objectives */}
              <div className="flex-1 flex flex-col gap-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="group flex items-center gap-2 text-xs font-black uppercase text-white/40 hover:text-white transition-colors text-left"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Subject Hub
                </button>

                <div className="flex items-center gap-4 border-b border-white/5 pb-4 mt-2">
                  <div className="text-5xl">{activeRegionData?.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">{activeRegionData?.name}</h3>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Laboratory Experiment</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Current Quest Objective</h4>
                  <p className="text-xs text-white/70 leading-relaxed uppercase bg-black/40 p-4 rounded-xl border border-white/5">
                    {activeRegionData?.objective}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-6 bg-black/40 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Award className="text-amber-400" size={16} />
                    <span className="text-xs font-black text-white">REWARD:</span>
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-white/70 uppercase">
                    <span>• +{activeRegionData?.rewardCoins} Coins</span>
                    <span>• +{activeRegionData?.rewardXP} XP</span>
                  </div>
                </div>
              </div>

              {/* Active simulator interface panel */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-wider">Simulated 3D / Neural Canvas</h3>
                  {labCompleted && (
                    <button onClick={handleResetLab} className="text-[9px] text-amber-400 uppercase font-black tracking-widest hover:underline flex items-center gap-1">
                      <RotateCcw size={10} /> Reset Experiment
                    </button>
                  )}
                </div>
                {renderSimulator()}
              </div>

            </div>
          )}

          {/* stereoscopic divider for VR Cardboard Mode */}
          {vrMode && (
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20 shadow-[0_0_20px_white] pointer-events-none z-50 flex flex-col items-center justify-around text-white/10 font-bold text-[8px] uppercase tracking-widest select-none">
              <span>Cardboard Divider</span>
              <span>•</span>
              <span>Cardboard Divider</span>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}
