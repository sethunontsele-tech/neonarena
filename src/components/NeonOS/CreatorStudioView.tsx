import React, { useState } from 'react';
import { 
  Film, Scissors, Volume2, Type, Layers, Wand2, Download, Play, 
  Sparkles, Sliders, Image, Box, Check, RefreshCw, Eye
} from 'lucide-react';
import { soundService } from '../../services/soundService';

export const CreatorStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'photo' | 'model3d'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:04.25');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('powerup');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-rose-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-400">
            <Film size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-rose-400 uppercase tracking-tight">NEON CREATOR STUDIO PRO</h2>
              <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                4K MULTI-TRACK SUITE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Video Timeline Editor • Layered Photo FX • Procedural 3D Scene Modeling & Rigging
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'video' ? 'bg-rose-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Video Timeline
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'photo' ? 'bg-rose-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Photo Layers
          </button>
          <button
            onClick={() => setActiveTab('model3d')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'model3d' ? 'bg-rose-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3D Studio
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-rose-500 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Studio Editor View */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
        {activeTab === 'video' && (
          <>
            {/* Top Preview Canvas & Inspector */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
              {/* Video Monitor */}
              <div className="col-span-8 bg-black border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                    <Film size={28} />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase">4K 60FPS COMPOSITING VIEWPORT</h4>
                  <span className="text-[10px] text-zinc-500">PROJECT: "SECTOR_7_COMBINED_WARFARE.MP4" • {currentTime}</span>
                </div>

                {/* Floating Playback Controls */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      showToast(isPlaying ? 'Timeline paused' : 'Timeline playback active');
                    }}
                    className="p-2 bg-rose-500 hover:bg-rose-400 text-black rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <span className="text-xs font-bold text-rose-400">{currentTime} / 01:30.00</span>

                  <button
                    onClick={() => showToast('Exported Master 4K ProRes Video!')}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Export 4K</span>
                  </button>
                </div>
              </div>

              {/* Effects & Tools Palette */}
              <div className="col-span-4 bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 overflow-y-auto">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                  EFFECTS & MOTION PALETTE
                </span>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Cyber Neon Glow & Bloom', icon: Sparkles },
                    { label: 'Cinematic Motion Blur', icon: Film },
                    { label: 'Smart Green Screen Keyer', icon: Layers },
                    { label: 'Auto-Captions & Subtitles', icon: Type },
                    { label: 'Spatial Audio Enhancer', icon: Volume2 }
                  ].map((fx, i) => (
                    <button
                      key={i}
                      onClick={() => showToast(`Applied ${fx.label} to active track.`)}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left flex items-center justify-between text-zinc-300 hover:text-white transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <fx.icon size={16} className="text-rose-400" />
                        <span className="font-bold">{fx.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase">+ Apply</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Multi-Track Timeline */}
            <div className="h-44 bg-zinc-900 border border-white/10 rounded-3xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/5">
                <span className="font-black text-white uppercase text-[10px]">MULTI-TRACK TIMELINE</span>
                <div className="flex gap-4 text-[10px]">
                  <span>Track 1: 4K Gameplay Video</span>
                  <span>Track 2: Hangar 3D Cam</span>
                  <span>Track 3: Synthwave OST</span>
                </div>
              </div>

              {/* Tracks */}
              <div className="space-y-2 py-1">
                <div className="h-7 bg-rose-500/20 border border-rose-500/40 rounded-xl px-3 flex items-center justify-between text-[10px] text-rose-300">
                  <span>🎥 VIDEO A: Main Combat Cam (4K ProRes)</span>
                  <span className="font-bold">00:00 - 01:30</span>
                </div>
                <div className="h-7 bg-cyan-500/20 border border-cyan-500/40 rounded-xl px-3 flex items-center justify-between text-[10px] text-cyan-300">
                  <span>🔊 AUDIO: Dynamic Warzone Soundscape & SFX</span>
                  <span className="font-bold">00:00 - 01:30</span>
                </div>
                <div className="h-7 bg-amber-500/20 border border-amber-500/40 rounded-xl px-3 flex items-center justify-between text-[10px] text-amber-300">
                  <span>✨ OVERLAY: Glowing HUD Telemetry & Killfeed</span>
                  <span className="font-bold">00:15 - 00:45</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'photo' && (
          <div className="h-full flex items-center justify-center text-center space-y-3">
            <div>
              <Image size={48} className="text-rose-400 mx-auto mb-3" />
              <h3 className="text-lg font-black text-white uppercase">NEON PHOTO & GRAPHICS SUITE</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                AI background removal, high-dynamic range color grading, vector drawing, and thumbnail generation.
              </p>
              <button
                onClick={() => showToast('Imported photo asset into 8-layer editing canvas.')}
                className="mt-4 px-6 py-2.5 bg-rose-500 text-black font-black text-xs uppercase rounded-xl"
              >
                Import Image Asset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'model3d' && (
          <div className="h-full flex items-center justify-center text-center space-y-3">
            <div>
              <Box size={48} className="text-rose-400 mx-auto mb-3" />
              <h3 className="text-lg font-black text-white uppercase">NEON 3D MODELING & RIGGING WORKBENCH</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Real-time mesh decimation, inverse kinematics skeleton rigging, PBR shader baking, and GLTF/OBJ export.
              </p>
              <button
                onClick={() => showToast('Exported customized 3D vehicle asset to Neon Marketplace!')}
                className="mt-4 px-6 py-2.5 bg-rose-500 text-black font-black text-xs uppercase rounded-xl"
              >
                Publish 3D Asset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
