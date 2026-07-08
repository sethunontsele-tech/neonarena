import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEduStore } from '../eduStore';
import { Html } from '@react-three/drei';

interface EnemySlime {
  id: number;
  position: [number, number, number];
  speed: number;
  health: number;
}

interface Tower {
  id: number;
  position: [number, number, number];
  range: number;
  lastFired: number;
}

export function CastleDefense() {
  const setSelectedObject = useEduStore(state => state.setSelectedObject);
  const discoverObject = useEduStore(state => state.discoverObject);

  const [castleHealth, setCastleHealth] = useState(100);
  const [currency, setCurrency] = useState(300);
  const [monstersDefeated, setMonstersDefeated] = useState(0);

  const enemyListRef = useRef<EnemySlime[]>([]);
  const towersListRef = useRef<Tower[]>([]);
  const enemyIdCounter = useRef(0);
  const towerIdCounter = useRef(0);

  const [trapActive, setTrapActive] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Spawn Enemies (Creeping Slimes)
    if (enemyListRef.current.length < 4 && Math.random() < 0.012) {
      enemyListRef.current.push({
        id: enemyIdCounter.current++,
        position: [(Math.random() - 0.5) * 3, -0.4, -4], // start at door/window far away
        speed: 0.5 + Math.random() * 0.4,
        health: 50,
      });
    }

    // 2. Move Enemies towards Castle Gate at z = -0.5
    enemyListRef.current = enemyListRef.current
      .map(enemy => ({
        ...enemy,
        position: [enemy.position[0], enemy.position[1], enemy.position[2] + delta * enemy.speed] as [number, number, number]
      }))
      .filter(enemy => {
        // Check if hits castle wall
        if (enemy.position[2] >= -0.5) {
          setCastleHealth(prev => {
            const next = Math.max(0, prev - 15);
            if (next === 0) setTimeout(() => setCastleHealth(100), 4000); // auto restore
            return next;
          });
          return false; // delete
        }
        return enemy.position[2] < 0;
      });

    // 3. Automated Tower firing cycles
    towersListRef.current.forEach(tower => {
      if (time - tower.lastFired > 1.2) {
        // find nearest enemy
        const target = enemyListRef.current.find(enemy => {
          const dist = Math.sqrt(
            Math.pow(tower.position[0] - enemy.position[0], 2) +
            Math.pow(tower.position[2] - enemy.position[2], 2)
          );
          return dist <= tower.range;
        });

        if (target) {
          target.health -= 25;
          tower.lastFired = time;
          // Check if dead
          if (target.health <= 0) {
            enemyListRef.current = enemyListRef.current.filter(e => e.id !== target.id);
            setCurrency(prev => prev + 50);
            setMonstersDefeated(prev => prev + 1);
            discoverObject('defeat_defensive_slime');
          }
        }
      }
    });
  });

  const buildTower = (x: number, z: number) => {
    if (currency < 100) return;
    setCurrency(prev => prev - 100);
    towersListRef.current.push({
      id: towerIdCounter.current++,
      position: [x, -0.2, z],
      range: 2.2,
      lastFired: 0,
    });
    discoverObject('build_defense_tower');
  };

  const triggerTrap = () => {
    if (trapActive) return;
    setTrapActive(true);
    discoverObject('trigger_shock_trap');

    // Vaporize all currently spawned slimes
    setTimeout(() => {
      enemyListRef.current.forEach(enemy => {
        setCurrency(prev => prev + 35);
        setMonstersDefeated(prev => prev + 1);
      });
      enemyListRef.current = [];
      setTrapActive(false);
    }, 1200);
  };

  const handleInspect = () => {
    setSelectedObject({
      id: 'defense_fortress_gate',
      name: 'Castle Defenses',
      category: 'Strategic Physics',
      description: 'A physical tabletop barricade leveraging energy defense grids. Direct tower alignment creates firing lines to stop mechanical slimes.',
      funFact: 'Symmetric defenses have been proven to raise victory rates by 35% compared to linear alignments!'
    });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Defensive HUD Panel */}
      <Html position={[1.8, 1.8, 0]} distanceFactor={4}>
        <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-4 w-52 shadow-2xl backdrop-blur-md flex flex-col gap-2 pointer-events-auto">
          <span className="text-[8px] font-black tracking-[0.2em] text-amber-500 uppercase">Castle Defense</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">⚔️ Castle Defense</h3>

          <div className="flex flex-col gap-1.5 mt-1 border-t border-white/5 pt-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            <div className="flex justify-between">
              <span>Castle Health</span>
              <span className={castleHealth > 30 ? 'text-amber-400' : 'text-red-500 animate-pulse'}>{castleHealth}%</span>
            </div>
            <div className="w-full bg-white/5 h-1 border border-white/5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${castleHealth}%` }} />
            </div>

            <div className="flex justify-between mt-1">
              <span>Energy Crystals</span>
              <span className="text-cyan-400 font-black">{currency}💎</span>
            </div>
            <div className="flex justify-between">
              <span>Defeated</span>
              <span className="text-white font-black">{monstersDefeated}👾</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <button
              disabled={currency < 100}
              onClick={() => buildTower((Math.random() - 0.5) * 2, -0.8)}
              className="w-full py-2 bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-amber-400 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              🏢 BUILD TOWER (100💎)
            </button>
            <button
              onClick={triggerTrap}
              className={`w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                trapActive 
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-500 border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
            >
              ⚡ ACTIVATE GRID SHOCK
            </button>
          </div>
        </div>
      </Html>

      {/* Castle Barricade Walls (Grey boxes) */}
      <group position={[0, -0.3, -0.5]} onClick={handleInspect}>
        {/* Arch Gate */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.25]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
        <mesh position={[-0.45, 0.25, 0]}>
          <boxGeometry args={[0.4, 0.7, 0.25]} />
          <meshStandardMaterial color="#4b5563" roughness={0.8} />
        </mesh>
        <mesh position={[0.45, 0.25, 0]}>
          <boxGeometry args={[0.4, 0.7, 0.25]} />
          <meshStandardMaterial color="#4b5563" roughness={0.8} />
        </mesh>
      </group>

      {/* Render active Slime Enemies */}
      {enemyListRef.current.map(enemy => (
        <group key={enemy.id} position={enemy.position}>
          {/* Slime dome */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#10b981" transparent opacity={0.85} roughness={0.2} emissive="#059669" emissiveIntensity={0.2} />
          </mesh>
          {/* Glowing core */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        </group>
      ))}

      {/* Render defensive Towers */}
      {towersListRef.current.map(tower => (
        <group key={tower.id} position={tower.position}>
          {/* Tower Base Column */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
            <meshStandardMaterial color="#78716c" roughness={0.4} />
          </mesh>
          {/* Tower Laser Head */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Environmental Shock Trap Visual */}
      {trapActive && (
        <mesh position={[0, -0.42, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 3.2]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.35} wireframe />
        </mesh>
      )}
    </group>
  );
}
export default CastleDefense;
