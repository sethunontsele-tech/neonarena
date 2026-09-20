import React, { useState } from 'react';
import { CharacterOutfit } from './types';
import { Shirt, Footprints, Smile, Sparkles, Check, Bookmark, ArrowLeft } from 'lucide-react';

interface FreerunCustomizationProps {
  outfit: CharacterOutfit;
  onUpdateOutfit: (outfit: CharacterOutfit) => void;
  onClose: () => void;
}

const TOPS = [
  { id: 'hoodie', name: 'Traceur Pullover Hoodie', type: 'hoodie' as const },
  { id: 'jacket', name: 'Techwear Zipper Jacket', type: 'jacket' as const },
  { id: 'windbreaker', name: 'Cyber Storm Windbreaker', type: 'windbreaker' as const },
  { id: 'sleeveless', name: 'Urban Athletic Sleeveless', type: 'sleeveless' as const },
  { id: 'tracksuit', name: 'Apex Neon Tracksuit', type: 'tracksuit' as const },
];

const PANTS = [
  { id: 'cargo_joggers', name: 'Reflective Cargo Joggers', type: 'cargo_joggers' as const },
  { id: 'tech_pants', name: 'Harness Tech Pants', type: 'tech_pants' as const },
  { id: 'skinny_athletic', name: 'Flex Athletic Tights', type: 'skinny_athletic' as const },
  { id: 'cyber_shorts', name: 'Parkour Layered Shorts', type: 'cyber_shorts' as const },
];

const SHOES = [
  { id: 'kinetic_sneakers', name: 'Kinetic Grip Runners', type: 'kinetic_sneakers' as const },
  { id: 'high_tops', name: 'Skyliner Neon High-Tops', type: 'high_tops' as const },
  { id: 'stealth_striders', name: 'Stealth Ninja Striders', type: 'stealth_striders' as const },
  { id: 'mag_soles', name: 'Mag-Sole Wall Grasp 3000', type: 'mag_soles' as const },
];

const HEADWEAR = [
  { id: 'none', name: 'Bare Head', type: 'none' as const },
  { id: 'cyber_visor', name: 'HUD Hologram Visor', type: 'cyber_visor' as const },
  { id: 'neon_mask', name: 'Respirator Neon Mask', type: 'neon_mask' as const },
  { id: 'beanie', name: 'Wool Knit Beanie', type: 'beanie' as const },
  { id: 'baseball_cap', name: 'Turned-Back Cap', type: 'baseball_cap' as const },
  { id: 'headphones', name: 'DJ Studio Headphones', type: 'headphones' as const },
];

const BACK_ACCESSORIES = [
  { id: 'none', name: 'None', type: 'none' as const },
  { id: 'street_backpack', name: 'Compact Runner Backpack', type: 'street_backpack' as const },
  { id: 'drone_mount', name: 'Recon Drone Harness', type: 'drone_mount' as const },
  { id: 'neon_wings', name: 'Glider Neon Wings', type: 'neon_wings' as const },
];

const TRAILS = [
  { id: 'cyan_lightning', name: 'Cyan Kinetic Lightning', color: '#06b6d4' },
  { id: 'magenta_flame', name: 'Magenta Cyber Flame', color: '#ec4899' },
  { id: 'gold_spark', name: 'Golden Apex Spark', color: '#f59e0b' },
  { id: 'void_dark', name: 'Void Shadow Energy', color: '#7c3aed' },
  { id: 'rainbow_prism', name: 'Prism Rainbow Flow', color: '#10b981' },
];

