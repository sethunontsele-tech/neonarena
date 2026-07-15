import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, BookOpen, Layers, Laptop, Monitor, Smartphone, Gamepad2, 
  Cpu, Users, Calendar, Coins, Settings, Award, HelpCircle, Trophy, Sparkles, 
  ArrowRightLeft, Clock, Info, Check, X, ShieldAlert, GraduationCap, 
  ChevronDown, BarChart2, Tv, RefreshCw, Languages, Zap, Heart, Sliders, Music
} from 'lucide-react';
import { MusicLoader } from './MusicLoader';

// Interfaces for our comprehensive Software Encyclopedia
export interface SoftwareMajorVersion {
  version: string;
  releaseDate: string;
  notes: string;
}

export interface SoftwareTitle {
  id: string;
  name: string;
  category: string; // VR Game, Mobile Application, etc.
  platformType: 'vr' | 'ar' | 'pc' | 'mobile' | 'console' | 'web';
  status: 'Released' | 'Discontinued' | 'Delisted' | 'Early Access' | 'Beta' | 'Alpha' | 'Cancelled' | 'Fan-made' | 'Open-source' | 'Historical';
  region: 'Global' | 'NA' | 'EU' | 'JP' | 'Asia';
  releaseDate: string;
  developer: string;
  publisher: string;
  genres: string[];
  gameplayMechanics: string[];
  supportedPlatforms: string[];
  minHardwareRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  recHardwareRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  multiplayerFeatures: string[];
  vrHeadsetCompatibility?: string[];
  controllersSupported?: string[];
  officialWebsite: string;
  dlcAndExpansions: string[];
  achievementsCount: number;
  accessibilityFeatures: string[];
  ratings: {
    steam?: string;
    ign?: string;
    metacritic?: number;
    userRating: number; // out of 10
  };
  communityStats: {
    monthlyActiveUsers: string;
    totalSales: string;
  };
  fileSize: string;
  languages: string[];
  crossPlatformSupport: boolean;
  cloudSaves: boolean;
  monetizationModel: 'Free-to-Play' | 'Paid' | 'Subscription' | 'Premium' | 'Ad-Supported' | 'Open Source';
  majorVersions: SoftwareMajorVersion[];
  description: string;
  educationFacts: string; // CS / Architectural fact for Education Mode
}

