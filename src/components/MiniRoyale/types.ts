export interface BuildingConfig {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: number;
  roofColor: number;
}

export interface WallSegment {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export interface BuildingData extends BuildingConfig {
  id: string;
  walls: WallSegment[];
}

export interface WaterArea {
  x: number;
  z: number;
  r: number;
}

export interface RoadConfig {
  x: number;
  z: number;
  length: number;
  width: number;
  rotation: number;
}

export interface TreeData {
  x: number;
  z: number;
  trunkH: number;
  isPine: boolean;
  scale: number;
}

export interface RockData {
  x: number;
  z: number;
  size: number;
  colorHex: number;
}

export interface LootItemData {
  id: string;
  x: number;
  z: number;
  type: 'health' | 'ammo' | 'shield' | 'grenade';
  label: string;
  color: number;
  emoji: string;
  collected?: boolean;
}

export interface ZonePhase {
  delay: number; // in seconds
  target: number; // target radius
  speed: number;
}

export interface BotOpponent {
  id: string;
  name: string;
  x: number;
  z: number;
  y: number;
  health: number;
  maxHealth: number;
  shield: number;
  speed: number;
  sightRange: number;
  accuracy: number;
  damage: number;
  fireRate: number;
  fireTimer: number;
  state: 'wander' | 'combat' | 'flee' | 'loot';
  stateTimer: number;
  targetX: number;
  targetZ: number;
  targetEntityId: string | null;
  alive: boolean;
  color: number;
  hasHat: boolean;
  hatColor: number;
}

export interface MiniRoyaleWeapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number; // seconds between shots
  magSize: number;
  reserveAmmo: number;
  reloadTime: number;
  spread: number;
  adsSpread: number;
  adsZoom: number;
  pellets?: number;
  auto: boolean;
  mode: 'SEMI' | 'AUTO' | 'PUMP';
  color: number;
}
