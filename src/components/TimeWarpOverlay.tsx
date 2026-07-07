import { useGameStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

export function TimeWarpOverlay() {
  const isTimeWarpActive = useGameStore(state => state.isTimeWarpActive);
  const timeWarpExpiry = useGameStore(state => state.timeWarpExpiry);

  if (!isTimeWarpActive) return null;

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Chromatic Aberration & Distortion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-blue-500/5 mix-blend-screen"
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,212,255,0.3)]" />

      {/* Scanning Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />

      {/* Center Indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          className="relative"
        >
          <div className="text-8xl font-black text-blue-400 italic tracking-tighter uppercase opacity-20 blur-sm absolute inset-0">
            TIME WARP
          </div>
          <div className="text-8xl font-black text-white italic tracking-tighter uppercase relative z-10">
            TIME WARP
          </div>
        </motion.div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden w-64">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: (timeWarpExpiry - Date.now()) / 1000, ease: 'linear' }}
              className="h-full bg-blue-400 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
            />
          </div>
          <div className="text-blue-400 font-black text-xs uppercase tracking-widest tabular-nums">
            {Math.max(0, (timeWarpExpiry - Date.now()) / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: Math.random() * 2 + 1, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
