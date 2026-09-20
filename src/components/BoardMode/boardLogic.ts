import { 
  ActiveUnitInstance, 
  DefensiveStructure, 
  LaneId, 
  ClusterCommandType, 
  FormationType, 
  UnitDefinition 
} from './types';
import { BOARD_UNITS } from './unitCatalog';

export const INITIAL_TOWERS: DefensiveStructure[] = [
  // PLAYER DEFENSES
  {
    id: 'p_nexus',
    name: 'Player Core Citadel',
    team: 'player',
    lane: 'mid',
    type: 'nexus',
    position: [-28, 0, 0],
    hp: 4000,
    maxHp: 4000,
    range: 9,
    damage: 140,
    attackSpeed: 1.2,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_guard_top',
    name: 'North Guardian Spire',
    team: 'player',
    lane: 'top',
    type: 'guardian',
    position: [-18, 0, -14],
    hp: 2200,
    maxHp: 2200,
    range: 7.5,
    damage: 100,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_guard_mid',
    name: 'Central Guardian Spire',
    team: 'player',
    lane: 'mid',
    type: 'guardian',
    position: [-18, 0, 0],
    hp: 2400,
    maxHp: 2400,
    range: 7.5,
    damage: 110,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_guard_bot',
    name: 'South Guardian Spire',
    team: 'player',
    lane: 'bot',
    type: 'guardian',
    position: [-18, 0, 14],
    hp: 2200,
    maxHp: 2200,
    range: 7.5,
    damage: 100,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_tower_top',
    name: 'Top Arcane Tower',
    team: 'player',
    lane: 'top',
    type: 'outer_tower',
    position: [-8, 0, -14],
    hp: 1600,
    maxHp: 1600,
    range: 7.0,
    damage: 85,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_tower_mid',
    name: 'Mid Prism Tower',
    team: 'player',
    lane: 'mid',
    type: 'outer_tower',
    position: [-8, 0, 0],
    hp: 1800,
    maxHp: 1800,
    range: 7.0,
    damage: 90,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'p_tower_bot',
    name: 'Bot Tesla Tower',
    team: 'player',
    lane: 'bot',
    type: 'outer_tower',
    position: [-8, 0, 14],
    hp: 1600,
    maxHp: 1600,
    range: 7.0,
    damage: 85,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  },

  // ENEMY DEFENSES
  {
    id: 'e_nexus',
    name: 'Enemy Dread Citadel',
    team: 'enemy',
    lane: 'mid',
    type: 'nexus',
    position: [28, 0, 0],
    hp: 4000,
    maxHp: 4000,
    range: 9,
    damage: 140,
    attackSpeed: 1.2,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_guard_top',
    name: 'Enemy North Bastion',
    team: 'enemy',
    lane: 'top',
    type: 'guardian',
    position: [18, 0, -14],
    hp: 2200,
    maxHp: 2200,
    range: 7.5,
    damage: 100,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_guard_mid',
    name: 'Enemy Central Bastion',
    team: 'enemy',
    lane: 'mid',
    type: 'guardian',
    position: [18, 0, 0],
    hp: 2400,
    maxHp: 2400,
    range: 7.5,
    damage: 110,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_guard_bot',
    name: 'Enemy South Bastion',
    team: 'enemy',
    lane: 'bot',
    type: 'guardian',
    position: [18, 0, 14],
    hp: 2200,
    maxHp: 2200,
    range: 7.5,
    damage: 100,
    attackSpeed: 1.0,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_tower_top',
    name: 'Enemy Top Obelisk',
    team: 'enemy',
    lane: 'top',
    type: 'outer_tower',
    position: [8, 0, -14],
    hp: 1600,
    maxHp: 1600,
    range: 7.0,
    damage: 85,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_tower_mid',
    name: 'Enemy Mid Obelisk',
    team: 'enemy',
    lane: 'mid',
    type: 'outer_tower',
    position: [8, 0, 0],
    hp: 1800,
    maxHp: 1800,
    range: 7.0,
    damage: 90,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  },
  {
    id: 'e_tower_bot',
    name: 'Enemy Bot Obelisk',
    team: 'enemy',
    lane: 'bot',
    type: 'outer_tower',
    position: [8, 0, 14],
    hp: 1600,
    maxHp: 1600,
    range: 7.0,
    damage: 85,
    attackSpeed: 1.1,
    lastAttackTime: 0,
    destroyed: false
  }
];

export const LANE_Z_COORDINATES: Record<LaneId, number> = {
  top: -14,
  mid: 0,
  bot: 14
};

// Calculate relative offsets for formation types
export function getFormationOffsets(index: number, total: number, formation: FormationType): [number, number] {
  if (total <= 1) return [0, 0];

  const spacing = 1.8;
  switch (formation) {
    case 'line': {
      // Row perpendicular to lane
      const offsetZ = (index - (total - 1) / 2) * spacing;
      return [0, offsetZ];
    }
    case 'wedge': {
      // V-formation pointed forward
      const row = Math.floor(Math.sqrt(index));
      const col = index - row * row;
      const offsetX = -row * spacing * 1.1;
      const offsetZ = (col - row) * spacing;
      return [offsetX, offsetZ];
    }
    case 'shield_wall': {
      // Tight front ranks
      const frontCount = Math.ceil(total / 2);
      const isFront = index < frontCount;
      const col = isFront ? index : index - frontCount;
      const offsetX = isFront ? 0 : -spacing * 1.2;
      const offsetZ = (col - (frontCount - 1) / 2) * (spacing * 0.85);
      return [offsetX, offsetZ];
    }
    case 'flank_pincer': {
      // Split into two wide wings
      const isLeft = index % 2 === 0;
      const wingIndex = Math.floor(index / 2);
      const offsetX = -wingIndex * spacing * 0.8;
      const offsetZ = (isLeft ? -1 : 1) * (3.5 + wingIndex * spacing);
      return [offsetX, offsetZ];
    }
    case 'spread': {
      // Dispersed to mitigate AoE
      const angle = (index / total) * Math.PI * 2;
      const radius = 2.8 + (index % 2) * 1.5;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    }
    default:
      return [0, 0];
  }
}

// Distance helper
export function getDistance(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function get2DDistance(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x1 - x2;
  const dz = z1 - z2;
  return Math.sqrt(dx * dx + dz * dz);
}

// Spawn an active unit
export function createActiveUnit(
  unitDef: UnitDefinition, 
  team: 'player' | 'enemy', 
  lane: LaneId, 
  customPos?: [number, number, number]
): ActiveUnitInstance {
  const spawnX = team === 'player' ? -24 : 24;
  const laneZ = LANE_Z_COORDINATES[lane];
  const y = unitDef.isFlying ? 2.8 : 0;

  return {
    instanceId: `${team}_${unitDef.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    unitId: unitDef.id,
    team,
    position: customPos || [spawnX, y, laneZ + (Math.random() - 0.5) * 2],
    hp: unitDef.hp,
    maxHp: unitDef.maxHp,
    assignedLane: lane,
    currentCommand: 'Push',
    lastAttackTime: 0,
    abilityCooldowns: {},
    buffs: [],
    animationTick: 0
  };
}
