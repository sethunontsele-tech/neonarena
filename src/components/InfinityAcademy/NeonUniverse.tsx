import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Film, Play, Pause, Plus, Trash2, Heart, Activity, Sliders, Layers, 
  Music, Mic, Tv, Image, Coffee, Users, GraduationCap, Clipboard, HelpCircle, 
  Library, BookOpen, Languages, FlaskConical, Atom, Compass, Info, Dna, Rocket, 
  Globe, Flame, ChevronRight, Trophy, Bot, Sparkles, Palette, Home, Share2, 
  Smile, UserPlus, Check, Volume2, Eye, Calendar, Sparkle, AlertCircle, Dumbbell,
  Award, Gamepad2, Folder, Download, Wrench, Settings, Cpu, Code2
} from 'lucide-react';
import { useEduStore, ActiveDimensionType } from './eduStore';
import { soundService } from '../../services/soundService';
import { BlenderZipUpload } from '../BlenderZipUpload';

interface NeonUniverseProps {
  onClose: () => void;
}

// Simulated YouTube Video Database
const YOUTUBE_VIDEOS = [
  // Gaming
  { id: 'dQw4w9WgXcQ', title: 'Neon Arena World Finals 2026: Pro Speedrun & Tactics', category: 'gaming', views: '2.4M', duration: '14:20', channel: 'CyberSports VR' },
  { id: 'FzG4uDgje3M', title: 'Top 10 Advanced Gameplay Secrets in Multiplayer Arena', category: 'gaming', views: '840K', duration: '11:05', channel: 'GamerMatrix' },
  { id: '3JZ_D3ELwOQ', title: 'Cyberpunk Metagame Optimization: Weapon Loadout Presets', category: 'gaming', views: '420K', duration: '18:45', channel: 'ArenaLoadout' },
  
  // Educational
  { id: 'URUJD5NEXC8', title: 'Mitochondria: The Epic Powerhouse of the Living Cell', category: 'educational', views: '1.2M', duration: '09:30', channel: 'CrashCourse Bio' },
  { id: 'H8WJMCaeSRE', title: 'Understanding Covalent and Ionic Atom Bonding in 3D', category: 'educational', views: '550K', duration: '12:15', channel: 'ChemInteractive' },
  { id: 'y8X88s6p09g', title: 'Physics Lab: Testing Gravitational Acceleration & Friction', category: 'educational', views: '310K', duration: '08:40', channel: 'EinsteinLabs' },
  { id: 'pP89Z7zB6gI', title: 'Programming Loops & Computational Logic Trees Explained', category: 'educational', views: '980K', duration: '15:10', channel: 'IslandCode' },
  
  // Music
  { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Radio 🎧 Cyber Beats for Study, Focus, Coding', category: 'music', views: '14.5M', duration: '3:00:00', channel: 'NeonLofi' },
  { id: '8_vXmOAPb9g', title: 'Dark Synthwave Soundscapes: Cyberpunk Outrun Playlist 2026', category: 'music', views: '4.2M', duration: '1:45:00', channel: 'SynthWave Records' },
  { id: 'j3Fp6aD7F9g', title: 'Deep Space Cosmic Ambient: Relaxing Star Meditation Waves', category: 'music', views: '1.8M', duration: '2:15:00', channel: 'AuraSound' },

  // Fitness
  { id: 'ml6cTToXR-M', title: '15 Min Cyber Boxing HIIT Cardio Workout - Beat the Rhythm', category: 'fitness', views: '750K', duration: '15:00', channel: 'NeonGym Cardio' },
  { id: '3fA7D9kE8rI', title: 'Stretch & Restore: Dynamic Yoga Flow for Esports Athletes', category: 'fitness', views: '210K', duration: '20:15', channel: 'CyberZen Yoga' },
  { id: 'g6L8D9s2f8I', title: '10 Min EDM High-Tempo Dance Workout to Burn Calories', category: 'fitness', views: '1.1M', duration: '10:00', channel: 'ElectroDance Gym' },
  
  // Space
  { id: 'P86zB7y6j0g', title: 'Asteroid Mining Operations: Low-Gravity Resource Gathering', category: 'space', views: '890K', duration: '13:50', channel: 'Orbital Mining' },
  { id: 'j9P8uH6y7dE', title: 'Inside Mars Colony Alpha: Real-Time sci-fi Habitat Tour', category: 'space', views: '1.5M', duration: '22:30', channel: 'RedPlanet News' },
  
  // History
  { id: 'uH3Y8g6T7dE', title: 'Decrypting the Ancient Hieroglyphs & Rosetta Stone Tablet', category: 'history', views: '640K', duration: '17:25', channel: 'HistoryPortals' },
  { id: 'v7D6fH9s2f8', title: 'Giza Pyramid Complex: Structural Secrets of Egyptian Architects', category: 'history', views: '2.8M', duration: '25:10', channel: 'ChronosDoc' },

  // Kids
  { id: 'y8X2jH6y7dE', title: 'The Planets Song! Learn Astronomy and the Solar System', category: 'kids', views: '6.7M', duration: '05:40', channel: 'KidsAstro Science' },
  { id: 'k9H8s2f3g8I', title: 'Biology for Kids: Animated Journey Inside a Tree Leaf Cell', category: 'kids', views: '1.9M', duration: '08:15', channel: 'BioKids' }
];

export function NeonUniverse({ onClose }: NeonUniverseProps) {
  const activeDimension = useEduStore(state => state.activeDimension);
  const xp = useEduStore(state => state.xp);
  const level = useEduStore(state => state.level);
  const gainXP = useEduStore(state => state.gainXP);

  // Active Tab
  const [activeUniverseTab, setActiveUniverseTab] = useState<'stream' | 'cinema' | 'gym' | 'academy' | 'board' | 'home' | 'aura' | 'mods_controllers'>('stream');

  // --- NEON MODS & CONTROLLERS STATES ---
  const [modsList, setModsList] = useState<any[]>([]);
  const [modsLoading, setModsLoading] = useState(false);
  const [selectedModIndex, setSelectedModIndex] = useState<number | null>(null);
  const [modLoaderLogs, setModLoaderLogs] = useState<string[]>(['[SYSTEM] Mod Loader initialized. Standby...']);
  
  // Custom Mod Builder form states
  const [builderId, setBuilderId] = useState('com.neon.my_custom_mod');
  const [builderName, setBuilderName] = useState('My Custom Mod Overdrive');
  const [builderAuthor, setBuilderAuthor] = useState('Pioneer_Modder');
  const [builderGravity, setBuilderGravity] = useState(5.0);
  const [builderJumpHeight, setBuilderJumpHeight] = useState(2.5);
  const [builderBotDifficulty, setBuilderBotDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [builderBotCount, setBuilderBotCount] = useState(6);
  const [builderFormat, setBuilderFormat] = useState<'al' | 'exe'>('al');
  const [isCompilingMod, setIsCompilingMod] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [compiledSuccessFile, setCompiledSuccessFile] = useState<string | null>(null);

  // Gamepad visualizer & configuration states
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('No controller detected. Press any button to initialize.');
  const [gamepadButtons, setGamepadButtons] = useState<boolean[]>(new Array(16).fill(false));
  const [gamepadAxes, setGamepadAxes] = useState<number[]>([0, 0, 0, 0]);
  const [gamepadDeadzone, setGamepadDeadzone] = useState(0.15);
  const [gamepadSensitivity, setGamepadSensitivity] = useState(1.5);
  const [gamepadLayout, setGamepadLayout] = useState<'default' | 'tactical' | 'bumper_jumper' | 'southpaw'>('default');
  const [isForceFeedbackActive, setIsForceFeedbackActive] = useState(false);

  // --- NEON STREAM STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [streamCategory, setStreamCategory] = useState<string>('all');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('5qap5aO4i9A'); // Lofi defaults
  const [savedVideos, setSavedVideos] = useState<string[]>(['URUJD5NEXC8', '5qap5aO4i9A']);
  const [subscriptions, setSubscriptions] = useState<string[]>(['NeonLofi', 'CrashCourse Bio']);
  const [watchHistory, setWatchHistory] = useState<string[]>(['5qap5aO4i9A']);
  const [cinemaModeActive, setCinemaModeActive] = useState(false);
  const [pipModeActive, setPipModeActive] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceInputSim, setVoiceInputSim] = useState('');
  const [parentalControls, setParentalControls] = useState(false);

  // --- NEON CINEMA STATES ---
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [selectedSeat, setSelectedSeat] = useState<string>('C-5');
  const [popcornCount, setPopcornCount] = useState(0);
  const [snacksShared, setSnacksShared] = useState(false);
  const [screenSizeMultiplier, setScreenSizeMultiplier] = useState(1.2); // IMAX slider
  const [theatreLightingDim, setTheatreLightingDim] = useState(0.85); // 0.0 to 1.0
  const [emojiStream, setEmojiStream] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [voiceChatMuted, setVoiceChatMuted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'connecting' | 'paused'>('synced');

  // --- NEON GYM STATES ---
  const [gymStreak, setGymStreak] = useState(5);
  const [gymCaloriesBurned, setGymCaloriesBurned] = useState(384);
  const [activeGymClass, setActiveGymClass] = useState<string | null>(null);
  const [gymClassProgress, setGymClassProgress] = useState(0);
  const [gymClassTimer, setGymClassTimer] = useState<number | null>(null);
  const [gymCompletedClasses, setGymCompletedClasses] = useState<string[]>(['stretching']);
  const [gymMissionsCompleted, setGymMissionsCompleted] = useState<string[]>([]);

  // --- SMART BOARD STATES ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [markerColor, setMarkerColor] = useState('#22d3ee'); // cyan-400
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<{ id: string; text: string; x: number; y: number; color: string }[]>([
    { id: '1', text: 'TACTICAL MATRIX: Attack Mitochondria from the north gate!', x: 400, y: 120, color: '#fef08a' }
  ]);
  const [newStickyText, setNewStickyText] = useState('');
  const [laserPointerMode, setLaserPointerMode] = useState(false);

  // --- VR OS & LOADER STATES ---
  const [boardRightTab, setBoardRightTab] = useState<'sticky' | 'vros'>('sticky');
  const [vrosFiles, setVrosFiles] = useState<{ name: string; size: string; content: string }[]>([
    { name: 'kernel.bin', size: '128 KB', content: 'VROS_KERNEL_ENTRY_POINT_0x00FF839\n// Initializing real-time 6DOF tracking handlers\n// Initializing virtual Vulkan driver interfaces\n// Binding OpenXR spatial coordinates' },
    { name: 'system.cfg', size: '4 KB', content: 'SYSTEM_NAME=NeonOS Spatial\nSYSTEM_RESOLUTION=2048x2048\nTARGET_FPS=120\nSTEREO_MODE=QUAD_BUFFERED\nDYNAMIC_LOD=ENABLED\nACCELEROMETER_SYNC_RATE=1000Hz\nTHERMAL_DAMPENING_FACTOR=0.75' },
    { name: 'driver_xr.sys', size: '256 KB', content: '// OpenXR Direct Spatial Driver Module\n// Binds physical accelerometer sensors to virtual viewport transforms\n// Resolves tracking latency to <3.5ms' },
    { name: 'app_pong.apk', size: '45.2 MB', content: '// Compiled Android SDK Executable Binary\n// Package: com.retrovr.pong3d\n// Assets decompressed: model_ball.obj, model_paddle.obj' }
  ]);
  const [newVrosFileName, setNewVrosFileName] = useState('');
  const [newVrosFileContent, setNewVrosFileContent] = useState('');
  const [vrosActiveKernel, setVrosActiveKernel] = useState('NeonOS Spatial Core');
  const [isVrosBooting, setIsVrosBooting] = useState(false);
  const [isVrosLoaded, setIsVrosLoaded] = useState(false);
  const [vrosBootLogs, setVrosBootLogs] = useState<string[]>([]);
  const [vrosSelectedFileForView, setVrosSelectedFileForView] = useState<{ name: string; size: string; content: string } | null>(null);
  const [vrosTerminalCommand, setVrosTerminalCommand] = useState('');
  const [vrosTerminalHistory, setVrosTerminalHistory] = useState<string[]>([
    'Welcome to NeonOS Spatial Shell Console v4.1',
    'Type "help" to list available system commands.'
  ]);
  const [vrosActiveScreen, setVrosActiveScreen] = useState<'launcher' | 'sysinfo' | 'explorer' | 'sensors' | 'matrix'>('launcher');
  const [vrosMatrixColor, setVrosMatrixColor] = useState('#10b981'); // emerald
  const [vrosMatrixOffset, setVrosMatrixOffset] = useState(0);

  // --- NEON HOME STATES ---
  const [homeWallpaper, setHomeWallpaper] = useState('grid'); // grid, vapor, space, charcoal
  const [homeSoundscape, setHomeSoundscape] = useState('chill'); // lofi, synth, ambient, quiet
  const [isHomeMusicPlaying, setIsHomeMusicPlaying] = useState(false);
  const [placedFurniture, setPlacedFurniture] = useState<{ id: string; name: string; x: number; y: number }[]>([
    { id: 'f1', name: 'Cyber Couch', x: 2, y: 1 },
    { id: 'f2', name: 'Holo Table', x: 0, y: 3 },
  ]);
  const [dailyNewsRead, setDailyNewsRead] = useState(false);

  // --- AURA AI STATES ---
  const [auraMessages, setAuraMessages] = useState<Array<{ sender: 'user' | 'aura'; text: string; time: string }>>([
    { sender: 'aura', text: "Salutations, Explorer. I am A.U.R.A, your AI guide. How can I facilitate your learning expedition in Neon Arena today?", time: '11:15' }
  ]);
  const [auraInput, setAuraInput] = useState('');
  const [auraIsTyping, setAuraIsTyping] = useState(false);
  const [auraGoalProgress, setAuraGoalProgress] = useState({
    videoCompleted: 1,
    whiteboardDrawn: 0,
    caloriesBurned: 120,
    targetCalories: 250
  });

  // Voice Search Simulation Timer
  useEffect(() => {
    if (voiceSearchActive) {
      setVoiceInputSim('Listening...');
      const timer = setTimeout(() => {
        const simPhrases = ['Lofi hip hop', 'Biology Crash Course', 'Mars Colony Tour', 'Boxing Workout'];
        const chosen = simPhrases[Math.floor(Math.random() * simPhrases.length)];
        setVoiceInputSim(`"${chosen}"`);
        setSearchQuery(chosen);
        setVoiceSearchActive(false);
        gainXP(15);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [voiceSearchActive]);

  // Workout Tracker Timer Simulation
  useEffect(() => {
    let interval: any;
    if (activeGymClass) {
      interval = setInterval(() => {
        setGymClassProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setGymCompletedClasses(old => [...old, activeGymClass]);
            gainXP(50);
            setActiveGymClass(null);
            alert(`Class Complete! Daily streak preserved. +50 XP and calorie threshold increased!`);
            return 0;
          }
          setGymCaloriesBurned(c => c + 3);
          return prev + 5;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeGymClass]);

  // Whiteboard Canvas Drawing Logic
  useEffect(() => {
    if (activeUniverseTab === 'board' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeUniverseTab]);

  // --- NEON MODS & CONTROLLERS FUNCTIONS ---
  const fetchModsList = async () => {
    setModsLoading(true);
    try {
      const res = await fetch('/api/mods');
      const data = await res.json();
      if (data.success) {
        setModsList(data.mods);
        addModLoaderLog(`[SYSTEM] Scanned physical mods folder. Found ${data.mods.length} mod configurations.`);
      } else {
        addModLoaderLog(`[ERROR] Failed to fetch mods: ${data.error}`);
      }
    } catch (err: any) {
      addModLoaderLog(`[ERROR] Network error fetching mods: ${err.message}`);
    } finally {
      setModsLoading(false);
    }
  };

  const addModLoaderLog = (msg: string) => {
    setModLoaderLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleLoadMod = async (filename: string) => {
    addModLoaderLog(`[LOADER] Requesting server to load mod: ${filename}...`);
    try {
      const res = await fetch('/api/mods/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, roomId: 'global' })
      });
      const data = await res.json();
      if (data.success) {
        addModLoaderLog(`[LOADER] SUCCESS: Mod applied to room. Server settings overwritten.`);
        addModLoaderLog(`[LOADER] New Gravity: ${data.settings?.gravity}m/s², Difficulty: ${data.settings?.botDifficulty}`);
        gainXP(30);
      } else {
        addModLoaderLog(`[LOADER] ERROR: ${data.error}`);
      }
    } catch (err: any) {
      addModLoaderLog(`[LOADER] Connection error loading mod: ${err.message}`);
    }
  };

  const handleDeleteMod = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename} from the mods directory?`)) return;
    try {
      const res = await fetch('/api/mods/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (data.success) {
        addModLoaderLog(`[SYSTEM] Deleted ${filename} successfully.`);
        fetchModsList();
      } else {
        addModLoaderLog(`[ERROR] Delete failed: ${data.error}`);
      }
    } catch (err: any) {
      addModLoaderLog(`[ERROR] Network error deleting: ${err.message}`);
    }
  };

  const handleCompileMod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompilingMod(true);
    setCompilerLogs(['[BUILDER] Compiling mod payload...', '[BUILDER] Verifying system compilation requirements...']);
    setCompiledSuccessFile(null);

    // Check Blender zip status
    let isZipValid = false;
    let zipSize = 0;
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      isZipValid = data.success && data.exists && !data.isPlaceholder && data.isValidZip;
      zipSize = data.size || 0;
    } catch (e) {
      console.error(e);
    }

    if (!isZipValid) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCompilerLogs([
        `[CRITICAL COMPILER ERROR] 🔒 MOD MAKER COMPILATION LOCKED!`,
        `[SYSTEM] File verification failed: No valid Blender .zip found at /blender.zip.`,
        `[SYSTEM] Please upload or replace the placeholder at "/blender.zip" with your real Blender zip package to unlock the compiling engine.`,
        `[SYSTEM] Automatically linking Blender zip inputs is currently OFFLINE.`
      ]);
      addModLoaderLog(`[ERROR] Mod Maker compilation locked. /blender.zip missing or invalid.`);
      setIsCompilingMod(false);
      try {
        soundService.playSFX('hit');
      } catch (e) {}
      return;
    }

    try {
      const payload = {
        modId: builderId,
        name: builderName,
        author: builderAuthor,
        format: builderFormat,
        settings: {
          gravity: builderGravity,
          jumpHeight: builderJumpHeight,
          botDifficulty: builderBotDifficulty,
          botCount: builderBotCount
        }
      };

      const res = await fetch('/api/mods/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Roll compiler logs progressively to make it look super satisfying
        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setCompilerLogs(prev => [...prev, data.logs[i]]);
        }
        setCompiledSuccessFile(data.filename);
        addModLoaderLog(`[COMPILER] Compilation output: ${data.filename} ready.`);
        gainXP(40);
        fetchModsList();

        // Trigger dynamic download
        const blobContent = typeof data.content === 'object' ? JSON.stringify(data.content, null, 2) : data.content;
        const blob = new Blob([blobContent], { type: builderFormat === 'exe' ? 'application/octet-stream' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addModLoaderLog(`[SYSTEM] Triggered direct browser download for ${data.filename}`);
      } else {
        setCompilerLogs(prev => [...prev, `[ERROR] Compile failed: ${data.error}`]);
      }
    } catch (err: any) {
      setCompilerLogs(prev => [...prev, `[ERROR] Network compilation failure: ${err.message}`]);
    } finally {
      setIsCompilingMod(false);
    }
  };

  // Run on mount or tab focus
  useEffect(() => {
    if (activeUniverseTab === 'mods_controllers') {
      fetchModsList();
    }
  }, [activeUniverseTab]);

  // Live Gamepad scanning loop
  useEffect(() => {
    let animationFrameId: number;
    let localDeadzone = gamepadDeadzone;

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let found = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp) {
          found = true;
          setGamepadConnected(true);
          setGamepadName(`${gp.id} [PORT ${gp.index}]`);

          // Poll buttons
          const btns = gp.buttons.map(b => b.pressed);
          setGamepadButtons(btns);

          // Poll axes
          const axes = gp.axes.map(a => Math.abs(a) > localDeadzone ? a : 0);
          setGamepadAxes(axes);
          break; // bind first active controller
        }
      }

      if (!found && gamepadConnected) {
        setGamepadConnected(false);
        setGamepadName('No controller detected. Press any button to initialize.');
        setGamepadButtons(new Array(16).fill(false));
        setGamepadAxes([0, 0, 0, 0]);
      }

      animationFrameId = requestAnimationFrame(pollGamepads);
    };

    animationFrameId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gamepadConnected, gamepadDeadzone]);

  const triggerVibrationTest = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let act = false;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.vibrationActuator) {
        act = true;
        setIsForceFeedbackActive(true);
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 800,
          weakMagnitude: 1.0,
          strongMagnitude: 1.0
        }).then(() => {
          setIsForceFeedbackActive(false);
        });
        break;
      }
    }
    if (!act) {
      setIsForceFeedbackActive(true);
      addModLoaderLog(`[CONTROLLER] Simulated rumble trigger (no physical gamepad actuator supported)`);
      setTimeout(() => setIsForceFeedbackActive(false), 800);
    } else {
      addModLoaderLog(`[CONTROLLER] Sent physical dual-rumble actuator trigger to Gamepad.`);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const handleCanvasMouseUp = () => {
    isDrawingRef.current = false;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#09090b' : markerColor; // Eraser uses slate backing color

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Laser pointer fading line logic (simple trigger)
    if (laserPointerMode) {
      setTimeout(() => {
        // Mock laser fading effect
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }, 1000);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveCanvasNotes = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      localStorage.setItem('neon_board_data', dataUrl);
      gainXP(20);
      alert('Strategy notes saved successfully into Local Space Terminal.');
    }
  };

  const loadCanvasNotes = () => {
    if (canvasRef.current) {
      const dataUrl = localStorage.getItem('neon_board_data');
      if (dataUrl) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new window.Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = dataUrl;
        }
      } else {
        alert('No saved notes found in the local profile cache.');
      }
    }
  };

  const addStickyNote = () => {
    if (!newStickyText.trim()) return;
    const colors = ['#fef08a', '#fda4af', '#93c5fd', '#86efac'];
    const chosenColor = colors[stickyNotes.length % colors.length];
    setStickyNotes(prev => [...prev, {
      id: Math.random().toString(),
      text: newStickyText,
      x: 50 + Math.random() * 300,
      y: 50 + Math.random() * 200,
      color: chosenColor
    }]);
    setNewStickyText('');
    gainXP(15);
  };

  const removeStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
  };

  // --- VR OS HELPER ACTIONS ---
  const bootVros = () => {
    setIsVrosLoaded(true);
    setIsVrosBooting(true);
    setVrosBootLogs([]);
    try { soundService.playSFX('ui_hover'); } catch (e) {}

    const logs = [
      "[VROS LOADER v2.10] Core UEFI initialization... [OK]",
      "[VROS LOADER v2.10] Mapping storage partitions... Mount: /dev/vros0",
      `[VROS LOADER v2.10] Reading boot parameters... Kernel: vr_os/kernel.bin`,
      `[VROS LOADER v2.10] Boot options parsing... Found system config: vr_os/system.cfg`,
      "----------------------------------------------------------------",
      "[VROS KERNEL] Initializing memory manager (12 GB LPDDR5 Allocated)...",
      "[VROS KERNEL] Spawning GPU worker threads (Adreno 740 pipeline)...",
      "[VROS KERNEL] Loading OpenXR Spatial runtime libraries... [SUCCESS]",
      "[VROS KERNEL] Establishing ADB wireless bridging tunnel on port 5555...",
      "[VROS KERNEL] Initializing 6-DOF tracking systems & LiDAR mapping indices...",
      "[VROS KERNEL] Spawning interactive system terminal bash interpreter...",
      "[VROS KERNEL] Boot sequence completed! Loading active desktop workspace..."
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        setVrosBootLogs(prev => [...prev, logs[currentLog]]);
        currentLog++;
        try { soundService.playSFX('ui_hover'); } catch (e) {}
      } else {
        clearInterval(interval);
        setIsVrosBooting(false);
        setVrosActiveScreen('launcher');
        gainXP(25);
        try { soundService.playSFX('achievement'); } catch (e) {}
      }
    }, 240);
  };

  const handleVrosFileCreate = () => {
    if (!newVrosFileName.trim()) {
      alert("Please specify a valid file name.");
      return;
    }
    const name = newVrosFileName.trim().toLowerCase().endsWith('.vros') || 
                 newVrosFileName.trim().toLowerCase().includes('.') 
                   ? newVrosFileName.trim() 
                   : `${newVrosFileName.trim()}.cfg`;

    const size = `${(newVrosFileContent.length / 1024 + 0.1).toFixed(1)} KB`;
    const newFile = {
      name,
      size,
      content: newVrosFileContent || "// User Created Empty File Configuration"
    };

    setVrosFiles(prev => {
      const filtered = prev.filter(f => f.name.toLowerCase() !== name.toLowerCase());
      return [...filtered, newFile];
    });

    setNewVrosFileName('');
    setNewVrosFileContent('');
    gainXP(15);
    try { soundService.playSFX('achievement'); } catch (e) {}
  };

  const handleVrosFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || '// Raw Binary Descriptor';
        const name = droppedFile.name;
        const size = `${(droppedFile.size / 1024).toFixed(1)} KB`;
        setVrosFiles(prev => {
          const filtered = prev.filter(f => f.name.toLowerCase() !== name.toLowerCase());
          return [...filtered, { name, size, content: text }];
        });
        gainXP(20);
        try { soundService.playSFX('achievement'); } catch (e) {}
      };
      reader.readAsText(droppedFile);
    }
  };

  const executeVrosCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;
    const parts = trimmed.split(' ');
    const baseCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    let reply = '';
    if (baseCmd === 'help') {
      reply = 'AVAILABLE SYSTEM COMMANDS:\n  help        - Display this microkernel console help menu\n  ls          - List folders & files inside the vr_os/ directory\n  cat <file>  - Output contents of a file inside vr_os/ (e.g. cat system.cfg)\n  neofetch    - Renders hardware system and kernel specifications\n  ping        - Status connection handshake with physical sensors\n  clear       - Wipe terminal logs\n  matrix      - Start falling digital green matrix screensaver\n  reboot      - Terminate operating system kernel & return to board';
    } else if (baseCmd === 'ls') {
      reply = `DIRECTORY OF vr_os/:\n${vrosFiles.map(f => `  - ${f.name}   (${f.size})`).join('\n')}`;
    } else if (baseCmd === 'cat') {
      if (!arg) {
        reply = 'USAGE: cat <filename>   (e.g., cat system.cfg)';
      } else {
        const found = vrosFiles.find(f => f.name.toLowerCase() === arg.toLowerCase());
        if (found) {
          reply = `DUMPING FILE: vr_os/${found.name} (${found.size})\n----------------------------------------\n${found.content}`;
        } else {
          reply = `ERROR: File 'vr_os/${arg}' not found. Use 'ls' to see list.`;
        }
      }
    } else if (baseCmd === 'neofetch') {
      reply = `      _  _   ___   _  _     NeonOS Core v4.1.18-standalone\n     | \\| | | __| | \\| |    Kernel: Linux-XR v5.15-OpenXR\n     | .\` | | _|  | .\` |    Shell: vros-sh v1.0.4\n     |_|\\_| |___| |_|\\_|    Uptime: 2.5 minutes\n                            Resolution: Dual-Stereo 2048x2048@120Hz\n  ██████████████████████    CPU: Qualcomm Snapdragon XR2 Gen 2\n  ██████████████████████    GPU: Adreno 740 Spatial Engine\n                            Memory: 3.48 GB / 12.00 GB (29% used)\n                            Storage: Sideload Block Device '/dev/sda1'`;
    } else if (baseCmd === 'ping') {
      reply = `PINGING HEADSET SENSOR ARRAYS (192.168.1.189):\n  64 bytes from IMU_ACCEL_0: icmp_seq=1 ttl=64 time=0.85ms\n  64 bytes from IMU_GYRO_0:  icmp_seq=2 ttl=64 time=0.92ms\n  64 bytes from LIDAR_RAY_A: icmp_seq=3 ttl=64 time=1.45ms\n  --- 192.168.1.189 ping statistics ---\n  3 packets transmitted, 3 received, 0% packet loss, rtt min/avg/max = 0.85/1.07/1.45 ms`;
    } else if (baseCmd === 'clear') {
      setVrosTerminalHistory([]);
      setVrosTerminalCommand('');
      return;
    } else if (baseCmd === 'matrix') {
      setVrosActiveScreen('matrix');
      reply = 'Starting Matrix Screensaver...';
    } else if (baseCmd === 'reboot') {
      setIsVrosLoaded(false);
      setIsVrosBooting(false);
      setVrosBootLogs([]);
      try { soundService.playSFX('hit'); } catch (e) {}
      return;
    } else {
      reply = `vros-sh: command not found: '${trimmed}'. Type 'help' for a list of available tasks.`;
    }

    setVrosTerminalHistory(prev => [...prev, `vros@neon-kernel ~ $ ${trimmed}`, reply]);
    setVrosTerminalCommand('');
    try { soundService.playSFX('ui_hover'); } catch (e) {}
  };

  // Cinema Reactions Emoji Spammer
  const spawnEmoji = (emoji: string) => {
    const id = Math.random().toString();
    setEmojiStream(prev => [...prev, { id, emoji, left: 15 + Math.random() * 70 }]);
    setTimeout(() => {
      setEmojiStream(prev => prev.filter(item => item.id !== id));
    }, 2000);
  };

  // AURA AI Dialog logic
  const handleSendAuraMessage = () => {
    if (!auraInput.trim()) return;
    const userMsg = auraInput;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAuraMessages(prev => [...prev, { sender: 'user', text: userMsg, time }]);
    setAuraInput('');
    setAuraIsTyping(true);

    setTimeout(() => {
      let responseText = "My cognitive registers are analyzing your query... Make sure to explore the specialized portal zones for further insights!";
      const q = userMsg.toLowerCase();

      if (q.includes('recommend') || q.includes('video') || q.includes('stream')) {
        responseText = "Retrieving database match... I recommend tuning in to: 'Mitochondria: The Epic Powerhouse of the Living Cell' or checking out 'Lofi Hip Hop Radio' for deep concentration.";
      } else if (q.includes('smart') || q.includes('board') || q.includes('draw') || q.includes('write')) {
        responseText = "Our spatial Smart Board lets you sketch designs using the canvas. You can pick multiple neon marker colors, scale brush dimensions, or overlay helpful sticky reminders!";
      } else if (q.includes('home') || q.includes('furniture') || q.includes('wallpaper')) {
        responseText = "To customize your Neon Home, switch over to the Home tab where you can alter wallpaper backdrops (like Vaporwave Sunrise) and mix comforting cyber soundtracks.";
      } else if (q.includes('gym') || q.includes('work') || q.includes('yoga') || q.includes('boxing')) {
        responseText = "For fitness regimes, the Gym section features tailored programs. Follow any class (Cardio, Stretching, Yoga, Boxing) to preserve your 5-day streak!";
      } else if (q.includes('goal') || q.includes('progress') || q.includes('level')) {
        responseText = `You are currently Level ${level} with ${xp} XP. Your daily objective is to burn 250 calories and complete 1 science whiteboard sketch. Keep advancing!`;
      } else if (q.includes('how to play') || q.includes('mechanic')) {
        responseText = "Neon Arena links spatial locomotion with visual exploration. Approach portal gateway nodes in the Hub, approach objectives, and click structure organelles to inspect physiological metrics!";
      }

      setAuraMessages(prev => [...prev, { sender: 'aura', text: responseText, time }]);
      setAuraIsTyping(false);
      gainXP(10);
    }, 1500);
  };

  // Filter YouTube Videos based on search/category/parental controls
  const filteredVideos = YOUTUBE_VIDEOS.filter(vid => {
    if (parentalControls && (vid.category === 'gaming' || vid.category === 'music')) {
      return false; // Parental controls block gaming and lofi music
    }
    if (streamCategory !== 'all' && vid.category !== streamCategory) {
      return false;
    }
    if (searchQuery) {
      return vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             vid.channel.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Recommends based on Active Dimension
  const getAcademyRecommendations = () => {
    switch (activeDimension) {
      case 'biology':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Mitochondria') || v.title.includes('Cell') || v.title.includes('BioKids'));
      case 'chemistry':
      case 'chemistry_lab':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Bonding') || v.category === 'educational');
      case 'physics':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Gravitational') || v.title.includes('Friction'));
      case 'coding':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Loops') || v.title.includes('Strategy'));
      case 'space':
      case 'solar_system':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Planets') || v.title.includes('Mars') || v.title.includes('Asteroid'));
      case 'history':
        return YOUTUBE_VIDEOS.filter(v => v.title.includes('Hieroglyphs') || v.title.includes('Pyramid'));
      default:
        return YOUTUBE_VIDEOS.slice(0, 4); // default recommendations
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl z-[200] flex flex-col p-6 overflow-hidden text-slate-200 border-2 border-cyan-500/20 shadow-[0_0_80px_rgba(6,182,212,0.15)] rounded-[2.5rem] pointer-events-auto select-none">
      
      {/* Top Banner Control Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-fuchsia-600 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30">
            <Globe className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '30s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-[0.3em] text-cyan-400 uppercase bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">MULTIVERSE ONLINE</span>
              <span className="text-[9px] font-black tracking-[0.3em] text-fuchsia-400 uppercase bg-fuchsia-950/50 px-2 py-0.5 rounded border border-fuchsia-800/30">QUEST 3/PRO MRREADY</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase italic mt-1">NEON ARENA VIRTUAL HUB</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-2xl text-xs font-mono">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Level {level}</span>
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <span className="text-cyan-400 font-bold">{xp} XP</span>
          </div>

          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            ✕ Close Hub
          </button>
        </div>
      </div>

      {/* Main Grid: Left Navigation / Right Content Pane */}
      <div className="flex-1 flex gap-5 overflow-hidden">
        
        {/* Left Side Tab Navigation Panels */}
        <div className="w-60 flex flex-col justify-between shrink-0 bg-slate-900/50 border border-slate-800 rounded-3xl p-4">
          <div className="space-y-1.5">
            <span className="text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase block px-2 mb-2">VIRTUAL SECTORS</span>
            
            {[
              { id: 'stream', label: '🎥 NEON STREAM', desc: 'YouTube Media Player' },
              { id: 'cinema', label: '🎬 NEON CINEMA', desc: 'Interactive Theater' },
              { id: 'gym', label: '🏋️ NEON GYM', desc: 'Fitness & Streaks' },
              { id: 'academy', label: '📚 PORTAL VIDEO LEARNING', desc: 'Subject Recommendations' },
              { id: 'board', label: '📝 SMART BOARD', desc: 'Canvas Drawing Tablet' },
              { id: 'home', label: '🏠 NEON HOME', desc: 'Personal Room Designer' },
              { id: 'aura', label: '🤖 AURA AI COMPANION', desc: 'Interactive Guidance' },
              { id: 'mods_controllers', label: '🎮 CONTROLLERS & MODS', desc: 'Gamepads & ModLoader' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveUniverseTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-start ${
                  activeUniverseTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{tab.desc}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-850 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 animate-pulse text-[8px] font-black uppercase tracking-widest">
              <Sparkle className="w-3 h-3" />
              SYSTEM OVERLINK SECURE
            </div>
            <p className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-Platform Sync Engine 2.6</p>
          </div>
        </div>

        {/* Right Side Content Frame */}
        <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 flex flex-col overflow-hidden relative">
          
          {/* ========================================================= */}
          {/* 1. NEON STREAM MODULE */}
          {/* ========================================================= */}
          {activeUniverseTab === 'stream' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">NEON STREAM</h3>
                  <div className="h-4 w-[1px] bg-slate-800" />
                  <span className="text-[9px] text-slate-400 font-black uppercase">PUBLIC YOUTUBE TRANS-STREAM SERVICE</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Voice search button */}
                  <button
                    onClick={() => setVoiceSearchActive(true)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      voiceSearchActive 
                        ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                        : 'bg-slate-800 hover:bg-slate-700 text-rose-400'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {voiceSearchActive ? 'Listening...' : 'Voice Search'}
                  </button>

                  {/* Parental controls */}
                  <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={parentalControls} 
                      onChange={(e) => setParentalControls(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    Parental Guard
                  </label>
                </div>
              </div>

              {/* Top search & filter bar */}
              <div className="flex gap-2.5 mb-4 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search YouTube videos or creator channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-[11px] font-bold text-slate-200 placeholder-slate-500 uppercase focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Categories selectors */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none shrink-0 border-b border-slate-800/60 mb-4">
                {[
                  { id: 'all', label: 'All Streams' },
                  { id: 'gaming', label: '🎮 Gaming' },
                  { id: 'educational', label: '📚 Learning' },
                  { id: 'music', label: '🎵 Music' },
                  { id: 'fitness', label: '🏋️ Fitness' },
                  { id: 'space', label: '🚀 Space' },
                  { id: 'history', label: '🏺 History' },
                  { id: 'kids', label: '👶 Kids' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setStreamCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      streamCategory === cat.id
                        ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Main Content Layout: Video Player on top/left, Playlist on right */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                
                {/* Active Player Box */}
                <div className="flex-1 flex flex-col bg-black rounded-3xl border border-slate-800 overflow-hidden relative">
                  
                  {/* YouTube Iframe Embed */}
                  <div className="flex-1 w-full bg-slate-950 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&enablejsapi=1`}
                      title="YouTube stream viewer"
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Player Metadata & Controls */}
                  <div className="p-4 bg-slate-950 shrink-0 border-t border-slate-850">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-[12px] font-black text-white uppercase tracking-wide">
                          {YOUTUBE_VIDEOS.find(v => v.id === selectedVideoId)?.title || 'Now Playing YouTube Stream'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[8.5px] font-mono text-slate-500 uppercase">
                          <span>Channel: {YOUTUBE_VIDEOS.find(v => v.id === selectedVideoId)?.channel || 'Verified Creator'}</span>
                          <span>•</span>
                          <span>Views: {YOUTUBE_VIDEOS.find(v => v.id === selectedVideoId)?.views || '100K'}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {/* Save to Playlist */}
                        <button
                          onClick={() => {
                            if (savedVideos.includes(selectedVideoId)) {
                              setSavedVideos(old => old.filter(id => id !== selectedVideoId));
                            } else {
                              setSavedVideos(old => [...old, selectedVideoId]);
                              gainXP(10);
                            }
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            savedVideos.includes(selectedVideoId)
                              ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Save/Like Video"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>

                        {/* Cinema Mode Switcher */}
                        <button
                          onClick={() => {
                            setCinemaModeActive(true);
                            setActiveUniverseTab('cinema');
                          }}
                          className="px-2.5 py-1.5 bg-cyan-500 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Film className="w-3.5 h-3.5" />
                          Watch Cinema Together
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream catalog / Playlists bar */}
                <div className="w-72 bg-slate-900/30 border border-slate-800 rounded-3xl p-3 flex flex-col overflow-hidden">
                  <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2 mb-2 flex justify-between items-center">
                    <span>STREAMS FOUND ({filteredVideos.length})</span>
                    {voiceInputSim && <span className="text-rose-400 animate-pulse font-mono lowercase">{voiceInputSim}</span>}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {filteredVideos.map(vid => {
                      const isActive = vid.id === selectedVideoId;
                      return (
                        <div
                          key={vid.id}
                          onClick={() => {
                            setSelectedVideoId(vid.id);
                            if (!watchHistory.includes(vid.id)) {
                              setWatchHistory(old => [vid.id, ...old].slice(0, 10));
                            }
                            gainXP(5);
                          }}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-2.5 ${
                            isActive
                              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100'
                          }`}
                        >
                          {/* Thumbnail Simulator */}
                          <div className="w-20 h-12 bg-black rounded-lg border border-slate-800 shrink-0 flex items-center justify-center relative overflow-hidden">
                            <Play className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                            <div className="absolute bottom-1 right-1 bg-black/75 text-[7px] font-mono font-black text-white px-1 rounded">
                              {vid.duration}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <h5 className="text-[9px] font-black uppercase leading-tight truncate">{vid.title}</h5>
                            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate">{vid.channel}</span>
                          </div>
                        </div>
                      );
                    })}

                    {filteredVideos.length === 0 && (
                      <div className="py-8 text-center text-slate-600 uppercase font-bold text-[8px] tracking-widest">
                        No streams match controls filter.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. NEON CINEMA WATCH-TOGETHER MODULE */}
          {/* ========================================================= */}
          {activeUniverseTab === 'cinema' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">🎬 NEON CINEMA IMAX</h3>
                  <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full uppercase tracking-widest">SYNCHRONIZED ROOM</span>
                </div>

                <div className="flex gap-2 text-[8px] font-mono font-black uppercase">
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>Sync Status: {syncStatus.toUpperCase()} (100%)</span>
                  </div>

                  <button
                    onClick={() => {
                      setRoomType(r => r === 'public' ? 'private' : 'public');
                      gainXP(10);
                    }}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl cursor-pointer"
                  >
                    Room Type: {roomType.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* IMAX Giant Screen Backgound Simulation */}
              <div 
                className="flex-1 rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 border border-slate-800 transition-all duration-700"
                style={{ backgroundColor: `rgba(9, 9, 11, ${theatreLightingDim})` }}
              >
                {/* Floating reacting emojis over theater */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {emojiStream.map(item => (
                    <div
                      key={item.id}
                      className="absolute bottom-10 text-3xl animate-bounce"
                      style={{ left: `${item.left}%`, animationDuration: '1.5s', transform: 'translateY(-100px)', opacity: 0.8 }}
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>

                {/* The IMAX Movie Stream */}
                <div 
                  className="mx-auto w-full max-w-2xl bg-black rounded-2xl border-2 border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden transition-all"
                  style={{ transform: `scale(${screenSizeMultiplier})`, transformOrigin: 'top center' }}
                >
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=0`}
                      title="Cinema Movie Screen"
                      className="w-full h-full border-none"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 flex justify-between items-center border-t border-slate-850 text-[8.5px] font-mono">
                    <span className="text-cyan-400">IMAX SCREEN PROJECTION SYSTEM</span>
                    <span className="text-zinc-500">NOW VIEWING WITH 4 FRIENDS ONLINE</span>
                  </div>
                </div>

                {/* Row of Seat Selection & Interactive Overlay */}
                <div className="z-10 bg-slate-950/90 border border-slate-850/80 p-3.5 rounded-2xl flex flex-wrap justify-between items-center gap-3 mt-4">
                  
                  {/* Comfortable Seat Layout selector */}
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">RESERVE SEATING</span>
                    <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-slate-800">
                      {['A-2', 'B-4', 'C-5', 'D-1', 'E-8'].map(seat => (
                        <button
                          key={seat}
                          onClick={() => {
                            setSelectedSeat(seat);
                            gainXP(15);
                          }}
                          className={`px-2 py-1 rounded text-[8px] font-black transition-all cursor-pointer ${
                            selectedSeat === seat
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          Seat {seat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Snack Clicks POPCORN */}
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">SNACK BAR VIRTUAL DISPENSER</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setPopcornCount(c => c + 1);
                          spawnEmoji('🍿');
                          gainXP(5);
                        }}
                        className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        🍿 Popcorn ({popcornCount})
                      </button>
                      <button
                        onClick={() => {
                          setSnacksShared(true);
                          spawnEmoji('🥤');
                          gainXP(10);
                          setTimeout(() => setSnacksShared(false), 2000);
                        }}
                        className="px-3 py-1 bg-rose-500 text-white font-black text-[8px] uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        🥤 Share Soda {snacksShared && '✓'}
                      </button>
                    </div>
                  </div>

                  {/* Dimmers & Screen Size control */}
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">THEATRE DIMMERS</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase">LTS</span>
                        <input
                          type="range"
                          min="0.3"
                          max="1.0"
                          step="0.05"
                          value={theatreLightingDim}
                          onChange={(e) => setTheatreLightingDim(parseFloat(e.target.value))}
                          className="w-16 accent-cyan-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase">SIZE</span>
                        <input
                          type="range"
                          min="0.8"
                          max="1.3"
                          step="0.05"
                          value={screenSizeMultiplier}
                          onChange={(e) => setScreenSizeMultiplier(parseFloat(e.target.value))}
                          className="w-16 accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emoji bar for rapid reactions */}
              <div className="flex items-center justify-between mt-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SEND REAL-TIME REACTION EMOJI:</span>
                  <div className="flex gap-2">
                    {['🔥', '👍', '❤️', '🎉', '😮', '👏', '🍿', '🥤', '💀'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => spawnEmoji(emoji)}
                        className="text-lg hover:scale-120 transition-all cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setVoiceChatMuted(v => !v);
                      gainXP(5);
                    }}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer ${
                      voiceChatMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {voiceChatMuted ? '🎤 Voice Muted' : '🎤 Voice Connected'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. NEON GYM WORKOUT & CLASSES */}
          {/* ========================================================= */}
          {activeUniverseTab === 'gym' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">🏋️ NEON FITNESS GYM</h3>
                  <span className="text-[9px] font-bold bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">WORKOUT STREAK LOG</span>
                </div>

                <div className="flex items-center gap-3 text-[9px] font-mono font-black">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-fuchsia-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.1)]">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span>STREAK: {gymStreak} DAYS</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-cyan-400">
                    <span>CALORIES: {gymCaloriesBurned} KCAL</span>
                  </div>
                </div>
              </div>

              {/* Gym main layout */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                
                {/* Active class video instructions panel */}
                <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 p-5 flex flex-col justify-between">
                  {activeGymClass ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-3">
                          <h4 className="text-[12px] font-black text-fuchsia-400 uppercase tracking-wider">
                            ACTIVE REGIME: {activeGymClass.toUpperCase()} TRAINING
                          </h4>
                          <span className="text-[9px] text-slate-500 font-mono">COUNTDOWN TIME SEQUENCER</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Recommended workout actions:</p>
                        <div className="space-y-2 mt-2">
                          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-850 text-white font-bold text-[11px] flex justify-between">
                            <span>Step 1: Deep diaphragmatic breathing cycle (Sync with expanding rings)</span>
                            <span className="text-cyan-400">ACTIVE</span>
                          </div>
                          <div className="bg-slate-900/20 p-3 rounded-2xl border border-slate-900 text-slate-500 font-bold text-[11px]">
                            <span>Step 2: Cardio pulse-rate acceleration stretch (4-5 stretch sets)</span>
                            <span>STANDBY</span>
                          </div>
                        </div>
                      </div>

                      {/* Fitness class progress bar */}
                      <div className="mt-6">
                        <div className="flex justify-between text-[9px] font-mono font-black uppercase text-fuchsia-400 mb-2">
                          <span>REGIME COMPLETION</span>
                          <span>{gymClassProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-full transition-all duration-300"
                            style={{ width: `${gymClassProgress}%` }}
                          />
                        </div>
                        <p className="text-[7.5px] text-center text-slate-500 uppercase tracking-widest mt-2">Remain focused. Do not disconnect VR headset during session.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Dumbbell className="w-12 h-12 text-slate-600 animate-bounce mb-3" />
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">NO ACTIVE WORKOUT SELECTED</h4>
                      <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed mt-2 uppercase">
                        Select an ambient spatial training class from the list on the right. Keeping active completes daily quests and triggers XP milestones!
                      </p>
                    </div>
                  )}
                </div>

                {/* Gym regimes list & Badges */}
                <div className="w-80 flex flex-col gap-3 shrink-0">
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 flex-1 flex flex-col overflow-hidden">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2 mb-2 block">
                      SPATIAL TRAINING SCHEDULE
                    </span>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {[
                        { id: 'stretching', label: '🧘 Stretching & Flexibility Guide', calories: '50 kcal', duration: '5 min', xp: '+25' },
                        { id: 'yoga', label: '🌸 Gentle Hatha Yoga postures', calories: '90 kcal', duration: '10 min', xp: '+40' },
                        { id: 'cardio', label: '🏃 High-Tempo Cardio Burn Accelerator', calories: '180 kcal', duration: '15 min', xp: '+75' },
                        { id: 'boxing', label: '🥊 Cyber Box Rhythm Fist-Puncher', calories: '220 kcal', duration: '20 min', xp: '+100' },
                        { id: 'dance', label: '🕺 Retro EDM Choreography Beats', calories: '150 kcal', duration: '12 min', xp: '+60' }
                      ].map(regime => {
                        const isCompleted = gymCompletedClasses.includes(regime.id);
                        const isSelected = activeGymClass === regime.id;
                        return (
                          <div
                            key={regime.id}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-300'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <h5 className="text-[10px] font-black uppercase tracking-wide leading-tight">{regime.label}</h5>
                                <div className="flex gap-2 text-[8px] font-mono text-slate-500 uppercase mt-1">
                                  <span>{regime.calories}</span>
                                  <span>•</span>
                                  <span>{regime.duration}</span>
                                </div>
                              </div>
                              {isCompleted && <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">DONE</span>}
                            </div>

                            <button
                              disabled={!!activeGymClass}
                              onClick={() => {
                                setActiveGymClass(regime.id);
                                setGymClassProgress(0);
                                gainXP(10);
                              }}
                              className={`w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                isSelected
                                  ? 'bg-fuchsia-500 text-white shadow-lg'
                                  : isCompleted
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isSelected ? 'Workout in Progress...' : isCompleted ? 'Restart Workout Class' : 'Begin Class Routine'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Achievements and fitness badges shelf */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-3.5 shrink-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block border-b border-slate-800 pb-1.5">
                      GYM BADGES UNLOCKED
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                        <Award className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-pulse" />
                        <span className="text-[7.5px] font-black uppercase block text-slate-400">Calories Destroyer</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                        <Award className="w-5 h-5 text-fuchsia-400 mx-auto mb-1" />
                        <span className="text-[7.5px] font-black uppercase block text-slate-400">Zen Posture</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-850/40 opacity-40">
                        <Award className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                        <span className="text-[7.5px] font-black uppercase block text-slate-500">Cardio King</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. INFINITY ACADEMY SUBJECT RECOMMENDATIONS */}
          {/* ========================================================= */}
          {activeUniverseTab === 'academy' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="border-b border-slate-800 pb-3 mb-4 shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">📚 SUBJECT VIDEO RECO</h3>
                  <span className="text-[9px] font-black bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                    ACTIVE DIMENSION LINKED
                  </span>
                </div>
                
                <span className="text-[10px] text-fuchsia-400 font-mono font-bold uppercase">
                  CURRENT COORDINATES: {activeDimension.toUpperCase()} REALM
                </span>
              </div>

              {/* Subject recommendations display */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-850 flex items-center justify-between gap-5 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-white uppercase tracking-wide">
                      Infinity Academy Subject recommendations
                    </h4>
                    <p className="text-[9.5px] text-slate-400 leading-relaxed uppercase max-w-xl mt-1 font-semibold">
                      When exploring specific subject domains (Biology Kingdom, History Portal, Coding Island), AURA dynamically parses stream catalogs to deliver targeted tutorial lessons automatically!
                    </p>
                  </div>
                </div>
              </div>

              {/* The Subject Video Recommendation Grid list */}
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                RECOMMENDED LESSONS MATCHED FOR "{activeDimension.toUpperCase()}"
              </span>
              
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1 custom-scrollbar">
                {getAcademyRecommendations().map(vid => (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setSelectedVideoId(vid.id);
                      setActiveUniverseTab('stream');
                      gainXP(20);
                      alert(`Playing recommended lessons for ${activeDimension.toUpperCase()}: ${vid.title}`);
                    }}
                    className="bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 p-3.5 rounded-2xl flex gap-3.5 items-center cursor-pointer hover:bg-slate-900/80 transition-all group"
                  >
                    <div className="w-24 h-14 bg-slate-950 rounded-xl border border-slate-850 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <Play className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-all" />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[7px] font-mono px-1 rounded">{vid.duration}</div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[7.5px] font-black uppercase text-cyan-400 tracking-wider bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/30">
                        {vid.category}
                      </span>
                      <h4 className="text-[10px] font-black text-white uppercase mt-1 leading-normal line-clamp-2">{vid.title}</h4>
                      <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">{vid.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. SMART BOARD CANVAS DRAWING */}
          {/* ========================================================= */}
          {activeUniverseTab === 'board' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">📝 PRO SMART BOARD</h3>
                  <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full uppercase tracking-widest">COLLABORATIVE DRAW ENGINE</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={saveCanvasNotes}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={loadCanvasNotes}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white/70 font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Load Notes
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Clear Board
                  </button>
                </div>
              </div>

              {/* Whiteboard Controls toolbar */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-wrap justify-between items-center gap-3 mb-3 shrink-0">
                {/* Brush Colors */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MARKER COLOR:</span>
                  <div className="flex gap-1.5">
                    {['#22d3ee', '#f43f5e', '#10b981', '#f59e0b', '#a78bfa', '#ffffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setMarkerColor(color);
                          setIsEraser(false);
                        }}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          markerColor === color && !isEraser ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Eraser and laser toggles */}
                <div className="flex items-center gap-2 text-[8px] font-mono font-black uppercase">
                  <button
                    onClick={() => setIsEraser(p => !p)}
                    className={`px-3 py-1.5 rounded-xl border cursor-pointer ${
                      isEraser ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    🧹 Eraser Mode
                  </button>

                  <button
                    onClick={() => {
                      setLaserPointerMode(p => !p);
                      gainXP(5);
                    }}
                    className={`px-3 py-1.5 rounded-xl border cursor-pointer ${
                      laserPointerMode ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                    title="Laser lines fade out after 1 second"
                  >
                    💡 Laser Pointer
                  </button>

                  {/* Size slider */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                    <span className="text-slate-500">SIZE:</span>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-16 accent-cyan-400"
                    />
                    <span className="text-cyan-400">{brushSize}PX</span>
                  </div>
                </div>
              </div>

              {/* Main Drawing Stage Area */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                {/* HTML Canvas drawing surface OR VR OS Live Desktop Environment */}
                <div className="flex-1 bg-[#09090b] rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
                  {isVrosLoaded ? (
                    // --- VR OS ACTIVE INTERFACE SCREEN ---
                    <div className="w-full h-full flex flex-col justify-between bg-zinc-950 font-mono text-[9px] relative overflow-hidden select-none">
                      {/* CRT SCANLINE SHIELD EFFECT */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent bg-[length:100%_4px] opacity-40 z-20" />
                      
                      {/* VROS Status Bar */}
                      <div className="bg-zinc-900 border-b border-zinc-800 p-2 flex items-center justify-between text-[8px] z-10 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                          <span className="font-black text-white uppercase tracking-wider">NEON_OS CORE v4.1.18</span>
                          <span className="text-zinc-500 px-1 border border-zinc-800 rounded bg-zinc-950">ACTIVE_KERNEL: {vrosActiveKernel.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 font-bold">
                          <span className="text-emerald-400 font-bold">RAM: 3.48GB / 12GB</span>
                          <span className="text-cyan-400 font-bold">FPS: 120.4</span>
                          <span className="text-amber-400 font-bold">TEMP: 34°C</span>
                          <button
                            onClick={() => {
                              setIsVrosLoaded(false);
                              setIsVrosBooting(false);
                              setVrosBootLogs([]);
                              try { soundService.playSFX('hit'); } catch (e) {}
                            }}
                            className="text-rose-400 hover:text-rose-300 font-black uppercase text-[7px] border border-rose-500/20 px-1.5 py-0.5 bg-rose-950/20 rounded cursor-pointer"
                          >
                            [SHUTDOWN]
                          </button>
                        </div>
                      </div>

                      {/* VROS Main Screen Frame */}
                      {isVrosBooting ? (
                        // --- 1. BOOTING SHELL SEQUENCE ---
                        <div className="flex-1 p-4 bg-black flex flex-col justify-between overflow-hidden">
                          <div className="flex-1 overflow-y-auto space-y-1 text-emerald-400 text-[8px] leading-relaxed custom-scrollbar max-h-52">
                            {vrosBootLogs.map((log, index) => (
                              <div key={index} className="truncate font-mono">
                                {log}
                              </div>
                            ))}
                            <div className="text-emerald-400 animate-pulse font-mono font-black mt-2">
                              _ LOADING SPATIAL_SUBSYSTEMS...
                            </div>
                          </div>

                          {/* Loading progress bar */}
                          <div className="space-y-1.5 mt-2 shrink-0">
                            <div className="flex justify-between items-center text-[7.5px] text-zinc-500 font-bold uppercase">
                              <span>Handshaking boot vectors</span>
                              <span>{Math.floor((vrosBootLogs.length / 12) * 100)}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-150"
                                style={{ width: `${(vrosBootLogs.length / 12) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // --- 2. ACTIVE WORKSPACE LAYOUT ---
                        <div className="flex-1 flex min-h-0 relative z-10">
                          {/* Desktop Launcher / Sidebar */}
                          <div className="w-24 bg-zinc-950 border-r border-zinc-900 p-2 flex flex-col gap-2 shrink-0">
                            <div className="text-[7px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1 mb-1">
                              SYSTEM APPS
                            </div>

                            {[
                              { id: 'launcher', name: 'Launcher', icon: Rocket },
                              { id: 'sysinfo', name: 'SysInfo', icon: Cpu },
                              { id: 'explorer', name: 'Explorer', icon: Folder },
                              { id: 'sensors', name: 'Sensors', icon: Activity },
                              { id: 'matrix', name: 'Matrix Rain', icon: Code2 }
                            ].map((app) => {
                              const AppIcon = app.icon;
                              const isActive = vrosActiveScreen === app.id;
                              return (
                                <button
                                  key={app.id}
                                  onClick={() => {
                                    setVrosActiveScreen(app.id as any);
                                    try { soundService.playSFX('ui_hover'); } catch (e) {}
                                  }}
                                  className={`w-full py-2 px-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-md'
                                      : 'bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  <AppIcon size={10} className={isActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'} />
                                  <span className="text-[7.5px] font-black uppercase truncate">{app.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Desktop Window Screen Viewport */}
                          <div className="flex-1 flex flex-col min-w-0 bg-black/60 relative">
                            {/* App Viewports */}
                            {vrosActiveScreen === 'launcher' && (
                              <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                                <div>
                                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Rocket size={10} />
                                    Desktop Launcher Workspace
                                  </h4>
                                  <p className="text-[7.5px] text-zinc-500 uppercase tracking-wide leading-relaxed">
                                    Welcome to the virtual sandbox. Launch spatial analyzers or access the shell interpreter console on the right panel to execute real-time instructions.
                                  </p>

                                  <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div 
                                      onClick={() => setVrosActiveScreen('sysinfo')}
                                      className="p-2 border border-zinc-900 bg-zinc-900/30 rounded-lg hover:border-emerald-500/30 cursor-pointer transition-all flex items-start gap-2 group"
                                    >
                                      <Cpu size={12} className="text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                      <div>
                                        <div className="text-[8px] font-black text-white uppercase">System Telemetry</div>
                                        <p className="text-[6.5px] text-zinc-500 uppercase mt-0.5 leading-normal">Monitor hardware clocks, thread pipelines and Vulkan memory blocks.</p>
                                      </div>
                                    </div>

                                    <div 
                                      onClick={() => setVrosActiveScreen('explorer')}
                                      className="p-2 border border-zinc-900 bg-zinc-900/30 rounded-lg hover:border-cyan-500/30 cursor-pointer transition-all flex items-start gap-2 group"
                                    >
                                      <Folder size={12} className="text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                      <div>
                                        <div className="text-[8px] font-black text-white uppercase">File Explorer</div>
                                        <p className="text-[6.5px] text-zinc-500 uppercase mt-0.5 leading-normal">Read, write and inspect the virtual filesystem mounts under /vr_os/.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 bg-zinc-950/60 p-2 rounded-lg border border-zinc-900/50 flex gap-2 items-center text-[7.5px] text-zinc-400 leading-normal">
                                  <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <p className="uppercase">
                                    You can drop custom configuration or APK files into the <strong>📂 VR OS Cabinet</strong> panel on the right side of the whiteboard to mount them into this operating system dynamically!
                                  </p>
                                </div>
                              </div>
                            )}

                            {vrosActiveScreen === 'sysinfo' && (
                              <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1 shrink-0 font-bold">
                                  <Cpu size={10} />
                                  Hardware Telemetry Monitor
                                </h4>

                                <div className="grid grid-cols-2 gap-2 shrink-0">
                                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 space-y-1">
                                    <span className="text-[7px] text-zinc-500 uppercase font-bold block">Qualcomm Snapdragon XR2 G2</span>
                                    <div className="flex justify-between text-[7.5px] font-mono">
                                      <span className="text-zinc-400">CORE-0 CLOCK</span>
                                      <span className="text-emerald-400 font-bold">2.84 GHz</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                      <div className="bg-emerald-500 h-full w-[65%]" />
                                    </div>
                                    <div className="flex justify-between text-[7.5px] font-mono">
                                      <span className="text-zinc-400">CORE-1 CLOCK</span>
                                      <span className="text-emerald-400 font-bold">2.42 GHz</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                      <div className="bg-emerald-500 h-full w-[45%]" />
                                    </div>
                                  </div>

                                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 space-y-1">
                                    <span className="text-[7px] text-zinc-500 uppercase font-bold block">Memory Footprint Diagnostics</span>
                                    <div className="flex justify-between text-[7.5px] font-mono">
                                      <span className="text-zinc-400">VIRTUAL HEAP</span>
                                      <span className="text-cyan-400 font-bold">3.48 / 12.0 GB</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                      <div className="bg-cyan-500 h-full w-[29%]" />
                                    </div>
                                    <p className="text-[6.5px] text-zinc-600 uppercase mt-1 leading-none">Vulkan dynamic cache bounds optimized for OpenXR tracking latency.</p>
                                  </div>
                                </div>

                                {/* Active Threads Listing */}
                                <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-900 p-2 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                                  <div>
                                    <span className="text-[7px] text-zinc-500 uppercase font-bold block border-b border-zinc-900 pb-1 mb-1">Active Core Daemons</span>
                                    <div className="space-y-1 text-[7.5px] font-mono text-zinc-400">
                                      <div className="flex justify-between hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-emerald-400">● xr_trackingd [PID 120]</span>
                                        <span>6-DOF IMU Loop (1000Hz) - RUNNING</span>
                                      </div>
                                      <div className="flex justify-between hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-emerald-400">● vulkan_renderd [PID 124]</span>
                                        <span>Double-Buffer Frame Synced (120FPS) - RUNNING</span>
                                      </div>
                                      <div className="flex justify-between hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-cyan-400">● adb_wi_bridge [PID 145]</span>
                                        <span>Listening: 192.168.1.189:5555 - ACTIVE</span>
                                      </div>
                                      <div className="flex justify-between hover:bg-white/5 p-0.5 rounded">
                                        <span className="text-zinc-500">○ thermal_throttled [PID 102]</span>
                                        <span>Ambient Core Temp 34.5°C - SLEEP</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {vrosActiveScreen === 'explorer' && (
                              <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-0.5 flex items-center gap-1 shrink-0">
                                  <Folder size={10} />
                                  Virtual Filesystem Viewer
                                </h4>
                                <p className="text-[7.5px] text-zinc-500 uppercase leading-snug shrink-0">
                                  Click any file in the list below to launch the **Virtual Code Editor** to review or modify parameters inside the booted OS space.
                                </p>

                                <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                                  <div className="bg-zinc-950 rounded-lg border border-zinc-900 p-2 overflow-y-auto custom-scrollbar space-y-1">
                                    <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest block border-b border-zinc-900 pb-1 mb-1">
                                      📂 mounts/vr_os/ ({vrosFiles.length} files)
                                    </span>
                                    {vrosFiles.map((file, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => {
                                          setVrosSelectedFileForView(file);
                                          try { soundService.playSFX('ui_hover'); } catch (e) {}
                                        }}
                                        className={`p-1.5 rounded border text-[7.5px] font-mono cursor-pointer transition-all flex items-center justify-between ${
                                          vrosSelectedFileForView?.name === file.name
                                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                                            : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900/60 text-zinc-400 hover:text-white'
                                        }`}
                                      >
                                        <span className="truncate flex items-center gap-1">
                                          <Code2 size={8} />
                                          {file.name}
                                        </span>
                                        <span className="text-[6.5px] text-zinc-500 font-bold uppercase">{file.size}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="bg-zinc-950 rounded-lg border border-zinc-900 p-2 flex flex-col justify-between min-h-0">
                                    {vrosSelectedFileForView ? (
                                      <div className="flex flex-col h-full justify-between">
                                        <div className="min-h-0 flex flex-col flex-1">
                                          <div className="flex justify-between items-center border-b border-zinc-900 pb-1 mb-1 shrink-0">
                                            <span className="text-[7.5px] text-cyan-400 font-mono font-bold truncate">
                                              EDITING: {vrosSelectedFileForView.name}
                                            </span>
                                            <span className="text-[6.5px] text-zinc-500">{vrosSelectedFileForView.size}</span>
                                          </div>
                                          <textarea
                                            value={vrosSelectedFileForView.content}
                                            onChange={(e) => {
                                              const newContent = e.target.value;
                                              setVrosSelectedFileForView(prev => prev ? { ...prev, content: newContent } : null);
                                            }}
                                            className="w-full bg-black/50 border border-zinc-900 p-1 text-[7.5px] font-mono text-cyan-200 placeholder-zinc-700 h-28 resize-none focus:outline-none focus:border-cyan-500/40 custom-scrollbar flex-1"
                                          />
                                        </div>
                                        <button
                                          onClick={() => {
                                            setVrosFiles(prev => {
                                              const filtered = prev.filter(f => f.name.toLowerCase() !== vrosSelectedFileForView.name.toLowerCase());
                                              return [...filtered, vrosSelectedFileForView];
                                            });
                                            try { soundService.playSFX('achievement'); } catch (e) {}
                                            alert(`Saved file vr_os/${vrosSelectedFileForView.name} successfully inside core mounts.`);
                                          }}
                                          className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[7.5px] font-black uppercase tracking-widest rounded mt-1.5 shrink-0 cursor-pointer"
                                        >
                                          Save File Changes
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-zinc-600">
                                        <Code2 size={24} className="opacity-30 mb-1.5" />
                                        <span className="text-[8px] font-black uppercase tracking-wider">No File Selected</span>
                                        <p className="text-[6.5px] uppercase tracking-wide mt-1">Select any file on the left mount directory list to edit it.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {vrosActiveScreen === 'sensors' && (
                              <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-0.5 flex items-center gap-1 shrink-0">
                                  <Activity size={10} />
                                  6-DOF Sensor Alignment Grid
                                </h4>
                                <p className="text-[7.5px] text-zinc-500 uppercase leading-snug shrink-0">
                                  Hover or move your cursor inside the radar grid below to trigger real-time sensor interrupts, calibrating gyroscopes and LiDAR mapping registers.
                                </p>

                                {/* Radar Grid */}
                                <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl relative overflow-hidden flex items-center justify-center group cursor-pointer p-4 min-h-0">
                                  {/* Center concentric target lines */}
                                  <div className="absolute w-24 h-24 rounded-full border border-zinc-900 flex items-center justify-center animate-pulse">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-zinc-900 flex items-center justify-center">
                                      <div className="w-4 h-4 rounded-full border border-zinc-800" />
                                    </div>
                                  </div>

                                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />

                                  {/* Holographic dials */}
                                  <div className="absolute text-[7.5px] font-mono text-amber-500/50 flex flex-col gap-1 items-center select-none pointer-events-none">
                                    <span className="font-black animate-pulse">GYRO RE-ALIGNING...</span>
                                    <span>PITCH: ({(Math.random() * 2 - 1).toFixed(4)})</span>
                                    <span>ROLL: ({(Math.random() * 2 - 1).toFixed(4)})</span>
                                    <span>YAW: ({(Math.random() * 2 - 1).toFixed(4)})</span>
                                  </div>

                                  {/* Laser Crosshairs */}
                                  <div className="absolute left-0 right-0 h-px bg-zinc-900/80 pointer-events-none" />
                                  <div className="absolute top-0 bottom-0 w-px bg-zinc-900/80 pointer-events-none" />

                                  {/* Interactive tracking node */}
                                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-110 shadow-[0_0_10px_#f59e0b]" />
                                </div>
                              </div>
                            )}

                            {vrosActiveScreen === 'matrix' && (
                              <div className="flex-1 p-3 bg-black flex flex-col justify-between overflow-hidden relative font-mono text-emerald-500">
                                <div className="absolute top-2 right-2 flex gap-1 z-10 shrink-0">
                                  {['#10b981', '#22d3ee', '#f59e0b', '#f43f5e'].map(color => (
                                    <button
                                      key={color}
                                      onClick={() => setVrosMatrixColor(color)}
                                      style={{ backgroundColor: color }}
                                      className="w-3.5 h-3.5 rounded-full border border-black hover:scale-105 cursor-pointer"
                                    />
                                  ))}
                                </div>

                                <div className="text-[7.5px] leading-relaxed select-none space-y-1.5 flex-1 mt-2 overflow-hidden pointer-events-none">
                                  <div className="text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1" style={{ color: vrosMatrixColor }}>
                                    <Code2 size={11} /> DIGITAL MATRIX RE-FLOW
                                  </div>
                                  <p className="text-zinc-600 text-[7px] uppercase tracking-wider">Rerouting OpenXR kernel frame buffers directly into standard whiteboard matrix matrices:</p>
                                  
                                  <div className="space-y-0.5 font-mono text-[7px] opacity-80" style={{ color: vrosMatrixColor }}>
                                    <div>01001001 01001110 01001001 01010100 01011001 (INITIATING)</div>
                                    <div>10010101 00101010 11010101 01010101 00101011 (LIDAR_LOCK)</div>
                                    <div>00101101 11010101 01101010 01011111 00010101 (XR_FRAME_OK)</div>
                                    <div>11010111 00101101 01010101 10101011 01010101 (6DOF_ACTIVE)</div>
                                    <div>01101010 01011111 01101101 11010101 01101010 (VULKAN_PIPE)</div>
                                    <div>10010111 00101101 01010101 10101011 01010101 (RENDER_DONE)</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // --- CANVAS DRAWING BOARD (STANDARD) ---
                    <>
                      <canvas
                        ref={canvasRef}
                        width={560}
                        height={280}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        onMouseMove={draw}
                        className="w-full h-full cursor-crosshair bg-slate-950/40"
                      />
                      {/* Floating guide overlay instructions */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-[7px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 pointer-events-none">
                        🖍️ Hold left mouse click & drag inside canvas area to sketch strategy
                      </div>

                      {/* Overlay spawned sticky notes */}
                      {stickyNotes.map(note => (
                        <div
                          key={note.id}
                          style={{ backgroundColor: note.color, left: note.x, top: note.y }}
                          className="absolute p-2.5 rounded-xl text-slate-950 font-sans shadow-lg max-w-[120px] text-[8px] font-bold border border-slate-900/10 cursor-move group select-text"
                        >
                          <button
                            onClick={() => removeStickyNote(note.id)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[8px] hover:scale-110 cursor-pointer border border-white/20"
                          >
                            ✕
                          </button>
                          <p className="uppercase break-words leading-snug">{note.text}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Right side widget drawer (Sticky notes & VR OS Workspace Folder with Loader) */}
                <div className="w-56 bg-slate-900/40 border border-slate-800 p-3 rounded-3xl flex flex-col justify-between shrink-0 overflow-hidden font-mono text-[9px]">
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header sub-tabs selector */}
                    <div className="flex border-b border-slate-800 pb-2 mb-2 select-none shrink-0">
                      <button
                        onClick={() => {
                          setBoardRightTab('sticky');
                          try { soundService.playSFX('ui_hover'); } catch (e) {}
                        }}
                        className={`flex-1 text-center py-1 font-black uppercase text-[8px] tracking-wider transition-all rounded-md cursor-pointer ${
                          boardRightTab === 'sticky'
                            ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        📌 STICKYS
                      </button>
                      <button
                        onClick={() => {
                          setBoardRightTab('vros');
                          try { soundService.playSFX('ui_hover'); } catch (e) {}
                        }}
                        className={`flex-1 text-center py-1 font-black uppercase text-[8px] tracking-wider transition-all rounded-md cursor-pointer ${
                          boardRightTab === 'vros'
                            ? 'bg-slate-800 text-amber-400 border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        📂 VR OS
                      </button>
                    </div>

                    {boardRightTab === 'sticky' ? (
                      // --- STICKY NOTES TAB ---
                      <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            STICKY NOTES PANEL
                          </span>
                          <p className="text-[7px] text-slate-500 uppercase mb-2 font-bold leading-normal">
                            Add glowing sticky reminders and pin them over your battlefield maps strategy whiteboard:
                          </p>
                          
                          <textarea
                            placeholder="Type note content here..."
                            value={newStickyText}
                            onChange={(e) => setNewStickyText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[9px] uppercase font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 h-24 resize-none"
                          />
                        </div>

                        <button
                          onClick={addStickyNote}
                          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-slate-950 font-black text-[8px] uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
                        >
                          Add Sticky Note
                        </button>
                      </div>
                    ) : (
                      // --- VR OS WORKSPACE & LOADER TAB ---
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleVrosFileDrop}
                        className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar pr-0.5 space-y-2.5"
                      >
                        {/* Directory folder tree */}
                        <div className="space-y-1">
                          <span className="text-[7.5px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                            <Folder size={10} className="text-amber-400 shrink-0" />
                            FOLDER: mounts/vr_os/
                          </span>

                          <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-xl text-[7.5px] max-h-24 overflow-y-auto custom-scrollbar space-y-0.5 text-slate-300">
                            {vrosFiles.map((f, i) => (
                              <div key={i} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                <span className="truncate max-w-[120px] text-slate-400 flex items-center gap-1">
                                  <span className="text-[7px]">📄</span>
                                  {f.name}
                                </span>
                                <span className="text-[6.5px] text-slate-600 font-bold uppercase">{f.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* File Sideload/Creation Form */}
                        <div className="space-y-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-850">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider block">
                            Create System File
                          </span>
                          <input
                            type="text"
                            placeholder="filename.vros"
                            value={newVrosFileName}
                            onChange={(e) => setNewVrosFileName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[7.5px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/50"
                          />
                          <textarea
                            placeholder="file parameters/text..."
                            value={newVrosFileContent}
                            onChange={(e) => setNewVrosFileContent(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[7.5px] font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/50 h-10 resize-none"
                          />
                          <button
                            onClick={handleVrosFileCreate}
                            className="w-full py-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-[6.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                          >
                            Save to vr_os folder
                          </button>
                        </div>

                        {/* OS KERNEL SELECT & LOADER BUTTON */}
                        <div className="space-y-1 pt-1.5 border-t border-slate-850">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">
                            SYSTEM OS LOADER
                          </span>

                          <select
                            value={vrosActiveKernel}
                            onChange={(e) => setVrosActiveKernel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-1 text-[7.5px] font-mono focus:outline-none focus:border-amber-500"
                          >
                            <option value="NeonOS Spatial Core">NeonOS Spatial Core</option>
                            <option value="QuestOS Core (Vulkan-XR)">QuestOS Core (Vulkan-XR)</option>
                            <option value="RetroVR emulator Core">RetroVR emulator Core</option>
                          </select>

                          <button
                            onClick={bootVros}
                            disabled={isVrosLoaded}
                            className={`w-full py-1.5 ${
                              isVrosLoaded 
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse' 
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                            } text-[8px] uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md`}
                          >
                            {isVrosLoaded ? '⚡ OS Core Loaded' : '⚡ Load VR OS'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shell command terminal input (Shows at bottom if OS is booted) */}
                  {isVrosLoaded && !isVrosBooting && (
                    <div className="mt-2 pt-2 border-t border-slate-850 flex flex-col shrink-0">
                      <span className="text-[7.5px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
                        BASH INTERPRETER SHELL
                      </span>
                      <div className="bg-black border border-slate-850 rounded-lg p-1 flex flex-col gap-1">
                        {/* Terminal mini History list */}
                        <div className="h-20 overflow-y-auto text-[7px] font-mono text-emerald-500 space-y-1 p-0.5 border border-zinc-900 bg-zinc-950/40 rounded custom-scrollbar">
                          {vrosTerminalHistory.slice(-15).map((log, idx) => (
                            <div key={idx} className="whitespace-pre-wrap leading-normal break-all">
                              {log}
                            </div>
                          ))}
                        </div>

                        {/* Interactive command input row */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            executeVrosCommand(vrosTerminalCommand);
                          }}
                          className="flex items-center gap-1 mt-0.5 border-t border-zinc-900 pt-1"
                        >
                          <span className="text-[7px] text-zinc-500 select-none">vros$</span>
                          <input
                            type="text"
                            value={vrosTerminalCommand}
                            onChange={(e) => setVrosTerminalCommand(e.target.value)}
                            placeholder='Type "help" here...'
                            className="flex-1 bg-transparent border-none text-[7px] font-mono text-emerald-400 placeholder-zinc-700 focus:outline-none uppercase"
                          />
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. NEON HOME SPACE DESIGNER */}
          {/* ========================================================= */}
          {activeUniverseTab === 'home' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">🏠 NEON VIRTUAL HOME</h3>
                  <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full uppercase tracking-widest">CUSTOM ENCLAVE</span>
                </div>

                {/* Audio soundtrack player */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[9px] font-mono font-black">
                  <button
                    onClick={() => {
                      setIsHomeMusicPlaying(p => !p);
                      gainXP(10);
                    }}
                    className={`px-2 py-0.5 rounded text-[8px] cursor-pointer ${
                      isHomeMusicPlaying ? 'bg-emerald-500 text-zinc-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isHomeMusicPlaying ? '🔊 ON' : '🔇 OFF'}
                  </button>
                  <span className="text-slate-400">MUSIC: {homeSoundscape.toUpperCase()} FLOW</span>
                </div>
              </div>

              {/* Customized Home Preview Backdrop */}
              <div 
                className="flex-1 rounded-3xl p-5 border border-slate-800 relative flex flex-col justify-between overflow-hidden"
                style={{ 
                  background: homeWallpaper === 'grid' 
                    ? 'radial-gradient(circle, rgba(15,23,42,1) 30%, rgba(6,182,212,0.15) 100%)'
                    : homeWallpaper === 'vapor'
                    ? 'linear-gradient(135deg, rgba(15,23,42,1) 40%, rgba(219,39,119,0.2) 100%)'
                    : homeWallpaper === 'space'
                    ? 'radial-gradient(circle, rgba(9,9,11,1) 50%, rgba(124,58,237,0.15) 100%)'
                    : 'bg-zinc-950'
                }}
              >
                {/* Floating ambient audio bar visualizer */}
                {isHomeMusicPlaying && (
                  <div className="absolute top-4 right-4 flex items-end gap-1 h-6">
                    {[12, 24, 16, 8, 20, 14, 22].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-cyan-400 rounded-full animate-pulse" 
                        style={{ height: `${h}px`, animationDuration: `${0.4 + i * 0.1}s` }} 
                      />
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">NEON APARTMENT DESIGNER</h4>
                  <p className="text-[8.5px] text-slate-400 uppercase tracking-widest mt-0.5">Custom interior parameters & soundscape mix</p>
                </div>

                {/* Placed coordinates grid */}
                <div className="bg-black/60 p-3 rounded-2xl border border-slate-850 max-w-sm mt-4 text-[8px] font-mono">
                  <span className="text-cyan-400 uppercase font-black block mb-1">🛋️ PLACED INTERIOR BLUEPRINT</span>
                  {placedFurniture.map(fur => (
                    <div key={fur.id} className="flex justify-between py-1 border-b border-slate-900 text-slate-400">
                      <span>{fur.name}</span>
                      <span>Coordinates: X={fur.x} | Y={fur.y}</span>
                    </div>
                  ))}
                </div>

                {/* Cyber daily news reader */}
                <div className="bg-slate-950/90 border border-cyan-500/10 p-3 rounded-2xl mt-4 flex items-start gap-3">
                  <div className="p-1.5 bg-cyan-500/10 border border-cyan-400/20 rounded-xl">
                    <Tv className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[7.5px] font-mono font-black text-cyan-400 block">DAILY NEWS ARCHIVE OVERLINK</span>
                    <h5 className="text-[10px] font-black text-white uppercase mt-0.5">NEW PORTAL SYSTEM ENTERS THE WHITE VOID</h5>
                    <p className="text-[8px] text-slate-500 leading-snug mt-1 uppercase">
                      "Engineers compile modular workspace systems allowing users to spawn interactive whiteboards, stream Youtube documentaries, and launch customized cyber environments instantly."
                    </p>
                  </div>
                </div>

                {/* Home custom triggers */}
                <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl flex flex-wrap justify-between items-center gap-3 mt-4">
                  
                  {/* Wallpaper selects */}
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">WALLPAPER THEME</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'grid', label: 'Neon Grid' },
                        { id: 'vapor', label: 'Vaporwave Sunset' },
                        { id: 'space', label: 'Space Nebula' },
                        { id: 'charcoal', label: 'Charcoal Minimal' }
                      ].map(wp => (
                        <button
                          key={wp.id}
                          onClick={() => {
                            setHomeWallpaper(wp.id);
                            gainXP(15);
                          }}
                          className={`px-2.5 py-1 rounded text-[8px] font-black transition-all cursor-pointer ${
                            homeWallpaper === wp.id
                              ? 'bg-cyan-400 text-slate-950 shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {wp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Soundscape selects */}
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">AMBIENT SOUNDSCAPE</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'chill', label: '🎧 Lofi Chill' },
                        { id: 'synth', label: '🎹 Retro Synth' },
                        { id: 'ambient', label: '🌌 Space Ambient' }
                      ].map(sc => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            setHomeSoundscape(sc.id);
                            gainXP(10);
                          }}
                          className={`px-2.5 py-1 rounded text-[8px] font-black transition-all cursor-pointer ${
                            homeSoundscape === sc.id
                              ? 'bg-fuchsia-500 text-white shadow-md'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. AURA AI COMPANION PANEL */}
          {/* ========================================================= */}
          {activeUniverseTab === 'aura' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">🤖 AURA AI COMPANION</h3>
                  <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">ACTIVE NEURAL CHAT</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-[8px] font-mono text-zinc-500">
                  <span>A.U.R.A MATRIX v4.2 ONLINE</span>
                </div>
              </div>

              {/* AURA chat conversation viewport */}
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                
                {/* Chat window panel */}
                <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-4 custom-scrollbar">
                    {auraMessages.map((msg, idx) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          <div className={`p-1.5 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center border ${
                            isUser ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-cyan-500/10 border-cyan-500/20'
                          }`}>
                            {isUser ? <Smile className="w-4 h-4 text-fuchsia-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                          </div>

                          <div className={`p-3 rounded-2xl relative ${
                            isUser 
                              ? 'bg-fuchsia-500/5 border border-fuchsia-500/20 text-white' 
                              : 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-100'
                          }`}>
                            <p className="text-[10px] font-semibold leading-relaxed uppercase">{msg.text}</p>
                            <span className="absolute bottom-1 right-2 text-[6px] font-mono text-slate-500">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}

                    {auraIsTyping && (
                      <div className="flex gap-2 items-center text-slate-500 text-[8px] font-black uppercase tracking-widest">
                        <Bot className="w-3.5 h-3.5 animate-spin" />
                        AURA is compiling guides...
                      </div>
                    )}
                  </div>

                  {/* Predefined quick question chips list */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5 shrink-0 border-t border-slate-850 pt-3">
                    {[
                      "Recommend a Biology video",
                      "How do I use the Smart Board?",
                      "How to craft a custom environment?",
                      "Give me a daily goal"
                    ].map(chip => (
                      <button
                        key={chip}
                        onClick={() => {
                          setAuraInput(chip);
                          gainXP(5);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[8px] font-bold text-slate-400 hover:text-white rounded-lg transition-all uppercase cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2.5 shrink-0">
                    <input
                      type="text"
                      placeholder="Ask AURA recommendations or explain game mechanics..."
                      value={auraInput}
                      onChange={(e) => setAuraInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAuraMessage()}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-[10px] font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 uppercase"
                    />
                    <button
                      onClick={handleSendAuraMessage}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                    >
                      Ask
                    </button>
                  </div>
                </div>

                {/* Goals progress tracking sidebar */}
                <div className="w-64 bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between shrink-0">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2 mb-2">
                      DAILY OBJECTIVE TRACKER
                    </span>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between text-[8px] font-mono font-black uppercase text-cyan-400 mb-1">
                          <span>CALORIC EXERTION</span>
                          <span>{gymCaloriesBurned} / 500 KCAL</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, (gymCaloriesBurned / 500) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[8px] font-mono font-black uppercase text-fuchsia-400 mb-1">
                          <span>SCIENCE LESSON STREAMS</span>
                          <span>{watchHistory.length} / 3 VIDEOS</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-fuchsia-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, (watchHistory.length / 3) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[8px] font-mono font-black uppercase text-amber-400 mb-1">
                          <span>WHITEBOARD DIAGRAMS</span>
                          <span>{stickyNotes.length > 1 ? 1 : 0} / 1 SKETCH</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${stickyNotes.length > 1 ? 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block mb-1">ACTIVE WEEKLY MILESTONE</span>
                    <h5 className="text-[9px] font-black text-white uppercase italic">METAVERSE ALUMNI ACCOMPLISHMENT</h5>
                    <p className="text-[7.5px] text-slate-400 uppercase mt-1 leading-normal">
                      Complete 1 stretching routine and view 2 subject recommendations to unlock the exclusive "Neon Pioneer" visual environment skin!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. NEON CONTROLLERS & MODS ENGINE */}
          {/* ========================================================= */}
          {activeUniverseTab === 'mods_controllers' && (
            <div className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {/* Module Header */}
              <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                    <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">🎮 CONTROLLER INTERFACES & HARDWARE MODS</h3>
                    <p className="text-[8.5px] text-slate-400 uppercase tracking-wider mt-0.5">
                      Cross-Platform Dual-Shock Gamepad Diagnostic Matrix & Standalone Compiler (.EXE / .AL)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${gamepadConnected ? 'bg-cyan-400' : 'bg-rose-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${gamepadConnected ? 'bg-cyan-500' : 'bg-rose-500'}`}></span>
                  </span>
                  <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400">
                    {gamepadConnected ? 'XINPUT/DIRECTINPUT CALIBRATED' : 'STANDBY MODE'}
                  </span>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* LEFT COLUMN: GAMEPAD INTERACTIVE CALIBRATOR (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-[9px] font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" /> GAMEPAD CALIBRATION MATRIX
                      </span>
                      <button
                        onClick={triggerVibrationTest}
                        disabled={isForceFeedbackActive}
                        className={`px-2.5 py-1 text-[8px] font-mono rounded border transition-all ${
                          isForceFeedbackActive 
                            ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 animate-bounce' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300'
                        }`}
                      >
                        {isForceFeedbackActive ? '⚡ RUMBLE ACTUATING...' : '🎮 TRIGGER HAPTIC RUMBLE'}
                      </button>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                      <div className="text-[8px] text-slate-500 font-mono uppercase">DETECTED GAMEPAD SIGNATURE:</div>
                      <div className="text-[9.5px] font-mono text-cyan-300 font-bold mt-0.5 truncate leading-tight">
                        {gamepadName}
                      </div>
                    </div>

                    {/* Symmetrical Gamepad CSS Visualizer */}
                    <div className="flex flex-col items-center justify-center py-4 bg-slate-950/80 rounded-xl border border-slate-850/60 relative">
                      {/* Controller Case Shape */}
                      <div className="w-64 h-32 bg-slate-900/90 rounded-[40px] border border-slate-800 relative shadow-2xl flex items-center justify-between px-8">
                        
                        {/* D-PAD (Left Side) */}
                        <div className="flex flex-col items-center gap-0.5 relative">
                          <div className={`w-4 h-4 bg-slate-800 border border-slate-750 flex items-center justify-center rounded-sm text-[7px] text-slate-500 font-mono ${gamepadButtons[12] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : ''}`}>▲</div>
                          <div className="flex gap-4">
                            <div className={`w-4 h-4 bg-slate-800 border border-slate-750 flex items-center justify-center rounded-sm text-[7px] text-slate-500 font-mono ${gamepadButtons[14] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : ''}`}>◀</div>
                            <div className={`w-4 h-4 bg-slate-800 border border-slate-750 flex items-center justify-center rounded-sm text-[7px] text-slate-500 font-mono ${gamepadButtons[15] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : ''}`}>▶</div>
                          </div>
                          <div className={`w-4 h-4 bg-slate-800 border border-slate-750 flex items-center justify-center rounded-sm text-[7px] text-slate-500 font-mono ${gamepadButtons[13] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : ''}`}>▼</div>
                          <span className="text-[6.5px] text-slate-500 font-black tracking-widest mt-1">D-PAD</span>
                        </div>

                        {/* Analog Stick Indicators (Left & Right) */}
                        <div className="flex gap-6 absolute left-1/2 -translate-x-1/2 bottom-4">
                          {/* Left Analog */}
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                              <div 
                                className={`w-4 h-4 rounded-full bg-slate-700 border border-slate-500 absolute transition-all duration-75 shadow-lg ${gamepadButtons[10] ? 'bg-cyan-400 border-white' : ''}`}
                                style={{
                                  transform: `translate(${gamepadAxes[0] * 12}px, ${gamepadAxes[1] * 12}px)`
                                }}
                              />
                            </div>
                            <span className="text-[5.5px] text-slate-500 font-mono uppercase mt-1">LX: {gamepadAxes[0].toFixed(2)}</span>
                          </div>

                          {/* Right Analog */}
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                              <div 
                                className={`w-4 h-4 rounded-full bg-slate-700 border border-slate-500 absolute transition-all duration-75 shadow-lg ${gamepadButtons[11] ? 'bg-fuchsia-400 border-white' : ''}`}
                                style={{
                                  transform: `translate(${gamepadAxes[2] * 12}px, ${gamepadAxes[3] * 12}px)`
                                }}
                              />
                            </div>
                            <span className="text-[5.5px] text-slate-500 font-mono uppercase mt-1">RX: {gamepadAxes[2].toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Action Buttons (Right Side - XYAB) */}
                        <div className="flex flex-col items-center gap-0.5 relative">
                          <div className={`w-4 h-4 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[7px] text-slate-300 font-bold ${gamepadButtons[3] ? 'bg-fuchsia-500/40 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : ''}`}>Y</div>
                          <div className="flex gap-4">
                            <div className={`w-4 h-4 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[7px] text-slate-300 font-bold ${gamepadButtons[2] ? 'bg-fuchsia-500/40 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : ''}`}>X</div>
                            <div className={`w-4 h-4 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[7px] text-slate-300 font-bold ${gamepadButtons[1] ? 'bg-fuchsia-500/40 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : ''}`}>B</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[7px] text-slate-300 font-bold ${gamepadButtons[0] ? 'bg-fuchsia-500/40 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : ''}`}>A</div>
                          <span className="text-[6.5px] text-slate-500 font-black tracking-widest mt-1">ACTION</span>
                        </div>

                        {/* Triggers & Bumpers (Top Visualizers) */}
                        <div className="absolute -top-3 left-6 flex gap-1.5">
                          <div className={`px-2 py-0.5 text-[6px] font-mono border rounded ${gamepadButtons[4] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>LB</div>
                          <div className={`px-2 py-0.5 text-[6px] font-mono border rounded ${gamepadButtons[6] ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>LT</div>
                        </div>
                        <div className="absolute -top-3 right-6 flex gap-1.5">
                          <div className={`px-2 py-0.5 text-[6px] font-mono border rounded ${gamepadButtons[7] ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>RT</div>
                          <div className={`px-2 py-0.5 text-[6px] font-mono border rounded ${gamepadButtons[5] ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>RB</div>
                        </div>

                        {/* Center Start/Select Buttons */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
                          <div className={`w-3 h-1.5 rounded-sm bg-slate-800 border border-slate-750 ${gamepadButtons[8] ? 'bg-cyan-400' : ''}`} title="Select" />
                          <div className={`w-3 h-1.5 rounded-sm bg-slate-800 border border-slate-750 ${gamepadButtons[9] ? 'bg-fuchsia-400' : ''}`} title="Start" />
                        </div>

                      </div>
                    </div>

                    {/* Calibration Sliders */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider">
                          <span className="text-slate-400">STICK DEADZONE</span>
                          <span className="text-cyan-400 font-bold">{(gamepadDeadzone * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.40"
                          step="0.01"
                          value={gamepadDeadzone}
                          onChange={(e) => setGamepadDeadzone(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 bg-slate-800 h-1 rounded-lg cursor-pointer"
                        />
                        <span className="text-[6.5px] text-slate-500 block uppercase tracking-wide">
                          Recommended: 15% to eliminate stick drift.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider">
                          <span className="text-slate-400">LOOK SENSITIVITY</span>
                          <span className="text-fuchsia-400 font-bold">{gamepadSensitivity.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="4.0"
                          step="0.1"
                          value={gamepadSensitivity}
                          onChange={(e) => setGamepadSensitivity(parseFloat(e.target.value))}
                          className="w-full accent-fuchsia-400 bg-slate-800 h-1 rounded-lg cursor-pointer"
                        />
                        <span className="text-[6.5px] text-slate-500 block uppercase tracking-wide">
                          Alters 3D pitch/yaw tracking multipliers.
                        </span>
                      </div>
                    </div>

                    {/* Layout Selector */}
                    <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">BUTTON MAP LAYOUTS</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'default', label: 'FPS DEFAULT', desc: 'A: Jump | RT: Shoot' },
                          { id: 'tactical', label: 'TACTICAL', desc: 'R3: Crouch | B: Melee' },
                          { id: 'bumper_jumper', label: 'BUMPER JUMP', desc: 'LB: Jump | A: Ability' },
                          { id: 'southpaw', label: 'SOUTHPAW', desc: 'Swap Left/Right Stick' }
                        ].map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setGamepadLayout(preset.id as any);
                              addModLoaderLog(`[CONTROLLER] Button map set to: ${preset.label}`);
                            }}
                            className={`p-2 rounded border text-left flex flex-col justify-between cursor-pointer transition-all ${
                              gamepadLayout === preset.id 
                                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="text-[8px] font-black">{preset.label}</span>
                            <span className="text-[5.5px] font-bold text-slate-500 mt-1 uppercase leading-tight">{preset.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Mod Loader Console Output Logs */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[9px] font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-fuchsia-400" /> SYSTEM MODLOADER DIAGNOSTIC LOG
                      </span>
                      <button
                        onClick={() => setModLoaderLogs(['[SYSTEM] Log cache cleared.'])}
                        className="text-[6.5px] font-bold tracking-widest text-slate-500 hover:text-slate-300 uppercase"
                      >
                        Clear Terminal
                      </button>
                    </div>

                    <div className="bg-black/90 p-3 rounded-xl border border-slate-850 font-mono text-[7.5px] text-fuchsia-300/90 h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 leading-normal">
                      {modLoaderLogs.map((log, index) => (
                        <div key={index} className="truncate">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: MOD MANAGER & STANDALONE COMPILER (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Mod List from Disk */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                      <span className="text-[9px] font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-cyan-400" /> DISK MODS FOLDER DIRECTORY
                      </span>
                      <button
                        onClick={fetchModsList}
                        disabled={modsLoading}
                        className="text-[7.5px] font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-widest cursor-pointer"
                      >
                        {modsLoading ? 'Scanning...' : '↺ Force Rescan'}
                      </button>
                    </div>

                    {/* Mods directory files list */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {modsList.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-[8px] uppercase tracking-wider font-bold">
                          No mods found in disk mods directory.
                        </div>
                      ) : (
                        modsList.map((mod, index) => {
                          const isSelected = selectedModIndex === index;
                          return (
                            <div 
                              key={index}
                              onClick={() => setSelectedModIndex(index)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-slate-900 to-cyan-950/40 border-cyan-500 shadow-md' 
                                  : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[8.5px] font-bold font-mono uppercase ${mod.ext === '.exe' ? 'text-rose-400' : mod.ext === '.cs' ? 'text-amber-400' : 'text-cyan-300'}`}>
                                  {mod.ext === '.exe' ? '⚡ ' : mod.ext === '.cs' ? '⚙️ ' : '📦 '}
                                  {mod.filename}
                                </span>
                                <span className="text-[6.5px] font-mono text-slate-500">
                                  {(mod.size / 1024).toFixed(1)} KB
                                </span>
                              </div>

                              {mod.parsed && (
                                <div className="space-y-0.5">
                                  <div className="text-[9px] font-black text-white uppercase">{mod.parsed.name}</div>
                                  <div className="text-[7px] text-slate-400 uppercase">Author: {mod.parsed.author} | v{mod.parsed.version}</div>
                                  <p className="text-[7px] text-slate-500 leading-normal">{mod.parsed.description}</p>
                                </div>
                              )}

                              {!mod.parsed && mod.ext === '.exe' && (
                                <p className="text-[7px] text-slate-400 leading-normal uppercase font-bold">
                                  PE Windows Executable Launcher Mod
                                </p>
                              )}

                              {!mod.parsed && mod.ext === '.cs' && (
                                <p className="text-[7px] text-slate-400 leading-normal uppercase font-bold">
                                  Unity C# Engine Physics Source Mod
                                </p>
                              )}

                              {isSelected && (
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-850">
                                  {mod.ext === '.al' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleLoadMod(mod.filename);
                                      }}
                                      className="flex-1 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[7px] font-black uppercase rounded tracking-wider cursor-pointer transition-colors"
                                    >
                                      ⚡ INJECT LIVE TO ROOM
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMod(mod.filename);
                                    }}
                                    className="px-2 py-1 bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono text-[7px] font-black uppercase rounded tracking-wider cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Blender Model Upload Bridge */}
                  <BlenderZipUpload onUploadSuccess={fetchModsList} className="bg-slate-950/40 border border-slate-800/80" />

                  {/* Mod Compiler and Creator Form */}
                  <form onSubmit={handleCompileMod} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-3">
                    <span className="text-[9px] font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                      <Wrench className="w-3.5 h-3.5 text-fuchsia-400" /> COMPILER & BUILDER STUDIO
                    </span>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Mod ID</label>
                        <input
                          type="text"
                          value={builderId}
                          onChange={(e) => setBuilderId(e.target.value)}
                          placeholder="com.neon.my_mod"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[8.5px] font-mono text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Mod Name</label>
                        <input
                          type="text"
                          value={builderName}
                          onChange={(e) => setBuilderName(e.target.value)}
                          placeholder="My Custom Mod"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[8.5px] font-mono text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Author Handle</label>
                        <input
                          type="text"
                          value={builderAuthor}
                          onChange={(e) => setBuilderAuthor(e.target.value)}
                          placeholder="Handle"
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[8.5px] font-mono text-white focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Target Output Format</label>
                        <select
                          value={builderFormat}
                          onChange={(e) => setBuilderFormat(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[8.5px] font-mono text-white focus:border-cyan-400 outline-none"
                        >
                          <option value="al">.al (Arena Loader Setting Mod)</option>
                          <option value="exe">.exe (Windows Executable Installer)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5 bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[7px] font-black uppercase tracking-wider text-slate-400 block">Physics Settings overrides</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[6.5px] font-mono text-slate-400">
                            <span>GRAVITY OVERRIDE</span>
                            <span className="text-cyan-400">{builderGravity.toFixed(2)} m/s²</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="15.0"
                            step="0.5"
                            value={builderGravity}
                            onChange={(e) => setBuilderGravity(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 bg-slate-800 h-1 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[6.5px] font-mono text-slate-400">
                            <span>JUMP HEIGHT</span>
                            <span className="text-fuchsia-400">{builderJumpHeight.toFixed(2)}m</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="6.0"
                            step="0.2"
                            value={builderJumpHeight}
                            onChange={(e) => setBuilderJumpHeight(parseFloat(e.target.value))}
                            className="w-full accent-fuchsia-400 bg-slate-800 h-1 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[6px] font-black text-slate-400 uppercase tracking-wider block">Bot Count</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={builderBotCount}
                            onChange={(e) => setBuilderBotCount(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 text-[8.5px] font-mono text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[6px] font-black text-slate-400 uppercase tracking-wider block">AI Difficulty</label>
                          <select
                            value={builderBotDifficulty}
                            onChange={(e) => setBuilderBotDifficulty(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 text-[8px] font-mono text-white outline-none"
                          >
                            <option value="easy">EASY</option>
                            <option value="medium">MEDIUM</option>
                            <option value="hard">HARD</option>
                            <option value="expert">EXPERT</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCompilingMod}
                      className="w-full py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isCompilingMod ? (
                        <>⚡ COMPILED STREAMS RUNNING...</>
                      ) : (
                        <>
                          <Code2 className="w-3.5 h-3.5" />
                          BUILD & COMPILE MOD TO .{builderFormat.toUpperCase()}
                        </>
                      )}
                    </button>

                    {/* Compiler terminal logs */}
                    {compilerLogs.length > 0 && (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1.5">
                        <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest block">ROLLING COMPILER STREAM</span>
                        <div className="font-mono text-[7px] text-emerald-400 space-y-0.5 h-20 overflow-y-auto leading-normal">
                          {compilerLogs.map((l, i) => (
                            <div key={i}>{l}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
