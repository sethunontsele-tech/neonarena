import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  X, Gamepad2, Play, HardDrive, Shield, Settings, Info, RefreshCw, 
  Trash2, Plus, FileText, CheckCircle, AlertTriangle, Search, Sliders, 
  Cpu, Database, Archive, Terminal, Clock, Sparkles, Download, 
  Check, Edit3, Save, Copy, FileCode, CheckCircle2, AlertCircle, Laptop,
  Flame, ChevronRight, Activity, Trash, RotateCcw, Share2, Eye
} from 'lucide-react';
import { soundService } from '../services/soundService';

// Types & Interfaces
export interface VirtualFile {
  name: string;
  sizeKB: number;
  type: 'game_file' | 'mod' | 'map' | 'save' | 'log' | 'config' | 'cache';
  lastModified: string;
  status: 'healthy' | 'corrupted' | 'missing';
  content?: string;
  version?: string;
  author?: string;
  description?: string;
  dependencies?: string[];
  enabled?: boolean;
}

export interface GameProfile {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  genre: string;
  installationPath: string;
  requiredFiles: string[];
  files: VirtualFile[];
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  gameId: string;
  sizeKB: number;
  fileCount: number;
  type: 'automatic' | 'manual';
}

export function WidelandsLoader({ onClose }: { onClose: () => void }) {
  // Sound FX Utilities
  const playClick = () => { try { soundService.playSFX('ui_click'); } catch (e) {} };
  const playSuccess = () => { try { soundService.playSFX('powerup'); } catch (e) {} };
  const playError = () => { try { soundService.playSFX('hit'); } catch (e) {} };
  const playTab = () => { try { soundService.playSFX('ui_tab'); } catch (e) {} };

  // Core Games Data (Supports adding future games dynamically!)
  const [games, setGames] = useState<GameProfile[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('widelands');
  const [logs, setLogs] = useState<string[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);

  // Selected game profile shortcut helper
  const activeGame = games.find(g => g.id === selectedGameId) || games[0];

  // Search & Filtering inside active game's files
  const [fileFilterTab, setFileFilterTab] = useState<'all' | 'mods' | 'maps' | 'saves' | 'logs'>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  
  // Launcher configuration settings
  const [resolution, setResolution] = useState('1080p');
  const [frameRateCap, setFrameRateCap] = useState('60');
  const [textureQuality, setTextureQuality] = useState('Medium');
  const [ramLimit, setRamLimit] = useState('512MB');
  const [cacheAggressivePurge, setCacheAggressivePurge] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  
  // Storage saved statistics
  const [storageCleanedKB, setStorageCleanedKB] = useState(145000); // 145 MB pre-cleaned

  // Dialog Modals
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState<VirtualFile | null>(null);
  const [newGameForm, setNewGameForm] = useState({
    name: '',
    version: '1.0.0',
    description: '',
    genre: 'RTS',
    installationPath: '/1000_Games/MyCustomGame/',
    requiredFiles: 'game.exe, config.xml, resources.pak'
  });

  // RTS Game Simulator State
  const [gameStarted, setGameStarted] = useState(false);
  const [simMinutes, setSimMinutes] = useState(0);
  const [simResources, setSimResources] = useState({ wood: 25, stone: 15, wheat: 10, gold: 0 });
  const [simBuildings, setSimBuildings] = useState({
    lumberjack: 1,
    quarry: 1,
    farm: 0,
    military_post: 1
  });
  const [simWorkers, setSimWorkers] = useState(6);
  const [territorySize, setTerritorySize] = useState(120);
  const [battleReport, setBattleReport] = useState<string[]>(['Settlement founded in virtual arena.']);

  // Mod Drag and Drop state
  const [dragOver, setDragOver] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    // Attempt local storage recall
    const storedGames = localStorage.getItem('zenith_widelands_loader_games_v1');
    const storedLogs = localStorage.getItem('zenith_widelands_loader_logs_v1');
    const storedBackups = localStorage.getItem('zenith_widelands_loader_backups_v1');

    if (storedGames) {
      setGames(JSON.parse(storedGames));
    } else {
      // Setup initial Widelands workspace structures matching requested directories
      const initialWidelands: GameProfile = {
        id: 'widelands',
        name: 'Widelands Strategy RTS',
        version: 'v1.2.1-Stable (Build #4829)',
        description: 'An open-source slow-paced build-and-battle strategy game inspired by Settlers II. Command deep economy pipelines, lay complex road networks, and claim uncharted territories.',
        icon: '🌾',
        genre: 'Real-Time Strategy',
        installationPath: '/1000_Games/Widelands/',
        requiredFiles: ['widelands.bin', 'libwidelands_ui.so', 'graphics.wad', 'sound.wad'],
        files: [
          // Required Executables & System
          { name: 'widelands.bin', sizeKB: 14200, type: 'game_file', lastModified: '2026-07-01 14:22', status: 'healthy', content: '[Binary executable stream for Widelands v1.2.1-Stable]' },
          { name: 'libwidelands_ui.so', sizeKB: 4120, type: 'game_file', lastModified: '2026-07-01 14:23', status: 'healthy', content: '[Interface assembly module binary]' },
          { name: 'graphics.wad', sizeKB: 32400, type: 'game_file', lastModified: '2026-07-01 14:25', status: 'healthy', content: '[Compressed package containing tribes icons, building textures, road vectors]' },
          { name: 'sound.wad', sizeKB: 18900, type: 'game_file', lastModified: '2026-07-01 14:26', status: 'healthy', content: '[Sound FX tracks and environmental background noise streams]' },
          
          // Custom Maps (/Maps/)
          { name: 'greenland_valley.wmm', sizeKB: 840, type: 'map', lastModified: '2026-07-10 11:15', status: 'healthy', content: 'Widelands Map v2\nWidth: 128\nHeight: 128\nTerrain: Grass, Hills, Water Rift\nPlayers: 3', description: 'A fertile green valley bordered by mountain ranges rich in iron and coal.' },
          { name: 'egyptian_dunes.wmm', sizeKB: 1120, type: 'map', lastModified: '2026-07-12 09:40', status: 'healthy', content: 'Widelands Map v2\nWidth: 192\nHeight: 192\nTerrain: Desert, Oasis, Rock Crags\nPlayers: 4', description: 'An arid wasteland where water pools are extremely rare and strategic control is vital.' },
          { name: 'volcanic_rift.wmm', sizeKB: 550, type: 'map', lastModified: '2026-07-15 17:33', status: 'healthy', content: 'Widelands Map v2\nWidth: 96\nHeight: 96\nTerrain: Lava, Ash, Basalt Rocks\nPlayers: 2', description: 'Two empires facing each other over a volatile fissure of liquid sulfur.' },

          // Installed Mods (/Mods/)
          { name: 'atlantis_tribe.wmf', sizeKB: 2450, type: 'mod', lastModified: '2026-07-14 18:22', status: 'healthy', version: '2.1.0', author: 'RTS_Crafter', description: 'Unlocks the advanced aquatic Atlantis Tribe with custom building designs and deep water roads.', enabled: true, dependencies: ['graphics.wad'] },
          { name: 'fast_infrastructure.wmf', sizeKB: 120, type: 'mod', lastModified: '2026-07-15 12:00', status: 'healthy', version: '1.0.5', author: 'RoadRunner', description: 'Increases basic worker road walking speeds by 25% for high-throughput logistics.', enabled: false },
          { name: 'high_res_badges.wmf', sizeKB: 4100, type: 'mod', lastModified: '2026-07-16 08:14', status: 'healthy', version: '4.2.0', author: 'Artisanal_Widelander', description: 'Replaces classic low-resolution army flags and crests with hand-painted vectors.', enabled: true },

          // Save Files (/Saves/)
          { name: 'barbarian_gold_mine_victory.wms', sizeKB: 4800, type: 'save', lastModified: '2026-07-16 23:55', status: 'healthy', content: 'Widelands Save v4\nPlaytime: 142m 12s\nActive Tribe: Barbarians\nSettlement Rating: Legendary' },
          { name: 'autosave.wms', sizeKB: 4620, type: 'save', lastModified: '2026-07-17 01:10', status: 'healthy', content: 'Widelands Save v4\nPlaytime: 110m 0s\nActive Tribe: Empire\nSettlement Rating: Growing' },

          // Logs & Configs (/Logs/ & /Config/)
          { name: 'settings.json', sizeKB: 12, type: 'config', lastModified: '2026-07-17 02:00', status: 'healthy', content: '{\n  "resolution": "1920x1080",\n  "music_volume": 80,\n  "sfx_volume": 75,\n  "aggressive_cache_purge": true,\n  "frame_rate_cap": 60\n}' },
          { name: 'graphics_cfg.xml', sizeKB: 8, type: 'config', lastModified: '2026-07-17 02:00', status: 'healthy', content: '<graphics>\n  <vram_limit>512MB</vram_limit>\n  <texture_quality>Medium</texture_quality>\n  <vsync>true</vsync>\n</graphics>' },
          { name: 'runtime_stdout.log', sizeKB: 45, type: 'log', lastModified: '2026-07-17 02:05', status: 'healthy', content: '[INFO] Widelands Core initialized successfully.\n[INFO] Mounted graphics.wad package...\n[WARN] Mod fast_infrastructure.wmf is disabled by configuration.' }
        ]
      };
      setGames([initialWidelands]);
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const initialLogs = [
        '[SYSTEM] Dual-channel laptop environment detected. Initiating low-power graphics pipeline...',
        '[FS] Checked folder tree integrity: /1000_Games/Widelands/ verified.',
        '[LAUNCHER] Scanning virtual ROM space... Detected Widelands installation.',
        '[PERF] Configured cache optimizer: aggressive file garbage collection enabled.'
      ];
      setLogs(initialLogs);
    }

    if (storedBackups) {
      setBackups(JSON.parse(storedBackups));
    } else {
      const initialBackups: BackupRecord[] = [
        { id: 'b_1', timestamp: '2026-07-15 14:00', gameId: 'widelands', sizeKB: 12400, fileCount: 4, type: 'automatic' },
        { id: 'b_2', timestamp: '2026-07-16 18:45', gameId: 'widelands', sizeKB: 9600, fileCount: 2, type: 'manual' }
      ];
      setBackups(initialBackups);
    }
  }, []);

  // Save states helper
  const updateWorkspaceAndStore = (updatedGames: GameProfile[]) => {
    setGames(updatedGames);
    localStorage.setItem('zenith_widelands_loader_games_v1', JSON.stringify(updatedGames));
  };

  const addLogMessage = (msg: string) => {
    const updated = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...logs].slice(0, 50);
    setLogs(updated);
    localStorage.setItem('zenith_widelands_loader_logs_v1', JSON.stringify(updated));
  };

  // 1-Click Game Launch Integrity Scan
  const [integrityState, setIntegrityState] = useState<'idle' | 'scanning' | 'passed' | 'failed'>('idle');
  const [integrityDetails, setIntegrityDetails] = useState<string[]>([]);

  const startIntegrityCheck = (targetGame: GameProfile) => {
    playClick();
    setIntegrityState('scanning');
    setIntegrityDetails([]);
    addLogMessage(`Started structural verification for: ${targetGame.name}`);

    const checkSteps = [
      `Verifying layout of ${targetGame.installationPath}...`,
      `Validating required components: ${targetGame.requiredFiles.join(', ')}...`,
      'Running binary MD5 checksum checks...',
      'Validating mod signatures against sandboxed core...'
    ];

    checkSteps.forEach((step, idx) => {
      setTimeout(() => {
        setIntegrityDetails(prev => [...prev, `✓ ${step}`]);
        if (idx === checkSteps.length - 1) {
          // Verify that all required files exist and are healthy
          const missing = targetGame.requiredFiles.filter(
            req => !targetGame.files.some(f => f.name === req && f.status === 'healthy')
          );

          if (missing.length === 0) {
            setIntegrityState('passed');
            addLogMessage(`Integrity check completed: 100% HEALTHY for ${targetGame.name}`);
            playSuccess();
          } else {
            setIntegrityState('failed');
            setIntegrityDetails(prev => [...prev, `✖ Missing critical files: ${missing.join(', ')}`]);
            addLogMessage(`CRITICAL INTEGRITY FAILURE: ${missing.length} missing files detected!`);
            playError();
          }
        }
      }, (idx + 1) * 600);
    });
  };

  // Repair Files Wizard
  const handleRepairFiles = (targetGame: GameProfile) => {
    playSuccess();
    // Reset all status to healthy and restore missing required files
    const restoredFiles = [...targetGame.files];
    targetGame.requiredFiles.forEach(req => {
      if (!restoredFiles.some(f => f.name === req)) {
        restoredFiles.push({
          name: req,
          sizeKB: 8000,
          type: 'game_file',
          lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
          status: 'healthy',
          content: '[Restored official binary stream]'
        });
      }
    });

    const updated = games.map(g => g.id === targetGame.id ? { ...g, files: restoredFiles } : g);
    updateWorkspaceAndStore(updated);
    setIntegrityState('passed');
    addLogMessage(`Repaired file system anomalies inside ${targetGame.name}`);
  };

  // Launch simulated Widelands Game
  const startWidelandsLaunch = () => {
    if (integrityState !== 'passed') {
      // Auto run check if not scanned
      startIntegrityCheck(activeGame);
      setTimeout(() => {
        const checkStatus = integrityState as string;
        if (checkStatus === 'passed' || checkStatus === 'idle') {
          launchGameSub();
        }
      }, 2600);
    } else {
      launchGameSub();
    }
  };

  const launchGameSub = () => {
    playSuccess();
    setGameStarted(true);
    setSimMinutes(0);
    setSimResources({ wood: 25, stone: 15, wheat: 10, gold: 0 });
    setSimBuildings({ lumberjack: 1, quarry: 1, farm: 0, military_post: 1 });
    setSimWorkers(6);
    setTerritorySize(120);
    setBattleReport(['Empire established. Roads cleared.', 'Woodcutters dispatched to northern forests.']);
    addLogMessage(`Launched game environment: ${activeGame.name}`);
  };

  // Economy simulation loop
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      setSimMinutes(prev => prev + 1);
      
      // Update resources based on buildings
      setSimResources(prev => {
        const generatedWood = simBuildings.lumberjack * 2;
        const generatedStone = simBuildings.quarry * 1;
        const generatedWheat = simBuildings.farm * 3;
        
        let goldCost = 0;
        let generatedGold = 0;
        if (prev.wheat >= 5) {
          generatedGold = Math.floor(prev.wheat / 5);
          goldCost = generatedGold * 5;
        }

        return {
          wood: prev.wood + generatedWood,
          stone: prev.stone + generatedStone,
          wheat: prev.wheat + generatedWheat - goldCost,
          gold: prev.gold + generatedGold
        };
      });

      // Random Event
      const events = [
        'A military messenger claims new iron crags to the East.',
        'Carriers complete stone-paved highway between quarry and central castle.',
        'Barbarian scouting party observed in the mountains.',
        'A local wheat surplus boosts carrier worker morale.',
        'Expanding border: +15 territory size claimed.',
        'Lumberjack planted 5 young fir saplings.'
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setBattleReport(prev => [randomEvent, ...prev].slice(0, 8));

      // Expand territory slowly
      setTerritorySize(t => t + Math.floor(Math.random() * 5 + 1));
      setSimWorkers(w => w + (Math.random() > 0.7 ? 1 : 0));

    }, 3000);

    return () => clearInterval(interval);
  }, [gameStarted, simBuildings]);

  // Simulated Game Building Construction
  const handleConstructBuilding = (type: 'lumberjack' | 'quarry' | 'farm' | 'military_post') => {
    const costs = {
      lumberjack: { wood: 10, stone: 5 },
      quarry: { wood: 8, stone: 12 },
      farm: { wood: 15, stone: 8 },
      military_post: { wood: 20, stone: 18 }
    };

    const cost = costs[type];
    if (simResources.wood >= cost.wood && simResources.stone >= cost.stone) {
      playSuccess();
      setSimResources(prev => ({
        ...prev,
        wood: prev.wood - cost.wood,
        stone: prev.stone - cost.stone
      }));
      setSimBuildings(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
      setSimWorkers(w => w + 2);
      setBattleReport(prev => [`Constructed new ${type.replace('_', ' ')}: territory expanded!`, ...prev]);
    } else {
      playError();
      alert(`Insufficient building supplies. Need: ${cost.wood} Wood, ${cost.stone} Stone.`);
    }
  };

  // Mod Toggle/Enable/Disable
  const toggleModState = (modName: string) => {
    playClick();
    const updatedFiles = activeGame.files.map(f => {
      if (f.name === modName) {
        const newState = !f.enabled;
        addLogMessage(`Mod [${modName}] state updated to: ${newState ? 'ENABLED' : 'DISABLED'}`);
        return { ...f, enabled: newState };
      }
      return f;
    });

    const updated = games.map(g => g.id === activeGame.id ? { ...g, files: updatedFiles } : g);
    updateWorkspaceAndStore(updated);
    
    // Auto trigger background backup upon changes
    triggerAutoBackup(activeGame.id);
  };

  // Add custom map
  const [newMapName, setNewMapName] = useState('');
  const handleAddCustomMap = () => {
    if (!newMapName.trim()) return;
    playSuccess();
    const mapFileName = `${newMapName.trim().toLowerCase().replace(/\s+/g, '_')}.wmm`;
    
    const newMapFile: VirtualFile = {
      name: mapFileName,
      sizeKB: parseFloat((Math.random() * 600 + 400).toFixed(0)),
      type: 'map',
      lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'healthy',
      content: `Widelands Map v2\nWidth: 128\nHeight: 128\nPlayers: 2\nGenerated: Custom Editor`,
      description: `User created battlefield: ${newMapName.trim()}`
    };

    const updatedFiles = [...activeGame.files, newMapFile];
    const updated = games.map(g => g.id === activeGame.id ? { ...g, files: updatedFiles } : g);
    updateWorkspaceAndStore(updated);
    setNewMapName('');
    addLogMessage(`Created custom map blueprint: ${mapFileName}`);
  };

  // Import Mod file with Drag and Drop
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    playSuccess();

    const fileName = `custom_mod_${Math.floor(Math.random() * 800 + 100)}.wmf`;
    const newMod: VirtualFile = {
      name: fileName,
      sizeKB: 1850,
      type: 'mod',
      lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'healthy',
      version: '1.0.0',
      author: 'LocalImporter',
      description: 'Custom mod payload successfully installed via hypervisor drag-and-drop frame.',
      enabled: true
    };

    const updatedFiles = [...activeGame.files, newMod];
    const updated = games.map(g => g.id === activeGame.id ? { ...g, files: updatedFiles } : g);
    updateWorkspaceAndStore(updated);
    addLogMessage(`Installed custom package via Drag-and-Drop: ${fileName}`);
  };

  // Backup Engine (Settings & Saves)
  const triggerManualBackup = () => {
    playSuccess();
    const backupId = `b_${Date.now()}`;
    const targetFiles = activeGame.files.filter(f => f.type === 'save' || f.type === 'config');
    const totalSize = targetFiles.reduce((acc, f) => acc + f.sizeKB, 0);

    const newRecord: BackupRecord = {
      id: backupId,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      gameId: activeGame.id,
      sizeKB: totalSize || 24,
      fileCount: targetFiles.length || 3,
      type: 'manual'
    };

    const updatedBackups = [newRecord, ...backups];
    setBackups(updatedBackups);
    localStorage.setItem('zenith_widelands_loader_backups_v1', JSON.stringify(updatedBackups));
    addLogMessage(`Manual snapshot backup saved for ${activeGame.name} (${targetFiles.length} files compressed)`);
  };

  const triggerAutoBackup = (gameId: string) => {
    const backupId = `b_${Date.now()}`;
    const newRecord: BackupRecord = {
      id: backupId,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      gameId,
      sizeKB: 185,
      fileCount: 4,
      type: 'automatic'
    };
    const updatedBackups = [newRecord, ...backups];
    setBackups(updatedBackups);
    localStorage.setItem('zenith_widelands_loader_backups_v1', JSON.stringify(updatedBackups));
    addLogMessage(`Auto-backup sequence completed prior to file configurations.`);
  };

  const deleteBackup = (id: string) => {
    playClick();
    const updated = backups.filter(b => b.id !== id);
    setBackups(updated);
    localStorage.setItem('zenith_widelands_loader_backups_v1', JSON.stringify(updated));
    addLogMessage(`Deleted backup snapshot: ${id}`);
  };

  const restoreBackup = (record: BackupRecord) => {
    playSuccess();
    addLogMessage(`Restored system configurations to backup state dated: ${record.timestamp}`);
    alert(`Workspace configuration and player saves rolled back to: ${record.timestamp} successfully.`);
  };

  // Low-Storage Laptop Cache Purge Utility
  const purgeLaptopCache = () => {
    playSuccess();
    // Simulate reclaiming storage from loader cache
    const reclaimed = Math.floor(Math.random() * 45000 + 25000); // 25-70 MB
    setStorageCleanedKB(prev => prev + reclaimed);
    addLogMessage(`Cache garbage collector reclaimed: ${(reclaimed / 1024).toFixed(1)} MB of local disk storage.`);
  };

  // Register dynamic future games inside /1000_Games folder!
  const handleRegisterNewGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameForm.name.trim()) return;
    playSuccess();

    const cleanId = newGameForm.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const reqList = newGameForm.requiredFiles.split(',').map(s => s.trim()).filter(Boolean);

    const newProfile: GameProfile = {
      id: cleanId,
      name: newGameForm.name.trim(),
      version: newGameForm.version,
      description: newGameForm.description || 'Custom added retro game inside the 1000_Games library bundle.',
      icon: '🎮',
      genre: newGameForm.genre,
      installationPath: newGameForm.installationPath,
      requiredFiles: reqList.length ? reqList : ['game.bin'],
      files: reqList.map(reqName => ({
        name: reqName,
        sizeKB: 5000,
        type: 'game_file',
        lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'healthy',
        content: `[Dynamic library signature for ${reqName}]`
      }))
    };

    const updated = [...games, newProfile];
    updateWorkspaceAndStore(updated);
    setSelectedGameId(cleanId);
    setShowAddGameModal(false);
    addLogMessage(`Registered new system profile under /1000_Games: ${newProfile.name}`);
    
    // Reset form
    setNewGameForm({
      name: '',
      version: '1.0.0',
      description: '',
      genre: 'RTS',
      installationPath: '/1000_Games/MyCustomGame/',
      requiredFiles: 'game.exe, config.xml, resources.pak'
    });
  };

  // Filtered Files list
  const getFilteredFiles = () => {
    return activeGame.files.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(fileSearchQuery.toLowerCase());
      if (fileFilterTab === 'mods') return f.type === 'mod' && matchSearch;
      if (fileFilterTab === 'maps') return f.type === 'map' && matchSearch;
      if (fileFilterTab === 'saves') return f.type === 'save' && matchSearch;
      if (fileFilterTab === 'logs') return f.type === 'log' && matchSearch;
      return matchSearch;
    });
  };

  const deleteFile = (fileName: string) => {
    playClick();
    const updatedFiles = activeGame.files.filter(f => f.name !== fileName);
    const updated = games.map(g => g.id === activeGame.id ? { ...g, files: updatedFiles } : g);
    updateWorkspaceAndStore(updated);
    addLogMessage(`Removed file: ${fileName}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-none font-sans bg-zinc-950 text-zinc-100 p-6 overflow-y-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-white/5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gamepad2 size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-2">
              1000 Games & Widelands Loader HUB
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                LIGHTWEIGHT EDITION v2.4
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-mono">
              Virtual directory loader, automatic integrity checker & multi-profile backups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Game Profile Selector */}
          <select 
            value={selectedGameId}
            onChange={(e) => { playClick(); setSelectedGameId(e.target.value); setGameStarted(false); setIntegrityState('idle'); }}
            className="bg-zinc-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-black uppercase outline-none focus:border-amber-400"
          >
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button 
            onClick={() => { playClick(); setShowAddGameModal(true); }}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus size={14} /> Register Game
          </button>
        </div>
      </div>

      {/* CORE 3-COLUMN METRIC PLATFORM */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 flex-1">
        
        {/* PANEL 1: LAUNCHER & SIMULATOR HUB */}
        <div className="xl:col-span-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 relative">
          
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
              <Laptop size={14} />
              SYSTEM LAUNCH INTERFACE
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">{activeGame?.genre}</span>
          </div>

          {/* Active Game Hero Profile */}
          <div className="p-4 bg-zinc-950/80 border border-white/5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 text-2xl font-black">{activeGame?.icon}</div>
            <h3 className="text-sm font-black uppercase text-white tracking-wide">{activeGame?.name}</h3>
            <p className="text-[9px] font-mono text-amber-400/80 mt-1 block uppercase">SYSTEM PATH: {activeGame?.installationPath}</p>
            <p className="text-[10px] text-zinc-400 leading-relaxed mt-2.5 uppercase font-medium">
              {activeGame?.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 text-[8.5px] font-mono text-zinc-500 uppercase">
              <span>Required Checksums:</span>
              {activeGame?.requiredFiles.map(req => (
                <span key={req} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{req}</span>
              ))}
            </div>
          </div>

          {/* Dynamic Integrity Checker & Wizard */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">FileSystem Integrity</span>
              <button 
                onClick={() => startIntegrityCheck(activeGame)}
                className="text-[8.5px] font-black text-cyan-400 hover:text-cyan-300 uppercase cursor-pointer"
              >
                Scan Now
              </button>
            </div>

            {integrityState === 'idle' && (
              <div className="text-center py-2 text-zinc-500 text-[10px] uppercase">
                <AlertTriangle size={18} className="mx-auto text-amber-500 mb-1 animate-pulse" />
                <span>Not scanned. Please run structural validation before launch.</span>
              </div>
            )}

            {integrityState === 'scanning' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] uppercase text-cyan-400 font-bold">
                  <RefreshCw size={12} className="animate-spin text-cyan-400" />
                  <span>Calculating file hash checksums...</span>
                </div>
                <div className="text-[8.5px] font-mono text-zinc-500 uppercase space-y-0.5">
                  {integrityDetails.map((det, i) => (
                    <div key={i}>{det}</div>
                  ))}
                </div>
              </div>
            )}

            {integrityState === 'passed' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                  <CheckCircle size={14} />
                  <span>ALL FILES HEALTHY & VERIFIED</span>
                </div>
                <p className="text-[8.5px] leading-relaxed uppercase">
                  Widelands compiled binaries match the 64-bit verification signature. Launcher ready for deployment.
                </p>
              </div>
            )}

            {integrityState === 'failed' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                  <AlertTriangle size={14} className="animate-bounce" />
                  <span>CORRUPT OR MISSING FILES DETECTED</span>
                </div>
                <p className="text-[8.5px] leading-relaxed uppercase">
                  The required binary assets are absent or structurally altered. Perform a repair check to restore.
                </p>
                <button 
                  onClick={() => handleRepairFiles(activeGame)}
                  className="w-full py-1.5 bg-rose-500 text-zinc-950 font-black rounded-lg text-[9px] uppercase hover:bg-rose-400 transition-all cursor-pointer"
                >
                  Repair Integrity Profile
                </button>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 mt-auto">
            {!gameStarted ? (
              <button 
                onClick={startWidelandsLaunch}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:from-amber-400 hover:to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.01] transition-all cursor-pointer"
              >
                <Play size={16} className="fill-zinc-950 text-zinc-950" />
                LAUNCH SIMULATED ENGINE
              </button>
            ) : (
              <button 
                onClick={() => { playClick(); setGameStarted(false); }}
                className="w-full py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500 transition-all cursor-pointer"
              >
                <X size={16} />
                SHUTDOWN GAME PROCESS
              </button>
            )}
          </div>

          {/* PLAYABLE GAME SIMULATOR INTERACTIVE EMBED */}
          {gameStarted && (
            <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-2xl space-y-3 mt-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Flame size={12} className="animate-bounce" />
                  WIDELANDS EMULATOR ACTIVE
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500">{simMinutes} MINUTES PLAYED</span>
              </div>

              {/* Settlement stats */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] uppercase">
                <div className="bg-white/5 p-1 rounded-lg">
                  <div className="font-bold text-amber-400">{simResources.wood}</div>
                  <div className="text-[7.5px] text-zinc-500">Wood</div>
                </div>
                <div className="bg-white/5 p-1 rounded-lg">
                  <div className="font-bold text-cyan-400">{simResources.stone}</div>
                  <div className="text-[7.5px] text-zinc-500">Stone</div>
                </div>
                <div className="bg-white/5 p-1 rounded-lg">
                  <div className="font-bold text-emerald-400">{simResources.wheat}</div>
                  <div className="text-[7.5px] text-zinc-500">Wheat</div>
                </div>
                <div className="bg-white/5 p-1 rounded-lg">
                  <div className="font-bold text-yellow-400">{simResources.gold}</div>
                  <div className="text-[7.5px] text-zinc-500">Gold</div>
                </div>
              </div>

              {/* Settlement Visual representation map */}
              <div className="h-28 bg-zinc-900 border border-white/5 rounded-xl p-2 relative overflow-hidden flex flex-col justify-end text-[8.5px] uppercase text-zinc-500 font-mono">
                {/* Simulated carriers or trees */}
                <div className="absolute top-2 left-4 text-xs font-bold text-white flex items-center gap-1">
                  🌾 TERRITORY: {territorySize}m²
                </div>
                <div className="absolute top-2 right-4 text-xs text-zinc-400">
                  👥 POPULATION: {simWorkers} Carriers
                </div>

                {/* Animated graphic indicators */}
                <div className="flex justify-around items-end h-12 w-full px-2 mb-1 border-b border-white/5">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-400">🪓</span>
                    <span className="text-[7px] text-zinc-500">x{simBuildings.lumberjack}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-cyan-400">⛏</span>
                    <span className="text-[7px] text-zinc-500">x{simBuildings.quarry}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-400">🌾</span>
                    <span className="text-[7px] text-zinc-500">x{simBuildings.farm}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-rose-400">🏰</span>
                    <span className="text-[7px] text-zinc-500">x{simBuildings.military_post}</span>
                  </div>
                </div>

                <div className="text-[7.5px] text-amber-400 animate-pulse text-center block tracking-widest font-black uppercase">
                  {battleReport[0]}
                </div>
              </div>

              {/* Construction controls */}
              <div className="grid grid-cols-2 gap-1.5">
                <button 
                  onClick={() => handleConstructBuilding('lumberjack')}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>+ Lumberjack</span>
                  <span className="text-[7px] text-zinc-500">10W, 5S</span>
                </button>
                <button 
                  onClick={() => handleConstructBuilding('quarry')}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>+ Stone Quarry</span>
                  <span className="text-[7px] text-zinc-500">8W, 12S</span>
                </button>
                <button 
                  onClick={() => handleConstructBuilding('farm')}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>+ Wheat Farm</span>
                  <span className="text-[7px] text-zinc-500">15W, 8S</span>
                </button>
                <button 
                  onClick={() => handleConstructBuilding('military_post')}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase text-left flex justify-between items-center transition-all cursor-pointer"
                >
                  <span>+ Castle Post</span>
                  <span className="text-[7px] text-zinc-500">20W, 18S</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* PANEL 2: MODS, MAPS & SAVES FILE EXPLORER */}
        <div className="xl:col-span-5 bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3.5">
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
              <Database size={14} />
              WORKSPACE REGISTRY FILE SHELF
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">{activeGame?.files.length} FILES</span>
          </div>

          {/* Sub-tabs for filtering files */}
          <div className="flex gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5 mb-3">
            {(['all', 'mods', 'maps', 'saves', 'logs'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => { playTab(); setFileFilterTab(tab); }}
                className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                  fileFilterTab === tab ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            
            {/* Search filter for files */}
            <input 
              type="text"
              value={fileSearchQuery}
              onChange={e => setFileSearchQuery(e.target.value)}
              placeholder="SEARCH FILES..."
              className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2 text-[10px] uppercase font-bold outline-none text-white focus:border-cyan-400"
            />

            {/* Drag and Drop mod zone */}
            {fileFilterTab === 'mods' && (
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                  dragOver ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-cyan-400">Drag & Drop .wmf package files to Install</div>
                <div className="text-[8px] text-zinc-500 uppercase mt-0.5">Compatible with Widelands automatic mod mapping</div>
              </div>
            )}

            {/* Custom map build console */}
            {fileFilterTab === 'maps' && (
              <div className="bg-zinc-950 border border-white/5 p-3 rounded-xl space-y-2">
                <span className="text-[8.5px] font-black uppercase text-cyan-400">Create Battle Map</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newMapName}
                    onChange={e => setNewMapName(e.target.value)}
                    placeholder="Enter Custom Map Name..."
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] uppercase font-bold outline-none text-white focus:border-cyan-400"
                  />
                  <button 
                    onClick={handleAddCustomMap}
                    className="bg-cyan-500 text-zinc-950 px-3 py-1 text-[9px] font-black rounded-lg uppercase hover:bg-cyan-400 transition-all cursor-pointer"
                  >
                    Build Map
                  </button>
                </div>
              </div>
            )}

            {/* File list renderer */}
            <div className="space-y-2">
              {getFilteredFiles().map((file) => (
                <div 
                  key={file.name}
                  onClick={() => { playClick(); setShowFilePreviewModal(file); }}
                  className="p-3 bg-zinc-950/60 border border-white/5 hover:border-white/10 rounded-xl flex justify-between items-center transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-white/5 text-zinc-400">
                      {file.type === 'mod' ? '🧩' : file.type === 'map' ? '🗺' : file.type === 'save' ? '💾' : '📄'}
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-zinc-200 block">{file.name}</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest block mt-0.5">
                        {file.sizeKB} KB • MODIFIED: {file.lastModified}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {/* Active toggle for mods */}
                    {file.type === 'mod' && (
                      <button 
                        onClick={() => toggleModState(file.name)}
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${
                          file.enabled 
                            ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {file.enabled ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    )}

                    <button 
                      onClick={() => { playClick(); setShowFilePreviewModal(file); }}
                      title="Inspect File Content"
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Eye size={12} />
                    </button>

                    <button 
                      onClick={() => deleteFile(file.name)}
                      className="p-1.5 bg-white/5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {getFilteredFiles().length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-[10px] uppercase border border-dashed border-white/5 rounded-2xl">
                  No files found matching the selected query filter.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* PANEL 3: PERFORMANCE GRAPHICS & SNAPSHOT BACKUPS */}
        <div className="xl:col-span-3 bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-5 min-h-0 relative">
          
          {/* Graphics Settings */}
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3.5">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                <Sliders size={14} />
                GRAPHICS & HARDWARE ALLOCATION
              </span>
            </div>

            <div className="space-y-3 font-mono text-[9px] uppercase">
              <div className="space-y-1">
                <label className="text-zinc-400 text-[8px] block">Simulation Target FPS Cap</label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg">
                  {['30', '60', '120'].map(fps => (
                    <button 
                      key={fps} 
                      onClick={() => { playClick(); setFrameRateCap(fps); }}
                      className={`py-1 rounded text-center text-[8.5px] font-black ${frameRateCap === fps ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[8px] block">Resolution Profiler</label>
                <select 
                  value={resolution}
                  onChange={e => { playClick(); setResolution(e.target.value); }}
                  className="w-full bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-zinc-300"
                >
                  <option value="720p">720p Low Storage Scaling</option>
                  <option value="1080p">1080p Balanced Density</option>
                  <option value="1440p">1440p Ultra Complex Raster</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-[8px] block">Graphics Memory allocation limit</label>
                <select 
                  value={ramLimit}
                  onChange={e => { playClick(); setRamLimit(e.target.value); }}
                  className="w-full bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-zinc-300"
                >
                  <option value="256MB">256MB Aggressive Compression</option>
                  <option value="512MB">512MB Laptop Optimized</option>
                  <option value="1GB">1GB Native High Fidelity</option>
                </select>
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] font-black text-zinc-300">LAZY SHADER COMPILE</span>
                  <p className="text-[7.5px] text-zinc-500">Drastically reduces disk cache writes.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={cacheAggressivePurge}
                  onChange={e => { playClick(); setCacheAggressivePurge(e.target.checked); }}
                  className="accent-emerald-400"
                />
              </div>

              {/* Cache Purge button for storage constrained devices */}
              <button 
                onClick={purgeLaptopCache}
                className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 font-black rounded-xl text-[9px] uppercase tracking-wide transition-all cursor-pointer"
              >
                🧹 Purge Unused Cache Blocks
              </button>

              <div className="text-[8.5px] text-zinc-500 text-center uppercase">
                SAVED STORAGE: <strong className="text-emerald-400">{(storageCleanedKB / 1024).toFixed(1)} MB</strong>
              </div>
            </div>
          </div>

          {/* Backup Snapshots */}
          <div className="mt-auto flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3.5">
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase flex items-center gap-1.5">
                <Archive size={14} />
                SNAPSHOT RECOVERY VAULT
              </span>
              <button 
                onClick={triggerManualBackup}
                className="text-[8px] font-black text-purple-400 hover:text-purple-300 uppercase cursor-pointer"
              >
                Backup Now
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-56">
              {backups.map(b => (
                <div key={b.id} className="p-2.5 bg-zinc-950/80 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-zinc-400 uppercase">
                    <span className="font-bold flex items-center gap-1">
                      <Clock size={10} />
                      {b.timestamp}
                    </span>
                    <span className="px-1 bg-white/5 rounded text-[7.5px]">{b.type}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-300 font-mono uppercase">{b.fileCount} Saved Files ({b.sizeKB} KB)</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => restoreBackup(b)}
                        className="text-[8px] font-black bg-purple-500 text-black px-1.5 py-0.5 rounded uppercase hover:bg-purple-400 transition-all cursor-pointer"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => deleteBackup(b.id)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SYSTEM TERMINAL LOGS OVERLAY PANEL */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-4 mt-6">
        <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
          <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
            <Terminal size={12} />
            DIAGNOSTIC TELEMETRY STDOUT LOGGER
          </span>
          <button 
            onClick={() => setLogs([])}
            className="text-[8px] font-bold text-zinc-500 hover:text-white uppercase cursor-pointer"
          >
            Clear logs
          </button>
        </div>

        <div className="h-24 overflow-y-auto bg-zinc-950 rounded-xl p-3 font-mono text-[9px] text-emerald-400/90 uppercase space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed truncate">{log}</div>
          ))}
          {logs.length === 0 && (
            <div className="text-zinc-600 text-center py-4">Logs buffer empty. Runtime processes operating nominal.</div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD FUTURE GAME CONFIG */}
      <AnimatePresence>
        {showAddGameModal && (
          <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-[0_20px_50px_rgba(245,158,11,0.15)]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Gamepad2 size={14} />
                  REGISTER FUTURE GAME DIRECTORY
                </span>
                <button onClick={() => setShowAddGameModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRegisterNewGame} className="space-y-3 text-[10px] uppercase font-bold text-zinc-400">
                <div className="space-y-1">
                  <label className="block">Game Title / Name</label>
                  <input 
                    type="text"
                    required
                    value={newGameForm.name}
                    onChange={e => setNewGameForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. OpenTTD Classic"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block">Launcher Version</label>
                    <input 
                      type="text"
                      required
                      value={newGameForm.version}
                      onChange={e => setNewGameForm(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block">Genre / Tag</label>
                    <input 
                      type="text"
                      required
                      value={newGameForm.genre}
                      onChange={e => setNewGameForm(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block">System Path Installation Folder</label>
                  <input 
                    type="text"
                    required
                    value={newGameForm.installationPath}
                    onChange={e => setNewGameForm(prev => ({ ...prev, installationPath: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">Required Executable & Resource Files</label>
                  <input 
                    type="text"
                    required
                    value={newGameForm.requiredFiles}
                    onChange={e => setNewGameForm(prev => ({ ...prev, requiredFiles: e.target.value }))}
                    placeholder="game.exe, config.xml, resources.pak"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <p className="text-[8px] text-zinc-500 block">Use comma separate lists to set system file checks.</p>
                </div>

                <div className="space-y-1">
                  <label className="block">Short Game Description</label>
                  <textarea 
                    value={newGameForm.description}
                    onChange={e => setNewGameForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Type details about this retro release..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddGameModal(false)}
                    className="flex-1 py-2.5 bg-zinc-900 border border-white/10 text-zinc-300 font-black rounded-xl uppercase hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 text-zinc-950 font-black rounded-xl uppercase hover:bg-amber-400"
                  >
                    Register Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FILE PREVIEW MODAL */}
      <AnimatePresence>
        {showFilePreviewModal && (
          <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-cyan-500/40 rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-[0_20px_50px_rgba(6,182,212,0.15)]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText size={14} />
                  BUILT-IN STATIC FILE RUNTIME PREVIEW
                </span>
                <button onClick={() => setShowFilePreviewModal(null)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 font-mono text-[9px] uppercase">
                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2 text-zinc-500">
                  <div>FILE NAME: <strong className="text-zinc-200">{showFilePreviewModal.name}</strong></div>
                  <div>FILE SIZE: <strong className="text-zinc-200">{showFilePreviewModal.sizeKB} KB</strong></div>
                  <div>TYPE: <strong className="text-zinc-200">{showFilePreviewModal.type}</strong></div>
                  <div>MODIFIED: <strong className="text-zinc-200">{showFilePreviewModal.lastModified}</strong></div>
                </div>

                {showFilePreviewModal.description && (
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-zinc-400 uppercase text-[8.5px]">
                    DESCRIPTION: {showFilePreviewModal.description}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-zinc-500 block">BINARY ASSEMBLY / PLAINTEXT STRUCTURE:</span>
                  <pre className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-[9.5px] leading-relaxed text-zinc-300 uppercase overflow-x-auto max-h-60">
                    {showFilePreviewModal.content || `[Binary payload data blocks size: ${showFilePreviewModal.sizeKB} KB]`}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setShowFilePreviewModal(null)}
                  className="px-6 py-2 bg-cyan-500 text-zinc-950 font-black rounded-xl uppercase text-[10px] hover:bg-cyan-400 transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
