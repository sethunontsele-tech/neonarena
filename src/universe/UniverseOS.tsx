/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MEGA_FEATURES_200, MegaFeature } from './featureData';
import { 
  Search, 
  Cpu, 
  Globe, 
  Zap, 
  Shield, 
  Layers, 
  Sparkles, 
  Sliders, 
  Play, 
  CheckCircle2, 
  X, 
  Terminal as TerminalIcon, 
  Database, 
  Activity, 
  Boxes, 
  Code, 
  Server 
} from 'lucide-react';

export function UniverseOS({ onClose, onLaunchPoker }: { onClose: () => void; onLaunchPoker: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFeature, setActiveFeature] = useState<MegaFeature | null>(MEGA_FEATURES_200[0]);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'SYSTEM INITIALIZED: Neon Arena Universe OS v4.2 Loaded',
    'DATABASE: 200/200 Mega-Universe Modules Active & Operational',
    'NETWORK: Local & Cloud Synchronization Online'
  ]);

  const categories = ['ALL', ...Array.from(new Set(MEGA_FEATURES_200.map(f => f.category)))];

  const filteredFeatures = MEGA_FEATURES_200.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSimulateFeature = (feature: MegaFeature) => {
    setActiveFeature(feature);
    const newLog = `[${new Date().toLocaleTimeString()}] EXECUTED MODULE #${feature.id}: ${feature.title} [Status: OK]`;
    setSimulationLogs(prev => [newLog, ...prev].slice(0, 30));

    if (feature.id === 51 || feature.title.toLowerCase().includes('poker')) {
      onLaunchPoker();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[125] flex items-center justify-center p-4 select-none pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-7xl h-[92vh] bg-zinc-950 border-2 border-amber-500/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(245,158,11,0.25)] flex flex-col text-white"
      >
        {/* Top OS Title Header */}
        <div className="bg-zinc-900/90 border-b border-amber-500/30 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black italic tracking-wider text-amber-400 uppercase">NEON ARENA UNIVERSE OS</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold rounded border border-amber-400/40 uppercase">200 FEATURES ACTIVE</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Next-Gen Universe Command Center & Simulation Sandbox Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchPoker}
              className="px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400/50 text-cyan-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer flex items-center gap-2"
            >
              <span>🎴 LAUNCH CYBER POKER</span>
            </button>

            <button onClick={onClose} className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* OS Search & Category Toolbar */}
        <div className="bg-black/60 border-b border-white/10 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search 200 Universe Features (AI, Space, Physics, Poker, Magic)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                    : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Feature Card Grid */}
          <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feat) => (
              <motion.div
                key={feat.id}
                onClick={() => handleSimulateFeature(feat)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeFeature?.id === feat.id 
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                    : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/40 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{feat.icon}</span>
                    <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-black/60 border border-white/10 text-amber-300 uppercase">
                      #{feat.id}
                    </span>
                  </div>

                  <h3 className="text-sm font-black italic tracking-wide text-white uppercase mb-1">{feat.title}</h3>
                  <p className="text-[11px] font-mono text-zinc-400 leading-snug line-clamp-2">{feat.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">{feat.category}</span>
                  <div className="flex items-center gap-1 text-[9px] font-black font-mono text-amber-400 uppercase">
                    <Play size={10} />
                    <span>RUN MODULE</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Simulation & Terminal Inspector */}
          <div className="w-96 bg-black/80 border-l border-amber-500/20 p-6 flex flex-col justify-between space-y-6">
            {/* Active Feature Detail Inspector */}
            {activeFeature && (
              <div className="bg-zinc-900/80 border border-amber-500/30 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{activeFeature.icon}</div>
                  <div>
                    <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">MODULE #{activeFeature.id} ACTIVE</span>
                    <h3 className="text-base font-black italic text-white uppercase leading-tight">{activeFeature.title}</h3>
                  </div>
                </div>

                <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  {activeFeature.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeFeature.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/30 rounded text-[9px] font-mono font-bold text-amber-300 uppercase">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleSimulateFeature(activeFeature)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={14} />
                  <span>EXECUTE SIMULATION</span>
                </button>
              </div>
            )}

            {/* Live Terminal Activity Log */}
            <div className="flex-1 bg-black rounded-2xl border border-zinc-800 p-4 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2 text-zinc-400 text-[10px] font-mono font-bold uppercase">
                <TerminalIcon size={12} className="text-amber-400" />
                <span>UNIVERSE COMMAND LOG</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] text-emerald-400/90 leading-tight">
                {simulationLogs.map((log, idx) => (
                  <div key={idx} className="break-all">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
