import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { getClan, ClanData, createClan, joinClan, leaveClan, getTopClans } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Trophy, Plus, LogOut, ChevronRight, Search, Zap, Crown, Calendar, Clock, Target, Activity } from 'lucide-react';

export function ClanHUD() {
  const user = useGameStore(state => state.user);
  const [clan, setClan] = useState<ClanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [topClans, setTopClans] = useState<ClanData[]>([]);
  
  const [newClanName, setNewClanName] = useState('');
  const [newClanTag, setNewClanTag] = useState('');
  const [newClanColor, setNewClanColor] = useState('#00ffff');

  const [activeClanTab, setActiveClanTab] = useState<'overview' | 'cvc'>('overview');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const cvcMatches = [
    {
      id: 'cvc-1',
      opponentTag: 'VTR',
      opponentName: 'Vector Prime',
      mode: 'Cyber Control',
      duration: '14m 20s',
      outcome: 'VICTORY',
      score: '150 - 120',
      reward: '+250 Clan XP',
      date: '1h ago'
    },
    {
      id: 'cvc-2',
      opponentTag: 'XEN',
      opponentName: 'Xenon Strike',
      mode: 'Arena Domination',
      duration: '10m 15s',
      outcome: 'DEFEAT',
      score: '85 - 100',
      reward: '+50 Clan XP',
      date: '4h ago'
    },
    {
      id: 'cvc-3',
      opponentTag: 'DSY',
      opponentName: 'Odyssey Nine',
      mode: 'Nexus Flag Capture',
      duration: '18m 32s',
      outcome: 'VICTORY',
      score: '3 - 1',
      reward: '+300 Clan XP',
      date: '1d ago'
    },
    {
      id: 'cvc-4',
      opponentTag: 'KRN',
      opponentName: 'Kronos Syndicate',
      mode: 'Neon Deathmatch',
      duration: '12m 05s',
      outcome: 'VICTORY',
      score: '120 - 95',
      reward: '+200 Clan XP',
      date: '2d ago'
    }
  ];

  useEffect(() => {
    const fetchClan = async () => {
      if (user?.uid) {
        const { clanId } = useGameStore.getState();
        if (clanId) {
          const clanData = await getClan(clanId);
          setClan(clanData);
        }
      }
      setLoading(false);
    };
    fetchClan();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newClanName || !newClanTag) return;
    try {
      const createdId = await createClan(user.uid, newClanName, newClanTag, newClanColor);
      if (createdId) {
        const fullData = await getClan(createdId);
        setClan(fullData);
      }
      setShowCreate(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBrowse = async () => {
    const clans = await getTopClans();
    setTopClans(clans);
    setShowBrowse(true);
  };

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 p-3 rounded-2xl">
            <Shield className="text-black" size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Clan System</h2>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">Unite. Conquer. Dominate.</p>
          </div>
        </div>
        
        {!clan && (
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-amber-400 text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <Plus size={16} />
              Create Clan
            </button>
            <button 
              onClick={handleBrowse}
              className="flex items-center gap-2 bg-white/5 text-white/60 px-4 py-2 rounded-xl border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              <Search size={16} />
              Browse
            </button>
          </div>
        )}
      </div>

      {/* Clan Info or Empty State */}
      <AnimatePresence mode="wait">
        {clan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-[100px] rounded-full"
              style={{ backgroundColor: clan.color }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-6">
                <motion.div 
                  whileHover={{ scale: 1.08, boxShadow: `0 0 25px ${clan.color}`, textShadow: `0 0 10px ${clan.color}` }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black text-black shadow-2xl cursor-pointer select-none transition-shadow"
                  style={{ backgroundColor: clan.color }}
                >
                  {clan.tag}
                </motion.div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{clan.name}</h3>
                    <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-black text-white/60">LVL {Math.floor(clan.clanXP / 1000) + 1}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <Users size={12} />
                      {clan.memberIds.length} Members
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                      <Zap size={12} />
                      {clan.clanXP} Clan XP
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowLeaveConfirm(true)}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                title="Leave Clan"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-white/5 mt-8 mb-6 relative z-10">
              <button
                onClick={() => setActiveClanTab('overview')}
                className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all ${
                  activeClanTab === 'overview'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-white/40 hover:text-white/85'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveClanTab('cvc')}
                className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                  activeClanTab === 'cvc'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-white/40 hover:text-white/85'
                }`}
              >
                <Target size={12} />
                CvC Matches
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeClanTab === 'overview' ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-2 gap-4 relative z-10"
                >
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Crown size={12} />
                      Clan Leader
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-black font-black text-sm">SA</div>
                      <div className="text-sm font-black text-white uppercase tracking-wider">System Admin</div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Recent Activity</div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">+500 XP from Arena Win</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="cvc"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3 relative z-10"
                >
                  {cvcMatches.map(match => (
                    <div 
                      key={match.id} 
                      className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-black"
                          style={{ backgroundColor: clan.color }}
                        >
                          {clan.tag}
                        </div>
                        <div className="text-white/20 font-black text-xs italic">VS</div>
                        <div className="bg-zinc-800 px-2 py-1 rounded-lg text-[10px] font-black text-white/80 tracking-widest border border-white/5">
                          {match.opponentTag}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white uppercase tracking-tight">{match.opponentName}</span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={10} />
                            {match.mode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                            <Clock size={10} />
                            {match.duration}
                          </span>
                          <span className="text-[9px] font-mono text-white/30">{match.date}</span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-black tracking-wider px-2 py-0.5 rounded ${
                            match.outcome === 'VICTORY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                          }`}>
                            {match.outcome}
                          </span>
                          <span className="text-[9px] font-black text-amber-400 mt-1">{match.reward}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-white/10"
          >
            <div className="bg-white/5 p-6 rounded-full mb-6">
              <Users className="text-white/20" size={48} />
            </div>
            <h3 className="text-xl font-black text-white/40 uppercase tracking-widest mb-2">No Clan Detected</h3>
            <p className="text-white/20 text-sm font-bold uppercase tracking-wider text-center max-w-xs">
              Join a clan to earn exclusive rewards and dominate the global leaderboards.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-amber-500/30 p-10 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-8">Establish Clan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Clan Name</label>
                  <input 
                    type="text" 
                    value={newClanName}
                    onChange={e => setNewClanName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-amber-400 outline-none transition-colors"
                    placeholder="e.g. NEON VANGUARD"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Clan Tag (4 Chars)</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={newClanTag}
                    onChange={e => setNewClanTag(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black tracking-widest focus:border-amber-400 outline-none transition-colors"
                    placeholder="NEON"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">Clan Color</label>
                  <div className="flex gap-3">
                    {['#00ffff', '#ff0055', '#ffd700', '#00ff00', '#ab47bc'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setNewClanColor(c)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all ${newClanColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreate}
                className="w-full mt-10 bg-amber-400 text-black py-4 rounded-2xl font-black text-lg uppercase tracking-tighter italic hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              >
                INITIALIZE CLAN
              </button>
            </motion.div>
          </div>
        )}

        {showBrowse && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowBrowse(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-white/10 p-10 rounded-[3rem] w-full max-w-2xl relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Global Clans</h3>
                <div className="bg-white/5 px-4 py-1 rounded-full border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {topClans.length} Clans Found
                </div>
              </div>

              <div className="space-y-4">
                {topClans.map((c, i) => (
                  <div key={c.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-black text-white/20 w-6">#{i + 1}</div>
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-black"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.tag}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-lg font-black text-white uppercase tracking-tight">{c.name}</div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{c.memberIds.length} Members • {c.clanXP} XP</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => joinClan(user!.uid, c.id).then(() => { setClan(c); setShowBrowse(false); })}
                      className="bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all"
                    >
                      Request Join
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowLeaveConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-950 border border-red-500/30 p-8 rounded-[2.5rem] w-full max-w-md relative z-[210] shadow-[0_0_50px_rgba(239,68,68,0.15)]"
            >
              <div className="flex items-center gap-3 text-red-500 mb-6">
                <Shield className="animate-pulse" size={28} />
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Leave Clan?</h3>
              </div>
              
              <p className="text-white/80 text-sm font-bold leading-relaxed mb-6 uppercase tracking-wider text-xs">
                Are you sure you want to depart <span className="text-amber-400 font-black">[{clan?.tag}] {clan?.name}</span>?
              </p>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-8 space-y-3">
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">POTENTIAL LOSS DETAILS:</div>
                <ul className="space-y-2 text-xs text-white/60 font-bold">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Forfeit of all active Clan-level XP contributions and standing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Loss of access to Clan-specific rewards and cosmetics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Removal from Clan rosters, shared fireteam matchmaking, and vaults.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Permanent wipe of current tournament progress and achievements.</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-white/60 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (user && clan) {
                      await leaveClan(user.uid, clan.id);
                      setClan(null);
                      setShowLeaveConfirm(false);
                      useGameStore.getState().addEvent('Departed clan successfully.');
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  Depart Clan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
