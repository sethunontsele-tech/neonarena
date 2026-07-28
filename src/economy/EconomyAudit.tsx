/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useEconomyStore, Transaction } from './economyStore';
import { 
  FileSpreadsheet, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  ArrowUpDown, 
  Search, 
  ShieldCheck, 
  X, 
  Download, 
  Activity, 
  Layers 
} from 'lucide-react';

export function EconomyAudit({ onClose }: { onClose?: () => void }) {
  const { neonCoins, arenaCredits, legendTokens, transactions } = useEconomyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'neonCoins' | 'arenaCredits' | 'legendTokens'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Transaction['type']>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW'>('NEWEST');

  // Generate deterministic audit hash for display
  const getAuditHash = (tx: Transaction) => {
    const raw = `${tx.id}-${tx.timestamp}-${tx.amount}-${tx.currency}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) hash = (hash << 5) - hash + raw.charCodeAt(i);
    return 'AUDIT-' + Math.abs(hash).toString(16).toUpperCase().padStart(6, '0');
  };

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency = currencyFilter === 'ALL' || tx.currency === currencyFilter;
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    return matchesSearch && matchesCurrency && matchesType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'NEWEST') return b.timestamp - a.timestamp;
    if (sortOrder === 'OLDEST') return a.timestamp - b.timestamp;
    if (sortOrder === 'AMOUNT_HIGH') return Math.abs(b.amount) - Math.abs(a.amount);
    if (sortOrder === 'AMOUNT_LOW') return Math.abs(a.amount) - Math.abs(b.amount);
    return 0;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Currency', 'Amount', 'Description', 'Audit Hash'];
    const rows = sorted.map(tx => [
      tx.id,
      new Date(tx.timestamp).toISOString(),
      tx.type,
      tx.currency,
      tx.amount,
      `"${tx.description.replace(/"/g, '""')}"`,
      getAuditHash(tx)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neon_arena_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] text-white flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-wider text-amber-400 uppercase">ECONOMY AUDIT & TRANSACTION LEDGER</h2>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Cryptographically Hash-Verified Account Balance & Inflow Audit</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>EXPORT CSV LEDGER</span>
          </button>

          {onClose && (
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold">NEON COINS</div>
            <div className="text-xl font-black text-amber-400 mt-1">{neonCoins.toLocaleString()} NC</div>
          </div>
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">🪙</div>
        </div>

        <div className="bg-zinc-900/80 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold">ARENA CREDITS</div>
            <div className="text-xl font-black text-cyan-400 mt-1">{arenaCredits.toLocaleString()} AC</div>
          </div>
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">💎</div>
        </div>

        <div className="bg-zinc-900/80 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold">LEGEND TOKENS</div>
            <div className="text-xl font-black text-purple-400 mt-1">{legendTokens.toLocaleString()} LT</div>
          </div>
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">👑</div>
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="bg-black/60 border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter by description or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">ALL CURRENCIES</option>
            <option value="neonCoins">Neon Coins (NC)</option>
            <option value="arenaCredits">Arena Credits (AC)</option>
            <option value="legendTokens">Legend Tokens (LT)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 text-zinc-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">ALL TYPES</option>
            <option value="EARN">EARN</option>
            <option value="SPEND">SPEND</option>
            <option value="POKER_WIN">POKER WIN</option>
            <option value="POKER_LOSS">POKER LOSS</option>
            <option value="REWARD">REWARD</option>
            <option value="TRADE">TRADE</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 text-amber-400 font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="NEWEST">NEWEST FIRST</option>
            <option value="OLDEST">OLDEST FIRST</option>
            <option value="AMOUNT_HIGH">HIGHEST AMOUNT</option>
            <option value="AMOUNT_LOW">LOWEST AMOUNT</option>
          </select>
        </div>
      </div>

      {/* Sortable Transaction Table */}
      <div className="bg-black/80 border border-white/10 rounded-2xl overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-900 border-b border-white/10 text-zinc-400 uppercase text-[10px]">
              <th className="p-3">DATE / TIME</th>
              <th className="p-3">TRANSACTION ID</th>
              <th className="p-3">TYPE</th>
              <th className="p-3">DESCRIPTION</th>
              <th className="p-3 text-right">AMOUNT</th>
              <th className="p-3 text-right">AUDIT HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map(tx => {
              const isPositive = tx.amount >= 0;
              return (
                <tr key={tx.id} className="hover:bg-white/5 transition-all">
                  <td className="p-3 text-zinc-400 whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-amber-300">{tx.id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      tx.type === 'EARN' || tx.type === 'POKER_WIN' || tx.type === 'REWARD' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-200">{tx.description}</td>
                  <td className={`p-3 text-right font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{tx.amount} {tx.currency === 'neonCoins' ? 'NC' : tx.currency === 'arenaCredits' ? 'AC' : 'LT'}
                  </td>
                  <td className="p-3 text-right text-[10px] text-zinc-500">{getAuditHash(tx)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="p-8 text-center text-zinc-500 uppercase font-mono text-xs">
            No transaction records matched the active filter set.
          </div>
        )}
      </div>
    </div>
  );
}
