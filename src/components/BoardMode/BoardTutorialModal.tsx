import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Sword, 
  Users, 
  Compass, 
  Sparkles, 
  Gamepad2, 
  Glasses, 
  Smartphone,
  Crown
} from 'lucide-react';

interface BoardTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardTutorialModal: React.FC<BoardTutorialModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const TUTORIAL_STEPS = [
    {
      title: "WELCOME TO BOARD MODE",
      icon: <Shield className="text-amber-400" size={32} />,
      content: "BOARD is a fast-paced, real-time fantasy strategy and tactical battle mode. Battles take place across three active lanes on a living physical strategy board. Your objective is to deploy soldiers and heroes, outmaneuver enemy defenses, and destroy the enemy Core Citadel."
    },
    {
      title: "CLUSTER COMMAND SYSTEM",
      icon: <Users className="text-cyan-400" size={32} />,
      content: "Instead of micromanaging every single unit one-by-one, BOARD features the groundbreaking Cluster Command System! When you tap or click any unit, all nearby allies form a cohesive squad. You can issue simultaneous orders to the entire group: Attack Move, Retreat, Flank, Push Lane, or Defend Area."
    },
    {
      title: "TACTICAL FORMATIONS",
      icon: <Compass className="text-emerald-400" size={32} />,
      content: "Adapt your cluster's geometry in real time! Switch between 'Shield Wall' to absorb heavy frontal fire, 'Wedge' for concentrated spearhead breakthroughs, 'Flank Pincer' to envelop enemy archers, or 'Spread' to disperse your units and avoid catastrophic AoE meteor and fireball damage."
    },
    {
      title: "HEROES & ANCIENT ARTIFACTS",
      icon: <Sparkles className="text-purple-400" size={32} />,
      content: "Lead your armies with legendary Heroes whose presence inspires nearby soldiers. When the battle reaches a tipping point, trigger your equipped Artifacts: rain catastrophic Meteors, freeze time with the Chrono Hourglass, or bestow team-wide divine shields to secure victory!"
    },
    {
      title: "CROSS-PLATFORM (PC, MOBILE & VR)",
      icon: <Glasses className="text-rose-400" size={32} />,
      content: "Play seamlessly anywhere! On PC, enjoy classic RTS mouse and keyboard controls. On Mobile, use smooth touch-and-drag lane deployment. In VR / Tabletop mode, stand over a holographic physical strategy table with Mixed Reality room passthrough support!"
    }
  ];

  const current = TUTORIAL_STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col justify-between min-h-[400px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Step Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 shadow-lg">
            {current.icon}
          </div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">
            STEP {step + 1} OF {TUTORIAL_STEPS.length}
          </span>
          <h3 className="text-xl font-black uppercase italic tracking-wide text-white mt-1">
            {current.title}
          </h3>
          <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-md">
            {current.content}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
          <button
            disabled={step === 0}
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-all"
          >
            <ChevronLeft size={16} /> PREVIOUS
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === i ? 'bg-amber-400 w-5' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {step < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => Math.min(TUTORIAL_STEPS.length - 1, s + 1))}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400 text-black hover:scale-105 transition-all"
            >
              NEXT <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold hover:scale-105 transition-all shadow-md"
            >
              LET'S BATTLE!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
