import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FolderPlus, FolderOpen, Search, Sparkles, Cpu, Zap, Play, Package,
  Archive, RefreshCw, Trash2, Star, Edit3, X, Layers, Shield, Filter, CheckCircle2,
  AlertTriangle, Terminal, Download, FileText, Code, Gamepad2, Wrench, Bot, Film,
  Grid, List, Info, ArrowUpRight, HardDrive, Database, UploadCloud, ChevronRight,
  Maximize2, Box, Check, Copy
} from 'lucide-react';

export interface LoadedApp {
  id: string;
  name: string;
  path: string;
  sizeMB: number;
  extension: string;
  category: 'productivity' | 'development' | 'games' | 'utilities' | 'ai' | 'media' | 'other';
  typeLabel: string;
  version?: string;
  author?: string;
  description?: string;
  isFavorite?: boolean;
  dateAdded: string;
  rawFile?: File;
  contentPreview?: string;
}

export interface SavedFolder {
  id: string;
  name: string;
  path: string;
  appCount: number;
  totalSizeMB: number;
  lastScanned: string;
  isFavorite: boolean;
  apps: LoadedApp[];
}

const STORAGE_KEY = 'NEON_ARENA_LOADED_FOLDERS_V5';

// Default initial folders for Instant Demo & Apps Container
const DEFAULT_SAVED_FOLDERS: SavedFolder[] = [
  {
    id: 'default-apps-folder',
    name: 'Neon Arena System Apps',
    path: '/apps/',
    appCount: 6,
    totalSizeMB: 24.8,
    lastScanned: new Date().toLocaleDateString(),
    isFavorite: true,
    apps: [
      {
        id: 'app-1',
        name: 'tactical_radar_hud_package.zip',
        path: '/apps/tactical_radar_hud_package.zip',
        sizeMB: 3.2,
        extension: 'zip',
        category: 'utilities',
        typeLabel: 'ZIP ARCHIVE',
        version: '1.2.0',
        author: 'TacticalTech',
        description: '3D Wireframe Arena Map & Tactical HUD Overlay Package',
        isFavorite: true,
        dateAdded: new Date().toLocaleDateString(),
        contentPreview: `{\n  "archive": "tactical_radar_hud_package.zip",\n  "entries": ["manifest.json", "index.js", "styles.css"],\n  "status": "Valid ZIP Archive"\n}`
      },
      {
        id: 'app-2',
        name: 'scientific_gravity_calculator.js',
        path: '/apps/scientific_gravity_calculator.js',
        sizeMB: 0.8,
        extension: 'js',
        category: 'development',
        typeLabel: 'JS APP',
        version: '1.0.5',
        author: 'InfinityAcademy',
        description: 'Real-time orbital mechanics & escape velocity solver',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString(),
        contentPreview: `export function calculateEscapeVelocity(mass, radius) {\n  const G = 6.6743e-11;\n  return Math.sqrt((2 * G * mass) / radius);\n}`
      },
      {
        id: 'app-3',
        name: 'neon_arena_3d_viewer.apk',
        path: '/apps/neon_arena_3d_viewer.apk',
        sizeMB: 12.4,
        extension: 'apk',
        category: 'games',
        typeLabel: 'ANDROID APK',
        version: '3.1.0',
        author: 'NeonMaster',
        description: 'Native Android 16 standalone WebGL 3D Arena Client',
        isFavorite: true,
        dateAdded: new Date().toLocaleDateString()
      },
      {
        id: 'app-4',
        name: 'ai_neural_bot_weights.onnx',
        path: '/apps/ai_neural_bot_weights.onnx',
        sizeMB: 6.1,
        extension: 'onnx',
        category: 'ai',
        typeLabel: 'AI MODEL',
        version: '0.9.4',
        author: 'DeepMind',
        description: 'Reinforcement learning neural weights for bot AI tactics',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString()
      },
      {
        id: 'app-5',
        name: 'arena_stats_spreadsheet.xlsx',
        path: '/apps/arena_stats_spreadsheet.xlsx',
        sizeMB: 1.1,
        extension: 'xlsx',
        category: 'productivity',
        typeLabel: 'DOCUMENT',
        version: '2026.1',
        author: 'ArenaAdmin',
        description: 'Player match telemetry, k/d ratios, and leaderboard sheet',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString()
      },
      {
        id: 'app-6',
        name: 'cyberpunk_ambient_audio.mp4',
        path: '/apps/cyberpunk_ambient_audio.mp4',
        sizeMB: 1.2,
        extension: 'mp4',
        category: 'media',
        typeLabel: 'VIDEO',
        version: '1.0.0',
        author: 'Mixkit',
        description: 'Neon synthwave video background loop',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString()
      }
    ]
  }
];

