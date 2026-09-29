import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Package, Briefcase, Wrench, Gamepad2, Glasses, HardDrive,
  Cloud, Bot, Film, Globe, MessageSquare, Folder, Shield, Monitor,
  Sliders, Search, X, Minus, Square, Maximize2, Bell, Battery,
  Wifi, Bluetooth, RefreshCw, Power, Sparkles, LayoutGrid, Check
} from 'lucide-react';
import { NeonWindow, NeonAppId } from './types';
import { AppManagerView } from './AppManagerView';
import { EmperorView } from './EmperorView';
import { ToolboxView } from './ToolboxView';
import { GamingSystemView } from './GamingSystemView';
import { StorageArchitectureView } from './StorageArchitectureView';
import { VRSpatialView } from './VRSpatialView';
import { NeonAIView } from './NeonAIView';
import { CreatorStudioView } from './CreatorStudioView';
import { DesktopFilesView } from './DesktopFilesView';
import { SystemControlsView } from './SystemControlsView';
import { soundService } from '../../services/soundService';

interface AppLauncherItem {
  id: NeonAppId;
  name: string;
  category: string;
  icon: any;
  color: string;
  badge?: string;
}

const APPS_CATALOG: AppLauncherItem[] = [
  { id: 'app_manager', name: 'App Manager', category: 'Management', icon: Package, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', badge: '68.93 GB' },
  { id: 'emperor', name: 'Emperor Platform', category: 'Business & Creator', icon: Briefcase, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', badge: '400 GB' },
  { id: 'toolbox', name: 'Neon Toolbox', category: 'Utilities', icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', badge: '300 GB' },
  { id: 'gaming', name: 'Gaming System', category: 'Entertainment', icon: Gamepad2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'vr_spatial', name: 'Quest Spatial VR', category: 'Virtual Reality', icon: Glasses, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { id: 'storage_arch', name: 'Storage Architecture', category: 'Hardware', icon: HardDrive, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', badge: 'USB-C' },
  { id: 'neon_ai', name: 'Neon AI Assistant', category: 'Intelligence', icon: Bot, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { id: 'creator_studio', name: 'Creator Studio Pro', category: 'Video & 3D', icon: Film, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'files', name: 'File Ecosystem', category: 'Storage', icon: Folder, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'system_controls', name: 'System Controls', category: 'Performance', icon: Sliders, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' }
];

export const NeonOSDesktop: React.FC<{ onClose: () => void; onLaunchGame?: (gameId: string) => void }> = ({
  onClose,
  onLaunchGame
}) => {
  const [windows, setWindows] = useState<NeonWindow[]>([
    {
      id: 'win_app_man',
      appId: 'app_manager',
      title: 'Neon App Manager (68.93 GB System)',
      iconName: 'Package',
      isMinimized: false,
      isMaximized: false,
      position: { x: 80, y: 50 },
      size: { width: 920, height: 600 },
      zIndex: 10
    }
  ]);

  const [activeWindowId, setActiveWindowId] = useState<string>('win_app_man');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [wallpaperTheme, setWallpaperTheme] = useState<'neon_grid' | 'cyber_dark' | 'deep_space'>('neon_grid');

  const openApp = (appId: NeonAppId, title: string) => {
    soundService.playSFX('ui_click');
    setIsStartMenuOpen(false);

    // Check if window is already open
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false, zIndex: 50 } : w));
      setActiveWindowId(existing.id);
      return;
    }

    const newWindow: NeonWindow = {
      id: `win_${appId}_${Date.now()}`,
      appId,
      title,
      iconName: appId,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + (windows.length % 5) * 30, y: 70 + (windows.length % 5) * 30 },
      size: { width: 920, height: 600 },
      zIndex: 50
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (winId: string) => {
    soundService.playSFX('ui_click');
    setWindows(prev => prev.filter(w => w.id !== winId));
  };

  const toggleMinimize = (winId: string) => {
    setWindows(prev => prev.map(w => w.id === winId ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const toggleMaximize = (winId: string) => {
    setWindows(prev => prev.map(w => w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const focusWindow = (winId: string) => {
    setActiveWindowId(winId);
    setWindows(prev => prev.map(w => w.id === winId ? { ...w, zIndex: 50 } : { ...w, zIndex: Math.max(1, w.zIndex - 1) }));
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black text-white font-mono select-none overflow-hidden flex flex-col">
      {/* ================= DESKTOP CANVAS WORKSPACE ================= */}
      <div 
        className={`flex-1 relative overflow-hidden transition-all duration-700 ${
          wallpaperTheme === 'neon_grid' 
            ? 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,rgba(0,0,0,0.95)_80%)]' 
            : wallpaperTheme === 'cyber_dark' 
            ? 'bg-zinc-950' 
            : 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,rgba(0,0,0,0.98)_85%)]'
        }`}
      >
        {/* Animated Cyber Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

        {/* Desktop Shortcuts Grid */}
        <div className="absolute top-6 left-6 grid grid-flow-col grid-rows-6 gap-3 pointer-events-auto z-10">
          {APPS_CATALOG.map(app => (
            <div
              key={app.id}
              onDoubleClick={() => openApp(app.id, app.name)}
              onClick={() => soundService.playSFX('ui_hover')}
              className="w-24 p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 border ${app.color}`}>
                <app.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight text-zinc-300 group-hover:text-white line-clamp-2">
                {app.name}
              </span>
              {app.badge && (
                <span className="text-[8px] font-bold bg-white/10 text-zinc-400 px-1.5 rounded mt-0.5">
                  {app.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Widgets (Top-Right System Status) */}
        <div className="absolute top-6 right-6 pointer-events-none flex flex-col items-end gap-3 z-10">
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl w-72 text-right shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <span className="text-3xl font-black text-cyan-400 tracking-tight block">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mt-0.5">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-zinc-400">
              <span>NEON OS v4.2 PRO</span>
              <span className="text-emerald-400 font-bold">21 SYSTEMS NOMINAL</span>
            </div>
          </div>
        </div>

        {/* ================= FLOATING MULTI-WINDOWS ================= */}
        {windows.map(win => {
          if (win.isMinimized) return null;
          const isActive = activeWindowId === win.id;

          return (
            <div
              key={win.id}
              onClick={() => focusWindow(win.id)}
              style={{
                position: 'absolute',
                top: win.isMaximized ? 0 : win.position.y,
                left: win.isMaximized ? 0 : win.position.x,
                width: win.isMaximized ? '100%' : `${win.size.width}px`,
                height: win.isMaximized ? 'calc(100% - 50px)' : `${win.size.height}px`,
                zIndex: win.zIndex
              }}
              className={`rounded-2xl border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all ${
                isActive ? 'border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)]' : 'border-white/15'
              }`}
            >
              {/* Window Header Title Bar */}
              <div className="bg-zinc-900 px-4 py-2.5 flex items-center justify-between border-b border-white/10 cursor-move">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-black uppercase text-zinc-200 tracking-wider">
                    {win.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMinimize(win.id); }}
                    className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }}
                    className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                  >
                    <Square size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-zinc-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Window Sub-Application Viewport Content */}
              <div className="flex-1 overflow-hidden bg-zinc-950">
                {win.appId === 'app_manager' && <AppManagerView />}
                {win.appId === 'emperor' && <EmperorView />}
                {win.appId === 'toolbox' && <ToolboxView />}
                {win.appId === 'gaming' && <GamingSystemView onLaunchGame={onLaunchGame} />}
                {win.appId === 'storage_arch' && <StorageArchitectureView />}
                {win.appId === 'vr_spatial' && <VRSpatialView />}
                {win.appId === 'neon_ai' && <NeonAIView />}
                {win.appId === 'creator_studio' && <CreatorStudioView />}
                {win.appId === 'files' && <DesktopFilesView />}
                {win.appId === 'system_controls' && <SystemControlsView />}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= START MENU FLYOUT ================= */}
      {isStartMenuOpen && (
        <div className="absolute bottom-14 left-4 w-96 bg-zinc-950/95 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] z-[150] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Cpu size={20} className="text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">NEON ARENA OS START</h3>
            </div>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">PRO EDITION</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search apps, utilities, settings..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-cyan-400 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* App Launcher List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {APPS_CATALOG.filter(a => a.name.toLowerCase().includes(searchFilter.toLowerCase())).map(app => (
              <div
                key={app.id}
                onClick={() => openApp(app.id, app.name)}
                className="p-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${app.color}`}>
                    <app.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{app.name}</h4>
                    <span className="text-[9px] text-zinc-400">{app.category}</span>
                  </div>
                </div>
                {app.badge && (
                  <span className="text-[8px] bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded">
                    {app.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Power / Exit Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                soundService.playSFX('ui_click');
                onClose();
              }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500 hover:text-black border border-red-500/40 text-red-300 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5"
            >
              <Power size={14} />
              <span>Return to Game</span>
            </button>

            <span className="text-[10px] text-zinc-500">21 Systems Online</span>
          </div>
        </div>
      )}

      {/* ================= BOTTOM OS TASKBAR ================= */}
      <div className="h-12 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 px-4 flex items-center justify-between z-[140]">
        {/* Left: Start Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsStartMenuOpen(!isStartMenuOpen);
              soundService.playSFX('ui_click');
            }}
            className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isStartMenuOpen 
                ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'bg-white/10 text-white hover:bg-cyan-500/20 hover:text-cyan-300'
            }`}
          >
            <Cpu size={16} />
            <span>START</span>
          </button>

          {/* Running Windows Taskbar Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl">
            {windows.map(win => {
              const isActive = activeWindowId === win.id && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) toggleMinimize(win.id);
                    focusWindow(win.id);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{win.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <Wifi size={14} className="text-emerald-400" />
            <Battery size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-white">100%</span>
          </div>

          <div
            onClick={() => {
              setWallpaperTheme(prev => prev === 'neon_grid' ? 'cyber_dark' : prev === 'cyber_dark' ? 'deep_space' : 'neon_grid');
              soundService.playSFX('ui_click');
            }}
            className="cursor-pointer text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
            title="Cycle Wallpaper Theme"
          >
            THEME
          </div>

          <span className="font-bold text-white">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
            title="Close Neon OS"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
