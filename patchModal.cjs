const fs = require('fs');
fs.writeFileSync('src/components/BiggestUpdateModal.tsx', `
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Target, Shield, Trophy, Activity, Cpu, Sparkles, Wand2, Sword, FlaskConical, Car, Flame, Rocket, Ghost, Layers, Terminal, Map, Skull, BoomBox } from 'lucide-react';
import { soundService } from '../services/soundService';

export const BiggestUpdateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const features = [
    { icon: <Map />, title: "Massive New Hub & Maps", desc: "Explore the new interconnected Hub, Neon Megacity, Cyber Factory, Abandoned Arena, and more." },
    { icon: <Skull />, title: "7 New Game Modes", desc: "Survival, Boss Rush, Horde, Time Attack, Extraction, Chaos, and customizable Training Mode." },
    { icon: <Cpu />, title: "Advanced Enemies & AI", desc: "Face Phase Hunters, Mimics, Swarm Bots, Titans, and the Adaptive Arena AI with unique tactics." },
    { icon: <Zap />, title: "Epic Boss Battles", desc: "Multi-phase boss fights featuring dynamic arenas, changing attack patterns, and destructible environments." },
    { icon: <Wand2 />, title: "New Arsenal & Abilities", desc: "Energy, Plasma, and Experimental weapons paired with deep combo systems and new abilities." },
    { icon: <Activity />, title: "Expanded Movement", desc: "Chain wall-runs, slides, air dashes, and grapples for unprecedented vertical combat mobility." },
    { icon: <Shield />, title: "Deep Customization", desc: "Dozens of new armor sets, weapon skins, visual effects, and progression unlocks." },
    { icon: <Terminal />, title: "Dynamic Environments", desc: "Real-time weather, alarms, moving machinery, and random events like energy storms and invasions." },
    { icon: <BoomBox />, title: "Audio & VFX Overhaul", desc: "Dynamic music that reacts to intensity, stunning new effects, and optimized asset streaming." },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 border-2 border-emerald-500/30 w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-[0_0_150px_rgba(16,185,129,0.3)] flex flex-col relative overflow-hidden"
      >
        {/* Background Glitch Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-emerald-400 animate-pulse" />
          <div className="absolute bottom-1/4 w-full h-2 bg-emerald-500 animate-bounce" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
        </div>

        {/* Header */}
        <div className="p-8 sm:p-12 pb-0 flex justify-between items-start z-10">
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-2 bg-emerald-500 mb-4 rounded-full"
            />
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-none mb-4">
              INSANE 456 MB<br />
              <span className="text-emerald-500">MEGA EXPANSION</span>
            </h1>
            <div className="text-emerald-400/80 font-black text-xs sm:text-sm uppercase tracking-[0.4em] sm:tracking-[0.5em] ml-2 sm:ml-4">
              Version 2.0.0 // THE AWAKENING
            </div>
          </div>
          <button 
            onClick={() => { onClose(); soundService.playSFX('ui_click'); }}
            className="p-4 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-3xl transition-all"
          >
            <X size={32} />
          </button>
        </div>

        {/* Features Grid */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 pt-8 custom-scrollbar z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-black/40 border border-emerald-500/20 p-6 sm:p-8 rounded-[2rem] hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all group backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  {f.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic mb-2">{f.title}</h3>
                <p className="text-emerald-100/60 text-xs sm:text-sm leading-relaxed font-mono">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 sm:mt-12 p-8 sm:p-12 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[2.5rem] text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={120} /></div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tight mb-4 relative z-10">SECRETS & UNEXPECTED DISCOVERIES</h2>
            <p className="text-emerald-400/80 font-mono text-sm relative z-10">Hundreds of hidden paths, secret rooms, lore-rich Easter eggs, and random encounters have been injected into every layer of the game. Save data is fully compatible. The Arena is alive.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 sm:p-12 pt-0 z-10">
          <button 
            onClick={() => { onClose(); soundService.playSFX('ui_click'); }}
            className="w-full py-5 sm:py-6 bg-emerald-500 text-black font-black text-xl sm:text-2xl uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl hover:bg-emerald-400 transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            ENTER THE EXPANSION
          </button>
        </div>
      </motion.div>
    </div>
  );
};
`);
console.log('Modal patched.');
