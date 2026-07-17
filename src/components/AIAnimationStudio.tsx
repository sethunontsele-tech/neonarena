import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, X, Sparkles, Video, Camera, Calendar, Play, Pause, 
  Layers, Volume2, Mic, Check, RotateCcw, ArrowUp, Plus, Trash2, 
  Download, Eye, Settings, Cpu, Move, Minimize2, Pin, ShieldAlert,
  Sliders, Activity, Smartphone, Info, Upload, BookOpen, AlertCircle
} from 'lucide-react';

// Sound Helper
const playSFX = (type: 'click' | 'success' | 'beep' | 'render') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      gain.gain.setValueAtTime(0.05, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc.start();
      osc.stop(audioContext.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioContext.currentTime);
      osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    } else if (type === 'beep') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioContext.currentTime);
      gain.gain.setValueAtTime(0.02, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.05);
      osc.start();
      osc.stop(audioContext.currentTime + 0.05);
    } else if (type === 'render') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioContext.currentTime);
      osc.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.5);
      gain.gain.setValueAtTime(0.03, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      osc.start();
      osc.stop(audioContext.currentTime + 0.5);
    }
  } catch (e) {
    // Audio Context might be blocked or unsupported
  }
};

// Type definitions
interface Project {
  id: string;
  title: string;
  resolution: '720p' | '1080p' | '1440p' | '4K';
  lastModified: string;
  script: string;
  styleParams: {
    colorTemp: string;
    cameraPace: string;
    motionDampening: number;
    edgeContrast: string;
    lightingStyle: string;
  };
  assets: Array<{ id: string; type: 'model' | 'bg' | 'audio' | 'effect'; name: string; details: string }>;
  cameraKeyframes: Array<{ id: string; time: number; pos: [number, number, number]; target: [number, number, number] }>;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Gravity & Space-Time Warp',
    resolution: '1080p',
    lastModified: 'Just now',
    script: `[SCENE: VORTEX RIFT - WIDE CAM SWEEP]\n[TOPIC: PHYSICS - GRAVITY DEVIATION]\nNARRATOR: Welcome to the edge of reality. When giant masses accelerate, they warp the literal fabric of Space-Time.\n\n[SCENE: INNER CORE LAB - CLOSE UP ON ATOM]\nNARRATOR: Let's observe the gravitational wave vector field. Notice how light curves in response to the high density.`,
    styleParams: {
      colorTemp: '5800K Neutral',
      cameraPace: 'Cinematic Slow Sweep',
      motionDampening: 0.25,
      edgeContrast: 'High Definition Accent',
      lightingStyle: 'Chiaroscuro Volumetric'
    },
    assets: [
      { id: 'ast-1', type: 'model', name: 'Dr. Neon Avatar', details: 'Rigged skeletal model, 45k polygons' },
      { id: 'ast-2', type: 'bg', name: 'Infinity Lab Reactor', details: 'Full HDR skybox with glowing reactor' },
      { id: 'ast-3', type: 'effect', name: 'Gravity Grid Vector lines', details: 'Procedural mathematical field' }
    ],
    cameraKeyframes: [
      { id: 'k-1', time: 0, pos: [0, 5, -15], target: [0, 0, 0] },
      { id: 'k-2', time: 3, pos: [10, 8, -10], target: [0, 1, 0] },
      { id: 'k-3', time: 6, pos: [-10, 4, -12], target: [0, 0, 5] }
    ]
  },
  {
    id: 'proj-2',
    title: 'Neon Cyberpunk Pursuit',
    resolution: '1440p',
    lastModified: '2 hours ago',
    script: `[SCENE: CHROME HALLWAY - DYNAMIC EYE LEVEL CAM]\n[TOPIC: CODING - SYSTEM OVERRIDE]\nNARRATOR: The firewalls are collapsing. Run the matrix decryption algorithm to bypass terminal protocols.\n\n[SCENE: TECH PLAZA - LOW ANGLE CRANE SHOT]\nNARRATOR: Access granted. Visualizing data nodes now.`,
    styleParams: {
      colorTemp: '9500K Polar Dark',
      cameraPace: 'Hyper Dynamic Action',
      motionDampening: 0.1,
      edgeContrast: 'Cyberpunk Outline Neon',
      lightingStyle: 'Retro Neon Emissive'
    },
    assets: [
      { id: 'ast-4', type: 'model', name: 'Cyber Rogue Unit 01', details: 'Textured skin with glowing cyberware' },
      { id: 'ast-5', type: 'bg', name: 'Neon City Expressway', details: 'Animated glowing vehicle paths' }
    ],
    cameraKeyframes: [
      { id: 'k-4', time: 0, pos: [-15, 2, -20], target: [0, 2, 0] },
      { id: 'k-5', time: 4, pos: [0, 3, -15], target: [2, 1, 3] }
    ]
  }
];

