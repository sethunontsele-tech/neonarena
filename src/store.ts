/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { User } from 'firebase/auth';
import { PlayerStats, updateGameStats, getPlayerStats, Trophy, saveUserProfile, RankType, recordMatch, getMatchHistory, MatchRecord, UserProfile } from './firebase';
import { ARENA_MAPS } from './data/arenaMaps';

export type { UserProfile };

export interface AppUser extends User {
  clanId?: string;
}

import { soundService } from './services/soundService';

export type GameState = 'splash' | 'menu' | 'lobby' | 'playing' | 'gameover' | 'open_world' | 'server_browser';
export type EntityState = 'active' | 'disabled';

export interface ServerInstance {
  id: string;
  name: string;
  map: MapType;
  players: number;
  maxPlayers: number;
  ping: number;
  region: string;
  type: 'competitive' | 'casual' | 'open-world';
}
export type MapType = 'open_world' | 'maze' | 'arena' | 'pillars' | 'flat' | 'void' | 'cybercity' | 'volcano' | 'infinite' | 'neon_grid' | 'quantum_rift' | 'custom_scan' | 'aurum_dominion' | 'infinity_academy' | 'minecraft' | 'roblox' | 'gta_v' | 'terraria' | 'rust' | 'cs2' | 'ark' | 'valheim' | 'wow' | 'ffxiv' | 'lol' | 'fortnite' | 'apex' | 'dayz' | 'project_zomboid' | 'unturned' | 'gmod' | 'tf2' | 'destiny2' | 'warframe' | 'sea_of_thieves' | 'no_mans_sky' | 'osrs' | 'dbd' | 'among_us' | 'phasmophobia' | 'elden_ring' | 'bg3' | 'cyberpunk' | 'overwatch2' | 'r6s' | 'rocket_league' | 'stardew_valley' | 'drg' | 'dota2' | 'fallout76' | 'eso' | 'poe' | 'genshin' | 'pubg' | 'tarkov' | 'starfield' | 'rdr2' | 'palworld' | 'helldivers2' | 'lethal_company' | 'vrising' | 'days_to_die' | 'conan_exiles' | 'enshrouded';
export type SkinType = 'alien' | 'neon' | 'gold' | 'stealth' | 'glitch' | 'ruby' | 'emerald' | 'diamond' | 'void' | 'steve' | 'alex' | 'vijo_pro';
export type PatternType = 'none' | 'camo' | 'stripes' | 'dots' | 'grid' | 'circuit' | 'alien';
export type AccessoryType = 'none' | 'hat' | 'glasses' | 'backpack' | 'horns' | 'halo';
export type GameMode = 'ffa' | 'tdm' | 'ctf' | 'creative' | 'koth' | 'domination' | 'ranked' | 'infection';
export type PlayerClass = 'mage' | 'spellblade' | 'alchemist' | 'none';
export type VehicleType = 'car' | 'helicopter' | 'motorbike';
export type WeatherType = 'clear' | 'rain' | 'storm' | 'fog' | 'snow';

export interface GameTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface ChatMention {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface VehicleData {
  id: string;
  type: VehicleType;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  driverId: string | null;
  team: Team;
}

export interface EnvironmentState {
  time: number; // 0-24
  weather: WeatherType;
  intensity: number;
  date?: string;
  peWeather?: {
    temp: number;
    windSpeed: number;
    condition: 'hot' | 'windy' | 'cold' | 'rainy' | 'hail' | 'clear';
    description: string;
  };
}

export interface ReplaySnapshot {
  timestamp: number;
  players: Record<string, any>;
  enemies: any[];
  vehicles: Record<string, any>;
  environment: EnvironmentState;
  events: any[];
  camera?: {
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
  };
}

export interface ControlPoint {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  owner: Team;
  progress: number; // -100 to 100 (negative for blue, positive for amber)
  capturingTeam: Team;
}

export type DimensionType = 'core' | 'void' | 'solar' | 'glitch' | 'matrix' | 'inferno' | 'zenith' | 'cyber' | 'rusty' | 'prism' | 'edge' | 'dimension_71';

export interface DimensionStats {
  id: DimensionType;
  name: string;
  gravity: number;
  speedMultiplier: number;
  manaRegen: number;
  visuals: {
    color: string;
    fog: number;
    ambient: string;
  };
}

export const DIMENSIONS: Record<DimensionType, DimensionStats> = {
  core: { id: 'core', name: 'CORE ARENA', gravity: -9.81, speedMultiplier: 1, manaRegen: 1, visuals: { color: '#00ffff', fog: 0.01, ambient: '#0a0a0a' } },
  void: { id: 'void', name: 'VOID REALM', gravity: -15, speedMultiplier: 0.8, manaRegen: 0.5, visuals: { color: '#8b5cf6', fog: 0.1, ambient: '#000000' } },
  solar: { id: 'solar', name: 'SOLAR FLARE', gravity: -5, speedMultiplier: 1.2, manaRegen: 1.5, visuals: { color: '#f59e0b', fog: 0.05, ambient: '#2d1a00' } },
  dimension_71: { id: 'dimension_71', name: '71 NO MANSKY', gravity: -0.5, speedMultiplier: 2.5, manaRegen: 15.0, visuals: { color: '#ff0055', fog: 0, ambient: '#0a0a2a' } },
  glitch: { id: 'glitch', name: 'SYSTEM ERROR', gravity: -9.81, speedMultiplier: 1.3, manaRegen: 2.0, visuals: { color: '#ec4899', fog: 0.08, ambient: '#1a001a' } },
  matrix: { id: 'matrix', name: 'SOURCE CODE', gravity: -8, speedMultiplier: 0.7, manaRegen: 3.0, visuals: { color: '#10b981', fog: 0.02, ambient: '#001a05' } },
  inferno: { id: 'inferno', name: 'DATA INFERNO', gravity: -12, speedMultiplier: 1.1, manaRegen: 0.8, visuals: { color: '#ef4444', fog: 0.15, ambient: '#1a0000' } },
  zenith: { id: 'zenith', name: 'ZENITH HEIGHTS', gravity: -3, speedMultiplier: 1.5, manaRegen: 1.2, visuals: { color: '#3b82f6', fog: 0.005, ambient: '#0a1a3a' } },
  cyber: { id: 'cyber', name: 'NEON RAIN', gravity: -9.81, speedMultiplier: 0.9, manaRegen: 1.0, visuals: { color: '#d946ef', fog: 0.12, ambient: '#1a0a2a' } },
  rusty: { id: 'rusty', name: 'INDUSTRIAL CORRECTION', gravity: -11, speedMultiplier: 1.0, manaRegen: 0.3, visuals: { color: '#92400e', fog: 0.2, ambient: '#1a0f05' } },
  prism: { id: 'prism', name: 'PRISM ARRAY', gravity: -9.81, speedMultiplier: 1.4, manaRegen: 1.0, visuals: { color: '#ffffff', fog: 0.03, ambient: '#2a2a2a' } },
  edge: { id: 'edge', name: 'EDGE DIMENSION // VIJO', gravity: -1, speedMultiplier: 2.0, manaRegen: 10.0, visuals: { color: '#ffffff', fog: 0, ambient: '#ffffff' } },
};

export type BlockType = 
  | 'stone' | 'cobblestone' | 'dirt' | 'grass' | 'sand' | 'gravel' | 'clay' | 'bedrock'
  | 'teleport_core' | 'teleport_void' | 'teleport_solar' | 'teleport_glitch' | 'teleport_matrix' 
  | 'teleport_inferno' | 'teleport_zenith' | 'teleport_cyber' | 'teleport_rusty' | 'teleport_prism' | 'teleport_edge' | 'teleport_dimension_71'
  | 'oak_log' | 'oak_planks' | 'leaves' | 'sapling'
  | 'furnace' | 'crafting_table' | 'chest' | 'barrel' | 'anvil' | 'enchanting_table'
  | 'coal_ore' | 'iron_ore' | 'gold_ore' | 'diamond_ore' | 'emerald_ore' | 'redstone_ore' | 'lapis_ore'
  | 'redstone_dust' | 'redstone_torch' | 'lever' | 'button' | 'piston' | 'sticky_piston' | 'observer'
  | 'door' | 'trapdoor' | 'ladder' | 'rail' | 'powered_rail'
  | 'torch' | 'lantern' | 'glowstone' | 'sea_lantern' | 'shroomlight'
  | 'water' | 'lava'
  | 'netherrack' | 'soul_sand' | 'nether_brick' | 'magma'
  | 'end_stone' | 'purpur' | 'end_portal_frame'
  | 'bricks' | 'quartz' | 'concrete' | 'terracotta';

export interface WorldBlock {
  id: string;
  type: BlockType;
  position: [number, number, number];
}
export type Team = 'none' | 'amber' | 'blue';
export type PowerUpType = 'speed' | 'damage' | 'shield' | 'infinite_ammo' | 'gravity_well' | 'vampirism' | 'invisible';

export interface PowerUpData {
  id: string;
  type: PowerUpType;
  position: [number, number, number];
  duration: number;
  spawnTime: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  reward: number;
  type: 'kills' | 'matches' | 'headshots' | 'distance';
  isClaimed: boolean;
}

export type WeaponType = 'pistol' | 'smg' | 'shotgun' | 'sniper' | 'rpg' | 'sword' | 'minigun' | 'flamethrower' | 'raygun' | 'revolver' | 'double_barrel' | 'axe' | 'scythe' | 'crossbow' | 'grenade_launcher' | 'slingshot' | 'chainsaw' | 'hammer' | 'medkit' | 'shield' | 'horn' | 'dual_pistols' | 'grenade' | 'bow' | 'scissors' | 'laser_gun' | 'knife' | 'hyperspace_cannon' | 'black_hole_bomb' | 'vortex_saber' | 'plasma_whip' | 'stasis_field' | 'sonic_cannon' | 'photon_repeater' | 'arc_rifle' | 'gravity_gun' | 'nanobot_swarm' | 'neon_pulse' | 'singularity_cannon' | 'health_potion' | 'mana_potion' | 'speed_potion' | 'shield_potion' | 'xp_potion' | 'credits_potion';

export type PetType = 'none' | 'slime' | 'drone' | 'phoenix' | 'alien_dog' | 'cyber_cat' | 'void_wisp';

export interface PetData {
  id: string;
  type: PetType;
  level: number;
  xp: number;
  happiness: number;
  buffs: string[];
}

export type WeaponCategory = 'primary' | 'secondary' | 'melee' | 'gadget';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SpellType = 'blink' | 'shield' | 'fireball' | 'heal' | 'slow' | 'haste' | 'timewarp';

export interface SpellStats {
  id: SpellType;
  name: string;
  description: string;
  cooldown: number; // ms
  manaCost: number;
  effect: string;
}

export const SPELLS: Record<SpellType, SpellStats> = {
  blink: { id: 'blink', name: 'Phase Shift', description: 'Instantly teleport 15 units forward.', cooldown: 5000, manaCost: 20, effect: 'teleport' },
  shield: { id: 'shield', name: 'Data Barrier', description: 'Create a temporary shield that absorbs 50 damage.', cooldown: 12000, manaCost: 40, effect: 'shield' },
  fireball: { id: 'fireball', name: 'Logic Flare', description: 'Launch a ball of volatile code that explodes on impact.', cooldown: 3000, manaCost: 15, effect: 'damage' },
  heal: { id: 'heal', name: 'Buffer Restore', description: 'Restore 30 HP over 3 seconds.', cooldown: 15000, manaCost: 50, effect: 'heal' },
  slow: { id: 'slow', name: 'Latency Spike', description: 'Slow down nearby enemies by 50% for 4 seconds.', cooldown: 10000, manaCost: 30, effect: 'debuff' },
  haste: { id: 'haste', name: 'Overclock', description: 'Increase movement speed by 40% for 6 seconds.', cooldown: 20000, manaCost: 45, effect: 'buff' },
  timewarp: { id: 'timewarp', name: 'Temporal Glitch', description: 'Dilate local time — all enemies within 12 units slow to 20% speed for 4 seconds.', cooldown: 18000, manaCost: 60, effect: 'debuff' },
};

export interface WeaponStats {
  id: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  spread: number;
  pellets: number;
  range: number;
  isMelee: boolean;
  isExplosive: boolean;
  ammo: number;
  maxAmmo: number;
  reloadTime: number; // ms
  category: WeaponCategory;
  rarity: Rarity;
  recoil?: number;
  weight: number; // 0-1
  lore?: string;
}

export const WEAPONS: Record<WeaponType, WeaponStats> = {
  pistol: { id: 'pistol', name: 'Tactical Pistol', damage: 20, fireRate: 400, spread: 0.02, pellets: 1, range: 100, isMelee: false, isExplosive: false, ammo: 12, maxAmmo: 12, reloadTime: 1000, category: 'secondary', rarity: 'common', recoil: 0.5, weight: 0.1 },
  smg: { id: 'smg', name: 'Rapid SMG', damage: 12, fireRate: 100, spread: 0.08, pellets: 1, range: 60, isMelee: false, isExplosive: false, ammo: 30, maxAmmo: 30, reloadTime: 1500, category: 'primary', rarity: 'rare', recoil: 0.3, weight: 0.3 },
  shotgun: { id: 'shotgun', name: 'Breach Shotgun', damage: 15, fireRate: 800, spread: 0.15, pellets: 8, range: 30, isMelee: false, isExplosive: false, ammo: 6, maxAmmo: 6, reloadTime: 2000, category: 'primary', rarity: 'rare', recoil: 1.5, weight: 0.4 },
  sniper: { id: 'sniper', name: 'Precision Rail', damage: 80, fireRate: 1500, spread: 0, pellets: 1, range: 300, isMelee: false, isExplosive: false, ammo: 5, maxAmmo: 5, reloadTime: 2500, category: 'primary', rarity: 'epic', recoil: 2.5, weight: 0.6 },
  rpg: { id: 'rpg', name: 'Nova Launcher', damage: 100, fireRate: 2000, spread: 0.05, pellets: 1, range: 150, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1, reloadTime: 3000, category: 'primary', rarity: 'legendary', weight: 0.8 },
  sword: { id: 'sword', name: 'Carbon Blade', damage: 50, fireRate: 500, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'rare', weight: 0.2 },
  minigun: { id: 'minigun', name: 'Hyper Minigun', damage: 8, fireRate: 50, spread: 0.12, pellets: 1, range: 80, isMelee: false, isExplosive: false, ammo: 100, maxAmmo: 100, reloadTime: 4000, category: 'primary', rarity: 'epic', weight: 0.9 },
  flamethrower: { id: 'flamethrower', name: 'Solar Flare', damage: 5, fireRate: 30, spread: 0.2, pellets: 1, range: 15, isMelee: false, isExplosive: false, ammo: 50, maxAmmo: 50, reloadTime: 2000, category: 'primary', rarity: 'rare', weight: 0.5 },
  raygun: { id: 'raygun', name: 'Z-Ray Gun', damage: 40, fireRate: 600, spread: 0.01, pellets: 1, range: 120, isMelee: false, isExplosive: false, ammo: 10, maxAmmo: 10, reloadTime: 1500, category: 'secondary', rarity: 'epic', weight: 0.3 },
  revolver: { id: 'revolver', name: 'Heavy Magnum', damage: 45, fireRate: 700, spread: 0.01, pellets: 1, range: 150, isMelee: false, isExplosive: false, ammo: 6, maxAmmo: 6, reloadTime: 1800, category: 'secondary', rarity: 'rare', weight: 0.2 },
  double_barrel: { id: 'double_barrel', name: 'Twin Plasma', damage: 25, fireRate: 1200, spread: 0.25, pellets: 12, range: 20, isMelee: false, isExplosive: false, ammo: 2, maxAmmo: 2, reloadTime: 2200, category: 'primary', rarity: 'rare', weight: 0.4 },
  axe: { id: 'axe', name: 'Battle Axe', damage: 70, fireRate: 800, spread: 0, pellets: 1, range: 5, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'common', weight: 0.4 },
  scythe: { id: 'scythe', name: 'Void Scythe', damage: 60, fireRate: 600, spread: 0, pellets: 1, range: 6, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'epic', weight: 0.3 },
  crossbow: { id: 'crossbow', name: 'Bolt Caster', damage: 65, fireRate: 1000, spread: 0.005, pellets: 1, range: 200, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 2000, category: 'primary', rarity: 'rare', weight: 0.4 },
  grenade_launcher: { id: 'grenade_launcher', name: 'Boom Lobber', damage: 80, fireRate: 1500, spread: 0.1, pellets: 1, range: 100, isMelee: false, isExplosive: true, ammo: 4, maxAmmo: 4, reloadTime: 2500, category: 'primary', rarity: 'epic', weight: 0.5 },
  slingshot: { id: 'slingshot', name: 'Pebble Tosser', damage: 10, fireRate: 300, spread: 0.05, pellets: 1, range: 40, isMelee: false, isExplosive: false, ammo: 20, maxAmmo: 20, reloadTime: 1000, category: 'secondary', rarity: 'common', weight: 0.1 },
  chainsaw: { id: 'chainsaw', name: 'Plasma Saw', damage: 15, fireRate: 50, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'epic', weight: 0.6 },
  hammer: { id: 'hammer', name: 'Gravity Hammer', damage: 90, fireRate: 1200, spread: 0, pellets: 1, range: 5, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'epic', weight: 0.8 },
  medkit: { id: 'medkit', name: 'Nano Healer', damage: -30, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 3000, category: 'gadget', rarity: 'rare', weight: 0.2 },
  shield: { id: 'shield', name: 'Energy Shield', damage: 5, fireRate: 500, spread: 0, pellets: 1, range: 3, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'gadget', rarity: 'rare', weight: 0.3 },
  horn: { id: 'horn', name: 'Battle Horn', damage: 0, fireRate: 5000, spread: 0, pellets: 0, range: 0, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 5000, category: 'gadget', rarity: 'common', weight: 0.2 },
  dual_pistols: { id: 'dual_pistols', name: 'Twin Blasters', damage: 15, fireRate: 200, spread: 0.04, pellets: 1, range: 80, isMelee: false, isExplosive: false, ammo: 24, maxAmmo: 24, reloadTime: 1800, category: 'secondary', rarity: 'rare', weight: 0.2 },
  grenade: { id: 'grenade', name: 'EMP Grenade', damage: 60, fireRate: 1000, spread: 0.2, pellets: 1, range: 50, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'epic', weight: 0.1 },
  bow: { id: 'bow', name: 'Carbon Bow', damage: 40, fireRate: 800, spread: 0.01, pellets: 1, range: 150, isMelee: false, isExplosive: false, ammo: 10, maxAmmo: 10, reloadTime: 1500, category: 'primary', rarity: 'rare', weight: 0.3 },
  scissors: { id: 'scissors', name: 'Cyber Scissors', damage: 35, fireRate: 400, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'common', weight: 0.1 },
  laser_gun: { id: 'laser_gun', name: 'Beam Rifle', damage: 5, fireRate: 20, spread: 0, pellets: 1, range: 100, isMelee: false, isExplosive: false, ammo: 200, maxAmmo: 200, reloadTime: 3000, category: 'primary', rarity: 'legendary', weight: 0.4 },
  knife: { id: 'knife', name: 'Tactical Dagger', damage: 25, fireRate: 300, spread: 0, pellets: 1, range: 3, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'common', weight: 0.1 },
  hyperspace_cannon: { id: 'hyperspace_cannon', name: 'Hyperspace Cannon', damage: 150, fireRate: 3000, spread: 0.01, pellets: 1, range: 500, isMelee: false, isExplosive: true, ammo: 3, maxAmmo: 3, reloadTime: 5000, category: 'primary', rarity: 'legendary', weight: 0.9, lore: 'Extracted from the core of Dimension 71.' },
  black_hole_bomb: { id: 'black_hole_bomb', name: 'Singularity', damage: 200, fireRate: 5000, spread: 0, pellets: 1, range: 50, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1, reloadTime: 10000, category: 'gadget', rarity: 'legendary', weight: 0.5 },
  vortex_saber: { id: 'vortex_saber', name: 'Vortex Saber', damage: 80, fireRate: 400, spread: 0, pellets: 1, range: 8, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'legendary', weight: 0.2 },
  neon_pulse: { id: 'neon_pulse', name: 'Neon Pulse Cannon', damage: 45, fireRate: 100, spread: 0.05, pellets: 1, range: 60, isMelee: false, isExplosive: false, ammo: 50, maxAmmo: 50, reloadTime: 2000, category: 'primary', rarity: 'legendary', weight: 0.3, lore: 'Forged in the heart of Neon Surge.' },
  singularity_cannon: { id: 'singularity_cannon', name: 'Null-Point Cannon', damage: 300, fireRate: 3000, spread: 0, pellets: 1, range: 100, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1, reloadTime: 8000, category: 'primary', rarity: 'legendary', weight: 0.8 },
  plasma_whip: { id: 'plasma_whip', name: 'Plasma Whip', damage: 40, fireRate: 200, spread: 0, pellets: 1, range: 12, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0, reloadTime: 0, category: 'melee', rarity: 'epic', weight: 0.2 },
  stasis_field: { id: 'stasis_field', name: 'Stasis Field Gen', damage: 0, fireRate: 5000, spread: 0, pellets: 1, range: 15, isMelee: false, isExplosive: false, ammo: 3, maxAmmo: 3, reloadTime: 10000, category: 'gadget', rarity: 'legendary', weight: 0.4, lore: 'Freezes time within a local sphere.' },
  sonic_cannon: { id: 'sonic_cannon', name: 'Sonic Disruptor', damage: 30, fireRate: 300, spread: 0.1, pellets: 1, range: 40, isMelee: false, isExplosive: false, ammo: 20, maxAmmo: 20, reloadTime: 2500, category: 'primary', rarity: 'rare', weight: 0.3 },
  photon_repeater: { id: 'photon_repeater', name: 'Photon Repeater', damage: 15, fireRate: 80, spread: 0.02, pellets: 1, range: 120, isMelee: false, isExplosive: false, ammo: 80, maxAmmo: 80, reloadTime: 2000, category: 'primary', rarity: 'epic', weight: 0.2 },
  arc_rifle: { id: 'arc_rifle', name: 'Volt Arc Rifle', damage: 25, fireRate: 400, spread: 0, pellets: 3, range: 50, isMelee: false, isExplosive: false, ammo: 15, maxAmmo: 15, reloadTime: 3000, category: 'primary', rarity: 'legendary', weight: 0.4, lore: 'Bounces high-voltage currents between targets.' },
  gravity_gun: { id: 'gravity_gun', name: 'G-Lift Array', damage: 10, fireRate: 1000, spread: 0, pellets: 1, range: 20, isMelee: false, isExplosive: false, ammo: 5, maxAmmo: 5, reloadTime: 4000, category: 'gadget', rarity: 'legendary', weight: 0.5 },
  nanobot_swarm: { id: 'nanobot_swarm', name: 'Nanobot Hive', damage: 2, fireRate: 10, spread: 0.5, pellets: 1, range: 10, isMelee: false, isExplosive: false, ammo: 100, maxAmmo: 100, reloadTime: 5000, category: 'gadget', rarity: 'epic', weight: 0.2 },
  health_potion: { id: 'health_potion', name: 'Nano Health Potion', damage: -50, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'rare', weight: 0.1, lore: 'Instantly restores 50 health.' },
  mana_potion: { id: 'mana_potion', name: 'Digital Mana Potion', damage: 0, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'rare', weight: 0.1, lore: 'Instantly restores 50 mana.' },
  speed_potion: { id: 'speed_potion', name: 'Overclock Potion', damage: 0, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'rare', weight: 0.1, lore: 'Boosts player speed by 50%.' },
  shield_potion: { id: 'shield_potion', name: 'Overshield Potion', damage: 0, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'rare', weight: 0.1, lore: 'Adds 50 temporary shields.' },
  xp_potion: { id: 'xp_potion', name: 'XP Stimulant Potion', damage: 0, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'epic', weight: 0.1, lore: 'Grants +500 XP immediately.' },
  credits_potion: { id: 'credits_potion', name: 'Credits Boost Potion', damage: 0, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1, reloadTime: 1000, category: 'gadget', rarity: 'epic', weight: 0.1, lore: 'Grants +1000 Credits immediately.' },
};

export interface EnemyData {
  id: string;
  position: [number, number, number];
  state: EntityState;
  disabledUntil: number;
  health: number;
  team: Team;
  isGlitch?: boolean;
}

export interface PlayerData {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  state: EntityState;
  disabledUntil: number;
  score: number;
  color: string;
  skin: SkinType;
  pattern: PatternType;
  accessories: AccessoryType[];
  health: number;
  kills: number;
  deaths: number;
  team: Team;
  weapon: WeaponType;
  isBuildMode: boolean;
  selectedBlock: BlockType;
  isReady: boolean;
  playerClass: PlayerClass;
  isAttacking?: boolean;
  attackType?: string | null;
  isDashing?: boolean;
  isSliding?: boolean;
  isWallRunning?: boolean;
  wallRunSide?: 'left' | 'right' | null;
  isGlitch?: boolean;
  infectionLevel?: number;
  activeStreakPower?: string | null;
  pet?: PetData;
  evolutionLevel?: number;
}

export interface FlagData {
  team: Team;
  position: [number, number, number];
  carrierId: string | null; // null if at base or dropped
}

export interface LaserData {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  timestamp: number;
  color: string;
}

export interface ParticleData {
  id: string;
  position: [number, number, number];
  timestamp: number;
  color: string;
}

export interface GameEvent {
  id: string;
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  type: 'global' | 'proximity' | 'system' | 'team';
}

export interface ProjectileData {
  id: string;
  ownerId: string;
  type: 'grenade' | 'rocket';
  position: [number, number, number];
  velocity: [number, number, number];
  damage: number;
  radius: number;
  timestamp: number;
}

export const TROPHIES: Trophy[] = [
  { id: 'first_kill', name: 'First Blood', description: 'Kill your first enemy', icon: 'zap', requirement: '1 kill' },
  { id: 'survivor', name: 'Survivor', description: 'Survive for 5 minutes', icon: 'shield', requirement: '5 min survival' },
  { id: 'marksman', name: 'Marksman', description: 'Achieve 80% accuracy in a match', icon: 'target', requirement: '80% accuracy' },
  { id: 'champion', name: 'Arena Champion', description: 'Win a match', icon: 'trophy', requirement: '1 win' },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Get 5 kills without dying', icon: 'activity', requirement: '5 killstreak' },
  { id: 'veteran', name: 'Veteran', description: 'Play 10 matches', icon: 'cpu', requirement: '10 games' },
];

interface GameStore {
  gameState: GameState;
  score: number;
  timeLeft: number;
  health: number;
  kills: number;
  deaths: number;
  playerState: EntityState;
  playerDisabledUntil: number;
  enemies: EnemyData[];
  lasers: LaserData[];
  particles: ParticleData[];
  events: GameEvent[];
  
