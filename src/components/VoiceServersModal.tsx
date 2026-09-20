import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Mic, MicOff, Users, Server, Plus, LogOut, Radio, Volume2 } from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

export function VoiceServersModal({ onClose }: { onClose: () => void }) {
  const voiceServers = useGameStore(state => state.voiceServers);
  const activeVoiceServer = useGameStore(state => state.activeVoiceServer);
  const joinVoiceServer = useGameStore(state => state.joinVoiceServer);
  const leaveVoiceServer = useGameStore(state => state.leaveVoiceServer);
  const createVoiceServer = useGameStore(state => state.createVoiceServer);
  const isMuted = useGameStore(state => state.isMuted);
  const socket = useGameStore(state => state.socket);

  const [newServerName, setNewServerName] = useState('');

  useEffect(() => {
    if (socket) {
      socket.emit('getVoiceServers');
    }
  }, [socket]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServerName.trim()) {
      createVoiceServer(newServerName.trim());
      setNewServerName('');
      soundService.playSFX('powerup');
    }
  };

  const activeServerData = activeVoiceServer ? voiceServers[activeVoiceServer] : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-950 border-2 border-cyan-500/30 w-full max-w-4xl h-[80vh] rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.2)] flex overflow-hidden"
      >
        {/* Left Sidebar - Server List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/40">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Radio className="text-cyan-400" size={24} />
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Comms</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {Object.values(voiceServers).map(vs => (
              <button
                key={vs.id}
                onClick={() => {
                  if (activeVoiceServer !== vs.id) {
                    joinVoiceServer(vs.id);
                    soundService.playSFX('ui_click');
                  }
                }}
                className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all ${
                  activeVoiceServer === vs.id 
                    ? 'bg-cyan-500/20 border-cyan-500/50 border' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Server size={18} className={activeVoiceServer === vs.id ? 'text-cyan-400' : 'text-zinc-400'} />
                  <span className={`font-bold ${activeVoiceServer === vs.id ? 'text-white' : 'text-zinc-300'}`}>
                    {vs.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Users size={12} />
                  <span>{Object.keys(vs.participants || {}).length}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                placeholder="New Channel Name"
                value={newServerName}
                onChange={e => setNewServerName(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Area - Active Server Info */}
        <div className="flex-1 flex flex-col relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full transition-colors z-10"
          >
            <X size={24} />
          </button>

          {activeServerData ? (
            <>
              <div className="p-8 border-b border-white/10 bg-gradient-to-b from-cyan-900/20 to-transparent">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-wider mb-2">
                  {activeServerData.name}
                </h1>
                <div className="text-cyan-400 font-mono text-sm flex items-center gap-2">
                  <Volume2 size={16} />
                  Voice Connected
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(activeServerData.participants).map(([id, name]) => (
                    <div key={id} className="bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50" />
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-2xl text-white font-bold">{String(name).charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="text-white font-bold text-sm truncate w-full text-center">{String(name)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center">
                <button
                  onClick={() => {
                    useGameStore.setState(s => ({ isMuted: !s.isMuted }));
                    soundService.playSFX('ui_click');
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase transition-all ${
                    isMuted 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  {isMuted ? 'Muted' : 'Mic Active'}
                </button>

                <button
                  onClick={() => {
                    leaveVoiceServer();
                    soundService.playSFX('ui_click');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase transition-all"
                >
                  <LogOut size={20} />
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <Radio size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-bold uppercase tracking-widest">No Channel Selected</p>
              <p className="text-sm font-mono mt-2">Join a server from the left to start communicating.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
