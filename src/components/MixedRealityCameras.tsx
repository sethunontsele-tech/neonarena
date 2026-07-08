import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Eye, Layers, Settings, X, Cpu, Zap, Activity, Shield, Sparkles, 
  RefreshCw, Check, AlertTriangle, Monitor, Play, Sliders, Info, HardDrive, HelpCircle
} from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';

interface MRApp {
  id: string;
  name: string;
  developer: string;
  rating: string;
  description: string;
  mrUsage: string;
  sensoryMode: 'Color Passthrough' | 'Depth Mesh' | 'Skeletal Hands' | 'Spatial Anchors';
  funFact: string;
  simulationConfig: {
    objectColor: string;
    particleType: 'plasma' | 'vectors' | 'mesh' | 'hologram' | 'text' | 'neon';
    accentColor: string;
    spawnRate: number;
    sensorNoise: number;
  };
}

const MR_APPS_CATALOG: MRApp[] = [
  {
    id: 'newtons_room_mr',
    name: "Newton's Room MR",
    developer: "Force Vector Labs",
    rating: "4.8 ★",
    description: "Solve complex Newtonian physics and mechanics puzzles directly on your real-world furniture. Anchor pulleys to your ceiling and roll weight spheres across your actual tables.",
    mrUsage: "Aligns structural physics colliders to physical desks, chairs, and walls scanned by the Quest 3S depth sensor, calculating real gravity and frictional force vectors.",
    sensoryMode: "Color Passthrough",
    funFact: "It can calculate the structural density of a real-world pillow or soft couch to damp elastic bounces mathematically!",
    simulationConfig: {
      objectColor: "#38bdf8",
      particleType: 'vectors',
      accentColor: "#0284c7",
      spawnRate: 40,
      sensorNoise: 0.12
    }
  },
  {
    id: 'shapes_xr_mr',
    name: "ShapesXR Prototyping",
    developer: "Tvori Inc.",
    rating: "4.9 ★",
    description: "Collaborative spatial interface design and wireframing. Create interactive UI/UX mocks, mock up product scales, and edit Figma artboards together with team avatars directly in your physical boardroom.",
    mrUsage: "Fuses virtual multi-layer 3D panels with real surfaces. Uses spatial anchors to lock prototyping canvases exactly on desks for group reviews.",
    sensoryMode: "Spatial Anchors",
    funFact: "Allows instant 1-click publishing of spatial layouts into Unity engine, bypassing manual asset coordinates mapping!",
    simulationConfig: {
      objectColor: "#f472b6",
      particleType: 'hologram',
      accentColor: "#db2777",
      spawnRate: 15,
      sensorNoise: 0.05
    }
  },
  {
    id: 'gravity_lab_mr',
    name: "Gravity Lab physics",
    developer: "Mark Schramm",
    rating: "4.7 ★",
    description: "An electronic and gravitational sandbox. Construct complex chain-reaction automation loops using bouncers, lasers, and gravity-bending fields that adhere directly to real objects.",
    mrUsage: "Projects spatial grid colliders across physical walls, allowing electronic gravity redirector pads to adhere magnetically to your bedroom walls.",
    sensoryMode: "Depth Mesh",
    funFact: "If you open a real door, the physical simulation adapts dynamically, causing virtual floating particles to escape into the hallway!",
    simulationConfig: {
      objectColor: "#fb7185",
      particleType: 'plasma',
      accentColor: "#f43f5e",
      spawnRate: 50,
      sensorNoise: 0.18
    }
  },
  {
    id: 'organon_anatomy_mr',
    name: "3D Organon Anatomy",
    developer: "Medis Media",
    rating: "4.9 ★",
    description: "Walk inside life-sized, high-fidelity anatomical specimens. Dissect muscles, trace blood pathways through virtual ventricles, and view nerve clusters layered over real environments.",
    mrUsage: "Locks floating dissected 3D specimens to your table or desk, letting medical students slice muscle fibers while maintaining visual awareness of classmates.",
    sensoryMode: "Color Passthrough",
    funFact: "Features full Medverse multiplayer, letting 10 study buddies look at the same pulsing heart floating on a real kitchen table!",
    simulationConfig: {
      objectColor: "#f87171",
      particleType: 'mesh',
      accentColor: "#dc2626",
      spawnRate: 25,
      sensorNoise: 0.08
    }
  },
  {
    id: 'noun_town_mr',
    name: "Noun Town Language MR",
    developer: "realities.io",
    rating: "4.8 ★",
    description: "Turn your living room into a gamified foreign language academy. Place colorful virtual nouns, adjectives, and pronunciation triggers directly onto household items.",
    mrUsage: "Uses AI-assisted camera image classifications to recognize physical chairs, tables, and cups, matching them with interactive language labels.",
    sensoryMode: "Skeletal Hands",
    funFact: "Pronouncing the word 'mesa' correctly in Spanish causes the label to pulse emerald green and unlocks a virtual pet sitting on your real table!",
    simulationConfig: {
      objectColor: "#4ade80",
      particleType: 'text',
      accentColor: "#16a34a",
      spawnRate: 10,
      sensorNoise: 0.1
    }
  },
  {
    id: 'open_brush_mr',
    name: "Open Brush Spatial",
    developer: "Tilt Brush Successors",
    rating: "4.8 ★",
    description: "Paint with volumetric ribbons of fire, starry nights, or neon light vectors anywhere in your room. Trace physical objects and wrap spatial light drawings around walls.",
    mrUsage: "Leverages the Quest 3S dual-color cameras to map real-time drawing paths over physical objects with sub-millimeter precision.",
    sensoryMode: "Skeletal Hands",
    funFact: "You can turn off room lights, and the glowing neon paint strokes will bounce beautiful dynamic illumination off your actual floor!",
    simulationConfig: {
      objectColor: "#a78bfa",
      particleType: 'neon',
      accentColor: "#7c3aed",
      spawnRate: 60,
      sensorNoise: 0.03
    }
  },
  {
    id: 'puzzling_places_mr',
    name: "Puzzling Places",
    developer: "realities.io",
    rating: "4.9 ★",
    description: "Assemble hyper-realistic 3D photogrammetric puzzles of castles, shrines, and vintage rooms. Watch physical tables transform into medieval build zones.",
    mrUsage: "Locks puzzle assembly mats to table surfaces, letting you walk around giant floating castle parts in full mixed reality.",
    sensoryMode: "Depth Mesh",
    funFact: "Each puzzle piece is constructed from over 100,000 laser scan vertex points, recording actual atmospheric textures of world heritage sites!",
    simulationConfig: {
      objectColor: "#fbbf24",
      particleType: 'mesh',
      accentColor: "#d97706",
      spawnRate: 20,
      sensorNoise: 0.04
    }
  }
];