// Exhaustive software database spanning all requested categories
const softwareDatabase: SoftwareTitle[] = [
  {
    id: 'hl_alyx',
    name: 'Half-Life: Alyx',
    category: 'VR Game',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2020-03-23',
    developer: 'Valve Corporation',
    publisher: 'Valve Corporation',
    genres: ['FPS', 'Action', 'Sci-Fi', 'Horror'],
    gameplayMechanics: ['Gravity Gloves interactions', 'Spatial weapon reloading', 'Node puzzle hacking', 'Physics-based environmental collision'],
    supportedPlatforms: ['Windows (SteamVR)'],
    minHardwareRequirements: {
      cpu: 'Intel Core i5-7500 / AMD Ryzen 5 1600',
      gpu: 'NVIDIA GTX 1060 / AMD RX 580 (6GB VRAM)',
      ram: '12 GB RAM',
      storage: '68 GB SSD'
    },
    recHardwareRequirements: {
      cpu: 'Intel Core i7-9700K / AMD Ryzen 7 3700X',
      gpu: 'NVIDIA RTX 2070 / AMD RX 5700 XT',
      ram: '16 GB RAM',
      storage: '68 GB NVMe SSD'
    },
    multiplayerFeatures: ['Single Player Only'],
    vrHeadsetCompatibility: ['Valve Index', 'Meta Quest 2/3 (Link/AirLink)', 'HTC Vive', 'Windows Mixed Reality', 'HP Reverb G2'],
    controllersSupported: ['Index Knuckles', 'Oculus Touch', 'Vive Wands'],
    officialWebsite: 'https://www.half-life.com/alyx',
    dlcAndExpansions: ['Steam Workshop community maps'],
    achievementsCount: 42,
    accessibilityFeatures: ['Seated mode', 'One-handed play mode', 'Continuous turn / Snap turn toggles', 'Teleport / Continuous locomotion styles', 'Subtitles with custom speaker colors'],
    ratings: {
      steam: 'Overwhelmingly Positive (98%)',
      ign: '10/10 Masterpiece',
      metacritic: 93,
      userRating: 9.6
    },
    communityStats: {
      monthlyActiveUsers: '110,000 active players',
      totalSales: 'Over 3 million copies sold'
    },
    fileSize: '67.4 GB',
    languages: ['English', 'French', 'German', 'Spanish', 'Japanese', 'Simplified Chinese', 'Russian'],
    crossPlatformSupport: false,
    cloudSaves: true,
    monetizationModel: 'Paid',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2020-03-23', notes: 'Initial gold release' },
      { version: 'v1.2', releaseDate: '2020-05-15', notes: 'Added developer commentary tracks and fluid simulation updates' },
      { version: 'v1.4', releaseDate: '2020-11-20', notes: 'Added complete Steam Workshop developer tool support and model editors' }
    ],
    description: 'Half-Life: Alyx is Valve’s VR return to the Half-Life series. It is the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2.',
    educationFacts: 'Architectural Lesson: Valves Source 2 engine compiles highly complex real-time physics meshes for almost every grabable object. This is paired with an inverse kinematics (IK) model that aligns virtual arms dynamically with real headset trackers, reducing simulation sickness.'
  },
  {
    id: 'pt_demo',
    name: 'P.T. (Playable Teaser)',
    category: 'Console Game',
    platformType: 'console',
    status: 'Delisted',
    region: 'Global',
    releaseDate: '2014-08-12',
    developer: '7780s Studio (Kojima Productions)',
    publisher: 'Konami',
    genres: ['Horror', 'Psychological Thriller', 'First-Person Puzzle'],
    gameplayMechanics: ['Infinite looping hallway', 'Perspective shifting locks', 'Voice microphone triggers', 'Dynamic horror event spawning'],
    supportedPlatforms: ['PlayStation 4'],
    minHardwareRequirements: {
      cpu: 'Standard PS4 Cell Processor',
      gpu: 'PS4 AMD GCN Radeon GPU',
      ram: '8 GB GDDR5',
      storage: '3.6 GB'
    },
    recHardwareRequirements: {
      cpu: 'Standard PS4 Pro Processor',
      gpu: 'PS4 Pro GPU (4.2 TFLOPS)',
      ram: '8 GB GDDR5',
      storage: '3.6 GB'
    },
    multiplayerFeatures: ['Single Player Only'],
    officialWebsite: 'Discontinued / Delisted in April 2015',
    dlcAndExpansions: ['None'],
    achievementsCount: 0,
    accessibilityFeatures: ['Standard audio controls'],
    ratings: {
      ign: '9.5/10 Scary as Hell',
      metacritic: 90,
      userRating: 9.8
    },
    communityStats: {
      monthlyActiveUsers: '0 (Delisted from PS Store)',
      totalSales: 'Over 1 million downloads before removal'
    },
    fileSize: '3.6 GB',
    languages: ['English', 'Japanese', 'French', 'Italian', 'German', 'Spanish'],
    crossPlatformSupport: false,
    cloudSaves: false,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.00', releaseDate: '2014-08-12', notes: 'Original Gamescom shadow drop' }
    ],
    description: 'P.T. is a psychological survival horror interactive teaser directed by Hideo Kojima in collaboration with Guillermo del Toro. It served as a teaser for Silent Hills, which was later cancelled, after which Konami delisted the game entirely.',
    educationFacts: 'Design Lesson: P.T. utilized Kojimas Fox Engine to render photorealistic light bounces off glossy surfaces using pre-baked spherical harmonics. This limited scene bounds to a single hallway but maximized aesthetic fidelity.'
  },
  {
    id: 'shapes_xr_app',
    name: 'ShapesXR',
    category: 'Mixed Reality App',
    platformType: 'ar',
    status: 'Released',
    region: 'Global',
    releaseDate: '2021-11-11',
    developer: 'Tvori Inc.',
    publisher: 'Tvori Inc.',
    genres: ['Productivity', 'Creative Software', 'UI/UX Prototyping'],
    gameplayMechanics: ['Volumetric wireframing', 'Storyboarding sliders', 'Real-time multi-avatar collaboration', 'Unity / Figma API bridges'],
    supportedPlatforms: ['Meta Quest 2/3/Pro', 'Apple Vision Pro', 'Pico 4'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 1 (Stand-alone VR)',
      gpu: 'Adreno 650 (Integrated)',
      ram: '6 GB RAM',
      storage: '2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2 (Stand-alone Quest 3)',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Real-time cross-device collaborative lobbies', 'Spatial voice calling'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Apple Vision Pro', 'HTC Vive XR Elite'],
    controllersSupported: ['Hand tracking pinch vectors', 'Meta Quest Touch controllers'],
    officialWebsite: 'https://www.shapesxr.com',
    dlcAndExpansions: ['ShapesXR Premium Cloud Subscription', 'Enterprise Team seats'],
    achievementsCount: 0,
    accessibilityFeatures: ['Pinch-to-zoom camera scaling', 'Left/Right handed options', 'Contrast adjustment in VR grids'],
    ratings: {
      steam: 'Positive (85%)',
      userRating: 9.0
    },
    communityStats: {
      monthlyActiveUsers: '45,000 professional designers',
      totalSales: 'Free app with over 500k installations'
    },
    fileSize: '1.4 GB',
    languages: ['English', 'German', 'Spanish', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2021-11-11', notes: 'Initial stand-alone Quest release' },
      { version: 'v2.0 (Spatial Update)', releaseDate: '2023-10-12', notes: 'Passthrough support and MR anchoring grids' },
      { version: 'v2.8 (Vision Pro)', releaseDate: '2024-02-02', notes: 'Complete spatial eye/hand track integration for Apple Vision OS' }
    ],
    description: 'ShapesXR is a spatial design, wireframing, and rapid prototyping application. It enables teams to brainstorm, storyboard, and present immersive design layouts directly in 3D or Passthrough.',
    educationFacts: 'CS Lesson: To sync multiple users in a shared spatial canvas, ShapesXR utilizes a state-synchronized server model. Instead of streaming geometry bytes, it shares localized delta-transformation vectors, allowing sub-50ms hand-to-object coordination.'
  },
  {
    id: 'ue5_engine',
    name: 'Unreal Engine 5',
    category: 'Game Engine',
    platformType: 'pc',
    status: 'Released',
    region: 'Global',
    releaseDate: '2022-04-05',
    developer: 'Epic Games',
    publisher: 'Epic Games',
    genres: ['Productivity', 'Creative Software', 'Development Tool'],
    gameplayMechanics: ['Nanite virtualized geometry', 'Lumen global illumination', 'Chaos physics simulator', 'Blueprint visual scripting'],
    supportedPlatforms: ['Windows', 'macOS', 'Linux'],
    minHardwareRequirements: {
      cpu: 'Quad-Core Intel / AMD 2.5 GHz',
      gpu: 'NVIDIA GTX 1080 / AMD RX Vega 64',
      ram: '32 GB RAM',
      storage: '120 GB SSD'
    },
    recHardwareRequirements: {
      cpu: 'Twelve-Core AMD Ryzen 9 5900X / Intel i9',
      gpu: 'NVIDIA RTX 3080 / AMD RX 6800 XT (12GB+ VRAM)',
      ram: '64 GB RAM',
      storage: '250 GB NVMe PCIe 4.0 SSD'
    },
    multiplayerFeatures: ['Multi-user collaborative editor sessions', 'Built-in client/server replication framework'],
    officialWebsite: 'https://www.unrealengine.com',
    dlcAndExpansions: ['Unreal Marketplace asset packages', 'Megascans high-fidelity material library'],
    achievementsCount: 0,
    accessibilityFeatures: ['High contrast UI themes', 'Complete key rebinding', 'Variable UI font scaling', 'Screen-reader support for standard labels'],
    ratings: {
      userRating: 9.7
    },
    communityStats: {
      monthlyActiveUsers: '2.5 million active developers',
      totalSales: 'Royalty-based license schema (5% after $1M earnings)'
    },
    fileSize: '45 GB (Base engine)',
    languages: ['English', 'Chinese', 'Korean', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Open Source',
    majorVersions: [
      { version: 'v5.0.0', releaseDate: '2022-04-05', notes: 'Nanite and Lumen global illumination initial launch' },
      { version: 'v5.2.0', releaseDate: '2023-05-11', notes: 'Added Procedural Content Generation (PCG) frameworks and substrate materials' },
      { version: 'v5.4.0', releaseDate: '2024-04-23', notes: 'Massive animation updates, Neural Network Engine (NNE) integration, and Nanite Tessellation' }
    ],
    description: 'Unreal Engine 5 is the world’s most advanced real-time 3D creation tool. It empowers game developers and creators across industries to realize next-generation real-time 3D content and experiences with unprecedented freedom, fidelity, and flexibility.',
    educationFacts: 'Architectural Lesson: "Nanite" virtualization bypasses traditional graphic bottlenecks by dynamically stream-rendering only the polygons that are smaller than a single screen pixel. This eliminates the manual creation of Level-of-Detail (LOD) models.'
  },
  {
    id: 'wow_classic',
    name: 'World of Warcraft',
    category: 'MMORPG',
    platformType: 'pc',
    status: 'Released',
    region: 'Global',
    releaseDate: '2004-11-23',
    developer: 'Blizzard Entertainment',
    publisher: 'Blizzard Entertainment',
    genres: ['RPG', 'MMORPG', 'Fantasy', 'Social Platform'],
    gameplayMechanics: ['Tab-target combat systems', 'Guild raids and dungeons', 'Symmetric/Asymmetric PvP Arenas', 'In-game virtual auction economy'],
    supportedPlatforms: ['Windows', 'macOS'],
    minHardwareRequirements: {
      cpu: 'Intel Core i5-3450 / AMD FX 8300',
      gpu: 'NVIDIA GTX 760 / AMD RX 560',
      ram: '8 GB RAM',
      storage: '100 GB HDD'
    },
    recHardwareRequirements: {
      cpu: 'Intel Core i7-4770 / AMD Ryzen 5 1500X',
      gpu: 'NVIDIA GTX 1060 / AMD RX 580 (4GB VRAM)',
      ram: '16 GB RAM',
      storage: '100 GB SSD'
    },
    multiplayerFeatures: ['Massive multiplayer realms', 'Dedicated instance zoning', 'Cross-realm matches'],
    officialWebsite: 'https://worldofwarcraft.com',
    dlcAndExpansions: ['The Burning Crusade', 'Wrath of the Lich King', 'Cataclysm', 'Mists of Pandaria', 'Warlords of Draenor', 'Legion', 'Battle for Azeroth', 'Shadowlands', 'Dragonflight', 'The War Within'],
    achievementsCount: 4500,
    accessibilityFeatures: ['Colorblind UI shader modes', 'Text-to-speech chat narration', 'Action bar key mapping assistance', 'One-click interact options', 'High contrast quest text layouts'],
    ratings: {
      ign: '9.5/10 Legendary RPG',
      metacritic: 93,
      userRating: 9.2
    },
    communityStats: {
      monthlyActiveUsers: '7.8 million monthly subscribers',
      totalSales: 'Over 140 million unique accounts registered'
    },
    fileSize: '95 GB',
    languages: ['English', 'German', 'French', 'Spanish', 'Russian', 'Korean', 'Traditional Chinese', 'Portuguese-BR'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0.0', releaseDate: '2004-11-23', notes: 'Vanilla original server release' },
      { version: 'v2.0.1', releaseDate: '2006-12-05', notes: 'Pre-Burning Crusade patch with redesigned talent specs' },
      { version: 'v11.0.0', releaseDate: '2024-08-20', notes: 'The War Within expansion introducing unified warbands and skyriding' }
    ],
    description: 'World of Warcraft (WoW) is a massive multiplayer online role-playing game released in 2004 by Blizzard. Set in the Warcraft fantasy universe, it redefined the MMORPG genre, setting persistent records for subscribers and content scope.',
    educationFacts: 'CS Lesson: To prevent client hacking, WoW uses a strict "Server-Authoritative" netcode. The server verifies every single spellcast, item transfer, and movement coordinate coordinate. The client merely serves as a visual interpreter.'
  },
  {
    id: 'flappy_bird_delisted',
    name: 'Flappy Bird',
    category: 'Mobile Game',
    platformType: 'mobile',
    status: 'Delisted',
    region: 'Global',
    releaseDate: '2013-05-24',
    developer: 'Dong Nguyen (.Gears)',
    publisher: 'Dong Nguyen',
    genres: ['Arcade', 'Casual', 'Physics Flier'],
    gameplayMechanics: ['One-tap screen flap impulse', 'Scroll scrolling obstacles', 'Collision death triggers', 'Score accumulation rings'],
    supportedPlatforms: ['iOS', 'Android'],
    minHardwareRequirements: {
      cpu: 'Single-Core ARM 1.0 GHz',
      gpu: 'Standard mobile GPU (OpenGL ES 2.0)',
      ram: '512 MB RAM',
      storage: '15 MB'
    },
    recHardwareRequirements: {
      cpu: 'Dual-Core ARM 1.5 GHz',
      gpu: 'PowerVR SGX543MP2',
      ram: '1 GB RAM',
      storage: '15 MB'
    },
    multiplayerFeatures: ['Local high-score leaderboards only'],
    officialWebsite: 'Removed from iOS/Android App Stores in Feb 2014',
    dlcAndExpansions: ['None'],
    achievementsCount: 0,
    accessibilityFeatures: ['High contrast colors', 'Simple one-tap inputs'],
    ratings: {
      ign: '5.5/10 Frustrating yet Addictive',
      userRating: 8.5
    },
    communityStats: {
      monthlyActiveUsers: '0 (Delisted globally)',
      totalSales: 'Over 50 million downloads with $50k daily ad revenue before removal'
    },
    fileSize: '12 MB',
    languages: ['English'],
    crossPlatformSupport: false,
    cloudSaves: false,
    monetizationModel: 'Ad-Supported',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2013-05-24', notes: 'Initial iOS App Store release' },
      { version: 'v1.3', releaseDate: '2014-01-30', notes: 'Slight engine optimization and physics balancing' }
    ],
    description: 'Flappy Bird is a legendary casual mobile game featuring side-scrolling pixel art graphics. The objective is to direct a flying bird through pairs of green pipes without colliding. It was famously removed by its developer due to guilt over its addictive nature.',
    educationFacts: 'Design Lesson: Flappy Bird highlights how extreme mechanical simplicity paired with rapid replay loops (less than 1 second to restart) can create massive psychological dopamine spikes, bypassing standard game complexity.'
  },
  {
    id: 'chatgpt_app',
    name: 'ChatGPT',
    category: 'AI Application',
    platformType: 'web',
    status: 'Released',
    region: 'Global',
    releaseDate: '2022-11-30',
    developer: 'OpenAI',
    publisher: 'OpenAI',
    genres: ['Productivity', 'AI Application', 'Utility', 'Educational App'],
    gameplayMechanics: ['Conversational text prompt streams', 'Code generation parsers', 'Multimodal image inputs', 'Web searching and retrieval grounding'],
    supportedPlatforms: ['Web Browser', 'iOS', 'Android', 'Windows App', 'macOS App'],
    minHardwareRequirements: {
      cpu: 'Any web-connected device',
      gpu: 'Not required (Server-side cloud inference)',
      ram: '1 GB RAM',
      storage: 'Web Cache'
    },
    recHardwareRequirements: {
      cpu: 'High-speed internet router',
      gpu: 'Not required',
      ram: '2 GB RAM',
      storage: 'Web Cache'
    },
    multiplayerFeatures: ['Shared prompt chat link generation'],
    officialWebsite: 'https://chatgpt.com',
    dlcAndExpansions: ['Custom GPT agents', 'Advanced Voice Mode', 'GPT-4o Vision models'],
    achievementsCount: 0,
    accessibilityFeatures: ['Text-to-speech output narration', 'Complete voice control inputs', 'High-contrast typography options', 'Screen reader support'],
    ratings: {
      userRating: 9.8
    },
    communityStats: {
      monthlyActiveUsers: 'Over 200 million monthly active users',
      totalSales: 'SaaS subscription ($20/month for Plus seats)'
    },
    fileSize: 'Cloud service / 80MB Mobile App',
    languages: ['Over 95 languages supported'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'GPT-3.5', releaseDate: '2022-11-30', notes: 'Initial public launch' },
      { version: 'GPT-4', releaseDate: '2023-03-14', notes: 'Integrated multimodality and enhanced logical deductions' },
      { version: 'GPT-4o', releaseDate: '2024-05-13', notes: 'Omni model launching ultra-fast native speech-to-speech interaction' }
    ],
    description: 'ChatGPT is a prominent generative artificial intelligence chatbot developed by OpenAI. It enables users to direct conversations towards desired length, format, style, and detail level, utilizing advanced neural transformer models.',
    educationFacts: 'CS Lesson: ChatGPT utilizes a Large Language Model (LLM) based on the Transformer architecture. This model processes tokens using self-attention heads to predict the probability of subsequent words, relying on billions of model weights mapped on clusters of H100 GPUs.'
  },
  {
    id: 'bigscreen',
    name: 'Bigscreen Beta',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2016-04-28',
    developer: 'Bigscreen, Inc.',
    publisher: 'Bigscreen, Inc.',
    genres: ['Social', 'Entertainment', 'Media Player'],
    gameplayMechanics: ['Virtual cinema screen projections', 'P2P desktop streaming', 'Interactive spatial avatars', 'Virtual popcorn/soda grab vectors'],
    supportedPlatforms: ['Windows (SteamVR)', 'Meta Quest 2/3/Pro', 'PlayStation VR'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590',
      gpu: 'NVIDIA GTX 970',
      ram: '8 GB RAM',
      storage: '2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-7700K',
      gpu: 'NVIDIA GTX 1070',
      ram: '16 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Cross-platform shared cinema lobbies', 'Spatial audio voice chat'],
    vrHeadsetCompatibility: ['Valve Index', 'Meta Quest Family', 'HTC Vive', 'Windows Mixed Reality'],
    controllersSupported: ['Hand tracking', 'Oculus Touch', 'Index Knuckles'],
    officialWebsite: 'https://www.bigscreenvr.com',
    dlcAndExpansions: ['Premium movie ticket purchases', 'Special visual environment packs'],
    achievementsCount: 0,
    accessibilityFeatures: ['Adjustable screen size', 'Subtitles on corporate streams', 'Teleport locomotion', 'One-handed control schemes'],
    ratings: {
      steam: 'Very Positive (88%)',
      userRating: 9.1
    },
    communityStats: {
      monthlyActiveUsers: '350,000 active watch-party users',
      totalSales: 'Free-to-Play with millions of downloads'
    },
    fileSize: '1.2 GB',
    languages: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2016-04-28', notes: 'Initial public beta launch' },
      { version: 'v2.5', releaseDate: '2019-12-16', notes: 'Launched official cinema ticket streaming channel partnerships' },
      { version: 'v3.0', releaseDate: '2023-10-10', notes: 'Complete UI overhaul and high-performance AV1 streaming codec integration' }
    ],
    description: 'Bigscreen lets you watch movies, videos, and play games in immersive virtual reality theaters with friends. Experience simulated high-fidelity screens from cozy bedrooms to massive IMAX-style cinemas.',
    educationFacts: 'CS Lesson: Bigscreen uses real-time desktop frame capture and high-efficiency low-latency WebRTC streams, transmitting remote computer frames across a decentralized mesh network with sub-100ms latency.'
  },
  {
    id: 'youtube_vr',
    name: 'YouTube VR',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2016-11-10',
    developer: 'Google LLC',
    publisher: 'Google LLC',
    genres: ['Entertainment', 'Media Player', 'Spherical Exploration'],
    gameplayMechanics: ['Spherical projection wraps', 'Voice command searches', 'Dynamic foveated streaming', 'Spatial soundscapes'],
    supportedPlatforms: ['Meta Quest Family', 'PlayStation VR', 'Android (Cardboard/Daydream)', 'Apple Vision Pro'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR1 (Stand-alone)',
      gpu: 'Adreno 615',
      ram: '4 GB RAM',
      storage: '200 MB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '200 MB'
    },
    multiplayerFeatures: ['Co-watching virtual spaces (discontinued)', 'Single player streaming'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Apple Vision Pro', 'HTC Vive', 'PlayStation VR'],
    controllersSupported: ['Hand gestures', 'Pinch vectors', 'Standard VR track controllers'],
    officialWebsite: 'https://youtube.com/vr',
    dlcAndExpansions: ['YouTube Premium membership integration'],
    achievementsCount: 0,
    accessibilityFeatures: ['Full voice dictation', 'Enlarged custom font rendering', 'Dynamic zoom viewport centering'],
    ratings: {
      userRating: 8.8
    },
    communityStats: {
      monthlyActiveUsers: '2.8 million active headset viewers',
      totalSales: 'Free application'
    },
    fileSize: '150 MB',
    languages: ['Over 45 languages supported'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2016-11-10', notes: 'Initial Daydream VR launch' },
      { version: 'v2.0', releaseDate: '2018-10-25', notes: 'Meta Quest native platform deployment with 4K spherical playback' },
      { version: 'v3.2', releaseDate: '2024-02-02', notes: 'Native VisionOS spatial rendering upgrade' }
    ],
    description: 'YouTube VR transforms the world’s most popular video-sharing platform into an immersive 3D spherical experience, allowing you to step inside 360-degree videos or stream standard films on a massive floating screen.',
    educationFacts: 'CS Lesson: To project spherical videos, YouTube VR wraps flat equirectangular video frames around the interior vertices of an inverted virtual 3D sphere mesh, placing the player camera at coordinate (0,0,0).'
  },
  {
    id: 'virtual_desktop',
    name: 'Virtual Desktop',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2016-03-31',
    developer: 'Guy Godin',
    publisher: 'Virtual Desktop Inc.',
    genres: ['Utility', 'Productivity', 'Streaming Tools'],
    gameplayMechanics: ['Ultra-low-latency desktop encoding', 'Remote controller emulation', 'Dynamic SSW frame extrapolation', 'Virtual environment spawning'],
    supportedPlatforms: ['Windows (Oculus/SteamVR)', 'Meta Quest Family', 'Pico 4', 'HTC Vive XR Elite'],
    minHardwareRequirements: {
      cpu: 'Intel i5-2500K',
      gpu: 'NVIDIA GTX 970 / AMD RX 480',
      ram: '8 GB RAM',
      storage: '1 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-9700K / AMD Ryzen 7 3700X',
      gpu: 'NVIDIA RTX 3070 / AMD RX 6800',
      ram: '16 GB RAM',
      storage: '1 GB'
    },
    multiplayerFeatures: ['Single User Streaming with remote guest features'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Pico headsets', 'Valve Index', 'HTC Vive'],
    controllersSupported: ['SteamVR Controller arrays', 'Hand tracking gesture mapping'],
    officialWebsite: 'https://www.vrdesktop.net',
    dlcAndExpansions: ['Free continuous streamer utility updates'],
    achievementsCount: 5,
    accessibilityFeatures: ['High-contrast UI settings', 'Adjustable curvature for curved monitors', 'Complete voice control presets'],
    ratings: {
      steam: 'Very Positive (94%)',
      userRating: 9.7
    },
    communityStats: {
      monthlyActiveUsers: '800,000 active power users',
      totalSales: 'Over 2.5 million licenses purchased'
    },
    fileSize: '750 MB',
    languages: ['English', 'French', 'German', 'Japanese', 'Traditional Chinese', 'Korean'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Paid',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2016-03-31', notes: 'Initial Steam release for HTC Vive and Oculus Rift' },
      { version: 'v1.15', releaseDate: '2019-05-21', notes: 'Quest standalone release introducing high-quality Wi-Fi PC streaming' },
      { version: 'v1.30', releaseDate: '2023-11-15', notes: 'AV1 10-bit codec support and ultra-low latency Synchronous Spacewarp (SSW) generation' }
    ],
    description: 'Virtual Desktop is a highly optimized streaming application that allows you to connect to your PC wirelessly over Wi-Fi to use your computer, stream flat PC games, or play SteamVR titles on standalone headsets.',
    educationFacts: 'CS Lesson: Virtual Desktop implements hardware-accelerated GPU screen capture APIs paired with custom slicing encoders, streaming frames over UDP with latency-optimized jitter buffers, achieving sub-20ms wireless hand-to-display loops.'
  },
  {
    id: 'immersed',
    name: 'Immersed',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2018-08-15',
    developer: 'Immersed Inc.',
    publisher: 'Immersed Inc.',
    genres: ['Productivity', 'Collaboration', 'Office Workspace'],
    gameplayMechanics: ['Virtual multi-display rendering', 'Shared whiteboards', 'Real-time team screen share portals', 'Integrated keyboard pass-through overlays'],
    supportedPlatforms: ['Windows', 'macOS', 'Linux', 'Meta Quest Family', 'Apple Vision Pro', 'HTC Vive XR Elite'],
    minHardwareRequirements: {
      cpu: 'Intel i5-6500 / Apple M1',
      gpu: 'Intel HD Graphics 530 / Apple Silicon GPU',
      ram: '8 GB RAM',
      storage: '800 MB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-10700K / Apple M1 Pro',
      gpu: 'NVIDIA RTX 2060 / Apple M1 Max',
      ram: '16 GB RAM',
      storage: '1 GB'
    },
    multiplayerFeatures: ['Shared visual business rooms', 'Cross-platform cursor mapping'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Apple Vision Pro', 'HTC Vive', 'Pico Family'],
    controllersSupported: ['Hand tracking pinch loops', 'Physical Bluetooth keyboard/mouse bindings'],
    officialWebsite: 'https://immersed.com',
    dlcAndExpansions: ['Immersed Pro subscription tier', 'Enterprise office customization bundles'],
    achievementsCount: 0,
    accessibilityFeatures: ['Custom text scaling', 'Passthrough windows around physical desk', 'Voice transcription assistant'],
    ratings: {
      userRating: 9.2
    },
    communityStats: {
      monthlyActiveUsers: '180,000 professional spatial workers',
      totalSales: 'Free core app with premium SaaS memberships'
    },
    fileSize: '450 MB',
    languages: ['English', 'German', 'Spanish', 'Japanese', 'Korean'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2018-08-15', notes: 'Initial public beta launch' },
      { version: 'v3.5', releaseDate: '2021-12-08', notes: 'Launched multi-screen support (up to 5 monitors free for Pro)' },
      { version: 'v5.0', releaseDate: '2023-10-12', notes: 'Quest 3 MR color passthrough and physical keyboard anchoring matrices' }
    ],
    description: 'Immersed creates a high-performance spatial workspace in virtual and mixed reality, enabling professionals to spawn up to 5 virtual monitors, work alongside team members in shared offices, and pair real keyboards.',
    educationFacts: 'CS Lesson: Immersed installs custom virtual kernel display drivers inside the host computer OS. The OS treats these drivers as real physical screens, letting the CPU render display frames directly into GPU memories for immediate network transport.'
  },
  {
    id: 'gravity_sketch',
    name: 'Gravity Sketch',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2017-01-25',
    developer: 'Gravity Sketch Ltd.',
    publisher: 'Gravity Sketch Ltd.',
    genres: ['Productivity', 'Creative Software', '3D Design'],
    gameplayMechanics: ['NURBS mathematical curves sketch', 'Spatial subdivision polygon styling', 'Dynamic cloud sync exports', 'Real-time geometric co-creation'],
    supportedPlatforms: ['Windows (SteamVR)', 'Meta Quest Family', 'iPadOS'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590',
      gpu: 'NVIDIA GTX 970 / AMD R9 290',
      ram: '8 GB RAM',
      storage: '4 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-8700K',
      gpu: 'NVIDIA GTX 1070 / AMD Vega 56',
      ram: '16 GB RAM',
      storage: '4 GB'
    },
    multiplayerFeatures: ['Real-time co-design spatial rooms (LandingPad)'],
    vrHeadsetCompatibility: ['Valve Index', 'Meta Quest Family', 'HTC Vive', 'HP Reverb G2'],
    controllersSupported: ['Oculus Touch', 'Index Knuckles', 'Vive Wands', 'Hand tracking'],
    officialWebsite: 'https://www.gravitysketch.com',
    dlcAndExpansions: ['LandingPad Cloud collaboration enterprise workspace'],
    achievementsCount: 12,
    accessibilityFeatures: ['Custom hand sizing scales', 'Left-handed user layout mirror', 'Audio helper cues', 'Pinch spatial camera zooming'],
    ratings: {
      steam: 'Very Positive (91%)',
      userRating: 9.4
    },
    communityStats: {
      monthlyActiveUsers: '95,000 active industrial designers',
      totalSales: 'Over 1 million downloads since transitioning to Free'
    },
    fileSize: '1.8 GB',
    languages: ['English', 'German', 'French', 'Italian', 'Japanese', 'Simplified Chinese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2017-01-25', notes: 'Initial paid creative release on SteamVR' },
      { version: 'v4.0', releaseDate: '2021-01-25', notes: 'Transitioned to completely free model and released native Quest stand-alone app' },
      { version: 'v6.2', releaseDate: '2023-09-28', notes: 'Launched LandingPad Room integrations and OBJ/FBX cloud pipeline synchronization' }
    ],
    description: 'Gravity Sketch is an intuitive spatial 3D design and wireframing application. It enables designers, artists, and creators to sketch ideas directly in 3D using controllers, producing high-fidelity CAD-ready geometric structures.',
    educationFacts: 'Design Lesson: Rather than editing rasterized voxels, Gravity Sketch models surfaces mathematically using Non-Uniform Rational B-Splines (NURBS). This allows designers to zoom infinitely into curves without pixelation.'
  },
  {
    id: 'open_brush',
    name: 'Open Brush',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2021-02-04',
    developer: 'Open Brush Contributors',
    publisher: 'Open Brush Contributors',
    genres: ['Creative Software', 'Art', 'Open Source'],
    gameplayMechanics: ['Volumetric painting streams', 'Animated shader stroke engines', 'Audio-reactive frequency brushes', 'GLTF geometric model importing'],
    supportedPlatforms: ['Windows (SteamVR)', 'Meta Quest Family', 'Pico 4', 'Linux (SteamVR)'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590 / AMD FX 8350',
      gpu: 'NVIDIA GTX 970 / AMD Radeon R9 290',
      ram: '8 GB RAM',
      storage: '1.5 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-6700K',
      gpu: 'NVIDIA GTX 1060 / AMD RX 580',
      ram: '16 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Local single player with open-source multi-user community builds'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Valve Index', 'HTC Vive', 'Windows Mixed Reality'],
    controllersSupported: ['SteamVR controller index, grip tracking', 'Hand tracking pinch'],
    officialWebsite: 'https://openbrush.app',
    dlcAndExpansions: ['None (Completely free open-source repository)'],
    achievementsCount: 0,
    accessibilityFeatures: ['Adjustable color palettes', 'Dynamic user-interface scaling', 'One-click stroke stabilization curves'],
    ratings: {
      steam: 'Overwhelmingly Positive (96%)',
      userRating: 9.5
    },
    communityStats: {
      monthlyActiveUsers: '40,000 active spatial painters',
      totalSales: 'Completely free open-source (Forked from Tilt Brush)'
    },
    fileSize: '980 MB',
    languages: ['English', 'German', 'Spanish', 'French', 'Japanese', 'Russian', 'Simplified Chinese'],
    crossPlatformSupport: true,
    cloudSaves: false,
    monetizationModel: 'Open Source',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2021-02-04', notes: 'Initial community branch release after Google open-sourced Tilt Brush' },
      { version: 'v2.4', releaseDate: '2022-10-14', notes: 'Added multilayer support, file indexing, and OpenXR platform updates' },
      { version: 'v3.0', releaseDate: '2024-03-12', notes: 'Native MR passthrough drawing, customizable brush APIs, and FBX runtime assembly' }
    ],
    description: 'Open Brush is the community-driven, open-source successor to Google’s Tilt Brush. It lets you paint in three-dimensional space with virtual brushes, glowing neon, smoke, stars, and animated audio-reactive physical textures.',
    educationFacts: 'CS Lesson: Open Brush converts controller coordinates into discrete 3D mathematical vectors, generating continuous dynamic triangle meshes on the fly and writing directly to GPU vertex buffers.'
  },
  {
    id: 'vermillion',
    name: 'Vermillion',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2021-07-29',
    developer: 'Aviary Games',
    publisher: 'Aviary Games',
    genres: ['Creative Software', 'Art', 'Simulation'],
    gameplayMechanics: ['Wet-on-wet oil blending shaders', 'Physical bristle collision tracking', 'Palette color scraping vectors', 'Built-in web browser overlay references'],
    supportedPlatforms: ['Windows (SteamVR)', 'Meta Quest Family'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590',
      gpu: 'NVIDIA GTX 970 / AMD Radeon R9 290',
      ram: '8 GB RAM',
      storage: '2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-7700K',
      gpu: 'NVIDIA GTX 1060 / AMD RX 580',
      ram: '16 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Shared art studios (up to 4 painters)'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Valve Index', 'HTC Vive', 'HP Reverb G2'],
    controllersSupported: ['Haptic feedback fine-motor controllers', 'Touch surface color mixers'],
    officialWebsite: 'https://vermillion-vr.com',
    dlcAndExpansions: ['Model importing, custom frame design models'],
    achievementsCount: 22,
    accessibilityFeatures: ['Seated painting mode', 'Height-adjustable digital easel', 'Brush-hand stabilizer filters', 'Custom left/right layouts'],
    ratings: {
      steam: 'Overwhelmingly Positive (97%)',
      userRating: 9.6
    },
    communityStats: {
      monthlyActiveUsers: '30,000 active painters',
      totalSales: 'Over 250,000 units sold'
    },
    fileSize: '1.4 GB',
    languages: ['English', 'German', 'Dutch', 'Spanish', 'French', 'Japanese', 'Korean', 'Simplified Chinese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Paid',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2021-07-29', notes: 'Initial Steam release with Bob Ross style tutorials integration' },
      { version: 'v1.5', releaseDate: '2022-03-24', notes: 'Quest native port launch with complete 3D haptic collision algorithms' },
      { version: 'v2.2', releaseDate: '2023-11-20', notes: 'Added multiplayer canvas sharing studios and high-fidelity texture exporting (up to 8K)' }
    ],
    description: 'Vermillion is a realistic oil painting simulator in virtual reality. Experience physical paint thickness, blend colors directly on the palette, scrap off errors, and paint on a highly responsive virtual canvas.',
    educationFacts: 'Design Lesson: Vermillion solves a physical paint simulation on the GPU. By calculating brush pressure, stroke vectors, and paint thickness on a multi-layered pixel texture, it replicates realistic oil friction and color blending.'
  },
  {
    id: 'tripp_meditation',
    name: 'TRIPP VR',
    category: 'VR Experience',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2018-06-01',
    developer: 'TRIPP Inc.',
    publisher: 'TRIPP Inc.',
    genres: ['Wellness', 'Meditation', 'Psychology'],
    gameplayMechanics: ['Breathing rhythm guiding visualizer', 'Cosmic abstraction morphs', 'Binaural sound sweeps', 'Mood telemetry diagnostics'],
    supportedPlatforms: ['Meta Quest Family', 'PlayStation VR2', 'Apple Vision Pro'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR1 (Stand-alone)',
      gpu: 'Integrated mobile VR processor',
      ram: '4 GB RAM',
      storage: '2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '3 GB'
    },
    multiplayerFeatures: ['Single Player immersive mood session guides'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'PlayStation VR2', 'Apple Vision Pro', 'HTC Vive Flow'],
    controllersSupported: ['Gaze tracking select', 'Hand gestures', 'Standard VR game controllers'],
    officialWebsite: 'https://www.tripp.com',
    dlcAndExpansions: ['Annual TRIPP membership', 'Custom guided vocal packs', 'Corporate wellness sessions'],
    achievementsCount: 0,
    accessibilityFeatures: ['Gaze-only selections (no controllers required)', 'Subtitled session vocals', 'Color-frequency customization scales'],
    ratings: {
      userRating: 8.9
    },
    communityStats: {
      monthlyActiveUsers: '120,000 monthly active meditators',
      totalSales: 'SaaS subscription service with over 1 million sessions completed'
    },
    fileSize: '2.5 GB',
    languages: ['English', 'German', 'Spanish', 'French', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2018-06-01', notes: 'Initial premium launch' },
      { version: 'v2.8', releaseDate: '2021-11-05', notes: 'Introduced daily dynamic AI generative meditations and smartphone companion app integration' },
      { version: 'v4.0', releaseDate: '2024-02-02', notes: 'Launch of native VisionOS Spatial Mindfulness environment' }
    ],
    description: 'TRIPP is an award-winning cinematic virtual reality meditation and wellness application. Using cognitive behavioral principles, abstract visual journeys, spatial sound, and breath guides, it elevates mental clarity.',
    educationFacts: 'Design Lesson: TRIPP deploys specific visual patterns based on the Fibonacci sequence and binaural beats. By aligning frequency shifts (e.g., alpha waves at 10Hz) across ears, it induces slow-wave neurological relaxation.'
  },
  {
    id: 'supernatural_fitness',
    name: 'Supernatural',
    category: 'VR Game',
    platformType: 'vr',
    status: 'Released',
    region: 'NA',
    releaseDate: '2020-04-23',
    developer: 'Within Unlimited (Meta)',
    publisher: 'Meta Platforms Technologies',
    genres: ['Fitness', 'Rhythm Game', 'Sports'],
    gameplayMechanics: ['Speed target swiping', 'Squat/Lunge collision dodging', 'Real-time heart rate parsing', 'Virtual coach training overlays'],
    supportedPlatforms: ['Meta Quest 2/3/Pro'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 1 (Stand-alone Quest)',
      gpu: 'Adreno 650',
      ram: '6 GB RAM',
      storage: '4 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '5 GB'
    },
    multiplayerFeatures: ['Asynchronous leaderboards', 'Community workout profiles'],
    vrHeadsetCompatibility: ['Meta Quest Family Only'],
    controllersSupported: ['Haptic dynamic tracking controllers'],
    officialWebsite: 'https://www.getsupernatural.com',
    dlcAndExpansions: ['Monthly active subscription updates', 'Licensed hit music artist packages'],
    achievementsCount: 150,
    accessibilityFeatures: ['Intensity level filters', 'One-handed workout adaptations', 'Height-calibration adjustments', 'Optional low-impact knee safety presets'],
    ratings: {
      userRating: 9.3
    },
    communityStats: {
      monthlyActiveUsers: '240,000 active subscribers',
      totalSales: 'Acquired by Meta in 2023 for reported $400 million'
    },
    fileSize: '3.8 GB',
    languages: ['English'],
    crossPlatformSupport: false,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2020-04-23', notes: 'Initial Quest exclusive shadow launch' },
      { version: 'v2.0', releaseDate: '2021-10-01', notes: 'Added Boxing training programs and personalized coaching algorithms' },
      { version: 'v3.5', releaseDate: '2023-11-12', notes: 'Quest 3 mixed reality training setups, overlaying coaches into the user living room' }
    ],
    description: 'Supernatural is a premium, subscription-based virtual reality fitness application. Featuring expert coaches, workouts set in photorealistic global natural environments, and licensed pop/rock music, it provides intense cardio workouts.',
    educationFacts: 'CS Lesson: Supernatural records real-time high-frequency controller velocity and direction vectors. It cross-references these with custom audio beatgrids to calculate impact accuracy and kinetic calorie metrics.'
  },
  {
    id: 'engage_xr',
    name: 'ENGAGE XR',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2016-05-18',
    developer: 'ENGAGE XR Holdings PLC',
    publisher: 'ENGAGE XR Holdings PLC',
    genres: ['Education', 'Collaboration', 'Social Platform'],
    gameplayMechanics: ['Whiteboard dynamic draw nodes', '3D asset spawning widgets', 'Presentation screen shares', 'Spatial classroom group splittings'],
    supportedPlatforms: ['Windows (SteamVR)', 'Meta Quest Family', 'Apple Vision Pro', 'Pico 4', 'macOS', 'Android'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590 / AMD FX 8350',
      gpu: 'NVIDIA GTX 970',
      ram: '8 GB RAM',
      storage: '4 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-7700K',
      gpu: 'NVIDIA GTX 1070 / AMD RX Vega 56',
      ram: '16 GB RAM',
      storage: '5 GB'
    },
    multiplayerFeatures: ['Up to 70-user shared concurrent sessions', 'Spatial voice groupings'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Valve Index', 'HTC Vive', 'Apple Vision Pro', 'HP Reverb G2'],
    controllersSupported: ['Standard VR grip arrays', 'Hand tracking input gesture maps'],
    officialWebsite: 'https://engagevr.com',
    dlcAndExpansions: ['Premium custom enterprise metaverses', 'Custom asset package licensing'],
    achievementsCount: 0,
    accessibilityFeatures: ['Speech-to-text transcript overlays', 'Custom high-contrast color choices', 'Laser-gaze selections'],
    ratings: {
      steam: 'Mostly Positive (76%)',
      userRating: 8.5
    },
    communityStats: {
      monthlyActiveUsers: '60,000 active students and professionals',
      totalSales: 'B2B/B2C SaaS subscription frameworks'
    },
    fileSize: '3.5 GB',
    languages: ['English', 'German', 'Spanish', 'French', 'Simplified Chinese', 'Korean', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Subscription',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2016-05-18', notes: 'Initial public classroom alpha' },
      { version: 'v2.5', releaseDate: '2019-10-15', notes: 'Added LandingPage dashboard, PDF presentation overlays, and screen share sync' },
      { version: 'v4.0', releaseDate: '2023-11-20', notes: 'Launch of ENGAGE Link corporate metaverse grid, spatial avatar facetrack sync' }
    ],
    description: 'ENGAGE XR is a leading virtual reality corporate training and spatial education platform. It allows users to host dynamic lectures, corporate events, and virtual classroom learning sessions with realistic avatars.',
    educationFacts: 'CS Lesson: To support 70+ avatars in a classroom, ENGAGE uses a hybrid network model: player voice streams utilize low-latency peer-to-peer pipelines, while whiteboard coordinates are handled on a state-synchronized central server.'
  },
  {
    id: 'wander_vr',
    name: 'Wander',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2018-06-14',
    developer: 'Parkline Interactive',
    publisher: 'Parkline Interactive',
    genres: ['Education', 'Exploration', 'Travel'],
    gameplayMechanics: ['Spherical map imagery mapping', 'Voice command searches', 'Historical timeline visualizers', 'Wikipedia geo-article parsing'],
    supportedPlatforms: ['Meta Quest Family', 'Go / GearVR'],
    minHardwareRequirements: {
      cpu: 'Snapdragon 835 (Quest 1)',
      gpu: 'Adreno 540',
      ram: '4 GB RAM',
      storage: '1.2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '1.5 GB'
    },
    multiplayerFeatures: ['Shared exploration lobbies with synchronous teleporting'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Oculus Go'],
    controllersSupported: ['Oculus Touch controllers', 'Hand tracking support'],
    officialWebsite: 'https://www.wander-vr.com',
    dlcAndExpansions: ['Continuous API updates matching Google Maps integration'],
    achievementsCount: 15,
    accessibilityFeatures: ['Voice navigation input', 'Adjustable height projection standard', 'Continuous movement / Teleport choices'],
    ratings: {
      userRating: 9.2
    },
    communityStats: {
      monthlyActiveUsers: '140,000 active travel explorers',
      totalSales: 'Over 1 million units sold on Meta Store'
    },
    fileSize: '1.1 GB',
    languages: ['English', 'German', 'Spanish', 'French', 'Italian', 'Japanese', 'Traditional Chinese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Paid',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2018-06-14', notes: 'Initial Oculus Go release' },
      { version: 'v1.8', releaseDate: '2019-05-21', notes: 'Native Quest 1 port launching shared lobby explorations with speech-to-text searches' },
      { version: 'v2.6', releaseDate: '2022-12-05', notes: 'Added Google Street View historic timeline datasets and multi-user pointer rays' }
    ],
    description: 'Wander lets you explore the entire world from the comfort of virtual reality. Utilizing Google Street View API, historical imagery, voice searches, and Wikipedia, you can travel anywhere on Earth.',
    educationFacts: 'CS Lesson: Wander stitches spherical panoramic tiles fetched from online geodatabases, projection-mapping them onto a custom inverse sphere mesh with foveated mip-mapping based on head gaze.'
  },
  {
    id: 'wooorld_mr',
    name: 'Wooorld',
    category: 'Mixed Reality App',
    platformType: 'ar',
    status: 'Released',
    region: 'Global',
    releaseDate: '2022-10-25',
    developer: 'Wooorld Inc.',
    publisher: 'Wooorld Inc.',
    genres: ['Education', 'Exploration', 'Simulation'],
    gameplayMechanics: ['3D topographical mesh scaling', 'Spatial MR table anchors', 'Global search dictation', 'Dynamic elevation extrusion controls'],
    supportedPlatforms: ['Meta Quest 2/3/Pro'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 1 (Stand-alone VR)',
      gpu: 'Adreno 650',
      ram: '6 GB RAM',
      storage: '2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Real-time co-exploring spatial MR rooms', 'Integrated avatar chat'],
    vrHeadsetCompatibility: ['Meta Quest 2/3/Pro', 'HTC Vive XR Elite'],
    controllersSupported: ['Hand tracking pinch and drag', 'Quest Touch haptics'],
    officialWebsite: 'https://wooorld.com',
    dlcAndExpansions: ['Premium custom building 3D data packs'],
    achievementsCount: 0,
    accessibilityFeatures: ['Pinch spatial sizing zoom', 'Height adaptation offsets', 'Left-handed tool orientation'],
    ratings: {
      userRating: 8.7
    },
    communityStats: {
      monthlyActiveUsers: '35,000 active mixed reality users',
      totalSales: 'Free app with professional mapping license upgrades'
    },
    fileSize: '1.4 GB',
    languages: ['English', 'German', 'Japanese', 'Spanish'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2022-10-25', notes: 'Quest Pro mixed reality table-anchored world initial launch' },
      { version: 'v2.0', releaseDate: '2023-10-10', notes: 'Complete Quest 3 color passthrough upgrade, adding 3D mesh detail maps and elevations' }
    ],
    description: 'Wooorld is a collaborative mixed reality application that lets you render 3D topographical map data of the entire globe on your living room table. Explore global cities, play geography games, and travel together.',
    educationFacts: 'CS Lesson: Wooorld pulls actual elevation and photogrammetry mesh streams on-the-fly, clipping the 3D meshes to match the user\'s physical tabletop boundary via spatial anchoring vectors.'
  },
  {
    id: 'mission_iss',
    name: 'Mission: ISS',
    category: 'VR Experience',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2017-03-09',
    developer: 'Magnopus',
    publisher: 'Meta / Magnopus',
    genres: ['Education', 'Simulation', 'Science'],
    gameplayMechanics: ['Zero-gravity dynamic locomotion', 'Spatial mechanical arms operations', 'EVA spacewalking hooks', 'Zero-G inventory anchoring'],
    supportedPlatforms: ['Windows (Oculus Rift)', 'Meta Quest Family'],
    minHardwareRequirements: {
      cpu: 'Intel i5-4590',
      gpu: 'NVIDIA GTX 970',
      ram: '8 GB RAM',
      storage: '3 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i7-6700K',
      gpu: 'NVIDIA GTX 1060 / AMD RX 580',
      ram: '16 GB RAM',
      storage: '3.5 GB'
    },
    multiplayerFeatures: ['Single Player educational aerospace simulation'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Oculus Rift', 'Valve Index'],
    controllersSupported: ['Haptic physical hand grab controllers'],
    officialWebsite: 'https://www.magnopus.com',
    dlcAndExpansions: ['None (Supported by NASA/ESA agreements)'],
    achievementsCount: 18,
    accessibilityFeatures: ['Seated motion-reduction mode', 'Snap-turn / Continuous-turn configurations', 'Optional horizon stabilization vectors'],
    ratings: {
      userRating: 9.4
    },
    communityStats: {
      monthlyActiveUsers: '80,000 aerospace enthusiasts',
      totalSales: 'Over 2 million free downloads on Oculus platforms'
    },
    fileSize: '2.4 GB',
    languages: ['English', 'German', 'Spanish', 'French', 'Russian', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Open Source',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2017-03-09', notes: 'Initial Oculus Rift launch, co-designed with NASA' },
      { version: 'v1.5', releaseDate: '2019-05-21', notes: 'Native Quest 1 port launching optimized zero-gravity hand grip systems' },
      { version: 'v2.1', releaseDate: '2021-08-14', notes: 'Added real high-definition astronauts commentary video logs and redesigned Canadarm controls' }
    ],
    description: 'Mission: ISS is an educational virtual reality experience that lets you tour the International Space Station, perform spacewalks, guide real cargo capsules, and explore life in zero-gravity.',
    educationFacts: 'CS Lesson: Mission: ISS simulates real momentum-conservation physics. Grabbing a wall handle applies virtual inverse counter-forces to the player\'s camera rig, recreating realistic zero-gravity inertia.'
  },
  {
    id: 'anne_frank_vr',
    name: 'Anne Frank House VR',
    category: 'VR Experience',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2018-06-12',
    developer: 'Force Field VR (Vertigo Games)',
    publisher: 'Anne Frank House',
    genres: ['History', 'Education', 'Museum'],
    gameplayMechanics: ['Linear rooms walkthroughs', 'Hotspot historical audio triggers', 'Object inspection coordinates', 'Subtitled journal narrations'],
    supportedPlatforms: ['Windows (Oculus)', 'Meta Quest Family', 'GearVR'],
    minHardwareRequirements: {
      cpu: 'Snapdragon 835 (Quest 1)',
      gpu: 'Adreno 540',
      ram: '4 GB RAM',
      storage: '1.8 GB'
    },
    recHardwareRequirements: {
      cpu: 'Intel i5-4590 / Snapdragon XR2',
      gpu: 'NVIDIA GTX 970 / Adreno 650',
      ram: '8 GB RAM',
      storage: '2 GB'
    },
    multiplayerFeatures: ['Single Player immersive history simulation'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Oculus Rift', 'HTC Vive'],
    controllersSupported: ['Touch pointer selects', 'Hand tracking'],
    officialWebsite: 'https://www.annefrank.org',
    dlcAndExpansions: ['None'],
    achievementsCount: 0,
    accessibilityFeatures: ['Seated only locomotion', 'Complete text-to-speech optioning', 'Adjustable language selection'],
    ratings: {
      userRating: 9.6
    },
    communityStats: {
      monthlyActiveUsers: '45,000 active students',
      totalSales: 'Completely free history preservation download'
    },
    fileSize: '1.9 GB',
    languages: ['English', 'Dutch', 'German', 'Spanish', 'French', 'Hebrew', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: false,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2018-06-12', notes: 'Initial launch commemorating Anne Frank\'s 89th birthday' },
      { version: 'v1.3', releaseDate: '2020-05-15', notes: 'Quest native optimization with improved PBR texture lighting maps' }
    ],
    description: 'Anne Frank House VR offers a solemn, immersive 3D reconstruction of the Secret Annex in Amsterdam. Experience the small rooms where Anne Frank hid during WWII, accompanied by diary audio readings.',
    educationFacts: 'Design Lesson: To maximize visual realism on mobile VR, Anne Frank House VR uses highly detailed static pre-baked lightmaps. Every light ray and ambient shadow was calculated offline using ray tracers.'
  },
  {
    id: 'liminal_wellness',
    name: 'Liminal',
    category: 'VR Experience',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2017-08-30',
    developer: 'Liminal VR',
    publisher: 'Liminal VR',
    genres: ['Wellness', 'Psychology', 'Casual'],
    gameplayMechanics: ['Mindfulness interactive targets', 'Cognitive state selectors', 'Progressive abstract visual guides', 'Audio-frequency relaxation matrices'],
    supportedPlatforms: ['Meta Quest Family', 'Pico 4'],
    minHardwareRequirements: {
      cpu: 'Snapdragon 835',
      gpu: 'Integrated mobile GPU',
      ram: '4 GB RAM',
      storage: '1.2 GB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '1.5 GB'
    },
    multiplayerFeatures: ['Single Player emotional tuning sessions'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Pico headsets', 'HTC Vive XR Elite'],
    controllersSupported: ['Hand gestures', 'Standard VR pointer controls'],
    officialWebsite: 'https://liminalvr.com',
    dlcAndExpansions: ['Weekly mental fitness module updates', 'Mindfulness corporate custom tracks'],
    achievementsCount: 0,
    accessibilityFeatures: ['Gaze-only selections', 'High-contrast colors', 'Slow pacing adjustment tools'],
    ratings: {
      userRating: 9.0
    },
    communityStats: {
      monthlyActiveUsers: '65,000 wellness explorers',
      totalSales: 'Freemium model with over 800k downloads'
    },
    fileSize: '1.3 GB',
    languages: ['English', 'German', 'Spanish', 'French', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Premium',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2017-08-30', notes: 'Initial psychological wellness releases' },
      { version: 'v3.2', releaseDate: '2021-12-10', notes: 'Redesigned core hub launching specialized Calm, Energy, Pain, and Awe zones' }
    ],
    description: 'Liminal is an immersive emotional tuning experience that leverages clinical cognitive behavioral research. Choose targeted states (Calm, Energy, Focus, or Awe) to rebalance your neurological mood.',
    educationFacts: 'Design Lesson: Liminal features precise color-spectrum shifts. Utilizing warm amber/orange ranges for Calming loops, and cold high-frequency blue/indigo ranges for energetic Focus loops.'
  },
  {
    id: 'vr_animation_player',
    name: 'VR Animation Player',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2020-10-13',
    developer: 'Meta / Quill Contributors',
    publisher: 'Meta Platforms Technologies',
    genres: ['Entertainment', 'Art', 'Media Player'],
    gameplayMechanics: ['3D spline frame scrubbing', 'Spatial scale adjustment vectors', 'Volumetric audio coordinates', 'Infinite zoom viewport layers'],
    supportedPlatforms: ['Meta Quest Family'],
    minHardwareRequirements: {
      cpu: 'Snapdragon 835',
      gpu: 'Adreno 540',
      ram: '4 GB RAM',
      storage: '500 MB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '500 MB'
    },
    multiplayerFeatures: ['Single Player immersive movie streaming'],
    vrHeadsetCompatibility: ['Meta Quest Family Only'],
    controllersSupported: ['Pinch-drag zoom triggers', 'Quill physical haptic coordinates'],
    officialWebsite: 'https://quill.allumette.com',
    dlcAndExpansions: ['Community dynamic story upload repositories'],
    achievementsCount: 0,
    accessibilityFeatures: ['Adjustable camera height offsets', 'One-handed scrubber play', 'Variable playback speed triggers'],
    ratings: {
      userRating: 9.1
    },
    communityStats: {
      monthlyActiveUsers: '85,000 spatial story viewers',
      totalSales: 'Free application'
    },
    fileSize: '450 MB',
    languages: ['English', 'French', 'German', 'Spanish', 'Japanese', 'Korean'],
    crossPlatformSupport: false,
    cloudSaves: true,
    monetizationModel: 'Free-to-Play',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2020-10-13', notes: 'Launched alongside Meta Quest 2 for streaming spatial illustrations' },
      { version: 'v2.4', releaseDate: '2022-10-25', notes: 'Added complete support for dynamic immersive Quill stories and narrative loops' }
    ],
    description: 'VR Animation Player lets you step inside 3D immersive animated shorts, paintings, and visual masterpieces. Hand-drawn by creators using the spatial painting tool Quill, these animations come to life around you.',
    educationFacts: 'CS Lesson: Instead of decoding raw pixel arrays, the VR Animation Player parses lightweight serialized vector splines and coordinate vertices in real-time, displaying hundreds of keyframed 3D paths.'
  },
  {
    id: 'moon_vr_player',
    name: 'Moon VR Video Player',
    category: 'VR Application',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2017-06-20',
    developer: 'Cosmic Dream Technologies',
    publisher: 'Cosmic Dream Technologies',
    genres: ['Utility', 'Media Player', 'Tools'],
    gameplayMechanics: ['Multi-format hardware audio decoding', 'LAN/Samba local server file streaming', 'Subtitles timing calibration', 'VR spatial audio tracking'],
    supportedPlatforms: ['Meta Quest Family', 'Apple Vision Pro', 'Windows (SteamVR)'],
    minHardwareRequirements: {
      cpu: 'Snapdragon 835 / Intel i5-4590',
      gpu: 'Adreno 540 / NVIDIA GTX 970',
      ram: '4 GB RAM',
      storage: '150 MB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2 / Intel i7-7700K',
      gpu: 'Adreno 740 / NVIDIA GTX 1060',
      ram: '8 GB RAM',
      storage: '150 MB'
    },
    multiplayerFeatures: ['Single Player high-performance local video rendering'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Apple Vision Pro', 'HTC Vive', 'Valve Index'],
    controllersSupported: ['Hand tracking pinch and point', 'Standard gamepads', 'Oculus Touch'],
    officialWebsite: 'https://moonplayerapp.com',
    dlcAndExpansions: ['Premium cloud server direct streaming connections'],
    achievementsCount: 0,
    accessibilityFeatures: ['Dynamic screen repositioning', 'Custom subtitles resizing', 'Eye-tracking navigation support'],
    ratings: {
      userRating: 9.3
    },
    communityStats: {
      monthlyActiveUsers: '110,000 active stream viewers',
      totalSales: 'Over 500,000 commercial download licenses'
    },
    fileSize: '220 MB',
    languages: ['English', 'Simplified Chinese', 'Traditional Chinese', 'German', 'Japanese', 'Korean', 'Spanish'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Paid',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2017-06-20', notes: 'Initial paid media player release on SteamVR' },
      { version: 'v2.8', releaseDate: '2020-10-15', notes: 'Native standalone Quest release introducing Samba/DLNA streaming servers' },
      { version: 'v4.5', releaseDate: '2024-02-02', notes: 'VisionOS Spatial Passthrough multi-window video decoding upgrade' }
    ],
    description: 'Moon VR Video Player is a premium, powerful media player that effortlessly streams high-resolution 2D, 3D, 180°, and 360° videos. Features optimized SMB/DLNA LAN server streaming and customized virtual backgrounds.',
    educationFacts: 'CS Lesson: Moon VR implements optimized FFmpeg media filters, utilizing hardware acceleration pipelines directly on the SOC to perform real-time equirectangular anti-distortion.'
  },
  {
    id: 'vrtravelx',
    name: 'VRtravelX',
    category: 'VR Experience',
    platformType: 'vr',
    status: 'Released',
    region: 'Global',
    releaseDate: '2021-05-12',
    developer: 'Astro Travel XR Lab',
    publisher: 'VRtravelX Labs',
    genres: ['Travel', 'Education', 'Exploration'],
    gameplayMechanics: ['Foveated ultra-high res image streaming', 'Voice-narrated geographic guides', 'Continuous waypoint teleports', 'Interactive informational tags'],
    supportedPlatforms: ['Meta Quest Family', 'WebXR Browser'],
    minHardwareRequirements: {
      cpu: 'Snapdragon XR1 (Quest 1)',
      gpu: 'Adreno 615',
      ram: '4 GB RAM',
      storage: '600 MB'
    },
    recHardwareRequirements: {
      cpu: 'Snapdragon XR2 Gen 2',
      gpu: 'Adreno 740',
      ram: '8 GB RAM',
      storage: '800 MB'
    },
    multiplayerFeatures: ['Single Player immersive geographical excursions'],
    vrHeadsetCompatibility: ['Meta Quest Family', 'Oculus Go', 'Google Cardboard'],
    controllersSupported: ['Hand tracking', 'Touch screen tap selections', 'Oculus Touch'],
    officialWebsite: 'https://vrtravelx-tours.com',
    dlcAndExpansions: ['Special high-definition European capital expansion packs', 'Premium African Safari VR tour'],
    achievementsCount: 10,
    accessibilityFeatures: ['Seated height-compensation filters', 'Closed captions on geographic narratives', 'Contrast adjustments in historical layers'],
    ratings: {
      userRating: 8.9
    },
    communityStats: {
      monthlyActiveUsers: '40,000 global travel viewers',
      totalSales: 'Freemium application model'
    },
    fileSize: '580 MB',
    languages: ['English', 'German', 'Spanish', 'French', 'Chinese', 'Japanese'],
    crossPlatformSupport: true,
    cloudSaves: true,
    monetizationModel: 'Premium',
    majorVersions: [
      { version: 'v1.0', releaseDate: '2021-05-12', notes: 'Initial public WebXR alpha tours' },
      { version: 'v2.0', releaseDate: '2023-04-18', notes: 'Standalone Quest release featuring 8K spherical panoramic video channels' }
    ],
    description: 'VRtravelX delivers breathtaking, high-definition 360-degree immersive travel tours. Explore major historical sights, cities, and natural parks with dynamic narration and embedded educational markers.',
    educationFacts: 'Design Lesson: VRtravelX implements foveated progressive video tile loaders. It stream-decodes only the specific directional high-definition quadrants that the player is actively gazing at, reducing network bandwidth.'
  }
];

