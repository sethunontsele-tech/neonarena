import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FolderPlus, FolderOpen, Search, Sparkles, Cpu, Zap, Play, Package,
  Archive, RefreshCw, Trash2, Star, Edit3, X, Layers, Shield, Filter, CheckCircle2,
  AlertTriangle, Terminal, Download, FileText, Code, Gamepad2, Wrench, Bot, Film,
  Grid, List, Info, ArrowUpRight, HardDrive, Database, UploadCloud, ChevronRight,
  ChevronDown, Maximize2, Box, Check, Copy, BookOpen, Compass, Eye, Settings,
  Activity, FileJson, Hash, Workflow, Sliders, Plus, Radio, ShieldAlert
} from 'lucide-react';
import { soundService } from '../services/soundService';

// ---------------------------------------------------------------------------
// TYPES & INTERFACES (NEON ARENA ECOSYSTEM)
// ---------------------------------------------------------------------------

export interface LoadedApp {
  id: string;
  name: string; // Entity Folder Container Name (e.g. Tactical_Radar_HUD)
  folderPath: string; // Full container path e.g. /NeonArena/Apps/Neon_Apps/Tactical_Radar_HUD/
  path: string; // Primary executable or manifest path inside folder
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
  dependencies?: string[];
  tags?: string[];
  subFiles: string[]; // List of files contained inside this entity folder
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

export interface RegistryEntry {
  id: string;
  type: string;
  path: string;
  display_name: string;
  version: string;
  dependencies: string[];
  tags: string[];
  author?: string;
  checksum?: string;
}

export interface EcosystemFolderNode {
  name: string;
  path: string;
  description: string;
  subfolders?: Record<string, EcosystemFolderNode>;
  entities?: RegistryEntry[];
}

const STORAGE_KEY = 'NEON_ARENA_LOADED_FOLDERS_V6';
const REGISTRY_STORAGE_KEY = 'NEON_ARENA_REGISTRIES_V6';

// ---------------------------------------------------------------------------
// DEFAULT TOP-LEVEL NEON ARENA ECOSYSTEM TREE STRUCTURE
// ---------------------------------------------------------------------------

const ECOSYSTEM_TOP_LEVEL_TREE: Record<string, EcosystemFolderNode> = {
  Characters: {
    name: 'Characters',
    path: '/NeonArena/Characters/',
    description: 'Player models, NPCs, Bosses, Agent Q system, and Kaidon Universe entities',
    subfolders: {
      Player: { name: 'Player', path: '/NeonArena/Characters/Player/', description: 'Hero character models and rigs' },
      NPCs: { name: 'NPCs', path: '/NeonArena/Characters/NPCs/', description: 'Interactive arena inhabitants & dialogue trees' },
      Enemies: { name: 'Enemies', path: '/NeonArena/Characters/Enemies/', description: 'Standard arena targets and cyber drones' },
      Bosses: { name: 'Bosses', path: '/NeonArena/Characters/Bosses/', description: 'Raid-tier bosses (e.g. Voltharn The Arc Sovereign)' },
      Agent_Q_System: { name: 'Agent_Q_System', path: '/NeonArena/Characters/Agent_Q_System/', description: 'Autonomous agent AI characters and neural profiles' },
      Kaidon_Universe: { name: 'Kaidon_Universe', path: '/NeonArena/Characters/Kaidon_Universe/', description: 'Lore characters from Kaidon prime timeline' },
      Character_Data: { name: 'Character_Data', path: '/NeonArena/Characters/Character_Data/', description: 'Base stats, hitboxes, and collision capsules' },
      Animations: { name: 'Animations', path: '/NeonArena/Characters/Animations/', description: 'Shared skeletal animation rigs and locomotion graphs' },
      Abilities: { name: 'Abilities', path: '/NeonArena/Characters/Abilities/', description: 'Active & passive ability scripts and config packages' }
    }
  },
  Education_Mode: {
    name: 'Education_Mode',
    path: '/NeonArena/Education_Mode/',
    description: 'STEM & Coding learning modules, interactive worlds, and quizzes',
    subfolders: {
      Lessons: { name: 'Lessons', path: '/NeonArena/Education_Mode/Lessons/', description: 'Structured programming and physics lesson modules' },
      Tutorials: { name: 'Tutorials', path: '/NeonArena/Education_Mode/Tutorials/', description: 'Step-by-step interactive engine guides' },
      Learning_Worlds: { name: 'Learning_Worlds', path: '/NeonArena/Education_Mode/Learning_Worlds/', description: 'Interactive 3D sandbox classrooms' },
      Quizzes: { name: 'Quizzes', path: '/NeonArena/Education_Mode/Quizzes/', description: 'Assessment modules & automated test suites' },
      Progress_System: { name: 'Progress_System', path: '/NeonArena/Education_Mode/Progress_System/', description: 'Student XP, mastery tracking, and badges' }
    }
  },
  Maps: {
    name: 'Maps',
    path: '/NeonArena/Maps/',
    description: '3D Arenas, level geometry, terrain biomes, and custom map packs',
    subfolders: {
      Worlds: { name: 'Worlds', path: '/NeonArena/Maps/Worlds/', description: 'Seamless open world environments' },
      Levels: { name: 'Levels', path: '/NeonArena/Maps/Levels/', description: 'Competitive tactical arena maps' },
      Biomes: { name: 'Biomes', path: '/NeonArena/Maps/Biomes/', description: 'Environmental themes (Cyberpunk, Neon City, Volcanic)' },
      Custom_Maps: { name: 'Custom_Maps', path: '/NeonArena/Maps/Custom_Maps/', description: 'Community & player created map folders' },
      Map_Packs: { name: 'Map_Packs', path: '/NeonArena/Maps/Map_Packs/', description: 'Bundled map extensions and campaign packs' },
      Map_Data: { name: 'Map_Data', path: '/NeonArena/Maps/Map_Data/', description: 'Navmeshes, occlusion grids, and lightmap cache' }
    }
  },
  Mods: {
    name: 'Mods',
    path: '/NeonArena/Mods/',
    description: 'Sandboxed mod loader packages, community extensions, and creator tools',
    subfolders: {
      Mod_Loader: { name: 'Mod_Loader', path: '/NeonArena/Mods/Mod_Loader/', description: 'Sandboxed C# runtime mod loader core' },
      Installed_Mods: { name: 'Installed_Mods', path: '/NeonArena/Mods/Installed_Mods/', description: 'Active mod directories with isolated manifests' },
      Mod_Creator: { name: 'Mod_Creator', path: '/NeonArena/Mods/Mod_Creator/', description: 'In-engine mod builder templates and compilers' },
      Mod_Data: { name: 'Mod_Data', path: '/NeonArena/Mods/Mod_Data/', description: 'Mod state persistence and key-value storage' }
    }
  },
  Apps: {
    name: 'Apps',
    path: '/NeonArena/Apps/',
    description: 'Standalone arena utilities, mini-apps, WebVR tools, and calculators',
    subfolders: {
      Neon_Apps: { name: 'Neon_Apps', path: '/NeonArena/Apps/Neon_Apps/', description: 'Primary desktop-class apps within Neon Arena' },
      VR_Apps: { name: 'VR_Apps', path: '/NeonArena/Apps/VR_Apps/', description: 'Spatial computing and WebXR applications' },
      Tools: { name: 'Tools', path: '/NeonArena/Apps/Tools/', description: 'Tactical HUD, telemetry, and network tools' },
      Mini_Apps: { name: 'Mini_Apps', path: '/NeonArena/Apps/Mini_Apps/', description: 'Lightweight single-purpose utilities (Neon Clock, Calculators)' }
    }
  },
  UI: {
    name: 'UI',
    path: '/NeonArena/UI/',
    description: 'Interface screens, layouts, theme assets, and Folder Browser controls',
    subfolders: {
      Main_Menu: { name: 'Main_Menu', path: '/NeonArena/UI/Main_Menu/', description: 'Title screen, lobby, and mode select screens' },
      HUD: { name: 'HUD', path: '/NeonArena/UI/HUD/', description: 'Tactical heads-up display and health meters' },
      Inventory: { name: 'Inventory', path: '/NeonArena/UI/Inventory/', description: 'Grid layout inventory and loadout pickers' },
      Settings: { name: 'Settings', path: '/NeonArena/UI/Settings/', description: 'Graphics, audio, and controller config UI' },
      Map_Interface: { name: 'Map_Interface', path: '/NeonArena/UI/Map_Interface/', description: 'Minimap overlays and map selector screens' },
      Character_Interface: { name: 'Character_Interface', path: '/NeonArena/UI/Character_Interface/', description: 'Dossier, skill tree, and cosmetic customization UI' },
      Mod_Interface: { name: 'Mod_Interface', path: '/NeonArena/UI/Mod_Interface/', description: 'Mod manager & workshop browsing overlay' },
      Folder_Browser: { name: 'Folder_Browser', path: '/NeonArena/UI/Folder_Browser/', description: 'In-engine filesystem tree view and search indexer' }
    }
  },
  Systems: {
    name: 'Systems',
    path: '/NeonArena/Systems/',
    description: 'Core engine modules (AI, Physics, Combat, Save, Loading, World, Multiplayer)',
    subfolders: {
      AI: { name: 'AI', path: '/NeonArena/Systems/AI/', description: 'Behavior trees, pathfinding, and bot decision matrix' },
      Physics: { name: 'Physics', path: '/NeonArena/Systems/Physics/', description: 'Rigid body simulation and ballistic hitboxes' },
      Combat: { name: 'Combat', path: '/NeonArena/Systems/Combat/', description: 'Weapon stats, projectile tracking, and damage calculations' },
      Inventory_System: { name: 'Inventory_System', path: '/NeonArena/Systems/Inventory_System/', description: 'Item registries and weight/slot management' },
      Save_System: { name: 'Save_System', path: '/NeonArena/Systems/Save_System/', description: 'JSON state serialization and cloud sync manager' },
      Loading_System: { name: 'Loading_System', path: '/NeonArena/Systems/Loading_System/', description: 'DynamicLoader, AssetStreamer, and DependencyResolver' },
      World_System: { name: 'World_System', path: '/NeonArena/Systems/World_System/', description: 'FolderScanner, ChangeWatcher, and Chunk Manager' },
      Multiplayer: { name: 'Multiplayer', path: '/NeonArena/Systems/Multiplayer/', description: 'Websocket synchronization and network state replication' }
    }
  },
  Assets: {
    name: 'Assets',
    path: '/NeonArena/Assets/',
    description: 'Shared 3D models, textures, audio soundscapes, particle effects',
    subfolders: {
      Models: { name: 'Models', path: '/NeonArena/Assets/Models/', description: '3D OBJ/FBX meshes and prefab geometries' },
      Textures: { name: 'Textures', path: '/NeonArena/Assets/Textures/', description: 'Albedo, normal, and emissive texture maps' },
      Sounds: { name: 'Sounds', path: '/NeonArena/Assets/Sounds/', description: 'SFX libraries and spatial audio triggers' },
      Music: { name: 'Music', path: '/NeonArena/Assets/Music/', description: 'Adaptive synthwave soundtrack tracks' },
      Effects: { name: 'Effects', path: '/NeonArena/Assets/Effects/', description: 'VFX shaders, bloom profiles, and particle systems' },
      Animations: { name: 'Animations', path: '/NeonArena/Assets/Animations/', description: 'Keyframe tracks and blend tree parameters' }
    }
  },
  Data: {
    name: 'Data',
    path: '/NeonArena/Data/',
    description: 'JSON configurations, databases, and registry indexes',
    subfolders: {
      JSON: { name: 'JSON', path: '/NeonArena/Data/JSON/', description: 'Structured items, blocks, recipes, and quest tables' },
      Configs: { name: 'Configs', path: '/NeonArena/Data/Configs/', description: 'Engine runtime configurations and graphics presets' },
      Databases: { name: 'Databases', path: '/NeonArena/Data/Databases/', description: 'Local SQLite/key-value storage caches' },
      Registries: { name: 'Registries', path: '/NeonArena/Data/Registries/', description: 'Master JSON registries mapping IDs to entity folders' }
    }
  },
  Tools: {
    name: 'Tools',
    path: '/NeonArena/Tools/',
    description: 'In-engine editors, debug tools, and creation utilities',
    subfolders: {
      Editors: { name: 'Editors', path: '/NeonArena/Tools/Editors/', description: 'Map editors, particle editors, and dialogue builders' },
      Debug: { name: 'Debug', path: '/NeonArena/Tools/Debug/', description: 'Performance profiler, loggers, and memory dumps' },
      Creation_Tools: { name: 'Creation_Tools', path: '/NeonArena/Tools/Creation_Tools/', description: 'Scanner utility dry-run tools and entity generators' }
    }
  }
};

// Default Registries matching Section 3 of specification
const DEFAULT_MASTER_REGISTRY: Record<string, RegistryEntry[]> = {
  master_registry: [
    { id: 'characters_registry', type: 'RegistryIndex', path: '/Data/Registries/characters_registry.json', display_name: 'Characters Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'characters'] },
    { id: 'bosses_registry', type: 'RegistryIndex', path: '/Data/Registries/bosses_registry.json', display_name: 'Bosses Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'bosses'] },
    { id: 'maps_registry', type: 'RegistryIndex', path: '/Data/Registries/maps_registry.json', display_name: 'Maps Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'maps'] },
    { id: 'mods_registry', type: 'RegistryIndex', path: '/Data/Registries/mods_registry.json', display_name: 'Mods Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'mods'] },
    { id: 'apps_registry', type: 'RegistryIndex', path: '/Data/Registries/apps_registry.json', display_name: 'Apps Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'apps'] },
    { id: 'ui_registry', type: 'RegistryIndex', path: '/Data/Registries/ui_registry.json', display_name: 'UI Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'ui'] },
    { id: 'systems_registry', type: 'RegistryIndex', path: '/Data/Registries/systems_registry.json', display_name: 'Systems Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'systems'] },
    { id: 'assets_registry', type: 'RegistryIndex', path: '/Data/Registries/assets_registry.json', display_name: 'Assets Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'assets'] },
    { id: 'education_registry', type: 'RegistryIndex', path: '/Data/Registries/education_registry.json', display_name: 'Education Registry Index', version: '1.0.0', dependencies: [], tags: ['registry', 'education'] }
  ],
  bosses_registry: [
    {
      id: 'boss_voltharn_arc_sovereign',
      type: 'Boss',
      path: '/Characters/Bosses/Voltharn_The_Arc_Sovereign',
      display_name: 'Voltharn, The Arc Sovereign',
      version: '1.2.0',
      dependencies: ['electric_fx_pack', 'boss_anim_rig_v2'],
      tags: ['boss', 'electric', 'dungeon_final', 'raid'],
      author: 'NeonArenaDevs'
    }
  ],
  apps_registry: [
    {
      id: 'mini_app_neon_clock',
      type: 'MiniApp',
      path: '/Apps/Mini_Apps/Neon_Clock',
      display_name: 'Neon Clock Utility',
      version: '1.0.0',
      dependencies: ['ui_theme_neon'],
      tags: ['app', 'utility', 'time', 'hud'],
      author: 'CoreTeam'
    },
    {
      id: 'app_tactical_radar_hud',
      type: 'NeonApp',
      path: '/Apps/Neon_Apps/Tactical_Radar_HUD',
      display_name: 'Tactical Radar HUD Overlay',
      version: '2.1.0',
      dependencies: ['systems_combat', 'assets_sfx_radar'],
      tags: ['app', 'hud', 'radar', 'tactical'],
      author: 'TacticalTech'
    }
  ],
  maps_registry: [
    {
      id: 'map_cyberpunk_neon_city',
      type: 'Level',
      path: '/Maps/Levels/Neon_City_Prime',
      display_name: 'Neon City Prime Arena',
      version: '3.0.1',
      dependencies: ['biome_cyberpunk_assets'],
      tags: ['map', 'level', 'pvp', 'neon'],
      author: 'LevelDesignStudio'
    }
  ],
  mods_registry: [
    {
      id: 'mod_gravity_physics_lab',
      type: 'Mod',
      path: '/Mods/Installed_Mods/Gravity_Physics_Lab',
      display_name: 'Gravity Physics Sandbox Lab',
      version: '2.0.0',
      dependencies: ['systems_physics'],
      tags: ['mod', 'sandbox', 'physics', 'gravity'],
      author: 'InfinityAcademy'
    }
  ],
  education_registry: [
    {
      id: 'lesson_orbital_mechanics_101',
      type: 'Lesson',
      path: '/Education_Mode/Lessons/Orbital_Mechanics_101',
      display_name: 'Orbital Mechanics & Escape Velocity 101',
      version: '1.0.0',
      dependencies: ['mini_app_scientific_calculator'],
      tags: ['education', 'stem', 'physics', 'space'],
      author: 'InfinityAcademy'
    }
  ]
};

// Default initial folders for Instant Demo & Device Apps Container
const DEFAULT_SAVED_FOLDERS: SavedFolder[] = [
  {
    id: 'default-apps-folder',
    name: 'Neon Arena System Apps',
    path: '/NeonArena/Apps/',
    appCount: 6,
    totalSizeMB: 24.8,
    lastScanned: new Date().toLocaleDateString(),
    isFavorite: true,
    apps: [
      {
        id: 'app-1',
        name: 'Tactical_Radar_HUD',
        folderPath: '/NeonArena/Apps/Neon_Apps/Tactical_Radar_HUD/',
        path: '/NeonArena/Apps/Neon_Apps/Tactical_Radar_HUD/Code/tactical_radar_hud_package.zip',
        sizeMB: 3.2,
        extension: 'zip',
        category: 'utilities',
        typeLabel: 'ENTITY FOLDER',
        version: '1.2.0',
        author: 'TacticalTech',
        description: '3D Wireframe Arena Map & Tactical HUD Overlay Entity Folder Container',
        isFavorite: true,
        dateAdded: new Date().toLocaleDateString(),
        dependencies: ['ui_theme_neon'],
        tags: ['hud', 'radar', 'zip', 'folder_entity'],
        subFiles: ['Code/tactical_radar_hud_package.zip', 'Config/manifest.json', 'Data/radar_coords.dat', 'Assets/styles.css', 'entity_manifest.json'],
        contentPreview: `{\n  "entity_id": "Tactical_Radar_HUD",\n  "structure": "FOLDER_PER_ENTITY",\n  "folder_path": "/NeonArena/Apps/Neon_Apps/Tactical_Radar_HUD/",\n  "contained_files": [\n    "Code/tactical_radar_hud_package.zip",\n    "Config/manifest.json",\n    "Data/radar_coords.dat",\n    "Assets/styles.css",\n    "entity_manifest.json"\n  ]\n}`
      },
      {
        id: 'app-2',
        name: 'Scientific_Gravity_Calculator',
        folderPath: '/NeonArena/Apps/Mini_Apps/Scientific_Gravity_Calculator/',
        path: '/NeonArena/Apps/Mini_Apps/Scientific_Gravity_Calculator/Code/scientific_gravity_calculator.js',
        sizeMB: 0.8,
        extension: 'js',
        category: 'development',
        typeLabel: 'ENTITY FOLDER',
        version: '1.0.5',
        author: 'InfinityAcademy',
        description: 'Real-time orbital mechanics & escape velocity solver Entity Folder Container',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString(),
        tags: ['calculator', 'physics', 'folder_entity'],
        subFiles: ['Code/scientific_gravity_calculator.js', 'Config/calculator_settings.json', 'Data/constants.json', 'entity_manifest.json'],
        contentPreview: `export function calculateEscapeVelocity(mass, radius) {\n  const G = 6.6743e-11;\n  return Math.sqrt((2 * G * mass) / radius);\n}`
      },
      {
        id: 'app-3',
        name: 'Neon_Arena_3D_Viewer',
        folderPath: '/NeonArena/Apps/Tools/Neon_Arena_3D_Viewer/',
        path: '/NeonArena/Apps/Tools/Neon_Arena_3D_Viewer/Code/neon_arena_3d_viewer.apk',
        sizeMB: 12.4,
        extension: 'apk',
        category: 'games',
        typeLabel: 'ENTITY FOLDER',
        version: '3.1.0',
        author: 'NeonMaster',
        description: 'Native Android 16 standalone WebGL 3D Arena Client Entity Folder Container',
        isFavorite: true,
        dateAdded: new Date().toLocaleDateString(),
        subFiles: ['Code/neon_arena_3d_viewer.apk', 'Config/client_config.json', 'Data/shaders.bin', 'Assets/textures/', 'entity_manifest.json'],
        contentPreview: `{\n  "entity_id": "Neon_Arena_3D_Viewer",\n  "structure": "FOLDER_PER_ENTITY",\n  "contained_files": ["Code/neon_arena_3d_viewer.apk", "Config/client_config.json", "Data/shaders.bin", "entity_manifest.json"]\n}`
      },
      {
        id: 'app-4',
        name: 'AI_Neural_Bot_Weights',
        folderPath: '/NeonArena/Systems/AI/AI_Neural_Bot_Weights/',
        path: '/NeonArena/Systems/AI/AI_Neural_Bot_Weights/Data/ai_neural_bot_weights.onnx',
        sizeMB: 6.1,
        extension: 'onnx',
        category: 'ai',
        typeLabel: 'ENTITY FOLDER',
        version: '0.9.4',
        author: 'DeepMind',
        description: 'Reinforcement learning neural weights Entity Folder Container',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString(),
        subFiles: ['Data/ai_neural_bot_weights.onnx', 'Config/model_hyperparams.json', 'Code/inference_engine.js', 'entity_manifest.json'],
        contentPreview: `{\n  "entity_id": "AI_Neural_Bot_Weights",\n  "structure": "FOLDER_PER_ENTITY",\n  "contained_files": ["Data/ai_neural_bot_weights.onnx", "Config/model_hyperparams.json", "Code/inference_engine.js", "entity_manifest.json"]\n}`
      },
      {
        id: 'app-5',
        name: 'Arena_Stats_Spreadsheet',
        folderPath: '/NeonArena/Data/JSON/Arena_Stats_Spreadsheet/',
        path: '/NeonArena/Data/JSON/Arena_Stats_Spreadsheet/Data/arena_stats_spreadsheet.xlsx',
        sizeMB: 1.1,
        extension: 'xlsx',
        category: 'productivity',
        typeLabel: 'ENTITY FOLDER',
        version: '2026.1',
        author: 'ArenaAdmin',
        description: 'Player match telemetry and leaderboard sheet Entity Folder Container',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString(),
        subFiles: ['Data/arena_stats_spreadsheet.xlsx', 'Config/schema.json', 'Code/parser.js', 'entity_manifest.json'],
        contentPreview: `{\n  "entity_id": "Arena_Stats_Spreadsheet",\n  "structure": "FOLDER_PER_ENTITY",\n  "contained_files": ["Data/arena_stats_spreadsheet.xlsx", "Config/schema.json", "entity_manifest.json"]\n}`
      },
      {
        id: 'app-6',
        name: 'Cyberpunk_Ambient_Audio',
        folderPath: '/NeonArena/Assets/Music/Cyberpunk_Ambient_Audio/',
        path: '/NeonArena/Assets/Music/Cyberpunk_Ambient_Audio/Assets/cyberpunk_ambient_audio.mp4',
        sizeMB: 1.2,
        extension: 'mp4',
        category: 'media',
        typeLabel: 'ENTITY FOLDER',
        version: '1.0.0',
        author: 'Mixkit',
        description: 'Neon synthwave video background loop Entity Folder Container',
        isFavorite: false,
        dateAdded: new Date().toLocaleDateString(),
        subFiles: ['Assets/cyberpunk_ambient_audio.mp4', 'Config/audio_preset.json', 'Data/spectrum.dat', 'entity_manifest.json'],
        contentPreview: `{\n  "entity_id": "Cyberpunk_Ambient_Audio",\n  "structure": "FOLDER_PER_ENTITY",\n  "contained_files": ["Assets/cyberpunk_ambient_audio.mp4", "Config/audio_preset.json", "entity_manifest.json"]\n}`
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// MAIN COMPONENT: AppsFolderStudio
// ---------------------------------------------------------------------------

export function AppsFolderStudio({ onClose }: { onClose?: () => void }) {
  // Main Studio Mode Switcher
  const [activeStudioMode, setActiveStudioMode] = useState<'device_loader' | 'ecosystem_tree' | 'registry_browser' | 'scanner_utility' | 'entity_creator'>('device_loader');

  // Device Folder Loader State
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

  // Ecosystem Tree State
  const [selectedTopFolderKey, setSelectedTopFolderKey] = useState<string>('Apps');
  const [selectedSubFolderKey, setSelectedSubFolderKey] = useState<string>('Neon_Apps');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');

  // Registry System State
  const [registries, setRegistries] = useState<Record<string, RegistryEntry[]>>(() => {
    try {
      const stored = localStorage.getItem(REGISTRY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Registry storage error, resetting to defaults:", e);
    }
    return DEFAULT_MASTER_REGISTRY;
  });
  const [selectedRegistryKey, setSelectedRegistryKey] = useState<string>('master_registry');
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');

  // Scanner Utility & Dry Run State
  const [scannerDryRun, setScannerDryRun] = useState<{
    isRunning: boolean;
    logs: string[];
    discoveredEntities: RegistryEntry[];
    conflicts: string[];
    scannedCount: number;
    hashMatches: number;
  }>({
    isRunning: false,
    logs: [],
    discoveredEntities: [],
    conflicts: [],
    scannedCount: 0,
    hashMatches: 0
  });

  // Entity Creator Modal
  const [newEntityType, setNewEntityType] = useState<'Boss' | 'Character' | 'Map' | 'Mod' | 'MiniApp' | 'Lesson'>('Boss');
  const [newEntityName, setNewEntityName] = useState('Voltharn_The_Arc_Sovereign');
  const [newEntityAuthor, setNewEntityAuthor] = useState('NeonArchitect');
  const [createdEntityPreview, setCreatedEntityPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);

  // Save folders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFolders));
    } catch (e) {
      console.warn("LocalStorage space limit exceeded:", e);
    }
  }, [savedFolders]);

  // Save registries to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registries));
    } catch (e) {
      console.warn("Registry LocalStorage save error:", e);
    }
  }, [registries]);

  const activeFolder = savedFolders.find(f => f.id === selectedFolderId) || savedFolders[0];

  // Helper to categorize extensions
  const categorizeExtension = (ext: string): LoadedApp['category'] => {
    const lower = ext.toLowerCase();
    if (['apk', 'exe', 'x86_64', 'app', 'wasm', 'unity3d', 'pck', 'mcpack', 'pak', 'dmg'].includes(lower)) return 'games';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'rs', 'cpp', 'c', 'cs', 'go', 'java', 'html', 'css', 'sh', 'php'].includes(lower)) return 'development';
    if (['pdf', 'doc', 'docx', 'xlsx', 'xls', 'md', 'txt', 'csv', 'key', 'ppt', 'pptx'].includes(lower)) return 'productivity';
    if (['zip', 'tar', 'gz', '7z', 'rar', 'iso', 'deb', 'rpm'].includes(lower)) return 'utilities';
    if (['onnx', 'pt', 'gguf', 'safetensors', 'bin', 'model', 'tflite'].includes(lower)) return 'ai';
    if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'mp3', 'wav', 'ogg', 'png', 'jpg', 'jpeg', 'gif', 'svg'].includes(lower)) return 'media';
    return 'other';
  };

  // Helper to get extension label
  const getTypeLabel = (ext: string): string => {
    const lower = ext.toLowerCase();
    if (lower === 'apk') return 'ANDROID APK';
    if (lower === 'zip') return 'ZIP ARCHIVE';
    if (lower === 'cs') return 'C# ENGINE SCRIPT';
    if (lower === 'js' || lower === 'ts') return 'JS/TS MODULE';
    if (lower === 'exe') return 'WIN EXECUTABLE';
    if (lower === 'py') return 'PYTHON APP';
    if (lower === 'onnx' || lower === 'gguf') return 'AI MODEL WEIGHTS';
    if (lower === 'json') return 'JSON MANIFEST/DATA';
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

    try { soundService.playSFX('ui_click'); } catch (e) {}
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

        let version = '1.0.0';
        const versionMatch = file.name.match(/v?(\d+\.\d+\.\d+)/i);
        if (versionMatch) {
          version = versionMatch[1];
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const entityFolderName = baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/[^a-zA-Z0-9_]/g, '_') + "_Folder";
        const folderContainerPath = `/NeonArena/Apps/${rootFolderName}/${entityFolderName}/`;

        parsedApps.push({
          id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: entityFolderName,
          folderPath: folderContainerPath,
          path: file.webkitRelativePath ? `${folderContainerPath}${file.name}` : `${folderContainerPath}Code/${file.name}`,
          sizeMB,
          extension: ext,
          category,
          typeLabel: 'ENTITY FOLDER',
          version,
          author: 'Local Device',
          dateAdded: new Date().toLocaleDateString(),
          rawFile: file,
          description: `Folder-per-entity container encapsulating ${file.name} with manifest and data structures`,
          subFiles: [
            `Code/${file.name}`,
            `Config/config.json`,
            `Data/metadata.json`,
            `entity_manifest.json`
          ],
          contentPreview: `{\n  "entity_id": "${entityFolderName}",\n  "type": "FOLDER_PER_ENTITY_CONTAINER",\n  "folder_path": "${folderContainerPath}",\n  "contained_files": [\n    "Code/${file.name}",\n    "Config/config.json",\n    "Data/metadata.json",\n    "entity_manifest.json"\n  ]\n}`
        });
      }

      const prog = Math.min(95, Math.round(((i + chunk.length) / total) * 100));
      setScanProgress(prog);
      setScanStatusText(`Indexed ${i + chunk.length} / ${total} files...`);
      await new Promise(res => setTimeout(res, 12));
    }

    setScanProgress(100);
    setScanStatusText(`Scan complete! Loaded ${parsedApps.length} items.`);
    try { soundService.playSFX('powerup'); } catch (e) {}

    const totalSize = parsedApps.reduce((acc, curr) => acc + curr.sizeMB, 0);

    const newFolder: SavedFolder = {
      id: `folder-${Date.now()}`,
      name: rootFolderName,
      path: `/NeonArena/Apps/${rootFolderName}/`,
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
    }, 500);
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
      processFolderFiles(e.dataTransfer.files, "Dropped Package Folder");
    }
  };

