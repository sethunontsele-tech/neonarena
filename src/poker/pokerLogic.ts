/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2 to 14
}

export interface PokerPlayer {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  currentBet: number;
  cards: Card[];
  folded: boolean;
  isAI: boolean;
  personality?: 'AGGRESSIVE' | 'CONSERVATIVE' | 'NEURAL_BLUFFER' | 'CHAOTIC';
  status: 'WAITING' | 'BETTING' | 'CALL' | 'RAISE' | 'FOLD' | 'ALL_IN' | 'WINNER';
}

export interface PokerState {
  tableId: string;
  tableName: string;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  pot: number;
  communityCards: Card[];
  deck: Card[];
  players: PokerPlayer[];
  currentTurnIndex: number;
  dealerIndex: number;
  stage: 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'WAITING';
  highestBet: number;
  message: string;
  winnerHandDescription?: string;
  winners: string[]; // Player IDs
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({
        suit,
        rank: RANKS[i],
        value: i + 2
      });
    }
  }
  // Shuffle Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function evaluateHand(cards: Card[]): { score: number; name: string } {
  if (cards.length < 5) return { score: 0, name: 'High Card' };

  // Sort descending by value
  const sorted = [...cards].sort((a, b) => b.value - a.value);

  // Simple hand evaluator for best 5 cards
  const counts: Record<number, number> = {};
  const suitCounts: Record<Suit, Card[]> = { '♠': [], '♥': [], '♦': [], '♣': [] };

  sorted.forEach(c => {
    counts[c.value] = (counts[c.value] || 0) + 1;
    suitCounts[c.suit].push(c);
  });

  // Check Flush
  let flushCards: Card[] | null = null;
  for (const suit of SUITS) {
    if (suitCounts[suit].length >= 5) {
      flushCards = suitCounts[suit];
      break;
    }
  }

  // Check Straight
  const uniqueValues = Array.from(new Set(sorted.map(c => c.value)));
  if (uniqueValues.includes(14)) uniqueValues.push(1); // Ace low straight check
  uniqueValues.sort((a, b) => b - a);

  let straightHigh = 0;
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (
      uniqueValues[i] - 1 === uniqueValues[i + 1] &&
      uniqueValues[i + 1] - 1 === uniqueValues[i + 2] &&
      uniqueValues[i + 2] - 1 === uniqueValues[i + 3] &&
      uniqueValues[i + 3] - 1 === uniqueValues[i + 4]
    ) {
      straightHigh = uniqueValues[i];
      break;
    }
  }

  const freq = Object.entries(counts).map(([val, count]) => ({ val: Number(val), count }));
  freq.sort((a, b) => b.count - a.count || b.val - a.val);

  if (flushCards && straightHigh > 0) {
    if (straightHigh === 14) return { score: 9000, name: '⚡ ROYAL FLUSH ⚡' };
    return { score: 8000 + straightHigh, name: '🌌 STRAIGHT FLUSH' };
  }

  if (freq[0].count === 4) {
    return { score: 7000 + freq[0].val, name: '💎 FOUR OF A KIND' };
  }

  if (freq[0].count === 3 && freq[1]?.count >= 2) {
    return { score: 6000 + freq[0].val * 10 + freq[1].val, name: '🏆 FULL HOUSE' };
  }

  if (flushCards) {
    return { score: 5000 + flushCards[0].value, name: '✨ FLUSH' };
  }

  if (straightHigh > 0) {
    return { score: 4000 + straightHigh, name: '🎯 STRAIGHT' };
  }

  if (freq[0].count === 3) {
    return { score: 3000 + freq[0].val, name: '🔮 THREE OF A KIND' };
  }

  if (freq[0].count === 2 && freq[1]?.count === 2) {
    return { score: 2000 + freq[0].val * 10 + freq[1].val, name: '⚔️ TWO PAIR' };
  }

  if (freq[0].count === 2) {
    return { score: 1000 + freq[0].val, name: '🛡️ PAIR' };
  }

  return { score: sorted[0].value, name: `HIGH CARD (${sorted[0].rank})` };
}

export const AI_BOT_PROFILES: Omit<PokerPlayer, 'cards' | 'currentBet' | 'folded' | 'status'>[] = [
  {
    id: 'ai_bot_neon_vortex',
    name: 'A.U.R.O.R.A-9',
    avatar: '🤖',
    chips: 5000,
    isAI: true,
    personality: 'NEURAL_BLUFFER'
  },
  {
    id: 'ai_bot_cyber_viper',
    name: 'CYBER-VIPER',
    avatar: '🐍',
    chips: 7500,
    isAI: true,
    personality: 'AGGRESSIVE'
  },
  {
    id: 'ai_bot_synth_monk',
    name: 'SYNTH-MONK',
    avatar: '☸️',
    chips: 10000,
    isAI: true,
    personality: 'CONSERVATIVE'
  },
  {
    id: 'ai_bot_glitch_rogue',
    name: 'GLITCH-ROGUE',
    avatar: '👾',
    chips: 6000,
    isAI: true,
    personality: 'CHAOTIC'
  }
];
