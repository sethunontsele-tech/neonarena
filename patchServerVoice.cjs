const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const interfaces = `
interface VoiceServer {
  id: string;
  name: string;
  creatorId: string;
  participants: { [socketId: string]: string };
}

const globalVoiceServers: Record<string, VoiceServer> = {
  'general': { id: 'general', name: 'General Comms', creatorId: 'system', participants: {} },
  'tactical': { id: 'tactical', name: 'Tactical Radio', creatorId: 'system', participants: {} }
};
`;

code = code.replace("const rooms: Record<string, Room> = {};", interfaces + "\nconst rooms: Record<string, Room> = {};");

const voiceHandlers = `
    socket.on('getVoiceServers', () => {
      socket.emit('voiceServersList', globalVoiceServers);
    });

    socket.on('createVoiceServer', (name: string) => {
      const id = 'vs_' + Math.random().toString(36).substr(2, 9);
      globalVoiceServers[id] = {
        id,
        name,
        creatorId: socket.id,
        participants: {}
      };
      io.emit('voiceServersList', globalVoiceServers);
    });

    socket.on('joinVoiceServer', (data: { serverId: string, playerName: string }) => {
      // Remove from previous
      for (const vsId in globalVoiceServers) {
        if (globalVoiceServers[vsId].participants[socket.id]) {
          delete globalVoiceServers[vsId].participants[socket.id];
          io.to(\`voice_\${vsId}\`).emit('voiceServerParticipantLeft', socket.id);
          socket.leave(\`voice_\${vsId}\`);
        }
      }
      
      const vs = globalVoiceServers[data.serverId];
      if (vs) {
        vs.participants[socket.id] = data.playerName;
        socket.join(\`voice_\${vs.id}\`);
        io.to(\`voice_\${vs.id}\`).emit('voiceServerParticipantJoined', { id: socket.id, name: data.playerName });
        io.emit('voiceServersList', globalVoiceServers);
        socket.emit('joinedVoiceServer', vs.id);
      }
    });

    socket.on('leaveVoiceServer', () => {
      for (const vsId in globalVoiceServers) {
        if (globalVoiceServers[vsId].participants[socket.id]) {
          delete globalVoiceServers[vsId].participants[socket.id];
          io.to(\`voice_\${vsId}\`).emit('voiceServerParticipantLeft', socket.id);
          socket.leave(\`voice_\${vsId}\`);
        }
      }
      socket.emit('joinedVoiceServer', null);
      io.emit('voiceServersList', globalVoiceServers);
    });
`;

code = code.replace("socket.on('updateSettings', (newSettings: any) => {", voiceHandlers + "\n    socket.on('updateSettings', (newSettings: any) => {");

const disconnectHandlerPatch = `
      // Leave voice servers
      for (const vsId in globalVoiceServers) {
        if (globalVoiceServers[vsId].participants[socket.id]) {
          delete globalVoiceServers[vsId].participants[socket.id];
          io.to(\`voice_\${vsId}\`).emit('voiceServerParticipantLeft', socket.id);
        }
      }
      io.emit('voiceServersList', globalVoiceServers);
`;

code = code.replace("console.log('Client disconnected:', socket.id);", "console.log('Client disconnected:', socket.id);\n" + disconnectHandlerPatch);

fs.writeFileSync('server.ts', code);
console.log('server.ts patched with Voice Servers.');
