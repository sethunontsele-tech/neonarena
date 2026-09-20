const fs = require('fs');
let code = fs.readFileSync('src/components/QuickAccessBar.tsx', 'utf8');

const newItems = `
    { id: '1', type: 'potion', name: 'Health Potion', icon: 'FlaskConical', quantity: 5, rarity: 'common', description: 'Restores 50 HP', effect: 'heal' },
    { id: '2', type: 'spell', name: 'Lightning Bolt', icon: 'Zap', quantity: 1, rarity: 'rare', description: 'Deals 30 damage', stats: { damage: 30 } },
    { id: '3', type: 'weapon', name: 'Plasma Whip', icon: 'Flame', quantity: 1, rarity: 'legendary', description: 'V2.0.0 Experimental Energy Weapon.', stats: { damage: 150 } },
    { id: '4', type: 'weapon', name: 'Stasis Field', icon: 'Shield', quantity: 1, rarity: 'epic', description: 'Freezes time in a small radius.', stats: { duration: 5 } },
    { id: '5', type: 'armor', name: 'Titan Exosuit', icon: 'Shield', quantity: 1, rarity: 'legendary', description: 'Heavy sentinel class armor.', stats: { defense: 200 } }
`;

code = code.replace(/    { id: '1', type: 'potion'.*?    { id: '2', type: 'spell'.*?  \]/s, newItems + '\n  ]');

fs.writeFileSync('src/components/QuickAccessBar.tsx', code);
console.log('Inventory patched.');
