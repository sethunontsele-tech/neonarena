import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../store';
import { saveSystem } from '../services/saveSystem';
import { 
  X, RotateCw, Volume2, ShieldAlert, Cpu, Trophy, 
  Sparkles, Calendar, User, Sliders, Globe, Gamepad2, 
  Download, Upload, Save, CloudLightning, ShieldCheck, Play, RefreshCw, AlertCircle,
  Target, Box
} from 'lucide-react';
import { auth } from '../firebase';

// ==========================================
// 1. LOCALIZATION DICTIONARY
// ==========================================
export const TRANSLATIONS = {
  en: {
    enter_arena: "ENTER ARENA",
    save_game: "SAVE GAME",
    load_game: "LOAD GAME",
    resume: "RESUME",
    quit: "QUIT GAME",
    settings: "SETTINGS",
    graphics: "GRAPHICS",
    audio: "AUDIO VOLUME",
    language: "LANGUAGE",
    controls: "CONTROLS",
    achievements: "ACHIEVEMENTS",
    daily_rewards: "DAILY REWARDS",
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    ultra: "ULTRA",
    vibration: "HAPTIC VIBRATION",
    unlocked: "UNLOCKED",
    locked: "LOCKED",
    offline_mode: "OFFLINE SINGLE-PLAYER",
    cloud_save: "CLOUD SAVE SYNC",
    game_paused: "GAME PAUSED",
    rotate_device: "ROTATE TO LANDSCAPE",
    rotate_desc: "Neon Arena requires a landscape viewport for maximum 60FPS console rendering.",
    save_success: "Progress saved successfully!",
    load_success: "Save data loaded successfully!",
    claim: "CLAIM DAY {day}",
    claimed: "CLAIMED",
    streak: "STREAK MULTIPLIER",
    export_save: "EXPORT SAVE FILE",
    import_save: "IMPORT SAVE FILE",
    crash_detected: "ANOMALY DETECTED: THREE.JS CONTEXT LOST",
    reboot: "REBOOT SIMULATOR",
  },
  es: {
    enter_arena: "ENTRAR A LA ARENA",
    save_game: "GUARDAR PARTIDA",
    load_game: "CARGAR PARTIDA",
    resume: "REANUDAR",
    quit: "SALIR AL MENÚ",
    settings: "AJUSTES",
    graphics: "GRÁFICOS",
    audio: "VOLUMEN DE AUDIO",
    language: "IDIOMA",
    controls: "CONTROLES",
    achievements: "LOGROS",
    daily_rewards: "RECOMPENSAS DIARIAS",
    low: "BAJO",
    medium: "MEDIO",
    high: "ALTO",
    ultra: "ULTRA",
    vibration: "VIBRACIÓN HÁPTICA",
    unlocked: "DESBLOQUEADO",
    locked: "BLOQUEADO",
    offline_mode: "MODO OFFLINE",
    cloud_save: "SINCRO DE NUBE",
    game_paused: "JUEGO PAUSADO",
    rotate_device: "ROTAR A HORIZONTAL",
    rotate_desc: "Neon Arena requiere vista horizontal para renderizado óptimo de 60FPS.",
    save_success: "¡Progreso guardado con éxito!",
    load_success: "¡Datos de partida cargados con éxito!",
    claim: "RECLAMAR DÍA {day}",
    claimed: "RECLAMADO",
    streak: "MULTIPLICADOR DE RACHA",
    export_save: "EXPORTAR PARTIDA",
    import_save: "IMPORTAR PARTIDA",
    crash_detected: "ANOMALÍA: CONTEXTO THREE.JS PERDIDO",
    reboot: "REINICIAR SIMULADOR",
  },
  fr: {
    enter_arena: "ENTRER DANS L'ARÈNE",
    save_game: "SAUVEGARDER",
    load_game: "CHARGER",
    resume: "REPRENDRE",
    quit: "QUITTER LE JEU",
    settings: "PARAMÈTRES",
    graphics: "GRAPHISMES",
    audio: "VOLUME AUDIO",
    language: "LANGUE",
    controls: "CONTRÔLES",
    achievements: "SUCCÈS",
    daily_rewards: "RÉCOMPENSES",
    low: "FAIBLE",
    medium: "MOYEN",
    high: "ÉLEVÉ",
    ultra: "ULTRA",
    vibration: "VIBRATION HAPTIQUE",
    unlocked: "DÉVERROUILLÉ",
    locked: "VERROUILLÉ",
    offline_mode: "MODE HORS-LIGNE",
    cloud_save: "SAUVEGARDE CLOUD",
    game_paused: "JEU EN PAUSE",
    rotate_device: "TOURNER L'ÉCRAN",
    rotate_desc: "Neon Arena nécessite le mode paysage pour un affichage fluide à 60 FPS.",
    save_success: "Sauvegarde effectuée avec succès!",
    load_success: "Données chargées avec succès!",
    claim: "RÉCUPÉRER JOUR {day}",
    claimed: "RÉCUPÉRÉ",
    streak: "MULTIPLICATEUR DE SÉRIE",
    export_save: "EXPORTER FICHIER",
    import_save: "IMPORTER FICHIER",
    crash_detected: "ANOMALIE: CONTEXTE THREE.JS PERDU",
    reboot: "REDÉMARRER",
  },
  de: {
    enter_arena: "ARENA BETRETEN",
    save_game: "SPEICHERN",
    load_game: "LADEN",
    resume: "FORTSETZEN",
    quit: "SPIEL BEENDEN",
    settings: "EINSTELLUNGEN",
    graphics: "GRAFIK",
    audio: "AUDIO LAUTSTÄRKE",
    language: "SPRACHE",
    controls: "STEUERUNG",
    achievements: "ERFOLGE",
    daily_rewards: "TÄGLICHE BELOHNUNG",
    low: "NIEDRIG",
    medium: "MITTEL",
    high: "HOCH",
    ultra: "ULTRA",
    vibration: "HAPTISCHES FEEDBACK",
    unlocked: "FREIGESCHALTET",
    locked: "GESPERRT",
    offline_mode: "OFFLINE-MODUS",
    cloud_save: "CLOUD SPEICHERUNG",
    game_paused: "SPIEL PAUSIERT",
    rotate_device: "QUERFORMAT WÄHLEN",
    rotate_desc: "Neon Arena benötigt das Querformat für optimale 60FPS Konsolendarstellung.",
    save_success: "Fortschritt erfolgreich gespeichert!",
    load_success: "Speicherstand erfolgreich geladen!",
    claim: "TAG {day} ABHOLEN",
    claimed: "ABGEHOLT",
    streak: "STREAK MULTIPLIKATOR",
    export_save: "SPIELSTAND EXPORTIEREN",
    import_save: "SPIELSTAND IMPORTIEREN",
    crash_detected: "FEHLER: THREE.JS KONTEXT VERLOREN",
    reboot: "SIMULATOR NEUSTARTEN",
  },
  ja: {
    enter_arena: "アリーナに入る",
    save_game: "セーブする",
    load_game: "ロードする",
    resume: "再開",
    quit: "終了する",
    settings: "設定",
    graphics: "グラフィックス",
    audio: "音量調整",
    language: "言語選択",
    controls: "操作方法",
    achievements: "実績解除",
    daily_rewards: "デイリーログイン報酬",
    low: "低",
    medium: "中",
    high: "高",
    ultra: "ウルトラ",
    vibration: "触覚振動",
    unlocked: "解除済み",
    locked: "ロック中",
    offline_mode: "オフラインモード",
    cloud_save: "クラウドセーブ同期",
    game_paused: "一時停止中",
    rotate_device: "画面を横にしてください",
    rotate_desc: "60FPSの快適な描写を実現するため、横画面でプレイしてください。",
    save_success: "セーブが正常に完了しました！",
    load_success: "セーブデータのロードに成功しました！",
    claim: "デイ {day} 報酬を受け取る",
    claimed: "獲得済み",
    streak: "連続ボーナス倍率",
    export_save: "データを書き出す",
    import_save: "データを読み込む",
    crash_detected: "エラー: THREE.JS コンテキスト消失",
    reboot: "システムを再起動する",
  }
};

