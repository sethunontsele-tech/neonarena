/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEconomyStore } from '../economy/economyStore';
import { 
  createDeck, 
  evaluateHand, 
  Card, 
  PokerPlayer, 
  PokerState, 
  AI_BOT_PROFILES 
} from './pokerLogic';
import { 
  Sparkles, 
  Coins, 
  Crown, 
  X, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Flame, 
  Sliders, 
  Eye, 
  Trophy 
} from 'lucide-react';

export type DifficultyLevel = 'NOVICE' | 'PRO' | 'HIGH_ROLLER' | 'DARKNET_MYTHIC';

interface ThemeConfig {
  name: string;
  feltBg: string;
  feltBorder: string;
  glowColor: string;
  accentText: string;
  chipColor: string;
  cardBorder: string;
  smallBlind: number;
  bigBlind: number;
  aiAggression: number; // 0 to 1
  description: string;
}

const DIFFICULTY_THEMES: Record<DifficultyLevel, ThemeConfig> = {
  NOVICE: {
    name: 'NOVICE / NEON GREEN MATRIX',
    feltBg: 'from-emerald-950/40 via-zinc-950 to-emerald-950/40',
    feltBorder: 'border-emerald-500/40',
    glowColor: 'shadow-[0_0_80px_rgba(16,185,129,0.3)]',
    accentText: 'text-emerald-400',
    chipColor: 'bg-emerald-500 text-black',
    cardBorder: 'border-emerald-400',
    smallBlind: 10,
    bigBlind: 20,
    aiAggression: 0.2,
    description: 'Beginner friendly table with helper hand odds overlay and low blind stakes.'
  },
  PRO: {
    name: 'CYBER PRO / CYAN CIRCUIT',
    feltBg: 'from-cyan-950/40 via-zinc-950 to-cyan-950/40',
    feltBorder: 'border-cyan-500/40',
    glowColor: 'shadow-[0_0_80px_rgba(6,182,212,0.3)]',
    accentText: 'text-cyan-400',
    chipColor: 'bg-cyan-500 text-black',
    cardBorder: 'border-cyan-400',
    smallBlind: 50,
    bigBlind: 100,
    aiAggression: 0.5,
    description: 'Standard competitive circuit with balanced AI bluffing mechanics.'
  },
  HIGH_ROLLER: {
    name: 'HIGH ROLLER / ROYAL AMBER GOLD',
    feltBg: 'from-amber-950/50 via-zinc-950 to-amber-950/50',
    feltBorder: 'border-amber-500/50',
    glowColor: 'shadow-[0_0_100px_rgba(245,158,11,0.35)]',
    accentText: 'text-amber-400',
    chipColor: 'bg-amber-400 text-black',
    cardBorder: 'border-amber-400',
    smallBlind: 250,
    bigBlind: 500,
    aiAggression: 0.8,
    description: 'V.I.P suite with golden particle emitters and high stakes payouts.'
  },
  DARKNET_MYTHIC: {
    name: 'DARKNET / CORRUPT MATRIX MYTHIC',
    feltBg: 'from-purple-950/60 via-black to-red-950/60',
    feltBorder: 'border-purple-500/60',
    glowColor: 'shadow-[0_0_120px_rgba(168,85,247,0.4)]',
    accentText: 'text-purple-400',
    chipColor: 'bg-purple-500 text-white',
    cardBorder: 'border-purple-400',
    smallBlind: 1000,
    bigBlind: 2000,
    aiAggression: 0.95,
    description: 'Underworld rogue table with glitch FX, volatile betting, and grandmaster AI bots.'
  }
};

