import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

export function MicroscopeWorld() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [magLevel, setMagLevel] = useState<'1k' | '10k' | '100k'>('10k');
  const [isolatedView, setIsolatedView] = useState(false);

  const dnaGroupRef = useRef<THREE.Group>(null);
  const cellRef = useRef<THREE.Group>(null);
  const virusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate DNA double helix
    if (dnaGroupRef.current) {
      dnaGroupRef.current.rotation.y = time * 0.55;
    }

    // float cells
    if (cellRef.current) {
      cellRef.current.position.y = Math.sin(time * 0.8) * 0.12;
      cellRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }

    // pulsating virus
    if (virusRef.current) {
      const pulse = 1 + Math.sin(time * 2.2) * 0.05;
      virusRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const selectMag = (level: typeof magLevel) => {
    setMagLevel(level);
    discoverObject(`microscope_mag_${level}`);
  };

  const handleInspect = (item: string, desc: string, fact: string) => {
    setSelectedObject({
      id: `cell_${item.toLowerCase()}`,
      name: item,
      category: 'Molecular Biology',
      description: desc,
      funFact: fact,
    });
  };

  return (
    <group position={[0, 0, -1]}>
      {/* Microscope Control HUD */}
      <Html position={[1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Cytology Lab</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🔬 Microscope World</h3>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Magnification</span>
            <div className="grid grid-cols-3 gap-1">
              {['1k', '10k', '100k'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => selectMag(lvl as any)}
                  className={`py-1.5 border rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                    magLevel === lvl
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  {lvl === '1k' ? '1,000X' : lvl === '10k' ? '10,000X' : '100,000X'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setIsolatedView(!isolatedView);
              discoverObject('microscope_isolate_dna');
            }}
            className={`mt-1.5 w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${
              isolatedView 
                ? 'bg-cyan-500/25 border-cyan-500 text-cyan-400' 
                : 'bg-zinc-900 border-white/10 text-white hover:border-white/30'
            }`}
          >
            {isolatedView ? 'SHOW FULL CELL' : 'ISOLATE DNA HELIX'}
          </button>
        </div>
      </Html>

      {/* Outer blurred translucent cell membrane (representing cell capsule) */}
      {!isolatedView && (
        <mesh position={[0, 0, -0.4]}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshStandardMaterial 
            color="#ec4899" 
            transparent 
            opacity={0.06} 
            wireframe 
          />
        </mesh>
      )}

      {/* Floating cell contents */}
      {!isolatedView && (
        <group ref={cellRef}>
          {/* Mitochondria sausage */}
          <mesh 
            position={[-0.8, 0.4, -0.5]} 
            rotation={[0.3, 0.4, 0.8]}
            onClick={() => handleInspect(
              'Mitochondrion Organelle',
              'The double-membrane power plant of eukaryotic cells. It utilizes chemical processes (Kreb Cycle) to oxidize nutrients and synthesize Adenosine Triphosphate (ATP) to power active cell operations.',
              'Mitochondria contain their own maternal DNA sequence, completely separate from the nuclear genome!'
            )}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.4} />
          </mesh>

          {/* Blood Cell (Red Erythrocyte disc) */}
          <mesh 
            position={[0.8, -0.4, -0.2]} 
            rotation={[0.8, 0, 0.2]}
            onClick={() => handleInspect(
              'Red Blood Cell (Erythrocyte)',
              'Biconcave discs packed with iron-dense hemoglobin proteins. They bind gas molecules inside pulmonary capillaries to distribute oxygen throughout our system.',
              'Erythrocytes are completely hollow, lacking a nucleus to maximize oxygen storage space!'
            )}
          >
            <torusGeometry args={[0.18, 0.06, 8, 32]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.3} />
          </mesh>

          {/* Spherical Virus Capsule */}
          <mesh 
            ref={virusRef}
            position={[-0.6, -0.5, 0.2]}
            onClick={() => handleInspect(
              'T4 Bacteriophage (Virus)',
              'A molecular, non-living viral capsule designed to inject raw DNA into prokaryotic host bodies to synthesize replication arrays.',
              'Bacteriophages are the most abundant biological entities on earth, outnumbering all other organisms combined!'
            )}
          >
            <dodecahedronGeometry args={[0.14]} />
            <meshStandardMaterial color="#eab308" roughness={0.1} emissive="#ca8a04" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}

      {/* DNA Helix Structure */}
      <group ref={dnaGroupRef} position={[0, 0, -0.2]}>
        {/* Render a segment of the DNA double helix */}
        {Array.from({ length: 12 }, (_, i) => {
          const y = (i - 6) * 0.18;
          const theta = i * 0.52;
          const x1 = Math.sin(theta) * 0.35;
          const z1 = Math.cos(theta) * 0.35;
          const x2 = Math.sin(theta + Math.PI) * 0.35;
          const z2 = Math.cos(theta + Math.PI) * 0.35;

          return (
            <group key={i} position={[0, y, 0]}>
              {/* Left nucleotide sphere */}
              <mesh 
                position={[x1, 0, z1]}
                onClick={() => handleInspect(
                  'Adenine-Thymine base pair',
                  'One of the two primary nucleotide rungs forming genetic double helix structures. Joined by hydrogen bonds, Adenine always pairs with Thymine.',
                  'The entire human genome contains roughly 3 billion base pairs packed inside cell nuclei!'
                )}
              >
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.4} />
              </mesh>
              {/* Right nucleotide sphere */}
              <mesh position={[x2, 0, z2]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#f43f5e" />
              </mesh>
              {/* Central base pairing rung (cylinder connector) */}
              <mesh rotation={[0, -theta, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.7, 4]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
export default MicroscopeWorld;
