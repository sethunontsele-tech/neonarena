/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { User } from 'firebase/auth';
import { PlayerStats, updateGameStats, getPlayerStats } from './firebase';

import { soundService } from './services/soundService';

export type GameState = 'splash' | 'menu' | 'playing' | 'gameover';
export type EntityState = 'active' | 'disabled';
export type MapType = 'maze' | 'arena' | 'pillars' | 'flat';
export type SkinType = 'neon' | 'gold' | 'stealth' | 'glitch' | 'ruby' | 'emerald' | 'diamond' | 'void' | 'steve' | 'alex';
export type PatternType = 'none' | 'camo' | 'stripes' | 'dots' | 'grid' | 'circuit';
export type AccessoryType = 'none' | 'hat' | 'glasses' | 'backpack' | 'horns' | 'halo';
export type GameMode = 'ffa' | 'tdm' | 'ctf' | 'creative';

export type BlockType = 
  | 'stone' | 'cobblestone' | 'dirt' | 'grass' | 'sand' | 'gravel' | 'clay' | 'bedrock'
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
export type WeaponType = 'pistol' | 'smg' | 'shotgun' | 'sniper' | 'rpg' | 'sword' | 'minigun' | 'flamethrower' | 'raygun' | 'revolver' | 'double_barrel' | 'axe' | 'scythe' | 'crossbow' | 'grenade_launcher' | 'slingshot' | 'chainsaw' | 'hammer' | 'medkit' | 'shield' | 'horn' | 'dual_pistols' | 'grenade' | 'bow' | 'scissors' | 'laser_gun' | 'knife';

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
}

