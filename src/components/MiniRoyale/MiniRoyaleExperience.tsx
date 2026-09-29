import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store';
import { soundService } from '../../services/soundService';
import { 
  MAP_SIZE, 
  HALF_MAP, 
  MAX_HP, 
  MAX_SHIELD, 
  MINI_ROYALE_WEAPONS, 
  BOT_NAMES, 
  ZONE_PHASES 
} from './data';
import { BotOpponent, LootItemData, MiniRoyaleWeapon } from './types';
import { MiniRoyaleMap3D } from './MiniRoyaleMap3D';
import { MiniRoyaleBots3D } from './MiniRoyaleBots3D';
import { MiniRoyaleHUD } from './MiniRoyaleHUD';
import { DirectionalDamageHUD } from '../DirectionalDamageHUD';

interface MiniRoyaleExperienceProps {
  onReturnToLobby: () => void;
}

export const MiniRoyaleExperience: React.FC<MiniRoyaleExperienceProps> = ({ onReturnToLobby }) => {
  // Player Match State
  const [health, setHealth] = useState(MAX_HP);
  const [shield, setShield] = useState(50);
  const [kills, setKills] = useState(0);
  const [currentWeaponIdx, setCurrentWeaponIdx] = useState(1); // AR
  const [magAmmo, setMagAmmo] = useState(MINI_ROYALE_WEAPONS[1].magSize);
  const [reserveAmmo, setReserveAmmo] = useState(MINI_ROYALE_WEAPONS[1].reserveAmmo);
  const [grenadeCount, setGrenadeCount] = useState(3);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [isADS, setIsADS] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isAimLocked, setIsAimLocked] = useState(false);
  const [matchOver, setMatchOver] = useState<'victory' | 'defeat' | null>(null);

  // Position & Look
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 3.5, 0]);
  const [playerYaw, setPlayerYaw] = useState(0);

  // Zone State
  const [zoneRadius, setZoneRadius] = useState<number>(HALF_MAP);
  const [zonePhaseIdx, setZonePhaseIdx] = useState(0);
  const [zoneTimer, setZoneTimer] = useState(ZONE_PHASES[0].delay);
  const [isZoneShrinking, setIsZoneShrinking] = useState(false);
  const [isOutsideZone, setIsOutsideZone] = useState(false);

  // Killfeed & Match Statistics
  const [killFeed, setKillFeed] = useState<{ id: string; killer: string; victim: string; weapon: string }[]>([]);
  const [matchStartTime] = useState(Date.now());
  const [damageDealt, setDamageDealt] = useState(0);

  // Initialize 35 Bots
  const [bots, setBots] = useState<BotOpponent[]>(() => {
    const list: BotOpponent[] = [];
    const colors = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x06b6d4, 0x84cc16];
    for (let i = 0; i < 35; i++) {
      const x = (Math.random() - 0.5) * MAP_SIZE * 0.85;
      const z = (Math.random() - 0.5) * MAP_SIZE * 0.85;
      list.push({
        id: `bot_${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        x,
        z,
        y: 2.5,
        health: MAX_HP,
        maxHealth: MAX_HP,
        shield: 50,
        speed: 4.5 + Math.random() * 3.5,
        sightRange: 45 + Math.random() * 25,
        accuracy: 0.16 + Math.random() * 0.1,
        damage: 14 + Math.random() * 8,
        fireRate: 0.4 + Math.random() * 0.5,
        fireTimer: Math.random() * 2,
        state: 'wander',
        stateTimer: Math.random() * 5,
        targetX: x + (Math.random() - 0.5) * 40,
        targetZ: z + (Math.random() - 0.5) * 40,
        targetEntityId: null,
        alive: true,
        color: colors[i % colors.length],
        hasHat: Math.random() > 0.4,
        hatColor: Math.random() > 0.5 ? 0x27272a : 0x713f12
      });
    }
    return list;
  });

  // Initialize 100 Loot Items
  const [lootItems, setLootItems] = useState<LootItemData[]>(() => {
    const types: { type: LootItemData['type']; label: string; color: number; emoji: string }[] = [
      { type: 'health', label: '+30 HP Medkit', color: 0x22c55e, emoji: '❤' },
      { type: 'ammo', label: '+30 Ammo Box', color: 0xeab308, emoji: '🔫' },
      { type: 'shield', label: '+25 Shield Potion', color: 0x3b82f6, emoji: '🛡' },
      { type: 'grenade', label: '+1 Frag Grenade', color: 0xf97316, emoji: '💣' },
    ];
    const items: LootItemData[] = [];
    for (let i = 0; i < 100; i++) {
      const t = types[i % types.length];
      const x = (Math.random() - 0.5) * MAP_SIZE * 0.88;
      const z = (Math.random() - 0.5) * MAP_SIZE * 0.88;
      items.push({
        id: `loot_${i}`,
        x,
        z,
        type: t.type,
        label: t.label,
        color: t.color,
        emoji: t.emoji,
        collected: false
      });
    }
    return items;
  });

  const aliveBotsCount = useMemo(() => bots.filter(b => b.alive).length, [bots]);
  const totalAlive = aliveBotsCount + (health > 0 ? 1 : 0);

  // Current Weapon
  const currentWeapon = MINI_ROYALE_WEAPONS[currentWeaponIdx];

  // Nearest Loot Detection
  const nearestLoot = useMemo(() => {
    let closest: LootItemData | null = null;
    let minD = 4.5;
    for (const item of lootItems) {
      if (item.collected) continue;
      const d = Math.hypot(item.x - playerPos[0], item.z - playerPos[2]);
      if (d < minD) {
        minD = d;
        closest = item;
      }
    }
    return closest;
  }, [lootItems, playerPos]);

  // Zone Shrink Loop
  useEffect(() => {
    if (matchOver) return;

    const interval = setInterval(() => {
      setZoneTimer((prev) => {
        if (prev <= 1) {
          // Trigger next phase or shrinking
          if (!isZoneShrinking && zonePhaseIdx < ZONE_PHASES.length) {
            setIsZoneShrinking(true);
            return 30; // Shrink duration
          } else if (isZoneShrinking) {
            setIsZoneShrinking(false);
            const nextIdx = zonePhaseIdx + 1;
            setZonePhaseIdx(nextIdx);
            return nextIdx < ZONE_PHASES.length ? ZONE_PHASES[nextIdx].delay : 0;
          }
          return 0;
        }
        return prev - 1;
      });

      // Gradually shrink radius if shrinking
      if (isZoneShrinking && zonePhaseIdx < ZONE_PHASES.length) {
        const targetR = ZONE_PHASES[zonePhaseIdx].target;
        setZoneRadius(r => Math.max(targetR, r - 3.5));
      }

      // Check if player is outside zone
      const distFromCenter = Math.hypot(playerPos[0], playerPos[2]);
      const outside = distFromCenter > zoneRadius;
      setIsOutsideZone(outside);

      if (outside && health > 0) {
        // Take storm damage!
        const stormDmg = 4 + zonePhaseIdx * 2;
        setHealth(h => {
          const nextH = Math.max(0, h - stormDmg);
          if (nextH <= 0) {
            setMatchOver('defeat');
          }
          return nextH;
        });
        useGameStore.getState().takeDamage(stormDmg, false, 'STORM DANGER ZONE', undefined, undefined, 'hazard');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [zoneRadius, zonePhaseIdx, isZoneShrinking, playerPos, health, matchOver]);

  // Bots AI simulation & firefights loop
  useEffect(() => {
    if (matchOver) return;

    const botInterval = setInterval(() => {
      setBots(prevBots => {
        return prevBots.map(bot => {
          if (!bot.alive) return bot;

          let { x, z, targetX, targetZ, state, stateTimer, fireTimer, health: bHealth } = bot;

          // Check if outside zone - move toward center!
          const distToCenter = Math.hypot(x, z);
          if (distToCenter > zoneRadius) {
            targetX = 0;
            targetZ = 0;
          }

          // Distance to player
          const distToPlayer = Math.hypot(x - playerPos[0], z - playerPos[2]);

          // Combat targeting
          if (distToPlayer < bot.sightRange && health > 0) {
            state = 'combat';
            targetX = playerPos[0];
            targetZ = playerPos[2];

            // Bot shooting at player!
            fireTimer += 0.2;
            if (fireTimer >= bot.fireRate) {
              fireTimer = 0;
              // Roll accuracy hit
              if (Math.random() < 0.65) {
                const dmg = Math.round(bot.damage);
                // Apply damage to shield then health
                setShield(s => {
                  if (s >= dmg) {
                    return s - dmg;
                  } else {
                    const remainingDmg = dmg - s;
                    setHealth(h => {
                      const nextH = Math.max(0, h - remainingDmg);
                      if (nextH <= 0) {
                        setMatchOver('defeat');
                      }
                      return nextH;
                    });
                    return 0;
                  }
                });

                // Trigger directional damage indicator pointing straight at the bot's 3D position!
                useGameStore.getState().takeDamage(dmg, false, bot.name, undefined, [x, 2.5, z], 'kinetic');
                try {
                  soundService.playSFX('hit');
                } catch(e) {}
              }
            }
          } else {
            // Wandering
            stateTimer -= 0.2;
            if (stateTimer <= 0) {
              state = 'wander';
              stateTimer = 3 + Math.random() * 5;
              targetX = x + (Math.random() - 0.5) * 60;
              targetZ = z + (Math.random() - 0.5) * 60;
            }
          }

          // Move toward target
          const dx = targetX - x;
          const dz = targetZ - z;
          const dist = Math.hypot(dx, dz);
          if (dist > 1.5) {
            x += (dx / dist) * bot.speed * 0.2;
            z += (dz / dist) * bot.speed * 0.2;
          }

          return {
            ...bot,
            x,
            z,
            targetX,
            targetZ,
            state,
            stateTimer,
            fireTimer,
            health: bHealth
          };
        });
      });
    }, 200);

    return () => clearInterval(botInterval);
  }, [playerPos, health, zoneRadius, matchOver]);

  // Bot vs Bot simulated firefights
  useEffect(() => {
    if (matchOver) return;

    const battleInterval = setInterval(() => {
      setBots(prevBots => {
        const aliveList = prevBots.filter(b => b.alive);
        if (aliveList.length <= 1) {
          if (aliveList.length === 0 && health > 0) {
            setMatchOver('victory');
          }
          return prevBots;
        }

        // Random bot clash
        const shooterIdx = Math.floor(Math.random() * aliveList.length);
        const targetIdx = (shooterIdx + 1) % aliveList.length;
        const shooter = aliveList[shooterIdx];
        const target = aliveList[targetIdx];

        const targetDmg = 25 + Math.random() * 25;
        const newTargetHealth = target.health - targetDmg;

        if (newTargetHealth <= 0) {
          // Elimination!
          const weapons = ['AR', 'Shotgun', 'Pistol', 'Grenade'];
          const usedWeapon = weapons[Math.floor(Math.random() * weapons.length)];
          setKillFeed(kf => [
            { id: Math.random().toString(), killer: shooter.name, victim: target.name, weapon: usedWeapon },
            ...kf.slice(0, 5)
          ]);
        }

        return prevBots.map(b => {
          if (b.id === target.id) {
            return {
              ...b,
              health: Math.max(0, newTargetHealth),
              alive: newTargetHealth > 0
            };
          }
          return b;
        });
      });
    }, 2400);

    return () => clearInterval(battleInterval);
  }, [health, matchOver]);

  // Shoot Action
  const handleShoot = () => {
    if (isReloading || magAmmo <= 0 || health <= 0 || matchOver) {
      if (magAmmo <= 0 && !isReloading) handleReload();
      return;
    }

    setMagAmmo(m => m - 1);
    try {
      soundService.playSFX('shoot');
    } catch(e) {}

    // Check hit against bots (Raycast cone)
    const forwardX = -Math.sin(playerYaw);
    const forwardZ = -Math.cos(playerYaw);

    let hitBot: BotOpponent | null = null;
    let closestDist = 70;

    for (const bot of bots) {
      if (!bot.alive) return;
      const dx = bot.x - playerPos[0];
      const dz = bot.z - playerPos[2];
      const dist = Math.hypot(dx, dz);
      if (dist < closestDist) {
        // Dot product with look direction
        const dirX = dx / dist;
        const dirZ = dz / dist;
        const dot = dirX * forwardX + dirZ * forwardZ;
        if (dot > 0.94) {
          closestDist = dist;
          hitBot = bot;
        }
      }
    }

    if (hitBot) {
      const dmg = currentWeapon.damage * (currentWeapon.pellets || 1);
      setDamageDealt(d => d + dmg);
      try {
        soundService.playSFX('hit');
      } catch(e) {}

      setBots(prev =>
        prev.map(b => {
          if (b.id === hitBot!.id) {
            const nextH = b.health - dmg;
            if (nextH <= 0) {
              setKills(k => k + 1);
              setKillFeed(kf => [
                { id: Math.random().toString(), killer: 'You', victim: b.name, weapon: currentWeapon.name },
                ...kf.slice(0, 5)
              ]);
              try {
                soundService.playSFX('kill');
              } catch(e) {}
              // Check if all bots dead -> VICTORY!
              if (bots.filter(ob => ob.alive && ob.id !== b.id).length === 0) {
                setMatchOver('victory');
              }
            }
            return { ...b, health: Math.max(0, nextH), alive: nextH > 0 };
          }
          return b;
        })
      );
    }
  };

  // Reload Action
  const handleReload = () => {
    if (isReloading || magAmmo >= currentWeapon.magSize || reserveAmmo <= 0) return;
    setIsReloading(true);
    setReloadProgress(0);
    try {
      soundService.playSFX('reload');
    } catch(e) {}

    const startTime = Date.now();
    const duration = currentWeapon.reloadTime * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setReloadProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        const needed = currentWeapon.magSize - magAmmo;
        const fill = Math.min(needed, reserveAmmo);
        setMagAmmo(m => m + fill);
        setReserveAmmo(r => r - fill);
        setIsReloading(false);
      }
    }, 50);
  };

  // Loot Pickup Action
  const handlePickup = () => {
    if (!nearestLoot || nearestLoot.collected) return;
    try {
      soundService.playSFX('pickup');
    } catch(e) {}

    if (nearestLoot.type === 'health') {
      setHealth(h => Math.min(MAX_HP, h + 30));
    } else if (nearestLoot.type === 'shield') {
      setShield(s => Math.min(MAX_SHIELD, s + 25));
    } else if (nearestLoot.type === 'ammo') {
      setReserveAmmo(a => a + 30);
    } else if (nearestLoot.type === 'grenade') {
      setGrenadeCount(g => g + 1);
    }

    setLootItems(items =>
      items.map(it => (it.id === nearestLoot.id ? { ...it, collected: true } : it))
    );
  };

  // Throw Grenade
  const handleThrowGrenade = () => {
    if (grenadeCount <= 0) return;
    setGrenadeCount(g => g - 1);
    try {
      soundService.playSFX('explode');
    } catch(e) {}

    // Explode 20 units ahead
    const targetX = playerPos[0] - Math.sin(playerYaw) * 22;
    const targetZ = playerPos[2] - Math.cos(playerYaw) * 22;

    // Damage bots in blast radius
    setBots(prev =>
      prev.map(b => {
        if (!b.alive) return b;
        const dist = Math.hypot(b.x - targetX, b.z - targetZ);
        if (dist < 12) {
          const dmg = Math.round(80 * (1 - dist / 12));
          const nextH = b.health - dmg;
          if (nextH <= 0) {
            setKills(k => k + 1);
            setKillFeed(kf => [
              { id: Math.random().toString(), killer: 'You', victim: b.name, weapon: 'Grenade' },
              ...kf.slice(0, 5)
            ]);
          }
          return { ...b, health: Math.max(0, nextH), alive: nextH > 0 };
        }
        return b;
      })
    );
  };

  // Check aim-lock reticle against enemies
  useEffect(() => {
    const forwardX = -Math.sin(playerYaw);
    const forwardZ = -Math.cos(playerYaw);
    let locked = false;

    for (const b of bots) {
      if (!b.alive) continue;
      const dx = b.x - playerPos[0];
      const dz = b.z - playerPos[2];
      const dist = Math.hypot(dx, dz);
      if (dist < 60) {
        const dirX = dx / dist;
        const dirZ = dz / dist;
        const dot = dirX * forwardX + dirZ * forwardZ;
        if (dot > 0.955) {
          locked = true;
          break;
        }
      }
    }
    setIsAimLocked(locked);
  }, [playerPos, playerYaw, bots]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') handlePickup();
      if (e.code === 'KeyR') handleReload();
      if (e.code === 'KeyG') handleThrowGrenade();
      if (e.code === 'KeyC') setIsCrouching(c => !c);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setIsSprinting(s => !s);
      if (e.code === 'Digit1') setCurrentWeaponIdx(0);
      if (e.code === 'Digit2') setCurrentWeaponIdx(1);
      if (e.code === 'Digit3') setCurrentWeaponIdx(2);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearestLoot, isReloading, magAmmo, grenadeCount]);

  const zoneTimeDisplay = `Zone ${zonePhaseIdx + 1} | ${Math.floor(zoneTimer / 60)}:${(zoneTimer % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 w-full h-full bg-black select-none overflow-hidden">
      {/* 1. 3D BATTLE ROYALE ENGINE CANVAS */}
      <Canvas
        camera={{ fov: isADS ? 45 : 75, near: 0.1, far: 1400, position: [0, 3.5, 0] }}
        shadows
        className="w-full h-full"
      >
        <Sky sunPosition={[120, 180, 90]} turbidity={6} rayleigh={0.6} />
        <ambientLight intensity={0.55} color="#8899bb" />
        <directionalLight 
          position={[120, 180, 90]} 
          intensity={1.3} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-near={0.5}
          shadow-camera-far={1200}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />

        <Physics gravity={[0, -25, 0]}>
          {/* 3D Map Environment */}
          <MiniRoyaleMap3D
            zoneRadius={zoneRadius}
            lootItems={lootItems}
            playerPos={playerPos}
          />

          {/* 35 AI Bots */}
          <MiniRoyaleBots3D
            bots={bots}
            playerPos={playerPos}
          />

          {/* Player First-Person Camera Rig Controller */}
          <MiniRoyalePlayerController
            isCrouching={isCrouching}
            isSprinting={isSprinting}
            isADS={isADS}
            onUpdatePos={(pos, yaw) => {
              setPlayerPos(pos);
              setPlayerYaw(yaw);
            }}
            onShoot={handleShoot}
          />
        </Physics>
      </Canvas>

      {/* 2. DIRECTIONAL DAMAGE INDICATOR HUD (Dynamic Tracking) */}
      <DirectionalDamageHUD />

      {/* 3. FREE FIRE STYLE BATTLE ROYALE HUD */}
      <MiniRoyaleHUD
        health={health}
        maxHealth={MAX_HP}
        shield={shield}
        maxShield={MAX_SHIELD}
        currentWeapon={currentWeapon}
        magAmmo={magAmmo}
        reserveAmmo={reserveAmmo}
        kills={kills}
        aliveCount={totalAlive}
        grenadeCount={grenadeCount}
        isReloading={isReloading}
        reloadProgress={reloadProgress}
        isAimLocked={isAimLocked}
        isADS={isADS}
        isCrouching={isCrouching}
        isSprinting={isSprinting}
        isOutsideZone={isOutsideZone}
        zoneTimerText={zoneTimeDisplay}
        isZoneShrinking={isZoneShrinking}
        playerPos={playerPos}
        playerYaw={playerYaw}
        bots={bots}
        lootItems={lootItems}
        killFeed={killFeed}
        nearestLoot={nearestLoot}
        onFireStart={handleShoot}
        onToggleADS={() => setIsADS(a => !a)}
        onToggleCrouch={() => setIsCrouching(c => !c)}
        onToggleSprint={() => setIsSprinting(s => !s)}
        onReload={handleReload}
        onThrowGrenade={handleThrowGrenade}
        onPickup={handlePickup}
        onSwitchWeapon={idx => setCurrentWeaponIdx(idx)}
      />

      {/* 4. EXIT / RETURN TO LOBBY BUTTON */}
      <button
        onClick={onReturnToLobby}
        className="absolute top-4 left-4 z-[140] px-3.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 backdrop-blur shadow-lg active:scale-95"
      >
        <span>◀ LOBBY</span>
      </button>

      {/* 5. MATCH RESULT OVERLAY (VICTORY ROYALE OR ELIMINATED) */}
      {matchOver && (
        <div className="absolute inset-0 z-[160] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative mb-6">
            <h1 className={`text-5xl sm:text-7xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] ${
              matchOver === 'victory' ? 'text-amber-400' : 'text-red-500'
            }`}>
              {matchOver === 'victory' ? '🏆 VICTORY ROYALE!' : 'ELIMINATED'}
            </h1>
            <div className="text-sm font-mono tracking-widest text-white/60 mt-1 uppercase">
              {matchOver === 'victory' ? '#1 / 36 PLAYERS' : `#${totalAlive} / 36 PLAYERS`}
            </div>
          </div>

          {/* Match Statistics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg mb-8">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="text-xs text-white/50 font-mono">ELIMINATIONS</div>
              <div className="text-3xl font-black text-red-400">{kills}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="text-xs text-white/50 font-mono">DAMAGE DEALT</div>
              <div className="text-3xl font-black text-amber-400">{Math.round(damageDealt)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="text-xs text-white/50 font-mono">SURVIVED</div>
              <div className="text-3xl font-black text-cyan-400">
                {Math.floor((Date.now() - matchStartTime) / 1000)}s
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="text-xs text-white/50 font-mono">RANK</div>
              <div className="text-3xl font-black text-emerald-400">
                {matchOver === 'victory' ? '#1' : `#${totalAlive}`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setHealth(MAX_HP);
                setShield(50);
                setKills(0);
                setMatchOver(null);
              }}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all text-sm"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={onReturnToLobby}
              className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-wider active:scale-95 transition-all text-sm"
            >
              RETURN TO LOBBY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Player First-Person Camera Rig & Movement Controller
function MiniRoyalePlayerController({
  isCrouching,
  isSprinting,
  isADS,
  onUpdatePos,
  onShoot
}: {
  isCrouching: boolean;
  isSprinting: boolean;
  isADS: boolean;
  onUpdatePos: (pos: [number, number, number], yaw: number) => void;
  onShoot: () => void;
}) {
  const { camera, gl } = useThree();
  const posRef = useRef(new THREE.Vector3(0, 3.5, 0));
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        yawRef.current -= e.movementX * 0.002;
        pitchRef.current -= e.movementY * 0.002;
        pitchRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitchRef.current));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!document.pointerLockElement) {
        gl.domElement.requestPointerLock?.();
      } else if (e.button === 0) {
        onShoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gl, onShoot]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const speed = (isSprinting ? 14 : isCrouching ? 4 : 8) * delta;

    const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current));
    const right = new THREE.Vector3(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current));

    if (keys['KeyW']) posRef.current.addScaledVector(forward, speed);
    if (keys['KeyS']) posRef.current.addScaledVector(forward, -speed);
    if (keys['KeyA']) posRef.current.addScaledVector(right, -speed);
    if (keys['KeyD']) posRef.current.addScaledVector(right, speed);

    // Height offset for crouch
    const targetY = isCrouching ? 2.2 : 3.5;
    posRef.current.y = THREE.MathUtils.lerp(posRef.current.y, targetY, delta * 10);

    // Camera positioning & rotation
    camera.position.copy(posRef.current);
    camera.rotation.set(0, 0, 0);
    camera.rotation.y = yawRef.current;
    camera.rotation.x = pitchRef.current;

    onUpdatePos([posRef.current.x, posRef.current.y, posRef.current.z], yawRef.current);
  });

  return null;
}
