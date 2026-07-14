/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { RigidBody } from '@react-three/rapier';
import { Grid, Stars, Text, Sparkles, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, memo } from 'react';
import * as THREE from 'three';
import { useGameStore, MapType, DIMENSIONS, DimensionType, BlockType } from '../store';
import { CaptureZone } from './CaptureZone';
import { soundService } from '../services/soundService';

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
  const mapSize = 500; // Expanded map size

  if (mapType === 'maze') {
    for (let i = 0; i < 150; i++) {
      const x = (rng() - 0.5) * (mapSize - 30);
      const z = (rng() - 0.5) * (mapSize - 30);
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      const height = rng() * 8 + 6;
      const isHorizontal = rng() > 0.5;
      const width = isHorizontal ? rng() * 30 + 15 : rng() * 4 + 2;
      const depth = isHorizontal ? rng() * 4 + 2 : rng() * 30 + 15;
      const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
      obstacles.push({ type: 'box', position: [x, height / 2 - 0.5, z], size: [width, height, depth], rotation: [0, 0, 0], color });
    }
  } else if (mapType === 'pillars') {
    for (let x = -240; x <= 240; x += 60) {
      for (let z = -240; z <= 240; z += 60) {
        if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
        const height = rng() * 20 + 8;
        const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
        obstacles.push({ type: 'cylinder', position: [x, height / 2 - 0.5, z], size: [6, height, 6], rotation: [0, 0, 0], color });
      }
    }
  } else if (mapType === 'arena') {
    for (let i = 0; i < 80; i++) {
      const x = (rng() - 0.5) * (mapSize - 40);
      const z = (rng() - 0.5) * (mapSize - 40);
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      const size = rng() * 8 + 3;
      const color = rng() > 0.5 ? "#ff8c00" : "#00d4ff";
      const y = rng() > 0.7 ? rng() * 15 + 8 : size / 2 - 0.5;
      obstacles.push({ type: 'box', position: [x, y, z], size: [size, size, size], rotation: [rng() * Math.PI, rng() * Math.PI, 0], color });
    }
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 80;
      const z = Math.sin(angle) * 80;
      obstacles.push({ type: 'cylinder', position: [x, 15, z], size: [12, 30, 12], rotation: [0, 0, 0], color: '#ff8c00' });
    }
  } else if (mapType === 'void') {
    // Floating platforms in a void
    for (let i = 0; i < 40; i++) {
      const x = (rng() - 0.5) * 450;
      const z = (rng() - 0.5) * 450;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      const width = rng() * 25 + 15;
      const depth = rng() * 25 + 15;
      const y = rng() * 40 + 5;
      const color = rng() > 0.5 ? "#ab47bc" : "#00d4ff";
      obstacles.push({ type: 'box', position: [x, y, z], size: [width, 1.5, depth], rotation: [0, 0, 0], color });
      
      // Add some smaller floating cubes around platforms
      if (rng() > 0.7) {
        obstacles.push({ 
          type: 'box', 
          position: [x + (rng()-0.5)*10, y + 5 + rng()*10, z + (rng()-0.5)*10], 
          size: [2, 2, 2], 
          rotation: [rng()*Math.PI, rng()*Math.PI, 0], 
          color: '#ffffff' 
        });
      }
    }
    // Central massive platform
    obstacles.push({ type: 'box', position: [0, 10, 0], size: [50, 2, 50], rotation: [0, 0, 0], color: '#ab47bc' });
  } else if (mapType === 'cybercity') {
    // Urban environment with buildings
    for (let i = 0; i < 60; i++) {
      const x = (rng() - 0.5) * 450;
      const z = (rng() - 0.5) * 450;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
      
      const isSkyscraper = rng() > 0.85;
      const width = isSkyscraper ? 20 : rng() * 12 + 6;
      const depth = isSkyscraper ? 20 : rng() * 12 + 6;
      const height = isSkyscraper ? rng() * 80 + 50 : rng() * 25 + 10;
      const color = rng() > 0.5 ? "#00ffcc" : "#ff00ff";
      
      obstacles.push({ 
        type: 'box', 
        position: [x, height / 2 - 0.5, z], 
        size: [width, height, depth], 
        rotation: [0, 0, 0], 
        color 
      });

      // Add "Neon Signs" to skyscrapers
      if (isSkyscraper) {
        const signSide = rng() > 0.5 ? 1 : -1;
        const signAxis = rng() > 0.5 ? 'x' : 'z';
        const signPos: [number, number, number] = signAxis === 'x' 
          ? [x + (width/2 + 0.1) * signSide, height * 0.8, z]
          : [x, height * 0.8, z + (depth/2 + 0.1) * signSide];
        
        obstacles.push({
          type: 'box',
          position: signPos,
          size: signAxis === 'x' ? [0.2, 10, 5] : [5, 10, 0.2],
          rotation: [0, 0, 0],
          color: rng() > 0.5 ? "#ffff00" : "#00ffff",
          isSign: true
        });
      }
    }
  } else if (mapType === 'volcano') {
    // Rugged terrain with lava-like accents
    for (let i = 0; i < 80; i++) {
      const x = (rng() - 0.5) * 480;
      const z = (rng() - 0.5) * 480;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      
      const isLavaPool = rng() > 0.9;
      const size = isLavaPool ? rng() * 30 + 20 : rng() * 15 + 5;
      const height = isLavaPool ? 0.1 : rng() * 15 + 2;
      const color = isLavaPool ? "#ff2200" : "#331100";
      
      obstacles.push({ 
        type: 'box', 
        position: [x, height / 2 - 0.45, z], 
        size: [size, height, size], 
        rotation: [0, rng() * Math.PI, 0], 
        color,
        isLava: isLavaPool
      });
    }
  } else if (mapType === 'infinite') {
    // =========================================================
    // Real-world digital twin copy of Port Elizabeth, South Africa!
    // =========================================================

    // 1. THE CAMPANILE CLOCK TOWER (0, -150)
    // Tower shaft
    obstacles.push({
      type: 'box',
      position: [0, 18, -150],
      size: [5, 36, 5],
      rotation: [0, 0, 0],
      color: '#b91c1c', // brick red
      label: 'The Campanile Clock Tower'
    });
    // Copper roof cap
    obstacles.push({
      type: 'cylinder',
      position: [0, 38, -150],
      size: [6, 4, 6],
      rotation: [0, 0, 0],
      color: '#0d9488' // turquoise weathered copper
    });

    // 2. NELSON MANDELA BAY STADIUM (150, -120)
    // Render circular structure chunks to represent the stadium arches
    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 8) {
      const rx = 150 + Math.cos(theta) * 32;
      const rz = -120 + Math.sin(theta) * 32;
      obstacles.push({
        type: 'box',
        position: [rx, 6, rz],
        size: [8, 12, 4],
        rotation: [0, -theta, 0],
        color: '#f9fafb', // bright white stadium concrete
        isScannedPillar: true
      });
    }
    // Arena center placard
    obstacles.push({
      type: 'cylinder',
      position: [150, 0.5, -120],
      size: [64, 1, 64],
      rotation: [0, 0, 0],
      color: '#15803d', // Stadium Grass pitch
      label: 'Nelson Mandela Bay Stadium'
    });

    // 3. SHARK ROCK PIER at HOBIE BEACH (230, 180)
    // Column supports
    for (let p = 0; p < 70; p += 10) {
      obstacles.push({
        type: 'cylinder',
        position: [230 + p, 2, 180],
        size: [3, 4, 3],
        rotation: [0, 0, 0],
        color: '#475569'
      });
    }
    // Main deck
    obstacles.push({
      type: 'box',
      position: [265, 4.5, 180],
      size: [80, 1.2, 8],
      rotation: [0, 0, 0],
      color: '#334155',
      label: 'Shark Rock Pier - Hobie Beach'
    });

    // 4. KINGS BEACH FERRIS WHEEL (110, 100)
    // Base hub
    obstacles.push({
      type: 'box',
      position: [110, 4, 100],
      size: [4, 8, 8],
      rotation: [0, 0, 0],
      color: '#1e293b'
    });
    // Ferris Wheel ring
    obstacles.push({
      type: 'cylinder',
      position: [110, 14, 100],
      size: [22, 1.5, 22],
      rotation: [Math.PI / 2, 0, 0],
      color: '#ec4899', // bright glowing magenta
      label: 'Kings Beach Ferris Wheel',
      isScannedPillar: true
    });

    // 5. DONKIN PYRAMID & HISTORIC LIGHTHOUSE (-120, 80)
    // Stone Pyramid
    obstacles.push({
      type: 'box',
      position: [-120, 4, 80],
      size: [12, 8, 12],
      rotation: [0, Math.PI / 4, 0],
      color: '#78350f',
      label: 'Donkin Reserve Pyramid & Lighthouse'
    });
    // Lighthouse
    obstacles.push({
      type: 'cylinder',
      position: [-105, 12, 85],
      size: [4, 24, 4],
      rotation: [0, 0, 0],
      color: '#f8fafc', // white tower
      isScannedPillar: true
    });
    // Red lantern cap of lighthouse
    obstacles.push({
      type: 'cylinder',
      position: [-105, 25.5, 85],
      size: [3, 3, 3],
      rotation: [0, 0, 0],
      color: '#ef4444' // bright crimson
    });

    // 6. PORT OF PORT ELIZABETH GANTRY CRANES (-200, -200)
    // Structure Columns
    obstacles.push({
      type: 'box',
      position: [-200, 15, -200],
      size: [4, 30, 4],
      rotation: [0, 0, 0],
      color: '#ea580c' // Industrial Orange gantry
    });
    obstacles.push({
      type: 'box',
      position: [-185, 15, -200],
      size: [4, 30, 4],
      rotation: [0, 0, 0],
      color: '#ea580c'
    });
    // Crane Arm
    obstacles.push({
      type: 'box',
      position: [-185, 30, -185],
      size: [4, 4, 45],
      rotation: [0, 0, 0],
      color: '#ea580c',
      label: 'Port of Port Elizabeth Crane'
    });

    // Fill the wider map area with dune sand mounds, coastal shrubs, and trees
    for (let i = 0; i < 90; i++) {
      const x = (rng() - 0.5) * 1200;
      const z = (rng() - 0.5) * 1200;
      
      // Don't spawn randomly near our hand-placed PE landmarks
      const nearMonument = 
        Math.hypot(x - 0, z - (-150)) < 40 ||
        Math.hypot(x - 150, z - (-120)) < 60 ||
        Math.hypot(x - 265, z - 180) < 60 ||
        Math.hypot(x - 110, z - 100) < 40 ||
        Math.hypot(x - (-112), z - 82) < 40 ||
        Math.hypot(x - (-190), z - (-195)) < 50 ||
        (Math.abs(x) < 40 && Math.abs(z) < 40);

      if (nearMonument) continue;

      const isDune = x < -250 && z > 150;
      if (isDune) {
        // Sardinia Bay golden sand piles
        const duneSize = rng() * 18 + 8;
        obstacles.push({
          type: 'box',
          position: [x, duneSize / 3 - 0.5, z],
          size: [duneSize, duneSize / 1.5, duneSize],
          rotation: [0, rng() * Math.PI, 0],
          color: '#fef08a' // Warm Sand dune color
        });
      } else {
        // Coastal shrubbery / trees
        const size = rng() * 6 + 3;
        const color = rng() > 0.6 ? "#16a34a" : "#15803d";
        obstacles.push({
          type: 'box',
          position: [x, size/2 - 0.5, z],
          size: [1.2, size, 1.2],
          rotation: [0, 0, 0],
          color
        });
      }
    }
  } else if (mapType === 'neon_grid') {
    // Cyber punk grid with glowing structural towers
    for (let i = 0; i < 90; i++) {
      const x = (rng() - 0.5) * 450;
      const z = (rng() - 0.5) * 450;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      
      const isRelay = rng() > 0.8;
      const width = isRelay ? 6 : rng() * 8 + 4;
      const depth = isRelay ? 6 : rng() * 8 + 4;
      const height = isRelay ? 45 : rng() * 20 + 8;
      const color = rng() > 0.5 ? "#00ffff" : "#ff007f"; // Cyber Cyan / Hotline Pink
      
      obstacles.push({
        type: isRelay ? 'cylinder' : 'box',
        position: [x, height / 2 - 0.5, z],
        size: isRelay ? [width, height, width] : [width, height, depth],
        rotation: [0, rng() * Math.PI, 0],
        color,
        isSign: isRelay && rng() > 0.5,
        neonBeam: isRelay
      });
    }
  } else if (mapType === 'quantum_rift') {
    // Reality-bending space rift with levitating cosmic shards
    for (let i = 0; i < 80; i++) {
      const x = (rng() - 0.5) * 450;
      const z = (rng() - 0.5) * 450;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      
      const isFloatingShard = rng() > 0.6;
      const size = rng() * 10 + 4;
      const height = isFloatingShard ? rng() * 15 + 10 : size / 2 - 0.5;
      const color = rng() > 0.7 ? "#a855f7" : rng() > 0.4 ? "#ec4899" : "#3b82f6"; // purple / pink / blue
      
      obstacles.push({
        type: isFloatingShard ? 'box' : 'cylinder',
        position: [x, height, z],
        size: [size, isFloatingShard ? 1.5 : size * 2.5, size],
        rotation: [isFloatingShard ? rng() * 0.4 : 0, rng() * Math.PI, isFloatingShard ? rng() * 0.4 : 0],
        color,
        isCrystal: !isFloatingShard
      });
    }
  } else if (mapType === 'custom_scan') {
    // Custom copied 3D world with scanned structures!
    const storeState = useGameStore.getState();
    const scType = storeState.scannedModelType || 'droid';
    const scColor = storeState.scannedModelColor || '#38bdf8';
    
    for (let i = 0; i < 75; i++) {
      const x = (rng() - 0.5) * 450;
      const z = (rng() - 0.5) * 450;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
      
      const height = rng() * 25 + 8;
      const sizeX = (rng() * 12 + 6) * (storeState.scannedModelScale?.x || 1.0);
      const sizeY = height * (storeState.scannedModelScale?.y || 1.0);
      const sizeZ = (rng() * 12 + 6) * (storeState.scannedModelScale?.z || 1.0);
      
      obstacles.push({
        type: scType === 'crypt' ? 'cylinder' : 'box',
        position: [x, sizeY / 2 - 0.5, z],
        size: [sizeX, sizeY, sizeZ],
        rotation: [0, rng() * Math.PI, 0],
        color: scColor,
        isCrystal: scType === 'crypt',
        isScannedPillar: true,
        scannedModelType: scType
      });
    }
  } else if (mapType === 'aurum_dominion') {
    // Dynamic procedurally generated Aurum Dominion Map Layout - like Minecraft voxel grids, but always different!
    const seed = Math.floor(Math.random() * 999999) + 42;
    const rngGen = mulberry32(seed);

    // 1. Colossal central golden column (Dominion Shaft Core)
    obstacles.push({
      type: 'cylinder',
      position: [0, 80 / 2 - 0.5, 0],
      size: [24, 80, 24],
      rotation: [0, 0, 0],
      color: '#f59e0b', // Molten Gold
      isCrystal: true // reflective styling
    });

    // 2. Colossal Vault Arches on the cardinal directions
    const cardinalDirs = [
      { x: 0, z: 200, rot: 0 },
      { x: 0, z: -200, rot: Math.PI },
      { x: 200, z: 0, rot: Math.PI / 2 },
      { x: -200, z: 0, rot: -Math.PI / 2 }
    ];
    cardinalDirs.forEach((dir, k) => {
      // Golden vault portals
      obstacles.push({
        type: 'box',
        position: [dir.x, 25, dir.z],
        size: [5, 50, 40],
        rotation: [0, dir.rot, 0],
        color: '#fbbf24', // bright gold
        isScannedPillar: true
      });
      // Portal neon lights
      obstacles.push({
        type: 'box',
        position: [dir.x, 25, dir.z + (dir.z !== 0 ? (dir.z > 0 ? 1 : -1) : 0)],
        size: [1, 40, 30],
        rotation: [0, dir.rot, 0],
        color: k % 2 === 0 ? '#38bdf8' : '#ec4899', // Cyan or fuchsia
        isCrystal: true
      });
    });

    // 3. Minecraft-style stacked procedural towers & steps
    for (let i = 0; i < 48; i++) {
      const qX = rngGen() > 0.5 ? 1 : -1;
      const qZ = rngGen() > 0.5 ? 1 : -1;
      const originX = qX * (rngGen() * 160 + 40);
      const originZ = qZ * (rngGen() * 160 + 40);

      // Procedural height scaling
      const baseHeight = rngGen() * 22 + 8;
      const width = rngGen() * 14 + 10;
      const depth = rngGen() * 14 + 10;
      const neonColor = rngGen() > 0.6 ? '#f59e0b' : (rngGen() > 0.5 ? '#06b6d4' : '#d946ef'); // Gold, cyan, fuchsia neon accents

      // Tower base block
      obstacles.push({
        type: 'box',
        position: [originX, baseHeight / 2 - 0.5, originZ],
        size: [width, baseHeight, depth],
        rotation: [0, (rngGen() - 0.5) * 0.4, 0],
        color: '#111827', // deep obsidian gray
        neonBeam: true,
        colorAccent: neonColor
      });

      // Stacked top block (smaller)
      if (rngGen() > 0.3) {
        const topHeight = rngGen() * 10 + 4;
        obstacles.push({
          type: 'box',
          position: [originX, baseHeight + topHeight / 2, originZ],
          size: [width * 0.75, topHeight, depth * 0.75],
          rotation: [0, (rngGen() - 0.5) * 0.8, 0],
          color: '#fbbf24', // golden stack block
          isScannedPillar: true
        });
      }

      // Scatter crystal gems and resource pillars atop or near towers
      if (rngGen() > 0.55) {
        obstacles.push({
          type: 'cylinder',
          position: [originX + (rngGen() - 0.5) * 35, 12, originZ + (rngGen() - 0.5) * 35],
          size: [3, 24, 3],
          rotation: [0, 0, 0],
          color: '#f59e0b',
          isCrystal: true
        });
      }
    }

    // 4. Generate dynamic sky bridges (horizontal narrow paths)
    for (let i = 0; i < 16; i++) {
      const startX = (rngGen() - 0.5) * 280;
      const startZ = (rngGen() - 0.5) * 280;
      const len = rngGen() * 45 + 25;
      const isEastWest = rngGen() > 0.5;
      const height = rngGen() * 24 + 12;

      obstacles.push({
        type: 'box',
        position: [startX, height, startZ],
        size: isEastWest ? [len, 1.2, 4] : [4, 1.2, len],
        rotation: [0, 0, 0],
        color: '#a855f7', // purple cyber bridges
        isCrystal: true
      });
    }
  } else {
    // FALLBACK GENERATOR FOR COMMUNITY MAPS
    // We generate a mix of thematic objects based on a deterministic seed from the map name
    let seed = 0;
    for (let i = 0; i < mapType.length; i++) {
      seed = (seed << 5) - seed + mapType.charCodeAt(i);
      seed |= 0;
    }
    const communityRng = mulberry32(Math.abs(seed) || 54321);
    
    // Choose theme colors based on mapType name characteristics
    let primaryColor = '#3b82f6'; // blue
    let secondaryColor = '#10b981'; // emerald
    let count = 60;
    let obstacleStyle = 'mixed';
    
    if (mapType.includes('minecraft') || mapType.includes('terraria') || mapType.includes('stardew') || mapType.includes('palworld')) {
      primaryColor = '#15803d'; // grassy green
      secondaryColor = '#854d0e'; // earthy wood
      obstacleStyle = 'cubes'; // sandbox pixelated blocks
      count = 120;
    } else if (mapType.includes('cs2') || mapType.includes('rust') || mapType.includes('tarkov') || mapType.includes('r6s') || mapType.includes('pubg')) {
      primaryColor = '#475569'; // slate grey
      secondaryColor = '#94a3b8'; // metal blue
      obstacleStyle = 'walls'; // tactical military cover
      count = 70;
    } else if (mapType.includes('starfield') || mapType.includes('sky') || mapType.includes('destiny') || mapType.includes('warframe') || mapType.includes('helldivers')) {
      primaryColor = '#6366f1'; // indigo
      secondaryColor = '#ec4899'; // cosmic pink
      obstacleStyle = 'cylinders'; // alien pillars and crystal spires
      count = 80;
    } else if (mapType.includes('gta') || mapType.includes('cyberpunk')) {
      primaryColor = '#f43f5e'; // neon rose
      secondaryColor = '#06b6d4'; // cyan city light
      obstacleStyle = 'skyscrapers'; // high-tech blocky towers
      count = 55;
    }
    
    for (let i = 0; i < count; i++) {
      const x = (communityRng() - 0.5) * (mapSize - 40);
      const z = (communityRng() - 0.5) * (mapSize - 40);
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      
      const height = communityRng() * 12 + 4;
      const width = communityRng() * 16 + 4;
      const depth = communityRng() * 16 + 4;
      const color = communityRng() > 0.4 ? primaryColor : secondaryColor;
      
      if (obstacleStyle === 'cubes') {
        // Generate neat box stacks
        obstacles.push({
          type: 'box',
          position: [x, height / 2, z],
          size: [8, height, 8],
          rotation: [0, 0, 0],
          color
        });
      } else if (obstacleStyle === 'walls') {
        // Horizontal/vertical tactical barricades
        const isH = communityRng() > 0.5;
        obstacles.push({
          type: 'box',
          position: [x, height / 2, z],
          size: isH ? [width, height, 2] : [2, height, depth],
          rotation: [0, isH ? 0 : Math.PI / 2, 0],
          color
        });
      } else if (obstacleStyle === 'cylinders') {
        // Glowing futuristic crystal pillars
        obstacles.push({
          type: 'cylinder',
          position: [x, height, z],
          size: [3, height * 2, 3],
          rotation: [0, 0, 0],
          color,
          isScannedPillar: true
        });
      } else {
        // Default sci-fi tactical crates and platforms
        const randType = communityRng() > 0.5 ? 'box' : 'cylinder';
        obstacles.push({
          type: randType,
          position: [x, height / 2, z],
          size: randType === 'box' ? [width, height, depth] : [6, height, 6],
          rotation: [0, communityRng() * Math.PI, 0],
          color
        });
      }
    }
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
  teleport_core: '#00ffff',
  teleport_void: '#8b5cf6',
  teleport_solar: '#f59e0b',
  teleport_glitch: '#ec4899',
  teleport_matrix: '#10b981',
  teleport_inferno: '#ef4444',
  teleport_zenith: '#3b82f6',
  teleport_cyber: '#d946ef',
  teleport_rusty: '#92400e',
  teleport_prism: '#ffffff',
  teleport_edge: '#ffffff', // VIJO Dimension
  teleport_71: '#ff0055', // 71 NO MANSKY
};

