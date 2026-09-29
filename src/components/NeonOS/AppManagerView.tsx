import React, { useState } from 'react';
import { 
  Package, Search, Download, Trash2, RefreshCw, Copy, Archive,
  ShieldAlert, HardDrive, Battery, CheckCircle2, AlertTriangle, Layers,
  ExternalLink, SlidersHorizontal, ArrowUpDown, Smartphone
} from 'lucide-react';
import { InstalledApp } from './types';
import { soundService } from '../../services/soundService';

const INITIAL_APPS: InstalledApp[] = [
  { id: 'app_emperor', name: 'Emperor Business & Creator Suite', category: 'Business', sizeGB: 400.0, version: 'v4.8.2', batteryDrainPercent: 28, permissions: ['Storage', 'Network', 'Payments', 'Camera', 'Microphone'] },
  { id: 'app_toolbox', name: 'Neon Toolbox Giant Suite', category: 'Utility', sizeGB: 300.0, version: 'v6.1.0', batteryDrainPercent: 18, permissions: ['Full System', 'Storage', 'Diagnostics', 'Screen Capture'] },
  { id: 'app_core', name: 'Neon Arena Core Game Engine', category: 'Gaming', sizeGB: 200.0, version: 'v2.5.0', batteryDrainPercent: 35, permissions: ['GPU Overdrive', 'Audio', 'Network', 'Gamepad', 'VR Sensors'] },
  { id: 'app_appman', name: 'Neon Arena App Manager System', category: 'System', sizeGB: 68.93, version: 'v3.1.4', batteryDrainPercent: 5, permissions: ['APK Package Installer', 'Storage Audit', 'Process Control'] },
  { id: 'app_warzone', name: 'Combined-Arms Warzone Expansion', category: 'Gaming', sizeGB: 85.5, version: 'v2.0.1', batteryDrainPercent: 24, permissions: ['Physics Engine', 'Multiplayer Network', 'Haptic Feedback'] },
  { id: 'app_rooftop', name: 'Neon Rooftop Parkour City', category: 'Gaming', sizeGB: 45.2, version: 'v1.9.0', batteryDrainPercent: 16, permissions: ['Network', 'Audio', 'Leaderboards'] },
  { id: 'app_extreme', name: 'Neon Extreme Sports World', category: 'Gaming', sizeGB: 52.8, version: 'v1.4.2', batteryDrainPercent: 19, permissions: ['Physics Engine', 'Audio', 'Open World'] },
  { id: 'app_neonai', name: 'Neon AI Intelligent Core Neural Net', category: 'AI', sizeGB: 38.4, version: 'v5.0.0', batteryDrainPercent: 12, permissions: ['Microphone', 'Camera', 'NLP Engine', 'Screen Read'] },
  { id: 'app_vrstudio', name: 'Quest Spatial VR Integration Suite', category: 'System', sizeGB: 32.0, version: 'v2.1.0', batteryDrainPercent: 15, permissions: ['Passthrough Camera', 'Hand Tracking', 'Spatial Audio'] },
  { id: 'app_browser', name: 'Neon Quantum Web Browser', category: 'Utility', sizeGB: 8.6, version: 'v124.0', batteryDrainPercent: 8, permissions: ['Network', 'Cookies', 'Downloads'] }
];

