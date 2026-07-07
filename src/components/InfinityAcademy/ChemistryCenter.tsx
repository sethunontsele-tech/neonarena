import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from './eduStore';
import { Html } from '@react-three/drei';

interface ChemicalMolecule {
  name: string;
  formula: string;
  category: string;
  description: string;
  funFact: string;
  elements: Array<{ name: string; color: string; position: [number, number, number]; size: number }>;
  bonds: Array<{ start: [number, number, number]; end: [number, number, number] }>;
}

export function ChemistryCenter() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const moleculesList: Record<string, ChemicalMolecule> = {
    h2o: {
      name: 'Water',
      formula: 'H2O',
      category: 'Covalent Compound',
      description: 'Two light hydrogen atoms covalently bound to a central oxygen atom. Water is the universal solvent required for all known organic life.',
      funFact: 'Water molecules have a dipole moment causing a cohesive surface tension. Because of this, some insects can walk on water!',
      elements: [
        { name: 'O', color: '#ef4444', position: [0, 0, 0], size: 0.5 },
        { name: 'H', color: '#3b82f6', position: [-0.85, -0.6, 0], size: 0.3 },
        { name: 'H', color: '#3b82f6', position: [0.85, -0.6, 0], size: 0.3 }
      ],
      bonds: [
        { start: [0, 0, 0], end: [-0.85, -0.6, 0] },
        { start: [0, 0, 0], end: [0.85, -0.6, 0] }
      ]
    },
    nacl: {
      name: 'Sodium Chloride (Salt)',
      formula: 'NaCl',
      category: 'Ionic Compound',
      description: 'A crystalline structure formed by ionic bonding of positive sodium ions and negative chloride ions, creating household table salt.',
      funFact: 'In ancient history, salt was so valuable that Roman soldiers were paid with it—which is where the word "salary" originates!',
      elements: [
        { name: 'Na+', color: '#10b981', position: [-0.6, 0, 0], size: 0.4 },
        { name: 'Cl-', color: '#f59e0b', position: [0.6, 0, 0], size: 0.55 }
      ],
      bonds: [
        { start: [-0.6, 0, 0], end: [0.6, 0, 0] }
      ]
    },
    co2: {
      name: 'Carbon Dioxide',
      formula: 'CO2',
      category: 'Covalent Compound',
      description: 'A carbon atom double-bonded to two oxygen atoms. It is a vital greenhouse gas produced by respiration and consumed by plants during photosynthesis.',
      funFact: 'Dry ice is actually solid Carbon Dioxide. At standard room temperature and pressure, it undergoes sublimation—meaning it turns directly from solid to gas without melting into liquid!',
      elements: [
        { name: 'C', color: '#18181b', position: [0, 0, 0], size: 0.45 },
        { name: 'O', color: '#ef4444', position: [-0.95, 0, 0], size: 0.5 },
        { name: 'O', color: '#ef4444', position: [0.95, 0, 0], size: 0.5 }
      ],
      bonds: [
        { start: [0, 0, 0], end: [-0.95, 0, 0] },
        { start: [0, 0, 0], end: [0.95, 0, 0] }
      ]
    }
  };

  const [activeMoleculeKey, setActiveMoleculeKey] = useState<keyof typeof moleculesList>('h2o');
  const activeMolecule = moleculesList[activeMoleculeKey];

  const moleculeRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (moleculeRef.current) {
      moleculeRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      moleculeRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.15;
    }
  });

  const selectMolecule = (key: keyof typeof moleculesList) => {
    setActiveMoleculeKey(key);
    discoverObject('bond_atoms');
  };

  const handleScan = () => {
    setSelectedObject({
      id: activeMoleculeKey,
      name: activeMolecule.name + ` (${activeMolecule.formula})`,
      category: activeMolecule.category,
      description: activeMolecule.description,
      funFact: activeMolecule.funFact
    });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Lights */}
      <pointLight position={[-10, 10, -5]} intensity={1.5} color="#10b981" />
      <pointLight position={[10, 10, 5]} intensity={1.5} color="#059669" />

      {/* Grid Floor */}
      <gridHelper args={[12, 12, '#10b981', '#064e3b']} position={[0, 0.01, 0]} />

      {/* --- MOLECULAR MODEL AREA --- */}
      <group position={[0, 1, -1.5]} ref={moleculeRef}>
        {/* Render Atoms */}
        {activeMolecule.elements.map((el, i) => (
          <mesh 
            key={i} 
            position={el.position}
            onClick={(e) => {
              e.stopPropagation();
              handleScan();
            }}
          >
            <sphereGeometry args={[el.size, 32, 32]} />
            <meshStandardMaterial color={el.color} roughness={0.1} metalness={0.4} />
            <Html distanceFactor={8} position={[0, el.size + 0.35, 0]} center>
              <span className="text-[8px] font-black text-white bg-black/80 border border-white/10 px-1.5 py-0.5 rounded-full select-none">
                {el.name}
              </span>
            </Html>
          </mesh>
        ))}

        {/* Render Bonds (bonds cylinders) */}
        {activeMolecule.bonds.map((bond, i) => {
          const startVec = new THREE.Vector3(...bond.start);
          const endVec = new THREE.Vector3(...bond.end);
          const distance = startVec.distanceTo(endVec);
          const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

          // Sizing and orientation calculation
          const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
          const alignmentRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

          return (
            <mesh 
              key={i} 
              position={[midpoint.x, midpoint.y, midpoint.z]}
              quaternion={alignmentRotation}
            >
              <cylinderGeometry args={[0.06, 0.06, distance]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* Chemistry Sandbox Control Panel UI */}
      <Html position={[0, 2, 2.3]} center distanceFactor={10}>
        <div className="bg-zinc-950/90 border border-emerald-500/30 p-5 rounded-3xl w-60 flex flex-col gap-4 shadow-2xl backdrop-blur-xl pointer-events-auto select-none">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Molecular Synthesis</h4>
            <p className="text-[8px] font-bold text-emerald-400 uppercase">Interactive atomic bond mixer</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black text-zinc-500 uppercase">Select Target Molecule</span>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(moleculesList) as Array<keyof typeof moleculesList>).map((key) => {
                const mol = moleculesList[key];
                const active = activeMoleculeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectMolecule(key)}
                    className={`px-3 py-2.5 rounded-xl text-left text-[9px] font-black uppercase tracking-wider transition-all border flex justify-between items-center ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span>{mol.name}</span>
                    <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-emerald-300">{mol.formula}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleScan}
            className="w-full bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest py-2 rounded-xl hover:bg-white transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            🔬 RUN ATOMIC ANALYSIS
          </button>
        </div>
      </Html>
    </group>
  );
}
