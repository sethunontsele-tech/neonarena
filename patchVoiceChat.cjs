const fs = require('fs');
let code = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');

const storeVars = `
  const otherPlayers = useGameStore(state => state.otherPlayers);
  const activeVoiceServer = useGameStore(state => state.activeVoiceServer);
  const voiceServers = useGameStore(state => state.voiceServers);
  
  const targetPeers = activeVoiceServer 
    ? (voiceServers[activeVoiceServer]?.participants || {}) 
    : otherPlayers;
`;

code = code.replace("const otherPlayers = useGameStore(state => state.otherPlayers);", storeVars);
code = code.replace(/Object\.keys\(otherPlayers\)/g, "Object.keys(targetPeers)");
code = code.replace(/otherPlayers\[id\]/g, "targetPeers[id]");
code = code.replace(/, otherPlayers\]/g, ", targetPeers]");

fs.writeFileSync('src/components/VoiceChat.tsx', code);
console.log('VoiceChat.tsx patched.');
