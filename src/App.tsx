/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from './components/Game';
import { VoiceChat } from './components/VoiceChat';
import { MobileControls } from './components/MobileControls';
import { useGameStore, WEAPONS } from './store';
import { Mic, MicOff, ArrowUp, LogIn, LogOut, Trophy, Target, Zap, Activity } from 'lucide-react';
import { auth, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function HUD() {
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.score);
  const kills = useGameStore(state => state.kills);
  const deaths = useGameStore(state => state.deaths);
  const timeLeft = useGameStore(state => state.timeLeft);
  const health = useGameStore(state => state.health);
  const playerState = useGameStore(state => state.playerState);
  const otherPlayers = useGameStore(state => state.otherPlayers);
  const events = useGameStore(state => state.events);
  const playerCount = Object.keys(otherPlayers).length + 1;
  const leaveGame = useGameStore(state => state.leaveGame);
  const triggerEmote = useGameStore(state => state.triggerEmote);
  const isMuted = useGameStore(state => state.isMuted);
  const toggleMute = useGameStore(state => state.toggleMute);
  
  const selectedMode = useGameStore(state => state.selectedMode);
  const team = useGameStore(state => state.team);
  const teamScores = useGameStore(state => state.teamScores);
  const flags = useGameStore(state => state.flags);
  
  const inventory = useGameStore(state => state.inventory);
  const currentWeaponIndex = useGameStore(state => state.currentWeaponIndex);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const setInventoryOpen = useGameStore(state => state.setInventoryOpen);

  const isBuildMode = useGameStore(state => state.isBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const setSelectedBlock = useGameStore(state => state.setSelectedBlock);

  const chatMessages = useGameStore(state => state.chatMessages);
  const sendChatMessage = useGameStore(state => state.sendChatMessage);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState<'global' | 'proximity'>('global');

  const isSpectating = useGameStore(state => state.isSpectating);
  const spectatorTargetId = useGameStore(state => state.spectatorTargetId);
  const setSpectating = useGameStore(state => state.setSpectating);
  const cycleSpectator = useGameStore(state => state.cycleSpectator);
  const currentAmmo = useGameStore(state => state.currentAmmo);
  const reload = useGameStore(state => state.reload);
  const roomId = useGameStore(state => state.roomId);
  const saveMap = useGameStore(state => state.saveMap);
  const clearMap = useGameStore(state => state.clearMap);

  const [showScoreboard, setShowScoreboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
      if (e.key === 'i' || e.key === 'I' || e.key === 'e' || e.key === 'E') {
        if (!isChatOpen) {
          setInventoryOpen(!isInventoryOpen);
        }
      }
      if (e.key === 'Escape') {
        if (isInventoryOpen) {
          setInventoryOpen(false);
        } else if (isChatOpen) {
          setIsChatOpen(false);
        }
      }
      if (e.key === 'Enter' && !isChatOpen) {
        setIsChatOpen(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setShowScoreboard(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isChatOpen]);

  const leaderboard = useMemo(() => {
    const players = [
      { id: useGameStore.getState().gamertag, score: score, kills: kills, deaths: deaths, isMe: true },
      ...Object.values(otherPlayers).map(p => ({
        id: p.name,
        score: p.score,
        kills: p.kills,
        deaths: p.deaths,
        isMe: false
      }))
    ];
    return players.sort((a, b) => b.score - a.score);
  }, [score, kills, deaths, otherPlayers]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput, chatType);
      setChatInput('');
      setIsChatOpen(false);
    }
  };

  const currentWeapon = WEAPONS[inventory[currentWeaponIndex]];

  return (
    <>
      {/* Crosshair */}
      {!isSpectating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="relative">
            <div className={`w-4 h-4 border-2 rounded-full ${playerState === 'disabled' ? 'border-red-500' : 'border-amber-400'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${playerState === 'disabled' ? 'bg-red-500' : 'bg-amber-400'}`} />
          </div>
          {!document.pointerLockElement && gameState === 'playing' && (
            <div className="mt-4 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
              Click to Aim
            </div>
          )}
        </div>
      )}

      {/* Spectator UI */}
      {isSpectating && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none flex flex-col items-center justify-between py-12">
          <div className="bg-amber-400/20 border border-amber-400 px-6 py-2 rounded-full backdrop-blur-md">
            <h2 className="text-amber-400 font-black tracking-widest uppercase text-xl animate-pulse">
              HOLO-CAM SPECTATOR MODE
            </h2>
          </div>
          
          <div className="flex flex-col items-center gap-4 pointer-events-auto">
            <div className="text-white font-bold text-lg">
              SPECTATING: <span className="text-amber-400">{otherPlayers[spectatorTargetId]?.name || 'Unknown'}</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => cycleSpectator()}
                className="px-8 py-3 bg-amber-400 text-black font-black rounded-xl hover:bg-white transition-all uppercase tracking-widest"
              >
                Next Player
              </button>
              <button 
                onClick={() => setSpectating(false)}
                className="px-8 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-white hover:text-red-500 transition-all uppercase tracking-widest"
              >
                Respawn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Chat Indicator (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <button 
          onClick={toggleMute}
          className={`px-4 py-2 rounded-xl border-2 font-black text-xs tracking-widest transition-all flex items-center gap-2 ${
            !isMuted 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
              : 'bg-red-500/20 border-red-500 text-red-400'
          }`}
        >
          {!isMuted ? <Mic size={14} /> : <MicOff size={14} />}
          {isMuted ? 'VOICE OFF' : 'VOICE ON'}
        </button>
      </div>

      {/* HUD Left - Score & Leaderboard */}
      <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-white text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
            OPERATOR: {useGameStore.getState().gamertag}
          </div>
          <div className="text-amber-400 text-2xl font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
            {selectedMode === 'ffa' ? `SCORE: ${score.toString().padStart(4, '0')}` : `TEAM: ${team.toUpperCase()}`}
          </div>
          
          {selectedMode !== 'ffa' && (
            <div className="flex gap-4 mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Amber</span>
                <span className="text-xl font-black text-amber-400">{teamScores.amber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-400 font-bold uppercase">Blue</span>
                <span className="text-xl font-black text-blue-400">{teamScores.blue}</span>
              </div>
            </div>
          )}

          {/* Player Health Bar */}
          {!isSpectating && (
            <>
              <div className="w-48 h-4 bg-black/50 border border-amber-900/50 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${health > 50 ? 'bg-emerald-500' : health > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${health}%` }}
                />
              </div>
              <div className="text-[10px] text-amber-400/70 font-bold tracking-widest">HEALTH: {health}%</div>
            </>
          )}
          
          {selectedMode === 'ctf' && (
            <div className="mt-4 flex flex-col gap-2">
              {flags.map(f => (
                <div key={f.team} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${f.team === 'amber' ? 'bg-amber-400' : 'bg-blue-400'} ${f.carrierId ? 'animate-pulse' : ''}`} />
                  <span className={`text-[10px] font-bold uppercase ${f.team === 'amber' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {f.team === 'amber' ? 'Amber' : 'Blue'} Flag: {f.carrierId ? 'STOLEN' : 'AT BASE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Leaderboard */}
        <div className="bg-black/50 border border-amber-900/50 p-3 rounded w-48 flex flex-col gap-1">
          <div className="text-amber-400/70 text-xs font-bold mb-1 border-b border-amber-900/50 pb-1">LEADERBOARD</div>
          {leaderboard.map((p, i) => (
            <div key={p.id} className={`flex justify-between text-sm ${p.isMe ? 'text-amber-400 font-bold' : 'text-amber-400/70'}`}>
              <span>{i + 1}. {p.id}</span>
              <span>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* HUD Right - Time, Leave, Events */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-amber-400 font-mono text-lg mb-1">
          {Math.floor(timeLeft / 60)}:{(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}
        </div>

        {/* Map Management for Private Servers */}
        {roomId && roomId.startsWith('private-') && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={saveMap}
              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-black rounded-lg hover:bg-emerald-500/40 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <Zap size={12} />
              Save Map
            </button>
            <button
              onClick={() => {
                clearMap();
              }}
              className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black rounded-lg hover:bg-red-500/40 transition-all uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        )}

        {/* Ammo Counter */}
        {!isSpectating && !currentWeapon.isMelee && (
          <div className="bg-black/60 border border-amber-500/30 px-4 py-2 rounded-xl flex flex-col items-end shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <div className="text-[10px] text-amber-400/50 font-black uppercase tracking-widest">Ammunition</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${currentAmmo[currentWeapon.id] <= (currentWeapon.maxAmmo * 0.25) ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {currentAmmo[currentWeapon.id]}
              </span>
              <span className="text-amber-400/40 text-sm font-bold">/ {currentWeapon.maxAmmo}</span>
            </div>
            {currentAmmo[currentWeapon.id] === 0 && (
              <div className="text-[8px] text-red-500 font-black uppercase tracking-tighter animate-bounce mt-1">Press R to Reload</div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => triggerEmote('GG!')}
            className="px-3 py-1 bg-black/60 border border-white/10 text-white/70 text-[10px] font-bold rounded-lg hover:border-white/30 transition-all uppercase"
          >
            1: GG
          </button>
          <button
            onClick={() => triggerEmote('Nice shot!')}
            className="px-3 py-1 bg-black/60 border border-white/10 text-white/70 text-[10px] font-bold rounded-lg hover:border-white/30 transition-all uppercase"
          >
            2: NICE
          </button>
          <button
            onClick={leaveGame}
            className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] font-black rounded-lg hover:bg-red-500 hover:text-black transition-all uppercase tracking-widest"
          >
            LEAVE
          </button>
        </div>
        <div className="text-white/40 text-[10px] mt-1 pointer-events-none uppercase tracking-[0.2em] font-black">ESC: MENU</div>

        {/* Event Log */}
        <div className="mt-4 flex flex-col items-end gap-1 pointer-events-none">
          {events.slice(-5).map(event => (
            <div key={event.id} className="text-xs font-bold text-blue-400 bg-black/50 px-2 py-1 rounded border border-blue-900/50 animate-pulse">
              {event.message}
            </div>
          ))}
        </div>
      </div>

      {/* Chat UI (Bottom Left) */}
      <div className="absolute bottom-32 left-4 w-80 pointer-events-auto flex flex-col gap-2">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 h-48 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2 custom-scrollbar">
            {chatMessages.map(msg => (
              <div key={msg.id} className="text-[10px] leading-tight">
                <span className={`font-black uppercase ${msg.type === 'proximity' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  [{msg.type === 'proximity' ? 'PROX' : 'GLOB'}] {msg.sender}:
                </span>
                <span className="text-white/80 ml-1">{msg.message}</span>
              </div>
            ))}
          </div>
          
          {isChatOpen ? (
            <form onSubmit={handleSendChat} className="mt-2 flex gap-2">
              <button 
                type="button"
                onClick={() => setChatType(t => t === 'global' ? 'proximity' : 'global')}
                className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                  chatType === 'global' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                }`}
              >
                {chatType}
              </button>
              <input 
                autoFocus
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onBlur={() => !chatInput && setIsChatOpen(false)}
                className="flex-1 bg-white/5 border border-white/20 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
                placeholder="Type message..."
              />
            </form>
          ) : (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="mt-2 text-[8px] text-white/30 font-bold uppercase tracking-widest animate-pulse hover:text-white transition-colors text-left"
            >
              Click or Press ENTER to chat
            </button>
          )}
        </div>
      </div>

      {/* Multiplayer Info */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <div className="text-amber-400 text-sm font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
          PLAYERS ONLINE: {playerCount} / 60
        </div>
      </div>

      {/* Crosshair */}
      {gameState === 'playing' && playerState === 'active' && !isInventoryOpen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-amber-400/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <div className="w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_rgba(245,158,11,1)]" />
            </div>
            {!document.pointerLockElement && (
              <div className="mt-4 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
                Click to Aim
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click to Aim Overlay */}
      {gameState === 'playing' && playerState === 'active' && !isInventoryOpen && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
          style={{ opacity: document.pointerLockElement ? 0 : 1 }}
        >
          <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white font-black uppercase tracking-widest text-sm animate-bounce">
            Click to Aim
          </div>
        </div>
      )}

      {/* Voice Indicator */}
      {!isMuted && (
        <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Voice On</span>
        </div>
      )}
      {playerState === 'disabled' && (
        <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex items-center justify-center">
          <div className="text-red-500 text-6xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse">
            SYSTEM DISABLED
          </div>
        </div>
      )}

      {/* Hotbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto max-w-[90vw] overflow-x-auto pb-2 custom-scrollbar">
        {isBuildMode ? (
          // Build Mode Hotbar
          (['stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'clay', 'bedrock', 'oak_log', 'oak_planks', 'leaves', 'furnace', 'crafting_table', 'chest', 'barrel', 'anvil', 'enchanting_table', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'emerald_ore', 'redstone_ore', 'lapis_ore', 'bricks', 'quartz', 'concrete', 'terracotta'] as const).slice(0, 9).map((block, idx) => {
            const isActive = selectedBlock === block;
            return (
              <button
                key={block}
                onClick={() => setSelectedBlock(block)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-emerald-500/40 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-110' 
                    : 'bg-black/60 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-[8px] text-white/40 font-bold mb-1">{idx + 1}</div>
                <div className={`text-[8px] font-black uppercase text-center leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {block.replace('_', ' ')}
                </div>
              </button>
            );
          })
        ) : (
          // Combat Mode Hotbar
          inventory.slice(0, 9).map((weaponId, idx) => {
            const weapon = WEAPONS[weaponId];
            const isActive = idx === currentWeaponIndex;
            return (
              <button
                key={weaponId}
                onClick={() => switchWeapon(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-amber-500/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' 
                    : 'bg-black/60 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-[8px] text-white/40 font-bold mb-1">{idx + 1}</div>
                <div className={`text-[10px] font-black uppercase text-center leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {weapon?.name.split(' ')[1] || weapon?.name || '???'}
                </div>
              </button>
            );
          })
        )}
        <button
          onClick={() => setInventoryOpen(true)}
          className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-white/20 bg-black/40 flex items-center justify-center hover:border-white/40 transition-all"
        >
          <div className="text-[10px] font-black text-white/40 uppercase">INV [E]</div>
        </button>
      </div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {isInventoryOpen && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[60] pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-amber-500/30 p-10 rounded-3xl w-full max-w-4xl shadow-[0_0_100px_rgba(245,158,11,0.1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-5xl font-black text-amber-400 italic tracking-tighter">ARSENAL</h2>
                <button 
                  onClick={() => setInventoryOpen(false)}
                  className="text-white/40 hover:text-white transition-colors uppercase font-bold tracking-widest text-xs"
                >
                  Close [ESC/E]
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {Object.values(WEAPONS).map((weapon) => {
                  const isInInventory = inventory.includes(weapon.id);
                  return (
                    <div 
                      key={weapon.id}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col ${
                        isInInventory 
                          ? 'bg-amber-500/10 border-amber-500/50' 
                          : 'bg-white/5 border-white/10 opacity-50 grayscale'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-black text-white uppercase">{weapon.name}</h3>
                        {isInInventory && <span className="text-[8px] bg-amber-400 text-black px-1 rounded font-bold">EQUIPPED</span>}
                      </div>

                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-white/40">Damage</span>
                          <span className="text-amber-400">{weapon.damage}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(weapon.damage / 100) * 100}%` }} />
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-white/40">Fire Rate</span>
                          <span className="text-amber-400">{1000 / weapon.fireRate}/s</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(100 / weapon.fireRate) * 100}%` }} />
                        </div>
                      </div>

                      <button
                        disabled={!isInInventory}
                        onClick={() => {
                          const idx = inventory.indexOf(weapon.id);
                          if (idx !== -1) {
                            switchWeapon(idx);
                            setInventoryOpen(false);
                          }
                        }}
                        className={`mt-auto py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                          isInInventory 
                            ? 'bg-amber-500 text-black hover:bg-amber-400' 
                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        {isInInventory ? 'Select Weapon' : 'Locked'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scoreboard Overlay */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-amber-500/30 p-8 rounded-2xl w-full max-w-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)]"
          >
            <div className="flex justify-between items-end mb-6 border-b border-amber-500/20 pb-4">
              <h2 className="text-4xl font-black text-amber-400 italic tracking-tighter">BATTLE STATS</h2>
              <div className="text-amber-400/50 text-xs font-bold uppercase tracking-widest">Hold TAB to view</div>
            </div>

            <div className="grid grid-cols-5 gap-4 text-xs font-bold text-amber-400/50 uppercase tracking-widest mb-4 px-4">
              <div className="col-span-2">Player</div>
              <div className="text-center">Kills</div>
              <div className="text-center">Deaths</div>
              <div className="text-right">Score</div>
            </div>

            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedMode === 'ffa' ? (
                leaderboard.map((p, i) => (
                  <div 
                    key={p.id} 
                    className={`grid grid-cols-5 gap-4 p-4 rounded-xl border transition-all ${
                      p.isMe 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="opacity-30 w-4">{i + 1}</span>
                      <span className="font-bold truncate">{p.id}</span>
                      {p.isMe && <span className="text-[8px] bg-amber-400 text-black px-1 rounded">YOU</span>}
                    </div>
                    <div className="text-center font-mono">{p.kills}</div>
                    <div className="text-center font-mono">{p.deaths}</div>
                    <div className="text-right font-mono font-bold">{p.score}</div>
                  </div>
                ))
              ) : (
                <>
                  {/* Amber Team */}
                  <div className="text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 mt-4">Amber Team</div>
                  {leaderboard.filter(p => {
                    if (p.isMe) return team === 'amber';
                    const other = Object.values(otherPlayers).find(op => op.name === p.id);
                    return other?.team === 'amber';
                  }).map((p, i) => (
                    <div 
                      key={p.id} 
                      className={`grid grid-cols-5 gap-4 p-4 rounded-xl border transition-all ${
                        p.isMe 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                          : 'bg-amber-500/5 border-amber-500/20 text-amber-400/70'
                      }`}
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <span className="opacity-30 w-4">{i + 1}</span>
                        <span className="font-bold truncate">{p.id}</span>
                        {p.isMe && <span className="text-[8px] bg-amber-400 text-black px-1 rounded">YOU</span>}
                      </div>
                      <div className="text-center font-mono">{p.kills}</div>
                      <div className="text-center font-mono">{p.deaths}</div>
                      <div className="text-right font-mono font-bold">{p.score}</div>
                    </div>
                  ))}

                  {/* Blue Team */}
                  <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 mt-6">Blue Team</div>
                  {leaderboard.filter(p => {
                    if (p.isMe) return team === 'blue';
                    const other = Object.values(otherPlayers).find(op => op.name === p.id);
                    return other?.team === 'blue';
                  }).map((p, i) => (
                    <div 
                      key={p.id} 
                      className={`grid grid-cols-5 gap-4 p-4 rounded-xl border transition-all ${
                        p.isMe 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-blue-500/5 border-blue-500/20 text-blue-400/70'
                      }`}
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <span className="opacity-30 w-4">{i + 1}</span>
                        <span className="font-bold truncate">{p.id}</span>
                        {p.isMe && <span className="text-[8px] bg-blue-400 text-black px-1 rounded">YOU</span>}
                      </div>
                      <div className="text-center font-mono">{p.kills}</div>
                      <div className="text-center font-mono">{p.deaths}</div>
                      <div className="text-right font-mono font-bold">{p.score}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-amber-500/20 flex justify-between items-center text-[10px] text-amber-400/40 font-bold uppercase tracking-widest">
              <div>Arena: {useGameStore.getState().selectedMap}</div>
              <div>Players: {playerCount} / 60</div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Relaxed check: only block if it's definitely a small mobile device UA
    return uaMatch && window.innerWidth < 500;
  });

  useEffect(() => {
    const check = () => {
      const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(uaMatch && window.innerWidth < 500);
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function App() {
  const [lobbyTab, setLobbyTab] = useState<'play' | 'settings' | 'replays'>('play');
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.score);
  const kills = useGameStore(state => state.kills);
  const deaths = useGameStore(state => state.deaths);
  const enterLobby = useGameStore(state => state.enterLobby);
  
  const gamertag = useGameStore(state => state.gamertag);
  const setGamertag = useGameStore(state => state.setGamertag);
  const privateServerName = useGameStore(state => state.privateServerName);
  const setPrivateServerName = useGameStore(state => state.setPrivateServerName);
  const roomId = useGameStore(state => state.roomId);
  const setRoomId = (id: string) => useGameStore.setState({ roomId: id });
  
  const startGame = () => {
    useGameStore.getState().startGame(roomId || undefined);
    // Request pointer lock directly in the click handler to satisfy browser gesture requirements
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.requestPointerLock();
    }, 100);
  };
  const selectedSkin = useGameStore(state => state.selectedSkin);
  const setSkin = useGameStore(state => state.setSkin);
  const selectedColor = useGameStore(state => state.selectedColor);
  const setColor = useGameStore(state => state.setColor);
  const selectedPattern = useGameStore(state => state.selectedPattern);
  const setPattern = useGameStore(state => state.setPattern);
  const selectedAccessories = useGameStore(state => state.selectedAccessories);
  const toggleAccessory = useGameStore(state => state.toggleAccessory);
  const selectedGunSkin = useGameStore(state => state.selectedGunSkin);
  const setGunSkin = useGameStore(state => state.setGunSkin);
  const selectedMap = useGameStore(state => state.selectedMap);
  const setMap = useGameStore(state => state.setMap);
  const selectedMode = useGameStore(state => state.selectedMode);
  const setMode = useGameStore(state => state.setMode);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const setBuildMode = useGameStore(state => state.setBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const setSelectedBlock = useGameStore(state => state.setSelectedBlock);
  const isMuted = useGameStore(state => state.isMuted);
  const toggleMute = useGameStore(state => state.toggleMute);
  const selectedRegion = useGameStore(state => state.selectedRegion);
  const setRegion = useGameStore(state => state.setRegion);
  
  const user = useGameStore(state => state.user);
  const persistentStats = useGameStore(state => state.persistentStats);
  const setUser = useGameStore(state => state.setUser);
  const fetchStats = useGameStore(state => state.fetchStats);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchStats();
    });
    return () => unsubscribe();
  }, [setUser, fetchStats]);

  const isMobile = useIsMobile();
  const setIsMobile = useGameStore(state => state.setIsMobile);

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden font-mono select-none">
      <div 
        className="absolute inset-0"
        onClick={() => {
          if (!isMobile && gameState === 'playing' && !useGameStore.getState().isInventoryOpen) {
            document.querySelector('canvas')?.requestPointerLock();
          }
        }}
      >
        <Game />
      </div>

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && <MobileControls />}

      {/* Voice Chat Manager */}
      <VoiceChat />

      {/* UI Overlay */}
      {gameState === 'playing' && <HUD />}

      {/* Splash Screen */}
      {gameState === 'splash' && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-16">
              <div className="bg-amber-400 px-12 py-6 shadow-[0_0_80px_rgba(245,158,11,0.6)] skew-x-[-12deg]">
                <h1 className="text-8xl font-black text-black tracking-tighter italic">
                  NEON ARENA
                </h1>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-500 px-4 py-1 font-black text-white text-xs tracking-widest uppercase">
                V1.0.0 ALPHA
              </div>
            </div>

            <button
              onClick={enterLobby}
              className="group relative px-12 py-4 bg-transparent border-2 border-amber-400 text-amber-400 text-2xl font-black rounded hover:bg-amber-400 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <span className="relative z-10">INITIALIZE SYSTEM</span>
            </button>

            <div className="mt-12 flex flex-col items-center gap-2">
              <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-bold">
                Input detected: Keyboard & Mouse
              </p>
              <div className="flex gap-6 text-amber-400/30 text-[9px] font-bold tracking-[0.2em] uppercase">
                <span>Multiplayer</span>
                <span>•</span>
                <span>Voice Chat</span>
                <span>•</span>
                <span>Custom Skins</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Menus */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 pointer-events-auto overflow-y-auto py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-4xl w-full px-6"
          >
            <div className="flex justify-between items-start w-full mb-8">
              <div>
                <h1 className="text-7xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)] tracking-tighter italic">
                  NEON LOBBY
                </h1>
                <div className="h-1 w-32 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              </div>
              
              <div className="flex flex-col items-end gap-4">
                {user ? (
                  <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-amber-400/50" />
                    <div className="text-right">
                      <div className="text-xs font-black text-white uppercase">{user.displayName}</div>
                      <button onClick={logout} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1">
                        <LogOut size={10} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-sm hover:bg-amber-400 transition-all active:scale-95"
                  >
                    <LogIn size={18} /> SIGN IN WITH GOOGLE
                  </button>
                )}
              </div>
            </div>

            {/* Lobby Tabs */}
            <div className="flex gap-4 mb-8 w-full">
              {['play', 'settings', 'replays'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLobbyTab(tab as any)}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all border-2 ${
                    lobbyTab === tab 
                      ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {lobbyTab === 'play' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
              {/* Left Column: Stats & Profile */}
              <div className="flex flex-col gap-8">
                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                    <Trophy size={20} /> PLAYER STATISTICS
                  </h2>
                  
                  {persistentStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Kills</div>
                        <div className="text-2xl font-black text-white">{persistentStats.kills}</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Deaths</div>
                        <div className="text-2xl font-black text-white">{persistentStats.deaths}</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Win Rate</div>
                        <div className="text-2xl font-black text-emerald-400">
                          {persistentStats.gamesPlayed > 0 
                            ? Math.round((persistentStats.wins / persistentStats.gamesPlayed) * 100) 
                            : 0}%
                        </div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Accuracy</div>
                        <div className="text-2xl font-black text-blue-400">
                          {persistentStats.totalShots > 0 
                            ? Math.round((persistentStats.totalHits / persistentStats.totalShots) * 100) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/20 text-xs italic py-8 text-center">
                      Sign in to track your progress
                    </div>
                  )}
                </section>
                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    IDENTITY
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Gamertag</label>
                      <input 
                        type="text" 
                        value={gamertag}
                        onChange={(e) => setGamertag(e.target.value)}
                        className="w-full bg-black/50 border border-amber-400/30 rounded-xl px-4 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-400 transition-all"
                        placeholder="Enter Gamertag..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Private Server Name</label>
                      <input 
                        type="text" 
                        value={privateServerName}
                        onChange={(e) => setPrivateServerName(e.target.value)}
                        className="w-full bg-black/50 border border-emerald-400/30 rounded-xl px-4 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-400 transition-all"
                        placeholder="Enter Server Name..."
                      />
                      <p className="text-[8px] text-emerald-400/40 mt-1 uppercase">Leave empty for public play</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Region</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['US-East', 'US-West', 'EU-West', 'Asia-South'].map(region => (
                          <button
                            key={region}
                            onClick={() => setRegion(region)}
                            className={`px-3 py-2 rounded-xl border-2 text-[10px] font-black transition-all ${
                              selectedRegion === region 
                                ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                                : 'bg-black/40 text-amber-400/40 border-amber-900/20 hover:border-amber-400/30'
                            }`}
                          >
                            {region}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Private Room ID (Optional)</label>
                      <input 
                        type="text" 
                        value={roomId || ''}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full bg-black/50 border border-blue-400/30 rounded-xl px-4 py-2 text-blue-400 font-bold focus:outline-none focus:border-blue-400 transition-all"
                        placeholder="Leave empty for global..."
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    BATTLE SKIN
                  </h2>
                  <div className="flex flex-col gap-6">
                    {/* Skin Type */}
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Base Material</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['neon', 'gold', 'stealth', 'glitch', 'ruby', 'emerald', 'diamond', 'void', 'steve', 'alex'] as const).map(skin => (
                          <button
                            key={skin}
                            onClick={() => setSkin(skin)}
                            className={`px-2 py-2 text-[8px] font-black border-2 rounded-lg transition-all ${
                              selectedSkin === skin 
                                ? 'bg-amber-400 text-black border-amber-400' 
                                : 'bg-transparent text-amber-400/60 border-amber-900/30 hover:border-amber-400/50'
                            }`}
                          >
                            {skin.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Primary Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#ffffff', '#111111'].map(color => (
                          <button
                            key={color}
                            onClick={() => setColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              selectedColor === color ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Patterns */}
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Pattern</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', 'stripes', 'dots', 'grid', 'circuit'] as const).map(pattern => (
                          <button
                            key={pattern}
                            onClick={() => setPattern(pattern)}
                            className={`px-2 py-2 text-[8px] font-black border-2 rounded-lg transition-all ${
                              selectedPattern === pattern 
                                ? 'bg-amber-400 text-black border-amber-400' 
                                : 'bg-transparent text-amber-400/60 border-amber-900/30 hover:border-amber-400/50'
                            }`}
                          >
                            {pattern.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accessories */}
                    <div>
                      <label className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 block tracking-widest">Accessories</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['hat', 'glasses', 'backpack', 'horns', 'halo'] as const).map(acc => (
                          <button
                            key={acc}
                            onClick={() => toggleAccessory(acc)}
                            className={`px-2 py-2 text-[8px] font-black border-2 rounded-lg transition-all ${
                              selectedAccessories.includes(acc)
                                ? 'bg-blue-400 text-black border-blue-400' 
                                : 'bg-transparent text-blue-400/60 border-blue-900/30 hover:border-blue-400/50'
                            }`}
                          >
                            {acc.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    GUN SKIN
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['standard', 'chrome', 'carbon', 'plasma'] as const).map(skin => (
                      <button
                        key={skin}
                        onClick={() => setGunSkin(skin)}
                        className={`group relative overflow-hidden px-2 py-3 text-[10px] font-black border-2 rounded-xl transition-all duration-300 ${
                          selectedGunSkin === skin 
                            ? 'bg-amber-400 text-black border-amber-400 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                            : 'bg-transparent text-amber-400/60 border-amber-900/30 hover:border-amber-400/50'
                        }`}
                      >
                        <div className={`w-full h-1 mb-2 rounded-full ${
                          skin === 'standard' ? 'bg-gray-400' :
                          skin === 'chrome' ? 'bg-white shadow-[0_0_10px_white]' :
                          skin === 'carbon' ? 'bg-zinc-800' :
                          'bg-amber-500 shadow-[0_0_10px_orange]'
                        }`} />
                        {skin.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Config & Friends */}
              <div className="flex flex-col gap-8">
                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    BATTLE CONFIG
                  </h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="text-[10px] text-blue-400/50 uppercase font-bold mb-2 tracking-widest">Arena</div>
                      <div className="grid grid-cols-1 gap-2">
                        {(['maze', 'arena', 'pillars', 'flat'] as const).map(map => (
                          <button
                            key={map}
                            onClick={() => setMap(map)}
                            className={`px-4 py-2 text-xs font-bold border-2 rounded-xl transition-all duration-300 text-left flex justify-between items-center ${
                              selectedMap === map 
                                ? 'bg-blue-400 text-black border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                                : 'bg-transparent text-blue-400/60 border-blue-900/30 hover:border-blue-400/50'
                            }`}
                          >
                            <span>{map.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-blue-400/50 uppercase font-bold mb-2 tracking-widest">Game Mode</div>
                      <div className="grid grid-cols-1 gap-2">
                        {(['ffa', 'tdm', 'ctf', 'creative'] as const).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setMode(mode)}
                            className={`px-4 py-2 text-xs font-bold border-2 rounded-xl transition-all duration-300 text-left flex justify-between items-center ${
                              selectedMode === mode 
                                ? 'bg-blue-400 text-black border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                                : 'bg-transparent text-blue-400/60 border-blue-900/30 hover:border-blue-400/50'
                            }`}
                          >
                            <span>
                              {mode === 'ffa' && 'FREE FOR ALL'}
                              {mode === 'tdm' && 'TEAM DEATHMATCH'}
                              {mode === 'ctf' && 'CAPTURE THE FLAG'}
                              {mode === 'creative' && 'CREATIVE BUILD'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    BUILD MODE
                  </h2>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setBuildMode(!isBuildMode)}
                      className={`w-full py-3 rounded-xl border-2 font-black transition-all ${
                        isBuildMode 
                          ? 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                          : 'bg-black/40 text-emerald-400/40 border-emerald-900/20 hover:border-emerald-400/30'
                      }`}
                    >
                      {isBuildMode ? 'BUILD MODE: ON' : 'BUILD MODE: OFF'}
                    </button>
                    
                    {isBuildMode && (
                      <div>
                        <label className="text-[10px] text-emerald-400/50 uppercase font-bold mb-2 block tracking-widest">Selected Block</label>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {(['stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'clay', 'bedrock', 'oak_log', 'oak_planks', 'leaves', 'furnace', 'crafting_table', 'chest', 'barrel', 'anvil', 'enchanting_table', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'emerald_ore', 'redstone_ore', 'lapis_ore', 'bricks', 'quartz', 'concrete', 'terracotta'] as const).map(block => (
                            <button
                              key={block}
                              onClick={() => setSelectedBlock(block)}
                              className={`px-2 py-2 text-[8px] font-black border-2 rounded-lg transition-all ${
                                selectedBlock === block 
                                  ? 'bg-emerald-400 text-black border-emerald-400' 
                                  : 'bg-transparent text-emerald-400/60 border-emerald-900/30 hover:border-emerald-400/50'
                              }`}
                            >
                              {block.replace('_', ' ').toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    FRIENDS & SOCIAL
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 h-32 overflow-y-auto custom-scrollbar">
                      {useGameStore.getState().friends.length === 0 ? (
                        <div className="text-white/20 text-[10px] font-bold uppercase text-center mt-8">No friends online</div>
                      ) : (
                        useGameStore.getState().friends.map(f => (
                          <div key={f} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                            <span className="text-emerald-400 text-xs font-bold">{f}</span>
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded">ONLINE</span>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const name = prompt('Enter friend gamertag:');
                        if (name) useGameStore.getState().addFriend(name);
                      }}
                      className="w-full py-2 bg-emerald-500 text-black font-black text-[10px] rounded-xl hover:bg-white transition-all uppercase tracking-widest"
                    >
                      Add Friend
                    </button>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    SPECTATOR MODE
                  </h2>
                  <button 
                    onClick={() => useGameStore.getState().setSpectating(!useGameStore.getState().isSpectating)}
                    className={`w-full py-3 border-2 font-black text-xs rounded-xl transition-all uppercase tracking-widest ${
                      useGameStore.getState().isSpectating 
                        ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]' 
                        : 'bg-transparent text-amber-400 border-amber-400/30 hover:border-amber-400'
                    }`}
                  >
                    {useGameStore.getState().isSpectating ? 'SPECTATING ON' : 'SPECTATING OFF'}
                  </button>
                </section>
              </div>
            </div>
          )}

          {lobbyTab === 'settings' && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <h2 className="text-3xl font-black text-amber-400 mb-8 italic tracking-tighter">GAMEPLAY SETTINGS</h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Jump Height</label>
                      <input 
                        type="range" min="0.5" max="5" step="0.1" 
                        value={useGameStore.getState().jumpHeight}
                        onChange={(e) => useGameStore.getState().setJumpHeight(parseFloat(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                      <div className="text-right text-amber-400 font-bold">{useGameStore.getState().jumpHeight}m</div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Gravity</label>
                      <input 
                        type="range" min="1" max="30" step="0.1" 
                        value={useGameStore.getState().gravity}
                        onChange={(e) => useGameStore.getState().setGravity(parseFloat(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                      <div className="text-right text-amber-400 font-bold">{useGameStore.getState().gravity}m/s²</div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Mouse Sensitivity</label>
                      <input 
                        type="range" min="0.1" max="5" step="0.1" 
                        value={useGameStore.getState().mouseSensitivity}
                        onChange={(e) => useGameStore.getState().setMouseSensitivity(parseFloat(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                      <div className="text-right text-amber-400 font-bold">{useGameStore.getState().mouseSensitivity}x</div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Field of View (FOV)</label>
                      <input 
                        type="range" min="60" max="120" step="1" 
                        value={useGameStore.getState().fov}
                        onChange={(e) => useGameStore.getState().setFov(parseInt(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                      <div className="text-right text-amber-400 font-bold">{useGameStore.getState().fov}°</div>
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <h2 className="text-3xl font-black text-blue-400 mb-8 italic tracking-tighter">BOT CONFIGURATION</h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Count</label>
                      <input 
                        type="range" min="0" max="20" step="1" 
                        value={useGameStore.getState().botCount}
                        onChange={(e) => useGameStore.getState().setBotCount(parseInt(e.target.value))}
                        className="w-full accent-blue-400"
                      />
                      <div className="text-right text-blue-400 font-bold">{useGameStore.getState().botCount}</div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Difficulty</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['easy', 'medium', 'hard', 'expert'].map(d => (
                          <button
                            key={d}
                            onClick={() => useGameStore.getState().setBotDifficulty(d as any)}
                            className={`py-2 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${
                              useGameStore.getState().botDifficulty === d 
                                ? 'bg-blue-400 text-black border-blue-400' 
                                : 'bg-white/5 text-blue-400/40 border-white/10'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const { jumpHeight, gravity, botDifficulty, botCount } = useGameStore.getState();
                        useGameStore.getState().updateSettings({ jumpHeight, gravity, botDifficulty, botCount });
                      }}
                      className="mt-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    >
                      Apply to Private Server
                    </button>
                  </div>
                </section>
              </div>
            )}

            {lobbyTab === 'replays' && (
              <div className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                <h2 className="text-3xl font-black text-amber-400 mb-8 italic tracking-tighter">MATCH REPLAYS</h2>
                <div className="flex flex-col gap-4">
                  {useGameStore.getState().replays.length === 0 ? (
                    <div className="text-center py-20 text-white/20 italic uppercase tracking-widest font-bold">No replays recorded yet</div>
                  ) : (
                    useGameStore.getState().replays.map(replay => (
                      <div key={replay.id} className="bg-black/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-white font-black uppercase tracking-widest">Match Replay #{replay.id.toString().slice(-4)}</div>
                          <div className="text-[10px] text-white/40 font-bold">{replay.timestamp}</div>
                        </div>
                        <button 
                          onClick={() => useGameStore.getState().playReplay(replay.data)}
                          className="px-6 py-2 bg-amber-400 text-black font-black uppercase text-xs rounded-xl hover:bg-amber-300 transition-all"
                        >
                          Watch Replay
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-12 flex flex-col items-center gap-6 w-full">
              <button
                onClick={() => startGame()}
                className="group relative px-20 py-6 bg-amber-400 text-black text-4xl font-black rounded-2xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.6)] italic tracking-tighter"
              >
                <span className="relative z-10">ENTER ARENA</span>
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
              </button>
              
              <div className="flex gap-8 text-amber-400/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                <span>WASD: Move</span>
                <span>•</span>
                <span>SPACE: Jump</span>
                <span>•</span>
                <span>SHIFT: Sprint</span>
                <span>•</span>
                <span>CTRL: Slide</span>
                <span>•</span>
                <span>MOUSE: Shoot</span>
                <span>•</span>
                <span>R: Reload</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-2xl w-full px-6"
          >
            <h1 className="text-7xl font-black text-red-500 mb-2 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)] tracking-tighter italic">
              BATTLE ENDED
            </h1>
            <div className="h-1 w-24 bg-red-500 mb-12 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

            <div className="grid grid-cols-3 gap-8 w-full mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Total Score</div>
                <div className="text-4xl font-black text-amber-400">{score}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Kills</div>
                <div className="text-4xl font-black text-emerald-400">{kills}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Deaths</div>
                <div className="text-4xl font-black text-red-400">{deaths}</div>
              </div>
            </div>

            <button
              onClick={() => startGame()}
              className="w-full group relative overflow-hidden px-8 py-6 bg-amber-500 text-black text-2xl font-black rounded-2xl hover:bg-amber-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.6)]"
            >
              RE-INITIALIZE SYSTEM
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
