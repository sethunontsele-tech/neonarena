const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

code = code.replace("modals: {", "modals: { voice: boolean;");
code = code.replace("modals: {\n    casino: false,", "modals: {\n    voice: false,\n    casino: false,");

fs.writeFileSync('src/store.ts', code);
console.log('store.ts patched with voice modal state.');
