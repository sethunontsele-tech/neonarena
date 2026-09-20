const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

const newItems = `
  inventoryItems: [
    { id: '1', type: 'potion', name: 'Health Potion', icon: 'FlaskConical', quantity: 5, rarity: 'common', description: 'Restores 50 HP', effect: 'heal' },
    { id: '2', type: 'spell', name: 'Lightning Bolt', icon: 'Zap', quantity: 1, rarity: 'rare', description: 'Deals 30 damage', stats: { damage: 30 } },
    { id: '3', type: 'weapon', name: 'Plasma Whip', icon: 'Flame', quantity: 1, rarity: 'legendary', description: 'V2.0.0 Experimental Energy Weapon.', stats: { damage: 150 } },
    { id: '4', type: 'weapon', name: 'Stasis Field', icon: 'Shield', quantity: 1, rarity: 'epic', description: 'Freezes time in a small radius.', stats: { duration: 5 } },
    { id: '5', type: 'armor', name: 'Titan Exosuit', icon: 'Shield', quantity: 1, rarity: 'legendary', description: 'Heavy sentinel class armor.', stats: { defense: 200 } },
    { id: '6', type: 'artifact', name: 'Phase Core', icon: 'Zap', quantity: 3, rarity: 'epic', description: 'Dropped by Phase Hunters. Upgrades movement abilities.', stats: { value: 1000 } }
  ],
`;

code = code.replace(/  inventoryItems: \[\n    \{ id: '1'.*?\n    \{ id: '2'.*?\n  \],/s, newItems);

fs.writeFileSync('src/store.ts', code);
console.log('Store inventory patched.');
