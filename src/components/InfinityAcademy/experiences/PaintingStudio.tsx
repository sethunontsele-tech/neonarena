import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface DrawnSpline {
  id: number;
  points: THREE.Vector3[];
  color: string;
}

export function PaintingStudio() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [brushColor, setBrushColor] = useState('#22d3ee');
  const [brushMode, setBrushMode] = useState<'spline' | 'mesh'>('spline');
  const [activeSplines, setActiveSplines] = useState<DrawnSpline[]>([]);
  const splineIdCounter = useRef(0);

  const [isDrawing, setIsDrawing] = useState(false);

  // Brush pointer movement
  const brushPointerRef = useRef<THREE.Mesh>(null);
  const currentSplinePoints = useRef<THREE.Vector3[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Move brush pointer in a smooth automatic spatial wave (to simulate 3D paths easily in sandbox)
    if (brushPointerRef.current) {
      const x = Math.sin(time * 2) * 1.1;
      const y = Math.cos(time * 1.5) * 0.5 + 0.3;
      const z = Math.cos(time * 2) * 0.8 - 0.5;
      brushPointerRef.current.position.set(x, y, z);

      if (isDrawing) {
        currentSplinePoints.current.push(new THREE.Vector3(x, y, z));
        // Keep points capped to prevent memory leaks
        if (currentSplinePoints.current.length > 100) {
          currentSplinePoints.current.shift();
        }
      }
    }
  });

  const toggleDrawing = () => {
    if (isDrawing) {
      // Save drawn spline
      if (currentSplinePoints.current.length > 1) {
        setActiveSplines(prev => [
          ...prev,
          {
            id: splineIdCounter.current++,
            points: [...currentSplinePoints.current],
            color: brushColor
          }
        ]);
        discoverObject('save_3d_spline_artwork');
      }
      currentSplinePoints.current = [];
      setIsDrawing(false);
    } else {
      currentSplinePoints.current = [];
      setIsDrawing(true);
      discoverObject('start_3d_brush_draw');
    }
  };

  const clearCanvas = () => {
    setActiveSplines([]);
    currentSplinePoints.current = [];
    setIsDrawing(false);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'painting_sculpture_base',
      name: 'Creative Painting Canvas',
      category: 'Arts & Design',
      description: 'An interactive spatial canvas rendering neon mathematical curves (splines) in real-time. Brushing tools generate paths by plotting vector nodes in the 3D grid.',
      funFact: 'Vector-drawn splines are mathematically calculated curves that remain crisp and infinitely scalable regardless of magnification levels!'
    });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Painting controls HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-pink-400 uppercase">3D Art Studio</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🎨 Painting Studio</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Select Brush Color</span>
            <div className="grid grid-cols-4 gap-1.5">
              {['#22d3ee', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-6 rounded-lg border-2 transition-all ${
                    brushColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <button
              onClick={toggleDrawing}
              className={`w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                isDrawing 
                  ? 'bg-rose-500 hover:bg-rose-400 border-rose-500/30 text-white animate-pulse' 
                  : 'bg-pink-500 hover:bg-pink-400 border-pink-500/30 text-black shadow-[0_0_15px_rgba(236,72,153,0.3)]'
              }`}
            >
              {isDrawing ? 'STOP BRUSH DRAW' : 'START BRUSH DRAW'}
            </button>
            <button
              onClick={clearCanvas}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              CLEAR CANVAS
            </button>
          </div>
        </div>
      </Html>

      {/* Main Base Sculptural Stand */}
      <mesh position={[0, -0.4, -0.4]} onClick={handleInspect}>
        <cylinderGeometry args={[0.6, 0.65, 0.15, 16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.7} />
      </mesh>

      {/* Center Wireframe Sculpture to Paint Over */}
      <mesh position={[0, 0.15, -0.4]} rotation={[0.4, 0.4, 0]}>
        <torusGeometry args={[0.3, 0.08, 16, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} wireframe />
      </mesh>

      {/* Interactive Glowing Drawing Brush Pointer */}
      <mesh ref={brushPointerRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={brushColor} />
      </mesh>

      {/* Render all saved static 3D Splines */}
      {activeSplines.map((spline) => {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(spline.points);
        return (
          <primitive 
            key={spline.id}
            object={new THREE.Line(
              lineGeometry,
              new THREE.LineBasicMaterial({ color: spline.color })
            )}
          />
        );
      })}

      {/* Render current drawing trail */}
      {isDrawing && currentSplinePoints.current.length > 1 && (
        <primitive 
          object={new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(currentSplinePoints.current),
            new THREE.LineBasicMaterial({ color: brushColor })
          )}
        />
      )}
    </group>
  );
}
export default PaintingStudio;
