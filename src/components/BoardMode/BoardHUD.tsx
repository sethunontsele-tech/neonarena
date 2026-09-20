import React from 'react';
import { 
  Shield, 
  Sword, 
  Crosshair, 
  RotateCcw, 
  ArrowRight, 
  Users, 
  Compass, 
  Anchor, 
  Crown, 
  Flame, 
  Hourglass, 
  Zap, 
  HeartPulse, 
  Wind, 
  Radio, 
  Eye, 
  Minimize2, 
  Maximize2, 
  Gamepad2, 
  Smartphone, 
  Glasses, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  LogOut,
  Target
} from 'lucide-react';
import { 
  UnitDefinition, 
  ActiveUnitInstance, 
  ClusterCommandType, 
  FormationType, 
  LaneId, 
  ArtifactDefinition 
} from './types';
import { BOARD_UNITS, BOARD_ARTIFACTS } from './unitCatalog';

interface BoardHUDProps {
  mana: number;
  maxMana: number;
  matchTime: number;
  deckUnits: UnitDefinition[];
  artifacts: ArtifactDefinition[];
  artifactCooldowns: Record<string, number>;
  selectedLane: LaneId;
  selectedUnits: ActiveUnitInstance[];
  activeFormation: FormationType;
  platformMode: 'pc' | 'mobile' | 'vr';
  isMixedReality: boolean;
  onSelectLane: (lane: LaneId) => void;
  onDeployUnit: (unitDef: UnitDefinition, lane: LaneId) => void;
  onIssueClusterCommand: (command: ClusterCommandType) => void;
  onChangeFormation: (formation: FormationType) => void;
  onTriggerArtifact: (artifact: ArtifactDefinition) => void;
  onTogglePlatformMode: (mode: 'pc' | 'mobile' | 'vr') => void;
  onToggleMixedReality: () => void;
  onOpenTutorial: () => void;
  onExitMatch: () => void;
}

