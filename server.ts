/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // Global Game State
  const MAX_PLAYERS = 60;
  let playerCounter = 1;

  interface RoomState {
    id: string;
    currentMap: 'maze' | 'arena' | 'pillars' | 'flat';
    currentMode: 'ffa' | 'tdm' | 'ctf' | 'creative';
    teamScores: { amber: number, blue: number };
    flags: { team: 'amber' | 'blue', position: [number, number, number], carrierId: string | null }[];
    blocks: { id: string, type: string, position: [number, number, number] }[];
    settings: {
      jumpHeight: number;
      gravity: number;
      botDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
      botCount: number;
    };
    enemies: Record<string, {
      id: string,
      position: [number, number, number],
      rotation: number,
      health: number,
      state: 'active' | 'disabled',
      disabledUntil: number,
      team: 'none' | 'amber' | 'blue'
    }>;
    players: Record<string, { 
      id: string, 
      name: string, 
      position: [number, number, number], 
      rotation: number, 
      state: 'active' | 'disabled', 
      disabledUntil: number, 
      score: number, 
      color: string, 
      skin: string, 
      pattern: string,
      accessories: string[],
      health: number, 
      kills: number, 
      deaths: number,
      team: 'none' | 'amber' | 'blue',
      weapon: string,
      isSprinting: boolean,
      isSliding: boolean,
      isBuildMode: boolean,
      selectedBlock: string
    }>;
  }

  const rooms: Record<string, RoomState> = {};

  async function getOrCreateRoom(roomId: string | null, privateServerName?: string): Promise<RoomState> {
    let id = roomId || 'global';
    if (privateServerName && privateServerName.trim() !== '') {
      id = `private-${privateServerName.trim().toLowerCase()}`;
    }

    if (!rooms[id]) {
      rooms[id] = {
        id,
        currentMap: 'maze',
        currentMode: 'ffa',
        teamScores: { amber: 0, blue: 0 },
        flags: [
          { team: 'amber', position: [0, 0, 80], carrierId: null },
          { team: 'blue', position: [0, 0, -80], carrierId: null }
        ],
        blocks: [],
        settings: {
          jumpHeight: 1.5,
          gravity: 9.81,
          botDifficulty: 'medium',
          botCount: 4
        },
        enemies: {},
        players: {}
      };

      // Initialize bots
      for (let i = 0; i < rooms[id].settings.botCount; i++) {
        const botId = `bot-${i}`;
        rooms[id].enemies[botId] = {
          id: botId,
          position: [Math.random() * 40 - 20, 0, Math.random() * 40 - 20],
          rotation: 0,
          health: 100,
          state: 'active',
          disabledUntil: 0,
          team: 'none'
        };
      }

      // Load custom map for private servers
      if (id.startsWith('private-')) {
        try {
          const docRef = doc(db, 'maps', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            rooms[id].blocks = data.blocks || [];
            if (data.currentMap) rooms[id].currentMap = data.currentMap;
            if (data.currentMode) rooms[id].currentMode = data.currentMode;
          }
        } catch (error) {
          console.error('Error loading map from Firestore:', error);
        }
      }
    }
    return rooms[id];
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    let currentRoomId: string | null = null;

    socket.on('joinGame', async (data: { skin: string, color?: string, pattern?: string, accessories?: string[], map: 'maze' | 'arena' | 'pillars' | 'flat', mode: 'ffa' | 'tdm' | 'ctf' | 'creative', roomId?: string, privateServerName?: string, name?: string }) => {
      const room = await getOrCreateRoom(data.roomId || null, data.privateServerName);
      currentRoomId = room.id;

      if (Object.keys(room.players).length >= MAX_PLAYERS) {
        socket.emit('gameError', 'Room is full (60/60 players)');
        return;
      }
      
      socket.join(room.id);

      // If it's the first player in room, they set the map and mode
      if (Object.keys(room.players).length === 0) {
        if (data.map) room.currentMap = data.map;
        if (data.mode) room.currentMode = data.mode;
      }
      
      const playerName = data.name || `Player ${playerCounter++}`;

      // Assign team
      let team: 'none' | 'amber' | 'blue' = 'none';
      if (room.currentMode !== 'ffa') {
        const amberCount = Object.values(room.players).filter(p => p.team === 'amber').length;
        const blueCount = Object.values(room.players).filter(p => p.team === 'blue').length;
        team = amberCount <= blueCount ? 'amber' : 'blue';
      }

      const color = data.color || (team === 'amber' ? '#f59e0b' : (team === 'blue' ? '#3b82f6' : '#f59e0b'));

      room.players[socket.id] = {
        id: socket.id,
        name: playerName,
        position: [0, 2, 0],
        rotation: 0,
        state: 'active',
        disabledUntil: 0,
        score: 0,
        color,
        skin: data.skin || 'neon',
        pattern: data.pattern || 'none',
        accessories: data.accessories || [],
        health: 100,
        kills: 0,
        deaths: 0,
        team,
        weapon: 'pistol',
        isSprinting: false,
        isSliding: false,
        isBuildMode: false,
        selectedBlock: 'stone'
      };

      // Send initial state
      socket.emit('gameJoined', { 
        players: room.players, 
        team, 
        mode: room.currentMode,
        flags: room.currentMode === 'ctf' ? room.flags : [],
        blocks: room.blocks,
        roomId: room.id
      });
      socket.emit('mapChanged', room.currentMap);
      
      if (room.currentMode !== 'ffa') {
        socket.emit('teamScores', room.teamScores);
      }

      // Broadcast to others in room
      socket.to(room.id).emit('playerJoined', room.players[socket.id]);
    });

    socket.on('move', (data: { position: [number, number, number], rotation: number, weapon?: string, isSprinting?: boolean, isSliding?: boolean, isBuildMode?: boolean, selectedBlock?: string }) => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.players[socket.id]) {
        const p = room.players[socket.id];
        p.position = data.position;
        p.rotation = data.rotation;
        if (data.weapon) p.weapon = data.weapon;
        if (data.isSprinting !== undefined) p.isSprinting = data.isSprinting;
        if (data.isSliding !== undefined) p.isSliding = data.isSliding;
        if (data.isBuildMode !== undefined) p.isBuildMode = data.isBuildMode;
        if (data.selectedBlock !== undefined) p.selectedBlock = data.selectedBlock;
        
        socket.to(room.id).emit('playerMoved', { id: socket.id, ...data });

        // CTF Flag Logic
        if (room.currentMode === 'ctf') {
          room.flags.forEach(flag => {
            if (flag.carrierId === socket.id) {
              flag.position = [data.position[0], data.position[1] + 1, data.position[2]];
              io.to(room.id).emit('flagUpdate', room.flags);

              // Check for capture
              const myBasePos = p.team === 'amber' ? [0, 0, 80] : [0, 0, -80];
              
              if (flag.team !== p.team) {
                const distToBase = Math.sqrt(
                  Math.pow(data.position[0] - myBasePos[0], 2) +
                  Math.pow(data.position[2] - myBasePos[2], 2)
                );

                if (distToBase < 5) {
                  const team = p.team as 'amber' | 'blue';
                  room.teamScores[team] += 1;
                  flag.carrierId = null;
                  flag.position = flag.team === 'amber' ? [0, 0, 80] : [0, 0, -80];
                  io.to(room.id).emit('teamScores', room.teamScores);
                  io.to(room.id).emit('flagUpdate', room.flags);
                  io.to(room.id).emit('flagEvent', { message: `${p.name} captured the ${flag.team} flag!` });
                  p.score += 500;
                }
              }
            } else if (flag.carrierId === null) {
              const distToFlag = Math.sqrt(
                Math.pow(data.position[0] - flag.position[0], 2) +
                Math.pow(data.position[2] - flag.position[2], 2)
              );

              if (distToFlag < 2 && p.state === 'active') {
                if (flag.team !== p.team) {
                  flag.carrierId = socket.id;
                  io.to(room.id).emit('flagUpdate', room.flags);
                  io.to(room.id).emit('flagEvent', { message: `${p.name} picked up the ${flag.team} flag!` });
                } else {
                  const basePos = flag.team === 'amber' ? [0, 0, 80] : [0, 0, -80];
                  const distToBase = Math.sqrt(
                    Math.pow(flag.position[0] - basePos[0], 2) +
                    Math.pow(flag.position[2] - basePos[2], 2)
                  );
                  if (distToBase > 5) {
                    flag.position = basePos as [number, number, number];
                    io.to(room.id).emit('flagUpdate', room.flags);
                    io.to(room.id).emit('flagEvent', { message: `${p.name} returned the ${flag.team} flag!` });
                  }
                }
              }
            }
          });
        }
      }
    });

    socket.on('chatMessage', (data: { message: string, type: 'global' | 'proximity' }) => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.players[socket.id]) {
        const p = room.players[socket.id];
        const msg = {
          id: Math.random().toString(),
          sender: p.name,
          message: data.message,
          timestamp: Date.now(),
          type: data.type
        };

        if (data.type === 'global') {
          io.to(room.id).emit('chatMessage', msg);
        } else {
          // Proximity chat
          Object.values(room.players).forEach(otherP => {
            const dist = Math.sqrt(
              Math.pow(p.position[0] - otherP.position[0], 2) +
              Math.pow(p.position[2] - otherP.position[2], 2)
            );
            if (dist < 30) {
              io.to(otherP.id).emit('chatMessage', msg);
            }
          });
        }
      }
    });

    socket.on('shoot', (data: { start: [number, number, number], end: [number, number, number], color: string }) => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit('playerShot', { id: socket.id, ...data });
      }
    });

    socket.on('hitPlayer', (data: { targetId: string, damage?: number }) => {
      const room = rooms[currentRoomId || 'global'];
      if (!room) return;

      const targetId = typeof data === 'string' ? data : data.targetId;
      const damage = typeof data === 'object' ? (data.damage ?? 20) : 20;

      if (room.players[targetId] && room.players[socket.id]) {
        const target = room.players[targetId];
        const shooter = room.players[socket.id];

        if (room.currentMode !== 'ffa' && target.team === shooter.team && damage > 0) {
          return;
        }

        if (target.state === 'active') {
          target.health = Math.min(100, Math.max(0, target.health - damage));
          
          if (target.health <= 0) {
            target.state = 'disabled';
            target.disabledUntil = Date.now() + 3000;
            target.deaths += 1;
            
            if (targetId !== socket.id) {
              shooter.score += 100;
              shooter.kills += 1;

              if (room.currentMode !== 'ffa') {
                const team = shooter.team as 'amber' | 'blue';
                room.teamScores[team] += 10;
                io.to(room.id).emit('teamScores', room.teamScores);
              }
            }

            if (room.currentMode === 'ctf') {
              room.flags.forEach(flag => {
                if (flag.carrierId === targetId) {
                  flag.carrierId = null;
                  io.to(room.id).emit('flagUpdate', room.flags);
                  io.to(room.id).emit('flagEvent', { message: `${target.name} dropped the ${flag.team} flag!` });
                }
              });
            }
            
            setTimeout(() => {
              if (room.players[targetId]) {
                room.players[targetId].state = 'active';
                room.players[targetId].health = 100;
              }
            }, 3000);
          } else if (damage > 0) {
            if (targetId !== socket.id) {
              shooter.score += 20;
            }
          }
          
          io.to(room.id).emit('playerHit', {
            targetId,
            shooterId: socket.id,
            targetDisabledUntil: target.disabledUntil,
            shooterScore: shooter.score,
            targetHealth: target.health,
            shooterKills: shooter.kills,
            targetDeaths: target.deaths
          });
        }
      }
    });

    socket.on('emote', (emote: string) => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.players[socket.id]) {
        io.to(room.id).emit('emote', { id: socket.id, emote });
      }
    });

    socket.on('placeBlock', (data: { type: string, position: [number, number, number] }) => {
      const room = rooms[currentRoomId || 'global'];
      if (room) {
        const block = {
          id: `block-${Math.random().toString(36).substr(2, 9)}`,
          type: data.type,
          position: data.position
        };
        room.blocks.push(block);
        io.to(room.id).emit('blockPlaced', block);
      }
    });

    socket.on('breakBlock', (id: string) => {
      const room = rooms[currentRoomId || 'global'];
      if (room) {
        room.blocks = room.blocks.filter(b => b.id !== id);
        io.to(room.id).emit('blockBroken', id);
      }
    });

    socket.on('saveMap', async () => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.id.startsWith('private-')) {
        try {
          const docRef = doc(db, 'maps', room.id);
          await setDoc(docRef, {
            blocks: room.blocks,
            currentMap: room.currentMap,
            currentMode: room.currentMode,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
          socket.emit('chatMessage', {
            id: Math.random().toString(),
            sender: 'System',
            message: 'Map saved successfully!',
            timestamp: Date.now(),
            type: 'system'
          });
        } catch (error) {
          console.error('Error saving map to Firestore:', error);
          socket.emit('chatMessage', {
            id: Math.random().toString(),
            sender: 'System',
            message: 'Failed to save map.',
            timestamp: Date.now(),
            type: 'system'
          });
        }
      }
    });

    socket.on('clearMap', () => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.id.startsWith('private-')) {
        room.blocks = [];
        io.to(room.id).emit('mapCleared');
        socket.emit('chatMessage', {
          id: Math.random().toString(),
          sender: 'System',
          message: 'Map cleared!',
          timestamp: Date.now(),
          type: 'system'
        });
      }
    });

    socket.on('updateSettings', (settings: any) => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.id.startsWith('private-')) {
        room.settings = { ...room.settings, ...settings };
        io.to(room.id).emit('settingsUpdated', room.settings);
        
        // Persist settings if it's a private server
        const docRef = doc(db, 'maps', room.id);
        updateDoc(docRef, { settings: room.settings }).catch(err => console.error('Error updating settings:', err));
        
        socket.emit('chatMessage', {
          id: Math.random().toString(),
          sender: 'System',
          message: 'Settings updated!',
          timestamp: Date.now(),
          type: 'system'
        });
      }
    });

    socket.on('fireProjectile', (data: any) => {
      socket.to(currentRoomId || 'global').emit('projectileFired', data);
    });

    // WebRTC Signaling
    socket.on('signal', (data: { to: string, signal: any }) => {
      io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
      const room = rooms[currentRoomId || 'global'];
      if (room && room.players[socket.id]) {
        if (room.currentMode === 'ctf') {
          room.flags.forEach(flag => {
            if (flag.carrierId === socket.id) {
              flag.carrierId = null;
              io.to(room.id).emit('flagUpdate', room.flags);
            }
          });
        }

        delete room.players[socket.id];
        io.to(room.id).emit('playerLeft', socket.id);

        if (Object.keys(room.players).length === 0 && room.id !== 'global') {
          delete rooms[room.id];
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Server-side Game Loop (for Bots and Time)
  setInterval(() => {
    const now = Date.now();
    Object.values(rooms).forEach(room => {
      // Update Bots
      const botIds = Object.keys(room.enemies);
      if (botIds.length > 0) {
        const playerIds = Object.keys(room.players);
        
        botIds.forEach(botId => {
          const bot = room.enemies[botId];
          if (bot.state === 'disabled') {
            if (now > bot.disabledUntil) {
              bot.state = 'active';
              bot.health = 100;
              io.to(room.id).emit('enemyUpdate', { id: botId, state: 'active', health: 100 });
            }
            return;
          }

          // Simple AI: Move towards nearest player
          if (playerIds.length > 0) {
            let nearestPlayerId = playerIds[0];
            let minDistance = Infinity;

            playerIds.forEach(pid => {
              const player = room.players[pid];
              const dist = Math.sqrt(
                Math.pow(player.position[0] - bot.position[0], 2) +
                Math.pow(player.position[2] - bot.position[2], 2)
              );
              if (dist < minDistance) {
                minDistance = dist;
                nearestPlayerId = pid;
              }
            });

            const target = room.players[nearestPlayerId];
            const dx = target.position[0] - bot.position[0];
            const dz = target.position[2] - bot.position[2];
            const angle = Math.atan2(dx, dz);
            bot.rotation = angle;

            // Move bot
            const speed = 0.05;
            if (minDistance > 5) {
              bot.position[0] += Math.sin(angle) * speed;
              bot.position[2] += Math.cos(angle) * speed;
            }

            // Shooting logic
            if (minDistance < 20 && Math.random() < 0.02) {
              io.to(room.id).emit('enemyShot', { 
                id: botId, 
                start: bot.position, 
                end: target.position, 
                color: '#ff0000' 
              });
              
              // Randomly hit player
              if (Math.random() < 0.3) {
                const damage = 10;
                target.health -= damage;
                if (target.health <= 0) {
                  target.health = 0;
                  target.state = 'disabled';
                  target.deaths += 1;
                  target.disabledUntil = now + 3000;
                }
                io.to(room.id).emit('playerHit', {
                  targetId: nearestPlayerId,
                  shooterId: botId,
                  targetDisabledUntil: target.disabledUntil,
                  shooterScore: 0,
                  targetHealth: target.health,
                  shooterKills: 0,
                  targetDeaths: target.deaths
                });
              }
            }
          }
        });

        io.to(room.id).emit('enemiesMoved', room.enemies);
      }
    });
  }, 100);
}

startServer();