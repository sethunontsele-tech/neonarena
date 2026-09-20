import React, { useState } from 'react';
import { 
  Shield, 
  Sword, 
  Zap, 
  Crown, 
  Sparkles, 
  Play, 
  Sliders, 
  BookOpen, 
  Plus, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  ArrowLeft, 
  Trophy, 
  Flame,
  Info,
  HelpCircle
} from 'lucide-react';
import { 
  UnitDefinition, 
  ArtifactDefinition, 
  BoardSquadLoadout, 
  BoardEnvironmentConfig 
} from './types';
import { BOARD_UNITS, BOARD_ARTIFACTS, BOARD_ENVIRONMENTS } from './unitCatalog';

interface BoardHubProps {
  currentSquad: BoardSquadLoadout;
  activeEnvironment: BoardEnvironmentConfig;
  onUpdateSquad: (squad: BoardSquadLoadout) => void;
  onSelectEnvironment: (env: BoardEnvironmentConfig) => void;
  onStartMatch: (difficulty: 'easy' | 'normal' | 'master' | 'brutal') => void;
  onStartTutorial: () => void;
  onBackToMainMenu: () => void;
}

export const BoardHub: React.FC<BoardHubProps> = ({
  currentSquad,
  activeEnvironment,
  onUpdateSquad,
  onSelectEnvironment,
  onStartMatch,
  onStartTutorial,
  onBackToMainMenu
}) => {
  const [activeTab, setActiveTab] = useState<'squad' | 'roster' | 'board_creator' | 'play'>('play');
  const [selectedUnitDetail, setSelectedUnitDetail] = useState<UnitDefinition>(BOARD_UNITS[0]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'master' | 'brutal'>('normal');

  // Filtered unit roster
  const filteredUnits = BOARD_UNITS.filter(u => {
    if (selectedRoleFilter === 'All') return true;
    if (selectedRoleFilter === 'Hero') return u.isHero;
    return u.role === selectedRoleFilter;
  });

  const heroUnit = BOARD_UNITS.find(u => u.id === currentSquad.heroId);
  const soldierUnits = currentSquad.soldierIds.map(id => BOARD_UNITS.find(u => u.id === id)).filter(Boolean) as UnitDefinition[];
  const squadArtifacts = currentSquad.artifactIds.map(id => BOARD_ARTIFACTS.find(a => a.id === id)).filter(Boolean) as ArtifactDefinition[];

  const handleSelectHero = (hero: UnitDefinition) => {
    onUpdateSquad({
      ...currentSquad,
      heroId: hero.id
    });
  };

  const handleToggleSoldier = (soldier: UnitDefinition) => {
    const isPresent = currentSquad.soldierIds.includes(soldier.id);
    if (isPresent) {
      if (currentSquad.soldierIds.length > 4) {
        onUpdateSquad({
          ...currentSquad,
          soldierIds: currentSquad.soldierIds.filter(id => id !== soldier.id)
        });
      }
    } else {
      if (currentSquad.soldierIds.length < 7) {
        onUpdateSquad({
          ...currentSquad,
          soldierIds: [...currentSquad.soldierIds, soldier.id]
        });
      }
    }
  };

  const handleToggleArtifact = (artifact: ArtifactDefinition) => {
    const isPresent = currentSquad.artifactIds.includes(artifact.id);
    if (isPresent) {
      if (currentSquad.artifactIds.length > 1) {
        onUpdateSquad({
          ...currentSquad,
          artifactIds: currentSquad.artifactIds.filter(id => id !== artifact.id)
        });
      }
    } else {
      if (currentSquad.artifactIds.length < 3) {
        onUpdateSquad({
          ...currentSquad,
          artifactIds: [...currentSquad.artifactIds, artifact.id]
        });
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 text-white flex flex-col overflow-hidden font-sans select-none">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-10 flex justify-between items-center px-8 py-5 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMainMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            BACK
          </button>
          <div>
            <h1 className="text-xl font-black italic tracking-widest text-amber-400 uppercase flex items-center gap-2">
              NEON ARENA <span className="text-white text-xs px-2 py-0.5 bg-white/10 rounded-md">BOARD MODE</span>
            </h1>
            <p className="text-[10px] text-white/50 tracking-wider uppercase">Tactical Real-Time Living Fantasy Strategy</p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <nav className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 p-1.5 rounded-2xl">
          {[
            { key: 'play', label: 'DEPLOY BATTLE', icon: <Play size={14} /> },
            { key: 'squad', label: 'SQUAD BUILDER', icon: <Shield size={14} /> },
            { key: 'roster', label: 'UNIT CATALOG (50+)', icon: <Crown size={14} /> },
            { key: 'board_creator', label: 'CUSTOM BOARD CREATOR', icon: <Sliders size={14} /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* TUTORIAL PROMPT */}
        <button
          onClick={onStartTutorial}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
        >
          <BookOpen size={16} />
          HOW TO PLAY
        </button>
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* ================= TAB 1: DEPLOY BATTLE (MATCH LAUNCHER) ================= */}
        {activeTab === 'play' && (
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-black italic tracking-wide text-white uppercase">COMMAND THE BOARD</h2>
              <p className="text-sm text-white/50 max-w-xl mx-auto mt-1">
                Deploy your squad, direct clusters across 3 lanes, outflank defensive towers, and destroy the enemy citadel!
              </p>
            </div>

            {/* SQUAD PREVIEW STRIP */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">YOUR BATTLE FORMATION</span>
                <button
                  onClick={() => setActiveTab('squad')}
                  className="text-xs text-white/50 hover:text-white underline font-bold"
                >
                  EDIT SQUAD LOADOUT
                </button>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {/* Hero Card */}
                {heroUnit && (
                  <div className="w-36 h-48 rounded-2xl bg-gradient-to-b from-amber-500/20 to-zinc-900 border-2 border-amber-400 p-3 flex flex-col justify-between shrink-0 shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-400 text-black rounded font-mono">HERO</span>
                      <Crown size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase text-white truncate">{heroUnit.name}</div>
                      <div className="text-[10px] text-amber-300 font-bold">{heroUnit.hp} HP • {heroUnit.damage} ATK</div>
                    </div>
                  </div>
                )}

                {/* Supporting Soldiers */}
                {soldierUnits.map(unit => (
                  <div key={unit.id} className="w-32 h-44 rounded-2xl bg-zinc-900 border border-white/10 p-3 flex flex-col justify-between shrink-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-white/40 uppercase">{unit.role}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{unit.manaCost} MANA</span>
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-white truncate">{unit.name}</div>
                      <div className="text-[9px] text-white/40">{unit.hp} HP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATCH DIFFICULTY & LAUNCH */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: 'easy', label: 'CASUAL / NOVICE', desc: 'Predictable lane pressure. Perfect for learning cluster commands.' },
                { key: 'normal', label: 'TACTICAL COMMANDER', desc: 'Balanced AI attacks, lane rotations, and defensive counter-pushes.' },
                { key: 'master', label: 'MASTER WARLORD', desc: 'Aggressive pincer flanks, smart artifact timings, and Hero protection.' },
                { key: 'brutal', label: 'BRUTAL VOID OVERLORD', desc: 'Multi-lane coordinated sieges with elite counter-unit compositions.' }
              ].map(diff => (
                <button
                  key={diff.key}
                  onClick={() => setSelectedDifficulty(diff.key as any)}
                  className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedDifficulty === diff.key
                      ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-400">{diff.label}</div>
                    <div className="text-[11px] text-white/50 mt-1 leading-relaxed">{diff.desc}</div>
                  </div>
                  <div className="text-[9px] font-mono uppercase text-white/30">
                    DIFFICULTY: {diff.key.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>

            {/* BATTLE START BUTTON */}
            <button
              onClick={() => onStartMatch(selectedDifficulty)}
              className="w-full py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-black text-xl italic uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_35px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-3"
            >
              <Play size={24} fill="currentColor" />
              START STRATEGY BATTLE
            </button>
          </div>
        )}

        {/* ================= TAB 2: SQUAD BUILDER ================= */}
        {activeTab === 'squad' && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black italic uppercase text-white">SQUAD LOADOUT CUSTOMIZER</h2>
              <p className="text-xs text-white/50">Pick 1 Hero, 7 Supporting Soldiers & Creatures, and 3 Ancient Artifacts.</p>
            </div>

            {/* SECTION 1: HERO SELECTION */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-4">
                <Crown size={16} /> SELECT HERO GENERAL (1 REQUIRED)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {BOARD_UNITS.filter(u => u.isHero).map(hero => {
                  const isSelected = currentSquad.heroId === hero.id;

                  return (
                    <button
                      key={hero.id}
                      onClick={() => handleSelectHero(hero)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 shadow-md'
                          : 'bg-zinc-900 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="text-xs font-black uppercase text-white truncate">{hero.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-1">{hero.manaCost} MANA • {hero.role}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: SOLDIERS & CREATURES */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <Shield size={16} /> SELECT SUPPORTING SQUAD UNITS ({currentSquad.soldierIds.length} / 7)
                </span>
                <span className="text-[10px] text-white/40">Click to add or remove units</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
                {BOARD_UNITS.filter(u => !u.isHero).map(unit => {
                  const isSelected = currentSquad.soldierIds.includes(unit.id);

                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleToggleSoldier(unit)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-md'
                          : 'bg-zinc-900 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="text-xs font-black uppercase text-white truncate">{unit.name}</div>
                      <div className="text-[10px] text-cyan-300 font-mono mt-1">{unit.manaCost} MANA • {unit.role}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: ARTIFACTS */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-4">
                <Sparkles size={16} /> SELECT ARTIFACT SPELLS ({currentSquad.artifactIds.length} / 3)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {BOARD_ARTIFACTS.map(art => {
                  const isSelected = currentSquad.artifactIds.includes(art.id);

                  return (
                    <button
                      key={art.id}
                      onClick={() => handleToggleArtifact(art)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 shadow-md'
                          : 'bg-zinc-900 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px]">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="text-sm font-black uppercase text-white">{art.name}</div>
                      <div className="text-[11px] text-white/50 mt-1 leading-tight">{art.description}</div>
                      <div className="text-[10px] text-amber-400 font-mono mt-2">{art.cooldown}s COOLDOWN</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: UNIT CATALOG (50+ UNITS) ================= */}
        {activeTab === 'roster' && (
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Left: Unit Grid & Filter */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Role filter buttons */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['All', 'Hero', 'Melee', 'Ranged', 'Tank', 'Assassin', 'Support', 'Heavy', 'Swarm', 'Siege'].map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${
                      selectedRoleFilter === role
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-900 text-white/60 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Grid of 50+ Units */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                {filteredUnits.map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnitDetail(unit)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedUnitDetail.id === unit.id
                        ? 'bg-amber-400/20 border-amber-400 shadow-md'
                        : 'bg-zinc-900 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase text-amber-400">{unit.manaCost} MANA</span>
                      {unit.isHero && <Crown size={12} className="text-amber-400" />}
                    </div>
                    <div className="text-xs font-black uppercase text-white truncate mt-1">{unit.name}</div>
                    <div className="text-[9px] text-white/40 uppercase">{unit.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Selected Unit Detail Inspector */}
            <div className="w-full md:w-80 bg-zinc-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded font-bold uppercase">
                    {selectedUnitDetail.role}
                  </span>
                  {selectedUnitDetail.isHero && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold uppercase">
                      HERO LEADER
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black italic uppercase text-white">{selectedUnitDetail.name}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{selectedUnitDetail.description}</p>

                {/* Stats Table */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">HEALTH (HP)</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedUnitDetail.hp}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">ATTACK DAMAGE</span>
                    <span className="font-mono font-bold text-amber-400">{selectedUnitDetail.damage}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">ATTACK RANGE</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedUnitDetail.range}m</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">ATTACK SPEED</span>
                    <span className="font-mono font-bold text-white">{selectedUnitDetail.attackSpeed}/s</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">MOVEMENT SPEED</span>
                    <span className="font-mono font-bold text-white">{selectedUnitDetail.moveSpeed}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-white/40">ARMOR MITIGATION</span>
                    <span className="font-mono font-bold text-blue-400">{selectedUnitDetail.armor}</span>
                  </div>
                </div>

                {/* Special Ability */}
                {selectedUnitDetail.abilities && selectedUnitDetail.abilities.length > 0 && (
                  <div className="mt-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                    <div className="text-[10px] font-black uppercase text-amber-400">SPECIAL ABILITY</div>
                    <div className="text-xs font-black text-white mt-0.5">{selectedUnitDetail.abilities[0].name}</div>
                    <div className="text-[10px] text-white/60 mt-1 leading-relaxed">{selectedUnitDetail.abilities[0].description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CUSTOM BOARD CREATOR ================= */}
        {activeTab === 'board_creator' && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black italic uppercase text-white">CUSTOM BOARD ENVIRONMENT CREATOR</h2>
              <p className="text-xs text-white/50">Customize the strategy table's biome, dynamic sky, floor textures, and lighting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BOARD_ENVIRONMENTS.map(env => {
                const isSelected = activeEnvironment.id === env.id;

                return (
                  <button
                    key={env.id}
                    onClick={() => onSelectEnvironment(env)}
                    className={`p-5 rounded-3xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-xl'
                        : 'bg-zinc-900 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs">
                        <Check size={14} />
                      </div>
                    )}
                    <div 
                      className="w-full h-24 rounded-2xl mb-3 flex items-center justify-center font-black text-sm uppercase tracking-wider text-white shadow-inner"
                      style={{ backgroundColor: env.floorColor }}
                    >
                      {env.name}
                    </div>
                    <div className="text-xs font-black uppercase text-white">{env.name}</div>
                    <div className="text-[10px] text-white/50 mt-1">THEME: {env.themeColor}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