// ==========================================
// 2. LANDSCAPE ORIENTATION GUIDE OVERLAY
// ==========================================
export function LandscapeOverlay() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // If width < height, we are in portrait mode
      setIsPortrait(window.innerWidth < window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const language = useGameStore(state => (state as any).language) || 'en';
  const text = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-8 text-center select-none pointer-events-auto">
      <motion.div
        animate={{ rotate: [0, -90, -90, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
        className="w-20 h-32 border-4 border-amber-400 rounded-2xl flex items-center justify-center mb-8"
      >
        <RotateCw className="w-10 h-10 text-amber-400 animate-spin" />
      </motion.div>
      <h2 className="text-2xl font-black text-amber-400 italic uppercase tracking-wider mb-3">
        {text.rotate_device}
      </h2>
      <p className="text-xs text-white/60 max-w-sm uppercase leading-relaxed font-bold tracking-wide">
        {text.rotate_desc}
      </p>
    </div>
  );
}

// ==========================================
// 3. NATIVE ANDROID BACK BUTTON LISTENER
// ==========================================
export function AndroidBackButtonListener() {
  const gameState = useGameStore(state => state.gameState);
  const isPaused = useGameStore(state => (state as any).isPaused);
  const setIsPaused = useGameStore(state => (state as any).setIsPaused);

  useEffect(() => {
    // Import Capacitor core dynamically to safely catch errors if run outside android
    const initBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        if (App) {
          const handler = await App.addListener('backButton', () => {
            if (gameState === 'playing' || gameState === 'open_world') {
              setIsPaused(!isPaused);
            } else if (gameState === 'lobby') {
              useGameStore.setState({ gameState: 'splash' });
            }
          });
          return () => {
            handler.remove();
          };
        }
      } catch (e) {
        // Fallback or silent exit on standard web browser
      }
    };
    initBackButton();
  }, [gameState, isPaused, setIsPaused]);

  return null;
}

