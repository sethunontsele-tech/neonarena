import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';
import { X, Coins, TrendingUp, TrendingDown, History, Zap, Trophy, Heart, Activity, ShieldCheck, Cpu, FileSpreadsheet, Play } from 'lucide-react';
import { NeonExchangeFeed } from '../economy/NeonExchangeFeed';
import { TradeHistoryModal } from '../economy/TradeHistoryModal';
import { ProceduralPokerTable } from '../poker/ProceduralPokerTable';
import { EconomyAudit } from '../economy/EconomyAudit';
import { PokerTournaments } from './Casino/PokerTournaments';

type CasinoTab = 'WHEEL' | 'EXCHANGE' | 'TRADES' | 'POKER' | 'AUDIT' | 'TOURNAMENTS';

export const Casino: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const coins = useGameStore(state => state.coins);
  const gamble = useGameStore(state => state.gamble);
  const history = useGameStore(state => state.gambleHistory);
  const totalGambled = useGameStore(state => state.totalGambled);
  
  const [activeTab, setActiveTab] = useState<CasinoTab>('WHEEL');
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);

  const handleGamble = () => {
    if (coins < betAmount || isSpinning) return;
    
    setIsSpinning(true);
    soundService.playSFX('ui_click');
    
    setTimeout(() => {
      gamble(betAmount);
      setIsSpinning(false);
      const newLastResult = useGameStore.getState().gambleHistory[0]?.result;
      setLastResult(newLastResult);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[100] pointer-events-auto p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 border border-amber-500/30 p-6 md:p-8 rounded-[3rem] w-full max-w-6xl h-[88vh] flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-3.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Coins size={28} className="text-black" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">V-NEON CASINO & ECONOMY HUB</h2>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1">Living Market • Tournaments • Procedural Poker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-500 hover:text-black rounded-2xl transition-all cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4 overflow-x-auto no-scrollbar font-mono text-xs">
          {[
            { id: 'WHEEL', label: '🎡 CASINO WHEEL', icon: Coins },
            { id: 'EXCHANGE', label: '📈 NEON EXCHANGE', icon: Activity },
            { id: 'TRADES', label: '🛡️ TRADE HISTORY', icon: ShieldCheck },
            { id: 'POKER', label: '🎴 PROCEDURAL POKER', icon: Cpu },
            { id: 'AUDIT', label: '📊 ECONOMY AUDIT', icon: FileSpreadsheet },
            { id: 'TOURNAMENTS', label: '🏆 POKER TOURNAMENTS', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as CasinoTab); soundService.playSFX('ui_click'); }}
              className={`px-4 py-2 rounded-xl font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black' : 'bg-white/5 text-zinc-400 border border-white/5 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'WHEEL' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Main Wheel Controls */}
              <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-[2rem] relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Available Balance</div>
                    <div className="text-5xl font-black text-white italic tracking-tighter mb-4 flex items-center gap-3">
                      {coins.toLocaleString()}
                      <span className="text-lg text-amber-500 not-italic uppercase tracking-widest ml-1">Coins</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest">
                      <div className="text-emerald-400">Total Winnings: {(coins - 500 + totalGambled).toLocaleString()}</div>
                      <div className="text-white/20">|</div>
                      <div className="text-red-400">Total Gambled: {totalGambled.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Betting Controls */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-white/50">Select Bet Amount</span>
                    <span className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black text-white">MAX BET: 100,000</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2.5">
                    {[10, 50, 100, 500, 1000, 5000, 10000, 50000].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => { setBetAmount(amt); soundService.playSFX('ui_click'); }}
                        className={`py-3 rounded-xl font-black transition-all border-2 text-xs ${betAmount === amt ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-transparent border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="relative pt-4">
                    <AnimatePresence mode="wait">
                      {lastResult && (
                        <motion.div
                          key={Date.now()}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          className={`absolute -top-4 left-1/2 -translate-x-1/2 z-20 font-black text-3xl italic tracking-tighter uppercase ${lastResult === 'win' ? 'text-emerald-400' : 'text-red-500'}`}
                        >
                          {lastResult === 'win' ? 'WINNER!' : 'LOST'}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={handleGamble}
                      disabled={isSpinning || coins < betAmount}
                      className={`w-full py-6 rounded-[1.5rem] font-black text-xl uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${isSpinning ? 'bg-zinc-800 text-white/20' : 'bg-white text-black hover:bg-amber-500 hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                      {isSpinning ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                          <Zap size={28} />
                        </motion.div>
                      ) : (
                        'SPIN THE WHEEL'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* History / Sidebar */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] px-2 flex justify-between items-center">
                  Live Feed
                  <span className="text-emerald-500 animate-pulse">● LIVE</span>
                </h3>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] p-5 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {history.map((record, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${record.result === 'win' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${record.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {record.result === 'win' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${record.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {record.result === 'win' ? `+${record.amount.toLocaleString()}` : `-${record.amount.toLocaleString()}`}
                          </div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-white/20">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-black italic text-white/30 truncate max-w-[100px]">
                        {record.result === 'win' ? 'JACKPOT REACHED' : 'SYSTEM RECLAIM'}
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/10 text-center p-8">
                      <TrendingUp size={40} className="mb-2 opacity-20" />
                      <p className="font-bold uppercase tracking-widest text-xs">No bets placed in this session.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EXCHANGE' && <NeonExchangeFeed />}
          {activeTab === 'TRADES' && <TradeHistoryModal onClose={() => setActiveTab('WHEEL')} />}
          {activeTab === 'POKER' && <ProceduralPokerTable onClose={() => setActiveTab('WHEEL')} />}
          {activeTab === 'AUDIT' && <EconomyAudit />}
          {activeTab === 'TOURNAMENTS' && <PokerTournaments />}
        </div>
      </motion.div>
    </div>
  );
};