export function SoftwareEncyclopedia({ onClose }: { onClose: () => void }) {
  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'release' | 'rating' | 'size'>('name');

  // Comparison State
  const [compareId1, setCompareId1] = useState<string>('');
  const [compareId2, setCompareId2] = useState<string>('');
  const [showCompare, setShowCompare] = useState(false);

  // Detail Modal State
  const [detailTitleId, setDetailTitleId] = useState<string | null>(null);

  // Music Station State
  const [showMusicStation, setShowMusicStation] = useState(false);

  // Education Mode States
  const [educationMode, setEducationMode] = useState(true);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Quiz questions for Education Mode
  const quizQuestions = [
    {
      question: "Which rendering innovation in Unreal Engine 5 completely eliminates the need for manual LODs?",
      options: ["Nanite Virtual Geometry", "Lumen Global Illumination", "Chaos Physics", "MegaScans Textures"],
      correctIndex: 0,
      explanation: "Nanite renders virtualized geometry pixel-by-pixel, letting artists import highly detailed movie-quality models directly."
    },
    {
      question: "Why does World of Warcraft utilize a strictly 'Server-Authoritative' network architecture?",
      options: ["To reduce client-side graphics stress", "To prevent player hacking and coordinate modification", "To allow players to play offline", "To speed up graphic loads"],
      correctIndex: 1,
      explanation: "By verifying all coordinates, item trades, and actions server-side, developers prevent clients from artificially speed-hacking or fabricating items."
    },
    {
      question: "Which structural neural pattern is the core architecture behind OpenAI's ChatGPT models?",
      options: ["Convolutional Neural Networks (CNN)", "Transformer Neural Architecture", "Linear Regression Trees", "Genetic Feedback Loops"],
      correctIndex: 1,
      explanation: "The Transformer architecture uses self-attention mechanisms to weigh relationships between distant words in text streams."
    },
    {
      question: "Why was Dong Nguyen's famous 'Flappy Bird' removed from app stores in February 2014?",
      options: ["Nintendo filed a patent lawsuit", "The game servers crashed under player loads", "The creator felt guilty over the addictive design loop of the game", "Apple banned the app for performance issues"],
      correctIndex: 2,
      explanation: "Dong Nguyen voluntarily delisted the app, explaining that it had become an addictive product that caused him severe personal stress."
    }
  ];

  // Dynamic lists for filters
  const categoriesList = useMemo(() => {
    return ['All', ...Array.from(new Set(softwareDatabase.map(s => s.category)))];
  }, []);

  const statusList = useMemo(() => {
    return ['All', ...Array.from(new Set(softwareDatabase.map(s => s.status)))];
  }, []);

  const platformsList = useMemo(() => {
    return ['All', 'vr', 'ar', 'pc', 'mobile', 'console', 'web'];
  }, []);

  // Filtered and sorted database results
  const processedDatabase = useMemo(() => {
    return softwareDatabase
      .filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        const matchesPlatform = selectedPlatform === 'All' || item.platformType === selectedPlatform;
        return matchesQuery && matchesCategory && matchesStatus && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'release') {
          return b.releaseDate.localeCompare(a.releaseDate);
        } else if (sortBy === 'rating') {
          return b.ratings.userRating - a.ratings.userRating;
        } else if (sortBy === 'size') {
          return parseFloat(b.fileSize) - parseFloat(a.fileSize);
        }
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedStatus, selectedPlatform, sortBy]);

  // Selected Titles for Comparison
  const compTitle1 = softwareDatabase.find(s => s.id === compareId1);
  const compTitle2 = softwareDatabase.find(s => s.id === compareId2);

  // Active detailed view title
  const detailTitle = softwareDatabase.find(s => s.id === detailTitleId);

  // Quiz progression logic
  const handleAnswerSubmit = (idx: number) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(idx);
    setQuizAnswered(true);
    if (idx === quizQuestions[currentQuizIndex].correctIndex) {
      setQuizScore(prev => (prev === null ? 1 : prev + 1));
    } else if (quizScore === null) {
      setQuizScore(0);
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Completed, keep score showing
    }
  };

  const resetQuiz = () => {
    setQuizScore(null);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-xl z-[99999] overflow-y-auto p-4 md:p-8 select-none font-sans text-zinc-300">
      
      {/* Decorative Matrix Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e905_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e905_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-cyan-400 animate-pulse" />
              </span>
              <span className="text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase">Holographic Visor Database</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-widest drop-shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              Software Encyclopedia
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl font-medium leading-relaxed uppercase">
              The ultimate catalog of historical, interactive, cancelled, and delisted software. Curated with detailed system files and technical telemetry specs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            {/* Education Mode Toggle Button */}
            <button
              onClick={() => setEducationMode(!educationMode)}
              className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5 ${
                educationMode 
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                  : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {educationMode ? 'EDUCATION MODE ON' : 'ENABLE EDUCATION MODE'}
            </button>

            {/* Music Station Toggle Button */}
            <button
              onClick={() => setShowMusicStation(true)}
              className="px-4 py-2.5 bg-zinc-900 border border-cyan-500/20 text-[9px] font-black text-cyan-400 hover:text-white hover:border-cyan-400 uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <Music className="w-4 h-4 text-cyan-400 animate-pulse" />
              🎵 MUSIC STATION
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-900 border border-white/10 text-[9px] font-black text-zinc-400 hover:text-white uppercase tracking-widest rounded-2xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Exit DB
            </button>
          </div>
        </div>

        {/* Dynamic Timeline Milestones Bar (Curriculum View) */}
        {educationMode && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Holographic Timeline of Software Evolution</h4>
                <p className="text-[10px] text-zinc-400 uppercase leading-normal">Interactive development milestones from primitive loops to generative intelligence models.</p>
              </div>
            </div>
            
            {/* Horizontal Timeline Scroller */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full md:max-w-[60%] no-scrollbar py-1">
              {[
                { year: '1962', name: 'Spacewar!', tech: 'Vector CRT OS' },
                { year: '1972', name: 'Pong', tech: 'Analog Discrete Logic' },
                { year: '1985', name: 'Tetris', tech: 'Electronika 60 C' },
                { year: '1993', name: 'DOOM', tech: 'BSP Raycasting' },
                { year: '2004', name: 'WoW', tech: 'Server netcode' },
                { year: '2014', name: 'P.T.', tech: 'Fox Photorealism' },
                { year: '2020', name: 'Alyx', tech: 'Source 2 VR IK' },
                { year: '2022', name: 'ChatGPT', tech: 'Transformers' }
              ].map((m, idx) => (
                <div key={idx} className="flex items-center shrink-0">
                  <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded-xl text-center min-w-[100px]">
                    <div className="text-[10px] font-black text-amber-400 leading-none">{m.year}</div>
                    <div className="text-[8.5px] font-black text-white mt-1 uppercase truncate">{m.name}</div>
                    <div className="text-[7px] font-mono text-zinc-500 uppercase mt-0.5">{m.tech}</div>
                  </div>
                  {idx < 7 && <span className="mx-1 text-zinc-600 font-bold">➔</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPARISON SLATE DOCK */}
        {showCompare && (
          <div className="bg-zinc-900/90 border border-cyan-400/30 rounded-3xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Side-by-Side Architectural Compare Engine</h3>
              </div>
              <button 
                onClick={() => setShowCompare(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                ✕ Close comparison
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column Choice */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Select Software Alpha</label>
                <select
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-xs uppercase tracking-wide text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">-- Choose Option --</option>
                  {softwareDatabase.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>

                {compTitle1 && (
                  <div className="bg-zinc-950/60 p-3 rounded-2xl border border-white/5 space-y-2 text-[11px]">
                    <div className="font-black text-cyan-400 text-xs uppercase">{compTitle1.name}</div>
                    <div><strong className="text-zinc-500">Developer:</strong> {compTitle1.developer}</div>
                    <div><strong className="text-zinc-500">Platform:</strong> {compTitle1.platformType.toUpperCase()} ({compTitle1.supportedPlatforms.join(', ')})</div>
                    <div><strong className="text-zinc-500">Min CPU:</strong> {compTitle1.minHardwareRequirements.cpu}</div>
                    <div><strong className="text-zinc-500">Min GPU:</strong> {compTitle1.minHardwareRequirements.gpu}</div>
                    <div><strong className="text-zinc-500">File Size:</strong> {compTitle1.fileSize}</div>
                    <div><strong className="text-zinc-500">User Rating:</strong> {compTitle1.ratings.userRating}/10</div>
                  </div>
                )}
              </div>

              {/* Matrix Compare Fields */}
              <div className="bg-zinc-950 rounded-2xl border border-white/5 p-4 flex flex-col justify-center items-center text-center text-xs space-y-3">
                <BarChart2 className="w-8 h-8 text-cyan-400 animate-pulse" />
                <h5 className="font-black text-white uppercase tracking-wider">Comparison Matrix Loaded</h5>
                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed max-w-[200px]">
                  Compare cross-play compatibility, memory footprints, and architectural optimization pipelines dynamically.
                </p>
                <div className="w-full grid grid-cols-2 gap-2 text-[9px] font-black text-zinc-400 border-t border-white/5 pt-2.5">
                  <div className="border-r border-white/5 uppercase">CLOUDSAVES: <span className="text-emerald-400">{compTitle1?.cloudSaves ? 'YES' : 'NO'}</span></div>
                  <div className="uppercase">CLOUDSAVES: <span className="text-emerald-400">{compTitle2?.cloudSaves ? 'YES' : 'NO'}</span></div>
                </div>
              </div>

              {/* Right Column Choice */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Select Software Beta</label>
                <select
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-xs uppercase tracking-wide text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">-- Choose Option --</option>
                  {softwareDatabase.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>

                {compTitle2 && (
                  <div className="bg-zinc-950/60 p-3 rounded-2xl border border-white/5 space-y-2 text-[11px]">
                    <div className="font-black text-fuchsia-400 text-xs uppercase">{compTitle2.name}</div>
                    <div><strong className="text-zinc-500">Developer:</strong> {compTitle2.developer}</div>
                    <div><strong className="text-zinc-500">Platform:</strong> {compTitle2.platformType.toUpperCase()} ({compTitle2.supportedPlatforms.join(', ')})</div>
                    <div><strong className="text-zinc-500">Min CPU:</strong> {compTitle2.minHardwareRequirements.cpu}</div>
                    <div><strong className="text-zinc-500">Min GPU:</strong> {compTitle2.minHardwareRequirements.gpu}</div>
                    <div><strong className="text-zinc-500">File Size:</strong> {compTitle2.fileSize}</div>
                    <div><strong className="text-zinc-500">User Rating:</strong> {compTitle2.ratings.userRating}/10</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT SIDEBAR: FILTERS AND QUIZ */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search Box */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Search Telemetry Engine</span>
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH TITLES, DEVS, GENRES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 focus:border-cyan-400 text-white rounded-2xl pl-10 pr-4 py-3 text-xs uppercase font-mono tracking-wider focus:outline-none transition-all placeholder:text-zinc-600"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>

              {/* Filter grid */}
              <div className="space-y-3 pt-2">
                {/* Platform */}
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Platform Type</label>
                  <div className="grid grid-cols-4 gap-1">
                    {platformsList.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedPlatform === p 
                            ? 'bg-cyan-500 text-zinc-950 border-cyan-400' 
                            : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Software Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] uppercase font-bold tracking-wider text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Release Release Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] uppercase font-bold tracking-wider text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {statusList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Sorting Index</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'name', label: '🔤 Title A-Z' },
                      { id: 'release', label: '📅 Release Date' },
                      { id: 'rating', label: '⭐ User Score' },
                      { id: 'size', label: '🗄️ File Weight' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSortBy(s.id as any)}
                        className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          sortBy === s.id
                            ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                            : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Compare trigger */}
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="w-full py-2.5 rounded-2xl bg-zinc-950 text-cyan-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {showCompare ? 'HIDE COMPARISON ENGINE' : 'LAUNCH COMPARISON ENGINE'}
                </button>
              </div>
            </div>

            {/* EDUCATION MODE: QUIZ & KNOWLEDGE MATRIX */}
            {educationMode && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">CS & Software History Quiz</h3>
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/5 space-y-3.5">
                  <div className="flex justify-between items-center text-[8.5px] font-black text-zinc-500 uppercase">
                    <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                    {quizScore !== null && <span className="text-amber-400 font-bold">SCORE: {quizScore} / {quizQuestions.length}</span>}
                  </div>

                  <p className="text-[10px] font-bold text-white uppercase leading-relaxed">
                    {quizQuestions[currentQuizIndex].question}
                  </p>

                  <div className="space-y-1.5">
                    {quizQuestions[currentQuizIndex].options.map((opt, oIdx) => {
                      const isCorrect = oIdx === quizQuestions[currentQuizIndex].correctIndex;
                      const isSelected = oIdx === selectedQuizAnswer;
                      return (
                        <button
                          key={oIdx}
                          disabled={quizAnswered}
                          onClick={() => handleAnswerSubmit(oIdx)}
                          className={`w-full text-left p-3 rounded-xl text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer ${
                            quizAnswered 
                              ? isCorrect 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : isSelected
                                ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                                : 'bg-zinc-900 border-white/5 text-zinc-500'
                              : 'bg-zinc-900 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>{opt}</span>
                          {quizAnswered && isCorrect && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                          {quizAnswered && isSelected && !isCorrect && <X className="w-3 h-3 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2">
                      <div className="text-[8.5px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Did you know?
                      </div>
                      <p className="text-[9px] text-zinc-300 font-medium leading-relaxed">
                        {quizQuestions[currentQuizIndex].explanation}
                      </p>
                      
                      {currentQuizIndex < quizQuestions.length - 1 ? (
                        <button
                          onClick={handleNextQuiz}
                          className="w-full mt-1.5 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:bg-amber-400 cursor-pointer"
                        >
                          CONTINUE ➔
                        </button>
                      ) : (
                        <button
                          onClick={resetQuiz}
                          className="w-full mt-1.5 py-1.5 bg-zinc-800 text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:bg-zinc-700 cursor-pointer"
                        >
                          REPLAY QUIZ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE GRID: SEARCH RESULTS SOFTWARE GRID */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Results count banner */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-4 flex items-center justify-between text-xs font-mono font-black uppercase text-zinc-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <Layers className="text-cyan-400 w-4 h-4" />
                Query Return: <strong className="text-zinc-200">{processedDatabase.length}</strong> Software Nodes Identified
              </span>
              <span className="text-[9px] text-zinc-600">Database Engine v4.0.2</span>
            </div>

            {/* Grid of cards */}
            {processedDatabase.length === 0 ? (
              <div className="bg-zinc-900/40 border border-dashed border-white/15 rounded-3xl p-16 text-center text-zinc-500 uppercase font-black text-xs space-y-3">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-zinc-600 animate-pulse mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <div>No architectural software specs match your query filters.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedDatabase.map((item) => {
                  const isSelectedForCompare = compareId1 === item.id || compareId2 === item.id;
                  
                  return (
                    <div 
                      key={item.id}
                      className="bg-zinc-900/60 border border-white/5 hover:border-cyan-500/25 p-5 rounded-3xl transition-all duration-200 relative group flex flex-col justify-between space-y-4 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                    >
                      {/* Top ribbon indicators */}
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-1.5 py-0.5 rounded uppercase font-mono">
                              {item.category}
                            </span>
                            <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${
                              item.status === 'Released' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : item.status === 'Delisted' || item.status === 'Cancelled' || item.status === 'Discontinued'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors mt-2">
                            {item.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Comparative checklist trigger */}
                          <button
                            onClick={() => {
                              if (!compareId1) {
                                setCompareId1(item.id);
                                setShowCompare(true);
                              } else if (!compareId2 && compareId1 !== item.id) {
                                setCompareId2(item.id);
                                setShowCompare(true);
                              } else {
                                // Reset compare
                                setCompareId1(item.id);
                                setCompareId2('');
                              }
                            }}
                            title="Add to Comparison Deck"
                            className={`p-1.5 rounded-lg border transition-all text-[8.5px] font-black cursor-pointer ${
                              isSelectedForCompare 
                                ? 'bg-cyan-500 border-cyan-400 text-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                                : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white'
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      {/* Specs pills */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-semibold text-zinc-500 bg-zinc-950/55 p-3 rounded-2xl border border-white/5">
                        <div className="truncate"><strong className="text-zinc-400 uppercase">Dev:</strong> {item.developer}</div>
                        <div className="truncate"><strong className="text-zinc-400 uppercase">Released:</strong> {item.releaseDate}</div>
                        <div className="truncate"><strong className="text-zinc-400 uppercase">Size:</strong> {item.fileSize}</div>
                        <div className="truncate"><strong className="text-zinc-400 uppercase">Model:</strong> {item.monetizationModel}</div>
                      </div>

                      {/* Educational fact snippets */}
                      {educationMode && (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl">
                          <span className="text-[7.5px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                            <Cpu className="w-3 h-3 text-amber-400 animate-pulse" />
                            CS & Graphic Pipeline Architecture
                          </span>
                          <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                            {item.educationFacts.replace('Architectural Lesson: ', '').replace('Design Lesson: ', '').replace('CS Lesson: ', '')}
                          </p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 w-full">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-black text-cyan-400">RATING: {item.ratings.userRating}/10</span>
                          <span className="text-zinc-600 text-[10px]">•</span>
                          <span className="text-[8.5px] font-bold text-zinc-500">{item.communityStats.monthlyActiveUsers}</span>
                        </div>

                        <button
                          onClick={() => setDetailTitleId(item.id)}
                          className="px-3.5 py-1.5 bg-zinc-900 border border-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Telemetry Dossier ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL TELEMETRY DOSSIER MODAL */}
      {detailTitle && (
        <div className="fixed inset-0 bg-black/95 z-[999999] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-cyan-400/30 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative font-sans text-zinc-300">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-t-3xl" />

            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 px-2.5 py-1 rounded-md uppercase tracking-widest">{detailTitle.category}</span>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-wider mt-2.5">{detailTitle.name}</h2>
                <p className="text-xs text-zinc-400 font-medium leading-normal mt-1 uppercase">Published by {detailTitle.publisher} • Released {detailTitle.releaseDate}</p>
              </div>
              <button
                onClick={() => setDetailTitleId(null)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all text-sm cursor-pointer border border-white/5"
              >
                ✕ Close
              </button>
            </div>

            {/* Dossier Body content */}
            <div className="space-y-6 text-xs">
              
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">System Node Overview</span>
                <p className="text-zinc-300 leading-relaxed font-medium text-sm">
                  {detailTitle.description}
                </p>
              </div>

              {/* Grid 1: Gameplay and Multiplayer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                  <h4 className="font-black text-white uppercase tracking-wider text-[11px] border-b border-white/5 pb-1.5">Core Gameplay Mechanics</h4>
                  <ul className="space-y-1.5">
                    {detailTitle.gameplayMechanics.map((mech, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{mech}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                  <h4 className="font-black text-white uppercase tracking-wider text-[11px] border-b border-white/5 pb-1.5">Multiplayer Features</h4>
                  <ul className="space-y-1.5">
                    {detailTitle.multiplayerFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hardware / System Requirements */}
              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                <h4 className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-white/5 pb-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Hardware Architecture & System Requirements
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                  {/* Min */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Minimum Configuration</span>
                    <div className="space-y-1.5 font-mono text-zinc-400">
                      <div><strong className="text-zinc-500 uppercase">CPU:</strong> {detailTitle.minHardwareRequirements.cpu}</div>
                      <div><strong className="text-zinc-500 uppercase">GPU:</strong> {detailTitle.minHardwareRequirements.gpu}</div>
                      <div><strong className="text-zinc-500 uppercase">RAM:</strong> {detailTitle.minHardwareRequirements.ram}</div>
                      <div><strong className="text-zinc-500 uppercase">Disk:</strong> {detailTitle.minHardwareRequirements.storage}</div>
                    </div>
                  </div>

                  {/* Rec */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">Recommended Configuration</span>
                    <div className="space-y-1.5 font-mono text-zinc-400">
                      <div><strong className="text-zinc-500 uppercase">CPU:</strong> {detailTitle.recHardwareRequirements.cpu}</div>
                      <div><strong className="text-zinc-500 uppercase">GPU:</strong> {detailTitle.recHardwareRequirements.gpu}</div>
                      <div><strong className="text-zinc-500 uppercase">RAM:</strong> {detailTitle.recHardwareRequirements.ram}</div>
                      <div><strong className="text-zinc-500 uppercase">Disk:</strong> {detailTitle.recHardwareRequirements.storage}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Additions: DLC, Versions, and Accessibility */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DLC */}
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-2.5">
                  <h5 className="font-black text-white uppercase text-[10px] tracking-wide border-b border-white/5 pb-1">DLC & Expansions</h5>
                  <div className="flex flex-wrap gap-1">
                    {detailTitle.dlcAndExpansions.map((dlc, idx) => (
                      <span key={idx} className="text-[8.5px] font-black bg-zinc-950 border border-white/5 text-zinc-400 px-2 py-1 rounded uppercase">
                        {dlc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-2.5">
                  <h5 className="font-black text-white uppercase text-[10px] tracking-wide border-b border-white/5 pb-1">Accessibility</h5>
                  <div className="flex flex-wrap gap-1">
                    {detailTitle.accessibilityFeatures.map((acc, idx) => (
                      <span key={idx} className="text-[8.5px] font-black bg-zinc-950 border border-white/5 text-cyan-300 px-2 py-1 rounded uppercase">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements & Saves */}
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-2.5 font-mono">
                  <h5 className="font-black text-white uppercase text-[10px] tracking-wide border-b border-white/5 pb-1 font-sans">Cloud Integrity</h5>
                  <div className="text-[10px] text-zinc-400 space-y-1 uppercase">
                    <div>🏆 Achievements: <strong className="text-zinc-200">{detailTitle.achievementsCount}</strong></div>
                    <div>💾 Cloud Saves: <strong className="text-emerald-400">{detailTitle.cloudSaves ? 'ONLINE' : 'OFFLINE'}</strong></div>
                    <div>📡 Cross-Platform: <strong className="text-emerald-400">{detailTitle.crossPlatformSupport ? 'ACTIVE' : 'INACTIVE'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Major Version Releases */}
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl space-y-3">
                <h5 className="font-black text-white uppercase text-[11px] tracking-wider border-b border-white/5 pb-1.5">Historical Major Versions Release Catalog</h5>
                <div className="space-y-2.5">
                  {detailTitle.majorVersions.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 font-mono text-[10px]">
                      <div className="shrink-0">
                        <span className="text-cyan-400 font-bold uppercase">{v.version}</span>
                        <span className="text-zinc-600 block text-[8px] mt-0.5">{v.releaseDate}</span>
                      </div>
                      <div className="text-zinc-400 uppercase leading-normal text-right font-sans">{v.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Mode Fact Sheet */}
              {educationMode && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4.5 h-4.5 text-amber-400" />
                    <h5 className="font-black text-white uppercase text-[11px] tracking-wider">A.U.R.A Neural Tutor Course Fact</h5>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed font-semibold italic">
                    {detailTitle.educationFacts}
                  </p>
                </div>
              )}

              {/* Metadata Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-white/5 font-mono text-[9px] uppercase font-bold text-zinc-500">
                <div>🌐 Official Website: <a href={detailTitle.officialWebsite} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline block truncate mt-1">{detailTitle.officialWebsite}</a></div>
                <div>🗣️ Languages: <span className="text-zinc-300 block mt-1 truncate">{detailTitle.languages.join(', ')}</span></div>
                <div>⭐ Metacritic: <span className="text-zinc-300 block mt-1">{detailTitle.ratings.metacritic || 'N/A'}/100</span></div>
                <div>🎮 Controllers: <span className="text-zinc-300 block mt-1">{detailTitle.controllersSupported?.join(', ') || 'Standard Input'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMusicStation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
          <div className="max-w-xl w-full">
            <MusicLoader onClose={() => setShowMusicStation(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
