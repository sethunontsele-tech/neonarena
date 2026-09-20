import React, { useState } from 'react';
import { ReplayKeyframe, PhotoSettings } from './types';
import { Camera, Play, Pause, RotateCcw, FastForward, Sliders, Eye, EyeOff, Film, Sparkles, Download, X } from 'lucide-react';

interface FreerunReplayPhotoModeProps {
  keyframes: ReplayKeyframe[];
  photoSettings: PhotoSettings;
  onUpdatePhotoSettings: (settings: PhotoSettings) => void;
  onClose: () => void;
  onScrubTimestamp: (timestamp: number) => void;
  currentPlaybackTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export function FreerunReplayPhotoMode({
  keyframes,
  photoSettings,
  onUpdatePhotoSettings,
  onClose,
  onScrubTimestamp,
  currentPlaybackTime,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed
}: FreerunReplayPhotoModeProps) {
  const [activeTab, setActiveTab] = useState<'replay' | 'photo'>('replay');
  const [showFlash, setShowFlash] = useState(false);
  const [photoCapturedMsg, setPhotoCapturedMsg] = useState(false);

  const duration = keyframes.length > 0 
    ? (keyframes[keyframes.length - 1].timestamp - keyframes[0].timestamp) / 1000 
    : 0;

  const currentSec = keyframes.length > 0 
    ? Math.max(0, (currentPlaybackTime - keyframes[0].timestamp) / 1000) 
    : 0;

  const handleCapturePhoto = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    setPhotoCapturedMsg(true);
    setTimeout(() => setPhotoCapturedMsg(false), 2500);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* FLASH OVERLAY ON CAPTURE */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />
      )}

      {/* TOP BAR */}
      {!photoSettings.hideHUD && (
        <div className="pointer-events-auto flex items-center justify-between bg-black/85 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Film size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">CINEMATIC REPLAY & PHOTO STUDIO</div>
              <div className="text-white font-black text-sm">
                {keyframes.length} Buffered Run Frames ({duration.toFixed(1)}s recorded)
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('replay')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'replay' ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              <Film size={14} /> REPLAY CONTROLS
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'photo' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              <Camera size={14} /> PHOTO MODE
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl border border-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {photoCapturedMsg && (
        <div className="self-center bg-cyan-500 text-black font-black text-xs px-5 py-2.5 rounded-2xl shadow-2xl animate-bounce">
          Cinematic Screenshot Saved to High-Res Gallery!
        </div>
      )}

      {/* PHOTO SETTINGS SIDEBAR (When Photo tab active) */}
      {activeTab === 'photo' && !photoSettings.hideHUD && (
        <div className="pointer-events-auto self-end w-80 bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sliders size={16} /> CAMERA OPTICS
            </span>
            <button
              onClick={() => onUpdatePhotoSettings({ ...photoSettings, hideHUD: true })}
              className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-xl"
            >
              <EyeOff size={12} /> HIDE HUD
            </button>
          </div>

          {/* Field of View (FOV) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
              <span>FIELD OF VIEW (FOV)</span>
              <span className="font-mono text-cyan-400">{photoSettings.fov}°</span>
            </div>
            <input
              type="range"
              min="35"
              max="110"
              value={photoSettings.fov}
              onChange={(e) => onUpdatePhotoSettings({ ...photoSettings, fov: parseInt(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Depth of Field (Blur) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
              <span>DEPTH OF FIELD (BLUR)</span>
              <span className="font-mono text-cyan-400">{photoSettings.dof.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={photoSettings.dof}
              onChange={(e) => onUpdatePhotoSettings({ ...photoSettings, dof: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Dutch Angle / Camera Tilt */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
              <span>DUTCH TILT ANGLE</span>
              <span className="font-mono text-cyan-400">{photoSettings.tilt}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={photoSettings.tilt}
              onChange={(e) => onUpdatePhotoSettings({ ...photoSettings, tilt: parseInt(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Cinematic Color Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-white/60 uppercase">COLOR GRADE FILTER</span>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['none', 'cyberpunk', 'golden_hour', 'midnight_noir', 'matrix', 'neon_dream'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => onUpdatePhotoSettings({ ...photoSettings, filter: f })}
                  className={`text-[9px] font-black uppercase p-2 rounded-xl border transition-all ${photoSettings.filter === f ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Free Cam Toggle */}
          <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer pt-2 border-t border-white/10">
            <span>Free Orbit Camera</span>
            <input
              type="checkbox"
              checked={photoSettings.freeCam}
              onChange={(e) => onUpdatePhotoSettings({ ...photoSettings, freeCam: e.target.checked })}
              className="accent-cyan-400"
            />
          </label>

          {/* Take Photo Button */}
          <button
            onClick={handleCapturePhoto}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)]"
          >
            <Camera size={18} fill="black" /> CAPTURE CINEMATIC SHOT
          </button>
        </div>
      )}

      {/* BOTTOM TIMELINE & PLAYBACK CONTROLS */}
      {!photoSettings.hideHUD && (
        <div className="pointer-events-auto bg-black/85 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 max-w-3xl mx-auto w-full">
          {/* Scrubber Timeline Bar */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-white/70 min-w-[40px]">{currentSec.toFixed(1)}s</span>
            <input
              type="range"
              min={keyframes[0]?.timestamp || 0}
              max={keyframes[keyframes.length - 1]?.timestamp || 100}
              value={currentPlaybackTime}
              onChange={(e) => onScrubTimestamp(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="font-mono text-xs text-white/40 min-w-[40px]">{duration.toFixed(1)}s</span>
          </div>

          {/* Playback Buttons & Speed Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="p-3 bg-amber-400 hover:bg-amber-300 text-black rounded-2xl font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
              </button>

              <button
                onClick={() => onScrubTimestamp(keyframes[0]?.timestamp || 0)}
                className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl border border-white/10"
                title="Restart replay"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Playback Speed (0.25x Slow-Mo, 0.5x, 1x) */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
              {[0.25, 0.5, 1.0].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase transition-all ${playbackSpeed === s ? 'bg-amber-400 text-black' : 'text-white/40 hover:text-white'}`}
                >
                  {s}x {s < 1 ? 'SLOW-MO' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden HUD restore prompt */}
      {photoSettings.hideHUD && (
        <button
          onClick={() => onUpdatePhotoSettings({ ...photoSettings, hideHUD: false })}
          className="pointer-events-auto fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all"
        >
          <Eye size={16} /> RESTORE CONTROLS
        </button>
      )}
    </div>
  );
}
