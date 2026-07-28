/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface TradeRecord {
  id: string;
  senderId: string;
  senderTag: string;
  receiverId: string;
  receiverTag: string;
  offeredItems: string[];
  offeredCoins: number;
  offeredCredits: number;
  offeredTokens: number;
  requestedItems: string[];
  requestedCoins: number;
  requestedCredits: number;
  requestedTokens: number;
  timestamp: number;
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'REJECTED';
  verificationHash: string;
}

const STORAGE_KEY = 'neon_arena_trade_history_v1';

export function generateVerificationHash(trade: Omit<TradeRecord, 'verificationHash'>): string {
  const raw = `${trade.id}:${trade.senderId}:${trade.receiverId}:${trade.offeredCoins}:${trade.requestedCoins}:${trade.timestamp}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'NA-SEC-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export const INITIAL_TRADES: TradeRecord[] = [
  {
    id: 'tr_10928',
    senderId: 'player_self',
    senderTag: 'YOU (HIGH-ROLLER)',
    receiverId: 'usr_cyber_ninja',
    receiverTag: 'CYBER_NINJA_99',
    offeredItems: ['Cyberpunk Hologram Poker Felt'],
    offeredCoins: 500,
    offeredCredits: 0,
    offeredTokens: 0,
    requestedItems: ['Mythic Katana Blueprint'],
    requestedCoins: 0,
    requestedCredits: 50,
    requestedTokens: 0,
    timestamp: Date.now() - 3600000 * 2,
    status: 'COMPLETED',
    verificationHash: 'NA-SEC-8F92A10C'
  },
  {
    id: 'tr_10929',
    senderId: 'usr_aurora_bot',
    senderTag: 'A.U.R.O.R.A-9',
    receiverId: 'player_self',
    receiverTag: 'YOU (HIGH-ROLLER)',
    offeredItems: ['Refined Plasma Ore x5'],
    offeredCoins: 1200,
    offeredCredits: 0,
    offeredTokens: 2,
    requestedItems: ['2X Arena XP Booster'],
    requestedCoins: 0,
    requestedCredits: 0,
    requestedTokens: 0,
    timestamp: Date.now() - 3600000 * 12,
    status: 'COMPLETED',
    verificationHash: 'NA-SEC-4B11E92D'
  },
  {
    id: 'tr_10930',
    senderId: 'player_self',
    senderTag: 'YOU (HIGH-ROLLER)',
    receiverId: 'usr_glitch',
    receiverTag: 'GLITCH_ROGUE',
    offeredItems: [],
    offeredCoins: 3000,
    offeredCredits: 100,
    offeredTokens: 0,
    requestedItems: ['Legend High-Roller Cyber Visor'],
    requestedCoins: 0,
    requestedCredits: 0,
    requestedTokens: 5,
    timestamp: Date.now() - 3600000 * 24,
    status: 'CANCELLED',
    verificationHash: 'NA-SEC-9C22B00E'
  }
];

export function getStoredTradeHistory(): TradeRecord[] {
  if (typeof window === 'undefined') return INITIAL_TRADES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading trade history:', e);
  }
  return INITIAL_TRADES;
}

export function saveTradeRecord(trade: Omit<TradeRecord, 'verificationHash'>): TradeRecord {
  const verificationHash = generateVerificationHash(trade);
  const fullRecord: TradeRecord = { ...trade, verificationHash };

  const current = getStoredTradeHistory();
  const updated = [fullRecord, ...current];

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return fullRecord;
}
