import { TrickInfo, ComboState, ComboEvent, PlayerStats } from './types';
import { freerunAudio } from './FreerunAudioEngine';

export const TRICK_CATALOG: Record<string, TrickInfo> = {
  sprint_vault: {
    id: 'sprint_vault',
    name: 'Kong Vault',
    category: 'vault',
    points: 180,
    description: 'Cat-pass high-speed dive vault over an obstacle',
    styleScore: 80,
  },
  dash_vault: {
    id: 'dash_vault',
    name: 'Dash Vault',
    category: 'vault',
    points: 150,
    description: 'Feet-first clean vault maintaining linear velocity',
    styleScore: 70,
  },
  power_slide: {
    id: 'power_slide',
    name: 'Power Slide',
    category: 'flow',
    points: 120,
    description: 'Low-profile kinetic friction slide under low clearance',
    styleScore: 60,
  },
  wallrun_left: {
    id: 'wallrun_left',
    name: 'Left Wall-Run',
    category: 'wall',
    points: 220,
    description: 'Horizontal stride across left vertical architecture',
    styleScore: 90,
  },
  wallrun_right: {
    id: 'wallrun_right',
    name: 'Right Wall-Run',
    category: 'wall',
    points: 220,
    description: 'Horizontal stride across right vertical architecture',
    styleScore: 90,
  },
  wall_climb: {
    id: 'wall_climb',
    name: 'Vertical Wall Climb',
    category: 'wall',
    points: 180,
    description: 'Direct upward pop and foot push up a vertical face',
    styleScore: 75,
  },
  wall_jump: {
    id: 'wall_jump',
    name: 'Wall Eject Jump',
    category: 'wall',
    points: 240,
    description: 'Explosive lateral kick-off from vertical surface',
    styleScore: 95,
  },
  ledge_grab: {
    id: 'ledge_grab',
    name: 'Cat Hang & Ledge Grab',
    category: 'wall',
    points: 140,
    description: 'Snapping grip onto building border or girder',
    styleScore: 60,
  },
  ledge_climb: {
    id: 'ledge_climb',
    name: 'Muscle-Up Ledge Climb',
    category: 'flow',
    points: 160,
    description: 'Explosive chest press and rollover onto rooftop',
    styleScore: 70,
  },
  frontflip: {
    id: 'frontflip',
    name: 'Gainer Frontflip',
    category: 'aerial',
    points: 380,
    description: 'High-altitude forward tuck flip across urban chasm',
    styleScore: 120,
  },
  backflip: {
    id: 'backflip',
    name: 'Arabian Backflip',
    category: 'aerial',
    points: 420,
    description: 'Inverted backward layout flip with half-twist',
    styleScore: 135,
  },
  sideflip: {
    id: 'sideflip',
    name: 'Webster Sideflip',
    category: 'aerial',
    points: 390,
    description: 'One-legged rotational side layout flip over drop',
    styleScore: 125,
  },
  spin_360: {
    id: 'spin_360',
    name: '360° Butterfly Kick',
    category: 'aerial',
    points: 320,
    description: 'Full horizontal body rotation above the rooftops',
    styleScore: 110,
  },
  dive: {
    id: 'dive',
    name: 'Superman Dive',
    category: 'aerial',
    points: 260,
    description: 'Airborne dive transition into forward roll',
    styleScore: 85,
  },
  precision_landing: {
    id: 'precision_landing',
    name: 'Precision Beam Landing',
    category: 'landing',
    points: 300,
    description: 'Flawless zero-step stick on a narrow pipe or rail',
    styleScore: 100,
  },
  clean_roll: {
    id: 'clean_roll',
    name: 'Momentum Break-Fall Roll',
    category: 'landing',
    points: 200,
    description: 'Fluid diagonal shoulder roll converting drop into sprint',
    styleScore: 80,
  },
  air_dash: {
    id: 'air_dash',
    name: 'Neon Air Dash',
    category: 'kinetic',
    points: 280,
    description: 'Sonic forward propulsion in mid-air',
    styleScore: 110,
  },
  super_jump: {
    id: 'super_jump',
    name: 'Kinetic Super Jump',
    category: 'kinetic',
    points: 310,
    description: 'Massive vertical spring from rooftop launch point',
    styleScore: 115,
  },
  grind_rail: {
    id: 'grind_rail',
    name: 'Pipe Grind',
    category: 'flow',
    points: 190,
    description: 'High-speed slide across elevated cable or metal pipe',
    styleScore: 85,
  }
};

export const RANKS = [
  { name: 'Rookie Runner', minXP: 0 },
  { name: 'Street Acrobat', minXP: 2500 },
  { name: 'Rooftop Raider', minXP: 7500 },
  { name: 'Skyliner Traceur', minXP: 16000 },
  { name: 'Cloud Strider', minXP: 30000 },
  { name: 'Skyline Ghost', minXP: 55000 },
  { name: 'Neon Apex Legend', minXP: 100000 },
];

export class FreerunComboEngine {
  public state: ComboState;
  public stats: PlayerStats;
  private onStateChange?: (state: ComboState, stats: PlayerStats) => void;

  constructor(onUpdate?: (state: ComboState, stats: PlayerStats) => void) {
    this.onStateChange = onUpdate;
    this.state = {
      currentPoints: 0,
      multiplier: 1.0,
      comboTimer: 0,
      chainLength: 0,
      flowState: 0,
      recentTricks: [],
      activeComboEvents: [],
      lastTrickName: '',
      highestCombo: 0,
      totalTricksPerformed: 0,
      isFlowStateActive: false,
    };

    const savedStats = localStorage.getItem('neon_freerun_stats');
    if (savedStats) {
      try {
        this.stats = JSON.parse(savedStats);
      } catch {
        this.stats = this.getDefaultStats();
      }
    } else {
      this.stats = this.getDefaultStats();
    }
  }

