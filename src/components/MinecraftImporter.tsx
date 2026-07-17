import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  Upload, FileArchive, Box, Blocks, Layers, ShieldCheck, AlertCircle, 
  Terminal, Settings, Zap, Play, Wrench, RefreshCw, Sliders, Eye, 
  Trash2, Cpu, CheckCircle, Database, HelpCircle, HardDrive, 
  Plus, Check, Sparkles, FolderSync, Info, AlertTriangle, FileCode
} from 'lucide-react';
import { soundService } from '../services/soundService';

// Interfaces for Minecraft Bedrock Importer
export interface MinecraftPack {
  id: string;
  name: string;
  fileName: string;
  originalSizeKB: number;
  optimizedSizeKB: number;
  type: 'world' | 'resource_pack' | 'behavior_pack' | 'skin_pack' | 'addon';
  version: string;
  targetBedrockVersion: string;
  uuid: string;
  dependencies: string[];
  convertedAt: string;
  status: 'valid' | 'warning' | 'corrupted';
  blocksCount: number;
  entitiesCount: number;
  texturesCount: number;
  scriptsConverted: boolean;
  backupPath: string;
}

export interface ConversionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export function MinecraftImporter() {
  const playClick = () => { try { soundService.playSFX('ui_click'); } catch (e) {} };
  const playSuccess = () => { try { soundService.playSFX('powerup'); } catch (e) {} };
  const playError = () => { try { soundService.playSFX('hit'); } catch (e) {} };
  const playTab = () => { try { soundService.playSFX('ui_tab'); } catch (e) {} };

  // Core Bedrock Packs Store
  const [packs, setPacks] = useState<MinecraftPack[]>([]);
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'importer' | 'worlds_playable' | 'compatibility' | 'logs'>('importer');
  
  // Importer simulation state
  const [isDragging, setIsDragging] = useState(false);
  const [importingFile, setImportingFile] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState('');
  const [importCompleted, setImportCompleted] = useState(false);

  // Settings
  const [autoInstallDeps, setAutoInstallDeps] = useState(true);
  const [aggressiveOptimize, setAggressiveOptimize] = useState(true);
  const [compatibilityVersion, setCompatibilityVersion] = useState('1.21.0');
  const [strictValidation, setStrictValidation] = useState(true);

  // Sandbox simulation active state
  const [activeSandboxWorld, setActiveSandboxWorld] = useState<MinecraftPack | null>(null);
  const [sandboxTicks, setSandboxTicks] = useState(0);
  const [fps, setFps] = useState(60);
  const [sandboxConsole, setSandboxConsole] = useState<string[]>([]);
  const [playerCoords, setPlayerCoords] = useState({ x: 120, y: 64, z: -45 });
  const [loadedChunks, setLoadedChunks] = useState(144);
  const [spawnedEntities, setSpawnedEntities] = useState<string[]>(['Steve', 'Pig', 'Creeper (Converted)']);

