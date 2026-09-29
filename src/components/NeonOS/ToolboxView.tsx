import React, { useState } from 'react';
import { 
  Wrench, Calculator, ArrowRightLeft, FileCode, Video, Image, FileArchive,
  Activity, Terminal, HardDrive, Wifi, Cpu, Camera, Check, Play, RefreshCw
} from 'lucide-react';
import { soundService } from '../../services/soundService';

export const ToolboxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter' | 'diagnostics' | 'devtools'>('calculator');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Unit converter states
  const [convVal, setConvVal] = useState(100);
  const [convType, setConvType] = useState<'speed' | 'storage' | 'currency'>('speed');

  // Diagnostics states
  const [pingMs, setPingMs] = useState(14);
  const [fpsVal, setFpsVal] = useState(120);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramUsage, setRamUsage] = useState(5.4);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('ui_click');
    setTimeout(() => setToast(null), 3000);
  };

  const handleCalcNum = (num: string) => {
    soundService.playSFX('ui_click');
    setCalcDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleCalcOp = (op: string) => {
    soundService.playSFX('ui_click');
    setCalcMemory(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    soundService.playSFX('powerup');
    if (calcMemory === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (calcOp === '+') result = calcMemory + current;
    else if (calcOp === '-') result = calcMemory - current;
    else if (calcOp === '×') result = calcMemory * current;
    else if (calcOp === '÷') result = current !== 0 ? calcMemory / current : 0;

    setCalcDisplay(result.toString());
    setCalcMemory(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    soundService.playSFX('ui_click');
    setCalcDisplay('0');
    setCalcMemory(null);
    setCalcOp(null);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-zinc-900 border-b border-cyan-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
            <Wrench size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-cyan-400 uppercase tracking-tight">NEON TOOLBOX SUITE</h2>
              <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                SUITE ≈ 300 GB
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Calculation • Measurement Converters • Media Compression • Hardware Diagnostics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'calculator' ? 'bg-cyan-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'converter' ? 'bg-cyan-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'diagnostics' ? 'bg-cyan-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Diagnostics
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-cyan-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
        {activeTab === 'calculator' && (
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            {/* Display Screen */}
            <div className="bg-black/80 border border-cyan-500/30 rounded-2xl p-4 mb-4 text-right">
              <span className="text-[10px] text-zinc-500 font-bold block">
                {calcMemory !== null && calcOp ? `${calcMemory} ${calcOp}` : 'NEON PRECISION MATH'}
              </span>
              <span className="text-3xl font-black text-cyan-400 tracking-tight">{calcDisplay}</span>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-2 text-sm font-bold">
              <button onClick={handleCalcClear} className="col-span-2 py-3 bg-red-500/20 hover:bg-red-500 hover:text-black border border-red-500/40 text-red-300 rounded-xl">AC</button>
              <button onClick={() => handleCalcOp('÷')} className="py-3 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl">÷</button>
              <button onClick={() => handleCalcOp('×')} className="py-3 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl">×</button>

              {['7', '8', '9'].map(n => (
                <button key={n} onClick={() => handleCalcNum(n)} className="py-3 bg-white/5 hover:bg-white/15 rounded-xl">{n}</button>
              ))}
              <button onClick={() => handleCalcOp('-')} className="py-3 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl">-</button>

              {['4', '5', '6'].map(n => (
                <button key={n} onClick={() => handleCalcNum(n)} className="py-3 bg-white/5 hover:bg-white/15 rounded-xl">{n}</button>
              ))}
              <button onClick={() => handleCalcOp('+')} className="py-3 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-xl">+</button>

              {['1', '2', '3'].map(n => (
                <button key={n} onClick={() => handleCalcNum(n)} className="py-3 bg-white/5 hover:bg-white/15 rounded-xl">{n}</button>
              ))}
              <button onClick={handleCalcEquals} className="row-span-2 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-lg flex items-center justify-center">=</button>

              <button onClick={() => handleCalcNum('0')} className="col-span-2 py-3 bg-white/5 hover:bg-white/15 rounded-xl">0</button>
              <button onClick={() => handleCalcNum('.')} className="py-3 bg-white/5 hover:bg-white/15 rounded-xl">.</button>
            </div>
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-5">
            <h3 className="text-lg font-black text-white uppercase">NEON MULTI-UNIT CONVERTER</h3>

            <div className="flex gap-2">
              {[
                { id: 'speed', label: 'Speed (KM/H ↔ Knots ↔ Mach)' },
                { id: 'storage', label: 'Storage (GB ↔ TB ↔ PB)' },
                { id: 'currency', label: 'Arena Credits ↔ Solana' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setConvType(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    convType === t.id ? 'bg-cyan-400 text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Input Value:</label>
              <input
                type="number"
                value={convVal}
                onChange={(e) => setConvVal(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-cyan-400 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-black/50 p-4 rounded-2xl border border-white/5">
              {convType === 'speed' && (
                <>
                  <div>
                    <span className="text-zinc-500 uppercase">Knots (Nautical):</span>
                    <div className="text-lg font-black text-white mt-1">{(convVal * 0.539957).toFixed(2)} KTS</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Mach (Speed of Sound):</span>
                    <div className="text-lg font-black text-cyan-400 mt-1">{(convVal / 1234.8).toFixed(3)} M</div>
                  </div>
                </>
              )}
              {convType === 'storage' && (
                <>
                  <div>
                    <span className="text-zinc-500 uppercase">Terabytes (TB):</span>
                    <div className="text-lg font-black text-white mt-1">{(convVal / 1024).toFixed(3)} TB</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">Megabytes (MB):</span>
                    <div className="text-lg font-black text-cyan-400 mt-1">{(convVal * 1024).toLocaleString()} MB</div>
                  </div>
                </>
              )}
              {convType === 'currency' && (
                <>
                  <div>
                    <span className="text-zinc-500 uppercase">Solana (SOL Est.):</span>
                    <div className="text-lg font-black text-white mt-1">{(convVal * 0.00045).toFixed(4)} SOL</div>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase">US Dollar (USD):</span>
                    <div className="text-lg font-black text-emerald-400 mt-1">${(convVal * 0.08).toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase">HARDWARE & NETWORK TELEMETRY</h3>
                <p className="text-xs text-zinc-400">Real-time device vitals, shader compilation, and socket latency.</p>
              </div>
              <button
                onClick={() => {
                  setPingMs(Math.round(12 + Math.random() * 8));
                  setCpuUsage(Math.round(20 + Math.random() * 15));
                  showToast('Diagnostics refreshed: All sensors nominal.');
                }}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-cyan-400 hover:text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Run Health Check</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Socket Latency</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{pingMs} ms</div>
                <span className="text-[10px] text-zinc-500">Tier-1 Direct Fiber</span>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Frame Rate</span>
                <div className="text-2xl font-black text-cyan-400 mt-1">{fpsVal} FPS</div>
                <span className="text-[10px] text-zinc-500">V-Sync Locked</span>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">CPU Core Load</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{cpuUsage}%</div>
                <span className="text-[10px] text-zinc-500">8 Cores Active</span>
              </div>
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Unified RAM</span>
                <div className="text-2xl font-black text-white mt-1">{ramUsage} GB</div>
                <span className="text-[10px] text-zinc-500">of 16 GB Physical</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
