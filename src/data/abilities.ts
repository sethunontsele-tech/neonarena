import { WeaponType } from '../store';

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number; // in seconds
  type: 'tactical' | 'combat' | 'mobility' | 'ultimate';
  icon: string;
  risk?: number; // 0 to 1 probability of killing the player on use
  cutscene: {
    title: string;
    subtitle: string;
    animation: 'shake' | 'zoom' | 'flash' | 'matrix' | 'void' | 'inferno';
    color: string;
    duration: number; // ms
  };
}

export const WEAPON_ABILITIES: Record<string, Ability[]> = {
  pistol: [
    {
      id: 'p_tac',
      name: 'Smoke Grenade',
      description: 'Deploy a dense smoke screen to break enemy line of sight.',
      cooldown: 12,
      type: 'tactical',
      icon: 'wind',
      cutscene: { title: 'DEPLOYING SMOKE', subtitle: 'VISIBILITY REDUCTION ACTIVE', animation: 'flash', color: 'rgba(156,163,175,0.8)', duration: 1200 }
    },
    {
      id: 'p_com',
      name: 'Double Tap',
      description: 'Fire two high-velocity bullets in rapid succession.',
      cooldown: 5,
      type: 'combat',
      icon: 'zap',
      cutscene: { title: 'DOUBLE TAP', subtitle: 'WEAPON CYCLING ACCELERATED', animation: 'shake', color: 'rgba(245,158,11,0.8)', duration: 800 }
    },
    {
      id: 'p_mob',
      name: 'Tactical Slide',
      description: 'Slide forward, dodging incoming projectiles.',
      cooldown: 8,
      type: 'mobility',
      icon: 'chevrons-right',
      cutscene: { title: 'EVASIVE SLIDE', subtitle: 'FRICTION SCALERS ENGAGED', animation: 'zoom', color: 'rgba(59,130,246,0.8)', duration: 1000 }
    },
    {
      id: 'p_ult',
      name: 'Critical Meltdown',
      description: 'WARNING: Overcharges the tactical core. Massive AOE blast but 30% chance of terminal core failure (kills you).',
      cooldown: 30,
      type: 'ultimate',
      icon: 'skull',
      risk: 0.30,
      cutscene: { title: '⚠️ CORE OVERCHARGE ⚠️', subtitle: 'WARNING: 30% QUANTUM INSTABILITY CRITICAL MELTDOWN DETECTED', animation: 'inferno', color: 'rgba(239,68,68,0.95)', duration: 2500 }
    }
  ],
  smg: [
    {
      id: 'smg_tac',
      name: 'EMP Glitch',
      description: 'Release a short-range pulse that disables nearby enemy systems.',
      cooldown: 15,
      type: 'tactical',
      icon: 'wifi-off',
      cutscene: { title: 'EMP BURST', subtitle: 'LOCAL CHASSIS DISRUPTED', animation: 'matrix', color: 'rgba(236,72,153,0.8)', duration: 1500 }
    },
    {
      id: 'smg_com',
      name: 'Overclocked Spray',
      description: 'Double fire rate and bullet velocity for 4 seconds.',
      cooldown: 10,
      type: 'combat',
      icon: 'zap',
      cutscene: { title: 'OVERCLOCKING CORRIDORS', subtitle: 'MOTORIZED MAGAZINE ROTATOR: 200%', animation: 'shake', color: 'rgba(16,185,129,0.8)', duration: 1000 }
    },
    {
      id: 'smg_mob',
      name: 'Sprint Booster',
      description: 'Inject direct current into leg servos, gaining 60% speed for 3s.',
      cooldown: 12,
      type: 'mobility',
      icon: 'activity',
      cutscene: { title: 'SERVO OVERLOAD', subtitle: 'KINETIC ENERGY GAINS ENHANCED', animation: 'zoom', color: 'rgba(34,211,238,0.8)', duration: 1200 }
    },
    {
      id: 'smg_ult',
      name: 'Singularity Shift',
      description: 'Launches a black hole that pulls all matter in. 35% chance to collapse on you, destroying your timeline (kills you).',
      cooldown: 45,
      type: 'ultimate',
      icon: 'skull',
      risk: 0.35,
      cutscene: { title: '🌀 SINGULARITY EXPLOSION 🌀', subtitle: 'WARNING: CHANCE OF QUANTUM COLLAPSE AT PLAYER POSITION', animation: 'void', color: 'rgba(139,92,246,0.95)', duration: 3000 }
    }
  ],
  sword: [
    {
      id: 'sw_tac',
      name: 'Holographic Decoy',
      description: 'Create a flashing mirror decoy that draws enemy attacks.',
      cooldown: 15,
      type: 'tactical',
      icon: 'eye',
      cutscene: { title: 'HOLOGRAM GENERATED', subtitle: 'INTELLIGENT REFRACTION SYSTEM ON', animation: 'flash', color: 'rgba(52,211,153,0.8)', duration: 1200 }
    },
    {
      id: 'sw_com',
      name: 'Sonic Slash',
      description: 'A powerful heavy swing that creates an air-cutting shockwave.',
      cooldown: 6,
      type: 'combat',
      icon: 'sword',
      cutscene: { title: 'SONIC SLASH', subtitle: 'KINETIC shockwave unleashed', animation: 'shake', color: 'rgba(239,68,68,0.8)', duration: 900 }
    },
    {
      id: 'sw_mob',
      name: 'Blade Dash',
      description: 'Instantly dash forward 12 units, slashing all enemies in your path.',
      cooldown: 8,
      type: 'mobility',
      icon: 'zap',
      cutscene: { title: 'BLADE DASH', subtitle: 'SPEED SHIFT: FLASH STEP', animation: 'zoom', color: 'rgba(245,158,11,0.8)', duration: 1100 }
    },
    {
      id: 'sw_ult',
      name: 'Void Severance',
      description: 'Unleashes a rift in reality. Slash everything, but 40% chance of severing your own life thread (kills you).',
      cooldown: 40,
      type: 'ultimate',
      icon: 'skull',
      risk: 0.40,
      cutscene: { title: '🗡️ VOID SEVERANCE 🗡️', subtitle: 'COSMIC WARNING: 40% CHANCE OF TIMELINE INTERRUPT (SUDDEN DEATH)', animation: 'void', color: 'rgba(0,0,0,0.98)', duration: 2800 }
    }
  ]
};

