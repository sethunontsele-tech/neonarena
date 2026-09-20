const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

const interfaceInjection = `
export interface VoiceServer {
  id: string;
  name: string;
  creatorId: string;
  participants: Record<string, string>;
}
`;
code = interfaceInjection + "\n" + code;
fs.writeFileSync('src/store.ts', code);
console.log('VoiceServer interface injected.');