export const BoardHUD: React.FC<BoardHUDProps> = ({
  mana,
  maxMana,
  matchTime,
  deckUnits,
  artifacts,
  artifactCooldowns,
  selectedLane,
  selectedUnits,
  activeFormation,
  platformMode,
  isMixedReality,
  onSelectLane,
  onDeployUnit,
  onIssueClusterCommand,
  onChangeFormation,
  onTriggerArtifact,
  onTogglePlatformMode,
  onToggleMixedReality,
  onOpenTutorial,
  onExitMatch
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasClusterSelection = selectedUnits.length > 0;
  const heroInCluster = selectedUnits.find(u => {
    const def = BOARD_UNITS.find(d => d.id === u.unitId);
    return def?.isHero;
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 overflow-hidden select-none font-sans">
      {/* ================= TOP BAR: MATCH STATUS & CROSS-PLATFORM TOGGLES ================= */}
      <div className="flex justify-between items-start w-full">
        {/* Left: Mode Title, Lane Selection, Platform Mode */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
            <span className="text-sm font-black italic tracking-wider text-white uppercase">
              BOARD STRATEGY
            </span>
            <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/20 uppercase">
              LIVE 3-LANE BATTLE
            </span>
          </div>

          {/* Quick Lane Target Selector */}
          <div className="flex gap-1.5 bg-zinc-950/80 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <span className="text-[9px] font-black text-white/40 uppercase self-center px-2">DEPLOY LANE:</span>
            {(['top', 'mid', 'bot'] as LaneId[]).map((lane) => (
              <button
                key={lane}
                onClick={() => onSelectLane(lane)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedLane === lane
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {lane === 'top' ? '▲ TOP' : lane === 'mid' ? '◆ MID' : '▼ BOT'}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Match Timer & Lane Status */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-zinc-950/90 border border-white/15 px-6 py-2 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-4">
            <div className="text-center">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">BATTLE CLOCK</div>
              <div className="text-2xl font-black italic text-amber-400 font-mono">{formatTime(matchTime)}</div>
            </div>
          </div>
        </div>

        {/* Right: Cross-Platform View Controls (PC / Mobile / VR Mode + Tutorial + Surrender) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Platform Controls */}
          <div className="flex bg-zinc-950/80 border border-white/10 p-1 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => onTogglePlatformMode('pc')}
              className={`p-2 rounded-xl text-xs font-black transition-all ${
                platformMode === 'pc' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
              }`}
              title="PC Mode (Mouse & RTS Hotkeys)"
            >
              <Gamepad2 size={16} />
            </button>
            <button
              onClick={() => onTogglePlatformMode('mobile')}
              className={`p-2 rounded-xl text-xs font-black transition-all ${
                platformMode === 'mobile' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
              }`}
              title="Mobile Mode (Touch gestures & wheel)"
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => onTogglePlatformMode('vr')}
              className={`p-2 rounded-xl text-xs font-black transition-all ${
                platformMode === 'vr' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white'
              }`}
              title="VR Tabletop Mode (Strategy Table Hologram)"
            >
              <Glasses size={16} />
            </button>
          </div>

          {platformMode === 'vr' && (
            <button
              onClick={onToggleMixedReality}
              className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                isMixedReality 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-950/80 text-white/40 border-white/10 hover:text-white'
              }`}
            >
              MR ROOM PASSTHROUGH: {isMixedReality ? 'ON' : 'OFF'}
            </button>
          )}

          <button
            onClick={onOpenTutorial}
            className="p-2.5 bg-zinc-950/80 border border-white/10 text-white/60 hover:text-amber-400 hover:border-amber-400/40 rounded-2xl transition-all"
            title="Open Interactive Tutorial"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={onExitMatch}
            className="p-2.5 bg-zinc-950/80 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black rounded-2xl transition-all"
            title="Leave Match"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ================= MIDDLE OVERLAY: CLUSTER COMMAND CONTROL PANEL ================= */}
      {hasClusterSelection && (
        <div className="self-center pointer-events-auto bg-zinc-950/90 border border-amber-400/40 p-4 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col gap-3 max-w-2xl w-full mx-4 animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Cluster Header Info */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                {heroInCluster ? <Crown size={18} /> : <Users size={18} />}
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <span>CLUSTER SQUAD</span>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded font-mono">
                    {selectedUnits.length} UNITS
                  </span>
                  {heroInCluster && (
                    <span className="text-[9px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                      HERO LED
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-white/40 uppercase">Issue simultaneous tactical order to entire group</div>
              </div>
            </div>

            {/* Tactical Formations */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-white/30 uppercase px-1">FORMATION:</span>
              {(['line', 'wedge', 'shield_wall', 'flank_pincer', 'spread'] as FormationType[]).map(form => (
                <button
                  key={form}
                  onClick={() => onChangeFormation(form)}
                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                    activeFormation === form
                      ? 'bg-amber-400 text-black font-bold'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {form.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* ALL 13 REAL-TIME GROUP COMMANDS */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {[
              { cmd: 'Attack' as ClusterCommandType, label: 'Attack Move', icon: <Sword size={14} />, color: 'hover:border-red-500 hover:text-red-400' },
              { cmd: 'FocusFire' as ClusterCommandType, label: 'Focus Fire', icon: <Crosshair size={14} />, color: 'hover:border-rose-500 hover:text-rose-400' },
              { cmd: 'Push' as ClusterCommandType, label: 'Push Lane', icon: <ArrowRight size={14} />, color: 'hover:border-amber-500 hover:text-amber-400' },
              { cmd: 'Flank' as ClusterCommandType, label: 'Flank Side', icon: <Compass size={14} />, color: 'hover:border-cyan-500 hover:text-cyan-400' },
              { cmd: 'Defend' as ClusterCommandType, label: 'Defend Area', icon: <Shield size={14} />, color: 'hover:border-blue-500 hover:text-blue-400' },
              { cmd: 'Retreat' as ClusterCommandType, label: 'Fall Back', icon: <RotateCcw size={14} />, color: 'hover:border-purple-500 hover:text-purple-400' },
              { cmd: 'HoldPosition' as ClusterCommandType, label: 'Hold Spot', icon: <Anchor size={14} />, color: 'hover:border-zinc-400 hover:text-zinc-300' },
              { cmd: 'ProtectHero' as ClusterCommandType, label: 'Guard Hero', icon: <Crown size={14} />, color: 'hover:border-yellow-400 hover:text-yellow-300' },
              { cmd: 'TargetStructure' as ClusterCommandType, label: 'Siege Tower', icon: <Target size={14} />, color: 'hover:border-orange-500 hover:text-orange-400' },
              { cmd: 'Follow' as ClusterCommandType, label: 'Follow Squad', icon: <Users size={14} />, color: 'hover:border-emerald-500 hover:text-emerald-400' },
              { cmd: 'SpreadOut' as ClusterCommandType, label: 'Anti-AoE Spread', icon: <Maximize2 size={14} />, color: 'hover:border-teal-500 hover:text-teal-400' },
              { cmd: 'Regroup' as ClusterCommandType, label: 'Regroup Box', icon: <Minimize2 size={14} />, color: 'hover:border-indigo-500 hover:text-indigo-400' },
              { cmd: 'Move' as ClusterCommandType, label: 'March Here', icon: <Wind size={14} />, color: 'hover:border-sky-500 hover:text-sky-400' }
            ].map(item => (
              <button
                key={item.cmd}
                onClick={() => onIssueClusterCommand(item.cmd)}
                className={`p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${item.color}`}
              >
                {item.icon}
                <span className="text-[8px] font-black uppercase text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= BOTTOM BAR: MANA ELIXIR + ARTIFACTS + DECK CARDS ================= */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* ELIXIR / MANA CHARGE BAR */}
        <div className="flex items-center gap-4 bg-zinc-950/90 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl max-w-md self-center w-full">
          <div className="flex items-center gap-1.5 text-cyan-400 font-black italic">
            <Zap size={18} className="animate-pulse" />
            <span className="text-xl font-mono">{mana.toFixed(1)}</span>
            <span className="text-[10px] text-white/40 uppercase">/ {maxMana} MANA</span>
          </div>

          <div className="flex-1 bg-black/60 h-3.5 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${(mana / maxMana) * 100}%` }}
            />
          </div>
        </div>

        {/* CARDS DEPLOYMENT BAR + ARTIFACT TRIGGERS */}
        <div className="flex items-end justify-between gap-4 overflow-x-auto pb-1 custom-scrollbar">
          {/* Active Equipped Artifacts */}
          <div className="flex gap-2 bg-zinc-950/90 border border-amber-500/20 p-2.5 rounded-3xl backdrop-blur-xl shrink-0">
            <div className="text-[8px] font-black text-amber-400/60 uppercase [writing-mode:vertical-lr] rotate-180 text-center tracking-widest">
              ARTIFACTS
            </div>
            {artifacts.map((art) => {
              const cd = artifactCooldowns[art.id] || 0;
              const isReady = cd <= 0;

              return (
                <button
                  key={art.id}
                  disabled={!isReady}
                  onClick={() => onTriggerArtifact(art)}
                  className={`relative w-14 h-20 rounded-2xl border flex flex-col items-center justify-between p-2 transition-all group ${
                    isReady
                      ? 'bg-amber-500/10 border-amber-400/60 hover:scale-105 hover:bg-amber-500/20 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-black/60 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                  title={art.description}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[8px] font-black text-white uppercase text-center leading-tight truncate w-full">
                    {art.name.split(' ')[0]}
                  </span>
                  {!isReady && (
                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center text-xs font-black text-amber-400 font-mono">
                      {Math.ceil(cd)}s
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* SQUAD UNITS DECK */}
          <div className="flex gap-2.5 bg-zinc-950/90 border border-white/10 p-2.5 rounded-3xl backdrop-blur-xl shadow-2xl overflow-x-auto">
            {deckUnits.map((unitDef) => {
              const canAfford = mana >= unitDef.manaCost;

              return (
                <button
                  key={unitDef.id}
                  disabled={!canAfford}
                  onClick={() => onDeployUnit(unitDef, selectedLane)}
                  className={`relative w-24 h-32 rounded-2xl border-2 flex flex-col justify-between p-2.5 transition-all group shrink-0 ${
                    canAfford
                      ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-cyan-400/60 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:border-cyan-300'
                      : 'bg-zinc-950/60 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Mana Cost Gem */}
                  <div className="flex justify-between items-start w-full">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 text-black font-black text-xs flex items-center justify-center font-mono shadow-md">
                      {unitDef.manaCost}
                    </div>
                    <span className="text-[8px] font-bold text-white/40 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                      {unitDef.role}
                    </span>
                  </div>

                  {/* Role / Name Info */}
                  <div className="w-full text-left">
                    <div className="text-xs font-black uppercase text-white tracking-tight truncate flex items-center gap-1">
                      {unitDef.isHero && <Crown size={12} className="text-amber-400 shrink-0" />}
                      <span className="truncate">{unitDef.name}</span>
                    </div>
                    <div className="text-[8px] text-white/40 font-bold uppercase truncate">
                      {unitDef.hp} HP • {unitDef.damage} DMG
                    </div>
                  </div>

                  {/* Deploy Button Prompt */}
                  <div className="w-full py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[8px] font-black uppercase text-center group-hover:bg-cyan-400 group-hover:text-black transition-all">
                    DEPLOY {selectedLane.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
