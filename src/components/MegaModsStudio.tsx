import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  Folder, FolderPlus, FolderKanban, Radio, Play, Pause, Square, Sparkles, Send, Bot,
  Cpu, Languages, RotateCcw, Save, Download, FileJson, Layers, Sliders,
  Volume2, Type, Image as ImageIcon, CheckCircle, HelpCircle, AlertCircle,
  Eye, RefreshCw, Film, Trash2, Mic, Plus, FileText, ChevronRight, X,
  ArrowUp, ArrowDown, Clipboard, Edit, Trash, Star, Pin, Upload, Archive, 
  Settings, Zap, Shield, HardDrive, Terminal, Smartphone, Activity, Check
} from 'lucide-react';
import { soundService } from '../services/soundService';

// Interfaces
export interface VirtualFile {
  name: string;
  content: string;
  type: 'image' | 'audio' | 'video' | 'text' | 'zip' | 'mod';
  sizeMB: number;
  version?: string;
  author?: string;
  dependencies?: string[];
  enabled?: boolean;
}

export interface FolderConfig {
  name: string;
  path: string;
  color: string; // 'cyan' | 'amber' | 'rose' | 'emerald' | 'fuchsia' | 'violet' | 'gold' | 'cobalt'
  icon: string; // lucide icon identifier
  isPinned: boolean;
  isFavorite: boolean;
  files: VirtualFile[];
}

export interface ModProfile {
  name: string;
  enabledModNames: string[];
}

// Accent Colors Configuration
const COLOR_THEMES: Record<string, { border: string, text: string, bg: string, glow: string, label: string }> = {
  cyan: { border: 'border-cyan-500/40 hover:border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]', label: 'Cyan Grid' },
  amber: { border: 'border-amber-500/40 hover:border-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]', label: 'Amber Alert' },
  rose: { border: 'border-rose-500/40 hover:border-rose-400', text: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]', label: 'Rose Quantum' },
  emerald: { border: 'border-emerald-500/40 hover:border-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]', label: 'Emerald Bios' },
  fuchsia: { border: 'border-fuchsia-500/40 hover:border-fuchsia-400', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.35)]', label: 'Fuchsia Overdrive' },
  violet: { border: 'border-violet-500/40 hover:border-violet-400', text: 'text-violet-400', bg: 'bg-violet-500/10', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.35)]', label: 'Space Indigo' },
  gold: { border: 'border-yellow-500/40 hover:border-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]', label: 'Gold Horizon' },
  cobalt: { border: 'border-blue-500/40 hover:border-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]', label: 'Cobalt Matrix' },
};

// Available Icon Identifiers
const ICON_LIST = [
  { id: 'folder', Icon: Folder, label: 'Folder' },
  { id: 'archive', Icon: Archive, label: 'Archive' },
  { id: 'cpu', Icon: Cpu, label: 'CPU Core' },
  { id: 'settings', Icon: Settings, label: 'Settings' },
  { id: 'music', Icon: Mic, label: 'Audio' },
  { id: 'video', Icon: Film, label: 'Video' },
  { id: 'image', Icon: ImageIcon, label: 'Image' },
  { id: 'terminal', Icon: Terminal, label: 'Console' },
  { id: 'shield', Icon: Shield, label: 'Security' },
  { id: 'zap', Icon: Zap, label: 'Spark' },
  { id: 'harddrive', Icon: HardDrive, label: 'Storage' }
];

