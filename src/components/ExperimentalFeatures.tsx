import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore, PetType, PetData } from '../store';
import { Zap, Sparkles, Binary, Cpu, FlaskConical, Github, Globe, Heart, Shield, Sword, Target, Trophy, Wand2, X } from 'lucide-react';

export function ExperimentalFeatures({ onClose }: { onClose: () => void }) {
  const { 
    credits, 
    petFollower, 
    level, 
    persistentStats,
    prestigeLevel,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'pets' | 'evolution' | 'multiverse' | 'stats'>('pets');

  const pets: { type: PetType, name: string, description: string, cost: number, icon: any }[] = [
    { type: 'slime', name: 'Nano Slime', description: 'Regenerates 1 HP every 5 seconds.', cost: 500, icon: Sparkles },
    { type: 'drone', name: 'Tactical Drone', description: 'Pings nearby enemies on the HUD.', cost: 1200, icon: Cpu },
    { type: 'phoenix', name: 'Sol Phoenix', description: 'Grants 20% fire resistance.', cost: 2500, icon: Zap },
    { type: 'void_wisp', name: 'Void Wisp', description: 'Increases mana regen by 15%.', cost: 3000, icon: Binary },
  ];

  return (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">ALPHA 9.0 // EVOLUTION</h2>
            <div className="flex gap-4 items-center mt-2">
              <div className="h-1 w-20 bg-blue-500" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Experimental Multiverse Systems Active</span>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl transition-all">
            <X size={32} className="text-white/40" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 p-6 space-y-2">
            {(['pets', 'evolution', 'multiverse', 'stats'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                    : 'text-white/40 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
            
            <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[8px] font-black text-white/20 uppercase mb-1">Currency</div>
              <div className="text-xl font-black text-amber-400">{credits} CR</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'pets' && (
                <motion.div
                  key="pets"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 gap-6"
                >
                  {pets.map(pet => {
                    const isEquipped = petFollower === pet.type;
                    return (
                      <div 
                        key={pet.type}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 ${
                          isEquipped ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className={`p-4 rounded-2xl ${isEquipped ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>
                            <pet.icon size={32} />
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Type</div>
                            <div className="text-sm font-black text-blue-400 uppercase">{pet.type}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{pet.name}</h4>
                          <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">{pet.description}</p>
                        </div>

                        <button 
                          onClick={() => useGameStore.setState({ petFollower: pet.type as PetType })}
                          disabled={isEquipped}
                          className={`mt-4 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                            isEquipped ? 'bg-zinc-800 text-zinc-500 cursor-default' : 'bg-white text-black hover:bg-blue-400'
                          }`}
                        >
                          {isEquipped ? 'Current Companion' : `Equip for ${pet.cost} CR`}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'evolution' && (
                <motion.div
                  key="evolution"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-8 rounded-[2rem] border border-amber-500/20">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Weapon Mastery</h3>
                    <p className="text-sm text-white/60 mb-6">Advance your tactical capabilities. Each level unlocks hidden parameters.</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {['Firepower', 'Precision', 'Agility'].map(stat => (
                        <div key={stat} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="text-[8px] font-black text-white/20 uppercase mb-2">{stat}</div>
                          <div className="text-xl font-black text-white">+{(level * 0.5).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`p-4 rounded-2xl border ${level >= i ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-white/20 opacity-20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={12} className="text-emerald-400" />
                          <span className="text-[10px] font-black text-white uppercase">Tier {i} unlocked</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'multiverse' && (
                <motion.div
                  key="multiverse"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 gap-4"
                >
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-magenta-500 transition-all">
                    <div className="flex gap-6 items-center">
                       <div className="w-20 h-20 bg-magenta-500/20 rounded-3xl flex items-center justify-center text-magenta-500 border border-magenta-500/40">
                        <Binary size={40} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-white italic uppercase">Dimension 7.1 // Null Point</h4>
                        <p className="text-sm text-white/40 max-w-md">Zero-gravity testing grounds. High mana density. 100% chance of system instability.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        useGameStore.getState().setDimension('dimension_71');
                        onClose();
                      }}
                      className="px-8 py-4 bg-magenta-500 text-white rounded-2xl font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,0,255,0.4)]"
                    >
                      Shift Dimension
                    </button>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 opacity-50 cursor-not-allowed">
                     <div className="flex gap-6 items-center">
                       <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600">
                        <Shield size={40} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-white/40 italic uppercase">Dimension 4.5.9 // Liquid</h4>
                        <p className="text-sm text-white/20 max-w-md text-red-500">ACCESS DENIED. REQUIRED CLEARANCE: LEVEL 50.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/20 uppercase">Global Prestige</span>
              <span className="text-sm font-black text-white">Rank {prestigeLevel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/20 uppercase">Tactical Level</span>
              <span className="text-sm font-black text-amber-400">{level}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
            <Binary size={14} className="animate-pulse" />
            V-Sync Connection Stable // Multiverse v0.9.1
          </div>
        </div>
      </motion.div>
    </div>
  );
}