  // Multiplayer
  socket: Socket | null;
  otherPlayers: Record<string, PlayerData>;
  roomId: string | null;
  privateServerName: string;
  selectedRegion: string;
  chatMessages: ChatMessage[];
  gamertag: string;
  
  selectedSkin: SkinType | string;
  selectedColor: string;
  selectedPattern: PatternType;
  selectedAccessories: AccessoryType[];
  selectedGunSkin: string;
  selectedBanner: string;
  selectedMap: MapType;
  selectedMode: GameMode;
  isRanked: boolean;
  isMuted: boolean;
  isCutsceneActive: boolean;
  setCutsceneActive: (active: boolean) => void;
  isGlitch: boolean;
  infectionLevel: number;
  infectionMatchTimer: number;
  humanSurvivors: number;
  infectionWinner: string;
  glitchPlayerIds: string[];
  playerAnimation: 'idle' | 'run' | 'jump' | 'shoot' | 'reload' | 'dance' | 'slide' | 'dash';
  setPlayerAnimation: (anim: 'idle' | 'run' | 'jump' | 'shoot' | 'reload' | 'dance' | 'slide' | 'dash') => void;
  isVehicleMenuOpen: boolean;
  setVehicleMenuOpen: (open: boolean) => void;
  isThirdPerson: boolean;
  lobbyMode: boolean;
  isChatOpen: boolean;
  isReloading: boolean;
  isAttacking: boolean;
  attackType: string | null;

  // Custom Character Skins / Models Folder
  customSkins: {
    id: string;
    name: string;
    fileType: 'obj' | 'gltf' | 'glb' | 'blend';
    dataUrl: string;
    mtlUrl?: string;
  }[];
  addCustomSkin: (skin: { id: string; name: string; fileType: 'obj' | 'gltf' | 'glb' | 'blend'; dataUrl: string; mtlUrl?: string }) => void;
  removeCustomSkin: (id: string) => void;
  autoRotation: boolean;
  is3DMode: boolean;
  set3DMode: (active: boolean) => void;
  isUltraGraphics: boolean;
  setUltraGraphics: (active: boolean) => void;
  unlockedMods: string[];
  buyMod: (modId: string, cost: number) => boolean;
  unlockedTrophies: Trophy[];
  gameVersion: string;
  survivalTime: number;
  trophyNotification: Trophy | null;
  mana: number;
  maxMana: number;
  selectedSpell: SpellType;
  spellCooldowns: Record<SpellType, number>;
  
  // Ranked & Progression
  rank: RankType;
  rankPoints: number;
  level: number;
  xp: number;
  credits: number;
  coins: number;
  totalGambled: number;
  gambleHistory: { result: 'win' | 'loss', amount: number, timestamp: number }[];
  gamble: (amount: number) => void;
  addCoins: (amount: number) => void;
  weaponLevels: Record<string, number>;
  weaponXP: Record<string, number>;
  battlePassTier: number;
  battlePassXP: number;
  isPremiumBattlePass: boolean;
  
  // Lobby System
  isReady: boolean;
  lobbyPlayers: PlayerData[];
  
  // AI Role & Admin
  updateRecommendations: { id: string; text: string; status: 'pending' | 'approved' | 'rejected'; sender: string }[];
  gameName: string;
  gameLogo: string;
  isAdmin: boolean;
  
  // AAA Settings
  jumpHeight: number;
  gravity: number;
  dashSpeed: number;
  dashCooldown: number;
  lastDashTime: number;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  botCount: number;
  botPower: number;
  botAggression: number;
  botAccuracy: number;
  botReactionTime: number;
  botStrategy: 'aggressive' | 'defensive' | 'balanced' | 'tactical';
  mouseSensitivity: number;
  fov: number;
  cameraShake: number;
  crosshairStyle: 'dot' | 'cross' | 'circle' | 'dynamic';
  sprintSpeed: number;
  recoil: number;
  cameraMode: 'first-person' | 'third-person';
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  resolutionScale: number;
  showFps: boolean;
  
  // Dimensions & FaceCam
  currentDimension: DimensionType;
  setDimension: (dim: DimensionType) => void;
  faceCamEnabled: boolean;
  
