export type BiomeId = 
  | 'megacity' 
  | 'village' 
  | 'mountains' 
  | 'desert' 
  | 'ocean_islands' 
  | 'military_base' 
  | 'ancient_ruins' 
  | 'dino_valley' 
  | 'titan_battleground' 
  | 'underground_bunker';

export interface BiomeZone {
  id: BiomeId;
  name: string;
  subtitle: string;
  coordinates: [number, number, number];
  color: string;
  features: string[];
  weatherPreset?: 'clear' | 'rain' | 'storm' | 'fog' | 'snow' | 'sandstorm';
}

export type VehicleCategory = 'land' | 'air' | 'water' | 'futuristic';

export type MegaVehicleType = 
  | 'sports_car'
  | 'muscle_car'
  | 'buggy'
  | 'truck'
  | 'motorcycle'
  | 'bus'
  | 'tank'
  | 'armored_apc'
  | 'helicopter'
  | 'jet'
  | 'fighter_aircraft'
  | 'transport_plane'
  | 'hovercraft'
  | 'speedboat'
  | 'patrol_boat'
  | 'aircraft_carrier'
  | 'submarine'
  | 'flying_speeder';

export interface MegaVehicleConfig {
  id: MegaVehicleType;
  name: string;
  category: VehicleCategory;
  topSpeedKmH: number;
  acceleration: number;
  armor: number;
  handling: number;
  weaponType: 'none' | 'twin_laser' | 'homing_missile' | 'tank_cannon' | 'torpedo' | 'plasma_turret';
  color: string;
  description: string;
}

export type TransformationId = 
  | 'colossal_titan'
  | 'nine_tailed_fox'
  | 'godzilla_kaiju'
  | 'saiyan_god'
  | 'cursed_demon'
  | 'sonic_speed'
  | 'skibidi_mech'
  | 'celestial_archangel';

export interface TransformationConfig {
  id: TransformationId;
  name: string;
  source: string;
  heightMultiplier: number;
  speedMultiplier: number;
  damageMultiplier: number;
  primaryAttack: string;
  ultimateAttack: string;
  auraColor: string;
  secondaryColor: string;
  description: string;
}

export type CreatureType = 
  | 't_rex' 
  | 'velociraptor' 
  | 'fire_dragon' 
  | 'dire_wolf' 
  | 'spirit_fox' 
  | 'wandering_titan';

export interface CreatureEntity {
  id: string;
  type: CreatureType;
  name: string;
  position: [number, number, number];
  rotation: number;
  health: number;
  maxHealth: number;
  isHostile: boolean;
  isTamed: boolean;
  isMounted: boolean;
  scale: number;
  color: string;
}

export type WorldEventType = 
  | 'food_rain' 
  | 'supply_drop' 
  | 'titan_boss' 
  | 'dino_stampede' 
  | 'meteor_shower' 
  | 'magic_storm' 
  | 'vehicle_airdrop';

export interface ActiveWorldEvent {
  id: string;
  type: WorldEventType;
  title: string;
  description: string;
  position: [number, number, number];
  timeRemainingSeconds: number;
  rewardText: string;
  intensity: number;
}

export interface GreatFloodState {
  isActive: boolean;
  waterLevel: number;
  maxWaterLevel: number;
  riseSpeedMps: number;
  elapsedSeconds: number;
  survivorsRescued: number;
  sirenActive: boolean;
}

export interface PlacedMapObject {
  id: string;
  category: 'building' | 'nature' | 'military' | 'interactive' | 'spawner';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  lightIntensity?: number;
}

export interface CustomMapProject {
  id: string;
  title: string;
  author: string;
  description: string;
  weather: 'clear' | 'rain' | 'storm' | 'fog' | 'snow' | 'night';
  objects: PlacedMapObject[];
  createdAt: number;
}

export interface ClanTerritoryZone {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  controllingClan: string | null;
  captureProgress: number; // 0 - 100
  defenseLevel: number;
  incomePerMinute: number;
}