export const WEAPONS: Record<WeaponType, WeaponStats> = {
  pistol: { id: 'pistol', name: 'Tactical Pistol', damage: 20, fireRate: 400, spread: 0.02, pellets: 1, range: 100, isMelee: false, isExplosive: false, ammo: 12, maxAmmo: 12 },
  smg: { id: 'smg', name: 'Rapid SMG', damage: 12, fireRate: 100, spread: 0.08, pellets: 1, range: 60, isMelee: false, isExplosive: false, ammo: 30, maxAmmo: 30 },
  shotgun: { id: 'shotgun', name: 'Breach Shotgun', damage: 15, fireRate: 800, spread: 0.15, pellets: 8, range: 30, isMelee: false, isExplosive: false, ammo: 6, maxAmmo: 6 },
  sniper: { id: 'sniper', name: 'Precision Rail', damage: 80, fireRate: 1500, spread: 0, pellets: 1, range: 300, isMelee: false, isExplosive: false, ammo: 5, maxAmmo: 5 },
  rpg: { id: 'rpg', name: 'Nova Launcher', damage: 100, fireRate: 2000, spread: 0.05, pellets: 1, range: 150, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1 },
  sword: { id: 'sword', name: 'Carbon Blade', damage: 50, fireRate: 500, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  minigun: { id: 'minigun', name: 'Hyper Minigun', damage: 8, fireRate: 50, spread: 0.12, pellets: 1, range: 80, isMelee: false, isExplosive: false, ammo: 100, maxAmmo: 100 },
  flamethrower: { id: 'flamethrower', name: 'Solar Flare', damage: 5, fireRate: 30, spread: 0.2, pellets: 1, range: 15, isMelee: false, isExplosive: false, ammo: 50, maxAmmo: 50 },
  raygun: { id: 'raygun', name: 'Z-Ray Gun', damage: 40, fireRate: 600, spread: 0.01, pellets: 1, range: 120, isMelee: false, isExplosive: false, ammo: 10, maxAmmo: 10 },
  revolver: { id: 'revolver', name: 'Heavy Magnum', damage: 45, fireRate: 700, spread: 0.01, pellets: 1, range: 150, isMelee: false, isExplosive: false, ammo: 6, maxAmmo: 6 },
  double_barrel: { id: 'double_barrel', name: 'Twin Plasma', damage: 25, fireRate: 1200, spread: 0.25, pellets: 12, range: 20, isMelee: false, isExplosive: false, ammo: 2, maxAmmo: 2 },
  axe: { id: 'axe', name: 'Battle Axe', damage: 70, fireRate: 800, spread: 0, pellets: 1, range: 5, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  scythe: { id: 'scythe', name: 'Void Scythe', damage: 60, fireRate: 600, spread: 0, pellets: 1, range: 6, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  crossbow: { id: 'crossbow', name: 'Bolt Caster', damage: 65, fireRate: 1000, spread: 0.005, pellets: 1, range: 200, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1 },
  grenade_launcher: { id: 'grenade_launcher', name: 'Boom Lobber', damage: 80, fireRate: 1500, spread: 0.1, pellets: 1, range: 100, isMelee: false, isExplosive: true, ammo: 4, maxAmmo: 4 },
  slingshot: { id: 'slingshot', name: 'Pebble Tosser', damage: 10, fireRate: 300, spread: 0.05, pellets: 1, range: 40, isMelee: false, isExplosive: false, ammo: 20, maxAmmo: 20 },
  chainsaw: { id: 'chainsaw', name: 'Plasma Saw', damage: 15, fireRate: 50, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  hammer: { id: 'hammer', name: 'Gravity Hammer', damage: 90, fireRate: 1200, spread: 0, pellets: 1, range: 5, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  medkit: { id: 'medkit', name: 'Nano Healer', damage: -30, fireRate: 1000, spread: 0, pellets: 1, range: 5, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1 },
  shield: { id: 'shield', name: 'Energy Shield', damage: 5, fireRate: 500, spread: 0, pellets: 1, range: 3, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  horn: { id: 'horn', name: 'Battle Horn', damage: 0, fireRate: 5000, spread: 0, pellets: 0, range: 0, isMelee: false, isExplosive: false, ammo: 1, maxAmmo: 1 },
  dual_pistols: { id: 'dual_pistols', name: 'Twin Blasters', damage: 15, fireRate: 200, spread: 0.04, pellets: 1, range: 80, isMelee: false, isExplosive: false, ammo: 24, maxAmmo: 24 },
  grenade: { id: 'grenade', name: 'EMP Grenade', damage: 60, fireRate: 1000, spread: 0.2, pellets: 1, range: 50, isMelee: false, isExplosive: true, ammo: 1, maxAmmo: 1 },
  bow: { id: 'bow', name: 'Carbon Bow', damage: 40, fireRate: 800, spread: 0.01, pellets: 1, range: 150, isMelee: false, isExplosive: false, ammo: 10, maxAmmo: 10 },
  scissors: { id: 'scissors', name: 'Cyber Scissors', damage: 35, fireRate: 400, spread: 0, pellets: 1, range: 4, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
  laser_gun: { id: 'laser_gun', name: 'Beam Rifle', damage: 5, fireRate: 20, spread: 0, pellets: 1, range: 100, isMelee: false, isExplosive: false, ammo: 200, maxAmmo: 200 },
  knife: { id: 'knife', name: 'Tactical Dagger', damage: 25, fireRate: 300, spread: 0, pellets: 1, range: 3, isMelee: true, isExplosive: false, ammo: 0, maxAmmo: 0 },
};

export interface EnemyData {
  id: string;
  position: [number, number, number];
  state: EntityState;
  disabledUntil: number;
  health: number;
  team: Team;
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
  type: 'global' | 'proximity' | 'system';
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
  friends: string[];
  
  selectedSkin: SkinType;
  selectedColor: string;
  selectedPattern: PatternType;
  selectedAccessories: AccessoryType[];
  selectedGunSkin: string;
  selectedMap: MapType;
  selectedMode: GameMode;
  isMuted: boolean;
  isThirdPerson: boolean;
  lobbyMode: boolean;
  
  // AAA Settings
  jumpHeight: number;
  gravity: number;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  botCount: number;
  mouseSensitivity: number;
  fov: number;
  cameraShake: number;
  crosshairStyle: 'dot' | 'cross' | 'circle' | 'dynamic';
  sprintSpeed: number;
  recoil: number;
  
  // Replay & History
  matchHistory: any[];
  replays: any[];
  isRecording: boolean;
  currentReplay: any[] | null;
  
  // Build Mode
  isBuildMode: boolean;
  selectedBlock: BlockType;
  worldBlocks: WorldBlock[];
  
  // Spectator
  isSpectating: boolean;
  spectatorTargetId: string | null;
  
  // Movement/Animations
  isSprinting: boolean;
  isSliding: boolean;
  playerPosition: [number, number, number];
  
  // Jump Pads
  jumpPads: { id: string; position: [number, number, number]; power: number }[];
  
  inventory: WeaponType[];
  currentWeaponIndex: number;
  currentAmmo: Record<string, number>;
  isInventoryOpen: boolean;
  
  team: Team;
  teamScores: { amber: number; blue: number };
  flags: FlagData[];
  projectiles: ProjectileData[];

  // Stats
  user: User | null;
  persistentStats: PlayerStats | null;
  sessionShots: number;
  sessionHits: number;
  
  // Mobile
  isMobile: boolean;
  mobileControls: {
    move: { x: number, y: number };
    look: { x: number, y: number };
    fire: boolean;
    jump: boolean;
  };

  setUser: (user: User | null) => void;
  fetchStats: () => Promise<void>;
  recordShot: () => void;
  recordHit: () => void;
  setMobileControls: (controls: Partial<GameStore['mobileControls']>) => void;
  setIsMobile: (isMobile: boolean) => void;

  enterLobby: () => void;
  startGame: (roomId?: string) => void;
  endGame: () => void;
  leaveGame: () => void;
  updateTime: (delta: number) => void;
  hitPlayer: () => void;
  hitEnemy: (id: string, damage?: number) => void;
  addLaser: (start: [number, number, number], end: [number, number, number], color: string) => void;
  addParticles: (position: [number, number, number], color: string) => void;
  addEvent: (message: string) => void;
  updateEnemies: (time: number) => void;
  fireProjectile: (data: Omit<ProjectileData, 'id' | 'ownerId' | 'timestamp'>) => void;
  removeProjectile: (id: string) => void;
  updateProjectiles: (delta: number) => void;
  cleanupEffects: (time: number) => void;
  setPlayerState: (state: EntityState) => void;
  setSkin: (skin: SkinType) => void;
  setColor: (color: string) => void;
  setPattern: (pattern: PatternType) => void;
  toggleAccessory: (accessory: AccessoryType) => void;
  setGunSkin: (skin: string) => void;
  setMap: (map: MapType) => void;
  setMode: (mode: GameMode) => void;
  setRegion: (region: string) => void;
  triggerEmote: (emote: string) => void;
  toggleMute: () => void;
  toggleThirdPerson: () => void;
  setInventoryOpen: (open: boolean) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  switchWeapon: (index: number) => void;
  reload: () => void;
  consumeAmmo: () => void;
  
  // Build Mode
  setBuildMode: (active: boolean) => void;
  setSelectedBlock: (block: BlockType) => void;
  placeBlock: (position: [number, number, number]) => void;
  breakBlock: (id: string) => void;
  saveMap: () => void;
  clearMap: () => void;
  setPrivateServerName: (name: string) => void;
  
  // Chat & Social
  sendChatMessage: (message: string, type: 'global' | 'proximity') => void;
  addChatMessage: (msg: ChatMessage) => void;
  setGamertag: (tag: string) => void;
  addFriend: (id: string) => void;
  
  // Spectator
  setSpectating: (spectating: boolean, targetId?: string | null) => void;
  cycleSpectator: () => void;
  
  // Movement
  setSprinting: (sprinting: boolean) => void;
  setSliding: (sliding: boolean) => void;
  
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
  updateSettings: (settings: Partial<{ jumpHeight: number, gravity: number, botDifficulty: string, botCount: number }>) => void;
  
  // Replay Actions
  startRecording: () => void;
  stopRecording: () => void;
  saveReplay: () => void;
  playReplay: (replay: any[]) => void;
  
  // Multiplayer actions
  updatePlayerPosition: (position: [number, number, number], rotation: number) => void;
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
  
  socket: null,
  otherPlayers: {},
  roomId: null,
  privateServerName: '',
  selectedRegion: 'US-East',
  chatMessages: [],
  gamertag: `Player_${Math.floor(Math.random() * 10000)}`,
  friends: [],
  
  selectedSkin: 'neon',
  selectedColor: '#f59e0b',
  selectedPattern: 'none',
  selectedAccessories: [],
  selectedGunSkin: 'default',
  selectedMap: 'maze',
  selectedMode: 'ffa',
  isMuted: true,
  isThirdPerson: false,
  lobbyMode: true,
  
  jumpHeight: 1.5,
  gravity: 9.81,
  botDifficulty: 'medium',
  botCount: 4,
  mouseSensitivity: 1,
  fov: 75,
  cameraShake: 1,
  crosshairStyle: 'cross',
  sprintSpeed: 1.6,
  recoil: 0,
  
  matchHistory: [],
  replays: [],
  isRecording: false,
  currentReplay: null,
  
  isBuildMode: false,
  selectedBlock: 'stone',
  worldBlocks: [],
  
  isSpectating: false,
  spectatorTargetId: null,
  
  isSprinting: false,
  isSliding: false,
  playerPosition: [0, 0, 0],
  
  jumpPads: [
    { id: 'pad-1', position: [10, 0, 10], power: 15 },
    { id: 'pad-2', position: [-10, 0, -10], power: 15 },
    { id: 'pad-3', position: [15, 0, -15], power: 20 },
    { id: 'pad-4', position: [-15, 0, 15], power: 20 },
  ],
  
  inventory: ['pistol', 'smg', 'shotgun', 'sniper', 'rpg', 'sword', 'minigun', 'revolver', 'double_barrel', 'axe', 'scythe', 'crossbow', 'grenade_launcher', 'slingshot', 'chainsaw', 'hammer', 'medkit', 'shield', 'horn', 'dual_pistols', 'grenade', 'bow', 'scissors', 'laser_gun', 'knife'],
  currentWeaponIndex: 0,
  currentAmmo: Object.fromEntries(Object.values(WEAPONS).map(w => [w.id, w.maxAmmo])),
  isInventoryOpen: false,
  
  team: 'none',
  teamScores: { amber: 0, blue: 0 },
  flags: [],
  projectiles: [],

  user: null,
  persistentStats: null,
  sessionShots: 0,
  sessionHits: 0,

  isMobile: false,
  mobileControls: {
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    fire: false,
    jump: false,
  },

  setUser: (user) => set({ user }),
  fetchStats: async () => {
    const { user } = get();
    if (user) {
      const stats = await getPlayerStats(user.uid);
      set({ persistentStats: stats });
    }
  },
  recordShot: () => set(state => ({ sessionShots: state.sessionShots + 1 })),
  recordHit: () => set(state => ({ sessionHits: state.sessionHits + 1 })),
  setMobileControls: (controls) => set(state => ({
    mobileControls: { ...state.mobileControls, ...controls }
  })),
  setIsMobile: (isMobile) => set({ isMobile }),

  enterLobby: () => set({ gameState: 'menu' }),

  startGame: (roomId?: string) => {
    const { socket, selectedSkin, selectedColor, selectedPattern, selectedAccessories, selectedMap, selectedMode, gamertag, selectedRegion, privateServerName } = get();
    
    if (socket) {
      socket.disconnect();
    }

    let newSocket: Socket | null = null;

    // Initialize multiplayer
    newSocket = io(window.location.origin);
    
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
        region: selectedRegion
      });
    });

    newSocket.on('gameError', (msg: string) => {
      alert(msg);
      get().leaveGame();
    });

    newSocket.on('chatMessage', (msg: ChatMessage) => {
      get().addChatMessage(msg);
    });

    newSocket.on('gameJoined', (data: { players: Record<string, PlayerData>, team: Team, mode: GameMode, flags: FlagData[], roomId: string, blocks: WorldBlock[] }) => {
      const otherPlayers = { ...data.players };
      delete otherPlayers[newSocket!.id!];
      set({ 
        otherPlayers,
        gameState: 'playing',
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
        sessionHits: 0
      });
    });

      newSocket.on('playerJoined', (player: PlayerData) => {
        set(state => ({
          otherPlayers: { ...state.otherPlayers, [player.id]: player },
          events: [...state.events, { id: Math.random().toString(), message: `${player.name} joined`, timestamp: Date.now() }]
        }));
      });

      newSocket.on('playerMoved', (data: { id: string, position: [number, number, number], rotation: number }) => {
        set(state => {
          if (!state.otherPlayers[data.id]) return state;
          return {
            otherPlayers: {
              ...state.otherPlayers,
              [data.id]: {
                ...state.otherPlayers[data.id],
                position: data.position,
                rotation: data.rotation
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
    const { socket, user, kills, deaths, sessionShots, sessionHits, team, teamScores, selectedMode } = get();
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

    if (user) {
      updateGameStats(user.uid, {
        kills: kills,
        deaths: deaths,
        wins: isWin ? 1 : 0,
        totalShots: sessionShots,
        totalHits: sessionHits
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
      playerState: 'active'
    });
  },

  updateTime: (delta) => set((state) => {
    if (state.gameState !== 'playing') return state;
    const newTime = state.timeLeft - delta;
    if (newTime <= 0) {
      if (state.socket) state.socket.disconnect();
      return { timeLeft: 0, gameState: 'gameover', socket: null, roomId: null };
    }
    return { timeLeft: newTime };
  }),

  hitPlayer: () => set((state) => {
    if (state.playerState === 'disabled' || state.gameState !== 'playing') return state;
    const newHealth = Math.max(0, state.health - 20);
    const isDead = newHealth <= 0;
    if (isDead) {
      soundService.callout('Announcer', 'You were eliminated!');
    }
    return {
      health: newHealth,
      playerState: isDead ? 'disabled' : 'active',
      playerDisabledUntil: isDead ? Date.now() + 3000 : 0,
      deaths: isDead ? state.deaths + 1 : state.deaths,
      score: Math.max(0, state.score - 10), // Small penalty for getting hit
    };
  }),

  hitEnemy: (id: string, damage: number = 20) => set((state) => {
    if (state.gameState !== 'playing') return state;
    
    // Check if it's a multiplayer player
    if (state.socket && state.otherPlayers[id]) {
      state.socket.emit('hitPlayer', { targetId: id, damage });
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
    }
    return {
      enemies,
      kills: isDead ? state.kills + 1 : state.kills,
      score: isDead ? state.score + 100 : state.score + 20,
      events: isDead ? [...state.events, { id: Math.random().toString(), message: `You eliminated ${id}`, timestamp: Date.now() }] : state.events
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

  addParticles: (position, color) => set((state) => ({
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
      return { enemies, playerState: 'active', health: 100, otherPlayers: playersChanged ? otherPlayers : state.otherPlayers };
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
    const { projectiles, worldBlocks, hitEnemy, addParticles } = get();
    if (projectiles.length === 0) return;

    const gravity = 9.81;
    const updatedProjectiles = projectiles.map(p => {
      const newPos: [number, number, number] = [
        p.position[0] + p.velocity[0] * delta,
        p.position[1] + p.velocity[1] * delta,
        p.position[2] + p.velocity[2] * delta,
      ];
      
      const newVel: [number, number, number] = [
        p.velocity[0],
        p.velocity[1] - gravity * delta, // Apply gravity
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
  setColor: (selectedColor) => set({ selectedColor }),
  setPattern: (selectedPattern) => set({ selectedPattern }),
  toggleAccessory: (accessory) => set(state => {
    const accessories = state.selectedAccessories.includes(accessory)
      ? state.selectedAccessories.filter(a => a !== accessory)
      : [...state.selectedAccessories, accessory];
    return { selectedAccessories: accessories };
  }),
  setGunSkin: (selectedGunSkin) => set({ selectedGunSkin }),
  setMap: (selectedMap) => set({ selectedMap }),
  setMode: (selectedMode) => set({ selectedMode }),
  setRegion: (selectedRegion) => set({ selectedRegion }),

  triggerEmote: (emote) => {
    const { socket } = get();
    if (socket) {
      socket.emit('emote', emote);
    }
  },

  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  toggleThirdPerson: () => set(state => ({ isThirdPerson: !state.isThirdPerson })),
  setInventoryOpen: (isInventoryOpen) => set({ isInventoryOpen }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  switchWeapon: (currentWeaponIndex) => set({ currentWeaponIndex }),
  
  // Build Mode
  setBuildMode: (isBuildMode) => set({ isBuildMode }),
  setSelectedBlock: (selectedBlock) => set({ selectedBlock }),
  placeBlock: (position) => {
    const { socket, selectedBlock } = get();
    if (socket) {
      socket.emit('placeBlock', { type: selectedBlock, position });
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
  
  reload: () => set(state => {
    const weaponId = state.inventory[state.currentWeaponIndex];
    const weapon = WEAPONS[weaponId];
    if (weapon.isMelee) return state;
    
    soundService.callout('System', 'Reloading...');
    return {
      currentAmmo: {
        ...state.currentAmmo,
        [weaponId]: weapon.maxAmmo
      }
    };
  }),

  consumeAmmo: () => set(state => {
    const weaponId = state.inventory[state.currentWeaponIndex];
    const weapon = WEAPONS[weaponId];
    if (weapon.isMelee) return state;
    
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
  addFriend: (id) => set(state => {
    if (state.friends.includes(id)) return state;
    soundService.announce(`Friend added: ${id}`);
    return { friends: [...state.friends, id] };
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
  
  // Movement
  setSprinting: (isSprinting) => set({ isSprinting }),
  setSliding: (isSliding) => set({ isSliding }),
  
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
  
  updateSettings: (settings) => {
    const { socket } = get();
    if (socket) {
      socket.emit('updateSettings', settings);
    }
  },
  
  startRecording: () => set({ isRecording: true, currentReplay: [] }),
  stopRecording: () => set({ isRecording: false }),
  saveReplay: () => set(state => ({ 
    replays: [...state.replays, { id: Date.now(), data: state.currentReplay, timestamp: new Date().toISOString() }],
    currentReplay: null 
  })),
  playReplay: (replay) => {
    // Logic to play back events
    console.log("Playing replay...", replay);
  },
  
  updatePlayerPosition: (position, rotation) => {
    const { socket, inventory, currentWeaponIndex, isSprinting, isSliding, isBuildMode, selectedBlock } = get();
    if (socket) {
      socket.emit('move', { 
        position, 
        rotation,
        weapon: inventory[currentWeaponIndex],
        isSprinting,
        isSliding,
        isBuildMode,
        selectedBlock
      });
    }
  }
}));