  // Powerups & Quests
  powerUps: PowerUpData[];
  activePowerUps: Record<PowerUpType, number>; // type -> duration remaining
  quests: Quest[];
  
  // World Events
  activeWorldEvent: { type: string, timeLeft: number } | null;
  setWorldEvent: (event: { type: string, duration: number } | null) => void;
  
  spawnPowerUp: (type: PowerUpType, position: [number, number, number]) => void;
  collectPowerUp: (id: string) => void;
  updateQuests: (type: Quest['type'], amount: number) => void;
  claimQuestReward: (id: string) => void;
  setFaceCamEnabled: (enabled: boolean) => void;
  
  // 60+ Extended Features
  achievements: { id: string; name: string; date: string }[];
  dailyRewards: { day: number; collected: boolean }[];
  perks: string[];
  activePerks: string[];
  weaponAttachments: Record<string, string[]>;
  skinRarity: Record<string, Rarity>;
  prestigeLevel: number;
  clanLeaderboard: any[];
  dynamicWeatherEnabled: boolean;
  destructibleEnvironment: boolean;
  motionBlur: boolean;
  bloomIntensity: number;
  autoAimEnabled: boolean;
  killcamEnabled: boolean;
  bountyTargetId: string | null;
  uavActive: boolean;
  orbitalStrikeReady: boolean;
  sentryTurrets: any[];
  petFollower: string | null;
  emoteQueue: string[];
  battlePassLevel: number;
  customCrosshairColor: string;
  headshotMultiplier: number;
  staminaRegenRate: number;
  maxDashes: number;
  currentDashes: number;
  lastDashRefillTime: number;
  
  // UI States
  modals: {
    casino: boolean;
    update: boolean;
    tasks: boolean;
    friends: boolean;
    account: boolean;
    clans: boolean;
    vehicles: boolean;
  };
  setModal: (modal: keyof GameStore['modals'], open: boolean) => void;
  toggleModal: (modal: keyof GameStore['modals']) => void;

  isFlying: boolean;
  isGhost: boolean;
  isJuggernaut: boolean;
  xpMultiplier: number;
  creditBonus: number;
  seasonalChallenges: any[];
  inventorySlots: number;
  marketCredits: number;
  tradeOffers: any[];
  inGameMusicVolume: number;
  voiceChatPosition: 'top-left' | 'center' | 'top-right';
  voiceChatVolume: number;
  vibrationEnabled: boolean;
  streamerMode: boolean;
  lowLatencyMode: boolean;
  raytracingEnabled: boolean;
  physicsSubsteps: number;
  gravityScaler: number;
  terminalVelocity: number; // Added
  movementWeight: number; // Added
  timeScaler: number;
  colorGrading: string;
  postProcessingProfile: string;
  minimapZoom: number;
  damageNumbersEnabled: boolean;
  killstreakVoiceover: boolean;
  adaptiveAudio: boolean;
  neuralNetworkAim: boolean; // VIJO Logic
  fractalRendering: boolean;
  dimensionShiftCooldown: number;
  lastDimensionShift: number;
  
  // Replay & History
  matchHistory: any[];
  replays: any[];
  isRecording: boolean;
  currentReplay: ReplaySnapshot[];
  addReplaySnapshot: (snapshot: ReplaySnapshot) => void; // Added
  replayPlaybackSpeed: number;
  isReplayPaused: boolean;
  isCameraPathEditorOpen: boolean;
  cameraPath: { x: number, y: number, z: number, time: number }[];
  replayTime: number;
  isReplaying: boolean;
  leaderboard: any[];

  // Servers
  servers: ServerInstance[];
  isLoadingServers: boolean;
  refreshServers: () => void;
  joinOpenWorld: () => void;
  joinServer: (serverId: string) => void;
  
  // Environment
  environment: EnvironmentState;
  isRealLifeSyncEnabled: boolean;
  setRealLifeSyncEnabled: (enabled: boolean) => void;
  updateEnvironment: (env: Partial<EnvironmentState>) => void;
  
  // Vehicles
  vehicles: Record<string, VehicleData>;
  currentVehicleId: string | null;
  
  // Build Mode
  isBuildMode: boolean;
  selectedBlock: BlockType;
  worldBlocks: WorldBlock[];
  scannedModelType: 'droid' | 'sword' | 'crypt' | 'cyber_cup' | null;
  scannedModelColor: string;
  scannedModelScale: { x: number; y: number; z: number };
  scannedModelDecimation: number;
  scannedModelTextureCaptured: boolean;
  scannedModelRepairedHoles: boolean;
  scannedModelSupportEnabled: boolean;
  setScannedModel: (data: {
    scannedModelType: 'droid' | 'sword' | 'crypt' | 'cyber_cup' | null;
    scannedModelColor: string;
    scannedModelScale: { x: number; y: number; z: number };
    scannedModelDecimation: number;
    scannedModelTextureCaptured: boolean;
    scannedModelRepairedHoles: boolean;
    scannedModelSupportEnabled: boolean;
  }) => void;
  
  // Spectator
  isSpectating: boolean;
  spectatorTargetId: string | null;
  targetedEnemyId: string | null;
  
  // Movement/Animations
  isSprinting: boolean;
  isSliding: boolean;
  isWallRunning: boolean;
  wallRunSide: 'left' | 'right' | null;
  playerPosition: [number, number, number];
  playerRotation: number; // Added
  
  // Jump Pads
  jumpPads: { id: string; position: [number, number, number]; power: number }[];
  
  availableWeapons: WeaponType[]; // Replaced inventory with split
  hotbar: WeaponType[]; // Up to 9 slots
  equipToHotbar: (weaponId: WeaponType, slotIndex: number) => void;
  currentWeaponIndex: number;
  currentAmmo: Record<string, number>;
  isInventoryOpen: boolean;
  isDonateModalOpen: boolean;
  isMapOpen: boolean;
  setMapOpen: (open: boolean) => void;
  setWorldBlocks: (blocks: WorldBlock[]) => void;
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  
  // VR/Combat Dimension Stats
  energy: number;
  focus: number;
  overload: number;
  instability: number;
  isFlashlightActive: boolean;
  portalPosition: [number, number, number] | null;
  mapSeed: number;
  arenaState: 'standard' | 'cube' | 'ring' | 'dimension459';
  combatPhase: number;
  setArenaState: (state: 'standard' | 'cube' | 'ring' | 'dimension459') => void;
  setCombatPhase: (phase: number) => void;
  updateStats: (updates: Partial<{ energy: number; focus: number; overload: number }>) => void;
  setInstability: (value: number) => void;
  toggleFlashlight: () => void;
  nextLevel: () => void;
  
  // Killstreaks
  currentKillStreak: number;
  bestKillStreak: number;
  activeStreakPower: string | null;
  streakPowerExpiry: number;

  // Time Warp
  isTimeWarpActive: boolean;
  isGlobalTimeWarp: boolean;
  timeWarpExpiry: number;

  // Arena Events
  damageMultiplier: number;
  gravityInverted: boolean;
  blackoutActive: boolean;
  alienPredatorActive: boolean;
  beingEaten: boolean;

  team: Team;
  teamScores: { amber: number; blue: number };
  flags: FlagData[];
  controlPoints: ControlPoint[];
  projectiles: ProjectileData[];
  playerClass: PlayerClass;
  gameMode: GameMode;
  clanId: string | null;

  // Stats
  user: AppUser | null;
  persistentStats: PlayerStats | null;
  sessionShots: number;
  sessionHits: number;
  
  // Tasks & Social
  tasks: GameTask[];
  mentions: ChatMention[];
  friends: UserProfile[];
  friendRequests: UserProfile[];

  // Stamina & Health Regen
  stamina: number;
  maxStamina: number;
  lastDamageTime: number;
  lastStaminaUseTime: number;
  isPointerLocked: boolean;
  setPointerLocked: (locked: boolean) => void;

  // Teleportation holding state
  teleportProgress: number;
  teleportTarget: DimensionType | null;
  setTeleportState: (progress: number, target: DimensionType | null) => void;

  // Combat Feedback
  hitIndicator: { active: boolean; position: { x: number; y: number } | null };
  bloodSplatter: boolean;
  
  // Mobile
  isMobile: boolean;
  mobileControls: {
    move: { x: number; y: number };
    look: { x: number; y: number };
    jump: boolean;
    fire: boolean;
    sprint: boolean;
  };

