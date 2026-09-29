import { BuildingConfig, WaterArea, RoadConfig, ZonePhase, MiniRoyaleWeapon } from './types';

export const MAP_SIZE = 1000;
export const HALF_MAP = MAP_SIZE / 2;
export const MAX_HP = 150;
export const MAX_SHIELD = 100;

export const MINI_ROYALE_WEAPONS: MiniRoyaleWeapon[] = [
  { 
    id: 'pistol',
    name: 'Pistol', 
    damage: 18, 
    fireRate: 0.3, 
    magSize: 15, 
    reserveAmmo: 60, 
    reloadTime: 1.4, 
    spread: 0.025, 
    adsSpread: 0.012, 
    adsZoom: 1.15, 
    auto: false, 
    mode: 'SEMI', 
    color: 0xaaaaaa 
  },
  { 
    id: 'ar',
    name: 'AR - Assault Rifle', 
    damage: 24, 
    fireRate: 0.09, 
    magSize: 30, 
    reserveAmmo: 120, 
    reloadTime: 2.0, 
    spread: 0.04, 
    adsSpread: 0.015, 
    adsZoom: 1.4, 
    auto: true, 
    mode: 'AUTO', 
    color: 0x555555 
  },
  { 
    id: 'shotgun',
    name: 'Shotgun', 
    damage: 14, 
    fireRate: 0.75, 
    magSize: 8, 
    reserveAmmo: 32, 
    reloadTime: 2.8, 
    spread: 0.1, 
    adsSpread: 0.07, 
    adsZoom: 1.1, 
    pellets: 7, 
    auto: false, 
    mode: 'PUMP', 
    color: 0x8B4513 
  },
];

