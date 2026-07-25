/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { Users, Target, MapPin, AlertTriangle, Box, Compass } from 'lucide-react';

export function TacticalMap({ onClose }: { onClose: () => void }) {
  const { playerPosition, otherPlayers, enemies, selectedMap, pings, addPing } = useGameStore();
  const [selectedPingType, setSelectedPingType] = useState<'generic' | 'danger' | 'loot'>('generic');

  // Normalize positions to fit in a 200x200 map
  const normalize = (pos: [number, number, number]) => {
    const scale = 0.5;
    return {
      x: 100 + pos[0] * scale,
      y: 100 + pos[2] * scale
    };
  };

  const pPos = normalize(playerPosition);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert map percentage back to world position [x, y, z]
    const scale = 0.5;
    const worldX = (clickXPercent - 100) / scale;
    const worldZ = (clickYPercent - 100) / scale;

    let label = 'TACTICAL MARKER';
    if (selectedPingType === 'danger') label = 'HOSTILE TARGET';
    if (selectedPingType === 'loot') label = 'SUPPLY CACHE';

    addPing([worldX, 0, worldZ], selectedPingType, label);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl z-[120] flex items-center justify-center p-8 pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.9)]"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">TACTICAL OVERLAY</h2>
            <div className="text-blue-400 font-black text-xs tracking-[0.4em] mt-2 uppercase">Real-time Satellite Command Feed // {selectedMap} Sector</div>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white font-black uppercase text-xs tracking-widest transition-all cursor-pointer"
          >
            Collapse Feed
          </button>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
          {/* Map Grid */}
          <div 
            onClick={handleMapClick}
            className="relative flex-1 bg-black rounded-[2rem] border border-blue-500/30 overflow-hidden shadow-inner cursor-crosshair group"
          >
            <div className="absolute inset-0 opacity-15" style={{ 
              backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px'
            }} />
            
            {/* Compass / Instructions */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-2 pointer-events-none">
              <Compass size={14} className="text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>CLICK MAP TO PLACE TACTICAL PING</span>
            </div>

            {/* Player Marker */}
            <motion.div 
              className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-20 pointer-events-none"
              style={{ left: `${pPos.x}%`, top: `${pPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-60" />
            </motion.div>

            {/* Other Players */}
            {Object.values(otherPlayers).map(player => {
              const pos = normalize(player.position);
              return (
                <div 
                  key={player.id}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10 pointer-events-none"
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
                  className="absolute w-2 h-2 bg-red-500 rounded-full opacity-70 z-10 pointer-events-none"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                />
              );
            })}

            {/* Active Pings on Map */}
            {pings.map(ping => {
              const pos = normalize(ping.position);
              const isDanger = ping.type === 'danger';
              const isLoot = ping.type === 'loot';
              const colorClass = isDanger ? 'bg-red-500 text-red-400 border-red-500' : isLoot ? 'bg-blue-500 text-blue-400 border-blue-500' : 'bg-amber-400 text-amber-400 border-amber-400';

              const dist = Math.round(Math.hypot(
                playerPosition[0] - ping.position[0],
                playerPosition[2] - ping.position[2]
              ));

              return (
                <motion.div
                  key={ping.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute z-30 pointer-events-none flex flex-col items-center"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`w-4 h-4 rounded-full ${colorClass} animate-ping opacity-75 absolute`} />
                  <div className={`w-3 h-3 rounded-full ${colorClass} border-2 border-black shadow-[0_0_12px_currentColor]`} />
                  <div className="mt-1 px-1.5 py-0.5 bg-black/90 rounded border border-white/10 text-[8px] font-mono font-black uppercase text-white whitespace-nowrap shadow-lg">
                    {ping.label} ({dist}m)
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Intel & Ping Selector Panel */}
          <div className="w-80 space-y-5 flex flex-col">
            {/* Ping Mode Selection */}
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Ping Marker Type</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedPingType('generic')}
                  className={`py-2 px-2 rounded-xl border text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPingType === 'generic' 
                      ? 'bg-amber-500/20 border-amber-400 text-amber-400' 
                      : 'bg-black/40 border-white/10 text-zinc-400'
                  }`}
                >
                  <MapPin size={14} />
                  <span>Sector</span>
                </button>

                <button
                  onClick={() => setSelectedPingType('danger')}
                  className={`py-2 px-2 rounded-xl border text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPingType === 'danger' 
                      ? 'bg-red-500/20 border-red-400 text-red-400' 
                      : 'bg-black/40 border-white/10 text-zinc-400'
                  }`}
                >
                  <AlertTriangle size={14} />
                  <span>Danger</span>
                </button>

                <button
                  onClick={() => setSelectedPingType('loot')}
                  className={`py-2 px-2 rounded-xl border text-[10px] font-black uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedPingType === 'loot' 
                      ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                      : 'bg-black/40 border-white/10 text-zinc-400'
                  }`}
                >
                  <Box size={14} />
                  <span>Supply</span>
                </button>
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Users size={16} className="text-blue-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Signatures</span>
              </div>
              <div className="text-3xl font-black text-white">{Object.keys(otherPlayers).length + 1}</div>
            </div>

            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <Target size={16} className="text-red-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Threat Level</span>
              </div>
              <div className="text-3xl font-black text-red-500">{enemies.length > 5 ? 'CRITICAL' : 'STABLE'}</div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-[2rem] border border-blue-500/20 flex flex-col justify-end">
              <div className="text-[8px] font-black text-white/40 uppercase mb-1">Active Pings Count</div>
              <div className="text-2xl font-black text-blue-400">{pings.length} Active Markers</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
