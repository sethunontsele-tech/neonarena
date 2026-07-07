import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { Map as MapIcon, Users, Target, Shield } from 'lucide-react';

export function TacticalMap({ onClose }: { onClose: () => void }) {
  const { playerPosition, otherPlayers, enemies, selectedMap } = useGameStore();
  
  // Normalize positions to fit in a 200x200 map
  const normalize = (pos: [number, number, number]) => {
    const scale = 0.5;
    return {
      x: 100 + pos[0] * scale,
      y: 100 + pos[2] * scale
    };
  };

  const pPos = normalize(playerPosition);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-[120] flex items-center justify-center p-8 pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-950 border border-white/10 rounded-[3rem] p-12 w-full max-w-4xl h-[80vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">TACTICAL OVERLAY</h2>
            <div className="text-blue-400 font-black text-xs tracking-[0.5em] mt-2 uppercase">Real-time Satellite Feed Active // {selectedMap} Sector</div>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white font-black uppercase text-xs tracking-widest transition-all"
          >
            Collapse Feed
          </button>
        </div>

        <div className="flex-1 flex gap-12 overflow-hidden">
          {/* Map Grid */}
          <div className="relative flex-1 bg-black rounded-[2rem] border border-white/5 overflow-hidden shadow-inner">
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            
            {/* Player */}
            <motion.div 
              className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-10"
              style={{ left: `${pPos.x}%`, top: `${pPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50" />
            </motion.div>

            {/* Other Players */}
            {Object.values(otherPlayers).map(player => {
              const pos = normalize(player.position);
              return (
                <div 
                  key={player.id}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                />
              );
            })}

            {/* Enemies */}
            {enemies.map(enemy => {
              const pos = normalize(enemy.position);
              return (
                <div 
                  key={enemy.id}
                  className="absolute w-1.5 h-1.5 bg-red-500 rounded-full opacity-50"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                />
              );
            })}
          </div>

          {/* Intel Panel */}
          <div className="w-80 space-y-6 flex flex-col">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Signatures</span>
                </div>
                <div className="text-3xl font-black text-white">{Object.keys(otherPlayers).length + 1}</div>
            </div>

             <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={16} className="text-red-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Threat Level</span>
                </div>
                <div className="text-3xl font-black text-red-500">{enemies.length > 5 ? 'CRITICAL' : 'STABLE'}</div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 rounded-[2rem] border border-blue-500/20 flex flex-col justify-end">
                <div className="text-[8px] font-black text-white/40 uppercase mb-2">Satellite Status</div>
                <div className="text-xs font-black text-white uppercase tracking-widest leading-relaxed">
                  Encryption Layer 9 Enabled.<br/>
                  Frequency hopping active.<br/>
                  Signal strength: 99.9%
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
