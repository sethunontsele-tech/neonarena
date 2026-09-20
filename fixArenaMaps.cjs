const fs = require('fs');
let code = fs.readFileSync('src/data/arenaMaps.ts', 'utf8');

// The original file ends with `];`
// But we appended the logic, which should work for push. 
// Wait, `gradient` uses invalid tailwind classes: `from-[#00ffff]`. 
// That's fine as arbitrary values are supported by JIT but not pre-compiled, it might not render properly but TS doesn't care.
