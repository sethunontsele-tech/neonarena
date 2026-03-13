/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { RigidBody } from '@react-three/rapier';
import { Grid, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore, MapType } from '../store';

// Seeded PRNG for consistent multiplayer obstacle generation
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function generateObstacles(mapType: MapType) {
  const rng = mulberry32(12345);
  const obstacles = [];

  if (mapType === 'maze') {
    for (let i = 0; i < 150; i++) {
      const x = (rng() - 0.5) * 170;
      const z = (rng() - 0.5) * 170;
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      const height = rng() * 8 + 6;
      const isHorizontal = rng() > 0.5;
      const width = isHorizontal ? rng() * 25 + 10 : rng() * 3 + 1;
      const depth = isHorizontal ? rng() * 3 + 1 : rng() * 25 + 10;
      const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
      obstacles.push({ type: 'box', position: [x, height / 2 - 0.5, z], size: [width, height, depth], rotation: [0, 0, 0], color });
    }
  } else if (mapType === 'pillars') {
    for (let x = -80; x <= 80; x += 20) {
      for (let z = -80; z <= 80; z += 20) {
        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
        const height = rng() * 15 + 5;
        const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
        obstacles.push({ type: 'cylinder', position: [x, height / 2 - 0.5, z], size: [4, height, 4], rotation: [0, 0, 0], color });
      }
    }
  } else if (mapType === 'arena') {
    // Open arena with some cover
    for (let i = 0; i < 60; i++) {
      const x = (rng() - 0.5) * 160;
      const z = (rng() - 0.5) * 160;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      const size = rng() * 5 + 2;
      const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
      const y = rng() > 0.7 ? rng() * 10 + 5 : size / 2 - 0.5; // Some floating cubes
      obstacles.push({ type: 'box', position: [x, y, z], size: [size, size, size], rotation: [rng() * Math.PI, rng() * Math.PI, 0], color });
    }
    // Add some large central pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 30;
      const z = Math.sin(angle) * 30;
      obstacles.push({ type: 'cylinder', position: [x, 10, z], size: [8, 20, 8], rotation: [0, 0, 0], color: '#ff8c00' });
    }
  } else if (mapType === 'flat') {
    // No obstacles for flat map
  }

  return obstacles;
}

export const BLOCK_COLORS: Record<string, string> = {
  stone: '#888888',
  cobblestone: '#666666',
  dirt: '#5d4037',
  grass: '#4caf50',
  sand: '#fff176',
  gravel: '#9e9e9e',
  clay: '#90a4ae',
  bedrock: '#212121',
  oak_log: '#3e2723',
  oak_planks: '#a1887f',
  leaves: '#2e7d32',
  sapling: '#8bc34a',
  furnace: '#455a64',
  crafting_table: '#795548',
  chest: '#8d6e63',
  barrel: '#5d4037',
  anvil: '#263238',
  enchanting_table: '#b71c1c',
  coal_ore: '#424242',
  iron_ore: '#d7ccc8',
  gold_ore: '#fff176',
  diamond_ore: '#80deea',
  emerald_ore: '#a5d6a7',
  redstone_ore: '#ef5350',
  lapis_ore: '#3f51b5',
  redstone_dust: '#f44336',
  redstone_torch: '#d32f2f',
  lever: '#757575',
  button: '#9e9e9e',
  piston: '#4e342e',
  sticky_piston: '#388e3c',
  observer: '#37474f',
  door: '#5d4037',
  trapdoor: '#5d4037',
  ladder: '#8d6e63',
  rail: '#757575',
  powered_rail: '#fbc02d',
  torch: '#ffeb3b',
  lantern: '#ff9800',
  glowstone: '#fff59d',
  sea_lantern: '#e0f2f1',
  shroomlight: '#ff7043',
  water: '#2196f3',
  lava: '#ff5722',
  netherrack: '#7f0000',
  soul_sand: '#4e342e',
  nether_brick: '#2c0000',
  magma: '#bf360c',
  end_stone: '#f5f5dc',
  purpur: '#ab47bc',
  end_portal_frame: '#1b5e20',
  bricks: '#b71c1c',
  quartz: '#ffffff',
  concrete: '#cfd8dc',
  terracotta: '#a1887f',
};

