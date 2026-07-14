import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Glasses, 
  Smartphone, 
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  Check,
  Cpu, 
  Folder, 
  FileCode, 
  Play, 
  Terminal, 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  Settings 
} from 'lucide-react';
import { xrStore } from './Game';
import { soundService } from '../services/soundService';

export function WebXRHUD() {
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [vrSupported, setVrSupported] = useState<boolean>(false);
  const [arSupported, setArSupported] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // VR OS Loader states
  const [showOsLoader, setShowOsLoader] = useState<boolean>(false);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'ready'>('idle');
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const [osFiles, setOsFiles] = useState([
    {
      name: 'AndroidManifest.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="com.zenith.vros">

    <uses-feature android:name="android.hardware.vr.headtracking" android:version="1" android:required="true" />
    <uses-feature android:name="oculus.software.handtracking" android:required="false" />
    <uses-feature android:name="com.oculus.feature.PASSTHROUGH" android:required="false" />

    <uses-permission android:name="com.oculus.permission.HAND_TRACKING" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:label="ZenithVR OS Spatial Shell"
        android:theme="@android:style/Theme.Black.NoTitleBar.Fullscreen">

        <meta-data android:name="com.oculus.supportedDevices" android:value="quest2|quest3|quest3s|pro" />

        <activity
            android:name=".MainActivity"
            android:label="ZenithVR OS Main Compositor"
            android:screenOrientation="landscape"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="com.oculus.intent.category.VR" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
    },
    {
      name: 'vros_config.json',
      content: `{
  "vros_name": "ZenithVR OS",
  "build_version": "v2.1.0-alpha",
  "target_refresh_rate": "120Hz",
  "gesture_engine_enabled": true,
  "spatial_passthrough": {
    "enabled": true,
    "transparency": 0.85,
    "chroma_key_color": "#00ff00"
  },
  "modules": [
    { "name": "VROSKernel", "status": "active" },
    { "name": "EyeTrackingModule", "status": "active" },
    { "name": "TactileHapticsCompositor", "status": "standby" }
  ]
}`
    },
    {
      name: 'vros_driver.cpp',
      content: `// ZenithVR OS Spatial Gesture & Tracking Driver
// Target: WebXR / OpenXR Spatial Compositor API

#include <vr_os_kernel.h>
#include <xr_compositor_api.h>

void InitializeVROSDriver() {
    // Calibrate spatial tracking vectors
    VROSKernel::SetTrackingSensitivity(0.98f);
    VROSKernel::EnableGesture("pinch_to_select", true);
    VROSKernel::EnableGesture("wrist_flick_menu", true);
    
    // Bind high refresh rate overlays
    XRCompositor::RegisterVirtualOverlay("com.vros.hud", 120.0f);
    XRCompositor::EnableDirectPassthrough(true);
    
    VROSKernel::Log("[ZenithVR OS] Spatial kernel and gesture systems loaded.");
}`
    }
  ]);

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
      if (typeof soundService?.playSFX === 'function') soundService.playSFX('ui_click');
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
      if (typeof soundService?.playSFX === 'function') soundService.playSFX('ui_click');
      await xrStore.enterAR();
      setStatusMessage('AR Immersive Mode Active');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`AR Failed: ${err?.message || 'Unsupported device'}`);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const startBootOS = () => {
    if (bootState === 'booting') return;
    setBootState('booting');
    setBootProgress(0);
    setBootLogs([]);
    if (typeof soundService?.playSFX === 'function') soundService.playSFX('ui_click');

    const logs = [
      "⚡ [BOOT] Initializing ZenithVR OS custom spatial kernel bootstrap...",
      "📂 [BOOT] Mounting local physical '/os/' folder partition...",
      "🔍 [BOOT] Scanning VR OS folder for native spatial configurations...",
      "📜 [BOOT] Found AndroidManifest.xml - loading VR manifest rules...",
      "🔍 [BOOT] Intent filter category 'com.oculus.intent.category.VR' detected.",
      "⚙️ [BOOT] Parsing 'vros_config.json' system parameters...",
      "💡 [BOOT] Configuration: Target rate = 120Hz // Gesture engine = ACTIVE",
      "🛠️ [BOOT] Compiling native driver 'vros_driver.cpp' with OpenXR compiler...",
      "🔧 [BOOT] OpenXR spatial alignment calibrated to headset gyroscopes.",
      "🌌 [BOOT] Initializing Spatial Passthrough layer at 85% transparency.",
      "🟢 [BOOT] ZenithVR OS successfully injected! Shell compositor ACTIVE."
    ];

    let currentProgress = 0;
    let logIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 100) currentProgress = 100;
      setBootProgress(currentProgress);

      const targetLogIndex = Math.floor((currentProgress / 100) * logs.length);
      if (logIndex < targetLogIndex && logIndex < logs.length) {
        setBootLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
      }

      if (currentProgress === 100) {
        clearInterval(interval);
        setBootState('ready');
        setStatusMessage('VR OS: ZenithVR OS Active (120Hz)');
        if (typeof soundService?.playSFX === 'function') soundService.playSFX('achievement');
      }
    }, 150);
  };

  const handleContentChange = (index: number, newContent: string) => {
    setOsFiles(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: newContent };
      return copy;
    });
  };

  return (
    <div id="webxr_hud_panel" className="bg-zinc-950/95 border border-white/10 rounded-3xl p-5 w-80 md:w-[380px] shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden flex flex-col gap-4 text-white">
      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[45px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 blur-[45px] rounded-full pointer-events-none" />

      {/* Title Header */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">WebXR Immersive HUD</span>
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

      {/* Main Action Buttons */}
      <div className="flex flex-col gap-2 relative z-10">
        <button
          onClick={handleEnterVR}
          className="relative overflow-hidden group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl text-amber-400 transition-all font-black text-xs uppercase tracking-widest"
        >
          <div className="flex items-center gap-3">
            <Glasses size={18} className="group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="leading-tight text-[11px]">Immersive VR</div>
              <div className="text-[7px] text-amber-400/50 font-bold tracking-wider uppercase mt-0.5 font-mono">Oculus & XR Systems</div>
            </div>
          </div>
          <div className="text-[8px] px-2 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-all">ENTER</div>
        </button>

        <button
          onClick={handleEnterAR}
          className="relative overflow-hidden group flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500/20 hover:to-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl text-cyan-400 transition-all font-black text-xs uppercase tracking-widest"
        >
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="group-hover:scale-110 transition-all" />
            <div className="text-left">
              <div className="leading-tight text-[11px]">Immersive AR</div>
              <div className="text-[7px] text-cyan-400/50 font-bold tracking-wider uppercase mt-0.5 font-mono">Mobile AR passthrough</div>
            </div>
          </div>
          <div className="text-[8px] px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 rounded text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">ENTER</div>
        </button>
      </div>

      {/* --- VR OS LOADER / BOOTSTRAPPER COMPONENT --- */}
      <div className="border border-white/5 bg-white/5 rounded-2xl p-3 flex flex-col gap-2 relative z-10">
        <div 
          onClick={() => setShowOsLoader(!showOsLoader)}
          className="flex justify-between items-center cursor-pointer hover:text-cyan-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">🎮 Custom VR OS Loader</span>
          </div>
          <div className="text-zinc-500">
            {showOsLoader ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </div>

        {showOsLoader && (
          <div className="flex flex-col gap-3 mt-1 pt-2 border-t border-white/5">
            {/* File explorer tabs inside WebXR panel */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-white/5">
              {osFiles.map((f, idx) => (
                <button
                  key={f.name}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    if (typeof soundService?.playSFX === 'function') soundService.playSFX('ui_click');
                  }}
                  className={`px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap transition-all border flex items-center gap-1 ${
                    activeFileIndex === idx
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <FileCode size={10} className={f.name.endsWith('.xml') ? 'text-amber-500' : 'text-blue-400'} />
                  {f.name}
                </button>
              ))}
            </div>

            {/* Quick mini-editor for files */}
            <div className="relative">
              <div className="absolute top-1.5 right-2 text-[7px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
                File Preview / Editor
              </div>
              <textarea
                value={osFiles[activeFileIndex].content}
                onChange={(e) => handleContentChange(activeFileIndex, e.target.value)}
                className="w-full h-24 bg-black/50 border border-white/10 rounded-lg p-2 font-mono text-[9px] text-emerald-400/95 leading-normal focus:outline-none focus:border-cyan-500/50 custom-scrollbar resize-none"
              />
            </div>

            {/* Action launcher */}
            <div className="flex flex-col gap-2">
              {bootState === 'idle' && (
                <button
                  onClick={startBootOS}
                  className="w-full py-2 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 border border-cyan-500/40 hover:border-cyan-500/80 rounded-xl font-bold text-[10px] tracking-wider uppercase text-cyan-300 flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  <Play size={12} className="fill-cyan-300 text-cyan-300" />
                  Boot custom VR OS
                </button>
              )}

              {bootState === 'booting' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin text-cyan-400" />
                      Bootstrapping Spatial Kernel...
                    </span>
                    <span className="font-bold text-cyan-400">{bootProgress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      style={{ width: `${bootProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {bootState === 'ready' && (
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[9px] uppercase font-black tracking-widest flex items-center gap-2">
                    <Check size={12} className="text-emerald-400" />
                    VR OS Active at 120Hz
                  </div>
                  <button
                    onClick={() => {
                      setBootState('idle');
                      setStatusMessage('');
                      if (typeof soundService?.playSFX === 'function') soundService.playSFX('ui_click');
                    }}
                    className="px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 rounded-xl text-zinc-400 hover:text-white text-[8px] uppercase font-bold transition-all"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Realtime Terminal Console Output */}
              {(bootLogs.length > 0) && (
                <div className="bg-black/80 border border-white/5 rounded-lg p-2.5 font-mono text-[7px] text-zinc-400/90 flex flex-col gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                  <div className="text-[6px] text-zinc-600 font-bold uppercase tracking-wider border-b border-white/5 pb-1 flex items-center gap-1">
                    <Terminal size={8} />
                    OS Compiler Terminal Output
                  </div>
                  {bootLogs.map((log, i) => (
                    <div 
                      key={i} 
                      className={
                        log.includes('[SUCCESS]') || log.includes('🟢') || log.includes('SUCCESS')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('⚡') 
                            ? 'text-cyan-400'
                            : 'text-zinc-500'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Messages overlay */}
      {statusMessage && (
        <div className="flex items-center gap-2 text-[9px] text-white/70 bg-white/5 border border-white/10 p-2 rounded-xl uppercase tracking-wider justify-center">
          <AlertCircle size={12} className="text-cyan-400 animate-pulse flex-shrink-0" />
          <span className="font-bold truncate">{statusMessage}</span>
        </div>
      )}

      {/* Help Instructions panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/5 pt-3 flex flex-col gap-2 text-[9px] text-white/50 uppercase tracking-wider leading-relaxed"
          >
            <div>
              💡 <span className="text-amber-400 font-bold">VR Mode:</span> Supports Meta Quest 2/3/3S/Pro via WebXR. Loads immersive-vr shell.
            </div>
            <div>
              📱 <span className="text-cyan-400 font-bold">AR Mode:</span> Leverages mobile camera passthrough with 85% transparency and real-time color chroma overlays.
            </div>
            <div>
              🔧 <span className="text-blue-400 font-bold">VR OS:</span> Bootstraps custom Android manifest setups and hand-gesture recognition parameters.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {xrSupported === false && (
        <div className="text-[9px] text-rose-400/80 uppercase font-black tracking-widest border border-rose-500/20 p-2 rounded-xl bg-rose-500/5 leading-normal">
          ⚠️ WebXR not supported on this browser. Try Chrome on Android, Oculus Browser, or WebXR Emulator extension.
        </div>
      )}
    </div>
  );
}
