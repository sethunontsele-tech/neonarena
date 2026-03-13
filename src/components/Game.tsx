/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Arena } from './Arena';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { OtherPlayer } from './OtherPlayer';
import { Flags } from './Flag';
import { Effects } from './Effects';
import { JumpPad } from './JumpPad';
import { Projectiles } from './Projectiles';
import { useGameStore } from '../store';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { useShallow } from 'zustand/react/shallow';

function GameLoop() {
  const updateTime = useGameStore(state => state.updateTime);
  const updateEnemies = useGameStore(state => state.updateEnemies);
  const updateProjectiles = useGameStore(state => state.updateProjectiles);
  const cleanupEffects = useGameStore(state => state.cleanupEffects);

  useFrame((_, delta) => {
    const now = Date.now();
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

  return (
    <Canvas shadows camera={{ fov: 75 }}>
      <color attach="background" args={['#050510']} />
      <fogExp2 attach="fog" args={['#050510', 0.025]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 25, 0]} intensity={3.0} castShadow distance={150} color="#00d4ff" />
      <pointLight position={[60, 20, 60]} intensity={2.0} castShadow distance={120} color="#ff8c00" />
      <pointLight position={[-60, 20, -60]} intensity={2.0} castShadow distance={120} color="#00d4ff" />
      <pointLight position={[60, 20, -60]} intensity={2.0} castShadow distance={120} color="#ff8c00" />
      <pointLight position={[-60, 20, 60]} intensity={2.0} castShadow distance={120} color="#00d4ff" />
      
      <Physics gravity={[0, -20, 0]}>
        <GameLoop />
        <Arena />
        <Player />
        {enemies.map(enemy => (
          <Enemy key={enemy.id} data={enemy} />
        ))}
        {otherPlayerIds.map(id => (
          <OtherPlayer key={id} id={id} />
        ))}
        {jumpPads.map(pad => (
          <JumpPad key={pad.id} position={pad.position} power={pad.power} />
        ))}
        <Flags />
        <Projectiles />
        <Effects />
      </Physics>

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={2.5} radius={0.4} />
      </EffectComposer>
    </Canvas>
  );
}