  setGameState: (state: GameState) => void;
  setUser: (user: User | null) => void;
  fetchStats: () => Promise<void>;
  recordShot: () => void;
  recordHit: () => void;
  setMobileControls: (controls: Partial<GameStore['mobileControls']>) => void;
  setIsMobile: (isMobile: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;

  // Infection Actions
  infectPlayer: (playerId: string) => void;
  checkInfectionWin: () => void;
  startInfectionMatch: () => void;
  tickInfectionTimer: (delta: number) => void;

  // Killstreak Actions
  onKill: () => void;
  onDeath: () => void;
  applyStreakReward: (streak: number) => void;

  // Time Warp Actions
  activateTimeWarp: (duration?: number) => void;

  enterLobby: () => void;
  startGame: (roomId?: string) => void;
  endGame: () => void;
  leaveGame: () => void;
  updateTime: (delta: number) => void;
  hitPlayer: (isGlitchAttacker?: boolean) => void;
  hitEnemy: (id: string, damage?: number) => void;
  addLaser: (start: [number, number, number], end: [number, number, number], color: string) => void;
  addParticles: (position: [number, number, number], color: string, count?: number) => void;
  addEvent: (message: string) => void;
  updateEnemies: (time: number) => void;
  fireProjectile: (data: Omit<ProjectileData, 'id' | 'ownerId' | 'timestamp'>) => void;
  removeProjectile: (id: string) => void;
  updateProjectiles: (delta: number) => void;
  cleanupEffects: (time: number) => void;
  setPlayerState: (state: EntityState) => void;
  setSkin: (skin: SkinType | string) => void;
  setColor: (color: string) => void;
  setPattern: (pattern: PatternType) => void;
  toggleAccessory: (accessory: AccessoryType) => void;
  setGunSkin: (skin: string) => void;
  setBanner: (banner: string) => void;
  setPlayerClass: (cls: PlayerClass) => void;
  setMap: (map: MapType) => void;
  setMode: (mode: GameMode) => void;
  setRanked: (isRanked: boolean) => void;
  setRegion: (region: string) => void;
  triggerEmote: (emote: string) => void;
  toggleMute: () => void;
  toggleThirdPerson: () => void;
  setChatOpen: (open: boolean) => void;
  setAttacking: (attacking: boolean, type?: string | null) => void;
  meleeAttack: () => void;
  setInventoryOpen: (open: boolean) => void;
  setDonateModalOpen: (open: boolean) => void;
  
  // AI Role & Admin Actions
  recommendUpdate: (text: string) => void;
  approveUpdate: (id: string) => void;
  rejectUpdate: (id: string) => void;
  checkAdminPassword: (password: string) => void;
  updateGameBranding: (name: string, logo: string) => void;
  setAutoRotation: (enabled: boolean) => void;
  setBotPower: (power: number) => void;
  unlockTrophy: (id: string) => void;
  regenerateHealth: (amount: number) => void;
  takeDamage: (amount: number, isGlitchAttacker?: boolean) => void;
  
  setPlayerPosition: (pos: [number, number, number]) => void;
  switchWeapon: (index: number) => void;
  toggleReady: () => void;
  reload: () => void;
  consumeAmmo: () => void;
  useStamina: (amount: number) => boolean;
  
  // Task Actions
  addTask: (task: Omit<GameTask, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<GameTask>) => void;

  // Admin Actions
  processCommand: (command: string) => void;
  
  // Build Mode
  setBuildMode: (active: boolean) => void;
  setSelectedBlock: (block: BlockType) => void;
  placeBlock: (position: [number, number, number]) => void;
  bulkPlaceBlocks: (blocks: { type: BlockType, position: [number, number, number] }[]) => void;
  breakBlock: (id: string) => void;
  saveMap: () => void;
  clearMap: () => void;
  setPrivateServerName: (name: string) => void;
  
  // Chat & Social
  sendChatMessage: (message: string, type: 'global' | 'proximity' | 'team') => void;
  addChatMessage: (msg: ChatMessage) => void;
  setGamertag: (tag: string) => void;
  addFriend: (profile: UserProfile) => void;
  
  // Spectator
  setSpectating: (spectating: boolean, targetId?: string | null) => void;
  cycleSpectator: () => void;
  setTargetedEnemyId: (id: string | null) => void;
  
  // Movement
  setSprinting: (sprinting: boolean) => void;
  setSliding: (sliding: boolean) => void;
  setWallRunning: (isWallRunning: boolean, side: 'left' | 'right' | null) => void;
  
  // AAA Actions
  setJumpHeight: (height: number) => void;
  setGravity: (gravity: number) => void;
  setBotDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
  setBotCount: (count: number) => void;
  setMouseSensitivity: (sensitivity: number) => void;
  setFov: (fov: number) => void;
  setCameraShake: (shake: number) => void;
  setCrosshairStyle: (style: 'dot' | 'cross' | 'circle' | 'dynamic') => void;
  setSprintSpeed: (speed: number) => void;
  setCameraMode: (mode: 'first-person' | 'third-person') => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
  setResolutionScale: (scale: number) => void;
  setShowFps: (show: boolean) => void;
  setBotAggression: (aggression: number) => void;
  setBotAccuracy: (accuracy: number) => void;
  setBotReactionTime: (time: number) => void;
  setBotStrategy: (strategy: 'aggressive' | 'defensive' | 'balanced' | 'tactical') => void;
  updateSettings: (settings: any) => void;
  
  castSpell: () => void;
  setSelectedSpell: (spell: SpellType) => void;
  
  // Replay Actions
  startRecording: () => void;
  stopRecording: () => void;
  saveReplay: () => void;
  playReplay: (replay: ReplaySnapshot[]) => void;
  setReplayPlaybackSpeed: (speed: number) => void;
  setReplayPaused: (paused: boolean) => void;
  setCameraPathEditorOpen: (open: boolean) => void;
  setCameraPath: (path: { x: number, y: number, z: number, time: number }[]) => void;
  seekReplay: (time: number) => void;
  stopReplay: () => void;
  logout: () => Promise<void>;
  
  // Vehicle Actions
  spawnVehicle: (type: VehicleType, position: [number, number, number], team?: Team) => void;
  enterVehicle: (id: string) => void;
  exitVehicle: () => void;
  updateVehicle: (id: string, data: Partial<VehicleData>) => void;
  
  // Recording
  setRecording: (recording: boolean) => void;
  clearReplay: () => void;
  
  // Environment Actions
  setWeather: (weather: WeatherType) => void;
  setTime: (time: number) => void;
  
  // Multiplayer actions
  updatePlayerPosition: (position: [number, number, number], rotation: number, isDashing?: boolean) => void;

  // Tactical pings
  pings: { id: string, position: [number, number, number], type: 'danger' | 'loot' | 'generic', label: string, timestamp: number }[];
  addPing: (position: [number, number, number], type: 'danger' | 'loot' | 'generic', label?: string) => void;

  // Crosshair & Inspection Feedback
  isPlayerMoving: boolean;
  lastFireTime: number;
  isInspecting: boolean;
  inspectStartTime: number;

  // Map Voting
  mapVotingOptions: MapType[];
  mapVotes: Record<string, number>;
  playerVotedMap: MapType | null;
  generateMapVotingOptions: () => void;
  voteForMap: (map: MapType) => void;

  // Custom Modded World variables
  moddedSpeedMultiplier: number;
  moddedGravityMultiplier: number;
  moddedDamageMultiplier: number;
  moddedInfiniteAmmo: boolean;
  moddedColor: string;
  moddedWeapons: string[];
  moddedSkyColor: string;
  moddedCustomMesh: string;
  moddedBotScale: number;
  moddedBotSpeedMultiplier: number;
  moddedIsAggressiveBots: boolean;
  moddedMapTheme: string;
  activeWorldId: string | null;
  activeWorldName: string;
  applyWorldMods: (mods: {
    speedMultiplier: number;
    gravityMultiplier: number;
    damageMultiplier: number;
    infiniteAmmo: boolean;
    color: string;
    weapons: string[];
    skyColor: string;
    customMesh: string;
    botScale: number;
    botSpeedMultiplier: number;
    isAggressiveBots: boolean;
    mapTheme: string;
    worldId: string | null;
    worldName: string;
  }) => void;
}

const INITIAL_ENEMIES: EnemyData[] = [
  { id: 'bot-1', position: [40, 1, 40], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-2', position: [-40, 1, 40], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-3', position: [40, 1, -40], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-4', position: [-40, 1, -40], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-5', position: [0, 1, -50], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-6', position: [60, 1, 0], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-7', position: [-60, 1, 0], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
  { id: 'bot-8', position: [0, 1, 50], state: 'active', disabledUntil: 0, health: 100, team: 'none' },
];

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'splash',
  pings: [],
  isPlayerMoving: false,
  lastFireTime: 0,
  isInspecting: false,
  inspectStartTime: 0,
  mapVotingOptions: [],
  mapVotes: {},
  playerVotedMap: null,
  score: 0,
  timeLeft: 120, // 2 minutes
  health: 100,
  kills: 0,
  deaths: 0,
  playerState: 'active',
  playerDisabledUntil: 0,
  enemies: [],
  lasers: [],
  particles: [],
  events: [],
  controlPoints: [],
  playerClass: 'mage',
  survivalTime: 0,
  trophyNotification: null,
  mana: 100,
  maxMana: 100,
  selectedSpell: 'blink',
  spellCooldowns: {
    blink: 0,
    shield: 0,
    fireball: 0,
    heal: 0,
    slow: 0,
    haste: 0,
    timewarp: 0,
  },
  // Ranked & Progression
  rank: 'bronze',
  rankPoints: 0,
  level: 1,
  xp: 0,
  credits: 0,
  coins: 500,
  totalGambled: 0,
  gambleHistory: [],
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  gamble: (amount) => {
    const state = get();
    if (state.coins < amount) {
      state.addEvent('🚫 NOT ENOUGH COINS!');
      return;
    }
    const win = Math.random() > 0.5;
    const multiplier = win ? 2 : 0;
    const resultAmount = amount * multiplier;
    const newCoins = state.coins - amount + resultAmount;
    
    const record = { 
      result: win ? 'win' as const : 'loss' as const, 
      amount: resultAmount, 
      timestamp: Date.now() 
    };

    if (win) {
      state.addEvent(`🎰 JACKPOT! WON ${resultAmount} COINS!`);
      soundService.playSFX('achievement');
    } else {
      state.addEvent(`💀 BUST! LOST ${amount} COINS.`);
      soundService.playSFX('ui_click');
    }

    set({ 
      coins: newCoins, 
      totalGambled: state.totalGambled + amount,
      gambleHistory: [record, ...state.gambleHistory].slice(0, 50)
    });
  },
  weaponLevels: {},
  weaponXP: {},
  battlePassTier: 1,
  battlePassXP: 0,
  isPremiumBattlePass: false,
  
  isWallRunning: false,
  wallRunSide: null,
  
  // Lobby System
  isReady: false,
  lobbyPlayers: [],
  
  socket: null,
  otherPlayers: {},
  roomId: null,
  privateServerName: '',
  selectedRegion: 'US-East',
  chatMessages: [],
  gamertag: `Player_${Math.floor(Math.random() * 10000)}`,
  friends: [],
  friendRequests: [],
  
  selectedSkin: 'alien',
  customSkins: [],
  selectedColor: '#f59e0b',
  selectedPattern: 'none',
  selectedAccessories: [],
  selectedGunSkin: 'default',
  selectedBanner: 'default',
  selectedMap: 'maze',
  selectedMode: 'ffa',
  isRanked: false,
  isMuted: true,
  isCutsceneActive: false,
  setCutsceneActive: (active) => set({ isCutsceneActive: active }),
  isGlitch: false,
  infectionLevel: 0,
  infectionMatchTimer: 0,
  humanSurvivors: 0,
  infectionWinner: '',
  glitchPlayerIds: [],
  playerAnimation: 'idle',
  setPlayerAnimation: (anim) => set({ playerAnimation: anim }),
  isVehicleMenuOpen: false,
  setVehicleMenuOpen: (open) => set({ isVehicleMenuOpen: open }),
  isThirdPerson: false,
  lobbyMode: true,
  isChatOpen: false,
  isReloading: false,
  isAttacking: false,
  attackType: null,
  lastDamageTime: 0,
  autoRotation: true,
  is3DMode: false,
  isUltraGraphics: false,
  unlockedMods: [],
  botPower: 5,
  botAggression: 5,
  botAccuracy: 5,
  botReactionTime: 500,
  botStrategy: 'balanced',
  unlockedTrophies: [],
  gameVersion: 'V1.0.0 ALPHA',
  
  // AI Role & Admin
  updateRecommendations: [],
  gameName: 'NEON ARENA',
  gameLogo: 'V1.0.0 ALPHA',
  isAdmin: false,
  
  jumpHeight: 1.5,
  gravity: 9.81,
  dashSpeed: 25,
  dashCooldown: 1000,
  lastDashTime: 0,
  canDoubleJump: true,
  hasDoubleJumped: false,
  botDifficulty: 'medium',
  botCount: 4,
  mouseSensitivity: 1,
  fov: 75,
  cameraShake: 1,
  crosshairStyle: 'cross',
  sprintSpeed: 1.6,
  recoil: 0,
  cameraMode: 'first-person',
  graphicsQuality: 'high',
  resolutionScale: 1,
  showFps: true,

  // Dimension & FaceCam Initial State
  currentDimension: 'core',
  setDimension: (dim) => set({ currentDimension: dim, lastDimensionShift: Date.now() }),
  faceCamEnabled: false,
  setFaceCamEnabled: (enabled) => set({ faceCamEnabled: enabled }),

  // World Events Initial State
  activeWorldEvent: null,
  setWorldEvent: (event) => set({ 
    activeWorldEvent: event ? { type: event.type, timeLeft: event.duration } : null 
  }),

  // Powerups & Quests Initial State
  powerUps: [],
  activePowerUps: {
    speed: 0,
    damage: 0,
    shield: 0,
    infinite_ammo: 0,
    gravity_well: 0,
    vampirism: 0,
    invisible: 0
  },
  quests: [
    { id: 'q1', title: 'Cyber Hunter', description: 'Eliminate 10 enemies.', requirement: 10, progress: 0, reward: 500, type: 'kills', isClaimed: false },
    { id: 'q2', title: 'Marathon', description: 'Travel 5000 units.', requirement: 5000, progress: 0, reward: 300, type: 'distance', isClaimed: false },
    { id: 'q3', title: 'Veteran', description: 'Complete 3 matches.', requirement: 3, progress: 0, reward: 1000, type: 'matches', isClaimed: false },
    { id: ' headshot_king', title: 'Headshot Specialist', description: 'Land 5 critical hits.', requirement: 5, progress: 0, reward: 800, type: 'headshots', isClaimed: false },
  ],
  
  spawnPowerUp: (type, position) => {
    const id = `pu-${Math.random().toString(36).substr(2, 9)}`;
    set(state => ({
      powerUps: [...state.powerUps, { id, type, position, duration: 15000, spawnTime: Date.now() }]
    }));
  },
  
  collectPowerUp: (id) => {
    const { powerUps } = get();
    const powerUp = powerUps.find(p => p.id === id);
    if (!powerUp) return;
    
    set(state => ({
      powerUps: state.powerUps.filter(p => p.id !== id),
      activePowerUps: { ...state.activePowerUps, [powerUp.type]: 15000 } // 15s duration
    }));
    
    get().addEvent(`⚡ POWER-UP COLLECTED: ${powerUp.type.toUpperCase()}`);
    soundService.playSFX('achievement');
  },
  
  updateQuests: (type, amount) => {
    set(state => ({
      quests: state.quests.map(q => {
        if (q.type === type && !q.isClaimed) {
          return { ...q, progress: Math.min(q.requirement, q.progress + amount) };
        }
        return q;
      })
    }));
  },
  
  claimQuestReward: (id) => {
    const { quests, addCoins } = get();
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.progress < quest.requirement || quest.isClaimed) return;
    
    set(state => ({
      quests: state.quests.map(q => q.id === id ? { ...q, isClaimed: true } : q)
    }));
    
    addCoins(quest.reward);
    get().addEvent(`🎁 QUEST CLAIMED: ${quest.title} (+${quest.reward} COINS)`);
    soundService.playSFX('achievement');
  },

