import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralLevels } from './ProceduralLevels';
import { BackroomsEntities } from './BackroomsEntities';
import { BackroomsBossArena } from './BackroomsBossArena';
import { BackroomsLevelId, BackroomsItem, BackroomsRandomEvent, BackroomsEntityState } from './types';
import { backroomsAudio } from './backroomsAudio';
import { soundService } from '../../services/soundService';
import { useGameStore } from '../../store';

interface BackroomsWorldProps {
  levelId: BackroomsLevelId;
  playerPos: [number, number, number];
  isPlayerSprinting: boolean;
  isPlayerCrouching: boolean;
  isFlashlightOn: boolean;
  onLevelChange: (newLevel: BackroomsLevelId) => void;
  onPickupItem: (item: BackroomsItem) => void;
  onAttackPlayer: (damage: number, attackerName: string) => void;
  onExitBackrooms: () => void;
}

export function BackroomsWorld({
  levelId,
  playerPos,
  isPlayerSprinting,
  isPlayerCrouching,
  isFlashlightOn,
  onLevelChange,
  onPickupItem,
  onAttackPlayer,
  onExitBackrooms
}: BackroomsWorldProps) {
  const [seed, setSeed] = useState(42819 + levelId * 100);
  const [activeEvent, setActiveEvent] = useState<BackroomsRandomEvent | null>(null);

  // Player view direction vector for gaze tracking (Smiler / Duller AI)
  const playerDir = useRef(new THREE.Vector3(0, 0, -1));

  // Determine if boss arena should be active (Level 3 or Level 5 grand chamber)
  const isBossLevel = levelId === 5;

  // Random Event Interval (spawns unpredictable liminal events)
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.25) {
        // Total Blackout event
        setActiveEvent({
          type: 'blackout',
          title: 'LIGHTS MALFUNCTION',
          description: 'Fluorescent power grid tripped. Total darkness!',
          duration: 12,
          remainingTime: 12
        });
        backroomsAudio.playFlicker();
      } else if (roll < 0.5) {
        // Reality Shift
        setActiveEvent({
          type: 'hallway_shift',
          title: 'CORRIDOR REARRANGEMENT',
          description: 'The geometry around you is shifting...',
          duration: 8,
          remainingTime: 8
        });
        setSeed((s) => s + 1);
        try {
          soundService.playSFX('dimension_shift');
        } catch (e) {}
      } else if (roll < 0.75) {
        // Distant Whispers / Hallucinations
        setActiveEvent({
          type: 'whispers',
          title: 'PARANOIA SPIKE',
          description: 'Unintelligible whispers echo down the corridor.',
          duration: 15,
          remainingTime: 15
        });
        backroomsAudio.playEntityRoar('smiler');
      }
    }, 45000); // Check every 45s

    return () => clearInterval(eventInterval);
  }, []);

  // Update Event Timer
  useFrame((state, delta) => {
    if (activeEvent) {
      const rem = activeEvent.remainingTime - delta;
      if (rem <= 0) {
        setActiveEvent(null);
      } else {
        setActiveEvent({ ...activeEvent, remainingTime: rem });
      }
    }
  });

  // Handle Level Elevators
  const handleElevatorMove = (targetLevel: BackroomsLevelId) => {
    onLevelChange(targetLevel);
    setSeed(Date.now() % 100000);
    try {
      soundService.playSFX('dimension_shift');
    } catch (e) {}
  };

  // Handle Hazard damage
  const handleHazardDamage = (dmg: number, type: string) => {
    onAttackPlayer(dmg, type);
  };

  // Handle Secret Unlock in Level 999
  const handleUnlockSecret = () => {
    useGameStore.getState().addEvent('🏆 SECRET UNLOCKED: LEVEL 999 DEVELOPER ANOMALY CLEARED!');
    soundService.playSFX('quest_complete');
    onExitBackrooms();
  };

  return (
    <group name="backrooms_dimension_master">
      {/* 1. Procedural Corridor & Room Maze */}
      <ProceduralLevels
        levelId={levelId}
        seed={seed}
        playerPos={playerPos}
        onInteractElevator={handleElevatorMove}
        onPickupItem={onPickupItem}
        onTakeHazardDamage={handleHazardDamage}
        onUnlockSecret={handleUnlockSecret}
      />

      {/* 2. Original Backrooms Creatures with AI */}
      <BackroomsEntities
        levelId={levelId}
        playerPos={playerPos}
        playerLookingDir={playerDir.current}
        isPlayerSprinting={isPlayerSprinting}
        isPlayerCrouching={isPlayerCrouching}
        isFlashlightOn={isFlashlightOn}
        onAttackPlayer={onAttackPlayer}
        onEntityDefeated={(ent: BackroomsEntityState) => {
          useGameStore.getState().addEvent(`💀 ENTITY NEUTRALIZED: ${ent.name}`);
        }}
      />

      {/* 3. Multi-Phase Boss Encounter (in Level 5 or designated boss sector) */}
      {isBossLevel && (
        <BackroomsBossArena
          playerPos={playerPos}
          onAttackPlayer={onAttackPlayer}
          onBossDefeated={() => {
            useGameStore.getState().addEvent('👑 THE HARVESTER HAS FALLEN! REALITY EXIT OPENED!');
          }}
          onExitBackrooms={onExitBackrooms}
        />
      )}
    </group>
  );
}