function Vehicle({ id, data }: { id: string, data: any }) {
  const enterVehicle = useGameStore(state => state.enterVehicle);
  const currentVehicleId = useGameStore(state => state.currentVehicleId);

  let color = '#00ff00'; // Car
  if (data.type === 'helicopter') color = '#ff00ff';
  else if (data.type === 'motorbike') color = '#ffff00';

  return (
    <group position={data.position} rotation={[0, data.rotation, 0]}>
      <RigidBody type="fixed" colliders="cuboid" userData={{ name: `vehicle-${id}` }}>
        <mesh 
          onClick={(e) => {
            e.stopPropagation();
            if (!currentVehicleId && !data.ownerId) {
              enterVehicle(id);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!currentVehicleId && !data.ownerId) {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {data.type === 'helicopter' ? (
            <boxGeometry args={[4, 1.5, 6]} />
          ) : data.type === 'car' ? (
            <boxGeometry args={[3, 1.5, 5]} />
          ) : (
            <boxGeometry args={[1, 1.8, 3]} /> // Motorbike
          )}
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
      
      {/* Label */}
      <group position={[0, 3, 0]}>
        <Text 
          fontSize={0.4} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {data.type.toUpperCase()} {data.ownerId ? '(OCCUPIED)' : '[CLICK] TO ENTER'}
        </Text>
      </group>
    </group>
  );
}

import { useVisibilityCulling } from '../utils/useFrustumCulling';
import { Rocket } from './Rocket';
import { DimensionBlock } from './DimensionBlock';

const Obstacle = memo(function Obstacle({ obs, i, selectedMap }: { obs: any, i: number, selectedMap: string }) {
  const isLava = obs.isLava;
  const isCrystal = obs.isCrystal;
  const isVisible = useVisibilityCulling(() => obs.position, { radius: 10, maxDistance: 200, checkEvery: 10 });
  const isHighLOD = useVisibilityCulling(() => obs.position, { radius: 10, maxDistance: 120, checkEvery: 5 });

  return (
    <RigidBody 
      type="fixed" 
      colliders={isLava ? false : (isCrystal ? "hull" : "cuboid")}
      sensor={isLava}
      name={isLava ? 'lava' : `obstacle-${i}`}
      position={obs.position as [number, number, number]}
      rotation={obs.rotation as [number, number, number]}
      onIntersectionEnter={(e) => {
        if (isLava && e.other.rigidBodyObject?.name === 'player') {
          useGameStore.getState().takeDamage(10);
        }
      }}
    >
      <mesh visible={isVisible} name="obstacle">
        {obs.type === 'box' ? (
          <boxGeometry args={obs.size as [number, number, number]} />
        ) : (
          <cylinderGeometry args={[obs.size[0]/2, obs.size[0]/2, obs.size[1], isHighLOD ? 16 : 8]} />
        )}
        <meshStandardMaterial 
          color={isLava ? obs.color : (isCrystal || obs.isScannedPillar ? obs.color : "#10101e")} 
          roughness={isCrystal ? 0.05 : (obs.isScannedPillar ? 0.15 : 0.4)} 
          metalness={isCrystal ? 0.95 : (obs.isScannedPillar ? 0.85 : 0.7)} 
          emissive={isLava ? obs.color : (isCrystal || obs.neonBeam || obs.isScannedPillar ? obs.color : "#000000")}
          emissiveIntensity={isLava ? 2.5 : (obs.isScannedPillar ? 0.7 : (isCrystal ? 1.4 : (obs.neonBeam ? 1.0 : 0)))}
          transparent={isCrystal || obs.isScannedPillar}
          opacity={isCrystal ? 0.85 : (obs.isScannedPillar ? 0.92 : 1.0)}
        />
        
        {/* Neon accent on obstacles */}
        {!isLava && !isCrystal && (
          <mesh position={[0, obs.size[1]/2 - 0.5, 0]}>
            {obs.type === 'box' ? (
              <boxGeometry args={[obs.size[0] + 0.1, 0.2, obs.size[2] + 0.1]} />
            ) : (
              <cylinderGeometry args={[obs.size[0]/2 + 0.1, obs.size[0]/2 + 0.1, 0.2, isHighLOD ? 16 : 8]} />
            )}
            <meshBasicMaterial color={obs.color} toneMapped={false} />
          </mesh>
        )}

        {/* Floating Core Shards atop Crystal nodes */}
        {isCrystal && isHighLOD && (
          <mesh position={[0, obs.size[1]/2 + 1.2, 0]} rotation={[0, Math.PI/4, 0]}>
            <octahedronGeometry args={[obs.size[0] * 0.3]} />
            <meshStandardMaterial 
              color={obs.color} 
              emissive={obs.color} 
              emissiveIntensity={2} 
              roughness={0.1}
            />
          </mesh>
        )}

        {/* Port Elizabeth & Real-world landmark 3D label plates */}
        {obs.label && (
          <Html position={[0, obs.size[1]/2 + 1.5, 0]} center distanceFactor={15}>
            <div className="bg-black/90 border border-amber-500/40 text-amber-300 font-mono text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.25)] select-none pointer-events-none">
              📍 {obs.label}
            </div>
          </Html>
        )}

        {/* Sign Text */}
        {obs.isSign && (
          <Text
            position={[0, 0, 0.11]}
            fontSize={1.5}
            color={obs.color}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, 0]}
          >
            NEON
          </Text>
        )}
      </mesh>
    </RigidBody>
  );
});

export function Arena() {
  const selectedMap = useGameStore(state => state.selectedMap);
  const worldBlocks = useGameStore(state => state.worldBlocks);
  const controlPoints = useGameStore(state => state.controlPoints);
  const vehicles = useGameStore(state => state.vehicles);
  const arenaState = useGameStore(state => state.arenaState);
  const combatPhase = useGameStore(state => state.combatPhase);
  const overload = useGameStore(state => state.overload);
  const obstacles = useMemo(() => generateObstacles(selectedMap), [selectedMap]);

  // Dimension Teleport Gallery near spawn
  const teleportBlocks = useMemo(() => {
    const keys: DimensionType[] = ['core', 'void', 'solar', 'glitch', 'matrix', 'inferno', 'zenith', 'cyber', 'rusty', 'prism', 'edge', 'dimension_71'];
    return keys.map((key, i) => ({
      id: `teleport-${key}`,
      type: `teleport_${key}` as BlockType,
      position: [Math.cos((i / keys.length) * Math.PI * 2) * 20, 0.5, Math.sin((i / keys.length) * Math.PI * 2) * 20] as [number, number, number]
    }));
  }, []);

  const currentDimension = useGameStore(state => state.currentDimension);
  const dimStats = DIMENSIONS[currentDimension] || DIMENSIONS.core || { visuals: { color: '#00ffff', fog: 0.01, ambient: '#0a0a0a' } };

  // Use the dimension's visuals but ensure they aren't totally black unless intended
  const bgColor = dimStats?.visuals?.ambient === '#000000' && currentDimension !== 'void' ? '#050505' : (dimStats?.visuals?.ambient || '#0a0a0a');

  return (
    <group>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 10, 800]} />
      
      {/* Floor */}
      {selectedMap !== 'void' && (
        <RigidBody type="fixed" name="floor" friction={0}>
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {arenaState === 'cube' ? (
              <boxGeometry args={[1000, 1000, 0.1]} />
            ) : arenaState === 'ring' ? (
              <ringGeometry args={[0, 800, 64]} />
            ) : arenaState === 'dimension459' ? (
              <planeGeometry args={[1500, 1500]} />
            ) : (
              <planeGeometry args={[selectedMap === 'infinite' ? 2000 : 500, selectedMap === 'infinite' ? 2000 : 500]} />
            )}
            <meshStandardMaterial 
              color={
                arenaState === 'ring' ? "#001133" : 
                arenaState === 'dimension459' ? "#0a0000" :
                (selectedMap === 'flat' || selectedMap === 'infinite') ? '#050505' : '#050505'
              } 
              roughness={0.05} 
              metalness={0.8}
              emissive={
                arenaState === 'cube' ? "#00ffcc" : 
                arenaState === 'dimension459' ? "#ff0000" :
                "#000000"
              }
              emissiveIntensity={arenaState === 'dimension459' ? 0.3 + (overload / 100) : overload / 100}
            />
          </mesh>
        </RigidBody>
      )}

      {/* Dimension Grids */}
      <Grid
        infiniteGrid
        fadeDistance={600}
        sectionColor={
          currentDimension === 'dimension_71' ? "#ff0055" :
          arenaState === 'cube' ? "#14f195" : 
          arenaState === 'dimension459' ? "#ffffff" : 
          "#ff00ff"
        }
        sectionSize={
          arenaState === 'cube' ? 10 : 
          arenaState === 'dimension459' ? 50 : 25
        }
        sectionThickness={2}
        cellSize={5}
        cellColor={arenaState === 'dimension459' ? "#ff0000" : "#050505"}
        cellThickness={1}
        position={[0, -0.49, 0]}
      />

      {/* Vehicles */}
      {Object.entries(vehicles).map(([id, data]) => (
        <Vehicle key={id} id={id} data={data} />
      ))}
      {/* Grid */}
      {selectedMap !== 'void' && (
        <Grid 
          position={[0, -0.49, 0]} 
          args={[selectedMap === 'infinite' ? 2000 : 500, selectedMap === 'infinite' ? 2000 : 500]} 
          cellColor={
            selectedMap === 'flat' || selectedMap === 'infinite' ? '#1b5e20' : 
            selectedMap === 'volcano' ? '#ff4400' :
            '#00d4ff'
          } 
          sectionColor={
            selectedMap === 'flat' || selectedMap === 'infinite' ? '#0d47a1' : 
            selectedMap === 'volcano' ? '#ff0000' :
            '#ff8c00'
          } 
          fadeDistance={selectedMap === 'infinite' ? 1500 : 400} 
          cellThickness={1} 
          sectionThickness={2} 
          infiniteGrid
        />
      )}

      {/* World Blocks */}
      {worldBlocks.map((block: any) => {
        const isTeleport = block.type.startsWith('teleport_');
        if (isTeleport) {
          const dimension = block.type.replace('teleport_', '') as DimensionType;
          return <DimensionBlock key={block.id} dimension={dimension} position={block.position} variant="cube" />;
        }
        return (
          <RigidBody 
            key={block.id} 
            type="fixed" 
            position={block.position}
            name={`block-${block.id}`}
            colliders="cuboid"
          >
            <mesh>
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
        );
      })}

      {/* Dimension Anchors */}
      {teleportBlocks.map((block: any) => {
        const dimension = block.type.replace('teleport_', '') as DimensionType;
        return (
          <DimensionBlock 
            key={block.id} 
            dimension={dimension} 
            position={block.position} 
            variant="anchor"
          />
        );
      })}

      {/* Ceiling (Removed for open space feel) */}
      {/* <RigidBody type="fixed" name="ceiling">
        <mesh receiveShadow position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>
      </RigidBody> */}

      {/* Atmosphere */}
      {arenaState === 'dimension459' ? (
        <group>
          <Stars radius={300} depth={100} count={50000} factor={6} saturation={1} fade speed={2} />
          <GlitchVFX />
        </group>
      ) : (
        <Stars radius={500} depth={50} count={20000} factor={4} saturation={0} fade speed={1} />
      )}
      <AmbientParticles />

      {/* Control Points */}
      {controlPoints.map(cp => (
        <CaptureZone key={cp.id} data={cp} />
      ))}

      {/* Rocket to Space */}
      <Rocket />
      
      {/* 71 NO MANSKY Dimension Aesthetics */}
      {currentDimension === 'dimension_71' && <Dimension71Atmosphere />}

      {/* Walls */}
      {selectedMap !== 'infinite' && (
        <>
          <Wall name="wall-n" position={[0, 5, -250]} rotation={[0, 0, 0]} />
          <Wall name="wall-s" position={[0, 5, 250]} rotation={[0, Math.PI, 0]} />
          <Wall name="wall-e" position={[250, 5, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <Wall name="wall-w" position={[-250, 5, 0]} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}
      {selectedMap === 'infinite' && (
        <>
          <Wall name="wall-n" position={[0, 5, -1000]} rotation={[0, 0, 0]} />
          <Wall name="wall-s" position={[0, 5, 1000]} rotation={[0, Math.PI, 0]} />
          <Wall name="wall-e" position={[1000, 5, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <Wall name="wall-w" position={[-1000, 5, 0]} rotation={[0, Math.PI / 2, 0]} />
        </>
      )}

      {/* Obstacles */}
      {obstacles.map((obs, i) => (
        <Obstacle key={`${selectedMap}-${i}`} obs={obs} i={i} selectedMap={selectedMap} />
      ))}
    </group>
  );
}

function Dimension71Atmosphere() {
  return (
    <group>
      <Stars radius={200} depth={50} count={5000} factor={10} saturation={1} fade speed={3} />
      <Sparkles count={200} scale={100} size={15} speed={0.5} opacity={1} color="#ff0055" />
      {/* Floating Monoliths */}
      {[...Array(12)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i) * 50 + (Math.random() - 0.5) * 20, 
            20 + Math.sin(i) * 10, 
            Math.sin(i * 1.5) * 50
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <octahedronGeometry args={[2 + Math.random() * 5]} />
          <meshStandardMaterial 
            color="#ff0055" 
            emissive="#330011" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      <rectAreaLight
        width={1000}
        height={1000}
        intensity={5}
        color="#ff0055"
        position={[0, 100, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

function Wall({ name, position, rotation }: { name: string, position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <RigidBody type="fixed" name={name} position={position} rotation={rotation}>
      {/* Solid Wall */}
      <mesh>
        <boxGeometry args={[500, 10, 1]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Glowing Base Line */}
      <mesh position={[0, -4.5, 0.51]}>
        <planeGeometry args={[500, 1]} />
        <meshBasicMaterial color="#ff8c00" toneMapped={false} />
      </mesh>
      {/* Glowing Top Line */}
      <mesh position={[0, 4.5, 0.51]}>
        <planeGeometry args={[500, 1]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} />
      </mesh>
    </RigidBody>
  );
}

function AmbientParticles() {
  const count = 500;
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

function GlitchVFX() {
  const count = 100;
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.children.forEach((child, i) => {
        const t = state.clock.elapsedTime;
        child.position.y += Math.sin(t + i) * 0.05;
        child.rotation.x += 0.01;
        child.rotation.z += 0.01;
        // Glitch scaling
        if (Math.random() > 0.98) {
          child.scale.setScalar(Math.random() * 2 + 0.5);
        } else {
          child.scale.setScalar(1);
        }
      });
    }
  });

  const boxes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 100, Math.random() * 50, (Math.random() - 0.5) * 100] as [number, number, number],
      size: [Math.random() * 2, Math.random() * 2, Math.random() * 2] as [number, number, number],
      color: Math.random() > 0.5 ? '#ff0000' : '#ffffff'
    }));
  }, []);

  return (
    <group ref={meshRef}>
      {boxes.map((box, i) => (
        <mesh key={i} position={box.position}>
          <boxGeometry args={box.size} />
          <meshBasicMaterial color={box.color} transparent opacity={0.6} />
        </mesh>
      ))}
      <pointLight position={[0, 20, 0]} intensity={2} color="#ff0000" distance={200} />
      <Text
        position={[0, 15, 0]}
        fontSize={10}
        color="#ff0000"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
      >
        ERR_DIM_459
      </Text>
    </group>
  );
}
