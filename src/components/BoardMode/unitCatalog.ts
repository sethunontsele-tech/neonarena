import { UnitDefinition, ArtifactDefinition, BoardEnvironmentConfig, BoardSquadLoadout } from './types';

export const BOARD_ENVIRONMENTS: BoardEnvironmentConfig[] = [
  {
    id: 'floating_temple',
    name: 'Sanctuary of the Cloud Gods',
    themeColor: '#38bdf8',
    skyColor: '#0c4a6e',
    ambientLight: '#bae6fd',
    floorColor: '#1e293b',
    laneColor: '#38bdf8',
    weather: 'solar_mist',
    environmentalBonus: 'Air units receive +15% movement speed'
  },
  {
    id: 'volcanic_crater',
    name: 'Infernal Caldera of Ignis',
    themeColor: '#f97316',
    skyColor: '#450a0a',
    ambientLight: '#fdba74',
    floorColor: '#18181b',
    laneColor: '#ef4444',
    weather: 'ash_rain',
    environmentalBonus: 'Fire and melee attacks inflict burning damage'
  },
  {
    id: 'neon_citadel',
    name: 'Neo-Tokyo Cyber Matrix Grid',
    themeColor: '#06b6d4',
    skyColor: '#030712',
    ambientLight: '#a5f3fc',
    floorColor: '#09090b',
    laneColor: '#22d3ee',
    weather: 'neon_rain',
    environmentalBonus: 'Mana recharge speed accelerated by +20%'
  },
  {
    id: 'frozen_glacier',
    name: 'Frostfang Glacier Spire',
    themeColor: '#a7f3d0',
    skyColor: '#064e3b',
    ambientLight: '#d1fae5',
    floorColor: '#0f172a',
    laneColor: '#2dd4bf',
    weather: 'blizzard',
    environmentalBonus: 'Defensive structures have +30% armor'
  },
  {
    id: 'celestial_spires',
    name: 'Starlight Spire of Aethelgard',
    themeColor: '#e879f9',
    skyColor: '#2e1065',
    ambientLight: '#f5d0fe',
    floorColor: '#1e1b4b',
    laneColor: '#c084fc',
    weather: 'thunderstorm',
    environmentalBonus: 'Hero ultimate cooldowns reduced by 15%'
  },
  {
    id: 'enchanted_forest',
    name: 'Verdant Deepwood of the Sylphs',
    themeColor: '#4ade80',
    skyColor: '#052e16',
    ambientLight: '#bbf7d0',
    floorColor: '#14532d',
    laneColor: '#86efac',
    weather: 'clear',
    environmentalBonus: 'All units passively regenerate 1.5% HP per sec'
  }
];

export const BOARD_ARTIFACTS: ArtifactDefinition[] = [
  {
    id: 'orb_of_cataclysm',
    name: 'Orb of Cataclysm',
    rarity: 'legendary',
    description: 'Summons a devastating cosmic meteor storm impacting targeted lane for 450 AoE damage.',
    cooldown: 45,
    icon: 'Flame',
    color: '#ef4444',
    effectType: 'aoe_meteor',
    powerValue: 450
  },
  {
    id: 'chrono_hourglass',
    name: 'Chrono Hourglass',
    rarity: 'epic',
    description: 'Distorts the timeline, slowing all enemy movement and attack speed by 60% for 6 seconds.',
    cooldown: 35,
    icon: 'Hourglass',
    color: '#38bdf8',
    effectType: 'time_dilation',
    powerValue: 6
  },
  {
    id: 'aegis_of_the_colossus',
    name: 'Aegis of the Colossus',
    rarity: 'legendary',
    description: 'Envelops all allied units and towers in a crystal barrier shielding 350 damage.',
    cooldown: 40,
    icon: 'ShieldAlert',
    color: '#fbbf24',
    effectType: 'colossus_shield',
    powerValue: 350
  },
  {
    id: 'fountain_of_rejuvenation',
    name: 'Wellspring of Rejuvenation',
    rarity: 'rare',
    description: 'Floods the battlefield with restorative light, instantly healing all allies for 300 HP.',
    cooldown: 30,
    icon: 'HeartPulse',
    color: '#10b981',
    effectType: 'rejuvenation',
    powerValue: 300
  },
  {
    id: 'gale_boots_of_hermes',
    name: 'Gale Wind of Hermes',
    rarity: 'rare',
    description: 'Empowers allied squads with +80% movement velocity and unit phasing for rapid flanking.',
    cooldown: 25,
    icon: 'Wind',
    color: '#a855f7',
    effectType: 'gale_haste',
    powerValue: 8
  },
  {
    id: 'warlord_banner',
    name: 'Banner of the Warlord',
    rarity: 'epic',
    description: 'Plants a battlefield war banner granting nearby units +40% attack damage and lifesteal.',
    cooldown: 35,
    icon: 'Flag',
    color: '#f97316',
    effectType: 'warlord_banner',
    powerValue: 40
  },
  {
    id: 'stormcallers_horn',
    name: "Stormcaller's Lightning Horn",
    rarity: 'epic',
    description: 'Strikes the 5 highest-threat enemy units with fork lightning, stunning each for 2.5 seconds.',
    cooldown: 38,
    icon: 'Zap',
    color: '#eab308',
    effectType: 'storm_lightning',
    powerValue: 280
  },
  {
    id: 'summoners_grimoire',
    name: "Summoner's Grimoire",
    rarity: 'legendary',
    description: 'Tears open a void rift that spawns 4 Voidling skirmishers instantly onto any selected point.',
    cooldown: 42,
    icon: 'BookOpen',
    color: '#8b5cf6',
    effectType: 'void_summon',
    powerValue: 4
  }
];

