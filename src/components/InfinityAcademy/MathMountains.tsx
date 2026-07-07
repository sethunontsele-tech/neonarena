import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

export function MathMountains() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const [vectorX, setVectorX] = useState(2);
  const [vectorY, setVectorY] = useState(1.5);
  const [vectorZ, setVectorZ] = useState(-1);

  const vectorRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(time * 2) * 0.15 + vectorY;
    }
  });

  const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY + vectorZ * vectorZ).toFixed(2);

  const mathFacts = {
    id: 'vector_matrix',
    name: '3D Vector Plotter',
    category: 'Spatial Geometry',
    description: `A vector is an object that has both a magnitude and a direction. Geometrically, we can picture a vector as a directed line segment, whose length is the magnitude. Current coordinates: [${vectorX}, ${vectorY}, ${vectorZ}] with total magnitude ${magnitude}.`,
    funFact: 'In game design, vectors are used for everything: physics calculations, player movement directions, lighting reflections, and sound attenuation calculations!'
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Mathematics Laboratory Lighting */}
      <pointLight position={[-8, 10, -3]} intensity={1.5} color="#f59e0b" />
      <pointLight position={[8, 10, 3]} intensity={1.5} color="#eab308" />

      {/* Grid Floor for coordinate calculations */}
      <gridHelper args={[12, 12, '#f59e0b', '#78350f']} position={[0, 0.01, 0]} />

      {/* --- 3D Vector Sandbox --- */}
      <group position={[0, 0, -1]}>
        {/* Origin node */}
        <mesh onClick={() => setSelectedObject(mathFacts)}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#78350f" emissiveIntensity={0.5} />
        </mesh>

        {/* X-Axis (Red) */}
        <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
        </mesh>
        {/* Y-Axis (Green) */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
        </mesh>
        {/* Z-Axis (Blue) */}
        <mesh position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
        </mesh>

        {/* Main Vector Arrow */}
        <group ref={vectorRef}>
          {/* Custom vector line */}
          <line>
            <bufferGeometry attach="geometry" onUpdate={(self) => {
              const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(vectorX, vectorY, vectorZ)
              ];
              self.setFromPoints(points);
            }} />
            <lineBasicMaterial attach="material" color="#f59e0b" linewidth={3} />
          </line>

          {/* Vector End Point Sphere */}
          <mesh 
            ref={sphereRef} 
            position={[vectorX, vectorY, vectorZ]}
            onClick={() => setSelectedObject(mathFacts)}
          >
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
          </mesh>
        </group>

        {/* Floating coordinate info box */}
        <Html position={[vectorX, vectorY + 0.6, vectorZ]} center distanceFactor={8}>
          <div className="bg-zinc-950/95 border border-amber-500/50 p-3.5 rounded-2xl shadow-2xl flex flex-col gap-1 w-44">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Vector Coordinates</span>
            <div className="text-[11px] font-mono font-bold text-white">
              X: <span className="text-red-400">{vectorX.toFixed(1)}</span> | 
              Y: <span className="text-green-400">{vectorY.toFixed(1)}</span> | 
              Z: <span className="text-blue-400">{vectorZ.toFixed(1)}</span>
            </div>
            <div className="text-[8px] font-black text-zinc-400 uppercase border-t border-white/5 pt-1.5 mt-1">
              Magnitude (Length): <span className="text-amber-300 font-mono font-bold">{magnitude}</span>
            </div>
          </div>
        </Html>

        {/* 3D Sliders Panel for Interactive Vector Building */}
        <Html position={[-4, 2, 1.5]} center distanceFactor={10}>
          <div className="bg-zinc-950/90 border border-amber-500/30 p-5 rounded-3xl w-56 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto">
            <div className="border-b border-white/10 pb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Vector Sandbox</h4>
              <p className="text-[8px] font-bold text-amber-500/70 uppercase">Manipulate 3D coordinates</p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {/* X slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="text-red-400">X Position</span>
                  <span className="text-white font-mono">{vectorX.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="-3" 
                  max="3" 
                  step="0.1" 
                  value={vectorX} 
                  onChange={(e) => setVectorX(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Y slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="text-green-400">Y Height</span>
                  <span className="text-white font-mono">{vectorY.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="3" 
                  step="0.1" 
                  value={vectorY} 
                  onChange={(e) => setVectorY(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* Z slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="text-blue-400">Z Depth</span>
                  <span className="text-white font-mono">{vectorZ.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="-3" 
                  max="3" 
                  step="0.1" 
                  value={vectorZ} 
                  onChange={(e) => setVectorZ(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <button 
              onClick={() => setSelectedObject(mathFacts)}
              className="w-full bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider py-2 rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              Analyze Vector Math
            </button>
          </div>
        </Html>
      </group>
    </group>
  );
}
