import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Glasses, Smartphone, HelpCircle, AlertCircle, Sparkles, LogOut, Check } from 'lucide-react';
import { xrStore } from './Game';

export function WebXRHUD() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [vrSupported, setVrSupported] = useState<boolean>(false);
  const [arSupported, setArSupported] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      setXrSupported(true);
      
      // Check for immersive-vr support
      (navigator as any).xr.isSessionSupported('immersive-vr')
        .then((supported: boolean) => setVrSupported(supported))
        .catch(() => setVrSupported(false));

      // Check for immersive-ar support
      (navigator as any).xr.isSessionSupported('immersive-ar')
        .then((supported: boolean) => setArSupported(supported))
        .catch(() => setArSupported(false));
    } else {
      setXrSupported(false);
    }
  }, []);

  const handleEnterVR = async () => {
    try {
      setStatusMessage('Requesting Immersive VR...');
      await xrStore.enterVR();
      setStatusMessage('VR Immersive Mode Active');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`VR Failed: ${err?.message || 'Unsupported device'}`);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleEnterAR = async () => {
    try {
      setStatusMessage('Requesting Immersive AR...');
      await xrStore.enterAR();
      setStatusMessage('AR Immersive Mode Active');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`AR Failed: ${err?.message || 'Unsupported device'}`);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  return (
    <div id="webxr_hud_panel" className="bg-zinc-950/90 border border-white/10 rounded-3xl p-5 w-80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden flex flex-col gap-4">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 blur-[40px] rounded-full pointer-events-none" />

      {/* Title */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">WebXR Immersive</span>
        </div>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="text-white/40 hover:text-white transition-all p-1 hover:bg-white/5 rounded-lg"
        >
          <HelpCircle size={14} />
        </button>
      </div>

      {/* Support indicators */}
      <div className="flex gap-2 justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${vrSupported ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-red-400'}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">VR {vrSupported ? 'Ready' : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${arSupported ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-red-400'}`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">AR {arSupported ? 'Ready' : 'N/A'}</span>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleEnterVR}
          className="relative overflow-hidden group flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500/60 rounded-2xl text-amber-400 transition-all font-black text-xs uppercase tracking-widest"
        >
          <div className="flex items-center gap-3">
            <Glasses size={18} className="group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="leading-tight">Immersive VR</div>
              <div className="text-[7px] text-amber-400/50 font-bold tracking-wider uppercase mt-0.5">Oculus & VR Headsets</div>
            </div>
          </div>
          <div className="text-[9px] px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-all">ENTER</div>
        </button>

        <button
          onClick={handleEnterAR}
          className="relative overflow-hidden group flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500/20 hover:to-cyan-500/10 border-2 border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl text-cyan-400 transition-all font-black text-xs uppercase tracking-widest"
        >
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="leading-tight">Immersive AR</div>
              <div className="text-[7px] text-cyan-400/50 font-bold tracking-wider uppercase mt-0.5">Android 14+ / Mobile AR</div>
            </div>
          </div>
          <div className="text-[9px] px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 rounded text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">ENTER</div>
        </button>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className="flex items-center gap-2 text-[10px] text-white/70 bg-white/5 border border-white/10 p-2.5 rounded-xl uppercase tracking-wider justify-center">
          <AlertCircle size={12} className="text-cyan-400 animate-pulse flex-shrink-0" />
          <span className="font-bold truncate">{statusMessage}</span>
        </div>
      )}

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 pt-3 flex flex-col gap-2 text-[9px] text-white/50 uppercase tracking-wider leading-relaxed"
          >
            <div>
              💡 <span className="text-amber-400 font-bold">VR Mode:</span> Uses <code className="text-white bg-white/5 px-1 rounded">immersive-vr</code> format for Quest 3S, Oculus, and standalone OpenXR headsets.
            </div>
            <div>
              📱 <span className="text-cyan-400 font-bold">AR Mode:</span> Uses <code className="text-white bg-white/5 px-1 rounded">immersive-ar</code> format for spatial passthrough, Android 14+ ARKit/ARCore, and WebXR-compatible browsers.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {xrSupported === false && (
        <div className="text-[9px] text-rose-400/80 uppercase font-black tracking-widest border border-rose-500/20 p-2.5 rounded-xl bg-rose-500/5 leading-normal">
          ⚠️ WebXR not supported on this browser. Try Chrome on Android, Oculus Browser, or WebXR Emulator extension.
        </div>
      )}
    </div>
  );
}
