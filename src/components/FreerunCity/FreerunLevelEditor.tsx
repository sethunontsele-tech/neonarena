import React, { useState } from 'react';
import { LevelEditorObject, CustomMap } from './types';
import { Plus, Trash2, Save, Play, Download, Upload, Share2, Layers, RotateCcw, Move, Box, ArrowUp, Zap, Flag, Eye } from 'lucide-react';

interface FreerunLevelEditorProps {
  currentMap: CustomMap;
  onUpdateMap: (map: CustomMap) => void;
  onTestPlay: () => void;
  onExitEditor: () => void;
  onPublishMap: (map: CustomMap) => void;
}

const PALETTE_OBJECTS: {
  type: LevelEditorObject['type'];
  label: string;
  category: 'Structure' | 'Parkour' | 'Interactive' | 'Marker' | 'Decor';
  defaultScale: [number, number, number];
  defaultColor: string;
}[] = [
  // Structure
  { type: 'building', label: 'Skyscraper Block', category: 'Structure', defaultScale: [14, 25, 14], defaultColor: '#1e293b' },
  { type: 'platform', label: 'Rooftop Platform', category: 'Structure', defaultScale: [10, 0.5, 10], defaultColor: '#334155' },
  { type: 'wall', label: 'Wallrun Panel', category: 'Structure', defaultScale: [0.4, 6, 12], defaultColor: '#0ea5e9' },
  { type: 'ramp', label: 'Incline Ramp', category: 'Structure', defaultScale: [4, 3, 8], defaultColor: '#475569' },
  // Parkour & Traversal
  { type: 'pipe', label: 'Grind Rail / Pipe', category: 'Parkour', defaultScale: [0.2, 0.2, 16], defaultColor: '#06b6d4' },
  { type: 'grind_rail', label: 'High Balance Beam', category: 'Parkour', defaultScale: [0.3, 0.4, 12], defaultColor: '#f59e0b' },
  { type: 'moving_platform', label: 'Moving Kinetic Lift', category: 'Parkour', defaultScale: [4, 0.4, 4], defaultColor: '#10b981' },
  // Interactive & Boosters
  { type: 'launch_pad', label: 'Fan Vent Launch Pad', category: 'Interactive', defaultScale: [2.5, 0.3, 2.5], defaultColor: '#06b6d4' },
  { type: 'speed_booster', label: 'Speed Booster Strip', category: 'Interactive', defaultScale: [3, 0.1, 8], defaultColor: '#facc15' },
  { type: 'fan_vent', label: 'Air Cushion Drop', category: 'Interactive', defaultScale: [3, 0.4, 3], defaultColor: '#ec4899' },
  // Markers & Checkpoints
  { type: 'checkpoint', label: 'Checkpoint Ring', category: 'Marker', defaultScale: [3, 3, 0.5], defaultColor: '#f59e0b' },
  // Decor
  { type: 'neon_sign', label: 'Cyber Neon Sign', category: 'Decor', defaultScale: [4, 1.5, 0.2], defaultColor: '#ec4899' },
  { type: 'arrow_holo', label: 'Flow Direction Arrow', category: 'Decor', defaultScale: [1.5, 1.5, 0.2], defaultColor: '#38bdf8' },
  { type: 'graffiti', label: 'Graffiti Tag Decal', category: 'Decor', defaultScale: [3, 2, 0.1], defaultColor: '#10b981' },
];

