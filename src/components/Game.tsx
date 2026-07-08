/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { createXRStore, XR, useXR } from '@react-three/xr';

export const xrStore = createXRStore();
import { Arena } from './Arena';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { OtherPlayer } from './OtherPlayer';
import { Flags } from './Flag';
import { Effects } from './Effects';
import { JumpPad } from './JumpPad';
import { AlienAnimal } from './AlienAnimal';
import { AlienPet } from './AlienPet';
import { Projectiles } from './Projectiles';
import { Vehicle } from './Vehicle';
import { Soundscape } from './Soundscape';
import { HallwayEntity } from './HallwayEntity';
import { Portal } from './Portal';
import { PowerUps } from './PowerUps';
import { Sky } from './Sky';
import { Pings } from './Pings';
import { PerspectiveCamera } from 'three';
import { useGameStore } from '../store';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { useShallow } from 'zustand/react/shallow';

function LoadingPlaceholder() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

function ARTransparentHandler() {
  const { scene } = useThree();
  const xr = useXR();
  const isAR = (xr as any)?.mode === 'immersive-ar' || (xr?.session as any)?.mode === 'immersive-ar';

  React.useEffect(() => {
    if (isAR) {
      scene.background = null;
    } else {
      scene.background = new THREE.Color('#000000');
    }
  }, [isAR, scene]);

  return null;
}

function GameLoop() {
  const updateTime = useGameStore(state => state.updateTime);
  const updateEnemies = useGameStore(state => state.updateEnemies);
  const updateProjectiles = useGameStore(state => state.updateProjectiles);
  const cleanupEffects = useGameStore(state => state.cleanupEffects);
  
  const isReplaying = useGameStore(state => state.isReplaying);
  const replayTime = useGameStore(state => state.replayTime);
  const isReplayPaused = useGameStore(state => state.isReplayPaused);
  const replayPlaybackSpeed = useGameStore(state => state.replayPlaybackSpeed);
  const seekReplay = useGameStore(state => state.seekReplay);
  const currentReplay = useGameStore(state => state.currentReplay);
  const cameraPath = useGameStore(state => state.cameraPath);

  useFrame((state, delta) => {
    const now = Date.now();
    
    // If we are in replay mode, we don't update the game world normally
    if (isReplaying) {
      const snapshot = currentReplay.length > 0 ? currentReplay[Math.floor(replayTime)] : null;

      if (cameraPath.length >= 2) {
        // Find the segment we're in
        const nextPointIndex = cameraPath.findIndex(p => p.time > replayTime);
        if (nextPointIndex !== -1 && nextPointIndex > 0) {
          const p0 = cameraPath[nextPointIndex - 1];
          const p1 = cameraPath[nextPointIndex];
          const t = (replayTime - p0.time) / (p1.time - p0.time);
          
          state.camera.position.set(
            p0.x + (p1.x - p0.x) * t,
            p0.y + (p1.y - p0.y) * t,
            p0.z + (p1.z - p0.z) * t
          );
          // Look at the next point or a fixed target
          state.camera.lookAt(p1.x, p1.y, p1.z);
        } else if (snapshot?.camera) {
          state.camera.position.set(...snapshot.camera.position);
          state.camera.rotation.set(...snapshot.camera.rotation);
        }
      } else if (snapshot?.camera) {
        state.camera.position.set(...snapshot.camera.position);
        state.camera.rotation.set(...snapshot.camera.rotation);
        if (state.camera instanceof PerspectiveCamera) {
          state.camera.fov = snapshot.camera.fov;
        }
        state.camera.updateProjectionMatrix();
      }

      if (!isReplayPaused) {
        const nextTime = replayTime + delta * 10 * replayPlaybackSpeed; // 10Hz recording
        if (nextTime < currentReplay.length) {
          seekReplay(nextTime);
        } else {
          useGameStore.getState().setReplayPaused(true);
        }
      }
      return;
    }

    updateTime(delta);
    updateEnemies(now);
    updateProjectiles(delta);
    cleanupEffects(now);
  });
  return null;
}

export function Game() {
  const enemies = useGameStore(state => state.enemies);
  const otherPlayerIds = useGameStore(
    useShallow(state => Object.keys(state.otherPlayers))
  );
  const jumpPads = useGameStore(state => state.jumpPads);
  const vehicles = useGameStore(state => state.vehicles);
  const currentReplay = useGameStore(state => state.currentReplay);
  const replayTime = useGameStore(state => state.replayTime);
  
  const isReplaying = useGameStore(state => state.isReplaying);
  const snapshot = isReplaying && currentReplay.length > 0 ? currentReplay[Math.floor(replayTime)] : null;

  const petFollower = useGameStore(state => state.petFollower);
  const playerPosition = useGameStore(state => state.playerPosition);
  const playerPosVector = useMemo(() => new THREE.Vector3(...playerPosition), [playerPosition]);

  return (
    <Canvas 
      shadows={false} 
      dpr={[1, 1.5]} 
      gl={{ 
        powerPreference: "high-performance", 
        antialias: false, 
        preserveDrawingBuffer: false, 
        failIfMajorPerformanceCaveat: false,
        alpha: true
      }} 
      camera={{ fov: 75 }} 
      onCreated={({ scene }) => { scene.background = new THREE.Color('#000000'); }}
    >
      <XR store={xrStore}>
        <ARTransparentHandler />
        <ambientLight intensity={0.5} />
        <Sky />
        
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={<LoadingPlaceholder />}>
            <GameLoop />
            <Arena />
            
            {!isReplaying && <Player />}
            
            {/* Render Players & Enemies (Live or Replay) */}
          {isReplaying && snapshot ? (
            <>
              {Object.entries(snapshot.players).map(([id, data]: [string, any]) => (
                <OtherPlayer key={id} id={id} data={data} />
              ))}
              {(snapshot as any).enemies?.map((enemy: any) => (
                <Enemy key={enemy.id} data={enemy} />
              ))}
            </>
          ) : (
            <>
              {enemies.map(enemy => (
                <Enemy key={enemy.id} data={enemy} />
              ))}
              {otherPlayerIds.map(id => (
                <OtherPlayer key={id} id={id} />
              ))}
            </>
          )}

          {/* Render Vehicles (Live or Replay) */}
          {isReplaying && snapshot ? (
            Object.entries(snapshot.vehicles).map(([id, data]: [string, any]) => (
              <Vehicle key={id} data={data} />
            ))
          ) : (
            Object.values(vehicles).map(vehicle => (
              <Vehicle key={vehicle.id} data={vehicle} />
            ))
          )}

          {jumpPads.map(pad => (
            <JumpPad key={pad.id} position={pad.position} power={pad.power} />
          ))}
          <AlienAnimal />
          {petFollower !== 'none' && petFollower !== null && <AlienPet ownerPosition={playerPosVector} type={petFollower as any} />}
          <PowerUps />
          <Flags />
          <Projectiles />
          <Effects />
          <Pings />
          
          {/* VOID PROTOCOL: BACKROOMS INFINITE Custom Features */}
          <Soundscape />
          <Portal />
          <HallwayEntity />
          </Suspense>
        </Physics>

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.0} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </XR>
    </Canvas>
  );
}
