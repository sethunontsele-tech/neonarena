import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

export function AnatomyExplorer() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [visibleLayers, setVisibleLayers] = useState({
    skin: true,
    muscles: true,
    bones: true,
    organs: true,
    nerves: true,
    vessels: true,
  });

  const bodyRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);
  const leftLungRef = useRef<THREE.Mesh>(null);
  const rightLungRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Slow idle rotation of the entire body
    if (bodyRef.current) {
      bodyRef.current.rotation.y = time * 0.25;
    }

    // pulsating heart (cardiology heartbeat loop)
    if (heartRef.current) {
      const beat = 1 + Math.sin(time * 7) * 0.08 * (Math.sin(time * 3.5) > 0 ? 1 : 0.15);
      heartRef.current.scale.set(beat, beat, beat);
    }

    // lungs expanding and contracting
    if (leftLungRef.current && rightLungRef.current) {
      const breathe = 1 + Math.sin(time * 1.8) * 0.06;
      leftLungRef.current.scale.set(breathe, breathe, 1);
      rightLungRef.current.scale.set(breathe, breathe, 1);
    }
  });

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => {
      const updated = { ...prev, [layer]: !prev[layer] };
      discoverObject(`anatomy_peel_${layer}`);
      return updated;
    });
  };

  const handleInspect = (part: string, description: string, fact: string) => {
    setSelectedObject({
      id: `anatomy_${part.toLowerCase()}`,
      name: part,
      category: 'Human Physiology',
      description,
      funFact: fact,
    });
  };

  return (
    <group position={[0, 0, -1]}>
      {/* Interactive HUD */}
      <Html position={[-1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-pink-400 uppercase">Interactive Layers</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Anatomy Explorer</h3>
          
          <div className="flex flex-col gap-1.5 mt-2">
            {Object.entries(visibleLayers).map(([layer, isVisible]) => (
              <button
                key={layer}
                onClick={() => toggleLayer(layer as any)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all ${
                  isVisible
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-400'
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{layer}</span>
                <span className="text-[8px] font-black">{isVisible ? 'SHOWING' : 'HIDDEN'}</span>
              </button>
            ))}
          </div>
        </div>
      </Html>

      {/* Anatomy 3D Figures Group */}
      <group ref={bodyRef} position={[0, 0.2, 0]}>
        {/* Outer translucent skin silhouette */}
        {visibleLayers.skin && (
          <mesh 
            position={[0, 0.8, 0]}
            onClick={(e) => {
              e.stopPropagation();
              handleInspect(
                'Epidermis & Dermis',
                'The skin is the largest organ of the human body, acting as a flexible, protective shield against microbes, temperature changes, and dehydration.',
                'An average adult carries around 8 pounds (3.6 kilograms) of skin!'
              );
            }}
          >
            <cylinderGeometry args={[0.32, 0.2, 1.8, 16]} />
            <meshStandardMaterial 
              color="#fda4af" 
              transparent 
              opacity={0.18} 
              wireframe={false}
              roughness={0.4}
            />
          </mesh>
        )}

        {/* Muscular representation (Core musculature) */}
        {visibleLayers.muscles && (
          <mesh 
            position={[0, 0.8, 0]}
            onClick={(e) => {
              e.stopPropagation();
              handleInspect(
                'Skeletal Muscles',
                'Composed of specialized contractile fibers, muscles generate torque across joints to execute walking, lifting, and respiratory lung compression.',
                'The human body has over 600 distinct muscles, accounting for roughly 40% of our body weight.'
              );
            }}
          >
            <cylinderGeometry args={[0.26, 0.16, 1.7, 16]} />
            <meshStandardMaterial 
              color="#f43f5e" 
              transparent 
              opacity={visibleLayers.skin ? 0.35 : 0.8}
              roughness={0.8}
            />
          </mesh>
        )}

        {/* Skeletal spine and limbs */}
        {visibleLayers.bones && (
          <group>
            {/* Skull */}
            <mesh 
              position={[0, 1.75, 0]}
              onClick={(e) => {
                e.stopPropagation();
                handleInspect(
                  'Cranium (Skull)',
                  'A solid bony structure made of 22 fused bones that protects the brain, sensory structures, and anchors facial muscles.',
                  'At birth, babies have gaps (fontanelles) that gradually fuse into solid bone as they grow.'
                );
              }}
            >
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshStandardMaterial color="#fef08a" roughness={0.9} />
            </mesh>

            {/* Spine */}
            <mesh position={[0, 0.8, -0.05]}>
              <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
              <meshStandardMaterial color="#fef08a" roughness={0.9} />
            </mesh>

            {/* Ribcage */}
            <mesh 
              position={[0, 1.1, 0]}
              onClick={(e) => {
                e.stopPropagation();
                handleInspect(
                  'Thoracic Cage (Ribs)',
                  'A curved, protective bone cage enclosing the heart and lungs, supporting the chest cavity during respiratory breathing.',
                  'Humans usually have 12 pairs of ribs, making 24 ribs total!'
                );
              }}
            >
              <torusGeometry args={[0.22, 0.08, 8, 32]} />
              <meshStandardMaterial color="#fef08a" roughness={0.9} wireframe />
            </mesh>
          </group>
        )}

        {/* Vital Organs */}
        {visibleLayers.organs && (
          <group position={[0, 1.1, 0]}>
            {/* Beating Heart */}
            <mesh 
              ref={heartRef} 
              position={[0.02, 0.1, 0.06]}
              onClick={(e) => {
                e.stopPropagation();
                handleInspect(
                  'Myocardium (Heart)',
                  'The core muscular pump of the cardiovascular system. It continuously contracts and relaxes to route oxygen-rich blood to systemic cells.',
                  'Your heart beats about 100,000 times a day, pumping around 2,000 gallons (7,570 liters) of blood!'
                );
              }}
            >
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Left Lung */}
            <mesh 
              ref={leftLungRef} 
              position={[-0.09, 0, 0.02]}
              onClick={(e) => {
                e.stopPropagation();
                handleInspect(
                  'Lungs (Pulmonary)',
                  'Spongy, air-filled organs where gas exchange occurs. Red blood cells absorb oxygen and release carbon dioxide during ventilation cycles.',
                  'The surface area of your lungs is roughly the size of a tennis court to maximize oxygen absorption!'
                );
              }}
            >
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#fda4af" roughness={0.7} />
            </mesh>

            {/* Right Lung */}
            <mesh ref={rightLungRef} position={[0.09, 0, 0.02]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#fda4af" roughness={0.7} />
            </mesh>
          </group>
        )}

        {/* Nervous System */}
        {visibleLayers.nerves && (
          <group>
            {/* Brain */}
            <mesh 
              position={[0, 1.78, 0.02]}
              onClick={(e) => {
                e.stopPropagation();
                handleInspect(
                  'Cerebrum (Brain)',
                  'The primary command hub of the central nervous system, coordinating speech, motor control, memory, and cognitive lessons.',
                  'The human brain contains approximately 86 billion neurons communicating through trillions of synaptic portals!'
                );
              }}
            >
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#d8b4fe" roughness={0.5} />
            </mesh>
            {/* Nerve Lines */}
            <mesh position={[-0.1, 0.7, 0.05]} rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.005, 0.005, 1.1, 4]} />
              <meshBasicMaterial color="#a78bfa" />
            </mesh>
            <mesh position={[0.1, 0.7, 0.05]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.005, 0.005, 1.1, 4]} />
              <meshBasicMaterial color="#a78bfa" />
            </mesh>
          </group>
        )}

        {/* Cardiovascular Vessels */}
        {visibleLayers.vessels && (
          <group>
            {/* Aorta (Red Arteries) */}
            <mesh position={[0.02, 0.6, 0.08]}>
              <cylinderGeometry args={[0.01, 0.005, 1.2, 4]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            {/* Vena Cava (Blue Veins) */}
            <mesh position={[-0.02, 0.6, 0.08]}>
              <cylinderGeometry args={[0.01, 0.005, 1.2, 4]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
export default AnatomyExplorer;
