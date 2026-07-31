import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Square, Save, Download, Upload, Folder, FileCode, Sparkles, Cpu, Zap, Sliders, Settings, 
  Layers, Globe, RefreshCw, Check, AlertTriangle, Trash2, Plus, Search, Star, Volume2, Shield, HardDrive, 
  Terminal, Smartphone, Monitor, Maximize2, Minimize2, Copy, Edit3, Wrench, Boxes, Package, Workflow, 
  Bot, Eye, Activity, Flame, Music, Image as ImageIcon, Video, Compass, Crosshair, Grid, ChevronRight, 
  ChevronDown, SlidersHorizontal, Sun, Moon, Cloud, Clock, Lock, Unlock, FileText, CheckCircle2, Radio, 
  RotateCcw, RotateCw, PlayCircle, StopCircle, RefreshCcw, Database, HardDriveDownload, Laptop, ShieldCheck,
  PackageCheck, HelpCircle, Layers3, CpuIcon, Gauge, Hammer, Wand2, Dna, Swords, Skull, ShieldAlert, Car,
  Sparkle, FileArchive, CheckCircle, Code2, PlaySquare, Key, Command, RadioTower, CloudUpload, ArrowRight
} from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

export interface NeonModProject {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  targetPlatforms: ('android' | 'windows' | 'linux' | 'macOS')[];
  language: 'cs' | 'cpp' | 'kotlin' | 'java' | 'rust' | 'python';
  created: string;
  lastModified: string;
  sizeMB: number;
  uncompressedSizeMB: number;
  compressionPreset: 'low' | 'balanced' | 'high' | 'quantum_max';
  itemsCount: number;
  npcsCount: number;
  dungeonsCount: number;
  vehiclesCount: number;
  status: 'draft' | 'validated' | 'packaged' | 'error';
}

export interface ModAsset {
  id: string;
  name: string;
  type: 'texture' | 'model' | 'sound' | 'script' | 'animation' | 'mesh' | 'shader' | 'particle' | 'material';
  extension: string;
  originalSizeKB: number;
  optimizedSizeKB: number;
  optimizationRatio: number; // e.g., 0.25 = 75% saved
  status: 'raw' | 'optimized' | 'pending';
}

export interface ModEntity {
  id: string;
  name: string;
  category: 'npc' | 'boss' | 'weapon' | 'armor' | 'pet' | 'vehicle' | 'dungeon' | 'world_object' | 'quest' | 'recipe';
  hp?: number;
  damage?: number;
  speed?: number;
  color: string;
  scriptLanguage: string;
  tags: string[];
  codeSnippet: string;
}

interface NeonArenaModStudioProps {
  onClose: () => void;
}