// ==========================================
// 4. WEBG_L CONTEXT LOSS & CRASH PROTECTION BOUNDARY
// ==========================================
export class CrashProtectionBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ThreeD/Canvas crash occurred:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center z-[140] font-sans">
          <div className="relative p-8 bg-black border-2 border-red-500 rounded-3xl max-w-md flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(239,68,68,0.25)]">
            <div className="absolute -top-4 left-1/4 right-1/4 h-[2px] bg-red-500 blur-sm" />
            <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
            <div>
              <h2 className="text-red-500 font-black text-xl uppercase italic tracking-tighter mb-2">
                WebGL Context Lost
              </h2>
              <p className="text-[10px] text-white/50 uppercase leading-relaxed font-bold">
                The mobile graphics hardware released the WebGL canvas. Neon Arena crashed gracefully to prevent device freeze.
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                useGameStore.setState({ gameState: 'splash' });
              }}
              className="px-6 py-3 bg-red-500 text-white font-black uppercase text-xs rounded-xl flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-md shadow-red-500/20 cursor-pointer"
            >
              <RefreshCw size={14} className="animate-spin" />
              Reboot Matrix Simulator
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// 5. IN-GAME PAUSE MENU OVERLAY
// ==========================================
export function PauseMenuOverlay() {
  const isPaused = useGameStore(state => (state as any).isPaused);
  const setIsPaused = useGameStore(state => (state as any).setIsPaused);
  const vibrationEnabled = useGameStore(state => (state as any).vibrationEnabled) ?? true;
  const setVibrationEnabled = useGameStore(state => (state as any).setVibrationEnabled);
  const graphicsQuality = useGameStore(state => state.graphicsQuality);
  const setGraphicsQuality = useGameStore(state => state.setGraphicsQuality);
  const language = useGameStore(state => (state as any).language) || 'en';
  const setLanguage = useGameStore(state => (state as any).setLanguage);
  
  const text = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const triggerHaptic = () => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto select-none pointer-events-auto font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-950 border border-blue-500/35 rounded-3xl p-6 w-full max-w-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] flex flex-col gap-6 relative"
      >
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute -top-16 left-1/4 right-1/4 bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest text-center py-2.5 rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 border border-blue-400"
            >
              <ShieldCheck size={14} /> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-7 h-7 text-blue-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">{text.game_paused}</h2>
              <span className="text-[8px] text-blue-400/60 font-black uppercase tracking-widest">SYSTEM OVERRIDE HUB</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsPaused(false);
              triggerHaptic();
            }}
            className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Section */}
          <div className="flex flex-col gap-5">
            {/* Graphics Selector */}
            <div>
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 block">{text.graphics}</label>
              <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1.5 border border-white/5 rounded-2xl">
                {(['low', 'medium', 'high', 'ultra'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setGraphicsQuality(q);
                      // Toggle dynamic high-performance lights toggler
                      useGameStore.setState({ isUltraGraphics: q === 'ultra' });
                      triggerHaptic();
                    }}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer ${
                      graphicsQuality === q 
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {text[q]}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 block">{text.language}</label>
              <div className="grid grid-cols-5 gap-1 bg-black/40 p-1.5 border border-white/5 rounded-2xl text-[9px]">
                {(['en', 'es', 'fr', 'de', 'ja'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      triggerHaptic();
                    }}
                    className={`py-2 rounded-xl font-black uppercase transition-all cursor-pointer ${
                      language === lang 
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/25' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Haptic Vibration Toggle */}
            <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5 rounded-2xl">
              <div>
                <div className="text-[10px] font-black text-white uppercase">{text.vibration}</div>
                <div className="text-[8px] text-white/40">PHYSICAL FORCE feedback</div>
              </div>
              <button 
                onClick={() => {
                  setVibrationEnabled(!vibrationEnabled);
                  triggerHaptic();
                }}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${vibrationEnabled ? 'bg-blue-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${vibrationEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Core Operations Section */}
          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={() => {
                setIsPaused(false);
                triggerHaptic();
              }}
              className="py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={14} fill="currentColor" /> {text.resume}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const ok = saveSystem.saveLocally();
                  if (ok) {
                    showToast(text.save_success);
                    triggerHaptic();
                  }
                }}
                className="py-3.5 bg-zinc-900 border border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-wider text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={12} /> {text.save_game}
              </button>

              <button
                onClick={() => {
                  const ok = saveSystem.loadLocally();
                  if (ok) {
                    showToast(text.load_success);
                    triggerHaptic();
                  } else {
                    alert('No local save file found.');
                  }
                }}
                className="py-3.5 bg-zinc-900 border border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-wider text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} /> {text.load_game}
              </button>
            </div>

            {/* Cloud Sync Optional Button */}
            {auth.currentUser ? (
              <button
                onClick={async () => {
                  const ok = await saveSystem.saveToCloud();
                  if (ok) {
                    showToast('Cloud database sync completed!');
                    triggerHaptic();
                  }
                }}
                className="py-3 bg-blue-500/10 border border-blue-500/25 text-blue-400 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CloudLightning size={12} /> Sync Save to Cloud
              </button>
            ) : (
              <div className="text-center p-3 border border-white/5 bg-white/5 rounded-2xl text-[8px] text-white/30 uppercase font-black">
                Sign in on home matrix to backup saves on cloud
              </div>
            )}

            <button
              onClick={() => {
                setIsPaused(false);
                useGameStore.setState({ gameState: 'lobby' });
                triggerHaptic();
              }}
              className="py-3.5 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {text.quit}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 6. ACHIEVEMENTS & OPERATOR BADGES PANEL
// ==========================================
export function AchievementsPanel() {
  const score = useGameStore(state => state.score);
  const kills = useGameStore(state => state.kills);
  const deaths = useGameStore(state => state.deaths);
  const achievementsList = useGameStore(state => state.achievements) || [];
  
  const language = useGameStore(state => (state as any).language) || 'en';
  const text = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const badgeTemplates = [
    { id: 'first_kill', name: 'FIRST BLOOD', desc: 'Slay an enemy bot operator in direct match combat.', required: kills >= 1 },
    { id: 'unstoppable', name: 'UNSTOPPABLE FORCE', desc: 'Secure over 5 kills in a single session.', required: kills >= 5 },
    { id: 'arena_master', name: 'ARENA CONQUEROR', desc: 'Achieve a score of 1000+ points on the live matrices.', required: score >= 1000 },
    { id: 'survivor', name: 'ZERO IMMORTAL', desc: 'Avoid dying in active combat zones.', required: deaths === 0 && score > 200 },
    { id: 'credits_king', name: 'FINANCIAL DOMINATOR', desc: 'Accumulate more than 500 Credits in item trades.', required: score >= 500 }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
        <Trophy className="text-amber-400 animate-bounce" /> {text.achievements}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badgeTemplates.map(badge => (
          <div 
            key={badge.id}
            className={`p-5 rounded-[2rem] border-2 flex gap-4 items-center transition-all relative overflow-hidden ${
              badge.required 
                ? 'bg-amber-400/5 border-amber-400 text-white shadow-[0_0_20px_rgba(251,191,36,0.08)]' 
                : 'bg-white/5 border-white/5 text-white/50'
            }`}
          >
            {/* Stamp Badge Indicator */}
            <div className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${badge.required ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/30'}`}>
              <Trophy size={20} />
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wide italic flex items-center gap-1.5">
                {badge.name}
                {badge.required && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
              </div>
              <p className="text-[10px] text-white/50 font-semibold uppercase leading-normal mt-1">{badge.desc}</p>
            </div>

            <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-black/40">
              {badge.required ? text.unlocked : text.locked}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 7. DAILY REWARDS CALENDAR LOGIN PANEL
// ==========================================
export function DailyRewardsPanel() {
  const dailyRewards = useGameStore(state => state.dailyRewards) || [];
  const score = useGameStore(state => state.score);
  const setScore = (s: number) => useGameStore.setState({ score: s });
  const vibrationEnabled = useGameStore(state => (state as any).vibrationEnabled) ?? true;
  
  const language = useGameStore(state => (state as any).language) || 'en';
  const text = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const handleClaim = (dayIndex: number) => {
    if (dailyRewards[dayIndex]?.collected) return;
    
    // Settle rewards
    const creditsReward = (dayIndex + 1) * 100;
    setScore(score + creditsReward);
    
    // Update daily rewards state in store
    const updated = [...dailyRewards];
    updated[dayIndex] = { ...updated[dayIndex], collected: true };
    useGameStore.setState({ dailyRewards: updated });
    
    // Sound FX & trigger local haptic
    const sound = (window as any).soundService;
    if (sound) sound.playSFX('quest_complete');
    
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // double tap haptic feel
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
        <Calendar className="text-blue-400 animate-pulse" /> {text.daily_rewards}
      </h3>
      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
        Login daily to receive multipliers, matrix points, and rare credits bonuses.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {dailyRewards.map((reward, idx) => (
          <button
            key={reward.day}
            disabled={reward.collected}
            onClick={() => handleClaim(idx)}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-3 transition-all relative overflow-hidden cursor-pointer ${
              reward.collected 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : 'bg-white/5 border-white/10 hover:border-blue-400 text-white'
            }`}
          >
            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">DAY {reward.day}</div>
            <div className={`p-2 rounded-xl text-xs font-black italic ${reward.collected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
              +{reward.day * 100}XP
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">
              {reward.collected ? text.claimed : 'CLAIM'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 8. FILE BASED SAVE MANAGEMENT UI
// ==========================================
export function SaveLoadManagerUI() {
  const language = useGameStore(state => (state as any).language) || 'en';
  const text = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await saveSystem.importFromFile(file);
    if (ok) {
      alert(text.load_success);
      triggerHaptic();
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col gap-4">
      <h3 className="text-xl font-black text-amber-400 uppercase italic tracking-tight flex items-center gap-2">
        <Save size={20} /> FILE BACKUP MANAGEMENT
      </h3>
      <p className="text-[10px] text-white/40 uppercase font-bold leading-normal">
        Android operations allow exporting and importing encrypted save data ciphers. Backup progress safely!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <button
          onClick={() => {
            saveSystem.exportToFile();
            triggerHaptic();
          }}
          className="py-3.5 bg-zinc-900 hover:bg-white/5 border border-amber-500/30 text-amber-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={14} /> {text.export_save}
        </button>

        <label className="py-3.5 bg-zinc-900 hover:bg-white/5 border border-blue-500/30 text-blue-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center relative">
          <Upload size={14} /> {text.import_save}
          <input 
            type="file" 
            accept=".sav" 
            onChange={handleImportFile}
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
        </label>
      </div>
    </div>
  );
}

// ==========================================
// 9. IN-GAME ONBOARDING TUTORIAL MODAL
// ==========================================
interface TutorialOverlayProps {
  onClose: () => void;
}

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Neon Arena",
      desc: "Prepare to synchronize your neural interfaces! This onboarding simulator will configure you for low-latency virtual-reality match combat.",
      icon: Gamepad2,
      color: "text-amber-400 border-amber-400",
    },
    {
      title: "Tactical Movement",
      desc: "Place your thumb on the bottom-left of your touchscreen. Drag the virtual joystick to move, strafe, and perform lightning-fast dodging maneuvers.",
      icon: RotateCw,
      color: "text-blue-400 border-blue-400",
    },
    {
      title: "Locking & Slaying Targets",
      desc: "Drag anywhere on the right-half of the screen to aim. Tap the glowing red Target button to fire plasma rounds, and tap the blue Arrow button to vault over obstacles.",
      icon: Target,
      color: "text-red-400 border-red-400",
    },
    {
      title: "Structure Construction",
      desc: "Toggle the green Box icon to enter Matrix Build Mode. Build blocks, cover shields, and high-energy barriers in real-time to defend against incoming fire.",
      icon: Box,
      color: "text-emerald-400 border-emerald-400",
    },
    {
      title: "Console Control Center",
      desc: "Tap the pause button or hit ESC anytime to adjust graphics parameters (Low to Ultra), sfx/music volume, language translations, or manage backup saves.",
      icon: Sliders,
      color: "text-purple-400 border-purple-400",
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[250] flex items-center justify-center p-4 pointer-events-auto select-none font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-amber-500/30 rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_0_80px_rgba(245,158,11,0.2)] text-center flex flex-col items-center gap-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Dynamic Glowing Icon */}
        <div className={`p-5 rounded-[2rem] border-2 bg-black/50 ${current.color} shadow-lg shadow-current/5`}>
          <Icon className="w-12 h-12 animate-pulse" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{current.title}</h3>
          <p className="text-[11px] text-white/50 font-bold uppercase leading-relaxed max-w-sm">{current.desc}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 justify-center">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === step ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-3.5 bg-amber-400 text-black font-black uppercase text-xs rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          {step === steps.length - 1 ? "FINISH SIMULATION" : "NEXT INSTRUCTION"}
        </button>
      </motion.div>
    </div>
  );
}
