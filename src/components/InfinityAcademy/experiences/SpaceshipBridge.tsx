import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface LaserBeam {
  id: number;
  position: [number, number, number];
  zSpeed: number;
}

interface Asteroid {
  id: number;
  position: [number, number, number];
  size: number;
  speed: number;
  destroyed: boolean;
}

export function SpaceshipBridge() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [shieldLevel, setShieldLevel] = useState(100);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameScore, setGameScore] = useState(0);

  const bridgeRef = useRef<THREE.Group>(null);
  const laserBeamsRef = useRef<LaserBeam[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const laserIdCounter = useRef(0);
  const asteroidIdCounter = useRef(0);

  // Generate background warp stars
  const starCount = 300;
  const starData = useMemo(() => {
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;      // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;  // Y
      arr[i * 3 + 2] = -Math.random() * 20;        // Z
    }
    return arr;
  }, []);

  const starPointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Animate warp stars flying towards bridge
    if (starPointsRef.current) {
      const geo = starPointsRef.current.geometry;
      const posAttr = geo.attributes.position;
      const warpSpeed = delta * 15 * speedMultiplier;

      for (let i = 0; i < starCount; i++) {
        let z = posAttr.getZ(i);
        z += warpSpeed;
        if (z > 2) {
          z = -20; // wrap star to back
          posAttr.setX(i, (Math.random() - 0.5) * 8);
          posAttr.setY(i, (Math.random() - 0.5) * 8);
        }
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    }

    // 2. Spawn Asteroids periodically
    if (asteroidsRef.current.length < 5 && Math.random() < 0.015) {
      asteroidsRef.current.push({
        id: asteroidIdCounter.current++,
        position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, -18],
        size: 0.15 + Math.random() * 0.25,
        speed: 1.5 + Math.random() * 2,
        destroyed: false,
      });
    }

    // 3. Move Asteroids
    asteroidsRef.current = asteroidsRef.current
      .map(ast => ({
        ...ast,
        position: [ast.position[0], ast.position[1], ast.position[2] + delta * ast.speed * speedMultiplier] as [number, number, number]
      }))
      .filter(ast => {
        // If hits shield
        if (ast.position[2] >= 0.2 && !ast.destroyed) {
          setShieldLevel(prev => {
            const next = Math.max(0, prev - Math.round(ast.size * 50));
            if (next === 0) {
              // reset shield level after a few seconds
              setTimeout(() => setShieldLevel(100), 5000);
            }
            return next;
          });
          return false; // remove asteroid
        }
        return ast.position[2] < 1 && !ast.destroyed;
      });

    // 4. Move and Collide Lasers
    laserBeamsRef.current = laserBeamsRef.current
      .map(beam => ({
        ...beam,
        position: [beam.position[0], beam.position[1], beam.position[2] - delta * beam.zSpeed] as [number, number, number]
      }))
      .filter(beam => {
        // Check collision with any asteroid
        let hit = false;
        asteroidsRef.current.forEach(ast => {
          if (!ast.destroyed && Math.abs(beam.position[2] - ast.position[2]) < 0.6) {
            const dist = Math.sqrt(
              Math.pow(beam.position[0] - ast.position[0], 2) +
              Math.pow(beam.position[1] - ast.position[1], 2)
            );
            if (dist < ast.size + 0.15) {
              ast.destroyed = true;
              hit = true;
              setGameScore(prev => prev + 100);
              discoverObject('destroy_spaceship_asteroid');
            }
          }
        });
        return beam.position[2] > -20 && !hit;
      });
  });

  const fireLasers = () => {
    laserBeamsRef.current.push({
      id: laserIdCounter.current++,
      position: [-0.45, -0.2, -0.5],
      zSpeed: 20
    });
    laserBeamsRef.current.push({
      id: laserIdCounter.current++,
      position: [0.45, -0.2, -0.5],
      zSpeed: 20
    });
    discoverObject('spaceship_laser_fire');
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'spaceship_helm',
      name: 'Spaceship Command Helm',
      category: 'Aeronautics & Astrophysics',
      description: 'The tactical interface of a long-range exploration ship. Features sub-light thruster toggles, phased laser triggers, and kinetic shield emitters.',
      funFact: 'In vacuum space, there is no air to carry sound waves, meaning real starship laser blasts and engine burns are completely silent!'
    });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Flight Control HUD */}
      <Html position={[1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-cyan-400 uppercase">Spaceship Bridge</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">🚀 Starship Helm</h3>

          <div className="flex flex-col gap-1 border-t border-white/5 pt-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            <div className="flex justify-between">
              <span>SHIELD STATUS</span>
              <span className={shieldLevel > 30 ? 'text-cyan-400' : 'text-red-500 animate-pulse'}>{shieldLevel}%</span>
            </div>
            <div className="w-full bg-white/5 h-1 border border-white/5 rounded-full overflow-hidden mt-0.5">
              <div className="bg-cyan-400 h-full transition-all" style={{ width: `${shieldLevel}%` }} />
            </div>

            <div className="flex justify-between mt-2">
              <span>TACTICAL SCORE</span>
              <span className="text-white font-black">{gameScore}PTS</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <button
              onClick={fireLasers}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              🔥 DEPLOY WEAPONS
            </button>

            <button
              onClick={() => {
                setSpeedMultiplier(prev => (prev === 1 ? 4 : prev === 4 ? 0.2 : 1));
                discoverObject('hyperdrive_engaged');
              }}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              🚀 VELOCITY: {speedMultiplier === 4 ? 'WARP SPEED' : speedMultiplier === 0.2 ? 'ORBITAL' : 'IMPULSE'}
            </button>
          </div>
        </div>
      </Html>

      {/* Cockpit Canopy Dashboard Grid */}
      <group ref={bridgeRef} onClick={handleInspect}>
        {/* Sleek dashboard structure */}
        <mesh position={[0, -0.4, -0.2]}>
          <boxGeometry args={[1.5, 0.2, 0.4]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Holographic scanner projection */}
        <mesh position={[0, -0.25, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} wireframe />
        </mesh>

        {/* Framing Struts */}
        <mesh position={[-0.7, 0.3, -0.3]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <meshBasicMaterial color="#1c1917" />
        </mesh>
        <mesh position={[0.7, 0.3, -0.3]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <meshBasicMaterial color="#1c1917" />
        </mesh>
      </group>

      {/* Background Starfield Points */}
      <points ref={starPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starData, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.06} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>

      {/* Render flying Lasers */}
      {laserBeamsRef.current.map(beam => (
        <group key={beam.id} position={beam.position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 4]} />
            <meshBasicMaterial color="#ef4444" blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* Render drifting Asteroids */}
      {asteroidsRef.current.map(ast => (
        <mesh key={ast.id} position={ast.position} rotation={[Math.sin(ast.id), Math.cos(ast.id), 0]}>
          <dodecahedronGeometry args={[ast.size]} />
          <meshStandardMaterial 
            color="#44403c" 
            roughness={1} 
            emissive={ast.destroyed ? '#f59e0b' : '#000000'}
            emissiveIntensity={ast.destroyed ? 2.5 : 0}
            transparent={ast.destroyed}
            opacity={ast.destroyed ? 0.0 : 1.0}
          />
        </mesh>
      ))}
    </group>
  );
}
export default SpaceshipBridge;