interface MixedRealityCamerasProps {
  onClose: () => void;
}

export function MixedRealityCameras({ onClose }: MixedRealityCamerasProps) {
  // Game state variables
  const addEvent = useGameStore(state => state.addEvent);
  
  // Local state
  const [activeFeedMode, setActiveFeedMode] = useState<'passthrough' | 'depth' | 'tracking' | 'guardian'>('passthrough');
  const [selectedAppId, setSelectedAppId] = useState<string>('newtons_room_mr');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [useRealCamera, setUseRealCamera] = useState<boolean>(false);
  const [depthSensitivity, setDepthSensitivity] = useState<number>(75);
  const [irGridScale, setIrGridScale] = useState<number>(1.2);
  const [simulatedParticles, setSimulatedParticles] = useState<{ id: number; x: number; y: number; size: number; alpha: number; dx: number; dy: number; label?: string }[]>([]);
  const [telemetryInjected, setTelemetryInjected] = useState<boolean>(false);
  const [spatialGlitchActive, setSpatialGlitchActive] = useState<boolean>(false);
  const [roomLighting, setRoomLighting] = useState<'day' | 'neon' | 'pitch_dark'>('neon');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const selectedApp = MR_APPS_CATALOG.find(a => a.id === selectedAppId) || MR_APPS_CATALOG[0];

  // Initialize simulated room entities
  const scannedFurniture = [
    { name: "Executive Desk", x: 45, y: 65, w: 110, h: 45, confidence: 98 },
    { name: "Ergonomic Office Chair", x: 170, y: 120, w: 55, h: 55, confidence: 96 },
    { name: "Structural Support Column", x: 300, y: 10, w: 40, h: 280, confidence: 99 },
    { name: "Coffee Table Mat", x: 130, y: 220, w: 85, h: 50, confidence: 84 },
    { name: "Oculus Touch Plus Controller", x: 80, y: 110, w: 20, h: 20, confidence: 99 }
  ];

  // Request Web Camera permissions
  useEffect(() => {
    if (useRealCamera) {
      async function enableWebcam() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
          });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.log('Video play interrupted:', e));
          }
          addEvent(`📷 [CAMERA ACTIVATED] Bound user web camera to Quest 3S passthrough emulation matrix.`);
        } catch (err) {
          console.error("Camera access denied:", err);
          setUseRealCamera(false);
          addEvent(`⚠️ [CAMERA ACCESS DENIED] Defaulting to high-fidelity synthesized room matrix.`);
        }
      }
      enableWebcam();
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealCamera]);

  // Handle particle physics inside simulated Canvas
  useEffect(() => {
    let pCount = 0;
    const initialParticles = Array.from({ length: 40 }).map(() => ({
      id: pCount++,
      x: Math.random() * 480 + 30,
      y: Math.random() * 260 + 30,
      size: Math.random() * 4 + 2,
      alpha: Math.random() * 0.7 + 0.3,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      label: Math.random() > 0.85 ? 'Vector Force' : undefined
    }));
    setSimulatedParticles(initialParticles);

    const updateInterval = setInterval(() => {
      if (!isSimulating) return;

      setSimulatedParticles(prev => {
        // Move and spawn
        let next = prev.map(p => {
          let nx = p.x + p.dx;
          let ny = p.y + p.dy;

          // Bounce off simulated boundaries
          if (nx < 15 || nx > 525) p.dx = -p.dx;
          if (ny < 15 || ny > 285) p.dy = -p.dy;

          return {
            ...p,
            x: Math.max(15, Math.min(525, nx)),
            y: Math.max(15, Math.min(285, ny))
          };
        });

        // Periodic new spawn to maintain rate
        if (next.length < selectedApp.simulationConfig.spawnRate) {
          next.push({
            id: pCount++,
            x: Math.random() * 300 + 100,
            y: Math.random() * 150 + 50,
            size: Math.random() * 5 + 3,
            alpha: Math.random() * 0.8 + 0.2,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            label: selectedApp.id === 'noun_town_mr' && Math.random() > 0.7 
              ? ['Mesa', 'Silla', 'Puerta', 'Gato'][Math.floor(Math.random() * 4)] 
              : undefined
          });
        }

        // cull if too many
        if (next.length > selectedApp.simulationConfig.spawnRate + 15) {
          next = next.slice(1);
        }

        return next;
      });
    }, 30);

    return () => clearInterval(updateInterval);
  }, [selectedAppId, isSimulating]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const noise = selectedApp.simulationConfig.sensorNoise;
      const accent = selectedApp.simulationConfig.accentColor;
      const color = selectedApp.simulationConfig.objectColor;

      // 1. DRAW SIMULATED BACKGROUND SURROUNDINGS (if not using webcam)
      if (!useRealCamera) {
        // Soft backdrop
        if (roomLighting === 'day') {
          ctx.fillStyle = '#1e293b'; // Slate gray day room
        } else if (roomLighting === 'pitch_dark') {
          ctx.fillStyle = '#030712'; // Absolute dark night room
        } else {
          ctx.fillStyle = '#0a0518'; // Cosmic neon violet
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ambient cyberCity isometric blocks or grids representing scanned physical floor
        ctx.strokeStyle = roomLighting === 'neon' ? 'rgba(167, 139, 250, 0.08)' : 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridGap = 40;
        for (let x = 0; x < canvas.width; x += gridGap) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridGap) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw basic representations of furniture
        scannedFurniture.forEach(f => {
          ctx.fillStyle = roomLighting === 'neon' ? 'rgba(34, 211, 238, 0.05)' : 'rgba(255, 255, 255, 0.02)';
          ctx.strokeStyle = roomLighting === 'neon' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(f.x, f.y, f.w, f.h, 8);
          ctx.fill();
          ctx.stroke();
        });
      }

      // Add spatial scanline tracking interference noise if active
      if (spatialGlitchActive || Math.random() > 0.99) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 20 + 5);
      }

      // 2. APPLY OVERLAYS DEPENDING ON SYSTEM VIEWPORT MODE
      
      // Mode A: DUAL COLOR PASSTHROUGH (Slight overlay + vignette)
      if (activeFeedMode === 'passthrough') {
        const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 300);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.12)'); // Cyans passthrough glow
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Active app holographic integration overlay
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.fillText(`QUEST 3S RGB DUAL-CAM: 18 PPD STABLE`, 20, 25);
      }

      // Mode B: SPATIAL DEPTH MESH (Wireframes over objects)
      else if (activeFeedMode === 'depth') {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 1;

        // Draw structural wireframes over everything
        scannedFurniture.forEach(f => {
          ctx.strokeRect(f.x, f.y, f.w, f.h);
          
          // Draw diagonal triangulation lines to simulate mesh facets
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + f.w, f.y + f.h);
          ctx.moveTo(f.x + f.w, f.y);
          ctx.lineTo(f.x, f.y + f.h);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        });

        // Dynamic depth contours
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.beginPath();
        const scanY = (Date.now() / 15) % canvas.height;
        ctx.moveTo(0, scanY);
        for (let x = 0; x < canvas.width; x += 10) {
          const dy = Math.sin((x + scanY) / 10) * 15 * (depthSensitivity / 100);
          ctx.lineTo(x, scanY + dy);
        }
        ctx.stroke();

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`INFRARED DEPTH SCANNER: ${depthSensitivity}% GAIN`, 20, 25);
      }

      // Mode C: IR HAND & CONTROLLER TRACKING CONSTELLATION
      else if (activeFeedMode === 'tracking') {
        // Draw Touch Plus Controller nodes
        const ctrlX = 140 + Math.sin(Date.now() / 1000) * 80;
        const ctrlY = 120 + Math.cos(Date.now() / 1200) * 40;

        // Controller shell representation
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ctrlX, ctrlY, 20 * irGridScale, 0, Math.PI * 2);
        ctx.stroke();

        // IR tracking rings points
        ctx.fillStyle = '#fbbf24';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const px = ctrlX + Math.cos(a) * 20 * irGridScale;
          const py = ctrlY + Math.sin(a) * 20 * irGridScale;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Virtual hand bones trace representation
        const handX = 350 + Math.sin(Date.now() / 800) * 30;
        const handY = 180 + Math.cos(Date.now() / 900) * 20;

        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.beginPath();
        ctx.moveTo(handX, handY); // wrist
        ctx.lineTo(handX - 20, handY - 40); // thumb
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX, handY - 50); // index
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + 15, handY - 48); // middle
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + 30, handY - 35); // pinky
        ctx.stroke();

        // Joints points
        ctx.fillStyle = '#22c55e';
        const joints = [
          [handX, handY], [handX - 20, handY - 40], [handX, handY - 50],
          [handX + 15, handY - 48], [handX + 30, handY - 35],
          [handX - 10, handY - 20], [handX + 8, handY - 24]
        ];
        joints.forEach(j => {
          ctx.beginPath();
          ctx.arc(j[0], j[1], 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`IR LED MATRIX: TOUCH PLUS & 25-POINT SKELETAL HANDS`, 20, 25);
      }

      // Mode D: MR BOUNDARY GUARDIAN MATRIX
      else if (activeFeedMode === 'guardian') {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.5;

        // Draw spatial fence polygons
        ctx.beginPath();
        ctx.moveTo(25, 25);
        ctx.lineTo(canvas.width - 25, 25);
        ctx.lineTo(canvas.width - 25, canvas.height - 25);
        ctx.lineTo(25, canvas.height - 25);
        ctx.closePath();
        ctx.stroke();

        // Draw vertical stripes to represent the guardian wall grid
        const gridX = 12;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        for (let col = 30; col < canvas.width; col += 30) {
          ctx.beginPath();
          ctx.moveTo(col, 25);
          ctx.lineTo(col, canvas.height - 25);
          ctx.stroke();
        }

        // Draw safe-boundary overlay warning text in middle if controllers near border
        const isNearBorder = Math.sin(Date.now() / 600) > 0.4;
        if (isNearBorder) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(25, 25, canvas.width - 50, canvas.height - 50);

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

          ctx.font = 'black 11px monospace';
          ctx.fillStyle = '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText(`⚠️ [GUARDIAN RESTRICTION] EXCEEDING ROOM PLAY AREA`, canvas.width / 2, canvas.height / 2);
          ctx.textAlign = 'left';
        }

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`GUARDIAN WALL MATRIX: ROOM MAPPING ACTIVE`, 20, 25);
      }

      // 3. RENDER THE ACTIVE MR APP SIMULATION (floating augmentations)
      simulatedParticles.forEach(p => {
        ctx.fillStyle = color;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 6;

        // Draw appropriate styling depending on particleType
        if (selectedApp.simulationConfig.particleType === 'vectors') {
          // Force arrows
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.dx * 8, p.y + p.dy * 8);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x + p.dx * 8, p.y + p.dy * 8, 2, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (selectedApp.simulationConfig.particleType === 'neon') {
          // Long light paths
          ctx.strokeStyle = color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x - p.dx * 10, p.y - p.dy * 10);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        else if (selectedApp.simulationConfig.particleType === 'hologram') {
          // Floating CAD boxes
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        }
        else if (selectedApp.simulationConfig.particleType === 'text') {
          // Floating spanish vocabulary tags
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(p.label || 'Vaso', p.x, p.y);
        }
        else {
          // Standard glowing floating spheres
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Clear shadow blur for general speed
        ctx.shadowBlur = 0;
      });

      // Label details overlay
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(15, canvas.height - 35, canvas.width - 30, 25);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(15, canvas.height - 35, canvas.width - 30, 25);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`SIMULATED: ${selectedApp.name.toUpperCase()} (MR ENGINE ACTIVE)`, 25, canvas.height - 19);
      
      ctx.fillStyle = accent;
      ctx.fillText(`STATUS: INJECTING SPATIAL RECONSTRUCTIONS LIVE`, canvas.width - 240, canvas.height - 19);

      // Loop
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [selectedAppId, activeFeedMode, useRealCamera, depthSensitivity, irGridScale, spatialGlitchActive, roomLighting, simulatedParticles]);

  const handleInjectTelemetry = () => {
    setTelemetryInjected(true);
    addEvent(`🛸 [MR TELEMETRY INJECTED] Loaded custom camera configurations from ${selectedApp.name} into sandbox gameplay variables!`);
    try {
      soundService.playSFX('spell');
    } catch(e){}
    setTimeout(() => {
      setTelemetryInjected(false);
    }, 3000);
  };

  const handleToggleGlitch = () => {
    setSpatialGlitchActive(true);
    try {
      soundService.playSFX('timewarp');
    } catch(e){}
    setTimeout(() => {
      setSpatialGlitchActive(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-zinc-950/98 z-[200] flex flex-col p-6 backdrop-blur-2xl font-sans text-zinc-300 select-none overflow-hidden"
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-400/30 text-fuchsia-400">
            <Camera size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider italic flex items-center gap-2">
              Quest 3S Mixed Reality Camera & Diagnostics Hub
              <span className="text-[9px] font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-bounce">MR Passthrough</span>
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
              Examine live low-latency passthrough cameras, spatial boundary meshes, and MR app telemetry matrices
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* TWO PANEL CONTENT */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* LEFT VIEWPORT: LIVE CAMERA FEED SIMULATOR */}
        <div className="col-span-7 bg-zinc-900/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          {/* CAMERA FEED NAVIGATION MODES */}
          <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
            {[
              { id: 'passthrough', label: 'Color Passthrough', desc: 'Dual-Color RGB, 18 PPD', icon: Eye, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
              { id: 'depth', label: 'Spatial Mesh', desc: 'ToF Depth Contours', icon: Layers, color: 'text-pink-400 border-pink-500/20 bg-pink-500/5' },
              { id: 'tracking', label: 'IR Constellation', desc: '25-Point Hand/Controller', icon: Activity, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
              { id: 'guardian', label: 'Boundary Guardian', desc: 'Virtual Safe Fence', icon: Shield, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' }
            ].map(mode => {
              const isActive = activeFeedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveFeedMode(mode.id as any);
                    try { soundService.playSFX('ui_click'); } catch(e){}
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isActive 
                      ? 'bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                      : 'bg-zinc-950/50 border-transparent text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <mode.icon size={13} className={isActive ? 'text-white' : mode.color.split(' ')[0]} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{mode.label}</span>
                  </div>
                  <span className="text-[8px] text-zinc-500 uppercase mt-1 leading-none">{mode.desc}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN MONITOR FRAME */}
          <div className="flex-1 bg-black rounded-3xl border border-white/10 overflow-hidden relative min-h-0 flex items-center justify-center">
            
            {/* Real Webcam Stream hidden background if active */}
            {useRealCamera && (
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none scale-x-[-1]"
                muted
                playsInline
                autoPlay
              />
            )}

            {/* Simulated overlay / augmentation lines */}
            <canvas 
              ref={canvasRef}
              width={540}
              height={320}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />

            {/* Static Grid Calibration HUD overlay */}
            <div className="absolute top-4 right-4 bg-black/80 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[8px] font-mono tracking-widest text-zinc-500 uppercase z-20">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              CALIBRATED FEED: STABLE
            </div>

            {spatialGlitchActive && (
              <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="text-center p-4 bg-black border border-red-500/30 rounded-2xl">
                  <AlertTriangle className="text-red-500 w-8 h-8 mx-auto mb-2 animate-bounce" />
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">TEMPORARY SPATIAL ANCHOR DESYNC</div>
                  <div className="text-[8px] text-zinc-500 uppercase mt-0.5">Recalibrating accelerometer gravity multipliers...</div>
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE DIAGNOSTIC SLIDERS */}
          <div className="mt-4 grid grid-cols-3 gap-4 bg-zinc-950/40 p-4 rounded-2xl border border-white/5 shrink-0">
            <div>
              <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                <span>Depth Range sensitivity</span>
                <span className="text-pink-400">{depthSensitivity}%</span>
              </div>
              <input 
                type="range"
                min="20"
                max="100"
                value={depthSensitivity}
                onChange={e => setDepthSensitivity(parseInt(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                <span>IR Constellation Grid</span>
                <span className="text-amber-400">{irGridScale.toFixed(1)}x</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={irGridScale}
                onChange={e => setIrGridScale(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pl-4 border-l border-white/5">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Web Camera Input</span>
                <span className="text-[7px] text-zinc-600 uppercase mt-0.5">Uses real-time webcam feed</span>
              </div>
              <button
                onClick={() => setUseRealCamera(!useRealCamera)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  useRealCamera ? 'bg-cyan-400' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  useRealCamera ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: QUEST 3S MIXED REALITY APPLICATIONS DIRECTORY */}
        <div className="col-span-5 bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4 shrink-0">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Monitor size={14} className="text-fuchsia-400" />
              Quest 3S MR App Suite
            </h3>
            <span className="text-[9px] font-mono font-bold text-cyan-400">7 VR Apps Cataloged</span>
          </div>

          {/* SENSE LAB CATALOG LIST */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0 mb-4">
            {MR_APPS_CATALOG.map(app => {
              const isSelected = app.id === selectedAppId;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    try { soundService.playSFX('ui_click'); } catch(e){}
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-fuchsia-500/5 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.05)]' 
                      : 'bg-zinc-950/20 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wide ${
                        isSelected ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {app.name}
                      </h4>
                      <span className="text-[8px] text-zinc-500 uppercase font-semibold mt-0.5 block">By {app.developer}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">{app.rating}</span>
                      <span className="text-[8px] font-black text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase">{app.sensoryMode}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <p className="text-[10px] leading-relaxed text-zinc-400 font-medium uppercase mt-2 pt-2 border-t border-white/5 animate-fadeIn">
                      {app.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTIVE SELECTED MR APP METRICS CARD */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">MR Integration Mechanics</span>
              <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">Active Profiler</span>
            </div>
            
            <p className="text-[10px] leading-relaxed text-zinc-400 font-semibold uppercase">
              {selectedApp.mrUsage}
            </p>

            <div className="p-3 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl">
              <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Info size={11} />
                Quest 3S MR Fact Sheet
              </span>
              <p className="text-[9px] leading-relaxed text-zinc-500 uppercase">
                {selectedApp.funFact}
              </p>
            </div>

            <div className="flex gap-2 pt-1.5">
              <button
                onClick={handleToggleGlitch}
                className="flex-1 py-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-[9px] font-black text-zinc-400 uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Simulate Spatial Desync
              </button>
              
              <button
                onClick={handleInjectTelemetry}
                className="flex-1 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-400 text-black text-[9px] font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={11} />
                {telemetryInjected ? 'Telemetry Injected!' : 'Inject MR Telemetry'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER METRICS BAR */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 tracking-wider shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className="text-cyan-500 animate-spin" style={{ animationDuration: '10s' }} />
            Quest 3S Chipset: <strong className="text-white">Snapdragon XR2 Gen 2</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Sliders size={13} className="text-amber-500" />
            Sensor Frequencies: <strong className="text-white">90Hz Passthrough Alignment</strong>
          </span>
        </div>
        <div>
          Hardware Alignment Level: <strong className="text-emerald-400">100% PERFECT SYNCHRONIZATION</strong>
        </div>
      </div>
    </motion.div>
  );
}
