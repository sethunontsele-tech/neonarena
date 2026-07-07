import { useGameStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Skull, Flame, ShieldAlert, Cpu } from 'lucide-react';

export function KillstreakHUD() {
  const currentKillStreak = useGameStore(state => state.currentKillStreak);
  const activeStreakPower = useGameStore(state => state.activeStreakPower);
  const streakPowerExpiry = useGameStore(state => state.streakPowerExpiry);
  const gameState = useGameStore(state => state.gameState);

  if (gameState !== 'playing') return null;

  const getPowerIcon = (power: string) => {
    switch (power) {
      case 'OVERCLOCKED': return <Zap size={16} />;
      case 'DATA SURGE': return <Flame size={16} />;
      case 'SYSTEM BREACH': return <Cpu size={16} />;
      case 'GOD MODE': return <ShieldAlert size={16} />;
      default: return null;
    }
  };

  const getPowerColor = (power: string) => {
    switch (power) {
      case 'OVERCLOCKED': return 'text-amber-400 border-amber-400 bg-amber-400/10';
      case 'DATA SURGE': return 'text-red-400 border-red-400 bg-red-400/10';
      case 'SYSTEM BREACH': return 'text-blue-400 border-blue-400 bg-blue-400/10';
      case 'GOD MODE': return 'text-purple-400 border-purple-400 bg-purple-400/10 shadow-[0_0_20px_rgba(168,85,247,0.4)]';
      default: return 'text-white border-white/10 bg-white/5';
    }
  };

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none">
      {/* Current Streak Indicator */}
      <AnimatePresence mode="wait">
        {currentKillStreak >= 2 && (
          <motion.div
            key={currentKillStreak}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-amber-500/30 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Flame className="text-amber-500 animate-pulse" size={20} />
              <div className="flex flex-col items-start leading-none">
                <div className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em]">Killstreak</div>
                <div className="text-2xl font-black text-white italic tracking-tighter">{currentKillStreak}X</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Power-up */}
      <AnimatePresence>
        {activeStreakPower && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className={`flex items-center gap-3 border px-4 py-2 rounded-xl backdrop-blur-xl shadow-2xl ${getPowerColor(activeStreakPower)}`}
          >
            {getPowerIcon(activeStreakPower)}
            <div className="flex flex-col">
              <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{activeStreakPower.replace('_', ' ')}</div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden w-24">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: (streakPowerExpiry - Date.now()) / 1000, ease: 'linear' }}
                  className="h-full bg-current"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
