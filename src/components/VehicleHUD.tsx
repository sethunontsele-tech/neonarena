import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Shield, Gauge, Navigation, Wind, 
  ArrowUp, ArrowDown, Radio, Target, AlertTriangle
} from 'lucide-react';
import { useGameStore } from '../store';

export const VehicleHUD: React.FC = () => {
  const currentVehicleId = useGameStore(state => state.currentVehicleId);
  const vehicles = useGameStore(state => state.vehicles);
  
  if (!currentVehicleId || !vehicles[currentVehicleId]) return null;
  
  const vehicle = vehicles[currentVehicleId];
  const speed = Math.round(vehicle.speed * 3.6); // Convert to km/h
  const healthPercent = (vehicle.health / vehicle.maxHealth) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Speedometer */}
      <div className="absolute bottom-12 right-12 w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke={speed > 120 ? '#ef4444' : '#f59e0b'}
            strokeWidth="8"
            strokeDasharray="502.4"
            initial={{ strokeDashoffset: 502.4 }}
            animate={{ strokeDashoffset: 502.4 - (speed / 200) * 502.4 }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white tracking-tighter">{speed}</span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">KM/H</span>
        </div>
      </div>

      {/* Vehicle Stats */}
      <div className="absolute bottom-12 left-12 space-y-4">
        <div className="w-64 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                <Gauge size={16} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vehicle Status</h4>
                <p className="text-xs font-bold text-white uppercase">{vehicle.type}</p>
              </div>
            </div>
            {healthPercent < 30 && (
              <motion.div 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-red-500"
              >
                <AlertTriangle size={20} />
              </motion.div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                <span>Hull Integrity</span>
                <span className={healthPercent < 30 ? 'text-red-500' : 'text-white'}>{Math.round(healthPercent)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  className={`h-full transition-all ${healthPercent < 30 ? 'bg-red-500' : 'bg-amber-500'}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                <span>Boost Pressure</span>
                <span className="text-white">85%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="flex gap-2">
          <ControlHint key="W" label="Accelerate" />
          <ControlHint key="S" label="Brake" />
          <ControlHint key="SHIFT" label="Boost" />
          <ControlHint key="E" label="Exit" />
        </div>
      </div>

      {/* Crosshair / Target Info for Helicopter */}
      {vehicle.type === 'helicopter' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/10" />
            <div className="absolute h-full w-[1px] bg-white/10" />
            <div className="w-4 h-4 border border-amber-500/50 rounded-full" />
            
            {/* Altitude/Depth Indicator */}
            <div className="absolute right-[-40px] h-32 w-8 bg-black/40 border border-white/10 rounded-lg flex flex-col items-center py-2">
              <ArrowUp size={12} className="text-zinc-500" />
              <div className="flex-1 w-[1px] bg-white/10 my-1 relative">
                <motion.div 
                  animate={{ top: `${50 + Math.sin(Date.now() / 1000) * 30}%` }}
                  className="absolute left-1/2 -translate-x-1/2 w-4 h-[1px] bg-amber-500"
                />
              </div>
              <ArrowDown size={12} className="text-zinc-500" />
              <span className="text-[8px] font-bold text-white mt-1">420m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ControlHint: React.FC<{ key: string; label: string }> = ({ key, label }) => (
  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5">
    <span className="text-[10px] font-black text-black bg-white px-1.5 py-0.5 rounded leading-none">{key}</span>
    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
  </div>
);