export const AIAnimationStudio = ({ onClose }: { onClose: () => void }) => {
  // Tab/Workflow Management
  const [activeTab, setActiveTab] = useState<'projects' | 'scanner' | 'stage' | 'camera' | 'assets' | 'export'>('projects');
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('neon_animation_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });
  const [currentProject, setCurrentProject] = useState<Project>(projects[0] || DEFAULT_PROJECTS[0]);

  // Save projects helper
  const saveProjectsToStorage = (updatedList: Project[]) => {
    setProjects(updatedList);
    localStorage.setItem('neon_animation_projects', JSON.stringify(updatedList));
  };

  const handleSaveCurrentProject = () => {
    const updated = projects.map(p => p.id === currentProject.id ? currentProject : p);
    saveProjectsToStorage(updated);
    playSFX('success');
  };

  // State Scanner (Reference Video)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isScanningVideo, setIsScanningVideo] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [scannedStyles, setScannedStyles] = useState<any | null>(null);

  // Script Understanding & 3D Stage
  const [scriptText, setScriptText] = useState(currentProject.script);
  const [parsedScript, setParsedScript] = useState<any[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // Floating script panel states
  const [scriptPanel, setScriptPanel] = useState({
    x: 400,
    y: 120,
    width: 320,
    height: 280,
    isPinned: false,
    isHidden: false,
    isLocked: false,
    rotation: 0, // In degrees for simulated 3D feel
  });
  
  // Dragging floating panel helper
  const isDraggingPanel = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panelStartPos = useRef({ x: 0, y: 0 });

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if (scriptPanel.isLocked || scriptPanel.isPinned) return;
    isDraggingPanel.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    panelStartPos.current = { x: scriptPanel.x, y: scriptPanel.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPanel.current) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setScriptPanel(prev => ({
        ...prev,
        x: Math.max(20, Math.min(window.innerWidth - prev.width - 20, panelStartPos.current.x + dx)),
        y: Math.max(20, Math.min(window.innerHeight - prev.height - 20, panelStartPos.current.y + dy))
      }));
    };
    const handleMouseUp = () => {
      isDraggingPanel.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scriptPanel]);

  // Environment scan states
  const [isEnvironmentScanning, setIsEnvironmentScanning] = useState(false);
  const [environmentScanProgress, setEnvironmentScanProgress] = useState(0);
  const [scannedEnvironmentMesh, setScannedEnvironmentMesh] = useState<any | null>(null);
  const [scannedToggles, setScannedToggles] = useState({
    walls: true,
    floors: true,
    furniture: true,
    lighting: true,
    physicsBounces: true
  });

  // Animation Mode Settings
  const [animationMode, setAnimationMode] = useState<'fully_animated' | 'body_control'>('fully_animated');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [bodySmoothing, setBodySmoothing] = useState(0.6);
  const [skeletonNodes, setSkeletonNodes] = useState<any[]>([]);

  // Camera Settings
  const [cameraMode, setCameraMode] = useState<'ai_camera' | 'custom_camera'>('ai_camera');
  const [isPlayingCameraTimeline, setIsPlayingCameraTimeline] = useState(false);
  const [cameraTimelineProgress, setCameraTimelineProgress] = useState(0);
  const [customCamCoords, setCustomCamCoords] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 5, z: -15 });

  // Voice Features
  const [selectedVoice, setSelectedVoice] = useState<'aether' | 'celeste' | 'cyber' | 'echo'>('aether');
  const [voiceTextPrompt, setVoiceTextPrompt] = useState('Welcome to the edge of reality.');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([]);
  const [hasClonePermission, setHasClonePermission] = useState(false);
  const [isCloningInprogress, setIsCloningInprogress] = useState(false);

  // Asset Generator
  const [assetPrompt, setAssetPrompt] = useState('Glowing dark-matter hyper-cube reactor');
  const [assetType, setAssetType] = useState<'model' | 'bg' | 'audio' | 'effect'>('model');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  // Export Settings
  const [exportRes, setExportRes] = useState<'720p' | '1080p' | '1440p' | '4K'>('1080p');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderConsoleLogs, setRenderConsoleLogs] = useState<string[]>([]);

  // Trigger Script analysis on script text change
  const parseScriptInput = (text: string) => {
    const lines = text.split('\n');
    const parsed: any[] = [];
    let currentScene = 'Void Rift Stage';
    let currentTopic = 'Cosmic General';

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('[SCENE:')) {
        currentScene = trimmed.replace('[SCENE:', '').replace(']', '').trim();
      } else if (trimmed.startsWith('[TOPIC:')) {
        currentTopic = trimmed.replace('[TOPIC:', '').replace(']', '').trim();
      } else {
        const parts = trimmed.split(':');
        const character = parts.length > 1 ? parts[0].trim() : 'NARRATOR';
        const dialogue = parts.length > 1 ? parts.slice(1).join(':').trim() : trimmed;
        parsed.push({
          id: `line-${index}`,
          scene: currentScene,
          topic: currentTopic,
          character,
          dialogue,
          emotion: dialogue.includes('!') ? 'EXCITED' : dialogue.includes('?') ? 'INQUISITIVE' : 'STABLE',
          cameraTip: currentScene.includes('WIDE') ? 'WIDE SWEEPING DOLLY' : 'CLOSE EYE-LEVEL TILT'
        });
      }
    });

    setParsedScript(parsed);
  };

  useEffect(() => {
    parseScriptInput(scriptText);
  }, [scriptText]);

  // Synchronize scriptText when project changes
  useEffect(() => {
    setScriptText(currentProject.script);
    setExportRes(currentProject.resolution);
  }, [currentProject]);

  // Audio wave simulation loop for lip sync & audio triggers
  useEffect(() => {
    let animId: any;
    const updateWaves = () => {
      if (isGeneratingVoice || isPlayingCameraTimeline) {
        setAudioWaves(Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 10));
      } else {
        setAudioWaves(Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 3));
      }
      animId = setTimeout(updateWaves, 100);
    };
    updateWaves();
    return () => clearTimeout(animId);
  }, [isGeneratingVoice, isPlayingCameraTimeline]);

  // Simulated webcam bone nodes
  useEffect(() => {
    if (isWebcamActive) {
      const interval = setInterval(() => {
        setSkeletonNodes([
          { x: 50 + Math.sin(Date.now() / 300) * 8, y: 25 + Math.cos(Date.now() / 400) * 2 }, // head
          { x: 50, y: 40 }, // neck
          { x: 38 + Math.sin(Date.now() / 350) * 4, y: 43 }, // left shoulder
          { x: 62 - Math.sin(Date.now() / 350) * 4, y: 43 }, // right shoulder
          { x: 32 + Math.sin(Date.now() / 250) * 8, y: 65 }, // left hand
          { x: 68 - Math.sin(Date.now() / 200) * 10, y: 60 }, // right hand
          { x: 45, y: 75 }, // left hip
          { x: 55, y: 75 } // right hip
        ]);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setSkeletonNodes([]);
    }
  }, [isWebcamActive]);

  // Project managers
  const handleCreateProject = () => {
    playSFX('click');
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Animation Directive',
      resolution: '1080p',
      lastModified: 'Just now',
      script: `[SCENE: VOID STAGE - PANNING SHOT]\n[TOPIC: MATHEMATICS - FORMULAS]\nNARRATOR: High-speed render complete. Initiating geometric matrix computation.`,
      styleParams: {
        colorTemp: '6500K Ambient',
        cameraPace: 'Standard Dynamic',
        motionDampening: 0.2,
        edgeContrast: 'Moderate Sleek',
        lightingStyle: 'Omnidirectional Bright'
      },
      assets: [
        { id: `ast-new-${Date.now()}`, type: 'model', name: 'Chassis Base Hull', details: 'Low poly mesh reference' }
      ],
      cameraKeyframes: [
        { id: `k-new-1`, time: 0, pos: [0, 5, -15], target: [0, 0, 0] }
      ]
    };
    const updated = [newProj, ...projects];
    saveProjectsToStorage(updated);
    setCurrentProject(newProj);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSFX('beep');
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === 0) {
      saveProjectsToStorage(DEFAULT_PROJECTS);
      setCurrentProject(DEFAULT_PROJECTS[0]);
    } else {
      saveProjectsToStorage(filtered);
      if (currentProject.id === id) {
        setCurrentProject(filtered[0]);
      }
    }
  };

  // Video scanner trigger
  const handleVideoScan = () => {
    if (!videoFile) return;
    setIsScanningVideo(true);
    setScanProgress(0);
    playSFX('click');

    const steps = [
      'Decompressing MP4 container streams...',
      'Extracting luminance gradient maps...',
      'Mapping color temperature channels...',
      'Measuring optical flow motion velocity vector keys...',
      'Scanning scene change transition spikes...',
      'Generating general animation style formulas...'
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningVideo(false);
          setScannedStyles({
            colorTemp: '8400K Neon Cyan Cold',
            cameraPace: 'Exponential Whip-Pan & Tilt',
            motionDampening: 0.08,
            edgeContrast: 'Stylized Ink Paint Outline',
            lightingStyle: 'Chroma Saturated High-Contrast Glow'
          });
          // Apply to current project
          setCurrentProject(prevProject => ({
            ...prevProject,
            styleParams: {
              colorTemp: '8400K Neon Cyan Cold',
              cameraPace: 'Exponential Whip-Pan & Tilt',
              motionDampening: 0.08,
              edgeContrast: 'Stylized Ink Paint Outline',
              lightingStyle: 'Chroma Saturated High-Contrast Glow'
            }
          }));
          playSFX('success');
          return 100;
        }
        
        // Advance step
        const step = steps[currentStepIdx];
        setScanStep(step);
        if (Math.random() < 0.3 && currentStepIdx < steps.length - 1) {
          currentStepIdx++;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Environment scanner trigger
  const handleEnvironmentScan = () => {
    setIsEnvironmentScanning(true);
    setEnvironmentScanProgress(0);
    playSFX('click');

    const interval = setInterval(() => {
      setEnvironmentScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnvironmentScanning(false);
          setScannedEnvironmentMesh({
            walls: [
              { id: 'w1', bounds: [-10, 0, -10, 10, 8, -10], angle: 0 },
              { id: 'w2', bounds: [10, 0, -10, 10, 8, 10], angle: 90 },
              { id: 'w3', bounds: [-10, 0, 10, 10, 8, 10], angle: 180 },
              { id: 'w4', bounds: [-10, 0, -10, -10, 8, 10], angle: 270 }
            ],
            floors: { y: 0, bounds: [-10, -10, 10, 10] },
            furniture: [
              { type: 'Desk Console', pos: [-2, 0, -4], scale: [3, 1.2, 1.5], materials: 'Poly-Chassis Metallic' },
              { type: 'Operator Station Pod', pos: [4, 0, 2], scale: [1.8, 2.2, 1.8], materials: 'Matte Carbon-Carbon' }
            ],
            lightingSources: [
              { type: 'Overhead Reactor Glow', pos: [0, 7.5, 0], intensity: 2.4, color: '#ec4899' },
              { type: 'Auxiliary Neon Sconce', pos: [-9.8, 3, -5], intensity: 1.2, color: '#06b6d4' }
            ]
          });
          playSFX('success');
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  // Camera timeline animator simulator
  useEffect(() => {
    let animFrame: any;
    if (isPlayingCameraTimeline) {
      const step = () => {
        setCameraTimelineProgress(prev => {
          if (prev >= 100) {
            setIsPlayingCameraTimeline(false);
            setActiveLineIndex(0);
            return 0;
          }
          
          // Switch lines on key progression marks
          const lineFraction = 100 / Math.max(1, parsedScript.length);
          const currentLine = Math.floor(prev / lineFraction);
          if (currentLine !== activeLineIndex && currentLine < parsedScript.length) {
            setActiveLineIndex(currentLine);
            playSFX('beep');
          }

          // Move camera coordinates dynamically to represent keyframes
          const fraction = prev / 100;
          const index = Math.floor(fraction * (currentProject.cameraKeyframes.length - 1));
          const nextIndex = Math.min(index + 1, currentProject.cameraKeyframes.length - 1);
          const localFraction = (fraction * (currentProject.cameraKeyframes.length - 1)) - index;

          const startKey = currentProject.cameraKeyframes[index];
          const endKey = currentProject.cameraKeyframes[nextIndex];

          if (startKey && endKey) {
            setCustomCamCoords({
              x: startKey.pos[0] + (endKey.pos[0] - startKey.pos[0]) * localFraction,
              y: startKey.pos[1] + (endKey.pos[1] - startKey.pos[1]) * localFraction,
              z: startKey.pos[2] + (endKey.pos[2] - startKey.pos[2]) * localFraction,
            });
          }

          return prev + 0.4;
        });
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlayingCameraTimeline, parsedScript, currentProject]);

  // Voice cloning simulated delay
  const handleVoiceCloning = () => {
    if (!hasClonePermission) {
      alert("Please check and grant Speaker Voice Cloning Permission explicitly before initiating.");
      return;
    }
    setIsCloningInprogress(true);
    playSFX('click');

    setTimeout(() => {
      setIsCloningInprogress(false);
      setSelectedVoice('cyber'); // Use the cloned voice
      playSFX('success');
      alert("VOICE CLONE ACQUIRED: 'SPEAKER_CLONE_CH_01' added to voice profile registry.");
    }, 2800);
  };

  // Trigger Asset Builder simulation
  const handleGenerateAsset = () => {
    if (!assetPrompt.trim()) return;
    setIsGeneratingAsset(true);
    playSFX('click');

    setTimeout(() => {
      setIsGeneratingAsset(false);
      const newAsset = {
        id: `ast-gen-${Date.now()}`,
        type: assetType,
        name: assetPrompt.toUpperCase(),
        details: `Procedurally synthesised AI 3D ${assetType}. High-fidelity specular map.`
      };

      // Add to current project assets
      setCurrentProject(prev => ({
        ...prev,
        assets: [...prev.assets, newAsset]
      }));
      playSFX('success');
      setAssetPrompt('');
    }, 2500);
  };

  // Compiler / Project exporter
  const handleExportProject = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderConsoleLogs([]);
    playSFX('render');

    const logs = [
      'Initializing high-performance neural render pipeline...',
      'Allocating dynamic frame buffers for ' + exportRes + ' targets...',
      'Baking static lightmaps for ' + currentProject.title + '...',
      'Rasterizing vector field grid overlays (Physics Module)...',
      'Blending volumetric fog particles and bloom layers...',
      'Synthesizing procedural lip-sync mouth curves...',
      'Compiling 4-channel surround spatial audio channels...',
      'Encoding MP4 high-profile stream at 60 FPS...',
      'Packaging final asset containers (Chassis, Rig, Audio)...',
      'Muxing container stream and writing meta signature metadata...'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        setRenderConsoleLogs(prev => [...prev, `[RENDERER] ${logs[logIndex]}`]);
        logIndex++;
      }
    }, 450);

    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(logInterval);
          setIsRendering(false);
          setRenderConsoleLogs(prevLogs => [...prevLogs, `[SUCCESS] Compiled successfully in ${exportRes}! Ready for deployment.`]);
          playSFX('success');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  // Mock upload model file
  const handleCustomModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAsset = {
        id: `ast-up-${Date.now()}`,
        type: 'model' as const,
        name: file.name,
        details: `Custom 3D user file format (${file.name.split('.').pop()?.toUpperCase()}). Imported raw.`
      };
      setCurrentProject(prev => ({
        ...prev,
        assets: [...prev.assets, newAsset]
      }));
      playSFX('success');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/95 flex flex-col z-[100] font-mono pointer-events-auto select-none overflow-hidden">
      {/* Scanline & grid aesthetic layer */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%),_linear-gradient(90deg,_rgba(167,139,250,0.02),_rgba(56,189,248,0.01),_rgba(244,63,94,0.02))] bg-[length:100%_4px,_8px_100%] z-50 opacity-60" />
      
      {/* Dynamic Background Nebula */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-zinc-950/60 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(167,139,250,0.4)]">
            <Wand2 size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-purple-400 font-bold tracking-[0.4em] uppercase">NEON SPARK ENGINE</div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase font-sans">
              AI Animation Studio
            </h1>
          </div>
        </div>

        {/* Current Active Project HUD */}
        <div className="hidden md:flex items-center gap-4 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-2xl">
          <div className="text-left">
            <span className="text-[8px] text-zinc-500 uppercase font-black">Active Workspace</span>
            <div className="text-xs font-black text-white truncate max-w-[180px]">{currentProject.title}</div>
          </div>
          <button 
            onClick={handleSaveCurrentProject}
            className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-[9px] font-black uppercase hover:bg-purple-500 hover:text-black transition-all"
          >
            Save Project
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="p-3 bg-zinc-900 border border-white/5 hover:border-red-500 hover:bg-red-500/10 text-white/60 hover:text-red-400 rounded-2xl transition-all cursor-pointer"
        >
          <X size={20} />
        </button>
      </header>

      {/* Toolbar Stepper / Tabs */}
      <nav className="flex items-center px-8 py-2 bg-zinc-900/30 border-b border-white/5 overflow-x-auto gap-2 z-10 scrollbar-none">
        {[
          { id: 'projects', label: 'Director Index', icon: Sliders },
          { id: 'scanner', label: 'Style & Environment Scanner', icon: Video },
          { id: 'stage', label: '3D Simulation Stage', icon: Eye },
          { id: 'camera', label: 'Camera & Interpolation', icon: Camera },
          { id: 'assets', label: 'Voice & Asset Builder', icon: Mic },
          { id: 'export', label: 'High-Fidelity Export', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playSFX('click');
              }}
              className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all border ${
                isSelected 
                  ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(167,139,250,0.1)]' 
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:border-white/5'
              }`}
            >
              <Icon size={16} className={isSelected ? 'text-purple-400' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-hidden relative p-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: Director Index & Project Manager */}
          {activeTab === 'projects' && (
            <motion.div 
              key="projects-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Projects List */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Layers size={16} className="text-purple-400" />
                    Directive Library
                  </h3>
                  <button 
                    onClick={handleCreateProject}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Plus size={14} /> New Project
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {projects.map(proj => (
                    <div 
                      key={proj.id}
                      onClick={() => {
                        setCurrentProject(proj);
                        playSFX('click');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        currentProject.id === proj.id 
                          ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(167,139,250,0.1)]' 
                          : 'bg-zinc-900/40 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-black text-white uppercase truncate max-w-[170px] italic">
                          {proj.title}
                        </h4>
                        <button 
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">
                          MODIFIED: {proj.lastModified}
                        </span>
                        <span className="text-[8px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {proj.resolution}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Columns: Active Project Blueprint details */}
              <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-6">
                  <div className="flex-1">
                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Active Workspace Config</span>
                    <input 
                      type="text" 
                      value={currentProject.title}
                      onChange={(e) => {
                        const updated = { ...currentProject, title: e.target.value };
                        setCurrentProject(updated);
                        const list = projects.map(p => p.id === currentProject.id ? updated : p);
                        setProjects(list);
                      }}
                      className="text-2xl font-black text-white italic bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none w-full uppercase mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[9px] text-zinc-500 font-black uppercase">Project Export Spec</div>
                      <select 
                        value={currentProject.resolution}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          const updated = { ...currentProject, resolution: val };
                          setCurrentProject(updated);
                          const list = projects.map(p => p.id === currentProject.id ? updated : p);
                          setProjects(list);
                        }}
                        className="bg-zinc-950 border border-white/10 rounded-xl text-xs font-black text-zinc-300 p-2.5 mt-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="720p">HD Lite // 720P @ 60FPS</option>
                        <option value="1080p">FHD Standard // 1080P @ 60FPS</option>
                        <option value="1440p">QHD Master // 1440P @ 60FPS</option>
                        <option value="4K">UHD Cinema // 4K @ 60FPS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Style parameter card */}
                  <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Sliders size={14} /> Swatch Style Formula
                    </h4>
                    <div className="space-y-3 text-[11px]">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-500 font-bold uppercase">Color Balance:</span>
                        <span className="text-white font-black uppercase">{currentProject.styleParams.colorTemp}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-500 font-bold uppercase">Camera Pacing:</span>
                        <span className="text-white font-black uppercase">{currentProject.styleParams.cameraPace}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-500 font-bold uppercase">Motion Dampening:</span>
                        <span className="text-white font-black uppercase">{currentProject.styleParams.motionDampening}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-500 font-bold uppercase">Edge Contrast:</span>
                        <span className="text-white font-black uppercase">{currentProject.styleParams.edgeContrast}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold uppercase">Lighting Mode:</span>
                        <span className="text-white font-black uppercase">{currentProject.styleParams.lightingStyle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats & asset count */}
                  <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <Activity size={14} /> Asset Manifest stats
                      </h4>
                      <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                        This directive has {currentProject.assets.length} procedural elements compiled inside the current timeline buffer, and {currentProject.cameraKeyframes.length} camera position keys.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-white">{currentProject.assets.filter(a => a.type === 'model').length}</div>
                        <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">RIGS</div>
                      </div>
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-white">{currentProject.assets.filter(a => a.type === 'effect').length}</div>
                        <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">FX LINES</div>
                      </div>
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-lg font-black text-white">{currentProject.cameraKeyframes.length}</div>
                        <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">KEYS</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Script Editor panel inside project tab */}
                <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen size={14} /> Screenplay Script
                    </h4>
                    <span className="text-[8px] text-zinc-500 uppercase font-black">AI Parses Actions and Educational Topics Automatically</span>
                  </div>
                  <textarea 
                    value={scriptText}
                    onChange={(e) => {
                      setScriptText(e.target.value);
                      setCurrentProject(prev => ({ ...prev, script: e.target.value }));
                    }}
                    className="flex-1 bg-zinc-950/80 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500/50 custom-scrollbar resize-none leading-relaxed h-[220px]"
                    placeholder="Input screen dialogue with bracket tags..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Animation Style & Environment Scanner */}
          {activeTab === 'scanner' && (
            <motion.div 
              key="scanner-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar"
            >
              {/* Section A: Style Video Scanner */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="text-purple-400" size={20} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Animation Style Scanner
                    </h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Import any animation reference clip. The AI demuxes the frame sequence to study general features (such as lighting radiance, edge tracking, vector pace, camera zoom, timing patterns) and generates style parameter matches. No copyrighted characters or assets are duplicated.
                  </p>

                  {/* Drop zone */}
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-black/30 hover:border-purple-500/30 transition-all relative overflow-hidden min-h-[160px]">
                    <Upload size={32} className="text-purple-400 animate-bounce mb-3" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Drag reference clip here</span>
                    <span className="text-[9px] text-zinc-500 uppercase mt-1">MP4, MOV, or WebM formats (Max 100MB)</span>
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setVideoFile(e.target.files[0]);
                          playSFX('success');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>

                  {videoFile && (
                    <div className="mt-4 p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex justify-between items-center text-xs">
                      <span className="text-white font-bold uppercase truncate max-w-[200px]">📹 {videoFile.name}</span>
                      <button 
                        onClick={() => setVideoFile(null)}
                        className="text-[9px] font-black uppercase text-red-400 border border-red-400/20 px-2 py-1 rounded hover:bg-red-500 hover:text-black transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {isScanningVideo && (
                    <div className="mt-6 p-4 bg-zinc-950/60 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase mb-2">
                        <span className="text-purple-400">{scanStep}</span>
                        <span className="text-white">{scanProgress}%</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-purple-500 transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Scanning Results */}
                  {scannedStyles && (
                    <div className="mt-6 bg-zinc-950/80 rounded-xl border border-purple-500/20 p-5">
                      <div className="text-[9px] text-purple-400 font-bold uppercase tracking-[0.3em] mb-3">AI ANALYSIS PARSED STYLE FORMULA</div>
                      <div className="space-y-2.5 text-[10px] font-mono">
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-zinc-500 uppercase">COLOR PALETTE:</span>
                          <span className="text-white font-black uppercase">{scannedStyles.colorTemp}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-zinc-500 uppercase">CAMERA VELOCITY:</span>
                          <span className="text-white font-black uppercase">{scannedStyles.cameraPace}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-zinc-500 uppercase">MOTION SMOOTHING:</span>
                          <span className="text-white font-black uppercase">{scannedStyles.motionDampening}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-zinc-500 uppercase">EDGE FILTER:</span>
                          <span className="text-white font-black uppercase">{scannedStyles.edgeContrast}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 uppercase">LIGHT RADIANCE:</span>
                          <span className="text-white font-black uppercase">{scannedStyles.lightingStyle}</span>
                        </div>
                      </div>
                      
                      {/* Stylized Color swatches extracted */}
                      <div className="mt-4 flex gap-2">
                        {['#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e', '#1e1b4b'].map((c, i) => (
                          <div key={i} className="flex-1 h-6 rounded-lg border border-white/10" style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleVideoScan}
                  disabled={!videoFile || isScanningVideo}
                  className="w-full mt-6 py-3 bg-purple-500 disabled:bg-purple-500/20 disabled:text-white/20 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-purple-400 transition-all shadow-[0_5px_20px_rgba(167,139,250,0.3)]"
                >
                  {isScanningVideo ? 'Analyzing General Style Features...' : 'Analyze Style Formula'}
                </button>
              </div>

              {/* Section B: Environment & Room Scanner */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="text-cyan-400" size={20} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Room & Environment Scanner
                    </h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Connect your device LiDAR or camera to map a 3D scan of your room environment (with user permissions). Enables interactive collision meshes for characters and physical objects inside the stage.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* LiDAR mock toggles */}
                    {['walls', 'floors', 'furniture', 'lighting', 'physicsBounces'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setScannedToggles(prev => ({ ...prev, [t]: !(prev as any)[t] }));
                          playSFX('click');
                        }}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider text-left transition-all ${
                          (scannedToggles as any)[t] 
                            ? 'bg-cyan-500/10 border-cyan-500/45 text-cyan-300' 
                            : 'bg-transparent border-white/5 text-zinc-500'
                        }`}
                      >
                        {(scannedToggles as any)[t] ? '🟢' : '⚫'} {t.replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>

                  {/* Environment scanning progression */}
                  {isEnvironmentScanning && (
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 mb-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase mb-2">
                        <span className="text-cyan-400 animate-pulse">LiDAR Mesh Plotting...</span>
                        <span className="text-white">{environmentScanProgress}%</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-cyan-500 transition-all duration-150" style={{ width: `${environmentScanProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {scannedEnvironmentMesh && (
                    <div className="p-4 bg-zinc-950/80 rounded-xl border border-cyan-500/20 text-[10px]">
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.3em] mb-2">MAPPED COLLISION SEGMENTS</div>
                      <div className="space-y-1.5 text-zinc-400 uppercase font-bold font-mono">
                        <div>📏 Walls Extruded: {scannedEnvironmentMesh.walls.length} planes</div>
                        <div>📐 Floor Grid Level: Y = {scannedEnvironmentMesh.floors.y}m</div>
                        <div>📦 Obstacles Mesh: {scannedEnvironmentMesh.furniture.map((f: any) => f.type).join(', ')}</div>
                        <div>💡 Volumetric Light Anchors: {scannedEnvironmentMesh.lightingSources.length} points mapped</div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEnvironmentScan}
                  disabled={isEnvironmentScanning}
                  className="w-full py-3 bg-cyan-500 disabled:bg-cyan-500/20 disabled:text-white/20 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_5px_20px_rgba(6,182,212,0.3)]"
                >
                  {isEnvironmentScanning ? 'Executing LiDAR Scan Beam...' : 'Initiate 3D Room scan'}
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: 3D Simulation Stage & Floating Panel */}
          {activeTab === 'stage' && (
            <motion.div 
              key="stage-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Script Line Analysis & Educational triggers */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-400" />
                    Script Understanding
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Our AI parses the screenplay, identifying core actors, emotional keys, set coordinates, and triggers educational visual models directly inside the rendering viewport.
                  </p>

                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {parsedScript.map((line, i) => (
                      <div 
                        key={line.id}
                        onClick={() => {
                          setActiveLineIndex(i);
                          playSFX('beep');
                        }}
                        className={`p-4 rounded-xl border text-[10px] transition-all cursor-pointer ${
                          activeLineIndex === i 
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_10px_rgba(167,139,250,0.15)]' 
                            : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-white font-black uppercase italic">{line.character}</span>
                          <span className="text-[8px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded font-black border border-cyan-500/20">
                            {line.emotion}
                          </span>
                        </div>
                        <p className="text-zinc-400 font-bold uppercase leading-relaxed font-mono">{line.dialogue}</p>
                        
                        {/* Topic Tag if present */}
                        <div className="mt-3 flex justify-between items-center text-[7px] text-zinc-500 font-black">
                          <span>TOPIC: {line.topic}</span>
                          <span className="text-purple-400">CAMERA: {line.cameraTip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Educational Module helper */}
                {parsedScript[activeLineIndex] && (
                  <div className="mt-6 p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                    <div className="text-[9px] text-purple-400 font-black uppercase tracking-wider mb-2">🎓 Active Educational Context</div>
                    <div className="text-[11px] font-black text-white uppercase italic">{parsedScript[activeLineIndex].topic}</div>
                    <p className="text-[9px] text-zinc-400 uppercase leading-relaxed mt-1">
                      Visualizing dynamic math overlays and schematic diagrams matching dialogue parameters.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Columns: Main Viewport simulation */}
              <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2rem] p-4 flex flex-col h-full relative overflow-hidden">
                {/* Simulated WebGL Viewport Card */}
                <div className="flex-1 rounded-[1.5rem] bg-zinc-950 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center">
                  
                  {/* Grid Line floor projection */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.15),_transparent)] pointer-events-none" />
                  
                  {/* Camera view indicators */}
                  <div className="absolute top-4 left-4 text-[9px] text-zinc-500 font-mono space-y-1">
                    <div>RENDER: CYBER_REAL_V0.8</div>
                    <div>CAM X: {customCamCoords.x.toFixed(2)} // Y: {customCamCoords.y.toFixed(2)} // Z: {customCamCoords.z.toFixed(2)}</div>
                    <div>COGNITIVE ANALYSIS: <span className="text-purple-400 animate-pulse">ACTIVE</span></div>
                  </div>

                  {/* Right view indicators */}
                  <div className="absolute top-4 right-4 text-right text-[9px] text-zinc-500 font-mono space-y-1">
                    <div>SCENE: {parsedScript[activeLineIndex]?.scene || 'Void Rift'}</div>
                    <div className="text-cyan-400 font-black">TARGET LOCK: CHAR_01</div>
                  </div>

                  {/* 3D Model placeholder (Dynamic mathematical/geometry vectors matching dialogue) */}
                  <div className="z-10 flex flex-col items-center justify-center text-center p-8 max-w-sm">
                    {parsedScript[activeLineIndex]?.topic?.includes('PHYSICS') ? (
                      /* Gravitational Warp vector display */
                      <svg className="w-48 h-48 text-purple-500 animate-spin-slow" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        {/* Gravity force lines */}
                        <path d="M 50 5 L 50 95 M 5 L 50 50 L 95 50 M 15 15 L 85 85 M 85 15 L 15 85" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
                        <text x="50" y="54" textAnchor="middle" fill="white" fontSize="6" fontWeight="black" fontFamily="monospace">F = G(m1*m2)/r²</text>
                      </svg>
                    ) : parsedScript[activeLineIndex]?.topic?.includes('CODING') ? (
                      /* Decoding Matrix layout */
                      <div className="font-mono text-[9px] text-green-400 bg-black/80 p-5 rounded-2xl border border-green-500/30 text-left space-y-1 animate-pulse">
                        <div>&gt; Decrypting matrix protocols...</div>
                        <div>&gt; bypass terminal (sys_id: 8501)</div>
                        <div className="text-white font-black">&gt; SYSTEM COMPILATION COMPLETE [100%]</div>
                      </div>
                    ) : (
                      /* General Neon Orb projection */
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="w-24 h-24 border-2 border-dashed border-purple-500 rounded-full animate-spin" style={{ animationDuration: '6s' }} />
                        <div className="absolute w-12 h-12 bg-white/10 rounded-full border border-purple-400 animate-pulse" />
                      </div>
                    )}
                    
                    <h4 className="text-sm font-black text-white uppercase italic tracking-wider mt-6">
                      {parsedScript[activeLineIndex]?.character || 'AI SYSTEM'}
                    </h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold mt-1">
                      &ldquo;{parsedScript[activeLineIndex]?.dialogue || 'Awaiting script text input...'}&rdquo;
                    </p>
                  </div>

                  {/* Floating Drag/Pinned Script Panel representation */}
                  {!scriptPanel.isHidden && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: `${scriptPanel.x}px`,
                        top: `${scriptPanel.y}px`,
                        width: `${scriptPanel.width}px`,
                        height: `${scriptPanel.height}px`,
                        transform: `rotate(${scriptPanel.rotation}deg)`,
                        transition: isDraggingPanel.current ? 'none' : 'all 0.15s ease-out',
                      }}
                      className={`z-40 bg-zinc-950/95 border p-5 rounded-3xl flex flex-col justify-between shadow-[0_15px_50px_rgba(0,0,0,0.8)] pointer-events-auto ${
                        scriptPanel.isPinned ? 'border-purple-500 shadow-[0_0_15px_rgba(167,139,250,0.25)]' : 'border-white/15'
                      }`}
                    >
                      {/* Floating Panel Header bar */}
                      <div 
                        onMouseDown={handlePanelMouseDown}
                        className={`flex justify-between items-center pb-2 border-b border-white/5 cursor-grab active:cursor-grabbing`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Move size={12} className="text-purple-400" />
                          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">
                            {scriptPanel.isLocked ? '🔒 LOCKED PANEL' : '💬 FLOATING SCRIPT'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setScriptPanel(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                            className={`p-1 rounded hover:bg-white/5 ${scriptPanel.isPinned ? 'text-purple-400' : 'text-zinc-500'}`}
                            title="Pin panel in 3D"
                          >
                            <Pin size={12} />
                          </button>
                          <button 
                            onClick={() => setScriptPanel(prev => ({ ...prev, isLocked: !prev.isLocked }))}
                            className={`p-1 rounded hover:bg-white/5 ${scriptPanel.isLocked ? 'text-amber-400' : 'text-zinc-500'}`}
                            title="Lock / Unlock drag"
                          >
                            <Minimize2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Dialogue body */}
                      <div className="flex-1 overflow-y-auto my-3 text-[10px] space-y-2 pr-1 custom-scrollbar leading-relaxed">
                        {parsedScript.map((l, idx) => (
                          <div 
                            key={l.id} 
                            className={`p-2 rounded-lg border transition-all ${
                              idx === activeLineIndex 
                                ? 'bg-purple-500/10 border-purple-500/40 text-white font-black' 
                                : 'border-transparent text-zinc-500'
                            }`}
                          >
                            <span className="text-[7px] uppercase font-bold text-zinc-400 block mb-0.5">{l.character}</span>
                            {l.dialogue}
                          </div>
                        ))}
                      </div>

                      {/* Control parameters */}
                      <div className="flex gap-2 items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-[8px] text-zinc-500 uppercase font-black">Rotation coordinate</span>
                        <input 
                          type="range" 
                          min="-20" 
                          max="20" 
                          value={scriptPanel.rotation} 
                          onChange={(e) => setScriptPanel(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                          className="w-24 accent-purple-500" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Display math timelines & educational diagram overlays */}
                  <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/85 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {audioWaves.map((w, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-purple-500 rounded-full transition-all duration-100" 
                            style={{ height: `${w / 3}px` }} 
                          />
                        ))}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase font-black">
                        LIP-SYNC Waveform Sync: <span className="text-white">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setScriptPanel(prev => ({ ...prev, isHidden: !prev.isHidden }))}
                        className="px-3 py-1.5 border border-white/10 hover:border-purple-500/30 rounded-lg text-[8px] font-black uppercase text-zinc-400 hover:text-white transition-all"
                      >
                        {scriptPanel.isHidden ? '👁️ Show Script' : '🙈 Hide Script'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Camera Timeline & Keyframes */}
          {activeTab === 'camera' && (
            <motion.div 
              key="camera-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Animation Mode Config (Fully Animated & Body Control) */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sliders size={16} className="text-purple-400" />
                    Animation Mode Config
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => {
                        setAnimationMode('fully_animated');
                        playSFX('click');
                      }}
                      className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-wider text-left transition-all ${
                        animationMode === 'fully_animated' 
                          ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:text-white'
                      }`}
                    >
                      🤖 Fully Animated
                      <span className="block text-[8px] text-zinc-500 font-bold mt-1">Automatic AI keyframes</span>
                    </button>
                    <button
                      onClick={() => {
                        setAnimationMode('body_control');
                        playSFX('click');
                      }}
                      className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-wider text-left transition-all ${
                        animationMode === 'body_control' 
                          ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:text-white'
                      }`}
                    >
                      🕺 Body Control
                      <span className="block text-[8px] text-zinc-500 font-bold mt-1">Skeletal tracking</span>
                    </button>
                  </div>

                  {animationMode === 'fully_animated' ? (
                    <div className="space-y-4 p-4 bg-zinc-950/60 rounded-xl border border-white/5">
                      <div className="text-[9px] text-purple-400 font-black uppercase tracking-wider">AI procedural options</div>
                      <div className="text-[10px] text-zinc-400 uppercase leading-relaxed font-mono">
                        AI analyzes emotions in dialogue to generate micro-expressions (e.g. eye-blinks, eyebrow tilts, smiling, muscle-twitches) and natural joint-gestures.
                      </div>
                      <div className="flex justify-between items-center text-[9px] border-t border-white/5 pt-3">
                        <span className="text-zinc-500 font-black">Expression Pace:</span>
                        <span className="text-white font-black">88% Emotional Sync</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Body Control panel */}
                      <div className="p-4 bg-zinc-950/60 rounded-xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-cyan-400 font-black uppercase">Webcam Joint Capture</span>
                          <button 
                            onClick={() => {
                              setIsWebcamActive(!isWebcamActive);
                              playSFX('click');
                            }}
                            className={`px-3 py-1 text-[8px] font-black uppercase rounded border ${
                              isWebcamActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            }`}
                          >
                            {isWebcamActive ? 'Disable Feed' : 'Enable Webcam'}
                          </button>
                        </div>
                        
                        {/* Interactive Skeleton Viewport */}
                        <div className="h-44 bg-black rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                          {isWebcamActive ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* Joint Nodes */}
                              <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 100">
                                {skeletonNodes.map((n, i) => (
                                  <circle key={i} cx={n.x} cy={n.y} r="2.5" fill="currentColor" className="animate-pulse" />
                                ))}
                                {/* Connect bones */}
                                {skeletonNodes.length > 0 && (
                                  <>
                                    <line x1={skeletonNodes[0].x} y1={skeletonNodes[0].y} x2={skeletonNodes[1].x} y2={skeletonNodes[1].y} stroke="currentColor" strokeWidth="1" />
                                    <line x1={skeletonNodes[2].x} y1={skeletonNodes[2].y} x2={skeletonNodes[3].x} y2={skeletonNodes[3].y} stroke="currentColor" strokeWidth="1" />
                                    <line x1={skeletonNodes[1].x} y1={skeletonNodes[1].y} x2={skeletonNodes[2].x} y2={skeletonNodes[2].y} stroke="currentColor" strokeWidth="1" />
                                    <line x1={skeletonNodes[1].x} y1={skeletonNodes[1].y} x2={skeletonNodes[3].x} y2={skeletonNodes[3].y} stroke="currentColor" strokeWidth="1" />
                                  </>
                                )}
                              </svg>
                              <span className="absolute bottom-2 left-2 text-[8px] text-rose-500 font-black animate-pulse">🔴 WEBCAM LIVE BONE TRACKER</span>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <AlertCircle size={20} className="text-zinc-500 mx-auto mb-2" />
                              <span className="text-[9px] text-zinc-500 uppercase font-black">Camera Stream Inactive</span>
                            </div>
                          )}
                        </div>

                        {/* Smoothing Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-400">
                            <span>AI Cleanup & Smoothing:</span>
                            <span className="text-cyan-400 font-bold">{Math.floor(bodySmoothing * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={bodySmoothing} 
                            onChange={(e) => setBodySmoothing(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch Camera settings */}
                <div className="bg-zinc-950/40 p-4 border border-white/5 rounded-2xl space-y-3">
                  <div className="text-[9px] text-purple-400 font-black uppercase">Switch Camera Modes</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCameraMode('ai_camera');
                        playSFX('click');
                      }}
                      className={`py-2 text-[9px] font-black uppercase rounded-lg border ${
                        cameraMode === 'ai_camera' ? 'bg-purple-500/10 border-purple-500/50 text-white' : 'border-white/5 text-zinc-500'
                      }`}
                    >
                      🎥 AI Camera
                    </button>
                    <button
                      onClick={() => {
                        setCameraMode('custom_camera');
                        playSFX('click');
                      }}
                      className={`py-2 text-[9px] font-black uppercase rounded-lg border ${
                        cameraMode === 'custom_camera' ? 'bg-purple-500/10 border-purple-500/50 text-white' : 'border-white/5 text-zinc-500'
                      }`}
                    >
                      ⚙️ Custom Keyframe
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Columns: Viewport simulation + keyframe timeline */}
              <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-full">
                {/* Visual Viewport with camera motion */}
                <div className="flex-1 rounded-[1.5rem] bg-zinc-950 border border-white/10 relative overflow-hidden flex flex-col justify-center items-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08),_transparent)] pointer-events-none" />
                  
                  {/* Grid Lines moving slightly to represent camera translation */}
                  <div className="absolute inset-0 border border-purple-500/5 bg-[linear-gradient(rgba(167,139,250,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(167,139,250,0.02)_1px,_transparent_1px)] bg-[size:20px_20px]" />

                  {/* 3D Wireframe simulation box */}
                  <div 
                    style={{
                      transform: `perspective(400px) rotateX(15deg) rotateY(${customCamCoords.x * 2}deg) scale(${1.2 - customCamCoords.y / 25})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="w-56 h-32 border-2 border-dashed border-purple-500/30 rounded-xl relative flex items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-lg animate-pulse" />
                    {/* Directional axis markers */}
                    <div className="absolute left-0 bottom-0 text-[8px] text-zinc-500 p-2 font-mono">
                      X: {customCamCoords.x.toFixed(1)} <br />
                      Y: {customCamCoords.y.toFixed(1)}
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 text-[9px] text-zinc-500 font-bold uppercase">
                    Viewport Track Sync: <span className="text-white">{cameraMode === 'ai_camera' ? 'AUTOMATIC SCRIPT PATH' : 'USER INTERPOLATED'}</span>
                  </div>
                </div>

                {/* Timeline keyframes controller */}
                <div className="mt-6 p-5 bg-zinc-950/60 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setIsPlayingCameraTimeline(!isPlayingCameraTimeline);
                          playSFX('click');
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-black transition-all ${
                          isPlayingCameraTimeline ? 'bg-amber-400' : 'bg-purple-500'
                        }`}
                      >
                        {isPlayingCameraTimeline ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <div>
                        <span className="text-[10px] text-white font-black uppercase tracking-wider block leading-none">
                          {isPlayingCameraTimeline ? 'PLAYING TIMELINE' : 'TIMELINE PAUSED'}
                        </span>
                        <span className="text-[8px] text-zinc-500 uppercase font-black">
                          {Math.ceil(cameraTimelineProgress / 10)} / 10 SECONDS
                        </span>
                      </div>
                    </div>

                    {/* Add custom Keyframe button */}
                    <button
                      onClick={() => {
                        const newKey = {
                          id: `k-gen-${Date.now()}`,
                          time: currentProject.cameraKeyframes.length * 2,
                          pos: [customCamCoords.x, customCamCoords.y, customCamCoords.z] as [number, number, number],
                          target: [0, 0, 0] as [number, number, number]
                        };
                        setCurrentProject(prev => ({
                          ...prev,
                          cameraKeyframes: [...prev.cameraKeyframes, newKey]
                        }));
                        playSFX('success');
                      }}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <Plus size={14} /> Add keyframe
                    </button>
                  </div>

                  {/* Scrubber timeline bar */}
                  <div className="relative h-10 bg-black rounded-xl border border-white/5 flex items-center px-4 overflow-hidden">
                    {/* Progress Fill */}
                    <div className="absolute left-0 top-0 bottom-0 bg-purple-500/10 transition-all duration-100" style={{ width: `${cameraTimelineProgress}%` }} />
                    
                    {/* Interactive Slider Input */}
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={cameraTimelineProgress}
                      onChange={(e) => setCameraTimelineProgress(parseInt(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />

                    {/* Render visual timeline ticks for Keyframes */}
                    <div className="w-full flex justify-between pointer-events-none relative z-10">
                      {currentProject.cameraKeyframes.map((k, i) => {
                        const percent = (i / Math.max(1, currentProject.cameraKeyframes.length - 1)) * 100;
                        return (
                          <div 
                            key={k.id} 
                            style={{ left: `${percent}%` }}
                            className="absolute -translate-x-1/2 flex flex-col items-center"
                          >
                            <div className="w-2.5 h-2.5 rounded bg-purple-500 border border-white shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                            <span className="text-[7px] text-zinc-500 font-mono mt-1">K{i+1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Position controls */}
                  <div className="grid grid-cols-3 gap-4">
                    {['X Coordinate', 'Y Coordinate', 'Z Coordinate'].map((axis, i) => {
                      const key = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
                      return (
                        <div key={axis} className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-[9px] space-y-1.5">
                          <div className="flex justify-between items-center font-black uppercase text-zinc-500">
                            <span>{axis}</span>
                            <span className="text-white">{(customCamCoords as any)[key].toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="-25" 
                            max="25" 
                            value={(customCamCoords as any)[key]} 
                            onChange={(e) => {
                              setCustomCamCoords(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
                            }}
                            className="w-full accent-purple-500" 
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: Voice Generation, Lip sync & Procedural Asset synthesis */}
          {activeTab === 'assets' && (
            <motion.div 
              key="assets-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar"
            >
              {/* Part A: Voice Synthesis & Cloning */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mic className="text-purple-400" size={20} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      AI Voice Generation & Cloning
                    </h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Synthesize dialogue lines into high-fidelity speech files. We support multiple realistic narrator profiles, or you can record and clone your own voice model.
                  </p>

                  {/* Narrator voices select */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'aether', label: 'Male Narrator', accent: 'Deep Aether' },
                        { id: 'celeste', label: 'Female Narrator', accent: 'Crisp Celeste' },
                        { id: 'cyber', label: 'Decoded Robot', accent: 'Binary Echo' },
                        { id: 'echo', label: 'Whisper Vocal', accent: 'Holographic' }
                      ].map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVoice(v.id as any);
                            playSFX('click');
                          }}
                          className={`p-4 rounded-2xl border text-left text-[10px] font-black uppercase tracking-wider transition-all ${
                            selectedVoice === v.id 
                              ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                              : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          📢 {v.label}
                          <span className="block text-[8px] text-zinc-500 font-bold mt-1">Accent: {v.accent}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom prompt text voice generator */}
                    <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-xl space-y-3">
                      <span className="text-[9px] text-purple-400 font-black uppercase">Voice Generator Input</span>
                      <textarea 
                        value={voiceTextPrompt}
                        onChange={(e) => setVoiceTextPrompt(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500/40 resize-none h-16 uppercase leading-snug"
                        placeholder="Type voice script..."
                      />
                      <button 
                        onClick={() => {
                          setIsGeneratingVoice(true);
                          playSFX('click');
                          setTimeout(() => {
                            setIsGeneratingVoice(false);
                            playSFX('success');
                          }, 1800);
                        }}
                        disabled={isGeneratingVoice || !voiceTextPrompt.trim()}
                        className="w-full py-2 bg-purple-500 disabled:bg-purple-500/20 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-400 transition-all"
                      >
                        {isGeneratingVoice ? 'Synthesizing voice wave...' : 'Synthesize speech'}
                      </button>
                    </div>

                    {/* Speaker cloning consent wrapper */}
                    <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex gap-3 items-start">
                        <input 
                          type="checkbox" 
                          id="clone-permission"
                          checked={hasClonePermission}
                          onChange={(e) => setHasClonePermission(e.target.checked)}
                          className="mt-1 accent-purple-500" 
                        />
                        <label htmlFor="clone-permission" className="text-[9px] text-zinc-400 uppercase font-black leading-relaxed cursor-pointer select-none">
                          🔐 I grant explicit authorization to analyze my recorded speech samples to construct a private cloned synthesis voice model.
                        </label>
                      </div>

                      <button
                        onClick={handleVoiceCloning}
                        disabled={isCloningInprogress || !hasClonePermission}
                        className="w-full py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-black text-red-400 disabled:bg-white/5 disabled:border-white/5 disabled:text-zinc-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        {isCloningInprogress ? 'Streaming voice frequency...' : '🎙️ Initialize Voice Cloning'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part B: Text-to-3D Asset Synthesis */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-400" size={20} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Generative 3D Asset Builder
                    </h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Generate high-quality 3D assets, skyboxes, lighting textures, or procedural shaders directly from simple text prompts.
                  </p>

                  <div className="space-y-4">
                    {/* Asset type select */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'model', label: '3D RIG' },
                        { id: 'bg', label: 'SKYBOX' },
                        { id: 'audio', label: 'SOUND' },
                        { id: 'effect', label: 'EFFECT' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setAssetType(t.id as any);
                            playSFX('click');
                          }}
                          className={`py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                            assetType === t.id 
                              ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                              : 'bg-zinc-950/40 border-white/5 text-zinc-500'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Text prompt */}
                    <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-xl space-y-3">
                      <span className="text-[9px] text-purple-400 font-black uppercase">Asset Prompt Input</span>
                      <input 
                        type="text" 
                        value={assetPrompt}
                        onChange={(e) => setAssetPrompt(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500/40 uppercase"
                        placeholder="E.g., Holographic mainframe console reactor..."
                      />

                      {/* Progression status */}
                      {isGeneratingAsset && (
                        <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[9px] text-purple-400 font-black animate-pulse uppercase">Synthesising vertex coordinates...</span>
                          <span className="text-white text-[9px] font-mono">RENDERING</span>
                        </div>
                      )}

                      <button
                        onClick={handleGenerateAsset}
                        disabled={isGeneratingAsset || !assetPrompt.trim()}
                        className="w-full py-2.5 bg-purple-500 disabled:bg-purple-500/20 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-400 transition-all shadow-[0_5px_15px_rgba(167,139,250,0.2)]"
                      >
                        {isGeneratingAsset ? 'Allocating voxel channels...' : 'Synthesize Asset Blueprint'}
                      </button>
                    </div>

                    {/* Custom GLB upload */}
                    <div className="p-5 border border-white/5 bg-zinc-950 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500 font-black uppercase">Import Custom 3D Model</span>
                        <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-black uppercase">
                          gltf / glb / obj
                        </span>
                      </div>
                      
                      {/* File selector input */}
                      <div className="relative border border-dashed border-white/10 hover:border-purple-500/30 rounded-xl p-4 flex items-center justify-center text-center cursor-pointer transition-all bg-black/20">
                        <span className="text-[10px] text-zinc-400 font-black uppercase">Click to browse 3D files</span>
                        <input 
                          type="file" 
                          accept=".glb,.gltf,.obj"
                          onChange={handleCustomModelUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Assets inventories list */}
                <div className="mt-4 p-4 border border-white/5 bg-zinc-950/60 rounded-2xl max-h-[160px] overflow-y-auto custom-scrollbar">
                  <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block mb-2">Workspace Assets Database</span>
                  <div className="space-y-1.5">
                    {currentProject.assets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center text-[10px] p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-white font-bold uppercase">🧱 {asset.name}</span>
                        <span className="text-zinc-500 text-[8px] uppercase">{asset.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: High-Fidelity Export Studio */}
          {activeTab === 'export' && (
            <motion.div 
              key="export-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Export parameters */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-full overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Download size={16} className="text-purple-400" />
                    Project Exporter
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase leading-relaxed mb-6">
                    Bake lighting, dynamic camera movements, voice audio tracks, and mathematical educational diagrams into standard high-profile video packages.
                  </p>

                  <div className="space-y-4">
                    {/* Resolution list */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-purple-400 font-black uppercase block">Render Resolution</span>
                      {[
                        { id: '720p', label: '720P Standard HD', scale: '1280x720 @ 60FPS' },
                        { id: '1080p', label: '1080P Full High-Def', scale: '1920x1080 @ 60FPS' },
                        { id: '1440p', label: '1440P Quad HD Pro', scale: '2560x1440 @ 60FPS' },
                        { id: '4K', label: '4K Ultra-HD Cinema', scale: '3840x2160 @ 60FPS' }
                      ].map(res => (
                        <button
                          key={res.id}
                          onClick={() => {
                            setExportRes(res.id as any);
                            playSFX('click');
                          }}
                          className={`w-full p-4 rounded-xl border text-left text-[11px] font-black uppercase tracking-wider flex justify-between items-center transition-all ${
                            exportRes === res.id 
                              ? 'bg-purple-500/10 border-purple-500/50 text-white' 
                              : 'bg-zinc-950/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span>{res.label}</span>
                          <span className="text-[8px] bg-zinc-950 border border-white/5 p-1 rounded font-mono text-zinc-400">{res.scale}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 mt-6">
                  {/* Warning label */}
                  <div className="flex gap-2.5 items-start bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl text-[10px] text-amber-500 font-bold uppercase leading-relaxed">
                    <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Neural compilation tasks use multi-threading GPU threads. Keep tab focused during render tasks to avoid suspension cycles.</span>
                  </div>

                  <button
                    onClick={handleExportProject}
                    disabled={isRendering}
                    className="w-full py-3 bg-purple-500 disabled:bg-purple-500/20 disabled:text-white/20 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-purple-400 transition-all shadow-[0_5px_20px_rgba(167,139,250,0.3)]"
                  >
                    {isRendering ? 'Processing Frame Passes...' : 'Initiate Project Render'}
                  </button>
                </div>
              </div>

              {/* Right Columns: Renderer progression Console & Logs */}
              <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between h-full">
                {/* Visual rendering progress block */}
                <div className="flex-1 rounded-[1.5rem] bg-zinc-950 border border-white/10 p-6 flex flex-col justify-between overflow-hidden">
                  
                  {/* Header info */}
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-4">
                    <span className="text-zinc-500 uppercase">Task: Render Pipeline Compiler</span>
                    <span className="text-purple-400 font-black uppercase">{isRendering ? 'Baking Frames...' : 'Idle'}</span>
                  </div>

                  {/* Render Logs terminal */}
                  <div className="flex-1 my-4 bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[9px] text-zinc-400 uppercase space-y-1.5 overflow-y-auto custom-scrollbar">
                    {renderConsoleLogs.length === 0 ? (
                      <div className="text-zinc-600 text-center py-20 font-mono">
                        &gt;&gt; Awaiting render signal triggers to allocate pipeline memory...
                      </div>
                    ) : (
                      renderConsoleLogs.map((log, index) => (
                        <div key={index} className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-black' : 'text-zinc-400'}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Interactive rendering progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-zinc-500">Render Progress:</span>
                      <span className="text-white font-bold">{renderProgress}%</span>
                    </div>
                    <div className="h-3.5 bg-black rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-100" 
                        style={{ width: `${renderProgress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Direct download compiler export trigger */}
                {renderProgress === 100 && !isRendering && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-black uppercase">Render Task Successful</div>
                      <div className="text-[9px] text-white/60 uppercase font-mono mt-0.5">MP4 binary asset ready for deployment</div>
                    </div>
                    <button
                      onClick={() => {
                        playSFX('success');
                        alert(`Successfully downloaded project container: '${currentProject.title}.mp4' (${exportRes})`);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <Download size={14} /> Download video
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