export function MegaModsStudio({ onClose, onMinecraftImportClick }: { onClose: () => void; onMinecraftImportClick?: () => void }) {
  // Folder core state
  const [folders, setFolders] = useState<FolderConfig[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pinned' | 'favorites'>('all');
  const [sortingOption, setSortingOption] = useState<'name' | 'size' | 'count'>('name');

  // File management states
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [textEditorContent, setTextEditorContent] = useState('');
  const [undoHistory, setUndoHistory] = useState<string[]>([]);
  const [redoHistory, setRedoHistory] = useState<string[]>([]);
  const [clipboardFile, setClipboardFile] = useState<{ file: VirtualFile, sourceFolder: string } | null>(null);

  // New Folder Dialog state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('cyan');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');

  // Rename Dialog state
  const [renamingFolder, setRenamingFolder] = useState<FolderConfig | null>(null);
  const [renamedName, setRenamedName] = useState('');

  // Right-click menu state
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, targetFolder: string } | null>(null);

  // Sound play simulation utilities
  const playClick = () => {
    try { soundService.playSFX('ui_click'); } catch (e) {}
  };
  const playSuccess = () => {
    try { soundService.playSFX('powerup'); } catch (e) {}
  };
  const playError = () => {
    try { soundService.playSFX('hit'); } catch (e) {}
  };

  // Pre-load default folders on first launch
  useEffect(() => {
    const saved = localStorage.getItem('mega_mods_folders_v1');
    if (saved) {
      try {
        setFolders(JSON.parse(saved));
      } catch (e) {
        initDefaultFolders();
      }
    } else {
      initDefaultFolders();
    }
  }, []);

  const saveFoldersToStorage = (updated: FolderConfig[]) => {
    setFolders(updated);
    localStorage.setItem('mega_mods_folders_v1', JSON.stringify(updated));
    // Keep active selected folder reference updated
    if (selectedFolder) {
      const current = updated.find(f => f.path === selectedFolder.path);
      if (current) setSelectedFolder(current);
    }
  };

  const initDefaultFolders = () => {
    const baseFolders: FolderConfig[] = [
      {
        name: 'Mods Store',
        path: '/ModsStore/',
        color: 'fuchsia',
        icon: 'archive',
        isPinned: true,
        isFavorite: true,
        files: [
          {
            name: 'gravity_shifter.js',
            type: 'mod',
            content: `// Gravity Shifter Mod\nexport function onLoad() {\n  Physics.setGravityMultiplier(0.25);\n  Console.log("Gravity set to 25% for lunar simulation.");\n}`,
            sizeMB: 0.8,
            version: '1.2.0',
            author: 'CosmicTutor',
            dependencies: [],
            enabled: true
          },
          {
            name: 'rtx_hd_bloom.json',
            type: 'mod',
            content: `{\n  "modId": "rtx_hd_bloom",\n  "version": "3.1.5",\n  "author": "RayTracerPro",\n  "bloomIntensity": 4.5,\n  "skyContrast": 1.9\n}`,
            sizeMB: 1.2,
            version: '3.1.5',
            author: 'RayTracerPro',
            dependencies: ['Shaders Core', 'Textures Pack'],
            enabled: false
          }
        ]
      },
      {
        name: 'Assets',
        path: '/Assets/',
        color: 'cyan',
        icon: 'image',
        isPinned: false,
        isFavorite: false,
        files: [
          { name: 'mitochondria_membrane.obj', type: 'text', content: '# Mitochondria OBJ 3D mesh vertices\nv 1.24 3.51 -0.85\nv 1.28 3.55 -0.89\nf 1 2 3', sizeMB: 4.5 },
          { name: 'aura_voice_intro.wav', type: 'audio', content: 'simulated_audio_data_64bit', sizeMB: 12.4 }
        ]
      },
      {
        name: 'Saves',
        path: '/Saves/',
        color: 'emerald',
        icon: 'harddrive',
        isPinned: false,
        isFavorite: false,
        files: [
          { name: 'world_save_auto.json', type: 'text', content: '{\n  "level": "Biology Labs",\n  "achievementsUnlocked": 8,\n  "playTimeSeconds": 48200\n}', sizeMB: 2.1 }
        ]
      },
      {
        name: 'Backups',
        path: '/Backups/',
        color: 'amber',
        icon: 'shield',
        isPinned: false,
        isFavorite: false,
        files: []
      },
      {
        name: 'Configs',
        path: '/Configs/',
        color: 'violet',
        icon: 'settings',
        isPinned: false,
        isFavorite: false,
        files: [
          { name: 'audio_mix_prefs.json', type: 'text', content: '{\n  "ambient": 75,\n  "voiceover": 95,\n  "sfx": 60\n}', sizeMB: 0.1 }
        ]
      },
      {
        name: 'Screenshots',
        path: '/Screenshots/',
        color: 'rose',
        icon: 'image',
        isPinned: false,
        isFavorite: false,
        files: [
          { name: 'cristae_macro_capture.png', type: 'image', content: 'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?w=800', sizeMB: 3.2 }
        ]
      },
      { name: 'Replays', path: '/Replays/', color: 'cobalt', icon: 'video', isPinned: false, isFavorite: false, files: [] },
      { name: 'Logs', path: '/Logs/', color: 'gold', icon: 'terminal', isPinned: false, isFavorite: false, files: [] },
      { name: 'Workshop', path: '/Workshop/', color: 'fuchsia', icon: 'zap', isPinned: false, isFavorite: false, files: [] },
      { name: 'Downloads', path: '/Downloads/', color: 'cyan', icon: 'archive', isPinned: false, isFavorite: false, files: [] },
      { name: 'Exports', path: '/Exports/', color: 'emerald', icon: 'harddrive', isPinned: false, isFavorite: false, files: [] }
    ];

    // Build remaining folders programmatically up to 30!
    const extraFolderNames = [
      'Maps', 'Characters', 'Weapons', 'Vehicles', 'NPCs',
      'Missions', 'Shaders', 'Textures', 'Audio', 'Videos',
      'CloudSync', 'Updates', 'Languages', 'Themes', 'Achievements',
      'Profiles', 'Templates', 'Scripts', 'AI', 'Developer'
    ];

    const colors: FolderConfig['color'][] = ['cyan', 'amber', 'rose', 'emerald', 'fuchsia', 'violet', 'gold', 'cobalt'];

    extraFolderNames.forEach((name, index) => {
      baseFolders.push({
        name,
        path: `/${name}/`,
        color: colors[index % colors.length],
        icon: name === 'Developer' ? 'terminal' : name === 'Audio' ? 'music' : name === 'Shaders' ? 'zap' : 'folder',
        isPinned: false,
        isFavorite: false,
        files: []
      });
    });

    saveFoldersToStorage(baseFolders);
    setSelectedFolder(baseFolders[0]);
  };

  // Folder Operations
  const createCustomFolder = () => {
    if (!newFolderName.trim()) return;
    const sanitizedName = newFolderName.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '');
    const path = `/${sanitizedName.replace(/\s+/g, '')}/`;

    if (folders.some(f => f.path === path)) {
      playError();
      alert('A directory with this path already exists!');
      return;
    }

    const updated = [...folders, {
      name: sanitizedName,
      path,
      color: newFolderColor,
      icon: newFolderIcon,
      isPinned: false,
      isFavorite: false,
      files: []
    }];

    saveFoldersToStorage(updated);
    setNewFolderName('');
    setShowNewFolderModal(false);
    playSuccess();
  };

  const deleteFolder = (path: string) => {
    if (path === '/ModsStore/') {
      playError();
      alert('Cannot delete the system core Mods Store directory!');
      return;
    }
    const updated = folders.filter(f => f.path !== path);
    saveFoldersToStorage(updated);
    if (selectedFolder?.path === path) {
      setSelectedFolder(updated[0]);
    }
    playSuccess();
  };

  const togglePin = (path: string) => {
    const updated = folders.map(f => f.path === path ? { ...f, isPinned: !f.isPinned } : f);
    saveFoldersToStorage(updated);
    playClick();
  };

  const toggleFavorite = (path: string) => {
    const updated = folders.map(f => f.path === path ? { ...f, isFavorite: !f.isFavorite } : f);
    saveFoldersToStorage(updated);
    playClick();
  };

  const renameFolder = () => {
    if (!renamedName.trim() || !renamingFolder) return;
    const sanitizedName = renamedName.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '');
    const updated = folders.map(f => f.path === renamingFolder.path ? { ...f, name: sanitizedName } : f);
    saveFoldersToStorage(updated);
    setRenamingFolder(null);
    setRenamedName('');
    playSuccess();
  };

  // Folder right click accent changer context menu
  const handleFolderContextMenu = (e: React.MouseEvent, folderPath: string) => {
    e.preventDefault();
    playClick();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetFolder: folderPath
    });
  };

  const changeFolderColor = (color: string) => {
    if (!contextMenu) return;
    const updated = folders.map(f => f.path === contextMenu.targetFolder ? { ...f, color } : f);
    saveFoldersToStorage(updated);
    setContextMenu(null);
    playSuccess();
  };

  const changeFolderIcon = (iconId: string) => {
    if (!contextMenu) return;
    const updated = folders.map(f => f.path === contextMenu.targetFolder ? { ...f, icon: iconId } : f);
    saveFoldersToStorage(updated);
    setContextMenu(null);
    playSuccess();
  };

  // File Manager operations (Inside selected folder)
  const addVirtualFile = (type: 'text' | 'image' | 'audio', namePrefix: string) => {
    if (!selectedFolder) return;
    const extension = type === 'image' ? 'png' : type === 'audio' ? 'wav' : 'txt';
    const name = `${namePrefix}_${Date.now() % 1000}.${extension}`;
    const newFile: VirtualFile = {
      name,
      type,
      content: type === 'text' ? '// Write your notes, script or configuration values here...' : 'simulated_binary_mesh',
      sizeMB: parseFloat((Math.random() * 2 + 0.1).toFixed(1))
    };

    const updated = folders.map(f => f.path === selectedFolder.path ? { ...f, files: [...f.files, newFile] } : f);
    saveFoldersToStorage(updated);
    playSuccess();
  };

  const deleteFile = (fileName: string) => {
    if (!selectedFolder) return;
    const updatedFiles = selectedFolder.files.filter(f => f.name !== fileName);
    const updated = folders.map(f => f.path === selectedFolder.path ? { ...f, files: updatedFiles } : f);
    saveFoldersToStorage(updated);
    if (selectedFile?.name === fileName) {
      setSelectedFile(null);
    }
    playSuccess();
  };

  const copyFile = (file: VirtualFile) => {
    if (!selectedFolder) return;
    setClipboardFile({ file, sourceFolder: selectedFolder.path });
    playClick();
  };

  const pasteFile = () => {
    if (!selectedFolder || !clipboardFile) return;
    const fileExists = selectedFolder.files.some(f => f.name === clipboardFile.file.name);
    const newName = fileExists ? `copy_of_${clipboardFile.file.name}` : clipboardFile.file.name;

    const pastedFile = { ...clipboardFile.file, name: newName };
    const updated = folders.map(f => f.path === selectedFolder.path ? { ...f, files: [...f.files, pastedFile] } : f);
    saveFoldersToStorage(updated);
    playSuccess();
  };

  // Text editor history & actions
  const openFileInEditor = (file: VirtualFile) => {
    setSelectedFile(file);
    setTextEditorContent(file.content);
    setUndoHistory([]);
    setRedoHistory([]);
    playClick();
  };

  const handleEditorChange = (val: string) => {
    setUndoHistory(prev => [...prev, textEditorContent]);
    setTextEditorContent(val);
    setRedoHistory([]);
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const prev = undoHistory[undoHistory.length - 1];
    setRedoHistory(r => [...r, textEditorContent]);
    setTextEditorContent(prev);
    setUndoHistory(u => u.slice(0, -1));
    playClick();
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setUndoHistory(u => [...u, textEditorContent]);
    setTextEditorContent(next);
    setRedoHistory(r => r.slice(0, -1));
    playClick();
  };

  const saveFileContent = () => {
    if (!selectedFolder || !selectedFile) return;
    const updatedFiles = selectedFolder.files.map(f => f.name === selectedFile.name ? { ...f, content: textEditorContent } : f);
    const updated = folders.map(f => f.path === selectedFolder.path ? { ...f, files: updatedFiles } : f);
    saveFoldersToStorage(updated);
    setSelectedFile(prev => prev ? { ...prev, content: textEditorContent } : null);
    playSuccess();
  };

  // Zip compression simulation
  const compressFolderToZip = (folder: FolderConfig) => {
    playClick();
    const dataStr = JSON.stringify(folder);
    const blob = new Blob([dataStr], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infinity_${folder.name.toLowerCase().replace(/\s+/g, '_')}_package.zip`;
    a.click();
    playSuccess();
  };

  // Filter & sort list of folders
  const getFilteredFolders = () => {
    return folders.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.path.toLowerCase().includes(searchQuery.toLowerCase());
      if (categoryFilter === 'pinned') return f.isPinned && matchSearch;
      if (categoryFilter === 'favorites') return f.isFavorite && matchSearch;
      return matchSearch;
    }).sort((a, b) => {
      if (sortingOption === 'size') {
        const sizeA = a.files.reduce((acc, f) => acc + f.sizeMB, 0);
        const sizeB = b.files.reduce((acc, f) => acc + f.sizeMB, 0);
        return sizeB - sizeA;
      }
      if (sortingOption === 'count') {
        return b.files.length - a.files.length;
      }
      return a.name.localeCompare(b.name);
    });
  };

  // Dynamic system variables for Performance monitor
  const [perfMetrics, setPerfMetrics] = useState({ cpu: 14, ram: 2.15, gpu: 32, fps: 90 });
  useEffect(() => {
    const t = setInterval(() => {
      setPerfMetrics({
        cpu: Math.floor(Math.random() * 12 + 8),
        ram: parseFloat((2.1 + Math.random() * 0.1).toFixed(2)),
        gpu: Math.floor(Math.random() * 10 + 25),
        fps: Math.floor(Math.random() * 5 + 88)
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Online Mods list for 1-click install simulation
  const ONLINE_CATALOG = [
    { name: 'nuclear_plasma.js', desc: 'Adds advanced fusion plasma cannons.', ver: '1.0.0', aut: 'AtomicDev', size: 1.5, type: 'mod' },
    { name: 'tesla_roadster.json', desc: 'In-game driveable electric hypercar model.', ver: '1.5.0', aut: 'ElonFan', size: 3.1, type: 'mod' },
    { name: 'aura_vocal_boost.wav', desc: 'Extended spatial voice dataset for AURA.', ver: '4.0.0', aut: 'WhisperSpeech', size: 8.9, type: 'audio' },
    { name: 'cyber_bot_combat.js', desc: 'Enables advanced combat mode in bot arenas.', ver: '2.0.1', aut: 'MechanoidCorp', size: 1.1, type: 'mod' }
  ];

  const installOnlineMod = (mod: any) => {
    const targetFolder = folders.find(f => f.path === '/ModsStore/');
    if (!targetFolder) return;
    const isInstalled = targetFolder.files.some(f => f.name === mod.name);
    if (isInstalled) {
      alert('This component is already installed in the workspace!');
      return;
    }
    const newFile: VirtualFile = {
      name: mod.name,
      type: mod.type,
      content: `// Automated installer bundle\n// ${mod.desc}\nexport const mod_meta = ${JSON.stringify(mod, null, 2)};`,
      sizeMB: mod.size,
      version: mod.ver,
      author: mod.aut,
      enabled: true
    };
    const updated = folders.map(f => f.path === '/ModsStore/' ? { ...f, files: [...f.files, newFile] } : f);
    saveFoldersToStorage(updated);
    playSuccess();
  };

  // Toggle active mod state
  const toggleModEnabled = (fileName: string) => {
    const modsFolder = folders.find(f => f.path === '/ModsStore/');
    if (!modsFolder) return;
    const updatedFiles = modsFolder.files.map(f => f.name === fileName ? { ...f, enabled: !f.enabled } : f);
    const updated = folders.map(f => f.path === '/ModsStore/' ? { ...f, files: updatedFiles } : f);
    saveFoldersToStorage(updated);
    playClick();
  };

  // Drag and drop simulator area ref
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!selectedFolder) return;
    
    // Simulate drop installation of mod or asset
    const newFile: VirtualFile = {
      name: `dropped_payload_${Math.floor(Math.random() * 900 + 100)}.js`,
      type: 'mod',
      content: '// Package successfully extracted from local drag-and-drop array.',
      sizeMB: 1.8,
      version: '1.0.0',
      author: 'LocalUploader',
      enabled: true
    };

    const updated = folders.map(f => f.path === selectedFolder.path ? { ...f, files: [...f.files, newFile] } : f);
    saveFoldersToStorage(updated);
    playSuccess();
  };

  // Android 16 OS Loader Simulator States
  const [androidBootState, setAndroidBootState] = useState<'offline' | 'booting' | 'online' | 'app'>('offline');
  const [androidLogs, setAndroidLogs] = useState<string[]>([]);
  const [adbInput, setAdbInput] = useState('');
  const [installedAPKs, setInstalledAPKs] = useState<string[]>(['com.android.settings', 'com.android.vending']);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const startAndroid16Hypervisor = () => {
    if (androidBootState !== 'offline') return;
    setAndroidBootState('booting');
    setAndroidLogs([]);
    playClick();

    const sequence = [
      'Initializing Antigravity hypervisor context on port 3000...',
      'Mapping virtual device system partitions (API Level 36, Android 16)...',
      'Mounting /system_ext, /product, /vendor image files...',
      'Starting Dalvik / ART Virtual Machine with 2.0GB heap...',
      'SurfaceFlinger compositing hardware layer: OK.',
      'Android 16 BootCompleted: Launcher starting!'
    ];

    sequence.forEach((log, idx) => {
      setTimeout(() => {
        setAndroidLogs(prev => [...prev, log]);
        if (idx === sequence.length - 1) {
          setAndroidBootState('online');
          playSuccess();
        }
      }, (idx + 1) * 800);
    });
  };

  const handleAdbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adbInput.trim()) return;
    const cmd = adbInput.trim();
    setAdbInput('');
    setAndroidLogs(p => [...p, `$ ${cmd}`]);
    playClick();

    setTimeout(() => {
      let response = 'Command not found. Try: "adb shell getprop", "pm list packages", "uname -a"';
      if (cmd.includes('getprop')) {
        response = '[ro.build.version.release]: 16\n[ro.build.version.sdk]: 36\n[ro.product.model]: Infinity-Hypervisor-A16';
      } else if (cmd.includes('list packages') || cmd === 'pm list') {
        response = installedAPKs.map(pkg => `package:${pkg}`).join('\n');
      } else if (cmd.includes('uname')) {
        response = 'Linux version 6.6.15-android16-antigravity-g9b75c9-95 (gcc version 14.1.0)';
      } else if (cmd.includes('pm install')) {
        response = 'Success. Installed package custom_payload.apk';
      } else if (cmd === 'clear') {
        setAndroidLogs([]);
        return;
      }
      setAndroidLogs(p => [...p, response]);
    }, 200);
  };

  const installApkOnAndroid16 = (fileName: string) => {
    if (androidBootState !== 'online') {
      alert('Boot the Android 16 VM first before installing APK packages!');
      return;
    }
    playSuccess();
    const pkgName = `com.academy.mod.${fileName.replace(/\./g, '_')}`;
    setInstalledAPKs(prev => [...prev, pkgName]);
    setAndroidLogs(p => [...p, `[ADB] Package installed: ${pkgName}`]);
  };

  // Total Storage capacity usage
  const totalUsedSize = folders.reduce((acc, f) => acc + f.files.reduce((fAcc, file) => fAcc + file.sizeMB, 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-none">
      
      {/* Dynamic Context Menu Color and Icon Picker */}
      {contextMenu && (
        <div 
          className="fixed z-[250] bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl w-60"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 340), left: Math.min(contextMenu.x, window.innerWidth - 260) }}
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Folder customizer</span>
            <button onClick={() => setContextMenu(null)} className="text-zinc-500 hover:text-white">
              <X size={12} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Change Accent Theme</span>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(COLOR_THEMES).map(([colorId, cfg]) => (
                  <button 
                    key={colorId}
                    onClick={() => changeFolderColor(colorId)}
                    className={`w-full py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${cfg.bg} ${cfg.border} ${cfg.text}`}
                  >
                    {colorId}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Change Folder Icon</span>
              <div className="grid grid-cols-5 gap-1.5">
                {ICON_LIST.map(({ id, Icon }) => (
                  <button 
                    key={id}
                    onClick={() => changeFolderIcon(id)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-zinc-400 hover:text-cyan-400 flex items-center justify-center cursor-pointer transition-all"
                    title={id}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
              <button 
                onClick={() => { togglePin(contextMenu.targetFolder); setContextMenu(null); }}
                className="w-full text-left px-2 py-1.5 text-[9px] font-black text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 uppercase cursor-pointer"
              >
                <Pin size={11} className="text-cyan-400" /> Toggle Pin Pin
              </button>
              <button 
                onClick={() => { toggleFavorite(contextMenu.targetFolder); setContextMenu(null); }}
                className="w-full text-left px-2 py-1.5 text-[9px] font-black text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 uppercase cursor-pointer"
              >
                <Star size={11} className="text-amber-400" /> Toggle Favorite
              </button>
              <button 
                onClick={() => {
                  const target = folders.find(f => f.path === contextMenu.targetFolder);
                  if (target) compressFolderToZip(target);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2 py-1.5 text-[9px] font-black text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 uppercase cursor-pointer"
              >
                <Archive size={11} className="text-purple-400" /> Compress to ZIP
              </button>
              <button 
                onClick={() => { deleteFolder(contextMenu.targetFolder); setContextMenu(null); }}
                className="w-full text-left px-2 py-1.5 text-[9px] font-black text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 uppercase cursor-pointer"
              >
                <Trash size={11} /> Delete Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Layout Container */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* PANEL 1: ADVANCED FOLDER TREE DISCOVERY */}
        <div className="col-span-4 bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
              <FolderKanban size={14} />
              WORKSPACE DIRECTORIES
            </span>
            <button 
              onClick={() => { playClick(); setShowNewFolderModal(true); }}
              className="text-[9px] font-black bg-cyan-500 text-zinc-950 px-2.5 py-1 rounded-lg uppercase tracking-wider hover:bg-cyan-400 transition-all cursor-pointer"
            >
              + Create Folder
            </button>
          </div>

          {/* Search, filters, sort */}
          <div className="space-y-3 mb-4">
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="SEARCH ALL 40+ DIRECTORIES..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-400"
            />

            <div className="flex justify-between items-center gap-1.5">
              <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                {(['all', 'pinned', 'favorites'] as const).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { playClick(); setCategoryFilter(cat); }}
                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${
                      categoryFilter === cat ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <select 
                value={sortingOption} 
                onChange={(e) => { playClick(); setSortingOption(e.target.value as any); }}
                className="bg-transparent text-[9px] font-black uppercase text-cyan-400 border-none outline-none cursor-pointer"
              >
                <option value="name" className="bg-zinc-950 text-white">Sort by Name</option>
                <option value="size" className="bg-zinc-950 text-white">Sort by Size</option>
                <option value="count" className="bg-zinc-950 text-white">Sort by Count</option>
              </select>
            </div>
          </div>

          {/* Directories Grid - Programmatically generated */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {getFilteredFolders().map((folder) => {
              const theme = COLOR_THEMES[folder.color] || COLOR_THEMES.cyan;
              const isSelected = selectedFolder?.path === folder.path;
              const IconComp = ICON_LIST.find(i => i.id === folder.icon)?.Icon || Folder;

              const totalSize = folder.files.reduce((acc, f) => acc + f.sizeMB, 0).toFixed(1);

              return (
                <div 
                  key={folder.path}
                  onClick={() => { playClick(); setSelectedFolder(folder); }}
                  onContextMenu={(e) => handleFolderContextMenu(e, folder.path)}
                  className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group ${
                    isSelected 
                      ? `${theme.border} ${theme.bg} ${theme.glow}` 
                      : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
                      <IconComp size={16} className={folder.path === '/ModsStore/' ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black uppercase tracking-wide ${isSelected ? 'text-white font-extrabold' : 'text-zinc-300'}`}>
                          {folder.name}
                        </span>
                        {folder.isPinned && <Pin size={10} className="text-cyan-400 shrink-0" />}
                        {folder.isFavorite && <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[8px] text-zinc-500 font-mono block uppercase mt-0.5">{folder.path}</span>
                    </div>
                  </div>

                  <div className="text-right text-[9px] font-mono text-zinc-500 flex flex-col items-end">
                    <span className="font-bold text-zinc-400">{folder.files.length} FILES</span>
                    <span>{totalSize} MB</span>
                  </div>

                  {/* Neon overlay for system Mods Store folder */}
                  {folder.path === '/ModsStore/' && (
                    <div className="absolute inset-0 border border-fuchsia-500/30 rounded-2xl pointer-events-none animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats block */}
          <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-3">
            <span>FILESYSTEM SIZE: {totalUsedSize.toFixed(1)} MB</span>
            <span>41 DIRECTORIES ACTIVE</span>
          </div>

        </div>

        {/* PANEL 2: INTERACTIVE FILES CONTAINER & MODS CATALOG */}
        <div className="col-span-5 bg-black/30 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          {selectedFolder ? (
            <>
              {/* Folder Context Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                    {selectedFolder.name} Workspace
                  </h4>
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase mt-0.5">{selectedFolder.path}</span>
                </div>

                <div className="flex gap-1.5">
                  <button 
                    onClick={() => addVirtualFile('text', 'script_payload')}
                    className="text-[8px] font-black border border-white/10 hover:border-cyan-400 px-2 py-1 rounded bg-zinc-900 text-zinc-300 hover:text-white uppercase cursor-pointer"
                  >
                    + Add File
                  </button>
                  {clipboardFile && (
                    <button 
                      onClick={pasteFile}
                      className="text-[8px] font-black bg-cyan-400 text-black px-2 py-1 rounded uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Clipboard size={10} /> Paste
                    </button>
                  )}
                </div>
              </div>

              {/* Special Mods Store Mod Loader Hub View (Only shown if Mods Store active) */}
              {selectedFolder.path === '/ModsStore/' && (
                <div className="bg-zinc-950/80 border border-fuchsia-500/20 rounded-2xl p-4 mb-4 space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 animate-bounce" />
                      SYSTEM MODS LOADER ENGINE
                    </span>

                    <div className="flex gap-1.5">
                      {onMinecraftImportClick && (
                        <button 
                          onClick={() => {
                            try { soundService.playSFX('ui_click'); } catch (e) {}
                            onMinecraftImportClick();
                          }}
                          className="text-[8px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-black px-2 py-0.5 rounded uppercase flex items-center gap-1 hover:brightness-110 transition-all cursor-pointer"
                        >
                          🌾 Import Minecraft Pack
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          playSuccess();
                          const mods = selectedFolder.files.map(f => ({ ...f, enabled: true }));
                          const updated = folders.map(f => f.path === '/ModsStore/' ? { ...f, files: mods } : f);
                          saveFoldersToStorage(updated);
                        }}
                        className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded uppercase"
                      >
                        Enable All
                      </button>
                      <button 
                        onClick={() => {
                          playClick();
                          const mods = selectedFolder.files.map(f => ({ ...f, enabled: false }));
                          const updated = folders.map(f => f.path === '/ModsStore/' ? { ...f, files: mods } : f);
                          saveFoldersToStorage(updated);
                        }}
                        className="text-[8px] font-black bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded uppercase"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>

                  {/* Mod Loader Dashboard Metrics */}
                  <div className="grid grid-cols-12 gap-3 text-center">
                    <div className="col-span-4 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-[14px] font-black text-white font-mono">
                        {selectedFolder.files.filter(f => f.enabled).length}
                      </div>
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">ENABLED MODS</div>
                    </div>
                    <div className="col-span-4 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-[14px] font-black text-amber-400 font-mono">1</div>
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">CONFLICT ALERT</div>
                    </div>
                    <div className="col-span-4 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-[14px] font-black text-emerald-400 font-mono">100%</div>
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">STARTUP LOAD</div>
                    </div>
                  </div>

                  {/* Conflict detection alert */}
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] rounded-xl leading-relaxed flex justify-between items-center uppercase">
                    <span>⚡ CONFLICT DETECTED: RTX HD Bloom overlaps with Shaders pack configurations.</span>
                    <button 
                      onClick={() => {
                        playSuccess();
                        alert('Conflict successfully resolved. Incompatible routing hooks patched!');
                      }}
                      className="px-2 py-1 bg-amber-500 text-black font-black rounded uppercase text-[8px]"
                    >
                      Resolve Conflict
                    </button>
                  </div>
                </div>
              )}

              {/* Drag and Drop Simulator Area */}
              <div 
                ref={dropRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar relative rounded-2xl p-2 transition-all ${
                  isDragOver ? 'bg-cyan-500/10 border-2 border-dashed border-cyan-400/50' : 'bg-transparent'
                }`}
              >
                {isDragOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-cyan-400 pointer-events-none z-10 bg-black/80 rounded-2xl">
                    <Upload size={36} className="animate-bounce mb-2" />
                    <span className="text-xs font-black uppercase tracking-wider">DRAG FILES HERE TO INSTANTLY INSTALL</span>
                  </div>
                )}

                {selectedFolder.files.length === 0 ? (
                  <div className="h-44 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center text-zinc-500">
                    <Folder size={24} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Folder is Empty</span>
                    <span className="text-[8px] uppercase mt-1">Drag and drop assets here, or create a file above.</span>
                  </div>
                ) : (
                  selectedFolder.files.map((file) => (
                    <div 
                      key={file.name}
                      onClick={() => openFileInEditor(file)}
                      className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                        selectedFile?.name === file.name 
                          ? 'bg-white/10 border-white/20' 
                          : 'bg-zinc-900/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={14} className="text-zinc-400" />
                        <div>
                          <span className="text-xs font-mono font-bold text-zinc-100">{file.name}</span>
                          <div className="flex items-center gap-2 text-[8px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">
                            <span>{file.sizeMB} MB</span>
                            {file.author && <span>BY: {file.author}</span>}
                            {file.version && <span>V{file.version}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Enabled Switch ONLY for Mods */}
                        {selectedFolder.path === '/ModsStore/' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleModEnabled(file.name); }}
                            className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${
                              file.enabled 
                                ? 'bg-fuchsia-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.3)]' 
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {file.enabled ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        )}

                        <button 
                          onClick={(e) => { e.stopPropagation(); copyFile(file); }}
                          title="Copy file"
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <Clipboard size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }}
                          title="Delete file"
                          className="p-1.5 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                        >
                          <Trash size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 border border-dashed border-white/5 rounded-3xl">
              <Folder size={48} className="text-zinc-600 mb-4 animate-pulse" />
              <h4 className="text-sm font-black uppercase text-zinc-400 tracking-wider">Select a directory</h4>
              <p className="text-xs max-w-sm mt-2 leading-relaxed uppercase">
                Choose a directory folder to inspect its in-game source files.
              </p>
            </div>
          )}

          {/* Online mods catalog panel (Included at bottom of Files block) */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-3.5">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block pb-1 border-b border-white/5">
              🚀 1-CLICK INSTANT ONLINE COMPONENT CATALOG
            </span>

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {ONLINE_CATALOG.map((mod) => (
                <div key={mod.name} className="p-2 bg-zinc-950/80 border border-white/5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-200 block">{mod.name}</span>
                    <span className="text-[8px] text-zinc-500 uppercase mt-0.5 block leading-relaxed">{mod.desc}</span>
                  </div>

                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-mono text-zinc-500">{mod.size}MB</span>
                    <button 
                      onClick={() => installOnlineMod(mod)}
                      className="text-[8px] font-black bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-2 py-0.5 rounded uppercase"
                    >
                      Install File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* PANEL 3: CODE FILE INSPECTOR EDITOR & ANDROID 16 HYPERVISOR */}
        <div className="col-span-3 bg-zinc-950/90 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          {selectedFile ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} className="text-cyan-400" />
                  <span className="text-[10px] font-mono text-zinc-300 font-bold max-w-[120px] truncate">
                    {selectedFile.name}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button onClick={handleUndo} className="p-1 bg-white/5 rounded text-zinc-400 hover:text-white">
                    <RotateCcw size={10} />
                  </button>
                  <button onClick={saveFileContent} className="px-2 py-0.5 bg-cyan-500 text-zinc-950 font-black text-[8px] rounded uppercase">
                    Save
                  </button>
                </div>
              </div>

              {/* In-editor display */}
              {selectedFile.type === 'image' ? (
                <div className="flex-1 bg-black rounded-2xl overflow-hidden flex items-center justify-center p-4">
                  <img src={selectedFile.content} referrerPolicy="no-referrer" className="max-h-40 rounded border border-white/10" alt="Capture Preview" />
                </div>
              ) : selectedFile.type === 'audio' ? (
                <div className="flex-1 bg-black rounded-2xl p-4 flex flex-col justify-center items-center space-y-4">
                  <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-400">
                    <Mic size={24} className="animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Simulated Audio Stream Visualizer</span>
                  
                  {/* Visualizer bars */}
                  <div className="flex items-end gap-1 h-12 justify-center w-full px-4">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-cyan-500 rounded-full animate-pulse" 
                        style={{ height: `${Math.floor(Math.random() * 80 + 20)}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase text-zinc-200 rounded-lg">Play Audio</button>
                    <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase text-zinc-200 rounded-lg">Stop</button>
                  </div>
                </div>
              ) : (
                <textarea 
                  value={textEditorContent}
                  onChange={e => handleEditorChange(e.target.value)}
                  className="flex-1 bg-black/80 rounded-2xl border border-white/5 p-3.5 font-mono text-[10px] leading-relaxed text-zinc-300 outline-none resize-none"
                />
              )}

              {/* Install package APK block */}
              {selectedFile.name.endsWith('.apk') && (
                <button 
                  onClick={() => installApkOnAndroid16(selectedFile.name)}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg cursor-pointer"
                >
                  🚀 Deploy APK to Android 16 Container
                </button>
              )}
            </div>
          ) : (
            /* ANDROID 16 HYPERVISOR VM LOADER SCREEN */
            <div className="flex-1 flex flex-col min-h-0 bg-black/60 rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-3 bg-zinc-900 border-b border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Smartphone size={13} />
                  Android 16 Emulator VM
                </span>

                <span className="text-[8px] font-mono text-zinc-500">API 36 HYPERVISOR</span>
              </div>

              {/* Boot screen simulator viewport */}
              <div className="flex-1 bg-black p-4 flex flex-col justify-between font-mono text-[9px] leading-relaxed relative overflow-hidden min-h-0">
                {androidBootState === 'offline' ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="p-4 bg-zinc-900 border border-white/10 rounded-2xl">
                      <Smartphone size={32} className="text-zinc-600" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-white uppercase tracking-wider">Android 16 Hypervisor Offline</h5>
                      <p className="text-[8px] text-zinc-500 mt-1 uppercase max-w-[200px] leading-relaxed mx-auto">
                        Simulate booting the newest Android 16 system kernel to load .apk or project files.
                      </p>
                    </div>

                    <button 
                      onClick={startAndroid16Hypervisor}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      ⚡ BOOT ANDROID 16 VM
                    </button>
                  </div>
                ) : androidBootState === 'booting' ? (
                  <div className="flex-1 flex flex-col justify-end text-cyan-400 space-y-1">
                    {androidLogs.map((log, lIdx) => (
                      <div key={lIdx} className="animate-pulse">{log}</div>
                    ))}
                    <div className="pt-4 flex items-center gap-2">
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Booting Kernel v6.6.15...</span>
                    </div>
                  </div>
                ) : (
                  /* Launcher viewport */
                  <div className="flex-1 flex flex-col justify-between select-none">
                    {/* Top status bar */}
                    <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 px-1 border-b border-white/5 pb-1 mb-2">
                      <span>10:42 AM</span>
                      <span className="text-emerald-400">● 5G CELLULAR (A16)</span>
                    </div>

                    {/* Apps screen */}
                    <div className="flex-1 grid grid-cols-3 gap-2 p-1 text-center">
                      <div 
                        onClick={() => { playClick(); alert('A.U.R.A Mobile Hub launched successfully!'); }}
                        className="bg-zinc-900 border border-white/5 hover:border-cyan-400 p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1"
                      >
                        <Bot size={16} className="text-cyan-400" />
                        <span className="text-[8px] font-bold text-zinc-300">AURA Client</span>
                      </div>

                      <div 
                        onClick={() => { playClick(); alert('Opening Google Play Dev Console...'); }}
                        className="bg-zinc-900 border border-white/5 hover:border-fuchsia-400 p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1"
                      >
                        <HardDrive size={16} className="text-fuchsia-400" />
                        <span className="text-[8px] font-bold text-zinc-300">File Storage</span>
                      </div>

                      <div 
                        onClick={() => { playClick(); alert('VROSEngine Core initialized in simulated VR Viewport!'); }}
                        className="bg-zinc-900 border border-white/5 hover:border-amber-400 p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-1"
                      >
                        <Smartphone size={16} className="text-amber-400" />
                        <span className="text-[8px] font-bold text-zinc-300">VR Engine</span>
                      </div>
                    </div>

                    {/* Terminal / Shell view inside Hypervisor */}
                    <div className="bg-zinc-950 border border-white/5 rounded-xl p-2.5 space-y-1.5 h-36 overflow-y-auto custom-scrollbar font-mono text-[8px] mt-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-zinc-500 uppercase font-bold tracking-widest block border-b border-white/5 pb-0.5">ADB Interactive Shell</span>
                        <div className="text-emerald-400 leading-normal max-h-24 overflow-y-auto">
                          {androidLogs.slice(-4).map((log, logIdx) => (
                            <div key={logIdx}>{log}</div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleAdbSubmit} className="flex gap-1 items-center border-t border-white/5 pt-1.5">
                        <span className="text-zinc-500">$</span>
                        <input 
                          type="text" 
                          value={adbInput}
                          onChange={e => setAdbInput(e.target.value)}
                          placeholder="Type command: uname, getprop, pm..."
                          className="flex-1 bg-transparent border-none text-zinc-200 outline-none"
                        />
                      </form>
                    </div>

                    <button 
                      onClick={() => setAndroidBootState('offline')}
                      className="mt-2 text-center text-red-400 hover:underline uppercase text-[8px] font-black"
                    >
                      Shutdown Hypervisor
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick diagnostics bar */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block pb-1 border-b border-white/5">
              💻 CORE HYPERVISOR PERFORMANCE
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-[8px] font-mono text-zinc-500">
              <div className="bg-white/5 p-1 rounded">
                <span className="text-zinc-300 font-bold block">{perfMetrics.cpu}%</span>
                <span>CPU</span>
              </div>
              <div className="bg-white/5 p-1 rounded">
                <span className="text-zinc-300 font-bold block">{perfMetrics.ram}GB</span>
                <span>RAM</span>
              </div>
              <div className="bg-white/5 p-1 rounded">
                <span className="text-zinc-300 font-bold block">{perfMetrics.gpu}°C</span>
                <span>GPU</span>
              </div>
              <div className="bg-white/5 p-1 rounded">
                <span className="text-emerald-400 font-bold block">{perfMetrics.fps}hz</span>
                <span>FPS</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* New Folder Creation Dialog Popup Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-zinc-950 border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Create New Workspace Folder</span>
              <button onClick={() => setShowNewFolderModal(false)} className="text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Folder Name</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g. Cinematic Cameras"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-black uppercase text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Color Accent</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(COLOR_THEMES).map(([colorId, cfg]) => (
                    <button 
                      key={colorId}
                      type="button"
                      onClick={() => setNewFolderColor(colorId)}
                      className={`py-1 rounded border text-[8px] font-bold uppercase ${cfg.bg} ${cfg.border} ${cfg.text} ${
                        newFolderColor === colorId ? 'ring-1 ring-white/40' : ''
                      }`}
                    >
                      {colorId}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button 
                  onClick={() => setShowNewFolderModal(false)}
                  className="text-[9px] font-black text-zinc-500 uppercase tracking-wider px-3 py-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={createCustomFolder}
                  className="text-[9px] font-black bg-cyan-500 text-zinc-950 px-4 py-2 rounded-xl uppercase tracking-wider"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
