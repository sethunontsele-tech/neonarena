import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Shield, Gauge, Navigation, Wind, 
  ArrowUp, ArrowDown, Radio, Target, AlertTriangle,
  Crosshair, Disc, Wrench, Volume2, Flame, RefreshCw
} from 'lucide-react';
import { useGameStore } from '../store';

export const VehicleHUD: React.FC = () => {
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const vehicles = useGameStore(state => state.vehicles);
  const repairVehicle = useGameStore(state => state.repairVehicle);
  const deployVehicleFlares = useGameStore(state => state.deployVehicleFlares);

  const [attitudePitch, setAttitudePitch] = useState(0);
  const [attitudeRoll, setAttitudeRoll] = useState(0);
  const [headingDeg, setHeadingDeg] = useState(0);

  if (!currentVehicleId || !vehicles[currentVehicleId]) return null;

  const vehicle = vehicles[currentVehicleId];
  const speed = Math.round((vehicle.speed || 0) * 3.6); // Convert to km/h
  const healthPercent = Math.max(0, Math.min(100, (vehicle.health / vehicle.maxHealth) * 100));
  const altitude = Math.round(Math.max(0, vehicle.position[1] * 3.28)); // Feet/meters

  const comps = vehicle.components || {
    engine: 100,
    hull: 100,
    turret: 100,
    treads: 100,
    optics: 100
  };

  // Heading calculation based on vehicle Y rotation
  const heading = Math.round(((-vehicle.rotation[1] * 180) / Math.PI + 360) % 360);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none font-mono">
      {/* ================= TOP COMPASS HEADING TAPE ================= */}
      <div className="absolute top-6 inset-x-0 flex flex-col items-center">
        <div className="w-80 h-10 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400" />
          <div className="flex items-center justify-center w-full gap-6 text-xs font-bold text-cyan-400/70">
            <span>{((heading - 40 + 360) % 360).toString().padStart(3, '0')}°</span>
            <span>{((heading - 20 + 360) % 360).toString().padStart(3, '0')}°</span>
            <span className="text-white font-black text-sm bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/50">
              {heading.toString().padStart(3, '0')}° {getCardinal(heading)}
            </span>
            <span>{((heading + 20) % 360).toString().padStart(3, '0')}°</span>
            <span>{((heading + 40) % 360).toString().padStart(3, '0')}°</span>
          </div>
        </div>
        <span className="text-[9px] font-black text-cyan-400 tracking-widest mt-1 uppercase">
          NAV COMPASS // {vehicle.type.toUpperCase()} TACTICAL AVIONICS
        </span>
      </div>

      {/* ================= CENTER ARTIFICIAL HORIZON / RETICLE ================= */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-72 h-72 flex items-center justify-center pointer-events-none">
          {/* Pitch Ladder bars */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60">
            <div className="w-24 h-[1px] bg-cyan-400/80 mb-6 flex justify-between">
              <span className="text-[8px] text-cyan-400 -mt-2">+10°</span>
              <span className="text-[8px] text-cyan-400 -mt-2">+10°</span>
            </div>
            {/* Horizon Center Line */}
            <div className="w-36 h-[2px] bg-emerald-400 flex items-center justify-between">
              <div className="w-3 h-3 border-l-2 border-t-2 border-emerald-400 -ml-1 -mt-1" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="w-3 h-3 border-r-2 border-t-2 border-emerald-400 -mr-1 -mt-1" />
            </div>
            <div className="w-24 h-[1px] bg-cyan-400/80 mt-6 flex justify-between">
              <span className="text-[8px] text-cyan-400 -mt-2">-10°</span>
              <span className="text-[8px] text-cyan-400 -mt-2">-10°</span>
            </div>
          </div>

          {/* Lead Fire / Targeting Box */}
          <div className="w-8 h-8 border border-cyan-400/50 rounded-sm flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </div>

          {/* Altimeter Tape (Right side) */}
          <div className="absolute right-0 h-36 w-12 bg-black/60 border border-cyan-500/20 rounded-lg flex flex-col items-center justify-between py-2 text-[10px] text-cyan-400">
            <ArrowUp size={12} className="text-cyan-400" />
            <div className="flex flex-col items-center">
              <span className="font-black text-white text-xs">{altitude}</span>
              <span className="text-[8px] text-cyan-400/60 font-bold">ALT M</span>
            </div>
            <ArrowDown size={12} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* ================= BOTTOM LEFT: COMPONENT DAMAGE SCHEMATIC ================= */}
      <div className="absolute bottom-8 left-8 space-y-3 pointer-events-auto">
        <div className="w-72 bg-black/75 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Shield size={16} className="text-cyan-400" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">COMPONENT INTEGRITY</h4>
                <p className="text-xs font-bold text-white uppercase">{vehicle.type} // {vehicle.camo || 'CAMO'}</p>
              </div>
            </div>
            <span className={`text-sm font-black ${healthPercent < 35 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {Math.round(healthPercent)}%
            </span>
          </div>

          {/* Health Bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3 border border-white/5">
            <div
              className={`h-full transition-all duration-300 ${
                healthPercent < 30 ? 'bg-red-500' : healthPercent < 60 ? 'bg-amber-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>

          {/* 5-Component Diagnostic Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between">
              <span className="text-zinc-400 font-bold">ENGINE:</span>
              <span className={comps.engine < 40 ? 'text-red-400 font-black' : 'text-cyan-400 font-black'}>{comps.engine}%</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between">
              <span className="text-zinc-400 font-bold">TURRET:</span>
              <span className={comps.turret < 40 ? 'text-red-400 font-black' : 'text-cyan-400 font-black'}>{comps.turret}%</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between">
              <span className="text-zinc-400 font-bold">TREADS/LIFT:</span>
              <span className={comps.treads < 40 ? 'text-red-400 font-black' : 'text-cyan-400 font-black'}>{comps.treads}%</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between">
              <span className="text-zinc-400 font-bold">OPTICS:</span>
              <span className={comps.optics < 40 ? 'text-red-400 font-black' : 'text-cyan-400 font-black'}>{comps.optics}%</span>
            </div>
          </div>

          {/* Weapon / Countermeasures Row */}
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Crosshair size={14} className="text-cyan-400" />
              <span>AMMO: <strong className="text-white">{vehicle.ammo ?? 40}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Disc size={14} className="text-amber-400" />
              <span>FLARES: <strong className="text-white">{vehicle.flares ?? 6}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Tactical Controls Bar */}
        <div className="flex flex-wrap gap-1.5 max-w-sm">
          <ControlBadge keyLabel="W/S" action="Drive / Throttle" />
          <ControlBadge keyLabel="A/D" action="Steer / Yaw" />
          <ControlBadge keyLabel="SHIFT" action="Boost / Afterburner" highlight />
          <ControlBadge keyLabel="SPACE" action="Lift / Fire / Handbrake" />
          <ControlBadge keyLabel="LMB" action="Primary Cannon" />
          <ControlBadge keyLabel="X" action="Flares [X]" />
          <ControlBadge keyLabel="R" action="Field Repair [R]" />
          <ControlBadge keyLabel="H" action="Siren [H]" />
          <ControlBadge keyLabel="E" action="Exit [E]" />
        </div>
      </div>

      {/* ================= BOTTOM RIGHT: SPEEDOMETER & TACHOMETER ================= */}
      <div className="absolute bottom-8 right-8 flex items-end gap-4 pointer-events-none">
        <div className="relative w-48 h-48 bg-black/75 backdrop-blur-md border border-cyan-500/30 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.2)]">
          <svg className="w-full h-full transform -rotate-90 absolute inset-0">
            <circle
              cx="96"
              cy="96"
              r="82"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="96"
              cy="96"
              r="82"
              fill="none"
              stroke={speed > 160 ? '#ef4444' : speed > 90 ? '#f59e0b' : '#00e5ff'}
              strokeWidth="8"
              strokeDasharray="515"
              strokeDashoffset={515 - Math.min(1, speed / 240) * 515}
              className="transition-all duration-150"
            />
          </svg>

          <div className="flex flex-col items-center">
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              {speed}
            </span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">KM / H</span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
              {speed > 180 ? 'SUPERSONIC // MACH 1+' : 'CRUISE SPEED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlBadge: React.FC<{ keyLabel: string; action: string; highlight?: boolean }> = ({ keyLabel, action, highlight }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border text-[10px] font-mono ${
    highlight
      ? 'bg-cyan-500/20 border-cyan-400 text-white font-black'
      : 'bg-black/60 border-white/10 text-zinc-300 font-medium'
  }`}>
    <span className="bg-white/20 px-1 py-0.5 rounded text-[9px] font-bold text-white leading-none">{keyLabel}</span>
    <span>{action}</span>
  </div>
);

function getCardinal(deg: number): string {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return cardinals[Math.round(deg / 45) % 8];
}