  private getDefaultStats(): PlayerStats {
    return {
      score: 0,
      highestCombo: 0,
      totalDistance: 0,
      tricksCount: 0,
      challengesCompleted: 0,
      medalsEarned: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      collectiblesFound: 0,
      rank: 'Rookie Runner',
      xp: 0,
      nextRankXP: 2500,
    };
  }

  public registerTrick(trickId: string, speedMps: number = 10) {
    const trick = TRICK_CATALOG[trickId];
    if (!trick) return;

    // Check anti-spam decay
    const recentOccurrences = this.state.recentTricks.filter(t => t === trickId).length;
    let pointFactor = 1.0;
    let isRepeated = false;

    if (recentOccurrences >= 2) {
      pointFactor = 0.35; // Severe penalty for spamming
      isRepeated = true;
    } else if (recentOccurrences === 1) {
      pointFactor = 0.7;
      isRepeated = true;
    }

    // Speed & style bonuses
    const speedBonus = Math.max(0, (speedMps - 10) * 8);
    const earnedPoints = Math.round((trick.points * pointFactor) + speedBonus);

    // Variety bonus to multiplier
    const isNewInChain = !this.state.recentTricks.slice(-3).includes(trickId);
    const multiplierInc = isNewInChain ? 0.3 : 0.1;

    const newMultiplier = Math.min(10.0, +(this.state.multiplier + multiplierInc).toFixed(1));
    this.state.currentPoints += earnedPoints;
    this.state.multiplier = newMultiplier;
    this.state.chainLength += 1;
    this.state.comboTimer = 3.8; // 3.8s to chain next trick
    this.state.flowState = Math.min(100, this.state.flowState + 12);
    this.state.isFlowStateActive = this.state.flowState >= 70;
    this.state.lastTrickName = trick.name;
    this.state.totalTricksPerformed += 1;

    // Update recent history
    this.state.recentTricks.push(trickId);
    if (this.state.recentTricks.length > 8) {
      this.state.recentTricks.shift();
    }

    const event: ComboEvent = {
      trickId,
      name: trick.name,
      points: earnedPoints,
      multiplier: newMultiplier,
      timestamp: Date.now(),
      isRepeated,
    };

    this.state.activeComboEvents.push(event);
    if (this.state.activeComboEvents.length > 5) {
      this.state.activeComboEvents.shift();
    }

    // Audio chime
    freerunAudio.playTrickChime(newMultiplier);
    freerunAudio.updateFlowState(this.state.flowState);

    this.notify();
  }

  public update(delta: number, currentSpeed: number) {
    if (this.state.comboTimer > 0) {
      this.state.comboTimer -= delta;
      if (this.state.comboTimer <= 0) {
        this.bankCombo(false);
      }
    }

    // Decay flow state slowly if speed is low
    if (currentSpeed < 6) {
      this.state.flowState = Math.max(0, this.state.flowState - delta * 8);
    } else {
      this.state.flowState = Math.min(100, this.state.flowState + delta * (currentSpeed > 15 ? 4 : 1));
    }
    this.state.isFlowStateActive = this.state.flowState >= 70;
    freerunAudio.updateFlowState(this.state.flowState);

    // Track distance
    if (currentSpeed > 1) {
      this.stats.totalDistance += (currentSpeed * delta);
    }
  }

  public bankCombo(isPerfectLanding: boolean = false) {
    if (this.state.currentPoints <= 0) return;

    let totalEarned = Math.round(this.state.currentPoints * this.state.multiplier);
    if (isPerfectLanding) {
      totalEarned = Math.round(totalEarned * 1.25); // +25% perfect landing bonus
    }

    this.stats.score += totalEarned;
    this.stats.tricksCount += this.state.chainLength;
    this.addXP(Math.round(totalEarned * 0.1));

    if (totalEarned > this.stats.highestCombo) {
      this.stats.highestCombo = totalEarned;
    }
    if (totalEarned > this.state.highestCombo) {
      this.state.highestCombo = totalEarned;
    }

    // Reset combo
    this.state.currentPoints = 0;
    this.state.multiplier = 1.0;
    this.state.comboTimer = 0;
    this.state.chainLength = 0;
    this.state.recentTricks = [];
    this.state.activeComboEvents = [];

    this.saveStats();
    this.notify();
  }

  public bailPenalty() {
    // Player stumbled or crashed
    freerunAudio.playBail();
    this.state.currentPoints = 0;
    this.state.multiplier = 1.0;
    this.state.comboTimer = 0;
    this.state.chainLength = 0;
    this.state.flowState = 0;
    this.state.isFlowStateActive = false;
    this.state.recentTricks = [];
    this.state.lastTrickName = 'BAIL!';
    freerunAudio.updateFlowState(0);
    this.notify();
  }

  public addXP(amount: number) {
    this.stats.xp += amount;
    // Check rank
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (this.stats.xp >= RANKS[i].minXP) {
        this.stats.rank = RANKS[i].name;
        this.stats.nextRankXP = RANKS[i + 1]?.minXP || RANKS[i].minXP;
        break;
      }
    }
    this.saveStats();
    this.notify();
  }

  public saveStats() {
    localStorage.setItem('neon_freerun_stats', JSON.stringify(this.stats));
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state }, { ...this.stats });
    }
  }
}
