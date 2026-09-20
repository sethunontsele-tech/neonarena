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
code = code.replace("export interface GameState {", interfaceInjection + "\nexport interface GameState {");

const stateInterfaceInjection = `
  voiceServers: Record<string, VoiceServer>;
  activeVoiceServer: string | null;
  setVoiceServers: (servers: Record<string, VoiceServer>) => void;
  setActiveVoiceServer: (id: string | null) => void;
  joinVoiceServer: (id: string) => void;
  leaveVoiceServer: () => void;
  createVoiceServer: (name: string) => void;
`;
code = code.replace("modals:", stateInterfaceInjection + "\n  modals:");

const stateInitialInjection = `
  voiceServers: {},
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
code = code.replace("modals: {", stateInitialInjection + "\n  modals: {");

const socketListenersInjection = `
    socket.on('voiceServersList', (servers: Record<string, VoiceServer>) => {
      set({ voiceServers: servers });
    });
    socket.on('joinedVoiceServer', (id: string | null) => {
      set({ activeVoiceServer: id });
    });
`;
code = code.replace("socket.on('gameStarted', () => {", socketListenersInjection + "\n    socket.on('gameStarted', () => {");

fs.writeFileSync('src/store.ts', code);
console.log('store.ts patched with Voice Servers.');
