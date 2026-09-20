import { 
  BiomeZone, 
  MegaVehicleConfig, 
  TransformationConfig, 
  ClanTerritoryZone,
  WorldEventType
} from './types';

export const BIOME_ZONES: BiomeZone[] = [
  {
    id: 'megacity',
    name: 'Neo-Tokyo Skyscraper Megacity',
    subtitle: 'High-density cyber metropolis with rooftop helipads, elevated highways & glowing megastructures',
    coordinates: [0, 0, -220],
    color: '#06b6d4',
    features: ['High-rise skyscrapers', 'Glass rooftop helipads', 'Elevated highway ramps', 'Holographic billboards', 'Underground subway access'],
    weatherPreset: 'rain'
  },
  {
    id: 'military_base',
    name: 'Sector 4 Airfield & Naval Base',
    subtitle: 'High-security defense complex with 400m jet airstrip, radar domes & offshore aircraft carrier',
    coordinates: [-280, 0, -260],
    color: '#10b981',
    features: ['Jet runway & hangar', 'SAM missile batteries', 'Aircraft carrier docked offshore', 'Armored vehicle depots', 'Observation watchtowers'],
    weatherPreset: 'fog'
  },
  {
    id: 'dino_valley',
    name: 'Jurassic Cretaceous Gorge',
    subtitle: 'Prehistoric canyon with steaming geysers, giant fossilized skeletons & roaming raptors',
    coordinates: [-260, 0, 100],
    color: '#eab308',
    features: ['Active volcanic steam vents', 'T-Rex nesting grounds', 'Giant ribcage arches', 'Rideable raptor dens', 'Amber resource crystals'],
    weatherPreset: 'clear'
  },
  {
    id: 'desert',
    name: 'Solaria Great Sand Sea & Pyramid',
    subtitle: 'Vast golden dunes containing ancient step pyramids, sandstone obelisks & hidden tombs',
    coordinates: [-220, 0, 320],
    color: '#f59e0b',
    features: ['Grand Sandstone Pyramid', 'Ancient golden sarcophagus tomb', 'Desert oasis palms', 'Off-road dune rally crests', 'Ancient sun dial'],
    weatherPreset: 'sandstorm'
  },
  {
    id: 'ocean_islands',
    name: 'The Azure Ocean & Tropical Atolls',
    subtitle: 'Deep swimmable ocean waters, coral reefs, white sand beaches & pirate islands',
    coordinates: [0, 0, 320],
    color: '#38bdf8',
    features: ['Deep ocean trench with sunken galleon', 'Speedboat marina', 'Submarine docking pen', 'Tropical palm beaches', 'Lighthouse beacon'],
    weatherPreset: 'clear'
  },
  {
    id: 'mountains',
    name: 'Frostpeak Alpine Range',
    subtitle: 'Snow-capped mountain peaks, pine forests, frozen lakes & high-altitude radio observatory',
    coordinates: [260, 0, 240],
    color: '#93c5fd',
    features: ['Summit Observatory Dome', 'Deep pine evergreen forest', 'Frozen lake ice-skating ring', 'Cliffside ski jumps', 'Hidden ice cave'],
    weatherPreset: 'snow'
  },
  {
    id: 'ancient_ruins',
    name: 'Sanctuary of Levitating Aether',
    subtitle: 'Mystical monolithic temple ruins surrounded by floating runic crystals & energy fountains',
    coordinates: [280, 0, -80],
    color: '#a855f7',
    features: ['Levitating stone megaliths', 'Ancient arcane portal', 'Chakra energy pools', 'Sacred dragon shrine', 'Gilded treasure vault'],
    weatherPreset: 'clear'
  },
  {
    id: 'titan_battleground',
    name: 'Colosseum of the Titans',
    subtitle: 'Shattered anime impact crater field featuring colossal ancient swords stuck in the earth',
    coordinates: [240, 0, -280],
    color: '#ef4444',
    features: ['Massive 40m broken God Sword', 'Energy impact blast crater', 'Titan duel ring', 'Aura recharge spires', 'Destructible stone pillars'],
    weatherPreset: 'storm'
  },
  {
    id: 'village',
    name: 'Sakura Falls Town & Harbor',
    subtitle: 'Tranquil countryside village with tiled roofs, wooden docks, market stalls & cherry blossoms',
    coordinates: [120, 0, 40],
    color: '#f43f5e',
    features: ['Sakura cherry blossom trees', 'Watermill & fishing pier', 'Clan tea house', 'Crafting workshops', 'Community campfires'],
    weatherPreset: 'clear'
  }
];