export function NeonArenaModStudio({ onClose }: NeonArenaModStudioProps) {
  // Tab State
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'projects'
    | 'world'
    | 'npcs'
    | 'dungeons'
    | 'items'
    | 'vehicles'
    | 'ai'
    | 'assets'
    | 'testing'
    | 'export'
    | 'settings'
  >('home');

  // Active Selected Target Platform
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'android' | 'linux' | 'macOS'>('windows');

  // Undo / Redo History
  const [undoStack, setUndoStack] = useState<string[]>(['Initial Studio Loaded']);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // System Hardware Simulation & Multi-threading
  const [gpuAccelerated, setGpuAccelerated] = useState(true);
  const [activeThreads, setActiveThreads] = useState(8);
  const [vramUsageMB, setVramUsageMB] = useState(1420);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState('Just now');

  // Selected Active Project
  const [projects, setProjects] = useState<NeonModProject[]>([
    {
      id: 'proj_cyberpunk_bosses',
      name: 'Cyberpunk Boss Overhaul',
      version: '2.4.0',
      author: 'NeonMaster',
      description: 'Adds 5 neon-infused cybernetic bosses with laser breath and custom script drops.',
      targetPlatforms: ['android', 'windows', 'linux', 'macOS'],
      language: 'cs',
      created: '2026-07-20',
      lastModified: '2026-07-31',
      sizeMB: 384,
      uncompressedSizeMB: 4096,
      compressionPreset: 'high',
      itemsCount: 14,
      npcsCount: 6,
      dungeonsCount: 2,
      vehiclesCount: 3,
      status: 'validated'
    },
    {
      id: 'proj_infinity_vehicles',
      name: 'Hyperdrive Vehicles & Mech Suits',
      version: '1.1.2',
      author: 'QuantumCoder',
      description: 'Adds hovercrafts, lightcycles, and titan mechs with custom sound synthesis.',
      targetPlatforms: ['windows', 'android'],
      language: 'cpp',
      created: '2026-07-25',
      lastModified: '2026-07-30',
      sizeMB: 180,
      uncompressedSizeMB: 1200,
      compressionPreset: 'quantum_max',
      itemsCount: 8,
      npcsCount: 0,
      dungeonsCount: 1,
      vehiclesCount: 12,
      status: 'packaged'
    }
  ]);

  const [currentProject, setCurrentProject] = useState<NeonModProject>(projects[0]);

  // Mod Assets Engine
  const [assets, setAssets] = useState<ModAsset[]>([
    { id: 'ast_tex_01', name: 'CyberTitan_Diffuse_4K', type: 'texture', extension: 'PNG', originalSizeKB: 16384, optimizedSizeKB: 2048, optimizationRatio: 0.125, status: 'optimized' },
    { id: 'ast_mdl_01', name: 'PlasmaDragon_HighPoly', type: 'model', extension: 'FBX', originalSizeKB: 65536, optimizedSizeKB: 4096, optimizationRatio: 0.0625, status: 'optimized' },
    { id: 'ast_snd_01', name: 'LaserCannon_Fire_96k', type: 'sound', extension: 'WAV', originalSizeKB: 8192, optimizedSizeKB: 512, optimizationRatio: 0.0625, status: 'optimized' },
    { id: 'ast_scr_01', name: 'BossAI_BehaviorTree', type: 'script', extension: 'CS', originalSizeKB: 128, optimizedSizeKB: 32, optimizationRatio: 0.25, status: 'optimized' },
    { id: 'ast_fx_01', name: 'NeonSparks_Emitter', type: 'particle', extension: 'JSON', originalSizeKB: 512, optimizedSizeKB: 96, optimizationRatio: 0.1875, status: 'optimized' },
    { id: 'ast_shd_01', name: 'Hologram_PBR_Shader', type: 'shader', extension: 'GLTF', originalSizeKB: 2048, optimizedSizeKB: 256, optimizationRatio: 0.125, status: 'optimized' }
  ]);

  // Entities state
  const [entities, setEntities] = useState<ModEntity[]>([
    {
      id: 'ent_boss_01',
      name: 'VORTEX NEON DRAGON',
      category: 'boss',
      hp: 12500,
      damage: 450,
      speed: 14,
      color: '#ff0077',
      scriptLanguage: 'C#',
      tags: ['Boss', 'Flying', 'LaserBreath', 'ImmuneToStun'],
      codeSnippet: `using NeonArena.Modding;\npublic class VortexDragon : BossEntity {\n    public override void OnPhaseTwo() {\n        EmitPulseWave(damage: 900, radius: 45f);\n    }\n}`
    },
    {
      id: 'ent_wpn_01',
      name: 'QUANTUM PULSE RIFLE',
      category: 'weapon',
      hp: 100,
      damage: 180,
      speed: 800,
      color: '#00f0ff',
      scriptLanguage: 'C++',
      tags: ['Energy', 'Piercing', 'AutoReload'],
      codeSnippet: `#include "NeonMod.h"\nvoid FireQuantumPulse(Player* shooter) {\n    SpawnProjectile(PROJECTILE_PLASMA_BEAM, 180.0f);\n}`
    },
    {
      id: 'ent_veh_01',
      name: 'APEX HOVERPOD XR',
      category: 'vehicle',
      hp: 3000,
      damage: 120,
      speed: 120,
      color: '#00ff88',
      scriptLanguage: 'Kotlin',
      tags: ['Hovercraft', 'BoostEngines', 'Shielded'],
      codeSnippet: `package com.neonarena.mods\nclass HoverPod : Vehicle() {\n    fun activateAfterburner() { speedMultiplier = 2.5f }\n}`
    }
  ]);

  const [selectedEntityId, setSelectedEntityId] = useState<string>(entities[0].id);
  const selectedEntity = useMemo(() => entities.find(e => e.id === selectedEntityId) || entities[0], [entities, selectedEntityId]);

  // AI Assistant Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiOutputLogs, setAiOutputLogs] = useState<string[]>([
    '🤖 AI Mod Engine v4.2 initialized and ready.',
    '💡 Enter any text prompt to generate C#, C++, Kotlin, Java, Rust or JSON mod files automatically.'
  ]);

  // Compression & Optimization Pipeline State
  const [compressionPreset, setCompressionPreset] = useState<'low' | 'balanced' | 'high' | 'quantum_max'>('high');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(0);

  // Testing & Performance Analyzer State
  const [isLivePreviewActive, setIsLivePreviewActive] = useState(false);
  const [isTestingMultiplayer, setIsTestingMultiplayer] = useState(false);
  const [errorLogs, setErrorLogs] = useState<{ id: string, severity: 'error' | 'warning' | 'info', message: string, file: string }[]>([
    { id: 'err_1', severity: 'info', message: 'Mod metadata structure validated against Neon Arena v3.2 schema.', file: 'mod.json' },
    { id: 'err_2', severity: 'warning', message: 'Texture resolution 4096x4096 exceeds mobile default (2048 recommended for Android).', file: 'CyberTitan_Diffuse_4K.png' }
  ]);

  // Automatic Autosave timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAutosaving(true);
      setTimeout(() => {
        setIsAutosaving(false);
        setLastAutosaveTime(new Date().toLocaleTimeString());
      }, 600);
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const handlePushUndo = (actionName: string) => {
    setUndoStack(prev => [...prev, actionName]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, last]);
    soundService.playSFX('ui_click');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, next]);
    soundService.playSFX('ui_click');
  };

  // AI Generator Action
  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    soundService.playSFX('ui_click');

    const promptText = aiPrompt;
    setAiOutputLogs(prev => [...prev, `\n> USER PROMPT: "${promptText}"`, '⚡ Synthesizing textures, mesh hierarchy, and C# behavior scripts...']);

    setTimeout(() => {
      const generatedName = promptText.slice(0, 20).toUpperCase() + ' MOD';
      const newEnt: ModEntity = {
        id: `ent_gen_${Date.now()}`,
        name: generatedName,
        category: promptText.toLowerCase().includes('weapon') ? 'weapon' : promptText.toLowerCase().includes('vehicle') ? 'vehicle' : 'boss',
        hp: 4500,
        damage: 320,
        speed: 16,
        color: '#ab00ff',
        scriptLanguage: 'C#',
        tags: ['AI-Generated', 'NeonArena', 'CustomScript'],
        codeSnippet: `// Auto-generated by Neon Arena AI Assistant\n// Prompt: "${promptText}"\nusing NeonArena.Modding;\n\npublic class ${generatedName.replace(/[^a-zA-Z0-9]/g, '')} : ModItem {\n    void Start() {\n        InitStats(damage: 320, speed: 16);\n        ApplyParticleGlow(Color.magenta);\n    }\n}`
      };

      setEntities(prev => [newEnt, ...prev]);
      setSelectedEntityId(newEnt.id);
      setAiOutputLogs(prev => [...prev, `✅ SUCCESS: Created entity "${generatedName}" and added to active project.`]);
      setIsAiGenerating(false);
      setAiPrompt('');
      handlePushUndo(`AI Generated ${generatedName}`);
    }, 1200);
  };

  // Compression Calculation Helper
  const compressionInfo = useMemo(() => {
    const rawMB = currentProject.uncompressedSizeMB;
    let targetRatio = 0.5;
    if (compressionPreset === 'low') targetRatio = 0.65;
    if (compressionPreset === 'balanced') targetRatio = 0.35;
    if (compressionPreset === 'high') targetRatio = 0.095; // ~384MB for 4096MB baseline
    if (compressionPreset === 'quantum_max') targetRatio = 0.024; // ~98MB for 4096MB baseline

    const finalSizeMB = Math.round(rawMB * targetRatio);
    const savedPercentage = Math.round((1 - targetRatio) * 100);

    return {
      rawMB,
      finalSizeMB,
      savedPercentage
    };
  }, [currentProject.uncompressedSizeMB, compressionPreset]);

  // Run Compression Pipeline
  const runCompressionPipeline = () => {
    setIsOptimizing(true);
    setOptimizeProgress(0);
    soundService.playSFX('ui_click');

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setOptimizeProgress(100);
        setIsOptimizing(false);
        clearInterval(interval);
        setCurrentProject(prev => ({
          ...prev,
          sizeMB: compressionInfo.finalSizeMB,
          compressionPreset: compressionPreset,
          status: 'packaged'
        }));
        handlePushUndo(`Optimized project with ${compressionPreset} preset`);
      } else {
        setOptimizeProgress(current);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white z-[90] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Application Bar */}
      <header className="h-14 bg-zinc-900/90 border-b border-cyan-500/20 px-4 flex items-center justify-between backdrop-blur-md">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Boxes size={18} className="text-black font-black" />
            </div>
            <div>
              <div className="text-sm font-black italic tracking-tighter text-white flex items-center gap-2">
                NEON ARENA <span className="text-cyan-400 font-mono text-xs not-italic bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded">MOD STUDIO v3.5</span>
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                Cross-Platform Engine Suite
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Target Platform Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
            {(['windows', 'android', 'linux', 'macOS'] as const).map(plat => (
              <button
                key={plat}
                onClick={() => {
                  setSelectedPlatform(plat);
                  soundService.playSFX('ui_click');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedPlatform === plat
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {plat === 'windows' && <Monitor size={12} />}
                {plat === 'android' && <Smartphone size={12} />}
                {plat === 'linux' && <Terminal size={12} />}
                {plat === 'macOS' && <Laptop size={12} />}
                {plat}
              </button>
            ))}
          </div>
        </div>

        {/* Center: System Telemetry & Undo/Redo */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-white/50">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400 animate-pulse" />
            <span>TH: {activeThreads} CORES</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className={gpuAccelerated ? 'text-amber-400' : 'text-zinc-600'} />
            <span>GPU ACCEL: {gpuAccelerated ? 'ON' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-emerald-400" />
            <span>VRAM: {vramUsageMB} MB</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw size={12} className={isAutosaving ? 'animate-spin text-cyan-400' : 'text-zinc-500'} />
            <span>AUTOSAVE: {isAutosaving ? 'SAVING...' : lastAutosaveTime}</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/10">
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-white/70"
              title="Undo"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 text-white/70"
              title="Redo"
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>

        {/* Right: Close Studio */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundService.playSFX('ui_click');
              onClose();
            }}
            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all flex items-center gap-1 text-xs font-black uppercase tracking-wider"
          >
            <X size={16} />
            <span className="hidden sm:inline">EXIT STUDIO</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Header (12 Required Studio Tabs) */}
      <nav className="bg-zinc-950 border-b border-white/10 px-4 py-2 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'home', label: 'Home', icon: Globe, color: 'text-cyan-400' },
          { id: 'projects', label: 'Projects', icon: Folder, color: 'text-amber-400' },
          { id: 'world', label: 'World', icon: Grid, color: 'text-emerald-400' },
          { id: 'npcs', label: 'NPCs & Bosses', icon: Skull, color: 'text-rose-400' },
          { id: 'dungeons', label: 'Dungeons', icon: ShieldAlert, color: 'text-violet-400' },
          { id: 'items', label: 'Items & Skills', icon: Swords, color: 'text-yellow-400' },
          { id: 'vehicles', label: 'Vehicles', icon: Car, color: 'text-fuchsia-400' },
          { id: 'ai', label: 'AI Assistant', icon: Bot, color: 'text-cyan-400' },
          { id: 'assets', label: 'Assets & Shaders', icon: Layers, color: 'text-blue-400' },
          { id: 'testing', label: 'Testing & Logs', icon: Activity, color: 'text-emerald-400' },
          { id: 'export', label: 'Export & Compress', icon: FileArchive, color: 'text-pink-400' },
          { id: 'settings', label: 'Settings', icon: Settings, color: 'text-zinc-400' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundService.playSFX('ui_click');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Studio Workspace Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 custom-scrollbar">
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Hero Dashboard Banner */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-indigo-950/60 border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Boxes size={320} className="text-cyan-400" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase bg-cyan-950 border border-cyan-500/40 px-3 py-1 rounded-full">
                  NEON ARENA AUTHORING SYSTEM
                </span>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase mt-4">
                  VISUAL MOD STUDIO & ASSET COMPRESSOR
                </h1>
                <p className="text-white/60 text-sm mt-3 leading-relaxed">
                  Build complete mods for Neon Arena without writing code. Author custom worlds, NPCs, weapons, vehicles, shaders, and particle FX with multi-threaded GPU asset compression for Android, Windows, Linux, and macOS.
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="px-6 py-3 bg-cyan-500 text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                  >
                    <Plus size={16} /> NEW MOD PROJECT
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="px-6 py-3 bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 font-black uppercase text-xs rounded-xl hover:bg-fuchsia-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Bot size={16} /> AI PROMPT GENERATOR
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="px-6 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black uppercase text-xs rounded-xl hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
                  >
                    <FileArchive size={16} /> COMPRESS & EXPORT (4GB &rarr; 98MB)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Target Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/80 border border-white/10 p-5 rounded-2xl">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Active Project</div>
                <div className="text-xl font-black italic text-white truncate">{currentProject.name}</div>
                <div className="text-xs text-white/40 mt-1 font-mono">Ver {currentProject.version} • {currentProject.language.toUpperCase()}</div>
              </div>

              <div className="bg-zinc-900/80 border border-white/10 p-5 rounded-2xl">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Target Platform</div>
                <div className="text-xl font-black italic text-white uppercase">{selectedPlatform}</div>
                <div className="text-xs text-white/40 mt-1 font-mono">Cross-Compiled Native SDK</div>
              </div>

              <div className="bg-zinc-900/80 border border-white/10 p-5 rounded-2xl">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Optimization Ratio</div>
                <div className="text-xl font-black italic text-white">{compressionInfo.savedPercentage}% SAVED</div>
                <div className="text-xs text-white/40 mt-1 font-mono">{currentProject.uncompressedSizeMB} MB &rarr; {currentProject.sizeMB} MB</div>
              </div>

              <div className="bg-zinc-900/80 border border-white/10 p-5 rounded-2xl">
                <div className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">Total Entities</div>
                <div className="text-xl font-black italic text-white">{entities.length} AUTHORED</div>
                <div className="text-xs text-white/40 mt-1 font-mono">Bosses, Items, Vehicles</div>
              </div>
            </div>

            {/* Quick Authoring Hub Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-2">
                  <Wrench size={18} className="text-cyan-400" /> CREATOR MODULES
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { label: 'World Editor', tab: 'world' },
                    { label: 'Dungeon Creator', tab: 'dungeons' },
                    { label: 'NPC & Boss Creator', tab: 'npcs' },
                    { label: 'Weapon & Armor', tab: 'items' },
                    { label: 'Vehicle Creator', tab: 'vehicles' },
                    { label: 'AI Prompt Studio', tab: 'ai' }
                  ].map(mod => (
                    <button
                      key={mod.label}
                      onClick={() => setActiveTab(mod.tab as any)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/30 rounded-xl text-left text-white/80 hover:text-white transition-all flex items-center justify-between"
                    >
                      <span>{mod.label}</span>
                      <ChevronRight size={14} className="text-cyan-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-2">
                  <FileArchive size={18} className="text-amber-400" /> COMPRESSION SYSTEM
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Compress high-fidelity assets (textures, models, WAV audio, meshes) using our multi-threaded Draco & ASTC pipeline.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Baseline Project:</span>
                    <span className="text-white font-bold">{currentProject.uncompressedSizeMB} MB</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Target Compressed:</span>
                    <span className="text-emerald-400 font-bold">{compressionInfo.finalSizeMB} MB</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('export')}
                  className="w-full py-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-amber-500 hover:text-black transition-all"
                >
                  CONFIGURE PIPELINE
                </button>
              </div>

              <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" /> TESTING & LIVE PREVIEW
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Run real-time mod validation, check for null-pointers, test multiplayer RPC sync, and launch in live preview mode.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsLivePreviewActive(true);
                      setActiveTab('testing');
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} /> LIVE PREVIEW
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROJECTS ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase text-white">PROJECT MANAGER</h2>
                <p className="text-xs text-white/40 font-mono">Create, import, and manage Neon Arena mod workspace files.</p>
              </div>
              <button
                onClick={() => {
                  const newProj: NeonModProject = {
                    id: `proj_${Date.now()}`,
                    name: 'New Custom Mod',
                    version: '1.0.0',
                    author: 'Modder',
                    description: 'Custom mod project created in Neon Arena Studio.',
                    targetPlatforms: ['windows', 'android', 'linux', 'macOS'],
                    language: 'cs',
                    created: new Date().toISOString().slice(0, 10),
                    lastModified: new Date().toISOString().slice(0, 10),
                    sizeMB: 12,
                    uncompressedSizeMB: 120,
                    compressionPreset: 'high',
                    itemsCount: 0,
                    npcsCount: 0,
                    dungeonsCount: 0,
                    vehiclesCount: 0,
                    status: 'draft'
                  };
                  setProjects([newProj, ...projects]);
                  setCurrentProject(newProj);
                  soundService.playSFX('ui_click');
                }}
                className="px-5 py-2.5 bg-cyan-500 text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> NEW PROJECT
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => setCurrentProject(proj)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    currentProject.id === proj.id
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                      : 'bg-zinc-900/60 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-cyan-400">
                        {proj.language.toUpperCase()} ENGINE
                      </span>
                      <h3 className="text-2xl font-black italic text-white uppercase mt-2">{proj.name}</h3>
                      <div className="text-xs text-white/40 font-mono">By {proj.author} • Ver {proj.version}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      proj.status === 'packaged' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 mb-6 line-clamp-2">{proj.description}</p>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono bg-black/40 p-3 rounded-2xl border border-white/5">
                    <div>
                      <div className="text-white/40 uppercase">ITEMS</div>
                      <div className="text-white font-bold">{proj.itemsCount}</div>
                    </div>
                    <div>
                      <div className="text-white/40 uppercase">NPCS</div>
                      <div className="text-white font-bold">{proj.npcsCount}</div>
                    </div>
                    <div>
                      <div className="text-white/40 uppercase">DUNGEONS</div>
                      <div className="text-white font-bold">{proj.dungeonsCount}</div>
                    </div>
                    <div>
                      <div className="text-white/40 uppercase">SIZE</div>
                      <div className="text-cyan-400 font-bold">{proj.sizeMB} MB</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WORLD EDITOR ================= */}
        {activeTab === 'world' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 flex flex-col h-[650px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                  <Grid size={18} className="text-emerald-400" /> 3D WORLD & TERRAIN VIEWPORT
                </h3>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
                    GRID: 512 x 512 VOXELS
                  </span>
                </div>
              </div>

              {/* Viewport Simulation Frame */}
              <div className="flex-1 bg-black/90 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/30 via-black to-black" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:32px_32px]" />
                
                {/* 3D Representation Placeholder */}
                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-32 h-32 rounded-3xl border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse">
                    <Compass size={48} className="text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-black uppercase text-white tracking-widest">NEON TERRAIN ENGINE ACTIVE</div>
                    <div className="text-xs text-white/40 font-mono">Use WASD to orbit scene • Drag & Drop skyboxes and light nodes</div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-black/80 p-3 rounded-xl border border-white/10 font-mono text-[10px] text-white/60 space-y-1">
                  <div>CAM: X:14.2 Y:8.0 Z:-3.5</div>
                  <div>LIGHTING: CYBER_PBR_NIGHT</div>
                  <div>SKYBOX: NEON_CITY_GRID</div>
                </div>
              </div>
            </div>

            {/* World Parameters Side Inspector */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black italic text-white uppercase border-b border-white/10 pb-3">
                ENVIRONMENT CONTROLS
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-white/40 uppercase mb-2 block">Terrain Type</label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400">
                    <option>Neon Grid City</option>
                    <option>Cyber Wasteland</option>
                    <option>Quantum Void Caverns</option>
                    <option>High-Tech Arena Fortress</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/40 uppercase mb-2 block">Day/Night Time Cycle</label>
                  <input type="range" min="0" max="24" defaultValue="22" className="w-full accent-emerald-400" />
                </div>

                <div>
                  <label className="text-white/40 uppercase mb-2 block">Weather Intensity</label>
                  <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-emerald-400" />
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="text-white/40 uppercase">Environment Features</div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-emerald-400" />
                    <span>Enable Acid Rain Particles</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-emerald-400" />
                    <span>Dynamic Volumetric Fog</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-emerald-400" />
                    <span>Real-time Global Illumination</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: NPCS & BOSSES ================= */}
        {activeTab === 'npcs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Entity List */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                  <Skull size={18} className="text-rose-400" /> AUTHOR & BOSS LIST
                </h3>
                <button
                  onClick={() => {
                    const newBoss: ModEntity = {
                      id: `ent_boss_${Date.now()}`,
                      name: 'CYBER ENFORCER',
                      category: 'boss',
                      hp: 8000,
                      damage: 350,
                      speed: 12,
                      color: '#ff0055',
                      scriptLanguage: 'C#',
                      tags: ['EliteBoss', 'Shielded'],
                      codeSnippet: `using NeonArena;\npublic class CyberEnforcer : BossEntity {}`
                    };
                    setEntities([...entities, newBoss]);
                    setSelectedEntityId(newBoss.id);
                  }}
                  className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {entities.filter(e => e.category === 'boss' || e.category === 'npc').map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEntityId(e.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selectedEntityId === e.id
                        ? 'bg-rose-950/40 border-rose-400 text-white'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black italic uppercase">{e.name}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black text-rose-400 border border-rose-500/30 uppercase">{e.category}</span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">HP: {e.hp} • DMG: {e.damage}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Entity Inspector & Script Editor */}
            <div className="lg:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-black italic text-white uppercase">{selectedEntity.name}</h3>
                  <div className="text-xs text-white/40 font-mono">ID: {selectedEntity.id}</div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-500/40">
                    {selectedEntity.scriptLanguage} SCRIPT ENGINE
                  </span>
                </div>
              </div>

              {/* Stats Adjuster */}
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <label className="text-white/40 uppercase block mb-1">Health Points</label>
                  <input
                    type="number"
                    value={selectedEntity.hp || 1000}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, hp: val } : ent));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <label className="text-white/40 uppercase block mb-1">Attack Damage</label>
                  <input
                    type="number"
                    value={selectedEntity.damage || 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, damage: val } : ent));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white font-bold"
                  />
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <label className="text-white/40 uppercase block mb-1">Movement Speed</label>
                  <input
                    type="number"
                    value={selectedEntity.speed || 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, speed: val } : ent));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white font-bold"
                  />
                </div>
              </div>

              {/* Embedded Script Inspector */}
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs text-white/50">
                  <span>BEHAVIOR CODE SCRIPT ({selectedEntity.scriptLanguage})</span>
                  <span>SYNTAX CHECK: PASSED</span>
                </div>
                <textarea
                  value={selectedEntity.codeSnippet}
                  onChange={(e) => {
                    const text = e.target.value;
                    setEntities(entities.map(ent => ent.id === selectedEntity.id ? { ...ent, codeSnippet: text } : ent));
                  }}
                  rows={10}
                  className="w-full bg-black/80 border border-white/10 rounded-2xl p-4 text-cyan-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 custom-scrollbar"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: DUNGEONS ================= */}
        {activeTab === 'dungeons' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                <ShieldAlert size={20} className="text-violet-400" /> DUNGEON & ROOM GENERATOR
              </h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                Design procedural dungeon floors, keycard security chambers, trap triggers, and boss wave arenas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-black/50 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-violet-400 uppercase">1. Floor Blueprint</div>
                  <div className="text-xs text-white/70">Rooms: 12 Chambers</div>
                  <div className="text-xs text-white/70">Layout: Procedural Grid</div>
                  <button className="w-full py-2 bg-violet-600/30 text-violet-300 border border-violet-500/40 rounded-xl font-black text-xs uppercase hover:bg-violet-600 hover:text-white transition-all">
                    EDIT ROOM MESHES
                  </button>
                </div>

                <div className="bg-black/50 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-amber-400 uppercase">2. Wave Spawner</div>
                  <div className="text-xs text-white/70">Enemy Waves: 5 Stages</div>
                  <div className="text-xs text-white/70">Boss Trigger: Vortex Dragon</div>
                  <button className="w-full py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl font-black text-xs uppercase hover:bg-amber-500 hover:text-black transition-all">
                    CONFIGURE WAVES
                  </button>
                </div>

                <div className="bg-black/50 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-emerald-400 uppercase">3. Loot Rewards</div>
                  <div className="text-xs text-white/70">Chest Drops: Quantum Pulse Rifle</div>
                  <div className="text-xs text-white/70">XP Reward: 5,000 EXP</div>
                  <button className="w-full py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-black text-xs uppercase hover:bg-emerald-500 hover:text-black transition-all">
                    CONFIGURE LOOT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: ITEMS & SKILLS ================= */}
        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                <Swords size={18} className="text-yellow-400" /> WEAPONS & ARMOR
              </h3>
              <div className="space-y-2">
                {entities.filter(e => e.category === 'weapon' || e.category === 'armor').map(item => (
                  <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-black text-white uppercase">{item.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">DMG: {item.damage}</div>
                    </div>
                    <span className="text-[10px] font-mono text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-500/30">
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black italic text-white uppercase border-b border-white/10 pb-3">
                CRAFTING RECIPE & SKILL TREE AUTHORING
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-yellow-400 font-bold uppercase">Recipe Crafting Requirements</div>
                  <div className="text-white/70">• 5x Cyber Alloy Ingot</div>
                  <div className="text-white/70">• 2x Plasma Core Unit</div>
                  <div className="text-white/70">• 1x Quantum Crystal</div>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-cyan-400 font-bold uppercase">Skill Effect Hook</div>
                  <div className="text-white/70">Skill Name: Overcharge Pulse</div>
                  <div className="text-white/70">Cooldown: 12.0 Seconds</div>
                  <div className="text-white/70">Effect: AOE Stun + 200% Fire Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: VEHICLES ================= */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                <Car size={20} className="text-fuchsia-400" /> VEHICLE & MECH CREATOR
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/50 p-6 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-lg font-black italic text-fuchsia-400 uppercase">APEX HOVERPOD XR</h4>
                  <p className="text-xs text-white/60">Hover physics engine with turbo afterburners and dual plasma turret mounts.</p>
                  <div className="font-mono text-xs space-y-1 text-white/80">
                    <div>Top Speed: 120 km/h</div>
                    <div>Boost Multiplier: 2.5x</div>
                    <div>Armor Plating: Heavy Energy Shield</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: AI ASSISTANT ================= */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                    <Bot size={22} className="text-cyan-400 animate-pulse" /> AI MOD FILE GENERATOR
                  </h3>
                  <p className="text-xs text-white/40 font-mono">Prompt-driven automated code, texture, and model synthesizer.</p>
                </div>
              </div>

              {/* Console Output Log */}
              <div className="bg-black/90 border border-white/10 rounded-2xl p-4 h-[320px] font-mono text-xs text-cyan-300 overflow-y-auto space-y-2 custom-scrollbar">
                {aiOutputLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                ))}
              </div>

              {/* Prompt Box */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                    placeholder="Describe a mod element (e.g. 'Create a laser-guided plasma sniper rifle written in C++ with 450 damage')..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="px-6 py-4 bg-cyan-500 text-black font-black uppercase text-xs rounded-2xl hover:bg-white transition-all disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    {isAiGenerating ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>GENERATE</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="text-white/40">SUGGESTIONS:</span>
                  {[
                    'Cyber dragon boss with laser breath',
                    'Heavy hovertank with railgun',
                    'Healing drone pet in Kotlin',
                    'Particle lightning storm shader'
                  ].map(sug => (
                    <button
                      key={sug}
                      onClick={() => setAiPrompt(sug)}
                      className="text-cyan-400 hover:text-white bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-full transition-all"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Capability Inspector */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black italic text-white uppercase">SUPPORTED AI TARGETS</h3>
              <div className="space-y-3 text-xs font-mono text-white/70">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-cyan-400 font-bold">C# Mod Scripts</div>
                  <div>Unity / Neon Engine behavior hooks</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-amber-400 font-bold">C++ Native Modules</div>
                  <div>High performance physics overrides</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-emerald-400 font-bold">Kotlin / Java</div>
                  <div>Android native Capacitor bindings</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: ASSETS & SHADERS ================= */}
        {activeTab === 'assets' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                  <Layers size={20} className="text-blue-400" /> ASSET BROWSER & SHADER PIPELINE
                </h3>
                <span className="text-xs font-mono text-white/40">SUPPORTED: PNG, JPG, WEBP, OBJ, FBX, GLTF, GLB, WAV, OGG, MP3</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assets.map(ast => (
                  <div key={ast.id} className="p-4 bg-black/60 border border-white/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-black text-white">{ast.name}.{ast.extension}</div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {(ast.originalSizeKB / 1024).toFixed(1)}MB &rarr; {(ast.optimizedSizeKB / 1024).toFixed(1)}MB
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      -{Math.round((1 - ast.optimizationRatio) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 10: TESTING ================= */}
        {activeTab === 'testing' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400" /> LIVE MOD TEST BENCH
                  </h3>
                  <button
                    onClick={() => setIsLivePreviewActive(!isLivePreviewActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                      isLivePreviewActive ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {isLivePreviewActive ? <Square size={14} /> : <Play size={14} />}
                    <span>{isLivePreviewActive ? 'STOP PREVIEW' : 'START PREVIEW'}</span>
                  </button>
                </div>

                <div className="h-[400px] bg-black rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                  {isLivePreviewActive ? (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                      <div className="text-sm font-black text-emerald-400 uppercase tracking-widest">EXECUTING LIVE MOD PREVIEW...</div>
                      <div className="text-xs text-white/50 font-mono">60 FPS • GPU VRAM 1420MB • MULTIPLAYER SYNC OK</div>
                    </div>
                  ) : (
                    <div className="text-white/30 text-xs uppercase tracking-widest font-mono">
                      CLICK "START PREVIEW" TO LAUNCH IN-STUDIO GAME ENGINE TEST
                    </div>
                  )}
                </div>
              </div>

              {/* Error Checker Panel */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-black italic text-white uppercase flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" /> VALIDATION LOGS
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  {errorLogs.map(err => (
                    <div key={err.id} className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-1">
                      <div className="flex justify-between">
                        <span className={`text-[9px] font-black uppercase ${err.severity === 'warning' ? 'text-amber-400' : 'text-cyan-400'}`}>
                          [{err.severity.toUpperCase()}]
                        </span>
                        <span className="text-white/40">{err.file}</span>
                      </div>
                      <div className="text-white/80">{err.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 11: EXPORT & COMPRESSION ================= */}
        {activeTab === 'export' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
              <div>
                <span className="text-[10px] font-black tracking-[0.4em] text-amber-400 uppercase bg-amber-950 border border-amber-500/40 px-3 py-1 rounded-full">
                  ADVANCED ASSET OPTIMIZATION PIPELINE
                </span>
                <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mt-4">
                  COMPRESS & ONE-CLICK EXPORT
                </h2>
                <p className="text-white/60 text-sm mt-2">
                  Reduce project sizes (e.g. from 4 GB down to ~98 MB) using optimized texture compression (WEBP/ASTC), Draco mesh quantization, and OGG Vorbis sound encoding.
                </p>
              </div>

              {/* Preset Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { id: 'low', label: 'Low Compression', desc: 'Fast compile (~2.8 GB output)', color: 'border-zinc-700' },
                  { id: 'balanced', label: 'Balanced', desc: 'Standard quality (~1.2 GB output)', color: 'border-cyan-500/40' },
                  { id: 'high', label: 'High (Recommended)', desc: 'Optimized (~384 MB output)', color: 'border-amber-500/40' },
                  { id: 'quantum_max', label: 'Quantum Max Ultra', desc: 'Maximum compression (~98 MB output)', color: 'border-fuchsia-500/50' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCompressionPreset(preset.id as any);
                      soundService.playSFX('ui_click');
                    }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      compressionPreset === preset.id
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <div className="text-sm font-black uppercase text-white mb-1">{preset.label}</div>
                    <div className="text-[10px] font-mono text-white/50">{preset.desc}</div>
                  </button>
                ))}
              </div>

              {/* Live Compression Metrics */}
              <div className="bg-black/80 p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center font-mono">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">RAW PROJECT SIZE</div>
                  <div className="text-3xl font-black text-white mt-1">{currentProject.uncompressedSizeMB} MB</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest">ESTIMATED COMPRESSED</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{compressionInfo.finalSizeMB} MB</div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest">SAVINGS RATIO</div>
                  <div className="text-3xl font-black text-emerald-400 mt-1">-{compressionInfo.savedPercentage}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              {isOptimizing && (
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs text-amber-400 font-bold">
                    <span>OPTIMIZING MESHES & TEXTURES...</span>
                    <span>{optimizeProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-amber-500/40 p-0.5">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-fuchsia-600 rounded-full transition-all duration-200" style={{ width: `${optimizeProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Action Export Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={runCompressionPipeline}
                  disabled={isOptimizing}
                  className="px-8 py-4 bg-amber-400 text-black font-black uppercase text-sm rounded-2xl hover:bg-white transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2"
                >
                  <Sparkles size={18} /> RUN OPTIMIZATION PIPELINE
                </button>

                <button
                  onClick={() => {
                    soundService.playSFX('ui_click');
                    alert(`Mod "${currentProject.name}" successfully exported as .NMOD package for ${selectedPlatform.toUpperCase()}!`);
                  }}
                  className="px-6 py-4 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black uppercase text-xs rounded-2xl hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2"
                >
                  <Download size={16} /> EXPORT .NMOD / .ZIP
                </button>

                <button
                  onClick={() => {
                    soundService.playSFX('ui_click');
                    alert(`Mod "${currentProject.name}" installed into active Neon Arena game folder!`);
                  }}
                  className="px-6 py-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black uppercase text-xs rounded-2xl hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2"
                >
                  <PackageCheck size={16} /> ONE-CLICK INSTALL TO GAME
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 12: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 space-y-6">
              <h3 className="text-xl font-black italic text-white uppercase border-b border-white/10 pb-3">
                STUDIO CONFIGURATION & PREFERENCES
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="text-cyan-400 font-bold uppercase">Multi-threading & Hardware</div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>GPU Hardware Acceleration</span>
                    <input
                      type="checkbox"
                      checked={gpuAccelerated}
                      onChange={(e) => setGpuAccelerated(e.target.checked)}
                      className="accent-cyan-400"
                    />
                  </label>
                  <div>
                    <span className="block mb-1 text-white/50">Worker Threads: {activeThreads}</span>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      value={activeThreads}
                      onChange={(e) => setActiveThreads(parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="text-amber-400 font-bold uppercase">Language & Dependencies</div>
                  <div>
                    <span className="block mb-1 text-white/50">Primary Script Language:</span>
                    <select
                      value={currentProject.language}
                      onChange={(e) => setCurrentProject({ ...currentProject, language: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-white/10 p-2.5 rounded-xl text-white focus:outline-none"
                    >
                      <option value="cs">C# (.NET 8.0)</option>
                      <option value="cpp">C++ (Native Assembly)</option>
                      <option value="kotlin">Kotlin (Capacitor Android)</option>
                      <option value="java">Java (Android Native)</option>
                      <option value="rust">Rust (Wasm Engine)</option>
                      <option value="python">Python (Asset Tools)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