// 50+ UNIQUE UNITS CATALOGUE
export const BOARD_UNITS: UnitDefinition[] = [
  // ================= HEROES (10) =================
  {
    id: 'hero_valerius',
    name: 'Lord Valerius',
    title: 'The Sun Champion',
    faction: 'celestial',
    role: 'Hero',
    isHero: true,
    manaCost: 7,
    tier: 5,
    hp: 1200,
    maxHp: 1200,
    damage: 135,
    attackSpeed: 1.1,
    range: 2.2,
    moveSpeed: 3.2,
    armor: 30,
    abilities: [
      { id: 'solar_smite', name: 'Solar Smite', description: 'Leaps and slams ground for 240 radiant AoE damage', cooldown: 8, radius: 4, damage: 240, icon: 'Sun' },
      { id: 'holy_bastion', name: 'Holy Bastion', description: 'Surrounds all nearby soldiers in invulnerable aura for 3s', cooldown: 18, radius: 6, buffDuration: 3, icon: 'Shield' }
    ],
    strengths: ['Massive durability', 'Empowers nearby soldiers', 'Crowd control stun'],
    weaknesses: ['Vulnerable to heavy kiting and air swarms'],
    description: 'Supreme Commander of the Celestial Vanguard. Carries the Radiant Blade of Dawn.',
    modelColor: '#fbbf24',
    emissiveColor: '#f59e0b',
    modelType: 'hero_paladin',
    upgradeBranches: [
      { id: 'valerius_a', name: 'Path of the Sun God', description: '+30% Smite damage and +250 HP', tier: 1, statBonus: { hp: 250, damage: 40 }, unlocked: true, costXP: 500 },
      { id: 'valerius_b', name: 'Bastion of Aegis', description: '+15 Armor and Bastion heals soldiers for 200 HP', tier: 1, statBonus: { armor: 15, hp: 150 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_morrigan',
    name: 'Morrigan Voidweaver',
    title: 'Matron of the Eclipse',
    faction: 'abyssal',
    role: 'Hero',
    isHero: true,
    manaCost: 7,
    tier: 5,
    hp: 850,
    maxHp: 850,
    damage: 165,
    attackSpeed: 0.9,
    range: 7.5,
    moveSpeed: 3.0,
    armor: 12,
    abilities: [
      { id: 'black_hole', name: 'Singularity Vortex', description: 'Pulls all enemies into a swirling void for 280 damage', cooldown: 14, radius: 7, damage: 280, icon: 'Disc' },
      { id: 'shadow_step', name: 'Shadow Step', description: 'Teleports to safety leaving behind a toxic decoy trap', cooldown: 10, radius: 3, icon: 'Ghost' }
    ],
    strengths: ['Devastating long-range AoE', 'Clumping enemies for cluster strikes'],
    weaknesses: ['Low health pool', 'Assassins with quick gap closers'],
    description: 'Ancient dark sorceress channeling the crushing gravitational forces of dead cosmos.',
    modelColor: '#9333ea',
    emissiveColor: '#c084fc',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'morrigan_a', name: 'Cosmic Singularity', description: '+50% Vortex pull radius and +60 damage', tier: 1, statBonus: { damage: 60, range: 1.5 }, unlocked: true, costXP: 500 },
      { id: 'morrigan_b', name: 'Void Shielding', description: 'Gains 40% spell vamp and +200 HP', tier: 1, statBonus: { hp: 200, armor: 10 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_sigma',
    name: 'Cyber-Valkyrie Sigma',
    title: 'Aero-Nanite Strikeframe',
    faction: 'cyber_sentinel',
    role: 'Hero',
    isHero: true,
    isFlying: true,
    manaCost: 8,
    tier: 5,
    hp: 980,
    maxHp: 980,
    damage: 150,
    attackSpeed: 1.4,
    range: 5.5,
    moveSpeed: 4.8,
    armor: 22,
    abilities: [
      { id: 'laser_barrage', name: 'Plasma Rain', description: 'Fires salvo of 12 micro-missiles tracking enemy units', cooldown: 9, radius: 5, damage: 320, icon: 'Crosshair' },
      { id: 'supersonic_dive', name: 'Kinetic Slam', description: 'Dives from high altitude shattering frontlines', cooldown: 15, radius: 4.5, damage: 210, icon: 'Zap' }
    ],
    strengths: ['Extreme mobility', 'Ignores ground terrain & river obstacles', 'Burst fire'],
    weaknesses: ['Anti-air snipers and towers'],
    description: 'Experimental aerial cyber-combat drone chassis piloted by an ascended AI war mind.',
    modelColor: '#06b6d4',
    emissiveColor: '#22d3ee',
    modelType: 'hero_valkyrie',
    upgradeBranches: [
      { id: 'sigma_a', name: 'Overcharged Thrusters', description: '+30% flight speed and missiles apply burn', tier: 1, statBonus: { speed: 1.2, damage: 35 }, unlocked: true, costXP: 500 },
      { id: 'sigma_b', name: 'Hardlight Plating', description: '+250 HP and +15 Armor against ranged shots', tier: 1, statBonus: { hp: 250, armor: 15 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_ignis',
    name: 'Ignis Embercaller',
    title: 'The Primordial Flame',
    faction: 'primal_beast',
    role: 'Hero',
    isHero: true,
    manaCost: 6,
    tier: 4,
    hp: 1100,
    maxHp: 1100,
    damage: 140,
    attackSpeed: 1.0,
    range: 3.0,
    moveSpeed: 3.3,
    armor: 25,
    abilities: [
      { id: 'magma_pillar', name: 'Magma Eruption', description: 'Summons erupting volcanic geyser knocking up foes', cooldown: 10, radius: 4, damage: 220, icon: 'Flame' },
      { id: 'fire_frenzy', name: 'Infernal Roar', description: 'Boosts attack speed of all allied units by 45%', cooldown: 16, radius: 8, buffDuration: 6, icon: 'Volume2' }
    ],
    strengths: ['Enormous lane pressure', 'Teamwide attack speed buff'],
    weaknesses: ['Cryo towers and freezing attacks'],
    description: 'Born in the molten heart of an ancient caldera, Ignis incinerates any who stand before him.',
    modelColor: '#ea580c',
    emissiveColor: '#f97316',
    modelType: 'hero_warrior',
    upgradeBranches: [
      { id: 'ignis_a', name: 'Pyroclastic Core', description: '+40% Magma radius and ground remains on fire', tier: 1, statBonus: { damage: 45 }, unlocked: true, costXP: 500 },
      { id: 'ignis_b', name: 'Molten Hide', description: 'Reflects 20% incoming melee damage back to attackers', tier: 1, statBonus: { hp: 200, armor: 12 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_lyra',
    name: 'Queen Lyra',
    title: 'Sylph Archer Queen',
    faction: 'sylph_nature',
    role: 'Hero',
    isHero: true,
    manaCost: 6,
    tier: 4,
    hp: 780,
    maxHp: 780,
    damage: 175,
    attackSpeed: 1.5,
    range: 8.5,
    moveSpeed: 3.6,
    armor: 10,
    abilities: [
      { id: 'arrow_tempest', name: 'Arrow Tempest', description: 'Showers 30 piercing arrows shredding enemy armor', cooldown: 11, radius: 6, damage: 310, icon: 'Target' },
      { id: 'wind_whisper', name: 'Camouflage Veil', description: 'Cloaks Lyra and nearby rangers for 5 seconds', cooldown: 20, radius: 5, buffDuration: 5, icon: 'EyeOff' }
    ],
    strengths: ['Highest single-target range', 'Sniper tower destruction'],
    weaknesses: ['Melee diving champions', 'Heavy tanks with shields'],
    description: 'Monarch of the Whispering Boughs, unmatched sniper capable of piercing mountain stone.',
    modelColor: '#22c55e',
    emissiveColor: '#4ade80',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'lyra_a', name: 'Falcon Eye', description: '+2.0 range and critical hits pierce lines', tier: 1, statBonus: { range: 2.0, damage: 35 }, unlocked: true, costXP: 500 },
      { id: 'lyra_b', name: 'Nature Grace', description: '+20% movement speed and arrows poison targets', tier: 1, statBonus: { speed: 0.8, hp: 120 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_thorin',
    name: 'Thorin Stoneheart',
    title: 'Iron Fortress Thane',
    faction: 'ironbound',
    role: 'Hero',
    isHero: true,
    manaCost: 7,
    tier: 5,
    hp: 1450,
    maxHp: 1450,
    damage: 115,
    attackSpeed: 0.8,
    range: 2.0,
    moveSpeed: 2.7,
    armor: 45,
    abilities: [
      { id: 'ground_slam', name: 'Tectonic Quake', description: 'Stuns all enemies in front for 2.8 seconds', cooldown: 12, radius: 4.5, damage: 180, icon: 'Activity' },
      { id: 'iron_fortress', name: 'Unbreakable Stance', description: 'Reduces all incoming damage by 70% for 5s', cooldown: 22, radius: 2, buffDuration: 5, icon: 'Shield' }
    ],
    strengths: ['Ultimate meat shield', 'Long duration stuns', 'Anti-burst frontline'],
    weaknesses: ['Slow movement speed', 'Vulnerable to percent-health burns'],
    description: 'Dwarven High King clad in impenetrable runic adamantine armor.',
    modelColor: '#64748b',
    emissiveColor: '#94a3b8',
    modelType: 'hero_paladin',
    upgradeBranches: [
      { id: 'thorin_a', name: 'Rune of Thorns', description: 'Deals 50 damage/sec to all adjacent enemies', tier: 1, statBonus: { damage: 30, hp: 200 }, unlocked: true, costXP: 500 },
      { id: 'thorin_b', name: 'Adamant Wall', description: '+20 Armor and immunity to knockbacks', tier: 1, statBonus: { armor: 20, hp: 300 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_malakor',
    name: 'Malakor the Betrayer',
    title: 'Dread Void Berserker',
    faction: 'abyssal',
    role: 'Hero',
    isHero: true,
    manaCost: 6,
    tier: 4,
    hp: 1050,
    maxHp: 1050,
    damage: 185,
    attackSpeed: 1.3,
    range: 2.2,
    moveSpeed: 3.8,
    armor: 18,
    abilities: [
      { id: 'blood_reap', name: 'Soul Siphon', description: 'Spinning scythe strike draining 40% damage dealt as HP', cooldown: 9, radius: 3.5, damage: 260, icon: 'Skull' },
      { id: 'abyssal_dash', name: 'Void Cleave', description: 'Dashes through enemy squad cutting their armor in half', cooldown: 13, radius: 5, damage: 190, icon: 'FastForward' }
    ],
    strengths: ['Incredible sustain in group combat', 'Assassinates enemy squishies'],
    weaknesses: ['Hard crowd control and stuns'],
    description: 'A fallen warrior infused with the blood of dark wyrms, thriving on the agony of war.',
    modelColor: '#701a75',
    emissiveColor: '#d946ef',
    modelType: 'hero_warrior',
    upgradeBranches: [
      { id: 'malakor_a', name: 'Thirst for Carnage', description: '+40% Attack speed when below 50% HP', tier: 1, statBonus: { damage: 45, speed: 0.5 }, unlocked: true, costXP: 500 },
      { id: 'malakor_b', name: 'Wraith Armor', description: 'Gains 30% dodge chance against ranged projectiles', tier: 1, statBonus: { hp: 220, armor: 10 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_kaelen',
    name: 'Kaelen Windstrider',
    title: 'Blade of the Zephyr',
    faction: 'arcane_order',
    role: 'Hero',
    isHero: true,
    manaCost: 5,
    tier: 4,
    hp: 920,
    maxHp: 920,
    damage: 155,
    attackSpeed: 1.6,
    range: 2.4,
    moveSpeed: 4.4,
    armor: 15,
    abilities: [
      { id: 'wind_slash', name: 'Sonic Flurry', description: 'Teleports between 4 targets slicing each instantly', cooldown: 10, radius: 6, damage: 290, icon: 'Zap' },
      { id: 'cyclone_barrier', name: 'Cyclone Deflection', description: 'Deflects 100% of enemy projectile missiles back', cooldown: 16, radius: 3.5, buffDuration: 3.5, icon: 'RotateCw' }
    ],
    strengths: ['Unrivaled mobility and ranged projectile counter', 'Rapid lane switching'],
    weaknesses: ['High armor heavy colossi'],
    description: 'Master sword-saint who dances upon tempest winds, splitting raindrops with his katana.',
    modelColor: '#0ea5e9',
    emissiveColor: '#38bdf8',
    modelType: 'hero_warrior',
    upgradeBranches: [
      { id: 'kaelen_a', name: 'Storm Blade', description: 'Sonic Flurry strikes 2 additional targets', tier: 1, statBonus: { damage: 40, speed: 0.6 }, unlocked: true, costXP: 500 },
      { id: 'kaelen_b', name: 'Gale Armor', description: '+200 HP and attacks increase movement speed', tier: 1, statBonus: { hp: 200, armor: 10 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_astraea',
    name: 'Astraea Starweaver',
    title: 'Oracle of the Cosmos',
    faction: 'celestial',
    role: 'Hero',
    isHero: true,
    manaCost: 6,
    tier: 4,
    hp: 820,
    maxHp: 820,
    damage: 110,
    attackSpeed: 1.1,
    range: 7.0,
    moveSpeed: 3.1,
    armor: 14,
    abilities: [
      { id: 'starlight_heal', name: 'Cosmic Blessing', description: 'Heals all nearby allies for 320 HP and cleanses debuffs', cooldown: 12, radius: 7, heal: 320, icon: 'Sparkles' },
      { id: 'supernova_stasis', name: 'Starlight Stasis', description: 'Freezes target enemy hero or tower in stasis for 4s', cooldown: 20, radius: 8, icon: 'Lock' }
    ],
    strengths: ['Game-changing clutch healing', 'Freezing enemy towers for dive pushes'],
    weaknesses: ['Poor solo duel damage'],
    description: 'Celestial oracle who reads the constellations and weaves strands of restorative starlight.',
    modelColor: '#ec4899',
    emissiveColor: '#f472b6',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'astraea_a', name: 'Celestial Zenith', description: 'Blessing also grants +25% attack damage for 6s', tier: 1, statBonus: { hp: 150, range: 1.0 }, unlocked: true, costXP: 500 },
      { id: 'astraea_b', name: 'Nova Aegis', description: 'Whenever attacked, unleashes a blinding flash stunning foes', tier: 1, statBonus: { hp: 250, armor: 15 }, unlocked: false, costXP: 500 }
    ]
  },
  {
    id: 'hero_drakon',
    name: 'Drakon Dragonheart',
    title: 'High Scion of Wyrms',
    faction: 'dragonkin',
    role: 'Hero',
    isHero: true,
    manaCost: 8,
    tier: 5,
    hp: 1350,
    maxHp: 1350,
    damage: 160,
    attackSpeed: 1.0,
    range: 3.2,
    moveSpeed: 3.4,
    armor: 32,
    abilities: [
      { id: 'wyrm_breath', name: 'Dragon Breath', description: 'Channels a cone of intense fire dealing 380 continuous damage', cooldown: 9, radius: 6, damage: 380, icon: 'Flame' },
      { id: 'draconic_ascension', name: 'Wings of Fire', description: 'Gains flight and +50% attack power for 8 seconds', cooldown: 24, radius: 2, buffDuration: 8, icon: 'Feather' }
    ],
    strengths: ['Massive health and AoE incinerate', 'Hybrid ground & flying titan'],
    weaknesses: ['Expensive mana cost'],
    description: 'Half-man, half-elder dragon, bearing molten scales and ancient draconic fury.',
    modelColor: '#b91c1c',
    emissiveColor: '#dc2626',
    modelType: 'hero_dragonkin',
    upgradeBranches: [
      { id: 'drakon_a', name: 'Elder Fire', description: 'Dragon Breath melts 30% of target armor', tier: 1, statBonus: { damage: 55 }, unlocked: true, costXP: 500 },
      { id: 'drakon_b', name: 'Volcanic Scales', description: '+300 HP and immunity to freeze effects', tier: 1, statBonus: { hp: 300, armor: 12 }, unlocked: false, costXP: 500 }
    ]
  },

  // ================= SOLDIERS & SWARMS (8) =================
  {
    id: 'soldier_neon_footman',
    name: 'Neon Vanguard Footman',
    title: 'Core Infantry',
    faction: 'cyber_sentinel',
    role: 'Soldier',
    isHero: false,
    manaCost: 2,
    tier: 1,
    hp: 380,
    maxHp: 380,
    damage: 42,
    attackSpeed: 1.2,
    range: 1.8,
    moveSpeed: 3.2,
    armor: 15,
    abilities: [],
    strengths: ['Cheap mana cost', 'Fast deployment', 'Solid lane pressure in groups'],
    weaknesses: ['AoE magic', 'Flying dragons'],
    description: 'Standard issue frontline cyborg infantry equipped with energy shields and vibrating vibro-swords.',
    modelColor: '#38bdf8',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'footman_a', name: 'Reinforced Alloys', description: '+120 HP and +8 Armor', tier: 1, statBonus: { hp: 120, armor: 8 }, unlocked: true, costXP: 200 },
      { id: 'footman_b', name: 'Plasma Edge', description: '+20 Attack damage per strike', tier: 1, statBonus: { damage: 20 }, unlocked: false, costXP: 200 }
    ]
  },
  {
    id: 'soldier_arcane_swordsman',
    name: 'Arcane Blade Initiate',
    title: 'Spell-Infused Duelist',
    faction: 'arcane_order',
    role: 'Soldier',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 420,
    maxHp: 420,
    damage: 55,
    attackSpeed: 1.3,
    range: 1.9,
    moveSpeed: 3.4,
    armor: 12,
    abilities: [
      { id: 'mystic_strike', name: 'Mystic Blade', description: 'Deals bonus 50 magic damage on every 3rd strike', cooldown: 4, radius: 2, damage: 50, icon: 'Zap' }
    ],
    strengths: ['Bypasses heavy physical armor', 'Balanced speed and damage'],
    weaknesses: ['Silence debuffs', 'Ranged kite'],
    description: 'Scholars of the Mystic Citadel who enchant their dual blades with ethereal sapphire fire.',
    modelColor: '#818cf8',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'arcane_a', name: 'Mana Cleave', description: 'Attacks hit all adjacent foes', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 250 },
      { id: 'arcane_b', name: 'Ward Cloak', description: '+150 HP and 25% magic resistance', tier: 1, statBonus: { hp: 150, armor: 10 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'soldier_skeleton_horde',
    name: 'Cursed Skeleton Swarm',
    title: 'Endless Undead Legion',
    faction: 'abyssal',
    role: 'Soldier',
    isHero: false,
    manaCost: 2,
    tier: 1,
    hp: 220,
    maxHp: 220,
    damage: 34,
    attackSpeed: 1.4,
    range: 1.6,
    moveSpeed: 3.5,
    armor: 5,
    abilities: [],
    strengths: ['Spawns in packs of 4', 'Overwhelms single-target snipers'],
    weaknesses: ['Meteor storms', 'AoE spells'],
    description: 'Resurrected skeletons marching in synchronized cadence, seeking to drown opponents in bone and rust.',
    modelColor: '#e2e8f0',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'skel_a', name: 'Bone Spikes', description: 'Explodes for 60 AoE damage on death', tier: 1, statBonus: { damage: 15 }, unlocked: true, costXP: 200 },
      { id: 'skel_b', name: 'Grave Resurgence', description: '+60 HP and 15% chance to revive once', tier: 1, statBonus: { hp: 60 }, unlocked: false, costXP: 200 }
    ]
  },
  {
    id: 'soldier_royal_pikemen',
    name: 'Sun Guard Pikeman',
    title: 'Anti-Cavalry Guard',
    faction: 'celestial',
    role: 'Soldier',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 460,
    maxHp: 460,
    damage: 58,
    attackSpeed: 1.0,
    range: 3.2,
    moveSpeed: 3.0,
    armor: 20,
    abilities: [],
    strengths: ['Deals 200% bonus damage to Fast and Mount units', 'Extra melee reach'],
    weaknesses: ['Ranged snipers'],
    description: 'Disciplined warriors bearing long golden spears that halt galloping beasts and beasts of war.',
    modelColor: '#facc15',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'pike_a', name: 'Phalanx Brace', description: '+180 HP when standing close to other pikemen', tier: 1, statBonus: { hp: 180, armor: 10 }, unlocked: true, costXP: 250 },
      { id: 'pike_b', name: 'Sun Glaive', description: '+25 Damage and pierce through first target', tier: 1, statBonus: { damage: 25, range: 0.5 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'soldier_goblin_prowler',
    name: 'Shadow Goblin Cutpurse',
    title: 'Agile Skirmisher',
    faction: 'primal_beast',
    role: 'Soldier',
    isHero: false,
    manaCost: 1,
    tier: 1,
    hp: 190,
    maxHp: 190,
    damage: 38,
    attackSpeed: 1.7,
    range: 1.5,
    moveSpeed: 4.6,
    armor: 4,
    abilities: [],
    strengths: ['Cheapest unit in game', 'Extremely fast split pusher'],
    weaknesses: ['Easily eliminated by any defensive tower'],
    description: 'Scrappy and frenzied scavengers that sneak down unmonitored lanes to chip away at enemy towers.',
    modelColor: '#84cc16',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'gob_a', name: 'Poison Dagger', description: 'Attacks slow target movement by 30%', tier: 1, statBonus: { speed: 0.5 }, unlocked: true, costXP: 150 },
      { id: 'gob_b', name: 'Scavenger Greed', description: 'Refunds 1 Mana when destroying an enemy unit', tier: 1, statBonus: { damage: 15 }, unlocked: false, costXP: 150 }
    ]
  },
  {
    id: 'soldier_shadow_ninja',
    name: 'Kage Shadow Shinobi',
    title: 'Silent Assassin',
    faction: 'abyssal',
    role: 'Soldier',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 410,
    maxHp: 410,
    damage: 85,
    attackSpeed: 1.5,
    range: 1.8,
    moveSpeed: 4.5,
    armor: 10,
    abilities: [
      { id: 'smoke_teleport', name: 'Shadow Dash', description: 'Teleports behind the highest damage enemy in range', cooldown: 8, radius: 6, damage: 110, icon: 'Wind' }
    ],
    strengths: ['Instantly assassinates backline support and mages'],
    weaknesses: ['High armor tanks with taunt'],
    description: 'Cloaked in midnight mist, the Shinobi bypasses frontlines entirely to strike at the commander.',
    modelColor: '#334155',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'ninja_a', name: 'Death Blossom', description: 'Throws 3 shurikens dealing 70 damage each', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 300 },
      { id: 'ninja_b', name: 'Ghost Cloak', description: 'Invisible until first attack, deals +100% crit', tier: 1, statBonus: { speed: 0.6, hp: 80 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'soldier_dwarf_berserker',
    name: 'Ironbound Berserker',
    title: 'Rage Axeman',
    faction: 'ironbound',
    role: 'Soldier',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 540,
    maxHp: 540,
    damage: 64,
    attackSpeed: 1.1,
    range: 1.8,
    moveSpeed: 3.1,
    armor: 18,
    abilities: [],
    strengths: ['Gains attack speed as HP decreases', 'Fearless brawler'],
    weaknesses: ['Ranged kiting'],
    description: 'Dual-axe wielding berserkers who view death as the highest honor in the halls of stone.',
    modelColor: '#b45309',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'berserk_a', name: 'Blood Rage', description: 'Gains up to +80% attack speed at low HP', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 250 },
      { id: 'berserk_b', name: 'Iron Skull', description: '+160 HP and stuns on critical hits', tier: 1, statBonus: { hp: 160, armor: 8 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'soldier_sylph_warden',
    name: 'Sylph Thorn Warden',
    title: 'Guardian of the Glade',
    faction: 'sylph_nature',
    role: 'Soldier',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 490,
    maxHp: 490,
    damage: 50,
    attackSpeed: 1.1,
    range: 2.1,
    moveSpeed: 3.3,
    armor: 16,
    abilities: [
      { id: 'root_thorns', name: 'Entangling Roots', description: 'Roots target in place for 2 seconds', cooldown: 9, radius: 3, icon: 'Anchor' }
    ],
    strengths: ['Locks down fast cavalry and diving assassins'],
    weaknesses: ['Fire and magma attacks'],
    description: 'Armored in living oak bark and brambles, rooting intruders into the soil.',
    modelColor: '#15803d',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'warden_a', name: 'Ironwood Bark', description: '+200 HP and +10 Armor', tier: 1, statBonus: { hp: 200, armor: 10 }, unlocked: true, costXP: 250 },
      { id: 'warden_b', name: 'Thorny Retribution', description: 'Returns 30 damage to melee attackers', tier: 1, statBonus: { damage: 20 }, unlocked: false, costXP: 250 }
    ]
  },

  // ================= MYTHICAL & MAGICAL CREATURES (8) =================
  {
    id: 'creature_fire_drake',
    name: 'Infernal Fire Drake',
    title: 'Lesser Dragon of Cinders',
    faction: 'dragonkin',
    role: 'Flying',
    isHero: false,
    isFlying: true,
    manaCost: 6,
    tier: 4,
    hp: 880,
    maxHp: 880,
    damage: 125,
    attackSpeed: 1.0,
    range: 4.5,
    moveSpeed: 4.2,
    armor: 20,
    abilities: [
      { id: 'fire_strafe', name: 'Scorching Run', description: 'Flies over a line carpet-bombing flame for 180 damage', cooldown: 12, radius: 5, damage: 180, icon: 'Flame' }
    ],
    strengths: ['Flies over defensive walls and barriers', 'Devastating ground AoE'],
    weaknesses: ['Longbow snipers and high-range turrets'],
    description: 'Winged terror spewing liquid napalm from above, clearing clusters of soldiers with ease.',
    modelColor: '#dc2626',
    modelType: 'creature_dragon',
    upgradeBranches: [
      { id: 'drake_a', name: 'Blazing Napalm', description: 'Fire lingers on ground for 5s dealing damage over time', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 400 },
      { id: 'drake_b', name: 'Scales of Ignis', description: '+220 HP and +12 Armor against arrows', tier: 1, statBonus: { hp: 220, armor: 12 }, unlocked: false, costXP: 400 }
    ]
  },
  {
    id: 'creature_frost_wyvern',
    name: 'Frostfang Wyvern',
    title: 'Glacial Skystalker',
    faction: 'celestial',
    role: 'Flying',
    isHero: false,
    isFlying: true,
    manaCost: 5,
    tier: 4,
    hp: 820,
    maxHp: 820,
    damage: 105,
    attackSpeed: 1.1,
    range: 4.8,
    moveSpeed: 4.0,
    armor: 18,
    abilities: [
      { id: 'frost_cone', name: 'Blizzard Breath', description: 'Freezes enemies in a cone slowing attack speed by 50%', cooldown: 8, radius: 5, damage: 130, icon: 'Snowflake' }
    ],
    strengths: ['Disables fast assault squads', 'Slows enemy pushes'],
    weaknesses: ['Heavy armor anti-air ballistas'],
    description: 'Glides upon sub-zero thermals, chilling foes until their weapons freeze to their palms.',
    modelColor: '#0284c7',
    modelType: 'creature_dragon',
    upgradeBranches: [
      { id: 'wyvern_a', name: 'Absolute Zero', description: 'Freezes targets completely for 1.8s', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 350 },
      { id: 'wyvern_b', name: 'Permafrost Hide', description: '+200 HP and reflects 15% ranged damage', tier: 1, statBonus: { hp: 200, armor: 10 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'creature_thunder_griffin',
    name: 'Stormclaw Griffin',
    title: 'Avian Thunderbolt',
    faction: 'celestial',
    role: 'Flying',
    isHero: false,
    isFlying: true,
    manaCost: 5,
    tier: 3,
    hp: 760,
    maxHp: 760,
    damage: 115,
    attackSpeed: 1.3,
    range: 2.2,
    moveSpeed: 4.7,
    armor: 16,
    abilities: [
      { id: 'dive_bomb', name: 'Lightning Dive', description: 'Dives from clouds causing shockwave stunning primary target', cooldown: 10, radius: 3, damage: 190, icon: 'Zap' }
    ],
    strengths: ['High dive burst damage', 'Intercepts enemy flying units in dogfights'],
    weaknesses: ['Grouped anti-air archers'],
    description: 'Majestic half-lion, half-eagle beast with talons conducting thousand-volt arc lightning.',
    modelColor: '#eab308',
    modelType: 'creature_griffin',
    upgradeBranches: [
      { id: 'griff_a', name: 'Chain Voltage', description: 'Lightning bounces to 2 extra nearby targets', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 350 },
      { id: 'griff_b', name: 'Aegis Wings', description: '+180 HP and +20% flight velocity', tier: 1, statBonus: { hp: 180, speed: 0.8 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'creature_chimera',
    name: 'Eldritch Chimera',
    title: 'Tri-Headed Terror',
    faction: 'primal_beast',
    role: 'Heavy',
    isHero: false,
    manaCost: 6,
    tier: 4,
    hp: 1150,
    maxHp: 1150,
    damage: 120,
    attackSpeed: 1.2,
    range: 2.4,
    moveSpeed: 3.3,
    armor: 24,
    abilities: [
      { id: 'venom_tail', name: 'Serpent Sting', description: 'Infects target with deadly venom dealing 160 poison damage', cooldown: 7, radius: 2.5, damage: 160, icon: 'Droplets' }
    ],
    strengths: ['Extremely versatile', 'Inflicts poison, fire, and physical tear simultaneously'],
    weaknesses: ['High single-target DPS heroes'],
    description: 'Horrific amalgamation of lion, goat, and dragon, capable of devouring an entire platoon.',
    modelColor: '#854d0e',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'chim_a', name: 'Triple Roar', description: 'Fears all nearby soldiers for 2 seconds', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 400 },
      { id: 'chim_b', name: 'Thickened Hide', description: '+260 HP and +14 Armor', tier: 1, statBonus: { hp: 260, armor: 14 }, unlocked: false, costXP: 400 }
    ]
  },
  {
    id: 'creature_spectral_hydra',
    name: 'Abyssal Hydra',
    title: 'Nine-Headed Serpent',
    faction: 'abyssal',
    role: 'Heavy',
    isHero: false,
    manaCost: 7,
    tier: 5,
    hp: 1300,
    maxHp: 1300,
    damage: 90,
    attackSpeed: 1.6,
    range: 3.0,
    moveSpeed: 2.8,
    armor: 22,
    abilities: [
      { id: 'hydra_regrow', name: 'Regrowth', description: 'Gains +15% damage each time it drops below 75%, 50%, and 25% HP', cooldown: 0, radius: 1, icon: 'RefreshCw' }
    ],
    strengths: ['Becomes deadlier as it takes damage', 'Multi-target strikes'],
    weaknesses: ['Cramped chokepoints', 'Bursts that eliminate it before regeneration'],
    description: 'Lurking beneath murky marshes, its severed heads only multiply into an ocean of fangs.',
    modelColor: '#4c1d95',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'hydra_a', name: 'Noxious Spittle', description: 'Attacks spray acid melting 20 armor', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 450 },
      { id: 'hydra_b', name: 'Immortal Flesh', description: 'Regenerates 40 HP per second constantly', tier: 1, statBonus: { hp: 300, armor: 10 }, unlocked: false, costXP: 450 }
    ]
  },
  {
    id: 'creature_phoenix',
    name: 'Solar Phoenix',
    title: 'Rebirth Aviator',
    faction: 'celestial',
    role: 'Flying',
    isHero: false,
    isFlying: true,
    manaCost: 7,
    tier: 5,
    hp: 920,
    maxHp: 920,
    damage: 130,
    attackSpeed: 1.1,
    range: 5.0,
    moveSpeed: 4.4,
    armor: 15,
    abilities: [
      { id: 'reincarnation', name: 'Rebirth in Ash', description: 'Upon dying, turns into an egg that revives with full HP after 5s if not destroyed', cooldown: 60, radius: 3, icon: 'Egg' }
    ],
    strengths: ['Revive passive', 'Unmatched resilience in extended lane wars'],
    weaknesses: ['Egg can be focused and broken before rebirth'],
    description: 'Sacred bird woven of stellar plasma. Its plumage blazes with immortal dawn.',
    modelColor: '#f59e0b',
    modelType: 'creature_dragon',
    upgradeBranches: [
      { id: 'phoenix_a', name: 'Supernova Explosion', description: 'Egg emits 200 fire damage per second to nearby foes', tier: 1, statBonus: { damage: 40 }, unlocked: true, costXP: 450 },
      { id: 'phoenix_b', name: 'Healing Plumage', description: 'Passively heals all nearby allied flyers for 60 HP/s', tier: 1, statBonus: { hp: 220 }, unlocked: false, costXP: 450 }
    ]
  },
  {
    id: 'creature_basilisk',
    name: 'Petrifying Basilisk',
    title: 'Gaze of Granite',
    faction: 'primal_beast',
    role: 'AreaControl',
    isHero: false,
    manaCost: 5,
    tier: 3,
    hp: 840,
    maxHp: 840,
    damage: 75,
    attackSpeed: 0.9,
    range: 3.5,
    moveSpeed: 3.0,
    armor: 28,
    abilities: [
      { id: 'stone_gaze', name: 'Petrifying Glare', description: 'Turns enemies facing it into stone for 3 seconds', cooldown: 13, radius: 5, icon: 'Eye' }
    ],
    strengths: ['Disables massive clusters of enemy troops'],
    weaknesses: ['Attacks from behind (Flanking maneuvers)'],
    description: 'Reptilian monster whose ocular beam calcifies flesh into brittle cobblestone.',
    modelColor: '#047857',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'bas_a', name: 'Granite Shatter', description: 'Attacking petrified foes deals 150 bonus damage', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 350 },
      { id: 'bas_b', name: 'Mirror Scale', description: '+220 HP and +15 Armor', tier: 1, statBonus: { hp: 220, armor: 15 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'creature_void_manticore',
    name: 'Void Manticore',
    title: 'Apex Stalker',
    faction: 'abyssal',
    role: 'Fast',
    isHero: false,
    manaCost: 5,
    tier: 4,
    hp: 860,
    maxHp: 860,
    damage: 110,
    attackSpeed: 1.3,
    range: 2.3,
    moveSpeed: 4.6,
    armor: 18,
    abilities: [
      { id: 'spike_volley', name: 'Quill Barrage', description: 'Launches poisonous quills at 4 enemies in range', cooldown: 8, radius: 6, damage: 140, icon: 'ArrowUpRight' }
    ],
    strengths: ['Hybrid melee pounce with ranged quill burst', 'Fast flanking hunter'],
    weaknesses: ['Shield-wall formations with high armor'],
    description: 'A terrifying predator possessing the wings of a bat, body of a lion, and tail of barbed stingers.',
    modelColor: '#581c87',
    modelType: 'creature_wolf',
    upgradeBranches: [
      { id: 'man_a', name: 'Paralytic Toxin', description: 'Quills slow targets by 50% for 4 seconds', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 350 },
      { id: 'man_b', name: 'Shadow Predator', description: '+200 HP and +0.6 movement speed', tier: 1, statBonus: { hp: 200, speed: 0.6 }, unlocked: false, costXP: 350 }
    ]
  },

  // ================= RANGED UNITS (6) =================
  {
    id: 'ranged_sylph_longbow',
    name: 'Sylph Elite Longbowman',
    title: 'Precision Marksman',
    faction: 'sylph_nature',
    role: 'Ranged',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 310,
    maxHp: 310,
    damage: 68,
    attackSpeed: 1.2,
    range: 7.2,
    moveSpeed: 3.3,
    armor: 8,
    abilities: [],
    strengths: ['Outranges defensive towers from safe perimeter', 'High DPS from backline'],
    weaknesses: ['Melee diving assassins'],
    description: 'Equipped with enchanted yew bows, their arrows whistle like autumn winds before striking true.',
    modelColor: '#16a34a',
    modelType: 'soldier_archer',
    upgradeBranches: [
      { id: 'bow_a', name: 'Eagle Eye', description: '+1.5 range and arrows pierce through 1 target', tier: 1, statBonus: { range: 1.5, damage: 20 }, unlocked: true, costXP: 250 },
      { id: 'bow_b', name: 'Windstep Boots', description: '+100 HP and retreats quickly if an enemy closes in', tier: 1, statBonus: { hp: 100, speed: 0.6 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'ranged_cyber_sniper',
    name: 'Cyber-Rifle Railgunner',
    title: 'High-Velocity Anti-Materiel',
    faction: 'cyber_sentinel',
    role: 'Ranged',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 340,
    maxHp: 340,
    damage: 135,
    attackSpeed: 0.6,
    range: 8.8,
    moveSpeed: 2.8,
    armor: 10,
    abilities: [
      { id: 'emp_round', name: 'EMP Cartridge', description: 'Deals 220 damage to enemy structures or cyber units and disables them for 2s', cooldown: 12, radius: 2, damage: 220, icon: 'Radio' }
    ],
    strengths: ['Extreme structure siege damage', 'Shreds high-armor behemoths'],
    weaknesses: ['Very slow rate of fire', 'Swarmed easily by skeletons'],
    description: 'Specialist wielding an electromagnetic rail accelerator capable of puncturing fortress gates.',
    modelColor: '#0284c7',
    modelType: 'soldier_archer',
    upgradeBranches: [
      { id: 'sniper_a', name: 'Hypercharge Capacitor', description: '+40 Damage and shots explode on impact', tier: 1, statBonus: { damage: 40 }, unlocked: true, costXP: 300 },
      { id: 'sniper_b', name: 'Stealth Cloak', description: 'Gains 4s invisibility after remaining still for 3s', tier: 1, statBonus: { hp: 90, range: 1.0 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'ranged_arcane_pyromancer',
    name: 'Arcane Pyromancer',
    title: 'Firestorm Channeler',
    faction: 'arcane_order',
    role: 'Ranged',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 360,
    maxHp: 360,
    damage: 75,
    attackSpeed: 0.9,
    range: 6.0,
    moveSpeed: 3.1,
    armor: 9,
    abilities: [
      { id: 'fireball_burst', name: 'Explosive Fireball', description: 'Hurls molten orb dealing 140 AoE damage', cooldown: 6, radius: 4, damage: 140, icon: 'Flame' }
    ],
    strengths: ['Clears clumped groups of melee soldiers instantly'],
    weaknesses: ['Single-target assassin burst'],
    description: 'Weaves volatile pyrotechnic glyphs that erupt into blazing shockwaves on contact.',
    modelColor: '#ea580c',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'pyro_a', name: 'Inferno Ignition', description: '+30% AoE radius and leaves ground ablaze', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'pyro_b', name: 'Flame Shield', description: 'Grants 150 HP shield when entering battle', tier: 1, statBonus: { hp: 150, armor: 8 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'ranged_storm_shaman',
    name: 'Stormcaller Shaman',
    title: 'Lightning Weaver',
    faction: 'primal_beast',
    role: 'Ranged',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 390,
    maxHp: 390,
    damage: 62,
    attackSpeed: 1.1,
    range: 5.8,
    moveSpeed: 3.2,
    armor: 12,
    abilities: [
      { id: 'chain_lightning', name: 'Fork Lightning', description: 'Bounces across 4 targets dealing 95 shock damage and brief stun', cooldown: 7, radius: 5, damage: 95, icon: 'Zap' }
    ],
    strengths: ['Chains through tightly packed formations'],
    weaknesses: ['Spread out skirmishers'],
    description: 'Dances with totems of thunder, commanding cloud-lightning to arc across the battlefield.',
    modelColor: '#06b6d4',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'storm_a', name: 'Thunderstrike', description: 'Lightning hits 2 additional targets and deals +25 damage', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'storm_b', name: 'Totem of Haste', description: 'Allies near Shaman gain +15% attack speed', tier: 1, statBonus: { hp: 120, range: 0.8 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'ranged_plasma_mortar',
    name: 'Ironbound Mortar Battery',
    title: 'Long-Range Siege Cannon',
    faction: 'ironbound',
    role: 'Ranged',
    isHero: false,
    manaCost: 5,
    tier: 3,
    hp: 480,
    maxHp: 480,
    damage: 160,
    attackSpeed: 0.4,
    range: 10.5,
    moveSpeed: 2.1,
    armor: 20,
    abilities: [],
    strengths: ['Longest range in the game', 'Massive structural siege damage'],
    weaknesses: ['Minimum firing range (blind spot within 3 units)', 'Extremely vulnerable if rushed'],
    description: 'Heavy wheeled artillery battery hurling concussive rounds across rivers and over walls.',
    modelColor: '#475569',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'mortar_a', name: 'Cluster Shrapnel', description: 'Shells break into 3 explosive bomblets', tier: 1, statBonus: { damage: 45 }, unlocked: true, costXP: 350 },
      { id: 'mortar_b', name: 'Hardened Wheels', description: '+200 HP and +0.6 movement speed', tier: 1, statBonus: { hp: 200, speed: 0.6 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'ranged_crossbow_goblin',
    name: 'Repeater Crossbow Goblin',
    title: 'Rapid-Fire Trapster',
    faction: 'primal_beast',
    role: 'Ranged',
    isHero: false,
    manaCost: 2,
    tier: 1,
    hp: 260,
    maxHp: 260,
    damage: 28,
    attackSpeed: 2.2,
    range: 5.2,
    moveSpeed: 3.6,
    armor: 6,
    abilities: [],
    strengths: ['Rapid hit count against shield barriers', 'Low mana cost'],
    weaknesses: ['Short range for a marksman'],
    description: 'Armed with automated triple-loaded crank crossbows, firing volleys of jagged iron bolts.',
    modelColor: '#65a30d',
    modelType: 'soldier_archer',
    upgradeBranches: [
      { id: 'rcross_a', name: 'Barbed Bolts', description: 'Attacks cause targets to bleed for 20 damage over 3s', tier: 1, statBonus: { damage: 12 }, unlocked: true, costXP: 200 },
      { id: 'rcross_b', name: 'Quick Reload', description: '+25% attack speed', tier: 1, statBonus: { speed: 0.5 }, unlocked: false, costXP: 200 }
    ]
  },

  // ================= HEAVY UNITS (6) =================
  {
    id: 'heavy_obsidian_colossus',
    name: 'Obsidian Colossus',
    title: 'Ancient Stone Titan',
    faction: 'ironbound',
    role: 'Heavy',
    isHero: false,
    manaCost: 7,
    tier: 5,
    hp: 1750,
    maxHp: 1750,
    damage: 130,
    attackSpeed: 0.7,
    range: 2.2,
    moveSpeed: 2.4,
    armor: 42,
    abilities: [
      { id: 'colossus_slam', name: 'Earth Shatter', description: 'Stomps foot dealing 200 damage and knocking back all nearby enemies', cooldown: 11, radius: 4.5, damage: 200, icon: 'Shield' }
    ],
    strengths: ['Immense health pool', 'Stops enemy push dead in its tracks'],
    weaknesses: ['Kited by fast ranged units and armor-piercing snipers'],
    description: 'Chiseled from the molten core of ancient mountains, impenetrable to standard swords.',
    modelColor: '#334155',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'coloss_a', name: 'Granite Armor', description: '+350 HP and +15 Armor', tier: 1, statBonus: { hp: 350, armor: 15 }, unlocked: true, costXP: 450 },
      { id: 'coloss_b', name: 'Seismic Impact', description: '+50 Slam damage and stuns for 2 seconds', tier: 1, statBonus: { damage: 40 }, unlocked: false, costXP: 450 }
    ]
  },
  {
    id: 'heavy_mountain_treant',
    name: 'Ancient Mountain Treant',
    title: 'Heart of the Forest',
    faction: 'sylph_nature',
    role: 'Heavy',
    isHero: false,
    manaCost: 6,
    tier: 4,
    hp: 1500,
    maxHp: 1500,
    damage: 110,
    attackSpeed: 0.8,
    range: 2.4,
    moveSpeed: 2.5,
    armor: 35,
    abilities: [
      { id: 'living_roots', name: 'Bark Shield', description: 'Surrounds itself in thick wood absorbing 300 damage', cooldown: 14, radius: 2, icon: 'ShieldCheck' }
    ],
    strengths: ['Passive regeneration in forest biomes', 'Massive defensive frontline'],
    weaknesses: ['Fire attacks deal 50% extra damage'],
    description: 'Centuries-old sentinel tree walking upon massive root-legs, crushing siege towers.',
    modelColor: '#166534',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'treant_a', name: 'Deep Roots', description: 'Regenerates 50 HP/s while standing still', tier: 1, statBonus: { hp: 300 }, unlocked: true, costXP: 400 },
      { id: 'treant_b', name: 'Branch Sweep', description: 'Attacks hit all enemies in a 180-degree arc in front', tier: 1, statBonus: { damage: 35 }, unlocked: false, costXP: 400 }
    ]
  },
  {
    id: 'heavy_war_mammoth',
    name: 'Armored War Mammoth',
    title: 'Glacial Batterer',
    faction: 'primal_beast',
    role: 'Heavy',
    isHero: false,
    manaCost: 6,
    tier: 4,
    hp: 1400,
    maxHp: 1400,
    damage: 125,
    attackSpeed: 0.9,
    range: 2.2,
    moveSpeed: 3.1,
    armor: 30,
    abilities: [
      { id: 'tusk_charge', name: 'Tusk Stampede', description: 'Charges forward pushing all enemies out of its way for 170 damage', cooldown: 12, radius: 4, damage: 170, icon: 'ChevronsRight' }
    ],
    strengths: ['Pushes enemies backward, breaking defensive lines', 'High structure damage'],
    weaknesses: ['Vulnerable to anti-tank pikes'],
    description: 'Gigantic woolly behemoth clad in spiked iron plating and war howdah.',
    modelColor: '#78350f',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'mam_a', name: 'Iron Howdah', description: 'Gains 2 archers on its back firing continuously', tier: 1, statBonus: { damage: 45 }, unlocked: true, costXP: 400 },
      { id: 'mam_b', name: 'Juggernaut Momentum', description: 'Becomes immune to crowd control while charging', tier: 1, statBonus: { hp: 250, armor: 10 }, unlocked: false, costXP: 400 }
    ]
  },
  {
    id: 'heavy_ironclad_juggernaut',
    name: 'Cyber Juggernaut Tank-Mech',
    title: 'Walking Dreadnought',
    faction: 'cyber_sentinel',
    role: 'Heavy',
    isHero: false,
    manaCost: 7,
    tier: 5,
    hp: 1600,
    maxHp: 1600,
    damage: 145,
    attackSpeed: 0.8,
    range: 2.5,
    moveSpeed: 2.6,
    armor: 38,
    abilities: [
      { id: 'shield_matrix', name: 'Hardlight Aegis', description: 'Projects a barrier protecting units behind it from all missiles', cooldown: 16, radius: 5, buffDuration: 5, icon: 'ShieldAlert' }
    ],
    strengths: ['Blocks all incoming ranged damage for allied backline', 'High melee cleave'],
    weaknesses: ['EMP attacks and electrical overloads'],
    description: 'Heavy diesel-cyber mechanized suit fitted with hydraulic piston-fists and barrier generators.',
    modelColor: '#475569',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'jug_a', name: 'Flamethrower Wrist', description: 'Channels flame burst dealing 80 damage/sec', tier: 1, statBonus: { damage: 40 }, unlocked: true, costXP: 450 },
      { id: 'jug_b', name: 'Reinforced Bulkhead', description: '+300 HP and +15 Armor', tier: 1, statBonus: { hp: 300, armor: 15 }, unlocked: false, costXP: 450 }
    ]
  },
  {
    id: 'heavy_siege_ram',
    name: 'Dwarven Iron Siege Ram',
    title: 'Structure Breaker',
    faction: 'ironbound',
    role: 'Heavy',
    isHero: false,
    manaCost: 5,
    tier: 3,
    hp: 1250,
    maxHp: 1250,
    damage: 220, // targeted against structures
    attackSpeed: 0.6,
    range: 2.0,
    moveSpeed: 2.6,
    armor: 35,
    abilities: [],
    strengths: ['Deals 300% damage to Towers and Nexus', 'Ignores enemy troops to rush structures'],
    weaknesses: ['Does not attack enemy troops'],
    description: 'Armored mobile battering ram designed specifically to reduce stone ramparts to rubble.',
    modelColor: '#52525b',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'ram_a', name: 'Adamantine Piston', description: '+80 Structure damage per strike', tier: 1, statBonus: { damage: 80 }, unlocked: true, costXP: 350 },
      { id: 'ram_b', name: 'Sloped Roof', description: 'Takes 50% reduced damage from archers and snipers', tier: 1, statBonus: { hp: 250, armor: 12 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'heavy_magma_behemoth',
    name: 'Magma Behemoth',
    title: 'Volcanic Core Fiend',
    faction: 'primal_beast',
    role: 'Heavy',
    isHero: false,
    manaCost: 6,
    tier: 4,
    hp: 1350,
    maxHp: 1350,
    damage: 120,
    attackSpeed: 0.9,
    range: 2.2,
    moveSpeed: 2.7,
    armor: 28,
    abilities: [
      { id: 'molten_leak', name: 'Lava Trail', description: 'Leaves a fiery trail behind dealing 60 damage/s to pursuers', cooldown: 0, radius: 2, icon: 'Flame' }
    ],
    strengths: ['Punishes swarming melee enemies', 'Excellent lane containment'],
    weaknesses: ['Frost Wyverns and freezing towers'],
    description: 'Living mass of boiling basalt and molten slag that scorches the earth wherever it treads.',
    modelColor: '#991b1b',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'mag_a', name: 'Pyroclastic Burst', description: 'Explodes for 250 damage when falling in battle', tier: 1, statBonus: { damage: 45 }, unlocked: true, costXP: 400 },
      { id: 'mag_b', name: 'Obsidian Shell', description: '+260 HP and 25% fire resistance', tier: 1, statBonus: { hp: 260, armor: 12 }, unlocked: false, costXP: 400 }
    ]
  },

  // ================= FAST UNITS (6) =================
  {
    id: 'fast_direwolf_riders',
    name: 'Direwolf Cavalry Raider',
    title: 'Flank Disruptor',
    faction: 'primal_beast',
    role: 'Fast',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 580,
    maxHp: 580,
    damage: 72,
    attackSpeed: 1.4,
    range: 2.0,
    moveSpeed: 5.2,
    armor: 14,
    abilities: [
      { id: 'wolf_howl', name: 'Hunter Howl', description: 'Boosts movement speed of all nearby cavalry by 30%', cooldown: 10, radius: 6, buffDuration: 5, icon: 'Activity' }
    ],
    strengths: ['Rapid flanking around enemy frontline to reach snipers', 'Fast capture'],
    weaknesses: ['Anti-cavalry Pikemen'],
    description: 'Savage riders mounted atop massive northern direwolves, bred for high-speed hit-and-run tactics.',
    modelColor: '#4b5563',
    modelType: 'creature_wolf',
    upgradeBranches: [
      { id: 'wolf_a', name: 'Savage Bite', description: 'Attacks bleed target for 30 damage', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'wolf_b', name: 'Thick Winter Fur', description: '+160 HP and +8 Armor', tier: 1, statBonus: { hp: 160, armor: 8 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'fast_cyber_hoverbike',
    name: 'Cyber Hover-Striker',
    title: 'Aero-Skimmer Scout',
    faction: 'cyber_sentinel',
    role: 'Fast',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 440,
    maxHp: 440,
    damage: 60,
    attackSpeed: 1.6,
    range: 3.5,
    moveSpeed: 5.5,
    armor: 12,
    abilities: [
      { id: 'turbo_boost', name: 'Overdrive Boost', description: 'Surges with +60% speed and drops an EMP mine', cooldown: 12, radius: 3, damage: 100, icon: 'Zap' }
    ],
    strengths: ['Crosses water and chasms without slowing down', 'Kites melee troops'],
    weaknesses: ['Ranged snipers'],
    description: 'Anti-gravity repulsor vehicle equipped with dual rapid-pulse blaster cannons.',
    modelColor: '#06b6d4',
    modelType: 'cyber_drone',
    upgradeBranches: [
      { id: 'hbike_a', name: 'Twin Laser Array', description: '+20 Blaster damage per pulse', tier: 1, statBonus: { damage: 20 }, unlocked: true, costXP: 250 },
      { id: 'hbike_b', name: 'Shield Deflector', description: '+120 HP and 20% dodge chance', tier: 1, statBonus: { hp: 120, armor: 6 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'fast_panther_assassin',
    name: 'Shadow Panther Stalker',
    title: 'Prowler of the Void',
    faction: 'abyssal',
    role: 'Fast',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 520,
    maxHp: 520,
    damage: 88,
    attackSpeed: 1.5,
    range: 1.8,
    moveSpeed: 5.0,
    armor: 12,
    abilities: [
      { id: 'pounce', name: 'Shadow Pounce', description: 'Leaps 5 units forward knocking target prone for 1.5s', cooldown: 9, radius: 2, damage: 120, icon: 'ChevronsUp' }
    ],
    strengths: ['Pounces directly onto isolated mages', 'High burst critical strikes'],
    weaknesses: ['Dense defensive phalanxes'],
    description: 'Sleek ebony predator infused with shadow essence, leaping from blind spots.',
    modelColor: '#1e1b4b',
    modelType: 'creature_wolf',
    upgradeBranches: [
      { id: 'pan_a', name: 'Ripping Claws', description: '+35 Damage and slows target by 40%', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 300 },
      { id: 'pan_b', name: 'Ghost Cloak', description: 'Cannot be targeted by towers while moving at top speed', tier: 1, statBonus: { hp: 140, speed: 0.5 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'fast_pegasus_scout',
    name: 'Celestial Pegasus Scout',
    title: 'Sky Vanguard',
    faction: 'celestial',
    role: 'Fast',
    isHero: false,
    isFlying: true,
    manaCost: 4,
    tier: 3,
    hp: 560,
    maxHp: 560,
    damage: 65,
    attackSpeed: 1.3,
    range: 2.2,
    moveSpeed: 5.4,
    armor: 14,
    abilities: [],
    strengths: ['Flying cavalry with extreme map rotation speed', 'Objective capture'],
    weaknesses: ['Anti-air missile towers'],
    description: 'Winged celestial horse carrying an elite lancer, descending upon enemy supply lines.',
    modelColor: '#f8fafc',
    modelType: 'creature_griffin',
    upgradeBranches: [
      { id: 'peg_a', name: 'Sun Lance', description: 'First attack deals 140 burst damage', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 300 },
      { id: 'peg_b', name: 'Divine Feathers', description: '+160 HP and heals for 20 HP/s', tier: 1, statBonus: { hp: 160 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'fast_wind_dancer',
    name: 'Sylph Wind Dancer',
    title: 'Tempest Blade',
    faction: 'sylph_nature',
    role: 'Fast',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 430,
    maxHp: 430,
    damage: 66,
    attackSpeed: 1.7,
    range: 1.8,
    moveSpeed: 5.1,
    armor: 10,
    abilities: [
      { id: 'whirlwind_step', name: 'Zephyr Dodge', description: 'Evades all physical attacks for 2.5 seconds', cooldown: 11, radius: 1, icon: 'Wind' }
    ],
    strengths: ['Dodges heavy strikes from slow giants', 'Rapid melee combo'],
    weaknesses: ['Targeted magic spells that cannot miss'],
    description: 'Elven dual-curved blade wielder moving like a whirling gale through enemy ranks.',
    modelColor: '#10b981',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'wind_a', name: 'Gale Flurry', description: '+25 Damage and 20% attack speed', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 250 },
      { id: 'wind_b', name: 'Featherweight', description: '+100 HP and +0.8 movement speed', tier: 1, statBonus: { hp: 100, speed: 0.8 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'fast_sand_skimmer',
    name: 'Dune Sand Skimmer',
    title: 'Desert Skirmisher',
    faction: 'primal_beast',
    role: 'Fast',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 460,
    maxHp: 460,
    damage: 58,
    attackSpeed: 1.4,
    range: 2.2,
    moveSpeed: 5.3,
    armor: 12,
    abilities: [],
    strengths: ['Ignores slow terrain like mud or snow', 'Harasses enemy miners and builders'],
    weaknesses: ['Freezing towers'],
    description: 'Nimble desert warriors gliding across shifting sands on bone-bladed sand skis.',
    modelColor: '#d97706',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'sand_a', name: 'Blinding Sand', description: 'Attacks reduce target accuracy by 40%', tier: 1, statBonus: { damage: 20 }, unlocked: true, costXP: 250 },
      { id: 'sand_b', name: 'Dune Endurance', description: '+140 HP and +8 Armor', tier: 1, statBonus: { hp: 140, armor: 8 }, unlocked: false, costXP: 250 }
    ]
  },

  // ================= SUPPORT & HEALING UNITS (6) =================
  {
    id: 'support_cleric_of_light',
    name: 'Cleric of the Holy Dawn',
    title: 'Divine Medic',
    faction: 'celestial',
    role: 'Support',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 450,
    maxHp: 450,
    damage: 35,
    attackSpeed: 1.0,
    range: 5.5,
    moveSpeed: 3.1,
    armor: 12,
    abilities: [
      { id: 'heal_beam', name: 'Ray of Grace', description: 'Channels continuous restorative ray healing ally for 80 HP/s', cooldown: 2, radius: 6, heal: 80, icon: 'Heart' }
    ],
    strengths: ['Keeps tanks and Heroes alive indefinitely if protected'],
    weaknesses: ['Primary target for assassins and snipers'],
    description: 'Gentle priest radiating warm solar energy, mending fractured bones and flesh on the frontlines.',
    modelColor: '#fbbf24',
    modelType: 'support_cleric',
    upgradeBranches: [
      { id: 'cleric_a', name: 'Radiant Surge', description: 'Heals all nearby allies for 120 HP when casting', tier: 1, statBonus: { hp: 120 }, unlocked: true, costXP: 300 },
      { id: 'cleric_b', name: 'Sanctuary Ward', description: 'Surrounds healed ally with a 15% damage reduction shield', tier: 1, statBonus: { hp: 180, armor: 8 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'support_chronomancer',
    name: 'Chronomancer of the Rift',
    title: 'Time Weaver',
    faction: 'arcane_order',
    role: 'Support',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 410,
    maxHp: 410,
    damage: 42,
    attackSpeed: 1.1,
    range: 6.0,
    moveSpeed: 3.2,
    armor: 10,
    abilities: [
      { id: 'time_warp', name: 'Haste Field', description: 'Accelerates attack and movement speed of allies by 40% for 5s', cooldown: 11, radius: 5, buffDuration: 5, icon: 'Hourglass' },
      { id: 'time_slow', name: 'Deceleration Ray', description: 'Slows single enemy unit by 70% for 4 seconds', cooldown: 9, radius: 6, icon: 'Clock' }
    ],
    strengths: ['Magnifies squad push power and neutralizes charging titans'],
    weaknesses: ['Vulnerable when caught alone'],
    description: 'Manipulator of quantum temporal currents, accelerating allies while trapping foes in molasses.',
    modelColor: '#6366f1',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'chrono_a', name: 'Rewind', description: 'Reverses target ally HP back 3 seconds upon taking fatal damage', tier: 1, statBonus: { hp: 120 }, unlocked: true, costXP: 350 },
      { id: 'chrono_b', name: 'Temporal Echo', description: 'Attacks repeat 1 second later for 50% damage', tier: 1, statBonus: { damage: 25, range: 1.0 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'support_alchemist_doctor',
    name: 'Toxicologist Alchemist',
    title: 'Potion Brewer',
    faction: 'primal_beast',
    role: 'Support',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 430,
    maxHp: 430,
    damage: 48,
    attackSpeed: 1.2,
    range: 5.2,
    moveSpeed: 3.2,
    armor: 10,
    abilities: [
      { id: 'stim_potion', name: 'Berserk Draught', description: 'Throws flask boosting allied damage by 35% for 6s', cooldown: 10, radius: 4, buffDuration: 6, icon: 'FlaskConical' }
    ],
    strengths: ['Greatly enhances damage output of swarm soldiers'],
    weaknesses: ['Low solo combat stats'],
    description: 'Equipped with brass alembics and explosive concoctions that supercharge blood chemistry.',
    modelColor: '#10b981',
    modelType: 'support_cleric',
    upgradeBranches: [
      { id: 'alch_a', name: 'Corrosive Acid', description: 'Also throws acid flasks reducing enemy armor by 15', tier: 1, statBonus: { damage: 20 }, unlocked: true, costXP: 250 },
      { id: 'alch_b', name: 'Vital Elixir', description: 'Flasks also heal affected allies for 120 HP', tier: 1, statBonus: { hp: 140 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'support_bard_of_valor',
    name: 'Skald of High Valor',
    title: 'Inspiring Minstrel',
    faction: 'ironbound',
    role: 'Support',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 480,
    maxHp: 480,
    damage: 40,
    attackSpeed: 1.0,
    range: 3.5,
    moveSpeed: 3.3,
    armor: 15,
    abilities: [
      { id: 'war_song', name: 'Battle Hymn', description: 'Aura granting +15% armor and immunity to fear to all nearby allies', cooldown: 0, radius: 7, icon: 'Music' }
    ],
    strengths: ['Continuous passive teamwide defense buff'],
    weaknesses: ['Direct high-damage duels'],
    description: 'Playing resonant war-horns and thunder-drums that stir the hearts of soldiers into unbreakable resolve.',
    modelColor: '#f97316',
    modelType: 'support_cleric',
    upgradeBranches: [
      { id: 'bard_a', name: 'War March', description: 'Aura also grants +20% movement speed to all nearby allies', tier: 1, statBonus: { speed: 0.5 }, unlocked: true, costXP: 250 },
      { id: 'bard_b', name: 'Resonant Shield', description: '+160 HP and nearby allies gain 10% lifesteal', tier: 1, statBonus: { hp: 160, armor: 8 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'support_forest_druid',
    name: 'Druid of the Green Canopy',
    title: 'Nature Restorer',
    faction: 'sylph_nature',
    role: 'Support',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 470,
    maxHp: 470,
    damage: 44,
    attackSpeed: 1.1,
    range: 5.5,
    moveSpeed: 3.2,
    armor: 12,
    abilities: [
      { id: 'tranquility', name: 'Tranquil Grove', description: 'Sprouts healing flowers healing 50 HP/s in area for 6s', cooldown: 12, radius: 5.5, heal: 300, icon: 'Flower' }
    ],
    strengths: ['Area-wide sustained healing for army pushes'],
    weaknesses: ['High burst damage that overpowers healing over time'],
    description: 'Commands the living spirits of rain and moss to sprout rejuvenating glades across scorched dirt.',
    modelColor: '#22c55e',
    modelType: 'support_cleric',
    upgradeBranches: [
      { id: 'druid_a', name: 'Bloom of Briars', description: 'Grove also damages enemies inside for 40 damage/s', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'druid_b', name: 'Iron Bark Aura', description: '+160 HP and allies in Grove gain +12 Armor', tier: 1, statBonus: { hp: 160, armor: 8 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'support_mana_wisp',
    name: 'Prismatic Mana Wisp',
    title: 'Aether Battery',
    faction: 'arcane_order',
    role: 'Support',
    isHero: false,
    isFlying: true,
    manaCost: 2,
    tier: 1,
    hp: 240,
    maxHp: 240,
    damage: 20,
    attackSpeed: 1.0,
    range: 4.0,
    moveSpeed: 4.2,
    armor: 5,
    abilities: [
      { id: 'mana_battery', name: 'Aether Infusion', description: 'Passively increases player mana generation by +25% while alive', cooldown: 0, radius: 1, icon: 'BatteryCharging' }
    ],
    strengths: ['Accelerates deployment rate of all other cards in deck'],
    weaknesses: ['Fragile HP pool, easily sniped'],
    description: 'A luminous ball of sentient concentrated mana essence floating gently beside friendly commanders.',
    modelColor: '#c084fc',
    modelType: 'cyber_drone',
    upgradeBranches: [
      { id: 'wisp_a', name: 'Overcharge Discharge', description: 'Explodes upon death restoring 2 Mana immediately', tier: 1, statBonus: { hp: 50 }, unlocked: true, costXP: 200 },
      { id: 'wisp_b', name: 'Shimmering Ward', description: 'Allies within 4 units gain 15% magic resistance', tier: 1, statBonus: { hp: 100 }, unlocked: false, costXP: 200 }
    ]
  },

  // ================= AREA-CONTROL & DEFENSIVE UNITS (6) =================
  {
    id: 'defense_shieldwall_phalanx',
    name: 'Aegis Shieldwall Phalanx',
    title: 'Immovable Line',
    faction: 'celestial',
    role: 'Defensive',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 750,
    maxHp: 750,
    damage: 48,
    attackSpeed: 1.0,
    range: 1.8,
    moveSpeed: 2.5,
    armor: 38,
    abilities: [
      { id: 'lock_shields', name: 'Shield Fortress', description: 'Locks tower shields absorbing 80% missile damage', cooldown: 8, radius: 2, buffDuration: 6, icon: 'Shield' }
    ],
    strengths: ['Completely blocks lane corridors', 'Nullifies incoming archer volleys'],
    weaknesses: ['Indirect mortar artillery and meteors'],
    description: 'Interlocking tower shields forged of enchanted celestial brass that form an impenetrable barricade.',
    modelColor: '#eab308',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'phalanx_a', name: 'Spiked Faces', description: 'Returns 30 damage when struck by melee attackers', tier: 1, statBonus: { damage: 20 }, unlocked: true, costXP: 300 },
      { id: 'phalanx_b', name: 'Tower Bastion', description: '+220 HP and +12 Armor', tier: 1, statBonus: { hp: 220, armor: 12 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'defense_cryo_barricade',
    name: 'Cryo Barricade Automaton',
    title: 'Sub-Zero Wall',
    faction: 'cyber_sentinel',
    role: 'Defensive',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 820,
    maxHp: 820,
    damage: 40,
    attackSpeed: 0.8,
    range: 3.0,
    moveSpeed: 2.2,
    armor: 32,
    abilities: [
      { id: 'frost_wall', name: 'Ice Barricade', description: 'Erects temporary ice wall blocking enemy movement for 5s', cooldown: 14, radius: 4, icon: 'Box' }
    ],
    strengths: ['Divides enemy army in half during chokepoint pushes'],
    weaknesses: ['Fire dragons and magma behemoths'],
    description: 'Heavy security chassis projecting solid crystalline ice fields to impede enemy troop advancement.',
    modelColor: '#38bdf8',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'cryo_a', name: 'Chilling Shards', description: 'Attacking units are slowed by 40%', tier: 1, statBonus: { damage: 20 }, unlocked: true, costXP: 300 },
      { id: 'cryo_b', name: 'Glacial Plating', description: '+250 HP and +10 Armor', tier: 1, statBonus: { hp: 250, armor: 10 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'defense_web_arachnid',
    name: 'Brood Web Arachnid',
    title: 'Snare Weaver',
    faction: 'primal_beast',
    role: 'AreaControl',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 510,
    maxHp: 510,
    damage: 55,
    attackSpeed: 1.3,
    range: 3.2,
    moveSpeed: 3.8,
    armor: 16,
    abilities: [
      { id: 'sticky_web', name: 'Web Trap', description: 'Shoots web pool trapping all enemies in area for 3.5s', cooldown: 9, radius: 4, icon: 'Crosshair' }
    ],
    strengths: ['Stops fast cavalry cold in their tracks'],
    weaknesses: ['Flying wyverns and airborne units'],
    description: 'Carnivorous cave spider that blankets entire pathways in adhesive webbing to ambush prey.',
    modelColor: '#3f3f46',
    modelType: 'creature_wolf',
    upgradeBranches: [
      { id: 'web_a', name: 'Acidic Silk', description: 'Web deals 30 poison damage/s to trapped foes', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 250 },
      { id: 'web_b', name: 'Chitin Shell', description: '+160 HP and +8 Armor', tier: 1, statBonus: { hp: 160, armor: 8 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'defense_tesla_automaton',
    name: 'Tesla Coil Automaton',
    title: 'Area Arc Generator',
    faction: 'cyber_sentinel',
    role: 'AreaControl',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 680,
    maxHp: 680,
    damage: 70,
    attackSpeed: 1.0,
    range: 4.5,
    moveSpeed: 2.4,
    armor: 22,
    abilities: [
      { id: 'electric_discharge', name: 'Overcharge Pulse', description: 'Discharges 360-degree electric blast shocking all adjacent foes', cooldown: 8, radius: 4, damage: 130, icon: 'Zap' }
    ],
    strengths: ['Shreds swarms of infantry surrounding it'],
    weaknesses: ['Long-range siege mortars'],
    description: 'Walking copper coil capacitor that constantly arcs blue electricity between its spires.',
    modelColor: '#0ea5e9',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'tesla_a', name: 'High Voltage Discharge', description: '+35 Pulse damage and stuns targets for 1s', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 300 },
      { id: 'tesla_b', name: 'Faraday Cage', description: '+200 HP and immune to all stun effects', tier: 1, statBonus: { hp: 200, armor: 10 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'defense_bramble_warden',
    name: 'Ironwood Bramble Warden',
    title: 'Zone Denial Sentinel',
    faction: 'sylph_nature',
    role: 'AreaControl',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 720,
    maxHp: 720,
    damage: 52,
    attackSpeed: 1.0,
    range: 2.8,
    moveSpeed: 2.6,
    armor: 26,
    abilities: [
      { id: 'bramble_patch', name: 'Thornfield', description: 'Grows thick briars on the ground slowing enemies by 50% and damaging them', cooldown: 10, radius: 5, damage: 90, icon: 'GitPullRequest' }
    ],
    strengths: ['Turns entire bridge or lane into deadly bottleneck'],
    weaknesses: ['Flame abilities clear the brambles'],
    description: 'Living wood elemental whose roots weave impenetrable thorn bushes across contested lanes.',
    modelColor: '#15803d',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'bram_a', name: 'Spike Thorns', description: 'Thornfield deals double damage to fast units', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'bram_b', name: 'Ancient Core', description: '+220 HP and heals 30 HP/s inside thornfields', tier: 1, statBonus: { hp: 220, armor: 10 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'defense_void_sentinel',
    name: 'Void Gate Sentinel',
    title: 'Abyssal Chokepoint Ward',
    faction: 'abyssal',
    role: 'Defensive',
    isHero: false,
    manaCost: 5,
    tier: 4,
    hp: 890,
    maxHp: 890,
    damage: 65,
    attackSpeed: 0.9,
    range: 3.2,
    moveSpeed: 2.5,
    armor: 30,
    abilities: [
      { id: 'void_repulsion', name: 'Abyssal Repulsion', description: 'Knocks back all encroaching enemies by 4 units every 8 seconds', cooldown: 8, radius: 4, icon: 'Maximize2' }
    ],
    strengths: ['Prevents enemies from touching friendly towers', 'Disrupts diving attackers'],
    weaknesses: ['Heavy siege engines outside its repulsion radius'],
    description: 'Towering entity carved from obsidian, generating gravitational repulsion waves.',
    modelColor: '#4c1d95',
    modelType: 'soldier_golem',
    upgradeBranches: [
      { id: 'voids_a', name: 'Gravitational Crush', description: 'Repulsion wave also deals 110 damage', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 350 },
      { id: 'voids_b', name: 'Singularity Armor', description: '+250 HP and absorbs 20% magic damage', tier: 1, statBonus: { hp: 250, armor: 12 }, unlocked: false, costXP: 350 }
    ]
  },

  // ================= SPECIAL & TACTICAL UNITS (5) =================
  {
    id: 'special_doppelganger',
    name: 'Infiltrator Doppelgänger',
    title: 'Mirror Mimic',
    faction: 'abyssal',
    role: 'Special',
    isHero: false,
    manaCost: 5,
    tier: 4,
    hp: 600,
    maxHp: 600,
    damage: 80,
    attackSpeed: 1.2,
    range: 2.2,
    moveSpeed: 3.8,
    armor: 15,
    abilities: [
      { id: 'mimic_target', name: 'Morph Mimic', description: 'Copies the highest-tier enemy unit in range for 20 seconds', cooldown: 25, radius: 6, icon: 'Copy' }
    ],
    strengths: ['Turns the enemy’s most expensive titan against them', 'Unpredictable versatility'],
    weaknesses: ['Weak before it transforms'],
    description: 'Formless shifting entity of liquid silver that reflects and mimics opposing combatants.',
    modelColor: '#94a3b8',
    modelType: 'special_wraith',
    upgradeBranches: [
      { id: 'dop_a', name: 'Perfect Replica', description: 'Copies unit with +20% bonus attack power', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 350 },
      { id: 'dop_b', name: 'Hardened Silver', description: '+180 HP and gains 15 Armor while morphed', tier: 1, statBonus: { hp: 180, armor: 15 }, unlocked: false, costXP: 350 }
    ]
  },
  {
    id: 'special_portal_wraith',
    name: 'Nether Portal Wraith',
    title: 'Rift Infiltrator',
    faction: 'abyssal',
    role: 'Special',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 440,
    maxHp: 440,
    damage: 75,
    attackSpeed: 1.3,
    range: 2.5,
    moveSpeed: 4.4,
    armor: 12,
    abilities: [
      { id: 'nether_rift', name: 'Blink Portal', description: 'Tunnels through dimensions, reappearing anywhere within 12 units', cooldown: 14, radius: 12, icon: 'Navigation' }
    ],
    strengths: ['Teleports directly behind enemy defensive towers to backdoor'],
    weaknesses: ['Revealed and countered by area control traps'],
    description: 'Intangible specter phasing between realities, ignoring terrain, barriers, and rivers.',
    modelColor: '#7c3aed',
    modelType: 'special_wraith',
    upgradeBranches: [
      { id: 'wraith_a', name: 'Soul Leach', description: 'Teleport deals 120 AoE damage at arrival destination', tier: 1, statBonus: { damage: 30 }, unlocked: true, costXP: 300 },
      { id: 'wraith_b', name: 'Ethereal Form', description: 'Takes 40% reduced physical damage', tier: 1, statBonus: { hp: 120, armor: 10 }, unlocked: false, costXP: 300 }
    ]
  },
  {
    id: 'special_sphinx_riddle',
    name: 'Golden Sphinx Riddlekeeper',
    title: 'Guardian of Secrets',
    faction: 'celestial',
    role: 'Special',
    isHero: false,
    manaCost: 6,
    tier: 4,
    hp: 950,
    maxHp: 950,
    damage: 90,
    attackSpeed: 1.0,
    range: 3.5,
    moveSpeed: 3.2,
    armor: 25,
    abilities: [
      { id: 'fatal_riddle', name: 'Enigma Curse', description: 'Curses highest-threat enemy unit; if it attacks within 4s it takes 350 damage', cooldown: 15, radius: 7, damage: 350, icon: 'HelpCircle' }
    ],
    strengths: ['Shuts down enemy Hero burst moments completely'],
    weaknesses: ['Swarms of low-value skeleton minions'],
    description: 'Ancient celestial stone sphinx weighing judgment upon commanders with lethal riddles.',
    modelColor: '#d97706',
    modelType: 'creature_behemoth',
    upgradeBranches: [
      { id: 'sphinx_a', name: 'Wrath of Osiris', description: 'Curse spreads to 1 adjacent enemy', tier: 1, statBonus: { damage: 35 }, unlocked: true, costXP: 400 },
      { id: 'sphinx_b', name: 'Golden Bastion', description: '+220 HP and +12 Armor', tier: 1, statBonus: { hp: 220, armor: 12 }, unlocked: false, costXP: 400 }
    ]
  },
  {
    id: 'special_time_thief',
    name: 'Quantum Chrono-Thief',
    title: 'Mana Siphon Rogue',
    faction: 'cyber_sentinel',
    role: 'Special',
    isHero: false,
    manaCost: 3,
    tier: 2,
    hp: 380,
    maxHp: 380,
    damage: 52,
    attackSpeed: 1.5,
    range: 2.0,
    moveSpeed: 4.6,
    armor: 10,
    abilities: [
      { id: 'mana_steal', name: 'Aether Siphon', description: 'Steals 1 Mana point from the enemy player on every 4th strike', cooldown: 6, radius: 2, icon: 'Coins' }
    ],
    strengths: ['Starves the opponent of deployment mana', 'Fast hit-and-run'],
    weaknesses: ['Heavy armor frontline tanks'],
    description: 'Equipped with chrono-coils that leech quantum energy directly from the opponent’s elixir reserves.',
    modelColor: '#06b6d4',
    modelType: 'soldier_swordsman',
    upgradeBranches: [
      { id: 'thief_a', name: 'Rapid Siphon', description: 'Steals mana on every 3rd strike instead of 4th', tier: 1, statBonus: { damage: 18 }, unlocked: true, costXP: 250 },
      { id: 'thief_b', name: 'Phase Shift', description: 'Becomes untargetable for 1.5s after stealing mana', tier: 1, statBonus: { hp: 110, speed: 0.5 }, unlocked: false, costXP: 250 }
    ]
  },
  {
    id: 'special_mirror_illusionist',
    name: 'Mirror Phantasm Illusionist',
    title: 'Deceiver of the Citadel',
    faction: 'arcane_order',
    role: 'Special',
    isHero: false,
    manaCost: 4,
    tier: 3,
    hp: 420,
    maxHp: 420,
    damage: 60,
    attackSpeed: 1.1,
    range: 6.0,
    moveSpeed: 3.4,
    armor: 10,
    abilities: [
      { id: 'hall_of_mirrors', name: 'Mirror Decoys', description: 'Creates 2 exact clones of itself that deal 25% damage and draw tower fire', cooldown: 12, radius: 4, icon: 'Users' }
    ],
    strengths: ['Absorbs heavy tower shots and bait enemy ultimates'],
    weaknesses: ['AoE attacks eliminate illusions instantly'],
    description: 'Weaves deceptive prismatic light rays, confusing targeting systems and defensive towers alike.',
    modelColor: '#a855f7',
    modelType: 'hero_mage',
    upgradeBranches: [
      { id: 'mirror_a', name: 'Shatter Mirror', description: 'Illusions explode for 100 damage when destroyed', tier: 1, statBonus: { damage: 25 }, unlocked: true, costXP: 300 },
      { id: 'mirror_b', name: 'Resilient Phantasms', description: 'Illusions have 60% of real health', tier: 1, statBonus: { hp: 140 }, unlocked: false, costXP: 300 }
    ]
  }
];

export const DEFAULT_SQUADS = [
  {
    id: 'squad_balanced',
    name: 'Crown Vanguard (Balanced)',
    heroId: 'hero_valerius',
    soldierIds: [
      'soldier_neon_footman',
      'soldier_royal_pikemen',
      'ranged_sylph_longbow',
      'support_cleric_of_light',
      'fast_direwolf_riders',
      'creature_fire_drake',
      'heavy_obsidian_colossus'
    ],
    artifactIds: ['orb_of_cataclysm', 'aegis_of_the_colossus', 'fountain_of_rejuvenation'],
    preferredFormation: 'line' as const,
    archetype: 'Balanced' as const
  },
  {
    id: 'squad_aggressive',
    name: 'Infernal Rush (Aggressive)',
    heroId: 'hero_ignis',
    soldierIds: [
      'soldier_skeleton_horde',
      'soldier_goblin_prowler',
      'soldier_dwarf_berserker',
      'fast_direwolf_riders',
      'fast_cyber_hoverbike',
      'creature_fire_drake',
      'special_portal_wraith'
    ],
    artifactIds: ['warlord_banner', 'orb_of_cataclysm', 'gale_boots_of_hermes'],
    preferredFormation: 'wedge' as const,
    archetype: 'Aggressive' as const
  },
  {
    id: 'squad_defensive',
    name: 'Iron Citadel (Defensive)',
    heroId: 'hero_thorin',
    soldierIds: [
      'defense_shieldwall_phalanx',
      'defense_cryo_barricade',
      'ranged_plasma_mortar',
      'support_cleric_of_light',
      'heavy_obsidian_colossus',
      'soldier_royal_pikemen',
      'ranged_cyber_sniper'
    ],
    artifactIds: ['aegis_of_the_colossus', 'fountain_of_rejuvenation', 'chrono_hourglass'],
    preferredFormation: 'shield_wall' as const,
    archetype: 'Defensive' as const
  },
  {
    id: 'squad_flying',
    name: 'Sky Sovereign (Air Superiority)',
    heroId: 'hero_sigma',
    soldierIds: [
      'creature_fire_drake',
      'creature_frost_wyvern',
      'creature_thunder_griffin',
      'creature_phoenix',
      'fast_pegasus_scout',
      'support_mana_wisp',
      'ranged_sylph_longbow'
    ],
    artifactIds: ['gale_boots_of_hermes', 'stormcallers_horn', 'orb_of_cataclysm'],
    preferredFormation: 'spread' as const,
    archetype: 'Flying' as const
  },
  {
    id: 'squad_magic',
    name: 'Void Eclipse (Arcane Control)',
    heroId: 'hero_morrigan',
    soldierIds: [
      'soldier_arcane_swordsman',
      'ranged_arcane_pyromancer',
      'ranged_storm_shaman',
      'support_chronomancer',
      'creature_spectral_hydra',
      'special_mirror_illusionist',
      'support_mana_wisp'
    ],
    artifactIds: ['chrono_hourglass', 'summoners_grimoire', 'stormcallers_horn'],
    preferredFormation: 'flank_pincer' as const,
    archetype: 'Magic' as const
  }
];

export const DEFAULT_SQUAD: BoardSquadLoadout = DEFAULT_SQUADS[0];