export const AppManagerView: React.FC = () => {
  const [apps, setApps] = useState<InstalledApp[]>(INITIAL_APPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(INITIAL_APPS[0]);
  const [notification, setNotification] = useState<string | null>(null);

  const totalAppStorage = apps.reduce((acc, app) => acc + (app.isArchived ? 0.2 : app.sizeGB), 0);

  const showToast = (msg: string) => {
    setNotification(msg);
    soundService.playSFX('ui_click');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCloneApp = (appId: string) => {
    const target = apps.find(a => a.id === appId);
    if (!target) return;
    const cloned: InstalledApp = {
      ...target,
      id: `${target.id}_clone_${Date.now()}`,
      name: `${target.name} (Cloned Instance)`,
      isCloned: true
    };
    setApps(prev => [...prev, cloned]);
    showToast(`Successfully cloned ${target.name} for isolated multi-account use.`);
  };

  const handleToggleArchive = (appId: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const nextArchived = !a.isArchived;
        showToast(nextArchived ? `Archived ${a.name} (Saved ${(a.sizeGB - 0.2).toFixed(1)} GB)` : `Restored ${a.name}`);
        return { ...a, isArchived: nextArchived };
      }
      return a;
    }));
  };

  const handleClearCache = (appName: string) => {
    showToast(`Cleared temporary runtime cache for ${appName} (Freed 3.42 GB).`);
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || app.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Top App Manager Summary Bar */}
      <div className="bg-zinc-900 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Package size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">NEON APP MANAGER</h2>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                SYSTEM SIZE: 68.93 GB
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Total App Allocation: <strong className="text-white">{totalAppStorage.toFixed(2)} GB</strong> across {apps.length} packages
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('APK Sideload installer ready. Drop APK or bundle to install.')}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Install APK / Bundle</span>
          </button>
          <button
            onClick={() => showToast('App updates checked: All installed suites are on latest stable releases.')}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300"
            title="Check for Package Updates"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase animate-in slide-in-from-top duration-200">
          ✓ {notification}
        </div>
      )}

      {/* Main App Grid & Inspector Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: List of Packages */}
        <div className="col-span-7 border-r border-white/10 p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Search & Categories */}
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search installed packages, games, utilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-emerald-400 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
              {['ALL', 'Gaming', 'Business', 'Utility', 'Creator', 'AI', 'System'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg uppercase font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-emerald-500 text-black font-black' : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* App Cards */}
          <div className="space-y-2">
            {filteredApps.map(app => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-emerald-400 font-black text-sm">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white uppercase">{app.name}</h4>
                        {app.isArchived && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                            ARCHIVED
                          </span>
                        )}
                        {app.isCloned && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40">
                            CLONED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-0.5">
                        <span>{app.category}</span>
                        <span>•</span>
                        <span>{app.version}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{app.sizeGB} GB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-[10px]">
                      <div className="text-zinc-500 uppercase">Battery</div>
                      <div className="text-zinc-300 font-bold">{app.batteryDrainPercent}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Package Inspector */}
        <div className="col-span-5 p-6 bg-zinc-950/50 flex flex-col gap-5 overflow-y-auto">
          {selectedApp ? (
            <>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  PACKAGE INSPECTOR & DIAGNOSTICS
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                  {selectedApp.name}
                </h3>
                <span className="text-xs text-zinc-400 font-bold">PACKAGE ID: {selectedApp.id}</span>
              </div>

              {/* Storage & Resource Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Total Installed Storage:</span>
                  <span className="text-white font-black">{selectedApp.sizeGB} GB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">System Cache Allocated:</span>
                  <span className="text-amber-400 font-black">3.42 GB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Battery Impact (Last 24h):</span>
                  <span className="text-cyan-400 font-black">{selectedApp.batteryDrainPercent}% total power</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">App State:</span>
                  <span className={selectedApp.isArchived ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                    {selectedApp.isArchived ? 'Archived (Stub only)' : 'Active & Ready'}
                  </span>
                </div>
              </div>

              {/* Permissions Audit */}
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  SECURITY & GRANTED PERMISSIONS
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedApp.permissions.map((p, idx) => (
                    <span key={idx} className="bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleClearCache(selectedApp.name)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} className="text-amber-400" />
                  <span>Clear Cache & Temp Files</span>
                </button>

                <button
                  onClick={() => handleCloneApp(selectedApp.id)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={14} className="text-cyan-400" />
                  <span>Clone App (Isolated Instance)</span>
                </button>

                <button
                  onClick={() => handleToggleArchive(selectedApp.id)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Archive size={14} className="text-emerald-400" />
                  <span>{selectedApp.isArchived ? 'Restore from Archive' : 'Archive to Save Storage'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select an application package to inspect permissions & storage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