  // Servers
  servers: [],
  isLoadingServers: false,
  refreshServers: () => {
    set({ isLoadingServers: true });
    // Simulate fetching servers
    setTimeout(() => {
      const customServers: ServerInstance[] = [];
      const shuffledMaps = [...ARENA_MAPS].sort(() => 0.5 - Math.random()).slice(0, 4);
      shuffledMaps.forEach((m, idx) => {
        const serverName = m.servers[0] || 'Official Server';
        customServers.push({
          id: `srv-custom-${idx}`,
          name: `${serverName} // ${m.name}`,
          map: m.id as MapType,
          players: Math.floor(Math.random() * 40) + 10,
          maxPlayers: 100,
          ping: Math.floor(Math.random() * 60) + 10,
          region: ['US-East', 'EU-West', 'US-West', 'ASIA-East'][idx % 4],
          type: Math.random() > 0.5 ? 'casual' : 'competitive'
        });
      });

      const mockServers: ServerInstance[] = [
        { id: 'srv-1', name: 'Neon Surge // US-East', map: 'cybercity', players: 12, maxPlayers: 24, ping: 24, region: 'US-East', type: 'casual' },
        ...customServers,
        { id: 'srv-2', name: 'Open World Alpha', map: 'infinite', players: 45, maxPlayers: 100, ping: 48, region: 'EU-West', type: 'open-world' },
        { id: 'srv-3', name: 'Comp Rush // Rank Only', map: 'arena', players: 8, maxPlayers: 10, ping: 12, region: 'US-West', type: 'competitive' },
        { id: 'srv-4', name: 'Vortex Void // Experimental', map: 'void', players: 2, maxPlayers: 16, ping: 156, region: 'ASIA-East', type: 'casual' },
      ];
      set({ servers: mockServers, isLoadingServers: false });
    }, 800);
  },
  joinOpenWorld: () => {
    set({ gameState: 'open_world', selectedMode: 'ffa', selectedMap: 'infinite', lobbyMode: false });
    get().addEvent('🌍 ENTERING OPEN WORLD...');
  },
  joinServer: (serverId) => {
    const server = get().servers.find(s => s.id === serverId);
    if (server) {
      set({ 
        gameState: server.type === 'open-world' ? 'open_world' : 'playing', 
        selectedMap: server.map,
        selectedRegion: server.region,
        selectedMode: server.type === 'competitive' ? 'ranked' : 'ffa',
        lobbyMode: false
      });
      get().addEvent(`🛰️ CONNECTED TO ${server.name.toUpperCase()}`);
    }
  },
  achievements: [],
  dailyRewards: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, collected: false })),
  perks: ['GHOST', 'RELOAD+', 'SPEEDSTER', 'JUGGERNAUT', 'SCAVENGER'],
  activePerks: [],
  weaponAttachments: {},
  skinRarity: { 'neon': 'common', 'gold': 'rare', 'stealth': 'epic', 'glitch': 'legendary', 'void': 'legendary' },
  prestigeLevel: 0,
  clanLeaderboard: [],
  dynamicWeatherEnabled: true,
  destructibleEnvironment: true,
  motionBlur: true,
  bloomIntensity: 1.5,
  autoAimEnabled: false,
  killcamEnabled: true,
  bountyTargetId: null,
  uavActive: false,
  orbitalStrikeReady: false,
  sentryTurrets: [],
  petFollower: null,
  emoteQueue: [],
  battlePassLevel: 1,
  customCrosshairColor: '#00ffff',
  headshotMultiplier: 2.0,
  staminaRegenRate: 10,
  maxDashes: 3,
  currentDashes: 3,
  lastDashRefillTime: Date.now(),
  
  modals: {
    casino: false,
    update: false,
    tasks: false,
    friends: false,
    account: false,
    clans: false,
    vehicles: false,
  },
  toggleModal: (modal) => set((state) => ({ 
    modals: { ...state.modals, [modal]: !state.modals[modal] } 
  })),
  setModal: (modal, open) => set((state) => ({ 
    modals: { ...state.modals, [modal]: open } 
  })),

  isFlying: false,
  isGhost: false,
  isJuggernaut: false,
  xpMultiplier: 1.0,
  creditBonus: 0,
  seasonalChallenges: [],
  inventorySlots: 20,
  marketCredits: 0,
  tradeOffers: [],
  inGameMusicVolume: 0.5,
  voiceChatPosition: 'center',
  voiceChatVolume: 1.0,
  vibrationEnabled: true,
  streamerMode: false,
  lowLatencyMode: true,
  raytracingEnabled: false,
  physicsSubsteps: 1,
  gravityScaler: 1.0,
  terminalVelocity: 50,
  movementWeight: 0.15,
  timeScaler: 1.0,
  colorGrading: 'standard',
  postProcessingProfile: 'aaa-default',
  minimapZoom: 1.0,
  damageNumbersEnabled: true,
  killstreakVoiceover: true,
  adaptiveAudio: true,
  neuralNetworkAim: false,
  fractalRendering: false,
  dimensionShiftCooldown: 5000,
  lastDimensionShift: 0,
  teleportProgress: 0,
  teleportTarget: null,
  setTeleportState: (progress, target) => set({ teleportProgress: progress, teleportTarget: target }),
  
  matchHistory: [],
  replays: [],
  isRecording: false,
  currentReplay: [],
  addReplaySnapshot: (snapshot) => {
    const { isRecording, currentReplay } = get();
    if (isRecording) {
      set({ currentReplay: [...currentReplay, snapshot].slice(-1000) });
    }
  },
  setRecording: (recording) => set({ isRecording: recording }),
  clearReplay: () => set({ currentReplay: [] }),
  replayPlaybackSpeed: 1,
  isReplayPaused: false,
  isCameraPathEditorOpen: false,
  cameraPath: [],
  replayTime: 0,
  isReplaying: false,
  leaderboard: [
    { id: 'CYBER_PUNK', score: 1240, rank: 'Diamond' },
    { id: 'NEON_GHOST', score: 980, rank: 'Platinum' },
    { id: 'VOID_WALKER', score: 750, rank: 'Gold' },
    { id: 'TECH_NOIR', score: 420, rank: 'Silver' },
    { id: 'DATA_BREACH', score: 150, rank: 'Bronze' },
  ],
  
  environment: {
    time: 12,
    weather: 'clear',
    intensity: 0,
    date: new Date().toLocaleDateString(),
    peWeather: {
      temp: 21,
      windSpeed: 15,
      condition: 'clear',
      description: 'Clear over Algoa Bay, Port Elizabeth'
    }
  },
  isRealLifeSyncEnabled: true,
  setRealLifeSyncEnabled: (enabled) => set({ isRealLifeSyncEnabled: enabled }),
  updateEnvironment: (env) => set(state => ({
    environment: { ...state.environment, ...env }
  })),
  
  vehicles: {},
  currentVehicleId: null,
  
  isBuildMode: false,
  selectedBlock: 'stone',
  worldBlocks: [],
  scannedModelType: null,
  scannedModelColor: '#ffffff',
  scannedModelScale: { x: 1, y: 1, z: 1 },
  scannedModelDecimation: 100,
  scannedModelTextureCaptured: false,
  scannedModelRepairedHoles: false,
  scannedModelSupportEnabled: false,
  
  isSpectating: false,
  spectatorTargetId: null,
  targetedEnemyId: null,
  
  isSprinting: false,
  isSliding: false,
  playerPosition: [0, 0, 0],
  playerRotation: 0,
  
  jumpPads: [
    { id: 'pad-1', position: [10, 0, 10], power: 15 },
    { id: 'pad-2', position: [-10, 0, -10], power: 15 },
    { id: 'pad-3', position: [15, 0, -15], power: 20 },
    { id: 'pad-4', position: [-15, 0, 15], power: 20 },
  ],
  
  availableWeapons: Object.keys(WEAPONS) as WeaponType[],
  hotbar: ['pistol', 'smg', 'shotgun', 'sniper', 'rpg', 'sword', 'minigun', 'raygun', 'knife'],
  equipToHotbar: (weaponId, slotIndex) => set(state => {
    const newHotbar = [...state.hotbar];
    newHotbar[slotIndex] = weaponId;
    return { hotbar: newHotbar };
  }),
  currentWeaponIndex: 0,
  currentAmmo: Object.fromEntries(Object.values(WEAPONS).map(w => [w.id, w.maxAmmo])),
  isInventoryOpen: false,
  isDonateModalOpen: false,
  isMapOpen: false,
  
  team: 'none',
  teamScores: { amber: 0, blue: 0 },
  flags: [],
  projectiles: [],

  user: null,
  persistentStats: null,
  sessionShots: 0,
  sessionHits: 0,

  tasks: [],
  mentions: [],

  stamina: 100,
  maxStamina: 100,
  lastStaminaUseTime: 0,
  isPointerLocked: false,
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  hitIndicator: { active: false, position: null },
  bloodSplatter: false,

  isMobile: false,
  mobileControls: {
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    jump: false,
    fire: false,
    sprint: false,
  },
  gameMode: 'ffa',
  clanId: null,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  musicEnabled: false,
  
  // VR/Combat Dimension Stats
  energy: 100,
  focus: 50,
  overload: 0,
  instability: 0,
  isFlashlightActive: false,
  portalPosition: null,
  mapSeed: 12345,
  arenaState: 'standard',
  combatPhase: 1,

  setArenaState: (arenaState) => set({ arenaState }),
  setCombatPhase: (combatPhase) => set({ combatPhase }),
  updateStats: (updates) => set(state => ({
    energy: updates.energy !== undefined ? Math.max(0, Math.min(100, updates.energy)) : state.energy,
    focus: updates.focus !== undefined ? Math.max(0, Math.min(100, updates.focus)) : state.focus,
    overload: updates.overload !== undefined ? Math.max(0, Math.min(100, updates.overload)) : state.overload,
  })),
  setInstability: (value) => set({ instability: Math.max(0, Math.min(100, value)) }),
  toggleFlashlight: () => set(state => ({ isFlashlightActive: !state.isFlashlightActive })),
  nextLevel: () => {
    const freshSeed = Math.floor(Math.random() * 100000) + 1;
    set(state => ({
      mapSeed: freshSeed,
      instability: 0,
      portalPosition: null,
      worldBlocks: [],
      health: 100,
      energy: 100,
      enemies: state.enemies.map(e => ({
        ...e,
        position: [
          (Math.random() - 0.5) * 160,
          1,
          (Math.random() - 0.5) * 160
        ] as [number, number, number],
        state: 'active',
        health: 100
      }))
    }));
    get().addEvent('🌀 SYSTEM RECONNECTED: PROCEDURAL LOWER CHAMBERS INITIALIZED.');
    try {
      soundService.playSFX('dimension_shift');
    } catch (e) {}
  },

  // Killstreaks
  currentKillStreak: 0,
  bestKillStreak: 0,
  activeStreakPower: null,
  streakPowerExpiry: 0,

  // Time Warp
  isTimeWarpActive: false,
  isGlobalTimeWarp: false,
  timeWarpExpiry: 0,

  // Arena Events
  damageMultiplier: 1,
  gravityInverted: false,
  blackoutActive: false,
  alienPredatorActive: false,
  beingEaten: false,

  setGameState: (state) => set({ gameState: state }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
  
  setUser: (user) => set({ user }),
  fetchStats: async () => {
    const { user } = get();
    if (user) {
      const stats = await getPlayerStats(user.uid);
      const history = await getMatchHistory(user.uid);
      if (stats) {
        set({ 
          persistentStats: stats,
          matchHistory: history,
          rank: stats.rank || 'bronze',
          rankPoints: stats.rankPoints || 0,
          level: stats.level || 1,
          xp: stats.xp || 0,
          credits: stats.credits || 0,
          weaponLevels: stats.weaponLevels || {},
          battlePassTier: stats.battlePassTier || 1,
          selectedBanner: stats.selectedBanner || 'default'
        });
      }
    }
  },
  recordShot: () => set(state => ({ sessionShots: state.sessionShots + 1 })),
  recordHit: () => set(state => ({ sessionHits: state.sessionHits + 1 })),
  setMobileControls: (controls) => set(state => ({
    mobileControls: { ...state.mobileControls, ...controls }
  })),
  setIsMobile: (isMobile) => set({ isMobile }),

  enterLobby: () => set({ gameState: 'lobby' }),
  startMatch: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startGame');
    }
  },

  startGame: (roomId?: string) => {
    const { socket, selectedSkin, selectedColor, selectedPattern, selectedAccessories, selectedMap, selectedMode, gamertag, selectedRegion, privateServerName, playerClass } = get();
    
    if (socket) {
      socket.disconnect();
    }

    // Set to lobby state while connecting
    set({ gameState: 'lobby' });

    let newSocket: Socket | null = null;
    
    try {
      newSocket = io(window.location.origin, {
        reconnectionAttempts: 3,
        timeout: 10000
      });
      
      newSocket.on('connect', () => {
        newSocket!.emit('joinGame', { 
          skin: selectedSkin, 
          color: selectedColor,
          pattern: selectedPattern,
          accessories: selectedAccessories,
          map: selectedMap, 
          mode: selectedMode,
          roomId: roomId || null,
          privateServerName: privateServerName,
          name: gamertag,
          region: selectedRegion,
          playerClass,
          uid: get().user?.uid,
          isRanked: get().isRanked
        });
      });

      newSocket.on('connect_error', () => {
        get().addEvent('CONNECTION FAILED');
        set({ gameState: 'menu', socket: null });
      });

      newSocket.on('gameError', (msg: string) => {
        get().addEvent(`GAME ERROR: ${msg}`);
        get().leaveGame();
      });
    } catch (err) {
      console.error('Socket initialization failed:', err);
      set({ gameState: 'menu' });
    }

    if (!newSocket) return;

    newSocket.on('chatMessage', (msg: ChatMessage) => {
      get().addChatMessage(msg);
    });

    newSocket.on('lobbyUpdate', (data: { players: PlayerData[] }) => {
      set({ lobbyPlayers: data.players, gameState: 'lobby' });
    });

    newSocket.on('gameStarted', ({ timeLeft }: { timeLeft: number }) => {
      set({ gameState: 'playing', timeLeft, survivalTime: 0 });
    });

    newSocket.on('controlPointUpdate', (data: { controlPoints: ControlPoint[], teamScores: { amber: number, blue: number } }) => {
      set({ controlPoints: data.controlPoints, teamScores: data.teamScores });
    });

    newSocket.on('gameOver', ({ teamScores, players }: { teamScores: any, players: any[] }) => {
      set({ gameState: 'gameover', teamScores });
      const { selectedMap, selectedMode, score, kills, deaths, timeLeft } = get();
      const record = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        map: selectedMap,
        mode: selectedMode,
        score,
        kills,
        deaths,
        duration: 600 - timeLeft
      };
      set(state => ({ matchHistory: [record, ...state.matchHistory].slice(0, 20) }));
    });

    newSocket.on('gameJoined', (data: { players: Record<string, PlayerData>, team: Team, mode: GameMode, flags: FlagData[], roomId: string, blocks: WorldBlock[], teamScores?: { amber: number, blue: number } }) => {
      const otherPlayers = { ...data.players };
      delete otherPlayers[newSocket!.id!];
      set({ 
        otherPlayers,
        gameState: 'playing',
        isCutsceneActive: true,
        lobbyMode: false,
        timeLeft: 120,
        score: 0,
        health: 100,
        kills: 0,
        deaths: 0,
        team: data.team,
        selectedMode: data.mode,
        flags: data.flags,
        roomId: data.roomId,
        worldBlocks: data.blocks || [],
        enemies: INITIAL_ENEMIES.map(e => ({ ...e, state: 'active', disabledUntil: 0, health: 100, team: 'none' })),
        sessionShots: 0,
        sessionHits: 0,
        teamScores: data.teamScores || { amber: 0, blue: 0 }
      });
    });

    newSocket.on('teamScoreUpdate', (scores: { amber: number, blue: number }) => {
      set({ teamScores: scores });
    });

      newSocket.on('playerJoined', (player: PlayerData) => {
        set(state => ({
          otherPlayers: { ...state.otherPlayers, [player.id]: player },
          events: [...state.events, { id: Math.random().toString(), message: `${player.name} joined`, timestamp: Date.now() }]
        }));
      });

      newSocket.on('playerMoved', (data: { id: string, position: [number, number, number], rotation: number, isDashing?: boolean }) => {
        set(state => {
          if (!state.otherPlayers[data.id]) return state;
          return {
            otherPlayers: {
              ...state.otherPlayers,
              [data.id]: {
                ...state.otherPlayers[data.id],
                position: data.position,
                rotation: data.rotation,
                isDashing: data.isDashing || false
              }
            }
          };
        });
      });

      newSocket.on('playerShot', (data: { id: string, start: [number, number, number], end: [number, number, number], color: string }) => {
        set(state => ({
          lasers: [...state.lasers, { id: Math.random().toString(36).substr(2, 9), start: data.start, end: data.end, timestamp: Date.now(), color: data.color }],
          particles: [...state.particles, { id: Math.random().toString(36).substr(2, 9), position: data.end, timestamp: Date.now(), color: data.color }]
        }));
      });

      newSocket.on('playerHit', (data: { targetId: string, shooterId: string, targetDisabledUntil: number, shooterScore: number, targetHealth: number, shooterKills: number, targetDeaths: number }) => {
        set(state => {
          const now = Date.now();
          const shooterName = data.shooterId === newSocket!.id ? 'You' : (state.otherPlayers[data.shooterId]?.name || 'Unknown');
          const targetName = data.targetId === newSocket!.id ? 'You' : (state.otherPlayers[data.targetId]?.name || 'Unknown');
          
          if (data.targetId === newSocket!.id) {
            const isDead = data.targetHealth <= 0;
            const eventMsg = isDead ? `${shooterName} eliminated ${targetName}` : `${shooterName} hit ${targetName}`;
            const newEvent = { id: Math.random().toString(), message: eventMsg, timestamp: now };
            
            return {
              playerState: isDead ? 'disabled' : 'active',
              playerDisabledUntil: data.targetDisabledUntil,
              health: data.targetHealth,
              deaths: data.targetDeaths,
              events: [...state.events, newEvent]
            };
          } else {
            const players = { ...state.otherPlayers };
            const isDead = data.targetHealth <= 0;
            const eventMsg = isDead ? `${shooterName} eliminated ${targetName}` : `${shooterName} hit ${targetName}`;
            const newEvent = { id: Math.random().toString(), message: eventMsg, timestamp: now };

            if (players[data.targetId]) {
              players[data.targetId] = {
                ...players[data.targetId],
                state: isDead ? 'disabled' : 'active',
                disabledUntil: data.targetDisabledUntil,
                health: data.targetHealth,
                deaths: data.targetDeaths
              };
            }
            if (players[data.shooterId]) {
              players[data.shooterId] = {
                ...players[data.shooterId],
                score: data.shooterScore,
                kills: data.shooterKills
              };
            }
            
            // If I am the shooter, update my kills too (though server usually handles score, kills is good to sync)
            if (data.shooterId === newSocket!.id) {
              return { 
                score: data.shooterScore,
                kills: data.shooterKills,
                otherPlayers: players, 
                events: [...state.events, newEvent] 
              };
            }

            return { otherPlayers: players, events: [...state.events, newEvent] };
          }
        });
      });

      newSocket.on('projectileFired', (data: ProjectileData) => {
        set(state => ({
          projectiles: [...state.projectiles, data]
        }));
      });

      newSocket.on('playerMeleeAttacked', (data: { playerId: string, weaponId: string }) => {
        set(state => {
          const otherPlayers = { ...state.otherPlayers };
          if (otherPlayers[data.playerId]) {
            otherPlayers[data.playerId] = {
              ...otherPlayers[data.playerId],
              isAttacking: true,
              attackType: data.weaponId
            };
            
            // Reset after animation duration
            setTimeout(() => {
              set(s => {
                const ops = { ...s.otherPlayers };
                if (ops[data.playerId]) {
                  ops[data.playerId] = {
                    ...ops[data.playerId],
                    isAttacking: false,
                    attackType: null
                  };
                }
                return { otherPlayers: ops };
              });
            }, 300);
          }
          return { otherPlayers };
        });
      });

      newSocket.on('playerLeft', (id: string) => {
        set(state => {
          const players = { ...state.otherPlayers };
          const playerName = players[id]?.name || 'Unknown';
          delete players[id];
          return { 
            otherPlayers: players,
            events: [...state.events, { id: Math.random().toString(), message: `${playerName} left`, timestamp: Date.now() }]
          };
        });
      });

      newSocket.on('emote', (data: { id: string, emote: string }) => {
        set(state => {
          const playerName = data.id === newSocket!.id ? 'You' : (state.otherPlayers[data.id]?.name || 'Unknown');
          return {
            events: [...state.events, { id: Math.random().toString(), message: `${playerName}: ${data.emote}`, timestamp: Date.now() }]
          };
        });
      });

      newSocket.on('teamScores', (scores: { amber: number, blue: number }) => {
        set({ teamScores: scores });
      });

      newSocket.on('flagUpdate', (flags: FlagData[]) => {
        set({ flags });
      });

      newSocket.on('flagEvent', (data: { message: string }) => {
        set(state => ({
          events: [...state.events, { id: Math.random().toString(), message: data.message, timestamp: Date.now() }]
        }));
      });

      newSocket.on('settingsUpdated', (settings: any) => {
        set({ 
          jumpHeight: settings.jumpHeight,
          gravity: settings.gravity,
          botDifficulty: settings.botDifficulty,
          botCount: settings.botCount
        });
      });

      newSocket.on('enemiesMoved', (enemies: any) => {
        set({ enemies: Object.values(enemies) });
      });

      newSocket.on('enemyShot', (data: { id: string, start: [number, number, number], end: [number, number, number], color: string }) => {
        set(state => ({
          lasers: [...state.lasers, { id: Math.random().toString(36).substr(2, 9), start: data.start, end: data.end, timestamp: Date.now(), color: data.color }],
          particles: [...state.particles, { id: Math.random().toString(36).substr(2, 9), position: data.end, timestamp: Date.now(), color: data.color }]
        }));
      });

      newSocket.on('enemyUpdate', (data: { id: string, state: any, health: number }) => {
        set(state => ({
          enemies: state.enemies.map(e => e.id === data.id ? { ...e, state: data.state, health: data.health } : e)
        }));
      });

      newSocket.on('mapChanged', (map: MapType) => {
        set({ selectedMap: map });
      });

      newSocket.on('blockPlaced', (block: WorldBlock) => {
        set(state => ({ worldBlocks: [...state.worldBlocks, block] }));
      });

      newSocket.on('bulkBlocksPlaced', (blocks: WorldBlock[]) => {
        set(state => ({ worldBlocks: [...state.worldBlocks, ...blocks] }));
      });

      newSocket.on('blockBroken', (id: string) => {
        set(state => ({ worldBlocks: state.worldBlocks.filter(b => b.id !== id) }));
      });

      newSocket.on('mapCleared', () => {
        set({ worldBlocks: [] });
      });
    set({
      gameState: 'playing',
      score: 0,
      timeLeft: 120,
      playerState: 'active',
      playerDisabledUntil: 0,
      health: 100,
      kills: 0,
      deaths: 0,
      sessionShots: 0,
      sessionHits: 0,
      enemies: INITIAL_ENEMIES.map(e => ({ ...e, state: 'active', disabledUntil: 0, health: 100 })),
      lasers: [],
      particles: [],
      events: [],
      socket: newSocket,
      otherPlayers: {},
    });
  },

  endGame: () => {
    const { socket, user, kills, deaths, sessionShots, sessionHits, team, teamScores, selectedMode, persistentStats } = get();
    if (socket) {
      socket.disconnect();
    }

    // Determine if win
    let isWin = false;
    if (selectedMode === 'tdm' || selectedMode === 'ctf') {
      const myTeamScore = team === 'amber' ? teamScores.amber : teamScores.blue;
      const otherTeamScore = team === 'amber' ? teamScores.blue : teamScores.amber;
      isWin = myTeamScore > otherTeamScore;
    } else if (selectedMode === 'ffa') {
      // In FFA, top score wins (simplified)
      isWin = true; // For now
    }

    const accuracy = sessionShots > 0 ? sessionHits / sessionShots : 0;

    if (accuracy >= 0.8) {
      get().unlockTrophy('marksman');
    }

    if (isWin) {
      get().unlockTrophy('champion');
    }
    
    if (persistentStats && (persistentStats.gamesPlayed || 0) + 1 >= 10) {
      get().unlockTrophy('veteran');
    }

    if (user) {
      updateGameStats(user.uid, {
        kills: kills,
        deaths: deaths,
        wins: isWin ? 1 : 0,
        totalShots: sessionShots,
        totalHits: sessionHits,
        score: get().score // Pass the match score to update totalScore
      }).then(() => get().fetchStats());
    }

    set({ gameState: 'gameover', socket: null });
  },

  leaveGame: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({
      gameState: 'menu',
      socket: null,
      otherPlayers: {},
      enemies: [],
      lasers: [],
      particles: [],
      events: [],
      score: 0,
      timeLeft: 120,
      playerState: 'active',
      isGlitch: false,
      infectionLevel: 0,
      isTimeWarpActive: false
    });
  },

  updateTime: (delta) => set((state) => {
    if (state.gameState !== 'playing') return state;
    const newTime = state.timeLeft - delta;
    const newSurvivalTime = state.survivalTime + delta;

    // Update infection timers
    let newInfectionLevel = state.infectionLevel;
    let newInfectionMatchTimer = state.infectionMatchTimer;
    let isGlitch = state.isGlitch;
    let newDamageMultiplier = state.damageMultiplier;
    let newActiveStreakPower = state.activeStreakPower;

    // Reset streak power if expired
    if (state.activeStreakPower && Date.now() > state.streakPowerExpiry) {
      newActiveStreakPower = null;
      newDamageMultiplier = 1;
    }

    if (state.gameMode === 'infection') {
      newInfectionMatchTimer = Math.max(0, state.infectionMatchTimer - delta);
      if (newInfectionMatchTimer <= 0 && state.infectionMatchTimer > 0) {
        setTimeout(() => {
          set({ infectionMatchTimer: 0, infectionWinner: 'humans', gameState: 'gameover' });
          soundService.callout('Announcer', 'Humans have survived the purge!');
        }, 0);
      }
      // Check for infection win conditions
      if (state.humanSurvivors <= 0) {
        setTimeout(() => {
          set({ infectionWinner: 'glitch', gameState: 'gameover' });
          soundService.callout('Announcer', 'Glitch entities have taken over!');
        }, 0);
      }
    } else if (!isGlitch) {
      // Passive decay of infection if not in infection mode
      newInfectionLevel = Math.max(0, state.infectionLevel - delta * 2);
    }

    if (!isGlitch && newInfectionLevel >= 100) {
      isGlitch = true;
      newInfectionLevel = 100;
      get().addEvent('YOU HAVE BECOME A GLITCH!');
      soundService.announce('GLITCH DETECTED');
    } else if (isGlitch && state.gameMode !== 'infection') {
      // Temporary glitch in other modes
      newInfectionLevel = Math.max(0, state.infectionLevel - delta * 6.67); // 15 seconds duration
      if (newInfectionLevel <= 0) {
        isGlitch = false;
        get().addEvent('GLITCH PURGED');
      }
    }

    // Regenerate stamina and mana
    const staminaRegen = 25 * delta;
    const manaRegen = 10 * delta;
    const newStamina = Math.min(state.maxStamina, state.stamina + staminaRegen);
    const newMana = Math.min(state.maxMana, state.mana + manaRegen);

    // Health Regeneration
    let newHealth = state.health;
    if (state.gameState === 'playing' && state.playerState === 'active' && Date.now() - state.lastDamageTime > 5000) {
      newHealth = Math.min(100, state.health + 5 * delta); // 5 HP per second
    }

    // Slowly increment instability
    let newInstability = state.instability;
    let newPortalPosition = state.portalPosition;

    if (state.gameState === 'playing' && state.playerState === 'active') {
      newInstability = Math.min(100, state.instability + delta * 1.5); // 1.5% rise per second

      // Spawns a Portal object at a random tile when instability reaches 80%
      if (newInstability >= 80 && !newPortalPosition) {
        newPortalPosition = [
          (Math.random() - 0.5) * 160,
          0.5,
          (Math.random() - 0.5) * 160
        ];
        get().addEvent('⚠️ SYSTEM FAILING: ANOMALIC REALITY PORTAL SECTOR SPOTTED!');
      }
    }

    // Unlock survivor trophy
    if (newSurvivalTime >= 300 && !state.unlockedTrophies.find(t => t.id === 'survivor')) {
      get().unlockTrophy('survivor');
    }

    if (newTime <= 0) {
      if (state.socket) state.socket.disconnect();
      return { 
        timeLeft: 0, 
        gameState: 'gameover', 
        socket: null, 
        roomId: null, 
        survivalTime: newSurvivalTime,
        infectionMatchTimer: newInfectionMatchTimer,
        infectionLevel: newInfectionLevel,
        isGlitch: isGlitch,
        damageMultiplier: newDamageMultiplier,
        activeStreakPower: newActiveStreakPower,
        stamina: newStamina,
        mana: newMana,
        health: newHealth,
        instability: newInstability,
        portalPosition: newPortalPosition
      };
    }
    return { 
      timeLeft: newTime, 
      survivalTime: newSurvivalTime,
      infectionMatchTimer: newInfectionMatchTimer,
      infectionLevel: newInfectionLevel,
      isGlitch: isGlitch,
      damageMultiplier: newDamageMultiplier,
      activeStreakPower: newActiveStreakPower,
      stamina: newStamina,
      mana: newMana,
      health: newHealth,
      instability: newInstability,
      portalPosition: newPortalPosition
    };
  }),

  hitPlayer: (isGlitchAttacker?: boolean) => {
    get().takeDamage(20, isGlitchAttacker);
  },

  takeDamage: (amount, isGlitchAttacker?: boolean) => set((state) => {
    if (state.playerState === 'disabled' || state.gameState !== 'playing' || state.activeStreakPower === 'GOD MODE') return state;
    
    let newIsGlitch = state.isGlitch;
    let newInfectionLevel = state.infectionLevel;

    if (state.gameMode === 'infection' && isGlitchAttacker && !state.isGlitch) {
      newIsGlitch = true;
      newInfectionLevel = 100;
      state.addEvent('YOU HAVE BEEN INFECTED!');
      soundService.callout('Announcer', 'Infection spread!');
      soundService.playSFX('infection');
    } else if (!state.isGlitch) {
      // Increase infection level when taking damage
      newInfectionLevel = Math.min(100, state.infectionLevel + amount * 0.5);
    }

    const newHealth = Math.max(0, state.health - amount);
    const isDead = newHealth <= 0;
    if (isDead) {
      soundService.callout('Announcer', 'You were eliminated!');
    }
    
    // Trigger visual blood splatter
    if (amount > 0) {
      setTimeout(() => set({ bloodSplatter: false }), 400);
    }

    return {
      health: newHealth,
      isGlitch: newIsGlitch,
      infectionLevel: newInfectionLevel,
      playerState: isDead ? 'disabled' : 'active',
      playerDisabledUntil: isDead ? Date.now() + 3000 : 0,
      deaths: isDead ? state.deaths + 1 : state.deaths,
      score: Math.max(0, state.score - 10),
      lastDamageTime: Date.now(),
      bloodSplatter: amount > 0
    };
  }),

  regenerateHealth: (amount) => set((state) => ({
    health: Math.min(100, state.health + amount)
  })),

  hitEnemy: (id: string, damage: number = 20) => set((state) => {
    if (state.gameState !== 'playing') return state;
    
    const actualDamage = damage * state.damageMultiplier;

    // Check if it's a multiplayer player
    if (state.socket && state.otherPlayers[id]) {
      state.socket.emit('hitPlayer', { targetId: id, damage: actualDamage });
      return state;
    }

    // Self hit (for medkit)
    if (id === 'player') {
      if (state.socket) {
        state.socket.emit('hitPlayer', { targetId: state.socket.id, damage });
      }
      return state;
    }

    let enemyHit = false;
    const enemies = state.enemies.map(e => {
      if (e.id === id && e.state === 'active') {
        enemyHit = true;
        const newHealth = Math.min(100, Math.max(0, e.health - damage));
        const isDead = newHealth <= 0;
        return { 
          ...e, 
          health: newHealth,
          state: isDead ? 'disabled' as EntityState : 'active' as EntityState, 
          disabledUntil: isDead ? Date.now() + 3000 : 0 
        };
      }
      return e;
    });

    if (!enemyHit) return state;

    const hitEnemyObj = enemies.find(e => e.id === id);
    const isDead = hitEnemyObj?.health === 0;

    if (isDead) {
      soundService.callout('Announcer', `Eliminated ${id}`);
      
      const newKills = state.kills + 1;
      const xpGain = 100;
      const newXP = state.xp + xpGain;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const rankPointsGain = state.isRanked ? 25 : 0;
      const newRankPoints = state.rankPoints + rankPointsGain;

      if (newLevel > state.level) {
        soundService.announce('LEVEL UP!');
        get().addEvent(`LEVEL UP! YOU ARE NOW LEVEL ${newLevel}`);
      }

      if (newKills === 1) {
        setTimeout(() => get().unlockTrophy('first_kill'), 100);
      }
      
      // Check for unstoppable (5 kills in one match without dying - simplified for now)
      if (newKills >= 5) {
        setTimeout(() => get().unlockTrophy('unstoppable'), 100);
      }

      return {
        enemies,
        kills: newKills,
        score: state.score + 100,
        xp: newXP,
        level: newLevel,
        rankPoints: newRankPoints,
        events: [...state.events, { id: Math.random().toString(), message: `You eliminated ${id}`, timestamp: Date.now() }]
      };
    }
    return {
      enemies,
      score: state.score + 20,
    };
  }),

  addLaser: (start, end, color) => {
    const { socket } = get();
    if (socket) {
      socket.emit('shoot', { start, end, color });
    }
    set((state) => ({
      lasers: [...state.lasers, { id: Math.random().toString(36).substr(2, 9), start, end, timestamp: Date.now(), color }]
    }));
  },

  addParticles: (position, color, count = 10) => set((state) => ({
    particles: [...state.particles, { id: Math.random().toString(36).substr(2, 9), position, timestamp: Date.now(), color }]
  })),

  addEvent: (message) => {
    set((state) => ({
      events: [...state.events, { id: Math.random().toString(), message, timestamp: Date.now() }]
    }));
    
    // Trigger announcer for important events
    if (message.includes('JOINED') || message.includes('VICTORY') || message.includes('FLAG') || message.includes('ELIMINATED')) {
      soundService.announce(message);
    }
  },

  updateEnemies: (time) => set((state) => {
    let changed = false;
    const enemies = state.enemies.map(e => {
      if (e.state === 'disabled' && time > e.disabledUntil) {
        changed = true;
        return { ...e, state: 'active' as EntityState, health: 100 };
      }
      return e;
    });
    
    // Also update other players' states
    let otherPlayers = state.otherPlayers;
    let playersChanged = false;
    Object.values(state.otherPlayers).forEach(p => {
      if (p.state === 'disabled' && time > p.disabledUntil) {
        if (!playersChanged) {
          otherPlayers = { ...state.otherPlayers };
          playersChanged = true;
        }
        otherPlayers[p.id] = { ...p, state: 'active', health: 100 };
      }
    });

    if (state.playerState === 'disabled' && time > state.playerDisabledUntil) {
      return { 
        enemies, 
        playerState: 'active', 
        health: 100, 
        isGlitch: false,
        infectionLevel: 0,
        otherPlayers: playersChanged ? otherPlayers : state.otherPlayers 
      };
    }
    return changed || playersChanged ? { enemies, otherPlayers } : state;
  }),

  fireProjectile: (data) => {
    const { socket } = get();
    const projectile: ProjectileData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      ownerId: socket?.id || 'local',
      timestamp: Date.now(),
    };
    
    set(state => ({ projectiles: [...state.projectiles, projectile] }));
    if (socket) {
      socket.emit('fireProjectile', projectile);
    }
  },

  removeProjectile: (id) => {
    set(state => ({
      projectiles: state.projectiles.filter(p => p.id !== id)
    }));
  },

  updateProjectiles: (delta) => {
    const { projectiles, worldBlocks, hitEnemy, addParticles, isTimeWarpActive } = get();
    if (projectiles.length === 0) return;

    const gravity = 9.81;
    const timeWarpFactor = isTimeWarpActive ? 0.2 : 1.0;
    const effectiveDelta = delta * timeWarpFactor;

    const updatedProjectiles = projectiles.map(p => {
      const newPos: [number, number, number] = [
        p.position[0] + p.velocity[0] * effectiveDelta,
        p.position[1] + p.velocity[1] * effectiveDelta,
        p.position[2] + p.velocity[2] * effectiveDelta,
      ];
      
      const newVel: [number, number, number] = [
        p.velocity[0],
        p.velocity[1] - gravity * effectiveDelta, // Apply gravity
        p.velocity[2],
      ];

      return { ...p, position: newPos, velocity: newVel };
    });

    // Collision detection (simplified)
    const activeProjectiles: ProjectileData[] = [];
    updatedProjectiles.forEach(p => {
      let exploded = false;
      
      // Ground collision
      if (p.position[1] < 0) {
        exploded = true;
      }

      // Block collision
      if (!exploded) {
        for (const block of worldBlocks) {
          const dx = p.position[0] - block.position[0];
          const dy = p.position[1] - block.position[1];
          const dz = p.position[2] - block.position[2];
          const distSq = dx*dx + dy*dy + dz*dz;
          if (distSq < 1) {
            exploded = true;
            break;
          }
        }
      }

      if (exploded) {
        addParticles(p.position, '#ff4400');
        const { enemies, otherPlayers, socket, hitEnemy, playerPosition, health, setPlayerState } = get();
        
        // Damage local player
        const pdx = p.position[0] - playerPosition[0];
        const pdy = p.position[1] - playerPosition[1];
        const pdz = p.position[2] - playerPosition[2];
        const pdistSq = pdx*pdx + pdy*pdy + pdz*pdz;
        if (pdistSq < p.radius * p.radius) {
          const damage = p.damage * (1 - Math.sqrt(pdistSq) / p.radius);
          const newHealth = Math.max(0, health - damage);
          set({ health: newHealth });
          if (newHealth <= 0) {
            set({ playerState: 'disabled', playerDisabledUntil: Date.now() + 5000 });
            if (socket) socket.emit('playerHit', { targetId: socket.id, shooterId: p.ownerId, damage: p.damage });
          }
        }

        // Damage enemies (bots)
        enemies.forEach(enemy => {
          const dx = p.position[0] - enemy.position[0];
          const dy = p.position[1] - enemy.position[1];
          const dz = p.position[2] - enemy.position[2];
          const distSq = dx*dx + dy*dy + dz*dz;
          if (distSq < p.radius * p.radius) {
            hitEnemy(enemy.id, p.damage);
          }
        });

        // Damage other players (only if we are the owner of the projectile)
        if (p.ownerId === socket?.id) {
          Object.values(otherPlayers).forEach(player => {
            const dx = p.position[0] - player.position[0];
            const dy = p.position[1] - player.position[1];
            const dz = p.position[2] - player.position[2];
            const distSq = dx*dx + dy*dy + dz*dz;
            if (distSq < p.radius * p.radius) {
              socket.emit('hitPlayer', { targetId: player.id, damage: p.damage });
            }
          });
        }
      } else if (Date.now() - p.timestamp < 5000) { // 5 second life
        activeProjectiles.push(p);
      }
    });

    set({ projectiles: activeProjectiles });
  },

  cleanupEffects: (time) => set((state) => {
    const lasers = state.lasers.filter(l => time - l.timestamp < 200); // Lasers last 200ms
    const particles = state.particles.filter(p => time - p.timestamp < 500); // Particles last 500ms
    const events = state.events.filter(e => time - e.timestamp < 5000); // Events last 5s
    if (lasers.length !== state.lasers.length || particles.length !== state.particles.length || events.length !== state.events.length) {
      return { lasers, particles, events };
    }
    return state;
  }),

  setPlayerState: (playerState) => set({ playerState }),

  setSkin: (selectedSkin) => set({ selectedSkin }),
  addCustomSkin: (skin) => set(state => {
    const existsIndex = state.customSkins.findIndex(s => s.id === skin.id);
    if (existsIndex >= 0) {
      const updated = [...state.customSkins];
      updated[existsIndex] = skin;
      return { customSkins: updated };
    }
    return { customSkins: [...state.customSkins, skin] };
  }),
  removeCustomSkin: (id) => set(state => {
    const nextSkin = state.selectedSkin === id ? 'alien' : state.selectedSkin;
    return {
      customSkins: state.customSkins.filter(s => s.id !== id),
      selectedSkin: nextSkin
    };
  }),
  setColor: (selectedColor) => set({ selectedColor }),
  setPattern: (selectedPattern) => set({ selectedPattern }),
  toggleAccessory: (accessory) => set(state => {
    const accessories = state.selectedAccessories.includes(accessory)
      ? state.selectedAccessories.filter(a => a !== accessory)
      : [...state.selectedAccessories, accessory];
    return { selectedAccessories: accessories };
  }),
  setGunSkin: (selectedGunSkin) => set({ selectedGunSkin }),
  setBanner: (selectedBanner) => set({ selectedBanner }),
  setPlayerClass: (playerClass) => set({ playerClass }),
  setMap: (selectedMap) => set({ selectedMap }),
  setMode: (selectedMode) => set({ selectedMode }),
  setRanked: (isRanked) => set({ isRanked }),
  setRegion: (selectedRegion) => set({ selectedRegion }),

  triggerEmote: (emote) => {
    const { socket } = get();
    if (socket) {
      socket.emit('emote', emote);
    }
  },

  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  toggleThirdPerson: () => set(state => ({ isThirdPerson: !state.isThirdPerson })),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setAttacking: (attacking, type = null) => set({ isAttacking: attacking, attackType: type }),
  meleeAttack: () => {
    const { socket, hotbar, currentWeaponIndex } = get();
    const weapon = WEAPONS[hotbar[currentWeaponIndex]];
    if (!weapon.isMelee) return;

    set({ isAttacking: true, attackType: weapon.id });
    
    if (socket) {
      socket.emit('meleeAttack', { weaponId: weapon.id });
    }

    // Reset attacking state after animation duration (approx 300ms)
    setTimeout(() => {
      set({ isAttacking: false, attackType: null });
    }, 300);
  },
  setInventoryOpen: (isInventoryOpen) => set({ isInventoryOpen }),
  setDonateModalOpen: (isDonateModalOpen) => set({ isDonateModalOpen }),
  setMapOpen: (isMapOpen) => set({ isMapOpen }),
  setWorldBlocks: (worldBlocks) => set({ worldBlocks }),

  // AI Role & Admin Actions
  recommendUpdate: (text) => {
    const { persistentStats, gamertag, isAdmin } = get();
    const totalScore = persistentStats?.totalScore || 0;
    if (totalScore >= 400 || isAdmin) {
      const newRec = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        status: 'pending' as const,
        sender: gamertag
      };
      set(state => ({
        updateRecommendations: [...state.updateRecommendations, newRec]
      }));
      get().addEvent(`Update recommended: ${text}`);
    } else {
      get().addEvent(`Need 400 total points to recommend updates! (Current: ${totalScore})`);
    }
  },
  approveUpdate: (id) => {
    if (get().isAdmin) {
      set(state => ({
        updateRecommendations: state.updateRecommendations.map(r => 
          r.id === id ? { ...r, status: 'approved' } : r
        )
      }));
      const rec = get().updateRecommendations.find(r => r.id === id);
      if (rec) get().addEvent(`Update approved: ${rec.text}`);
    }
  },
  rejectUpdate: (id) => {
    if (get().isAdmin) {
      set(state => ({
        updateRecommendations: state.updateRecommendations.map(r => 
          r.id === id ? { ...r, status: 'rejected' } : r
        )
      }));
      const rec = get().updateRecommendations.find(r => r.id === id);
      if (rec) get().addEvent(`Update rejected: ${rec.text}`);
    }
  },
  checkAdminPassword: (password) => {
    if (password === '456') {
      set({ isAdmin: true });
      get().addEvent("ADMIN ACCESS GRANTED");
    } else {
      get().addEvent("INVALID PASSWORD");
    }
  },
  updateGameBranding: (name, logo) => {
    if (get().isAdmin) {
      set({ gameName: name, gameLogo: logo });
      get().addEvent(`Game branding updated to ${name}`);
    }
  },
  setAutoRotation: (autoRotation) => set({ autoRotation }),
  set3DMode: (active) => set({ is3DMode: active }),
  setUltraGraphics: (active) => set({ isUltraGraphics: active }),
  buyMod: (modId, cost) => {
    const { credits } = get();
    if (credits < cost) {
      get().addEvent(`🚫 Insufficient credits! Need ${cost} credits.`);
      return false;
    }
    set(state => {
      const unlocked = [...state.unlockedMods];
      if (!unlocked.includes(modId)) {
        unlocked.push(modId);
      }
      return { 
        credits: state.credits - cost, 
        unlockedMods: unlocked 
      };
    });
    get().addEvent(`🔥 MOD PURCHASED: ${modId}!`);
    return true;
  },
  setBotPower: (botPower) => set({ botPower }),
  unlockTrophy: (id) => {
    const { unlockedTrophies, user } = get();
    if (unlockedTrophies.some(t => t.id === id)) return;
    
    const trophy = TROPHIES.find(t => t.id === id);
    if (!trophy) return;
    
    get().addEvent(`🏆 TROPHY UNLOCKED: ${trophy.name}`);
    
    const newUnlocked = [...unlockedTrophies, trophy];
    set({ 
      unlockedTrophies: newUnlocked,
      trophyNotification: trophy
    });

    // Clear notification after 5 seconds
    setTimeout(() => set({ trophyNotification: null }), 5000);

    if (user) {
      saveUserProfile({ trophies: newUnlocked });
    }
  },
  
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  switchWeapon: (currentWeaponIndex) => set({ currentWeaponIndex }),
  toggleReady: () => {
    const { socket, isReady } = get();
    if (socket) {
      const nextReady = !isReady;
      set({ isReady: nextReady });
      socket.emit('toggleReady', nextReady);
    }
  },
  
  useStamina: (amount) => {
    const { stamina } = get();
    if (stamina >= amount) {
      set({ stamina: stamina - amount, lastStaminaUseTime: Date.now() });
      return true;
    }
    return false;
  },

  addTask: (task) => set(state => ({
    tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substr(2, 9), completed: false }]
  })),

  toggleTask: (id) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),

  deleteTask: (id) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  editTask: (id, updates) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  processCommand: (command) => {
    const { user, addEvent, setPlayerClass, setSkin } = get();
    const isOwner = user?.email === 'sethu.nontsele@gmail.com';
    const isAdmin = isOwner || get().persistentStats?.isAdmin;

    const [cmd, ...args] = command.toLowerCase().split(' ');

    if (cmd === '459' || cmd === '/459') {
      set({ arenaState: 'dimension459' });
      addEvent("SYSTEM: DIMENSION 459 ACCESSED. REALITY SYNTAX OVERRIDDEN.");
      return;
    }

    if (cmd === '71' || cmd === '/71') {
      set({ currentDimension: 'dimension_71' });
      addEvent("SYSTEM: 71 NO MANSKY PROTOCOL ENGAGED. BLASTING OFF.");
      soundService.playSFX('dimension_shift');
      return;
    }

    if (!isAdmin) {
      addEvent("SYSTEM: Access Denied. Admin privileges required.");
      return;
    }

    switch(cmd) {
      case '/god':
        set({ activeStreakPower: 'GOD MODE', streakPowerExpiry: Date.now() + 60000 });
        addEvent("ADMIN: God Mode activated for 60s");
        break;
      case '/class':
        if (args[0]) {
          setPlayerClass(args[0] as PlayerClass);
          addEvent(`ADMIN: Class changed to ${args[0]}`);
        }
        break;
      case '/skin':
        if (args[0]) {
          setSkin(args[0] as SkinType);
          addEvent(`ADMIN: Skin changed to ${args[0]}`);
        }
        break;
      case '/kick':
        addEvent(`ADMIN: Kick command issued for ${args[0]} (Simulated)`);
        break;
      case '/event':
        addEvent(`GLOBAL EVENT: ${args.join(' ')}`);
        break;
      case '459':
        set({ arenaState: 'dimension459' });
        addEvent("SYSTEM: DIMENSION 459 STABILIZED. WELCOME TO THE OMEGA SECTOR.");
        soundService.playSFX('ui_click');
        break;
      case '/end':
        get().endGame();
        break;
      default:
        addEvent(`SYSTEM: Unknown command ${cmd}`);
    }
  },

  // Build Mode
  setBuildMode: (isBuildMode) => set({ isBuildMode }),
  setScannedModel: (data) => set({ 
    scannedModelType: data.scannedModelType,
    scannedModelColor: data.scannedModelColor,
    scannedModelScale: data.scannedModelScale,
    scannedModelDecimation: data.scannedModelDecimation,
    scannedModelTextureCaptured: data.scannedModelTextureCaptured,
    scannedModelRepairedHoles: data.scannedModelRepairedHoles,
    scannedModelSupportEnabled: data.scannedModelSupportEnabled,
  }),
  setSelectedBlock: (selectedBlock) => set({ selectedBlock }),
  placeBlock: (position) => {
    const { socket, selectedBlock } = get();
    if (socket) {
      socket.emit('placeBlock', { type: selectedBlock, position });
    }
  },
  bulkPlaceBlocks: (blocks) => {
    const { socket } = get();
    if (socket) {
      socket.emit('bulkPlaceBlocks', blocks);
    }
  },
  breakBlock: (id) => {
    const { socket } = get();
    if (socket) {
      socket.emit('breakBlock', id);
    }
  },
  saveMap: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('saveMap');
    }
  },
  clearMap: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('clearMap');
    }
  },
  setPrivateServerName: (name) => set({ privateServerName: name }),
  
  reload: () => {
    const { hotbar, currentWeaponIndex, isReloading } = get();
    if (isReloading) return;
    
    const weaponId = hotbar[currentWeaponIndex];
    const weapon = WEAPONS[weaponId];
    if (weapon.isMelee || weapon.reloadTime === 0) return;
    
    set({ isReloading: true });
    soundService.playReloadSound();
    soundService.callout('System', 'Reloading...');
    
    setTimeout(() => {
      set(state => ({
        isReloading: false,
        currentAmmo: {
          ...state.currentAmmo,
          [weaponId]: weapon.maxAmmo
        }
      }));
      soundService.callout('System', 'Reload Complete');
    }, weapon.reloadTime);
  },

  consumeAmmo: () => set(state => {
    const weaponId = state.hotbar[state.currentWeaponIndex];
    const weapon = WEAPONS[weaponId];
    if (weapon.isMelee || state.moddedInfiniteAmmo) return state;
    
    const currentAmmo = state.currentAmmo[weaponId];
    return {
      currentAmmo: {
        ...state.currentAmmo,
        [weaponId]: Math.max(0, currentAmmo - 1)
      }
    };
  }),
  
  // Chat & Social
  sendChatMessage: (message, type) => {
    const { socket, gamertag } = get();
    if (socket) {
      socket.emit('chatMessage', { message, type });
    } else {
      get().addChatMessage({
        id: Math.random().toString(),
        sender: gamertag,
        message,
        timestamp: Date.now(),
        type
      });
    }
  },
  addChatMessage: (msg) => set(state => ({
    chatMessages: [...state.chatMessages.slice(-49), msg]
  })),
  setGamertag: (tag) => set({ gamertag: tag }),
  addFriend: (profile: UserProfile) => set(state => {
    if (state.friends.some(f => f.uid === profile.uid)) return state;
    soundService.announce(`Friend added: ${profile.gamertag}`);
    return { friends: [...state.friends, profile] };
  }),
  
  // Spectator
  setSpectating: (isSpectating, spectatorTargetId = null) => set({ 
    isSpectating, 
    spectatorTargetId 
  }),
  cycleSpectator: () => set(state => {
    const playerIds = Object.keys(state.otherPlayers);
    if (playerIds.length === 0) return { spectatorTargetId: null };
    
    const currentIndex = state.spectatorTargetId ? playerIds.indexOf(state.spectatorTargetId) : -1;
    const nextIndex = (currentIndex + 1) % playerIds.length;
    return { spectatorTargetId: playerIds[nextIndex] };
  }),
  setTargetedEnemyId: (id) => set({ targetedEnemyId: id }),
  
  // Movement
  setSprinting: (isSprinting) => set({ isSprinting }),
  setSliding: (isSliding) => set({ isSliding }),
  setWallRunning: (isWallRunning, side) => set({ isWallRunning, wallRunSide: side }),
  
  // AAA Actions
  setJumpHeight: (jumpHeight) => set({ jumpHeight }),
  setGravity: (gravity) => set({ gravity }),
  setBotDifficulty: (botDifficulty) => set({ botDifficulty }),
  setBotCount: (botCount) => set({ botCount }),
  setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity }),
  setFov: (fov) => set({ fov }),
  setCameraShake: (cameraShake) => set({ cameraShake }),
  setCrosshairStyle: (crosshairStyle) => set({ crosshairStyle }),
  setSprintSpeed: (sprintSpeed) => set({ sprintSpeed }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
  setResolutionScale: (resolutionScale) => set({ resolutionScale }),
  setShowFps: (showFps) => set({ showFps }),
  setBotAggression: (botAggression) => set({ botAggression }),
  setBotAccuracy: (botAccuracy) => set({ botAccuracy }),
  setBotReactionTime: (botReactionTime) => set({ botReactionTime }),
  setBotStrategy: (botStrategy) => set({ botStrategy }),
  
  updateSettings: (settings) => {
    const { socket } = get();
    if (socket) {
      socket.emit('updateSettings', settings);
    }
  },
  
  setSelectedSpell: (selectedSpell) => set({ selectedSpell }),
  castSpell: () => {
    const { mana, selectedSpell, spellCooldowns, socket, gameState } = get();
    if (gameState !== 'playing') return;
    
    const spell = SPELLS[selectedSpell];
    const now = Date.now();
    const lastCast = spellCooldowns[selectedSpell] || 0;
    
    if (now - lastCast < spell.cooldown) return;
    if (mana < spell.manaCost) return;
    
    // Deduct mana and set cooldown
    set(state => ({
      mana: state.mana - spell.manaCost,
      spellCooldowns: { ...state.spellCooldowns, [selectedSpell]: now }
    }));
    
    // Play sound
    import('./services/soundService').then(({ soundService }) => {
      soundService.playSFX('spell');
    });
    
    // Emit to server
    if (socket) {
      socket.emit('castSpell', { type: selectedSpell });
    }
    
    // Client-side prediction for some spells
    if (selectedSpell === 'blink') {
      // Basic blink logic could be here, but usually handled by server to avoid clipping
    }
  },
  
  startRecording: () => set({ isRecording: true, currentReplay: [] }),
  stopRecording: () => set({ isRecording: false }),
  saveReplay: async () => {
    const { currentReplay, user, selectedMap, selectedMode, isRanked, score, kills, deaths } = get();
    if (!user) return;
    
    const replayData = JSON.stringify(currentReplay);
    const match: Omit<MatchRecord, 'id'> = {
      date: new Date(),
      duration: currentReplay.length > 0 ? (currentReplay[currentReplay.length - 1].timestamp - currentReplay[0].timestamp) / 1000 : 0,
      mode: selectedMode,
      map: selectedMap,
      isRanked,
      players: [{
        uid: user.uid,
        displayName: get().gamertag,
        kills,
        deaths,
        assists: 0,
        score,
        accuracy: 0,
        team: get().team,
        result: 'win', // Simplified
        rankPointsGained: 0,
        xpGained: 0
      }],
      replayData
    };
    
    const matchWithId = await recordMatch(match);
    set(state => ({ 
      matchHistory: [matchWithId, ...(state.matchHistory || [])],
      replays: [...state.replays, { id: matchWithId.id, data: currentReplay, timestamp: new Date().toISOString() }],
      currentReplay: [] 
    }));
  },
  playReplay: (replay) => {
    set({ gameState: 'playing', currentReplay: replay, isReplaying: true, replayTime: 0, isReplayPaused: false });
  },
  stopReplay: () => set({ isReplaying: false, currentReplay: [], replayTime: 0 }),
  setReplayPlaybackSpeed: (speed) => set({ replayPlaybackSpeed: speed }),
  setReplayPaused: (paused) => set({ isReplayPaused: paused }),
  setCameraPathEditorOpen: (open) => set({ isCameraPathEditorOpen: open }),
  setCameraPath: (path) => set({ cameraPath: path }),
  seekReplay: (time) => set({ replayTime: time }),
  logout: async () => {
    const { logout: firebaseLogout } = await import('./firebase');
    await firebaseLogout();
    set({ user: null, gameState: 'splash' });
  },
  
  spawnVehicle: (type, position, team = 'none') => {
    const id = `vehicle-${Math.random().toString(36).substr(2, 9)}`;
    const vehicle: VehicleData = {
      id,
      type,
      position,
      rotation: [0, 0, 0],
      health: 1000,
      maxHealth: 1000,
      speed: 0,
      driverId: null,
      team
    };
    set(state => ({ vehicles: { ...state.vehicles, [id]: vehicle } }));
    const { socket } = get();
    if (socket) socket.emit('spawnVehicle', vehicle);
  },
  enterVehicle: (id) => {
    const { socket, vehicles } = get();
    if (vehicles[id] && !vehicles[id].driverId) {
      set({ currentVehicleId: id });
      if (socket) socket.emit('enterVehicle', { id });
    }
  },
  exitVehicle: () => {
    const { socket, currentVehicleId } = get();
    if (currentVehicleId) {
      set({ currentVehicleId: null });
      if (socket) socket.emit('exitVehicle', { id: currentVehicleId });
    }
  },
  updateVehicle: (id, data) => {
    set(state => ({
      vehicles: {
        ...state.vehicles,
        [id]: { ...state.vehicles[id], ...data }
      }
    }));
  },
  
  setWeather: (weather) => set(state => ({ environment: { ...state.environment, weather } })),
  setTime: (time) => set(state => ({ environment: { ...state.environment, time } })),
  
  updatePlayerPosition: (position, rotation, isDashing = false) => {
    const { socket, hotbar, currentWeaponIndex, isSprinting, isSliding, isBuildMode, selectedBlock, isGlitch, infectionLevel, activeStreakPower, currentDimension } = get();
    if (socket) {
      socket.emit('move', { 
        position, 
        rotation,
        weapon: hotbar[currentWeaponIndex],
        isSprinting,
        isSliding,
        isBuildMode,
        selectedBlock,
        isDashing,
        isGlitch,
        infectionLevel,
        activeStreakPower,
        currentDimension
      });
    }
  },

  // Infection
  tickInfectionTimer: (dt) => set(state => {
    const newTimer = Math.max(0, state.infectionMatchTimer - dt);
    if (newTimer === 0 && state.infectionWinner === null) {
      // Humans win if time runs out
      return { infectionMatchTimer: 0, infectionWinner: 'humans' };
    }
    return { infectionMatchTimer: newTimer };
  }),
  infectPlayer: (id) => set(state => {
    if (state.glitchPlayerIds.includes(id)) return state;
    const newGlitchIds = [...state.glitchPlayerIds, id];
    const newHumanSurvivors = Math.max(0, state.humanSurvivors - 1);
    
    // Update bot if it's a bot
    const newEnemies = state.enemies.map(e => {
      if (e.id === id) return { ...e, isGlitch: true };
      return e;
    });
    
    if (newHumanSurvivors === 0 && state.infectionWinner === null) {
      return { 
        glitchPlayerIds: newGlitchIds, 
        humanSurvivors: 0, 
        infectionWinner: 'glitch',
        enemies: newEnemies
      };
    }
    
    return { 
      glitchPlayerIds: newGlitchIds, 
      humanSurvivors: newHumanSurvivors,
      enemies: newEnemies
    };
  }),
  checkInfectionWin: () => {
    const { humanSurvivors, infectionMatchTimer, infectionWinner } = get();
    if (infectionWinner) return;
    
    if (humanSurvivors === 0) {
      set({ infectionWinner: 'glitch' });
    } else if (infectionMatchTimer === 0) {
      set({ infectionWinner: 'humans' });
    }
  },
  startInfectionMatch: () => {
    const { otherPlayers } = get();
    const playerIds = Object.keys(otherPlayers);
    const totalPlayers = playerIds.length + 1;
    const initialGlitchCount = Math.max(1, Math.floor(totalPlayers * 0.2));
    
    // Randomly pick initial glitches
    const shuffled = [...playerIds, 'me'].sort(() => 0.5 - Math.random());
    const initialGlitches = shuffled.slice(0, initialGlitchCount);
    
    set({
      gameMode: 'infection',
      glitchPlayerIds: initialGlitches,
      humanSurvivors: totalPlayers - initialGlitchCount,
      infectionMatchTimer: 180,
      infectionLevel: 0,
      isGlitch: initialGlitches.includes('me'),
      infectionWinner: null
    });
  },

  // Killstreaks
  onKill: () => set(state => {
    const newStreak = state.currentKillStreak + 1;
    const newBest = Math.max(state.bestKillStreak, newStreak);
    
    // Apply rewards at specific intervals
    if (newStreak % 3 === 0) {
      get().applyStreakReward(newStreak);
    }
    
    return { 
      currentKillStreak: newStreak, 
      bestKillStreak: newBest 
    };
  }),
  onDeath: () => set({ 
    currentKillStreak: 0,
    activeStreakPower: null,
    streakPowerExpiry: 0,
    isTimeWarpActive: false
  }),
  applyStreakReward: (streak) => {
    const rewards = [
      { streak: 3, power: 'OVERCLOCKED', duration: 10000, msg: '3 KILL STREAK: SPEED BOOST' },
      { streak: 6, power: 'DATA SURGE', duration: 15000, msg: '6 KILL STREAK: DAMAGE BOOST' },
      { streak: 9, power: 'SYSTEM BREACH', duration: 20000, msg: '9 KILL STREAK: WALL HACK' },
      { streak: 12, power: 'GOD MODE', duration: 12000, msg: '12 KILL STREAK: INVINCIBILITY' },
      { streak: 15, power: 'TIME WARP', duration: 10000, msg: '15 KILL STREAK: TIME WARP' },
    ];
    
    const reward = rewards.find(r => r.streak === streak) || rewards[rewards.length - 1];
    
    set({
      activeStreakPower: reward.power as any,
      streakPowerExpiry: Date.now() + reward.duration,
      damageMultiplier: reward.power === 'DATA SURGE' ? 2 : 1
    });
    
    if (reward.power === 'TIME WARP') {
      get().activateTimeWarp(reward.duration);
    }
    
    get().addChatMessage({
      id: Math.random().toString(),
      sender: 'SYSTEM',
      message: reward.msg,
      timestamp: Date.now(),
      type: 'global'
    });
    
    soundService.announce(reward.msg);
  },

  // Time Warp
  activateTimeWarp: (duration, isGlobal = false) => {
    set({ isTimeWarpActive: true, isGlobalTimeWarp: isGlobal, timeWarpExpiry: Date.now() + duration });
    setTimeout(() => {
      set({ isTimeWarpActive: false, isGlobalTimeWarp: false });
    }, duration);
  },

  // Tactical pings action
  addPing: (position, type, label) => {
    const id = Math.random().toString(36).substring(2, 9);
    const defaultLabel = type === 'danger' ? 'HOSTILE MARKER' : (type === 'loot' ? 'SUPPLY CORES' : 'TARGET POINT');
    const actualLabel = label || defaultLabel;
    const newPing = {
      id,
      position,
      type,
      label: actualLabel,
      timestamp: Date.now()
    };
    
    set((state) => ({
      pings: [...state.pings, newPing]
    }));
    
    // Broadcast via socket if present
    const socket = get().socket;
    if (socket) {
      socket.emit('pingLocation', { position, type, label: actualLabel });
    }

    // Add log event
    const icon = type === 'danger' ? '⚠️' : (type === 'loot' ? '📦' : '📍');
    get().addEvent(`${icon} [TACTICAL PING] ${actualLabel} marked at [X:${Math.round(position[0])}, Y:${Math.round(position[1])}, Z:${Math.round(position[2])}]`);

    // Play sound
    try {
      soundService.playSFX('spell');
    } catch(e) {}

    // Remove ping after 5 seconds
    setTimeout(() => {
      set((state) => ({
        pings: state.pings.filter(p => p.id !== id)
      }));
    }, 5000);
  },

  // Map Voting action implementations
  generateMapVotingOptions: () => {
    const baseMaps: MapType[] = [
      'maze', 'arena', 'pillars', 'flat', 'void', 'cybercity', 
      'volcano', 'neon_grid', 'quantum_rift', 'infinite', 
      'custom_scan', 'aurum_dominion', 'infinity_academy'
    ];
    const maps: MapType[] = [...baseMaps, ...ARENA_MAPS.map(m => m.id as MapType)];
    // Pick 3 random unique maps
    const shuffled = [...maps].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    // Simulate some baseline votes from other lobby players to make it feel alive!
    const initialVotes: Record<string, number> = {};
    selected.forEach(map => {
      // Each map gets 1 to 3 random starting votes from bots/squad
      initialVotes[map] = Math.floor(Math.random() * 3) + 1;
    });

    set({
      mapVotingOptions: selected,
      mapVotes: initialVotes,
      playerVotedMap: null
    });
  },

  voteForMap: (map: MapType) => {
    const { playerVotedMap, mapVotes } = get();
    const updatedVotes = { ...mapVotes };
    
    // If player already voted for this map, do nothing
    if (playerVotedMap === map) return;

    // Remove vote from previous map if any
    if (playerVotedMap && updatedVotes[playerVotedMap] > 0) {
      updatedVotes[playerVotedMap]--;
    }

    // Add vote to new map
    updatedVotes[map] = (updatedVotes[map] || 0) + 1;

    set({
      playerVotedMap: map,
      mapVotes: updatedVotes
    });

    // Notify via event
    get().addEvent(`🗳️ [MAP VOTE] Voted for ${map.toUpperCase().replace('_', ' ')}`);

    // Play sound
    try {
      soundService.playSFX('ui_click');
    } catch (e) {}
  },

  // Custom Modded World variables initial state
  moddedSpeedMultiplier: 1.0,
  moddedGravityMultiplier: 1.0,
  moddedDamageMultiplier: 1.0,
  moddedInfiniteAmmo: false,
  moddedColor: '#ffffff',
  moddedWeapons: [],
  moddedSkyColor: '',
  moddedCustomMesh: '',
  moddedBotScale: 1.0,
  moddedBotSpeedMultiplier: 1.0,
  moddedIsAggressiveBots: false,
  moddedMapTheme: 'default',
  activeWorldId: null,
  activeWorldName: '',
  applyWorldMods: (mods) => {
    set({
      moddedSpeedMultiplier: mods.speedMultiplier,
      moddedGravityMultiplier: mods.gravityMultiplier,
      moddedDamageMultiplier: mods.damageMultiplier,
      moddedInfiniteAmmo: mods.infiniteAmmo,
      moddedColor: mods.color,
      moddedWeapons: mods.weapons,
      moddedSkyColor: mods.skyColor,
      moddedCustomMesh: mods.customMesh,
      moddedBotScale: mods.botScale,
      moddedBotSpeedMultiplier: mods.botSpeedMultiplier,
      moddedIsAggressiveBots: mods.isAggressiveBots,
      moddedMapTheme: mods.mapTheme,
      activeWorldId: mods.worldId,
      activeWorldName: mods.worldName
    });
    get().addEvent(`⚙️ [MOD COMPILER] Loaded and injected world configs & scripts!`);
  }
}));
