import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Gift,
  Flame,
  CheckCircle,
  Lock,
  Sparkles,
  Coins,
  Zap,
  Trophy,
  RefreshCw,
  FastForward,
  Star,
  X,
  Award,
  Shield,
  Check
} from 'lucide-react';
import { soundService } from '../services/soundService';

export interface RewardDay {
  day: number;
  credits: number;
  title: string;
  bonusItem?: string;
  bonusRarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  iconType: 'coins' | 'key' | 'booster' | 'chest' | 'skin' | 'pet';
}

export const DAILY_REWARDS: RewardDay[] = [
  {
    day: 1,
    credits: 100,
    title: 'Bronze Starter',
    iconType: 'coins',
    bonusRarity: 'common'
  },
  {
    day: 2,
    credits: 250,
    title: 'Silver Surge',
    iconType: 'coins',
    bonusRarity: 'common'
  },
  {
    day: 3,
    credits: 500,
    title: 'Cyber Access Key',
    bonusItem: '1x Cyber Pass Key',
    bonusRarity: 'rare',
    iconType: 'key'
  },
  {
    day: 4,
    credits: 850,
    title: 'Gold Overdrive',
    iconType: 'coins',
    bonusRarity: 'rare'
  },
  {
    day: 5,
    credits: 1250,
    title: 'XP Multiplier',
    bonusItem: '2x XP Booster (2 Hours)',
    bonusRarity: 'epic',
    iconType: 'booster'
  },
  {
    day: 6,
    credits: 2000,
    title: 'Platinum Cache',
    iconType: 'coins',
    bonusRarity: 'epic'
  },
  {
    day: 7,
    credits: 5000,
    title: 'Mythic Jackpot Chest',
    bonusItem: 'Mythic Neon Cyber Chest + "Vanguard" Title',
    bonusRarity: 'mythic',
    iconType: 'chest'
  },
  {
    day: 8,
    credits: 600,
    title: 'Quantum Spark',
    iconType: 'coins',
    bonusRarity: 'common'
  },
  {
    day: 9,
    credits: 900,
    title: 'Hyper Pulse',
    iconType: 'coins',
    bonusRarity: 'rare'
  },
  {
    day: 10,
    credits: 1500,
    title: 'Golden Crosshair',
    bonusItem: 'Custom Gold HUD Crosshair',
    bonusRarity: 'epic',
    iconType: 'skin'
  },
  {
    day: 11,
    credits: 2200,
    title: 'Titanium Cell',
    iconType: 'coins',
    bonusRarity: 'rare'
  },
  {
    day: 12,
    credits: 3000,
    title: 'Arena Key Bundle',
    bonusItem: '5x Arena Key Bundle',
    bonusRarity: 'epic',
    iconType: 'key'
  },
  {
    day: 13,
    credits: 4000,
    title: 'Singularity Vault',
    iconType: 'coins',
    bonusRarity: 'epic'
  },
  {
    day: 14,
    credits: 10000,
    title: 'Legendary Cyber Dragon',
    bonusItem: 'Legendary Cyber Dragoon Companion Skin',
    bonusRarity: 'legendary',
    iconType: 'pet'
  }
];

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreditsUpdated?: (newBalance: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onCreditsUpdated
}) => {
  // State from LocalStorage or defaults
  const [streakCount, setStreakCount] = useState<number>(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [creditsBalance, setCreditsBalance] = useState<number>(1250);
  const [totalLifetimeClaimed, setTotalLifetimeClaimed] = useState<number>(0);

  // FX state
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [showParticleEffect, setShowParticleEffect] = useState<boolean>(false);
  const [recentRewardText, setRecentRewardText] = useState<string | null>(null);

  // Load state on mount / open
  useEffect(() => {
    if (!isOpen) return;

    try {
      const storedStreak = localStorage.getItem('daily_checkin_streak');
      const storedLastDate = localStorage.getItem('daily_checkin_last_date');
      const storedClaimedDays = localStorage.getItem('daily_checkin_claimed_days');
      const storedBalance = localStorage.getItem('arena_credits_balance');
      const storedTotal = localStorage.getItem('daily_checkin_total_claimed');

      const parsedStreak = storedStreak ? parseInt(storedStreak, 10) : 1;
      const parsedLastDate = storedLastDate || null;
      const parsedClaimedDays = storedClaimedDays ? JSON.parse(storedClaimedDays) : [];
      const parsedBalance = storedBalance ? parseInt(storedBalance, 10) : 1250;
      const parsedTotal = storedTotal ? parseInt(storedTotal, 10) : 0;

      setStreakCount(parsedStreak);
      setLastClaimDate(parsedLastDate);
      setClaimedDays(parsedClaimedDays);
      setCreditsBalance(parsedBalance);
      setTotalLifetimeClaimed(parsedTotal);

      // Check if claimed today
      const todayStr = new Date().toISOString().split('T')[0];
      setClaimedToday(parsedLastDate === todayStr);
    } catch (e) {
      console.error("Failed to load daily reward state:", e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current day reward index (1-based, loops after Day 14)
  const currentTargetDay = ((streakCount - 1) % 14) + 1;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleClaimReward = (dayToClaim: number) => {
    if (claimedToday) return;

    const reward = DAILY_REWARDS.find((r) => r.day === dayToClaim) || DAILY_REWARDS[0];
    const newBalance = creditsBalance + reward.credits;
    const newTotal = totalLifetimeClaimed + reward.credits;
    const newClaimedDays = [...claimedDays, dayToClaim];

    setCreditsBalance(newBalance);
    setTotalLifetimeClaimed(newTotal);
    setClaimedDays(newClaimedDays);
    setLastClaimDate(todayStr);
    setClaimedToday(true);
    setShowParticleEffect(true);

    const rewardNotice = `+${reward.credits.toLocaleString()} Arena Credits${reward.bonusItem ? ` & ${reward.bonusItem}` : ''}`;
    setRecentRewardText(rewardNotice);

    // Save state
    try {
      localStorage.setItem('arena_credits_balance', newBalance.toString());
      localStorage.setItem('daily_checkin_total_claimed', newTotal.toString());
      localStorage.setItem('daily_checkin_claimed_days', JSON.stringify(newClaimedDays));
      localStorage.setItem('daily_checkin_last_date', todayStr);
      localStorage.setItem('daily_checkin_streak', streakCount.toString());
    } catch (e) {
      console.error("Failed to persist daily checkin claim:", e);
    }

    if (onCreditsUpdated) {
      onCreditsUpdated(newBalance);
    }

    // Sound and voice FX
    soundService.playSFX('quest_complete');
    soundService.announce(`Daily Check-in Day ${dayToClaim} Claimed! Received ${reward.credits} Arena Credits.`);

    setTimeout(() => {
      setShowParticleEffect(false);
    }, 3000);
  };

  // Tester helper: simulate advancing 1 day
  const handleSimulateNextDay = () => {
    const nextStreak = streakCount + 1;
    setStreakCount(nextStreak);
    setClaimedToday(false);
    setLastClaimDate(null);
    localStorage.setItem('daily_checkin_streak', nextStreak.toString());
    localStorage.removeItem('daily_checkin_last_date');
    soundService.playSFX('ui_click');
  };

  // Tester helper: reset streak
  const handleResetStreak = () => {
    setStreakCount(1);
    setClaimedDays([]);
    setLastClaimDate(null);
    setClaimedToday(false);
    localStorage.setItem('daily_checkin_streak', '1');
    localStorage.setItem('daily_checkin_claimed_days', '[]');
    localStorage.removeItem('daily_checkin_last_date');
    soundService.playSFX('ui_click');
  };

  // Helper for bonus card borders
  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 text-black border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'legendary':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300 font-bold';
      case 'epic':
        return 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-fuchsia-400 font-semibold';
      case 'rare':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-300 font-semibold';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-5xl bg-zinc-950 border border-cyan-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden my-8"
        >
          {/* Confetti / Sparkle visual effect overlay when claimed */}
          {showParticleEffect && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-amber-500/10 to-transparent animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/20 blur-[100px] rounded-full animate-ping" />
              <div className="flex items-center justify-center h-full">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="bg-black/90 border-2 border-amber-400 px-8 py-6 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.6)]"
                >
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-2xl font-black text-amber-300 italic tracking-wider uppercase">
                    REWARD CLAIMED!
                  </h3>
                  <p className="text-sm font-mono text-white mt-1">{recentRewardText}</p>
                </motion.div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              soundService.playSFX('ui_click');
              onClose();
            }}
            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-20"
          >
            <X size={20} />
          </button>

          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Calendar size={18} className="animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">
                  CONSECUTIVE ARENA CHECK-IN
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
                DAILY REWARDS MATRIX
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Check in every consecutive day to accumulate increasing amounts of Arena Credits & Mythic Loot.
              </p>
            </div>

            {/* Credits & Streak Display Box */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Total Arena Credits Counter */}
              <div className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Coins size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider">
                    Arena Credits
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {creditsBalance.toLocaleString()} <span className="text-amber-400 text-xs">AC</span>
                  </div>
                </div>
              </div>

              {/* Login Streak Counter */}
              <div className="flex-1 sm:flex-none bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
                  <Flame size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-rose-300 uppercase tracking-wider">
                    Login Streak
                  </div>
                  <div className="text-xl font-black text-white font-mono flex items-center gap-1">
                    {streakCount} <span className="text-xs text-rose-400 font-bold uppercase">Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day 7 Milestone Banner */}
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-amber-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300 shrink-0">
                <Trophy size={24} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Day 7 Milestone Jackpot</span>
                  <span className="text-[10px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-full">
                    +5,000 AC + MYTHIC CHEST
                  </span>
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Maintain your streak to unlock the Day 7 Mythic Cyber Chest containing exclusive cosmetics!
                </p>
              </div>
            </div>

            {/* Streak Progress Gauge */}
            <div className="w-full sm:w-48 bg-zinc-950 border border-white/10 p-2.5 rounded-xl">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>Progress</span>
                <span className="text-amber-400 font-bold">{Math.min(currentTargetDay, 7)}/7 Days</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 h-full transition-all duration-500"
                  style={{ width: `${(Math.min(currentTargetDay, 7) / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button: CLAIM NOW */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-4 sm:p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-2xl">
                <Award size={28} />
              </div>
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  TODAY'S REWARD • DAY {currentTargetDay}
                </div>
                <div className="text-lg font-black text-white">
                  {DAILY_REWARDS.find((r) => r.day === currentTargetDay)?.title} (+
                  {DAILY_REWARDS.find((r) => r.day === currentTargetDay)?.credits} AC)
                </div>
              </div>
            </div>

            {claimedToday ? (
              <div className="w-full sm:w-auto px-8 py-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <CheckCircle size={18} />
                <span>CHECKED IN TODAY</span>
              </div>
            ) : (
              <button
                onClick={() => handleClaimReward(currentTargetDay)}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-black font-black text-base rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-tight flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                <span>CLAIM DAY {currentTargetDay} REWARD</span>
              </button>
            )}
          </div>

          {/* 14-Day Check-in Grid */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400 uppercase tracking-widest px-1">
              <span>WEEK 1 & WEEK 2 SCHEDULE</span>
              <span className="text-cyan-400">14-Day Cycle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {DAILY_REWARDS.map((item) => {
                const isClaimed = claimedDays.includes(item.day);
                const isCurrent = item.day === currentTargetDay && !claimedToday;
                const isLocked = item.day > currentTargetDay || (item.day === currentTargetDay && claimedToday);

                return (
                  <motion.div
                    key={item.day}
                    whileHover={{ scale: 1.03 }}
                    className={`relative p-3 rounded-2xl border flex flex-col justify-between h-36 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : isClaimed
                        ? 'bg-zinc-900/40 border-emerald-500/30 opacity-75'
                        : 'bg-zinc-900/60 border-white/10 opacity-90'
                    }`}
                  >
                    {/* Top Status Badge */}
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono font-black text-zinc-400 uppercase">
                        DAY {item.day}
                      </span>
                      {isClaimed ? (
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check size={12} />
                        </div>
                      ) : isCurrent ? (
                        <span className="text-[8px] font-mono font-black bg-amber-400 text-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                          READY
                        </span>
                      ) : (
                        <div className="text-zinc-600">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>

                    {/* Reward Main Icon & Amounts */}
                    <div className="my-auto text-center">
                      <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                        <Coins size={16} className={isCurrent ? 'text-amber-400' : 'text-zinc-400'} />
                        <span>+{item.credits}</span>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-400 line-clamp-1 mt-0.5">
                        {item.title}
                      </div>
                    </div>

                    {/* Bonus item badge if present */}
                    {item.bonusItem ? (
                      <div
                        className={`mt-1 text-[8px] font-mono px-1.5 py-0.5 rounded border text-center truncate ${getRarityBadge(
                          item.bonusRarity
                        )}`}
                      >
                        🎁 {item.bonusItem}
                      </div>
                    ) : (
                      <div className="mt-1 text-[8px] font-mono text-zinc-500 text-center">
                        Credits Reward
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer & Testing Simulation Controls */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Shield size={14} className="text-cyan-400" />
              <span>Lifetime Arena Credits Claimed: <strong className="text-white">{totalLifetimeClaimed.toLocaleString()} AC</strong></span>
            </div>

            {/* Debug / Testing Bar for User Review */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                Tester Tools:
              </span>
              <button
                onClick={handleSimulateNextDay}
                className="text-[10px] font-mono bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-zinc-300 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <FastForward size={12} /> Simulate Next Day
              </button>
              <button
                onClick={handleResetStreak}
                className="text-[10px] font-mono bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 text-zinc-300 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <RefreshCw size={12} /> Reset Streak
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
