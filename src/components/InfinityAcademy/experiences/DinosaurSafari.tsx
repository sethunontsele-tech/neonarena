import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface DinoSpecies {
  name: string;
  scientific: string;
  era: string;
  diet: string;
  weight: string;
  fact: string;
  description: string;
  color: string;
}

export function DinosaurSafari() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const dinoDatabase: Record<string, DinoSpecies> = {
    trex: {
      name: 'Tyrannosaurus Rex',
      scientific: 'Tyrannosaurus rex',
      era: 'Late Cretaceous (68-66 Mya)',
      diet: 'Carnivore',
      weight: '8 Metric Tons',
      fact: 'The T-Rex had one of the strongest bite forces of any land animal, estimated up to 12,000 pounds!',
      description: 'The King of Tyrant Lizards, featuring a massive body, powerful hind limbs, tiny vestigial arms, and a huge skull packed with serrated teeth.',
      color: '#b91c1c'
    },
    triceratops: {
      name: 'Triceratops',
      scientific: 'Triceratops horridus',
      era: 'Late Cretaceous (68-66 Mya)',
      diet: 'Herbivore',
      weight: '6 Metric Tons',
      fact: 'Its famous massive skull frill could exceed 7 feet across and was likely used for both protection and courtship.',
      description: 'A robust, three-horned herbivorous quadruped that grazed low-lying foliage. Its beak-like mouth easily sheared palm fronds.',
      color: '#15803d'
    },
    stego: {
      name: 'Stegosaurus',
      scientific: 'Stegosaurus stenops',
      era: 'Late Jurassic (155-150 Mya)',
      diet: 'Herbivore',
      weight: '4.5 Metric Tons',
      fact: 'Despite its giant size, the Stegosaurus had an incredibly tiny brain, roughly the size of a walnut!',
      description: 'A heavily armored dinosaur with an arched back and upright triangular plates, ending in a thagomizer tail weapon with 4 spines.',
      color: '#b45309'
    }
  };

  const [activeDinoKey, setActiveDinoKey] = useState<keyof typeof dinoDatabase>('triceratops');
  const activeDino = dinoDatabase[activeDinoKey];
  const [foodSpawned, setFoodSpawned] = useState(false);
  const [dinoAction, setDinoAction] = useState('Idling');

  const dinoGroupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const foodRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // dino gentle breathing and tail swing
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * 1.5) * 0.15;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 0.8) * 0.08;
      headRef.current.rotation.y = Math.cos(time * 0.5) * 0.06;
    }

    // handle feeding movement
    if (foodSpawned && foodRef.current && dinoGroupRef.current) {
      // Rotate and float food item
      foodRef.current.rotation.y = time * 2;
      foodRef.current.position.y = 0.5 + Math.sin(time * 4) * 0.05;

      // simulate dinosaur leaning head towards food
      if (headRef.current) {
        headRef.current.rotation.x = 0.2 + Math.sin(time * 3) * 0.08;
      }
    }
  });

  const handleFeed = () => {
    if (foodSpawned) return;
    setFoodSpawned(true);
    setDinoAction('Approaching foliage...');
    discoverObject('feed_friendly_dinosaurs');

    setTimeout(() => {
      setDinoAction('Eating...');
      setTimeout(() => {
        setFoodSpawned(false);
        setDinoAction('Satisfied & Idling');
      }, 1500);
    }, 2000);
  };

  const selectDino = (key: keyof typeof dinoDatabase) => {
    setActiveDinoKey(key);
    setFoodSpawned(false);
    setDinoAction('Idling');
    discoverObject(`dino_safari_${key}`);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: activeDinoKey,
      name: activeDino.name + ` (${activeDino.scientific})`,
      category: 'Paleontology',
      description: activeDino.description,
      funFact: activeDino.fact,
    });
  };

  return (
    <group position={[0, 0, -1.5]}>
      {/* Fact Log HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-emerald-400 uppercase">Prehistoric Safari</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🦕 Dino Species</h3>

          <div className="flex flex-col gap-1 mt-1">
            {Object.entries(dinoDatabase).map(([key, dino]) => (
              <button
                key={key}
                onClick={() => selectDino(key as any)}
                style={{ borderColor: activeDinoKey === key ? activeDino.color : 'rgba(255,255,255,0.05)' }}
                className={`flex justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                  activeDinoKey === key
                    ? 'bg-zinc-900 text-white font-black'
                    : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{dino.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-col gap-1 text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            <div>🦖 <span className="text-white">Era:</span> {activeDino.era}</div>
            <div>🍖 <span className="text-white">Diet:</span> {activeDino.diet}</div>
            <div>⚖️ <span className="text-white">Weight:</span> {activeDino.weight}</div>
            <div className="text-[7.5px] text-emerald-400 font-bold border border-emerald-500/20 rounded p-1.5 bg-emerald-500/5 mt-1">
              STATUS: {dinoAction}
            </div>
          </div>

          <button
            onClick={handleFeed}
            className="mt-1 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            {foodSpawned ? 'FEEDING...' : 'FEED DINOSAUR 🍃'}
          </button>
        </div>
      </Html>

      {/* 3D Dino Mesh Group */}
      <group ref={dinoGroupRef} position={[0, 0, 0]} onClick={handleInspect}>
        {/* Ground pedestal shadow */}
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial color="#000" transparent opacity={0.4} />
        </mesh>

        {/* --- DINOSAUR 1: TRICERATOPS MESH --- */}
        {activeDinoKey === 'triceratops' && (
          <group position={[0, 0.1, 0]}>
            {/* Core Body */}
            <mesh>
              <boxGeometry args={[0.7, 0.5, 1.2]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>

            {/* Shield Neck Frill */}
            <mesh position={[0, 0.4, -0.45]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.9, 0.7, 0.08]} />
              <meshStandardMaterial color="#166534" roughness={0.9} />
            </mesh>

            {/* Head and Beak */}
            <group ref={headRef} position={[0, 0.25, -0.65]}>
              <mesh>
                <boxGeometry args={[0.3, 0.35, 0.45]} />
                <meshStandardMaterial color={activeDino.color} roughness={0.9} />
              </mesh>
              {/* Horn 1 Left */}
              <mesh position={[-0.1, 0.25, -0.1]} rotation={[0.4, 0, 0]}>
                <coneGeometry args={[0.04, 0.3, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.5} />
              </mesh>
              {/* Horn 2 Right */}
              <mesh position={[0.1, 0.25, -0.1]} rotation={[0.4, 0, 0]}>
                <coneGeometry args={[0.04, 0.3, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.5} />
              </mesh>
              {/* Horn 3 Nose */}
              <mesh position={[0, 0.1, -0.22]} rotation={[0.2, 0, 0]}>
                <coneGeometry args={[0.03, 0.12, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.5} />
              </mesh>
            </group>

            {/* Tail */}
            <mesh ref={tailRef} position={[0, 0.08, 0.75]} rotation={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.02, 0.7, 8]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>

            {/* Thick Legs */}
            <mesh position={[-0.28, -0.35, -0.3]}>
              <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.9} />
            </mesh>
            <mesh position={[0.28, -0.35, -0.3]}>
              <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.9} />
            </mesh>
            <mesh position={[-0.28, -0.35, 0.3]}>
              <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.9} />
            </mesh>
            <mesh position={[0.28, -0.35, 0.3]}>
              <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* --- DINOSAUR 2: TYRANNOSAURUS REX MESH --- */}
        {activeDinoKey === 'trex' && (
          <group position={[0, 0.3, 0]} rotation={[0, -0.4, 0]}>
            {/* Horizontal Theropod Body */}
            <mesh position={[0, 0.1, 0]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.45, 0.55, 1.1]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>

            {/* Head and massive jaws */}
            <group ref={headRef} position={[0, 0.55, -0.55]}>
              {/* Skull */}
              <mesh>
                <boxGeometry args={[0.3, 0.35, 0.55]} />
                <meshStandardMaterial color="#991b1b" roughness={0.9} />
              </mesh>
              {/* Lower Jaw */}
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.26, 0.1, 0.5]} />
                <meshStandardMaterial color={activeDino.color} roughness={0.9} />
              </mesh>
            </group>

            {/* Heavy Balancer Tail */}
            <mesh ref={tailRef} position={[0, -0.05, 0.7]} rotation={[-0.25, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.01, 1.0, 8]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>

            {/* Massive hind bipedal legs */}
            <mesh position={[-0.25, -0.35, 0.1]}>
              <cylinderGeometry args={[0.08, 0.06, 0.7, 8]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
            </mesh>
            <mesh position={[0.25, -0.35, 0.1]}>
              <cylinderGeometry args={[0.08, 0.06, 0.7, 8]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
            </mesh>

            {/* Tiny arms */}
            <mesh position={[-0.2, 0.25, -0.4]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.04, 0.15, 0.04]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>
            <mesh position={[0.2, 0.25, -0.4]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.04, 0.15, 0.04]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* --- DINOSAUR 3: STEGOSAURUS MESH --- */}
        {activeDinoKey === 'stego' && (
          <group position={[0, 0.15, 0]}>
            {/* Back arched body */}
            <mesh>
              <boxGeometry args={[0.5, 0.6, 1.1]} />
              <meshStandardMaterial color={activeDino.color} roughness={0.9} />
            </mesh>

            {/* Tiny head at lower neck */}
            <group ref={headRef} position={[0, -0.05, -0.75]}>
              <mesh>
                <boxGeometry args={[0.16, 0.18, 0.3]} />
                <meshStandardMaterial color={activeDino.color} roughness={0.9} />
              </mesh>
            </group>

            {/* Tail with Spikes (Thagomizer) */}
            <group ref={tailRef} position={[0, 0.02, 0.75]}>
              <mesh rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.015, 0.8, 8]} />
                <meshStandardMaterial color={activeDino.color} roughness={0.9} />
              </mesh>
              {/* Spikes */}
              <mesh position={[-0.1, 0.2, 0.2]} rotation={[0, 0, -1]}>
                <coneGeometry args={[0.015, 0.15, 4]} />
                <meshStandardMaterial color="#000" roughness={0.3} />
              </mesh>
              <mesh position={[0.1, 0.2, 0.2]} rotation={[0, 0, 1]}>
                <coneGeometry args={[0.015, 0.15, 4]} />
                <meshStandardMaterial color="#000" roughness={0.3} />
              </mesh>
            </group>

            {/* Triangular plates on back */}
            <mesh position={[0, 0.45, -0.3]} rotation={[0.3, 0, 0.5]}>
              <boxGeometry args={[0.04, 0.25, 0.25]} />
              <meshStandardMaterial color="#9a3412" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.48, 0.1]} rotation={[-0.2, 0, -0.5]}>
              <boxGeometry args={[0.04, 0.28, 0.28]} />
              <meshStandardMaterial color="#9a3412" roughness={0.9} />
            </mesh>

            {/* Four legs */}
            <mesh position={[-0.22, -0.4, -0.28]}>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.9} />
            </mesh>
            <mesh position={[0.22, -0.4, -0.28]}>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.9} />
            </mesh>
            <mesh position={[-0.22, -0.4, 0.28]}>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.9} />
            </mesh>
            <mesh position={[0.22, -0.4, 0.28]}>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.9} />
            </mesh>
          </group>
        )}
      </group>

      {/* Floating feeding foliage */}
      {foodSpawned && (
        <mesh ref={foodRef} position={[0, 0.5, -1.05]}>
          <dodecahedronGeometry args={[0.15]} />
          <meshStandardMaterial color="#22c55e" roughness={0.6} emissive="#15803d" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}
export default DinosaurSafari;
