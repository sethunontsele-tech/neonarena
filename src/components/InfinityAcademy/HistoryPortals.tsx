import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

export function HistoryPortals() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [activeGlyphIdx, setActiveGlyphIdx] = useState(0);

  const glyphs = [
    { symbol: '𓇳 (Ra)', translation: 'Sun or Sun God Ra', desc: 'The supreme solar deity representing warmth, light, growth, and cosmic order.' },
    { symbol: '𓋹 (Ankh)', translation: 'Breath of Life', desc: 'The sacred hieroglyph representing eternal life, health, and physical protection.' },
    { symbol: '𓎛𓂋𓏏𓇯 (Nut)', translation: 'Sky Goddess Nut', desc: 'Representing the cosmic firmament star-canopy shielding the Earth.' }
  ];

  const currentGlyph = glyphs[activeGlyphIdx];

  const historyFacts = {
    id: 'rosetta_stone',
    name: 'Rosetta Stone Hieroglyphs',
    category: 'Ancient Epigraphy',
    description: `A segment of the black granodiorite Rosetta Stone slab inscribed with royal decrees. Features three scripts: Ancient Egyptian hieroglyphs, Demotic script, and Ancient Greek. Currently deciphering: "${currentGlyph.symbol}" - "${currentGlyph.translation}".`,
    funFact: 'Found in 1799 by French soldiers, the Rosetta Stone was the key that allowed modern scholars (like Jean-François Champollion) to crack the code and translate Egyptian hieroglyphs for the first time in 1500 years!'
  };

  const handleScanSymbol = (idx: number) => {
    setActiveGlyphIdx(idx);
    discoverObject('rosetta_stone');
  };

  const handleReadFullRosetta = () => {
    setSelectedObject(historyFacts);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Ancient/warmer light settings */}
      <pointLight position={[-10, 10, -5]} intensity={1.5} color="#f43f5e" />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#fda4af" />

      {/* Grid Floor */}
      <gridHelper args={[12, 12, '#e11d48', '#881337']} position={[0, 0.01, 0]} />

      {/* --- 3D MONUMENT: ANCIENT PYRAMID OR OBELISK (Slightly back) --- */}
      <group position={[0, 0, -2.5]}>
        {/* Pyramid mesh base */}
        <mesh onClick={handleReadFullRosetta}>
          <coneGeometry args={[2.5, 3.2, 4]} />
          <meshStandardMaterial 
            color="#fda4af" 
            roughness={0.9} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Glowing holographic steps lines */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[5.1, 0.1, 5.1]} />
          <meshBasicMaterial color="#e11d48" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* --- 3D ROSETTA TABLET IN THE FOREGROUND --- */}
      <group position={[1.2, 0.8, -0.5]} rotation={[0, -0.4, 0.2]}>
        {/* Granite Slab Tablet */}
        <mesh onClick={handleReadFullRosetta}>
          <boxGeometry args={[0.7, 0.9, 0.12]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        
        {/* Inscribed Glowing glyph on tablet */}
        <mesh position={[0, 0.1, 0.07]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial color="#fda4af" transparent opacity={0.2} />
        </mesh>
        
        <Html distanceFactor={6} position={[0, 0.6, 0]} center>
          <div className="bg-zinc-950/85 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
            𓋹 Rosetta Cipher Slab
          </div>
        </Html>
      </group>

      {/* Hieroglyphic Translation Tool Console UI */}
      <Html position={[-1.2, 1.8, 1.2]} center distanceFactor={10}>
        <div className="bg-zinc-950/90 border border-rose-500/30 p-5 rounded-3xl w-60 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Rosetta Translator</h4>
            <p className="text-[8px] font-bold text-rose-400 uppercase">Hieroglyphic decryption matrix</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-zinc-500 uppercase">Select Glyph Symbol</span>
            <div className="flex flex-col gap-1.5">
              {glyphs.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScanSymbol(idx)}
                  className={`px-3 py-2 rounded-xl text-left text-[9px] font-black uppercase tracking-wider transition-all border flex justify-between items-center ${
                    activeGlyphIdx === idx
                      ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.3)]'
                      : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="font-mono text-base">{g.symbol.split(' ')[0]}</span>
                  <span className="text-[8px] text-zinc-400">{g.symbol.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Decryption Screen */}
          <div className="bg-black/60 border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <div className="text-[7px] font-black text-zinc-500 uppercase">Deciphered Meaning</div>
            <div className="text-[11px] font-bold text-white uppercase italic">{currentGlyph.translation}</div>
            <p className="text-[8px] text-zinc-400 leading-normal mt-1">{currentGlyph.desc}</p>
          </div>

          <button
            onClick={handleReadFullRosetta}
            className="w-full bg-rose-500 text-black font-black text-[9px] uppercase tracking-widest py-2 rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)]"
          >
            📜 SCAN HIEROGLYPH MATRIX
          </button>
        </div>
      </Html>
    </group>
  );
}
