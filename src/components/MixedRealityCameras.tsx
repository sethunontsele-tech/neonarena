import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Eye, Layers, Settings, X, Cpu, Zap, Activity, Shield, Sparkles, 
  RefreshCw, Check, AlertTriangle, Monitor, Play, Sliders, Info, HardDrive, 
  HelpCircle, Smartphone, RotateCw, Wifi, Battery, Radio
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
  const addEvent = useGameStore(state => state.addEvent);
  
  // 1. DEVICE TYPE EMULATION STATE
  // 'vr_headset' (Meta Quest 3S), 'android_14' (Android 14 ARCore), 'android_16' (Android 16 Spatial/Neural)
  const [deviceType, setDeviceType] = useState<'vr_headset' | 'android_14' | 'android_16'>('vr_headset');
  
  // Device specifics
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

  // VR Specifics
  const [ipdCalibration, setIpdCalibration] = useState<number>(64); // 58mm - 72mm
  const [refreshRate, setRefreshRate] = useState<90 | 120>(90);
  const [showStereoscopic, setShowStereoscopic] = useState<boolean>(false);

  // Mobile Phone Specifics
  const [mobileOrientation, setMobileOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [planeDetectionSpeed, setPlaneDetectionSpeed] = useState<number>(80); // Android 14
  const [neuralAccuracy, setNeuralAccuracy] = useState<number>(92); // Android 16 Neural Link
  const [uwbEnabled, setUwbEnabled] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedApp = MR_APPS_CATALOG.find(a => a.id === selectedAppId) || MR_APPS_CATALOG[0];

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
          addEvent(`📷 [CAMERA ACTIVATED] Bound user web camera to passthrough emulation matrix.`);
        } catch (err) {
          console.error("Camera access denied:", err);
          setUseRealCamera(false);
          addEvent(`⚠️ [CAMERA ACCESS DENIED] Defaulting to high-fidelity synthesized spatial matrix.`);
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

      // STEREOSCOPIC DOUBLE EYE RENDERING IF ENABLED IN VR
      const isStereo = deviceType === 'vr_headset' && showStereoscopic;
      const renderPasses = isStereo ? [
        { eye: 'left', clipX: 0, clipY: 0, clipW: canvas.width / 2, clipH: canvas.height, dX: -ipdCalibration / 4 },
        { eye: 'right', clipX: canvas.width / 2, clipY: 0, clipW: canvas.width / 2, clipH: canvas.height, dX: ipdCalibration / 4 }
      ] : [
        { eye: 'mono', clipX: 0, clipY: 0, clipW: canvas.width, clipH: canvas.height, dX: 0 }
      ];

      renderPasses.forEach(pass => {
        ctx.save();
        
        // Define clipping zone for stereoscopic split screen
        ctx.beginPath();
        ctx.rect(pass.clipX, pass.clipY, pass.clipW, pass.clipH);
        ctx.clip();

        // Translate to apply lens disparity offsets
        ctx.translate(pass.dX, 0);

        // 1. DRAW SIMULATED BACKGROUND SURROUNDINGS (if not using webcam)
        if (!useRealCamera) {
          // Soft backdrop
          if (roomLighting === 'day') {
            ctx.fillStyle = '#1e293b'; 
          } else if (roomLighting === 'pitch_dark') {
            ctx.fillStyle = '#030712'; 
          } else {
            ctx.fillStyle = '#0a0518'; 
          }
          ctx.fillRect(pass.clipX - Math.abs(pass.dX), 0, pass.clipW + Math.abs(pass.dX) * 2, canvas.height);

          // Ambient grid representing scanned floor
          ctx.strokeStyle = roomLighting === 'neon' 
            ? (deviceType === 'android_16' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(167, 139, 250, 0.08)')
            : 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          const gridGap = 40;
          for (let x = -80; x < canvas.width + 80; x += gridGap) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += gridGap) {
            ctx.beginPath();
            ctx.moveTo(-80, y);
            ctx.lineTo(canvas.width + 80, y);
            ctx.stroke();
          }

          // ARCore Plane detection overlay (Android 14 / 16)
          if (deviceType === 'android_14') {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.03)';
            ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);
            
            // Draw plane dots
            ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
            const speedScale = (planeDetectionSpeed / 100) * 10;
            const seed = Date.now() / 150;
            for (let px = 20; px < canvas.width; px += 25) {
              for (let py = Math.floor(canvas.height * 0.45); py < canvas.height; py += 25) {
                const shift = Math.sin((px + py + seed) * 0.05) * speedScale;
                ctx.beginPath();
                ctx.arc(px + shift, py + shift, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Android 16 futuristic neural network lines
          if (deviceType === 'android_16') {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
            ctx.lineWidth = 0.5;
            scannedFurniture.forEach((f, i) => {
              scannedFurniture.forEach((f2, j) => {
                if (i !== j && Math.abs(i - j) <= 2) {
                  ctx.beginPath();
                  ctx.moveTo(f.x + f.w/2, f.y + f.h/2);
                  ctx.lineTo(f2.x + f2.w/2, f2.y + f2.h/2);
                  ctx.stroke();
                }
              });
            });
          }

          // Draw basic representations of furniture
          scannedFurniture.forEach(f => {
            if (deviceType === 'android_14') {
              ctx.fillStyle = 'rgba(234, 179, 8, 0.05)';
              ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
            } else if (deviceType === 'android_16') {
              ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
            } else {
              ctx.fillStyle = roomLighting === 'neon' ? 'rgba(34, 211, 238, 0.05)' : 'rgba(255, 255, 255, 0.02)';
              ctx.strokeStyle = roomLighting === 'neon' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)';
            }
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(f.x, f.y, f.w, f.h, 8);
            ctx.fill();
            ctx.stroke();

            // Label detected item on mobile
            if (deviceType !== 'vr_headset') {
              ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : '#eab308';
              ctx.font = 'bold 7px sans-serif';
              ctx.fillText(`${f.name} (${f.confidence}% anchor)`, f.x + 4, f.y + 12);
            }
          });
        }

        // Add spatial scanline tracking interference noise if active
        if (spatialGlitchActive || Math.random() > 0.99) {
          ctx.fillStyle = deviceType === 'android_16' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(236, 72, 153, 0.1)';
          ctx.fillRect(pass.clipX, Math.random() * canvas.height, pass.clipW, Math.random() * 20 + 5);
        }

        // 2. APPLY OVERLAYS DEPENDING ON SYSTEM VIEWPORT MODE
        
        // Mode A: DUAL COLOR PASSTHROUGH (Slight overlay + vignette)
        if (activeFeedMode === 'passthrough') {
          const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, 300);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, deviceType === 'android_16' ? 'rgba(6, 182, 212, 0.16)' : 'rgba(6, 182, 212, 0.12)'); 
          ctx.fillStyle = grad;
          ctx.fillRect(pass.clipX - Math.abs(pass.dX), 0, pass.clipW + Math.abs(pass.dX)*2, canvas.height);

          // Active app holographic integration overlay
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : 'rgba(6, 182, 212, 0.6)';
          
          let title = `QUEST 3S RGB DUAL-CAM: 18 PPD STABLE`;
          if (deviceType === 'android_14') title = `ANDROID 14: ARCORE API FRAMEWORK ACTIVE`;
          if (deviceType === 'android_16') title = `ANDROID 16 NEURAL SPACE API: ACTIVE STABILIZATION`;
          ctx.fillText(title, pass.clipX + 20, 25);
        }

        // Mode B: SPATIAL DEPTH MESH (Wireframes over objects)
        else if (activeFeedMode === 'depth') {
          ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 238, 0.5)';
          ctx.lineWidth = 1;

          // Draw structural wireframes over everything
          scannedFurniture.forEach(f => {
            ctx.strokeRect(f.x, f.y, f.w, f.h);
            
            // Draw diagonal triangulation lines to simulate mesh facets
            ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.35)' : 'rgba(34, 211, 238, 0.2)';
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(f.x + f.w, f.y + f.h);
            ctx.moveTo(f.x + f.w, f.y);
            ctx.lineTo(f.x, f.y + f.h);
            ctx.stroke();
            ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 238, 0.5)';
          });

          // Dynamic depth contours
          ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(6, 182, 212, 0.45)' : 'rgba(236, 72, 153, 0.25)';
          ctx.beginPath();
          const scanY = (Date.now() / 15) % canvas.height;
          ctx.moveTo(pass.clipX, scanY);
          for (let x = pass.clipX; x < pass.clipX + pass.clipW; x += 10) {
            const dy = Math.sin((x + scanY) / 10) * 15 * (depthSensitivity / 100);
            ctx.lineTo(x, scanY + dy);
          }
          ctx.stroke();

          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : '#ec4899';
          ctx.fillText(`INFRARED DEPTH SCANNER: ${depthSensitivity}% GAIN`, pass.clipX + 20, 25);
        }

        // Mode C: IR HAND & CONTROLLER TRACKING CONSTELLATION
        else if (activeFeedMode === 'tracking') {
          // Draw Touch Plus Controller nodes or mobile pointer
          const ctrlX = pass.clipX + pass.clipW * 0.3 + Math.sin(Date.now() / 1000) * 60;
          const ctrlY = 120 + Math.cos(Date.now() / 1200) * 40;

          // Controller / Device pointer shell representation
          ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.8)' : 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ctrlX, ctrlY, 20 * irGridScale, 0, Math.PI * 2);
          ctx.stroke();

          // IR tracking rings points
          ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : '#fbbf24';
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const px = ctrlX + Math.cos(a) * 20 * irGridScale;
            const py = ctrlY + Math.sin(a) * 20 * irGridScale;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Hand skeletal trace / Mobile gyro pointer path
          const handX = pass.clipX + pass.clipW * 0.7 + Math.sin(Date.now() / 800) * 25;
          const handY = 180 + Math.cos(Date.now() / 900) * 20;

          ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(6, 182, 212, 0.8)' : 'rgba(34, 197, 94, 0.6)';
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
          ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : '#22c55e';
          const joints = [
            [handX, handY], [handX - 20, handY - 40], [handX, handY - 50],
            [handX + 15, handY - 48], [handX + 30, handY - 35]
          ];
          joints.forEach(j => {
            ctx.beginPath();
            ctx.arc(j[0], j[1], 3.5, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : '#fbbf24';
          
          let feedText = `IR LED MATRIX: TOUCH PLUS & 25-POINT SKELETAL HANDS`;
          if (deviceType !== 'vr_headset') feedText = `GYROSCOPE & SENSOR FUSION: IMU 6DoF CORRELATION`;
          ctx.fillText(feedText, pass.clipX + 20, 25);
        }

        // Mode D: MR BOUNDARY GUARDIAN / SAFE WINDOW
        else if (activeFeedMode === 'guardian') {
          ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.6)' : 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1.5;

          // Draw spatial fence polygons
          ctx.beginPath();
          ctx.moveTo(pass.clipX + 15, 25);
          ctx.lineTo(pass.clipX + pass.clipW - 15, 25);
          ctx.lineTo(pass.clipX + pass.clipW - 15, canvas.height - 25);
          ctx.lineTo(pass.clipX + 15, canvas.height - 25);
          ctx.closePath();
          ctx.stroke();

          // Draw vertical stripes to represent the guardian wall grid
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
          for (let col = pass.clipX + 30; col < pass.clipX + pass.clipW; col += 30) {
            ctx.beginPath();
            ctx.moveTo(col, 25);
            ctx.lineTo(col, canvas.height - 25);
            ctx.stroke();
          }

          // Danger zone warning if near border
          const isNearBorder = Math.sin(Date.now() / 600) > 0.4;
          if (isNearBorder) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(pass.clipX + 15, 25, pass.clipW - 30, canvas.height - 50);

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(pass.clipX + 15, 25, pass.clipW - 30, canvas.height - 50);

            ctx.font = 'black 9px monospace';
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'center';
            ctx.fillText(`⚠️ EXCEEDING STABLE PLAY BOUNDARIES`, pass.clipX + pass.clipW / 2, canvas.height / 2);
            ctx.textAlign = 'left';
          }

          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#06b6d4';
          ctx.fillText(`SPATIAL LIMIT GUARDIAN ACTIVE`, pass.clipX + 20, 25);
        }

        // 3. RENDER THE ACTIVE MR APP SIMULATION (floating augmentations)
        simulatedParticles.forEach(p => {
          // Adjust particles x relative to eyes if stereoscopic
          const px = isStereo 
            ? (pass.eye === 'left' ? p.x * 0.5 : canvas.width / 2 + p.x * 0.5)
            : p.x;
          
          ctx.fillStyle = color;
          ctx.shadowColor = accent;
          ctx.shadowBlur = 6;

          // Draw appropriate styling depending on particleType
          if (selectedApp.simulationConfig.particleType === 'vectors') {
            // Force arrows
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, p.y);
            ctx.lineTo(px + p.dx * 8, p.y + p.dy * 8);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px + p.dx * 8, p.y + p.dy * 8, 2, 0, Math.PI * 2);
            ctx.fill();
          } 
          else if (selectedApp.simulationConfig.particleType === 'neon') {
            // Long light paths
            ctx.strokeStyle = color;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(px - p.dx * 10, p.y - p.dy * 10);
            ctx.lineTo(px, p.y);
            ctx.stroke();
          }
          else if (selectedApp.simulationConfig.particleType === 'hologram') {
            // Floating CAD boxes
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(px - p.size, p.y - p.size, p.size * 2, p.size * 2);
          }
          else if (selectedApp.simulationConfig.particleType === 'text') {
            // Floating spanish vocabulary tags
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText(p.label || 'Vaso', px, p.y);
          }
          else {
            // Standard glowing floating spheres
            ctx.beginPath();
            ctx.arc(px, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 0;
        });

        // 4. DRAW VR SPECIFIC EYE RING OR EMBELLISHMENT
        if (isStereo) {
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pass.clipX + pass.clipW / 2, canvas.height / 2, Math.min(pass.clipW, canvas.height) / 2 - 5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(`EYE: ${pass.eye.toUpperCase()}`, pass.clipX + 15, canvas.height - 45);
        }

        ctx.restore();
      });

      // 5. CONSTANT DRAW: HUD STATUS LINE AT THE BOTTOM (Not affected by stereoscopic offset)
      ctx.fillStyle = 'rgba(0,0,0,0.92)';
      ctx.fillRect(15, canvas.height - 35, canvas.width - 30, 25);
      ctx.strokeStyle = deviceType === 'android_16' ? 'rgba(34, 211, 238, 0.25)' : 'rgba(255,255,255,0.1)';
      ctx.strokeRect(15, canvas.height - 35, canvas.width - 30, 25);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`SIMULATED: ${selectedApp.name.toUpperCase()} (MR ENGINE ACTIVE)`, 25, canvas.height - 19);
      
      ctx.fillStyle = deviceType === 'android_16' ? '#22d3ee' : accent;
      ctx.fillText(`STATUS: INJECTING SPATIAL RECONSTRUCTIONS LIVE`, canvas.width - 240, canvas.height - 19);

      // Loop
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    selectedAppId, activeFeedMode, useRealCamera, depthSensitivity, irGridScale, 
    spatialGlitchActive, roomLighting, simulatedParticles, deviceType, 
    ipdCalibration, showStereoscopic, planeDetectionSpeed
  ]);

  const handleInjectTelemetry = () => {
    setTelemetryInjected(true);
    let devLabel = "Meta Quest 3S";
    if (deviceType === 'android_14') devLabel = "Android 14 (ARCore)";
    if (deviceType === 'android_16') devLabel = "Android 16 (Neural OS)";
    
    addEvent(`🛸 [MR TELEMETRY INJECTED] Synchronized ${selectedApp.name} telemetry over emulated ${devLabel} system!`);
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

  const handleDeviceChange = (type: 'vr_headset' | 'android_14' | 'android_16') => {
    setDeviceType(type);
    try { soundService.playSFX('ui_tab'); } catch(e){}
    addEvent(`🖥️ [EMULATION SHIFT] Transferred diagnostics feed to emulated ${
      type === 'vr_headset' ? 'Quest 3S VR Headset' : type === 'android_14' ? 'Android 14 Mobile (ARCore)' : 'Android 16 Mobile (Neural Link OS)'
    } platform.`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-zinc-950/98 z-[200] flex flex-col p-6 backdrop-blur-2xl font-sans text-zinc-300 select-none overflow-hidden"
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-400/30 text-fuchsia-400">
            <Camera size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider italic flex items-center gap-2">
              Mixed Reality Labs & Diagnostics
              <span className="text-[9px] font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                {deviceType === 'vr_headset' ? 'VR Quest 3S' : deviceType === 'android_14' ? 'Android 14 Core' : 'Android 16 Neural'}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
              Simulate and inspect non-gaming Quest 3S MR application matrices & Mobile device integrations
            </p>
          </div>
        </div>
        
        {/* COMPATIBILITY PLATFORM CONTROL SELECTORS */}
        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-2xl gap-1">
          <button
            onClick={() => handleDeviceChange('vr_headset')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              deviceType === 'vr_headset' 
                ? 'bg-fuchsia-500 text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor size={12} />
            Quest 3S Headset
          </button>
          
          <button
            onClick={() => handleDeviceChange('android_14')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              deviceType === 'android_14' 
                ? 'bg-amber-500 text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone size={12} />
            Android 14 AR
          </button>

          <button
            onClick={() => handleDeviceChange('android_16')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              deviceType === 'android_16' 
                ? 'bg-cyan-500 text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap size={12} />
            Android 16 Neural OS
          </button>
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
          <div className="flex justify-between items-center mb-3 shrink-0">
            <div className="grid grid-cols-4 gap-2 flex-1">
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
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive 
                        ? 'bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                        : 'bg-zinc-950/50 border-transparent text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <mode.icon size={12} className={isActive ? 'text-white' : mode.color.split(' ')[0]} />
                      <span className="text-[9px] font-black uppercase tracking-wider">{mode.label}</span>
                    </div>
                    <span className="text-[7px] text-zinc-500 uppercase mt-0.5 leading-none">{mode.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Rotation toggle if mobile device */}
            {deviceType !== 'vr_headset' && (
              <button
                onClick={() => {
                  setMobileOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
                  try { soundService.playSFX('ui_click'); } catch(e){}
                }}
                className="ml-3 px-3 py-2 bg-zinc-950/50 hover:bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Rotate Mobile Display"
              >
                <RotateCw size={12} className="animate-spin-slow" />
                {mobileOrientation}
              </button>
            )}
          </div>

          {/* MAIN MONITOR FRAME EMULATION WRAPPER */}
          <div className="flex-1 bg-black rounded-3xl border border-white/10 overflow-hidden relative min-h-0 flex items-center justify-center p-4">
            
            {/* STYLING BASED ON SELECTED DEVICE */}
            <div 
              className={`transition-all duration-300 relative overflow-hidden bg-zinc-950 flex items-center justify-center ${
                deviceType === 'vr_headset' 
                  ? 'w-full h-full rounded-2xl border border-fuchsia-500/20' 
                  : deviceType === 'android_14'
                    ? mobileOrientation === 'portrait'
                      ? 'w-[260px] h-full border-[8px] border-zinc-800 rounded-[32px] shadow-2xl relative'
                      : 'w-full max-w-[560px] h-[250px] border-[8px] border-zinc-800 rounded-[32px] shadow-2xl relative'
                    : // Android 16 holographic OS
                      mobileOrientation === 'portrait'
                        ? 'w-[260px] h-full border border-cyan-400/40 bg-cyan-950/10 rounded-[32px] shadow-[0_0_20px_rgba(34,211,238,0.15)] relative'
                        : 'w-full max-w-[560px] h-[250px] border border-cyan-400/40 bg-cyan-950/10 rounded-[32px] shadow-[0_0_20px_rgba(34,211,238,0.15)] relative'
              }`}
            >
              {/* REAL WEBCAM IF TOGGLED */}
              {useRealCamera && (
                <video 
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none scale-x-[-1]"
                  muted
                  playsInline
                  autoPlay
                />
              )}

              {/* CANVAS SIMULATION LAYER */}
              <canvas 
                ref={canvasRef}
                width={deviceType === 'vr_headset' ? 540 : mobileOrientation === 'portrait' ? 260 : 540}
                height={deviceType === 'vr_headset' ? 320 : mobileOrientation === 'portrait' ? 320 : 250}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              />

              {/* ANDROID 14 TOP STATUS BAR AND PUNCH HOLE */}
              {deviceType === 'android_14' && (
                <>
                  {/* Status Bar */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-black/40 px-4 flex justify-between items-center text-[7px] font-bold text-white uppercase tracking-wider z-20">
                    <span>09:22</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi size={8} />
                      <Battery size={10} className="text-emerald-400" />
                      <span>88%</span>
                    </div>
                  </div>
                  {/* Punch Hole Camera */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black rounded-full border border-white/5 z-30" />
                </>
              )}

              {/* ANDROID 16 TRANSITIONAL GLOWING BARS */}
              {deviceType === 'android_16' && (
                <>
                  <div className="absolute top-0 inset-x-0 h-6 bg-cyan-950/40 px-4 flex justify-between items-center text-[7px] font-black text-cyan-300 uppercase tracking-widest z-20">
                    <span>NEURAL SYNC ON</span>
                    <div className="flex items-center gap-1.5">
                      <Radio size={8} className="animate-pulse text-cyan-400" />
                      <span>UWB 240Hz</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-cyan-400/40 rounded-full z-20" />
                </>
              )}

              {/* CALIBRATION STATUS OVERLAY */}
              <div className="absolute top-8 right-4 bg-black/80 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[7px] font-mono tracking-widest text-zinc-400 uppercase z-20">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                CALIBRATED
              </div>

              {/* SPATIAL ANCHOR DESYNC EFFECT */}
              {spatialGlitchActive && (
                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm z-30 flex items-center justify-center">
                  <div className="text-center p-3 bg-black border border-red-500/30 rounded-2xl max-w-[200px]">
                    <AlertTriangle className="text-red-500 w-6 h-6 mx-auto mb-1 animate-bounce" />
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">SPATIAL DESYNC</div>
                    <div className="text-[7px] text-zinc-500 uppercase mt-1 leading-normal">Re-aligning core gravity vectors...</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC DIAGNOSTIC PANEL (SLIDERS CHANGE ACCORDING TO DEVICE MODE) */}
          <div className="mt-3 bg-zinc-950/60 p-4 rounded-2xl border border-white/5 shrink-0">
            <h4 className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Sliders size={12} className="text-fuchsia-400" />
              {deviceType === 'vr_headset' ? 'Quest 3S Engine Config' : deviceType === 'android_14' ? 'Android 14 ARCore Diagnostics' : 'Android 16 Quantum OS Diagnostics'}
            </h4>

            <div className="grid grid-cols-3 gap-4">
              {/* SLIDER A: DEPENDS ON DEVICE */}
              {deviceType === 'vr_headset' ? (
                <div>
                  <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                    <span>IPD Lens Calibration</span>
                    <span className="text-fuchsia-400">{ipdCalibration} mm</span>
                  </div>
                  <input 
                    type="range"
                    min="58"
                    max="72"
                    value={ipdCalibration}
                    onChange={e => setIpdCalibration(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-500"
                  />
                </div>
              ) : deviceType === 'android_14' ? (
                <div>
                  <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                    <span>Plane Recognition Rate</span>
                    <span className="text-amber-400">{planeDetectionSpeed} Hz</span>
                  </div>
                  <input 
                    type="range"
                    min="20"
                    max="120"
                    value={planeDetectionSpeed}
                    onChange={e => setPlaneDetectionSpeed(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                    <span>Neural Link Sync</span>
                    <span className="text-cyan-400">{neuralAccuracy}%</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="100"
                    value={neuralAccuracy}
                    onChange={e => setNeuralAccuracy(parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              )}

              {/* SLIDER B: DEPTH RANGE */}
              <div>
                <div className="flex items-center justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
                  <span>ToF Depth Sensitivity</span>
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

              {/* CONTROL C: DEVICE SPECIFIC TOGGLES */}
              {deviceType === 'vr_headset' ? (
                <div className="flex items-center justify-between pl-4 border-l border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Stereoscopic (3D)</span>
                    <span className="text-[7px] text-zinc-600 uppercase mt-0.5">Dual-eye rendering</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowStereoscopic(!showStereoscopic);
                      try { soundService.playSFX('ui_click'); } catch(e){}
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      showStereoscopic ? 'bg-fuchsia-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      showStereoscopic ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ) : deviceType === 'android_14' ? (
                <div className="flex items-center justify-between pl-4 border-l border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Web Camera feed</span>
                    <span className="text-[7px] text-zinc-600 uppercase mt-0.5">Integrate webcam</span>
                  </div>
                  <button
                    onClick={() => {
                      setUseRealCamera(!useRealCamera);
                      try { soundService.playSFX('ui_click'); } catch(e){}
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      useRealCamera ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      useRealCamera ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pl-4 border-l border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">UWB Spatial Mapping</span>
                    <span className="text-[7px] text-zinc-600 uppercase mt-0.5">Ultra-Wideband 3D scans</span>
                  </div>
                  <button
                    onClick={() => {
                      setUwbEnabled(!uwbEnabled);
                      try { soundService.playSFX('ui_click'); } catch(e){}
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      uwbEnabled ? 'bg-cyan-400' : 'bg-zinc-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      uwbEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: QUEST 3S MIXED REALITY APPLICATIONS DIRECTORY */}
        <div className="col-span-5 bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 shrink-0">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Monitor size={14} className="text-fuchsia-400" />
              Quest 3S MR App Directory
            </h3>
            <span className="text-[9px] font-mono font-bold text-cyan-400">7 VR Apps Configured</span>
          </div>

          {/* SENSE LAB CATALOG LIST */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0 mb-3">
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

            <div className="p-2.5 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl">
              <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Info size={11} />
                Quest 3S MR Fact Sheet
              </span>
              <p className="text-[9px] leading-relaxed text-zinc-500 uppercase">
                {selectedApp.funFact}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleToggleGlitch}
                className="flex-1 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-[9px] font-black text-zinc-400 uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Simulate Spatial Desync
              </button>
              
              <button
                onClick={handleInjectTelemetry}
                className="flex-1 py-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-black text-[9px] font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={11} />
                {telemetryInjected ? 'Telemetry Injected!' : 'Inject MR Telemetry'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER METRICS BAR */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 tracking-wider shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className="text-cyan-500 animate-spin" style={{ animationDuration: '10s' }} />
            {deviceType === 'vr_headset' ? (
              <>Quest 3S Chipset: <strong className="text-white">Snapdragon XR2 Gen 2</strong></>
            ) : deviceType === 'android_14' ? (
              <>Android 14 API level: <strong className="text-white">ARCore Framework v1.42</strong></>
            ) : (
              <>Android 16 Quantum: <strong className="text-cyan-300">Neural Quantum Engine v2</strong></>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Sliders size={13} className="text-amber-500" />
            Sensor Frequency: <strong className="text-white">{deviceType === 'vr_headset' ? `${refreshRate}Hz Refresh Rate` : deviceType === 'android_14' ? '60Hz Gyro Sync' : '240Hz Ultra-Wideband'}</strong>
          </span>
        </div>
        <div>
          Hardware Alignment Level: <strong className="text-emerald-400">100% PERFECT SYNCHRONIZATION</strong>
        </div>
      </div>
    </motion.div>
  );
}
