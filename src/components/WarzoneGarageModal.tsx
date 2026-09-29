import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Zap, Crosshair, Wrench, Flame, Wind, 
  RotateCcw, Play, X, Compass, ChevronRight, Award,
  Cpu, Rocket, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useGameStore, VehicleType } from '../store';
import { TankModel } from './RealisticVehicles/TankModel';
import { FighterJetModel } from './RealisticVehicles/FighterJetModel';
import { AttackHelicopterModel } from './RealisticVehicles/AttackHelicopterModel';
import { ArmoredIFVModel } from './RealisticVehicles/ArmoredIFVModel';
import { NavalWarshipModel } from './RealisticVehicles/NavalWarshipModel';
import { CyberSupercarModel } from './RealisticVehicles/CyberSupercarModel';
import { CombatMechModel } from './RealisticVehicles/CombatMechModel';
import { CombatMotorbikeModel } from './RealisticVehicles/CombatMotorbikeModel';
import { soundService } from '../services/soundService';

interface VehicleSpec {
  id: VehicleType;
  name: string;
  category: 'Ground Heavy' | 'Supersonic Air' | 'Rotary Air' | 'Light Armor' | 'Naval Strike' | 'Cyber GT' | 'Bipedal Mech' | 'Tactical Bike';
  role: string;
  topSpeed: string;
  armorRating: string;
  primaryWeapon: string;
  secondaryWeapon: string;
  description: string;
}