export function FreerunLevelEditor({
  currentMap,
  onUpdateMap,
  onTestPlay,
  onExitEditor,
  onPublishMap
}: FreerunLevelEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Structure' | 'Parkour' | 'Interactive' | 'Marker' | 'Decor'>('All');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const selectedObj = currentMap.objects.find(o => o.id === selectedObjectId);

  const handleAddObject = (palette: typeof PALETTE_OBJECTS[0]) => {
    const newObj: LevelEditorObject = {
      id: `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: palette.type,
      position: [0, 15, 0],
      rotation: [0, 0, 0],
      scale: [...palette.defaultScale],
      color: palette.defaultColor,
      isCollidable: true,
      isVaultable: palette.category === 'Parkour',
      isWallrunnable: palette.type === 'wall',
    };

    onUpdateMap({
      ...currentMap,
      objects: [...currentMap.objects, newObj]
    });
    setSelectedObjectId(newObj.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    onUpdateMap({
      ...currentMap,
      objects: currentMap.objects.filter(o => o.id !== selectedObjectId)
    });
    setSelectedObjectId(null);
  };

  const handleUpdateSelected = (patch: Partial<LevelEditorObject>) => {
    if (!selectedObjectId) return;
    onUpdateMap({
      ...currentMap,
      objects: currentMap.objects.map(o => (o.id === selectedObjectId ? { ...o, ...patch } : o))
    });
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(currentMap, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleImportJSON = () => {
    const input = prompt('Paste map JSON configuration:');
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      if (parsed.objects) {
        onUpdateMap(parsed);
      }
    } catch {
      alert('Invalid Map JSON syntax!');
    }
  };

  const filteredPalette = selectedCategory === 'All' 
    ? PALETTE_OBJECTS 
    : PALETTE_OBJECTS.filter(p => p.category === selectedCategory);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* TOP HEADER BAR */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-black/85 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">NEON ARENA LEVEL BUILDER</div>
            <input
              type="text"
              value={currentMap.title}
              onChange={(e) => onUpdateMap({ ...currentMap, title: e.target.value })}
              className="bg-transparent text-white font-black text-lg outline-none border-b border-transparent hover:border-white/20 focus:border-cyan-400 px-1"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTestPlay}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            <Play size={16} fill="black" /> TEST RUN
          </button>

          <button
            onClick={() => onPublishMap(currentMap)}
            className="flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
          >
            <Share2 size={16} /> PUBLISH
          </button>

          <button
            onClick={handleExportJSON}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl border border-white/10"
            title="Export JSON to clipboard"
          >
            <Download size={18} />
          </button>

          <button
            onClick={handleImportJSON}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl border border-white/10"
            title="Import Map JSON"
          >
            <Upload size={18} />
          </button>

          <button
            onClick={onExitEditor}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-2xl border border-rose-500/30 text-xs font-black uppercase transition-all"
          >
            EXIT
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="self-center bg-cyan-500 text-black font-black text-xs px-4 py-2 rounded-xl shadow-xl animate-bounce">
          Map JSON Copied to Clipboard!
        </div>
      )}

      {/* MIDDLE WORKSPACE: LEFT PALETTE & RIGHT INSPECTOR */}
      <div className="flex justify-between items-start my-4 gap-4 flex-1 overflow-hidden">
        {/* LEFT: OBJECT PALETTE */}
        <div className="pointer-events-auto w-72 bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col max-h-[70vh] shadow-2xl">
          <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-3 flex items-center justify-between">
            <span>OBJECT CATALOG</span>
            <span className="text-cyan-400">{currentMap.objects.length} placed</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(['All', 'Structure', 'Parkour', 'Interactive', 'Marker', 'Decor'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl transition-all ${selectedCategory === cat ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Palette Items Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {filteredPalette.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleAddObject(item)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">{item.label}</div>
                  <div className="text-[9px] text-white/30 uppercase">{item.category}</div>
                </div>
                <Plus size={16} className="text-white/30 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: TRANSFORM INSPECTOR (When object is selected) */}
        {selectedObj ? (
          <div className="pointer-events-auto w-80 bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                SELECTED: {selectedObj.type}
              </span>
              <button
                onClick={handleDeleteSelected}
                className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all"
                title="Delete object"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Position Controls */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-white/40">POSITION (X, Y, Z)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                  <div key={axis} className="flex items-center bg-white/5 rounded-xl px-2 py-1 border border-white/10">
                    <span className="text-[9px] font-bold text-white/30 mr-1">{axis}</span>
                    <input
                      type="number"
                      value={selectedObj.position[i]}
                      onChange={(e) => {
                        const newPos = [...selectedObj.position] as [number, number, number];
                        newPos[i] = parseFloat(e.target.value) || 0;
                        handleUpdateSelected({ position: newPos });
                      }}
                      className="w-full bg-transparent text-xs text-white font-mono outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale Controls */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-white/40">SCALE (WIDTH, HEIGHT, LENGTH)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['W', 'H', 'L'] as const).map((dim, i) => (
                  <div key={dim} className="flex items-center bg-white/5 rounded-xl px-2 py-1 border border-white/10">
                    <span className="text-[9px] font-bold text-white/30 mr-1">{dim}</span>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedObj.scale[i]}
                      onChange={(e) => {
                        const newScale = [...selectedObj.scale] as [number, number, number];
                        newScale[i] = Math.max(0.1, parseFloat(e.target.value) || 1);
                        handleUpdateSelected({ scale: newScale });
                      }}
                      className="w-full bg-transparent text-xs text-white font-mono outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation Controls (Y Angle) */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-white/40">ROTATION Y (DEGREES)</span>
              <input
                type="range"
                min="0"
                max="360"
                value={Math.round((selectedObj.rotation[1] * 180) / Math.PI)}
                onChange={(e) => {
                  const rad = (parseFloat(e.target.value) * Math.PI) / 180;
                  handleUpdateSelected({ rotation: [selectedObj.rotation[0], rad, selectedObj.rotation[2]] });
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Color Accent */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-white/40">NEON COLOR</span>
              <div className="flex gap-2">
                {['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#a855f7', '#38bdf8', '#ef4444', '#1e293b'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleUpdateSelected({ color: c })}
                    className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Traversal Properties */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                <span>Vaultable Obstacle</span>
                <input
                  type="checkbox"
                  checked={!!selectedObj.isVaultable}
                  onChange={(e) => handleUpdateSelected({ isVaultable: e.target.checked })}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-white/80 cursor-pointer">
                <span>Wallrun Surface</span>
                <input
                  type="checkbox"
                  checked={!!selectedObj.isWallrunnable}
                  onChange={(e) => handleUpdateSelected({ isWallrunnable: e.target.checked })}
                  className="accent-cyan-400"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[11px] text-white/40">
            Click an object or add from catalog to edit
          </div>
        )}
      </div>

      {/* BOTTOM HINT BAR */}
      <div className="pointer-events-auto self-center bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-2xl text-xs text-white/60 flex items-center gap-6">
        <span><b>WASD:</b> Pan Camera</span>
        <span><b>Click:</b> Select Object</span>
        <span><b>Shift + Click:</b> Multi-select</span>
        <span><b>Space:</b> Test Mode</span>
      </div>
    </div>
  );
}
