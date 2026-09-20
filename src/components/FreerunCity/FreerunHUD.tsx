import React, { useState } from 'react';
import { ComboState, PlayerStats, ViewMode, WeatherType, TimeOfDay, ChallengeDefinition, CollectibleItem, MultiplayerMode } from './types';
import { Zap, Eye, Trophy, Camera, MapPin, Wind, Compass, Volume2, VolumeX, Flame, Award, ChevronRight, Layers, Users, X } from 'lucide-react';

interface FreerunHUDProps {
  speedMps: number;
  comboState: ComboState;
  playerStats: PlayerStats;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (t: TimeOfDay) => void;
  onOpenReplayPhoto: () => void;
  onOpenLevelEditor: () => void;
  onOpenCommunityHub: () => void;
  onOpenCustomization: () => void;
  onExitFreerun: () => void;
  activeChallenge: ChallengeDefinition | null;
  onStartChallenge: (challenge: ChallengeDefinition) => void;
  onCancelChallenge: () => void;
  challengeTimer: number;
  collectibles: CollectibleItem[];
  multiplayerMode: MultiplayerMode;
  onChangeMultiplayerMode: (mode: MultiplayerMode) => void;
  // Mobile virtual controls callbacks
  onMobileAction?: (action: 'jump' | 'vault' | 'slide' | 'flip' | 'dash') => void;
}

export const CITY_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'ch_skyline_sprint',
    title: 'Skyscraper Skyline Sprint',
    type: 'rooftop_dash',
    description: 'Sprint across 5 elevated rooftops to the Apex Spire in under 45 seconds.',
    difficulty: 'Acrobat',
    startPos: [-35, 46, -50],
    checkpoints: [
      [-35, 46, -50],
      [0, 66, 0],
      [35, 51, -50],
      [70, 36, 25],
      [0, 131, 0]
    ],
    targetTime: 45,
    bronzeTime: 60,
    silverTime: 50,
    goldTime: 40,
    platinumTime: 34,
    rewardXP: 3500,
  },
  {
    id: 'ch_vertigo_leap',
    title: 'Vertigo Crane Horizon Dash',
    type: 'precision_leap',
    description: 'Traverse the towering construction crane and land a precision roll onto Vanguard Tower.',
    difficulty: 'Master',
    startPos: [-75, 43, -45],
    checkpoints: [
      [-75, 43, -45],
      [-75, 74, -45],
      [-35, 46, -50]
    ],
    targetTime: 30,
    bronzeTime: 45,
    silverTime: 35,
    goldTime: 26,
    platinumTime: 20,
    rewardXP: 4500,
  },
  {
    id: 'ch_trick_frenzy',
    title: 'Infinite Rooftop Flow Challenge',
    type: 'trick_battle',
    description: 'Chain unbroken vaults, wall-runs, and aerial flips to score 20,000 combo points.',
    difficulty: 'Acrobat',
    startPos: [0, 26, 90],
    checkpoints: [],
    targetScore: 20000,
    rewardXP: 4000,
  },
  {
    id: 'ch_metro_escape',
    title: 'Underground Metro Speed Run',
    type: 'time_trial',
    description: 'Escape from the subterranean subway tunnels back to the surface plaza in record time.',
    difficulty: 'Beginner',
    startPos: [0, -2, 115],
    checkpoints: [
      [0, -2, 115],
      [0, 2, 95],
      [0, 26, 90]
    ],
    targetTime: 25,
    bronzeTime: 35,
    silverTime: 28,
    goldTime: 22,
    platinumTime: 18,
    rewardXP: 2500,
  }
];