export const MEGA_VEHICLES: MegaVehicleConfig[] = [
  // LAND
  {
    id: 'sports_car',
    name: 'Apex Cyber GTR',
    category: 'land',
    topSpeedKmH: 260,
    acceleration: 9.5,
    armor: 120,
    handling: 9.2,
    weaponType: 'twin_laser',
    color: '#06b6d4',
    description: 'High-downforce twin-turbo hypercar with active neon aerodynamics and nitro overdrive.'
  },
  {
    id: 'muscle_car',
    name: 'V8 Inferno Interceptor',
    category: 'land',
    topSpeedKmH: 220,
    acceleration: 8.8,
    armor: 180,
    handling: 7.5,
    weaponType: 'none',
    color: '#ef4444',
    description: 'Supercharged widebody muscle beast equipped with reinforced bull-bars and flaming exhaust pipes.'
  },
  {
    id: 'buggy',
    name: 'Dune Reaver 4x4',
    category: 'land',
    topSpeedKmH: 170,
    acceleration: 8.5,
    armor: 150,
    handling: 8.8,
    weaponType: 'twin_laser',
    color: '#f59e0b',
    description: 'Long-travel suspension off-road buggy designed for conquering giant desert dunes and rock mountains.'
  },
  {
    id: 'truck',
    name: 'Goliath Hauler Rig',
    category: 'land',
    topSpeedKmH: 130,
    acceleration: 5.0,
    armor: 450,
    handling: 5.0,
    weaponType: 'none',
    color: '#3b82f6',
    description: 'Heavy armored semi-truck capable of plowing through barricades and transporting clan supplies.'
  },
  {
    id: 'motorcycle',
    name: 'Akira Neon Kaneda Bike',
    category: 'land',
    topSpeedKmH: 240,
    acceleration: 9.8,
    armor: 80,
    handling: 9.6,
    weaponType: 'twin_laser',
    color: '#dc2626',
    description: 'Ultra-agile cyber motorcycle featuring dual hubless glowing wheels, power sliding, and EMP blasters.'
  },
  {
    id: 'bus',
    name: 'Metro Party Partybus',
    category: 'land',
    topSpeedKmH: 120,
    acceleration: 4.5,
    armor: 350,
    handling: 5.5,
    weaponType: 'none',
    color: '#ec4899',
    description: 'Neon-lit party bus holding up to 20 squad members with roof-mounted sound systems.'
  },
  {
    id: 'tank',
    name: 'M1A3 Titan Dreadnought Tank',
    category: 'land',
    topSpeedKmH: 85,
    acceleration: 6.0,
    armor: 850,
    handling: 6.0,
    weaponType: 'tank_cannon',
    color: '#15803d',
    description: 'Heavy tracked combat tank featuring 120mm high-explosive cannon and reactive composite armor.'
  },
  {
    id: 'armored_apc',
    name: 'Valkyrie 8x8 Armored APC',
    category: 'land',
    topSpeedKmH: 110,
    acceleration: 7.0,
    armor: 600,
    handling: 7.0,
    weaponType: 'plasma_turret',
    color: '#475569',
    description: 'Amphibious squad carrier armed with automated 360-degree plasma roof turret.'
  },

  // AIR
  {
    id: 'helicopter',
    name: 'AH-64 Viper Combat Chopper',
    category: 'air',
    topSpeedKmH: 210,
    acceleration: 8.0,
    armor: 280,
    handling: 8.5,
    weaponType: 'homing_missile',
    color: '#0284c7',
    description: 'Close-air-support gunship featuring twin hydra rocket pods, minigun turret, and hover lock.'
  },
  {
    id: 'jet',
    name: 'F-22 Raptor Ghost Jet',
    category: 'air',
    topSpeedKmH: 450,
    acceleration: 9.9,
    armor: 220,
    handling: 9.0,
    weaponType: 'homing_missile',
    color: '#64748b',
    description: 'Stealth fifth-generation fighter jet with supersonic afterburners, sonic boom trails, and radar jamming.'
  },
  {
    id: 'fighter_aircraft',
    name: 'VF-31 Valkyrie Starfighter',
    category: 'air',
    topSpeedKmH: 420,
    acceleration: 9.7,
    armor: 240,
    handling: 9.5,
    weaponType: 'twin_laser',
    color: '#a855f7',
    description: 'Futuristic forward-swept wing fighter capable of VTOL vertical takeoff and barrel roll evasions.'
  },
  {
    id: 'transport_plane',
    name: 'C-130 Hercules Sky Fortress',
    category: 'air',
    topSpeedKmH: 280,
    acceleration: 6.0,
    armor: 700,
    handling: 5.5,
    weaponType: 'none',
    color: '#334155',
    description: 'Massive tactical transport aircraft capable of air-dropping vehicles, squad airdrops, and supplies.'
  },
  {
    id: 'flying_speeder',
    name: 'Quantum Hover Speeder',
    category: 'futuristic',
    topSpeedKmH: 320,
    acceleration: 9.6,
    armor: 140,
    handling: 9.8,
    weaponType: 'plasma_turret',
    color: '#22d3ee',
    description: 'Anti-gravity repulsorcraft that glides effortlessly over land, skyscrapers, and water surfaces.'
  },

  // WATER
  {
    id: 'speedboat',
    name: 'Manta Hydrofoil Speedboat',
    category: 'water',
    topSpeedKmH: 190,
    acceleration: 9.0,
    armor: 160,
    handling: 9.0,
    weaponType: 'twin_laser',
    color: '#14b8a6',
    description: 'Twin-hull carbon-fiber speedboat carving through ocean waves with hydrofoil water wake spray.'
  },
  {
    id: 'patrol_boat',
    name: 'Aegis Riverine Gunboat',
    category: 'water',
    topSpeedKmH: 130,
    acceleration: 7.5,
    armor: 420,
    handling: 7.0,
    weaponType: 'plasma_turret',
    color: '#0f766e',
    description: 'Heavily armored military patrol boat armed with rapid-fire deck cannon and depth charge launchers.'
  },
  {
    id: 'aircraft_carrier',
    name: 'USS Titan Supercarrier',
    category: 'water',
    topSpeedKmH: 60,
    acceleration: 3.0,
    armor: 2500,
    handling: 3.0,
    weaponType: 'homing_missile',
    color: '#1e293b',
    description: 'Colossal floating fortress with full takeoff runway, aircraft catapults, CIWS defense, and command bridge.'
  },
  {
    id: 'submarine',
    name: 'Nautilus Nuclear Submersible',
    category: 'water',
    topSpeedKmH: 110,
    acceleration: 6.5,
    armor: 650,
    handling: 7.0,
    weaponType: 'torpedo',
    color: '#0f172a',
    description: 'Deep-dive tactical submarine equipped with acoustic sonar pingers, periscope, and guided torpedoes.'
  },
  {
    id: 'hovercraft',
    name: 'HoverStorm All-Terrain',
    category: 'water',
    topSpeedKmH: 160,
    acceleration: 8.0,
    armor: 200,
    handling: 7.8,
    weaponType: 'twin_laser',
    color: '#f97316',
    description: 'High-lift air-cushion vehicle transitioning smoothly from deep ocean to sandy beaches and paved roads.'
  }
];

