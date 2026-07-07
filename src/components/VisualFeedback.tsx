import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';

export const VisualFeedback: React.FC = () => {
  const health = useGameStore(state => state.health);
  const isReloading = useGameStore(state => state.isReloading);
  const isAttacking = useGameStore(state => state.isAttacking);
  const bloodSplatter = useGameStore(state => state.bloodSplatter);
  const beingEaten = useGameStore(state => state.beingEaten);
  const gameState = useGameStore(state => state.gameState);
  
  const [prevHealth, setPrevHealth] = useState(health);
  const [showDamageFlash, setShowDamageFlash] = useState(false);

  useEffect(() => {
    if (health < prevHealth) {
      setShowDamageFlash(true);
      setTimeout(() => setShowDamageFlash(false), 200);
    }
    setPrevHealth(health);
  }, [health, prevHealth]);

  if (gameState !== 'playing') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {/* Damage Flash */}
      <AnimatePresence>
        {showDamageFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* Blood Splatter */}
      <AnimatePresence>
        {bloodSplatter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center p-20"
          >
             <div className="w-full h-full border-[80px] border-red-900/40 rounded-full blur-[100px]" />
             <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-800/20 blur-[40px] rounded-full" />
             <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-red-900/30 blur-[50px] rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Health Low Vignette */}
      {health < 30 && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 shadow-[inset_0_0_150px_rgba(220,38,38,0.5)]"
        />
      )}

      {/* Being Eaten Effect */}
      <AnimatePresence>
        {beingEaten && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100]"
          >
            {/* Top Jaw */}
            <motion.div 
              initial={{ y: -300 }}
              animate={{ y: 0 }}
              exit={{ y: -300 }}
              transition={{ duration: 0.2, ease: "circIn" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-black flex items-end justify-center pb-4 border-b-8 border-red-900"
            >
              <div className="flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-8 h-32 bg-zinc-200 rounded-b-full shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                ))}
              </div>
            </motion.div>
            {/* Bottom Jaw */}
            <motion.div 
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ duration: 0.2, ease: "circIn" }}
              className="absolute bottom-0 left-0 w-full h-1/2 bg-black flex items-start justify-center pt-4 border-t-8 border-red-900"
            >
              <div className="flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-8 h-32 bg-zinc-200 rounded-t-full shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(50% 0%, 0 100%, 100% 100%)' }} />
                ))}
              </div>
            </motion.div>
            
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="text-6xl font-black text-red-600 italic uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]"
               >
                 Consumed
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reloading Feedback */}
      <AnimatePresence>
        {isReloading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Reloading...</div>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="h-full bg-amber-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ability Usage Pulse */}
      <AnimatePresence>
        {isAttacking && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-64 h-64 border-4 border-blue-400 rounded-full blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Speed Lines (optional effect for sprinting) */}
      <SpeedLines />
    </div>
  );
};

const SpeedLines: React.FC = () => {
  const isSprinting = useGameStore(state => state.isSprinting);
  if (!isSprinting) return null;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: Math.random() * 200 - 100 + "%", y: Math.random() * 200 - 100 + "%", opacity: 0 }}
          animate={{ x: "0%", y: "0%", opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() }}
          className="absolute w-px h-24 bg-white rotate-45"
          style={{
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
        />
      ))}
    </div>
  );
};
