import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BackroomsBossState } from './types';
import { backroomsAudio } from './backroomsAudio';
import { soundService } from '../../services/soundService';

interface BackroomsBossArenaProps {
  playerPos: [number, number, number];
  onAttackPlayer: (damage: number, attackerName: string) => void;
  onBossDefeated: () => void;
  onExitBackrooms: () => void;
}

export function BackroomsBossArena({
  playerPos,
  onAttackPlayer,
  onBossDefeated,
  onExitBackrooms
}: BackroomsBossArenaProps) {
  const bossGroupRef = useRef<THREE.Group>(null);

  // 4 Destructible Support Pillars
  const [pillars, setPillars] = useState<
    Array<{ id: number; pos: [number, number, number]; isDestroyed: boolean }>
  >([
    { id: 1, pos: [-12, 3, -12], isDestroyed: false },
    { id: 2, pos: [12, 3, -12], isDestroyed: false },
    { id: 3, pos: [-12, 3, 12], isDestroyed: false },
    { id: 4, pos: [12, 3, 12], isDestroyed: false }
  ]);

  const [boss, setBoss] = useState<BackroomsBossState>({
    id: 'boss_harvester',
    name: 'THE HARVESTER OF CORRIDORS',
    position: [0, 4, -20],
    rotation: 0,
    health: 2400,
    maxHealth: 2400,
    phase: 1,
    isInvulnerable: false,
    weakPointExposed: false,
    weakPointPos: [0, 4, -20],
    activeAttack: 'none',
    attackTimer: 0,
    pillarsRemaining: 4,
    state: 'active'
  });

  const [attackWarning, setAttackWarning] = useState<{
    type: string;
    pos: [number, number, number];
    radius: number;
  } | null>(null);

  const [isStunned, setIsStunned] = useState(false);
  const stunTimer = useRef(0);
  const nextAttackTime = useRef(Date.now() + 4000);

  // Boss AI & Movement Loop
  useFrame((state, delta) => {
    if (boss.state === 'defeated') return;
    const now = Date.now();
    const pPos = new THREE.Vector3(...playerPos);

    if (bossGroupRef.current) {
      const bPos = bossGroupRef.current.position;

      // Rotate boss towards player
      const toPlayer = new THREE.Vector3().subVectors(pPos, bPos).normalize();
      toPlayer.y = 0;
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      bossGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        bossGroupRef.current.rotation.y,
        targetAngle,
        0.05
      );

      // Handle Stun
      if (isStunned) {
        stunTimer.current -= delta;
        if (stunTimer.current <= 0) {
          setIsStunned(false);
        }
        return;
      }

      // Movement & Attack state machine
      if (now > nextAttackTime.current) {
        nextAttackTime.current = now + (boss.phase === 3 ? 3500 : 5000);

        // Pick attack based on Phase
        if (boss.phase === 1) {
          // Ground slam shockwave
          setAttackWarning({
            type: 'GROUND SEISMIC SLAM',
            pos: [bPos.x, 0.1, bPos.z],
            radius: 14
          });
          setTimeout(() => {
            backroomsAudio.playBossImpact();
            // Check distance
            const hitDist = Math.hypot(playerPos[0] - bPos.x, playerPos[2] - bPos.z);
            if (hitDist < 14) {
              onAttackPlayer(32, 'Harvester Seismic Shockwave');
            }
            setAttackWarning(null);
          }, 1200);
        } else if (boss.phase === 2) {
          // Ceiling Plunge onto player location!
          setAttackWarning({
            type: 'CEILING PLUNGE',
            pos: [playerPos[0], 0.1, playerPos[2]],
            radius: 8
          });
          // Expose weak point!
          setBoss((prev) => ({ ...prev, weakPointExposed: true }));

          setTimeout(() => {
            bPos.x = playerPos[0];
            bPos.z = playerPos[2];
            backroomsAudio.playBossImpact();
            const hitDist = Math.hypot(playerPos[0] - bPos.x, playerPos[2] - bPos.z);
            if (hitDist < 8) {
              onAttackPlayer(45, 'Harvester Ceiling Impact');
            }
            setAttackWarning(null);
            setTimeout(() => {
              setBoss((prev) => ({ ...prev, weakPointExposed: false }));
            }, 3000);
          }, 1500);
        } else {
          // Phase 3: Dimensional Barrage
          setAttackWarning({
            type: 'REALITY SHATTER BARRAGE',
            pos: [0, 0.1, 0],
            radius: 25
          });
          setTimeout(() => {
            backroomsAudio.playBossImpact();
            onAttackPlayer(38, 'Reality Distortion Surge');
            setAttackWarning(null);
          }, 1400);
        }
      }

      // Slowly advance toward player
      if (!isStunned && bPos.distanceTo(pPos) > 6) {
        const speed = boss.phase === 3 ? 3.5 : 2.2;
        bPos.addScaledVector(toPlayer, speed * delta);
      }

      // Check collision with support pillars (boss destroys pillars if charging)
      pillars.forEach((p) => {
        if (!p.isDestroyed) {
          const pDist = Math.hypot(bPos.x - p.pos[0], bPos.z - p.pos[2]);
          if (pDist < 4.0) {
            // Destroy pillar & stun boss!
            setPillars((prev) =>
              prev.map((item) => (item.id === p.id ? { ...item, isDestroyed: true } : item))
            );
            setIsStunned(true);
            stunTimer.current = 4.0;
            backroomsAudio.playBossImpact();
            soundService.playSFX('explosion');
          }
        }
      });
    }
  });

  // Handle damage from player's weapons
  const handleDamageBoss = (amount: number, isWeakPoint = false) => {
    if (boss.state === 'defeated') return;
    const finalDmg = isWeakPoint ? amount * 3.5 : amount;
    soundService.playSFX('hit');

    setBoss((prev) => {
      const nextHp = Math.max(0, prev.health - finalDmg);
      let nextPhase = prev.phase;

      if (nextHp <= prev.maxHealth * 0.33) {
        nextPhase = 3;
      } else if (nextHp <= prev.maxHealth * 0.66) {
        nextPhase = 2;
      }

      if (nextHp === 0) {
        soundService.playSFX('quest_complete');
        onBossDefeated();
        return { ...prev, health: 0, state: 'defeated' };
      }

      return {
        ...prev,
        health: nextHp,
        phase: nextPhase
      };
    });
  };

  return (
    <group name="backrooms_boss_arena" position={[0, 0, 80]}>
      {/* Boss Arena Grand Chamber (40x40m room) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#171717" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Arena Walls */}
      {[-25, 25].map((x) => (
        <mesh key={`b_wall_x_${x}`} position={[x, 4, 0]}>
          <boxGeometry args={[1, 8, 50]} />
          <meshStandardMaterial color="#262626" />
        </mesh>
      ))}
      {[-25, 25].map((z) => (
        <mesh key={`b_wall_z_${z}`} position={[0, 4, z]}>
          <boxGeometry args={[50, 8, 1]} />
          <meshStandardMaterial color="#262626" />
        </mesh>
      ))}

      {/* Massive Destructible Concrete Support Pillars */}
      {pillars.map((pil) => (
        <group key={pil.id} position={pil.pos}>
          {pil.isDestroyed ? (
            /* Crumbled concrete rubble heap */
            <mesh position={[0, -2, 0]}>
              <boxGeometry args={[3.2, 1.2, 3.2]} />
              <meshStandardMaterial color="#52525b" roughness={0.9} />
            </mesh>
          ) : (
            /* Full towering structural pillar */
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 8, 16]} />
              <meshStandardMaterial color="#71717a" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}

      {/* Attack Warning Decal on Floor */}
      {attackWarning && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={attackWarning.pos}>
          <ringGeometry args={[attackWarning.radius * 0.85, attackWarning.radius, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.75} />
        </mesh>
      )}

      {/* Boss Model */}
      {boss.state !== 'defeated' ? (
        <group
          ref={bossGroupRef}
          position={boss.position}
          onClick={() => handleDamageBoss(80, false)}
        >
          {/* Main Massive Torso (Concrete & Rebar Composite) */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[3.5, 4.5, 2.8]} />
            <meshStandardMaterial
              color="#18181b"
              roughness={0.9}
              metalness={0.6}
            />
          </mesh>

          {/* Exposed Corrupted Neon Core (Weak Point!) */}
          <mesh
            position={[0, 2.5, 1.5]}
            onClick={(e) => {
              e.stopPropagation();
              handleDamageBoss(120, true);
            }}
          >
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial
              color={boss.weakPointExposed ? '#ef4444' : '#eab308'}
              emissive={boss.weakPointExposed ? '#b91c1c' : '#854d0e'}
              emissiveIntensity={boss.weakPointExposed ? 2.5 : 0.8}
            />
          </mesh>

          {/* Flickering Fluorescent Spines on Back */}
          {[-1, 0, 1].map((offset, i) => (
            <mesh key={i} position={[offset * 1.2, 4.5, -1.2]} rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 3.2, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          ))}

          {/* Massive Heavy Arms */}
          <mesh position={[2.4, 2.0, 0.5]}>
            <boxGeometry args={[1.2, 3.8, 1.2]} />
            <meshStandardMaterial color="#27272a" />
          </mesh>
          <mesh position={[-2.4, 2.0, 0.5]}>
            <boxGeometry args={[1.2, 3.8, 1.2]} />
            <meshStandardMaterial color="#27272a" />
          </mesh>

          {/* Stunned Indicator */}
          {isStunned && (
            <Html position={[0, 6.5, 0]} center>
              <div className="bg-amber-400 text-black px-3 py-1 rounded-full font-mono text-xs font-black uppercase tracking-widest animate-bounce">
                ⚡ STUNNED (CRITICAL OPENING!)
              </div>
            </Html>
          )}
        </group>
      ) : (
        /* Boss Defeated: Golden Reality Exit Portal */
        <group position={[0, 2, 0]}>
          <mesh rotation={[0, Date.now() * 0.001, 0]}>
            <torusGeometry args={[3, 0.4, 16, 32]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={2} />
          </mesh>
          <pointLight color="#f59e0b" intensity={4} distance={15} />
          <Html position={[0, 4, 0]} center>
            <div className="bg-black/95 border-2 border-amber-400 p-4 rounded-2xl text-center flex flex-col items-center gap-2">
              <span className="font-mono text-sm font-black text-amber-400">
                🏆 HARVESTER VANQUISHED!
              </span>
              <span className="text-[10px] text-zinc-300">
                Reality tear stabilized. Take the golden gateway back to Neon Arena.
              </span>
              <button
                onClick={onExitBackrooms}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs uppercase rounded-lg transition-all"
              >
                RETURN TO NEON ARENA
              </button>
            </div>
          </Html>
        </group>
      )}

      {/* Large Epic Boss HUD Health Bar Overlay */}
      {boss.state !== 'defeated' && (
        <Html position={[0, 9, 0]} center distanceFactor={25}>
          <div className="w-80 bg-black/90 border-2 border-red-500/80 p-3 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.5)] flex flex-col gap-1.5 select-none pointer-events-none">
            <div className="flex justify-between items-center text-xs font-mono font-black">
              <span className="text-red-400 tracking-wider flex items-center gap-1.5">
                💀 {boss.name}
              </span>
              <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px]">
                PHASE {boss.phase} / 3
              </span>
            </div>
            {/* Health Track */}
            <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-red-500/30">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300"
                style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-400">
              <span>HP: {boss.health} / {boss.maxHealth}</span>
              {boss.weakPointExposed && (
                <span className="text-amber-400 font-bold animate-pulse">
                  🎯 CORE EXPOSED!
                </span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
