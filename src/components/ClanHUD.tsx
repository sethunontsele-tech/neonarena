import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { getClan, ClanData, createClan, joinClan, leaveClan, getTopClans } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Trophy, Plus, LogOut, ChevronRight, Search, Zap, Crown } from 'lucide-react';

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
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black text-black shadow-2xl"
                  style={{ backgroundColor: clan.color }}
                >
                  {clan.tag}
                </div>
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
                onClick={() => leaveClan(user!.uid, clan.id).then(() => setClan(null))}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Clan Members Preview */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Crown size={12} />
                  Clan Leader
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400 rounded-xl" />
                  <div className="text-sm font-black text-white uppercase tracking-wider">System Admin</div>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Recent Activity</div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">+500 XP from Arena Win</div>
              </div>
            </div>
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
      </AnimatePresence>
    </div>
  );
}
