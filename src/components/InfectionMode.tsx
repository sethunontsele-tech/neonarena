import { useEffect } from 'react';
import { useGameStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Shield, Users } from 'lucide-react';

export function InfectionMode() {
  const gameState = useGameStore(state => state.gameState);
  const gameMode = useGameStore(state => state.gameMode);
  const infectionMatchTimer = useGameStore(state => state.infectionMatchTimer);
  const humanSurvivors = useGameStore(state => state.humanSurvivors);
  const isGlitch = useGameStore(state => state.isGlitch);
  const infectionWinner = useGameStore(state => state.infectionWinner);
  const tickInfectionTimer = useGameStore(state => state.tickInfectionTimer);

  if (gameMode !== 'infection' || gameState !== 'playing') return null;

  const minutes = Math.floor(infectionMatchTimer / 60);
  const seconds = Math.floor(infectionMatchTimer % 60);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none">
      {/* Timer & Status */}
      <div className="flex items-center gap-8 bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Time Remaining</div>
          <div className={`text-4xl font-black tabular-nums ${infectionMatchTimer < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="w-px h-10 bg-white/10" />

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Survivors</div>
            <div className="text-3xl font-black text-emerald-400">{humanSurvivors}</div>
          </div>
          <Users className="text-emerald-400" size={24} />
        </div>
      </div>

      {/* Role Indicator */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`px-6 py-2 rounded-full border font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 ${
          isGlitch 
            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
            : 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }`}
      >
        {isGlitch ? (
          <>
            <Skull size={14} />
            Infected: Glitch Entity
          </>
        ) : (
          <>
            <Shield size={14} />
            Survivor: Human Data
          </>
        )}
      </motion.div>

      {/* Objective Message */}
      <AnimatePresence>
        {infectionMatchTimer > 170 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="mt-8 text-center"
          >
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
              {isGlitch ? 'INFECT THE HUMANS' : 'SURVIVE THE PURGE'}
            </h2>
            <p className="text-white/60 text-sm uppercase tracking-widest font-bold">
              {isGlitch ? 'Spread the virus to all survivors' : 'Hold out until the timer reaches zero'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
