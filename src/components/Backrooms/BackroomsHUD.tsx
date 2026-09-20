import React, { useState, useEffect } from 'react';
import { 
  Flashlight, 
  Battery, 
  Heart, 
  Brain, 
  Key, 
  Sliders, 
  LogOut, 
  Volume2, 
  Eye, 
  ShieldAlert,
  Zap,
  Users
} from 'lucide-react';
import { BackroomsLevelId, BackroomsItem, BackroomsGraphicsSettings, BackroomsRandomEvent } from './types';
import { LEVEL_CONFIGS } from './ProceduralLevels';
import { backroomsAudio } from './backroomsAudio';

interface BackroomsHUDProps {
  levelId: BackroomsLevelId;
  health?: number;
  stamina?: number;
  sanity: number;
  flashlightBattery?: number;
  battery?: number;
  isFlashlightOn: boolean;
  inventory: BackroomsItem[];
  keys: string[];
  activeEvent: BackroomsRandomEvent | null;
  teammates?: Array<{ id: string; name: string; health: number; isDowned: boolean; distance: number }>;
  onToggleFlashlight: () => void;
  onUseItem: (itemType: string) => void;
  onReviveTeammate?: (teammateId: string) => void;
  onExitBackrooms: () => void;
}

export function BackroomsHUD({
  levelId,
  health = 100,
  stamina = 100,
  sanity,
  flashlightBattery,
  battery,
  isFlashlightOn,
  inventory,
  keys,
  activeEvent,
  teammates = [],
  onToggleFlashlight,
  onUseItem,
  onReviveTeammate = () => {},
  onExitBackrooms
}: BackroomsHUDProps) {
  const currentBattery = flashlightBattery !== undefined ? flashlightBattery : (battery !== undefined ? battery : 100);
  const config = LEVEL_CONFIGS[levelId] || LEVEL_CONFIGS[0];
  const [showSettings, setShowSettings] = useState(false);
  const [graphics, setGraphics] = useState<BackroomsGraphicsSettings>({
    preset: 'medium',
    fog: true,
    flicker: true,
    vhsOverlay: true,
    particles: true,
    dynamicShadows: true,
    audioEcho: true
  });

  // Time ticker for VHS camcorder
  const [camTime, setCamTime] = useState('00:04:12');
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      setCamTime(`00:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Almond Water count
  const almondWaterCount = inventory.filter((i) => i.type === 'almond_water').length;
  const batteryCount = inventory.filter((i) => i.type === 'battery').length;
  const medkitCount = inventory.filter((i) => i.type === 'medkit').length;
  const adrenalineCount = inventory.filter((i) => i.type === 'adrenaline').length;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none overflow-hidden font-mono">
      {/* 1. VHS Camcorder Overlay Effects */}
      {graphics.vhsOverlay && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.85)_100%)]" />
          {/* Low Sanity Red Distortion Border */}
          {sanity < 30 && (
            <div
              className="absolute inset-0 border-8 border-red-600/40 animate-pulse pointer-events-none"
              style={{ filter: `blur(${Math.max(1, (30 - sanity) * 0.2)}px)` }}
            />
          )}
        </div>
      )}

      {/* 2. Top-Left Camcorder HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 text-white text-xs drop-shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping inline-block" />
          <span className="font-black text-red-500 tracking-wider">REC</span>
          <span className="text-zinc-400">PLAY [SP]</span>
          <span className="text-amber-400 font-bold ml-2">{camTime}</span>
        </div>
        <div className="text-[10px] text-zinc-400 tracking-widest uppercase">
          TAPE: SECTOR_ANOMALY_LOG // 4:3
        </div>
      </div>

      {/* 3. Top-Center Level Banner & Objectives */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="bg-black/80 backdrop-blur-md border border-amber-500/40 px-5 py-2 rounded-2xl flex flex-col items-center gap-0.5 shadow-2xl">
          <span className="text-amber-400 font-black text-xs sm:text-sm tracking-widest uppercase">
            {config.name}
          </span>
          <span className="text-[9px] text-zinc-400 tracking-wider text-center max-w-md hidden sm:inline">
            {config.subtitle}
          </span>
        </div>

        {/* Random Event Alert Banner */}
        {activeEvent && (
          <div className="mt-2 bg-red-950/90 border border-red-500 px-4 py-1 rounded-xl text-red-300 text-xs font-black uppercase flex items-center gap-2 animate-bounce">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{activeEvent.title}: {activeEvent.description}</span>
          </div>
        )}
      </div>

      {/* 4. Top-Right Settings, Exit & Flashlight Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        {/* Flashlight Toggle Button */}
        <button
          onClick={() => {
            onToggleFlashlight();
            backroomsAudio.playFlashlightClick(!isFlashlightOn);
          }}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all shadow-lg ${
            isFlashlightOn
              ? 'bg-amber-500 text-black border-amber-300 font-black'
              : 'bg-black/80 text-zinc-400 border-white/20 hover:text-white'
          }`}
          title="Toggle Flashlight [F]"
        >
          <Flashlight className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">[F]</span>
        </button>

        {/* Graphics Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2.5 rounded-xl bg-black/80 border border-white/20 text-zinc-300 hover:text-white transition-all shadow-lg"
          title="Graphics & Performance Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Exit Backrooms to Neon Arena */}
        <button
          onClick={onExitBackrooms}
          className="px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-black flex items-center gap-1.5 shadow-lg"
          title="Return to Main Neon Arena World"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">RETURN</span>
        </button>
      </div>

      {/* 5. Left Side: Sanity, Health & Flashlight Battery */}
      <div className="absolute left-4 bottom-24 flex flex-col gap-2.5 w-48 sm:w-56 pointer-events-auto">
        {/* Health */}
        <div className="bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/10 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3 h-3" /> HEALTH
            </span>
            <span>{Math.round(health)}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                health > 40 ? 'bg-rose-500' : 'bg-rose-700 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
            />
          </div>
        </div>

        {/* Sanity Meter */}
        <div className="bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/10 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
            <span className="flex items-center gap-1 text-cyan-400">
              <Brain className="w-3 h-3" /> SANITY
            </span>
            <span>{Math.round(sanity)}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                sanity > 40 ? 'bg-cyan-500' : 'bg-purple-600 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, sanity))}%` }}
            />
          </div>
        </div>

        {/* Flashlight Battery */}
        <div className="bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/10 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
            <span className="flex items-center gap-1 text-amber-400">
              <Battery className="w-3 h-3" /> BATTERY
            </span>
            <span>{Math.round(currentBattery)}%</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentBattery > 20 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, currentBattery))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. Co-Op Teammates Radar (Right Side) */}
      {teammates.length > 0 && (
        <div className="absolute right-4 top-20 flex flex-col gap-1.5 w-44 pointer-events-auto">
          <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 bg-black/70 px-2 py-1 rounded-lg">
            <Users className="w-3 h-3 text-cyan-400" /> CO-OP TEAMMATES
          </div>
          {teammates.map((tm) => (
            <div
              key={tm.id}
              className={`p-2 rounded-xl border text-[10px] flex flex-col gap-1 transition-all ${
                tm.isDowned
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-black/80 border-white/10 text-zinc-300'
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span>{tm.name}</span>
                <span>{Math.round(tm.distance)}m</span>
              </div>
              {tm.isDowned ? (
                <button
                  onClick={() => onReviveTeammate(tm.id)}
                  className="mt-1 w-full py-1 bg-rose-600 hover:bg-rose-500 text-white font-black rounded text-[9px] uppercase tracking-wider"
                >
                  🚑 REVIVE [HOLD E]
                </button>
              ) : (
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.max(0, Math.min(100, tm.health))}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 7. Bottom Quick-Inventory Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
        {/* Almond Water */}
        <button
          onClick={() => onUseItem('almond_water')}
          disabled={almondWaterCount === 0}
          className={`px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl transition-all ${
            almondWaterCount > 0
              ? 'bg-black/90 text-cyan-300 border-cyan-500/50 hover:bg-cyan-950 hover:scale-105'
              : 'bg-black/40 text-zinc-600 border-white/5 opacity-50'
          }`}
        >
          <span className="text-base">💧</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold">ALMOND WATER</span>
            <span className="text-[9px] text-zinc-400">x{almondWaterCount}</span>
          </div>
        </button>

        {/* Battery */}
        <button
          onClick={() => onUseItem('battery')}
          disabled={batteryCount === 0}
          className={`px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl transition-all ${
            batteryCount > 0
              ? 'bg-black/90 text-amber-300 border-amber-500/50 hover:bg-amber-950 hover:scale-105'
              : 'bg-black/40 text-zinc-600 border-white/5 opacity-50'
          }`}
        >
          <span className="text-base">🔋</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold">BATTERY PACK</span>
            <span className="text-[9px] text-zinc-400">x{batteryCount}</span>
          </div>
        </button>

        {/* Medkit */}
        <button
          onClick={() => onUseItem('medkit')}
          disabled={medkitCount === 0}
          className={`px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl transition-all ${
            medkitCount > 0
              ? 'bg-black/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-950 hover:scale-105'
              : 'bg-black/40 text-zinc-600 border-white/5 opacity-50'
          }`}
        >
          <span className="text-base">🩹</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold">MEDKIT</span>
            <span className="text-[9px] text-zinc-400">x{medkitCount}</span>
          </div>
        </button>

        {/* Adrenaline */}
        <button
          onClick={() => onUseItem('adrenaline')}
          disabled={adrenalineCount === 0}
          className={`px-3 py-2 rounded-2xl border flex items-center gap-2 shadow-xl transition-all ${
            adrenalineCount > 0
              ? 'bg-black/90 text-rose-300 border-rose-500/50 hover:bg-rose-950 hover:scale-105'
              : 'bg-black/40 text-zinc-600 border-white/5 opacity-50'
          }`}
        >
          <span className="text-base">⚡</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold">ADRENALINE</span>
            <span className="text-[9px] text-zinc-400">x{adrenalineCount}</span>
          </div>
        </button>

        {/* Keycards Badges */}
        {keys.length > 0 && (
          <div className="bg-black/90 border border-white/10 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-xl">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex gap-1">
              {keys.includes('keycard_red') && <span className="text-xs">🔴</span>}
              {keys.includes('keycard_blue') && <span className="text-xs">🔵</span>}
              {keys.includes('keycard_gold') && <span className="text-xs">🟡</span>}
            </div>
          </div>
        )}
      </div>

      {/* 8. Graphics & Mobile Optimization Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-zinc-950 border-2 border-amber-500/80 p-6 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-amber-400 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> BACKROOMS PERFORMANCE & GRAPHICS
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Graphics Preset */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-zinc-300">GRAPHICS PRESET</span>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'ultra'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      setGraphics((prev) => ({
                        ...prev,
                        preset: p,
                        fog: p !== 'low',
                        particles: p === 'ultra',
                        dynamicShadows: p === 'ultra'
                      }))
                    }
                    className={`py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      graphics.preset === p
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>VHS Camcorder Tracking Effect</span>
                <input
                  type="checkbox"
                  checked={graphics.vhsOverlay}
                  onChange={(e) => setGraphics((prev) => ({ ...prev, vhsOverlay: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-400"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Atmospheric Liminal Fog</span>
                <input
                  type="checkbox"
                  checked={graphics.fog}
                  onChange={(e) => setGraphics((prev) => ({ ...prev, fog: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-400"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Fluorescent Light Ballast Hum</span>
                <input
                  type="checkbox"
                  checked={graphics.audioEcho}
                  onChange={(e) => {
                    setGraphics((prev) => ({ ...prev, audioEcho: e.target.checked }));
                    if (!e.target.checked) backroomsAudio.stopAmbientHum();
                    else backroomsAudio.startAmbientHum(config.theme);
                  }}
                  className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-400"
                />
              </label>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-lg"
            >
              APPLY SETTINGS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
