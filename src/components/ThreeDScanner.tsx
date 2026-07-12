import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Camera, Sparkles, X, RotateCcw, Sliders, Download, 
  Layers, Package, RefreshCw, Zap, Maximize2, Minimize2, 
  Check, Play, HelpCircle, HardDrive, Smartphone, Monitor, AlertCircle, Eye, Hammer, Activity
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { useGameStore } from '../store';

// Procedural Object Definitions
type ModelType = 'droid' | 'sword' | 'crypt' | 'cyber_cup';

interface ModelInfo {
  id: ModelType;
  name: string;
  category: string;
  baseVertices: number;
  baseFaces: number;
  complexity: 'High' | 'Medium' | 'Low';
  description: string;
  nominalDimensions: { x: number; y: number; z: number }; // In millimeters
}

const LIVE_MODELS: ModelInfo[] = [
  {
    id: 'droid',
    name: 'T-X9 Scout Droid',
    category: 'Mechanical',
    baseVertices: 1840,
    baseFaces: 3620,
    complexity: 'High',
    description: 'A tactical floating scan drone with curved outer panels and multiple core gears.',
    nominalDimensions: { x: 75, y: 75, z: 92 }
  },
  {
    id: 'sword',
    name: 'Vortex Light Saber',
    category: 'Relic Weapon',
    baseVertices: 1210,
    baseFaces: 2420,
    complexity: 'Medium',
    description: 'An energy-channeling hilt with modular focusing rings and handguards.',
    nominalDimensions: { x: 42, y: 42, z: 280 }
  },
  {
    id: 'crypt',
    name: 'Quantum Relic Crystal',
    category: 'Artifact',
    baseVertices: 960,
    baseFaces: 1880,
    complexity: 'Medium',
    description: 'An alien energy monolith with sharp octahedral facets and layered crystalline lattices.',
    nominalDimensions: { x: 60, y: 120, z: 60 }
  },
  {
    id: 'cyber_cup',
    name: 'Neo Mug v4.0',
    category: 'Industrial',
    baseVertices: 840,
    baseFaces: 1680,
    complexity: 'Low',
    description: 'Double-walled thermo-electric container with integrated handle and power nodes.',
    nominalDimensions: { x: 80, y: 110, z: 95 }
  }
];

// Laser Scanline Visualizer
function ScanningLaser({ active }: { active: boolean }) {
  const lineRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!active || !lineRef.current) return;
    const t = state.clock.getElapsedTime();
    // Move up and down between -2 and 2
    lineRef.current.position.y = Math.sin(t * 3.5) * 1.5;
  });

  if (!active) return null;

  return (
    <group ref={lineRef}>
      {/* Laser line plane mesh/line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Outer bright ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.0, 64]} />
        <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Support Structures Renderer under the model
function SupportPillars({ enabled, scaleX, scaleY, scaleZ, density, modelType }: { 
  enabled: boolean; 
  scaleX: number; 
  scaleY: number; 
  scaleZ: number;
  density: number;
  modelType: ModelType;
}) {
  if (!enabled) return null;

  // We place support columns representing an overhang setup.
  // We'll place pillars at different overhang locations under the model
  const positions: [number, number, number][] = [];
  
  if (modelType === 'droid') {
    // Scaffold under the wings/bottom sphere
    const offset = density > 30 ? 4 : 2;
    for (let i = 0; i < offset; i++) {
      const angle = (i / offset) * Math.PI * 2;
      positions.push([Math.cos(angle) * 1.0 * scaleX, -0.6 * scaleY, Math.sin(angle) * 1.0 * scaleZ]);
    }
  } else if (modelType === 'sword') {
    // under handguard and grip hilt
    positions.push([0, -0.5 * scaleY, 0]);
    positions.push([0.6 * scaleX, -0.8 * scaleY, 0]);
    positions.push([-0.6 * scaleX, -0.8 * scaleY, 0]);
  } else if (modelType === 'crypt') {
    // Under the bottom slants
    positions.push([0.4 * scaleX, -0.7 * scaleY, 0.4 * scaleZ]);
    positions.push([-0.4 * scaleX, -0.7 * scaleY, -0.4 * scaleZ]);
  } else {
    // cyber_cup handle support and base support
    positions.push([0.9 * scaleX, -0.4 * scaleY, 0]);
    positions.push([0.9 * scaleX, -0.8 * scaleY, 0]);
    positions.push([0, -0.9 * scaleY, 0.5 * scaleZ]);
  }

  return (
    <group>
      {positions.map((pos, idx) => {
        const pillarHeight = Math.abs(pos[1] - (-1.8)); // from pos[1] down to floor level
        const yPos = pos[1] - pillarHeight / 2;
        return (
          <group key={idx} position={[pos[0], yPos, pos[2]]}>
            <Cylinder args={[0.06, 0.08, pillarHeight, 8]}>
              <meshStandardMaterial 
                color="#f97316" 
                emissive="#ea580c" 
                emissiveIntensity={1.5} 
                wireframe={true} 
              />
            </Cylinder>
            {/* Supporting tree branch branching top */}
            <Cylinder args={[0.12, 0.06, 0.15, 8]} position={[0, pillarHeight/2, 0]}>
              <meshStandardMaterial color="#ea580c" wireframe />
            </Cylinder>
          </group>
        );
      })}
    </group>
  );
}

// Scanned Object Renderer (Procedural geometries that we animate & sculpt)
interface InteractiveModelProps {
  modelType: ModelType;
  decimation: number;
  sculptNoise: number[];
  repairedHoles: boolean;
  textureCaptured: boolean;
  wireframe: boolean;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  supportEnabled: boolean;
  supportDensity: number;
  onPointClick?: (index: number) => void;
}

