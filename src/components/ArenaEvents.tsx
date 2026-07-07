import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Wind, Moon, Sun, ShieldAlert } from 'lucide-react';

export function ArenaEvents() {
  const gameState = useGameStore(state => state.gameState);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [eventExpiry, setEventExpiry] = useState<number>(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const triggerEvent = () => {
      const events = [
        { name: 'DOUBLE DAMAGE', duration: 15000, icon: <Zap size={24} />, color: 'text-amber-500 border-amber-500 bg-amber-500/10' },
        { name: 'LOW GRAVITY', duration: 20000, icon: <Wind size={24} />, color: 'text-blue-400 border-blue-400 bg-blue-400/10' },
        { name: 'SYSTEM BLACKOUT', duration: 10000, icon: <Moon size={24} />, color: 'text-zinc-500 border-zinc-500 bg-zinc-500/10' },
        { name: 'OVERCLOCK MODE', duration: 12000, icon: <Sun size={24} />, color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10' },
        { name: 'SECURITY BREACH', duration: 8000, icon: <ShieldAlert size={24} />, color: 'text-red-500 border-red-500 bg-red-500/10' },
        { name: 'ALIEN PREDATOR', duration: 30000, icon: <AlertTriangle size={24} />, color: 'text-red-600 border-red-600 bg-red-600/10' },
      ];

      const event = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent(event.name);
      setEventExpiry(Date.now() + event.duration);

      // Apply effects to store
      if (event.name === 'DOUBLE DAMAGE') useGameStore.setState({ damageMultiplier: 2 });
      if (event.name === 'LOW GRAVITY') useGameStore.setState({ gravityInverted: true });
      if (event.name === 'SYSTEM BLACKOUT') useGameStore.setState({ blackoutActive: true });
      if (event.name === 'ALIEN PREDATOR') useGameStore.setState({ alienPredatorActive: true });

      setTimeout(() => {
        setCurrentEvent(null);
        // Reset effects
        useGameStore.setState({ damageMultiplier: 1, gravityInverted: false, blackoutActive: false, alienPredatorActive: false });
      }, event.duration);
    };

    // Trigger every 45-90 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) triggerEvent();
    }, 15000);

    return () => clearInterval(interval);
  }, [gameState]);

  if (!currentEvent) return null;

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 1.2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-6 bg-black/80 backdrop-blur-2xl border-2 border-amber-500/50 px-10 py-6 rounded-[2rem] shadow-[0_0_100px_rgba(245,158,11,0.3)]">
            <div className="bg-amber-500 p-3 rounded-2xl animate-pulse">
              <AlertTriangle className="text-black" size={32} />
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">Arena Event Active</div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                {currentEvent}
              </h2>
            </div>
            <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-white/10 relative">
              <svg className="w-full h-full -rotate-90">
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="125.6"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 125.6 }}
                  transition={{ duration: (eventExpiry - Date.now()) / 1000, ease: 'linear' }}
                  className="text-amber-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/40">
                {Math.ceil((eventExpiry - Date.now()) / 1000)}s
              </div>
            </div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] bg-black/40 px-4 py-1 rounded-full border border-white/5"
          >
            System instability detected in sector 7
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
