import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, BookOpen, Layers, Laptop, Monitor, Smartphone, Gamepad2, 
  Cpu, Users, Calendar, Coins, Settings, Award, HelpCircle, Trophy, Sparkles, 
  ArrowRightLeft, Clock, Info, Check, X, ShieldAlert, GraduationCap, 
  ChevronDown, BarChart2, Tv, RefreshCw, Languages, Zap, Heart, Sliders
} from 'lucide-react';

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
    </div>
  );
}
