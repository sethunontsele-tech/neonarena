import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, BookOpen, Layers, Laptop, Monitor, Smartphone, Gamepad2, 
  Cpu, Users, Calendar, Coins, Settings, Award, HelpCircle, Trophy, Sparkles, 
  ArrowRightLeft, Clock, Info, Check, X, ShieldAlert, GraduationCap, 
  ChevronDown, BarChart2, Tv, RefreshCw, Languages, Zap, Heart, Sliders, Music,
  Compass, Eye, EyeOff, Bookmark, Star, Download, MapPin, Radio, Image, Volume2,
  ListTodo, Plus, Video, Trash2, Play, Pause, Disc
} from 'lucide-react';
import { MusicLoader } from './MusicLoader';
import { softwareDatabase } from '../../data/encyclopediaData';

export interface SoftwareMajorVersion {
  version: string;
  releaseDate: string;
  notes: string;
}

export interface SoftwareTitle {
  id: string;
  name: string;
  category: string;
  platformType: 'vr' | 'ar' | 'pc' | 'mobile' | 'console' | 'web';
  status: 'Released' | 'Discontinued' | 'Delisted' | 'Early Access' | 'Beta' | 'Alpha' | 'Cancelled' | 'Fan-made' | 'Open-source' | 'Historical';
  region: 'Global' | 'NA' | 'EU' | 'JP' | 'Asia';
  releaseDate: string;
  developer: string;
  publisher: string;
  genres: string[];
  gameplayMechanics: string[];
  supportedPlatforms: string[];
  minHardwareRequirements?: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  recHardwareRequirements?: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  multiplayerFeatures?: string[];
  vrHeadsetCompatibility?: string[];
  controllersSupported?: string[];
  officialWebsite: string;
  dlcAndExpansions: string[];
  achievementsCount: number;
  accessibilityFeatures: string[];
  ratings: {
    steam?: string;
    ign?: string;
    metacritic?: number;
    userRating: number;
  };
  communityStats: {
    monthlyActiveUsers: string;
    totalSales: string;
  };
  fileSize: string;
  languages: string[];
  crossPlatformSupport: boolean;
  cloudSaves: boolean;
  monetizationModel: 'Free-to-Play' | 'Paid' | 'Subscription' | 'Premium' | 'Ad-Supported' | 'Open Source';
  majorVersions: SoftwareMajorVersion[];
  description: string;
  educationFacts: string;
  
  // New prompt-driven extended fields
  franchise?: string;
  series?: string;
  subgenre?: string;
  storyOverview?: string;
  characters?: string[];
  enemies?: string[];
  bosses?: string[];
  itemsAndWeapons?: string[];
  skillsAndAbilities?: string[];
  audioTech?: string;
  graphicsTech?: string;
  gameEngine?: string;
  renderingEngine?: string;
  accessibilityOptions?: string[];
  priceHistory?: { date: string; price: string }[];
  preservationStatus?: string;
  historicalImportance?: string;
  socialMedia?: string;
  wiki?: string;
  documentation?: string;
  changelog?: string;
  patchNotes?: string;
  benchmarks?: string;
  mapSectors?: string[];
  similarGameIds?: string[];
}

interface DownloadItem {
  id: string;
  name: string;
  progress: number;
  speed: string;
  status: 'allocated' | 'downloading' | 'verifying' | 'completed' | 'failed';
  allocatedSize: string;
}

