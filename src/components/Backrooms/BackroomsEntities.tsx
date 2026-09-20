import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BackroomsEntityState, EntityType, BackroomsLevelId } from './types';
import { backroomsAudio } from './backroomsAudio';
import { soundService } from '../../services/soundService';

interface BackroomsEntitiesProps {
  levelId: BackroomsLevelId;
  playerPos: [number, number, number];
  playerLookingDir: THREE.Vector3;
  isPlayerSprinting: boolean;
  isPlayerCrouching: boolean;
  isFlashlightOn: boolean;
  onAttackPlayer: (damage: number, attackerName: string) => void;
  onEntityDefeated: (entity: BackroomsEntityState) => void;
}

export function BackroomsEntities({
  levelId,
  playerPos,
  playerLookingDir,
  isPlayerSprinting,
  isPlayerCrouching,
  isFlashlightOn,
  onAttackPlayer,
  onEntityDefeated
}: BackroomsEntitiesProps) {
  const [entities, setEntities] = useState<BackroomsEntityState[]>([]);
  const entityRefs = useRef<Record<string, THREE.Group | null>>({});

  // Spawn initial level-specific entities
  useEffect(() => {
    const spawned: BackroomsEntityState[] = [];
    const count = levelId === 0 ? 4 : levelId === 1 ? 6 : levelId === 2 ? 7 : levelId === 3 ? 5 : 6;

    const typesForLevel: EntityType[] = 
      levelId === 0 ? ['smiler', 'hound', 'duller'] :
      levelId === 1 ? ['bacteria', 'hound', 'smiler'] :
      levelId === 2 ? ['bacteria', 'duller', 'smiler'] :
      levelId === 3 ? ['bacteria', 'hound', 'duller'] :
      levelId === 4 ? ['faceling', 'duller', 'smiler'] :
      ['faceling', 'hound', 'smiler'];

    for (let i = 0; i < count; i++) {
      const type = typesForLevel[i % typesForLevel.length];
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 25 + Math.random() * 35;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      let name = 'Luminescent Shade';
      let hp = 140;
      let spd = 4.2;
      let dmg = 18;

      if (type === 'bacteria') {
        name = 'Cable Strangler';
        hp = 220;
        spd = 3.8;
        dmg = 28;
      } else if (type === 'duller') {
        name = 'Hollow Lurker';
        hp = 120;
        spd = 5.0;
        dmg = 24;
      } else if (type === 'hound') {
        name = 'Crawler Entity';
        hp = 160;
        spd = 5.8;
        dmg = 20;
      } else if (type === 'faceling') {
        name = 'Silent Nomad';
        hp = 280;
        spd = 3.2;
        dmg = 32;
      }

      spawned.push({
        id: `entity_${levelId}_${i}_${Date.now()}`,
        type,
        name,
        position: [x, type === 'bacteria' ? 1.8 : 1.2, z],
        rotation: Math.random() * Math.PI * 2,
        health: hp,
        maxHealth: hp,
        speed: spd,
        state: 'patrol',
        targetPos: [x + (Math.random() - 0.5) * 20, 1.2, z + (Math.random() - 0.5) * 20],
        alertLevel: 0,
        isEnraged: false,
        lastAttackTime: 0,
        attackCooldown: 1500,
        detectionRadius: type === 'bacteria' ? 35 : 28,
        damage: dmg
      });
    }

    setEntities(spawned);
  }, [levelId]);

  // Main AI loop
  useFrame((state, delta) => {
    const pPos = new THREE.Vector3(...playerPos);
    const now = Date.now();

    setEntities((prev) =>
      prev.map((ent) => {
        if (ent.state === 'dead') return ent;

        const group = entityRefs.current[ent.id];
        const ePos = group ? group.position : new THREE.Vector3(...ent.position);
        const distToPlayer = ePos.distanceTo(pPos);

        // Vector from entity to player
        const toPlayer = new THREE.Vector3().subVectors(pPos, ePos).normalize();
        toPlayer.y = 0;

        // Check if player is facing the entity
        const playerToEnt = new THREE.Vector3().subVectors(ePos, pPos).normalize();
        const dotFace = playerLookingDir.dot(playerToEnt);
        const isPlayerLookingAt = dotFace > 0.65; // true if within front ~80 deg cone

        let nextState = ent.state;
        let nextSpeed = ent.speed;
        let nextAlert = ent.alertLevel;
        let isAttackingNow = false;

        // ============================================
        // 1. UNIQUE AI: Luminescent Shade ("Smiler")
        // ============================================
        if (ent.type === 'smiler') {
          if (distToPlayer < ent.detectionRadius) {
            if (isPlayerLookingAt && isFlashlightOn) {
              // Intimidated by direct eye contact: freezes in place
              nextState = 'stalk';
              nextSpeed = 0.5;
              nextAlert = 0.5;
            } else if (!isPlayerLookingAt || isPlayerSprinting) {
              // Player turned away or started running: CHARGE!
              nextState = 'charge';
              nextSpeed = 7.6;
              nextAlert = 1.0;
            }
          } else {
            nextState = 'patrol';
            nextSpeed = 2.8;
          }
        }

        // ============================================
        // 2. UNIQUE AI: Cable Strangler ("Bacteria")
        // Blind, reacts to SOUND (sprint, jump, gunshots)
        // ============================================
        else if (ent.type === 'bacteria') {
          const isMakingNoise = isPlayerSprinting || (!isPlayerCrouching && distToPlayer < 12);
          if (distToPlayer < ent.detectionRadius && isMakingNoise) {
            nextState = 'charge';
            nextSpeed = 5.2;
            nextAlert = 1.0;
            if (ent.alertLevel < 0.5) {
              backroomsAudio.playEntityRoar('bacteria');
            }
          } else if (distToPlayer < ent.detectionRadius && isPlayerCrouching) {
            // Player is crouch-sneaking: wandering blindly
            nextState = 'patrol';
            nextSpeed = 2.0;
            nextAlert = 0.1;
          } else {
            nextState = 'patrol';
            nextSpeed = 2.5;
          }
        }

        // ============================================
        // 3. UNIQUE AI: Hollow Lurker ("Duller")
        // Ambush predator: sneaks from behind, freezes when watched
        // ============================================
        else if (ent.type === 'duller') {
          if (distToPlayer < ent.detectionRadius) {
            if (isPlayerLookingAt) {
              // Player spotted it: freeze or retreat back
              nextState = 'stalk';
              nextSpeed = -1.5; // Backs away into shadows
              nextAlert = 0.4;
            } else {
              // Sneak up rapidly from behind
              nextState = 'charge';
              nextSpeed = 6.2;
              nextAlert = 0.9;
            }
          }
        }

        // ============================================
        // 4. UNIQUE AI: Crawler Entity ("Hound")
        // Fast quadruped, intimidated by steady flashlight, leaps if fleeing
        // ============================================
        else if (ent.type === 'hound') {
          if (distToPlayer < ent.detectionRadius) {
            if (isPlayerLookingAt && isFlashlightOn) {
              // Backs up while growling
              nextState = 'flee';
              nextSpeed = -2.0;
              nextAlert = 0.6;
            } else {
              // Relentless pursuit
              nextState = 'charge';
              nextSpeed = 6.5;
              nextAlert = 1.0;
            }
          }
        }

        // ============================================
        // 5. UNIQUE AI: Silent Nomad ("Faceling")
        // Neutral unless attacked
        // ============================================
        else if (ent.type === 'faceling') {
          if (ent.isEnraged) {
            nextState = 'charge';
            nextSpeed = 4.8;
            nextAlert = 1.0;
          } else {
            nextState = 'patrol';
            nextSpeed = 2.2;
          }
        }

        // Movement application
        if (group) {
          if (nextState === 'charge') {
            ePos.addScaledVector(toPlayer, nextSpeed * delta);
            const targetRot = Math.atan2(toPlayer.x, toPlayer.z);
            group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRot, 0.1);
          } else if (nextState === 'flee') {
            ePos.addScaledVector(toPlayer, nextSpeed * delta);
          } else if (nextState === 'patrol' && ent.targetPos) {
            const target = new THREE.Vector3(...ent.targetPos);
            const toTarget = new THREE.Vector3().subVectors(target, ePos).normalize();
            toTarget.y = 0;
            ePos.addScaledVector(toTarget, nextSpeed * delta);

            if (ePos.distanceTo(target) < 2) {
              // Pick new patrol point
              ent.targetPos = [
                ePos.x + (Math.random() - 0.5) * 30,
                ePos.y,
                ePos.z + (Math.random() - 0.5) * 30
              ];
            }
          }

          // Damage player on contact
          if (distToPlayer < 2.0 && now - ent.lastAttackTime > ent.attackCooldown) {
            isAttackingNow = true;
            onAttackPlayer(ent.damage, ent.name);
            backroomsAudio.playEntityRoar(ent.type);
            try {
              soundService.playSFX('hit');
            } catch (e) {}
          }
        }

        return {
          ...ent,
          position: [ePos.x, ePos.y, ePos.z],
          state: nextState,
          alertLevel: nextAlert,
          lastAttackTime: isAttackingNow ? now : ent.lastAttackTime
        };
      })
    );
  });

  // Weapon damage receiver from player
  const handleTakeDamage = (entityId: string, dmg: number) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          const newHp = Math.max(0, e.health - dmg);
          soundService.playSFX('hit');
          if (newHp === 0) {
            onEntityDefeated(e);
            return { ...e, health: 0, state: 'dead' };
          }
          return { ...e, health: newHp, isEnraged: true, state: 'charge' };
        }
        return e;
      })
    );
  };

  return (
    <group name="backrooms_entities">
      {entities.map((ent) => {
        if (ent.state === 'dead') return null;

        return (
          <group
            key={ent.id}
            ref={(el) => (entityRefs.current[ent.id] = el)}
            position={ent.position}
            onClick={() => handleTakeDamage(ent.id, 50)} // Click / Melee target fallback
          >
            {/* =========================================
                1. SMILER (Luminescent Shade)
            ========================================= */}
            {ent.type === 'smiler' && (
              <group position={[0, 0.4, 0]}>
                {/* Shadowy body veil */}
                <mesh>
                  <sphereGeometry args={[0.9, 16, 16]} />
                  <meshBasicMaterial color="#000000" transparent opacity={0.9} />
                </mesh>
                {/* Piercing white neon eyes */}
                <mesh position={[-0.3, 0.35, 0.8]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0.3, 0.35, 0.8]}>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Unsettling wide jagged grin */}
                <mesh position={[0, -0.15, 0.82]}>
                  <boxGeometry args={[0.8, 0.25, 0.1]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <pointLight color="#ffffff" intensity={1.8} distance={8} />
              </group>
            )}

            {/* =========================================
                2. BACTERIA (Cable Strangler)
            ========================================= */}
            {ent.type === 'bacteria' && (
              <group position={[0, 0, 0]}>
                {/* Tall tangled wire trunk */}
                <mesh position={[0, 1.8, 0]}>
                  <cylinderGeometry args={[0.35, 0.5, 3.6, 12]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.8} />
                </mesh>
                {/* Spindly wire arms */}
                <mesh position={[0.8, 2.2, 0.4]} rotation={[0.4, 0.3, -0.6]}>
                  <cylinderGeometry args={[0.08, 0.08, 2.4, 8]} />
                  <meshStandardMaterial color="#171717" />
                </mesh>
                <mesh position={[-0.8, 2.0, 0.4]} rotation={[0.3, -0.4, 0.7]}>
                  <cylinderGeometry args={[0.08, 0.08, 2.6, 8]} />
                  <meshStandardMaterial color="#171717" />
                </mesh>
                {/* Creepy twitching tendril crown */}
                <mesh position={[0, 3.6, 0]}>
                  <sphereGeometry args={[0.4, 8, 8]} />
                  <meshBasicMaterial color="#1c1917" wireframe />
                </mesh>
              </group>
            )}

            {/* =========================================
                3. DULLER (Hollow Lurker)
            ========================================= */}
            {ent.type === 'duller' && (
              <group position={[0, 0.2, 0]}>
                {/* Ashen hunchbacked torso */}
                <mesh position={[0, 0.8, 0]}>
                  <boxGeometry args={[0.7, 1.2, 0.6]} />
                  <meshStandardMaterial color="#44403c" roughness={0.9} />
                </mesh>
                {/* Hollow black eye sockets */}
                <mesh position={[0, 1.4, 0.2]}>
                  <sphereGeometry args={[0.25, 12, 12]} />
                  <meshStandardMaterial color="#292524" />
                </mesh>
              </group>
            )}

            {/* =========================================
                4. HOUND (Crawler Entity)
            ========================================= */}
            {ent.type === 'hound' && (
              <group position={[0, 0.3, 0]}>
                {/* Low quadruped body */}
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[0.8, 0.5, 1.6]} />
                  <meshStandardMaterial color="#1c1917" roughness={0.8} />
                </mesh>
                {/* Glowing predator eyes */}
                <mesh position={[-0.2, 0.55, 0.85]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <mesh position={[0.2, 0.55, 0.85]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <pointLight color="#ef4444" intensity={1.5} distance={6} />
              </group>
            )}

            {/* =========================================
                5. FACELING (Silent Nomad)
            ========================================= */}
            {ent.type === 'faceling' && (
              <group position={[0, 0.6, 0]}>
                {/* Vintage office suit torso */}
                <mesh position={[0, 0.8, 0]}>
                  <boxGeometry args={[0.65, 1.3, 0.45]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Blank faceless flesh mannequin head */}
                <mesh position={[0, 1.6, 0]}>
                  <sphereGeometry args={[0.26, 16, 16]} />
                  <meshStandardMaterial color="#d6d3d1" roughness={0.4} />
                </mesh>
              </group>
            )}

            {/* Floating Health Bar & Alert State UI */}
            <Html position={[0, 2.5, 0]} center distanceFactor={14}>
              <div className="flex flex-col items-center gap-1 select-none pointer-events-none">
                <div className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-wider ${
                  ent.state === 'charge'
                    ? 'bg-rose-950/95 text-rose-300 border border-rose-500 animate-pulse'
                    : 'bg-black/85 text-zinc-400 border border-white/20'
                }`}>
                  {ent.name} [{ent.state.toUpperCase()}]
                </div>
                {/* Health Bar */}
                <div className="w-20 bg-black/90 rounded-full h-1.5 overflow-hidden border border-white/20">
                  <div
                    className={`h-full transition-all duration-300 ${
                      ent.health / ent.maxHealth > 0.5 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(ent.health / ent.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