const VEHICLE_CATALOG: VehicleSpec[] = [
  {
    id: 'tank',
    name: 'TITAN T-90M MAIN BATTLE TANK',
    category: 'Ground Heavy',
    role: 'Frontline Armored Breakthrough',
    topSpeed: '75 KM/H',
    armorRating: '3,000 HP // HEAVY COMPOSITE + ERA',
    primaryWeapon: '120mm Smoothbore Cannon',
    secondaryWeapon: 'Pintle .50 Cal RWS + Smoke Dischargers',
    description: 'Heavily armored Main Battle Tank featuring sloped multi-layer composite glacis plates, explosive reactive armor (ERA) bricks, independent commander optics, and high-velocity APFSDS kinetic penetrators.'
  },
  {
    id: 'jet',
    name: 'APEX F-35 STEALTH SUPERSONIC FIGHTER',
    category: 'Supersonic Air',
    role: 'Air Superiority & Deep Strike',
    topSpeed: '2,200 KM/H (MACH 1.8)',
    armorRating: '1,400 HP // STEALTH RADAR ABSORBENT',
    primaryWeapon: 'Twin Afterburning Turbofans + 25mm Autocannon',
    secondaryWeapon: 'AIM-120 AMRAAM Beyond-Visual-Range Missiles',
    description: 'Fifth-generation multirole stealth interceptor with chined fuselage, canted vertical fins, thrust-vectoring turbofans with Mach shock diamonds, and long-range radar lock-on capabilities.'
  },
  {
    id: 'helicopter',
    name: 'VIPER AH-64 COMBAT ATTACK GUNSHIP',
    category: 'Rotary Air',
    role: 'Close Air Support & Tank Hunter',
    topSpeed: '320 KM/H',
    armorRating: '1,600 HP // TITANIUM ROTOR MAST',
    primaryWeapon: 'Chin-Mounted 30mm M230 Chain Gun',
    secondaryWeapon: 'Quad AGM-114 Hellfire Missiles + Hydra Rockets',
    description: 'Armored tandem-seat gunship equipped with Longbow mast radar, FLIR thermal imaging turret, spinning 4-blade rotor assembly, and active chaff/flare countermeasure dispensers.'
  },
  {
    id: 'apc',
    name: 'GRIZZLY 8x8 HEAVY ARMORED IFV',
    category: 'Light Armor',
    role: 'Rapid Infantry Fire Support',
    topSpeed: '110 KM/H',
    armorRating: '2,400 HP // SLAT CAGE + V-SHAPED HULL',
    primaryWeapon: '30mm Bushmaster Stabilized Autocannon',
    secondaryWeapon: 'TOW Dual Anti-Tank Guided Missile Launcher',
    description: 'High-mobility 8-wheel drive armored infantry fighting vehicle with reinforced blast hull, run-flat combat tires, remote weapon station, and rear troop deployment capabilities.'
  },
  {
    id: 'gunboat',
    name: 'AEGIS GHOST STEALTH MISSILE CORVETTE',
    category: 'Naval Strike',
    role: 'Coastal Defense & Surface Interdiction',
    topSpeed: '95 KM/H (52 KNOTS)',
    armorRating: '3,500 HP // WAVE-PIERCING STEEL HULL',
    primaryWeapon: 'Forward 76mm Rapid-Fire Naval Cannon',
    secondaryWeapon: '8-Cell Deck VLS Surface-to-Air Missile Silos',
    description: 'Cutting-edge stealth warship featuring an inverted wave-piercing tumblehome bow, phased array radar superstructure, stern helicopter landing deck, and anti-ship cruise missiles.'
  },
  {
    id: 'car',
    name: 'NEMESIS GT CYBER INTERCEPTOR',
    category: 'Cyber GT',
    role: 'Pursuit & High-Speed Reconnaissance',
    topSpeed: '360 KM/H',
    armorRating: '1,000 HP // REINFORCED CARBON MONOCOQUE',
    primaryWeapon: 'Twin Forward Plasma Pulse Blasters',
    secondaryWeapon: 'Quad Titanium Nitro Afterburners',
    description: 'Ultra-low aerodynamic widebody supercar equipped with active hydraulic aero-wing, carbon front splitter, drilled carbon-ceramic brake rotors, and track-tuned sport suspension.'
  },
  {
    id: 'mech',
    name: 'AEGIS PRIME COMBAT BATTLEMECH',
    category: 'Bipedal Mech',
    role: 'Heavy Urban Assault Walker',
    topSpeed: '65 KM/H',
    armorRating: '2,600 HP // REVERSE-JOINT EXOSKELETON',
    primaryWeapon: 'Heavy 6-Barrel Rotary Minigun',
    secondaryWeapon: 'Shoulder 12-Cell Micro-Missile Battery + Plasma Cannon',
    description: 'Articulated bipedal walker featuring heavy hydraulic shock pistons, 360-degree rotating armored torso, glowing target visor, and rapid-fire suppressive weaponry.'
  },
  {
    id: 'motorbike',
    name: 'AKIRA V-TWIN TACTICAL CYBERBIKE',
    category: 'Tactical Bike',
    role: 'Rapid Infiltration & Scout',
    topSpeed: '280 KM/H',
    armorRating: '800 HP // CHROMOLY TRELLIS FRAME',
    primaryWeapon: 'Dual Fairing-Mounted Blasters',
    secondaryWeapon: 'High-Torque Turbo Boxer Engine Boost',
    description: 'Sleek industrial motorcycle with exposed twin cylinder heads, inverted gold racing forks, rim-lit hub wheels, and responsive drift dynamics.'
  }
];

const CAMO_LIVERIES = [
  { id: 'urban_cyber', name: 'Urban Cyberpunk', color: '#00e5ff', bg: 'bg-cyan-950/40 border-cyan-500/50' },
  { id: 'digital_desert', name: 'Digital Desert Spec-Ops', color: '#d97706', bg: 'bg-amber-950/40 border-amber-500/50' },
  { id: 'stealth_matte', name: 'Midnight Stealth Matte', color: '#18181b', bg: 'bg-zinc-900 border-zinc-700' },
  { id: 'arctic_tiger', name: 'Arctic Winter Tiger', color: '#e2e8f0', bg: 'bg-slate-800 border-slate-400' },
  { id: 'gold_elite', name: 'Titanium Carbon Gold', color: '#fde047', bg: 'bg-yellow-950/40 border-yellow-500/50' },
  { id: 'battle_rust', name: 'War-Torn Battle Rust', color: '#78350f', bg: 'bg-amber-900/40 border-orange-700' }
];

