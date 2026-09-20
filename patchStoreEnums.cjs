const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

code = code.replace("export type MapType = 'open_world' | ", "export type MapType = 'neon_megacity' | 'cyber_factory' | 'abandoned_arena' | 'neon_wasteland' | 'sky_arena' | 'open_world' | ");
code = code.replace("export type GameMode = 'ffa' | ", "export type GameMode = 'survival' | 'boss_rush' | 'horde' | 'time_attack' | 'extraction' | 'chaos' | 'training' | 'ffa' | ");

fs.writeFileSync('src/store.ts', code);
console.log('Enums patched.');
