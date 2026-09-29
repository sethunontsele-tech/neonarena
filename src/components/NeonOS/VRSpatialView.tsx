import React, { useState } from 'react';
import { 
  Glasses, Eye, Move3d, Sparkles, Layers, Box, Check, RefreshCw, 
  Maximize2, Monitor, Hand, Compass, Radio
} from 'lucide-react';
import { soundService } from '../../services/soundService';

export const VRSpatialView: React.FC = () => {
  const [passthroughEnabled, setPassthroughEnabled] = useState(true);
  const [handTracking, setHandTracking] = useState(true);
  const [roomMeshAware, setRoomMeshAware] = useState(true);
  const [spatialScreens, setSpatialScreens] = useState([
    { id: 1, title: 'Virtual Terminal HUD', distance: '1.2m', angle: 'Center', active: true },
    { id: 2, title: 'Tactical Radar & Battle Map', distance: '1.8m', angle: 'Left 35°', active: true },
    { id: 3, title: 'Neon Creator Timeline 4K', distance: '1.5m', angle: 'Right 35°', active: true }
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('powerup');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-zinc-900 border-b border-pink-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 border border-pink-500/40 rounded-xl text-pink-400">
            <Glasses size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-pink-400 uppercase tracking-tight">QUEST SPATIAL & VR INTEGRATION</h2>
              <span className="text-[10px] font-black bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/40">
                6DOF TRACKING & PASSTHROUGH
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Spatial Computing • Room-Aware Boundary • Virtual Multi-Screen Workspace • Hand Gestures
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Recalibrated Spatial Guardian & Passthrough boundary.')}
          className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-black font-black text-xs uppercase rounded-xl flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={14} />
          <span>Calibrate Guardian</span>
        </button>
      </div>

      {toast && (
        <div className="bg-pink-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
        {/* Core Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => {
              setPassthroughEnabled(!passthroughEnabled);
              showToast(passthroughEnabled ? 'Disabled Mixed Reality Passthrough (Full VR mode)' : 'Enabled Color Passthrough');
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              passthroughEnabled ? 'bg-pink-500/15 border-pink-500' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Eye size={20} className={passthroughEnabled ? 'text-pink-400' : 'text-zinc-500'} />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${passthroughEnabled ? 'bg-pink-500/20 text-pink-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {passthroughEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <h4 className="text-sm font-black text-white uppercase">Color Passthrough</h4>
            <p className="text-xs text-zinc-400 mt-1">Blend virtual neon objects directly into your physical living room.</p>
          </div>

          <div
            onClick={() => {
              setHandTracking(!handTracking);
              showToast(handTracking ? 'Controller tracking only' : 'Hand Gestures & Pinch-to-Select activated');
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              handTracking ? 'bg-pink-500/15 border-pink-500' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Hand size={20} className={handTracking ? 'text-pink-400' : 'text-zinc-500'} />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${handTracking ? 'bg-pink-500/20 text-pink-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {handTracking ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <h4 className="text-sm font-black text-white uppercase">Direct Hand Tracking</h4>
            <p className="text-xs text-zinc-400 mt-1">Pinch to grab floating windows, tap virtual buttons with fingertip collision.</p>
          </div>

          <div
            onClick={() => {
              setRoomMeshAware(!roomMeshAware);
              showToast(roomMeshAware ? 'Room mesh ignored' : 'Real-world physical surface collisions active');
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              roomMeshAware ? 'bg-pink-500/15 border-pink-500' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Box size={20} className={roomMeshAware ? 'text-pink-400' : 'text-zinc-500'} />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${roomMeshAware ? 'bg-pink-500/20 text-pink-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {roomMeshAware ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <h4 className="text-sm font-black text-white uppercase">Room-Aware Mesh</h4>
            <p className="text-xs text-zinc-400 mt-1">Virtual projectiles and spatial windows bounce off real desks, chairs, and walls.</p>
          </div>
        </div>

        {/* Floating Spatial Monitors Workspace */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white uppercase">ACTIVE SPATIAL VIRTUAL SCREENS</h3>
              <p className="text-xs text-zinc-400">Position 4K curved displays anywhere in your 3D spatial field.</p>
            </div>
            <button
              onClick={() => showToast('Spawned new floating curved 4K screen at 1.5m.')}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase transition-all"
            >
              + Add Virtual Screen
            </button>
          </div>

          <div className="space-y-3">
            {spatialScreens.map(scr => (
              <div key={scr.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-pink-400" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">{scr.title}</h4>
                    <span className="text-[10px] text-zinc-400">Focal: {scr.distance} • Angle: {scr.angle}</span>
                  </div>
                </div>
                <button
                  onClick={() => showToast(`Calibrated focal distance for ${scr.title}`)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold"
                >
                  Adjust Angle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
