import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Target, Shield, Trophy, Activity, Cpu, Sparkles, Wand2, Sword, FlaskConical, Car, Flame, Rocket, Ghost, Layers, Terminal } from 'lucide-react';
import { soundService } from '../services/soundService';

export const BiggestUpdateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const features = [
    { icon: <Zap />, title: "Casino System", desc: "Bet your hard-earned coins and win big with our new 50/50 gambling system." },
    { icon: <Rocket />, title: "Space Dimension", desc: "Launch yourself into orbit with the new Rocket system and low-gravity physics." },
    { icon: <Flame />, title: "Inferno Mode", desc: "Dynamic heat-haze and environmental damage in the volcano dimension." },
    { icon: <Ghost />, title: "Stealth Mechanics", desc: "New perks allowing players to vanish from the radar for short periods." },
    { icon: <Shield />, title: "Energy Shielding", desc: "Double-layered protection systems that regenerate over time." },
    { icon: <Terminal />, title: "Vijo Logic", desc: "Enhanced AI and dimension-shifting algorithms for smoother transitions." },
    { icon: <Sword />, title: "Dual Wielding", desc: "Equip dual blasters for 2x fire rate." },
    { icon: <Layers />, title: "Multi-Dimensions", desc: "12 distinct dimensions with unique physics, mana rates, and visuals." },
    { icon: <Cpu />, title: "Bot Overhaul", desc: "bots now have adaptive strategy, aggression, and tactical cover systems." },
    { icon: <Target />, title: "Dynamic FOV", desc: "Speed-based field of view changes for high-intensity movement." },
    { icon: <Sparkles />, title: "Visual Overhaul", desc: "Refined bloom, post-processing, and dimension-specific atmospheric fog." },
    { icon: <Car />, title: "Vehicle Combat", desc: "Summon and drive tanks, helicopters, and bikes in real-time." },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-6 overflow-hidden pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 border border-white/10 w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-[0_0_150px_rgba(37,99,235,0.2)] flex flex-col relative overflow-hidden"
      >
        {/* Background Glitch Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 w-full h-1 bg-white animate-pulse" />
          <div className="absolute bottom-1/4 w-full h-2 bg-blue-500 animate-bounce" />
        </div>

        {/* Header */}
        <div className="p-12 pb-0 flex justify-between items-start">
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-1 bg-blue-500 mb-4"
            />
            <h1 className="text-8xl font-black text-white italic tracking-tighter leading-none mb-4">
              THE BIGGEST UPDATE<br />
              <span className="text-blue-500">IN NEON HISTORY</span>
            </h1>
            <div className="text-white/40 font-black text-sm uppercase tracking-[0.5em] ml-4">
              Version 1.5.0 // THE OMNI-REACH
            </div>
          </div>
          <button 
            onClick={() => { onClose(); soundService.playSFX('ui_click'); }}
            className="p-4 bg-white/5 hover:bg-white hover:text-black rounded-3xl transition-all"
          >
            <X size={32} />
          </button>
        </div>

        {/* Features Grid */}
        <div className="flex-1 overflow-y-auto p-12 pt-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-black transition-all">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 p-12 bg-blue-500/10 border-2 border-blue-500/20 rounded-[2.5rem] text-center">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tight mb-4">+300 MORE SYSTEM REVISIONS</h2>
            <p className="text-blue-400/60 font-medium">FIXED PHYSICS STABILITY • IMPROVED SHADER PIPELINE • GLOBAL OPTIMIZATION • ENHANCED ANTI-CHEAT • DIMENSION CONFLICT RESOLUTION</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-12 pt-0">
          <button 
            onClick={() => { onClose(); soundService.playSFX('ui_click'); }}
            className="w-full py-6 bg-white text-black font-black text-2xl uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-500 transition-all hover:scale-[1.01]"
          >
            INITIALIZE V1.5.0
          </button>
        </div>
      </motion.div>
    </div>
  );
};
