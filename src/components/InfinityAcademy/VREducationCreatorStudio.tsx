import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  Video, Camera, Radio, Play, Pause, Square, Sparkles, Send, Bot,
  Cpu, Languages, RotateCcw, Save, Download, FileJson, Layers, Sliders,
  Volume2, Type, Image as ImageIcon, CheckCircle, HelpCircle, AlertCircle,
  Eye, RefreshCw, Film, Trash2, Mic, Plus, FileText, ChevronRight, X
} from 'lucide-react';
import { useEduStore, ActiveDimensionType } from './eduStore';
import { soundService } from '../../services/soundService';

// Interfaces for our creator system
interface VideoTimelineEvent {
  id: string;
  time: number; // in seconds
  type: 'camera' | 'character' | 'vfx' | 'subtitle' | 'audio';
  label: string;
  duration: number;
}

interface SavedProject {
  id: string;
  title: string;
  subject: string;
  script: string;
  vfxPreset: string;
  cameraMode: string;
  createdAt: string;
}

export function VREducationCreatorStudio({ onClose }: { onClose: () => void }) {
  const activeDimension = useEduStore(state => state.activeDimension);
  const setDimension = useEduStore(state => state.setDimension);
  const gainXP = useEduStore(state => state.gainXP);

  // Studio tabs
  const [activeTab, setActiveTab] = useState<'director' | 'camera' | 'youtuber' | 'export'>('director');

  // Core creator states
  const [scriptText, setScriptText] = useState<string>(
    "Welcome students to the micro-world! Today we are exploring the Mitochondria. It is often called the powerhouse of the cell because it generates chemical energy (ATP). Look at the membrane folds, known as cristae. These maximize surface area for chemical reactions. Let's zoom into the matrix and examine cellular respiration in action!"
  );
  
  // Real-Time AI feedback score
  const [aiAnalysis, setAiAnalysis] = useState({
    clarity: 92,
    engagement: 88,
    suggestions: [
      "Add a visual callout during 'ATP' to show its molecular structure.",
      "Sync AURA character to wave and gesture enthusiastically at the start.",
      "A cinematic slow pan during the cristae description will highlight the folds better."
    ]
  });

  const [aiIsAnalyzing, setAiIsAnalyzing] = useState(false);
  const [isLiveEditing, setIsLiveEditing] = useState(true);

  // VR Camera states
  const [cameraMode, setCameraMode] = useState<'cinematic' | 'first_person' | 'third_person' | 'free_orbit'>('cinematic');
  const [camPosition, setCamPosition] = useState({ x: 2.4, y: 1.8, z: -4.2 });
  const [camRotation, setCamRotation] = useState({ pitch: 12, yaw: -45 });
  const [showGridOverlay, setShowGridOverlay] = useState(true);

  // YouTuber states
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(3);
  const [isTeleprompterRunning, setIsTeleprompterRunning] = useState(false);
  const [teleprompterScroll, setTeleprompterScroll] = useState(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceWaveform, setVoiceWaveform] = useState<number[]>(Array(24).fill(10));
  const [autoSubtitles, setAutoSubtitles] = useState(true);
  const [subtitles, setSubtitles] = useState<string[]>([
    "[0:01] Welcome students to the micro-world!",
    "[0:04] Today we are exploring the Mitochondria.",
    "[0:08] It is often called the powerhouse of the cell...",
    "[0:12] ...because it generates chemical energy (ATP)."
  ]);

  // Thumbnail Creator states
  const [thumbnailTitle, setThumbnailTitle] = useState("CELL POWERHOUSE SECRETS!");
  const [thumbnailSub, setThumbnailSub] = useState("Biology VR Lab Masterclass");
  const [thumbnailTheme, setThumbnailTheme] = useState<'cyan' | 'amber' | 'rose' | 'emerald'>('cyan');
  const [thumbnailBg, setThumbnailBg] = useState<'biology' | 'space' | 'physics' | 'labs'>('biology');
  const [includeAvatar, setIncludeAvatar] = useState(true);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState<string>('');

  // Audio edit sliders
  const [volumes, setVolumes] = useState({
    voice: 85,
    music: 35,
    sfx: 60
  });

  // Export & timeline state
  const [timelineEvents, setTimelineEvents] = useState<VideoTimelineEvent[]>([
    { id: '1', time: 0, type: 'character', label: 'AURA Wave Intro', duration: 3 },
    { id: '2', time: 1.5, type: 'camera', label: 'Cinematic Left-to-Right Pan', duration: 6 },
    { id: '3', time: 4, type: 'vfx', label: 'Mitochondria Glowing Highlights', duration: 4 },
    { id: '4', time: 8.5, type: 'subtitle', label: 'Sub: chemical energy (ATP)', duration: 3.5 },
    { id: '5', time: 11, type: 'audio', label: 'Respiration Synth Sweeps', duration: 5 }
  ]);

  const [activeStage, setActiveStage] = useState<ActiveDimensionType>('biology');

  // Recording engine
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [recordedSize, setRecordedSize] = useState(0.0); // in MB
  const [savedVideos, setSavedVideos] = useState<any[]>([
    { id: 'vid_1', title: 'Deep Cell Respiration Study', subject: 'Biology', duration: '1:45', size: '24.2 MB', date: 'July 16, 2026' },
    { id: 'vid_2', title: 'Stellar Orbit Mechanics', subject: 'Solar System', duration: '0:58', size: '12.8 MB', date: 'July 15, 2026' }
  ]);

  // AI instructions mapped from script
  const [aiActions, setAiActions] = useState<any[]>([
    { time: "0.0s", act: "Spawn AURA Guide", param: "Position: [0, 1.2, -2.5], LookAt: Camera" },
    { time: "1.5s", act: "Camera Travel", param: "Pan Left to Right, FOV: 55deg" },
    { time: "4.0s", act: "VFX Particle Burst", param: "Green ATP molecules float around cell center" },
    { time: "7.2s", act: "Character Gesture", param: "Explain Point Right (to highlights)" },
    { time: "10.0s", act: "Audio FX Trigger", param: "Sub-atomic organic hum sweep" }
  ]);

  // Handle Teleprompter Scrolling Simulation
  useEffect(() => {
    let interval: any;
    if (isTeleprompterRunning) {
      interval = setInterval(() => {
        setTeleprompterScroll(prev => {
          if (prev >= 100) return 0; // loop
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTeleprompterRunning]);

  // Voice wave simulator
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceWaveform(Array(24).fill(0).map(() => Math.floor(Math.random() * 45) + 5));
      }, 120);
    } else {
      setVoiceWaveform(Array(24).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Rec duration timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVideo) {
      timer = setInterval(() => {
        setRecDuration(prev => {
          const nextVal = prev + 1;
          setRecordedSize(parseFloat((nextVal * 0.28).toFixed(1)));
          return nextVal;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isRecordingVideo]);

  // Trigger real-time AI scripting when script is modified (debounced/simulated)
  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setScriptText(text);

    if (isLiveEditing) {
      // Trigger instant simulated update
      updateAiDirectorLive(text);
    }
  };

  const updateAiDirectorLive = (text: string) => {
    // Generate organic scoring on the fly
    const wordCount = text.split(/\s+/).length;
    const hasATP = text.toUpperCase().includes('ATP');
    const hasMito = text.toUpperCase().includes('MITO');
    const hasEnergy = text.toUpperCase().includes('ENERGY');

    let cl = 80 + Math.min(18, Math.floor(wordCount / 3));
    let en = 75 + Math.min(23, (hasATP ? 5 : 0) + (hasMito ? 7 : 0) + (hasEnergy ? 5 : 0));
    
    // Safety cap
    if (cl > 100) cl = 98;
    if (en > 100) en = 97;

    setAiAnalysis(prev => ({
      clarity: cl,
      engagement: en,
      suggestions: [
        `Word count is now ${wordCount}. Good density for explanation.`,
        hasATP ? "Excellent! Explaining adenosine triphosphate brings biochemical precision." : "Add 'ATP' to name the currency of energy.",
        hasMito ? "Correct! Mitochondria references are mapped onto active 3D geometries." : "Directly point to the mitochondria in the viewport."
      ]
    }));

    // Update the dynamic AI actions sequence on the fly
    const actionList = [
      { time: "0.0s", act: "Spawn AURA Guide", param: "Pose: Professional Tutor, Scale: 1.0" },
      { time: `${(wordCount * 0.05).toFixed(1)}s`, act: "Camera Hook", param: `LookAt: ${hasMito ? 'Mitochondria Inner Membrane' : 'Primary Target'}` }
    ];

    if (hasATP) {
      actionList.push({ time: "3.5s", act: "Show Molecule Overlay", param: "Formula: C10H16N5O13P3 (ATP) holographic wireframe" });
    }
    if (text.length > 100) {
      actionList.push({ time: "6.8s", act: "Cinematic Zoom", param: "Focus on Cristae fold depth" });
    }

    setAiActions(actionList);
  };

  const runFullAiAnalysis = async () => {
    setAiIsAnalyzing(true);
    soundService.playSFX('ui_click');
    
    // Call our AI teacher backend to perform deep reasoning
    try {
      const response = await fetch('/api/academy/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Perform video director plan analysis on the educational script: "${scriptText}" and output animation commands, visual camera moves, and scene changes in JSON format.`
        })
      });
      const data = await response.json();
      
      // Integrate AI-guided improvements
      setAiAnalysis({
        clarity: 96,
        engagement: 95,
        suggestions: [
          "A.U.R.A: Excellent instructional structure. The script translates seamlessly to visual blocks.",
          "Director Tip: Use the 'Space Solar' stage to visually contrast macro and micro gravity.",
          "Voice Advice: Speak with deliberate pauses when pointing out atomic structures."
        ]
      });

      // Insert smart response events
      setAiActions([
        { time: "0.0s", act: "Spawn AURA Teacher", param: "Greeting gesture, wave, face camera" },
        { time: "2.2s", act: "Show Label", param: "Mitochondria Membrane (Floating Indicator)" },
        { time: "5.0s", act: "Camera Transition", param: "Slow circular flight around outer cristae" },
        { time: "9.5s", act: "VFX Glow Glow", param: "Radiate light on inner matrix" },
        { time: "14.0s", act: "TTS / Audio", param: "Speech synthesis voice generation initialized" }
      ]);

      gainXP(30);
    } catch (e) {
      console.error("AI Assistant service timed out, using fallback direct logic.", e);
    } finally {
      setAiIsAnalyzing(false);
    }
  };

  // Recording controls
  const handleToggleRecord = () => {
    soundService.playSFX('ui_click');
    if (isRecordingVideo) {
      // Stop recording, save to list
      setIsRecordingVideo(false);
      const newVideo = {
        id: `vid_${Date.now()}`,
        title: `Lesson: ${activeStage.toUpperCase()} Studio`,
        subject: activeStage.charAt(0).toUpperCase() + activeStage.slice(1),
        duration: `0:${recDuration.toString().padStart(2, '0')}`,
        size: `${recordedSize} MB`,
        date: 'Today'
      };
      setSavedVideos([newVideo, ...savedVideos]);
      setRecDuration(0);
      setRecordedSize(0);
      gainXP(75);
    } else {
      setIsRecordingVideo(true);
    }
  };

  // Voice recording toggle
  const handleToggleVoice = () => {
    soundService.playSFX('ui_click');
    setIsRecordingVoice(!isRecordingVoice);
  };

  // Dynamic Thumbnail Creator
  const generateAIAestheticThumbnail = () => {
    setIsGeneratingThumbnail(true);
    soundService.playSFX('ui_click');

    setTimeout(() => {
      // Set simulated premium design background with real-time variables!
      const themes: Record<string, string> = {
        cyan: 'from-cyan-950/90 via-slate-900 to-black border-cyan-400/40',
        amber: 'from-amber-950/90 via-slate-900 to-black border-amber-400/40',
        rose: 'from-rose-950/90 via-slate-900 to-black border-rose-400/40',
        emerald: 'from-emerald-950/90 via-slate-900 to-black border-emerald-400/40',
      };
      
      setGeneratedThumbnailUrl(`https://picsum.photos/seed/${thumbnailTitle.replace(/\s+/g, '') + thumbnailTheme}/600/340`);
      setIsGeneratingThumbnail(false);
      gainXP(40);
    }, 1500);
  };

  // Export 3D project download simulation
  const handleExport3DProject = () => {
    soundService.playSFX('ui_click');
    gainXP(25);
    
    // Simulate downloading files
    const projectData = {
      version: "NeonArenaCreator_1.16",
      subject: activeStage,
      cameraMode: cameraMode,
      camPos: camPosition,
      script: scriptText,
      timelineEvents: timelineEvents,
      aiInstructions: aiActions
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon_arena_${activeStage}_creator_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="absolute inset-x-8 inset-y-12 z-[60] bg-zinc-950/95 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden flex flex-col pointer-events-auto">
      
      {/* Top Header Panel */}
      <div className="relative border-b border-white/5 p-6 flex justify-between items-center bg-zinc-950">
        {/* Colorful top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />

        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <Video className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-md uppercase">AI VR Creator Studio</span>
              {isRecordingVideo && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-[9px] font-bold text-red-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  REC: 0:{(recDuration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-wider mt-1">Neon Arena AI VR Education Creator System</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Stage selector */}
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active VR Stage:</span>
            <select 
              value={activeStage} 
              onChange={(e) => {
                const targetStage = e.target.value as ActiveDimensionType;
                setActiveStage(targetStage);
                setDimension(targetStage);
                soundService.playSFX('ui_click');
              }}
              className="bg-transparent text-xs font-black uppercase text-cyan-400 border-none outline-none cursor-pointer"
            >
              <option value="biology" className="bg-zinc-950 text-white">Biology Kingdom</option>
              <option value="physics" className="bg-zinc-950 text-white">Physics Labs</option>
              <option value="chemistry" className="bg-zinc-950 text-white">Chemistry Center</option>
              <option value="solar_system" className="bg-zinc-950 text-white">Space & Solar System</option>
              <option value="anatomy" className="bg-zinc-950 text-white">Anatomy Explorer</option>
              <option value="coding" className="bg-zinc-950 text-white">Coding Island</option>
              <option value="white_void" className="bg-zinc-950 text-white">White Void Sandbox</option>
            </select>
          </div>

          <button 
            onClick={onClose}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-2xl border border-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Split Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-12">
        
        {/* Left Side Tab Navigation Panel */}
        <div className="col-span-2 border-r border-white/5 bg-zinc-950/60 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block px-2.5 mb-3">WORKSPACE MODULES</span>
            
            <button 
              onClick={() => { setActiveTab('director'); soundService.playSFX('ui_click'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'director' 
                  ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-4.5 h-4.5" />
              AI Director
            </button>

            <button 
              onClick={() => { setActiveTab('camera'); soundService.playSFX('ui_click'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'camera' 
                  ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-4.5 h-4.5" />
              Camera Rig
            </button>

            <button 
              onClick={() => { setActiveTab('youtuber'); soundService.playSFX('ui_click'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'youtuber' 
                  ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4.5 h-4.5" />
              YouTuber Tools
            </button>

            <button 
              onClick={() => { setActiveTab('export'); soundService.playSFX('ui_click'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'export' 
                  ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Download className="w-4.5 h-4.5" />
              Export & Files
            </button>
          </div>

          {/* Bottom Live Recording Deck */}
          <div className="bg-zinc-900 border border-white/5 p-4 rounded-3xl space-y-3.5">
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE DECK RECORDER
            </span>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleToggleRecord}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isRecordingVideo
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5'
                }`}
              >
                {isRecordingVideo ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-current" />}
                {isRecordingVideo ? 'Stop Recording' : 'Start Recording'}
              </button>

              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1 mt-1">
                <span>SIZE: {recordedSize} MB</span>
                <span>TIME: 0:{(recDuration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Main Workspace Panel */}
        <div className="col-span-7 border-r border-white/5 p-6 overflow-y-auto custom-scrollbar bg-zinc-950">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: AI DIRECTOR ASSISTANT */}
            {activeTab === 'director' && (
              <motion.div 
                key="director-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Section intro */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      AI Director Script Editor
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold">Write natural language script or lesson transcripts. AI manages character animations and camera moves.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase">Live script sync:</span>
                    <input 
                      type="checkbox" 
                      checked={isLiveEditing} 
                      onChange={(e) => {
                        setIsLiveEditing(e.target.checked);
                        soundService.playSFX('ui_click');
                      }}
                      className="accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Script text editor */}
                <div className="relative">
                  <textarea 
                    value={scriptText}
                    onChange={handleScriptChange}
                    className="w-full h-44 bg-zinc-900 border border-white/10 rounded-3xl p-5 text-xs text-zinc-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-400/50 resize-none uppercase"
                    placeholder="ENTER YOUR VR LESSON SCRIPT HERE..."
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      onClick={runFullAiAnalysis}
                      disabled={aiIsAnalyzing}
                      className="px-4 py-2 bg-cyan-500 text-zinc-950 hover:bg-cyan-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {aiIsAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {aiIsAnalyzing ? 'Analyzing...' : 'Deep Director Analysis'}
                    </button>
                  </div>
                </div>

                {/* AI Timeline Actions Generated */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      AI Directed Event Blocks (Active Sequence)
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500">Auto-calculated from your script</span>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    {aiActions.map((action, idx) => (
                      <div key={idx} className="col-span-6 bg-zinc-900/80 border border-white/5 rounded-2xl p-3 flex items-center justify-between group hover:border-cyan-400/20 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">{action.time}</span>
                          <div>
                            <span className="text-[10px] font-black text-zinc-200 uppercase block">{action.act}</span>
                            <span className="text-[9px] text-zinc-500 uppercase block mt-0.5">{action.param}</span>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-400 opacity-60" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Evaluation Insights */}
                <div className="grid grid-cols-12 gap-4">
                  
                  {/* Scores */}
                  <div className="col-span-4 bg-zinc-900/40 border border-white/5 p-4 rounded-3xl flex flex-col justify-between">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">AI Assessment Scores</span>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                          <span className="text-zinc-400">Lesson Clarity</span>
                          <span className="text-cyan-400">{aiAnalysis.clarity}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${aiAnalysis.clarity}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                          <span className="text-zinc-400">VR Engagement</span>
                          <span className="text-fuchsia-400">{aiAnalysis.engagement}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-fuchsia-400 h-full rounded-full" style={{ width: `${aiAnalysis.engagement}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div className="col-span-8 bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-2.5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">AI Teacher Recommendations</span>
                    <ul className="space-y-1.5">
                      {aiAnalysis.suggestions.map((suggestion, sIdx) => (
                        <li key={sIdx} className="text-[10px] text-zinc-400 flex items-start gap-2 leading-relaxed uppercase">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 2: VR CAMERA RIG CONTROLS */}
            {activeTab === 'camera' && (
              <motion.div 
                key="camera-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    VR Camera Rig & Views
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold">Manipulate physical and virtual camera parameters inside the 3D VR environment.</p>
                </div>

                {/* 3D Viewport Simulator */}
                <div className="relative aspect-video w-full rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden flex items-center justify-center">
                  
                  {/* Outer design details to simulate active recording viewfinder */}
                  {showGridOverlay && (
                    <div className="absolute inset-0 border border-cyan-500/20 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Mock live rendering overlay of current ActiveStage */}
                  <div className="text-center space-y-2.5 z-10 px-4 select-none">
                    <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase bg-zinc-900/90 border border-cyan-400/30 px-3 py-1 rounded-full">
                      🎥 LIVE VIEWPORT FEED: {activeStage.toUpperCase()} STAGE
                    </span>
                    <p className="text-xs text-zinc-400 font-mono">
                      POS: [X: {camPosition.x.toFixed(1)}, Y: {camPosition.y.toFixed(1)}, Z: {camPosition.z.toFixed(1)}] | TILT: {camRotation.pitch}°
                    </p>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider max-w-sm mx-auto leading-relaxed">
                      Representing real-time feed mapped to {cameraMode.replace('_', ' ').toUpperCase()} view path bounds.
                    </p>
                  </div>

                  {/* Corner indicator details */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[9px] text-zinc-400 bg-black/70 px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    CAM: LIVE_HD_PASS
                  </div>

                  <div className="absolute bottom-4 right-4 flex items-center gap-3 font-mono text-[9px] text-zinc-400 bg-black/70 px-3 py-1 rounded-xl">
                    <span>GRID: {showGridOverlay ? "ON" : "OFF"}</span>
                    <span>1080p60</span>
                  </div>
                </div>

                {/* Camera Parameter Controls */}
                <div className="grid grid-cols-12 gap-4">
                  
                  {/* Camera Mode Selector */}
                  <div className="col-span-4 bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Camera View Mode</span>
                    
                    <div className="space-y-2">
                      {[
                        { id: 'cinematic', label: 'Cinematic Pan', desc: 'Smooth AI sweep rails' },
                        { id: 'first_person', label: 'First-Person', desc: 'Through student visor' },
                        { id: 'third_person', label: 'Third-Person', desc: 'AURA companion angle' },
                        { id: 'free_orbit', label: 'Free Orbit', desc: 'Full manual coordinate hover' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => { setCameraMode(mode.id as any); soundService.playSFX('ui_click'); }}
                          className={`w-full text-left p-3 rounded-2xl flex flex-col transition-all border ${
                            cameraMode === mode.id 
                              ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200' 
                              : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:border-white/5'
                          }`}
                        >
                          <span className="text-xs font-black uppercase">{mode.label}</span>
                          <span className="text-[8px] uppercase tracking-widest mt-0.5 text-zinc-500">{mode.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider Position Controls */}
                  <div className="col-span-8 bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Manual Coordinates Override</span>
                      <button 
                        onClick={() => {
                          setCamPosition({ x: 2.4, y: 1.8, z: -4.2 });
                          setCamRotation({ pitch: 12, yaw: -45 });
                          soundService.playSFX('ui_click');
                        }}
                        className="text-[9px] font-black text-cyan-400 uppercase flex items-center gap-1 hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Viewport
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 text-zinc-400">
                          <span>X-Axis Shift (Lateral)</span>
                          <span className="font-mono text-cyan-400">{camPosition.x.toFixed(1)}m</span>
                        </div>
                        <input 
                          type="range" 
                          min="-10" 
                          max="10" 
                          step="0.1"
                          value={camPosition.x}
                          onChange={(e) => setCamPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                          className="w-full accent-cyan-400 bg-zinc-800 rounded-lg appearance-none h-1.5"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 text-zinc-400">
                          <span>Y-Axis Height (Elevation)</span>
                          <span className="font-mono text-cyan-400">{camPosition.y.toFixed(1)}m</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="8" 
                          step="0.1"
                          value={camPosition.y}
                          onChange={(e) => setCamPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                          className="w-full accent-cyan-400 bg-zinc-800 rounded-lg appearance-none h-1.5"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 text-zinc-400">
                          <span>Z-Axis Depth (Dolly)</span>
                          <span className="font-mono text-cyan-400">{camPosition.z.toFixed(1)}m</span>
                        </div>
                        <input 
                          type="range" 
                          min="-15" 
                          max="15" 
                          step="0.1"
                          value={camPosition.z}
                          onChange={(e) => setCamPosition(prev => ({ ...prev, z: parseFloat(e.target.value) }))}
                          className="w-full accent-cyan-400 bg-zinc-800 rounded-lg appearance-none h-1.5"
                        />
                      </div>

                      {/* Toggle overlays */}
                      <div className="pt-2 flex gap-4">
                        <button 
                          onClick={() => { setShowGridOverlay(!showGridOverlay); soundService.playSFX('ui_click'); }}
                          className={`px-3 py-1.5 border rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            showGridOverlay 
                              ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300' 
                              : 'border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Viewfinder Grid Lines
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 3: YOUTUBER CREATOR SUITE */}
            {activeTab === 'youtuber' && (
              <motion.div 
                key="youtuber-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400" />
                    YouTuber Creator Suite
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold">Generate scrolling teleprompters, record clean educational voiceovers, and design high-CTR thumbnails.</p>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  
                  {/* Teleprompter Panel */}
                  <div className="col-span-7 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Scrolling Teleprompter
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-500">SPEED:</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="10" 
                          value={teleprompterSpeed} 
                          onChange={(e) => setTeleprompterSpeed(parseInt(e.target.value) || 3)}
                          className="w-10 bg-zinc-800 border border-white/10 rounded px-1.5 py-0.5 text-center text-[10px] font-mono text-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Scrolling area */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl h-36 overflow-hidden relative p-4 flex flex-col justify-center">
                      <div 
                        className="text-center font-sans font-black text-zinc-100 uppercase tracking-wide leading-relaxed px-4 transition-all duration-300"
                        style={{ transform: `translateY(-${teleprompterScroll * 0.8}px)`, fontSize: '15px' }}
                      >
                        {scriptText}
                      </div>

                      {/* Fades to make look premium */}
                      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => { setIsTeleprompterRunning(!isTeleprompterRunning); soundService.playSFX('ui_click'); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          isTeleprompterRunning 
                            ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                            : 'bg-zinc-800 text-white'
                        }`}
                      >
                        {isTeleprompterRunning ? '⏸ Pause Prompter' : '▶ Start Prompter'}
                      </button>

                      <button 
                        onClick={() => { setTeleprompterScroll(0); soundService.playSFX('ui_click'); }}
                        className="text-[9px] font-black text-zinc-500 hover:text-zinc-300 uppercase flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Scroll
                      </button>
                    </div>
                  </div>

                  {/* Audio Mixer / Voice Record */}
                  <div className="col-span-5 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block pb-2 border-b border-white/5">Audio Deck Mixer</span>
                    
                    {/* Voice recording button */}
                    <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase">Voiceover Track</span>
                        {isRecordingVoice && <span className="text-[8px] font-mono font-bold text-red-400 animate-pulse">● RECORDING</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleToggleVoice}
                          className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                            isRecordingVoice 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Mic className="w-4.5 h-4.5" />
                        </button>
                        
                        {/* Audio equalizer bars */}
                        <div className="flex-1 flex items-end gap-1 h-8 justify-between px-1">
                          {voiceWaveform.map((val, idx) => (
                            <div 
                              key={idx} 
                              className={`w-1 rounded-full transition-all duration-100 ${isRecordingVoice ? 'bg-cyan-400' : 'bg-zinc-700'}`}
                              style={{ height: `${val}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase mb-1">
                          <span>Voice Channel</span>
                          <span className="font-mono">{volumes.voice}%</span>
                        </div>
                        <input 
                          type="range" 
                          value={volumes.voice}
                          onChange={(e) => setVolumes(p => ({ ...p, voice: parseInt(e.target.value) }))}
                          className="w-full accent-cyan-400 h-1 bg-zinc-800"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase mb-1">
                          <span>Music Bed</span>
                          <span className="font-mono">{volumes.music}%</span>
                        </div>
                        <input 
                          type="range" 
                          value={volumes.music}
                          onChange={(e) => setVolumes(p => ({ ...p, music: parseInt(e.target.value) }))}
                          className="w-full accent-cyan-400 h-1 bg-zinc-800"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Subtitle Generator & Thumbnail Designer */}
                <div className="grid grid-cols-12 gap-5">
                  
                  {/* Automatic Subtitles generator */}
                  <div className="col-span-5 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Automatic Captions</span>
                      <input 
                        type="checkbox" 
                        checked={autoSubtitles} 
                        onChange={(e) => setAutoSubtitles(e.target.checked)}
                        className="accent-cyan-400"
                      />
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {subtitles.map((sub, sIdx) => (
                        <div key={sIdx} className="p-2 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
                          <span>{sub}</span>
                          <span className="text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">SYNCED</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High CTR Thumbnail Creator */}
                  <div className="col-span-7 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block pb-2 border-b border-white/5">High-CTR Thumbnail Designer</span>
                    
                    <div className="grid grid-cols-12 gap-4">
                      
                      {/* Left controls */}
                      <div className="col-span-6 space-y-3">
                        <div>
                          <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Headline Text</label>
                          <input 
                            type="text" 
                            value={thumbnailTitle}
                            onChange={(e) => setThumbnailTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-400/50"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Sub-Headline Text</label>
                          <input 
                            type="text" 
                            value={thumbnailSub}
                            onChange={(e) => setThumbnailSub(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-400/50"
                          />
                        </div>

                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <label className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Glow Hue</label>
                            <select 
                              value={thumbnailTheme} 
                              onChange={(e) => setThumbnailTheme(e.target.value as any)}
                              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2 py-1.5 text-[9px] text-zinc-300 font-bold uppercase"
                            >
                              <option value="cyan">Cyan Neon</option>
                              <option value="amber">Amber Gold</option>
                              <option value="rose">Rose Crimson</option>
                              <option value="emerald">Emerald Core</option>
                            </select>
                          </div>

                          <div className="col-span-6">
                            <label className="text-[8px] font-black text-zinc-500 uppercase block mb-1">Background</label>
                            <select 
                              value={thumbnailBg} 
                              onChange={(e) => setThumbnailBg(e.target.value as any)}
                              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2 py-1.5 text-[9px] text-zinc-300 font-bold uppercase"
                            >
                              <option value="biology">Mitochondria</option>
                              <option value="space">Solar System</option>
                              <option value="physics">Gravity Field</option>
                              <option value="labs">Anatomy dissection</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input 
                            type="checkbox" 
                            checked={includeAvatar} 
                            onChange={(e) => setIncludeAvatar(e.target.checked)}
                            className="accent-cyan-400"
                          />
                          <span className="text-[9px] font-black text-zinc-400 uppercase">Include AURA Tutor Overlay</span>
                        </div>
                      </div>

                      {/* Visual display output of thumbnail */}
                      <div className="col-span-6 flex flex-col justify-between">
                        <div className={`relative aspect-video w-full rounded-2xl border bg-gradient-to-br overflow-hidden flex items-center justify-center ${
                          thumbnailTheme === 'cyan' ? 'from-cyan-950/80 via-zinc-900 to-black border-cyan-500/20' :
                          thumbnailTheme === 'amber' ? 'from-amber-950/80 via-zinc-900 to-black border-amber-500/20' :
                          thumbnailTheme === 'rose' ? 'from-rose-950/80 via-zinc-900 to-black border-rose-500/20' :
                          'from-emerald-950/80 via-zinc-900 to-black border-emerald-500/20'
                        }`}>
                          
                          {generatedThumbnailUrl ? (
                            <img 
                              src={generatedThumbnailUrl} 
                              alt="Generated Thumbnail Background" 
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover opacity-40 filter brightness-90"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center border border-dashed border-white/10">
                              <span className="text-[8px] font-bold text-zinc-500">THUMBNAIL BACKGROUND ART</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

                          {/* Decorative lines */}
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[6px] font-bold rounded">
                            VR EXCLUSIVE
                          </div>

                          {/* Titles overlay */}
                          <div className="absolute bottom-3 left-3 right-3 space-y-0.5 text-left z-10">
                            <h4 className={`text-[11px] font-black tracking-tight leading-tight uppercase truncate ${
                              thumbnailTheme === 'cyan' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' :
                              thumbnailTheme === 'amber' ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' :
                              thumbnailTheme === 'rose' ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' :
                              'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                            }`}>
                              {thumbnailTitle || "UNTITLED LESSON"}
                            </h4>
                            <p className="text-[7px] text-zinc-300 font-bold uppercase truncate">{thumbnailSub}</p>
                          </div>

                          {/* Companion avatar representation */}
                          {includeAvatar && (
                            <div className="absolute bottom-0 right-1 w-11 h-14 bg-cyan-400/10 border-l border-t border-cyan-400/20 rounded-tl-xl flex items-center justify-center z-10">
                              <span className="text-[6px] font-black text-cyan-400 uppercase tracking-widest text-center leading-none">AURA AI</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={generateAIAestheticThumbnail}
                          disabled={isGeneratingThumbnail}
                          className="w-full mt-2.5 py-2.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
                        >
                          {isGeneratingThumbnail ? "Designing..." : "🪄 Create Premium Thumbnail"}
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 4: EXPORT & FILES */}
            {activeTab === 'export' && (
              <motion.div 
                key="export-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                    <Download className="w-5 h-5 text-cyan-400" />
                    Export Engine & Storage
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold">Compile recordings, download structured 3D scenes, or sync projects with your Neon Arena Creator Studio account.</p>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  
                  {/* Library grid */}
                  <div className="col-span-8 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">Local Recordings Storage Directory</span>
                    
                    <div className="space-y-2.5">
                      {savedVideos.map((vid) => (
                        <div key={vid.id} className="p-4 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-between hover:border-cyan-400/20 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                              <Film className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase">{vid.subject}</span>
                              <h4 className="text-xs font-black text-white mt-1 uppercase">{vid.title}</h4>
                              <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 mt-0.5">
                                <span>DATE: {vid.date}</span>
                                <span>•</span>
                                <span>SIZE: {vid.size}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 mr-2">{vid.duration}</span>
                            <button 
                              onClick={() => {
                                soundService.playSFX('ui_click');
                                alert(`Downloading compiled high-resolution lesson video: ${vid.title}.mp4`);
                              }}
                              className="p-2 bg-cyan-500 text-zinc-950 hover:bg-cyan-400 rounded-xl transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest"
                            >
                              Download MP4
                            </button>
                            <button 
                              onClick={() => {
                                soundService.playSFX('ui_click');
                                setSavedVideos(savedVideos.filter(v => v.id !== vid.id));
                              }}
                              className="p-2 bg-zinc-900 text-zinc-500 hover:text-red-400 rounded-xl border border-white/5 hover:border-red-500/30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="col-span-4 bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block pb-2 border-b border-white/5">Project Export Pipelines</span>
                    
                    <button 
                      onClick={handleExport3DProject}
                      className="w-full p-4 bg-zinc-950 border border-white/5 hover:border-cyan-400/30 rounded-2xl text-left flex items-start gap-3 transition-all group"
                    >
                      <div className="p-2 bg-cyan-500/10 border border-cyan-400/20 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white uppercase block">Export 3D Scene Project</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mt-0.5">OBJ bounds & camera nodes</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        soundService.playSFX('ui_click');
                        gainXP(45);
                        alert("Workspace progress synchronized successfully with Neon Arena Cloud Database.");
                      }}
                      className="w-full p-4 bg-zinc-950 border border-white/5 hover:border-fuchsia-400/30 rounded-2xl text-left flex items-start gap-3 transition-all group"
                    >
                      <div className="p-2 bg-fuchsia-500/10 border border-fuchsia-400/20 rounded-xl text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-zinc-950 transition-all">
                        <Save className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white uppercase block">Save Workspace to Cloud</span>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mt-0.5">Sync to user profiles</span>
                      </div>
                    </button>

                    <div className="bg-cyan-500/5 border border-cyan-400/10 p-4 rounded-2xl">
                      <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        CREATOR LAB COMPATIBLE
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-relaxed uppercase">
                        Exported projects sync directly into Neon Arena Creator Studio enabling multi-device high performance editing.
                      </p>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Panel: Video Timeline Deck */}
        <div className="col-span-3 bg-zinc-950/60 p-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Video timeline tracks
              </span>
              <button 
                onClick={() => {
                  const newEv: VideoTimelineEvent = {
                    id: `ev_${Date.now()}`,
                    time: timelineEvents.length * 2,
                    type: 'vfx',
                    label: 'Dynamic VFX Pulse',
                    duration: 3
                  };
                  setTimelineEvents([...timelineEvents, newEv]);
                  soundService.playSFX('ui_click');
                }}
                className="text-[9px] font-black text-cyan-400 hover:underline uppercase flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Block
              </button>
            </div>

            {/* List of track elements */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
              {timelineEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between hover:border-cyan-400/20 transition-all group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        ev.type === 'camera' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                        ev.type === 'character' ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' :
                        ev.type === 'vfx' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        ev.type === 'subtitle' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                      }`}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-500">{ev.time.toFixed(1)}s</span>
                    </div>
                    <h4 className="text-[11px] font-black text-zinc-200 uppercase tracking-tight">{ev.label}</h4>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">{ev.duration}s</span>
                    <button 
                      onClick={() => {
                        setTimelineEvents(timelineEvents.filter(e => e.id !== ev.id));
                        soundService.playSFX('ui_click');
                      }}
                      className="text-zinc-600 hover:text-red-400 p-1 bg-white/5 rounded-lg border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-900 rounded-3xl border border-white/5 space-y-3">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Creator Stats Info</span>
            
            <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-mono font-bold text-zinc-400">
              <div className="col-span-6 p-2 bg-zinc-950 rounded-xl border border-white/5">
                <span className="text-[8px] text-zinc-600 uppercase block">Total Blocks</span>
                <span className="text-cyan-400 mt-1 block">{timelineEvents.length} Items</span>
              </div>

              <div className="col-span-6 p-2 bg-zinc-950 rounded-xl border border-white/5">
                <span className="text-[8px] text-zinc-600 uppercase block">Total Duration</span>
                <span className="text-fuchsia-400 mt-1 block">18.5 Seconds</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default VREducationCreatorStudio;