export const TITAN_TRANSFORMATIONS: TransformationConfig[] = [
  {
    id: 'colossal_titan',
    name: 'Colossal Armored Titan',
    source: 'Attack on Titan Inspired',
    heightMultiplier: 4.5,
    speedMultiplier: 1.4,
    damageMultiplier: 5.0,
    primaryAttack: 'Seismic Fist Slam (Building Crusher)',
    ultimateAttack: 'Superheated Steam Eruption Blast',
    auraColor: '#ef4444',
    secondaryColor: '#f97316',
    description: 'Transform into a 25-meter armored juggernaut capable of shattering structures with ground-shaking footfalls.'
  },
  {
    id: 'nine_tailed_fox',
    name: 'Kurama Nine-Tailed Chakra Avatar',
    source: 'Naruto Inspired',
    heightMultiplier: 3.2,
    speedMultiplier: 2.2,
    damageMultiplier: 4.5,
    primaryAttack: 'Nine Tail Sweeping Cyclone',
    ultimateAttack: 'Tailed Beast Energy Bomb (Bijuu Dama)',
    auraColor: '#f97316',
    secondaryColor: '#eab308',
    description: 'Surround yourself in golden flaming chakra with 9 animated tails whipping behind you and super-speed dashes.'
  },
  {
    id: 'godzilla_kaiju',
    name: 'Leviathan Godzilla Kaiju',
    source: 'Godzilla & Kaiju Inspired',
    heightMultiplier: 4.0,
    speedMultiplier: 1.2,
    damageMultiplier: 5.5,
    primaryAttack: 'Tail Sweep Shockwave',
    ultimateAttack: 'Nuclear Atomic Breath Heat Ray',
    auraColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    description: 'Dorsal spikes glow radioactive blue before releasing an apocalyptic atomic beam incinerating everything in line-of-sight.'
  },
  {
    id: 'saiyan_god',
    name: 'Super Saiyan God Awakened',
    source: 'Dragon Ball Inspired',
    heightMultiplier: 1.2,
    speedMultiplier: 3.0,
    damageMultiplier: 6.0,
    primaryAttack: 'Instant Transmission Lightning Flurry',
    ultimateAttack: 'Celestial Kamehameha Wave',
    auraColor: '#eab308',
    secondaryColor: '#38bdf8',
    description: 'Surround your body with roaring golden ki flames, gain infinite double jumps, high-speed flight, and massive beam attacks.'
  },
  {
    id: 'cursed_demon',
    name: 'King of Curses: Sukuna Mode',
    source: 'Jujutsu Kaisen Inspired',
    heightMultiplier: 1.3,
    speedMultiplier: 2.4,
    damageMultiplier: 5.2,
    primaryAttack: 'Dismantle & Cleave Spatial Slices',
    ultimateAttack: 'Domain Expansion: Malevolent Shrine',
    auraColor: '#a855f7',
    secondaryColor: '#e11d48',
    description: 'Unleash four glowing cursed eyes and black-flash impact punches that tear through geometry.'
  },
  {
    id: 'sonic_speed',
    name: 'Hyper Sonic Chaos Form',
    source: 'Sonic the Hedgehog Inspired',
    heightMultiplier: 1.0,
    speedMultiplier: 4.5,
    damageMultiplier: 3.5,
    primaryAttack: 'Spin Dash Meteor Ram',
    ultimateAttack: 'Chaos Supernova Shockwave',
    auraColor: '#38bdf8',
    secondaryColor: '#facc15',
    description: 'Accelerate beyond the speed of sound with kaleidoscopic rainbow speed trails, running up walls and over ocean waters.'
  },
  {
    id: 'skibidi_mech',
    name: 'Titan Skibidi Mech Destroyer',
    source: 'Skibidi Titan Mech Inspired',
    heightMultiplier: 3.8,
    speedMultiplier: 1.5,
    damageMultiplier: 4.8,
    primaryAttack: 'Triple Core Plasma Blasters',
    ultimateAttack: 'Bass Cannon Sonic Resonance Blast',
    auraColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    description: 'Command a towering robotic titan equipped with speaker jetpacks, laser optics, and vibrating techno sonic waves.'
  },
  {
    id: 'celestial_archangel',
    name: 'Neon Archangel of Infinity',
    source: 'Neon Arena Original Transcendent Form',
    heightMultiplier: 2.0,
    speedMultiplier: 2.8,
    damageMultiplier: 5.0,
    primaryAttack: 'Divine Light Spear Volley',
    ultimateAttack: 'Judgement of Neon (Area Annihilation)',
    auraColor: '#ffffff',
    secondaryColor: '#22d3ee',
    description: 'Sprout luminous cyber-wings, hover freely through the clouds, and call down orbital pillars of pure plasma light.'
  }
];

