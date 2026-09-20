const fs = require('fs');
let code = fs.readFileSync('src/components/VoiceServersModal.tsx', 'utf8');

code = code.replace(/\\\${/g, '${');
code = code.replace(/\\`/g, '`');

fs.writeFileSync('src/components/VoiceServersModal.tsx', code);
console.log('Fixed slashes in VoiceServersModal.tsx');
