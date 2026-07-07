/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from './components/Game';
import { DynamicCrosshair } from './components/DynamicCrosshair';
import { TeamStatusHUD } from './components/TeamStatusHUD';
import { RealLifeSync } from './components/RealLifeSync';
import { VoiceChat } from './components/VoiceChat';
import { MobileControls } from './components/MobileControls';
import { DonateModal } from './components/DonateModal';
import { InfectionMode } from './components/InfectionMode';
import { KillstreakHUD } from './components/KillstreakHUD';
import { ArenaEvents } from './components/ArenaEvents';
import { TimeWarpOverlay } from './components/TimeWarpOverlay';
import { AccountManagement } from './components/AccountManagement';
import { ReplayManager } from './components/ReplaySystem';
import { VehicleHUD } from './components/VehicleHUD';
import { AIBuilderInput } from './components/AIBuilderInput';
import { VisualFeedback } from './components/VisualFeedback';
import { FaceCam } from './components/FaceCam';
import { FeaturesController } from './components/FeaturesController';
import { Casino } from './components/Casino';
import { BiggestUpdateModal } from './components/BiggestUpdateModal';
import { ExperimentalFeatures } from './components/ExperimentalFeatures';
import { TacticalMap } from './components/TacticalMap';
import { ServerBrowser } from './components/ServerBrowser';
import { ThreeDScanner } from './components/ThreeDScanner';
import { DossierModal } from './components/DossierModal';
import { WeatherOverlay } from './components/WeatherOverlay';
import { MVPAnnouncementOverlay } from './components/MVPAnnouncementOverlay';
import { MapVotingPanel } from './components/MapVotingPanel';
import { useGameStore, WEAPONS, SPELLS, SpellType, DIMENSIONS, DimensionType, WeaponType } from './store';
import type { WeaponCategory } from './store';
import { LORE_ENTRIES } from './lore';
import { soundService } from './services/soundService';
import { InfinityAcademyVR } from './components/InfinityAcademyVR';
import { getAbilitiesForWeapon } from './data/abilities';
import { Mic, MicOff, Camera, CameraOff, ArrowUp, LogIn, LogOut, Trophy, Target, Zap, Activity, Cpu, Check, X, MessageSquare, Search, RotateCcw, Book, Wand2, Shield, Sparkles, Volume2, Sword, FlaskConical, Coins, Heart, Settings, UserPlus, UserCheck, UserX, Terminal, ListTodo, Calendar, AlertCircle, Car, Play, Pause, FastForward, Plus, User as UserIcon, Map as MapIcon, Globe, Layers } from 'lucide-react';
import { auth, signInWithGoogle, logout, searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getFriendRequests, createClan, getClan, joinClan, leaveClan, getTopClans, getUserProfile, ClanData } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function TeleportHUD() {
  const progress = useGameStore(state => state.teleportProgress);
  const target = useGameStore(state => state.teleportTarget);
  if (!target || progress <= 0) return null;

  const dimColor = DIMENSIONS[target]?.visuals?.color || '#00ffff';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none z-50">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            fill="transparent"
            stroke={dimColor}
            strokeWidth="6"
            strokeDasharray={377}
            initial={{ strokeDashoffset: 377 }}
            animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_10px_var(--dim-color)]"
            style={{ '--dim-color': dimColor } as any}
          />
        </svg>
        
        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-black text-white italic">{Math.round(progress)}%</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Synchronizing</div>
        <div className="text-xl font-black text-white uppercase tracking-wider" style={{ color: dimColor }}>
          {DIMENSIONS[target]?.name || target.toUpperCase()}
        </div>
      </div>
      
      {/* Glitch Effect Background */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 0.2, repeat: Infinity }}
        className="absolute inset-0 bg-white/5 blur-3xl rounded-full -z-10"
        style={{ backgroundColor: dimColor }}
      />
    </div>
  );
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const TaskModal = ({ onClose }: { onClose: () => void }) => {
  const tasks = useGameStore(state => state.tasks);
  const addTask = useGameStore(state => state.addTask);
  const toggleTask = useGameStore(state => state.toggleTask);
  const deleteTask = useGameStore(state => state.deleteTask);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addTask({ title: newTitle, description: '', priority: newPriority });
      setNewTitle('');
      soundService.playSFX('ui_click');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[70] pointer-events-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl h-[70vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mission Tasks</h2>
            <div className="h-1 w-16 bg-blue-500 mt-2" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} className="text-white/50" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input 
            type="text" 
            placeholder="Add new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
          />
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all">
            Add
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {tasks.map(task => (
            <div key={task.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${task.completed ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10'}`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { toggleTask(task.id); soundService.playSFX('ui_click'); }}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}
                >
                  {task.completed && <Check size={14} className="text-black" />}
                </button>
                <div>
                  <div className={`font-bold text-white ${task.completed ? 'line-through' : ''}`}>{task.title}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {task.priority} Priority
                  </div>
                </div>
              </div>
              <button onClick={() => { deleteTask(task.id); soundService.playSFX('ui_click'); }} className="text-white/20 hover:text-red-400 transition-all">
                <X size={18} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <ListTodo size={48} className="mb-4 opacity-20" />
              <div className="font-black uppercase tracking-widest text-sm">No active tasks</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const FriendModal = ({ onClose }: { onClose: () => void }) => {
  const user = useGameStore(state => state.user);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!user) return;
    const f = await getFriends(user.uid);
    const r = await getFriendRequests(user.uid);
    setFriends(f);
    setRequests(r);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    const res = await searchUsers(search);
    setResults(res.filter(r => r.uid !== user?.uid));
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[70] pointer-events-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl h-[70vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Social Hub</h2>
            <div className="h-1 w-16 bg-amber-400 mt-2" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} className="text-white/50" />
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          <input 
            type="text" 
            placeholder="Search players by gamertag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-amber-400 transition-all"
          />
          <button onClick={handleSearch} className="bg-amber-400 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all">
            {loading ? '...' : 'Search'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && search.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX size={48} className="text-white/10 mb-4" />
              <div className="text-white/40 font-black uppercase tracking-widest text-sm">No players found</div>
              <div className="text-white/20 text-[10px] uppercase mt-1">Try a different gamertag</div>
            </div>
          )}

          {requests.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Pending Requests</h3>
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.uid} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={req.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.uid}`} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                      <div className="font-bold text-white">{req.gamertag}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => { await acceptFriendRequest(user!.uid, req.uid); refreshData(); soundService.playSFX('ui_click'); }}
                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-black transition-all"
                      >
                        <UserCheck size={18} />
                      </button>
                      <button 
                        onClick={async () => { await rejectFriendRequest(user!.uid, req.uid); refreshData(); soundService.playSFX('ui_click'); }}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-black transition-all"
                      >
                        <UserX size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Search Results</h3>
              <div className="space-y-2">
                {results.map(res => (
                  <div key={res.uid} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={res.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.uid}`} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                      <div className="font-bold text-white">{res.gamertag}</div>
                    </div>
                    <button 
                      onClick={async () => { await sendFriendRequest(user!.uid, res.uid); soundService.playSFX('ui_click'); alert('Request Sent!'); }}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-black transition-all"
                    >
                      <UserPlus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Friends ({friends.length})</h3>
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend.uid} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.uid}`} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-bold text-white">{friend.gamertag}</div>
                      <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Online</div>
                    </div>
                  </div>
                  <button className="p-2 bg-white/5 text-white/30 rounded-lg hover:bg-white/10 transition-all">
                    <MessageSquare size={18} />
                  </button>
                </div>
              ))}
              {friends.length === 0 && (
                <div className="text-center py-8 text-white/20 font-black uppercase tracking-widest text-xs">
                  No friends yet. Start searching!
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ReplayControls = () => {
  const { currentReplay, isRecording, setRecording, clearReplay } = useGameStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [replayTime, setReplayTime] = useState(0);

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/80 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
      <button 
        onClick={() => {
          if (!isRecording) clearReplay();
          setRecording(!isRecording);
          soundService.playSFX('ui_click');
        }}
        className="flex items-center gap-2 pr-4 border-r border-white/10 group"
      >
        <div className={`w-3 h-3 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-125' : 'bg-red-950 group-hover:bg-red-500'}`} />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{isRecording ? 'STOP' : 'REC'}</span>
      </button>
      
      {currentReplay.length > 0 && !isRecording && (
        <>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-amber-400" />}
          </button>

          <div className="flex flex-col gap-1 w-48">
            <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-tighter">
              <span>00:00</span>
              <span>{(currentReplay[currentReplay.length-1].timestamp - currentReplay[0].timestamp) / 1000}s</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${(replayTime / (currentReplay.length || 1)) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{playSpeed}X</span>
            <button onClick={() => setPlaySpeed(playSpeed === 1 ? 2 : 1)} className="p-1 hover:bg-white/10 rounded-lg text-white">
              <FastForward size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ClanModal = ({ onClose }: { onClose: () => void }) => {
  const user = useGameStore(state => state.user);
  const [clans, setClans] = useState<ClanData[]>([]);
  const [myClan, setMyClan] = useState<ClanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'browse' | 'my-clan' | 'create'>('browse');

  // Create Clan form
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#ff0055');

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const top = await getTopClans(20);
    setClans(top);
    const profile = await getUserProfile(user.uid);
    if (profile?.clanId) {
      const c = await getClan(profile.clanId);
      setMyClan(c);
      setTab('my-clan');
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user]);

  const handleCreate = async () => {
    if (!user || !name || !tag) return;
    await createClan(user.uid, name, tag, color);
    alert('Clan Created!');
    refresh();
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[70] pointer-events-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-4xl h-[80vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">CLAN SYSTEM</h2>
            <div className="h-1 w-24 bg-blue-400 mt-2" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} className="text-white/50" />
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setTab('browse')}
            className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${tab === 'browse' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-white/40'}`}
          >
            Browse Clans
          </button>
          {myClan ? (
            <button 
              onClick={() => setTab('my-clan')}
              className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${tab === 'my-clan' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/40'}`}
            >
              My Clan [{myClan.tag}]
            </button>
          ) : (
            <button 
              onClick={() => setTab('create')}
              className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${tab === 'create' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-white/40'}`}
            >
              Start Clan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {tab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clans.map(clan => (
                <div key={clan.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 font-black tracking-tighter">[{clan.tag}]</span>
                      <h4 className="text-xl font-black text-white">{clan.name}</h4>
                    </div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {clan.memberIds.length} Members // XP: {clan.clanXP}
                    </div>
                  </div>
                  {!myClan && (
                    <button 
                      onClick={async () => { await joinClan(user!.uid, clan.id); refresh(); }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                    >
                      Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'create' && (
            <div className="max-w-md mx-auto space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-black text-white uppercase italic">Establish New Clan</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 font-black uppercase mb-1 block">Clan Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="e.g. Neon Killers" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-black uppercase mb-1 block">Clan Tag (2-4 Chars)</label>
                  <input value={tag} onChange={e => setTag(e.target.value)} maxLength={4} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white uppercase" placeholder="NEON" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-black uppercase mb-1 block">Banner Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-12 bg-transparent border-none cursor-pointer" />
                </div>
                <button 
                  onClick={handleCreate}
                  className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                >
                  Confirm Registration
                </button>
              </div>
            </div>
          )}

          {tab === 'my-clan' && myClan && (
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl" style={{ backgroundColor: myClan.color }}>
                      {myClan.tag[0]}
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">[{myClan.tag}] {myClan.name}</h3>
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        ESTABLISHED {new Date(myClan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: myClan.color }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                  <div className="text-[10px] text-white/30 uppercase font-black mb-1">Members</div>
                  <div className="text-3xl font-black text-white">{myClan.memberIds.length}</div>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                  <div className="text-[10px] text-white/30 uppercase font-black mb-1">Clan XP</div>
                  <div className="text-3xl font-black text-blue-400">{myClan.clanXP}</div>
                </div>
                <button 
                  onClick={async () => { if (confirm('Leave Clan?')) { await leaveClan(user!.uid, myClan.id); refresh(); } }}
                  className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-red-500 font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                >
                  Leave Clan
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
const InventoryModal = ({ onClose }: { onClose: () => void }) => {
  const hotbarInModal = useGameStore(state => state.hotbar);
  const availableWeapons = useGameStore(state => state.availableWeapons);
  const currentWeaponIndex = useGameStore(state => state.currentWeaponIndex);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const equipToHotbar = useGameStore(state => state.equipToHotbar);
  const [filter, setFilter] = useState<WeaponCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [assigningSlot, setAssigningSlot] = useState<number | null>(null);

  // 10-Slot Equipment Deck State
  const [deckActive, setDeckActive] = useState(false);
  const [deckSlots, setDeckSlots] = useState<(WeaponType | null)[]>(Array(10).fill(null));
  const [activeDeckSlot, setActiveDeckSlot] = useState<number | null>(null);

  const filteredWeapons = availableWeapons.map(id => WEAPONS[id]).filter(w => {
    const matchesFilter = filter === 'all' || w.category === filter;
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const rarityColors = {
    common: 'border-zinc-500 text-zinc-400 bg-zinc-500/10',
    rare: 'border-blue-500 text-blue-400 bg-blue-500/10',
    epic: 'border-purple-500 text-purple-400 bg-purple-500/10',
    legendary: 'border-amber-500 text-amber-400 bg-amber-500/10',
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[60] pointer-events-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-2">ARSENAL</h2>
            <div className="flex gap-4 items-center">
              <div className="h-1 w-24 bg-amber-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tactical Inventory System // Press item to open 10-Slot Deck</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white hover:text-black transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Hotbar Section */}
        <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Tactical Hotbar Slots</h3>
          <div className="flex gap-2 justify-between">
            {hotbarInModal.map((weaponId, i) => (
              <button
                key={i}
                onClick={() => setAssigningSlot(i)}
                className={`flex-1 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  assigningSlot === i 
                    ? 'border-amber-400 bg-amber-400/20 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
                    : i === currentWeaponIndex
                    ? 'border-white bg-white/10'
                    : 'border-white/10 bg-black/20 hover:border-white/30'
                }`}
              >
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Slot {i + 1}</span>
                <span className="text-[10px] font-black text-white uppercase truncate px-2">{WEAPONS[weaponId]?.name || 'Empty'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'primary', 'secondary', 'melee', 'gadget'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  filter === cat 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWeapons.map((weapon) => {
              const isEquippedInHotbar = hotbarInModal.includes(weapon.id);
              
              return (
                <div 
                  key={weapon.id}
                  className={`group relative p-6 rounded-3xl border-2 transition-all flex flex-col ${
                    rarityColors[weapon.rarity]
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{weapon.category}</div>
                      <h3 className="text-xl font-black uppercase leading-none">{weapon.name}</h3>
                    </div>
                    {isEquippedInHotbar && (
                      <div className="bg-white text-black text-[8px] font-black px-2 py-1 rounded-lg">
                        HOTBAR
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black uppercase opacity-40">Damage</span>
                      <span className="text-xs font-black">{Math.abs(weapon.damage)}</span>
                    </div>
                    <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current" style={{ width: `${(Math.abs(weapon.damage) / 100) * 100}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const initialDeck = Array(10).fill(null);
                      initialDeck[0] = weapon.id; // Lock Slot 1 to this chosen item!
                      // Pre-fill next slots with default available weapons so they are never empty
                      for (let i = 1; i < 10; i++) {
                        initialDeck[i] = availableWeapons[i % availableWeapons.length] || 'pistol';
                      }
                      setDeckSlots(initialDeck);
                      setDeckActive(true);
                      soundService.playSFX('ui_click');
                    }}
                    className="mt-auto py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Equip 10-Slot Deck
                  </button>

                  {/* Rarity Glow */}
                  <div className="absolute -inset-1 bg-current opacity-0 group-hover:opacity-5 blur-xl transition-opacity pointer-events-none rounded-3xl" />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer Stats */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
          <div>System Status: Ready for 10-Slot Assignment</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Click any item/potion to launch 10-Slot combined pop-up loadout</span>
            </div>
          </div>
        </div>

        {/* Beautiful Interactive 10-Slot Deck Overlay */}
        <AnimatePresence>
          {deckActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-6 text-white"
            >
              <div className="bg-zinc-900 border-2 border-amber-400 p-8 rounded-[2.5rem] w-full max-w-4xl h-[78vh] flex flex-col gap-6 shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-3xl font-black text-amber-400 tracking-tighter uppercase italic">10-SLOT COMBINED LOADOUT DECK</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Customize your quick-use belt slots. Slot 1 is locked to your selected item.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setDeckActive(false)}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Back
                  </button>
                </div>

                {/* 10 Slots Row */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {deckSlots.map((weaponId, i) => {
                    const isSlot1 = i === 0;
                    const weapon = weaponId ? WEAPONS[weaponId] : null;
                    const isSelected = activeDeckSlot === i;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!isSlot1) {
                            setActiveDeckSlot(isSelected ? null : i);
                          }
                        }}
                        className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                          isSlot1
                            ? 'border-amber-400 bg-amber-400/15 cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : isSelected
                            ? 'border-cyan-400 bg-cyan-400/20 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                            : 'border-white/10 bg-black/40 hover:border-white/30'
                        }`}
                      >
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isSlot1 ? 'text-amber-400' : 'text-white/30'}`}>
                          Slot {i + 1} {isSlot1 && '🔒'}
                        </span>
                        <span className="text-[9px] font-black text-white text-center px-1 truncate w-full">
                          {weapon?.name.split(' ')[0] || 'EMPTY'}
                        </span>
                        <span className="text-[7px] text-white/40 uppercase font-bold truncate">
                          {weapon?.category || '---'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selector Area for Active Deck Slot */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
                  <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">
                    {activeDeckSlot !== null 
                      ? `Select Equipment for Slot ${activeDeckSlot + 1}` 
                      : 'Click Slot 2 to 10 above to change its weapon/potion'}
                  </h4>
                  
                  {activeDeckSlot !== null ? (
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pr-2 custom-scrollbar">
                      {availableWeapons.map((id) => {
                        const w = WEAPONS[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              const nextSlots = [...deckSlots];
                              nextSlots[activeDeckSlot] = id;
                              setDeckSlots(nextSlots);
                              setActiveDeckSlot(null);
                              soundService.playSFX('ui_click');
                            }}
                            className="bg-white/5 border border-white/10 hover:border-amber-400 rounded-xl p-3 flex flex-col items-start gap-1 transition-all hover:scale-[1.02]"
                          >
                            <span className="text-[10px] font-black text-white uppercase text-left truncate w-full">{w.name}</span>
                            <span className="text-[8px] text-white/30 uppercase font-black">{w.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30">
                      <Shield size={36} className="mb-2 animate-pulse" />
                      <p className="text-xs uppercase font-black text-white/50">All slots pre-populated. Click any slot 2-10 above to customize.</p>
                    </div>
                  )}
                </div>

                {/* Save Action */}
                <div className="flex justify-end gap-4 border-t border-white/10 pt-4 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const finalHotbar = deckSlots.map((item) => item || 'pistol');
                      useGameStore.setState({ hotbar: finalHotbar });
                      setDeckActive(false);
                      onClose();
                      soundService.playSFX('achievement');
                      useGameStore.getState().addEvent('🎒 COMBINED LOADOUT DECK EQUIPPED SUCCESSFULLY!');
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.45)]"
                  >
                    Confirm 10-Slot Loadout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

interface WeaponAbilitiesHUDProps {
  weaponId: WeaponType;
}

function WeaponAbilitiesHUD({ weaponId }: WeaponAbilitiesHUDProps) {
  const [activeCutscene, setActiveCutscene] = useState<{
    name: string;
    description: string;
    isUltimate: boolean;
    cinematicText: string;
    fxColor: string;
  } | null>(null);

  const weapon = WEAPONS[weaponId] || { name: 'Pistol', category: 'secondary' };
  const abilities = getAbilitiesForWeapon(weaponId, weapon.name, weapon.category);

  const triggerAbility = (ability: any) => {
    soundService.playSFX('spell');
    // Start cutscene
    setActiveCutscene({
      name: ability.name,
      description: ability.description,
      isUltimate: ability.type === 'ultimate',
      cinematicText: ability.cutscene.subtitle,
      fxColor: ability.cutscene.color,
    });

    // Add event log
    useGameStore.getState().addEvent(`⚡ [ABILITY USED] ${ability.name.toUpperCase()}: ${ability.description}`);

    // If it is the ultimate, it drains 100% health and kills you after the cutscene ends!
    setTimeout(() => {
      setActiveCutscene(null);
      if (ability.type === 'ultimate') {
        soundService.playSFX('explosion');
        // Subtract all health
        useGameStore.setState({ health: 0 });
        useGameStore.getState().addEvent(`💀 [ULTIMATE COLLAPSE] Player perished executing their own self-destructive ultimate!`);
        useGameStore.setState({ gameState: 'gameover', deaths: useGameStore.getState().deaths + 1 });
      }
    }, 2200);
  };

  return (
    <>
      {/* Cinematic Cutscene Overlay */}
      <AnimatePresence>
        {activeCutscene && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-auto overflow-hidden font-mono"
            style={{
              background: activeCutscene.isUltimate 
                ? 'radial-gradient(circle, rgba(220,38,38,0.95) 0%, rgba(0,0,0,0.98) 100%)' 
                : `radial-gradient(circle, ${activeCutscene.fxColor}33 0%, rgba(0,0,0,0.96) 100%)`
            }}
          >
            {/* Horizontal letterbox bars */}
            <div className="absolute top-0 left-0 w-full h-[15vh] bg-black border-b border-white/10" />
            <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-black border-t border-white/10" />

            {/* Kinetic flashing warning line */}
            {activeCutscene.isUltimate && (
              <div className="absolute top-[16vh] w-full bg-red-600/20 py-2 border-y border-red-500/50 flex overflow-hidden whitespace-nowrap">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-[0.5em] flex gap-20 animate-pulse">
                  <span>⚠️ WARNING: CRITICAL SELF-DESTRUCT ULTIMATE UNLEASHED ⚠️</span>
                  <span>⚠️ WARNING: CRITICAL SELF-DESTRUCT ULTIMATE UNLEASHED ⚠️</span>
                </div>
              </div>
            )}

            {/* Cinematic Center Stage */}
            <motion.div
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center px-6 max-w-2xl relative z-10 flex flex-col items-center gap-6"
            >
              <div className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                {activeCutscene.isUltimate ? '💥 SUPREME ULTIMATE MOVE' : '⚡ SPECIAL WEAPON ABILITY'}
              </div>

              <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-pulse">
                {activeCutscene.name}
              </h2>

              <p className="text-amber-400 font-bold uppercase tracking-[0.2em] text-sm md:text-base max-w-lg">
                {activeCutscene.cinematicText}
              </p>

              <div className="text-[11px] text-white/50 bg-black/40 border border-white/5 p-4 rounded-2xl max-w-md uppercase leading-relaxed">
                {activeCutscene.description}
              </div>

              {activeCutscene.isUltimate && (
                <div className="text-red-500 text-xs font-black uppercase tracking-widest animate-bounce mt-4 bg-red-500/10 border border-red-500/30 px-6 py-2 rounded-xl">
                  💀 INFLICTS SELF-FATAL SACRIFICE
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Abilities Grid above Hotbar */}
      <div className="flex flex-col items-center gap-2 mb-4 w-full max-w-md mx-auto pointer-events-auto">
        <div className="text-[9px] font-black text-amber-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap size={10} className="text-amber-400" />
          {WEAPONS[weaponId]?.name || 'EQUIPPED'} SPECIAL ABILITIES
        </div>
        <div className="grid grid-cols-4 gap-2 w-full">
          {abilities.map((ability, index) => (
            <button
              key={ability.id}
              onClick={() => triggerAbility(ability)}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-between gap-1 transition-all group ${
                ability.type === 'ultimate'
                  ? 'border-red-500/40 bg-red-950/20 text-red-400 hover:border-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(239,68,68,0.45)]'
                  : 'border-amber-500/20 bg-black/65 text-amber-300 hover:border-amber-400 hover:bg-amber-400 hover:text-black hover:shadow-[0_0_15px_rgba(245,158,11,0.35)]'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[7px] font-mono font-black opacity-60">AB{index + 1}</span>
                {ability.type === 'ultimate' && <span className="text-[8px] animate-pulse">💥</span>}
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-center truncate w-full group-hover:text-current">
                {ability.name.split(' ')[0]}
              </span>
              <span className="text-[7px] font-bold uppercase opacity-50 truncate group-hover:opacity-80">
                {ability.type === 'ultimate' ? 'ULTIMATE' : 'COOLDOWN'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function HUD() {
  const gameState = useGameStore(state => state.gameState);
  const score = useGameStore(state => state.score);
  const kills = useGameStore(state => state.kills);
  const deaths = useGameStore(state => state.deaths);
  const timeLeft = useGameStore(state => state.timeLeft);
  const energy = useGameStore(state => state.energy);
  const stamina = useGameStore(state => state.stamina);
  const focus = useGameStore(state => state.focus);
  const overload = useGameStore(state => state.overload);
  const arenaState = useGameStore(state => state.arenaState);
  const combatPhase = useGameStore(state => state.combatPhase);
  const health = useGameStore(state => state.health);
  const mana = useGameStore(state => state.mana);
  const infectionLevel = useGameStore(state => state.infectionLevel);
  const isGlitch = useGameStore(state => state.isGlitch);
  const isSpectating = useGameStore(state => state.isSpectating);
  const playerState = useGameStore(state => state.playerState);
  const playerClass = useGameStore(state => state.playerClass);
  const otherPlayers = useGameStore(state => state.otherPlayers);
  const playerCount = Object.keys(otherPlayers).length + 1;
  const leaveGame = useGameStore(state => state.leaveGame);
  const triggerEmote = useGameStore(state => state.triggerEmote);
  const isMuted = useGameStore(state => state.isMuted);
  const toggleMute = useGameStore(state => state.toggleMute);
  const events = useGameStore(state => state.events);
  
  const isVehicleMenuOpen = useGameStore(state => state.isVehicleMenuOpen);
  const setVehicleMenuOpen = useGameStore(state => state.setVehicleMenuOpen);
  const spawnVehicle = useGameStore(state => state.spawnVehicle);
  const playerPosition = useGameStore(state => state.playerPosition);
  const isThirdPerson = useGameStore(state => state.isThirdPerson);
  const toggleThirdPerson = useGameStore(state => state.toggleThirdPerson);
  const isDonateModalOpen = useGameStore(state => state.isDonateModalOpen);
  const setDonateModalOpen = useGameStore(state => state.setDonateModalOpen);
  const spectatorTargetId = useGameStore(state => state.spectatorTargetId);
  const setSpectating = useGameStore(state => state.setSpectating);
  const cycleSpectator = useGameStore(state => state.cycleSpectator);
  const currentAmmo = useGameStore(state => state.currentAmmo);
  const reload = useGameStore(state => state.reload);
  const roomId = useGameStore(state => state.roomId);
  const saveMap = useGameStore(state => state.saveMap);
  const clearMap = useGameStore(state => state.clearMap);
  const lastDashTime = useGameStore(state => state.lastDashTime);
  const dashCooldown = useGameStore(state => state.dashCooldown);
  const gameMode = useGameStore(state => state.gameMode);
  const humanSurvivors = useGameStore(state => state.humanSurvivors);
  const infectionMatchTimer = useGameStore(state => state.infectionMatchTimer);
  const glitchPlayerIds = useGameStore(state => state.glitchPlayerIds);
  
  const selectedMode = useGameStore(state => state.selectedMode);
  const team = useGameStore(state => state.team);
  const teamScores = useGameStore(state => state.teamScores);
  const flags = useGameStore(state => state.flags);
  
  const availableWeapons = useGameStore(state => state.availableWeapons);
  const currentWeaponIndex = useGameStore(state => state.currentWeaponIndex);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const setInventoryOpen = useGameStore(state => state.setInventoryOpen);

  const isBuildMode = useGameStore(state => state.isBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const setSelectedBlock = useGameStore(state => state.setSelectedBlock);

  const hotbar = useGameStore(state => state.hotbar);

  const updateRecommendations = useGameStore(state => state.updateRecommendations);
  const recommendUpdate = useGameStore(state => state.recommendUpdate);
  const approveUpdate = useGameStore(state => state.approveUpdate);
  const rejectUpdate = useGameStore(state => state.rejectUpdate);
  const updateGameBranding = useGameStore(state => state.updateGameBranding);
  const checkAdminPassword = useGameStore(state => state.checkAdminPassword);
  const isAdmin = useGameStore(state => state.isAdmin);
  const gameName = useGameStore(state => state.gameName);
  const gameLogo = useGameStore(state => state.gameLogo);
  const setGamertag = useGameStore(state => state.setGamertag);
  const gamertag = useGameStore(state => state.gamertag);
  const privateServerName = useGameStore(state => state.privateServerName);
  const setPrivateServerName = useGameStore(state => state.setPrivateServerName);
  const selectedRegion = useGameStore(state => state.selectedRegion);
  const setRegion = useGameStore(state => state.setRegion);

  const isChatOpen = useGameStore(state => state.isChatOpen);
  const setChatOpen = useGameStore(state => state.setChatOpen);
  const chatMessages = useGameStore(state => state.chatMessages);
  const sendChatMessage = useGameStore(state => state.sendChatMessage);
  const isReloading = useGameStore(state => state.isReloading);

  const currentKillStreak = useGameStore(state => state.currentKillStreak);
  const bestKillStreak = useGameStore(state => state.bestKillStreak);
  const activeStreakPower = useGameStore(state => state.activeStreakPower);

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const hitIndicator = useGameStore(state => state.hitIndicator);
  const environment = useGameStore(state => state.environment);

  useEffect(() => {
    if (hitIndicator.active) {
      setBloodSplatterEffect(true);
      const timer = setTimeout(() => setBloodSplatterEffect(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hitIndicator.active]);

  const clanId = useGameStore(state => state.user?.clanId);
  const [clanTag, setClanTag] = useState<string | null>(null);

  useEffect(() => {
    if (clanId) {
      import('./firebase').then(({ getClan }) => {
        getClan(clanId).then(clan => {
          if (clan) setClanTag(clan.tag);
        });
      });
    } else {
      setClanTag(null);
    }
  }, [clanId]);

  const [chatInput, setChatInput] = useState('');
  const [chatType, setChatType] = useState<'global' | 'proximity'>('global');

  const [showScoreboard, setShowScoreboard] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [bloodSplatterEffect, setBloodSplatterEffect] = useState(false);

  const bloodSplatter = useGameStore(state => state.bloodSplatter);
  const processCommand = useGameStore(state => state.processCommand);
  const user = useGameStore(state => state.user);
  const isOwner = user?.email === 'sethu.nontsele@gmail.com';
  const isAdminUser = isOwner || useGameStore.getState().persistentStats?.isAdmin;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault();
        if (isAdminUser) setCommandOpen(!isCommandOpen);
      }
      if (e.key === 't' || e.key === 'T') {
        if (!isChatOpen && isAdminUser) {
          e.preventDefault();
          setCommandOpen(!isCommandOpen);
        }
      }
      if (e.key === 'g' || e.key === 'G') {
        if (!isChatOpen && !isCommandOpen) {
          useGameStore.getState().toggleModal('casino');
          soundService.playSFX('ui_click');
        }
      }
      if (e.key === 'v' || e.key === 'V') {
        if (!isChatOpen && !isCommandOpen) {
          setVehicleMenuOpen(!isVehicleMenuOpen);
        }
      }
      if (e.key === 'c' || e.key === 'C') {
        if (!isChatOpen && !isCommandOpen) {
          toggleThirdPerson();
        }
      }
      if ((e.key === 'q' || e.key === 'Q') && !isChatOpen && !isCommandOpen) {
        useGameStore.getState().castSpell();
      }
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
          setChatOpen(false);
        }
      }
      if (e.key === 'Enter' && !isChatOpen) {
        setChatOpen(true);
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
      { id: 'me', name: useGameStore.getState().gamertag, score: score, kills: kills, deaths: deaths, isMe: true, color: useGameStore.getState().selectedColor || '#f59e0b' },
      ...Object.entries(otherPlayers).map(([socketId, p]) => ({
        id: socketId,
        name: p.name,
        score: p.score,
        kills: p.kills,
        deaths: p.deaths,
        isMe: false,
        color: p.color || '#3b82f6'
      }))
    ];

    // If playing offline or single player, add our premium squadmates to populate the board!
    if (players.length === 1) {
      players.push(
        { id: 'bot-squad-1', name: 'COBALT-SQUAD-01', score: 850, kills: 7, deaths: 1, isMe: false, color: '#10b981' },
        { id: 'bot-squad-2', name: 'VORTEX-SQUAD-02', score: 540, kills: 4, deaths: 2, isMe: false, color: '#3b82f6' },
        { id: 'bot-squad-3', name: 'APEX-SQUAD-03', score: 1120, kills: 9, deaths: 4, isMe: false, color: '#ec4899' }
      );
    }

    return players.sort((a, b) => b.score - a.score);
  }, [score, kills, deaths, otherPlayers]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput, chatType);
      setChatInput('');
      setChatOpen(false);
      soundService.playSFX('ui_click');
    }
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) {
      processCommand(commandInput);
      setCommandInput('');
      setCommandOpen(false);
      soundService.playSFX('ui_click');
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    }
  };

  const currentWeapon = WEAPONS[hotbar[currentWeaponIndex]];

  return (
    <>
      {/* Cutscene Overlay */}
      <AnimatePresence>
        {useGameStore(state => state.isCutsceneActive) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-[200] flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl"
            >
              <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-6">
                The Awakening
              </h1>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-12">
                In a world reclaimed by nature, the remnants of a forgotten civilization whisper secrets of the past. 
                You are the last operator. Your mission: survive the glitch and reclaim the data.
              </p>
              <button 
                onClick={() => useGameStore.getState().setCutsceneActive(false)}
                className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 transition-all rounded-2xl"
              >
                Begin Mission
              </button>
            </motion.div>
            
            {/* Cinematic Bars */}
            <div className="absolute top-0 inset-x-0 h-24 bg-black" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Menu */}
      <AnimatePresence>
        {isVehicleMenuOpen && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[80] pointer-events-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Summon Vehicle</h2>
                  <div className="h-1 w-16 bg-emerald-500 mt-2" />
                </div>
                <button onClick={() => setVehicleMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={24} className="text-white/50" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['helicopter', 'car', 'motorbike'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      spawnVehicle(type, [useGameStore.getState().playerPosition[0] + 5, useGameStore.getState().playerPosition[1] + 2, useGameStore.getState().playerPosition[2] + 5]);
                      setVehicleMenuOpen(false);
                      soundService.playSFX('ui_click');
                    }}
                    className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-emerald-500 hover:text-black transition-all flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black/20">
                      {type === 'helicopter' ? <Cpu size={32} /> : type === 'car' ? <Car size={32} /> : <Zap size={32} />}
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">{type}</span>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setVehicleMenuOpen(false)}
                className="mt-8 w-full py-4 bg-white/5 text-white/50 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all"
              >
                Exit Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Command Console */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="absolute inset-x-0 top-0 flex justify-center z-[90] pointer-events-auto p-4">
            <motion.form
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              onSubmit={handleSendCommand}
              className="w-full max-w-3xl bg-black/90 border border-emerald-500/30 p-2 rounded-2xl backdrop-blur-xl flex gap-2"
            >
              <div className="flex items-center pl-4 text-emerald-500">
                <Terminal size={18} />
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Enter admin command..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent border-none text-emerald-400 font-mono text-sm py-2 focus:outline-none"
              />
              <button type="submit" className="bg-emerald-500 text-black px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
                Execute
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Blood Splatter Effect */}
      <AnimatePresence>
        {(bloodSplatter || bloodSplatterEffect) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle,rgba(220,38,38,0.4)_0%,transparent_70%)]"
          />
        )}
      </AnimatePresence>

      {/* Crosshair */}
      {!isSpectating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <DynamicCrosshair />
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

      {/* Voice Chat Indicator (Centered as requested) */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 flex items-center gap-2 pointer-events-auto z-50">
        {!hasApiKey && (
          <button 
            onClick={handleSelectKey}
            className="px-4 py-2 rounded-xl border-2 border-amber-500 bg-amber-500/20 text-amber-400 font-black text-xs tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <Zap size={14} />
            ACTIVATE AI MUSIC
          </button>
        )}
        <button 
          onClick={toggleMute}
          className={`px-4 py-2 rounded-xl border-2 font-black text-xs tracking-widest transition-all flex items-center gap-2 ${
            !isMuted 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
              : 'bg-red-500/20 border-red-500 text-red-400'
          }`}
        >
          {!isMuted ? <Mic size={14} /> : <MicOff size={14} />}
          {isMuted ? 'VOICE ON' : 'VOICE OFF'}
        </button>
      </div>

      {/* HUD Left - Score & Leaderboard */}
      <div className="absolute top-4 left-4 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em] mb-1">
            {environment.date} | {Math.floor(environment.time)}:{Math.floor((environment.time % 1) * 60).toString().padStart(2, '0')}
          </div>
          <div className="text-white text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 flex items-center gap-2">
            OPERATOR: {useGameStore.getState().gamertag}
            {clanTag && (
              <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded text-[8px] font-black">
                [{clanTag}]
              </span>
            )}
          </div>
          <div className="text-amber-400 text-2xl font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] flex items-center gap-3">
            {gameMode === 'infection' ? (
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1 rounded-full border-2 font-black text-sm tracking-widest ${isGlitch ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-emerald-500/20 border-emerald-500 text-emerald-500'}`}>
                  {isGlitch ? 'GLITCH ENTITY' : 'HUMAN DATA'}
                </div>
                <div className="text-white/40 text-xs font-black uppercase tracking-widest">
                  SURVIVORS: <span className="text-emerald-400">{humanSurvivors}</span>
                </div>
              </div>
            ) : (
              selectedMode === 'ffa' ? `SCORE: ${score.toString().padStart(4, '0')}` : `TEAM: ${team.toUpperCase()}`
            )}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30">
              <span className="text-[10px] text-amber-400/50 font-black uppercase tracking-widest">Rank</span>
              <span className="text-xs font-black text-white uppercase tracking-widest">{useGameStore.getState().rank}</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${(useGameStore.getState().xp % 1000) / 10}%` }} />
              </div>
              <span className="text-[10px] text-white/50 font-black">LVL {useGameStore.getState().level}</span>
            </div>
            {currentKillStreak > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 animate-pulse">
                <Zap size={12} className="text-red-500" />
                <span className="text-xs font-black text-red-500 italic">{currentKillStreak} STREAK</span>
                {activeStreakPower && (
                  <span className="ml-2 text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-black">
                    {activeStreakPower.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {selectedMode !== 'ffa' && (
            <div className="flex gap-4 mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Amber</span>
                <span className="text-xl font-black text-amber-400">{Math.floor(teamScores.amber)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-400 font-bold uppercase">Blue</span>
                <span className="text-xl font-black text-blue-400">{Math.floor(teamScores.blue)}</span>
              </div>
            </div>
          )}

          {/* Player Health & Mana Bars */}
          {!isSpectating && (
            <div className="flex flex-col gap-2">
              {/* Health Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center w-48">
                  <div className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">HEALTH: {health}%</div>
                  <div className="text-[8px] text-white/40 font-bold tracking-widest uppercase">{playerClass}</div>
                </div>
                <div className="w-48 h-2 bg-black/50 border border-white/10 rounded overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${health > 50 ? 'bg-emerald-500' : health > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${health}%` }}
                  />
                </div>
              </div>

              {/* Mana Bar */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">MANA: {Math.floor(mana)}%</div>
                <div className="w-48 h-1 bg-black/50 border border-white/5 rounded overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${mana}%` }} />
                </div>
                <div className="text-[8px] text-blue-400/40 font-bold uppercase tracking-widest">[Q] {SPELLS[useGameStore.getState().selectedSpell].name}</div>
              </div>

              {/* Stamina Bar */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">STAMINA: {Math.floor(stamina)}%</div>
                <div className="w-48 h-1 bg-black/50 border border-white/5 rounded overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${stamina}%` }} />
                </div>
              </div>

              {/* Energy (Combat Logic) Bar - Subtle if needed */}
              {energy < 100 && (
                <div className="flex flex-col gap-1 opacity-40">
                  <div className="text-[8px] text-blue-400 font-bold tracking-widest uppercase">ENERGY: {Math.floor(energy)}%</div>
                  <div className="w-32 h-0.5 bg-black/50 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${energy}%` }} />
                  </div>
                </div>
              )}

              {/* Dimension Overload (Subtle) */}
              {overload > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  <div className="text-[10px] text-pink-500 font-bold tracking-widest uppercase">DIMENSION OVERLOAD: {Math.floor(overload)}%</div>
                  <div className="w-48 h-1 bg-pink-950/50 rounded overflow-hidden">
                    <motion.div 
                      animate={{ width: `${overload}%` }}
                      className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    />
                  </div>
                </div>
              )}

              {/* Dash Cooldown */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="text-[8px] text-cyan-400/70 font-bold tracking-widest uppercase">DASH READY: {Math.max(0, dashCooldown - (Date.now() - lastDashTime)) <= 0 ? 'READY' : (Math.ceil((dashCooldown - (Date.now() - lastDashTime)) / 100) / 10) + 's'}</div>
                <div className="w-32 h-1 bg-black/50 border border-white/5 rounded overflow-hidden">
                  <div className="h-full bg-cyan-400 transition-all shadow-[0_0_5px_rgba(34,211,238,0.5)]" style={{ width: `${Math.min(100, ((Date.now() - lastDashTime) / dashCooldown) * 100)}%` }} />
                </div>
              </div>
              
              {/* Dimension Phase Status */}
              <div className="absolute top-1/2 -right-36 transform -translate-y-1/2 rotate-90 origin-left flex items-center gap-4 pointer-events-none opacity-20">
                <div className="text-[8px] text-white font-bold tracking-[1em] uppercase">SYS: {arenaState.toUpperCase()}</div>
                <div className="h-px w-20 bg-white/20" />
                <div className="text-[10px] text-white font-bold uppercase tracking-widest">P_{combatPhase}</div>
              </div>

              {/* Infection Progress (if not glitch) */}
              {!isGlitch && infectionLevel > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="text-[8px] text-red-500 font-black tracking-widest uppercase animate-pulse">INFECTION PROGRESS: {Math.floor(infectionLevel)}%</div>
                  <div className="w-48 h-2 bg-black/50 border border-red-900/50 rounded overflow-hidden">
                    <div 
                      className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300"
                      style={{ width: `${infectionLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
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

          {(selectedMode === 'koth' || selectedMode === 'domination') && (
            <div className="mt-4 flex flex-col gap-2">
              {useGameStore.getState().controlPoints.map(cp => (
                <div key={cp.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center w-48">
                    <span className={`text-[10px] font-bold uppercase ${cp.owner === 'amber' ? 'text-amber-400' : cp.owner === 'blue' ? 'text-blue-400' : 'text-white/50'}`}>
                      {cp.name}
                    </span>
                    <span className="text-[10px] font-black text-white/50">{Math.floor(Math.abs(cp.progress))}%</span>
                  </div>
                  <div className="w-48 h-1.5 bg-black/50 border border-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${cp.capturingTeam === 'amber' || cp.owner === 'amber' ? 'bg-amber-400' : cp.capturingTeam === 'blue' || cp.owner === 'blue' ? 'bg-blue-400' : 'bg-white/20'}`}
                      style={{ width: `${Math.abs(cp.progress)}%` }}
                    />
                  </div>
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
              <span>{i + 1}. {p.name}</span>
              <span>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Team status HUD positioned on the lower left */}
      <div className="absolute bottom-24 left-4 z-40 pointer-events-auto hidden md:block">
        <TeamStatusHUD />
      </div>
      
      {/* HUD Right - Time, Leave, Events */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-amber-400 font-mono text-lg mb-1">
          {gameMode === 'infection' 
            ? `${Math.floor(infectionMatchTimer / 60)}:${(Math.floor(infectionMatchTimer) % 60).toString().padStart(2, '0')}`
            : `${Math.floor(timeLeft / 60)}:${(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}`
          }
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
            {currentAmmo[currentWeapon.id] === 0 && !isReloading && (
              <div className="text-[8px] text-red-500 font-black uppercase tracking-tighter animate-bounce mt-1">Press R to Reload</div>
            )}
            {isReloading && (
              <div className="w-full mt-2">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-amber-400 mb-1">
                  <span>Reloading</span>
                  <span>{currentWeapon.reloadTime}s</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: currentWeapon.reloadTime, ease: "linear" }}
                    className="h-full bg-amber-400"
                  />
                </div>
              </div>
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

        {/* Event Log / Kill Feed */}
        <div className="mt-4 flex flex-col items-end gap-2 pointer-events-none">
          <AnimatePresence>
            {events.slice(-5).reverse().map(event => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 border-r-4 border-amber-400 px-4 py-2 rounded-l-xl backdrop-blur-sm flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                {event.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat UI (Bottom Left) */}
      <div className="absolute bottom-32 left-4 w-80 pointer-events-auto flex flex-col gap-2">
        <div className="flex justify-between items-center px-2">
          <button 
            onClick={() => setChatOpen(!isChatOpen)}
            className="text-[10px] bg-black/60 border border-white/10 px-3 py-1 rounded-lg text-white/50 font-black uppercase tracking-widest hover:text-white transition-all"
          >
            {isChatOpen ? 'CLOSE CHAT' : 'OPEN CHAT'}
          </button>
        </div>
        
        {isChatOpen && (
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
                onBlur={() => !chatInput && setChatOpen(false)}
                className="flex-1 bg-white/5 border border-white/20 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
                placeholder="Type message..."
              />
            </form>
          </div>
        )}
      </div>

      {/* Multiplayer Info */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <div className="text-amber-400 text-sm font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
          PLAYERS ONLINE: {playerCount} / 60
        </div>
      </div>

      {/* Crosshair */}
      {gameState === 'playing' && playerState === 'active' && !isInventoryOpen && <TeleportHUD />}
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

      {/* Reload Indicator */}
      {isReloading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-24 flex flex-col items-center gap-2 pointer-events-none">
          <div className="text-amber-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">RELOADING...</div>
          <div className="w-48 h-1.5 bg-black/60 border border-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: WEAPONS[hotbar[currentWeaponIndex]]?.reloadTime / 1000, ease: "linear" }}
              className="h-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            />
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

        {/* Hotbar & Weapon Abilities Container */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto max-w-[90vw] z-[40]">
          {gameState === 'playing' && playerState === 'active' && !isBuildMode && !isInventoryOpen && (
            <WeaponAbilitiesHUD weaponId={hotbar[currentWeaponIndex] || 'pistol'} />
          )}

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar w-full justify-center">
            {isBuildMode ? (
              // Build Mode Hotbar
              (['stone', 'cobblestone', 'dirt', 'grass', 'sand', 'gravel', 'clay', 'bedrock', 'oak_log'] as const).map((block, idx) => {
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
              // Combat Mode Hotbar - Dynamic from store
              hotbar.map((weaponId, idx) => {
                const weapon = WEAPONS[weaponId];
                const isActive = idx === currentWeaponIndex;
                return (
                  <button
                    key={`${weaponId}-${idx}`}
                    onClick={() => switchWeapon(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-amber-500/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' 
                        : 'bg-black/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-[8px] text-white/40 font-bold mb-1">{idx + 1}</div>
                    <div className={`text-[10px] font-black uppercase text-center leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {weapon?.name.split(' ')[0] || weapon?.name || '---'}
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
        </div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {isInventoryOpen && (
          <InventoryModal onClose={() => setInventoryOpen(false)} />
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
                      <span className="font-bold truncate">{p.name}</span>
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
                    const other = otherPlayers[p.id];
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
                        <span className="font-bold truncate">{p.name}</span>
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
                    const other = otherPlayers[p.id];
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
                        <span className="font-bold truncate">{p.name}</span>
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
              <button 
                onClick={() => {
                  const rating = prompt("Rate this match (1-5):");
                  if (rating) {
                    useGameStore.getState().addEvent(`Match Rated: ${rating}/5`);
                  }
                }}
                className="px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all text-amber-400"
              >
                Rate Match
              </button>
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
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    return isMobileUA && isLandscape;
  });

  useEffect(() => {
    const check = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsMobile(isMobileUA && isLandscape);
    };
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return isMobile;
}

const VehicleMenu = ({ onClose }: { onClose: () => void }) => {
  const spawnVehicle = useGameStore(state => state.spawnVehicle);
  const user = useGameStore(state => state.user);

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[70] pointer-events-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Vehicle Hangar</h2>
            <div className="h-1 w-16 bg-blue-400 mt-2" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} className="text-white/50" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(['car', 'motorbike', 'helicopter'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                spawnVehicle(type, [0, 5, 0], 'none');
                onClose();
              }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-blue-500/20 hover:border-blue-500 transition-all group"
            >
              <Car size={48} className="text-white/20 group-hover:text-blue-400 transition-colors" />
              <div className="text-xl font-black text-white uppercase italic">{type}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ActivePowerUpsHUD = () => {
  const activePowerUps = useGameStore(state => state.activePowerUps);
  const powerupTypes = Object.entries(activePowerUps).filter(([_, duration]) => duration > 0);

  if (powerupTypes.length === 0) return null;

  return (
    <div className="absolute bottom-32 left-4 z-50 flex flex-col gap-2">
      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Active Augments</h4>
      {powerupTypes.map(([type, duration]) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md"
        >
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            type === 'speed' ? 'bg-blue-400' : 
            type === 'damage' ? 'bg-red-400' : 
            type === 'shield' ? 'bg-amber-400' : 
            type === 'infinite_ammo' ? 'bg-emerald-400' : 
            type === 'gravity_well' ? 'bg-purple-400' : 
            type === 'vampirism' ? 'bg-pink-400' : 'bg-zinc-400'
          }`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">{type.replace('_', ' ')}</span>
            <div className="h-0.5 w-24 bg-white/10 rounded-full mt-1 overflow-hidden">
               <motion.div 
                className="h-full bg-blue-400" 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const QuestModal = ({ onClose }: { onClose: () => void }) => {
  const quests = useGameStore(state => state.quests);
  const claimQuestReward = useGameStore(state => state.claimQuestReward);

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-950 border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Operations</h2>
            <div className="h-1 w-24 bg-amber-400 mt-2" />
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl transition-all">
            <X size={32} className="text-white/40" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[50vh]">
          {quests.map(quest => {
            const isCompleted = quest.progress >= quest.requirement;
            return (
              <div 
                key={quest.id}
                className={`p-6 rounded-3xl border transition-all ${
                  quest.isClaimed 
                    ? 'border-white/5 bg-white/5 opacity-50' 
                    : isCompleted 
                      ? 'border-emerald-500/50 bg-emerald-500/10' 
                      : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{quest.title}</h4>
                    <p className="text-xs text-white/40 uppercase font-medium">{quest.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{quest.reward} CR</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} 
                      style={{ width: `${(quest.progress / quest.requirement) * 100}%` }} 
                    />
                  </div>
                  <div className="text-[10px] font-black text-white/40 uppercase whitespace-nowrap min-w-[60px] text-right">
                    {quest.progress} / {quest.requirement}
                  </div>
                </div>

                {isCompleted && !quest.isClaimed && (
                  <button 
                    onClick={() => claimQuestReward(quest.id)}
                    className="w-full mt-6 py-3 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                  >
                    Claim Reward
                  </button>
                )}
                
                {quest.isClaimed && (
                  <div className="w-full mt-6 py-3 bg-white/10 text-white/30 font-black uppercase text-[10px] tracking-widest rounded-xl text-center border border-white/5">
                    Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const WorldEventHUD = () => {
  const activeWorldEvent = useGameStore(state => state.activeWorldEvent);
  if (!activeWorldEvent) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="bg-red-600/20 border border-red-500/50 backdrop-blur-xl px-10 py-4 rounded-[2rem] flex flex-col items-center">
        <div className="flex gap-4 items-center mb-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">GLOBAL ANOMALY: {activeWorldEvent.type.replace('_', ' ')}</h4>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
        <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Stabilization in {Math.ceil(activeWorldEvent.timeLeft / 1000)}s</div>
        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className="h-full bg-red-500"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: activeWorldEvent.timeLeft / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const BillionFeaturesBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-10 right-10 z-50 pointer-events-none"
    >
      <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl flex items-center gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl rotate-12">
          <Sparkles size={24} />
        </div>
        <div>
          <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Build 89,000,000,452</div>
          <div className="text-lg font-black text-white italic tracking-tighter uppercase whitespace-nowrap">EXTREME CONTENT UPDATE // ACTIVE</div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [lobbyTab, setLobbyTab] = useState<'play' | 'settings' | 'replays' | 'lore' | 'spells'>('play');
  const [showExperimental, setShowExperimental] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showTactical, setShowTactical] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [instantCopyProgress, setInstantCopyProgress] = useState(0);
  const [isInstantCopying, setIsInstantCopying] = useState(false);

  const triggerInstantCopy = () => {
    if (isInstantCopying) return;
    setIsInstantCopying(true);
    setInstantCopyProgress(1);
    soundService.playSFX('ui_click');
    useGameStore.getState().addEvent('[SCANNER ACTIVATED] Copying world structures via LiDAR laser array...');

    const interval = setInterval(() => {
      setInstantCopyProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsInstantCopying(false);
          
          // Apply map custom scan configuration
          const storeState = useGameStore.getState();
          storeState.setScannedModel({
            scannedModelType: 'droid',
            scannedModelColor: '#38bdf8',
            scannedModelScale: { x: 1.2, y: 1.5, z: 1.2 },
            scannedModelDecimation: 80,
            scannedModelTextureCaptured: true,
            scannedModelRepairedHoles: true,
            scannedModelSupportEnabled: false,
          });
          storeState.setMap('custom_scan');
          storeState.addEvent('3D COPY SUCCESSFUL: World mapped into a new simulated custom scan level!');
          soundService.playSFX('quest_complete');
          return 100;
        }
        return prev + 5;
      });
    }, 70);
  };

  const gameState = useGameStore(state => state.gameState);
  const setGameState = useGameStore(state => state.setGameState);
  const score = useGameStore(state => state.score);
  const kills = useGameStore(state => state.kills);
  const deaths = useGameStore(state => state.deaths);
  const enterLobby = useGameStore(state => state.enterLobby);
  const otherPlayers = useGameStore(state => state.otherPlayers);

  const leaderboard = useMemo(() => {
    const players = [
      { id: 'me', name: useGameStore.getState().gamertag, score: score, kills: kills, deaths: deaths, isMe: true, color: useGameStore.getState().selectedColor || '#f59e0b' },
      ...Object.entries(otherPlayers).map(([socketId, p]) => ({
        id: socketId,
        name: p.name,
        score: p.score,
        kills: p.kills,
        deaths: p.deaths,
        isMe: false,
        color: p.color || '#3b82f6'
      }))
    ];

    if (players.length === 1) {
      players.push(
        { id: 'bot-squad-1', name: 'COBALT-SQUAD-01', score: 850, kills: 7, deaths: 1, isMe: false, color: '#10b981' },
        { id: 'bot-squad-2', name: 'VORTEX-SQUAD-02', score: 540, kills: 4, deaths: 2, isMe: false, color: '#3b82f6' },
        { id: 'bot-squad-3', name: 'APEX-SQUAD-03', score: 1120, kills: 9, deaths: 4, isMe: false, color: '#ec4899' }
      );
    }

    return players.sort((a, b) => b.score - a.score);
  }, [score, kills, deaths, otherPlayers]);

  const [showMvpAnnouncement, setShowMvpAnnouncement] = useState(false);
  const generateMapVotingOptions = useGameStore(state => state.generateMapVotingOptions);

  useEffect(() => {
    if (gameState === 'gameover') {
      setShowMvpAnnouncement(true);
      generateMapVotingOptions();
    }
  }, [gameState, generateMapVotingOptions]);
  
  const gamertag = useGameStore(state => state.gamertag);
  const setGamertag = useGameStore(state => state.setGamertag);
  const privateServerName = useGameStore(state => state.privateServerName);
  const setPrivateServerName = useGameStore(state => state.setPrivateServerName);
  const roomId = useGameStore(state => state.roomId);
  const setRoomId = (id: string) => useGameStore.setState({ roomId: id });
  
  const startGame = () => {
    if (socket) {
      socket.disconnect();
    }
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
  const playerClass = useGameStore(state => state.playerClass);
  const setPlayerClass = useGameStore(state => state.setPlayerClass);
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const setBuildMode = useGameStore(state => state.setBuildMode);
  const selectedBlock = useGameStore(state => state.selectedBlock);
  const setSelectedBlock = useGameStore(state => state.setSelectedBlock);
  const isMuted = useGameStore(state => state.isMuted);
  const toggleMute = useGameStore(state => state.toggleMute);
  const selectedRegion = useGameStore(state => state.selectedRegion);
  const setRegion = useGameStore(state => state.setRegion);
  
  const gameName = useGameStore(state => state.gameName);
  const gameLogo = useGameStore(state => state.gameLogo);
  const isAdmin = useGameStore(state => state.isAdmin);
  const recommendUpdate = useGameStore(state => state.recommendUpdate);
  const updateRecommendations = useGameStore(state => state.updateRecommendations);
  const approveUpdate = useGameStore(state => state.approveUpdate);
  const rejectUpdate = useGameStore(state => state.rejectUpdate);
  const updateGameBranding = useGameStore(state => state.updateGameBranding);
  const checkAdminPassword = useGameStore(state => state.checkAdminPassword);
  
  const user = useGameStore(state => state.user);
  const persistentStats = useGameStore(state => state.persistentStats);
  const setUser = useGameStore(state => state.setUser);
  const fetchStats = useGameStore(state => state.fetchStats);
  const rank = useGameStore(state => state.rank);
  const rankPoints = useGameStore(state => state.rankPoints);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  const credits = useGameStore(state => state.credits);
  const isRanked = useGameStore(state => state.isRanked);
  const setRanked = useGameStore(state => state.setRanked);

  const isChatOpen = useGameStore(state => state.isChatOpen);
  const setChatOpen = useGameStore(state => state.setChatOpen);
  const isDonateModalOpen = useGameStore(state => state.isDonateModalOpen);
  const setDonateModalOpen = useGameStore(state => state.setDonateModalOpen);
  const modals = useGameStore(state => state.modals);
  const toggleModal = useGameStore(state => state.toggleModal);
  const setModal = useGameStore(state => state.setModal);

  useEffect(() => {
    // Show HUGE UPDATE modal once
    const seen = localStorage.getItem('seen_mega_update_v15');
    if (!seen) {
      setModal('update', true);
      localStorage.setItem('seen_mega_update_v15', 'true');
    }
  }, [setModal]);
  const chatMessages = useGameStore(state => state.chatMessages);
  const sendChatMessage = useGameStore(state => state.sendChatMessage);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const musicEnabled = useGameStore(state => state.musicEnabled);
  const setMusicEnabled = useGameStore(state => state.setMusicEnabled);
  const addEvent = useGameStore(state => state.addEvent);

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
        if (selected) {
          setMusicEnabled(true);
        }
      }
    };
    checkKey();
  }, [setMusicEnabled]);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setMusicEnabled(true);
      addEvent("AI Music: System Initialized");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchStats();
    });
    return () => unsubscribe();
  }, [setUser, fetchStats]);

  // Background Music Controller
  useEffect(() => {
    const handleMusic = async () => {
      if (!musicEnabled) {
        soundService.stopMusic();
        return;
      }

      if (gameState === 'lobby') {
        await soundService.playMusic('lobby');
      } else if (gameState === 'playing') {
        await soundService.playMusic('battle');
      } else {
        soundService.stopMusic();
      }
    };
    handleMusic();
    
    return () => {
      soundService.stopMusic();
    };
  }, [gameState, musicEnabled]);

  const isMobile = useIsMobile();
  const setIsMobile = useGameStore(state => state.setIsMobile);
  const trophyNotification = useGameStore(state => state.trophyNotification);
  const lobbyPlayers = useGameStore(state => state.lobbyPlayers);
  const isReady = useGameStore(state => state.isReady);
  const toggleReady = useGameStore(state => state.toggleReady);
  const leaveGame = useGameStore(state => state.leaveGame);
  const socket = useGameStore(state => state.socket);

  // Sync mobile state with store safely
  useEffect(() => {
    const currentStoreIsMobile = useGameStore.getState().isMobile;
    if (currentStoreIsMobile !== isMobile) {
      setIsMobile(isMobile);
    }
  }, [isMobile, setIsMobile]);

  // Health, Mana and Power-up Regeneration Loop
  useEffect(() => {
    let lastPos = useGameStore.getState().playerPosition;
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameState === 'playing') {
        // Health Regen
        if (state.health < 100 && Date.now() - state.lastDamageTime > 5000) {
          state.regenerateHealth(1);
        }
        // Mana Regen
        if (state.mana < state.maxMana) {
          useGameStore.setState(s => ({ mana: Math.min(s.maxMana, s.mana + 2) }));
        }

        // Power-up Countdown
        const newActivePowerUps = { ...state.activePowerUps };
        let changed = false;
        Object.entries(newActivePowerUps).forEach(([type, duration]) => {
          if (duration > 0) {
            newActivePowerUps[type as any] = Math.max(0, (duration as number) - 1000);
            changed = true;
          }
        });
        if (changed) {
          useGameStore.setState({ activePowerUps: newActivePowerUps });
        }

        // Quest Progress: Distance
        const currentPos = state.playerPosition;
        const dist = Math.sqrt(
          Math.pow(currentPos[0] - lastPos[0], 2) +
          Math.pow(currentPos[2] - lastPos[2], 2)
        );
        if (dist > 0.1) {
          state.updateQuests('distance', Math.floor(dist * 10));
          lastPos = currentPos;
        }

        // World Event Tick
        if (state.activeWorldEvent) {
          const newTime = state.activeWorldEvent.timeLeft - 1000;
          if (newTime <= 0) {
            state.setWorldEvent(null);
          } else {
            useGameStore.setState(s => ({ 
              activeWorldEvent: s.activeWorldEvent ? { ...s.activeWorldEvent, timeLeft: newTime } : null 
            }));
          }
        } else if (Math.random() < 0.01) {
          const events = ['METEOR_SHOWER', 'GRAVITY_SURGE', 'DIMENSION_INSTABILITY', 'DATA_STORM', 'GOLDEN_HOUR'];
          const type = events[Math.floor(Math.random() * events.length)];
          state.setWorldEvent({ type, duration: 30000 });
          state.addEvent(`⚠️ WORLD EVENT STARTING: ${type}`);
        }

        // Random Power-up Spawning
        if (Math.random() < 0.05 && state.powerUps.length < 5) {
          const types: any[] = ['speed', 'damage', 'shield', 'infinite_ammo'];
          const type = types[Math.floor(Math.random() * types.length)];
          const x = (Math.random() - 0.5) * 100;
          const z = (Math.random() - 0.5) * 100;
          state.spawnPowerUp(type, [x, 1, z]);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden font-mono select-none" style={{ backgroundColor: '#000000' }}>
      <RealLifeSync />
      <div 
        className="absolute inset-0"
      >
        {gameState === 'playing' && selectedMap === 'infinity_academy' ? (
          <InfinityAcademyVR />
        ) : (
          <Game />
        )}
      </div>

      {/* Mobile Controls */}
      {isMobile && gameState === 'playing' && <MobileControls />}
      
      {/* Trophy Notification */}
      <AnimatePresence>
        {trophyNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="absolute top-24 right-4 z-50 bg-black/80 border-2 border-amber-400 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] backdrop-blur-md"
          >
            <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              <Trophy size={24} />
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Trophy Unlocked!</div>
              <div className="text-white font-black text-lg uppercase leading-none">{trophyNotification.name}</div>
              <div className="text-white/60 text-[10px] uppercase font-bold mt-1">{trophyNotification.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rotation Warning for Mobile */}
      {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.innerWidth < window.innerHeight && gameState === 'playing' && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="mb-6 text-amber-400"
          >
            <RotateCcw size={64} />
          </motion.div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Rotate Your Device</h2>
          <p className="text-white/60 text-sm uppercase tracking-wider">Please rotate your phone to landscape mode to play.</p>
        </div>
      )}

      {/* Voice Chat Manager */}
      <VoiceChat />

      {/* Communication Controls (Center Top) */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex gap-3">
          <button 
            onClick={() => toggleMute()}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all backdrop-blur-md ${
              isMuted 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {isMuted ? 'Muted' : 'Speaking'}
            </span>
          </button>

          <button 
            onClick={() => useGameStore.getState().setFaceCamEnabled(!useGameStore.getState().faceCamEnabled)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all backdrop-blur-md ${
              !useGameStore.getState().faceCamEnabled 
                ? 'bg-zinc-900 border-white/10 text-white/30' 
                : 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            }`}
          >
            {useGameStore.getState().faceCamEnabled ? <Camera size={18} /> : <CameraOff size={18} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {useGameStore.getState().faceCamEnabled ? 'Cam On' : 'Cam Off'}
            </span>
          </button>
        </div>
      )}

      {/* UI Overlay */}
      {(gameState === 'playing' || gameState === 'open_world') && (
        <>
          <ActivePowerUpsHUD />
          <WorldEventHUD />
          <BillionFeaturesBanner />
          {gameState === 'open_world' && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={14} className="animate-spin-slow" />
                Open World Mode Alpha // No Restrictions
              </span>
            </div>
          )}
          {/* Chat Toggle Button */}
          <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-auto">
            <button 
              onClick={() => setChatOpen(!isChatOpen)}
              className={`p-3 rounded-xl border transition-all ${isChatOpen ? 'bg-amber-400 border-amber-400 text-black' : 'bg-black/40 border-white/10 text-white hover:border-amber-400'}`}
            >
              <MessageSquare size={20} />
            </button>
            {!isChatOpen && (
              <div className="bg-black/60 px-3 py-1 rounded-lg border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                Press Enter to Chat
              </div>
            )}
          </div>
          
          {/* Build Mode Camera 3D Scanner Button (Top Left) */}
          {isBuildMode && (
            <div className="absolute top-20 left-4 z-[90] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pointer-events-auto">
              <button 
                onClick={() => setShowScanner(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-[10px] hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.45)] transition-all cursor-pointer"
              >
                <Camera size={14} />
                <span>3D CAMERA SCANNER</span>
              </button>

              <button 
                onClick={triggerInstantCopy}
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-[10px] hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.55)] transition-all cursor-pointer animate-pulse"
              >
                <Layers size={14} />
                <span>3D COPY THE WORLD TO MAP</span>
              </button>
            </div>
          )}
          <HUD />
          <WeatherOverlay />
          <AIBuilderInput />
          <InfectionMode />
          <KillstreakHUD />
          <ArenaEvents />
          <TimeWarpOverlay />
          <VisualFeedback />
          <FaceCam />
          <FeaturesController />
        </>
      )}

      {/* Modals & Overlays */}
      <AnimatePresence>
        {isDonateModalOpen && <DonateModal />}
        {modals.account && <AccountManagement onClose={() => setModal('account', false)} />}
        {modals.casino && <Casino onClose={() => setModal('casino', false)} />}
        {modals.tasks && <TaskModal onClose={() => setModal('tasks', false)} />}
        {modals.friends && <FriendModal onClose={() => setModal('friends', false)} />}
        {modals.clans && <ClanModal onClose={() => setModal('clans', false)} />}
        {modals.vehicles && <VehicleMenu onClose={() => setModal('vehicles', false)} />}
        {modals.update && <BiggestUpdateModal onClose={() => setModal('update', false)} />}
        {showExperimental && <ExperimentalFeatures onClose={() => setShowExperimental(false)} />}
        {showQuests && <QuestModal onClose={() => setShowQuests(false)} />}
        {showTactical && <TacticalMap onClose={() => setShowTactical(false)} />}
        {showScanner && <ThreeDScanner onClose={() => setShowScanner(false)} />}
        {showDossier && <DossierModal onClose={() => setShowDossier(false)} />}
        {gameState === 'server_browser' && <ServerBrowser onClose={() => setGameState('lobby')} />}

        {/* 3D LiDAR World Copier Laser Scanning Screen Overlay */}
        {isInstantCopying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[203] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto font-mono text-white p-6"
          >
            {/* Cyber laser scan boundaries */}
            <div className="absolute top-6 left-6 border-t-2 border-l-2 border-amber-500 w-12 h-12" />
            <div className="absolute top-6 right-6 border-t-2 border-r-2 border-amber-500 w-12 h-12" />
            <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-amber-500 w-12 h-12" />
            <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-amber-500 w-12 h-12" />

            {/* Sweep laser line animation */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_30px_rgba(242,152,11,1)] animate-bounce-slow" />

            <div className="flex flex-col items-center justify-center max-w-md w-full text-center gap-6">
              <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-full animate-pulse text-amber-500">
                <Camera size={44} className="animate-spin-slow text-amber-400" />
              </div>

              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase">
                  LiDAR MATRIX SCANNER v9.8
                </span>
                <h3 className="text-2xl mt-4 font-black italic tracking-tight text-white uppercase">
                  3D COPYING SURROUNDING WORLD
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/5 border border-white/10 rounded-full p-1 overflow-hidden h-6 relative flex items-center justify-center">
                <motion.div 
                  className="absolute left-0 inset-y-0 bg-gradient-to-r from-amber-400 to-orange-500" 
                  style={{ width: `${instantCopyProgress}%` }}
                />
                <span className="text-[10px] font-black z-10 text-white drop-shadow">
                  MAPPING VOXELS: {instantCopyProgress}%
                </span>
              </div>

              {/* System readout files */}
              <div className="text-[10px] text-zinc-400 bg-black/40 border border-white/5 p-4 rounded-xl text-left w-full space-y-1 font-mono uppercase">
                <div className="text-amber-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  LiDAR APERTURE: LOCK
                </div>
                <div>OCTREE EXPANSION: ACTIVE</div>
                <div>MESH DECIMATOR: 80% TOPOLOGY TARGET</div>
                <div>TEXTURE MATRICES: PACKING OBJ+MTL</div>
                <div>MAP SEED INJECTION: RANDOM SIMPLEX REALM</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {(gameState === 'playing' || gameState === 'open_world') && <ReplayControls />}
      {(gameState === 'playing' || gameState === 'open_world') && useGameStore.getState().currentVehicleId && <VehicleHUD />}

      {/* Splash Screen */}
      {gameState === 'splash' && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[200] pointer-events-auto overflow-hidden">
          {/* Background Ambient Effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center gap-16 z-10"
          >
            <div className="text-center relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute -top-8 left-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
              <h1 className="text-9xl font-black text-white italic tracking-tighter uppercase leading-none mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                NEON<br />ARENA
              </h1>
              <div className="text-blue-400 font-black text-sm uppercase tracking-[1em] opacity-50 ml-4">
                Version 1.5.0 // OMNI-REACH
              </div>
            </div>

            <div className="flex flex-col gap-4 w-72">
              <button 
                onClick={enterLobby}
                className="group relative w-full px-8 py-6 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
              >
                <div className="absolute inset-x-0 -bottom-px h-1 bg-blue-400 rounded-full opacity-50 group-hover:opacity-100" />
                Enter Arena
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setModal('account', true)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <UserIcon size={12} /> Account
                </button>
                <button 
                  onClick={() => setDonateModalOpen(true)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Heart size={12} /> Support
                </button>
              </div>

              {!musicEnabled && (
                <button
                  onClick={handleSelectKey}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={10} /> Enable Adaptive Audio
                </button>
              )}
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-8 text-[8px] text-white/20 font-black uppercase tracking-widest">
            © 2026 Edge Dimension Systems // V.I.J.O Logic Engaged
          </div>
        </div>
      )}
      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <>
          {showMvpAnnouncement && leaderboard.length > 0 && (
            <MVPAnnouncementOverlay 
              mvp={leaderboard[0]} 
              onClose={() => {
                setShowMvpAnnouncement(false);
                soundService.playSFX('ui_click');
              }} 
            />
          )}
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[110] pointer-events-auto backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-950 border border-amber-500/30 p-16 rounded-[4rem] w-full max-w-4xl flex flex-col items-center shadow-[0_0_200px_rgba(245,158,11,0.2)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
            
            <h2 className="text-8xl font-black text-white italic tracking-tighter leading-none mb-4 text-center">MISSION COMPLETE</h2>
            <div className="text-amber-400 font-black text-xl uppercase tracking-[0.5em] mb-12 opacity-50">Combat Operations Concluded</div>

            <div className="grid grid-cols-4 gap-8 w-full mb-16">
              <div className="flex flex-col items-center">
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Total Score</div>
                <div className="text-6xl font-black text-white italic">{score}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Combat Kills</div>
                <div className="text-6xl font-black text-amber-400 italic">{kills}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Casualties</div>
                <div className="text-6xl font-black text-red-500 italic">{deaths}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Accuracy</div>
                <div className="text-6xl font-black text-blue-400 italic">74%</div>
              </div>
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6 text-center">Performance Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white/60 uppercase">Headshot Ratio</span>
                  <span className="text-sm font-black text-amber-400">24%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white/60 uppercase">Damage Dealt</span>
                  <span className="text-sm font-black text-amber-400">12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white/60 uppercase">XP Earned</span>
                  <span className="text-sm font-black text-blue-400">+2,400 XP</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="flex gap-6 w-full relative">
              <button
                onClick={() => { useGameStore.setState({ gameState: 'menu' }); soundService.playSFX('ui_click'); }}
                className="absolute -top-12 -right-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
              <button
                onClick={() => { useGameStore.setState({ gameState: 'lobby' }); soundService.playSFX('ui_click'); }}
                className="flex-1 py-8 bg-amber-400 text-black font-black text-3xl rounded-[2.5rem] hover:bg-white transition-all shadow-[0_0_50px_rgba(245,158,11,0.3)] uppercase tracking-tighter italic"
              >
                Return to Lobby
              </button>
              <button
                onClick={() => { useGameStore.setState({ gameState: 'menu' }); soundService.playSFX('ui_click'); }}
                className="px-12 py-8 bg-white/5 border border-white/10 text-white/50 font-black rounded-[2.5rem] hover:bg-white hover:text-black transition-all uppercase tracking-widest text-sm"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        </div>
        </>
      )}

      {/* Lobby System */}
      {gameState === 'lobby' && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] pointer-events-auto backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-950 border border-white/10 p-12 rounded-[3.5rem] w-full max-w-3xl flex flex-col shadow-[0_0_150px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-2">LOBBY</h2>
                <div className="flex gap-4 items-center">
                  <div className="h-1 w-24 bg-amber-400" />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Waiting for combatants</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <button
                  onClick={() => setDonateModalOpen(true)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white/40 hover:text-red-400 hover:border-red-400/50 transition-all group"
                >
                  <Heart size={14} className="group-hover:fill-red-400 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Donate</span>
                </button>
                <button
                  onClick={() => setShowQuests(true)}
                  className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-2 rounded-xl text-amber-400 hover:bg-amber-400 hover:text-black transition-all group"
                >
                  <Trophy size={14} className="group-hover:scale-110 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Quests</span>
                </button>
                <button
                  onClick={() => setShowExperimental(true)}
                  className="flex items-center gap-2 bg-magenta-500/10 border border-magenta-500/30 px-4 py-2 rounded-xl text-magenta-400 hover:bg-magenta-500 hover:text-white transition-all group"
                >
                  <FlaskConical size={14} className="group-hover:rotate-12 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Evolution</span>
                </button>
                <button
                  onClick={() => setShowTactical(true)}
                  className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-xl text-blue-400 hover:bg-blue-500 hover:text-white transition-all group"
                >
                  <MapIcon size={14} className="group-hover:scale-110 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Intel</span>
                </button>
                <button
                  onClick={() => setShowDossier(true)}
                  className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-2 rounded-xl text-amber-400 hover:bg-amber-400 hover:text-black transition-all group cursor-pointer"
                >
                  <Terminal size={14} className="group-hover:-translate-y-0.5 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Aurum GDD</span>
                </button>
                <button
                  onClick={() => useGameStore.setState({ gameState: 'server_browser' })}
                  className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all group"
                >
                  <Globe size={14} className="group-hover:rotate-12 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Servers</span>
                </button>
                <button
                  onClick={() => setModal('account', true)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white/40 hover:text-amber-400 hover:border-amber-400/50 transition-all group"
                >
                  <Settings size={14} className="group-hover:rotate-90 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                </button>
                <div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Region</div>
                  <div className="text-amber-400 font-black uppercase italic">{useGameStore.getState().selectedRegion}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              {['Assault', 'Scout', 'Tank', 'Support'].map(cls => (
                <button
                  key={cls}
                  onClick={() => useGameStore.setState({ playerClass: cls as any })}
                  className={`flex-1 py-3 rounded-2xl border-2 font-black text-xs tracking-widest transition-all ${
                    useGameStore.getState().playerClass === cls 
                      ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/30 hover:border-white/30'
                  }`}
                >
                  {cls.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto mb-12 space-y-6 pr-4 custom-scrollbar max-h-[50vh]">
              <div className="space-y-3">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">OPERATORS IN LOBBY</div>
                {lobbyPlayers.map(player => (
                  <motion.div 
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 p-5 rounded-3xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl rotate-45 flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all">
                          <div className="w-full h-full -rotate-45 scale-150" style={{ backgroundColor: player.color }} />
                        </div>
                        {player.isReady && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                            <Check size={8} className="text-black" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tight">{player.name}</span>
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Tactical Operator</div>
                      </div>
                    </div>
                    <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      player.isReady 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                        : 'bg-white/5 border-white/10 text-white/20'
                    }`}>
                      {player.isReady ? 'Ready' : 'Waiting'}
                    </div>
                  </motion.div>
                ))}
              </div>

              <MapVotingPanel />
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => toggleReady()}
                className={`flex-1 group relative overflow-hidden py-8 rounded-[2rem] font-black text-3xl uppercase tracking-tighter italic transition-all duration-500 ${
                  isReady 
                    ? 'bg-emerald-500 text-black shadow-[0_0_50px_rgba(16,185,129,0.4)]' 
                    : 'bg-amber-400 text-black shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:bg-white'
                }`}
              >
                <span className="relative z-10">{isReady ? 'CANCEL READY' : 'READY FOR DEPLOYMENT'}</span>
                {!isReady && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
              </button>
              <button
                onClick={() => leaveGame()}
                className="px-12 py-8 bg-white/5 border border-white/10 text-white/40 font-black rounded-[2rem] hover:bg-red-500 hover:text-black hover:border-red-500 transition-all uppercase tracking-widest text-sm"
              >
                Abort
              </button>
            </div>

            {lobbyPlayers.length > 0 && socket && lobbyPlayers[0].id === socket.id && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={() => {
                    if (lobbyPlayers.every(p => p.isReady)) {
                      socket.emit('startGameRequest');
                    } else {
                      // Maybe a toast instead of alert
                      console.log('All players must be ready');
                    }
                  }}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-xl uppercase tracking-[0.2em] italic transition-all duration-300 ${
                    lobbyPlayers.every(p => p.isReady)
                      ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {lobbyPlayers.every(p => p.isReady) ? 'LAUNCH MISSION' : 'AWAITING READINESS...'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Menus */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-start z-10 pointer-events-auto overflow-y-auto py-12 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-6xl w-full px-6 pb-24"
          >
            <div className="flex justify-between items-start w-full mb-8">
              <div>
                <h1 className="text-7xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)] tracking-tighter italic">
                  {gameName.split(' ')[0]} LOBBY
                </h1>
                <div className="h-1 w-32 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              </div>
              
              <div className="flex flex-col items-end gap-4">
                {user ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                      <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-amber-400/50" />
                      <div className="text-right">
                        <div className="text-xs font-black text-white uppercase">{user.displayName}</div>
                        <button onClick={logout} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1">
                          <LogOut size={10} /> Logout
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-xl">
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Gamertag</span>
                      <input 
                        type="text" 
                        value={gamertag}
                        onChange={(e) => setGamertag(e.target.value || 'Player')}
                        className="bg-transparent text-amber-400 font-black text-right outline-none border-b border-transparent focus:border-amber-400/50 transition-all w-32"
                      />
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

            {/* Global Leaderboard */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 bg-zinc-950/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">GLOBAL RANKINGS</h3>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Season 1: Neon Dawn</div>
                </div>
                <div className="space-y-2">
                  {useGameStore.getState().leaderboard.map((player, i) => (
                    <div key={player.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-black italic ${i < 3 ? 'text-amber-400' : 'text-white/20'}`}>#{i + 1}</span>
                        <span className="text-lg font-black text-white uppercase italic">{player.id}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Score</div>
                          <div className="text-xl font-black text-amber-400 italic">{player.score}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Rank</div>
                          <div className="text-xl font-black text-blue-400 italic">Diamond</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-amber-400 p-8 rounded-[2.5rem] text-black shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                  <h3 className="text-xl font-black italic tracking-tighter mb-4">YOUR STANDING</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-black italic">#1,452</span>
                    <span className="text-xs font-bold uppercase opacity-50">Global</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-black" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-black uppercase">
                    <span>Gold III</span>
                    <span>Platinum I</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <h3 className="text-xl font-black text-white italic tracking-tighter mb-4">MATCH HISTORY</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <div className="text-[10px] font-black text-white uppercase italic">Victory • FFA</div>
                          <div className="text-[8px] font-bold text-white/30 uppercase">2 hours ago</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-400 italic">+25 RP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Update System / System Control */}
            {((persistentStats?.totalScore || 0) >= 400 || isAdmin) ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-amber-400/10 border border-amber-400/30 rounded-2xl p-6 mb-8 backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-400 rounded-lg">
                      <Cpu size={20} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-amber-400 font-black uppercase tracking-widest">System Control</h3>
                      <p className="text-amber-400/50 text-[10px] font-bold uppercase">Authorized Access: {isAdmin ? 'ADMIN' : 'CONTRIBUTOR'}</p>
                    </div>
                  </div>
                      {!isAdmin && (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            placeholder="456"
                            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-amber-400 outline-none focus:border-amber-400/50"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                checkAdminPassword((e.target as HTMLInputElement).value);
                              }
                            }}
                          />
                        </div>
                      )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <h4 className="text-white font-black text-xs uppercase mb-2">Recommend Update</h4>
                      <div className="flex gap-2">
                        <input 
                          id="recommend-input"
                          type="text" 
                          placeholder="Describe update..."
                          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-400/50"
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById('recommend-input') as HTMLInputElement;
                            if (input.value) {
                              recommendUpdate(input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-amber-400 text-black font-black text-[10px] px-4 rounded uppercase hover:bg-white transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <h4 className="text-white font-black text-xs uppercase mb-2">Direct System Update</h4>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input 
                              id="update-name"
                              type="text" 
                              placeholder="New Game Name"
                              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-400/50"
                            />
                            <button 
                              onClick={() => {
                                const input = document.getElementById('update-name') as HTMLInputElement;
                                if (input.value) updateGameBranding(input.value, gameLogo);
                              }}
                              className="bg-blue-500 text-white font-black text-[10px] px-4 rounded uppercase"
                            >
                              Update
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              id="update-logo"
                              type="text" 
                              placeholder="New Version/Logo"
                              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-400/50"
                            />
                            <button 
                              onClick={() => {
                                const input = document.getElementById('update-logo') as HTMLInputElement;
                                if (input.value) updateGameBranding(gameName, input.value);
                              }}
                              className="bg-blue-500 text-white font-black text-[10px] px-4 rounded uppercase"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 max-h-[200px] overflow-y-auto">
                    <h4 className="text-white font-black text-xs uppercase mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {updateRecommendations.length === 0 ? (
                        <p className="text-white/20 text-[10px] italic">No active recommendations</p>
                      ) : (
                        updateRecommendations.map(rec => (
                          <div key={rec.id} className="bg-white/5 p-2 rounded border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-white text-[10px] font-bold">{rec.text}</p>
                              <p className="text-white/40 text-[8px] uppercase">By {rec.sender} • {rec.status}</p>
                            </div>
                            {isAdmin && rec.status === 'pending' && (
                              <div className="flex gap-1">
                                <button onClick={() => approveUpdate(rec.id)} className="p-1 text-green-400 hover:bg-green-400/20 rounded"><Check size={12} /></button>
                                <button onClick={() => rejectUpdate(rec.id)} className="p-1 text-red-400 hover:bg-red-400/20 rounded"><X size={12} /></button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Cpu size={20} className="text-white/20" />
                  <h3 className="text-white/40 font-black uppercase tracking-widest">System Control Locked</h3>
                </div>
                <p className="text-white/20 text-[10px] font-bold uppercase">
                  Reach 400 Total Score to unlock AI Update Submissions
                  <span className="block text-amber-400/40 mt-1">Current Score: {persistentStats?.totalScore || 0} / 400</span>
                </p>
                <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400/20" 
                    style={{ width: `${Math.min(100, ((persistentStats?.totalScore || 0) / 400) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lobby Tabs */}
            <div className="flex gap-4 mb-8 w-full">
              {['play', 'settings', 'replays', 'lore', 'spells'].map((tab) => (
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
              <button 
                onClick={() => setModal('casino', true)}
                className="bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
              >
                CASINO
              </button>
              <button 
                onClick={() => setModal('update', true)}
                className="bg-blue-500/10 text-blue-400 border-2 border-blue-500/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all animate-pulse"
              >
                UPDATE V1.5
              </button>
            </div>

            {lobbyTab === 'play' && (
              <div className="flex flex-col gap-12 w-full">
                {/* Class Selection */}
                <div className="flex flex-col items-center gap-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">Select Your Class</h3>
                  <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                    {[
                      { id: 'mage', name: 'Mage', icon: <Zap size={24} />, color: '#8b5cf6', desc: 'High Jump • Standard Speed' },
                      { id: 'spellblade', name: 'Spellblade', icon: <Sword size={24} />, color: '#ef4444', desc: 'Standard Jump • High Speed' },
                      { id: 'alchemist', name: 'Alchemist', icon: <FlaskConical size={24} />, color: '#10b981', desc: 'Balanced Stats' }
                    ].map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setPlayerClass(cls.id as any)}
                        className={`group relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                          playerClass === cls.id 
                            ? 'bg-white/10 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}
                          style={{ backgroundColor: `${cls.color}20`, color: cls.color }}
                        >
                          {cls.icon}
                        </div>
                        <span className={`text-xl font-black uppercase italic tracking-tighter mb-1 ${playerClass === cls.id ? 'text-white' : 'text-white/40'}`}>
                          {cls.name}
                        </span>
                        <span className="text-[8px] font-bold text-white/20 uppercase text-center leading-tight">
                          {cls.desc}
                        </span>
                        {playerClass === cls.id && (
                          <motion.div 
                            layoutId="class-active"
                            className="absolute -bottom-2 w-8 h-1 bg-white rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Play Button - Massive and Centered */}
                <div className="flex flex-col items-center gap-6 py-8 border-y border-white/5">
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      onClick={() => setRanked(false)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isRanked ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      Casual
                    </button>
                    <button
                      onClick={() => setRanked(true)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isRanked ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      Ranked
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={startGame}
                      className="group relative px-20 py-8 bg-amber-400 text-black text-4xl font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(245,158,11,0.4)]"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
                      {isRanked ? 'DEPLOY TO RANKED' : 'DEPLOY TO ARENA'}
                    </button>
                    <button
                      onClick={() => useGameStore.getState().joinOpenWorld()}
                      className="group relative px-12 py-8 bg-blue-600 text-white text-2xl font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-400/50"
                    >
                      <div className="flex flex-col items-center">
                        <Globe size={24} className="mb-2 group-hover:rotate-12 transition-all" />
                        <span className="text-xl">OPEN WORLD</span>
                      </div>
                    </button>
                  </div>
                  <div className="flex gap-8 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                    <span>Multiplayer Active</span>
                    <span>•</span>
                    <span>System Optimized</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
                  {/* Left Column: Stats & Profile */}
                  <div className="flex flex-col gap-8">
                    {/* Level & Rank Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] text-indigo-300 uppercase font-black tracking-[0.2em] mb-2">Current Level</div>
                        <div className="text-5xl font-black text-white mb-2">{level}</div>
                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(xp / (level * 1000)) * 100}%` }}
                            className="h-full bg-indigo-400"
                          />
                        </div>
                        <div className="text-[8px] text-white/40 mt-2 uppercase font-bold">{xp} / {level * 1000} XP</div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] text-amber-300 uppercase font-black tracking-[0.2em] mb-2">Ranked Status</div>
                        <div className="text-3xl font-black text-white uppercase mb-1">{rank}</div>
                        <div className="text-[10px] text-amber-400/60 font-bold uppercase mb-3">{rankPoints} RP</div>
                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${rankPoints}%` }}
                            className="h-full bg-amber-400"
                          />
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] text-emerald-300 uppercase font-black tracking-[0.2em] mb-2">Arena Credits</div>
                        <div className="text-4xl font-black text-white mb-1 flex items-center gap-2">
                          <Coins size={24} className="text-emerald-400" />
                          {credits}
                        </div>
                        <div className="text-[8px] text-emerald-400/60 font-bold uppercase mt-2 tracking-widest">Available Balance</div>
                      </div>
                    </div>

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
                  <h2 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                    <Trophy size={20} /> TROPHIES & ACHIEVEMENTS
                  </h2>
                  <div className="grid grid-cols-4 gap-2">
                    {useGameStore.getState().unlockedTrophies.length > 0 ? (
                      useGameStore.getState().unlockedTrophies.map(trophy => (
                        <div key={trophy.id} className="group relative">
                          <div className="bg-amber-400/20 p-3 rounded-xl border border-amber-400/30 flex items-center justify-center hover:bg-amber-400/40 transition-all cursor-help">
                            <Trophy size={24} className="text-amber-400" />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-black border border-white/10 rounded-lg text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="font-black text-amber-400 uppercase mb-1">{trophy.name}</div>
                            <div className="text-white/60">{trophy.description}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 text-center py-4 text-[10px] text-white/20 uppercase font-black italic">
                        No trophies unlocked yet
                      </div>
                    )}
                  </div>
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
                        onBlur={(e) => {
                          if (!e.target.value.trim()) setGamertag('Player');
                        }}
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
                        {(['neon', 'gold', 'stealth', 'glitch', 'ruby', 'emerald', 'diamond', 'void', 'steve', 'alex', 'vijo_pro'] as const).map(skin => (
                          <button
                            key={skin}
                            onClick={() => setSkin(skin)}
                            className={`px-2 py-2 text-[8px] font-black border-2 rounded-lg transition-all ${
                              selectedSkin === skin 
                                ? 'bg-amber-400 text-black border-amber-400' 
                                : skin === 'vijo_pro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500 hover:text-black' : 'bg-transparent text-amber-400/60 border-amber-900/30 hover:border-amber-400/50'
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
                      <div className="text-[10px] text-blue-400/50 uppercase font-bold mb-2 tracking-widest flex justify-between">
                        <span>Selected Arena</span>
                        <span className="text-[9px] text-emerald-400 font-mono font-bold">Optimized 60fps</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['maze', 'arena', 'pillars', 'flat', 'void', 'cybercity', 'volcano', 'neon_grid', 'quantum_rift', 'infinite', 'custom_scan', 'aurum_dominion', 'infinity_academy'] as const).map(map => (
                          <button
                            key={map}
                            onClick={() => setMap(map)}
                            className={`px-3 py-2 text-[10px] font-bold border rounded-xl transition-all duration-300 text-left flex flex-col justify-between items-start gap-1 cursor-pointer ${
                              selectedMap === map 
                                ? (map === 'aurum_dominion' 
                                  ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.45)]' 
                                  : map === 'infinity_academy'
                                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.45)]'
                                  : 'bg-blue-500 text-black border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.35)]')
                                : 'bg-white/5 text-blue-300/80 border-white/5 hover:border-blue-400/45 hover:bg-blue-950/20'
                            }`}
                          >
                            <span className="truncate w-full uppercase tracking-wider">{map.replace('_', ' ')}</span>
                            <span className={`text-[8px] px-1 font-mono rounded ${
                              selectedMap === map ? 'bg-black/20 text-white font-semibold' : 'text-blue-400/60 bg-blue-500/5'
                            }`}>
                              {map === 'neon_grid' || map === 'quantum_rift' ? 'NEW • CORE' : 
                               map === 'custom_scan' ? '3D COPIED' : 
                               map === 'infinite' ? 'MASSIVE' : 
                               map === 'void' ? 'SPACE' : 
                               map === 'infinity_academy' ? 'VR ACADEMY' :
                               map === 'aurum_dominion' ? 'GOLD GDD' : 'STABLE'}
                            </span>
                          </button>
                        ))}
                      </div>
                      
                      {selectedMap === 'aurum_dominion' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={10} /> PROCEDURAL REVOLUTION
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400">Seed: RANDOMIZED</span>
                          </div>
                          <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
                            Every single arena load generates dynamic vertical structures, floating gold bridges, and vaults. Completely different layout every match.
                          </p>
                          <button
                            onClick={() => setShowDossier(true)}
                            className="text-[9px] font-black uppercase tracking-wider text-amber-200 hover:text-amber-400 text-left underline cursor-pointer"
                          >
                            Open Complete Copyable GDD file (5k words)
                          </button>
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-blue-400/50 uppercase font-bold mb-2 tracking-widest">Game Mode</div>
                      <div className="grid grid-cols-1 gap-2">
                        {(['ffa', 'tdm', 'ctf', 'koth', 'domination', 'creative'] as const).map(mode => (
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
                              {mode === 'koth' && 'KING OF THE HILL'}
                              {mode === 'domination' && 'DOMINATION'}
                              {mode === 'creative' && 'CREATIVE BUILD'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-amber-400/50 uppercase font-bold mb-2 tracking-widest">Player Class</div>
                      <div className="grid grid-cols-1 gap-2">
                        {(['mage', 'spellblade', 'alchemist'] as const).map(cls => (
                          <button
                            key={cls}
                            onClick={() => useGameStore.getState().setPlayerClass(cls)}
                            className={`px-4 py-2 text-xs font-bold border-2 rounded-xl transition-all duration-300 text-left flex flex-col ${
                              useGameStore.getState().playerClass === cls 
                                ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_200px_rgba(245,158,11,0.2)]' 
                                : 'bg-transparent text-amber-400/60 border-amber-900/30 hover:border-amber-400/50'
                            }`}
                          >
                            <span className="font-black">{cls.toUpperCase()}</span>
                            <span className="text-[8px] opacity-60">
                              {cls === 'mage' && 'High Mana, Ranged Spells'}
                              {cls === 'spellblade' && 'Balanced, Melee & Spells'}
                              {cls === 'alchemist' && 'Support, Gadgets & Potions'}
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

                    <button
                      onClick={() => setShowScanner(true)}
                      className="w-full py-3 bg-sky-500/10 hover:bg-sky-500 hover:text-black border border-sky-500/30 text-sky-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera size={14} />
                      Open 3D Scanner Studio
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
                          <div key={f.uid} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                            <span className="text-emerald-400 text-xs font-bold">{f.gamertag}</span>
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded">ONLINE</span>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const name = prompt('Enter friend gamertag:');
                        if (name) useGameStore.getState().addFriend({ uid: name, gamertag: name } as any);
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
          </div>
        )}

            {lobbyTab === 'settings' && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <h2 className="text-3xl font-black text-amber-400 mb-8 italic tracking-tighter">GAMEPLAY SETTINGS</h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Jump Height</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="0.5" max="5" step="0.1" 
                          value={useGameStore.getState().jumpHeight}
                          onChange={(e) => useGameStore.getState().setJumpHeight(parseFloat(e.target.value))}
                          className="flex-1 accent-amber-400"
                        />
                        <input 
                          type="number" step="0.1"
                          value={useGameStore.getState().jumpHeight}
                          onChange={(e) => useGameStore.getState().setJumpHeight(parseFloat(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-amber-400 font-bold text-right outline-none focus:border-amber-400"
                        />
                        <span className="text-amber-400 font-bold">m</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Gravity</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="30" step="0.1" 
                          value={useGameStore.getState().gravity}
                          onChange={(e) => useGameStore.getState().setGravity(parseFloat(e.target.value))}
                          className="flex-1 accent-amber-400"
                        />
                        <input 
                          type="number" step="0.1"
                          value={useGameStore.getState().gravity}
                          onChange={(e) => useGameStore.getState().setGravity(parseFloat(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-amber-400 font-bold text-right outline-none focus:border-amber-400"
                        />
                        <span className="text-amber-400 font-bold">m/s²</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Mouse Sensitivity</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="0.1" max="5" step="0.1" 
                          value={useGameStore.getState().mouseSensitivity}
                          onChange={(e) => useGameStore.getState().setMouseSensitivity(parseFloat(e.target.value))}
                          className="flex-1 accent-amber-400"
                        />
                        <input 
                          type="number" step="0.1"
                          value={useGameStore.getState().mouseSensitivity}
                          onChange={(e) => useGameStore.getState().setMouseSensitivity(parseFloat(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-amber-400 font-bold text-right outline-none focus:border-amber-400"
                        />
                        <span className="text-amber-400 font-bold">x</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Field of View (FOV)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="60" max="120" step="1" 
                          value={useGameStore.getState().fov}
                          onChange={(e) => useGameStore.getState().setFov(parseInt(e.target.value))}
                          className="flex-1 accent-amber-400"
                        />
                        <input 
                          type="number" step="1"
                          value={useGameStore.getState().fov}
                          onChange={(e) => useGameStore.getState().setFov(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-amber-400 font-bold text-right outline-none focus:border-amber-400"
                        />
                        <span className="text-amber-400 font-bold">°</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Strategy</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['aggressive', 'defensive', 'balanced', 'tactical'].map(s => (
                          <button
                            key={s}
                            onClick={() => useGameStore.getState().setBotStrategy(s as any)}
                            className={`py-2 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${
                              useGameStore.getState().botStrategy === s 
                                ? 'bg-blue-400 text-black border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]' 
                                : 'bg-white/5 text-blue-400/40 border-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div>
                        <div className="text-xs font-black text-white uppercase">Auto Rotation</div>
                        <div className="text-[10px] text-white/40">Align camera to movement</div>
                      </div>
                      <button 
                        onClick={() => useGameStore.getState().setAutoRotation(!useGameStore.getState().autoRotation)}
                        className={`w-12 h-6 rounded-full transition-all relative ${useGameStore.getState().autoRotation ? 'bg-amber-400' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useGameStore.getState().autoRotation ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <h2 className="text-3xl font-black text-blue-400 mb-8 italic tracking-tighter">BOT CONFIGURATION</h2>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Count</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="0" max="20" step="1" 
                          value={useGameStore.getState().botCount}
                          onChange={(e) => useGameStore.getState().setBotCount(parseInt(e.target.value))}
                          className="flex-1 accent-blue-400"
                        />
                        <input 
                          type="number" step="1"
                          value={useGameStore.getState().botCount}
                          onChange={(e) => useGameStore.getState().setBotCount(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-blue-400 font-bold text-right outline-none focus:border-blue-400"
                        />
                      </div>
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
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Power Level</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="10" step="1" 
                          value={useGameStore.getState().botPower}
                          onChange={(e) => useGameStore.getState().setBotPower(parseInt(e.target.value))}
                          className="flex-1 accent-blue-400"
                        />
                        <input 
                          type="number" step="1"
                          value={useGameStore.getState().botPower}
                          onChange={(e) => useGameStore.getState().setBotPower(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-blue-400 font-bold text-right outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Aggression</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="10" step="1" 
                          value={useGameStore.getState().botAggression}
                          onChange={(e) => useGameStore.getState().setBotAggression(parseInt(e.target.value))}
                          className="flex-1 accent-blue-400"
                        />
                        <input 
                          type="number" step="1"
                          value={useGameStore.getState().botAggression}
                          onChange={(e) => useGameStore.getState().setBotAggression(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-blue-400 font-bold text-right outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Accuracy</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="1" max="10" step="1" 
                          value={useGameStore.getState().botAccuracy}
                          onChange={(e) => useGameStore.getState().setBotAccuracy(parseInt(e.target.value))}
                          className="flex-1 accent-blue-400"
                        />
                        <input 
                          type="number" step="1"
                          value={useGameStore.getState().botAccuracy}
                          onChange={(e) => useGameStore.getState().setBotAccuracy(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-blue-400 font-bold text-right outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest mb-2 block">Bot Reaction Time (ms)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="100" max="2000" step="50" 
                          value={useGameStore.getState().botReactionTime}
                          onChange={(e) => useGameStore.getState().setBotReactionTime(parseInt(e.target.value))}
                          className="flex-1 accent-blue-400"
                        />
                        <input 
                          type="number" step="50"
                          value={useGameStore.getState().botReactionTime}
                          onChange={(e) => useGameStore.getState().setBotReactionTime(parseInt(e.target.value))}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-blue-400 font-bold text-right outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Map Persistence</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            useGameStore.getState().saveMap();
                            alert('Map saved to cloud for this private server!');
                          }}
                          className="py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                        >
                          SAVE MAP
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Clear ALL blocks on this map?')) {
                              useGameStore.getState().clearMap();
                              alert('Map cleared!');
                            }
                          }}
                          className="py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                        >
                          CLEAR MAP
                        </button>
                      </div>
                      <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-[10px] text-white/30 uppercase font-black mb-2">Share Server Name</div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/60 truncate">
                            {privateServerName || 'N/A'}
                          </div>
                          <button 
                            onClick={() => {
                              if (privateServerName) {
                                navigator.clipboard.writeText(privateServerName);
                                alert('Server name copied!');
                              }
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Copy
                          </button>
                        </div>
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

                {/* AI SYSTEM & ADMIN PANEL */}
                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md col-span-1 md:col-span-2">
                  <h2 className="text-3xl font-black text-amber-400 mb-8 italic tracking-tighter">AI SYSTEM & CORE ACCESS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* AI Recommendations */}
                    <div className="flex flex-col gap-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest">AI Update Recommendations</h3>
                      <p className="text-[10px] text-white/40 uppercase font-bold">
                        Players with 400+ points can recommend updates to the Main AI.
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text"
                          id="update-rec-input"
                          placeholder={score >= 400 || isAdmin ? "Describe your update..." : "Need 400 points to unlock..."}
                          disabled={score < 400 && !isAdmin}
                          className="bg-black/50 border border-amber-400/30 rounded-xl px-4 py-3 text-amber-400 font-bold focus:outline-none focus:border-amber-400 disabled:opacity-30"
                        />
                        <button
                          disabled={score < 400 && !isAdmin}
                          onClick={() => {
                            const input = document.getElementById('update-rec-input') as HTMLInputElement;
                            if (input.value.trim()) {
                              recommendUpdate(input.value);
                              input.value = '';
                            }
                          }}
                          className="py-3 bg-amber-400 text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-30"
                        >
                          Submit to AI
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {updateRecommendations.map(rec => (
                          <div key={rec.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                            <div>
                              <div className="text-[10px] text-white/60 font-black uppercase">{rec.sender}</div>
                              <div className="text-xs text-white/90">{rec.text}</div>
                            </div>
                            <div className={`text-[8px] font-black px-2 py-1 rounded uppercase ${
                              rec.status === 'approved' ? 'bg-emerald-500 text-black' : 
                              rec.status === 'rejected' ? 'bg-red-500 text-white' : 
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {rec.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Panel */}
                    <div className="flex flex-col gap-6">
                      <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest">Core Access (Admin)</h3>
                      
                      {!isAdmin ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-white/40 uppercase font-bold">Enter Access Password</label>
                          <input 
                            type="number"
                            id="admin-pass-input"
                            className="bg-black/50 border border-blue-400/30 rounded-xl px-4 py-3 text-blue-400 font-bold focus:outline-none focus:border-blue-400"
                            placeholder="456"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('admin-pass-input') as HTMLInputElement;
                              checkAdminPassword(input.value);
                              input.value = '';
                            }}
                            className="py-3 bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-blue-500 transition-all"
                          >
                            Verify Credentials
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 bg-blue-500/10 p-6 rounded-2xl border border-blue-500/30">
                          <div className="text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Zap size={14} /> ADMIN ACCESS ACTIVE
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="text-[10px] text-blue-400/50 uppercase font-bold mb-1 block">Game Name</label>
                              <input 
                                type="text"
                                defaultValue={gameName}
                                id="game-name-input"
                                className="w-full bg-black/50 border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-blue-400/50 uppercase font-bold mb-1 block">Game Logo/Version</label>
                              <input 
                                type="text"
                                defaultValue={gameLogo}
                                id="game-logo-input"
                                className="w-full bg-black/50 border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const name = (document.getElementById('game-name-input') as HTMLInputElement).value;
                                const logo = (document.getElementById('game-logo-input') as HTMLInputElement).value;
                                updateGameBranding(name, logo);
                              }}
                              className="py-2 bg-blue-500 text-white font-black uppercase text-[10px] rounded-lg hover:bg-white hover:text-blue-500 transition-all"
                            >
                              Update Branding
                            </button>

                            <div className="pt-4 border-t border-blue-500/20">
                              <label className="text-[10px] text-blue-400/50 uppercase font-bold mb-2 block">Pending Recommendations</label>
                              <div className="flex flex-col gap-2">
                                {updateRecommendations.filter(r => r.status === 'pending').map(rec => (
                                  <div key={rec.id} className="bg-black/40 p-2 rounded-lg border border-blue-500/20 flex justify-between items-center">
                                    <span className="text-[10px] text-white/80">{rec.text}</span>
                                    <button 
                                      onClick={() => approveUpdate(rec.id)}
                                      className="px-2 py-1 bg-emerald-500 text-black text-[8px] font-black rounded uppercase"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {lobbyTab === 'lore' && (
              <div className="w-full space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <h3 className="text-2xl font-black text-white italic tracking-tight mb-6">ARCHIVE RECORDS</h3>
                <div className="grid grid-cols-1 gap-6">
                  {LORE_ENTRIES.map(entry => (
                    <button 
                      key={entry.id} 
                      onClick={() => soundService.playLoreSound(entry.title, entry.content)}
                      className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group hover:border-amber-400/30 transition-all text-left w-full"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                        <Book size={64} className="text-amber-400" />
                      </div>
                      <div className="text-[10px] text-amber-400 font-black uppercase tracking-[0.3em] mb-2">{entry.category}</div>
                      <h4 className="text-3xl font-black text-white italic mb-4">{entry.title}</h4>
                      <p className="text-white/60 leading-relaxed font-medium">{entry.content}</p>
                      <div className="mt-4 text-[8px] text-amber-400/40 font-black uppercase tracking-widest flex items-center gap-2">
                        <Volume2 size={12} /> Click to listen to archive
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lobbyTab === 'spells' && (
              <div className="w-full space-y-6">
                <h3 className="text-2xl font-black text-white italic tracking-tight mb-6">TACTICAL SPELLS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(SPELLS).map(spell => (
                    <button
                      key={spell.id}
                      onClick={() => {
                        useGameStore.getState().setSelectedSpell(spell.id);
                        soundService.playSFX('spell');
                      }}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start text-left relative overflow-hidden ${
                        useGameStore.getState().selectedSpell === spell.id
                          ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_40px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between w-full mb-4">
                        <div className={`p-3 rounded-xl ${useGameStore.getState().selectedSpell === spell.id ? 'bg-black/10' : 'bg-white/10'}`}>
                          <Wand2 size={24} />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Mana Cost</div>
                          <div className="text-xl font-black italic">{spell.manaCost} MP</div>
                        </div>
                      </div>
                      <h4 className="text-2xl font-black italic mb-2 uppercase">{spell.name}</h4>
                      <p className={`text-xs leading-relaxed font-medium ${useGameStore.getState().selectedSpell === spell.id ? 'text-black/60' : 'text-white/40'}`}>
                        {spell.description}
                      </p>
                      <div className="mt-4 flex gap-4 w-full">
                        <div className="flex-1">
                          <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Cooldown</div>
                          <div className="text-xs font-black italic">{spell.cooldown / 1000}s</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Effect</div>
                          <div className="text-xs font-black italic uppercase">{spell.effect}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {lobbyTab === 'replays' && (
              <div className="w-full space-y-6">
                <h3 className="text-2xl font-black text-white italic tracking-tight mb-6">COMBAT RECORDS</h3>
                <div className="grid grid-cols-1 gap-4">
                  {(useGameStore.getState().matchHistory || []).length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
                      <div className="text-white/20 font-black uppercase tracking-widest italic">No records found in local storage</div>
                    </div>
                  ) : (
                    (useGameStore.getState().matchHistory || []).map((record: any) => (
                      <div key={record.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center group hover:border-amber-400/30 transition-all">
                        <div className="flex gap-8 items-center">
                          <div className="bg-amber-400/10 p-4 rounded-2xl">
                            <Target size={24} className="text-amber-400" />
                          </div>
                          <div>
                            <div className="text-xl font-black text-white uppercase italic">{record.map} - {record.mode}</div>
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                              {new Date(record.date).toLocaleDateString()} • {Math.floor(record.duration / 60)}m {record.duration % 60}s
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-12">
                          <div className="text-right">
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">K/D</div>
                            <div className="text-xl font-black text-white italic">{record.kills} / {record.deaths}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Score</div>
                            <div className="text-xl font-black text-amber-400 italic">{record.score}</div>
                          </div>
                          {record.replayData && (
                            <button
                              onClick={() => {
                                try {
                                  const data = typeof record.replayData === 'string' ? JSON.parse(record.replayData) : record.replayData;
                                  useGameStore.getState().playReplay(data);
                                } catch (e) {
                                  console.error('Failed to parse replay data', e);
                                }
                              }}
                              className="bg-amber-400 text-black px-4 py-2 rounded-xl font-black italic text-xs hover:bg-white transition-all ml-4"
                            >
                              REPLAY
                            </button>
                          )}
                        </div>
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

    </div>
  );
}