  // Filter & Sort Device Apps
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

    try { soundService.playSFX('ui_click'); } catch (e) {}
    setIsScanning(true);
    setScanProgress(30);
    setScanStatusText(`Re-indexing incremental hashes for ${folder.name}...`);

    setTimeout(() => {
      setScanProgress(100);
      setScanStatusText(`Updated indices for ${folder.name}!`);
      try { soundService.playSFX('powerup'); } catch (e) {}
      setSavedFolders(prev => prev.map(f => f.id === folderId ? { ...f, lastScanned: new Date().toLocaleDateString() } : f));
      setIsScanning(false);
    }, 450);
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
    try { soundService.playSFX('powerup'); } catch (e) {}
    setSelectedApp(app);
    setIsSandboxRunning(true);
    setSandboxLogs([
      `[SANDBOX V8 ISOLATE] Allocating container runtime for ${app.name}...`,
      `[SECURITY] Permissive sandbox profile applied. Path: ${app.path}`,
      `[DEPENDENCY RESOLVER] Validating manifest dependencies: [${app.dependencies?.join(', ') || 'None'}]`,
      `[MEMORY] Bound 128MB Virtual WASM Memory surface`,
      `[STATUS] Package ${app.typeLabel} v${app.version || '1.0.0'} started in background.`,
      `[CONSOLE LOG] Output pipeline active for "${app.name}". Ready!`
    ]);
  };

  // Run Folder Scanner Dry-Run Utility
  const runScannerDryRun = async () => {
    try { soundService.playSFX('ui_click'); } catch (e) {}
    setScannerDryRun({
      isRunning: true,
      logs: ['[FOLDER SCANNER v5.2] Initializing ChangeWatcher & ScanWorker thread...'],
      discoveredEntities: [],
      conflicts: [],
      scannedCount: 0,
      hashMatches: 0
    });

    const mockScanSteps = [
      `[SCANNER] Scanning /NeonArena/Characters/Bosses/...`,
      `[TYPE DETECTION] Found entity.json in /Voltharn_The_Arc_Sovereign/ -> Type: Boss`,
      `[SCANNER] Scanning /NeonArena/Apps/Mini_Apps/Neon_Clock/...`,
      `[TYPE DETECTION] Found clock_settings.json -> Type: MiniApp`,
      `[HASH CHECK] Verified 1,420 files against last scan timestamp (0 change delta)`,
      `[CONFLICT CHECK] Checking ID collisions across 9 registry index shards...`,
      `[REGISTRY WRITER] Dry-run completed cleanly. 0 conflict errors.`
    ];

    for (let i = 0; i < mockScanSteps.length; i++) {
      await new Promise(res => setTimeout(res, 200));
      setScannerDryRun(prev => ({
        ...prev,
        logs: [...prev.logs, mockScanSteps[i]],
        scannedCount: (i + 1) * 210,
        hashMatches: (i + 1) * 190
      }));
    }

    setScannerDryRun(prev => ({
      ...prev,
      isRunning: false,
      discoveredEntities: [
        { id: 'boss_voltharn_arc_sovereign', type: 'Boss', path: '/Characters/Bosses/Voltharn_The_Arc_Sovereign', display_name: 'Voltharn, The Arc Sovereign', version: '1.2.0', dependencies: ['electric_fx_pack'], tags: ['boss', 'electric'] },
        { id: 'mini_app_neon_clock', type: 'MiniApp', path: '/Apps/Mini_Apps/Neon_Clock', display_name: 'Neon Clock Utility', version: '1.0.0', dependencies: [], tags: ['app', 'clock'] }
      ]
    }));
    try { soundService.playSFX('powerup'); } catch (e) {}
  };

  // Create Folder-Per-Entity Generator
  const generateFolderPerEntity = () => {
    const slug = newEntityName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const folderPath = `/NeonArena/${newEntityType === 'Boss' ? 'Characters/Bosses' : newEntityType === 'MiniApp' ? 'Apps/Mini_Apps' : newEntityType === 'Map' ? 'Maps/Levels' : 'Mods/Installed_Mods'}/${newEntityName}/`;
    
    const previewManifest = {
      folder_structure: [
        `${folderPath}Data/`,
        `${folderPath}Abilities/`,
        `${folderPath}Animations/`,
        `${folderPath}Assets/`,
        `${folderPath}entity_manifest.json`
      ],
      registry_entry: {
        id: `${newEntityType.toLowerCase()}_${slug}`,
        type: newEntityType,
        path: folderPath,
        display_name: newEntityName,
        version: '1.0.0',
        author: newEntityAuthor,
        dependencies: [],
        tags: [newEntityType.toLowerCase(), 'custom']
      },
      entity_manifest_json: `{\n  "id": "${newEntityType.toLowerCase()}_${slug}",\n  "name": "${newEntityName}",\n  "type": "${newEntityType}",\n  "version": "1.0.0",\n  "author": "${newEntityAuthor}",\n  "entrypoint": "${newEntityType}.cs"\n}`
    };

    setCreatedEntityPreview(JSON.stringify(previewManifest, null, 2));

    // Register into active registry
    const targetRegistry = newEntityType === 'Boss' ? 'bosses_registry' : newEntityType === 'MiniApp' ? 'apps_registry' : newEntityType === 'Map' ? 'maps_registry' : 'mods_registry';
    const newEntry: RegistryEntry = previewManifest.registry_entry;

    setRegistries(prev => ({
      ...prev,
      [targetRegistry]: [newEntry, ...(prev[targetRegistry] || [])]
    }));
    try { soundService.playSFX('powerup'); } catch (e) {}
  };

  // Category counts
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
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col font-sans text-white overflow-hidden select-none"
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
            className="absolute inset-0 z-50 bg-cyan-950/85 backdrop-blur-md border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center p-8 space-y-4 text-center pointer-events-none"
          >
            <UploadCloud size={64} className="text-cyan-400 animate-bounce" />
            <h2 className="text-2xl font-black uppercase text-cyan-300 tracking-wider">DROP ANY FOLDER HERE TO SCAN APPS</h2>
            <p className="text-xs text-cyan-200/80 font-mono">Supports APKs, ZIP archives, executables, scripts, and project folders</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation */}
      <div className="bg-zinc-950/95 border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Cpu className="w-6 h-6 text-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                NEON ARENA // ENGINE ECOSYSTEM & FOLDER STUDIO
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                v5.2 REGISTRY
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">Folder-per-entity architecture, scanner background worker & dynamic registry indexer</p>
          </div>
        </div>

        {/* Studio Subsystem Mode Switcher */}
        <div className="flex bg-black/60 border border-white/10 rounded-2xl p-1 gap-1">
          {[
            { id: 'device_loader', label: 'Device Folder Loader', icon: HardDrive },
            { id: 'ecosystem_tree', label: '/NeonArena/ Tree', icon: FolderOpen },
            { id: 'registry_browser', label: 'Registries Index', icon: FileJson },
            { id: 'scanner_utility', label: 'Folder Scanner', icon: RefreshCw },
            { id: 'entity_creator', label: 'Entity Generator', icon: Plus },
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeStudioMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  try { soundService.playSFX('ui_click'); } catch (e) {}
                  setActiveStudioMode(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Select Folder Button */}
          <label className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center gap-1.5">
            <FolderPlus size={14} />
            + LOAD DEVICE FOLDER
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              {...{ webkitdirectory: "", directory: "" }} 
              onChange={(e) => e.target.files && processFolderFiles(e.target.files)} 
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

      {/* Main Studio Body Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* MODE 1: DEVICE FOLDER LOADER */}
        {activeStudioMode === 'device_loader' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Saved Folders */}
            <div className="w-72 bg-zinc-950/80 border-r border-white/5 flex flex-col justify-between p-4 space-y-4">
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <HardDrive size={12} /> SAVED DEVICE FOLDERS
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">{savedFolders.length} FOLDERS</span>
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
                          <span className="truncate max-w-[130px]">Path: {folder.path}</span>

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

              {/* Sidebar Stats */}
              <div className="bg-black/60 border border-white/5 p-3 rounded-2xl space-y-1.5 text-[9px] font-mono">
                <div className="flex justify-between text-zinc-400 uppercase">
                  <span>ACTIVE FOLDER SIZE</span>
                  <span className="text-cyan-400 font-bold">{activeFolder?.totalSizeMB || 0} MB</span>
                </div>
                <div className="flex justify-between text-zinc-400 uppercase">
                  <span>BACKGROUND WORKER</span>
                  <span className="text-emerald-400 font-bold">ONLINE (0.2s PASS)</span>
                </div>
              </div>
            </div>

            {/* Right Main Folder Content */}
            <div className="flex-1 bg-zinc-900/40 flex flex-col p-5 overflow-hidden space-y-4">
              
              {/* Progress Banner */}
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

              {/* Error Banner */}
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

              {/* Search & Sort Bar */}
              <div className="flex justify-between items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search loaded apps by name, type, extension..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

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
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
                      <Grid size={14} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: 'All Items', icon: Box, count: categoryCounts.all },
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

              {/* Apps Cards Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {filteredApps.length === 0 ? (
                  <div className="h-64 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-3 text-center p-6">
                    <Package size={40} className="text-zinc-600" />
                    <span className="text-sm font-black uppercase text-zinc-400 tracking-wider">No Items Detected</span>
                    <p className="text-xs text-zinc-500 max-w-sm font-mono">
                      No files matching category "{activeCategory}" were found in {activeFolder?.name}. Drop a folder or select a new directory.
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {filteredApps.map((app) => (
                      <motion.div 
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-950/80 border border-white/10 hover:border-cyan-500/50 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all flex items-center gap-1.5">
                              <Folder size={16} />
                              <span className="text-[9px] font-mono font-bold">FOLDER</span>
                            </div>

                            <span className="text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                              <Box size={9} /> FOLDER ENTITY
                            </span>
                          </div>

                          <h3 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition-colors font-mono">
                            /{app.name}/
                          </h3>
                          <p className="text-[9px] font-mono text-cyan-400/80 truncate mt-0.5">
                            {app.folderPath || app.path}
                          </p>

                          {/* Nested Subfiles Preview */}
                          <div className="mt-2 p-2 bg-black/60 border border-white/5 rounded-xl space-y-1">
                            <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase block">
                              Contained Entity Files ({app.subFiles?.length || 4}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(app.subFiles || ['Code/', 'Config/', 'Data/', 'entity_manifest.json']).slice(0, 4).map((f, fi) => (
                                <span key={fi} className="text-[7.5px] font-mono bg-white/5 border border-white/10 text-cyan-300 px-1.5 py-0.5 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {app.description && (
                            <p className="text-[9px] text-zinc-400 mt-2 line-clamp-2 leading-snug">
                              {app.description}
                            </p>
                          )}
                        </div>

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
                  <div className="space-y-2">
                    {filteredApps.map((app) => (
                      <div 
                        key={app.id}
                        className="bg-zinc-950/80 border border-white/10 hover:border-cyan-500/50 p-3 rounded-2xl flex items-center justify-between gap-4 group transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 flex items-center justify-center">
                            <Folder size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black text-white truncate font-mono group-hover:text-cyan-300">
                                /{app.name}/
                              </h3>
                              <span className="text-[8px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 font-bold">
                                FOLDER ENTITY
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-cyan-400/80 truncate block">
                              {app.folderPath || app.path}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {(app.subFiles || ['Code/', 'Config/', 'Data/', 'entity_manifest.json']).map((sf, sfi) => (
                                <span key={sfi} className="text-[7.5px] font-mono text-zinc-400 bg-black px-1.5 py-0.2 rounded border border-white/5">
                                  {sf}
                                </span>
                              ))}
                            </div>
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
                              className="px-3 py-1.5 bg-cyan-500 text-black font-black text-[9px] uppercase rounded-lg hover:bg-cyan-400 flex items-center gap-1 cursor-pointer"
                            >
                              <Play size={10} /> LAUNCH
                            </button>
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 bg-white/5 text-zinc-300 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer"
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
        )}

        {/* MODE 2: ECOSYSTEM FOLDER TREE BROWSER (/NeonArena/) */}
        {activeStudioMode === 'ecosystem_tree' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Top Level Folder Directory Tree */}
            <div className="w-80 bg-zinc-950/90 border-r border-white/5 flex flex-col p-4 space-y-3">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <FolderOpen size={13} /> /NeonArena/ TOP-LEVEL DIRECTORY
              </span>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {Object.keys(ECOSYSTEM_TOP_LEVEL_TREE).map(key => {
                  const node = ECOSYSTEM_TOP_LEVEL_TREE[key];
                  const isSelected = selectedTopFolderKey === key;

                  return (
                    <div key={key} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedTopFolderKey(key);
                          const firstSub = Object.keys(node.subfolders || {})[0] || '';
                          setSelectedSubFolderKey(firstSub);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                            : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                          <span className="text-xs truncate">/{key}/</span>
                        </div>
                        <ChevronRight size={14} className={isSelected ? 'text-cyan-400' : 'text-zinc-600'} />
                      </button>

                      {/* Expanded Subfolders */}
                      {isSelected && node.subfolders && (
                        <div className="ml-4 pl-3 border-l border-cyan-500/30 space-y-1 py-1">
                          {Object.keys(node.subfolders).map(subKey => {
                            const sub = node.subfolders![subKey];
                            const isSubSelected = selectedSubFolderKey === subKey;

                            return (
                              <button
                                key={subKey}
                                onClick={() => setSelectedSubFolderKey(subKey)}
                                className={`w-full p-1.5 px-2 rounded-lg text-left text-[10px] font-mono transition-all flex items-center justify-between cursor-pointer ${
                                  isSubSelected
                                    ? 'bg-cyan-500 text-black font-black'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <span className="truncate">{subKey}/</span>
                                <span className="text-[8px] opacity-75">.json / .cs</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Subfolder Entity View */}
            <div className="flex-1 bg-zinc-900/40 p-5 flex flex-col space-y-4 overflow-hidden">
              <div className="bg-black/60 border border-cyan-500/30 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-mono text-cyan-400 uppercase font-bold">ACTIVE ECOSYSTEM BREADCRUMB PATH</div>
                  <h2 className="text-sm font-black text-white font-mono mt-0.5">
                    /NeonArena/{selectedTopFolderKey}/{selectedSubFolderKey}/
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {ECOSYSTEM_TOP_LEVEL_TREE[selectedTopFolderKey]?.subfolders?.[selectedSubFolderKey]?.description || 'Folder-per-entity structure active.'}
                  </p>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 p-2.5 rounded-xl text-center">
                  <span className="text-[14px] font-black font-mono text-cyan-300 block">0 LOOSE FILES</span>
                  <span className="text-[8px] font-mono text-zinc-400 uppercase">FOLDER-PER-ENTITY RULE ACTIVE</span>
                </div>
              </div>

              {/* Entity Folders List in Selected Directory */}
              <div className="flex-1 bg-zinc-950/80 border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar space-y-3">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
                  SUBDIRECTORIES & ENTITY PACKAGES
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: `${selectedSubFolderKey}_Core`, files: ['Code/', 'Config/', 'Data/', 'entity_manifest.json'] },
                    { name: `${selectedSubFolderKey}_Package_Alpha`, files: ['Abilities/', 'Animations/', 'Assets/', 'stats.json'] },
                    { name: `${selectedSubFolderKey}_Package_Beta`, files: ['Code/main.cs', 'UI/layout.json', 'Assets/'] }
                  ].map((subItem, idx) => (
                    <div key={idx} className="p-3.5 bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-cyan-300 font-mono">/{subItem.name}/</span>
                        <Folder className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 space-y-0.5">
                        {subItem.files.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1.5 text-zinc-400">
                            <span className="text-cyan-500">•</span> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: REGISTRIES INDEX BROWSER */}
        {activeStudioMode === 'registry_browser' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Registry List */}
            <div className="w-72 bg-zinc-950/90 border-r border-white/5 p-4 space-y-3 flex flex-col">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileJson size={13} /> /Data/Registries/ SHARDS
              </span>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                {Object.keys(registries).map(regKey => {
                  const isSelected = selectedRegistryKey === regKey;
                  const entries = registries[regKey] || [];

                  return (
                    <button
                      key={regKey}
                      onClick={() => setSelectedRegistryKey(regKey)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold' 
                          : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs block font-mono truncate">{regKey}.json</span>
                        <span className="text-[8px] font-mono text-zinc-500">{entries.length} Indexed Entities</span>
                      </div>
                      <ChevronRight size={13} className={isSelected ? 'text-cyan-400' : 'text-zinc-600'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Registry Contents Table & Editor */}
            <div className="flex-1 bg-zinc-900/40 p-5 flex flex-col space-y-4 overflow-hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-white uppercase font-mono">
                    INDEXING SHARD: /Data/Registries/{selectedRegistryKey}.json
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Fast lookup index routing entity IDs directly to isolated folder paths
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search registry IDs or tags..."
                    value={registrySearchQuery}
                    onChange={e => setRegistrySearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* JSON Entries View */}
              <div className="flex-1 bg-zinc-950 border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar space-y-3 font-mono text-xs">
                {(registries[selectedRegistryKey] || []).map((entry, idx) => (
                  <div key={idx} className="p-3.5 bg-black/80 border border-white/10 rounded-xl space-y-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-bold text-cyan-300">{entry.id}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px] uppercase font-black">{entry.type}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                      <div>Folder Path: <strong className="text-white">{entry.path}</strong></div>
                      <div>Version: <strong className="text-emerald-400">{entry.version}</strong></div>
                      <div>Dependencies: <strong className="text-amber-400">{entry.dependencies?.join(', ') || 'None'}</strong></div>
                      <div>Tags: <strong className="text-fuchsia-400">{entry.tags?.join(', ') || 'None'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 4: SCANNER UTILITY & DRY RUN */}
        {activeStudioMode === 'scanner_utility' && (
          <div className="flex-1 bg-zinc-900/40 p-6 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div className="bg-zinc-950 border border-cyan-500/30 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    FOLDER SCANNER & INCREMENTAL CHANGE WATCHER
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Background worker off-thread scanner verifying incremental folder hashes and manifests
                  </p>
                </div>

                <button 
                  onClick={runScannerDryRun}
                  disabled={scannerDryRun.isRunning}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  RUN DRY-RUN SCANNER PASS
                </button>
              </div>

              {/* Scanner Stats */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 uppercase block">Scanned Folders</span>
                  <span className="text-cyan-400 font-black text-sm">{scannerDryRun.scannedCount}</span>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 uppercase block">Hash Matches (Unchanged)</span>
                  <span className="text-emerald-400 font-black text-sm">{scannerDryRun.hashMatches}</span>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 uppercase block">Discovered Entities</span>
                  <span className="text-amber-400 font-black text-sm">{scannerDryRun.discoveredEntities.length}</span>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-500 uppercase block">Conflicts / ID Collisions</span>
                  <span className="text-rose-400 font-black text-sm">{scannerDryRun.conflicts.length}</span>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="bg-black border border-white/10 rounded-xl p-3 h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1">
                <div className="text-zinc-500 border-b border-white/5 pb-1 uppercase font-bold flex justify-between">
                  <span>SYSTEM SCANNER WORKER OUTPUT LOGS</span>
                  <span className="text-cyan-400">WORKER TICK: ACTIVE</span>
                </div>
                {scannerDryRun.logs.map((log, li) => (
                  <div key={li} className="text-cyan-300">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 5: ENTITY CREATOR & GENERATOR */}
        {activeStudioMode === 'entity_creator' && (
          <div className="flex-1 bg-zinc-900/40 p-6 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div className="bg-zinc-950 border border-cyan-500/30 p-5 rounded-2xl space-y-4 max-w-2xl mx-auto w-full">
              <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Plus size={16} /> FOLDER-PER-ENTITY STRUCTURE GENERATOR
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Entity Type:</label>
                  <select 
                    value={newEntityType}
                    onChange={e => setNewEntityType(e.target.value as any)}
                    className="w-full bg-black border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400"
                  >
                    <option value="Boss">Boss Entity (/Characters/Bosses/)</option>
                    <option value="Character">Player/NPC Entity (/Characters/Player/)</option>
                    <option value="Map">Arena Map (/Maps/Levels/)</option>
                    <option value="Mod">Installed Mod (/Mods/Installed_Mods/)</option>
                    <option value="MiniApp">Mini App (/Apps/Mini_Apps/)</option>
                    <option value="Lesson">Education Module (/Education_Mode/Lessons/)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Entity Name:</label>
                  <input 
                    type="text" 
                    value={newEntityName}
                    onChange={e => setNewEntityName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Author / Creator:</label>
                  <input 
                    type="text" 
                    value={newEntityAuthor}
                    onChange={e => setNewEntityAuthor(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400"
                  />
                </div>

                <button 
                  onClick={generateFolderPerEntity}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:brightness-110 cursor-pointer"
                >
                  GENERATE FOLDER STRUCTURE & REGISTER
                </button>
              </div>

              {createdEntityPreview && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Generated Folder & Manifest Structure:</span>
                  <pre className="p-3 bg-black border border-emerald-500/30 rounded-xl font-mono text-[9.5px] text-emerald-300 max-h-48 overflow-y-auto custom-scrollbar">
                    {createdEntityPreview}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* APP INSPECTOR & SANDBOX RUNNER MODAL */}
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

              <button onClick={() => setSelectedApp(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

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

            {selectedApp.contentPreview && (
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Code / Manifest Preview</span>
                <pre className="p-3 bg-black border border-white/10 rounded-xl text-[9px] font-mono text-cyan-300 max-h-36 overflow-y-auto custom-scrollbar">
                  {selectedApp.contentPreview}
                </pre>
              </div>
            )}

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
