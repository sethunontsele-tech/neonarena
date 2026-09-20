const fs = require('fs');
let code = fs.readFileSync('src/components/QuickAccessBar.tsx', 'utf8');

code = code.replace(/\\\${/g, '${');
code = code.replace(/\\`/g, '`');

fs.writeFileSync('src/components/QuickAccessBar.tsx', code);
console.log('Fixed slashes in QuickAccessBar.tsx');