export function ProceduralPokerTable({ onClose }: { onClose: () => void }) {
  const { neonCoins, addCurrency, deductCurrency } = useEconomyStore();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('PRO');
  const theme = DIFFICULTY_THEMES[difficulty];

  const [gameState, setGameState] = useState<PokerState>(() => {
    const deck = createDeck();
    const humanPlayer: PokerPlayer = {
      id: 'human_player',
      name: 'YOU (HIGH-ROLLER)',
      avatar: '🥽',
      chips: Math.max(1000, neonCoins),
      currentBet: 0,
      cards: [],
      folded: false,
      isAI: false,
      status: 'WAITING'
    };

    const aiBots: PokerPlayer[] = AI_BOT_PROFILES.map(b => ({
      ...b,
      currentBet: 0,
      cards: [],
      folded: false,
      status: 'WAITING'
    }));

    return {
      tableId: 'proc_poker_1',
      tableName: theme.name,
      buyIn: theme.bigBlind * 10,
      smallBlind: theme.smallBlind,
      bigBlind: theme.bigBlind,
      pot: 0,
      communityCards: [],
      deck,
      players: [humanPlayer, ...aiBots],
      currentTurnIndex: 0,
      dealerIndex: 0,
      stage: 'WAITING',
      highestBet: 0,
      message: `SELECT DIFFICULTY OR DEAL HAND TO BEGIN (${theme.name})`,
      winners: []
    };
  });

  // Deal Hand
  const handleDeal = () => {
    if (gameState.players[0].chips < theme.bigBlind) {
      alert(`Insufficient Neon Coins for Big Blind (${theme.bigBlind} NC)!`);
      return;
    }

    const newDeck = createDeck();
    let deckIdx = 0;

    const updatedPlayers = gameState.players.map((p, idx) => {
      const card1 = newDeck[deckIdx++];
      const card2 = newDeck[deckIdx++];

      let bet = 0;
      let status: PokerPlayer['status'] = 'WAITING';

      if (idx === 1) {
        bet = Math.min(p.chips, theme.smallBlind);
        status = 'BETTING';
      } else if (idx === 2) {
        bet = Math.min(p.chips, theme.bigBlind);
        status = 'BETTING';
      }

      return {
        ...p,
        cards: [card1, card2],
        folded: false,
        currentBet: bet,
        chips: p.chips - bet,
        status
      };
    });

    const pot = updatedPlayers.reduce((acc, p) => acc + p.currentBet, 0);

    setGameState({
      ...gameState,
      deck: newDeck.slice(deckIdx),
      players: updatedPlayers,
      communityCards: [],
      pot,
      smallBlind: theme.smallBlind,
      bigBlind: theme.bigBlind,
      stage: 'PRE_FLOP',
      currentTurnIndex: 0,
      highestBet: theme.bigBlind,
      message: `DIFFICULTY: ${theme.name}. PRE-FLOP BETTING OPEN.`,
      winners: [],
      winnerHandDescription: undefined
    });
  };

  // Switch difficulty
  const handleSelectDifficulty = (diff: DifficultyLevel) => {
    setDifficulty(diff);
    const newTheme = DIFFICULTY_THEMES[diff];
    setGameState(prev => ({
      ...prev,
      tableName: newTheme.name,
      smallBlind: newTheme.smallBlind,
      bigBlind: newTheme.bigBlind,
      stage: 'WAITING',
      message: `PROCEDURAL TABLE MORPHED TO ${newTheme.name} MODE.`
    }));
  };

  // AI Turn Handling
  useEffect(() => {
    if (gameState.stage === 'WAITING' || gameState.stage === 'SHOWDOWN') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || currentPlayer.folded || !currentPlayer.isAI) return;

    const timer = setTimeout(() => {
      const callNeeded = gameState.highestBet - currentPlayer.currentBet;
      const rand = Math.random();

      let action: 'FOLD' | 'CALL' | 'RAISE' = 'CALL';
      if (callNeeded > currentPlayer.chips) {
        action = rand < (1 - theme.aiAggression * 0.3) ? 'CALL' : 'FOLD';
      } else if (callNeeded > 200 && rand < (1 - theme.aiAggression)) {
        action = 'FOLD';
      } else if (rand < theme.aiAggression) {
        action = 'RAISE';
      }

      executeAction(currentPlayer.id, action, gameState.highestBet + theme.bigBlind);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState.currentTurnIndex, gameState.stage, difficulty]);

  const executeAction = (playerId: string, action: 'FOLD' | 'CALL' | 'RAISE', raiseVal?: number) => {
    const pIdx = gameState.players.findIndex(p => p.id === playerId);
    if (pIdx === -1) return;

    const player = gameState.players[pIdx];
    let newBet = player.currentBet;
    let newChips = player.chips;
    let newFolded = player.folded;
    let status: PokerPlayer['status'] = action;

    if (action === 'FOLD') {
      newFolded = true;
      status = 'FOLD';
    } else if (action === 'CALL') {
      const diff = gameState.highestBet - player.currentBet;
      const actualCall = Math.min(newChips, diff);
      newBet += actualCall;
      newChips -= actualCall;
      status = 'CALL';
    } else if (action === 'RAISE') {
      const targetBet = raiseVal || (gameState.highestBet + theme.bigBlind);
      const diff = targetBet - player.currentBet;
      const actualRaise = Math.min(newChips, diff);
      newBet += actualRaise;
      newChips -= actualRaise;
      status = 'RAISE';
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[pIdx] = {
      ...player,
      currentBet: newBet,
      chips: newChips,
      folded: newFolded,
      status
    };

    const newPot = updatedPlayers.reduce((acc, p) => acc + (p.currentBet || 0), 0) + (gameState.pot - gameState.players.reduce((a, b) => a + b.currentBet, 0));
    const newHighestBet = Math.max(gameState.highestBet, newBet);

    let nextTurn = (gameState.currentTurnIndex + 1) % gameState.players.length;
    let loops = 0;
    while (updatedPlayers[nextTurn].folded && loops < gameState.players.length) {
      nextTurn = (nextTurn + 1) % gameState.players.length;
      loops++;
    }

    const activePlayers = updatedPlayers.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      handleEndHand([winner.id], `${winner.name} won uncontested pot!`);
      return;
    }

    const allMatched = activePlayers.every(p => p.currentBet === newHighestBet || p.chips === 0);
    if (allMatched && loops < gameState.players.length) {
      advanceStage(updatedPlayers, newPot);
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        pot: newPot,
        highestBet: newHighestBet,
        currentTurnIndex: nextTurn,
        message: `${player.name} ${action}S!`
      });
    }
  };

  const advanceStage = (currentPlayers: PokerPlayer[], currentPot: number) => {
    let nextStage = gameState.stage;
    let newCommunity = [...gameState.communityCards];
    let remainingDeck = [...gameState.deck];

    if (gameState.stage === 'PRE_FLOP') {
      nextStage = 'FLOP';
      newCommunity = [remainingDeck[0], remainingDeck[1], remainingDeck[2]];
      remainingDeck = remainingDeck.slice(3);
    } else if (gameState.stage === 'FLOP') {
      nextStage = 'TURN';
      newCommunity = [...newCommunity, remainingDeck[0]];
      remainingDeck = remainingDeck.slice(1);
    } else if (gameState.stage === 'TURN') {
      nextStage = 'RIVER';
      newCommunity = [...newCommunity, remainingDeck[0]];
      remainingDeck = remainingDeck.slice(1);
    } else if (gameState.stage === 'RIVER') {
      nextStage = 'SHOWDOWN';
      evaluateShowdown(currentPlayers, newCommunity, currentPot);
      return;
    }

    const resetBetPlayers = currentPlayers.map(p => ({ ...p, currentBet: 0 }));

    setGameState({
      ...gameState,
      stage: nextStage,
      deck: remainingDeck,
      communityCards: newCommunity,
      players: resetBetPlayers,
      highestBet: 0,
      currentTurnIndex: 0,
      pot: currentPot,
      message: `DEALING ${nextStage}!`
    });
  };

  const evaluateShowdown = (players: PokerPlayer[], community: Card[], pot: number) => {
    const active = players.filter(p => !p.folded);
    let bestScore = -1;
    let winners: string[] = [];
    let bestDesc = '';

    active.forEach(p => {
      const fullHand = [...p.cards, ...community];
      const evalRes = evaluateHand(fullHand);
      if (evalRes.score > bestScore) {
        bestScore = evalRes.score;
        winners = [p.id];
        bestDesc = `${evalRes.name} (${p.name})`;
      } else if (evalRes.score === bestScore) {
        winners.push(p.id);
      }
    });

    handleEndHand(winners, bestDesc);
  };

  const handleEndHand = (winnerIds: string[], handDesc: string) => {
    const pot = gameState.pot;
    const splitPot = Math.floor(pot / winnerIds.length);

    const updatedPlayers = gameState.players.map(p => {
      if (winnerIds.includes(p.id)) {
        return { ...p, chips: p.chips + splitPot, status: 'WINNER' as const };
      }
      return p;
    });

    if (winnerIds.includes('human_player')) {
      addCurrency('neonCoins', splitPot, `Procedural Poker (${difficulty}) Victory: ${handDesc}`, 'POKER_WIN');
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      stage: 'SHOWDOWN',
      winners: winnerIds,
      winnerHandDescription: handDesc,
      message: `🏆 WINNER: ${handDesc}`
    });
  };

  const human = gameState.players[0];
  const isHumanTurn = gameState.currentTurnIndex === 0 && gameState.stage !== 'SHOWDOWN' && gameState.stage !== 'WAITING' && !human.folded;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-3xl z-[120] flex items-center justify-center p-4 select-none pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-6xl bg-zinc-950 border-2 ${theme.feltBorder} rounded-[2.5rem] overflow-hidden ${theme.glowColor} flex flex-col h-[90vh] text-white`}
      >
        {/* Header Bar */}
        <div className="bg-zinc-900/90 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-white/10 border ${theme.feltBorder} rounded-xl ${theme.accentText}`}>
              <Cpu size={22} />
            </div>
            <div>
              <h2 className={`text-xl font-black italic tracking-wider uppercase ${theme.accentText}`}>
                {theme.name}
              </h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase">Procedurally Generated Holographic Felt // Blinds: {theme.smallBlind}/{theme.bigBlind} NC</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-xl flex items-center gap-2 font-mono">
              <Coins size={16} className="text-amber-400" />
              <span className="text-xs font-black text-amber-300">{neonCoins.toLocaleString()} NC</span>
            </div>

            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Procedural Difficulty Morph Selector Toolbar */}
        <div className="bg-black/80 border-b border-white/10 px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase flex items-center gap-1">
            <Sliders size={12} className={theme.accentText} />
            <span>DIFFICULTY MORPH:</span>
          </span>

          <div className="flex items-center gap-2">
            {(['NOVICE', 'PRO', 'HIGH_ROLLER', 'DARKNET_MYTHIC'] as const).map(d => (
              <button
                key={d}
                onClick={() => handleSelectDifficulty(d)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer ${
                  difficulty === d ? `${DIFFICULTY_THEMES[d].chipColor} font-black shadow-lg` : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {d.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Felt Arena Canvas */}
        <div className={`flex-1 bg-gradient-to-b ${theme.feltBg} p-6 flex flex-col items-center justify-between relative overflow-hidden`}>
          {/* Top Bots */}
          <div className="w-full flex justify-around z-10">
            {gameState.players.slice(1, 4).map((p) => (
              <div 
                key={p.id}
                className={`flex flex-col items-center p-3 rounded-2xl border backdrop-blur-xl transition-all ${
                  gameState.players[gameState.currentTurnIndex]?.id === p.id 
                    ? `bg-white/10 ${theme.feltBorder} scale-105 shadow-xl` 
                    : p.folded 
                    ? 'bg-black/60 border-zinc-800 opacity-50' 
                    : 'bg-zinc-900/80 border-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{p.avatar}</div>
                <div className="text-xs font-black text-white">{p.name}</div>
                <div className="text-[10px] font-mono text-amber-400 font-bold">{p.chips} NC</div>

                <div className="flex gap-1 mt-2">
                  {p.cards.map((c, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-11 rounded-lg border flex items-center justify-center font-bold text-xs ${
                        gameState.stage === 'SHOWDOWN' && !p.folded
                          ? 'bg-white text-black border-amber-400' 
                          : `bg-zinc-900 ${theme.feltBorder} ${theme.accentText}`
                      }`}
                    >
                      {gameState.stage === 'SHOWDOWN' && !p.folded ? `${c.rank}${c.suit}` : '🎴'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Community Center */}
          <div className="z-10 flex flex-col items-center my-4 space-y-3">
            <div className={`bg-black/80 border ${theme.feltBorder} px-6 py-2 rounded-2xl backdrop-blur-md flex items-center gap-3`}>
              <Flame size={18} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">POT:</span>
              <span className="text-xl font-black font-mono text-amber-400">{gameState.pot} NC</span>
            </div>

            <div className="flex gap-3 min-h-[70px] items-center">
              {gameState.communityCards.map((c, i) => (
                <div key={i} className="w-14 h-20 bg-white border-2 border-zinc-300 rounded-xl flex flex-col justify-between p-2 text-zinc-900 font-black shadow-2xl">
                  <div className="text-xs">{c.rank}</div>
                  <div className="text-xl text-center">{c.suit}</div>
                  <div className="text-xs text-right">{c.rank}</div>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono font-black text-amber-300 uppercase bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
              {gameState.message}
            </div>
          </div>

          {/* Bottom Human Controls */}
          <div className="w-full flex items-end justify-between z-10 bg-zinc-900/90 border border-white/10 p-5 rounded-3xl backdrop-blur-2xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl">
                {human.avatar}
              </div>
              <div>
                <div className="text-sm font-black text-white">{human.name}</div>
                <div className="text-xs font-mono text-amber-400 font-black">{human.chips} NC CHIPS</div>
              </div>

              <div className="flex gap-2 ml-4">
                {human.cards.map((c, i) => (
                  <div key={i} className="w-12 h-16 bg-white border-2 border-zinc-300 rounded-xl flex flex-col justify-between p-1.5 text-zinc-900 font-black shadow-xl">
                    <div className="text-xs">{c.rank}</div>
                    <div className="text-lg text-center">{c.suit}</div>
                    <div className="text-xs text-right">{c.rank}</div>
                  </div>
                ))}
              </div>
            </div>

            {gameState.stage === 'WAITING' || gameState.stage === 'SHOWDOWN' ? (
              <button
                onClick={handleDeal}
                className={`px-8 py-4 ${theme.chipColor} font-black italic text-sm uppercase rounded-2xl transition-all shadow-xl cursor-pointer`}
              >
                🎮 DEAL HAND ({theme.bigBlind} NC BLIND)
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled={!isHumanTurn}
                  onClick={() => executeAction('human_player', 'FOLD')}
                  className="px-5 py-3 bg-red-500/20 hover:bg-red-500 border border-red-500/50 text-red-400 hover:text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  FOLD
                </button>
                <button
                  disabled={!isHumanTurn}
                  onClick={() => executeAction('human_player', 'CALL')}
                  className={`px-6 py-3 bg-white/10 hover:bg-white hover:text-black border ${theme.feltBorder} ${theme.accentText} font-black text-xs uppercase rounded-xl transition-all cursor-pointer`}
                >
                  {gameState.highestBet > human.currentBet ? `CALL (${gameState.highestBet - human.currentBet} NC)` : 'CHECK'}
                </button>
                <button
                  disabled={!isHumanTurn}
                  onClick={() => executeAction('human_player', 'RAISE', gameState.highestBet + theme.bigBlind)}
                  className="px-6 py-3 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  RAISE (+{theme.bigBlind} NC)
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
