/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'EARN' | 'SPEND' | 'POKER_WIN' | 'POKER_LOSS' | 'REWARD' | 'TRADE';
  currency: 'neonCoins' | 'arenaCredits' | 'legendTokens';
  amount: number;
  description: string;
}

export interface EconomyItem {
  id: string;
  name: string;
  category: 'cosmetic' | 'booster' | 'blueprint' | 'poker_theme' | 'avatar' | 'dimension_pass';
  price: number;
  currency: 'neonCoins' | 'arenaCredits' | 'legendTokens';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'CYBER_MYTHIC';
  description: string;
  icon: string;
  unlocked: boolean;
}

interface EconomyState {
  neonCoins: number;
  arenaCredits: number;
  legendTokens: number;
  inventory: string[]; // item IDs
  transactions: Transaction[];

  // Shop Items
  catalog: EconomyItem[];

  // Actions
  addCurrency: (currency: 'neonCoins' | 'arenaCredits' | 'legendTokens', amount: number, description: string, type?: Transaction['type']) => void;
  deductCurrency: (currency: 'neonCoins' | 'arenaCredits' | 'legendTokens', amount: number, description: string, type?: Transaction['type']) => boolean;
  buyItem: (item: EconomyItem) => boolean;
  isItemOwned: (itemId: string) => boolean;
}

const DEFAULT_CATALOG: EconomyItem[] = [
  {
    id: 'poker_table_cyberpunk',
    name: 'Cyberpunk Hologram Poker Felt',
    category: 'poker_theme',
    price: 1500,
    currency: 'neonCoins',
    rarity: 'RARE',
    description: 'Custom animated neon cyan table skin for Neon Arena Poker.',
    icon: '🎴',
    unlocked: true,
  },
  {
    id: 'poker_table_gold',
    name: 'Legendary Royal Gold Poker Felt',
    category: 'poker_theme',
    price: 25,
    currency: 'legendTokens',
    rarity: 'LEGENDARY',
    description: 'Ultra luxurious gold leaf animated poker table with floating crown chips.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'booster_xp_2x',
    name: '2X Arena XP Booster (2 Hours)',
    category: 'booster',
    price: 500,
    currency: 'neonCoins',
    rarity: 'COMMON',
    description: 'Doubles all XP earned in Cyberpunk Poker and Combat Matches for 2 hours.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'dimension_pass_galaxy',
    name: 'Deep Space Dimension Key',
    category: 'dimension_pass',
    price: 250,
    currency: 'arenaCredits',
    rarity: 'EPIC',
    description: 'Grants full procedural universe creation rights in the Universe Engine.',
    icon: '🌌',
    unlocked: false,
  },
  {
    id: 'avatar_neon_king',
    name: 'Neon High-Roller Cyber Visor',
    category: 'cosmetic',
    price: 10,
    currency: 'legendTokens',
    rarity: 'CYBER_MYTHIC',
    description: 'Exclusive reactive animated helmet for poker & combat arenas.',
    icon: '🥽',
    unlocked: false,
  }
];

const STORAGE_KEY = 'neon_arena_economy_v2';

function loadEconomySavedData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed loading economy data:', e);
  }
  return null;
}

const saved = loadEconomySavedData();

export const useEconomyStore = create<EconomyState>((set, get) => ({
  neonCoins: saved?.neonCoins ?? 5000,
  arenaCredits: saved?.arenaCredits ?? 350,
  legendTokens: saved?.legendTokens ?? 15,
  inventory: saved?.inventory ?? ['poker_table_cyberpunk'],
  transactions: saved?.transactions ?? [
    {
      id: 'tx_init',
      timestamp: Date.now() - 10000,
      type: 'REWARD',
      currency: 'neonCoins',
      amount: 5000,
      description: 'Neon Arena Starter Welcome Bonus'
    },
    {
      id: 'tx_cred',
      timestamp: Date.now() - 5000,
      type: 'REWARD',
      currency: 'arenaCredits',
      amount: 350,
      description: 'Season 1 Founder Credits Granted'
    }
  ],
  catalog: DEFAULT_CATALOG,

  addCurrency: (currency, amount, description, type = 'EARN') => {
    set(state => {
      const nextAmount = state[currency] + amount;
      const tx: Transaction = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type,
        currency,
        amount,
        description
      };
      const newState = {
        ...state,
        [currency]: nextAmount,
        transactions: [tx, ...state.transactions].slice(0, 50)
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          neonCoins: newState.neonCoins,
          arenaCredits: newState.arenaCredits,
          legendTokens: newState.legendTokens,
          inventory: newState.inventory,
          transactions: newState.transactions
        }));
      }
      return newState;
    });
  },

  deductCurrency: (currency, amount, description, type = 'SPEND') => {
    const current = get()[currency];
    if (current < amount) return false;

    set(state => {
      const nextAmount = state[currency] - amount;
      const tx: Transaction = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type,
        currency,
        amount: -amount,
        description
      };
      const newState = {
        ...state,
        [currency]: nextAmount,
        transactions: [tx, ...state.transactions].slice(0, 50)
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          neonCoins: newState.neonCoins,
          arenaCredits: newState.arenaCredits,
          legendTokens: newState.legendTokens,
          inventory: newState.inventory,
          transactions: newState.transactions
        }));
      }
      return newState;
    });
    return true;
  },

  buyItem: (item) => {
    const { deductCurrency, inventory, catalog } = get();
    if (inventory.includes(item.id)) return true; // Already owned

    const success = deductCurrency(item.currency, item.price, `Purchased: ${item.name}`, 'SPEND');
    if (success) {
      set(state => {
        const nextInv = [...state.inventory, item.id];
        const nextCatalog = catalog.map(c => c.id === item.id ? { ...c, unlocked: true } : c);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            neonCoins: state.neonCoins,
            arenaCredits: state.arenaCredits,
            legendTokens: state.legendTokens,
            inventory: nextInv,
            transactions: state.transactions
          }));
        }
        return { inventory: nextInv, catalog: nextCatalog };
      });
      return true;
    }
    return false;
  },

  isItemOwned: (itemId) => {
    return get().inventory.includes(itemId);
  }
}));
