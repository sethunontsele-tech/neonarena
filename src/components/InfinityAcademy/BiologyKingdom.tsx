import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

export function BiologyKingdom() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoveredObjects = useEduStore(state => state.discoveredObjects);

  const cellRef = useRef<THREE.Group>(null);
  const dnaRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState<string | null>(null);

  // Math-based animation loops
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate cell group slightly
    if (cellRef.current) {
      cellRef.current.rotation.y = time * 0.15;
    }

    // Spin DNA helix majestically
    if (dnaRef.current) {
      dnaRef.current.rotation.y = time * 0.4;
    }

    // Pulsate heart in a real "lub-dub" rhythm
    if (heartRef.current) {
      // Lub-dub pulse equation
      const beatCycle = (time * 1.2) % 1;
      let heartScale = 1;
      
      if (beatCycle < 0.15) {
        // First squeeze (Atrial contraction)
        heartScale = 1 + Math.sin((beatCycle / 0.15) * Math.PI) * 0.12;
      } else if (beatCycle >= 0.2 && beatCycle < 0.4) {
        // Second Squeeze (Ventricular contraction - larger)
        heartScale = 1 + Math.sin(((beatCycle - 0.2) / 0.2) * Math.PI) * 0.22;
      } else {
        // Rest
        heartScale = 1 + (1 - Math.exp(-(beatCycle - 0.4) * 5)) * 0.02;
      }
      
      heartRef.current.scale.set(heartScale, heartScale, heartScale);
    }
  });

  // Molecular structures facts
  const cellFacts = {
    mitochondria: {
      id: 'mitochondria',
      name: 'Mitochondria',
      category: 'Cellular Organelle',
      description: 'Often called the "powerhouse of the cell". It converts chemical energy from food into Adenosine Triphosphate (ATP), which acts as the chemical fuel powering cellular processes.',
      funFact: 'Mitochondria actually possess their own unique, independent mitochondrial DNA (mtDNA), which is inherited exclusively from your mother!'
    },
    nucleus: {
      id: 'nucleus',
      name: 'Cell Nucleus',
      category: 'Cellular Command Center',
      description: 'The master vault of the cell. It houses the chromosomes and coordinates crucial functions such as protein synthesis, growth, and replication.',
      funFact: 'If you uncoiled all the DNA packed inside a single cell nucleus, it would stretch to almost 2 meters in length!'
    },
    lysosome: {
      id: 'lysosome',
      name: 'Lysosome',
      category: 'Recycling Core',
      description: 'The waste-disposal unit. It contains digestive enzymes that break down waste materials, worn-out organelles, and foreign invaders like bacteria.',
      funFact: 'When a cell is too damaged, lysosomes trigger a controlled self-destruction process called apoptosis or "cell suicide".'
    }
  };

  const dnaFacts = {
    id: 'dna',
    name: 'DNA Double Helix',
    category: 'Genetics',
    description: 'Deoxyribonucleic acid is the molecule that carries the genetic instructions for the development, functioning, and reproduction of all known living organisms.',
    funFact: 'About 99.9% of the DNA sequence is identical across all human beings. That tiny 0.1% difference makes every single person completely unique!'
  };

  const heartFacts = {
    id: 'heart',
    name: 'Pulsating Human Heart',
    category: 'Circulatory System',
    description: 'A muscular organ about the size of your fist. It acts as a powerful pump, circulating oxygenated blood throughout your arteries and returning deoxygenated blood through veins.',
    funFact: 'Your heart beats around 100,000 times a day, pumping roughly 7,500 liters of blood through 60,000 miles of blood vessels!'
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Lights specific to Biology Dimension */}
      <pointLight position={[-10, 10, -5]} intensity={1.5} color="#ec4899" />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#38bdf8" />

      {/* --- ZONE 1: THE MICROSCOPIC CELL (Positioned to the Left) --- */}
      <group position={[-6, 1, -2]} ref={cellRef}>
        {/* Transparent outer membrane sphere */}
        <mesh 
          onClick={() => setSelectedObject({ 
            id: 'membrane', 
            name: 'Cell Membrane', 
            category: 'Cell Biology', 
            description: 'A semi-permeable phospholipid bilayer that controls the movement of substances in and out of cells.', 
            funFact: 'It is so thin that over 10,000 cell membranes stacked would equal the thickness of a single sheet of paper!'
          })}
          onPointerOver={() => setHovered('membrane')}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[2.5, 32, 16]} />
          <meshStandardMaterial 
            color="#ec4899" 
            transparent 
            opacity={hovered === 'membrane' ? 0.22 : 0.12} 
            wireframe 
          />
        </mesh>

        {/* Nucleus (Central Spherical core) */}
        <mesh 
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject(cellFacts.nucleus);
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('nucleus'); }}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={hovered === 'nucleus' ? 0.6 : 0.2}
          />
          {hovered === 'nucleus' && (
            <Html distanceFactor={8} position={[0, 1.1, 0]}>
              <div className="bg-zinc-950 text-white border border-purple-500 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider whitespace-nowrap shadow-lg">
                Cell Nucleus [Click to Scan]
              </div>
            </Html>
          )}
        </mesh>

        {/* Mitochondria 1 (Powerhouse capsule) */}
        <group 
          position={[1.2, 0.5, 0.8]} 
          rotation={[0.5, 0.2, 0.7]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject(cellFacts.mitochondria);
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('mitochondria'); }}
          onPointerOut={() => setHovered(null)}
        >
          <mesh>
            <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              emissive="#f59e0b" 
              emissiveIntensity={hovered === 'mitochondria' ? 0.8 : 0.3}
            />
          </mesh>
          {hovered === 'mitochondria' && (
            <Html distanceFactor={8} position={[0, 0.8, 0]}>
              <div className="bg-zinc-950 text-white border border-amber-500 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider whitespace-nowrap shadow-lg">
                ⚡ Mitochondria [Click to Scan]
              </div>
            </Html>
          )}
        </group>

        {/* Mitochondria 2 (Powerhouse capsule) */}
        <group position={[-1.3, -0.6, -1]} rotation={[-0.4, 0.8, -0.2]}>
          <mesh>
            <capsuleGeometry args={[0.22, 0.45, 8, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
          </mesh>
        </group>

        {/* Lysosomes (Waste recyclers spheres) */}
        <mesh 
          position={[-0.5, 1.1, 0.5]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject(cellFacts.lysosome);
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('lysosome'); }}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#22c55e" 
            emissive="#10b981" 
            emissiveIntensity={hovered === 'lysosome' ? 0.7 : 0.2}
          />
          {hovered === 'lysosome' && (
            <Html distanceFactor={8} position={[0, 0.4, 0]}>
              <div className="bg-zinc-950 text-white border border-emerald-500 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider whitespace-nowrap shadow-lg">
                Lysosome [Click to Scan]
              </div>
            </Html>
          )}
        </mesh>

        <mesh position={[0.6, -1.2, -0.6]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#10b981" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* --- ZONE 2: MATHEMATICAL DNA DOUBLE HELIX (Central focal point) --- */}
      <group position={[0, 0.5, -3.5]} ref={dnaRef}>
        {/* Draw a gorgeous mathematical double helix using discrete sphere pairs and links */}
        {Array.from({ length: 24 }).map((_, i) => {
          const yPos = (i * 0.25) - 3;
          const angle = i * 0.35;
          const radius = 0.9;
          
          const x1 = Math.sin(angle) * radius;
          const z1 = Math.cos(angle) * radius;
          
          const x2 = Math.sin(angle + Math.PI) * radius;
          const z2 = Math.cos(angle + Math.PI) * radius;

          // Alternate nucleobase colors (A-T is green-red, C-G is blue-yellow)
          const baseColor1 = i % 2 === 0 ? '#10b981' : '#ef4444'; // Adenine / Thymine
          const baseColor2 = i % 2 === 0 ? '#3b82f6' : '#f59e0b'; // Cytosine / Guanine

          return (
            <group key={i} onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(dnaFacts);
            }}>
              {/* Nucleotide strand ball 1 */}
              <mesh position={[x1, yPos, z1]}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.6} />
              </mesh>

              {/* Nucleotide strand ball 2 */}
              <mesh position={[x2, yPos, z2]}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.6} />
              </mesh>

              {/* Connecting hydrogen rungs */}
              <mesh position={[(x1 + x2) / 2, yPos, (z1 + z2) / 2]} rotation={[0, -angle, 0]}>
                <boxGeometry args={[radius * 2, 0.03, 0.03]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#a855f7' : '#f43f5e'} emissive={i % 2 === 0 ? '#a855f7' : '#f43f5e'} emissiveIntensity={0.3} />
              </mesh>
            </group>
          );
        })}
        
        {/* Hover label over the DNA strand */}
        <mesh 
          position={[0, 3.5, 0]}
          onPointerOver={() => setHovered('dna')}
          onPointerOut={() => setHovered(null)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject(dnaFacts);
          }}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial visible={false} />
          <Html distanceFactor={10} position={[0, 0, 0]}>
            <div className="bg-zinc-950/95 text-white border border-cyan-400/50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl flex items-center gap-2 cursor-pointer hover:border-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              🧬 DNA Double Helix [Analyze]
            </div>
          </Html>
        </mesh>
      </group>

      {/* --- ZONE 3: THE PULSATING HUMAN HEART (Positioned to the Right) --- */}
      <group 
        position={[6, 1.2, -2]} 
        ref={heartRef}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(heartFacts);
        }}
        onPointerOver={() => setHovered('heart')}
        onPointerOut={() => setHovered(null)}
      >
        {/* Central main heart body */}
        <mesh>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#b91c1c" 
            emissiveIntensity={hovered === 'heart' ? 0.8 : 0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Superior Vena Cava tube (Upper Blue deoxygenated tube) */}
        <mesh position={[-0.4, 0.9, 0]} rotation={[0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.18, 0.18, 1, 16]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} />
        </mesh>

        {/* Aorta arch tube (Upper curved red oxygenated tube) */}
        <group position={[0.3, 0.9, -0.1]} rotation={[0, 0, -0.4]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.8, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
        </group>

        {/* Left Pulmonary Artery blue extension */}
        <mesh position={[-0.8, 0.3, 0.5]} rotation={[0, 0, 1.2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>

        {/* Glowing visual indicators for arterial blood paths */}
        <mesh position={[0.4, 1.4, -0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>

        {/* Blood Flow Particles Simulation */}
        {Array.from({ length: 6 }).map((_, i) => {
          const delay = i * 0.15;
          return <BloodParticle key={i} delay={delay} />;
        })}

        {/* Dynamic scanning display tooltip on hover */}
        <Html distanceFactor={8} position={[0, 1.7, 0]}>
          <div className="bg-zinc-950/95 text-white border border-rose-500/50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl flex items-center gap-2 cursor-pointer hover:border-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            🫀 Beating Human Heart [Scan Engine]
          </div>
        </Html>
      </group>
    </group>
  );
}

// Internal Blood Particle Component to simulate circulatory paths
function BloodParticle({ delay }: { delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() + delay;
    const progress = (time * 0.6) % 1; // loop value 0 -> 1

    // Interpolate along arterial tube trajectory
    // Start inside body, flow upwards through Aorta tube
    const t = progress;
    const x = 0.3 + Math.sin(t * Math.PI * 0.5) * 0.3;
    const y = 0.4 + t * 1.1;
    const z = -0.1 - t * 0.2;

    meshRef.current.position.set(x, y, z);
    
    // Fade out as it reaches the tip of the artery
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    if (material) {
      material.opacity = Math.sin(progress * Math.PI) * 0.8;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ff6b6b" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
