import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../services/soundService';

export function AwakeningEvent({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence
    soundService.playSFX('explosion');
    setTimeout(() => {
      setPhase(1);
      soundService.playSFX('powerup');
    }, 2000);

    setTimeout(() => {
      setPhase(2);
      soundService.playSFX('killstreak');
    }, 4000);

    setTimeout(() => {
      onComplete();
    }, 7000);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[400] pointer-events-none flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {phase === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-950 flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-emerald-500 font-black text-6xl md:text-9xl uppercase tracking-tighter"
            >
              WARNING
            </motion.div>
            <div className="text-emerald-400 mt-4 font-mono text-xl md:text-3xl animate-pulse uppercase">
              Core Expansion Detected (456 MB)
            </div>
          </motion.div>
        )}
        
        {phase === 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center mix-blend-difference"
          >
            <h1 className="text-black font-black text-7xl md:text-[150px] uppercase italic tracking-tighter leading-none text-center">
              NEON ARENA<br/>IS NOW
            </h1>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <h1 className="text-emerald-400 font-black text-8xl md:text-[200px] uppercase italic tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(16,185,129,0.8)]">
              MASSIVE
            </h1>
            <div className="text-white font-mono text-2xl mt-8">
              Welcome to Version 2.0.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
