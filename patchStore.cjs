const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

const newInterfaceFields = `
  // Quick Access Bar Integration
  equippedSkills: string[];
  equippedArmor: { head?: string; chest?: string; legs?: string; hands?: string; feet?: string; };
  equippedStaff: string | null;
  selectedMagic: string[];
  selectedSpells: string[];
  inventoryItems: { id: string; type: string; name: string; icon: string; quantity: number; rarity: string; description: string; effect?: string; stats?: any }[];
  
  setEquippedSkills: (skills: string[]) => void;
  setEquippedArmor: (slot: 'head' | 'chest' | 'legs' | 'hands' | 'feet', armorId: string | undefined) => void;
  setEquippedStaff: (staffId: string | null) => void;
  setSelectedMagic: (magic: string[]) => void;
  setSelectedSpells: (spells: string[]) => void;
  setInventoryItems: (items: any[]) => void;
`;

code = code.replace(/    worldName: string;\n  }\) => void;\n}/, `    worldName: string;\n  }) => void;${newInterfaceFields}}`);

const newStateFields = `
  equippedSkills: ['dash', 'double_jump'],
  equippedArmor: {},
  equippedStaff: null,
  selectedMagic: ['fireball'],
  selectedSpells: ['heal'],
  inventoryItems: [
    { id: '1', type: 'potion', name: 'Health Potion', icon: 'FlaskConical', quantity: 5, rarity: 'common', description: 'Restores 50 HP', effect: 'heal' },
    { id: '2', type: 'spell', name: 'Lightning Bolt', icon: 'Zap', quantity: 1, rarity: 'rare', description: 'Deals 30 damage', stats: { damage: 30 } }
  ],
  setEquippedSkills: (skills) => set({ equippedSkills: skills }),
  setEquippedArmor: (slot, armorId) => set((state) => ({ equippedArmor: { ...state.equippedArmor, [slot]: armorId } })),
  setEquippedStaff: (staffId) => set({ equippedStaff: staffId }),
  setSelectedMagic: (magic) => set({ selectedMagic: magic }),
  setSelectedSpells: (spells) => set({ selectedSpells: spells }),
  setInventoryItems: (items) => set({ inventoryItems: items }),
`;

code = code.replace(/  gameState: 'splash',/, `  gameState: 'splash',${newStateFields}`);

fs.writeFileSync('src/store.ts', code);
console.log('store.ts patched.');