export function FreerunHUD({
  speedMps,
  comboState,
  playerStats,
  viewMode,
  onToggleViewMode,
  weather,
  onChangeWeather,
  timeOfDay,
  onChangeTimeOfDay,
  onOpenReplayPhoto,
  onOpenLevelEditor,
  onOpenCommunityHub,
  onOpenCustomization,
  onExitFreerun,
  activeChallenge,
  onStartChallenge,
  onCancelChallenge,
  challengeTimer,
  collectibles,
  multiplayerMode,
  onChangeMultiplayerMode,
  onMobileAction
}: FreerunHUDProps) {
  const [showTacticalMap, setShowTacticalMap] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [showWeatherMenu, setShowWeatherMenu] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const collectedCount = collectibles.filter(c => c.collected).length;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden flex flex-col justify-between p-4 sm:p-6">
      {/* TOP BAR */}
      <div className="flex items-start justify-between w-full">
        {/* TOP LEFT: PLAYER BADGE & RANK */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/75 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-3xl shadow-2xl">
          <button
            onClick={onOpenCustomization}
            className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center hover:scale-105 transition-all text-cyan-400 group"
            title="Character Wardrobe"
          >
            <Zap size={22} className="group-hover:rotate-12 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm tracking-wide">TRACEUR APEX</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-amber-400 text-black">
                {playerStats.rank}
              </span>
            </div>
            {/* XP progress bar */}
            <div className="w-36 bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (playerStats.xp % 10000) / 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* TOP CENTER: COMBO METRE & STYLE MULTIPLIER */}
        {comboState.currentPoints > 0 && (
          <div className="flex flex-col items-center animate-pulse">
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                {comboState.currentPoints.toLocaleString()}
              </span>
              <span className="font-mono font-black text-2xl text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                x{comboState.multiplier.toFixed(1)}
              </span>
            </div>

            {/* Last Trick Banner */}
            {comboState.lastTrickName && (
              <div className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/60 px-3 py-1 rounded-xl border border-white/10 mt-1">
                {comboState.lastTrickName}
              </div>
            )}

            {/* Combo Timer Bar */}
            <div className="w-48 bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${(comboState.comboTimer / 3.8) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* TOP RIGHT: ACTION NAVIGATION BAR */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* View Mode Toggle (1st Person / 3rd Person) */}
          <button
            onClick={onToggleViewMode}
            className={`px-3 py-2 rounded-2xl border text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
              viewMode === 'first_person'
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-black/75 text-white/70 hover:text-white border-white/10'
            }`}
            title="Toggle 1st / 3rd Person View (V Key)"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">{viewMode === 'first_person' ? '1ST PERSON' : '3RD PERSON'}</span>
          </button>

          {/* Level Editor */}
          <button
            onClick={onOpenLevelEditor}
            className="p-2.5 bg-black/75 hover:bg-black text-cyan-400 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg"
            title="Neon Arena Level Editor"
          >
            <Layers size={18} />
          </button>

          {/* Replay & Photo Mode */}
          <button
            onClick={onOpenReplayPhoto}
            className="p-2.5 bg-black/75 hover:bg-black text-amber-400 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all shadow-lg"
            title="Cinematic Replay & Photo Studio (P Key)"
          >
            <Camera size={18} />
          </button>

          {/* Community Hub */}
          <button
            onClick={onOpenCommunityHub}
            className="p-2.5 bg-black/75 hover:bg-black text-emerald-400 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-lg"
            title="Community Created Maps"
          >
            <Users size={18} />
          </button>

          {/* Tactical Map */}
          <button
            onClick={() => setShowTacticalMap(true)}
            className="p-2.5 bg-black/75 hover:bg-black text-white/70 hover:text-white rounded-2xl border border-white/10 transition-all"
            title="Tactical City Map (M Key)"
          >
            <Compass size={18} />
          </button>

          {/* Challenges List */}
          <button
            onClick={() => setShowChallengesModal(true)}
            className="p-2.5 bg-black/75 hover:bg-black text-white/70 hover:text-white rounded-2xl border border-white/10 transition-all"
            title="City Parkour Challenges"
          >
            <Trophy size={18} />
          </button>

          {/* Weather & Time */}
          <div className="relative">
            <button
              onClick={() => setShowWeatherMenu(!showWeatherMenu)}
              className="p-2.5 bg-black/75 hover:bg-black text-white/70 hover:text-white rounded-2xl border border-white/10 transition-all"
              title="Atmosphere & Weather"
            >
              <Wind size={18} />
            </button>
            {showWeatherMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl space-y-2 z-50">
                <div className="text-[9px] font-black uppercase text-white/40">TIME OF DAY</div>
                <div className="grid grid-cols-2 gap-1">
                  {(['dawn', 'noon', 'sunset', 'night'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => onChangeTimeOfDay(t)}
                      className={`text-[10px] font-bold uppercase p-1.5 rounded-xl ${timeOfDay === t ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] font-black uppercase text-white/40 pt-2 border-t border-white/10">WEATHER</div>
                <div className="grid grid-cols-2 gap-1">
                  {(['clear', 'rain', 'storm', 'fog'] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => onChangeWeather(w)}
                      className={`text-[10px] font-bold uppercase p-1.5 rounded-xl ${weather === w ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exit to Main Menu */}
          <button
            onClick={onExitFreerun}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-2xl border border-rose-500/30 text-xs font-black uppercase transition-all"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* MIDDLE: ACTIVE CHALLENGE TRACKER (If in progress) */}
      {activeChallenge && (
        <div className="pointer-events-auto self-start bg-black/80 backdrop-blur-xl border border-amber-500/40 p-4 rounded-3xl shadow-2xl space-y-2 max-w-sm mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Trophy size={14} /> ACTIVE CHALLENGE
            </span>
            <button
              onClick={onCancelChallenge}
              className="text-white/40 hover:text-white text-xs"
            >
              <X size={14} />
            </button>
          </div>
          <div className="text-white font-black text-sm">{activeChallenge.title}</div>
          {activeChallenge.targetTime && (
            <div className="flex justify-between items-baseline font-mono text-xs text-white/70">
              <span>TIME ELAPSED:</span>
              <span className="text-lg font-black text-amber-400">{challengeTimer.toFixed(1)}s</span>
            </div>
          )}
          {activeChallenge.targetScore && (
            <div className="flex justify-between items-baseline font-mono text-xs text-white/70">
              <span>CURRENT SCORE:</span>
              <span className="text-lg font-black text-cyan-400">{comboState.currentPoints.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM SECTION: TELEMETRY & MOBILE VIRTUAL TOUCHPADS */}
      <div className="flex flex-col sm:flex-row items-end justify-between w-full gap-4">
        {/* BOTTOM LEFT: SPEEDOMETER & FLOW STATE METER */}
        <div className="pointer-events-auto flex items-end gap-4 bg-black/75 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
          {/* Speed Gauge */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">LINEAR VELOCITY</div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black text-3xl text-white">
                {speedMps.toFixed(1)}
              </span>
              <span className="font-mono font-bold text-xs text-cyan-400">M/S</span>
            </div>
          </div>

          {/* Flow State Momentum Flame */}
          <div className="pl-4 border-l border-white/10">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-cyan-400">
              <Flame size={12} />
              <span>FLOW STATE</span>
            </div>
            <div className="w-24 bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  comboState.flowState >= 70 ? 'bg-gradient-to-r from-cyan-400 to-amber-400 animate-pulse' : 'bg-cyan-400'
                }`}
                style={{ width: `${comboState.flowState}%` }}
              />
            </div>
          </div>

          {/* Collectibles Pill */}
          <div className="pl-4 border-l border-white/10">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">DATASHARDS</div>
            <span className="font-mono font-bold text-xs text-amber-400">
              {collectedCount} / {collectibles.length}
            </span>
          </div>
        </div>

        {/* BOTTOM RIGHT: ON-SCREEN TOUCH CONTROLS FOR MOBILE / TABLET */}
        {onMobileAction && (
          <div className="pointer-events-auto grid grid-cols-3 gap-2 sm:hidden self-end">
            <button
              onClick={() => onMobileAction('vault')}
              className="p-3.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs text-white active:bg-cyan-500 active:text-black"
            >
              VAULT
            </button>
            <button
              onClick={() => onMobileAction('slide')}
              className="p-3.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs text-white active:bg-cyan-500 active:text-black"
            >
              SLIDE
            </button>
            <button
              onClick={() => onMobileAction('dash')}
              className="p-3.5 bg-cyan-500/20 border border-cyan-400 rounded-2xl font-black text-xs text-cyan-300 active:bg-cyan-500 active:text-black"
            >
              DASH
            </button>
            <button
              onClick={() => onMobileAction('flip')}
              className="p-3.5 bg-amber-500/20 border border-amber-400 rounded-2xl font-black text-xs text-amber-300 active:bg-amber-400 active:text-black"
            >
              FLIP
            </button>
            <button
              onClick={() => onMobileAction('jump')}
              className="col-span-2 p-4 bg-amber-400 rounded-2xl font-black text-sm text-black shadow-lg active:scale-95 transition-all"
            >
              JUMP / WALLRUN
            </button>
          </div>
        )}
      </div>

      {/* TACTICAL CITY MAP MODAL */}
      {showTacticalMap && (
        <div className="pointer-events-auto fixed inset-0 bg-black/85 backdrop-blur-2xl z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="text-cyan-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase italic">Metropolis Tactical Map</h3>
              </div>
              <button
                onClick={() => setShowTacticalMap(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stylized Top-Down 2D Radar View */}
            <div className="relative w-full h-80 bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
              {/* Radar Circles */}
              <div className="absolute w-64 h-64 border border-cyan-500/20 rounded-full" />
              <div className="absolute w-40 h-40 border border-cyan-500/20 rounded-full" />
              <div className="absolute w-16 h-16 border border-cyan-500/20 rounded-full" />

              {/* Central Apex Spire */}
              <div className="absolute w-8 h-8 bg-cyan-500/40 border border-cyan-400 rounded-lg flex items-center justify-center text-[8px] font-black text-cyan-300">
                APEX
              </div>

              {/* Collectibles Icons on Map */}
              {collectibles.map((item, i) => (
                <div
                  key={item.id}
                  className={`absolute w-3 h-3 rounded-full ${item.collected ? 'bg-white/20' : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`}
                  style={{
                    left: `calc(50% + ${item.position[0] * 1.1}px)`,
                    top: `calc(50% + ${item.position[2] * 1.1}px)`
                  }}
                  title={item.name}
                />
              ))}

              <div className="absolute bottom-3 left-3 text-[10px] text-white/40 font-mono">
                COORDINATES: X: 0.0, Z: 0.0 • METROPOLIS GRID 300x300m
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-white/60">
              <span><b>Yellow Dots:</b> Hidden Neon Datashards</span>
              <span><b>Center:</b> The Apex Megatower (130m)</span>
            </div>
          </div>
        </div>
      )}

      {/* CHALLENGES LIST MODAL */}
      {showChallengesModal && (
        <div className="pointer-events-auto fixed inset-0 bg-black/85 backdrop-blur-2xl z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase italic">City Parkour Challenges</h3>
              </div>
              <button
                onClick={() => setShowChallengesModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {CITY_CHALLENGES.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/40 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{ch.title}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400">
                        {ch.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 max-w-md">{ch.description}</p>
                    <div className="text-[10px] font-mono text-cyan-400 pt-1">
                      Reward: +{ch.rewardXP.toLocaleString()} XP
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onStartChallenge(ch);
                      setShowChallengesModal(false);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    START
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
