import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Target, Skull, Zap, Sparkles, Flame, Play } from 'lucide-react';
import { useGameStore } from '../store';

interface MVPData {
  id: string;
  name: string;
  score: number;
  kills: number;
  deaths: number;
  isMe: boolean;
  color: string;
}

interface MVPAnnouncementOverlayProps {
  mvp: MVPData;
  onClose: () => void;
}

export function MVPAnnouncementOverlay({ mvp, onClose }: MVPAnnouncementOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Play celebratory sound if available
    try {
      const audio = new Audio('/sfx/quest_complete.mp3'); // Fallback or standard audio click
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  // Determine tactical accolade text
  const getAccolade = () => {
    if (mvp.kills >= 12) {
      return {
        title: 'WARLORD',
        desc: 'DOMINATED THE FIELD WITH ABSOLUTE LETHALITY',
        icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />
      };
    } else if (mvp.deaths === 0) {
      return {
        title: 'IMMORTAL',
        desc: 'EXECUTED COMMANDER STRATEGY WITH ZERO CASUALTIES',
        icon: <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />
      };
    } else if (mvp.score >= 1800) {
      return {
        title: 'SUPREME CHAMPION',
        desc: 'DEMONSTRATED UNMATCHED TACTICAL SUPERIORITY',
        icon: <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
      };
    } else {
      return {
        title: 'TACTICAL MVP',
        desc: 'EXEMPLARY COMBAT AND STRATEGIC OPERATIONS CONDUCTED',
        icon: <Zap className="w-5 h-5 text-cyan-400 animate-spin" />
      };
    }
  };

  const accolade = getAccolade();

  return (
    <div className="fixed inset-0 bg-black/95 z-[150] flex flex-col items-center justify-center pointer-events-auto overflow-hidden">
      {/* Dynamic Grid Background with slow rotation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Extreme Radial Golden Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[160px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-400/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-4">
        {/* Animated Header Category Banner */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[10px] font-black tracking-[0.4em] text-amber-400 uppercase">
              POST-MATCH COMMENDATION
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tighter italic text-center uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            MOST VALUABLE PLAYER
          </h1>
        </motion.div>

        {/* Card Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 15 }}
          className="w-full bg-gradient-to-b from-zinc-900 to-black border border-amber-500/40 p-10 rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col items-center relative overflow-hidden"
        >
          {/* Card Scanlines effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none" />

          {/* Golden Corner Accents */}
          <div className="absolute top-8 left-8 border-t-2 border-l-2 border-amber-400/60 w-8 h-8" />
          <div className="absolute top-8 right-8 border-t-2 border-r-2 border-amber-400/60 w-8 h-8" />
          <div className="absolute bottom-8 left-8 border-b-2 border-l-2 border-amber-400/60 w-8 h-8" />
          <div className="absolute bottom-8 right-8 border-b-2 border-r-2 border-amber-400/60 w-8 h-8" />

          {/* Rotating Halo Behind Avatar */}
          <div className="absolute top-16 w-32 h-32 rounded-full border border-dashed border-amber-400/20 animate-spin" style={{ animationDuration: '20s' }} />

          {/* Player Badge */}
          <div className="relative mb-6 mt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 10 }}
              className="w-24 h-24 rounded-3xl rotate-45 flex items-center justify-center overflow-hidden border-4 border-amber-400 bg-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              <div 
                className="w-full h-full -rotate-45 scale-150 transition-all duration-500" 
                style={{ backgroundColor: mvp.color || '#f59e0b' }} 
              />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black p-2 rounded-2xl border-2 border-zinc-950 shadow-lg">
              <Crown className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          {/* Player Name */}
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tight mb-1 text-center truncate max-w-full">
            {mvp.name}
          </h2>

          {/* Connection Indicator / ME Badge */}
          <div className="mb-6">
            {mvp.isMe ? (
              <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-black px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                YOU ARE THE MVP
              </span>
            ) : (
              <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-4 py-1 rounded-full uppercase tracking-widest">
                SQUADMATE OPERATOR
              </span>
            )}
          </div>

          {/* Highlight Stats Row */}
          <div className="grid grid-cols-3 gap-4 w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-center">
            <div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">SCORE</div>
              <div className="text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                {mvp.score}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">KILLS</div>
              <div className="text-3xl font-black text-white font-mono flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-red-400" />
                {mvp.kills}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">DEATHS</div>
              <div className="text-3xl font-black text-zinc-400 font-mono flex items-center justify-center gap-1">
                <Skull className="w-4 h-4 text-zinc-500" />
                {mvp.deaths}
              </div>
            </div>
          </div>

          {/* Commendation Banner */}
          <div className="w-full border-t border-white/5 pt-5 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              {accolade.icon}
              <span className="text-sm font-black tracking-widest text-amber-400 uppercase">
                {accolade.title}
              </span>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider max-w-[85%]">
              {accolade.desc}
            </p>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className="mt-8 flex items-center gap-2 px-10 py-5 bg-amber-400 text-black font-black text-lg rounded-2xl hover:bg-white transition-all shadow-[0_0_40px_rgba(245,158,11,0.25)] hover:scale-[1.05] active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>CONTINUE TO SCOREBOARD</span>
        </motion.button>
      </div>
    </div>
  );
}