const SWATCHES = ['#0f172a', '#1e293b', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f8fafc'];

export function FreerunCustomization({
  outfit,
  onUpdateOutfit,
  onClose
}: FreerunCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'tops' | 'pants' | 'shoes' | 'head' | 'back' | 'trails'>('tops');
  const [presets, setPresets] = useState<CharacterOutfit[]>(() => {
    const saved = localStorage.getItem('neon_freerun_presets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const saveCurrentAsPreset = () => {
    const nextPresets = [...presets.slice(0, 3), { ...outfit }];
    setPresets(nextPresets);
    localStorage.setItem('neon_freerun_presets', JSON.stringify(nextPresets));
  };

  const loadPreset = (preset: CharacterOutfit) => {
    onUpdateOutfit({ ...preset });
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl z-40 flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-cyan-400">TRACEUR WARDROBE</div>
            <h2 className="text-2xl font-black text-white uppercase italic">Character Customization</h2>
          </div>
        </div>

        {/* Save Preset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={saveCurrentAsPreset}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-wider transition-all"
          >
            <Bookmark size={16} /> SAVE PRESET
          </button>
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            APPLY & RETURN
          </button>
        </div>
      </div>

      {/* SAVED PRESETS ROW */}
      {presets.length > 0 && (
        <div className="flex items-center gap-3 max-w-5xl mx-auto w-full py-4 border-b border-white/5">
          <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">SAVED PRESETS:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.topColor }} />
              Preset #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full py-6 overflow-x-auto custom-scrollbar">
        {[
          { id: 'tops', label: 'Tops & Hoodies', icon: <Shirt size={16} /> },
          { id: 'pants', label: 'Cargo Pants', icon: <Footprints size={16} /> },
          { id: 'shoes', label: 'Parkour Sneakers', icon: <Footprints size={16} /> },
          { id: 'head', label: 'Headwear & Visors', icon: <Smile size={16} /> },
          { id: 'back', label: 'Back Accessories', icon: <Sparkles size={16} /> },
          { id: 'trails', label: 'Kinetic Trails', icon: <Sparkles size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {/* LEFT: ITEM OPTIONS */}
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">SELECT STYLE</div>

          {activeTab === 'tops' && (
            <div className="space-y-2">
              {TOPS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, topType: item.type })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.topType === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  {outfit.topType === item.type && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'pants' && (
            <div className="space-y-2">
              {PANTS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, pantsType: item.type })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.pantsType === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  {outfit.pantsType === item.type && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'shoes' && (
            <div className="space-y-2">
              {SHOES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, shoesType: item.type })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.shoesType === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  {outfit.shoesType === item.type && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'head' && (
            <div className="space-y-2">
              {HEADWEAR.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, headwear: item.type })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.headwear === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  {outfit.headwear === item.type && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'back' && (
            <div className="space-y-2">
              {BACK_ACCESSORIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, backAccessory: item.type })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.backAccessory === item.type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  {outfit.backAccessory === item.type && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="space-y-2">
              {TRAILS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateOutfit({ ...outfit, neonTrail: item.id as any })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    outfit.neonTrail === item.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  {outfit.neonTrail === item.id && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: COLOR SWATCH SELECTION */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="text-xs font-black uppercase tracking-widest text-cyan-400">COLOR PALETTES</div>

          {activeTab === 'tops' && (
            <>
              <div className="space-y-3">
                <span className="text-xs font-bold text-white/70">Main Garment Color</span>
                <div className="flex flex-wrap gap-2">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateOutfit({ ...outfit, topColor: c })}
                      className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.topColor === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-white/70">Trim & Accent Color</span>
                <div className="flex flex-wrap gap-2">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateOutfit({ ...outfit, topAccent: c })}
                      className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.topAccent === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'pants' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70">Pants Fabric Color</span>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateOutfit({ ...outfit, pantsColor: c })}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.pantsColor === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shoes' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70">Sneakers Upper Color</span>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateOutfit({ ...outfit, shoesColor: c })}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.shoesColor === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'head' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70">Headwear Fabric Color</span>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateOutfit({ ...outfit, headwearColor: c })}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.headwearColor === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'back' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70">Backpack Material Color</span>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateOutfit({ ...outfit, backColor: c })}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform ${outfit.backColor === c ? 'scale-115 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="text-xs text-white/50 leading-relaxed">
              Kinetic trails emit behind your sneakers and gloves whenever your parkour Flow State exceeds 70%. Chaining vaults, wall-runs, and clean landings intensifies the particle bloom!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
