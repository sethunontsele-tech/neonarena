/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getStoredTradeHistory, saveTradeRecord, TradeRecord } from './tradeHistory';
import { 
  History, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  X, 
  FileCheck, 
  Coins, 
  Package, 
  Share2 
} from 'lucide-react';

export function TradeHistoryModal({ onClose }: { onClose: () => void }) {
  const [trades, setTrades] = useState<TradeRecord[]>(() => getStoredTradeHistory());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED' | 'PENDING'>('ALL');
  const [selectedTrade, setSelectedTrade] = useState<TradeRecord | null>(null);
  const [showNewTradeForm, setShowNewTradeForm] = useState(false);

  // New trade state
  const [receiverTag, setReceiverTag] = useState('');
  const [offeredCoins, setOfferedCoins] = useState(500);
  const [offeredItem, setOfferedItem] = useState('Cyber Plasma Core');
  const [requestedCoins, setRequestedCoins] = useState(0);
  const [requestedItem, setRequestedItem] = useState('Mythic Katana Blueprint');

  const filteredTrades = trades.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.senderTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.receiverTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.verificationHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNewTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverTag.trim()) return;

    const newRecord = saveTradeRecord({
      id: 'tr_' + Math.floor(10000 + Math.random() * 90000),
      senderId: 'player_self',
      senderTag: 'YOU (HIGH-ROLLER)',
      receiverId: 'usr_' + receiverTag.toLowerCase().replace(/\s+/g, '_'),
      receiverTag: receiverTag.toUpperCase(),
      offeredItems: offeredItem ? [offeredItem] : [],
      offeredCoins: Number(offeredCoins),
      offeredCredits: 0,
      offeredTokens: 0,
      requestedItems: requestedItem ? [requestedItem] : [],
      requestedCoins: Number(requestedCoins),
      requestedCredits: 0,
      requestedTokens: 0,
      timestamp: Date.now(),
      status: 'COMPLETED'
    });

    setTrades(getStoredTradeHistory());
    setSelectedTrade(newRecord);
    setShowNewTradeForm(false);
    setReceiverTag('');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-3xl z-[120] flex items-center justify-center p-4 select-none pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-5xl h-[88vh] bg-zinc-950 border-2 border-emerald-500/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.25)] flex flex-col text-white"
      >
        {/* Header Bar */}
        <div className="bg-zinc-900/90 border-b border-emerald-500/30 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black italic tracking-wider text-emerald-400 uppercase">SECURE TRADE DATABASE LOGS</h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold rounded border border-emerald-400/40">ANTI-TAMPER VERIFIED</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Player-to-Player Item Exchange History & Proof of Settlement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTradeForm(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>RECORD NEW TRADE</span>
            </button>

            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-black/60 border-b border-white/10 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Trader Tag, Trade ID, or Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-emerald-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'COMPLETED', 'CANCELLED', 'PENDING'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left List Column */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            {filteredTrades.map(trade => (
              <motion.div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedTrade?.id === trade.id ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${
                    trade.status === 'COMPLETED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                    trade.status === 'CANCELLED' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}>
                    <ArrowRightLeft size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">{trade.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-emerald-300 font-extrabold">{trade.verificationHash}</span>
                    </div>

                    <div className="text-sm font-black text-white mt-1">
                      {trade.senderTag} <span className="text-emerald-400 font-mono">➜</span> {trade.receiverTag}
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-extrabold uppercase border ${
                    trade.status === 'COMPLETED' ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' :
                    trade.status === 'CANCELLED' ? 'bg-red-500/20 border-red-400/40 text-red-300' : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  }`}>
                    {trade.status}
                  </span>
                </div>
              </motion.div>
            ))}

            {filteredTrades.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-center">
                <History size={40} className="mb-2 opacity-40" />
                <p className="font-mono text-xs font-bold uppercase">No matching trade records located in database.</p>
              </div>
            )}
          </div>

          {/* Right Selected Trade Audit Inspector */}
          {selectedTrade && (
            <div className="w-96 bg-black/80 border-l border-emerald-500/20 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div>
                <div className="border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">TRANSACTION AUDIT RECEIPT</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded font-mono text-[9px] font-bold">VERIFIED</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-mono">{selectedTrade.id}</h3>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">TIMESTAMP: {new Date(selectedTrade.timestamp).toISOString()}</p>
                </div>

                {/* Hash Badge */}
                <div className="bg-zinc-900 border border-emerald-500/30 p-3 rounded-xl mb-4 font-mono">
                  <div className="text-[9px] text-zinc-400 uppercase font-bold">CRYPTO-SIGNATURE HASH</div>
                  <div className="text-xs font-black text-emerald-300 break-all mt-0.5">{selectedTrade.verificationHash}</div>
                </div>

                {/* Sender Offered Box */}
                <div className="bg-zinc-900/60 border border-white/10 p-3 rounded-xl space-y-2 mb-3">
                  <div className="text-[10px] font-mono font-black text-amber-400 uppercase">OFFERED BY {selectedTrade.senderTag}:</div>
                  <div className="text-xs font-mono text-zinc-200">
                    {selectedTrade.offeredCoins > 0 && <div>• {selectedTrade.offeredCoins} Neon Coins</div>}
                    {selectedTrade.offeredItems.map((itm, i) => <div key={i}>• {itm}</div>)}
                    {selectedTrade.offeredCoins === 0 && selectedTrade.offeredItems.length === 0 && <div className="text-zinc-500 italic">No assets offered</div>}
                  </div>
                </div>

                {/* Receiver Requested Box */}
                <div className="bg-zinc-900/60 border border-white/10 p-3 rounded-xl space-y-2">
                  <div className="text-[10px] font-mono font-black text-cyan-400 uppercase">REQUESTED FROM {selectedTrade.receiverTag}:</div>
                  <div className="text-xs font-mono text-zinc-200">
                    {selectedTrade.requestedCoins > 0 && <div>• {selectedTrade.requestedCoins} Neon Coins</div>}
                    {selectedTrade.requestedItems.map((itm, i) => <div key={i}>• {itm}</div>)}
                    {selectedTrade.requestedCoins === 0 && selectedTrade.requestedItems.length === 0 && <div className="text-zinc-500 italic">No assets requested</div>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(`Verification Receipt exported for ${selectedTrade.id}!\nHash: ${selectedTrade.verificationHash}`)}
                className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-400/50 text-emerald-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck size={14} />
                <span>EXPORT PROOF OF SETTLEMENT</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal: Record New Trade */}
        <AnimatePresence>
          {showNewTradeForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
              <motion.form
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onSubmit={handleCreateNewTrade}
                className="bg-zinc-950 border-2 border-emerald-400 p-6 rounded-3xl w-full max-w-lg space-y-4 shadow-[0_0_80px_rgba(16,185,129,0.3)] text-white"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-lg font-black italic text-emerald-400 uppercase">RECORD SECURE TRADE EXCHANGE</h3>
                  <button type="button" onClick={() => setShowNewTradeForm(false)} className="text-zinc-400 hover:text-white"><X size={18} /></button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">RECIPIENT PLAYER TAG</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CYBER_VIPER_99"
                      value={receiverTag}
                      onChange={(e) => setReceiverTag(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-emerald-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">OFFERED ITEM NAME</label>
                    <input
                      type="text"
                      value={offeredItem}
                      onChange={(e) => setOfferedItem(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">OFFERED NEON COINS</label>
                    <input
                      type="number"
                      value={offeredCoins}
                      onChange={(e) => setOfferedCoins(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-amber-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">REQUESTED ITEM FROM RECIPIENT</label>
                    <input
                      type="text"
                      value={requestedItem}
                      onChange={(e) => setRequestedItem(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-cyan-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer mt-2"
                >
                  EXECUTE & SIGN TRADE RECORD
                </button>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
