const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf8');

const badInjection = `  voiceServers: {},
  activeVoiceServer: null,
  setVoiceServers: (servers) => set({ voiceServers: servers }),
  setActiveVoiceServer: (id) => set({ activeVoiceServer: id }),
  joinVoiceServer: (id) => {
    const state = get();
    if (state.socket && state.gamertag) {
      state.socket.emit('joinVoiceServer', { serverId: id, playerName: state.gamertag });
    }
  },
  leaveVoiceServer: () => {
    const state = get();
    if (state.socket) {
      state.socket.emit('leaveVoiceServer');
    }
  },
  createVoiceServer: (name) => {
    const state = get();
    if (state.socket) {
      state.socket.emit('createVoiceServer', name);
    }
  },
`;

code = code.replace(badInjection, "");

// Now inject it correctly in the `create` initial state, right above `modals: {` (the second occurrence).
const parts = code.split('modals: {\n    voice: false,');
if(parts.length === 2) {
  code = parts[0] + badInjection + '  modals: {\n    voice: false,' + parts[1];
}

fs.writeFileSync('src/store.ts', code);
console.log('Fixed store.ts syntax error');
