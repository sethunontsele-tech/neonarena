export type UnitRole = 
  | 'Hero' 
  | 'Soldier' 
  | 'Flying' 
  | 'Heavy' 
  | 'Ranged' 
  | 'Fast' 
  | 'Support' 
  | 'AreaControl' 
  | 'Defensive' 
  | 'Special';

export type FactionId = 
  | 'celestial' 
  | 'abyssal' 
  | 'cyber_sentinel' 
  | 'primal_beast' 
  | 'arcane_order' 
  | 'dragonkin' 
  | 'ironbound' 
  | 'sylph_nature';

export type ClusterCommandType = 
  | 'Move' 
  | 'Attack' 
  | 'FocusFire' 
  | 'Retreat' 
  | 'Defend' 
  | 'Follow' 
  | 'Flank' 
  | 'Push' 
  | 'HoldPosition' 
  | 'ProtectHero' 
  | 'TargetStructure' 
  | 'SpreadOut' 
  | 'Regroup';

export type FormationType = 'line' | 'wedge' | 'shield_wall' | 'flank_pincer' | 'spread';

export type LaneId = 'top' | 'mid' | 'bot';

export interface UnitAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost?: number;
  radius: number;
  damage?: number;
  heal?: number;
  buffDuration?: number;
  icon: string;
}

export interface UpgradeBranch {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  statBonus: Partial<Record<'hp' | 'damage' | 'speed' | 'range' | 'armor', number>>;
  unlockedAbility?: string;
  unlocked: boolean;
  costXP: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  title: string;
  faction: FactionId;
  role: UnitRole;
  isHero: boolean;
  manaCost: number;
  tier: 1 | 2 | 3 | 4 | 5;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number; // attacks per sec
  range: number; // in world units
  moveSpeed: number;
  armor: number; // flat reduction / percentage
  isFlying?: boolean;
  abilities: UnitAbility[];
  strengths: string[];
  weaknesses: string[];
  description: string;
  modelColor: string;
  emissiveColor?: string;
  modelType: 
    | 'hero_paladin' 
    | 'hero_mage' 
    | 'hero_valkyrie' 
    | 'hero_warrior' 
    | 'hero_dragonkin'
    | 'soldier_swordsman' 
    | 'soldier_archer' 
    | 'soldier_golem' 
    | 'creature_dragon' 
    | 'creature_griffin' 
    | 'creature_wolf' 
    | 'creature_behemoth' 
    | 'support_cleric' 
    | 'cyber_drone'
    | 'special_wraith';
  upgradeBranches: [UpgradeBranch, UpgradeBranch]; // Branch A vs Branch B
}

export interface ActiveUnitInstance {
  instanceId: string;
  unitId: string;
  team: 'player' | 'enemy';
  position: [number, number, number];
  targetPosition?: [number, number, number];
  hp: number;
  maxHp: number;
  assignedLane: LaneId;
  currentCommand: ClusterCommandType;
  squadId?: string; // e.g. "squad_1"
  targetEnemyId?: string;
  targetStructureId?: string;
  lastAttackTime: number;
  abilityCooldowns: Record<string, number>;
  buffs: Array<{ type: string; duration: number; value: number }>;
  isAttacking?: boolean;
  isMoving?: boolean;
  animationTick: number;
}

export interface DefensiveStructure {
  id: string;
  name: string;
  team: 'player' | 'enemy';
  lane: LaneId;
  type: 'nexus' | 'guardian' | 'outer_tower' | 'placed_defense';
  position: [number, number, number];
  hp: number;
  maxHp: number;
  range: number;
  damage: number;
  attackSpeed: number;
  specialEffect?: 'freeze' | 'burn' | 'chain_lightning' | 'shield_aura' | 'heal_aura';
  lastAttackTime: number;
  destroyed: boolean;
}

export interface ArtifactDefinition {
  id: string;
  name: string;
  rarity: 'rare' | 'epic' | 'legendary';
  description: string;
  cooldown: number; // in seconds
  icon: string;
  color: string;
  effectType: 
    | 'aoe_meteor' 
    | 'time_dilation' 
    | 'colossus_shield' 
    | 'rejuvenation' 
    | 'gale_haste' 
    | 'warlord_banner' 
    | 'storm_lightning' 
    | 'void_summon';
  powerValue: number;
}

export interface BoardSquadLoadout {
  id: string;
  name: string;
  heroId: string;
  soldierIds: string[]; // up to 7 soldiers
  artifactIds: string[]; // up to 3 artifacts
  preferredFormation: FormationType;
  archetype: 'Aggressive' | 'Defensive' | 'Balanced' | 'Speed' | 'Flying' | 'Magic' | 'Heavy' | 'Support' | 'Custom';
}

export type BoardEnvironmentId = 
  | 'floating_temple' 
  | 'volcanic_crater' 
  | 'neon_citadel' 
  | 'frozen_glacier' 
  | 'celestial_spires' 
  | 'enchanted_forest';

export interface BoardEnvironmentConfig {
  id: BoardEnvironmentId;
  name: string;
  themeColor: string;
  skyColor: string;
  ambientLight: string;
  floorColor: string;
  laneColor: string;
  weather: 'clear' | 'thunderstorm' | 'blizzard' | 'ash_rain' | 'solar_mist' | 'neon_rain';
  environmentalBonus: string;
}

export interface CustomBoardMapData {
  id: string;
  name: string;
  author: string;
  environment: BoardEnvironmentId;
  customTowers: Array<{ type: string; pos: [number, number, number]; team: 'player' | 'enemy' }>;
  obstacles: Array<{ type: string; pos: [number, number, number]; scale: [number, number, number] }>;
  published: boolean;
}