export function Arena() {
  const selectedMap = useGameStore(state => state.selectedMap);
  const worldBlocks = useGameStore(state => state.worldBlocks);
  const obstacles = useMemo(() => generateObstacles(selectedMap), [selectedMap]);

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" name="floor" friction={0}>
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={selectedMap === 'flat' ? '#2e7d32' : '#050510'} roughness={0.2} metalness={0.8} />
        </mesh>
      </RigidBody>
      <Grid 
        position={[0, -0.49, 0]} 
        args={[300, 300]} 
        cellColor={selectedMap === 'flat' ? '#1b5e20' : '#00d4ff'} 
        sectionColor={selectedMap === 'flat' ? '#0d47a1' : '#ff8c00'} 
        fadeDistance={200} 
        cellThickness={1} 
        sectionThickness={2} 
        infiniteGrid
      />

      {/* World Blocks */}
      {worldBlocks.map((block) => (
        <RigidBody 
          key={block.id} 
          type="fixed" 
          position={block.position}
          name={`block-${block.id}`}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={BLOCK_COLORS[block.type] || '#ffffff'} 
              transparent={block.type === 'water' || block.type === 'leaves'}
              opacity={block.type === 'water' ? 0.6 : 1}
              emissive={block.type === 'lava' || block.type === 'glowstone' || block.type === 'sea_lantern' || block.type === 'shroomlight' ? BLOCK_COLORS[block.type] : '#000000'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Ceiling (Removed for open space feel) */}
      {/* <RigidBody type="fixed" name="ceiling">
        <mesh receiveShadow position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>
      </RigidBody> */}

      {/* Atmosphere */}
      <Stars radius={300} depth={100} count={10000} factor={6} saturation={1} fade speed={0.5} />
      <AmbientParticles />

      {/* Walls */}
      <Wall name="wall-n" position={[0, 5, -100]} rotation={[0, 0, 0]} />
      <Wall name="wall-s" position={[0, 5, 100]} rotation={[0, Math.PI, 0]} />
      <Wall name="wall-e" position={[100, 5, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Wall name="wall-w" position={[-100, 5, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Obstacles */}
      {obstacles.map((obs, i) => {
        return (
          <RigidBody 
            key={`${selectedMap}-${i}`} 
            type="fixed" 
            colliders="hull"
            name={`obstacle-${i}`}
            position={obs.position as [number, number, number]}
            rotation={obs.rotation as [number, number, number]}
          >
            <mesh receiveShadow castShadow>
              {obs.type === 'box' ? (
                <boxGeometry args={obs.size as [number, number, number]} />
              ) : (
                <cylinderGeometry args={[obs.size[0]/2, obs.size[0]/2, obs.size[1], 16]} />
              )}
              <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.5} />
              
              {/* Neon accent on obstacles */}
              <mesh position={[0, obs.size[1]/2 - 0.5, 0]}>
                {obs.type === 'box' ? (
                  <boxGeometry args={[obs.size[0] + 0.1, 0.2, obs.size[2] + 0.1]} />
                ) : (
                  <cylinderGeometry args={[obs.size[0]/2 + 0.1, obs.size[0]/2 + 0.1, 0.2, 16]} />
                )}
                <meshBasicMaterial color={obs.color} toneMapped={false} />
              </mesh>
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
}

function Wall({ name, position, rotation }: { name: string, position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      {/* Solid Wall */}
      <mesh>
        <boxGeometry args={[200, 10, 1]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Glowing Base Line */}
      <mesh position={[0, -4.5, 0.51]}>
        <planeGeometry args={[200, 1]} />
        <meshBasicMaterial color="#ff8c00" toneMapped={false} />
      </mesh>
      {/* Glowing Top Line */}
      <mesh position={[0, 4.5, 0.51]}>
        <planeGeometry args={[200, 1]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} />
      </mesh>
    </RigidBody>
  );
}

function AmbientParticles() {
  const count = 1500;
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      sizes[i] = Math.random() * 0.8 + 0.4; // Smaller particles
    }
    return [positions, sizes];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') } // White color
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          attribute float aSize;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            // Slow upward drift and wobble
            pos.y += uTime * 0.5;
            pos.x += sin(uTime * 0.2 + pos.y) * 2.0;
            pos.z += cos(uTime * 0.2 + pos.y) * 2.0;
            
            // Wrap around Y
            pos.y = mod(pos.y, 40.0);
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Size attenuation
            gl_PointSize = aSize * (300.0 / -mvPosition.z);
            
            // Fade out near top and bottom
            vAlpha = smoothstep(0.0, 5.0, pos.y) * smoothstep(40.0, 35.0, pos.y);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            // Distance from center of point
            float d = length(gl_PointCoord - vec2(0.5));
            // Soft circle using smoothstep
            float alpha = smoothstep(0.5, 0.1, d) * 0.5 * vAlpha;
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  );
}
