const fs = require('fs');
let code = fs.readFileSync('src/components/QuickAccessBar.tsx', 'utf8');

// We will overwrite the entire file with a much better version.
fs.writeFileSync('src/components/QuickAccessBar.tsx', `
import React, { useState } from 'react';
import { 
  Swords, Shield, Wand2, FlaskConical, BookOpen, Settings, Backpack, Box, Zap, X,
  LucideIcon, Flame, Droplet, Wind, Lock, Unlock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

type TabId = 'skills' | 'inventory' | 'items' | 'armor' | 'staffs' | 'magic' | 'potions' | 'spells' | 'settings';

export function QuickAccessBar() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  
  const TABS: { id: TabId; label: string; icon: LucideIcon; color: string }[] = [
    { id: 'skills', label: 'Skills', icon: Zap, color: 'text-yellow-400' },
    { id: 'inventory', label: 'Inventory', icon: Backpack, color: 'text-blue-400' },
    { id: 'items', label: 'Items', icon: Box, color: 'text-emerald-400' },
    { id: 'armor', label: 'Armor', icon: Shield, color: 'text-slate-300' },
    { id: 'staffs', label: 'Staffs', icon: Wand2, color: 'text-fuchsia-400' },
    { id: 'magic', label: 'Magic', icon: Flame, color: 'text-orange-400' },
    { id: 'potions', label: 'Potions', icon: FlaskConical, color: 'text-rose-400' },
    { id: 'spells', label: 'Spells', icon: BookOpen, color: 'text-indigo-400' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-zinc-400' }
  ];

  const handleTabClick = (id: TabId) => {
    soundService.playSFX('ui_click');
    setActiveTab(prev => prev === id ? null : id);
  };

  const activeColor = TABS.find(t => t.id === activeTab)?.color || 'text-cyan-400';
  const activeColorGlow = activeColor.replace('text-', 'shadow-').replace('-400', '-500/20');
  const activeBorder = activeColor.replace('text-', 'border-').replace('-400', '-500/50');
  const activeBg = activeColor.replace('text-', 'bg-').replace('-400', '-500/10');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center">
      {/* Content Panel */}
      {activeTab && (
        <div className={\`pointer-events-auto bg-black/95 backdrop-blur-xl border-t border-l border-r \${activeBorder} rounded-t-3xl w-full max-w-5xl p-4 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] \${activeColorGlow} animate-in slide-in-from-bottom-10 mb-2\`} style={{ maxHeight: '60vh' }}>
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              {TABS.map(t => {
                if(t.id === activeTab) {
                  const Icon = t.icon;
                  return <Icon key={t.id} size={28} className={t.color} />
                }
                return null;
              })}
              <h3 className={\`\${activeColor} font-black uppercase text-xl sm:text-2xl tracking-widest\`}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab(null)}
              className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="h-full overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(60vh - 100px)' }}>
            {activeTab === 'skills' && <SkillsPanel />}
            {activeTab === 'inventory' && <InventoryPanel />}
            {activeTab === 'items' && <ItemsPanel />}
            {activeTab === 'armor' && <ArmorPanel />}
            {activeTab === 'staffs' && <StaffsPanel />}
            {activeTab === 'magic' && <MagicPanel />}
            {activeTab === 'potions' && <PotionsPanel />}
            {activeTab === 'spells' && <SpellsPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </div>
      )}

      {/* The Bar Itself */}
      <div className="pointer-events-auto bg-black/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 sm:px-6 sm:py-4 w-full flex justify-center items-center gap-1 sm:gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] overflow-x-auto custom-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const bgClass = isActive ? tab.color.replace('text-', 'bg-').replace('-400', '-500/20') : 'bg-white/5';
          const borderClass = isActive ? tab.color.replace('text-', 'border-').replace('-400', '-500/50') : 'border-white/10 hover:border-white/30';
          const textClass = isActive ? tab.color : 'text-white/50 hover:text-white/80';
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={\`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[90px] px-2 py-2 sm:px-4 sm:py-3 rounded-2xl transition-all border \${bgClass} \${borderClass} \${textClass}\`}
            >
              <tab.icon size={24} className="mb-1.5" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// PANELS IMPLEMENTATION
// ---------------------------------------------------------

function SkillsPanel() {
  const { equippedSkills, setEquippedSkills } = useGameStore();
  const allSkills = [
    { id: 'dash', name: 'Neon Dash', desc: 'Quickly evade incoming attacks.', req: 'Lvl 1', cd: '3s' },
    { id: 'double_jump', name: 'Double Jump', desc: 'Jump again in mid-air.', req: 'Lvl 2', cd: 'None' },
    { id: 'shockwave', name: 'Shockwave', desc: 'Stun nearby enemies.', req: 'Lvl 5', cd: '12s' },
    { id: 'overdrive', name: 'Overdrive', desc: 'Increase speed and fire rate by 50%.', req: 'Lvl 10', cd: '30s' },
  ];

  const toggleSkill = (id: string) => {
    if(equippedSkills.includes(id)) {
      setEquippedSkills(equippedSkills.filter(s => s !== id));
    } else {
      if(equippedSkills.length < 3) setEquippedSkills([...equippedSkills, id]);
      else soundService.playSFX('error');
    }
    soundService.playSFX('ui_click');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allSkills.map(skill => {
        const isEquipped = equippedSkills.includes(skill.id);
        return (
          <div key={skill.id} className={\`p-4 rounded-xl border \${isEquipped ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/5 border-white/10'} flex items-start justify-between cursor-pointer transition-all hover:bg-white/10\`} onClick={() => toggleSkill(skill.id)}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className={\`font-black uppercase text-lg \${isEquipped ? 'text-yellow-400' : 'text-white'}\`}>{skill.name}</h4>
                {isEquipped && <CheckCircle2 size={16} className="text-yellow-400" />}
              </div>
              <p className="text-white/60 text-sm mb-2 font-mono">{skill.desc}</p>
              <div className="flex gap-3 text-xs font-black tracking-widest uppercase">
                <span className="text-zinc-400">Req: {skill.req}</span>
                <span className="text-cyan-400">CD: {skill.cd}</span>
              </div>
            </div>
            <div className={\`px-3 py-1 rounded-md text-xs font-black uppercase \${isEquipped ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}\`}>
              {isEquipped ? 'Equipped' : 'Equip'}
            </div>
          </div>
        )
      })}
    </div>
  );
}

function InventoryPanel() {
  const { inventoryItems } = useGameStore();
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-blue-300 text-sm font-mono flex items-center gap-2">
        <Backpack size={18} /> Showing all items in your inventory.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {inventoryItems.map(item => (
          <div key={item.id} className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors group cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors relative">
              <Box size={32} className="text-white/50 group-hover:text-blue-400" />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black">x{item.quantity}</span>
            </div>
            <h4 className="text-white font-bold text-xs mb-1 uppercase tracking-wider">{item.name}</h4>
            <span className={\`text-[10px] font-black uppercase \${item.rarity === 'rare' ? 'text-blue-400' : 'text-zinc-400'}\`}>{item.rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemsPanel() {
  const { inventoryItems } = useGameStore();
  const usableItems = inventoryItems.filter(i => i.type === 'potion' || i.type === 'consumable');
  
  return (
    <div className="space-y-4">
      {usableItems.length === 0 && <div className="text-white/50 text-center py-10 font-mono">No usable items found.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {usableItems.map(item => (
          <div key={item.id} className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Box size={24} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-emerald-300 font-bold uppercase">{item.name} <span className="text-white/50 text-xs ml-2">x{item.quantity}</span></h4>
              <p className="text-emerald-100/50 text-xs font-mono">{item.description}</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs rounded-lg transition-colors">
              Use
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArmorPanel() {
  const { equippedArmor, setEquippedArmor } = useGameStore();
  const slots = ['head', 'chest', 'legs', 'hands', 'feet'] as const;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      {slots.map(slot => (
        <div key={slot} className="bg-slate-900/50 border border-slate-500/30 rounded-xl p-4 flex flex-col items-center text-center">
          <div className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">{slot}</div>
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mb-4">
            {equippedArmor[slot] ? (
              <Shield className="text-slate-200" size={32} />
            ) : (
              <Shield className="text-slate-600" size={32} />
            )}
          </div>
          {equippedArmor[slot] ? (
            <div className="text-white text-xs font-bold uppercase">{equippedArmor[slot]}</div>
          ) : (
            <div className="text-slate-500 text-xs font-mono">Empty Slot</div>
          )}
        </div>
      ))}
    </div>
  );
}

function StaffsPanel() {
  const { equippedStaff, setEquippedStaff } = useGameStore();
  const staffs = [
    { id: 'apprentice_staff', name: 'Apprentice Staff', dmg: '15', pwr: '10', rarity: 'common' },
    { id: 'void_weaver', name: 'Void Weaver', dmg: '45', pwr: '80', rarity: 'epic' },
    { id: 'neon_scepter', name: 'Neon Scepter', dmg: '60', pwr: '120', rarity: 'legendary' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {staffs.map(staff => {
        const isEq = equippedStaff === staff.id;
        return (
          <div key={staff.id} className={\`p-5 rounded-2xl border \${isEq ? 'bg-fuchsia-900/40 border-fuchsia-500/60' : 'bg-black/60 border-white/10 hover:border-fuchsia-500/30'} flex flex-col items-center text-center transition-all cursor-pointer\`} onClick={() => setEquippedStaff(isEq ? null : staff.id)}>
            <Wand2 size={40} className={\`mb-3 \${isEq ? 'text-fuchsia-400' : 'text-zinc-500'}\`} />
            <h4 className={\`font-black uppercase tracking-wider mb-2 \${isEq ? 'text-white' : 'text-zinc-300'}\`}>{staff.name}</h4>
            <div className="flex gap-2 text-[10px] font-mono mb-4">
              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded">DMG: {staff.dmg}</span>
              <span className="bg-fuchsia-500/20 text-fuchsia-300 px-2 py-1 rounded">PWR: {staff.pwr}</span>
            </div>
            <div className={\`w-full py-2 text-xs font-black uppercase rounded-lg \${isEq ? 'bg-fuchsia-500 text-white' : 'bg-white/10 text-white/50'}\`}>
              {isEq ? 'Equipped' : 'Equip Staff'}
            </div>
          </div>
        )
      })}
    </div>
  );
}

function MagicPanel() {
  const { selectedMagic, setSelectedMagic } = useGameStore();
  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-orange-300 text-sm font-mono flex items-center gap-2">
        <Flame size={18} /> Manage active magic affinities.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Fireball', 'Frost Nova', 'Chain Lightning', 'Earth Spike'].map(m => {
          const isSelected = selectedMagic.includes(m.toLowerCase());
          return (
            <div key={m} className={\`p-4 rounded-xl border \${isSelected ? 'bg-orange-950/50 border-orange-500' : 'bg-white/5 border-white/10'} cursor-pointer hover:bg-white/10\`} onClick={() => {
              if(isSelected) setSelectedMagic(selectedMagic.filter(x => x !== m.toLowerCase()));
              else setSelectedMagic([...selectedMagic, m.toLowerCase()]);
            }}>
              <Flame size={24} className={\`mb-2 \${isSelected ? 'text-orange-500' : 'text-zinc-600'}\`} />
              <div className="text-white font-black uppercase text-sm">{m}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function PotionsPanel() {
  const { inventoryItems } = useGameStore();
  const potions = inventoryItems.filter(i => i.type === 'potion');
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {potions.map(potion => (
        <div key={potion.id} className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 flex flex-col items-center text-center">
          <FlaskConical size={32} className="text-rose-400 mb-2" />
          <div className="text-rose-200 font-bold uppercase text-xs mb-1">{potion.name}</div>
          <div className="text-white/50 text-[10px] font-mono mb-3">x{potion.quantity} Remaining</div>
          <button className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-[10px] rounded transition-colors">
            Drink
          </button>
        </div>
      ))}
    </div>
  );
}

function SpellsPanel() {
  const { selectedSpells, setSelectedSpells } = useGameStore();
  const spells = [
    { id: 'heal', name: 'Divine Heal', mana: 50, cd: '10s', effect: '+100 HP' },
    { id: 'shield', name: 'Mana Shield', mana: 30, cd: '15s', effect: 'Absorb 200 DMG' },
    { id: 'haste', name: 'Temporal Haste', mana: 40, cd: '20s', effect: '+40% Speed' },
  ];

  return (
    <div className="space-y-4">
      {spells.map(spell => {
        const isEq = selectedSpells.includes(spell.id);
        return (
          <div key={spell.id} className={\`flex items-center justify-between p-3 rounded-xl border \${isEq ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-black/40 border-white/10'}\`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <BookOpen size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-white font-bold uppercase tracking-wider">{spell.name}</div>
                <div className="flex gap-3 text-[10px] font-mono text-indigo-200/70 mt-1">
                  <span>Mana: {spell.mana}</span>
                  <span>CD: {spell.cd}</span>
                  <span>Effect: {spell.effect}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if(isEq) setSelectedSpells(selectedSpells.filter(s => s !== spell.id));
                else setSelectedSpells([...selectedSpells, spell.id]);
              }}
              className={\`px-4 py-2 rounded-lg font-black uppercase text-xs \${isEq ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}\`}
            >
              {isEq ? 'Memorized' : 'Memorize'}
            </button>
          </div>
        )
      })}
    </div>
  );
}

function SettingsPanel() {
  const { musicVolume, sfxVolume } = useGameStore();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      <div className="space-y-4">
        <h4 className="text-zinc-400 font-black uppercase tracking-widest text-xs border-b border-white/10 pb-2">Audio</h4>
        <div>
          <div className="flex justify-between text-xs text-white mb-1 font-mono">
            <span>Music Volume</span>
            <span>{Math.round(musicVolume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={musicVolume} readOnly className="w-full accent-zinc-400" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-white mb-1 font-mono">
            <span>SFX Volume</span>
            <span>{Math.round(sfxVolume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={sfxVolume} readOnly className="w-full accent-zinc-400" />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-zinc-400 font-black uppercase tracking-widest text-xs border-b border-white/10 pb-2">Graphics & Display</h4>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-sm text-white font-mono">Fullscreen Mode</span>
          <button className="px-3 py-1 bg-zinc-600 text-white text-xs font-bold rounded" onClick={() => document.documentElement.requestFullscreen()}>Toggle</button>
        </div>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-sm text-white font-mono">UI Scale</span>
          <select className="bg-black border border-white/20 text-white text-xs p-1 rounded">
            <option>100%</option>
            <option>125%</option>
            <option>150%</option>
          </select>
        </div>
      </div>
    </div>
  );
}
`);
console.log('QuickAccessBar.tsx updated completely.');
