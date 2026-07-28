/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEconomyStore } from '../../economy/economyStore';
import { 
  Trophy, 
  Crown, 
  Swords, 
  Sparkles, 
  Play, 
  Users, 
  Coins, 
  Medal, 
  X, 
  ShieldCheck, 
  Flame, 
  Zap 
} from 'lucide-react';

export interface TournamentMatch {
  id: string;
  roundName: 'Quarterfinal' | 'Semifinal' | 'Championship';
  player1: { name: string; isUser?: boolean; seed: number; score?: number };
  player2: { name: string; isUser?: boolean; seed: number; score?: number };
  winner?: string; // winner name
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TournamentConfig {
  id: string;
  title: string;
  entryFee: number;
  currency: 'neonCoins' | 'legendTokens';
  totalPrizePool: number;
  bracketSize: 8;
  difficultyLabel: string;
  icon: string;
}

const TOURNAMENTS: TournamentConfig[] = [
  {
    id: 'tourney_cyber_cup',
    title: 'CYBER CROWN SHOWDOWN 2026',
    entryFee: 500,
    currency: 'neonCoins',
    totalPrizePool: 4000,
    bracketSize: 8,
    difficultyLabel: 'MID-TIER PRO',
    icon: '🏆'
  },
  {
    id: 'tourney_high_roller',
    title: 'NEON MILLIONAIRE INVITATIONAL',
    entryFee: 2500,
    currency: 'neonCoins',
    totalPrizePool: 20000,
    bracketSize: 8,
    difficultyLabel: 'HIGH ROLLER V.I.P',
    icon: '👑'
  },
  {
    id: 'tourney_darknet_championship',
    title: 'DARKNET UNDERWORLD ROYALE',
    entryFee: 10,
    currency: 'legendTokens',
    totalPrizePool: 80,
    bracketSize: 8,
    difficultyLabel: 'MYTHIC GRANDMASTER',
    icon: '⚡'
  }
];

export function PokerTournaments({ onClose }: { onClose?: () => void }) {
  const { neonCoins, legendTokens, deductCurrency, addCurrency } = useEconomyStore();
  const [selectedTourney, setSelectedTourney] = useState<TournamentConfig>(TOURNAMENTS[0]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentRound, setCurrentRound] = useState<'Quarterfinal' | 'Semifinal' | 'Championship' | 'FINISHED'>('Quarterfinal');
  
  // Bracket matches state
  const [matches, setMatches] = useState<TournamentMatch[]>([]);

  // Register and generate 8-player bracket
  const handleRegister = () => {
    const cost = selectedTourney.entryFee;
    const curr = selectedTourney.currency;

    if (curr === 'neonCoins' && neonCoins < cost) {
      alert(`Insufficient Neon Coins (${cost} NC required)!`);
      return;
    }
    if (curr === 'legendTokens' && legendTokens < cost) {
      alert(`Insufficient Legend Tokens (${cost} LT required)!`);
      return;
    }

    if (deductCurrency(curr, cost, `Tournament Entry Fee: ${selectedTourney.title}`, 'SPEND')) {
      // Generate bracket
      const initialMatches: TournamentMatch[] = [
        {
          id: 'm_qf1',
          roundName: 'Quarterfinal',
          player1: { name: 'YOU (HIGH-ROLLER)', isUser: true, seed: 1 },
          player2: { name: 'CYBER_NINJA_99', seed: 8 },
          status: 'UPCOMING'
        },
        {
          id: 'm_qf2',
          roundName: 'Quarterfinal',
          player1: { name: 'A.U.R.O.R.A-9', seed: 4 },
          player2: { name: 'GLITCH_ROGUE', seed: 5 },
          status: 'UPCOMING'
        },
        {
          id: 'm_qf3',
          roundName: 'Quarterfinal',
          player1: { name: 'HEX_MAGE_X', seed: 2 },
          player2: { name: 'NEON_SAMURAI', seed: 7 },
          status: 'UPCOMING'
        },
        {
          id: 'm_qf4',
          roundName: 'Quarterfinal',
          player1: { name: 'PHANTOM_ACE', seed: 3 },
          player2: { name: 'ZERO_COOL', seed: 6 },
          status: 'UPCOMING'
        }
      ];

      setMatches(initialMatches);
      setIsRegistered(true);
      setCurrentRound('Quarterfinal');
    }
  };

  // Simulate current match or advance round
  const handlePlayNextMatch = () => {
    if (currentRound === 'Quarterfinal') {
      // Resolve Quarterfinals
      const updatedMatches: TournamentMatch[] = [
        {
          ...matches[0],
          winner: 'YOU (HIGH-ROLLER)',
          status: 'COMPLETED',
          player1: { ...matches[0].player1, score: 2500 },
          player2: { ...matches[0].player2, score: 0 }
        },
        {
          ...matches[1],
          winner: 'A.U.R.O.R.A-9',
          status: 'COMPLETED',
          player1: { ...matches[1].player1, score: 1800 },
          player2: { ...matches[1].player2, score: 0 }
        },
        {
          ...matches[2],
          winner: 'HEX_MAGE_X',
          status: 'COMPLETED',
          player1: { ...matches[2].player1, score: 2100 },
          player2: { ...matches[2].player2, score: 0 }
        },
        {
          ...matches[3],
          winner: 'PHANTOM_ACE',
          status: 'COMPLETED',
          player1: { ...matches[3].player1, score: 3000 },
          player2: { ...matches[3].player2, score: 0 }
        },
        // Semifinal entries
        {
          id: 'm_sf1',
          roundName: 'Semifinal',
          player1: { name: 'YOU (HIGH-ROLLER)', isUser: true, seed: 1 },
          player2: { name: 'A.U.R.O.R.A-9', seed: 4 },
          status: 'UPCOMING'
        },
        {
          id: 'm_sf2',
          roundName: 'Semifinal',
          player1: { name: 'HEX_MAGE_X', seed: 2 },
          player2: { name: 'PHANTOM_ACE', seed: 3 },
          status: 'UPCOMING'
        }
      ];

      setMatches(updatedMatches);
      setCurrentRound('Semifinal');
    } else if (currentRound === 'Semifinal') {
      // Resolve Semifinals
      const updatedMatches: TournamentMatch[] = matches.map(m => {
        if (m.id === 'm_sf1') {
          return { ...m, winner: 'YOU (HIGH-ROLLER)', status: 'COMPLETED' as const };
        }
        if (m.id === 'm_sf2') {
          return { ...m, winner: 'HEX_MAGE_X', status: 'COMPLETED' as const };
        }
        return m;
      });

      updatedMatches.push({
        id: 'm_fn1',
        roundName: 'Championship',
        player1: { name: 'YOU (HIGH-ROLLER)', isUser: true, seed: 1 },
        player2: { name: 'HEX_MAGE_X', seed: 2 },
        status: 'UPCOMING'
      });

      setMatches(updatedMatches);
      setCurrentRound('Championship');
    } else if (currentRound === 'Championship') {
      // Resolve Grand Championship Final
      const updatedMatches = matches.map(m => {
        if (m.id === 'm_fn1') {
          return { ...m, winner: 'YOU (HIGH-ROLLER)', status: 'COMPLETED' as const };
        }
        return m;
      });

      setMatches(updatedMatches);
      setCurrentRound('FINISHED');

      // Grant 1st Place Reward (50% prize pool)
      const reward = Math.round(selectedTourney.totalPrizePool * 0.5);
      addCurrency(selectedTourney.currency, reward, `1st Place Gold Trophy: ${selectedTourney.title}`, 'POKER_WIN');
    }
  };

  return (
    <div className="bg-zinc-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_90px_rgba(245,158,11,0.3)] text-white flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-wider text-amber-400 uppercase">MODULAR POKER TOURNAMENTS ENGINE</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Automated Bracket Generation & Tiered Reward Pools</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Select Tournament */}
      {!isRegistered ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOURNAMENTS.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTourney(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedTourney.id === t.id ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]' : 'bg-zinc-900/60 border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[9px] font-bold rounded">
                      {t.difficultyLabel}
                    </span>
                  </div>
                  <h3 className="text-base font-black italic text-white uppercase">{t.title}</h3>
                  <div className="text-xs font-mono text-zinc-400 mt-1">8-PLAYER SINGLE ELIMINATION</div>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">ENTRY FEE</span>
                    <span className="font-bold text-amber-400">{t.entryFee} {t.currency === 'neonCoins' ? 'NC' : 'LT'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">PRIZE POOL</span>
                    <span className="font-bold text-emerald-400">{t.totalPrizePool} {t.currency === 'neonCoins' ? 'NC' : 'LT'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-amber-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black italic text-amber-400 uppercase">TIERED REWARD POOL DISTRIBUTION</h4>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">🥇 1st Place: 50% Prize Pool + Trophy | 🥈 2nd Place: 30% Prize Pool | 🥉 3rd Place: 20% Prize Pool</p>
            </div>

            <button
              onClick={handleRegister}
              className="px-8 py-3 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              REGISTER & DEDUCT ENTRY ({selectedTourney.entryFee} {selectedTourney.currency === 'neonCoins' ? 'NC' : 'LT'})
            </button>
          </div>
        </div>
      ) : (
        /* Bracket Tree Visualizer */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-black/60 border border-white/10 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">ACTIVE TOURNAMENT BRACKET</span>
              <h3 className="text-base font-black italic text-white uppercase">{selectedTourney.title}</h3>
            </div>

            {currentRound !== 'FINISHED' ? (
              <button
                onClick={handlePlayNextMatch}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-2"
              >
                <Play size={14} />
                <span>PLAY NEXT ROUND ({currentRound.toUpperCase()})</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs uppercase rounded-xl">
                🏆 CHAMPIONSHIP WON! +{Math.round(selectedTourney.totalPrizePool * 0.5)} {selectedTourney.currency === 'neonCoins' ? 'NC' : 'LT'}
              </div>
            )}
          </div>

          {/* Interactive Bracket Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {/* Quarterfinals Col */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-amber-400 uppercase text-center border-b border-amber-500/30 pb-1">QUARTERFINALS</div>
              {matches.filter(m => m.roundName === 'Quarterfinal').map(m => (
                <div key={m.id} className="bg-zinc-900 border border-white/10 p-3 rounded-xl space-y-1">
                  <div className={`flex justify-between p-1 rounded ${m.winner === m.player1.name ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}>
                    <span>{m.player1.name}</span>
                    <span>{m.winner === m.player1.name ? 'WIN' : ''}</span>
                  </div>
                  <div className={`flex justify-between p-1 rounded ${m.winner === m.player2.name ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}>
                    <span>{m.player2.name}</span>
                    <span>{m.winner === m.player2.name ? 'WIN' : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Semifinals Col */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-cyan-400 uppercase text-center border-b border-cyan-500/30 pb-1">SEMIFINALS</div>
              {matches.filter(m => m.roundName === 'Semifinal').map(m => (
                <div key={m.id} className="bg-zinc-900 border border-white/10 p-3 rounded-xl space-y-1">
                  <div className={`flex justify-between p-1 rounded ${m.winner === m.player1.name ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}>
                    <span>{m.player1.name}</span>
                    <span>{m.winner === m.player1.name ? 'WIN' : ''}</span>
                  </div>
                  <div className={`flex justify-between p-1 rounded ${m.winner === m.player2.name ? 'bg-emerald-500/20 text-emerald-300 font-bold' : ''}`}>
                    <span>{m.player2.name}</span>
                    <span>{m.winner === m.player2.name ? 'WIN' : ''}</span>
                  </div>
                </div>
              ))}
              {matches.filter(m => m.roundName === 'Semifinal').length === 0 && (
                <div className="text-center text-zinc-600 italic py-8">Awaiting Quarterfinal outcomes</div>
              )}
            </div>

            {/* Championship Col */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-purple-400 uppercase text-center border-b border-purple-500/30 pb-1">GRAND CHAMPIONSHIP</div>
              {matches.filter(m => m.roundName === 'Championship').map(m => (
                <div key={m.id} className="bg-amber-950/40 border border-amber-400/60 p-4 rounded-xl space-y-2 text-center">
                  <Trophy size={28} className="mx-auto text-amber-400 animate-bounce" />
                  <div className={`p-1.5 rounded ${m.winner === m.player1.name ? 'bg-amber-400 text-black font-black' : 'text-zinc-300'}`}>
                    {m.player1.name}
                  </div>
                  <div className={`p-1.5 rounded ${m.winner === m.player2.name ? 'bg-amber-400 text-black font-black' : 'text-zinc-300'}`}>
                    {m.player2.name}
                  </div>
                </div>
              ))}
              {matches.filter(m => m.roundName === 'Championship').length === 0 && (
                <div className="text-center text-zinc-600 italic py-8">Awaiting Semifinal winners</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
