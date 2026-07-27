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
  Coins, 
  Crown, 
  RotateCcw, 
  X, 
  Bot, 
  UserCheck, 
  Flame, 
  Sparkles, 
  Trophy, 
  Award, 
  HelpCircle 
} from 'lucide-react';

export function PokerTable({ onClose }: { onClose: () => void }) {
  const { neonCoins, addCurrency, deductCurrency } = useEconomyStore();

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
      tableId: 'neon_vip_1',
      tableName: 'CYBER-NEON HIGH ROLLER SUITE',
      buyIn: 500,
      smallBlind: 50,
      bigBlind: 100,
      pot: 0,
      communityCards: [],
      deck,
      players: [humanPlayer, ...aiBots],
      currentTurnIndex: 0,
      dealerIndex: 0,
      stage: 'WAITING',
      highestBet: 0,
      message: 'WELCOME TO NEON ARENA POKER! CLICK DEAL HAND TO START.',
      winners: []
    };
  });

  const [raiseAmount, setRaiseAmount] = useState<number>(200);

  // Deal initial cards
  const handleStartHand = () => {
    if (gameState.players[0].chips < gameState.bigBlind) {
      alert('Insufficient Neon Coins for Big Blind!');
      return;
    }

    const newDeck = createDeck();
    let deckIdx = 0;

    const smallBlindAmt = 50;
    const bigBlindAmt = 100;

    const updatedPlayers = gameState.players.map((p, idx) => {
      const card1 = newDeck[deckIdx++];
      const card2 = newDeck[deckIdx++];
      
      let bet = 0;
      let status: PokerPlayer['status'] = 'WAITING';
      
      // Post blinds
      if (idx === 1) {
        bet = Math.min(p.chips, smallBlindAmt);
        status = 'BETTING';
      } else if (idx === 2) {
        bet = Math.min(p.chips, bigBlindAmt);
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
      stage: 'PRE_FLOP',
      currentTurnIndex: 0, // Human goes first
      highestBet: bigBlindAmt,
      message: 'PRE-FLOP BETTING ROUND: CHOOSE YOUR MOVE.',
      winners: [],
      winnerHandDescription: undefined
    });
  };

  // AI Turn Automator
  useEffect(() => {
    if (gameState.stage === 'WAITING' || gameState.stage === 'SHOWDOWN') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || currentPlayer.folded || !currentPlayer.isAI) return;

    const timer = setTimeout(() => {
      // Simulate AI Decision
      const callNeeded = gameState.highestBet - currentPlayer.currentBet;
      const rand = Math.random();

      let action: 'FOLD' | 'CALL' | 'RAISE' = 'CALL';

      if (callNeeded > currentPlayer.chips) {
        action = rand < 0.6 ? 'CALL' : 'FOLD';
      } else if (callNeeded > 200 && rand < 0.35) {
        action = 'FOLD';
      } else if (rand > 0.8) {
        action = 'RAISE';
      }

      executePlayerAction(currentPlayer.id, action, gameState.highestBet + 100);
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameState.currentTurnIndex, gameState.stage]);

  const executePlayerAction = (playerId: string, action: 'FOLD' | 'CALL' | 'RAISE', raiseVal?: number) => {
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
      const targetBet = raiseVal || (gameState.highestBet + 200);
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

    // Find next active player
    let nextTurn = (gameState.currentTurnIndex + 1) % gameState.players.length;
    let loops = 0;
    while (updatedPlayers[nextTurn].folded && loops < gameState.players.length) {
      nextTurn = (nextTurn + 1) % gameState.players.length;
      loops++;
    }

    // Check if stage should advance
    const activePlayers = updatedPlayers.filter(p => !p.folded);
    const allMatched = activePlayers.every(p => p.currentBet === newHighestBet || p.chips === 0);

    if (activePlayers.length === 1) {
      // Uncontested winner
      const winner = activePlayers[0];
      handleEndHand([winner.id], `${winner.name} won uncontested pot!`);
      return;
    }

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

    // Reset round bets
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
      message: `DEALING ${nextStage}! BETS RESET.`
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

    // Economy payouts for human
    if (winnerIds.includes('human_player')) {
      addCurrency('neonCoins', splitPot, `Cyberpunk Poker Victory: ${handDesc}`, 'POKER_WIN');
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      stage: 'SHOWDOWN',
      winners: winnerIds,
      winnerHandDescription: handDesc,
      message: `🏆 SHOWDOWN COMPLETE! WINNER: ${handDesc}`
    });
  };

  const human = gameState.players[0];
  const isHumanTurn = gameState.currentTurnIndex === 0 && gameState.stage !== 'SHOWDOWN' && gameState.stage !== 'WAITING' && !human.folded;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-3xl z-[120] flex items-center justify-center p-4 select-none pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-6xl bg-zinc-950 border-2 border-cyan-500/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.3)] flex flex-col h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-zinc-900/90 border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wider text-cyan-400 uppercase">{gameState.tableName}</h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase">Texas Hold'em Cyber High-Roller League // Pot: {gameState.pot} Neon Coins</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-xl flex items-center gap-2">
              <Coins size={16} className="text-amber-400" />
              <span className="text-sm font-black font-mono text-amber-300">{neonCoins.toLocaleString()} NC</span>
            </div>

            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Poker Felt Canvas */}
        <div className="flex-1 bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 p-6 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Animated Table Oval Background */}
          <div className="absolute inset-x-12 inset-y-8 rounded-[100px] border-4 border-cyan-500/30 bg-cyan-950/20 shadow-[inset_0_0_80px_rgba(6,182,212,0.2)] pointer-events-none flex items-center justify-center">
            <div className="text-center opacity-10">
              <Crown size={180} className="text-cyan-400 mx-auto" />
              <div className="text-3xl font-black italic tracking-widest text-cyan-300 mt-2">NEON ARENA POKER</div>
            </div>
          </div>

          {/* Top AI Players Row */}
          <div className="w-full flex justify-around z-10">
            {gameState.players.slice(1, 4).map((p) => (
              <div 
                key={p.id}
                className={`flex flex-col items-center p-3 rounded-2xl border backdrop-blur-xl transition-all ${
                  gameState.players[gameState.currentTurnIndex]?.id === p.id 
                    ? 'bg-cyan-500/20 border-cyan-400 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                    : p.folded 
                    ? 'bg-black/60 border-zinc-800 opacity-50' 
                    : 'bg-zinc-900/80 border-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{p.avatar}</div>
                <div className="text-xs font-black text-white">{p.name}</div>
                <div className="text-[10px] font-mono text-amber-400 font-bold">{p.chips} NC</div>

                {/* Cards */}
                <div className="flex gap-1 mt-2">
                  {p.cards.map((c, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-11 rounded-lg border flex items-center justify-center font-bold text-xs ${
                        gameState.stage === 'SHOWDOWN' && !p.folded
                          ? 'bg-white text-black border-cyan-400' 
                          : 'bg-zinc-800 border-cyan-500/40 text-cyan-400'
                      }`}
                    >
                      {gameState.stage === 'SHOWDOWN' && !p.folded ? `${c.rank}${c.suit}` : '🎴'}
                    </div>
                  ))}
                </div>

                <div className="mt-1 text-[9px] font-mono font-extrabold uppercase text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  {p.status}
                </div>
              </div>
            ))}
          </div>

          {/* Center Community Cards & Pot */}
          <div className="z-10 flex flex-col items-center my-4 space-y-3">
            <div className="bg-black/80 border border-cyan-500/40 px-6 py-2 rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-3">
              <Flame size={18} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">CURRENT POT:</span>
              <span className="text-xl font-black font-mono text-amber-400">{gameState.pot} NC</span>
            </div>

            {/* Community Cards Display */}
            <div className="flex gap-3 min-h-[70px] items-center">
              <AnimatePresence>
                {gameState.communityCards.map((c, i) => (
                  <motion.div
                    key={`${c.rank}-${c.suit}-${i}`}
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className={`w-14 h-20 bg-white border-2 rounded-xl flex flex-col justify-between p-2 shadow-2xl ${
                      c.suit === '♥' || c.suit === '♦' ? 'text-red-600 border-red-300' : 'text-zinc-900 border-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-black leading-none">{c.rank}</div>
                    <div className="text-xl text-center">{c.suit}</div>
                    <div className="text-xs font-black leading-none text-right">{c.rank}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {gameState.communityCards.length === 0 && (
                <div className="text-xs font-mono text-cyan-400/60 tracking-widest italic uppercase">COMMUNITY CARDS WILL APPEAR HERE</div>
              )}
            </div>

            {/* Event Log Message */}
            <div className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider bg-black/60 px-4 py-1.5 rounded-full border border-amber-500/30 animate-pulse">
              {gameState.message}
            </div>
          </div>

          {/* Bottom Human Player Controls */}
          <div className="w-full flex items-end justify-between z-10 bg-zinc-900/90 border border-white/10 p-5 rounded-3xl backdrop-blur-2xl">
            {/* Human Stats & Hand */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg">
                {human.avatar}
              </div>
              <div>
                <div className="text-sm font-black text-white">{human.name}</div>
                <div className="text-xs font-mono text-amber-400 font-black">{human.chips} NC CHIPS</div>
                <div className="text-[10px] font-mono text-cyan-300 uppercase mt-0.5">CURRENT BET: {human.currentBet} NC</div>
              </div>

              {/* Human Hole Cards */}
              <div className="flex gap-2 ml-4">
                {human.cards.map((c, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className={`w-12 h-16 bg-white border-2 rounded-xl flex flex-col justify-between p-1.5 shadow-2xl ${
                      c.suit === '♥' || c.suit === '♦' ? 'text-red-600 border-red-300' : 'text-zinc-900 border-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-black leading-none">{c.rank}</div>
                    <div className="text-lg text-center">{c.suit}</div>
                    <div className="text-xs font-black leading-none text-right">{c.rank}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {gameState.stage === 'WAITING' || gameState.stage === 'SHOWDOWN' ? (
              <button
                onClick={handleStartHand}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black italic tracking-wider text-base uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer"
              >
                🎮 DEAL NEW HAND (50 NC BLIND)
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled={!isHumanTurn}
                  onClick={() => executePlayerAction('human_player', 'FOLD')}
                  className="px-5 py-3 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:text-white text-red-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                >
                  FOLD
                </button>

                <button
                  disabled={!isHumanTurn}
                  onClick={() => executePlayerAction('human_player', 'CALL')}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400/50 hover:text-black text-cyan-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                >
                  {gameState.highestBet > human.currentBet ? `CALL (${gameState.highestBet - human.currentBet} NC)` : 'CHECK'}
                </button>

                <button
                  disabled={!isHumanTurn}
                  onClick={() => executePlayerAction('human_player', 'RAISE', gameState.highestBet + 200)}
                  className="px-6 py-3 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-40 cursor-pointer"
                >
                  RAISE (+200 NC)
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