export function SoftwareEncyclopedia({ onClose }: { onClose: () => void }) {
  // Navigation & Active Sub-tab state
  const [activeTab, setActiveTab] = useState<'browser' | 'ai_exploration' | 'galaxy_map' | 'timeline' | 'system_indexes' | 'user_cabinets'>('browser');
  
  // Custom Accessibility and Visual Presets
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [vrViewingMode, setVrViewingMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // NEW states for interactive audio & visual effects
  const [visualTheme, setVisualTheme] = useState<'cyber' | 'spooky' | 'party'>('cyber');
  const [showFxLab, setShowFxLab] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState<number>(1);
  const [particleGravity, setParticleGravity] = useState<boolean>(false);
  const [cameraShakeActive, setCameraShakeActive] = useState(false);
  const [screenShakeToggle, setScreenShakeToggle] = useState(true);

  // Refs for particle animation canvas
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Standard Filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'release' | 'rating' | 'size'>('name');

  // Multi-item Side-by-Side compare states
  const [compareId1, setCompareId1] = useState<string>('hl_alyx');
  const [compareId2, setCompareId2] = useState<string>('shapes_xr_app');
  const [showCompare, setShowCompare] = useState(false);

  // Deep Telemetry Detail Modal state
  const [detailTitleId, setDetailTitleId] = useState<string | null>(null);

  // Interactive Music station
  const [showMusicStation, setShowMusicStation] = useState(false);

  // Education Mode toggle states
  const [educationMode, setEducationMode] = useState(true);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // AI Exploration sub-features
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<{ id: string; relevance: number; reason: string }[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  
  // Voice Search simulation
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState('');

  // Holographic Image Search simulation
  const [isImageScanning, setIsImageScanning] = useState(false);
  const [scannedImageId, setScannedImageId] = useState<string | null>(null);
  const [matchedImageTitles, setMatchedImageTitles] = useState<string[]>([]);

  // Similarity Recommendations selector
  const [recommendBasisId, setRecommendBasisId] = useState<string>('hl_alyx');

  // User Cabinet: Favorites, Wishlists, Bookmarks & Download Manager
  const [favorites, setFavorites] = useState<string[]>(['hl_alyx', 'pt_demo']);
  const [wishlist, setWishlist] = useState<string[]>(['shapes_xr_app']);
  const [bookmarks, setBookmarks] = useState<string[]>(['wow_mmo']);
  const [downloadQueue, setDownloadQueue] = useState<DownloadItem[]>([]);
  const [activeCabinetSub, setActiveCabinetSub] = useState<'favorites' | 'wishlist' | 'bookmarks' | 'download_manager' | 'screen_records'>('favorites');

  // ==========================================
  // EXTENDED TASK SYSTEM: DAILY MISSIONS & XP PROGRESS
  // ==========================================
  interface DailyMission {
    id: string;
    description: string;
    type: 'view_dossier' | 'add_favorite' | 'play_sound' | 'download_sim' | 'answer_quiz' | 'record_screen';
    targetId?: string;
    targetName?: string;
    targetValue?: string;
    xp: number;
    completed: boolean;
  }

  interface ScreenRecord {
    id: string;
    name: string;
    date: string;
    size: string;
    duration: string;
    url: string;
  }

  // Load level and XP from localStorage
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('infinity_academy_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem('infinity_academy_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Floating notifications / Toasts for missions & level-up
  const [toasts, setToasts] = useState<{ id: string; message: string; sub: string; type: 'success' | 'info' | 'level' }[]>([]);

  const addToast = (message: string, sub: string = 'A.U.R.A SYSTEM', type: 'success' | 'info' | 'level' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, sub, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const gainXP = (amount: number) => {
    setXp(prevXp => {
      let nextXp = prevXp + amount;
      let nextLevel = level;
      let leveledUp = false;
      while (nextXp >= 1000) {
        nextXp -= 1000;
        nextLevel += 1;
        leveledUp = true;
      }
      if (leveledUp) {
        setLevel(nextLevel);
        localStorage.setItem('infinity_academy_level', nextLevel.toString());
        addToast(`▲ DECK LEVEL UP!`, `YOU REACHED LEVEL ${nextLevel} • ACCESS EXTENDED`, 'level');
        // Spawn 60 particles for visual explosion
        try {
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            particlesRef.current.push({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2,
              size: Math.random() * 6 + 3,
              color: '#f59e0b', // Amber sparkly
              alpha: 1.0,
              life: 0,
              maxLife: Math.random() * 50 + 30,
              symbol: '⭐',
              type: 'symbol'
            });
          }
        } catch (e) {}
        playSound('success');
      }
      localStorage.setItem('infinity_academy_xp', nextXp.toString());
      return nextXp;
    });
  };

  // Daily Missions Generation and Checking
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(() => {
    return localStorage.getItem('infinity_academy_bonus_claimed') === 'true';
  });

  const generateMissionsList = (): DailyMission[] => {
    // Select stable references from softwareDatabase
    const pool = softwareDatabase.length > 0 ? softwareDatabase : [
      { id: 'hl_alyx', name: 'Half-Life: Alyx' },
      { id: 'shapes_xr_app', name: 'ShapesXR' },
      { id: 'wow_mmo', name: 'World of Warcraft' }
    ];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const item1 = shuffled[0];
    const item2 = shuffled[1] || item1;

    return [
      {
        id: 'mission_dossier_' + Date.now(),
        description: `Inspect specs spec dossier for "${item1.name}"`,
        type: 'view_dossier',
        targetId: item1.id,
        targetName: item1.name,
        xp: 150,
        completed: false
      },
      {
        id: 'mission_favorite_' + Date.now(),
        description: `Add "${item2.name}" to favorites or bookmarks`,
        type: 'add_favorite',
        targetId: item2.id,
        targetName: item2.name,
        xp: 150,
        completed: false
      },
      {
        id: 'mission_misc_' + Date.now(),
        description: Math.random() > 0.5 
          ? `Record the screen using the console screen recorder` 
          : `Play the Ghost Howl or Jumpscare in A.U.R.A FX Lab`,
        type: Math.random() > 0.5 ? 'record_screen' : 'play_sound',
        targetValue: 'misc',
        xp: 200,
        completed: false
      }
    ];
  };

  const getOrGenerateMissions = (force: boolean = false) => {
    const savedMissions = localStorage.getItem('infinity_academy_daily_missions');
    const savedTime = localStorage.getItem('infinity_academy_daily_missions_gen_time');
    const now = Date.now();

    // 24 hours is 86400000 ms
    const isExpired = !savedTime || (now - parseInt(savedTime, 10)) > 86400000;

    if (!savedMissions || isExpired || force) {
      const newMissions = generateMissionsList();
      localStorage.setItem('infinity_academy_daily_missions', JSON.stringify(newMissions));
      localStorage.setItem('infinity_academy_daily_missions_gen_time', now.toString());
      localStorage.setItem('infinity_academy_bonus_claimed', 'false');
      setDailyMissions(newMissions);
      setBonusClaimed(false);
      addToast('▲ DAILY MISSIONS RESET', '3 NEW REWARDS LOADED IN CORES', 'info');
      return newMissions;
    } else {
      try {
        const parsed = JSON.parse(savedMissions) as DailyMission[];
        setDailyMissions(parsed);
        return parsed;
      } catch (e) {
        const fallback = generateMissionsList();
        setDailyMissions(fallback);
        return fallback;
      }
    }
  };

  // Run mission checks on mounting and whenever tracking parameters change
  useEffect(() => {
    getOrGenerateMissions();
  }, []);

  const completeMission = (type: DailyMission['type'], targetId?: string) => {
    setDailyMissions(prev => {
      let changed = false;
      const next = prev.map(m => {
        if (!m.completed && m.type === type) {
          if (type === 'view_dossier' && m.targetId === targetId) {
            m.completed = true;
            changed = true;
          } else if (type === 'add_favorite' && m.targetId === targetId) {
            m.completed = true;
            changed = true;
          } else if (type === 'play_sound' || type === 'record_screen') {
            m.completed = true;
            changed = true;
          }
          if (m.completed) {
            gainXP(m.xp);
            addToast(`▲ TASK COMPLETED: +${m.xp} XP`, m.description, 'success');
            playSound('success');
          }
        }
        return m;
      });
      if (changed) {
        localStorage.setItem('infinity_academy_daily_missions', JSON.stringify(next));
      }
      return next;
    });
  };

  const claimBonusReward = () => {
    if (bonusClaimed) return;
    const allDone = dailyMissions.every(m => m.completed);
    if (!allDone) {
      addToast('▲ BLOCKED', 'COMPLETION OF ALL 3 MISSIONS REQUIRED', 'info');
      return;
    }
    setBonusClaimed(true);
    localStorage.setItem('infinity_academy_bonus_claimed', 'true');
    gainXP(400); // 400 XP bonus reward!
    addToast('▲ BONUS XP UNLOCKED! +400 XP', 'ALL DAILY OBJECTIVES ACHIEVED', 'success');
    playSound('success');
  };

  // ==========================================
  // SCREEN RECORDER & CABINET SCREEN RECORDS FOLDER
  // ==========================================
  const [screenRecords, setScreenRecords] = useState<ScreenRecord[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [playbackVideoUrl, setPlaybackVideoUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recordTimerRef = useRef(0);

  // Load screen records metadata on start
  useEffect(() => {
    const savedMeta = localStorage.getItem('infinity_academy_screen_records_meta');
    if (savedMeta) {
      try {
        const parsed = JSON.parse(savedMeta) as any[];
        const items = parsed.map(p => ({
          ...p,
          url: p.url || 'simulated_feed_url'
        }));
        setScreenRecords(items);
      } catch (e) {
        console.error("Failed to load screen records metadata", e);
      }
    }
  }, []);

  const formatRecordDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startScreenRecording = async () => {
    playSound('click');
    recordedChunksRef.current = [];
    setRecordTimer(0);
    
    const onRecordingComplete = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const newRecord: ScreenRecord = {
        id: 'rec_' + Date.now(),
        name: `DECK_CAPTURE_${now.getFullYear()}_${(now.getMonth()+1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}_${now.getMinutes().toString().padStart(2, '0')}.webm`,
        date: now.toLocaleString(),
        size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: formatRecordDuration(recordTimerRef.current),
        url: url
      };

      setScreenRecords(prev => {
        const updated = [newRecord, ...prev];
        localStorage.setItem('infinity_academy_screen_records_meta', JSON.stringify(updated.map(r => ({
          id: r.id,
          name: r.name,
          date: r.date,
          size: r.size,
          duration: r.duration
        }))));
        return updated;
      });

      completeMission('record_screen');
      addToast('▲ SCREEN CAPTURE COMPLETED', 'SAVED TO CABINET SCREEN RECORDS FOLDER', 'success');
      playSound('success');
    };

    recordTimerRef.current = 0;
    timerIntervalRef.current = setInterval(() => {
      setRecordTimer(prev => {
        const next = prev + 1;
        recordTimerRef.current = next;
        return next;
      });
    }, 1000);

    try {
      // First attempt: Standard screen capture getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: false
      });

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(timerIntervalRef.current);
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        onRecordingComplete(blob);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      addToast('▲ SCREEN SHARING ACTIVE', 'RECORDING NEURAL DECK CONSOLE', 'info');

    } catch (err) {
      console.warn("Screen display capture blocked, trying particle canvas fallback stream...", err);
      
      try {
        const canvas = particleCanvasRef.current;
        if (!canvas) throw new Error("Canvas element not available");

        const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
        if (!stream) throw new Error("Canvas captureStream not supported");

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          clearInterval(timerIntervalRef.current);
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          onRecordingComplete(blob);
          setIsRecording(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
        addToast('▲ CANVAS DECK RECORDER ACTIVE', 'RECORDING VISUAL PARTICLES FIELD', 'info');

      } catch (canvasErr) {
        console.error("Canvas stream capture also failed, launching high-fidelity simulation tracker:", canvasErr);
        setIsRecording(true);
        addToast('▲ NEURAL EMULATED RECORDER STARTED', 'RECORDING RAW TELEMETRY SIGNALS', 'info');
        
        mediaRecorderRef.current = {
          stop: () => {
            clearInterval(timerIntervalRef.current);
            const fakeData = new Blob(["Simulated Video telemetry deck data stream"], { type: 'video/webm' });
            onRecordingComplete(fakeData);
            setIsRecording(false);
          }
        } as any;
      }
    }
  };

  const stopScreenRecording = () => {
    playSound('click');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);
    }
  };

  const deleteScreenRecord = (id: string) => {
    playSound('click');
    setScreenRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('infinity_academy_screen_records_meta', JSON.stringify(next.map(r => ({
        id: r.id,
        name: r.name,
        date: r.date,
        size: r.size,
        duration: r.duration
      }))));
      return next;
    });
    addToast('▲ FILE DELETED', 'REMOVED SCREEN RECORD FROM DISK', 'info');
  };

  // ==========================================
  // AUTOMATED MISSION COMPLETION WATCHERS
  // ==========================================
  useEffect(() => {
    if (detailTitleId) {
      completeMission('view_dossier', detailTitleId);
    }
  }, [detailTitleId]);

  useEffect(() => {
    favorites.forEach(id => completeMission('add_favorite', id));
    bookmarks.forEach(id => completeMission('add_favorite', id));
  }, [favorites, bookmarks]);

  // Screen shake animator helper
  const triggerScreenShake = () => {
    if (!screenShakeToggle) return;
    setCameraShakeActive(true);
    setTimeout(() => {
      setCameraShakeActive(false);
    }, 350);
  };

  // Upgraded dynamic Soundscape synthesizer using standard Web Audio API
  const playSound = (type: string) => {
    if (type === 'ghost' || type === 'jumpscare') {
      try { completeMission('play_sound'); } catch(e) {}
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Setup master volume limiter
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(ctx.destination);
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'hover') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'jumpscare') {
        triggerScreenShake();
        // Multi-oscillator cluster for a frightening dissonant scream impact
        const frequencies = [95, 230, 480, 760, 1050, 1600];
        const duration = 0.9;
        
        const lowRumble = ctx.createOscillator();
        lowRumble.type = 'sawtooth';
        lowRumble.frequency.setValueAtTime(45, now);
        lowRumble.frequency.linearRampToValueAtTime(25, now + duration);
        const rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0.4, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        lowRumble.connect(rumbleGain);
        rumbleGain.connect(masterGain);
        lowRumble.start(now);
        lowRumble.stop(now + duration);

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * (1.3 + Math.random() * 0.4), now + 0.18);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.35, now + duration);
          
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
          
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + duration);
        });
      } else if (type === 'ghost') {
        // Eerie ghost howl sound sweep
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(580, now + 0.4);
        osc.frequency.linearRampToValueAtTime(220, now + 0.9);
        osc.frequency.exponentialRampToValueAtTime(80, now + 1.3);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.linearRampToValueAtTime(750, now + 0.6);
        filter.frequency.linearRampToValueAtTime(280, now + 1.3);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 1.3);
      } else if (type === 'success') {
        triggerScreenShake();
        // Glowing arpeggiated success chime
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.12, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);
          
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.4);
        });
      } else if (type === 'space_ping') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        
        const delayGain = ctx.createGain();
        delayGain.gain.setValueAtTime(0.08, now + 0.3);
        delayGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        
        const echoOsc = ctx.createOscillator();
        echoOsc.type = 'sine';
        echoOsc.frequency.setValueAtTime(950, now + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        echoOsc.connect(delayGain);
        delayGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 1.4);
        echoOsc.start(now + 0.3);
        echoOsc.stop(now + 1.1);
      } else if (type === 'arcade_jump') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.15);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'glitch') {
        triggerScreenShake();
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (i < bufferSize * 0.3 ? 1.0 : 0.15);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1300, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        noise.start(now);
        noise.stop(now + 0.2);
      }
    } catch (err) {
      console.error("Web Audio failover: ", err);
    }
  };

  // High performance Canvas particle loop
  useEffect(() => {
    if (!particlesEnabled) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse movement spawns custom trails
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      
      const count = visualTheme === 'spooky' ? 2 : 4;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2.2 + 0.8) * particleSpeed;
        
        let color = '#06b6d4';
        let symbol = '';
        let type = 'spark';
        
        if (visualTheme === 'cyber') {
          color = Math.random() > 0.5 ? '#06b6d4' : '#d946ef';
        } else if (visualTheme === 'spooky') {
          const colors = ['#ef4444', '#f97316', '#7f1d1d', '#991b1b'];
          color = colors[Math.floor(Math.random() * colors.length)];
          if (Math.random() > 0.85) {
            symbol = Math.random() > 0.5 ? '💀' : '👻';
            type = 'symbol';
          }
        } else if (visualTheme === 'party') {
          const colors = ['#10b981', '#3b82f6', '#f43f5e', '#eab308', '#a855f7'];
          color = colors[Math.floor(Math.random() * colors.length)];
          if (Math.random() > 0.75) {
            symbol = Math.random() > 0.5 ? '⭐' : '✨';
            type = 'symbol';
          } else {
            type = 'bubble';
          }
        }

        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (particleGravity ? -0.4 : 0.4),
          size: Math.random() * 3.5 + 1.5,
          color,
          alpha: 1.0,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          type,
          symbol,
          spin: Math.random() * 0.1 - 0.05,
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Mouse click bursts
    const handleMouseClick = (e: MouseEvent) => {
      const count = visualTheme === 'spooky' ? 14 : 20;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 5.5 + 1.5) * particleSpeed;
        
        let color = '#22c55e';
        let symbol = '';
        let type = 'spark';
        
        if (visualTheme === 'cyber') {
          color = Math.random() > 0.5 ? '#22d3ee' : '#ec4899';
        } else if (visualTheme === 'spooky') {
          color = '#ef4444';
          if (Math.random() > 0.45) {
            symbol = Math.random() > 0.5 ? '👻' : '💀';
            type = 'symbol';
          }
        } else if (visualTheme === 'party') {
          const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7'];
          color = colors[Math.floor(Math.random() * colors.length)];
          symbol = ['🎈', '🎉', '🌟', '✨'][Math.floor(Math.random() * 4)];
          type = 'symbol';
        }

        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (particleGravity ? -1 : 1),
          size: Math.random() * 5 + 2.5,
          color,
          alpha: 1.0,
          life: 0,
          maxLife: Math.random() * 50 + 25,
          type,
          symbol,
          spin: Math.random() * 0.2 - 0.1,
          angle: Math.random() * Math.PI * 2
        });
      }
    };
    window.addEventListener('click', handleMouseClick);

    // Background ambient slow floaters
    const spawnAmbient = setInterval(() => {
      if (particlesRef.current.length < 120) {
        const x = Math.random() * canvas.width;
        const y = canvas.height + 15;
        const angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2);
        const speed = Math.random() * 0.8 + 0.3;
        
        let color = '#3f3f46';
        let symbol = '';
        let type = 'spark';

        if (visualTheme === 'cyber') {
          color = 'rgba(6, 182, 212, 0.22)';
        } else if (visualTheme === 'spooky') {
          color = 'rgba(239, 68, 68, 0.18)';
          if (Math.random() > 0.9) {
            symbol = '🦇';
            type = 'symbol';
          }
        } else if (visualTheme === 'party') {
          color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 255, 0.25)`;
        }

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 1.0,
          color,
          alpha: 0.8,
          life: 0,
          maxLife: Math.random() * 140 + 90,
          type,
          symbol,
          spin: Math.random() * 0.02 - 0.01,
          angle: Math.random() * Math.PI * 2
        });
      }
    }, 150);

    let animId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        
        if (particleGravity) {
          p.vy += 0.14;
        }
        
        p.alpha = 1.0 - (p.life / p.maxLife);
        p.angle += p.spin;

        if (p.life >= p.maxLife) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (p.type === 'symbol' && p.symbol) {
          ctx.font = `${p.size * 3.5 + 10}px sans-serif`;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillText(p.symbol, -p.size, p.size);
        } else {
          ctx.shadowBlur = p.size * 2.2;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.type === 'bubble') {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
        return true;
      });

      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      clearInterval(spawnAmbient);
      cancelAnimationFrame(animId);
    };
  }, [particlesEnabled, visualTheme, particleSpeed, particleGravity]);


  // Educational Quiz Questions
  const quizQuestions = [
    {
      question: "Which rendering innovation in Unreal Engine 5 completely eliminates the need for manual LODs?",
      options: ["Nanite Virtual Geometry", "Lumen Global Illumination", "Chaos Physics", "MegaScans Textures"],
      correctIndex: 0,
      explanation: "Nanite renders virtualized geometry pixel-by-pixel, letting artists import highly detailed movie-quality models directly without manual level-of-detail optimization."
    },
    {
      question: "Why does World of Warcraft utilize a strictly 'Server-Authoritative' network architecture?",
      options: ["To reduce client-side graphics stress", "To prevent player hacking and coordinate modification", "To allow players to play offline", "To speed up graphic loads"],
      correctIndex: 1,
      explanation: "By verifying all coordinates, item trades, and actions server-side, developers prevent clients from artificially speed-hacking or fabricating items."
    },
    {
      question: "Which structural neural pattern is the core architecture behind OpenAI's ChatGPT models?",
      options: ["Convolutional Neural Networks (CNN)", "Transformer Neural Architecture", "Linear Regression Trees", "Genetic Feedback Loops"],
      correctIndex: 1,
      explanation: "The Transformer architecture uses self-attention mechanisms to weigh relationships between distant words in text streams."
    },
    {
      question: "Why was Dong Nguyen's famous 'Flappy Bird' removed from app stores in February 2014?",
      options: ["Nintendo filed a patent lawsuit", "The game servers crashed under player loads", "The creator felt guilty over the addictive design loop of the game", "Apple banned the app for performance issues"],
      correctIndex: 2,
      explanation: "Dong Nguyen voluntarily delisted the app, explaining that it had become an addictive product that caused him severe personal stress."
    }
  ];

  // Dynamic lists of filters derived from our exhaustive Database
  const categoriesList = useMemo(() => {
    return ['All', ...Array.from(new Set(softwareDatabase.map(s => s.category)))];
  }, []);

  const statusList = useMemo(() => {
    return ['All', ...Array.from(new Set(softwareDatabase.map(s => s.status)))];
  }, []);

  const platformsList = useMemo(() => {
    return ['All', 'vr', 'ar', 'pc', 'mobile', 'console', 'web'];
  }, []);

  // Filtered and sorted results for Database browser
  const processedDatabase = useMemo(() => {
    return softwareDatabase
      .filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             (item.subgenre && item.subgenre.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        const matchesPlatform = selectedPlatform === 'All' || item.platformType === selectedPlatform;
        return matchesQuery && matchesCategory && matchesStatus && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'release') {
          return b.releaseDate.localeCompare(a.releaseDate);
        } else if (sortBy === 'rating') {
          return b.ratings.userRating - a.ratings.userRating;
        } else if (sortBy === 'size') {
          return parseFloat(b.fileSize) - parseFloat(a.fileSize);
        }
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedStatus, selectedPlatform, sortBy]);

  // Selected Titles for Comparison Deck
  const compTitle1 = softwareDatabase.find(s => s.id === compareId1);
  const compTitle2 = softwareDatabase.find(s => s.id === compareId2);

  // Active detailed view title
  const detailTitle = softwareDatabase.find(s => s.id === detailTitleId);

  // Dynamic similarity recommendations resolver
  const similarRecommendations = useMemo(() => {
    const basis = softwareDatabase.find(s => s.id === recommendBasisId);
    if (!basis) return [];
    return softwareDatabase
      .filter(item => item.id !== recommendBasisId)
      .map(item => {
        let score = 0;
        // Count shared genres
        const sharedGenres = item.genres.filter(g => basis.genres.includes(g)).length;
        score += sharedGenres * 3;
        // Shared platform
        if (item.platformType === basis.platformType) score += 5;
        // Shared developer or publisher
        if (item.developer === basis.developer) score += 4;
        // Shared monetization
        if (item.monetizationModel === basis.monetizationModel) score += 2;
        return { item, score };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(entry => entry.item);
  }, [recommendBasisId]);

  // Real-time AI Semantic Search Call to our server route
  const handleAiSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    playSound('click');

    try {
      const response = await fetch('/api/encyclopedia/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiSearchQuery, database: softwareDatabase })
      });
      const data = await response.json();
      if (data.success) {
        setAiSearchResults(data.matches || []);
        setAiSummary(data.aiSummary || 'Matches resolved successfully.');
      } else {
        setAiSummary('The Neon Arena database links returned an unexpected neural parsing error.');
      }
    } catch (err) {
      setAiSummary('An offline fallback was resolved for matching coordinates.');
      // Local keyword matching fallback
      const queryLower = aiSearchQuery.toLowerCase();
      const localMatches = softwareDatabase.map(item => {
        let score = 0;
        if (item.name.toLowerCase().includes(queryLower)) score += 0.9;
        if (item.description.toLowerCase().includes(queryLower)) score += 0.5;
        if (item.genres.some(g => g.toLowerCase().includes(queryLower))) score += 0.7;
        return { id: item.id, relevance: score, reason: 'Keyword overlap in records.' };
      }).filter(m => m.relevance > 0).sort((a, b) => b.relevance - a.relevance);
      setAiSearchResults(localMatches);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Real Web Speech Recognition / Simulated Voice Search
  const triggerVoiceSearch = () => {
    if (isListening) return;
    setIsListening(true);
    playSound('click');
    setSpeechFeedback('Tuning microphone haptics... SPEAK NOW');

    // Attempt native SpeechRecognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSpeechFeedback(`Microphone received: "${text}"`);
        setSearchQuery(text);
        setAiSearchQuery(text);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setSpeechFeedback('Signal lost. Defaulting to simulated neural telemetry...');
        triggerSimulatedSpeech();
      };
    } else {
      triggerSimulatedSpeech();
    }
  };

  const triggerSimulatedSpeech = () => {
    const speechSamples = [
      'Find premium VR games with high ratings',
      'Show me delisted and cancelled console experiences',
      'Unreal Engine real-time rendering tools',
      'Open-source media players and retro emulators'
    ];
    const picked = speechSamples[Math.floor(Math.random() * speechSamples.length)];
    setTimeout(() => {
      setSpeechFeedback(`[Simulated Speech System]: "${picked}"`);
      setSearchQuery(picked);
      setAiSearchQuery(picked);
      setIsListening(false);
    }, 2000);
  };

  // Image Search Simulation (Scanning of convolutional assets)
  const triggerImageSearch = (imageId: string, matchingTitles: string[]) => {
    setIsImageScanning(true);
    setScannedImageId(imageId);
    playSound('click');

    setTimeout(() => {
      setMatchedImageTitles(matchingTitles);
      setIsImageScanning(false);
    }, 2500);
  };

  // Download Manager Simulator Task
  const startSimulationDownload = (id: string, name: string, size: string) => {
    // Check if already downloading
    if (downloadQueue.some(item => item.id === id && item.status !== 'completed')) return;
    
    const newItem: DownloadItem = {
      id,
      name,
      progress: 0,
      speed: '0 MB/s',
      status: 'allocated',
      allocatedSize: size
    };

    setDownloadQueue(prev => [...prev, newItem]);
    playSound('click');

    // Allocation transition
    setTimeout(() => {
      setDownloadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'downloading' } : item));
    }, 1000);
  };

  // Process downloads over time (simulation loop)
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloadQueue(prev => {
        return prev.map(item => {
          if (item.status === 'downloading') {
            const nextProgress = item.progress + Math.floor(Math.random() * 15) + 5;
            const speed = `${(Math.random() * 80 + 20).toFixed(1)} MB/s`;
            if (nextProgress >= 100) {
              return { ...item, progress: 100, speed: '0 MB/s', status: 'verifying' };
            }
            return { ...item, progress: nextProgress, speed };
          }
          return item;
        });
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Handle Verification to completion
  useEffect(() => {
    const checkVerify = downloadQueue.filter(i => i.status === 'verifying');
    if (checkVerify.length > 0) {
      checkVerify.forEach(item => {
        setTimeout(() => {
          setDownloadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed' } : q));
          try {
            // Unlocked audio feedback
            const sfx = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
            sfx.volume = 0.3;
            sfx.play().catch(() => {});
          } catch(e) {}
        }, 1500);
      });
    }
  }, [downloadQueue]);

  // Quiz progression handlers
  const handleAnswerSubmit = (idx: number) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(idx);
    setQuizAnswered(true);
    playSound('click');
    if (idx === quizQuestions[currentQuizIndex].correctIndex) {
      setQuizScore(prev => (prev === null ? 1 : prev + 1));
    } else if (quizScore === null) {
      setQuizScore(0);
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
    playSound('click');
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Completed, display scoreboard resets
    }
  };

  const resetQuiz = () => {
    setQuizScore(null);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
    playSound('click');
  };

  // Toggle user cabinets item lists
  const toggleFavorite = (id: string) => {
    playSound('click');
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toggleWishlist = (id: string) => {
    playSound('click');
    setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const toggleBookmark = (id: string) => {
    playSound('click');
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  // Dynamic styling elements computed on the fly based on visualTheme
  let containerBgClass = isDarkMode ? 'bg-zinc-950/98 text-zinc-300' : 'bg-zinc-50/98 text-zinc-800';
  let innerShadowStyle = {};
  let gridMatrixColor = isDarkMode ? 'bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]';
  
  let titleText = "Neon Arena Database";
  let subtitleText = "Universal Cyber-Nexus System";
  let bannerGradient = "from-white via-cyan-300 to-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]";
  let linkStatusText = "NEON ARENA LINK STATUS: SECURE";
  let linkStatusColor = "text-rose-500";
  let headerTextColor = "text-cyan-400";
  let accentBorderColor = "border-cyan-400/20";
  
  if (visualTheme === 'spooky') {
    containerBgClass = 'bg-black/95 text-red-200';
    innerShadowStyle = { boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.28)' };
    gridMatrixColor = 'bg-[linear-gradient(to_right,#ef4444_1px,transparent_1px),linear-gradient(to_bottom,#ef4444_1px,transparent_1px)]';
    
    titleText = "👻 Phantasmagoria Lost Crypts 👻";
    subtitleText = "Forbidden Necro-Data Retrieval System";
    bannerGradient = "from-red-500 via-orange-600 to-yellow-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.55)] animate-pulse";
    linkStatusText = "⚠️ WARNING: COGNITIVE HAZARDS ACTIVE & UNCONTAINED ⚠️";
    linkStatusColor = "text-red-500 font-bold animate-pulse";
    headerTextColor = "text-red-500";
    accentBorderColor = "border-red-500/30";
  } else if (visualTheme === 'party') {
    containerBgClass = 'bg-zinc-950 text-white';
    innerShadowStyle = { boxShadow: 'inset 0 0 80px rgba(168, 85, 247, 0.22)' };
    gridMatrixColor = 'bg-[linear-gradient(to_right,#d946ef_1px,transparent_1px),linear-gradient(to_bottom,#d946ef_1px,transparent_1px)]';
    
    titleText = "⚡ Vaporwave Neon Arcade DB ⚡";
    subtitleText = "Retro Wave & High-Frequency Synths Deck";
    bannerGradient = "from-pink-400 via-purple-400 to-emerald-400 drop-shadow-[0_0_20px_rgba(217,70,239,0.5)]";
    linkStatusText = "🌈 ARCADE PARTY ACTIVE: LIGHT SPEED BEATS LOADED 🌈";
    linkStatusColor = "text-emerald-400 font-bold animate-bounce";
    headerTextColor = "text-pink-400";
    accentBorderColor = "border-pink-500/30";
  }

  // Jumpscare overlay effect
  const [showSpookyOverlay, setShowSpookyOverlay] = useState(false);
  useEffect(() => {
    if (visualTheme === 'spooky' && Math.random() > 0.6) {
      const interval = setInterval(() => {
        setShowSpookyOverlay(true);
        setTimeout(() => setShowSpookyOverlay(false), 180);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [visualTheme]);

  return (
    <div 
      style={{
        ...innerShadowStyle,
        transform: cameraShakeActive ? `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) rotate(${(Math.random() - 0.5) * 0.8}deg)` : 'none',
        transition: cameraShakeActive ? 'none' : 'transform 0.15s ease-out'
      }}
      className={`fixed inset-0 z-[99999] overflow-y-auto p-4 md:p-8 select-none font-sans transition-all duration-300 ${containerBgClass} ${accessibilityMode ? 'text-lg' : 'text-xs'}`}
    >
      
      {/* Background Interactive Particle Canvas */}
      <canvas 
        ref={particleCanvasRef} 
        className="pointer-events-none fixed inset-0 z-30" 
      />

      {/* Spooky Horror Screen Glitch Overlay */}
      {showSpookyOverlay && (
        <div className="fixed inset-0 pointer-events-none z-[9999999] bg-red-950/45 flex items-center justify-center animate-pulse">
          <div className="text-[120px] font-black text-red-600 opacity-60 tracking-widest uppercase italic select-none">LISA IS WATCHING</div>
        </div>
      )}

      {/* 3D VR Visor Curved skew transform overlay */}
      {vrViewingMode && (
        <div className="fixed inset-0 pointer-events-none z-[999999] border-[16px] border-zinc-900 shadow-[inset_0_0_100px_rgba(0,255,255,0.4)] rounded-[40px] opacity-75" />
      )}

      {/* Futuristic Grid Matrix background lines */}
      <div className={`absolute inset-0 pointer-events-none opacity-[0.06] ${gridMatrixColor} bg-[size:45px_45px]`} />

      <div className={`max-w-7xl mx-auto relative z-10 space-y-6 ${vrViewingMode ? 'perspective-3d rotate-x-1 rotate-y-1 scale-95' : ''}`}>
        
        {/* UPPER STATUS TELEMETRY TICKER */}
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 text-[9px] font-mono font-black uppercase tracking-wider ${headerTextColor}`}>
          <div className="flex items-center gap-6">
            <span className={`flex items-center gap-1.5 ${linkStatusColor}`}>
              <Radio className="w-3.5 h-3.5" />
              {linkStatusText}
            </span>
            <span>TOTAL ENCYCLOPEDIA ARCHIVES: 140,892 CORES</span>
            <span>AI ENGINE TYPE: GEMINI-3.5-FLASH</span>
          </div>
          <div className="flex items-center gap-4">
            <span>PRESERVATION INDEX: 99.82%</span>
            <span>GMT NETWORK TIME: {new Date().toUTCString()}</span>
          </div>
        </div>

        {/* CORE APPLICATION TITLE */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-6 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 bg-white/5 border ${accentBorderColor} rounded-xl`}>
                <BookOpen className={`w-5 h-5 ${headerTextColor} animate-pulse`} />
              </span>
              <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${headerTextColor}`}>{subtitleText}</span>
            </div>
            <h1 className={`text-3xl font-black uppercase italic tracking-widest bg-gradient-to-r ${bannerGradient} bg-clip-text text-transparent`}>
              {titleText}
            </h1>
            <p className="text-zinc-400 max-w-3xl leading-relaxed uppercase font-medium">
              The premier interactive encyclopedia documenting all VR/AR, retro console, delisted, cancelled, experimental, and modded software systems across compute generations.
            </p>
          </div>

          {/* QUICK CONTROLS & MODULE ACCESS */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {/* Interactive FX Lab Toggle */}
            <button
              onClick={() => { playSound('success'); setShowFxLab(!showFxLab); }}
              className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                showFxLab 
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                  : 'bg-zinc-900 border-amber-500/20 text-amber-500 hover:text-white hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              FX Lab & Soundboard
            </button>

            {/* Accessibility toggle */}
            <button
              onClick={() => { playSound('click'); setAccessibilityMode(!accessibilityMode); }}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                accessibilityMode ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Accessibility Mode"
            >
              <Languages className="w-4 h-4" />
            </button>

            {/* VR Visor toggle */}
            <button
              onClick={() => { playSound('click'); setVrViewingMode(!vrViewingMode); }}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                vrViewingMode ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Holographic VR Visor Display"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Color Mode toggle */}
            <button
              onClick={() => { playSound('click'); setIsDarkMode(!isDarkMode); }}
              className="p-2.5 bg-zinc-900/60 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white rounded-2xl transition-all cursor-pointer flex items-center justify-center"
              title="Switch Themes"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Music Station trigger */}
            <button
              onClick={() => { playSound('click'); setShowMusicStation(true); }}
              className="px-4 py-2.5 bg-zinc-900 border border-cyan-500/20 text-[9px] font-black text-cyan-400 hover:text-white hover:border-cyan-400 uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Music Station
            </button>

            {/* SCREEN RECORDER HEADER CONTROLLER */}
            <button
              onClick={isRecording ? stopScreenRecording : startScreenRecording}
              className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                isRecording 
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
                  : 'bg-zinc-900 border-rose-500/20 text-rose-400 hover:bg-rose-950/20 hover:text-white hover:border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
              }`}
            >
              <Video className={`w-3.5 h-3.5 ${isRecording ? 'text-white animate-spin-slow' : 'text-rose-400'}`} />
              {isRecording ? `REC ${formatRecordDuration(recordTimer)}` : 'RECORD SCREEN'}
            </button>

            {/* Close DB Button */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-rose-500/15 border border-rose-500/35 text-[9px] font-black text-rose-400 hover:bg-rose-500 hover:text-white uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>

        {/* COMPARISON SLATE PORTAL DOCK */}
        {showCompare && (
          <div className="bg-zinc-900/90 border border-cyan-400/30 rounded-3xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Side-by-Side Architectural Compare Engine</h3>
              </div>
              <button 
                onClick={() => setShowCompare(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                ✕ Close compare
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Selector Spec */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Select Software Node A</label>
                <select
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-xs uppercase tracking-wide text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
                >
                  <option value="">-- Choose Option --</option>
                  {softwareDatabase.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>

                {compTitle1 && (
                  <div className="bg-zinc-950/60 p-3.5 rounded-2xl border border-white/5 space-y-2 text-[11px] font-semibold text-zinc-400">
                    <div className="font-black text-cyan-400 text-xs uppercase">{compTitle1.name}</div>
                    <div><strong className="text-zinc-500 uppercase">Subgenre:</strong> {compTitle1.subgenre || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">Engine:</strong> {compTitle1.gameEngine || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">Audio Tech:</strong> {compTitle1.audioTech || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">CPU Rec:</strong> {compTitle1.recHardwareRequirements?.cpu || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">GPU Rec:</strong> {compTitle1.recHardwareRequirements?.gpu || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">File Weight:</strong> {compTitle1.fileSize}</div>
                    <div><strong className="text-zinc-500 uppercase">Monetization:</strong> {compTitle1.monetizationModel}</div>
                    <div><strong className="text-zinc-500 uppercase">User Rating:</strong> {compTitle1.ratings.userRating}/10</div>
                  </div>
                )}
              </div>

              {/* Comparison matrix analysis middle panel */}
              <div className="bg-zinc-950/80 rounded-2xl border border-white/5 p-5 flex flex-col justify-center items-center text-center text-xs space-y-4">
                <BarChart2 className="w-8 h-8 text-cyan-400 animate-pulse" />
                <h5 className="font-black text-white uppercase tracking-wider">Dynamic Analytical Differential</h5>
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed max-w-[220px]">
                  Contrasting licensing models, computing hardware requirements, and localized preservation statuses in real time.
                </p>
                <div className="w-full grid grid-cols-2 gap-3 text-[9px] font-black text-zinc-400 border-t border-white/5 pt-3">
                  <div className="border-r border-white/5 uppercase">CLOUDSAVES: <span className="text-emerald-400">{compTitle1?.cloudSaves ? 'YES' : 'NO'}</span></div>
                  <div className="uppercase">CLOUDSAVES: <span className="text-emerald-400">{compTitle2?.cloudSaves ? 'YES' : 'NO'}</span></div>
                </div>
              </div>

              {/* Right Selector Spec */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Select Software Node B</label>
                <select
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-xs uppercase tracking-wide text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
                >
                  <option value="">-- Choose Option --</option>
                  {softwareDatabase.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>

                {compTitle2 && (
                  <div className="bg-zinc-950/60 p-3.5 rounded-2xl border border-white/5 space-y-2 text-[11px] font-semibold text-zinc-400">
                    <div className="font-black text-fuchsia-400 text-xs uppercase">{compTitle2.name}</div>
                    <div><strong className="text-zinc-500 uppercase">Subgenre:</strong> {compTitle2.subgenre || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">Engine:</strong> {compTitle2.gameEngine || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">Audio Tech:</strong> {compTitle2.audioTech || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">CPU Rec:</strong> {compTitle2.recHardwareRequirements?.cpu || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">GPU Rec:</strong> {compTitle2.recHardwareRequirements?.gpu || 'N/A'}</div>
                    <div><strong className="text-zinc-500 uppercase">File Weight:</strong> {compTitle2.fileSize}</div>
                    <div><strong className="text-zinc-500 uppercase">Monetization:</strong> {compTitle2.monetizationModel}</div>
                    <div><strong className="text-zinc-500 uppercase">User Rating:</strong> {compTitle2.ratings.userRating}/10</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE SIDEBAR & DASHBOARD TABS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* NAVIGATION SIDEBAR PANEL */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* USER LEVEL & COGNITIVE XP DECK */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-[7.5px] font-mono font-black text-zinc-500 uppercase tracking-widest block">Neural Deck Status</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">LEVEL {level} ENCRYPTOR</h3>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-400/20 rounded-xl text-[9px] font-mono font-black text-amber-400">
                  {xp} / 1000 XP
                </div>
              </div>

              {/* Progress track */}
              <div className="space-y-1.5">
                <div className="w-full bg-zinc-950/80 rounded-full h-3 overflow-hidden border border-white/5 relative flex items-center justify-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(xp / 1000) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="absolute left-0 inset-y-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                  />
                  <span className="text-[8px] font-black text-white z-10 drop-shadow-md">{Math.round((xp / 1000) * 100)}% COGNITION</span>
                </div>
              </div>
            </div>

            {/* Tabs Controller Menu */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-4 space-y-1.5 shadow-lg">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-3.5 mb-2.5 block">SYSTEM CORE CHANNELS</span>
              
              {[
                { id: 'browser', label: 'Database Browser', icon: Layers, color: 'text-cyan-400' },
                { id: 'ai_exploration', label: 'AI Exploration Hub', icon: Sparkles, color: 'text-amber-400' },
                { id: 'galaxy_map', label: 'Galaxy Sector Map', icon: Compass, color: 'text-rose-400' },
                { id: 'timeline', label: 'Timeline Orbit', icon: Clock, color: 'text-fuchsia-400' },
                { id: 'system_indexes', label: 'System Indexes', icon: BarChart2, color: 'text-emerald-400' },
                { id: 'user_cabinets', label: 'User Cabinets', icon: Bookmark, color: 'text-blue-400' }
              ].map(t => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { playSound('click'); setActiveTab(t.id as any); }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-zinc-950 border border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.4)]' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* DAILY MISSIONS DECK */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">DAILY MISSIONS DECK</h3>
                </div>
                <button
                  onClick={() => getOrGenerateMissions(true)}
                  className="p-1 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-lg text-zinc-500 hover:text-white transition-all text-[8px] font-mono font-bold tracking-widest flex items-center gap-1 cursor-pointer"
                  title="Force refresh missions"
                >
                  <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                  RESET
                </button>
              </div>

              <div className="space-y-2.5">
                {dailyMissions.map(m => (
                  <div 
                    key={m.id} 
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                      m.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/90' 
                        : 'bg-zinc-950/50 border-white/5 text-zinc-400'
                    }`}
                  >
                    <div
                      className={`p-0.5 rounded-lg border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        m.completed 
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                          : 'bg-zinc-900 border-white/10 text-zinc-600'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${m.completed ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className={`text-[9.5px] font-bold uppercase leading-snug ${m.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {m.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[7.5px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          m.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-300'
                        }`}>
                          +{m.xp} XP
                        </span>
                        {m.type === 'view_dossier' && !m.completed && (
                          <button
                            onClick={() => { playSound('click'); setDetailTitleId(m.targetId!); }}
                            className="text-[7.5px] font-mono font-black text-cyan-400 hover:underline uppercase"
                          >
                            OPEN DOSSIER ➔
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bonus Mission progress */}
              <div className="bg-zinc-950 p-3.5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[8.5px] font-black uppercase">
                  <span className="text-zinc-500">Bonus Progress</span>
                  <span className="text-amber-400">{dailyMissions.filter(m => m.completed).length} / 3 Done</span>
                </div>
                
                {/* Micro progress segments */}
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  {dailyMissions.map((m, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-full transition-all duration-300 ${
                        m.completed ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                {bonusClaimed ? (
                  <div className="w-full text-center py-2 bg-zinc-900 border border-white/5 text-zinc-500 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest">
                    ✓ BONUS CLAIMED (+400 XP)
                  </div>
                ) : (
                  <button
                    disabled={!dailyMissions.every(m => m.completed)}
                    onClick={claimBonusReward}
                    className={`w-full text-center py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest cursor-pointer transition-all border ${
                      dailyMissions.every(m => m.completed)
                        ? 'bg-amber-500 border-amber-400 text-zinc-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                        : 'bg-zinc-900 border-white/5 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    CLAIM 400 XP BONUS
                  </button>
                )}
              </div>
            </div>

            {/* NEON CORE LORE QUIZ BLOCK */}
            {educationMode && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">CS & Software History Quiz</h3>
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/5 space-y-3.5">
                  <div className="flex justify-between items-center text-[8.5px] font-black text-zinc-500 uppercase">
                    <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                    {quizScore !== null && <span className="text-amber-400 font-bold">SCORE: {quizScore} / {quizQuestions.length}</span>}
                  </div>

                  <p className="text-[10px] font-bold text-white uppercase leading-relaxed">
                    {quizQuestions[currentQuizIndex].question}
                  </p>

                  <div className="space-y-1.5">
                    {quizQuestions[currentQuizIndex].options.map((opt, oIdx) => {
                      const isCorrect = oIdx === quizQuestions[currentQuizIndex].correctIndex;
                      const isSelected = oIdx === selectedQuizAnswer;
                      return (
                        <button
                          key={oIdx}
                          disabled={quizAnswered}
                          onClick={() => handleAnswerSubmit(oIdx)}
                          className={`w-full text-left p-3 rounded-xl text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer ${
                            quizAnswered 
                              ? isCorrect 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : isSelected
                                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                                : 'bg-zinc-900 border-white/5 text-zinc-500'
                              : 'bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>{opt}</span>
                          {quizAnswered && isCorrect && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {quizAnswered && isSelected && !isCorrect && <X className="w-3 h-3 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2">
                      <div className="text-[8.5px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        A.U.R.A Academic insight
                      </div>
                      <p className="text-[9px] text-zinc-300 font-medium leading-relaxed uppercase">
                        {quizQuestions[currentQuizIndex].explanation}
                      </p>
                      
                      {currentQuizIndex < quizQuestions.length - 1 ? (
                        <button
                          onClick={handleNextQuiz}
                          className="w-full mt-1.5 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:bg-amber-400 cursor-pointer"
                        >
                          Continue ➔
                        </button>
                      ) : (
                        <button
                          onClick={resetQuiz}
                          className="w-full mt-1.5 py-1.5 bg-zinc-800 text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:bg-zinc-700 cursor-pointer"
                        >
                          Replay Course Quiz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MAIN FUNCTIONAL DASHBOARD DISPLAY PANEL */}
          <div className="lg:col-span-9 space-y-6">
            
            <AnimatePresence mode="wait">
              {/* VIEW 1: DATABASE BROWSER */}
              {activeTab === 'browser' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_browser"
                  className="space-y-5"
                >
                  {/* Search and Filters Deck */}
                  <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Text Search */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="SEARCH DYNAMIC SCHEMAS, TITLES, CORES..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 focus:border-cyan-400 text-white rounded-2xl pl-10 pr-4 py-3.5 text-xs uppercase font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600 font-bold"
                        />
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                      </div>

                      {/* Sorting filter options */}
                      <div className="flex gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs uppercase font-black text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="name">Sort: Title Name</option>
                          <option value="release">Sort: Release Date</option>
                          <option value="rating">Sort: User Ratings</option>
                          <option value="size">Sort: Memory Footprint</option>
                        </select>

                        <button
                          onClick={() => { playSound('click'); setShowCompare(!showCompare); }}
                          className={`px-4 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                            showCompare ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-zinc-950 border-white/5 text-zinc-400'
                          }`}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          Compare Deck
                        </button>
                      </div>
                    </div>

                    {/* Filter Ribbon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                      {/* Platform */}
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Compute Class</label>
                        <select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] uppercase font-bold tracking-wider text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {platformsList.map(p => (
                            <option key={p} value={p}>{p === 'All' ? 'ALL COMPUTE SYSTEMS' : p.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Software Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] uppercase font-bold tracking-wider text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {categoriesList.map(c => (
                            <option key={c} value={c}>{c === 'All' ? 'ALL CATEGORIES' : c.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Preservation Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] uppercase font-bold tracking-wider text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {statusList.map(s => (
                            <option key={s} value={s}>{s === 'All' ? 'ALL STATUSES' : s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Active Nodes Count Panel */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-zinc-500">
                    <span>SECTOR TELEMETRY DETECTED: <strong className="text-zinc-200">{processedDatabase.length} SECURE SYSTEMS</strong></span>
                    <span>FILTER PRESENCE ACCREDITED</span>
                  </div>

                  {/* Grid layout of matches */}
                  {processedDatabase.length === 0 ? (
                    <div className="bg-zinc-900/40 border border-dashed border-white/10 rounded-3xl p-16 text-center space-y-4">
                      <Sliders className="w-10 h-10 text-zinc-600 animate-pulse mx-auto" />
                      <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">No interactive files aligned with specified parameters.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {processedDatabase.map((item) => {
                        const isFavorite = favorites.includes(item.id);
                        const inWishlist = wishlist.includes(item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className="bg-zinc-900/60 border border-white/5 hover:border-cyan-400/30 p-5 rounded-3xl transition-all duration-300 relative group flex flex-col justify-between space-y-4 shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
                          >
                            <div className="flex items-start justify-between w-full">
                              <div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[7.5px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-2 py-0.5 rounded uppercase font-mono">
                                    {item.category}
                                  </span>
                                  <span className={`text-[7.5px] font-black px-2 py-0.5 rounded uppercase font-mono border ${
                                    item.status === 'Released' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors mt-2">
                                  {item.name}
                                </h3>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">{item.subgenre || 'Universal Project'}</span>
                              </div>

                              {/* Interactive Cabinet buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => toggleFavorite(item.id)}
                                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                    isFavorite ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-zinc-950 border-white/5 text-zinc-500'
                                  }`}
                                  title="Favorite"
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  onClick={() => toggleWishlist(item.id)}
                                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                    inWishlist ? 'bg-rose-500/20 border-rose-400 text-rose-400' : 'bg-zinc-950 border-white/5 text-zinc-500'
                                  }`}
                                  title="Wishlist"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                              {item.description}
                            </p>

                            {/* Core stats pills */}
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
                              <div className="truncate"><strong className="text-zinc-400">DEV:</strong> {item.developer}</div>
                              <div className="truncate"><strong className="text-zinc-400">RELEASED:</strong> {item.releaseDate}</div>
                              <div className="truncate"><strong className="text-zinc-400">WEIGHT:</strong> {item.fileSize}</div>
                              <div className="truncate"><strong className="text-zinc-400">ENGINE:</strong> {item.gameEngine || 'PROPRIETARY'}</div>
                            </div>

                            {/* Actions bar */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                              <div className="flex items-center gap-1 text-[9px] font-mono font-black text-cyan-400">
                                <span>RATING: {item.ratings.userRating}/10</span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-500">{item.monetizationModel}</span>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => startSimulationDownload(item.id, item.name, item.fileSize)}
                                  className="px-3.5 py-1.5 bg-zinc-950 border border-white/5 hover:border-cyan-400/40 text-cyan-400 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Sim Download
                                </button>
                                
                                <button
                                  onClick={() => { playSound('click'); setDetailTitleId(item.id); }}
                                  className="px-3.5 py-1.5 bg-zinc-900 border border-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                                >
                                  Dossier ➔
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* VIEW 2: AI EXPLORATION HUB */}
              {activeTab === 'ai_exploration' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_ai_hub"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semantic Search Box */}
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Semantic Query</span>
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>

                      <p className="text-[11px] text-zinc-400 uppercase font-bold leading-normal">
                        Type natural constraints like: "I want a multiplayer PC fantasy adventure with targeting system from the 2000s" or "Find high-fidelity VR modeling programs".
                      </p>

                      <form onSubmit={handleAiSemanticSearch} className="space-y-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="INPUT NATURAL LANGUAGE CONSTRAINTS..."
                            value={aiSearchQuery}
                            onChange={(e) => setAiSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 focus:border-amber-400 text-white rounded-2xl pl-4 pr-12 py-3.5 text-xs uppercase font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600 font-bold"
                          />
                          <button
                            type="button"
                            onClick={triggerVoiceSearch}
                            className={`absolute right-3 top-3 p-1 rounded-xl transition-all cursor-pointer border ${
                              isListening ? 'bg-rose-500 text-white border-rose-400 animate-bounce' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                            title="Voice Dictation Search"
                          >
                            <Radio className="w-4 h-4" />
                          </button>
                        </div>

                        {speechFeedback && (
                          <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono uppercase text-cyan-400 font-black animate-pulse">
                            🎙️ {speechFeedback}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isAiSearching}
                          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
                        >
                          {isAiSearching ? 'SCANNING DATABASE FREQUENCIES...' : 'INITIATE SEMANTIC SCAN'}
                        </button>
                      </form>

                      {aiSummary && (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-2">
                          <span className="text-[8.5px] font-black text-amber-400 uppercase tracking-widest block">AI Response Summary</span>
                          <p className="text-[11px] text-zinc-300 font-semibold leading-relaxed uppercase">{aiSummary}</p>
                        </div>
                      )}
                    </div>

                    {/* Holographic Image Search Module */}
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Holographic Image Feature Search</span>
                        <Image className="w-4 h-4 text-cyan-400" />
                      </div>

                      <p className="text-[11px] text-zinc-400 uppercase font-bold leading-normal">
                        Simulate searching the universal encyclopedia using neural convolutional graphic features. Click one of the holographic system keys below to scan files:
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'img_headset', label: 'VR Headset Coordinates', matchIds: ['hl_alyx', 'shapes_xr_app'], desc: 'Scan visual VR patterns' },
                          { id: 'img_halways', label: 'Corridor & Corridor Lights', matchIds: ['pt_demo'], desc: 'Scan loop patterns' },
                          { id: 'img_warcraft', label: 'Blizzard Faction Insignia', matchIds: ['wow_mmo'], desc: 'Scan target-combat tags' },
                          { id: 'img_cone', label: 'Orange Traffic Cone Icon', matchIds: ['vlc_media_player'], desc: 'Scan universal codecs' }
                        ].map(img => {
                          const isScanned = scannedImageId === img.id;
                          return (
                            <button
                              key={img.id}
                              onClick={() => triggerImageSearch(img.id, img.matchIds)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 ${
                                isScanned ? 'bg-cyan-500/15 border-cyan-400' : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              <div className="text-[10px] font-black uppercase text-white truncate">{img.label}</div>
                              <div className="text-[8px] text-zinc-500 font-mono uppercase">{img.desc}</div>
                            </button>
                          );
                        })}
                      </div>

                      {isImageScanning && (
                        <div className="bg-zinc-950 p-4 rounded-2xl border border-cyan-500/20 text-center space-y-2 animate-pulse">
                          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                          <div className="text-[10px] font-mono font-black text-cyan-400 uppercase">Extracting convolutional feature vector anchors...</div>
                        </div>
                      )}

                      {!isImageScanning && matchedImageTitles.length > 0 && (
                        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-emerald-500/20 space-y-2">
                          <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-widest block">MATCHING SYSTEMS DISCOVERED:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchedImageTitles.map(id => {
                              const t = softwareDatabase.find(s => s.id === id);
                              return t ? (
                                <button
                                  key={id}
                                  onClick={() => setDetailTitleId(id)}
                                  className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 hover:border-cyan-400 text-xs font-bold uppercase rounded-lg text-white cursor-pointer"
                                >
                                  {t.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Results Output list */}
                  {aiSearchResults.length > 0 && (
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Neural Query Matches Ranked</span>
                      <div className="space-y-2.5">
                        {aiSearchResults.map(match => {
                          const item = softwareDatabase.find(s => s.id === match.id);
                          if (!item) return null;
                          return (
                            <div key={match.id} className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black bg-amber-500/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded uppercase">{item.category}</span>
                                <h4 className="text-xs font-black text-white uppercase mt-1">{item.name}</h4>
                                <p className="text-[10px] text-zinc-500 leading-normal uppercase">AI FIT REASONING: {match.reason}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 font-mono">
                                <span className="text-[11px] font-black text-amber-400">{(match.relevance * 100).toFixed(0)}% MATCH</span>
                                <button
                                  onClick={() => setDetailTitleId(item.id)}
                                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded-xl uppercase tracking-widest font-black text-[8.5px] cursor-pointer"
                                >
                                  Open File
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Similarity Recommendations Tool */}
                  <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Architectural Similarity Matcher</span>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full md:w-1/3">
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Basis Engine Node</label>
                        <select
                          value={recommendBasisId}
                          onChange={(e) => setRecommendBasisId(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs uppercase font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {softwareDatabase.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {similarRecommendations.map(item => (
                          <div key={item.id} className="bg-zinc-950 p-3.5 rounded-2xl border border-white/5 space-y-2">
                            <span className="text-[7.5px] font-black bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-mono">{item.category}</span>
                            <h5 className="text-[11px] font-black text-white uppercase tracking-wider truncate">{item.name}</h5>
                            <button
                              onClick={() => setDetailTitleId(item.id)}
                              className="w-full text-center py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[8.5px] font-black uppercase text-cyan-400 rounded-lg cursor-pointer"
                            >
                              Inspect Core
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: GALAXY SECTOR MAP */}
              {activeTab === 'galaxy_map' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_galaxy_map"
                  className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Holographic Sector Map Grid</h3>
                    <p className="text-zinc-500 uppercase font-semibold text-[10px]">Select localized sectors in the Neon computing quadrant coordinate network to extract corresponding archives:</p>
                  </div>

                  {/* SVG Map visualization */}
                  <div className="border border-white/5 bg-zinc-950 rounded-3xl p-6 relative flex flex-col justify-center items-center overflow-hidden min-h-[350px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
                    
                    {/* Pulsing galaxy rings */}
                    <div className="absolute w-[280px] h-[280px] border border-dashed border-cyan-400/10 rounded-full animate-pulse" />
                    <div className="absolute w-[180px] h-[180px] border border-dashed border-fuchsia-400/10 rounded-full animate-ping" />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10 w-full max-w-2xl">
                      {[
                        { sector: 'S-1', label: 'Sector-01: Development Engines & AI Systems', tags: ['unreal_engine_5', 'chat_gpt', 'hl_alyx'], color: 'from-cyan-500/20 to-cyan-500/5 hover:border-cyan-400' },
                        { sector: 'S-2', label: 'Sector-02: Mobile Apps & SaaS Tools', tags: ['flappy_bird', 'vlc_media_player', 'shapes_xr_app'], color: 'from-amber-500/20 to-amber-500/5 hover:border-amber-400' },
                        { sector: 'S-3', label: 'Sector-03: Retro Emulators & Consoles', tags: ['retroarch_emu', 'pt_demo', 'am2r_game', 'wow_mmo'], color: 'from-rose-500/20 to-rose-500/5 hover:border-rose-400' },
                        { sector: 'S-4', label: 'Sector-04: Productivity & Collaborative Grids', tags: ['shapes_xr_app', 'chat_gpt', 'wow_mmo', 'vlc_media_player', 'hl_alyx'], color: 'from-emerald-500/20 to-emerald-500/5 hover:border-emerald-400' },
                        { sector: 'S-5', label: 'Sector-05: Delisted & Endangered Repositories', tags: ['pt_demo', 'am2r_game', 'flappy_bird', 'retroarch_emu', 'unreal_engine_5'], color: 'from-fuchsia-500/20 to-fuchsia-500/5 hover:border-fuchsia-400' }
                      ].map(sec => (
                        <button
                          key={sec.sector}
                          onClick={() => {
                            playSound('click');
                            setSearchQuery('');
                            // Simply display matching sector content by custom filtering or matching IDs
                            const matches = softwareDatabase.filter(s => s.mapSectors?.includes(sec.sector));
                            setSelectedCategory('All');
                            setSelectedPlatform('All');
                            setSelectedStatus('All');
                            setActiveTab('browser');
                            // Simulating setting up a text search representing that sector
                            setSearchQuery(sec.sector);
                          }}
                          className={`p-5 rounded-3xl border border-white/5 bg-gradient-to-br ${sec.color} text-left transition-all duration-300 cursor-pointer transform hover:-translate-y-1 space-y-3 shadow-md`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white font-mono">{sec.sector}</span>
                            <MapPin className="w-4 h-4 text-white animate-bounce" />
                          </div>
                          <div className="text-[10px] font-black uppercase text-zinc-300 leading-relaxed">{sec.label}</div>
                          <div className="text-[8px] font-mono text-zinc-500 uppercase">{sec.tags.length} Active System Nodes</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 4: TIMELINE ORBIT */}
              {activeTab === 'timeline' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_timeline"
                  className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Historical Compute Generations Chrono-Orbit</h3>
                    <p className="text-zinc-500 uppercase font-semibold text-[10px]">Inspect major chronological inflection milestones in global software evolution:</p>
                  </div>

                  <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 py-3">
                    {[
                      { year: '2001', title: 'Universal Codecs Breakthrough', desc: 'VLC Media Player launches, simplifying format container parsing and decoding.', itemIds: ['vlc_media_player'] },
                      { year: '2004', title: 'Massive MMORPG Paradigm Shift', desc: 'World of Warcraft hits servers, launching global scale targets combat and virtual guild structures.', itemIds: ['wow_mmo'] },
                      { year: '2010', title: 'Multi-Core Retro Emulators Frontends', desc: 'RetroArch frontend initializes unified Libretro Core execution standards.', itemIds: ['retroarch_emu'] },
                      { year: '2013', title: 'The Mobile Hyper-Casual Explosion', desc: 'Dong Nguyen unleashes Flappy Bird, showing addictive one-tap looping virality.', itemIds: ['flappy_bird'] },
                      { year: '2014', title: 'Looping Corridor Photorealism Teasers', desc: 'Kojima shadow-drops P.T. Demo, pioneering screen space graphics triggers.', itemIds: ['pt_demo'] },
                      { year: '2016', title: 'Endangered Remakes Purge Wave', desc: 'AM2R launches, followed by DMCA delisting. Community archives preserve metadata.', itemIds: ['am2r_game'] },
                      { year: '2020', title: 'High-Budget Immersive VR Standard', desc: 'Half-Life: Alyx establishes Vulkan source physical presence and inverse kinematics.', itemIds: ['hl_alyx'] },
                      { year: '2021', title: 'Rapid Spatial Prototyping Launch', desc: 'ShapesXR introduces volumetric storyboard wireframing on mobile SOCs.', itemIds: ['shapes_xr_app'] },
                      { year: '2022', title: 'Generative Attention Models Revolution', desc: 'ChatGPT LLM interface registers historical consumer adoption metrics.', itemIds: ['chat_gpt', 'unreal_engine_5'] }
                    ].map((milestone, mIdx) => (
                      <div key={mIdx} className="relative group">
                        {/* Interactive Dot Node */}
                        <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-fuchsia-400 group-hover:bg-fuchsia-400 transition-all duration-300" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-black text-fuchsia-400">{milestone.year}</span>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">{milestone.title}</h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed font-semibold uppercase">{milestone.desc}</p>
                          
                          <div className="flex gap-2 pt-1.5">
                            {milestone.itemIds.map(id => {
                              const t = softwareDatabase.find(s => s.id === id);
                              return t ? (
                                <button
                                  key={id}
                                  onClick={() => { playSound('click'); setDetailTitleId(id); }}
                                  className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-[9px] font-black uppercase text-fuchsia-400 border border-fuchsia-500/10 hover:border-fuchsia-400/40 rounded-xl cursor-pointer"
                                >
                                  Dossier: {t.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VIEW 5: SYSTEM INDEXES */}
              {activeTab === 'system_indexes' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_system_indexes"
                  className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Systems Telemetry Statistics Index</h3>
                    <p className="text-zinc-500 uppercase font-semibold text-[10px]">Holographic evaluation metrics derived across active database nodes:</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ratings Diagram Bar */}
                    <div className="bg-zinc-950 p-5 rounded-3xl border border-white/5 space-y-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Average Index User Scores</span>
                      
                      <div className="space-y-3.5">
                        {softwareDatabase.map(s => (
                          <div key={s.id} className="space-y-1 font-mono">
                            <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase">
                              <span>{s.name}</span>
                              <span className="text-emerald-400">{s.ratings.userRating} / 10</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${s.ratings.userRating * 10}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compute class distribution */}
                    <div className="bg-zinc-950 p-5 rounded-3xl border border-white/5 space-y-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Memory Allocation Scale (File Sizes)</span>
                      
                      <div className="space-y-3.5">
                        {softwareDatabase.map(s => {
                          const sizeNum = parseFloat(s.fileSize);
                          const maxScale = 95; // World of Warcraft is 95 GB
                          const widthPct = sizeNum ? Math.max(5, (sizeNum / maxScale) * 100) : 10;
                          return (
                            <div key={s.id} className="space-y-1 font-mono">
                              <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase">
                                <span>{s.name}</span>
                                <span className="text-cyan-400">{s.fileSize}</span>
                              </div>
                              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 6: USER CABINETS & DOWNLOAD MANAGER */}
              {activeTab === 'user_cabinets' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="tab_cabinets"
                  className="space-y-5"
                >
                  {/* Cabinet Sub Navigation */}
                  <div className="flex flex-wrap border-b border-white/10">
                    {[
                      { id: 'favorites', label: 'Starred Favorites', icon: Star, count: favorites.length },
                      { id: 'wishlist', label: 'Wishlists Deck', icon: Heart, count: wishlist.length },
                      { id: 'bookmarks', label: 'Bookmarks Node', icon: Bookmark, count: bookmarks.length },
                      { id: 'download_manager', label: 'Download Manager', icon: Download, count: downloadQueue.length },
                      { id: 'screen_records', label: 'Screen Records Folder', icon: Video, count: screenRecords.length }
                    ].map(sub => {
                      const Icon = sub.icon;
                      const isActive = activeCabinetSub === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => { playSound('click'); setActiveCabinetSub(sub.id as any); }}
                          className={`flex-1 min-w-[120px] text-center py-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${
                            isActive ? 'border-cyan-400 text-white' : 'border-transparent text-zinc-500 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{sub.label} ({sub.count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Render Cabinet Lists */}
                  {activeCabinetSub === 'favorites' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map(id => {
                        const item = softwareDatabase.find(s => s.id === id);
                        if (!item) return null;
                        return (
                          <div key={id} className="bg-zinc-900/60 p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-mono">{item.category}</span>
                              <h4 className="text-xs font-black text-white uppercase mt-1.5">{item.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">{item.developer}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleFavorite(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-rose-400 rounded-xl cursor-pointer">
                                Remove
                              </button>
                              <button onClick={() => setDetailTitleId(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-cyan-400 rounded-xl cursor-pointer">
                                Dossier
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {favorites.length === 0 && (
                        <div className="col-span-2 text-center p-12 text-zinc-500 uppercase font-bold text-xs">No favorites saved in cabinet files.</div>
                      )}
                    </div>
                  )}

                  {activeCabinetSub === 'wishlist' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map(id => {
                        const item = softwareDatabase.find(s => s.id === id);
                        if (!item) return null;
                        return (
                          <div key={id} className="bg-zinc-900/60 p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8px] font-black bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded uppercase font-mono">{item.category}</span>
                              <h4 className="text-xs font-black text-white uppercase mt-1.5">{item.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">{item.developer}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleWishlist(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-rose-400 rounded-xl cursor-pointer">
                                Remove
                              </button>
                              <button onClick={() => setDetailTitleId(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-cyan-400 rounded-xl cursor-pointer">
                                Dossier
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {wishlist.length === 0 && (
                        <div className="col-span-2 text-center p-12 text-zinc-500 uppercase font-bold text-xs">No wishlists saved in cabinet files.</div>
                      )}
                    </div>
                  )}

                  {activeCabinetSub === 'bookmarks' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarks.map(id => {
                        const item = softwareDatabase.find(s => s.id === id);
                        if (!item) return null;
                        return (
                          <div key={id} className="bg-zinc-900/60 p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8px] font-black bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded uppercase font-mono">{item.category}</span>
                              <h4 className="text-xs font-black text-white uppercase mt-1.5">{item.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">{item.developer}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleBookmark(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-rose-400 rounded-xl cursor-pointer">
                                Remove
                              </button>
                              <button onClick={() => setDetailTitleId(id)} className="p-2 bg-zinc-950 hover:bg-zinc-900 text-cyan-400 rounded-xl cursor-pointer">
                                Dossier
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {bookmarks.length === 0 && (
                        <div className="col-span-2 text-center p-12 text-zinc-500 uppercase font-bold text-xs">No bookmarks saved in cabinet files.</div>
                      )}
                    </div>
                  )}

                  {activeCabinetSub === 'download_manager' && (
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-md font-mono text-[11px]">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-sans">Simulated Neon Download Center</span>

                      <div className="space-y-3">
                        {downloadQueue.map(item => (
                          <div key={item.id} className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-2.5">
                            <div className="flex justify-between items-center text-xs font-black text-white uppercase">
                              <span>{item.name}</span>
                              <span className={`text-[9px] font-bold uppercase ${item.status === 'completed' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                STATUS: {item.status}
                              </span>
                            </div>

                            {/* Download bar */}
                            <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-white/5 relative flex items-center justify-center">
                              <div className="absolute left-0 inset-y-0 bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${item.progress}%` }} />
                              <span className="text-[8.5px] font-black text-white z-10 drop-shadow-md">{item.progress}%</span>
                            </div>

                            <div className="flex justify-between text-[9.5px] text-zinc-500 uppercase">
                              <span>Allocated memory: <strong className="text-zinc-300">{item.allocatedSize}</strong></span>
                              {item.status === 'downloading' && <span>SPEED: <strong className="text-cyan-400">{item.speed}</strong></span>}
                            </div>
                          </div>
                        ))}

                        {downloadQueue.length === 0 && (
                          <div className="text-center p-12 text-zinc-500 uppercase font-bold text-xs font-sans">No active download threads running. Download software from browser cards!</div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeCabinetSub === 'screen_records' && (
                    <div className="space-y-4">
                      <div className="bg-zinc-900/60 p-5 rounded-3xl border border-white/10 space-y-3.5 shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-sans">Cabinet Screen Recordings Folder</span>
                            <h3 className="text-xs font-mono font-black text-white uppercase mt-0.5">LOCAL NEURAL DECK CAPTURE ARCHIVE</h3>
                          </div>
                          {!isRecording && (
                            <button
                              onClick={startScreenRecording}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-400 text-[9px] font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                            >
                              ⏺ RECORD NEW CLIP
                            </button>
                          )}
                        </div>

                        {/* List of clips */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {screenRecords.map(rec => (
                            <div key={rec.id} className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <h4 className="text-[11px] font-black text-white uppercase font-mono truncate" title={rec.name}>
                                    {rec.name}
                                  </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-zinc-500 uppercase">
                                  <div>📅 Date: <strong className="text-zinc-400">{rec.date}</strong></div>
                                  <div>⏱ Length: <strong className="text-zinc-400">{rec.duration}</strong></div>
                                  <div className="col-span-2">⚖ File weight: <strong className="text-cyan-400">{rec.size}</strong></div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-white/5">
                                <button
                                  onClick={() => { playSound('click'); setPlaybackVideoUrl(rec.url); }}
                                  className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/20 text-cyan-400 hover:text-white rounded-lg text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all"
                                >
                                  ► PLAY CLIP
                                </button>
                                {rec.url !== 'simulated_feed_url' && (
                                  <a
                                    href={rec.url}
                                    download={rec.name}
                                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-lg text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center"
                                    title="Download video file"
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  onClick={() => deleteScreenRecord(rec.id)}
                                  className="py-1.5 px-3 bg-zinc-900 hover:bg-rose-950/40 border border-rose-500/20 text-rose-400 hover:text-white rounded-lg text-[9px] font-mono font-black uppercase tracking-wider text-center cursor-pointer transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {screenRecords.length === 0 && (
                            <div className="col-span-2 text-center p-12 text-zinc-500 uppercase font-bold text-[10px] font-sans border border-dashed border-white/5 rounded-2xl">
                              No screen records saved in folder. Capture some video clips using the recording controller!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* DETAIL DOSSIER SPEC SHEET PANEL MODAL */}
      {detailTitle && (
        <div className="fixed inset-0 bg-black/95 z-[999999] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-cyan-400/30 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative font-sans text-zinc-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 rounded-t-3xl" />

            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-2.5 py-1 rounded-md uppercase tracking-widest">{detailTitle.category}</span>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-wider mt-2.5">{detailTitle.name}</h2>
                <p className="text-xs text-zinc-400 font-medium leading-normal mt-1 uppercase">Published by {detailTitle.publisher} • Released {detailTitle.releaseDate}</p>
              </div>
              <button
                onClick={() => setDetailTitleId(null)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all text-sm cursor-pointer border border-white/5 font-black uppercase tracking-widest text-[10px]"
              >
                ✕ Close
              </button>
            </div>

            {/* Complete Full Dossier specs Body */}
            <div className="space-y-6 text-xs">
              
              {/* Description & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">System Node Overview</span>
                  <p className="text-zinc-300 leading-relaxed font-semibold text-sm">
                    {detailTitle.description}
                  </p>
                  {detailTitle.storyOverview && (
                    <div className="pt-2.5">
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Story Overview Matrix</span>
                      <p className="text-zinc-400 leading-relaxed uppercase text-[10px]">{detailTitle.storyOverview}</p>
                    </div>
                  )}
                </div>

                {/* Sub Metadata parameters box */}
                <div className="bg-zinc-900/40 p-4 rounded-3xl border border-white/5 space-y-2 font-mono text-[9px] uppercase">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block font-sans mb-1">Preservation Attributes</span>
                  <div>🏢 Franchise: <strong className="text-zinc-200">{detailTitle.franchise || 'N/A'}</strong></div>
                  <div>📦 Series: <strong className="text-zinc-200">{detailTitle.series || 'N/A'}</strong></div>
                  <div>🌍 Origin Language: <strong className="text-zinc-200">English (N/A)</strong></div>
                  <div>⏳ Release History: <strong className="text-zinc-200">{detailTitle.releaseDate}</strong></div>
                  <div>🛡️ Preservation Status: <strong className="text-emerald-400">{detailTitle.preservationStatus || 'FULLY SECURED'}</strong></div>
                  <div>🎭 Historical Importance: <strong className="text-amber-400 block mt-1 normal-case leading-relaxed font-sans">{detailTitle.historicalImportance || 'Indexed in global computing files.'}</strong></div>
                </div>
              </div>

              {/* Grid 2: Mechanics & Spatials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                  <h4 className="font-black text-white uppercase tracking-wider text-[11px] border-b border-white/5 pb-1.5">Core Gameplay Mechanics</h4>
                  <ul className="space-y-1.5">
                    {detailTitle.gameplayMechanics.map((mech, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-zinc-400 font-medium uppercase text-[10px]">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{mech}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                  <h4 className="font-black text-white uppercase tracking-wider text-[11px] border-b border-white/5 pb-1.5">Multiplayer Features & Netcode</h4>
                  <ul className="space-y-1.5">
                    {(detailTitle.multiplayerFeatures || ['Single-player only offline archive mode']).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-zinc-400 font-medium uppercase text-[10px]">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Characters, Bosses, Skills */}
              {(detailTitle.characters || detailTitle.bosses || detailTitle.itemsAndWeapons) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-white/5">
                  {detailTitle.characters && (
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Characters Ledger</span>
                      <div className="flex flex-wrap gap-1">
                        {detailTitle.characters.map((ch, idx) => (
                          <span key={idx} className="text-[8.5px] font-black bg-zinc-950 px-2 py-1 rounded uppercase border border-white/5 text-zinc-300">{ch}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailTitle.enemies && (
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Enemies & Bosses</span>
                      <div className="flex flex-wrap gap-1">
                        {(detailTitle.enemies || []).concat(detailTitle.bosses || []).map((en, idx) => (
                          <span key={idx} className="text-[8.5px] font-black bg-zinc-950 px-2 py-1 rounded uppercase border border-white/5 text-rose-400">{en}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailTitle.itemsAndWeapons && (
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Items & Weapons</span>
                      <div className="flex flex-wrap gap-1">
                        {detailTitle.itemsAndWeapons.map((it, idx) => (
                          <span key={idx} className="text-[8.5px] font-black bg-zinc-950 px-2 py-1 rounded uppercase border border-white/5 text-cyan-300">{it}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hardware Specifications */}
              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                <h4 className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-white/5 pb-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Hardware Requirements & Performance Benchmarks
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                  {/* Minimum specs */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Minimum Configuration Spec</span>
                    <div className="space-y-1.5 font-mono text-zinc-400 uppercase">
                      <div><strong className="text-zinc-500 uppercase">CPU:</strong> {detailTitle.minHardwareRequirements?.cpu || 'Dual Core CPU'}</div>
                      <div><strong className="text-zinc-500 uppercase">GPU:</strong> {detailTitle.minHardwareRequirements?.gpu || 'Integrated graphics / DX11 equivalent'}</div>
                      <div><strong className="text-zinc-500 uppercase">RAM:</strong> {detailTitle.minHardwareRequirements?.ram || '4 GB RAM'}</div>
                      <div><strong className="text-zinc-500 uppercase">STORAGE:</strong> {detailTitle.minHardwareRequirements?.storage || detailTitle.fileSize}</div>
                    </div>
                  </div>

                  {/* Recommended specs */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Recommended Configuration Spec</span>
                    <div className="space-y-1.5 font-mono text-zinc-400 uppercase">
                      <div><strong className="text-zinc-500 uppercase">CPU:</strong> {detailTitle.recHardwareRequirements?.cpu || 'Quad Core modern CPU'}</div>
                      <div><strong className="text-zinc-500 uppercase">GPU:</strong> {detailTitle.recHardwareRequirements?.gpu || 'Dedicated GPU equivalent'}</div>
                      <div><strong className="text-zinc-500 uppercase">RAM:</strong> {detailTitle.recHardwareRequirements?.ram || '8 GB+ RAM'}</div>
                      <div><strong className="text-zinc-500 uppercase">STORAGE:</strong> {detailTitle.recHardwareRequirements?.storage || detailTitle.fileSize}</div>
                    </div>
                  </div>
                </div>

                {detailTitle.benchmarks && (
                  <div className="border-t border-white/5 pt-3 font-mono text-[9.5px]">
                    <strong className="text-zinc-500 uppercase">PERFORMANCE BENCHMARKS:</strong> <span className="text-cyan-400 font-semibold">{detailTitle.benchmarks}</span>
                  </div>
                )}
              </div>

              {/* Dynamic properties: Audio Tech, Graphics, Engines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/40 p-4 rounded-3xl border border-white/5">
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Audio Technology standards</span>
                  <div className="font-mono text-[10px] text-white uppercase">{detailTitle.audioTech || 'Stereo Multi-channel mixers'}</div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Graphics & Render Pipelines</span>
                  <div className="font-mono text-[10px] text-cyan-300 uppercase">{detailTitle.graphicsTech || 'PBR Shader materials'}</div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Software Game Engine</span>
                  <div className="font-mono text-[10px] text-fuchsia-400 uppercase">{detailTitle.gameEngine || 'Proprietary core compilations'}</div>
                </div>
              </div>

              {/* Major Version Releases chronological list */}
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                <h5 className="font-black text-white uppercase text-[11px] tracking-wider border-b border-white/5 pb-1.5">Historical Version Change History Logs</h5>
                <div className="space-y-2.5">
                  {detailTitle.majorVersions.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 font-mono text-[10px]">
                      <div className="shrink-0">
                        <span className="text-cyan-400 font-bold uppercase">{v.version}</span>
                        <span className="text-zinc-600 block text-[8px] mt-0.5">{v.releaseDate}</span>
                      </div>
                      <div className="text-zinc-400 uppercase leading-normal text-right font-sans">{v.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational tutor Fact sheet */}
              {educationMode && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4.5 h-4.5 text-amber-400" />
                    <h5 className="font-black text-white uppercase text-[11px] tracking-wider">A.U.R.A Academic Lesson Insights</h5>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed font-semibold italic uppercase">
                    {detailTitle.educationFacts}
                  </p>
                </div>
              )}

              {/* Social Media links, wikis, changelogs metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-white/5 font-mono text-[9px] uppercase font-bold text-zinc-500">
                <div>🌐 Official Website: <a href={detailTitle.officialWebsite} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline block truncate mt-1">{detailTitle.officialWebsite}</a></div>
                <div>🗣️ Languages: <span className="text-zinc-300 block mt-1 truncate">{detailTitle.languages.join(', ')}</span></div>
                <div>⭐ Metacritic: <span className="text-zinc-300 block mt-1">{detailTitle.ratings.metacritic || 'N/A'}/100</span></div>
                <div>🎮 Controllers: <span className="text-zinc-300 block mt-1">{detailTitle.controllersSupported?.join(', ') || 'Standard input pointers'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive FX Lab & Soundboard panel */}
      {showFxLab && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950/98 border-l border-amber-500/30 z-[9999999] shadow-[-10px_0_50px_rgba(245,158,11,0.15)] flex flex-col p-6 overflow-y-auto select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-pulse">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
              </span>
              <div>
                <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest block">Neural Deck Controls</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">A.U.R.A FX & SOUNDS LAB</h3>
              </div>
            </div>
            
            <button
              onClick={() => { playSound('click'); setShowFxLab(false); }}
              className="p-1.5 bg-zinc-900 border border-white/5 hover:border-amber-400 rounded-xl text-zinc-400 hover:text-white transition-all text-[9.5px] font-mono font-bold tracking-wider cursor-pointer"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* 1. Theme Selector */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-wider">Aesthetic Visual Themes</span>
                <span className="text-[8.5px] font-mono text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Atmosphere</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setVisualTheme('cyber'); playSound('space_ping'); }}
                  className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                    visualTheme === 'cyber'
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🌐 Cyber
                </button>
                <button
                  onClick={() => { setVisualTheme('spooky'); playSound('jumpscare'); }}
                  className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                    visualTheme === 'spooky'
                      ? 'bg-red-500/25 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  💀 Horror
                </button>
                <button
                  onClick={() => { setVisualTheme('party'); playSound('success'); }}
                  className={`py-2 px-1 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                    visualTheme === 'party'
                      ? 'bg-pink-500/15 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🌈 Arcade
                </button>
              </div>
            </div>

            {/* 2. Interactive Synthesizer Soundboard Pad */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-wider">Dynamic Synth Soundboard</span>
                <span className="text-[8.5px] font-mono text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Web Audio</span>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => playSound('click')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>👾 Click</span>
                    <span className="text-[8px] font-mono text-zinc-500">Cool</span>
                  </button>
                  <button
                    onClick={() => playSound('hover')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>⚡ Hover Tick</span>
                    <span className="text-[8px] font-mono text-zinc-500">Cool</span>
                  </button>
                  <button
                    onClick={() => playSound('laser')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>🌌 Laser Blast</span>
                    <span className="text-[8px] font-mono text-cyan-400">Cool</span>
                  </button>
                  <button
                    onClick={() => playSound('space_ping')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>🪐 Sonar Echo</span>
                    <span className="text-[8px] font-mono text-cyan-400">Cool</span>
                  </button>
                  <button
                    onClick={() => playSound('arcade_jump')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>🕹️ Retro Jump</span>
                    <span className="text-[8px] font-mono text-emerald-400">Fun</span>
                  </button>
                  <button
                    onClick={() => playSound('success')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>🔔 Chime Sparkle</span>
                    <span className="text-[8px] font-mono text-fuchsia-400">Cool</span>
                  </button>
                  <button
                    onClick={() => playSound('ghost')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-red-500/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between animate-pulse"
                  >
                    <span>👻 Ghost Howl</span>
                    <span className="text-[8px] font-mono text-red-500">Scary</span>
                  </button>
                  <button
                    onClick={() => playSound('jumpscare')}
                    className="py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-red-500/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between animate-pulse"
                  >
                    <span>🩸 Jumpscare</span>
                    <span className="text-[8px] font-mono text-red-500">Scary</span>
                  </button>
                  <button
                    onClick={() => playSound('glitch')}
                    className="col-span-2 py-2.5 px-3 bg-zinc-900 border border-white/5 hover:border-rose-500/40 rounded-xl text-left transition-all hover:bg-zinc-800 text-[10px] font-black text-white uppercase cursor-pointer flex items-center justify-between"
                  >
                    <span>📺 Glitch Matrix Crash</span>
                    <span className="text-[8px] font-mono text-amber-400">Scary / Cool</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. High Performance Particle Systems */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-wider">Emitters & Vector Fields</span>
                <span className="text-[8.5px] font-mono text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Graphics</span>
              </div>
              
              <div className="space-y-4 font-mono text-[10px] uppercase font-bold text-zinc-400">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <span>Interactive Trails & Sparks</span>
                  <button
                    onClick={() => { playSound('click'); setParticlesEnabled(!particlesEnabled); }}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase cursor-pointer ${
                      particlesEnabled ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border border-white/5 text-zinc-500'
                    }`}
                  >
                    {particlesEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                {/* Particle gravity toggle */}
                <div className="flex items-center justify-between">
                  <span>Emitter Gravity Flow</span>
                  <button
                    onClick={() => { playSound('click'); setParticleGravity(!particleGravity); }}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase cursor-pointer ${
                      particleGravity ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-zinc-900 border border-white/5 text-zinc-500'
                    }`}
                  >
                    {particleGravity ? 'DOWNWARD' : 'DRIFT UP'}
                  </button>
                </div>

                {/* Dynamic screen shake toggle */}
                <div className="flex items-center justify-between">
                  <span>Impact Screen Shake</span>
                  <button
                    onClick={() => { playSound('click'); setScreenShakeToggle(!screenShakeToggle); }}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase cursor-pointer ${
                      screenShakeToggle ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400' : 'bg-zinc-900 border border-white/5 text-zinc-500'
                    }`}
                  >
                    {screenShakeToggle ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>

                {/* Emitter speed control slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-500 text-[9px]">
                    <span>Warp Drive Particle Speed</span>
                    <span className="text-amber-400">{particleSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={particleSpeed}
                    onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Telemetry Log and Info */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2 font-mono text-[9px] uppercase font-bold text-zinc-500">
              <div className="text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                DOCK NOTE
              </div>
              <p className="text-zinc-400 leading-relaxed font-semibold italic">
                MOVE THE CURSOR AROUND TO GENERATE SPARKS, FIREFLIES, SKULLS, AND BUBBLES IN REAL-TIME. CLICK THE SCREEN TO CRASH LIGHT ARRAYS!
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 mt-6 text-center font-mono text-[8px] uppercase font-black text-zinc-600 tracking-widest">
            A.U.R.A SYSTEM LAB DECK v1.99
          </div>
        </div>
      )}

      {/* Music player station portal overlay */}
      {showMusicStation && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-xl w-full">
            <MusicLoader onClose={() => setShowMusicStation(false)} />
          </div>
        </div>
      )}

      {/* Floating Active Recording HUD Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999999] bg-zinc-950/95 border-2 border-rose-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)] px-6 py-4 rounded-3xl flex items-center gap-6 font-mono text-[10px] uppercase font-bold text-white select-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-rose-600 rounded-full animate-ping shrink-0" />
              <span className="w-3.5 h-3.5 bg-rose-500 rounded-full absolute shrink-0" />
              <span className="text-[11px] font-black text-rose-500 tracking-wider">REC</span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="space-y-0.5">
              <span className="text-[7.5px] text-zinc-500 font-black block tracking-widest">RECORDING ELAPSED</span>
              <span className="text-xs font-black tracking-widest text-zinc-200">{formatRecordDuration(recordTimer)}</span>
            </div>

            <button
              onClick={stopScreenRecording}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 border border-rose-400/40 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              ⏹ STOP RECORDING
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Video Player playback Station modal */}
      <AnimatePresence>
        {playbackVideoUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[99999999] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="bg-zinc-950 border border-cyan-400/30 rounded-3xl p-5 max-w-4xl w-full flex flex-col gap-4 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-400 rounded-t-3xl" />
              
              {/* Video Player specifications Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">DECK MONITOR REPLAY STATION</span>
                </div>
                <button
                  onClick={() => { playSound('click'); setPlaybackVideoUrl(null); }}
                  className="p-1.5 bg-zinc-900 border border-white/5 hover:border-rose-500 rounded-xl text-zinc-400 hover:text-white transition-all text-[9.5px] font-mono font-bold tracking-wider cursor-pointer"
                >
                  ✕ CLOSE MONITOR
                </button>
              </div>

              {/* Video Element viewport */}
              <div className="bg-black rounded-2xl border border-white/10 overflow-hidden relative group aspect-video flex items-center justify-center">
                {playbackVideoUrl === 'simulated_feed_url' ? (
                  // Super cool simulated playback UI for cached items
                  <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-mono uppercase">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-cyan-400 animate-spin flex items-center justify-center" />
                      <Video className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white">RECONSTRUCTING NEURAL VECTOR STREAM...</h4>
                      <p className="text-[9px] text-zinc-500 max-w-md leading-relaxed">
                        THIS PREVIOUS SESSION CAPTURE IS CACHED. RAW CHANNELS EMULATION ACTIVE.
                      </p>
                    </div>
                    <div className="w-64 bg-zinc-900 rounded-full h-1 overflow-hidden relative">
                      <div className="absolute inset-y-0 bg-cyan-400 w-1/3 animate-ping" style={{ left: '33%' }} />
                    </div>
                  </div>
                ) : (
                  <video 
                    src={playbackVideoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Speciation Specs footer details */}
              <div className="bg-zinc-900/50 p-3.5 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4 font-mono text-[9px] uppercase font-semibold text-zinc-500">
                <span>Decoder standard: VP9 / WebM Audio/Video Stream</span>
                <span>FPS Track: 30hz stable specs telemetry</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications overlay */}
      <div className="fixed bottom-6 right-6 z-[9999999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none select-none font-sans">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`p-4 rounded-2xl border pointer-events-auto shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-start gap-3.5 ${
                t.type === 'success' 
                  ? 'bg-zinc-950/95 border-emerald-500/30 text-zinc-100'
                  : t.type === 'level'
                  ? 'bg-zinc-950/95 border-amber-400/40 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-950/95 border-cyan-500/30 text-zinc-100'
              }`}
            >
              {t.type === 'success' ? (
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              ) : t.type === 'level' ? (
                <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 shrink-0 animate-bounce">
                  <Trophy className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className={`text-[8px] font-mono font-black uppercase tracking-widest block ${
                  t.type === 'success' ? 'text-emerald-400' : t.type === 'level' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {t.sub}
                </span>
                <p className="text-[11px] font-black uppercase leading-normal tracking-wide text-white">{t.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