export const BUILDING_CONFIGS: BuildingConfig[] = [
  // Central town
  { x: 30, z: 30, w: 16, h: 12, d: 14, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: 55, z: 25, w: 10, h: 8, d: 10, color: 0xe8c9a0, roofColor: 0xa0522d },
  { x: 35, z: 55, w: 12, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
  { x: 60, z: 55, w: 20, h: 14, d: 16, color: 0xbbb8b0, roofColor: 0x696969 },
  { x: -20, z: 50, w: 10, h: 8, d: 10, color: 0xd0b890, roofColor: 0xa0522d },
  { x: 0, z: -80, w: 14, h: 11, d: 12, color: 0xa89880, roofColor: 0x8B4513 },
  // NW village
  { x: -120, z: 240, w: 24, h: 16, d: 18, color: 0xa0a0a0, roofColor: 0x555555 },
  { x: -60, z: 250, w: 10, h: 7, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: -110, z: 300, w: 14, h: 10, d: 12, color: 0xc8b090, roofColor: 0x8B4513 },
  { x: -160, z: 270, w: 12, h: 9, d: 10, color: 0xe0d0b0, roofColor: 0xa0522d },
  // NE outpost
  { x: 280, z: 200, w: 18, h: 12, d: 14, color: 0xb8a080, roofColor: 0x654321 },
  { x: 320, z: 220, w: 12, h: 9, d: 10, color: 0xd0c0a0, roofColor: 0x8B4513 },
  { x: 260, z: 230, w: 8, h: 6, d: 8, color: 0xe0d0b0, roofColor: 0xa0522d },
  // SE compound
  { x: 300, z: -200, w: 22, h: 15, d: 18, color: 0x909090, roofColor: 0x444444 },
  { x: 340, z: -180, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
  { x: 270, z: -220, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
  // SW hamlet
  { x: -240, z: -200, w: 22, h: 15, d: 18, color: 0x909090, roofColor: 0x444444 },
  { x: -180, z: -220, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
  { x: -280, z: -160, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: -220, z: -140, w: 10, h: 7, d: 10, color: 0xe8d8c0, roofColor: 0x8B4513 },
  // West settlement
  { x: -340, z: 120, w: 16, h: 11, d: 14, color: 0xb0a090, roofColor: 0x654321 },
  { x: -380, z: 100, w: 12, h: 9, d: 10, color: 0xc0b0a0, roofColor: 0x8B4513 },
  { x: -320, z: 80, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
  // East settlement
  { x: 360, z: 40, w: 14, h: 10, d: 12, color: 0xc0b0a0, roofColor: 0x8B4513 },
  { x: 380, z: -30, w: 16, h: 11, d: 14, color: 0xb8a888, roofColor: 0x654321 },
  // South outpost
  { x: -50, z: -340, w: 20, h: 13, d: 16, color: 0x999999, roofColor: 0x555555 },
  { x: 80, z: -280, w: 14, h: 9, d: 12, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: -100, z: -300, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
  // North outpost
  { x: 100, z: 320, w: 14, h: 10, d: 12, color: 0xc0b0a0, roofColor: 0x8B4513 },
  { x: 150, z: 350, w: 18, h: 12, d: 14, color: 0xb0a090, roofColor: 0x654321 },
  // Far corners - isolated buildings
  { x: -400, z: -350, w: 16, h: 10, d: 14, color: 0xb8a888, roofColor: 0x654321 },
  { x: 400, z: 350, w: 14, h: 9, d: 12, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: -400, z: 350, w: 12, h: 8, d: 10, color: 0xc8b090, roofColor: 0x8B4513 },
  { x: 400, z: -350, w: 12, h: 8, d: 10, color: 0xe8c9a0, roofColor: 0xa0522d },
  // Mid-ring buildings
  { x: 200, z: 100, w: 10, h: 7, d: 10, color: 0xe0c8a0, roofColor: 0x8B4513 },
  { x: -200, z: -50, w: 16, h: 11, d: 14, color: 0xb0a090, roofColor: 0x654321 },
  { x: 150, z: -120, w: 12, h: 8, d: 10, color: 0xd4a574, roofColor: 0x8B4513 },
  { x: -170, z: 120, w: 14, h: 10, d: 12, color: 0xc4956a, roofColor: 0x8B4513 },
];

export const WATER_AREAS: WaterArea[] = [
  { x: -360, z: 360, r: 45 },
  { x: 380, z: -320, r: 35 },
  { x: 100, z: 360, r: 28 },
  { x: -300, z: -100, r: 30 },
  { x: 200, z: 280, r: 25 },
];

export const ROAD_CONFIGS: RoadConfig[] = [
  { x: 0, z: 0, length: MAP_SIZE, width: 8, rotation: 0 },
  { x: 0, z: 0, length: MAP_SIZE, width: 8, rotation: Math.PI / 2 },
  { x: 160, z: 120, length: 440, width: 6, rotation: Math.PI / 4 },
  { x: -200, z: -160, length: 400, width: 6, rotation: -Math.PI / 6 },
  { x: -300, z: 100, length: 320, width: 5, rotation: Math.PI / 3 },
  { x: 250, z: -100, length: 350, width: 6, rotation: Math.PI / 5 },
];

export const BOT_NAMES = [
  'Shadow', 'Ghost', 'Viper', 'Hawk', 'Wolf', 'Raven', 'Storm', 'Blade', 'Fox', 'Cobra',
  'Eagle', 'Tiger', 'Snake', 'Bear', 'Lynx', 'Shark', 'Crow', 'Bull', 'Puma', 'Falcon',
  'Blaze', 'Frost', 'Reaper', 'Ace', 'Doom', 'Spark', 'Dagger', 'Scar', 'Bolt', 'Claw',
  'Wraith', 'Ridge', 'Havoc', 'Fang', 'Rift', 'Jett'
];

export const ZONE_PHASES: ZonePhase[] = [
  { delay: 80, target: 400, speed: 0.3 },
  { delay: 60, target: 280, speed: 0.35 },
  { delay: 50, target: 160, speed: 0.45 },
  { delay: 40, target: 70,  speed: 0.55 },
  { delay: 25, target: 5,   speed: 0.7 },
];
