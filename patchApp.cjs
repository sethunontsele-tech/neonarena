const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { InfinityAcademyVR } from './components/InfinityAcademyVR';", "import { InfinityAcademyVR } from './components/InfinityAcademyVR';\nimport { QuickAccessBar } from './components/QuickAccessBar';");

const target = "{isMobile && gameState === 'playing' && <MobileControls />}";
const replacement = "{isMobile && gameState === 'playing' && <MobileControls />}\n      {gameState === 'playing' && (useGameStore.getState().selectedMap === 'arena' || useGameStore.getState().selectedMap === 'infinity_academy') && <QuickAccessBar />}";
code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched.');
