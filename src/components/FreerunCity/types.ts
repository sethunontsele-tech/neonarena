export type ParkourAction = 
  | 'idle' 
  | 'run' 
  | 'sprint' 
  | 'jump' 
  | 'double_jump'
  | 'vault' 
  | 'slide' 
  | 'wallrun_left' 
  | 'wallrun_right' 
  | 'wallclimb' 
  | 'walljump' 
  | 'ledge_grab' 
  | 'ledge_climb' 
  | 'roll' 
  | 'dive' 
  | 'frontflip' 
  | 'backflip' 
  | 'sideflip' 
  | 'spin_360' 
  | 'precision' 
  | 'air_dash' 
  | 'super_jump' 
  | 'grind' 
  | 'bail';

export type ViewMode = 'third_person' | 'first_person';

export interface TrickInfo {
  id: string;
  name: string;
  category: 'vault' | 'aerial' | 'wall' | 'flow' | 'landing' | 'kinetic';
  points: number;
  description: string;
  styleScore: number;
}

export interface ComboEvent {
  trickId: string;
  name: string;
  points: number;
  multiplier: number;
  timestamp: number;
  isRepeated: boolean;
}

export interface ComboState {
  currentPoints: number;
  multiplier: number;
  comboTimer: number; // in seconds
  chainLength: number;
  flowState: number; // 0 to 100
  recentTricks: string[];
  activeComboEvents: ComboEvent[];
  lastTrickName: string;
  highestCombo: number;
  totalTricksPerformed: number;
  isFlowStateActive: boolean;
}

export interface PlayerStats {
  score: number;
  highestCombo: number;
  totalDistance: number;
  tricksCount: number;
  challengesCompleted: number;
  medalsEarned: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  collectiblesFound: number;
  rank: string;
  xp: number;
  nextRankXP: number;
}

export type WeatherType = 'clear' | 'rain' | 'storm' | 'fog' | 'cloudy';
export type TimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';

export interface CollectibleItem {
  id: string;
  name: string;
  type: 'datashard' | 'spray_can' | 'quantum_orb';
  position: [number, number, number];
  points: number;
  collected: boolean;
  hint: string;
  description: string;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  type: 'time_trial' | 'checkpoint_race' | 'trick_battle' | 'precision_leap' | 'rooftop_dash' | 'spire_ascent';
  description: string;
  difficulty: 'Beginner' | 'Acrobat' | 'Master' | 'Apex';
  startPos: [number, number, number];
  checkpoints: [number, number, number][];
  targetScore?: number;
  targetTime?: number; // in seconds
  bronzeTime?: number;
  silverTime?: number;
  goldTime?: number;
  platinumTime?: number;
  rewardXP: number;
  rewardCosmetic?: string;
  completed?: boolean;
  bestTime?: number;
  bestScore?: number;
  medal?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type MultiplayerMode = 'free_roam' | 'tag' | 'capture_flag' | 'trick_battle' | 'rooftop_race' | 'combo_comp';

export interface NetworkRunner {
  id: string;
  name: string;
  color: string;
  trailColor: string;
  position: [number, number, number];
  rotation: number;
  action: ParkourAction;
  score: number;
  currentCombo: number;
  isIt?: boolean;
  outfit: {
    hoodieColor: string;
    pantsColor: string;
    shoesColor: string;
    hasVisor: boolean;
  };
}

export interface LevelEditorObject {
  id: string;
  type: 
    | 'building' 
    | 'platform' 
    | 'wall' 
    | 'ramp' 
    | 'pipe' 
    | 'grind_rail' 
    | 'moving_platform' 
    | 'door' 
    | 'window' 
    | 'checkpoint' 
    | 'launch_pad' 
    | 'speed_booster' 
    | 'fan_vent' 
    | 'zip_line' 
    | 'neon_sign' 
    | 'arrow_holo' 
    | 'graffiti';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  emissiveColor?: string;
  isCollidable: boolean;
  isVaultable?: boolean;
  isWallrunnable?: boolean;
  speedMultiplier?: number;
  launchPower?: number;
  targetId?: string; // For moving platforms or zip-lines
}

export interface CustomMap {
  id: string;
  title: string;
  author: string;
  description: string;
  category: 'Rooftop Race' | 'Trick Arena' | 'Obstacle Course' | 'Parkour Tower' | 'Cyber City';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  objects: LevelEditorObject[];
  spawnPoint: [number, number, number];
  checkpoints: [number, number, number][];
  likes: number;
  plays: number;
  createdAt: string;
  rating: number;
}

export interface ReplayKeyframe {
  timestamp: number;
  position: [number, number, number];
  rotation: [number, number, number];
  action: ParkourAction;
  trickName: string;
  comboMultiplier: number;
  flowState: number;
}

export interface PhotoSettings {
  fov: number;
  dof: number;
  tilt: number;
  filter: 'none' | 'cyberpunk' | 'matrix' | 'golden_hour' | 'midnight_noir' | 'neon_dream';
  freeCam: boolean;
  hideHUD: boolean;
  vignette: boolean;
}

export interface CharacterOutfit {
  topType: 'hoodie' | 'jacket' | 'windbreaker' | 'sleeveless' | 'tracksuit';
  topColor: string;
  topAccent: string;
  pantsType: 'cargo_joggers' | 'tech_pants' | 'skinny_athletic' | 'cyber_shorts';
  pantsColor: string;
  shoesType: 'kinetic_sneakers' | 'high_tops' | 'stealth_striders' | 'mag_soles';
  shoesColor: string;
  headwear: 'none' | 'cyber_visor' | 'neon_mask' | 'beanie' | 'baseball_cap' | 'headphones';
  headwearColor: string;
  backAccessory: 'none' | 'street_backpack' | 'drone_mount' | 'neon_wings';
  backColor: string;
  neonTrail: 'cyan_lightning' | 'magenta_flame' | 'gold_spark' | 'void_dark' | 'rainbow_prism';
}

export interface FreerunSettings {
  mouseSensitivity: number;
  cameraDistance: number;
  autoRoll: boolean;
  motionBlur: boolean;
  soundVolume: number;
  musicVolume: number;
  mobileControlsVisible: boolean;
  showTrajectoryAssist: boolean;
}