export const WarzoneGarageModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('tank');
  const [selectedCamo, setSelectedCamo] = useState<string>('urban_cyber');
  const [activeTab, setActiveTab] = useState<'garage' | 'theaters'>('garage');

  const spawnVehicle = useGameStore(state => state.spawnVehicle);
  const startCombinedArmsBattle = useGameStore(state => state.startCombinedArmsBattle);
  const setSelectedVehicleCamo = useGameStore(state => state.setSelectedVehicleCamo);
  const playerPosition = useGameStore(state => state.playerPosition);

  const currentSpec = VEHICLE_CATALOG.find(v => v.id === selectedVehicle) || VEHICLE_CATALOG[0];

  const handleDeployVehicle = () => {
    setSelectedVehicleCamo(selectedCamo);
    const spawnPos: [number, number, number] = [
      playerPosition[0] + 6,
      playerPosition[1] + (selectedVehicle === 'jet' ? 10 : selectedVehicle === 'helicopter' ? 6 : 2),
      playerPosition[2] + 6
    ];
    spawnVehicle(selectedVehicle, spawnPos, 'blue', selectedCamo);
    soundService.playSFX('powerup');
    onClose();
  };

  const handleLaunchTheater = (theater: 'ground' | 'air' | 'naval' | 'combined') => {
    startCombinedArmsBattle(theater);
    soundService.playSFX('achievement');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col pointer-events-auto select-none font-mono">
      {/* ================= HEADER BAR ================= */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-zinc-950/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                NEON WARZONE GARAGE
              </h1>
              <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-400/30 uppercase tracking-widest">
                COMBINED ARMS EXPANSION
              </span>
            </div>
            <p className="text-xs text-zinc-400 tracking-wide mt-0.5">
              REALISTIC VEHICLE SIMULATION // 3D HANGAR INSPECTION // CAMO CUSTOMIZATION // BATTLE THEATERS
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex">
            <button
              onClick={() => { setActiveTab('garage'); soundService.playSFX('ui_tab'); }}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'garage'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hangar & Garage
            </button>
            <button
              onClick={() => { setActiveTab('theaters'); soundService.playSFX('ui_tab'); }}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'theaters'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Combined-Arms Battles
            </button>
          </div>

          <button
            onClick={() => { soundService.playSFX('ui_click'); onClose(); }}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      {activeTab === 'garage' ? (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* LEFT COLUMN: VEHICLE SELECTOR */}
          <div className="col-span-3 border-r border-white/10 bg-zinc-950/50 p-6 flex flex-col gap-3 overflow-y-auto">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              SELECT VEHICLE CLASS
            </span>

            {VEHICLE_CATALOG.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicle(v.id);
                    soundService.playSFX('ui_click');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-cyan-400 tracking-wider uppercase">
                      {v.category}
                    </span>
                    {isSelected && <CheckCircle2 size={14} className="text-cyan-400" />}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{v.name}</h3>
                  <span className="text-[10px] text-zinc-400 line-clamp-1">{v.role}</span>
                </button>
              );
            })}
          </div>

          {/* CENTER COLUMN: 3D REAL-TIME TURNTABLE VIEWPORT */}
          <div className="col-span-6 relative flex flex-col items-center justify-center bg-radial from-zinc-900 to-black">
            <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <RotateCcw size={14} className="text-cyan-400 animate-spin" />
              <span className="text-zinc-300 font-bold">DRAG MOUSE TO ROTATE & ZOOM 3D MODEL</span>
            </div>

            {/* 3D Canvas Viewport */}
            <div className="w-full h-full">
              <Canvas camera={{ position: [7, 4, 7], fov: 45 }}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[10, 15, 10]} intensity={2.0} castShadow />
                <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#38bdf8" />
                <pointLight position={[0, -2, 0]} intensity={3} color="#00e5ff" distance={10} />

                {/* Grid Floor */}
                <gridHelper args={[20, 20, '#00e5ff', '#1f2937']} position={[0, -0.01, 0]} />

                {/* Vehicle Model */}
                <Suspense fallback={null}>
                  <group position={[0, 0, 0]}>
                    {selectedVehicle === 'tank' && <TankModel camo={selectedCamo} isDriving speed={2} recoil={0.1} />}
                    {selectedVehicle === 'jet' && <FighterJetModel camo={selectedCamo} isDriving isBoosting speed={10} />}
                    {selectedVehicle === 'helicopter' && <AttackHelicopterModel camo={selectedCamo} isDriving />}
                    {selectedVehicle === 'apc' && <ArmoredIFVModel camo={selectedCamo} isDriving speed={3} />}
                    {selectedVehicle === 'gunboat' && <NavalWarshipModel camo={selectedCamo} isDriving speed={3} />}
                    {selectedVehicle === 'car' && <CyberSupercarModel camo={selectedCamo} isDriving isBoosting speed={6} />}
                    {selectedVehicle === 'mech' && <CombatMechModel camo={selectedCamo} isDriving />}
                    {selectedVehicle === 'motorbike' && <CombatMotorbikeModel camo={selectedCamo} isDriving speed={5} />}
                  </group>
                </Suspense>

                <OrbitControls enablePan={false} minDistance={4} maxDistance={18} autoRotate autoRotateSpeed={1.0} />
              </Canvas>
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-6 inset-x-6 flex items-center justify-between pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-xs text-zinc-300">
                ACTIVE LIVERY: <strong className="text-white uppercase">{selectedCamo.replace('_', ' ')}</strong>
              </div>

              <button
                onClick={handleDeployVehicle}
                className="pointer-events-auto px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase text-sm rounded-xl tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all hover:scale-105 active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                DEPLOY & PILOT VEHICLE
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: SPECS & CAMO CUSTOMIZATION */}
          <div className="col-span-3 border-l border-white/10 bg-zinc-950/50 p-6 flex flex-col gap-5 overflow-y-auto">
            {/* Vehicle Details */}
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                TECHNICAL SPECIFICATIONS
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                {currentSpec.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {currentSpec.description}
              </p>
            </div>

            {/* Stats Breakdown */}
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400 font-bold">MAX VELOCITY:</span>
                  <span className="text-white font-black">{currentSpec.topSpeed}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-400 font-bold">ARMOR CAPACITY:</span>
                  <span className="text-emerald-400 font-black">{currentSpec.armorRating}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] font-bold text-zinc-400">PRIMARY ARMAMENT:</div>
                <div className="text-xs font-black text-white mt-0.5">{currentSpec.primaryWeapon}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-400">SECONDARY ARMAMENT:</div>
                <div className="text-xs font-black text-amber-400 mt-0.5">{currentSpec.secondaryWeapon}</div>
              </div>
            </div>

            {/* Camouflage / Livery Customization */}
            <div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                CAMOUFLAGE & LIVERY
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CAMO_LIVERIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCamo(c.id);
                      soundService.playSFX('ui_click');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center gap-2 ${
                      selectedCamo === c.id
                        ? `${c.bg} text-white font-black shadow-[0_0_15px_rgba(255,255,255,0.15)]`
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* THEATERS TAB: MASSIVE COMBINED-ARMS BATTLES */
        <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full flex flex-col gap-6">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              COMBINED-ARMS THEATERS OF WAR
            </h2>
            <p className="text-xs text-zinc-400 mt-2">
              Select an operational battle theater to deploy synchronized multi-branch combined warfare:
              Armor, Aviation, Air Superiority, Naval Interdiction, and All-Out Combined Arms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Ground Supremacy */}
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    THEATER 01 // GROUND ONLY
                  </span>
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase group-hover:text-cyan-400 transition-colors">
                  GROUND SUPREMACY: HEAVY ARMOR CLASH
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Engage in massive mechanized tank battles with T-90M Main Battle Tanks, 8x8 Armored IFVs, and tactical armored support. Utilize sloped armor, reactive tiles, and high-explosive ordnance.
                </p>
                <div className="flex gap-2 mt-4 text-[10px] text-zinc-500">
                  <span>• Tanks vs Tanks</span>
                  <span>• Anti-Tank TOWs</span>
                  <span>• Hull Down Tactics</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchTheater('ground')}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-amber-500 hover:text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Play size={14} fill="currentColor" />
                LAUNCH GROUND SUPREMACY
              </button>
            </div>

            {/* 2. Air Superiority */}
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    THEATER 02 // AIR ONLY
                  </span>
                  <Wind className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase group-hover:text-cyan-400 transition-colors">
                  AIR SUPERIORITY: SUPERSONIC DOGFIGHTS
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  High-altitude supersonic dogfights and rotary gunship interdiction. Pilot F-35 stealth interceptors with Mach 1.8 afterburners, AIM-120 missiles, and AH-64 Viper attack helicopters with Hellfire pods.
                </p>
                <div className="flex gap-2 mt-4 text-[10px] text-zinc-500">
                  <span>• Mach 1+ Afterburners</span>
                  <span>• Radar Lock-on</span>
                  <span>• Flare Countermeasures</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchTheater('air')}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-cyan-400 hover:text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Play size={14} fill="currentColor" />
                LAUNCH AIR SUPERIORITY
              </button>
            </div>

            {/* 3. Naval Strike */}
            <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-blue-400 tracking-wider uppercase bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    THEATER 03 // NAVAL STRIKE
                  </span>
                  <Compass className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase group-hover:text-cyan-400 transition-colors">
                  NAVAL STRIKE: COASTAL BOMBARDMENT
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Stealth warships with wave-piercing tumblehome bows, 76mm rapid-fire naval artillery, and 8-cell deck VLS surface-to-air missile silos patrolling the open ocean and archipelagos.
                </p>
                <div className="flex gap-2 mt-4 text-[10px] text-zinc-500">
                  <span>• 76mm Naval Cannon</span>
                  <span>• VLS Missile Cells</span>
                  <span>• Torpedo Tubes</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchTheater('naval')}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-blue-500 hover:text-white font-black uppercase text-xs rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Play size={14} fill="currentColor" />
                LAUNCH NAVAL STRIKE
              </button>
            </div>

            {/* 4. Combined Arms All-Out Theater */}
            <div className="bg-gradient-to-br from-cyan-950/50 via-zinc-950 to-zinc-950 border-2 border-cyan-400/60 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(6,182,212,0.2)] group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase bg-cyan-500/20 px-3 py-1 rounded-md border border-cyan-400/40">
                    THEATER 04 // ULTIMATE COMBINED ARMS
                  </span>
                  <Flame className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white uppercase group-hover:text-cyan-400 transition-colors">
                  MASSIVE COMBINED-ARMS TOTAL THEATER
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  The complete theater of war! Tanks, Supersonic Jets, Attack Helicopters, Armored IFVs, Mechs, and Naval Gunboats fighting simultaneously across land, air, and sea with dynamic tactical events and capture points!
                </p>
                <div className="flex gap-2 mt-4 text-[10px] text-cyan-400/80 font-bold">
                  <span>• Full Land, Air & Sea Forces</span>
                  <span>• Dynamic Airstrikes</span>
                  <span>• Objective Capture</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchTheater('combined')}
                className="mt-6 w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                <Play size={14} fill="currentColor" />
                LAUNCH COMBINED-ARMS TOTAL WAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
