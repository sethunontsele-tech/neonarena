import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings, Shield, Bell, Monitor, Gamepad2, Volume2, 
  Camera, Image as ImageIcon, Check, X, LogOut, Save,
  Palette, Swords, Trophy, Zap, Sparkles, Users, Calendar
} from 'lucide-react';
import { useGameStore } from '../store';
import { ClanHUD } from './ClanHUD';
import { syncRealLifeEnvironment } from '../services/WeatherService';
import { saveUserProfile } from '../firebase';

export const AccountManagement: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'leaderboard' | 'vehicles' | 'clans'>('profile');
  const user = useGameStore(state => state.user);
  const gamertag = useGameStore(state => state.gamertag);
  const setGamertag = useGameStore(state => state.setGamertag);
  const logout = useGameStore(state => state.logout);
  const leaderboards = useGameStore(state => state.leaderboard);
  const musicVolume = useGameStore(state => state.musicVolume);
  const setMusicVolume = useGameStore(state => state.setMusicVolume);
  const sfxVolume = useGameStore(state => state.sfxVolume);
  const setSfxVolume = useGameStore(state => state.setSfxVolume);
  const isRealLifeSyncEnabled = useGameStore(state => state.isRealLifeSyncEnabled);
  const setRealLifeSyncEnabled = useGameStore(state => state.setRealLifeSyncEnabled);
  const environment = useGameStore(state => state.environment);
  
  const [tempGamertag, setTempGamertag] = useState(gamertag);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setGamertag(tempGamertag);
    try {
      await saveUserProfile({ gamertag: tempGamertag });
    } catch (err) {
      console.error("Failed to save gamertag to profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl"
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
              <User size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight truncate w-32">{gamertag}</h2>
              <p className="text-xs text-zinc-500">Level 42 Elite</p>
            </div>
          </div>

          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<User size={18} />}
            label="Profile"
          />
          <TabButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')}
            icon={<Trophy size={18} />}
            label="Leaderboards"
          />
          <TabButton 
            active={activeTab === 'clans'} 
            onClick={() => setActiveTab('clans')}
            icon={<Users size={18} />}
            label="Clans"
          />
          <TabButton 
            active={activeTab === 'vehicles'} 
            onClick={() => setActiveTab('vehicles')}
            icon={<Zap size={18} />}
            label="Vehicles"
          />
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<Settings size={18} />}
            label="Settings"
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={<Shield size={18} />}
            label="Security"
          />

          <div className="mt-auto pt-4 border-t border-white/5">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-8 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Palette size={20} className="text-amber-500" />
                      Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gamertag</label>
                        <input 
                          type="text"
                          value={tempGamertag}
                          onChange={(e) => setTempGamertag(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status Message</label>
                        <input 
                          type="text"
                          placeholder="What's on your mind?"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4">Appearance</h3>
                    <div className="flex flex-wrap gap-6">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group-hover:border-amber-500/50 transition-colors cursor-pointer overflow-hidden">
                          <Camera size={24} className="text-zinc-500 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Change Avatar</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-[300px] relative group">
                        <div className="h-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group-hover:border-amber-500/50 transition-colors cursor-pointer overflow-hidden">
                          <ImageIcon size={24} className="text-zinc-500 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Change Banner</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy size={20} className="text-amber-500" />
                      Showcase
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square rounded-2xl bg-black/20 border border-white/5 flex items-center justify-center">
                          <Sparkles size={24} className="text-zinc-700" />
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Global Rankings</h3>
                    <div className="flex gap-2">
                      {['Kills', 'Wins', 'Rank'].map(m => (
                        <button key={m} className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-zinc-500 uppercase hover:text-white transition-colors">
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {leaderboards.slice(0, 10).map((entry, i) => (
                      <div key={entry.uid} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                        <span className={`w-8 text-lg font-black italic ${i < 3 ? 'text-amber-500' : 'text-zinc-700'}`}>#{i + 1}</span>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10" />
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{entry.gamertag}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{entry.rank.current}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{entry.stats.totalKills}</div>
                          <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Eliminations</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'vehicles' && (
                <motion.div
                  key="vehicles"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Vehicle Customization</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase hover:bg-amber-400 transition-colors">
                          Save Preset
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { type: 'Car', icon: <Zap size={48} />, desc: 'High Speed, Low Armor' },
                        { type: 'Plane', icon: <Sparkles size={48} />, desc: 'Aerial Dominance' },
                        { type: 'Submarine', icon: <Swords size={48} />, desc: 'Stealth & Torpedoes' }
                      ].map(v => (
                        <div key={v.type} className="group relative aspect-video rounded-2xl bg-black/40 border border-white/10 overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer hover:scale-[1.02]">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-zinc-800 group-hover:text-amber-500/20 transition-colors">
                              {v.icon}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h4 className="font-black text-white uppercase tracking-widest text-xs">{v.type}</h4>
                            <p className="text-[8px] text-zinc-500 uppercase font-bold">{v.desc}</p>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-1 rounded bg-amber-500 text-black text-[8px] font-black uppercase">Selected</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-sm font-black text-white/40 mb-4 uppercase tracking-widest">Paint & Finish</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {['#ff4444', '#4444ff', '#00ff88', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#ffffff', '#18181b'].map(color => (
                          <button 
                            key={color}
                            className="aspect-square rounded-xl border-2 border-white/10 hover:scale-110 transition-transform relative group"
                            style={{ backgroundColor: color }}
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-black text-white/40 mb-4 uppercase tracking-widest">Performance Mods</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Nitro Boost', value: 'Level 3' },
                          { label: 'Reinforced Hull', value: 'Level 1' },
                          { label: 'Turbo Charger', value: 'Level 2' }
                        ].map(mod => (
                          <div key={mod.label} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-xs font-bold text-zinc-400 uppercase">{mod.label}</span>
                            <span className="text-[10px] font-black text-amber-500 uppercase">{mod.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'clans' && (
                <motion.div
                  key="clans"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-center"
                >
                  <ClanHUD />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-purple-500" />
                      Real-Life Sync
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                        <div>
                          <span className="text-sm font-medium text-zinc-300 block">Sync with Real World</span>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Matches in-game time and weather to your location</span>
                        </div>
                        <button 
                          onClick={() => setRealLifeSyncEnabled(!isRealLifeSyncEnabled)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${isRealLifeSyncEnabled ? 'bg-purple-500' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRealLifeSyncEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      {isRealLifeSyncEnabled && (
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <Sparkles size={16} className="text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wider">Current Sync</p>
                              <p className="text-[10px] text-zinc-400 uppercase">{environment.date} • {Math.floor(environment.time)}:00 • {environment.weather}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              syncRealLifeEnvironment();
                            }}
                            className="px-3 py-1 rounded-lg bg-purple-500 text-black text-[10px] font-black uppercase hover:bg-purple-400 transition-colors"
                          >
                            Sync Now
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Monitor size={20} className="text-blue-500" />
                      Graphics
                    </h3>
                    <div className="space-y-4">
                      <SettingToggle label="High Fidelity Shadows" active={true} />
                      <SettingToggle label="Ray Traced Reflections" active={false} />
                      <SettingToggle label="Ambient Occlusion" active={true} />
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                          <span>Render Scale</span>
                          <span className="text-white">100%</span>
                        </div>
                        <input type="range" className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Volume2 size={20} className="text-green-500" />
                      Audio
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                          <span>SFX Volume</span>
                          <span className="text-white">{Math.round(sfxVolume * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={sfxVolume}
                          onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                          className="w-full accent-green-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                          <span>Music Volume</span>
                          <span className="text-white">{Math.round(musicVolume * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                          className="w-full accent-green-500" 
                        />
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors flex items-center gap-2"
            >
              {isSaving ? <Zap size={18} className="animate-pulse" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
      active 
        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
        : 'text-zinc-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {label}
  </button>
);

const SettingToggle: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
    <span className="text-sm font-medium text-zinc-300">{label}</span>
    <button className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-blue-500' : 'bg-zinc-700'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);
