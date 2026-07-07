import { motion } from 'motion/react';
import { X, UserPlus, UserCheck, UserX, Search, MessageSquare, Shield, Trophy, Activity } from 'lucide-react';
import { useGameStore, UserProfile } from '../store';
import { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';
import { searchUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getFriendRequests } from '../firebase';

export const FriendModal = ({ onClose }: { onClose: () => void }) => {
  const user = useGameStore(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user]);

  const loadSocialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [f, r] = await Promise.all([
        getFriends(user.uid),
        getFriendRequests(user.uid)
      ]);
      setFriends(f);
      setRequests(r);
    } catch (err) {
      console.error('Error loading social data:', err);
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter(u => u.uid !== user?.uid));
      } catch (err) {
        console.error('Error searching users:', err);
      }
      setLoading(false);
      soundService.playSFX('ui_click');
    }
  };

  const handleSendRequest = async (toUid: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(user.uid, toUid);
      useGameStore.getState().addEvent('Friend request sent!');
      soundService.playSFX('ui_click');
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  const handleAccept = async (friendUid: string) => {
    if (!user) return;
    try {
      await acceptFriendRequest(user.uid, friendUid);
      useGameStore.getState().addEvent('Friend request accepted!');
      loadSocialData();
      soundService.playSFX('ui_click');
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async (friendUid: string) => {
    if (!user) return;
    try {
      await rejectFriendRequest(user.uid, friendUid);
      useGameStore.getState().addEvent('Friend request rejected.');
      loadSocialData();
      soundService.playSFX('ui_click');
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] pointer-events-auto p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-3xl flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden h-[80vh]"
      >
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">SQUAD NETWORK</h2>
            <div className="flex gap-4 items-center">
              <div className="h-1 w-24 bg-amber-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Manage your combat allies</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 relative z-10">
          {[
            { id: 'friends', label: 'Squad', icon: <Activity size={14} /> },
            { id: 'requests', label: 'Requests', icon: <UserPlus size={14} />, count: requests.length },
            { id: 'search', label: 'Recruit', icon: <Search size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); soundService.playSFX('ui_tab'); }}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${activeTab === tab.id ? 'bg-amber-400 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] animate-pulse">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {activeTab === 'search' && (
            <div className="space-y-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input 
                  type="text"
                  placeholder="Search by gamertag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-400 transition-all"
                />
                <button 
                  type="submit"
                  className="bg-amber-400 text-black p-4 rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  <Search size={24} />
                </button>
              </form>

              <div className="space-y-4">
                {searchResults.map(u => (
                  <div key={u.uid} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400/20 overflow-hidden">
                      <img src={u.avatarUrl} alt={u.gamertag} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-black text-white italic tracking-tight">{u.gamertag}</div>
                      <div className="flex gap-4 mt-1">
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">LVL {u.progression.level}</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{u.rank.current.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(u.uid)}
                      className="p-4 bg-amber-400 text-black rounded-2xl hover:bg-white transition-all"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/10">
                  <Activity size={64} className="mb-4 opacity-10" />
                  <div className="text-sm font-black uppercase tracking-[0.4em]">No allies in squad</div>
                </div>
              ) : (
                friends.map(f => (
                  <div key={f.uid} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6 group hover:border-amber-400/30 transition-all">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-white/10 overflow-hidden">
                        <img src={f.avatarUrl} alt={f.gamertag} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-black text-white italic tracking-tight">{f.gamertag}</div>
                      <div className="flex gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-widest">
                          <Trophy size={10} />
                          {f.rank.current.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 uppercase tracking-widest">
                          <Shield size={10} />
                          {f.clanId ? 'CLAN MEMBER' : 'SOLO'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-white hover:border-white/30 transition-all">
                        <MessageSquare size={20} />
                      </button>
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-red-500 hover:border-red-500/30 transition-all">
                        <UserX size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/10">
                  <UserPlus size={64} className="mb-4 opacity-10" />
                  <div className="text-sm font-black uppercase tracking-[0.4em]">No pending requests</div>
                </div>
              ) : (
                requests.map(r => (
                  <div key={r.uid} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-white/10 overflow-hidden">
                      <img src={r.avatarUrl} alt={r.gamertag} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-black text-white italic tracking-tight">{r.gamertag}</div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Incoming Squad Request</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(r.uid)}
                        className="p-4 bg-emerald-500 text-black rounded-2xl hover:bg-white transition-all"
                      >
                        <UserCheck size={20} />
                      </button>
                      <button 
                        onClick={() => handleReject(r.uid)}
                        className="p-4 bg-red-500 text-white rounded-2xl hover:bg-white hover:text-red-500 transition-all"
                      >
                        <UserX size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
