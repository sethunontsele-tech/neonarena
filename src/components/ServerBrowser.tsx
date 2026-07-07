import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { Globe, Users, Signal, RefreshCw, ChevronRight, X, LayoutGrid } from 'lucide-react';

export function ServerBrowser({ onClose }: { onClose: () => void }) {
  const { servers, isLoadingServers, refreshServers, joinServer } = useGameStore();

  useEffect(() => {
    refreshServers();
  }, []);

  return (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 border border-white/10 w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full">Live Network</span>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Quantum Encrypted Connections</span>
            </div>
            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Global Servers</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => refreshServers()}
              disabled={isLoadingServers}
              className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 ${isLoadingServers ? 'animate-spin opacity-50' : ''}`}
            >
              <RefreshCw size={24} />
            </button>
            <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl transition-all">
              <X size={32} className="text-white/40" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {isLoadingServers ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div 
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-32 bg-white/5 border border-white/5 rounded-[2rem] animate-pulse"
                  />
                ))
              ) : (
                servers.map((server, i) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between"
                    onClick={() => joinServer(server.id)}
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white border transition-all group-hover:scale-110 ${
                        server.type === 'open-world' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' :
                        server.type === 'competitive' ? 'bg-red-500/20 border-red-500/50 text-red-500' :
                        'bg-blue-500/20 border-blue-500/50 text-blue-500'
                      }`}>
                        {server.type === 'open-world' ? <Globe size={32} /> : <LayoutGrid size={32} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">{server.name}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            server.type === 'open-world' ? 'bg-emerald-500 text-black' :
                            server.type === 'competitive' ? 'bg-red-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {server.type.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex gap-6 text-[10px] font-black text-white/40 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <Signal size={12} className={server.ping < 50 ? 'text-emerald-500' : 'text-amber-500'} />
                            {server.ping}ms // {server.region}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Globe size={12} />
                            Map: {server.map}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-2xl font-black text-white">
                          <Users size={20} className="text-blue-500" />
                          {server.players}<span className="text-white/20">/{server.maxPlayers}</span>
                        </div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Uptime: 100.0%</div>
                      </div>
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <div className="flex gap-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
            <span>Active Matches: {servers.length * 42}</span>
            <span>Total Players: {servers.reduce((acc, s) => acc + s.players, 0) + 12401}</span>
            <span>Global Latency: 32ms Avg</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            System Synchronized
          </div>
        </div>
      </motion.div>
    </div>
  );
}