export const CLAN_TERRITORIES: ClanTerritoryZone[] = [
  {
    id: 'territory_megacity',
    name: 'Neo-Tokyo Financial District',
    position: [0, 0, -220],
    radius: 75,
    controllingClan: null,
    captureProgress: 0,
    defenseLevel: 1,
    incomePerMinute: 250
  },
  {
    id: 'territory_military',
    name: 'Sector 4 Airbase & Hangar',
    position: [-280, 0, -260],
    radius: 90,
    controllingClan: null,
    captureProgress: 0,
    defenseLevel: 2,
    incomePerMinute: 400
  },
  {
    id: 'territory_pyramid',
    name: 'Golden Pyramid of Solaria',
    position: [-220, 0, 320],
    radius: 60,
    controllingClan: null,
    captureProgress: 0,
    defenseLevel: 1,
    incomePerMinute: 300
  },
  {
    id: 'territory_naval',
    name: 'Azure Port & Aircraft Carrier',
    position: [0, 0, 320],
    radius: 80,
    controllingClan: null,
    captureProgress: 0,
    defenseLevel: 2,
    incomePerMinute: 350
  },
  {
    id: 'territory_colosseum',
    name: 'Colosseum of the Titans',
    position: [240, 0, -280],
    radius: 70,
    controllingClan: null,
    captureProgress: 0,
    defenseLevel: 3,
    incomePerMinute: 500
  }
];