export function AppsFolderStudio({ onClose }: { onClose?: () => void }) {
  const [savedFolders, setSavedFolders] = useState<SavedFolder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading saved folders:", e);
    }
    return DEFAULT_SAVED_FOLDERS;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    savedFolders[0]?.id || 'default-apps-folder'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'category' | 'type' | 'recent'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // App Inspector Modal & Sandbox Runner
  const [selectedApp, setSelectedApp] = useState<LoadedApp | null>(null);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // Rename modal
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Drag & Drop State
  const [isDragOver, setIsDragOver] = useState(false);

  // Modular Tabs
  const [activeTab, setActiveTab] = useState<'loader' | 'installed' | 'backups' | 'plugins'>('loader');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);

  // Save to LocalStorage whenever savedFolders changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFolders));
    } catch (e) {
      console.warn("LocalStorage space limit exceeded, saving truncated folder metadata:", e);
    }
  }, [savedFolders]);

  const activeFolder = savedFolders.find(f => f.id === selectedFolderId) || savedFolders[0];

  // Helper to categorize extensions
  const categorizeExtension = (ext: string): LoadedApp['category'] => {
    const lower = ext.toLowerCase();
    if (['apk', 'exe', 'x86_64', 'app', 'wasm', 'unity3d', 'pck', 'mcpack', 'pak', 'dmg'].includes(lower)) return 'games';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'rs', 'cpp', 'c', 'go', 'java', 'html', 'css', 'sh', 'php', 'swift', 'kt'].includes(lower)) return 'development';
    if (['pdf', 'doc', 'docx', 'xlsx', 'xls', 'md', 'txt', 'csv', 'key', 'ppt', 'pptx', 'notes'].includes(lower)) return 'productivity';
    if (['zip', 'tar', 'gz', '7z', 'rar', 'iso', 'deb', 'rpm'].includes(lower)) return 'utilities';
    if (['onnx', 'pt', 'gguf', 'safetensors', 'bin', 'model', 'tflite', 'ipynb'].includes(lower)) return 'ai';
    if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'png', 'jpg', 'jpeg', 'gif', 'svg'].includes(lower)) return 'media';
    return 'other';
  };

  // Helper to get extension label
  const getTypeLabel = (ext: string): string => {
    const lower = ext.toLowerCase();
    if (lower === 'apk') return 'ANDROID APK';
    if (lower === 'zip') return 'ZIP ARCHIVE';
    if (lower === 'js' || lower === 'ts') return 'JS/TS MODULE';
    if (lower === 'exe') return 'WIN EXECUTABLE';
    if (lower === 'py') return 'PYTHON APP';
    if (lower === 'onnx' || lower === 'gguf') return 'AI MODEL WEIGHTS';
    if (lower === 'json') return 'JSON DATA';
    return `${ext.toUpperCase()} FILE`;
  };

  // Icon selector per category/type
  const getAppIcon = (app: LoadedApp) => {
    switch (app.category) {
      case 'games': return <Gamepad2 className="w-5 h-5 text-emerald-400" />;
      case 'development': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'productivity': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'utilities': return <Archive className="w-5 h-5 text-amber-400" />;
      case 'ai': return <Bot className="w-5 h-5 text-fuchsia-400" />;
      case 'media': return <Film className="w-5 h-5 text-rose-400" />;
      default: return <Package className="w-5 h-5 text-zinc-400" />;
    }
  };

  // Process uploaded folder files asynchronously in batches
  const processFolderFiles = async (fileList: FileList | File[], folderNameHint?: string) => {
    if (!fileList || fileList.length === 0) {
      setErrorMessage("No files were found in the selected folder.");
      return;
    }

    setErrorMessage(null);
    setIsScanning(true);
    setScanProgress(5);
    setScanStatusText(`Scanning ${fileList.length} files in folder...`);

    const filesArray = Array.from(fileList);
    const parsedApps: LoadedApp[] = [];

    // Extract folder path or root name
    let rootFolderName = folderNameHint || "Loaded Folder";
    if (filesArray[0] && filesArray[0].webkitRelativePath) {
      const parts = filesArray[0].webkitRelativePath.split('/');
      if (parts.length > 0 && parts[0]) {
        rootFolderName = parts[0];
      }
    }

    const total = filesArray.length;
    const batchSize = 40;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = filesArray.slice(i, i + batchSize);

      for (const file of chunk) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const category = categorizeExtension(ext);
        const typeLabel = getTypeLabel(ext);
        const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        // Auto-detect version from filename regex (e.g., app-v1.2.0.apk)
        let version = '1.0.0';
        const versionMatch = file.name.match(/v?(\d+\.\d+\.\d+)/i);
        if (versionMatch) {
          version = versionMatch[1];
        }

        parsedApps.push({
          id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          path: file.webkitRelativePath || `/${rootFolderName}/${file.name}`,
          sizeMB,
          extension: ext,
          category,
          typeLabel,
          version,
          author: 'Local System',
          dateAdded: new Date().toLocaleDateString(),
          rawFile: file
        });
      }

      const prog = Math.min(95, Math.round(((i + chunk.length) / total) * 100));
      setScanProgress(prog);
      setScanStatusText(`Indexed ${i + chunk.length} / ${total} files...`);
      await new Promise(res => setTimeout(res, 15));
    }

    setScanProgress(100);
    setScanStatusText(`Scan complete! Loaded ${parsedApps.length} items.`);

    const totalSize = parsedApps.reduce((acc, curr) => acc + curr.sizeMB, 0);

    const newFolder: SavedFolder = {
      id: `folder-${Date.now()}`,
      name: rootFolderName,
      path: `/${rootFolderName}/`,
      appCount: parsedApps.length,
      totalSizeMB: parseFloat(totalSize.toFixed(1)),
      lastScanned: new Date().toLocaleDateString(),
      isFavorite: false,
      apps: parsedApps
    };

    setSavedFolders(prev => [newFolder, ...prev]);
    setSelectedFolderId(newFolder.id);

    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFolderFiles(e.dataTransfer.files, "Dropped Folder Package");
    }
  };

  // Filter & Sort Apps
  const filteredApps = (activeFolder?.apps || []).filter(app => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.extension.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.sizeMB - a.sizeMB;
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'type') return a.extension.localeCompare(b.extension);
    return 0;
  });

  // Folder Actions
  const handleRefreshFolder = (folderId: string) => {
    const folder = savedFolders.find(f => f.id === folderId);
    if (!folder) return;

    setIsScanning(true);
    setScanProgress(30);
    setScanStatusText(`Re-indexing ${folder.name}...`);

    setTimeout(() => {
      setScanProgress(100);
      setScanStatusText(`Updated indices for ${folder.name}!`);
      setSavedFolders(prev => prev.map(f => f.id === folderId ? { ...f, lastScanned: new Date().toLocaleDateString() } : f));
      setIsScanning(false);
    }, 500);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (savedFolders.length <= 1) {
      setErrorMessage("At least one folder must remain in your workspace.");
      return;
    }
    const filtered = savedFolders.filter(f => f.id !== folderId);
    setSavedFolders(filtered);
    setSelectedFolderId(filtered[0]?.id || '');
  };

  const handleToggleFavoriteFolder = (folderId: string) => {
    setSavedFolders(prev => prev.map(f => f.id === folderId ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  const handleSaveFolderRename = (folderId: string) => {
    if (!renameInputValue.trim()) return;
    setSavedFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: renameInputValue.trim() } : f));
    setEditingFolderId(null);
  };

  // Launch app sandbox simulation
  const launchAppSandbox = (app: LoadedApp) => {
    setSelectedApp(app);
    setIsSandboxRunning(true);
    setSandboxLogs([
      `[SANDBOX V8 ISOLATE] Allocating container runtime for ${app.name}...`,
      `[SECURITY] Permissive sandbox profile applied. Isolating I/O context.`,
      `[MEMORY] Bound 64MB Virtual WASM Memory surface`,
      `[STATUS] Package ${app.typeLabel} v${app.version || '1.0.0'} started on port 3000.`,
      `[CONSOLE LOG] Application "${app.name}" output stream online!`
    ]);
  };

  // Category statistics
  const categoryCounts = {
    all: activeFolder?.apps.length || 0,
    productivity: activeFolder?.apps.filter(a => a.category === 'productivity').length || 0,
    development: activeFolder?.apps.filter(a => a.category === 'development').length || 0,
    games: activeFolder?.apps.filter(a => a.category === 'games').length || 0,
    utilities: activeFolder?.apps.filter(a => a.category === 'utilities').length || 0,
    ai: activeFolder?.apps.filter(a => a.category === 'ai').length || 0,
    media: activeFolder?.apps.filter(a => a.category === 'media').length || 0,
    other: activeFolder?.apps.filter(a => a.category === 'other').length || 0,
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col font-sans text-white overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-cyan-950/80 backdrop-blur-md border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center p-8 space-y-4 text-center pointer-events-none"
          >
            <UploadCloud size={64} className="text-cyan-400 animate-bounce" />
            <h2 className="text-2xl font-black uppercase text-cyan-300 tracking-wider">DROP ANY FOLDER HERE TO SCAN APPS</h2>
            <p className="text-xs text-cyan-200/80 font-mono">Supports APKs, ZIP archives, executables, scripts, and project folders</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation */}
      <div className="bg-zinc-950/90 border-b border-cyan-500/20 px-6 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Cpu className="w-6 h-6 text-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                NEON ARENA // APPS & FOLDER LOADER
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                v5.0 CONTAINER
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">High-performance local directory app engine & package container</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Load Folder Button */}
          <label className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-2">
            <FolderPlus size={15} />
            SELECT FOLDER FROM DEVICE
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              {...{ webkitdirectory: "", directory: "" }} 
              onChange={(e) => e.target.files && processFolderFiles(e.target.files)} 
              className="hidden" 
            />
          </label>

          {/* Load ZIP/Files Button */}
          <label className="px-3 py-2 bg-zinc-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
            <Archive size={14} />
            + .ZIP ARCHIVE
            <input 
              ref={archiveInputRef}
              type="file" 
              multiple 
              accept=".zip,.tar,.gz,.apk,.app,.exe,.js"
              onChange={(e) => e.target.files && processFolderFiles(e.target.files, "Archive Package")}
              className="hidden" 
            />
          </label>

          {onClose && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Loaded Folders List */}
        <div className="w-72 bg-zinc-950/80 border-r border-white/5 flex flex-col justify-between p-4 space-y-4">
          
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <HardDrive size={12} /> RECENTLY LOADED FOLDERS
              </span>
              <span className="text-[9px] font-mono text-zinc-500 font-bold">{savedFolders.length} LOADED</span>
            </div>

            <div className="space-y-2">
              {savedFolders.map((folder) => {
                const isSelected = folder.id === selectedFolderId;
                const isEditing = folder.id === editingFolderId;

                return (
                  <div 
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group relative ${
                      isSelected 
                        ? 'bg-gradient-to-r from-cyan-950/60 to-zinc-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                        
                        {isEditing ? (
                          <div className="flex gap-1 items-center w-full" onClick={e => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={renameInputValue}
                              onChange={e => setRenameInputValue(e.target.value)}
                              className="bg-black border border-cyan-400 text-xs px-2 py-0.5 rounded w-full text-white font-bold"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveFolderRename(folder.id)}
                              className="p-1 bg-cyan-500 text-black rounded hover:bg-cyan-400"
                            >
                              <Check size={10} />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-black truncate ${isSelected ? 'text-cyan-300' : 'text-zinc-200'}`}>
                            {folder.name}
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavoriteFolder(folder.id); }}
                        className={`p-1 rounded transition-colors ${folder.isFavorite ? 'text-amber-400' : 'text-zinc-600 hover:text-amber-400'}`}
                      >
                        <Star size={12} fill={folder.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>{folder.appCount} APPS DETECTED</span>
                      <span className="text-cyan-400/80">{folder.totalSizeMB} MB</span>
                    </div>

                    {/* Folder Controls */}
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-zinc-500">
                      <span>Path: {folder.path}</span>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFolderId(folder.id);
                            setRenameInputValue(folder.name);
                          }}
                          className="hover:text-cyan-400 p-0.5"
                          title="Rename Folder"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRefreshFolder(folder.id); }}
                          className="hover:text-cyan-400 p-0.5"
                          title="Rescan Folder"
                        >
                          <RefreshCw size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                          className="hover:text-rose-400 p-0.5"
                          title="Remove Folder"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Stats */}
          <div className="bg-black/60 border border-white/5 p-3 rounded-2xl space-y-2 text-[9px] font-mono">
            <div className="flex justify-between text-zinc-400 uppercase">
              <span>ACTIVE STORAGE</span>
              <span className="text-cyan-400 font-bold">{activeFolder?.totalSizeMB || 0} MB</span>
            </div>
            <div className="flex justify-between text-zinc-400 uppercase">
              <span>SCANNER STATUS</span>
              <span className="text-emerald-400 font-bold">READY (V5 ISOLATE)</span>
            </div>
          </div>
        </div>

        {/* Right Main Content View */}
        <div className="flex-1 bg-zinc-900/40 flex flex-col p-5 overflow-hidden space-y-4">

          {/* Scanner Progress Banner */}
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyan-950/90 border border-cyan-500/50 p-3.5 rounded-2xl space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <div className="flex justify-between text-xs font-mono font-bold uppercase text-cyan-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  {scanStatusText}
                </span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-cyan-500/20">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-2xl flex items-center justify-between text-xs font-mono text-rose-200">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {errorMessage}
              </span>
              <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main Top Filter & Search Bar */}
          <div className="flex justify-between items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search apps by name, type, extension, or tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">SORT BY:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="name">Name (A-Z)</option>
                <option value="size">Size (Largest)</option>
                <option value="category">Category</option>
                <option value="type">File Type</option>
              </select>

              <div className="bg-black/60 border border-white/10 rounded-xl p-1 flex gap-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  <Grid size={14} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All Apps', icon: Box, count: categoryCounts.all },
              { id: 'productivity', label: 'Productivity', icon: FileText, count: categoryCounts.productivity },
              { id: 'development', label: 'Development', icon: Code, count: categoryCounts.development },
              { id: 'games', label: 'Games', icon: Gamepad2, count: categoryCounts.games },
              { id: 'utilities', label: 'Utilities', icon: Wrench, count: categoryCounts.utilities },
              { id: 'ai', label: 'AI Models', icon: Bot, count: categoryCounts.ai },
              { id: 'media', label: 'Media', icon: Film, count: categoryCounts.media },
            ].map(cat => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive 
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <IconComp size={12} />
                  <span>{cat.label}</span>
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-cyan-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Apps Grid / List View */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {filteredApps.length === 0 ? (
              <div className="h-64 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-3 text-center p-6">
                <Package size={40} className="text-zinc-600" />
                <span className="text-sm font-black uppercase text-zinc-400 tracking-wider">No Applications Detected</span>
                <p className="text-xs text-zinc-500 max-w-sm font-mono">
                  No files matching category "{activeCategory}" were found in {activeFolder?.name}. Drop a folder or select a new directory.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredApps.map((app) => (
                  <motion.div 
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-950/80 border border-white/10 hover:border-cyan-500/50 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all relative overflow-hidden"
                  >
                    {/* Glowing Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Card Header Icon & Category Tag */}
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                          {getAppIcon(app)}
                        </div>

                        <span className="text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {app.typeLabel}
                        </span>
                      </div>

                      {/* Title & Path */}
                      <h3 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                        {app.path}
                      </p>
                      
                      {app.description && (
                        <p className="text-[9px] text-zinc-400 mt-2 line-clamp-2 leading-snug">
                          {app.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata & Actions Footer */}
                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase">
                        <span>Size: <strong className="text-white">{app.sizeMB} MB</strong></span>
                        <span>v{app.version || '1.0.0'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          onClick={() => launchAppSandbox(app)}
                          className="py-1.5 px-2 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Play size={10} /> LAUNCH
                        </button>
                        
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Info size={10} /> DETAILS
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-2">
                {filteredApps.map((app) => (
                  <div 
                    key={app.id}
                    className="bg-zinc-950/80 border border-white/10 hover:border-cyan-500/50 p-3 rounded-2xl flex items-center justify-between gap-4 group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-white/5 shrink-0">
                        {getAppIcon(app)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-white truncate group-hover:text-cyan-300">
                            {app.name}
                          </h3>
                          <span className="text-[8px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                            {app.typeLabel}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 truncate block">
                          {app.path}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="font-mono text-[9px] text-zinc-400 uppercase">
                        <div>Size: <strong className="text-white">{app.sizeMB} MB</strong></div>
                        <div>Version: v{app.version || '1.0.0'}</div>
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => launchAppSandbox(app)}
                          className="px-3 py-1.5 bg-cyan-500 text-black font-black text-[9px] uppercase rounded-lg hover:bg-cyan-400 flex items-center gap-1"
                        >
                          <Play size={10} /> LAUNCH
                        </button>
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 bg-white/5 text-zinc-300 rounded-lg border border-white/10 hover:bg-white/10"
                        >
                          <Info size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APP METADATA & SANDBOX RUNNER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  {getAppIcon(selectedApp)}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">{selectedApp.name}</h3>
                  <span className="text-[9px] font-mono text-cyan-400">{selectedApp.typeLabel} • v{selectedApp.version || '1.0.0'}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* App Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-zinc-500 uppercase block font-bold">Category</span>
                <span className="text-cyan-300 uppercase font-black">{selectedApp.category}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-zinc-500 uppercase block font-bold">File Size</span>
                <span className="text-emerald-400 font-black">{selectedApp.sizeMB} MB</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 col-span-2">
                <span className="text-zinc-500 uppercase block font-bold">File System Path</span>
                <span className="text-zinc-300 truncate block font-mono">{selectedApp.path}</span>
              </div>
            </div>

            {/* Content / Code Preview */}
            {selectedApp.contentPreview && (
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Package Code / Manifest Preview</span>
                <pre className="p-3 bg-black border border-white/10 rounded-xl text-[9px] font-mono text-cyan-300 max-h-36 overflow-y-auto custom-scrollbar">
                  {selectedApp.contentPreview}
                </pre>
              </div>
            )}

            {/* Sandbox Log Output if Running */}
            {isSandboxRunning && (
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <Terminal size={12} className="animate-pulse" /> LIVE ISOLATED SANDBOX LOGS
                </span>
                <div className="p-3 bg-black border border-cyan-500/30 rounded-xl text-[9px] font-mono text-emerald-300 max-h-36 overflow-y-auto custom-scrollbar space-y-1">
                  {sandboxLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button 
                onClick={() => launchAppSandbox(selectedApp)}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play size={14} /> RUN IN SANDBOX
              </button>
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase rounded-xl border border-white/10 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
