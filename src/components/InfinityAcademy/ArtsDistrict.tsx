import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

export function ArtsDistrict() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [colorR, setColorR] = useState(255);
  const [colorG, setColorG] = useState(120);
  const [colorB, setColorB] = useState(50);

  const prismRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (prismRef.current) {
      prismRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      prismRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const mixedHex = '#' + [colorR, colorG, colorB].map(v => {
    const hex = Math.round(v).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');

  const artsFacts = {
    id: 'prism_spectrum',
    name: 'Chromatic Additive Light Prism',
    category: 'Physics of Art',
    description: `A transparent triangular optical prism demonstrating additive color mixing of light. Combining primary colors of light (Red, Green, Blue) at full intensity produces white light. Current RGB values: (${Math.round(colorR)}, ${Math.round(colorG)}, ${Math.round(colorB)}). Hex: ${mixedHex}.`,
    funFact: 'This additive mixing is different from subtractive mixing (paints and pigments, where primary colors are Cyan, Magenta, Yellow, and mixing them all together produces black/brown)! Computer screens and human eyes utilize additive RGB light mixing!'
  };

  const handleScanPrism = () => {
    setSelectedObject(artsFacts);
    discoverObject('prism_spectrum');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Light Source directed at Prism */}
      <pointLight position={[0, 4, 0]} intensity={2.5} color={mixedHex} />
      <pointLight position={[-10, 8, -5]} intensity={1.0} color="#f43f5e" />
      <pointLight position={[10, 8, 5]} intensity={1.0} color="#3b82f6" />

      {/* Grid Floor */}
      <gridHelper args={[12, 12, '#f43f5e', '#450a0a']} position={[0, 0.01, 0]} />

      {/* --- CENTRAL TRANSLUCENT OPTICAL PRISM --- */}
      <group position={[0, 1.2, -1.8]}>
        {/* Transparent triangular prism shape */}
        <mesh 
          ref={prismRef}
          onClick={handleScanPrism}
        >
          <coneGeometry args={[0.9, 1.5, 3]} />
          <meshStandardMaterial 
            color={mixedHex} 
            transparent 
            opacity={0.55} 
            roughness={0.1}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 3D Directed colored rays coming into the prism */}
        <mesh position={[-1.2, -0.2, 0.4]} rotation={[0, 0.3, -0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-1.2, -0.2, -0.4]} rotation={[0, -0.3, -0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
        </mesh>
        <mesh position={[1.2, -0.2, 0]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>

        {/* Floating companion labels */}
        <Html distanceFactor={8} position={[0, 1.5, 0]} center>
          <div className="bg-zinc-950/95 border border-rose-500/40 px-3 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-wider text-rose-300 whitespace-nowrap shadow-2xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            🎨 Chromatic Prism [Click to Scan]
          </div>
        </Html>
      </group>

      {/* Art spectrum mixer console UI */}
      <Html position={[-1.4, 1.8, 1.2]} center distanceFactor={10}>
        <div className="bg-zinc-950/90 border border-rose-500/30 p-5 rounded-3xl w-60 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Spectrum Mixer</h4>
            <p className="text-[8px] font-bold text-rose-400 uppercase">Additive RGB light mixing</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Red slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-black uppercase">
                <span className="text-red-400">Red Channel</span>
                <span className="text-white font-mono">{Math.round(colorR)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="255" 
                step="1" 
                value={colorR} 
                onChange={(e) => setColorR(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Green slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-black uppercase">
                <span className="text-emerald-400">Green Channel</span>
                <span className="text-white font-mono">{Math.round(colorG)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="255" 
                step="1" 
                value={colorG} 
                onChange={(e) => setColorG(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Blue slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-black uppercase">
                <span className="text-blue-400">Blue Channel</span>
                <span className="text-white font-mono">{Math.round(colorB)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="255" 
                step="1" 
                value={colorB} 
                onChange={(e) => setColorB(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded outline-none appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Color Display Indicator */}
          <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-2xl">
            <div 
              className="w-9 h-9 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              style={{ backgroundColor: mixedHex }}
            />
            <div>
              <div className="text-[7px] font-black text-zinc-500 uppercase">Composite Hex</div>
              <div className="text-[11px] font-mono font-bold text-white uppercase">{mixedHex}</div>
            </div>
          </div>

          <button
            onClick={handleScanPrism}
            className="w-full bg-rose-500 text-black font-black text-[9px] uppercase tracking-widest py-2 rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.25)]"
          >
            🎨 RENDER SPECTRAL BLEND
          </button>
        </div>
      </Html>
    </group>
  );
}
