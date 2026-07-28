/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEconomyStore } from './economyStore';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  RefreshCw, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Layers, 
  X, 
  Coins 
} from 'lucide-react';

export interface ExchangeAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'COMMODITY' | 'CYBER_TECH' | 'BLUEPRINT' | 'CURRENCY' | 'POKER_CHIP';
  price: number;
  prevPrice: number;
  change24h: number;
  volume: number;
  high: number;
  low: number;
  sparkline: number[];
  icon: string;
}

const INITIAL_ASSETS: ExchangeAsset[] = [
  {
    id: 'plasma_ore',
    symbol: 'PLSM',
    name: 'Refined Plasma Ore',
    category: 'COMMODITY',
    price: 145.8,
    prevPrice: 142.0,
    change24h: 2.67,
    volume: 184500,
    high: 152.0,
    low: 138.5,
    sparkline: [138, 140, 142, 139, 144, 142, 145.8],
    icon: '⚡'
  },
  {
    id: 'legend_token_spot',
    symbol: 'LGD',
    name: 'Legend Token Index',
    category: 'CURRENCY',
    price: 420.0,
    prevPrice: 400.0,
    change24h: 5.0,
    volume: 98000,
    high: 435.0,
    low: 395.0,
    sparkline: [395, 405, 410, 400, 415, 420],
    icon: '👑'
  },
  {
    id: 'cyber_chip_futures',
    symbol: 'NCCHP',
    name: 'Poker High-Roller Chips',
    category: 'POKER_CHIP',
    price: 88.5,
    prevPrice: 91.2,
    change24h: -2.96,
    volume: 312000,
    high: 94.0,
    low: 85.0,
    sparkline: [94, 92, 91, 90, 89, 88.5],
    icon: '🎴'
  },
  {
    id: 'darknet_drive',
    symbol: 'DATA',
    name: 'Encrypted Darknet Core',
    category: 'CYBER_TECH',
    price: 1250.0,
    prevPrice: 1180.0,
    change24h: 5.93,
    volume: 45000,
    high: 1290.0,
    low: 1150.0,
    sparkline: [1150, 1180, 1200, 1190, 1230, 1250],
    icon: '💾'
  },
  {
    id: 'katana_blueprint',
    symbol: 'BLD-X',
    name: 'Mythic Katana Blueprint',
    category: 'BLUEPRINT',
    price: 3400.0,
    prevPrice: 3550.0,
    change24h: -4.22,
    volume: 12500,
    high: 3600.0,
    low: 3350.0,
    sparkline: [3600, 3550, 3480, 3520, 3420, 3400],
    icon: '⚔️'
  }
];

