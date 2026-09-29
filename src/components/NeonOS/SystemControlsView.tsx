import React, { useState } from 'react';
import { 
  Sliders, Cpu, Shield, ShieldCheck, Terminal, Flame, Zap, 
  RefreshCw, CheckCircle2, Lock, Smartphone, Wifi, Bluetooth
} from 'lucide-react';
import { soundService } from '../../services/soundService';

export const SystemControlsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'security' | 'devmode'>('performance');
  const [cpuGovernor, setCpuGovernor] = useState<'overclock' | 'performance' | 'balanced' | 'powersave'>('performance');
  const [gpuRayTracing, setGpuRayTracing] = useState(true);
  const [firewallActive, setFirewallActive] = useState(true);
  const [devConsoleLogs, setDevConsoleLogs] = useState<string[]>([
    'KERNEL: Neon OS Monolithic Microkernel v4.2.0-rt loaded',
    'SECURITY: Sandboxing enforced across 68.93 GB App Manager',
    'GPU: Vulkan / WebGL2 Direct pipeline mapped to 144Hz output',
    'DEV: Debug symbols enabled for in-game telemetry'
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('powerup');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-orange-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 border border-orange-500/40 rounded-xl text-orange-400">
            <Sliders size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-orange-400 uppercase tracking-tight">ADVANCED SYSTEM CONTROLS & DEV MODE</h2>
              <span className="text-[10px] font-black bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/40">
                ROOT PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              CPU/GPU Governors • Thermal Management • Security Firewalls • Real-Time Kernel Logs
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'performance' ? 'bg-orange-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Performance & GPU
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'security' ? 'bg-orange-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Security Centre
          </button>
          <button
            onClick={() => setActiveTab('devmode')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'devmode' ? 'bg-orange-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kernel Console
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-orange-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase">HARDWARE GOVERNORS & THERMAL POLICIES</h3>
              <p className="text-xs text-zinc-400 mt-1">Calibrate clock speeds, GPU memory bandwidth, and thermal fan curves.</p>
            </div>

            {/* CPU Governor Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { id: 'overclock', label: 'Overclock Extreme', desc: '5.2 GHz All-Core boost for 144 FPS VR & Combined Arms', color: 'border-red-500/40 text-red-400' },
                { id: 'performance', label: 'High Performance', desc: 'Max clock scaling with intelligent thermal throttling', color: 'border-orange-500/40 text-orange-400' },
                { id: 'balanced', label: 'Balanced Dynamic', desc: 'Auto-switches frequencies based on active viewport load', color: 'border-cyan-500/40 text-cyan-400' },
                { id: 'powersave', label: 'Ultra Battery Saver', desc: 'Limits CPU to 1.8 GHz for 18+ hours mobile runtime', color: 'border-emerald-500/40 text-emerald-400' }
              ].map(gov => (
                <div
                  key={gov.id}
                  onClick={() => {
                    setCpuGovernor(gov.id as any);
                    showToast(`Switched CPU Governor to ${gov.label}`);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    cpuGovernor === gov.id ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase ${gov.color}`}>{gov.label}</span>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{gov.desc}</p>
                </div>
              ))}
            </div>

            {/* GPU Settings */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-black text-white uppercase">GPU PIPELINE & SHADER ACCELERATION</h4>
              <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
                <div>
                  <span className="font-bold text-white block">Hardware Accelerated Ray-Tracing</span>
                  <span className="text-zinc-400 text-[10px]">Real-time reflections on wet asphalt and vehicle armor</span>
                </div>
                <button
                  onClick={() => {
                    setGpuRayTracing(!gpuRayTracing);
                    showToast(gpuRayTracing ? 'Disabled Ray Tracing' : 'Enabled Ray Tracing Pipeline');
                  }}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs ${gpuRayTracing ? 'bg-orange-500 text-black font-black' : 'bg-white/10 text-zinc-400'}`}
                >
                  {gpuRayTracing ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-white uppercase">NEON SECURITY & PRIVACY SHIELD</h3>
              <p className="text-xs text-zinc-400 mt-1">Real-time anti-malware, network packet firewall, and biometric locks.</p>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={24} className="text-emerald-400" />
                  <div>
                    <h4 className="font-black text-white uppercase">Decentralized Threat Firewall</h4>
                    <span className="text-[10px] text-zinc-400">Zero rogue telemetry • Strict sandbox execution</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-lg">PROTECTED</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devmode' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase">LIVE KERNEL SYSTEM CONSOLE</h3>
              <button
                onClick={() => {
                  setDevConsoleLogs(prev => [`[${new Date().toLocaleTimeString()}] PING: Render pipeline latency verified.`, ...prev]);
                  showToast('Kernel log heartbeat emitted.');
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold"
              >
                + Inject Trace Ping
              </button>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-4 h-64 overflow-y-auto text-xs font-mono space-y-1.5 text-zinc-300">
              {devConsoleLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 select-none">[{idx + 1}]</span>
                  <span className="text-orange-400">$&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
