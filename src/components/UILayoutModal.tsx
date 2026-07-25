/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { 
  X, 
  Layout, 
  Crosshair as CrosshairIcon, 
  Sliders, 
  Eye, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  Layers
} from 'lucide-react';
import { 
  UILayoutConfig, 
  DEFAULT_UI_LAYOUT_CONFIG, 
  saveUILayoutConfig, 
  resetUILayoutConfig, 
  exportUILayoutConfigJSON, 
  importUILayoutConfigJSON 
} from '../utils/uiLayoutManager';

export function UILayoutModal({ isOpen = true, onClose }: { isOpen?: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  const uiLayoutConfig = useGameStore(state => state.uiLayoutConfig);
  const setUILayoutConfig = useGameStore(state => state.setUILayoutConfig);

  const [activeTab, setActiveTab] = useState<'crosshair' | 'hud' | 'toggles' | 'export'>('crosshair');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const updateConfig = (updates: Partial<UILayoutConfig>) => {
    const updated = { ...uiLayoutConfig, ...updates };
    setUILayoutConfig(updated);
    saveUILayoutConfig(updated);
  };

  const handleReset = () => {
    const resetVal = resetUILayoutConfig();
    setUILayoutConfig(resetVal);
  };

  const handleExportCopy = () => {
    const jsonStr = exportUILayoutConfigJSON(uiLayoutConfig);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = () => {
    const imported = importUILayoutConfigJSON(importText);
    if (imported) {
      setUILayoutConfig(imported);
      setImportStatus('✅ Custom HUD layout configuration successfully applied!');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('❌ Invalid JSON configuration formatting.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const presetColors = ['#f59e0b', '#00ffff', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#ffffff', '#a855f7'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[115] flex items-center justify-center p-4 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-zinc-950 border-2 border-amber-500/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.25)] text-white flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-900/80 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/40">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wider uppercase text-amber-400">UI & HUD Layout Manager</h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase">Save, Load & Calibrate Custom In-Game Interface Configurations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('crosshair')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer ${
              activeTab === 'crosshair' 
                ? 'bg-zinc-900 text-amber-400 border-amber-500/40 border-b-transparent shadow-lg' 
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <CrosshairIcon size={14} />
            <span>Crosshair Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('hud')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer ${
              activeTab === 'hud' 
                ? 'bg-zinc-900 text-amber-400 border-amber-500/40 border-b-transparent shadow-lg' 
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>HUD Scale & Position</span>
          </button>

          <button
            onClick={() => setActiveTab('toggles')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer ${
              activeTab === 'toggles' 
                ? 'bg-zinc-900 text-amber-400 border-amber-500/40 border-b-transparent shadow-lg' 
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Element Visibility</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all flex items-center gap-2 border-t border-x cursor-pointer ${
              activeTab === 'export' 
                ? 'bg-zinc-900 text-amber-400 border-amber-500/40 border-b-transparent shadow-lg' 
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Import / Export Config</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'crosshair' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-zinc-300 block mb-2">Crosshair Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dynamic', 'cross', 'dot', 'circle', 'ring'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => updateConfig({ crosshairStyle: style })}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                          uiLayoutConfig.crosshairStyle === style 
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/30'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs font-black uppercase text-zinc-300 block mb-2">Crosshair Color</label>
                  <div className="flex items-center gap-2 mb-2">
                    {presetColors.map(c => (
                      <button
                        key={c}
                        onClick={() => updateConfig({ crosshairColor: c })}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                          uiLayoutConfig.crosshairColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                      <span>SCALE ({uiLayoutConfig.crosshairScale.toFixed(1)}x)</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={uiLayoutConfig.crosshairScale}
                      onChange={(e) => updateConfig({ crosshairScale: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                      <span>GAP ({uiLayoutConfig.crosshairGap}px)</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={uiLayoutConfig.crosshairGap}
                      onChange={(e) => updateConfig({ crosshairGap: parseInt(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                      <span>THICKNESS ({uiLayoutConfig.crosshairThickness}px)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={uiLayoutConfig.crosshairThickness}
                      onChange={(e) => updateConfig({ crosshairThickness: parseInt(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                      <span>OPACITY ({Math.round(uiLayoutConfig.crosshairOpacity * 100)}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={uiLayoutConfig.crosshairOpacity}
                      onChange={(e) => updateConfig({ crosshairOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column Interactive Preview Canvas */}
              <div className="bg-black/80 border-2 border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[260px]">
                {/* Target background grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }} />

                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest absolute top-3 left-4">Interactive Crosshair Preview</div>

                {/* Target Rings */}
                <div className="w-40 h-40 rounded-full border border-zinc-800 border-dashed absolute flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full border border-zinc-800 border-dashed" />
                </div>

                {/* Live Rendered Crosshair Preview */}
                <div 
                  className="relative flex items-center justify-center transition-all duration-150"
                  style={{
                    transform: `scale(${uiLayoutConfig.crosshairScale})`,
                    opacity: uiLayoutConfig.crosshairOpacity
                  }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full shadow"
                    style={{ backgroundColor: uiLayoutConfig.crosshairColor }}
                  />

                  {uiLayoutConfig.crosshairStyle !== 'dot' && (
                    <>
                      <div 
                        className="absolute shadow"
                        style={{
                          backgroundColor: uiLayoutConfig.crosshairColor,
                          width: `${uiLayoutConfig.crosshairThickness}px`,
                          height: '10px',
                          transform: `translateY(-${uiLayoutConfig.crosshairGap + 5}px)`
                        }}
                      />
                      <div 
                        className="absolute shadow"
                        style={{
                          backgroundColor: uiLayoutConfig.crosshairColor,
                          width: `${uiLayoutConfig.crosshairThickness}px`,
                          height: '10px',
                          transform: `translateY(${uiLayoutConfig.crosshairGap + 5}px)`
                        }}
                      />
                      <div 
                        className="absolute shadow"
                        style={{
                          backgroundColor: uiLayoutConfig.crosshairColor,
                          height: `${uiLayoutConfig.crosshairThickness}px`,
                          width: '10px',
                          transform: `translateX(-${uiLayoutConfig.crosshairGap + 5}px)`
                        }}
                      />
                      <div 
                        className="absolute shadow"
                        style={{
                          backgroundColor: uiLayoutConfig.crosshairColor,
                          height: `${uiLayoutConfig.crosshairThickness}px`,
                          width: '10px',
                          transform: `translateX(${uiLayoutConfig.crosshairGap + 5}px)`
                        }}
                      />
                    </>
                  )}

                  {(uiLayoutConfig.crosshairStyle === 'circle' || uiLayoutConfig.crosshairStyle === 'ring') && (
                    <div 
                      className="absolute rounded-full border shadow"
                      style={{
                        borderColor: uiLayoutConfig.crosshairColor,
                        borderWidth: `${uiLayoutConfig.crosshairThickness}px`,
                        width: `${uiLayoutConfig.crosshairGap * 2.5}px`,
                        height: `${uiLayoutConfig.crosshairGap * 2.5}px`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hud' && (
            <div className="space-y-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                    <span>Overall HUD Scale ({Math.round(uiLayoutConfig.hudScale * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={uiLayoutConfig.hudScale}
                    onChange={(e) => updateConfig({ hudScale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black uppercase text-zinc-300 mb-2">
                    <span>HUD Opacity ({Math.round(uiLayoutConfig.hudOpacity * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={uiLayoutConfig.hudOpacity}
                    onChange={(e) => updateConfig({ hudOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-zinc-300 block mb-2">HUD Layout Preset</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['default', 'compact', 'wide', 'centered'] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => updateConfig({ hudPositionPreset: preset })}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        uiLayoutConfig.hudPositionPreset === preset 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xs font-black uppercase italic mb-1">{preset}</div>
                      <div className="text-[9px] text-zinc-400 font-mono">
                        {preset === 'default' && 'Balanced AAA layout'}
                        {preset === 'compact' && 'Tighter elements, high FOV view'}
                        {preset === 'wide' && 'Pushed to screen edges'}
                        {preset === 'centered' && 'Esports focus centered HUD'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'toggles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'showCrosshair', label: 'Crosshair Overlay', desc: 'Center aim indicator' },
                { key: 'showKillFeed', label: 'Kill Feed Feed', desc: 'Animated kill notifications' },
                { key: 'showMinimap', label: 'Minimap & Radar', desc: 'Tactical mini map' },
                { key: 'showHealthBar', label: 'Health & Shields Bar', desc: 'Player vital statistics' },
                { key: 'showStatsBar', label: 'Match Scoreboard / Stats', desc: 'Kills, deaths, score info' },
                { key: 'showChat', label: 'Chat Log', desc: 'Multiplayer chat messages' },
                { key: 'showEventLog', label: 'System Event Log', desc: 'Combat announcements' },
                { key: 'showPings', label: 'Tactical Pings', desc: '3D world location pings' },
              ].map(item => {
                const key = item.key as keyof UILayoutConfig;
                const val = !!uiLayoutConfig[key];
                return (
                  <div
                    key={key}
                    onClick={() => updateConfig({ [key]: !val })}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      val ? 'bg-amber-500/10 border-amber-500/40 text-white' : 'bg-white/5 border-white/10 text-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider">{item.label}</div>
                      <div className="text-[9px] font-mono text-zinc-400">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      val ? 'bg-amber-400 border-amber-400 text-black' : 'border-zinc-600 bg-black/40'
                    }`}>
                      {val && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              {importStatus && (
                <div className="p-3 bg-zinc-900 border border-amber-400/50 rounded-xl text-center text-xs font-mono font-black text-amber-400 animate-pulse">
                  {importStatus}
                </div>
              )}

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-zinc-300">Export Current Configuration</span>
                  <button
                    onClick={handleExportCopy}
                    className="px-4 py-2 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY CONFIG JSON'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={exportUILayoutConfigJSON(uiLayoutConfig)}
                  className="w-full h-28 bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-amber-300 resize-none focus:outline-none"
                />
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-black uppercase text-zinc-300 block">Import Custom Config JSON</span>
                <textarea
                  placeholder="Paste configuration JSON here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-24 bg-black/60 border border-white/10 rounded-xl p-3 text-[10px] font-mono text-zinc-200 resize-none focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleImportSubmit}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-amber-400 hover:text-black border border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>APPLY IMPORTED CONFIGURATION</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-900/80 border-t border-amber-500/20">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-zinc-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-400 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            Done & Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