  // Pre-seed mock files
  useEffect(() => {
    const storedPacks = localStorage.getItem('neon_minecraft_packs_v1');
    const storedLogs = localStorage.getItem('neon_minecraft_logs_v1');

    if (storedPacks) {
      setPacks(JSON.parse(storedPacks));
    } else {
      const defaultPacks: MinecraftPack[] = [
        {
          id: 'world-skygrid',
          name: 'Survival SkyGrid Extreme',
          fileName: 'SkyGrid_Survival.mcworld',
          originalSizeKB: 14500,
          optimizedSizeKB: 8400,
          type: 'world',
          version: '1.4.2',
          targetBedrockVersion: '1.20.80',
          uuid: 'a8f4-42b1-91a5-8c9e-2f3b',
          dependencies: ['rpack-faithful', 'bpack-survival-plus'],
          convertedAt: '2026-07-15 10:20',
          status: 'valid',
          blocksCount: 128000,
          entitiesCount: 34,
          texturesCount: 512,
          scriptsConverted: true,
          backupPath: '/1000_Games/Backups/Minecraft/SkyGrid_Survival.mcworld.original'
        },
        {
          id: 'rpack-faithful',
          name: 'Faithful 64x High-Res',
          fileName: 'faithful_64x.mcpack',
          originalSizeKB: 34000,
          optimizedSizeKB: 12500,
          type: 'resource_pack',
          version: '1.21.0',
          targetBedrockVersion: '1.21.0',
          uuid: 'fb88-12c4-90a1-77b3-662c',
          dependencies: [],
          convertedAt: '2026-07-16 11:45',
          status: 'valid',
          blocksCount: 0,
          entitiesCount: 0,
          texturesCount: 1420,
          scriptsConverted: false,
          backupPath: '/1000_Games/Backups/Minecraft/faithful_64x.mcpack.original'
        },
        {
          id: 'bpack-survival-plus',
          name: 'Bedrock Furniture Addon',
          fileName: 'modern_furniture.mcaddon',
          originalSizeKB: 8900,
          optimizedSizeKB: 4100,
          type: 'addon',
          version: '2.0.5',
          targetBedrockVersion: '1.21.2',
          uuid: 'ee99-0012-34ab-cdef-5678',
          dependencies: ['rpack-faithful'],
          convertedAt: '2026-07-16 18:12',
          status: 'warning',
          blocksCount: 42,
          entitiesCount: 18,
          texturesCount: 88,
          scriptsConverted: true,
          backupPath: '/1000_Games/Backups/Minecraft/modern_furniture.mcaddon.original'
        }
      ];
      setPacks(defaultPacks);
      localStorage.setItem('neon_minecraft_packs_v1', JSON.stringify(defaultPacks));
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const defaultLogs: ConversionLog[] = [
        { timestamp: '10:20:01', level: 'info', message: 'Minecraft Bedrock compatibility layer initialized.' },
        { timestamp: '10:20:02', level: 'info', message: 'Ready to receive .mcpack, .mcaddon, .mcworld, and .zip archives.' },
        { timestamp: '10:20:05', level: 'success', message: 'Pre-validated Survival SkyGrid Extreme: original zip contains healthy db/ level structure.' },
        { timestamp: '10:20:08', level: 'info', message: 'Converted 128,000 sub-mesh voxels to Neon Arena render instances.' }
      ];
      setLogs(defaultLogs);
      localStorage.setItem('neon_minecraft_logs_v1', JSON.stringify(defaultLogs));
    }
  }, []);

  const addLog = (level: 'info' | 'warn' | 'error' | 'success', message: string) => {
    const newLog: ConversionLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    const updated = [newLog, ...logs].slice(0, 100);
    setLogs(updated);
    localStorage.setItem('neon_minecraft_logs_v1', JSON.stringify(updated));
  };

  const savePacks = (newPacks: MinecraftPack[]) => {
    setPacks(newPacks);
    localStorage.setItem('neon_minecraft_packs_v1', JSON.stringify(newPacks));
  };

