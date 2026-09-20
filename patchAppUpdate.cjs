const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/seen_mega_update_v15/g, 'seen_mega_update_v20');
code = code.replace(/UPDATE V1.5/g, '456MB UPDATE');
code = code.replace(/className="bg-blue-500\/10 text-blue-400 border-2 border-blue-500\/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all animate-pulse"/, 'className="bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20 px-6 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all animate-pulse"');

fs.writeFileSync('src/App.tsx', code);
console.log('App patched.');
