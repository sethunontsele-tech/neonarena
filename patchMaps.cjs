const fs = require('fs');
let code = fs.readFileSync('src/data/arenaMaps.ts', 'utf8');

const newMaps = `
  {
    id: 'neon_megacity',
    name: 'Neon Megacity',
    year: 2026,
    creator: 'Neon Forge',
    genre: 'Cyberpunk Combat',
    platform: 'All',
    desc: 'A gigantic futuristic city with skyscrapers, alleys, and neon billboards.',
    servers: ['Sector 1', 'Undercity', 'Rooftops'],
    difficulty: 'Hard',
    rating: 'T',
    players: '456K+',
    award: 'Best Atmosphere',
    gradient: 'from-fuchsia-900 via-purple-900 to-black border-fuchsia-400/20',
    badge: '456MB UPDATE'
  },
  {
    id: 'cyber_factory',
    name: 'Cyber Factory',
    year: 2026,
    creator: 'Neon Forge',
    genre: 'Industrial Warfare',
    platform: 'All',
    desc: 'Huge industrial facility with moving platforms and dangerous machinery.',
    servers: ['Assembly Line', 'Reactor Core'],
    difficulty: 'Extreme',
    rating: 'T',
    players: '102K+',
    award: 'Most Dangerous',
    gradient: 'from-yellow-900 via-orange-900 to-black border-yellow-400/20',
    badge: '456MB UPDATE'
  },
  {
    id: 'abandoned_arena',
    name: 'Abandoned Arena',
    year: 2026,
    creator: 'Neon Forge',
    genre: 'Ruins',
    platform: 'All',
    desc: 'An old version of Neon Arena, abandoned and full of secrets.',
    servers: ['Ruins', 'Forgotten Labs'],
    difficulty: 'Medium',
    rating: 'T',
    players: '200K+',
    award: 'Lore Rich',
    gradient: 'from-gray-900 via-zinc-900 to-black border-gray-400/20',
    badge: '456MB UPDATE'
  },
  {
    id: 'neon_wasteland',
    name: 'Neon Wasteland',
    year: 2026,
    creator: 'Neon Forge',
    genre: 'Open Combat',
    platform: 'All',
    desc: 'Large outdoor combat environment with energy storms and ruins.',
    servers: ['Wastes', 'Storm Center'],
    difficulty: 'Hard',
    rating: 'T',
    players: '350K+',
    award: 'Best Environment',
    gradient: 'from-rose-900 via-red-900 to-black border-rose-400/20',
    badge: '456MB UPDATE'
  },
  {
    id: 'sky_arena',
    name: 'Sky Arena',
    year: 2026,
    creator: 'Neon Forge',
    genre: 'Aerial Combat',
    platform: 'All',
    desc: 'Floating combat environment with huge drops and energy bridges.',
    servers: ['Cloud City', 'Upper Atmosphere'],
    difficulty: 'Extreme',
    rating: 'T',
    players: '180K+',
    award: 'Most Thrilling',
    gradient: 'from-sky-900 via-cyan-900 to-black border-sky-400/20',
    badge: '456MB UPDATE'
  },
`;

code = code.replace("];\\n\\nconst generatedModes", newMaps + "];\\n\\nconst generatedModes");
fs.writeFileSync('src/data/arenaMaps.ts', code);
console.log('Maps patched.');
