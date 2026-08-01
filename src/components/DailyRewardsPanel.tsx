import React, { useState } from 'react';
import { 
  Flame, 
  Gift, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Trophy, 
  Zap,
  Lock,
  ChevronRight,
  Clock
} from 'lucide-react';
import { soundService } from '../services/soundService';

export interface RewardItem {
  day: number;
  title: string;
  amount: string;
  type: 'credits' | 'gems' | 'xp' | 'blueprint' | 'skin';
  claimed: boolean;
  isMilestone?: boolean;
  icon: string;
}

export interface DailyRewardsPanelProps {
  onClose?: () => void;
  onRewardClaimed?: (reward: RewardItem) => void;
}

export function DailyRewardsPanel({ onClose, onRewardClaimed }: DailyRewardsPanelProps) {
  // Streak State (Mock state initialized to 5 days consecutive streak)
  const [streakDays, setStreakDays] = useState<number>(5);
  const [lastClaimDate, setLastClaimDate] = useState<string>('Yesterday');
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean>(false);
  
  // 7-Day Cycle Rewards List
  const [rewards, setRewards] = useState<RewardItem[]>([
    { day: 1, title: 'Neon Credits', amount: '500 NC', type: 'credits', claimed: true, icon: '⚡' },
    { day: 2, title: 'XP Booster', amount: '+25% (2h)', type: 'xp', claimed: true, icon: '🔥' },
    { day: 3, title: 'Cyber Gems', amount: '50 Gems', type: 'gems', claimed: true, isMilestone: true, icon: '💎' },
    { day: 4, title: 'Neon Credits', amount: '1,200 NC', type: 'credits', claimed: true, icon: '⚡' },
    { day: 5, title: 'Overdrive Core', amount: '2x Battery', type: 'blueprint', claimed: true, icon: '🔋' },
    { day: 6, title: 'Cyber Gems', amount: '120 Gems', type: 'gems', claimed: false, icon: '💎' },
    { day: 7, title: 'Legendary Skin', amount: 'Cyber Valkyrie', type: 'skin', claimed: false, isMilestone: true, icon: '👑' }
  ]);

  // Milestone Progress Calculation (Milestone at 7 days)
  const currentDayInCycle = (streakDays % 7) || 7;
  const progressPercent = Math.min(100, Math.round((streakDays / 7) * 100));

  const claimTodayReward = () => {
    if (hasClaimedToday) return;

    soundService.playSFX('ui_click');

    const targetDayIndex = rewards.findIndex(r => !r.claimed);
    if (targetDayIndex === -1) return;

    const claimedItem = rewards[targetDayIndex];

    setRewards(prev => prev.map((r, idx) => 
      idx === targetDayIndex ? { ...r, claimed: true } : r
    ));

    setStreakDays(prev => prev + 1);
    setHasClaimedToday(true);
    setLastClaimDate('Just now');

    if (onRewardClaimed) {
      onRewardClaimed(claimedItem);
    }
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.1)] max-w-4xl mx-auto space-y-6 text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                DAILY REWARDS ENGINE
              </span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                <Clock size={12} /> Resets in 14h 22m
              </span>
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mt-1">
              CONSECUTIVE LOGIN STREAK
            </h2>
          </div>
        </div>

        {/* Streak Counter Counter Badge */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Flame className="text-amber-400" size={24} />
          <div>
            <div className="text-[10px] uppercase font-mono text-white/50">CURRENT STREAK</div>
            <div className="text-xl font-black font-mono text-amber-400 tracking-wider">
              {streakDays} DAYS
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar to Next Milestone */}
      <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white/60 font-bold uppercase flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" /> MILESTONE PROGRESS (DAY 7 REWARD)
          </span>
          <span className="text-cyan-400 font-bold">{streakDays} / 7 Days ({progressPercent}%)</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-purple-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(0,240,255,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>Day 1 (Start)</span>
          <span>Day 3 (50 Gems)</span>
          <span className="text-amber-400 font-bold">Day 7 (Cyber Valkyrie Skin)</span>
        </div>
      </div>

      {/* 7-Day Rewards Calendar Grid */}
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-white/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> 7-DAY REWARD CYCLE</span>
          <span className="text-emerald-400 font-mono text-[10px]">Claim status updated live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {rewards.map((reward, idx) => {
            const isToday = !reward.claimed && (idx === 0 || rewards[idx - 1].claimed);
            const isLocked = !reward.claimed && !isToday;

            return (
              <div
                key={reward.day}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center relative transition-all ${
                  reward.claimed
                    ? 'bg-zinc-900/40 border-emerald-500/30 text-white/50'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-500/10 via-zinc-900 to-cyan-500/10 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-105'
                    : 'bg-black/50 border-white/5 text-white/30'
                }`}
              >
                {/* Milestone Badge */}
                {reward.isMilestone && (
                  <span className="absolute -top-2 bg-gradient-to-r from-amber-500 to-purple-500 text-black font-black text-[8px] uppercase px-2 py-0.5 rounded-full shadow-md">
                    MILESTONE
                  </span>
                )}

                {/* Day Label */}
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-2 text-white/60">
                  DAY {reward.day}
                </div>

                {/* Icon Display */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 ${
                  reward.claimed ? 'bg-emerald-950/60 border border-emerald-500/40' :
                  isToday ? 'bg-amber-500/20 border border-amber-400 animate-bounce' :
                  'bg-zinc-900 border border-white/10 opacity-50'
                }`}>
                  {reward.claimed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : reward.icon}
                </div>

                {/* Title & Amount */}
                <div className="space-y-0.5 mb-3">
                  <div className="text-xs font-black text-white truncate max-w-[100px]">{reward.title}</div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">{reward.amount}</div>
                </div>

                {/* Status Indicator / Action */}
                {reward.claimed ? (
                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} /> CLAIMED
                  </span>
                ) : isToday ? (
                  <button
                    onClick={claimTodayReward}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-black font-black uppercase text-[10px] rounded-lg transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    CLAIM NOW
                  </button>
                ) : (
                  <span className="text-[9px] font-mono uppercase text-white/30 flex items-center gap-1">
                    <Lock size={10} /> LOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner Action */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-amber-400 shrink-0" size={24} />
          <div className="text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Streak Protection Active:</span>
            <span className="text-white/60 ml-1">Log in daily to maintain your streak and claim milestone rewards.</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Close Panel
          </button>
        )}
      </div>
    </div>
  );
}
