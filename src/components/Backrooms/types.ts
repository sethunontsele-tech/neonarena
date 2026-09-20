/**
 * Types and interfaces for the Backrooms Dimension in Neon Arena
 */

export type BackroomsLevelId = 0 | 1 | 2 | 3 | 4 | 5 | 999;

export interface BackroomsLevelConfig {
  id: BackroomsLevelId;
  name: string;
  subtitle: string;
  theme: 'yellow_halls' | 'industrial' | 'maintenance' | 'flooded' | 'office' | 'hotel' | 'developer_lab';
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  ambientLight: string;
  lightIntensity: number;
  fogColor: string;
  fogDensity: number;
  corridorWidth: number;
  roomSize: number;
  hasWater: boolean;
  waterLevel: number;
  waterColor: string;
  flickerRate: number;
  hasSteamHazards: boolean;
  hasElectricHazards: boolean;
  bgmType: 'fluorescent_buzz' | 'industrial_hum' | 'dripping_water' | 'muffled_office' | 'hotel_drone' | 'quantum_static';
}

export interface BackroomsItem {
  id: string;
  type: 'almond_water' | 'battery' | 'medkit' | 'adrenaline' | 'keycard_red' | 'keycard_blue' | 'keycard_gold' | 'glitch_artifact';
  name: string;
  description: string;
  position: [number, number, number];
  icon: string;
  count: number;
}

export type EntityType = 
  | 'smiler'        // Luminescent Shade: glows in dark, charges if you turn your back or sprint
  | 'bacteria'      // Cable Strangler: blind, tall wire-tangle, reacts violently to noise/sprinting
  | 'duller'        // Hollow Lurker: ambushes from blind spots and alcoves
  | 'hound'         // Crawler Entity: quadruped, scared of direct flashlight beam, leaps when chased
  | 'faceling'      // Silent Nomad: neutral unless provoked, teleports
  | 'boss_harvester'; // The Harvester of Corridors (Multi-phase boss)

export interface BackroomsEntityState {
  id: string;
  type: EntityType;
  name: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  speed: number;
  state: 'idle' | 'patrol' | 'investigate' | 'stalk' | 'charge' | 'attack' | 'flee' | 'stunned' | 'dead';
  targetPos: [number, number, number] | null;
  alertLevel: number; // 0 to 1
  isEnraged: boolean;
  lastAttackTime: number;
  attackCooldown: number;
  detectionRadius: number;
  damage: number;
}

export interface BackroomsDoor {
  id: string;
  position: [number, number, number];
  rotation: number;
  isOpen: boolean;
  isLocked: boolean;
  requiredKey: 'none' | 'keycard_red' | 'keycard_blue' | 'keycard_gold';
  label?: string;
}

export interface BackroomsElevator {
  id: string;
  position: [number, number, number];
  currentLevel: BackroomsLevelId;
  targetLevel: BackroomsLevelId;
  isOpen: boolean;
  isMoving: boolean;
  availableLevels: BackroomsLevelId[];
}

export interface BackroomsHazard {
  id: string;
  type: 'steam_pipe' | 'live_wire' | 'flickering_junction';
  position: [number, number, number];
  active: boolean;
  damage: number;
  radius: number;
}

export interface BackroomsBossState {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  phase: 1 | 2 | 3;
  isInvulnerable: boolean;
  weakPointExposed: boolean;
  weakPointPos: [number, number, number];
  activeAttack: 'none' | 'ground_slam' | 'laser_sweep' | 'pillar_charge' | 'dimensional_pulse' | 'darkness_plunge';
  attackTimer: number;
  pillarsRemaining: number;
  state: 'intro' | 'active' | 'enraged' | 'transition' | 'defeated';
}

export interface BackroomsRandomEvent {
  type: 'blackout' | 'hallway_shift' | 'gravity_distortion' | 'whispers' | 'ambush' | 'almond_rainfall';
  title: string;
  description: string;
  remainingTime: number;
  duration: number;
}

export interface BackroomsGraphicsSettings {
  preset: 'low' | 'medium' | 'ultra';
  fog: boolean;
  flicker: boolean;
  vhsOverlay: boolean;
  particles: boolean;
  dynamicShadows: boolean;
  audioEcho: boolean;
}