  // Drag & Drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file.name, file.size);
    }
  };

  const simulateFileInput = (type: 'mcworld' | 'mcpack' | 'mcaddon') => {
    playClick();
    const names = {
      mcworld: 'PixelCity_V6.mcworld',
      mcpack: 'SuperRealShaders_v1.mcpack',
      mcaddon: 'More_Mutants_Beast.mcaddon'
    };
    processFile(names[type], Math.floor(Math.random() * 20000000 + 5000000));
  };

  // Parse file and kick off step-by-step conversion simulation
  const processFile = (fileName: string, fileSize: number) => {
    setImportingFile(fileName);
    setImportProgress(0);
    setImportCompleted(false);
    addLog('info', `Uploaded Minecraft file: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    let detectedType: 'world' | 'resource_pack' | 'behavior_pack' | 'skin_pack' | 'addon' = 'resource_pack';
    
    if (extension === '.mcworld') {
      detectedType = 'world';
    } else if (extension === '.mcaddon') {
      detectedType = 'addon';
    } else if (fileName.includes('behavior') || fileName.includes('BP')) {
      detectedType = 'behavior_pack';
    } else if (fileName.includes('skin') || fileName.includes('Skin')) {
      detectedType = 'skin_pack';
    }

    const steps = [
      { progress: 10, msg: 'Decompressing LevelDB/Zip headers and extracting JSON manifests...' },
      { progress: 30, msg: 'Validating cryptographic security signatures (Preventing malicious injects)...' },
      { progress: 50, msg: 'Converting Minecraft JSON block geometries into Neon Arena vertex meshes...' },
      { progress: 70, msg: 'Translating Bedrock JSON particle animations and sound buffers...' },
      { progress: 85, msg: 'Compiling Bedrock JavaScript APIs/GameTest scripts to Neon Arena Hook format...' },
      { progress: 95, msg: 'Compressing textures, mapping dependencies & saving original backup...' },
      { progress: 100, msg: 'Import completed successfully without errors!' }
    ];

    let currentStepIndex = 0;

    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setImportProgress(step.progress);
        setImportStep(step.msg);
        
        let logLevel: 'info' | 'warn' | 'success' = 'info';
        if (step.progress === 30) logLevel = 'info';
        if (step.progress === 100) logLevel = 'success';
        
        addLog(logLevel, `[${detectedType.toUpperCase()} IMPORT] ${step.msg}`);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        playSuccess();
        setImportCompleted(true);
        setImportingFile(null);

        // Save imported pack to state & localStorage
        const sizeKB = Math.floor(fileSize / 1024);
        const optSizeKB = aggressiveOptimize ? Math.floor(sizeKB * 0.45) : sizeKB;
        
        const newPack: MinecraftPack = {
          id: `mc-${Date.now()}`,
          name: fileName.substring(0, fileName.lastIndexOf('.')).replace(/_/g, ' '),
          fileName,
          originalSizeKB: sizeKB,
          optimizedSizeKB: optSizeKB,
          type: detectedType,
          version: '1.21.0',
          targetBedrockVersion: compatibilityVersion,
          uuid: `${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
          dependencies: autoInstallDeps ? ['rpack-faithful'] : [],
          convertedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          status: 'valid',
          blocksCount: detectedType === 'world' ? 95000 : detectedType === 'addon' ? 24 : 0,
          entitiesCount: detectedType === 'world' ? 12 : detectedType === 'addon' ? 14 : 0,
          texturesCount: detectedType === 'resource_pack' ? 840 : 120,
          scriptsConverted: detectedType === 'addon' || detectedType === 'behavior_pack',
          backupPath: `/1000_Games/Backups/Minecraft/${fileName}.original`
        };

        const updatedList = [newPack, ...packs];
        savePacks(updatedList);
        addLog('success', `Pack "${newPack.name}" registered in workspace.`);
      }
    }, 1200);
  };

  const deletePack = (id: string) => {
    playClick();
    const target = packs.find(p => p.id === id);
    if (target) {
      const updated = packs.filter(p => p.id !== id);
      savePacks(updated);
      addLog('warn', `Removed pack: ${target.name} from workspace.`);
      if (activeSandboxWorld?.id === id) {
        setActiveSandboxWorld(null);
      }
    }
  };

  // Run playable emulator inside Neon Arena sandbox
  const launchSandboxWorld = (pack: MinecraftPack) => {
    playSuccess();
    setActiveSandboxWorld(pack);
    setSandboxTicks(0);
    setLoadedChunks(144);
    setSpawnedEntities(['Steve', 'Custom Voxel Player', 'Creeper (Neon Red Skin)']);
    setSandboxConsole([
      `[EMULATOR] Initializing Minecraft Bedrock level: ${pack.name}`,
      `[EMULATOR] UUID detected: ${pack.uuid}`,
      `[EMULATOR] Loading dependency assets: ${pack.dependencies.join(', ') || 'None'}`,
      `[EMULATOR] Voxel translation scale: 1.0 (Direct block-to-block)`,
      `[EMULATOR] Sub-system shaders successfully injected.`
    ]);
  };

  // Emulator ticks effect
  useEffect(() => {
    if (!activeSandboxWorld) return;
    const timer = setInterval(() => {
      setSandboxTicks(t => t + 1);
      
      // Simulate random coords & ticks logs
      setPlayerCoords(prev => ({
        x: +(prev.x + (Math.random() * 4 - 2)).toFixed(1),
        y: +(prev.y + (Math.random() * 0.4 - 0.2)).toFixed(1),
        z: +(prev.z + (Math.random() * 4 - 2)).toFixed(1)
      }));

      // Performance jitter
      setFps(Math.floor(Math.random() * 5 + 56));

      // Occasional event
      const events = [
        'Render Chunk updated: [64, y, -32] fully converted to Arena Mesh.',
        'Tick: Resolved entity behavior state machines successfully.',
        'Optimized Laptop CPU load: Garbage collector reclaimed 12MB block heap.',
        'Loaded Bedrock JSON particle stream: Minecraft FlameParticle.json.',
        'Behavior Script triggered: Steve interacts with chest (translated container API).',
        'Auto-loaded dependency texture: faithful_64x blocks/grass_top.png mapped.'
      ];

      if (Math.random() > 0.4) {
        const randomEv = events[Math.floor(Math.random() * events.length)];
        setSandboxConsole(prev => [`[TICK ${Date.now() % 1000}] ${randomEv}`, ...prev].slice(0, 15));
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [activeSandboxWorld]);

  const addEntityToSandbox = (name: string) => {
    playSuccess();
    setSpawnedEntities([...spawnedEntities, `${name} (Converted)`]);
    setSandboxConsole(prev => [`[EMULATOR] Spawned entity "${name}" with compiled behavior.`, ...prev]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 text-zinc-200">
      
      {/* HUB HEADER BAR */}
      <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
            <Blocks size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              Minecraft Bedrock Importer Studio
              <span className="text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold">
                BEDROCK TO NEON HYBRID
              </span>
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-mono">
              Convert, compile and play .mcpack, .mcaddon, .mcworld and skin textures locally
            </p>
          </div>
        </div>

        {/* Dynamic sub tabs */}
        <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => { playTab(); setActiveSubTab('importer'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'importer' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📥 Drag & Import
          </button>
          <button 
            onClick={() => { playTab(); setActiveSubTab('worlds_playable'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'worlds_playable' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🎮 Playable Sandbox
          </button>
          <button 
            onClick={() => { playTab(); setActiveSubTab('compatibility'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'compatibility' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🛠 Version SDK Layer
          </button>
          <button 
            onClick={() => { playTab(); setActiveSubTab('logs'); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'logs' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            📋 Build Console Logs
          </button>
        </div>
      </div>

      {/* CORE SCREEN SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 flex-1">
        
        {/* PANEL LEFT: SETTINGS, IMPORT ZONE, PROGRESS BAR */}
        <div className="xl:col-span-4 bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Settings size={14} /> Import Engine Parameters
            </span>
          </div>

          {/* Quick preset sliders / switches for optimization and low storage */}
          <div className="bg-zinc-950/40 p-4 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Device Optimizations</h4>
            
            {/* Auto Install Dependencies */}
            <div className="flex justify-between items-center text-[9px] uppercase font-mono">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-300">Resolve Pack Dependencies</span>
                <p className="text-[8px] text-zinc-500">Auto maps behavior/texture packs.</p>
              </div>
              <input 
                type="checkbox"
                checked={autoInstallDeps}
                onChange={e => { playClick(); setAutoInstallDeps(e.target.checked); }}
                className="accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Aggressive compression for low-storage laptop */}
            <div className="flex justify-between items-center text-[9px] uppercase font-mono pt-2 border-t border-white/5">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-300">Convert Texture Mipmaps</span>
                <p className="text-[8px] text-zinc-500">Shrinks VRAM footprint for low-end GPU.</p>
              </div>
              <input 
                type="checkbox"
                checked={aggressiveOptimize}
                onChange={e => { playClick(); setAggressiveOptimize(e.target.checked); }}
                className="accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Strict validation */}
            <div className="flex justify-between items-center text-[9px] uppercase font-mono pt-2 border-t border-white/5">
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-300">VManifest Safety Scan</span>
                <p className="text-[8px] text-zinc-500">Validates manifests against injection.</p>
              </div>
              <input 
                type="checkbox"
                checked={strictValidation}
                onChange={e => { playClick(); setStrictValidation(e.target.checked); }}
                className="accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Active File Import Status */}
          {importingFile && (
            <div className="bg-zinc-950 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-400">
                <span className="flex items-center gap-1.5 animate-pulse">
                  <RefreshCw size={12} className="animate-spin" /> Converted: {importingFile}
                </span>
                <span>{importProgress}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-[8.5px] font-mono uppercase text-zinc-400">{importStep}</p>
            </div>
          )}

          {/* Import Drag & Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 border-2 border-dashed rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-all ${
              isDragging ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]' : 'border-white/10 bg-zinc-950/40 hover:border-white/20'
            }`}
          >
            <Upload size={32} className={`mb-3 ${isDragging ? 'animate-bounce text-emerald-400' : 'text-zinc-500'}`} />
            <h3 className="text-xs font-black uppercase text-white tracking-wider">Drag & Drop Minecraft Pack</h3>
            <p className="text-[9px] uppercase text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
              Drop .mcpack, .mcaddon, .mcworld or .zip structures directly into Neon Arena
            </p>

            <div className="mt-5 w-full space-y-1.5">
              <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">— OR SIMULATE DEMO UPLOADS —</div>
              <div className="grid grid-cols-3 gap-1 px-2">
                <button 
                  onClick={() => simulateFileInput('mcworld')}
                  className="py-1 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  🏙 World
                </button>
                <button 
                  onClick={() => simulateFileInput('mcpack')}
                  className="py-1 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  🎨 Texture
                </button>
                <button 
                  onClick={() => simulateFileInput('mcaddon')}
                  className="py-1 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  🧩 Addon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL MIDDLE: DYNAMIC SECTION (IMPORTER ARCHIVES OR PLAYABLE PLAYGROUND) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
          {activeSubTab === 'importer' && (
            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Database size={14} /> CONVERTED MINECRAFT REGISTRY
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">{packs.length} CONVERTED OBJECTS</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {packs.map(pack => (
                  <div 
                    key={pack.id}
                    className="p-4 bg-zinc-950/80 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {pack.type === 'world' ? '🗺' : pack.type === 'resource_pack' ? '🎨' : pack.type === 'addon' ? '🧩' : '👕'}
                        </span>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wide">{pack.name}</h4>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400 uppercase">
                          {pack.type.replace('_', ' ')}
                        </span>
                        {pack.status === 'warning' && (
                          <span className="text-[8px] text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20 uppercase font-black">
                            ⚠ Warn
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[8.5px] font-mono text-zinc-500 uppercase">
                        <span>UUID: <strong className="text-zinc-400">{pack.uuid}</strong></span>
                        <span>DISK SIZE: <strong className="text-zinc-400">{pack.optimizedSizeKB} KB</strong></span>
                        <span>VERSION: <strong className="text-zinc-400">{pack.version}</strong></span>
                        <span>SDK TARGET: <strong className="text-zinc-400">{pack.targetBedrockVersion}</strong></span>
                      </div>

                      {/* Manifest breakdown counts */}
                      <div className="flex gap-4 pt-1 text-[8.5px] font-black uppercase tracking-wide">
                        {pack.blocksCount > 0 && <span className="text-orange-400">🟧 {pack.blocksCount} Voxel Blocks</span>}
                        {pack.entitiesCount > 0 && <span className="text-fuchsia-400">👾 {pack.entitiesCount} Entities Compiled</span>}
                        {pack.texturesCount > 0 && <span className="text-cyan-400">🖼 {pack.texturesCount} Render Shaders</span>}
                        {pack.scriptsConverted && <span className="text-yellow-400">⚡ Dynamic Script Hooks Attached</span>}
                      </div>

                      {/* Dependencies */}
                      {pack.dependencies.length > 0 && (
                        <div className="text-[8px] text-zinc-500 uppercase pt-1">
                          ↳ MOUNTED DEPENDENCIES: <strong className="text-emerald-400">{pack.dependencies.join(', ')}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      {pack.type === 'world' && (
                        <button 
                          onClick={() => { setActiveSubTab('worlds_playable'); launchSandboxWorld(pack); }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Play size={10} className="fill-zinc-950" /> Play world
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          playSuccess();
                          alert(`Original backup secure at: ${pack.backupPath}`);
                        }}
                        title="Show Backup Archive File"
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        <HardDrive size={12} />
                      </button>

                      <button 
                        onClick={() => deletePack(pack.id)}
                        className="p-1.5 bg-white/5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {packs.length === 0 && (
                  <div className="h-60 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center text-zinc-500">
                    <FileArchive size={32} className="mb-2 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Packs Converted Yet</span>
                    <span className="text-[8px] uppercase mt-1">Use the upload box on the left to import a Minecraft file.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLAYABLE SANDBOX HYBRID SIMULATION */}
          {activeSubTab === 'worlds_playable' && (
            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Play size={14} className="animate-pulse" /> NEON ARENA VOXEL EMULATOR SANDBOX
                </span>
                {activeSandboxWorld && (
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase">
                    ACTIVE ENVIRONMENT: {activeSandboxWorld.name}
                  </span>
                )}
              </div>

              {!activeSandboxWorld ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <Zap size={32} className="text-zinc-600 mb-3 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No World Injected</span>
                  <p className="text-[8.5px] text-zinc-500 uppercase mt-1.5 max-w-[280px]">
                    Go to the Drag & Import tab and click "Play World" on any converted survival world profile.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
                  
                  {/* EMULATOR WINDOW */}
                  <div className="md:col-span-8 bg-zinc-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex gap-1.5 text-[8.5px] font-mono text-emerald-400 font-bold bg-black/80 px-2 py-1 rounded-md border border-white/5">
                      <span>FPS: {fps}</span>
                      <span>•</span>
                      <span>CHUNKS: {loadedChunks}</span>
                      <span>•</span>
                      <span>TICKS: {sandboxTicks}</span>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 uppercase space-y-1 mb-2">
                      <span className="block text-white font-black text-xs">🎮 EMULATED PLAYER CAMERA</span>
                      <span>X: {playerCoords.x} | Y: {playerCoords.y} | Z: {playerCoords.z}</span>
                      <span>Velocity: [0.0, 0.0, 0.0] | Direction: [North-West]</span>
                    </div>

                    {/* Simple graphical grid simulator representing voxel world conversion */}
                    <div className="flex-1 bg-zinc-900 border border-white/5 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="text-[8px] text-zinc-500 font-mono">
                        [VOXEL INSTANCE STREAM] Map conversion verified: No mesh leaks.
                      </div>

                      {/* Render voxel characters block representation */}
                      <div className="grid grid-cols-12 gap-1.5 my-2">
                        {Array.from({ length: 48 }).map((_, i) => {
                          const isSpecial = i % 7 === 0;
                          const isCreeper = i % 11 === 0;
                          return (
                            <div 
                              key={i} 
                              className={`aspect-square rounded border transition-all ${
                                isCreeper 
                                  ? 'bg-rose-500/20 border-rose-500/50 animate-pulse' 
                                  : isSpecial 
                                  ? 'bg-emerald-500/20 border-emerald-500/50' 
                                  : 'bg-zinc-800/40 border-white/5'
                              }`}
                              title={isCreeper ? 'Spawned Creeper Entity' : isSpecial ? 'Converted Grass Voxel' : 'Air Block'}
                            />
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center bg-black/60 p-2 rounded-lg border border-white/5">
                        <span className="text-[8.5px] text-zinc-400 uppercase">Spawn Entities dynamically with converted Bedrock behavior schemas:</span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => addEntityToSandbox('Pig')}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded text-[7.5px] uppercase font-bold"
                          >
                            + Pig
                          </button>
                          <button 
                            onClick={() => addEntityToSandbox('Zombie')}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded text-[7.5px] uppercase font-bold"
                          >
                            + Zombie
                          </button>
                          <button 
                            onClick={() => addEntityToSandbox('Warden')}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded text-[7.5px] uppercase font-bold text-rose-400"
                          >
                            + Warden
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => { playClick(); setLoadedChunks(prev => Math.min(prev + 32, 512)); }}
                        className="py-1 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-[8.5px] font-black uppercase text-white cursor-pointer"
                      >
                        Expand Render distance
                      </button>
                      <button 
                        onClick={() => { playClick(); setLoadedChunks(prev => Math.max(prev - 32, 64)); }}
                        className="py-1 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-[8.5px] font-black uppercase text-white cursor-pointer"
                      >
                        Shrink Render distance (Low-RAM)
                      </button>
                    </div>

                  </div>

                  {/* EMULATOR CONTROLS / LOG SPLIT */}
                  <div className="md:col-span-4 flex flex-col gap-3">
                    <div className="p-3.5 bg-zinc-950 border border-white/5 rounded-2xl flex-1 flex flex-col min-h-0">
                      <span className="text-[8.5px] font-black text-fuchsia-400 uppercase tracking-wider block mb-2">
                        EMULATOR BEHAVIOR ACTIVE ENTITIES
                      </span>
                      <div className="space-y-1 overflow-y-auto flex-1 pr-1 font-mono text-[9px] uppercase">
                        {spawnedEntities.map((ent, i) => (
                          <div key={i} className="flex justify-between items-center p-1.5 bg-white/5 rounded border border-white/5">
                            <span>👾 {ent}</span>
                            <span className="text-[7.5px] text-zinc-500">ID: {1000 + i}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-3.5 space-y-1.5">
                      <span className="text-[8.5px] font-black text-cyan-400 uppercase tracking-wider block">
                        VIRTUAL COMPATIBILITY HOOKS
                      </span>
                      <p className="text-[8px] text-zinc-500 uppercase leading-relaxed">
                        Minecraft's entity physics rules are converted directly into Neon Arena scripts dynamically. Add-ons function hot-swappable without restarting the system.
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* COMPATIBILITY LAYER */}
          {activeSubTab === 'compatibility' && (
            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Wrench size={14} /> MCPE BEDROCK VERSION TRANSLATION GATEWAY
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase">UPGRADEABLE PARSER</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SELECT SDK VERSION */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Select Bedrock API SDK Layer</h4>
                  <p className="text-[8.5px] text-zinc-500 uppercase leading-relaxed">
                    Choose which version specifications the importer compiler uses to parse block structures, item tags, or GameTest scripting hooks.
                  </p>

                  <div className="space-y-2 pt-2">
                    {[
                      { ver: '1.21.0', name: 'Tricky Trials Bedrock API', status: 'Stable Release' },
                      { ver: '1.20.80', name: 'Trails & Tales Legacy API', status: 'LTS Release' },
                      { ver: '1.22.0-beta', name: 'Future Experimental API', status: 'Active Development' }
                    ].map(layer => (
                      <div 
                        key={layer.ver}
                        onClick={() => { playClick(); setCompatibilityVersion(layer.ver); addLog('info', `Switched compatibility layer SDK version to: ${layer.ver}`); }}
                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                          compatibilityVersion === layer.ver 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                            : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] uppercase">
                          <span className="block font-semibold">{layer.name}</span>
                          <span className="text-[8px] opacity-75 font-mono">SDK Specification: {layer.ver}</span>
                        </div>
                        <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono">
                          {layer.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODULAR SCHEMAS UPDATER */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-2">Modular Translation Schemas</h4>
                    <p className="text-[8.5px] text-zinc-400 uppercase leading-relaxed">
                      WManifest allows updating block/entity mappings easily to support newer versions. Click below to pull down the newest schemas or update conversion dictionaries from Github registries.
                    </p>

                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] uppercase font-mono">
                        <span className="text-zinc-500">Block Map Registry:</span>
                        <strong className="text-emerald-400">Up to Date (v142)</strong>
                      </div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-mono">
                        <span className="text-zinc-500">Entity Schema Map:</span>
                        <strong className="text-emerald-400">Up to Date (v98)</strong>
                      </div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-mono">
                        <span className="text-zinc-500">Script Transpiler core:</span>
                        <strong className="text-amber-400">Update Available (v12)</strong>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      playSuccess();
                      addLog('success', 'Successfully pulled newest translation maps from Git registry. Translation keys optimized.');
                      alert('Translation schemas successfully pulled down and saved into active local configuration dictionary!');
                    }}
                    className="w-full py-2.5 bg-emerald-500 text-zinc-950 font-black rounded-xl text-[9px] uppercase hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
                  >
                    <FolderSync size={12} /> Pull & Sync Translation Schemas
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* BUILD LOGS */}
          {activeSubTab === 'logs' && (
            <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-400 flex items-center gap-1.5">
                  <Terminal size={14} /> SYSTEM CONVERSION & SHADER DEBUGGER LOGS
                </span>
                <button 
                  onClick={() => {
                    playClick();
                    setLogs([]);
                    localStorage.setItem('neon_minecraft_logs_v1', JSON.stringify([]));
                  }}
                  className="text-[8px] font-black bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-zinc-400 hover:text-white uppercase"
                >
                  Clear Console Logs
                </button>
              </div>

              {/* Logs terminal output */}
              <div className="flex-1 bg-zinc-950 rounded-2xl p-4 font-mono text-[9px] uppercase overflow-y-auto space-y-1.5 text-zinc-400">
                {logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-2 leading-relaxed ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-400' :
                      log.level === 'success' ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  >
                    <span className="text-zinc-600">[{log.timestamp}]</span>
                    <span className="font-semibold select-all">{log.message}</span>
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-20 text-zinc-600 uppercase">
                    Console output pipeline empty.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