// Generates fallback abilities dynamically so every single weapon in the database has 4 beautiful abilities!
export function getAbilitiesForWeapon(weaponId: string, name: string, category: string): Ability[] {
  if (WEAPON_ABILITIES[weaponId]) {
    return WEAPON_ABILITIES[weaponId];
  }

  const isMelee = category === 'melee';
  const isPotion = weaponId.includes('potion');

  return [
    {
      id: `${weaponId}_tac`,
      name: isPotion ? 'Flask Splash' : 'Chronos Distorter',
      description: isPotion 
        ? 'Splash components around you, leaving an area-of-effect aura.' 
        : 'Slightly slow down the flow of local time to dodge oncoming projectiles.',
      cooldown: 12,
      type: 'tactical',
      icon: 'shield',
      cutscene: { 
        title: isPotion ? 'CHEMICAL REACTION' : 'TIME DILATION', 
        subtitle: isPotion ? 'AURA DISTRIBUTOR ACTIVE' : 'QUANTUM CHRONO ENGINE COMMENCING', 
        animation: 'matrix', 
        color: 'rgba(16,185,129,0.7)', 
        duration: 1000 
      }
    },
    {
      id: `${weaponId}_com`,
      name: isPotion ? 'Catalyst Burst' : 'Overcharged Impact',
      description: isPotion 
        ? 'Consume concentrated salts to multiply the potion efficacy by 2.5x.' 
        : `Infuse the ${name} with voltage, increasing hit damage by 80%.`,
      cooldown: 6,
      type: 'combat',
      icon: 'zap',
      cutscene: { 
        title: isPotion ? 'CATALYTIC FUSION' : 'VOLTAGE PEAK', 
        subtitle: isPotion ? 'POTION POTENCY MULTIPLIED' : 'CRITICAL DAMAGE THRESHOLD PASSED', 
        animation: 'shake', 
        color: 'rgba(245,158,11,0.8)', 
        duration: 900 
      }
    },
    {
      id: `${weaponId}_mob`,
      name: isPotion ? 'Effervescent Vapor' : 'Aether Leap',
      description: isPotion 
        ? 'Ignite vapors underneath your boots to elevate 15 units high.' 
        : 'Defy standard gravity for a rapid vertical launch.',
      cooldown: 10,
      type: 'mobility',
      icon: 'chevrons-up',
      cutscene: { 
        title: isPotion ? 'GAS DETONATION' : 'AETHER PROPULSION', 
        subtitle: isPotion ? 'VAPOR ENVELOPE ACTIVATED' : 'GRAVITATIONAL SCALERS REMOVED', 
        animation: 'zoom', 
        color: 'rgba(34,211,238,0.7)', 
        duration: 1100 
      }
    },
    {
      id: `${weaponId}_ult`,
      name: isPotion ? 'Panacea Overdose' : 'Null-Space Resonance',
      description: isPotion
        ? 'WARNING: Instant total buff state. 42% risk of toxic collapse and complete cellular system failure (kills you).'
        : `WARNING: Unleashes maximum resonance of ${name}. 45% risk of fatal feedback loop (kills you).`,
      cooldown: 50,
      type: 'ultimate',
      icon: 'skull',
      risk: isPotion ? 0.42 : 0.45,
      cutscene: { 
        title: isPotion ? '⚠️ POTION OVERDOSE ⚠️' : '⚠️ TOTAL COMPRESSION ⚠️', 
        subtitle: `WARNING: ${isPotion ? '42% TOXIC OVERDOSE THRESHOLD EXCEEDED' : '45% FATAL FEEDBACK INSTABILITY REGISTERED'}`, 
        animation: 'inferno', 
        color: 'rgba(239,68,68,0.95)', 
        duration: 3000 
      }
    }
  ];
}
