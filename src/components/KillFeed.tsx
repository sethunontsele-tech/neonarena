/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { 
  Crosshair, 
  Target, 
  Sword, 
  Flame, 
  Zap, 
  Shield, 
  Sparkles, 
  Skull, 
  Bomb, 
  CircleDot,
  Hexagon,
  Bot
} from 'lucide-react';

export interface KillFeedEvent {
  id: string;
  killer: string;
  victim: string;
  weapon?: string;
  isHeadshot?: boolean;
  streak?: number;
  timestamp: number;
  killerTeam?: string;
  victimTeam?: string;
}

export function KillFeed() {
  const killFeed = useGameStore(state => state.killFeed);
  const showKillFeed = useGameStore(state => state.uiLayoutConfig.showKillFeed);
  const removeKillFeedEvent = useGameStore(state => state.removeKillFeedEvent);

  // Auto remove items older than 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      killFeed.forEach(event => {
        if (now - event.timestamp > 5000) {
          removeKillFeedEvent(event.id);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [killFeed, removeKillFeedEvent]);

  if (!showKillFeed || !killFeed || killFeed.length === 0) return null;

  const getWeaponIcon = (weapon?: string) => {
    if (!weapon) return <Crosshair size={12} className="text-amber-400" />;
    const w = weapon.toLowerCase();
    if (w.includes('sniper') || w.includes('rail')) return <Target size={12} className="text-purple-400" />;
    if (w.includes('sword') || w.includes('blade') || w.includes('saber') || w.includes('axe') || w.includes('knife')) return <Sword size={12} className="text-cyan-400" />;
    if (w.includes('flame') || w.includes('fire')) return <Flame size={12} className="text-orange-500" />;
    if (w.includes('rpg') || w.includes('bomb') || w.includes('grenade') || w.includes('launcher')) return <Bomb size={12} className="text-red-500" />;
    if (w.includes('laser') || w.includes('plasma') || w.includes('ray')) return <Zap size={12} className="text-yellow-400" />;
    if (w.includes('shield')) return <Shield size={12} className="text-blue-400" />;
    if (w.includes('potion')) return <Sparkles size={12} className="text-emerald-400" />;
    return <CircleDot size={12} className="text-amber-400" />;
  };

  return (
    <div className="fixed top-16 right-6 z-[90] flex flex-col items-end gap-2 pointer-events-none select-none max-w-sm">
      <AnimatePresence>
        {killFeed.slice(-6).map((event) => {
          const isSelfKiller = event.killer.toLowerCase().includes('you') || event.killer === useGameStore.getState().gamertag;
          const isSelfVictim = event.victim.toLowerCase().includes('you') || event.victim === useGameStore.getState().gamertag;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 80, scale: 0.9, height: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1, height: 'auto' }}
              exit={{ opacity: 0, x: 50, scale: 0.8, height: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-xl shadow-lg text-xs font-mono tracking-tight ${
                event.isHeadshot 
                  ? 'bg-red-950/80 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                  : 'bg-zinc-950/85 border-white/10'
              }`}
            >
              {/* Killer Name */}
              <div className={`font-black flex items-center gap-1 ${
                isSelfKiller ? 'text-amber-400 font-extrabold' : 'text-emerald-400'
              }`}>
                {event.killer.startsWith('bot-') && <Bot size={11} className="text-zinc-400" />}
                <span>{event.killer}</span>
              </div>

              {/* Weapon & Headshot Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] uppercase font-bold text-zinc-300">
                {getWeaponIcon(event.weapon)}
                <span>{event.weapon || 'ELIMINATED'}</span>

                {event.isHeadshot && (
                  <span className="flex items-center gap-0.5 px-1 bg-red-600 text-white text-[8px] font-black rounded uppercase animate-pulse tracking-wider">
                    <Skull size={10} /> 🎯 HEADSHOT
                  </span>
                )}
              </div>

              {/* Victim Name */}
              <div className={`font-black flex items-center gap-1 ${
                isSelfVictim ? 'text-red-400 font-extrabold animate-pulse' : 'text-zinc-300'
              }`}>
                <span>{event.victim}</span>
              </div>

              {/* Killstreak Badge */}
              {event.streak && event.streak > 1 && (
                <div className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/40 uppercase tracking-widest flex items-center gap-0.5">
                  <Hexagon size={10} className="fill-amber-400/30" />
                  <span>{event.streak}x</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