const InteractiveModel = ({
  modelType,
  decimation,
  sculptNoise,
  repairedHoles,
  textureCaptured,
  wireframe,
  scaleX,
  scaleY,
  scaleZ,
  supportEnabled,
  supportDensity,
  onPointClick
}: InteractiveModelProps) => {

  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation overlay
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  // Decide the material color/texture
  const matProps = useMemo(() => {
    if (textureCaptured) {
      if (modelType === 'droid') {
        return {
          color: '#10b981',
          roughness: 0.1,
          metalness: 0.8,
          emissive: '#047857',
          emissiveIntensity: 0.2
        };
      } else if (modelType === 'sword') {
        return {
          color: '#a855f7',
          roughness: 0.2,
          metalness: 0.9,
          emissive: '#d8b4fe',
          emissiveIntensity: 0.4
        };
      } else if (modelType === 'crypt') {
        return {
          color: '#ec4899',
          roughness: 0.05,
          metalness: 0.1,
          emissive: '#f472b6',
          emissiveIntensity: 0.6
        };
      } else {
        return {
          color: '#f59e0b',
          roughness: 0.4,
          metalness: 0.5,
          emissive: '#b45309',
          emissiveIntensity: 0.1
        };
      }
    } else {
      // Standard clay laser scan material
      return {
        color: '#d1d5db',
        roughness: 0.8,
        metalness: 0.0,
        emissive: '#0369a1',
        emissiveIntensity: 0.05
      };
    }
  }, [textureCaptured, modelType]);

  // Adjust wireframe opacity / mesh complexity display
  const decimationFactor = decimation / 100;

  return (
    <group ref={groupRef} scale={[scaleX, scaleY, scaleZ]} position={[0, 0, 0]}>
      {/* 1. Droid procedural parts */}
      {modelType === 'droid' && (
        <group>
          {/* Main dome body */}
          <Sphere args={[0.8, Math.max(4, Math.floor(32 * decimationFactor)), Math.max(4, Math.floor(32 * decimationFactor))]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Sphere>
          {/* Gimbals/thrusters */}
          <group position={[0.9, 0, 0]}>
            <Cylinder args={[0.2, 0.2, 0.4, Math.max(4, Math.floor(16 * decimationFactor))]}>
              <meshStandardMaterial {...matProps} wireframe={wireframe} />
            </Cylinder>
          </group>
          <group position={[-0.9, 0, 0]}>
            <Cylinder args={[0.2, 0.2, 0.4, Math.max(4, Math.floor(16 * decimationFactor))]}>
              <meshStandardMaterial {...matProps} wireframe={wireframe} />
            </Cylinder>
          </group>
          {/* Top radar sensor dish */}
          <Cylinder args={[0.4, 0.1, 0.2, Math.max(4, Math.floor(16 * decimationFactor))]} position={[0, 0.8, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          {/* Scanning camera orb */}
          <Sphere args={[0.18, 16, 16]} position={[0, 0.4, 0.65]}>
            <meshBasicMaterial color="#38bdf8" wireframe={wireframe} />
          </Sphere>
          {/* Displaying sculpted noise on meshes */}
          {sculptNoise.length > 0 && (
            <Sphere args={[0.25, 8, 8]} position={[0.4, 0.3, 0.45]}>
              <meshStandardMaterial color="#0284c7" wireframe={wireframe} />
            </Sphere>
          )}
          {/* Unrepaired scan holes indicator (red wireframe gaps) */}
          {!repairedHoles && (
            <group position={[0, -0.6, 0.4]} scale={0.25}>
              <Box args={[1, 1, 1]}>
                <meshStandardMaterial color="#ef4444" wireframe={true} />
              </Box>
            </group>
          )}
        </group>
      )}

      {/* 2. Light Saber Sword parts */}
      {modelType === 'sword' && (
        <group>
          {/* Hilt */}
          <Cylinder args={[0.15, 0.15, 1.2, Math.max(4, Math.floor(20 * decimationFactor))]} position={[0, -0.6, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          {/* Focusing guards/Emitter ring */}
          <Cylinder args={[0.22, 0.25, 0.3, Math.max(4, Math.floor(16 * decimationFactor))]} position={[0, 0.1, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          {/* Laser blade glow */}
          <Cylinder args={[0.08, 0.08, 2.2, Math.max(4, Math.floor(12 * decimationFactor))]} position={[0, 1.3, 0]}>
            <meshStandardMaterial 
              color={textureCaptured ? "#38bdf8" : "#9ca3af"} 
              emissive={textureCaptured ? "#0ea5e9" : "#4b5563"} 
              emissiveIntensity={textureCaptured ? 2.5 : 0.2}
              wireframe={wireframe} 
            />
          </Cylinder>
          {/* Modular cross guard */}
          <Box args={[0.6, 0.15, 0.15]} position={[0, -0.05, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Box>
          {!repairedHoles && (
            <group position={[0, -0.9, 0.15]} scale={0.12}>
              <Box args={[1, 1, 1]}>
                <meshStandardMaterial color="#ef4444" wireframe={true} />
              </Box>
            </group>
          )}
        </group>
      )}

      {/* 3. Quantum Cystal parts */}
      {modelType === 'crypt' && (
        <group>
          {/* Faceted Crystal Lattice shape using procedural columns */}
          <Cylinder args={[0.01, 0.55, 1.6, Math.max(5, Math.floor(8 * decimationFactor))]} position={[0, 0, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          <Cylinder args={[0.55, 0.01, 0.6, Math.max(5, Math.floor(8 * decimationFactor))]} position={[0, -0.9, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          {/* Nested smaller inner core crystals */}
          <group scale={0.4} position={[0, 0, 0]}>
            <Cylinder args={[0.1, 0.6, 1.8, 6]}>
              <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={2} wireframe={wireframe} />
            </Cylinder>
          </group>
          {sculptNoise.length > 0 && (
            <Box args={[0.2, 0.2, 0.2]} position={[0.2, 0.4, 0.2]}>
              <meshStandardMaterial color="#db2777" wireframe={wireframe} />
            </Box>
          )}
          {!repairedHoles && (
            <group position={[-0.3, -0.4, 0.3]} scale={0.18}>
              <Box args={[1, 1, 1]}>
                <meshStandardMaterial color="#ef4444" wireframe={true} />
              </Box>
            </group>
          )}
        </group>
      )}

      {/* 4. Thermo Cup parts */}
      {modelType === 'cyber_cup' && (
        <group>
          {/* Main outer hollow cylinder cup */}
          <Cylinder args={[0.5, 0.45, 1.2, Math.max(4, Math.floor(24 * decimationFactor))]} position={[0, 0, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Cylinder>
          {/* Grip handle */}
          <Box args={[0.12, 0.8, 0.5]} position={[0.5, 0, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Box>
          {/* Grip connect top */}
          <Box args={[0.4, 0.1, 0.12]} position={[0.3, 0.35, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Box>
          {/* Grip connect bottom */}
          <Box args={[0.4, 0.1, 0.12]} position={[0.3, -0.35, 0]}>
            <meshStandardMaterial {...matProps} wireframe={wireframe} />
          </Box>
          {sculptNoise.length > 0 && (
            <Sphere args={[0.15, 10, 10]} position={[-0.35, 0.2, 0.3]}>
              <meshStandardMaterial color="#ea580c" wireframe={wireframe} />
            </Sphere>
          )}
          {!repairedHoles && (
            <group position={[-0.45, -0.4, 0.2]} scale={0.18}>
              <Box args={[1, 1, 1]}>
                <meshStandardMaterial color="#ef4444" wireframe={true} />
              </Box>
            </group>
          )}
        </group>
      )}

      {/* Render support columns if printing supports toggled */}
      <SupportPillars 
        enabled={supportEnabled} 
        scaleX={scaleX} 
        scaleY={scaleY} 
        scaleZ={scaleZ} 
        density={supportDensity}
        modelType={modelType}
      />
    </group>
  );
};

export function ThreeDScanner({ onClose }: { onClose: () => void }) {
  // Master states
  const [activeModel, setActiveModel] = useState<ModelType>('droid');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([
    'System init: ToF Sensors calibrated.',
    'Ready for spatial scan acquisition.'
  ]);

  const [blenderStatus, setBlenderStatus] = useState<{
    exists: boolean;
    isPlaceholder: boolean;
    isValidZip: boolean;
    size?: number;
    message?: string;
  } | null>(null);

  const checkBlenderStatus = async () => {
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      if (data.success) {
        setBlenderStatus({
          exists: data.exists,
          isPlaceholder: data.isPlaceholder,
          isValidZip: data.isValidZip,
          size: data.size,
          message: data.message
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkBlenderStatus();
    const interval = setInterval(checkBlenderStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Custom Controls
  const [wireframe, setWireframe] = useState(false);
  const [textureCaptured, setTextureCaptured] = useState(false);
  const [decimation, setDecimation] = useState(100); // 100% (High Poly) - 10% (Low Poly)
  const [repairedHoles, setRepairedHoles] = useState(false);
  const [sculptNoise, setSculptNoise] = useState<number[]>([]);
  const [brushIntensity, setBrushIntensity] = useState(50);
  const [brushSize, setBrushSize] = useState(30);

  // Print settings
  const [supportEnabled, setSupportEnabled] = useState(false);
  const [supportDensity, setSupportDensity] = useState(35);
  const [dimSettings, setDimSettings] = useState({ x: 75, y: 75, z: 92 });

  // AR Settings
  const [isARMode, setIsARMode] = useState(false);
  const [arPermission, setArPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'editor' | 'print'>('scanner');
  const [arPlacement, setArPlacement] = useState({ scale: 1.0, rotateY: 0, x: 0, z: -3 });

  // Keep logs tracking
  const pushLog = (log: string) => {
    setScanLogs(prev => [log, ...prev].slice(0, 8));
  };

  // Find info
  const modelInfo = useMemo(() => {
    return LIVE_MODELS.find(m => m.id === activeModel)!;
  }, [activeModel]);

  // Handle Model switch
  const selectModel = (id: ModelType) => {
    if (scanning) return;
    setActiveModel(id);
    setScanned(false);
    setScanProgress(0);
    setSculptNoise([]);
    setRepairedHoles(false);
    setTextureCaptured(false);
    
    const nextModel = LIVE_MODELS.find(m => m.id === id)!;
    setDimSettings({ ...nextModel.nominalDimensions });

    pushLog(`Target altered: Selected ${nextModel.name} (${nextModel.category})`);
    soundService.playSFX('ui_tab');
  };

  // Handle start scanning animation
  const handleStartScan = async () => {
    if (scanning) return;

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
      pushLog(`[ERROR] 🔒 SCAN ENGINE LOCKED!`);
      pushLog(`[SYSTEM] Missing or invalid /blender.zip.`);
      pushLog(`[SYSTEM] Please replace /blender.zip with a real Blender .zip model.`);
      try {
        soundService.playSFX('hit');
      } catch (e) {}
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setScanned(false);
    pushLog(`[SUCCESS] 🔓 Blender model detected (${(zipSize / 1024).toFixed(1)} KB)!`);
    pushLog(`Initiating laser matrix projection...`);
    soundService.playSFX('ui_click');

    const updateInterval = 80; // step ticks
    const scanTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanTimer);
          setScanning(false);
          setScanned(true);
          setTextureCaptured(true); // Automatically capture basic shader colors upon complete
          pushLog(`Mesh reconstruction finalized: ${modelInfo.baseVertices} vertices, ${modelInfo.baseFaces} indices mapped.`);
          soundService.playSFX('achievement');
          return 100;
        }
        
        // Log milestone triggers
        if (prev === 20) pushLog(`Phase lock: Point cloud extraction complete.`);
        if (prev === 50) pushLog(`Acquiring texture color buffers (RGBD channel)...`);
        if (prev === 80) pushLog(`Deploying Poisson surface solver algorithm.`);

        return prev + 2;
      });
    }, updateInterval);
  };

  // Advanced editor functions
  const triggerSculpt = () => {
    if (!scanned) return;
    setSculptNoise([1, 2, 3]);
    pushLog(`Sculpt brush applied: Displaced vertices by ${brushIntensity / 10}mm.`);
    soundService.playSFX('ui_click');
  };

  const triggerSmooth = () => {
    if (!scanned) return;
    setSculptNoise([]);
    pushLog(`Laplacian Smoothing filter: Surface geometry variance reduced by 40%.`);
    soundService.playSFX('ui_click');
  };

  const triggerHoleFill = () => {
    if (!scanned) return;
    setRepairedHoles(true);
    pushLog(`Hole-filling solver: Filled 3 scanner occlusion apertures. Mesh is now fully Watertight (solid).`);
    soundService.playSFX('achievement');
  };

  // Automated Support generation calculation
  const triggerSupportGen = () => {
    setSupportEnabled(!supportEnabled);
    if (!supportEnabled) {
      pushLog(`Auto-supports added: Branching pillars placed beneath structural overhang bounds.`);
      soundService.playSFX('powerup');
    } else {
      pushLog(`Print support structures cleared.`);
    }
  };

  // Real device MediaStream activation for AR view screen
  const startARCamera = async () => {
    try {
      pushLog(`Requesting optical video camera capture feed...`);
      setArPermission('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error(e));
      }
      setArPermission('granted');
      pushLog(`Webcam feed active. AR Core overlay mounted successfully.`);
    } catch (err) {
      console.warn("Camera failed to acquire: ", err);
      setArPermission('denied');
      pushLog(`Optic exception: Frame camera blocked. Using simulated holographic terminal scene.`);
    }
  };

  const stopARCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setArPermission('prompt');
  };

  useEffect(() => {
    if (isARMode) {
      startARCamera();
    } else {
      stopARCamera();
    }
    return () => stopARCamera();
  }, [isARMode]);

  // Procedural Export of OBJ + MTL code
  const triggerDownloadModel = () => {
    if (!scanned) return;
    pushLog(`Bundling 3D files: Preparing OBJ structure and MTL shader descriptors...`);
    soundService.playSFX('quest_complete');

    // Create Obj string
    let obj = `# Compiled with NeonArena-v1 Spatial MultiScan Utility\n`;
    obj += `# Model name: ${modelInfo.name}\n`;
    obj += `# Real physical scale: ${dimSettings.x}mm x ${dimSettings.y}mm x ${dimSettings.z}mm\n`;
    obj += `mtllib ${modelInfo.id}.mtl\n\n`;

    // Write simple vertices based on size
    const sx = dimSettings.x / 100;
    const sy = dimSettings.y / 100;
    const sz = dimSettings.z / 100;
    
    // Add box bounds vertices
    obj += `v ${-0.5 * sx} ${-0.5 * sy} ${-0.5 * sz}\n`;
    obj += `v ${0.5 * sx} ${-0.5 * sy} ${-0.5 * sz}\n`;
    obj += `v ${0.5 * sx} ${0.5 * sy} ${-0.5 * sz}\n`;
    obj += `v ${-0.5 * sx} ${0.5 * sy} ${-0.5 * sz}\n`;
    obj += `v ${-0.5 * sx} ${-0.5 * sy} ${0.5 * sz}\n`;
    obj += `v ${0.5 * sx} ${-0.5 * sy} ${0.5 * sz}\n`;
    obj += `v ${0.5 * sx} ${0.5 * sy} ${0.5 * sz}\n`;
    obj += `v ${-0.5 * sx} ${0.5 * sy} ${0.5 * sz}\n`;
    
    // Write faces
    obj += `\nusemtl MainMaterial\n`;
    obj += `f 1 2 3 4\n`;
    obj += `f 5 6 7 8\n`;
    obj += `f 1 2 6 5\n`;
    obj += `f 2 3 7 6\n`;
    obj += `f 3 4 8 7\n`;
    obj += `f 4 1 5 8\n`;

    // Create MTL String
    let mtl = `# Material Library\n`;
    mtl += `newmtl MainMaterial\n`;
    mtl += `Ka 0.2000 0.2000 0.2000\n`;
    if (modelInfo.id === 'droid') {
      mtl += `Kd 0.0620 0.7250 0.5050\n`; // green
    } else if (modelInfo.id === 'sword') {
      mtl += `Kd 0.6580 0.3330 0.9680\n`; // purple
    } else {
      mtl += `Kd 0.9250 0.6200 0.0400\n`; // amber
    }
    mtl += `Ks 1.0000 1.0000 1.0000\n`;
    mtl += `Ns 120.0000\n`;
    mtl += `illum 2\n`;

    // Trigger double downlods safely
    const objBlob = new Blob([obj], { type: 'text/plain' });
    const objUrl = URL.createObjectURL(objBlob);
    const objLink = document.createElement('a');
    objLink.href = objUrl;
    objLink.download = `${modelInfo.id}_surface_mesh.obj`;
    
    const mtlBlob = new Blob([mtl], { type: 'text/plain' });
    const mtlUrl = URL.createObjectURL(mtlBlob);
    const mtlLink = document.createElement('a');
    mtlLink.href = mtlUrl;
    mtlLink.download = `${modelInfo.id}.mtl`;

    // Download both files with delayed interval
    objLink.click();
    setTimeout(() => {
      mtlLink.click();
      pushLog(`Assets downloaded: Export parameters aligned directly for phone & slicer software.`);
    }, 250);
  };

  const triggerCopyWorldToMap = () => {
    if (!scanned) return;
    try {
      const storeState = useGameStore.getState();
      const scColor = activeModel === 'droid' 
        ? '#00e5ff' // cyberpunk neon cyan
        : activeModel === 'sword' 
          ? '#c084fc' // glowing lavender purple
          : activeModel === 'crypt' 
            ? '#f43f5e' // deep neon pink
            : '#fbbf24'; // molten gold
            
      storeState.setScannedModel({
        scannedModelType: activeModel,
        scannedModelColor: scColor,
        scannedModelScale: {
          x: dimSettings.x / modelInfo.nominalDimensions.x,
          y: dimSettings.y / modelInfo.nominalDimensions.y,
          z: dimSettings.z / modelInfo.nominalDimensions.z,
        },
        scannedModelDecimation: decimation,
        scannedModelTextureCaptured: textureCaptured,
        scannedModelRepairedHoles: repairedHoles,
        scannedModelSupportEnabled: supportEnabled,
      });
      
      // Set map type and state
      storeState.setMap('custom_scan');
      if (storeState.gameState !== 'playing' && storeState.gameState !== 'open_world') {
        storeState.setGameState('playing');
      }
      
      // Alert event log feeds
      storeState.addEvent(`3D COPY: Generated new '${modelInfo.name}' battlefield with detailed textures!`);
      soundService.playSFX('quest_complete');
      onClose();
    } catch (e) {
      console.error(e);
      pushLog("Integrity Error: Connection to main world state timeline failed.");
    }
  };

  const getSubVertices = () => {
    return Math.floor(modelInfo.baseVertices * (decimation / 100));
  };

  const getSubFaces = () => {
    return Math.floor(modelInfo.baseFaces * (decimation / 100));
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-[130] flex items-center justify-center p-4 backdrop-blur-2xl overflow-hidden text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-zinc-950 border border-white/10 w-full max-w-7xl h-[95vh] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative"
      >
        
        {/* TOP STATUS HEADER BAR */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-gradient-to-r from-sky-950/20 via-black to-zinc-950">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-xl animate-pulse">
              <Camera size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold bg-sky-600 px-2 py-0.5 rounded text-black tracking-widest font-mono">CORE FLM-10</span>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] font-mono">MULTIPLATFORM 3D ACQUISITION</span>
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none mt-1">
                LIDAR & PHOTO-SOLVER STUDIO
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Platform detection indicator */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-white/60">
              <Monitor size={14} className="text-sky-400" />
              <span className="text-[10px] font-bold tracking-widest font-mono">PC ACCELERATOR</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-white/60">
              <Smartphone size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest font-mono">MOBILE LINK READY</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-3.5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* WORKSPACE DIVIDER GRID */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT PANEL - OBJECTS & SOURCE MODEL TELEMETRY */}
          <div className="w-80 border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* MODEL SELECT LIST */}
            <div>
              <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">SELECT PHYSICAL OBJECT</h3>
              <div className="space-y-2.5">
                {LIVE_MODELS.map((model) => {
                  const isCur = activeModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => selectModel(model.id)}
                      className={`w-full text-left p-3.5 rounded-2.5xl border transition-all flex flex-col gap-1.5 ${
                        isCur 
                          ? 'bg-sky-600/10 border-sky-500 shadow-[0_0_20px_rgba(3,105,161,0.25)] text-white' 
                          : 'bg-white/5 border-white/5 hover:border-white/15 text-white/60'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-xs font-black uppercase leading-none">{model.name}</span>
                        <span className={`text-[8px] px-1.5 font-bold font-mono rounded ${
                          model.complexity === 'High' ? 'bg-red-500/20 text-red-400' :
                          model.complexity === 'Medium' ? 'bg-amber-400/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>{model.complexity}</span>
                      </div>
                      <p className="text-[10px] opacity-70 leading-relaxed font-mono line-clamp-2">{model.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIVE LASER FEED TELEMETRY CARD */}
            <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-sky-400 animate-ping' : scanned ? 'bg-emerald-400' : 'bg-white/30'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-white/40">Acquisition Sensors</span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-black/40 p-2.5 rounded-xl">
                  <div className="text-[8px] text-white/30">VERTICES</div>
                  <div className="text-sm font-black mt-1 text-sky-400">{scanned ? getSubVertices() : '0000'}</div>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl">
                  <div className="text-[8px] text-white/30">POLYGONS</div>
                  <div className="text-sm font-black mt-1 text-sky-400">{scanned ? getSubFaces() : '0000'}</div>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl">
                  <div className="text-[8px] text-white/30">SCAN DEPTH</div>
                  <div className="text-[11px] font-black mt-1 text-white">{scanned ? "ToF + RGB-S" : "NONE"}</div>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl">
                  <div className="text-[8px] text-white/30">TOPOLOGY</div>
                  <div className="text-[11px] font-black mt-1 text-white">{decimation}% RATIO</div>
                </div>
              </div>
            </div>

            {/* SCANNING SOLVER CONTROL BUTTONS */}
            <div className="mt-auto">
              {!scanned && (
                <button
                  onClick={handleStartScan}
                  disabled={scanning}
                  className={`w-full py-4 rounded-2.5xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all ${
                    scanning 
                      ? 'bg-zinc-800 text-white/40 cursor-not-allowed border border-white/5' 
                      : 'bg-sky-500 hover:bg-sky-400 text-black shadow-[0_4px_30px_rgba(3,105,161,0.4)]'
                  }`}
                >
                  {scanning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Capturing {scanProgress}%
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      project scan lattice
                    </>
                  )}
                </button>
              )}

              {scanned && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setScanned(false); setScanProgress(0); setRepairedHoles(false); setSculptNoise([]); pushLog(`Acquisition cleared. Ready for next capture.`); }}
                      className="flex-1 py-3 bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl font-black uppercase tracking-widest text-[9px] text-center"
                    >
                      re-scan laser
                    </button>
                    <button
                      onClick={triggerDownloadModel}
                      className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-black rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(3,105,161,0.3)]"
                    >
                      <Download size={10} />
                      export mesh
                    </button>
                  </div>
                  <button
                    onClick={() => { setIsARMode(true); pushLog(`Initializing camera portal for holographic live AR placement.`); }}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                  >
                    <Eye size={12} />
                    View in Real-World [AR Mode]
                  </button>
                  
                  <button
                    onClick={triggerCopyWorldToMap}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.4)] animate-pulse cursor-pointer"
                  >
                    <Layers size={12} />
                    Copy World to Arena Map
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* CENTRAL GRAPHIC FEED - 3D CANVAS & AR VIEWPORT */}
          <div className="flex-1 flex flex-col relative bg-zinc-950">
            
            {/* SUB-TABS INTERACTIVE CONTROLLER (SCAN / EDIT / PRINT) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 border border-white/10 p-1 rounded-2.5xl backdrop-blur-xl flex gap-1 shadow-lg font-mono">
              <button
                onClick={() => setActiveSubTab('scanner')}
                className={`px-5 py-2 rounded-2xl font-bold uppercase text-[9px] tracking-widest transition-all ${
                  activeSubTab === 'scanner' ? 'bg-sky-500 text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                1. Point Scanner
              </button>
              <button
                onClick={() => { 
                  if (!scanned) pushLog(`Spatial Alert: Please scan the object first before accessing sculpt features.`);
                  setActiveSubTab('editor'); 
                }}
                className={`px-5 py-2 rounded-2xl font-bold uppercase text-[9px] tracking-widest transition-all ${
                  activeSubTab === 'editor' ? 'bg-sky-500 text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                2. Topology & Sculpt
              </button>
              <button
                onClick={() => { 
                  if (!scanned) pushLog(`Spatial Alert: Scan required to calibrate printable dimensions.`);
                  setActiveSubTab('print'); 
                }}
                className={`px-5 py-2 rounded-2xl font-bold uppercase text-[9px] tracking-widest transition-all ${
                  activeSubTab === 'print' ? 'bg-sky-500 text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                3. Print & Supports
              </button>
            </div>

            {/* CANVAS INTERACTIVE PORTAL BOUNDS */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. AR OPTICAL OVERLAY CAM VIEWPORT */}
                {isARMode ? (
                  <motion.div 
                    key="ar-sandbox"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex flex-col bg-black overflow-hidden"
                  >
                    {/* Live device HTML5 video feed */}
                    <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80" 
                      playsInline 
                      muted 
                    />

                    {/* Holographic grid matrix HUD */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-sky-500/5 to-transparent flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div className="bg-black/70 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur">
                          <div className="text-[8px] font-black tracking-widest text-[#38bdf8]">AR CAMERA CALIBRATION</div>
                          <div className="text-xs font-bold font-mono tracking-tighter mt-1">{arPermission === 'granted' ? 'STABLE TRACKING' : 'VIRTUAL OPTICS ENGAGED'}</div>
                        </div>
                        <button
                          onClick={() => { setIsARMode(false); pushLog(`AR optical portal deactivated.`); }}
                          className="p-3 bg-black/70 border border-white/10 rounded-xl pointer-events-auto text-white/75 hover:text-white"
                        >
                          <Minimize2 size={16} />
                        </button>
                      </div>

                      {/* Floating Placement instructions */}
                      <div className="self-center flex flex-col items-center bg-black/80 border border-emerald-500/30 px-6 py-4 rounded-[2rem] text-center max-w-sm pointer-events-auto">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-bounce">
                          <Maximize2 size={16} />
                        </div>
                        <h4 className="font-mono text-xs font-black uppercase text-white mt-1.5">Optical Placement Active</h4>
                        <p className="text-[9px] text-white/50 leading-relaxed font-mono mt-1">Adjust scale and rotation via right panels to view model at 1:1 scale on desk surface or floor.</p>
                      </div>

                      {/* AR Camera bottom data readouts */}
                      <div className="flex justify-between font-mono text-[8px] font-bold text-white/30 uppercase">
                        <div>GPS POS: 34.0522 // -118.2437</div>
                        <div>FRAMES: 60 FPS // HD-LIDAR </div>
                      </div>
                    </div>

                    {/* Three Fiber Live Render on Camera */}
                    <div className="absolute inset-0">
                      <Canvas camera={{ position: [0, 0.4, 3], fov: 65 }}>
                        <ambientLight intensity={0.8} />
                        <pointLight position={[5, 5, 5]} intensity={1.5} />
                        <OrbitControls />
                        
                        <group position={[arPlacement.x, -0.4, arPlacement.z]} rotation={[0, arPlacement.rotateY, 0]} scale={arPlacement.scale}>
                          <InteractiveModel
                            modelType={activeModel}
                            decimation={decimation}
                            sculptNoise={sculptNoise}
                            repairedHoles={repairedHoles}
                            textureCaptured={textureCaptured}
                            wireframe={wireframe}
                            scaleX={dimSettings.x / 100}
                            scaleY={dimSettings.y / 100}
                            scaleZ={dimSettings.z / 100}
                            supportEnabled={supportEnabled}
                            supportDensity={supportDensity}
                          />
                        </group>
                      </Canvas>
                    </div>
                  </motion.div>
                ) : (
                  
                  // 2. STANDARD SCENIC LAB PORTAL
                  <motion.div 
                    key="scanner-canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10"
                  >
                    {/* Retro matrix backdrop lines */}
                    <div className="absolute inset-0 bg-transparent opacity-10 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px)',
                      backgroundSize: '24px 24px'
                    }} />

                    {/* Laser project warning details */}
                    <div className="absolute top-20 left-6 pointer-events-none text-white/20 font-mono text-[8px] leading-relaxed">
                      <div>LATTICE ENGINE // ACTIVE: YES</div>
                      <div>DENSITY SCANNING PROJECTION</div>
                      <div>SURFACE COVARIANT SOLVER RUNNING</div>
                    </div>

                    <div className="absolute bottom-6 right-6 pointer-events-none z-10">
                      <span className="text-[10px] font-mono font-bold text-sky-400 bg-black/60 border border-white/5 py-1.5 px-3 rounded-full flex items-center gap-1.5">
                        <Activity size={10} className="animate-spin-slow text-sky-400" />
                        Interactive Orbit Active
                      </span>
                    </div>

                    {/* Interactive 3D Orbit Portal Canvas */}
                    <Canvas shadows={false} camera={{ position: [0, 0.8, 3.5], fov: 60 }} onCreated={({ scene }) => { scene.background = null; }}>
                      <ambientLight intensity={0.6} />
                      <pointLight position={[2, 4, 3]} intensity={1.8} color="#ffffff" />
                      <pointLight position={[-2, -2, -3]} intensity={0.8} color="#0284c7" />
                      
                      <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 1.8} />

                      {/* Display scanner laser grid elements */}
                      <group position={[0, -0.2, 0]}>
                        <InteractiveModel
                          modelType={activeModel}
                          decimation={decimation}
                          sculptNoise={sculptNoise}
                          repairedHoles={repairedHoles}
                          textureCaptured={textureCaptured}
                          wireframe={wireframe}
                          scaleX={dimSettings.x / 100}
                          scaleY={dimSettings.y / 100}
                          scaleZ={dimSettings.z / 100}
                          supportEnabled={supportEnabled}
                          supportDensity={supportDensity}
                        />
                        <ScanningLaser active={scanning} />
                      </group>

                      {/* Virtual Floor Grid */}
                      <gridHelper args={[8, 16, '#38bdf8', '#1e293b']} position={[0, -2.0, 0]} />
                    </Canvas>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SCANNING SOLVER PROGRESS INDICATOR BAR */}
            <AnimatePresence>
              {scanning && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="p-6 bg-zinc-950/90 border-t border-white/5 flex flex-col gap-2 relative z-40 backdrop-blur"
                >
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold flex items-center gap-2 text-[#38bdf8]">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                      LIDAR SWEEP STREAMING...
                    </span>
                    <span className="text-white/60 font-bold">{scanProgress}% COMPLETED</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-sky-600 to-sky-400" 
                      style={{ width: `${scanProgress}%` }} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT CONTROL PANEL - CONTEXTUAL MESH EDITORS & 3D PRINT PARAMETERS */}
          <div className="w-80 border-l border-white/5 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar font-mono bg-zinc-950-alt">
            
            {/* SUBTAB 1 - POINT SCAN DETAILS & TEXTURE ASSIGN */}
            {activeSubTab === 'scanner' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">CAPTURE SETTINGS</h3>
                  <div className="space-y-3.5">
                    {/* Capture textures toggle */}
                    <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-2.5xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-white">Full-RGB Textures</span>
                        <span className="text-[8px] text-white/40 leading-none mt-0.5">Save color & mapping specs</span>
                      </div>
                      <button
                        onClick={() => {
                          setTextureCaptured(!textureCaptured);
                          pushLog(textureCaptured ? `Texture cache cleaned` : `Baking textures and specular values...`);
                          soundService.playSFX('ui_click');
                        }}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all flex items-center ${
                          textureCaptured ? 'bg-sky-500 justify-end' : 'bg-white/20 justify-start'
                        }`}
                      >
                        <div className="w-4.5 h-4.5 bg-black rounded-full" />
                      </button>
                    </div>

                    {/* Display wireframe model */}
                    <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-2.5xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-white">Lattice wireframe</span>
                        <span className="text-[8px] text-white/40 leading-none mt-0.5">Toggle point connection wires</span>
                      </div>
                      <button
                        onClick={() => { setWireframe(!wireframe); soundService.playSFX('ui_click'); }}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all flex items-center ${
                          wireframe ? 'bg-sky-500 justify-end' : 'bg-white/20 justify-start'
                        }`}
                      >
                        <div className="w-4.5 h-4.5 bg-black rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* HELP GUIDE DETAILS */}
                <div className="bg-sky-500/5 border border-sky-500/15 p-5 rounded-3xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black text-sky-400">
                    <HelpCircle size={14} />
                    MULTIPLATFORM SCANNER TIPS
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed font-sans">
                    Mount the object horizontally on the testing target, tap <b>PROJECT SCAN LATTICE</b>. Calibration, baking, and alignment values calibrate automatic scaling specifications for 3D slicer systems (Cura, Prusa, etc.).
                  </p>
                </div>
              </div>
            )}

            {/* SUBTAB 2 - TOPOLOGY (DECIMATION) & TOUCH BRUSH EDITING */}
            {activeSubTab === 'editor' && (
              <div className="space-y-6">
                
                {/* DECIMATION TOPOLOGY SLIDER */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">MESH DECIMATION</h3>
                    <span className="text-xs font-black text-sky-400">{decimation}%</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-3">
                    <input 
                      type="range" 
                      min="15" 
                      max="100" 
                      value={decimation} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDecimation(val);
                        if (val % 10 === 0) soundService.playSFX('ui_hover');
                      }}
                      className="w-full accent-sky-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase">
                      <span>Low Poly Detail</span>
                      <span>Full Precision</span>
                    </div>
                  </div>
                </div>

                {/* MESH SENSORS & HOLE REPAIR */}
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">MESH INTEGRITY & HOLES</h3>
                  <div className="space-y-2.5">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold text-white">SURFACE BOUNDS</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          repairedHoles ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500 animate-pulse'
                        }`}>{repairedHoles ? 'WATERTIGHT (SOLID)' : 'APERTURES DETECTED'}</span>
                      </div>
                      <p className="text-[9px] text-white/40 leading-relaxed">
                        {!repairedHoles ? 'Red marker identifies holes in laser occlusion. Tap repair to seal triangles.' : 'Surface mesh closed successfully.'}
                      </p>
                      {!repairedHoles && (
                        <button
                          onClick={triggerHoleFill}
                          disabled={!scanned}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-45"
                        >
                          HEAL HOLES
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCULPT & SMOOTH TOOLS */}
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">SCULPT BRUSH</h3>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-4">
                    
                    {/* Radius */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-white/60">
                        <span>BRUSH RADIUS</span>
                        <span>{brushSize}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer" 
                      />
                    </div>

                    {/* Intensity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-white/60">
                        <span>BRUSH INTENSITY</span>
                        <span>{brushIntensity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        value={brushIntensity} 
                        onChange={(e) => setBrushIntensity(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={triggerSculpt}
                        disabled={!scanned}
                        className="py-2.5 bg-sky-500 hover:bg-sky-400 text-black rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-45 transition-all text-center"
                      >
                        DEFORM BRUSH
                      </button>
                      <button
                        onClick={triggerSmooth}
                        disabled={!scanned}
                        className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-black text-[9px] uppercase tracking-widest disabled:opacity-45 transition-all text-center"
                      >
                        FLATTEN SMOOTH
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 3 - PHYSICAL 3D PRINT SLICING & SUPPORT STRUCTURES */}
            {activeSubTab === 'print' && (
              <div className="space-y-6">
                
                {/* DIMENSION CALIBRATION CONTROLS */}
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">PHYSICAL BUILD DIMENSIONS</h3>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-3.5">
                    
                    {/* X scale width */}
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs uppercase font-bold text-white/60">WIDTH (X)</span>
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-xl px-2.5 py-1">
                        <input 
                          type="number" 
                          value={dimSettings.x} 
                          onChange={(e) => setDimSettings(prev => ({ ...prev, x: Math.max(1, Number(e.target.value)) }))}
                          className="w-14 bg-transparent border-none text-right font-black focus:outline-none text-sky-400" 
                        />
                        <span className="text-[8px] text-white/40 font-bold">MM</span>
                      </div>
                    </div>

                    {/* Y scale height */}
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs uppercase font-bold text-white/60">HEIGHT (Y)</span>
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-xl px-2.5 py-1">
                        <input 
                          type="number" 
                          value={dimSettings.y} 
                          onChange={(e) => setDimSettings(prev => ({ ...prev, y: Math.max(1, Number(e.target.value)) }))}
                          className="w-14 bg-transparent border-none text-right font-black focus:outline-none text-sky-400" 
                        />
                        <span className="text-[8px] text-white/40 font-bold">MM</span>
                      </div>
                    </div>

                    {/* Z scale depth */}
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs uppercase font-bold text-white/60">DEPTH (Z)</span>
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-xl px-2.5 py-1">
                        <input 
                          type="number" 
                          value={dimSettings.z} 
                          onChange={(e) => setDimSettings(prev => ({ ...prev, z: Math.max(1, Number(e.target.value)) }))}
                          className="w-14 bg-transparent border-none text-right font-black focus:outline-none text-sky-400" 
                        />
                        <span className="text-[8px] text-white/40 font-bold">MM</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDimSettings({ ...modelInfo.nominalDimensions })}
                      className="py-1.5 text-center text-white/40 hover:text-white text-[8px] font-black uppercase tracking-widest border-t border-white/5 flex items-center justify-center gap-1 mt-1"
                    >
                      <RotateCcw size={8} />
                      reset bounding limits
                    </button>
                  </div>
                </div>

                {/* AUTOMATED SUPPORT SYSTEM DESIGN */}
                <div>
                  <h3 className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em] mb-3">OVERHANG PRINT SUPPORTS</h3>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase font-bold text-white leading-none">AUTO-GENERATOR</span>
                        <span className="text-[8px] text-white/30 leading-none mt-1">Place Columnar Support Scaffold</span>
                      </div>
                      <button
                        onClick={triggerSupportGen}
                        className={`w-12 h-6.5 rounded-full p-1 transition-all flex items-center ${
                          supportEnabled ? 'bg-orange-500 justify-end' : 'bg-white/20 justify-start'
                        }`}
                      >
                        <div className="w-4.5 h-4.5 bg-black rounded-full" />
                      </button>
                    </div>

                    {supportEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3.5 pt-2 border-t border-white/5"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-white/60">
                            <span>SUPPORT SCAFFOLD DENSITY</span>
                            <span>{supportDensity}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="15" 
                            max="70" 
                            value={supportDensity} 
                            onChange={(e) => setSupportDensity(Number(e.target.value))}
                            className="w-full accent-orange-500 cursor-pointer" 
                          />
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/15 p-3 rounded-2xl flex items-center gap-2 text-[9px] text-orange-400">
                          <AlertCircle size={14} className="flex-shrink-0" />
                          <span>Provides stabilization scaffold underneath active overhang angles. Highlighted in orange.</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* AR MODE DISPLACEMENT CONTROLLER SPECIFIC CONTROLS */}
            {isARMode && (
              <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[11px] font-black uppercase text-[#38bdf8] tracking-[0.2em]">AR SPACE ADJUSTMENTS</h3>
                
                {/* Scale slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>HOLO SCALE</span>
                    <span>{(arPlacement.scale * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="300" 
                    value={arPlacement.scale * 100} 
                    onChange={(e) => setArPlacement(prev => ({ ...prev, scale: Number(e.target.value) / 100 }))}
                    className="w-full accent-sky-500 cursor-pointer" 
                  />
                </div>

                {/* Rotate slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>ORBIT ROTATION</span>
                    <span>{((arPlacement.rotateY * 180) / Math.PI).toFixed(0)}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={((arPlacement.rotateY * 180) / Math.PI)} 
                    onChange={(e) => setArPlacement(prev => ({ ...prev, rotateY: (Number(e.target.value) * Math.PI) / 180 }))}
                    className="w-full accent-sky-500 cursor-pointer" 
                  />
                </div>

                {/* Depth distance slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>PLACED DISTANCE</span>
                    <span>{Math.abs(arPlacement.z).toFixed(1)}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="6" 
                    step="0.1"
                    value={Math.abs(arPlacement.z)} 
                    onChange={(e) => setArPlacement(prev => ({ ...prev, z: -Number(e.target.value) }))}
                    className="w-full accent-sky-500 cursor-pointer" 
                  />
                </div>
              </div>
            )}

            {/* LOGS MONITOR CONSOLE AT BOTTOM RIGHT */}
            <div className="mt-auto">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                LOG CONSOLE FEED
              </h3>
              <div className="bg-black/60 border border-white/5 p-3 rounded-2xl h-24 overflow-y-auto font-mono text-[9px] text-[#38bdf8] flex flex-col gap-1 custom-scrollbar">
                {scanLogs.length === 0 ? (
                  <div className="text-white/20">Awaiting acquisition telemetry...</div>
                ) : (
                  scanLogs.map((log, idx) => (
                    <div key={idx} className="leading-tight border-b border-white/3 pb-0.5 last:border-none">
                      <span className="text-white/25 mr-1">&gt;</span>{log}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM REAL-TIME BAR */}
        <div className="px-8 py-4.5 bg-white/3 border-t border-white/5 flex justify-between items-center text-[10px] tracking-widest font-mono text-white/40">
          <div>
            NEON SCANNER SUITE v9.0 // READY FOR STL SLICING
          </div>
          <div className="hidden lg:flex items-center gap-5">
            <span>CHANNELS: QUAD-TOF ACTIVE</span>
            <span>MEM: EXPORT OPTIMIZED</span>
            <span>SYSTEM: ONLINE AND SECURE</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