export function NeonExchangeFeed({ onClose }: { onClose?: () => void }) {
  const { neonCoins, addCurrency, deductCurrency } = useEconomyStore();
  const [assets, setAssets] = useState<ExchangeAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<ExchangeAsset>(INITIAL_ASSETS[0]);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMMODITY' | 'CYBER_TECH' | 'CURRENCY' | 'POKER_CHIP'>('ALL');

  // Real-time server market fluctuation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          const fluctuation = (Math.random() - 0.48) * 0.04; // slight random movement
          const newPrice = Math.max(1, Number((asset.price * (1 + fluctuation)).toFixed(2)));
          const change = Number((((newPrice - asset.prevPrice) / asset.prevPrice) * 100).toFixed(2));
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change24h: change,
            high: Math.max(asset.high, newPrice),
            low: Math.min(asset.low, newPrice),
            sparkline: newSparkline
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleBuy = () => {
    const totalCost = Math.round(selectedAsset.price * tradeAmount);
    if (deductCurrency('neonCoins', totalCost, `Bought ${tradeAmount}x ${selectedAsset.symbol} on Neon Exchange`, 'SPEND')) {
      alert(`Successfully acquired ${tradeAmount}x ${selectedAsset.name} for ${totalCost} Neon Coins!`);
    } else {
      alert('Insufficient Neon Coins for this Exchange order!');
    }
  };

  const handleSell = () => {
    const totalEarnings = Math.round(selectedAsset.price * tradeAmount * 0.98); // 2% exchange fee
    addCurrency('neonCoins', totalEarnings, `Sold ${tradeAmount}x ${selectedAsset.symbol} on Neon Exchange`, 'EARN');
    alert(`Sold ${tradeAmount}x ${selectedAsset.name} for ${totalEarnings} Neon Coins!`);
  };

  const filtered = assets.filter(a => activeTab === 'ALL' || a.category === activeTab);

  return (
    <div className="bg-zinc-950 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-white flex flex-col space-y-6">
      {/* Header Ticker Banner */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-400">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-wider text-cyan-400 uppercase">NEON EXCHANGE REAL-TIME FEED</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Live Server Economy Fluctuations & Liquidity Pool</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Marquee Ticker Stream */}
      <div className="bg-black/80 border border-white/10 rounded-2xl py-2 px-4 overflow-hidden flex items-center">
        <div className="text-[10px] font-mono font-bold text-amber-400 pr-4 border-r border-white/10 uppercase flex items-center gap-1">
          <Sparkles size={12} />
          <span>MARKET TICKER</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pl-4 no-scrollbar font-mono text-xs">
          {assets.map(a => (
            <div key={a.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedAsset(a)}>
              <span className="font-bold text-zinc-300">{a.symbol}:</span>
              <span className="text-white font-mono">${a.price}</span>
              <span className={`text-[10px] font-bold flex items-center ${a.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {a.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {a.change24h}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Asset List & Selected Market Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Asset Category Tabs & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['ALL', 'COMMODITY', 'CYBER_TECH', 'CURRENCY', 'POKER_CHIP'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filtered.map(asset => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedAsset.id === asset.id ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-zinc-900/60 border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{asset.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{asset.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-300 font-bold">{asset.symbol}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">Vol: {asset.volume.toLocaleString()}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-white">{asset.price} NC</div>
                  <div className={`text-xs font-bold flex items-center justify-end ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Interactive Order Terminal */}
        <div className="bg-zinc-900/90 border border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedAsset.icon}</span>
                <div>
                  <h3 className="text-base font-black italic text-white uppercase">{selectedAsset.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400">{selectedAsset.symbol} // SPOT MARKET</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-black text-amber-400">{selectedAsset.price} NC</div>
                <div className="text-[9px] font-bold text-zinc-400">High: {selectedAsset.high} | Low: {selectedAsset.low}</div>
              </div>
            </div>

            {/* Sparkline Visual Simulation */}
            <div className="bg-black/60 border border-white/5 p-3 rounded-xl mb-4">
              <div className="text-[9px] font-mono text-zinc-400 mb-2 uppercase flex justify-between">
                <span>PRICE TREND (PAST 10 TICKS)</span>
                <span className={selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>{selectedAsset.change24h}%</span>
              </div>
              <div className="flex items-end gap-1 h-16 pt-2">
                {selectedAsset.sparkline.map((val, idx) => {
                  const min = Math.min(...selectedAsset.sparkline);
                  const max = Math.max(...selectedAsset.sparkline);
                  const range = max - min || 1;
                  const heightPct = Math.max(15, Math.min(100, ((val - min) / range) * 100));
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t transition-all ${selectedAsset.change24h >= 0 ? 'bg-emerald-400/80' : 'bg-red-400/80'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Trade Quantity Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-300 uppercase font-bold">ORDER QUANTITY</label>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 50, 100].map(qty => (
                  <button
                    key={qty}
                    onClick={() => setTradeAmount(qty)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      tradeAmount === qty ? 'bg-amber-400 text-black font-black' : 'bg-zinc-800 text-zinc-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {qty}x
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex justify-between pt-1">
                <span>ESTIMATED TOTAL:</span>
                <span className="font-bold text-amber-300">{Math.round(selectedAsset.price * tradeAmount)} NEON COINS</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleBuy}
              className="py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              BUY MARKET
            </button>
            <button
              onClick={handleSell}
              className="py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              SELL SHORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
