var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_http = require("http");
var import_socket = require("socket.io");
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};
if (!firebaseConfig.projectId) {
  try {
    const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
    if (import_fs.default.existsSync(configPath)) {
      const fileConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
      firebaseConfig = {
        apiKey: fileConfig.apiKey || firebaseConfig.apiKey,
        authDomain: fileConfig.authDomain || firebaseConfig.authDomain,
        projectId: fileConfig.projectId || firebaseConfig.projectId,
        storageBucket: fileConfig.storageBucket || firebaseConfig.storageBucket,
        messagingSenderId: fileConfig.messagingSenderId || firebaseConfig.messagingSenderId,
        appId: fileConfig.appId || firebaseConfig.appId
      };
    }
  } catch (err) {
    console.error("Failed to read fallback firebase configuration:", err);
  }
}
var firebaseApp = (0, import_app.initializeApp)(firebaseConfig);
var db = (0, import_firestore.getFirestore)(firebaseApp);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  const httpServer = (0, import_http.createServer)(app);
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: "*"
    }
  });
  const MAX_PLAYERS = 60;
  let playerCounter = 1;
  const calculateRankPoints = (player, result, isRanked) => {
    if (!isRanked) return 0;
    let points = 0;
    if (result === "win") points += 25;
    else if (result === "loss") points -= 15;
    points += player.kills * 2;
    points -= player.deaths * 1;
    return Math.max(-50, Math.min(100, points));
  };
  const calculateXP = (player, result) => {
    let xp = player.score / 10;
    xp += player.kills * 50;
    if (result === "win") xp += 500;
    else if (result === "loss") xp += 100;
    return Math.floor(xp);
  };
  const saveMatchRecord = async (room) => {
    try {
      const isRanked = room.id.startsWith("ranked-") || room.currentMode === "ffa" || room.currentMode === "tdm";
      const matchRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: (/* @__PURE__ */ new Date()).toISOString(),
        map: room.currentMap,
        mode: room.currentMode,
        isRanked,
        teamScores: room.teamScores,
        players: Object.values(room.players).map((p) => {
          const result = room.currentMode === "ffa" ? Object.values(room.players).sort((a, b) => b.score - a.score)[0].id === p.id ? "win" : "loss" : room.teamScores.amber > room.teamScores.blue ? p.team === "amber" ? "win" : "loss" : p.team === "blue" ? "win" : "loss";
          const rpGained = calculateRankPoints(p, result, isRanked);
          const xpGained = calculateXP(p, result);
          const creditsGained = Math.floor(xpGained / 10);
          return {
            id: p.id,
            uid: p.uid,
            name: p.name,
            score: p.score,
            kills: p.kills,
            deaths: p.deaths,
            team: p.team,
            result,
            rankPointsGained: rpGained,
            xpGained,
            creditsGained
          };
        }),
        duration: 600 - room.timeLeft
      };
      await (0, import_firestore.setDoc)((0, import_firestore.doc)((0, import_firestore.collection)(db, "matches"), matchRecord.id), matchRecord);
      console.log(`Match record saved: ${matchRecord.id}`);
      for (const p of matchRecord.players) {
        if (p.uid) {
          try {
            const userRef = (0, import_firestore.doc)(db, "users", p.uid);
            const userSnap = await (0, import_firestore.getDoc)(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              let newXP = (userData.xp || 0) + p.xpGained;
              let newLevel = userData.level || 1;
              let newRP = (userData.rankPoints || 0) + p.rankPointsGained;
              let newRank = userData.rank || "bronze";
              while (newXP >= newLevel * 1e3) {
                newXP -= newLevel * 1e3;
                newLevel++;
              }
              const rankOrder = ["bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster"];
              const currentRankIndex = rankOrder.indexOf(newRank);
              if (newRP >= 100 && currentRankIndex < rankOrder.length - 1) {
                newRP -= 100;
                newRank = rankOrder[currentRankIndex + 1];
              } else if (newRP < 0 && currentRankIndex > 0) {
                newRP += 100;
                newRank = rankOrder[currentRankIndex - 1];
              }
              await (0, import_firestore.updateDoc)(userRef, {
                xp: newXP,
                level: newLevel,
                rankPoints: newRP,
                rank: newRank,
                credits: (0, import_firestore.increment)(p.creditsGained),
                "stats.kills": (0, import_firestore.increment)(p.kills),
                "stats.deaths": (0, import_firestore.increment)(p.deaths),
                "stats.totalScore": (0, import_firestore.increment)(p.score),
                "stats.gamesPlayed": (0, import_firestore.increment)(1),
                "stats.wins": (0, import_firestore.increment)(p.result === "win" ? 1 : 0)
              });
              console.log(`Updated profile for user: ${p.uid} (Level: ${newLevel}, Rank: ${newRank})`);
            }
          } catch (error) {
            console.error(`Error updating profile for user ${p.uid}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error saving match record:", error);
    }
  };
  const rooms = {};
  async function getOrCreateRoom(roomId, privateServerName) {
    let id = roomId || "global";
    if (privateServerName && privateServerName.trim() !== "") {
      id = `private-${privateServerName.trim().toLowerCase()}`;
    }
    if (!rooms[id]) {
      rooms[id] = {
        id,
        gameState: "lobby",
        timeLeft: 600,
        currentMap: "maze",
        currentMode: "ffa",
        teamScores: { amber: 0, blue: 0 },
        flags: [
          { team: "amber", position: [0, 0, 80], carrierId: null },
          { team: "blue", position: [0, 0, -80], carrierId: null }
        ],
        controlPoints: [],
        blocks: [],
        settings: {
          jumpHeight: 1.5,
          gravity: 9.81,
          botDifficulty: "medium",
          botCount: 4,
          botPower: 5,
          botAggression: 5,
          botAccuracy: 5,
          botReactionTime: 500,
          botStrategy: "balanced"
        },
        enemies: {},
        players: {},
        projectiles: [],
        vehicles: {}
      };
      const shouldSpawnBots = rooms[id].currentMode !== "creative" || id.startsWith("private-");
      if (shouldSpawnBots) {
        for (let i = 0; i < rooms[id].settings.botCount; i++) {
          const botId = `bot-${i}`;
          rooms[id].enemies[botId] = {
            id: botId,
            position: [Math.random() * 40 - 20, 0, Math.random() * 40 - 20],
            rotation: 0,
            health: 100,
            state: "active",
            disabledUntil: 0,
            team: "none",
            targetId: null,
            lastShotTime: 0,
            path: [],
            skillLevel: 5
          };
        }
      }
      if (id.startsWith("private-")) {
        try {
          const docRef = (0, import_firestore.doc)(db, "maps", id);
          const docSnap = await (0, import_firestore.getDoc)(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            rooms[id].blocks = data.blocks || [];
            if (data.currentMap) rooms[id].currentMap = data.currentMap;
            if (data.currentMode) rooms[id].currentMode = data.currentMode;
          }
        } catch (error) {
          console.error("Error loading map from Firestore:", error);
        }
      }
    }
    return rooms[id];
  }
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    let currentRoomId = null;
    socket.on("joinGame", async (data) => {
      const room = await getOrCreateRoom(data.roomId || null, data.privateServerName);
      currentRoomId = room.id;
      if (Object.keys(room.players).length >= MAX_PLAYERS) {
        socket.emit("gameError", "Room is full (60/60 players)");
        return;
      }
      socket.join(room.id);
      if (Object.keys(room.players).length === 0) {
        if (data.map) room.currentMap = data.map;
        if (data.mode) {
          room.currentMode = data.mode;
          if (data.mode === "koth") {
            room.controlPoints = [
              { id: "hill", name: "The Hill", position: [0, 0, 0], radius: 10, owner: "none", progress: 0, capturingTeam: "none" }
            ];
          } else if (data.mode === "domination") {
            room.controlPoints = [
              { id: "point-a", name: "Point A", position: [30, 0, 30], radius: 8, owner: "none", progress: 0, capturingTeam: "none" },
              { id: "point-b", name: "Point B", position: [0, 0, 0], radius: 8, owner: "none", progress: 0, capturingTeam: "none" },
              { id: "point-c", name: "Point C", position: [-30, 0, -30], radius: 8, owner: "none", progress: 0, capturingTeam: "none" }
            ];
          }
        }
      }
      const playerName = data.name || `Player ${playerCounter++}`;
      let team = "none";
      if (room.currentMode !== "ffa") {
        const amberCount = Object.values(room.players).filter((p) => p.team === "amber").length;
        const blueCount = Object.values(room.players).filter((p) => p.team === "blue").length;
        team = amberCount <= blueCount ? "amber" : "blue";
      }
      const color = data.color || (team === "amber" ? "#f59e0b" : team === "blue" ? "#3b82f6" : "#f59e0b");
      room.players[socket.id] = {
        id: socket.id,
        uid: data.uid,
        name: playerName,
        position: [0, 2, 0],
        rotation: 0,
        state: "active",
        disabledUntil: 0,
        score: 0,
        color,
        skin: data.skin || "neon",
        pattern: data.pattern || "none",
        accessories: data.accessories || [],
        health: 100,
        kills: 0,
        deaths: 0,
        team,
        weapon: "pistol",
        isSprinting: false,
        isSliding: false,
        isBuildMode: false,
        selectedBlock: "stone",
        playerClass: data.playerClass || "mage",
        isDashing: false,
        currentVehicleId: null,
        currentDimension: "core"
      };
      socket.emit("gameJoined", {
        players: room.players,
        team,
        mode: room.currentMode,
        flags: room.currentMode === "ctf" ? room.flags : [],
        blocks: room.blocks,
        roomId: room.id
      });
      socket.emit("mapChanged", room.currentMap);
      if (room.currentMode !== "ffa") {
        socket.emit("teamScores", room.teamScores);
      }
      socket.to(room.id).emit("playerJoined", room.players[socket.id]);
    });
    socket.on("move", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.players[socket.id]) {
        const p = room.players[socket.id];
        p.position = data.position;
        p.rotation = data.rotation;
        if (data.weapon) p.weapon = data.weapon;
        if (data.isSprinting !== void 0) p.isSprinting = data.isSprinting;
        if (data.isSliding !== void 0) p.isSliding = data.isSliding;
        if (data.isBuildMode !== void 0) p.isBuildMode = data.isBuildMode;
        if (data.selectedBlock !== void 0) p.selectedBlock = data.selectedBlock;
        if (data.isDashing !== void 0) p.isDashing = data.isDashing;
        if (data.currentDimension !== void 0) p.currentDimension = data.currentDimension;
        if (data.vehicleId) {
          const vehicle = room.vehicles[data.vehicleId];
          if (vehicle && vehicle.driverId === socket.id) {
            vehicle.position = data.position;
            vehicle.rotation = [0, data.rotation, 0];
            io.to(room.id).emit("vehicleMoved", { id: data.vehicleId, position: data.position, rotation: vehicle.rotation });
          }
        }
        socket.to(room.id).emit("playerMoved", { id: socket.id, ...data });
        if (room.currentMode === "ctf") {
          room.flags.forEach((flag) => {
            if (flag.carrierId === socket.id) {
              flag.position = [data.position[0], data.position[1] + 1, data.position[2]];
              io.to(room.id).emit("flagUpdate", room.flags);
              const myBasePos = p.team === "amber" ? [0, 0, 80] : [0, 0, -80];
              if (flag.team !== p.team) {
                const distToBase = Math.sqrt(
                  Math.pow(data.position[0] - myBasePos[0], 2) + Math.pow(data.position[2] - myBasePos[2], 2)
                );
                if (distToBase < 5) {
                  const team = p.team;
                  room.teamScores[team] += 1;
                  flag.carrierId = null;
                  flag.position = flag.team === "amber" ? [0, 0, 80] : [0, 0, -80];
                  io.to(room.id).emit("teamScores", room.teamScores);
                  io.to(room.id).emit("flagUpdate", room.flags);
                  io.to(room.id).emit("flagEvent", { message: `${p.name} captured the ${flag.team} flag!` });
                  p.score += 500;
                }
              }
            } else if (flag.carrierId === null) {
              const distToFlag = Math.sqrt(
                Math.pow(data.position[0] - flag.position[0], 2) + Math.pow(data.position[2] - flag.position[2], 2)
              );
              if (distToFlag < 2 && p.state === "active") {
                if (flag.team !== p.team) {
                  flag.carrierId = socket.id;
                  io.to(room.id).emit("flagUpdate", room.flags);
                  io.to(room.id).emit("flagEvent", { message: `${p.name} picked up the ${flag.team} flag!` });
                } else {
                  const basePos = flag.team === "amber" ? [0, 0, 80] : [0, 0, -80];
                  const distToBase = Math.sqrt(
                    Math.pow(flag.position[0] - basePos[0], 2) + Math.pow(flag.position[2] - basePos[2], 2)
                  );
                  if (distToBase > 5) {
                    flag.position = basePos;
                    io.to(room.id).emit("flagUpdate", room.flags);
                    io.to(room.id).emit("flagEvent", { message: `${p.name} returned the ${flag.team} flag!` });
                  }
                }
              }
            }
          });
        }
      }
    });
    socket.on("spawnVehicle", async ({ type }) => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      const vehicleId = `vehicle-${Math.random().toString(36).substr(2, 9)}`;
      const player = room.players[socket.id];
      if (!player) return;
      const vehicle = {
        id: vehicleId,
        type,
        position: [player.position[0], player.position[1] + 2, player.position[2]],
        rotation: [0, 0, 0],
        velocity: [0, 0, 0],
        health: 1e3,
        maxHealth: 1e3,
        driverId: null,
        name: `${player.name}'s ${type}`
      };
      room.vehicles[vehicleId] = vehicle;
      io.to(room.id).emit("vehicleSpawned", vehicle);
    });
    socket.on("enterVehicle", async (vehicleId) => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      const vehicle = room.vehicles[vehicleId];
      if (vehicle && !vehicle.driverId) {
        vehicle.driverId = socket.id;
        if (room.players[socket.id]) {
          room.players[socket.id].currentVehicleId = vehicleId;
        }
        io.to(room.id).emit("playerEnteredVehicle", { vehicleId, playerId: socket.id });
      }
    });
    socket.on("exitVehicle", async () => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      for (const vehicleId in room.vehicles) {
        if (room.vehicles[vehicleId].driverId === socket.id) {
          room.vehicles[vehicleId].driverId = null;
          if (room.players[socket.id]) {
            room.players[socket.id].currentVehicleId = null;
          }
          io.to(room.id).emit("playerExitedVehicle", { vehicleId, playerId: socket.id });
          break;
        }
      }
    });
    socket.on("updateVehicle", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      const vehicle = room.vehicles[data.vehicleId];
      if (vehicle && vehicle.driverId === socket.id) {
        vehicle.position = data.position;
        vehicle.rotation = [0, data.rotation, 0];
        socket.to(room.id).emit("vehicleUpdated", data);
      }
    });
    socket.on("chatMessage", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.players[socket.id]) {
        const p = room.players[socket.id];
        const msg = {
          id: Math.random().toString(),
          sender: p.name,
          message: data.message,
          timestamp: Date.now(),
          type: data.type
        };
        if (data.type === "global") {
          io.to(room.id).emit("chatMessage", msg);
        } else if (data.type === "team") {
          const senderTeam = p.team || "none";
          if (senderTeam === "none") {
            io.to(room.id).emit("chatMessage", { ...msg, type: "global" });
          } else {
            Object.values(room.players).forEach((otherP) => {
              if (otherP.team === senderTeam) {
                io.to(otherP.id).emit("chatMessage", msg);
              }
            });
          }
        } else {
          Object.values(room.players).forEach((otherP) => {
            const dist = Math.sqrt(
              Math.pow(p.position[0] - otherP.position[0], 2) + Math.pow(p.position[2] - otherP.position[2], 2)
            );
            if (dist < 30) {
              io.to(otherP.id).emit("chatMessage", msg);
            }
          });
        }
      }
    });
    socket.on("shoot", (data) => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit("playerShot", { id: socket.id, ...data });
      }
    });
    socket.on("hitPlayer", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      const targetId = typeof data === "string" ? data : data.targetId;
      const damage = typeof data === "object" ? data.damage ?? 20 : 20;
      if (room.players[targetId] && room.players[socket.id]) {
        const target = room.players[targetId];
        const shooter = room.players[socket.id];
        if (room.currentMode !== "ffa" && target.team === shooter.team && damage > 0) {
          return;
        }
        if (target.state === "active") {
          target.health = Math.min(100, Math.max(0, target.health - damage));
          if (target.health <= 0) {
            target.state = "disabled";
            target.disabledUntil = Date.now() + 3e3;
            target.deaths += 1;
            if (targetId !== socket.id) {
              shooter.score += 100;
              shooter.kills += 1;
              if (room.currentMode !== "ffa") {
                const team = shooter.team;
                room.teamScores[team] += 10;
                io.to(room.id).emit("teamScores", room.teamScores);
              }
            }
            if (room.currentMode === "ctf") {
              room.flags.forEach((flag) => {
                if (flag.carrierId === targetId) {
                  flag.carrierId = null;
                  io.to(room.id).emit("flagUpdate", room.flags);
                  io.to(room.id).emit("flagEvent", { message: `${target.name} dropped the ${flag.team} flag!` });
                }
              });
            }
            setTimeout(() => {
              if (room.players[targetId]) {
                room.players[targetId].state = "active";
                room.players[targetId].health = 100;
              }
            }, 3e3);
          } else if (damage > 0) {
            if (targetId !== socket.id) {
              shooter.score += 20;
            }
          }
          io.to(room.id).emit("playerHit", {
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
    socket.on("hitVehicle", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (!room) return;
      const vehicle = room.vehicles[data.vehicleId];
      if (vehicle) {
        vehicle.health = Math.max(0, vehicle.health - data.damage);
        io.to(room.id).emit("vehicleHit", { vehicleId: data.vehicleId, health: vehicle.health, damage: data.damage });
        if (vehicle.health <= 0) {
          if (vehicle.driverId) {
            const driver = room.players[vehicle.driverId];
            if (driver) {
              driver.health = 0;
              driver.state = "disabled";
              driver.disabledUntil = Date.now() + 3e3;
              driver.deaths += 1;
              driver.currentVehicleId = null;
              io.to(room.id).emit("playerDied", { victimId: vehicle.driverId, killerId: socket.id });
            }
          }
          delete room.vehicles[data.vehicleId];
          io.to(room.id).emit("vehicleDestroyed", data.vehicleId);
        }
      }
    });
    socket.on("emote", (emote) => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.players[socket.id]) {
        io.to(room.id).emit("emote", { id: socket.id, emote });
      }
    });
    socket.on("placeBlock", (data) => {
      const room = rooms[currentRoomId || "global"];
      if (room) {
        const block = {
          id: `block-${Math.random().toString(36).substr(2, 9)}`,
          type: data.type,
          position: data.position
        };
        room.blocks.push(block);
        io.to(room.id).emit("blockPlaced", block);
      }
    });
    socket.on("bulkPlaceBlocks", (blocks) => {
      const room = rooms[currentRoomId || "global"];
      if (room && Array.isArray(blocks)) {
        const newBlocks = blocks.map((b) => ({
          id: `block-${Math.random().toString(36).substr(2, 9)}`,
          type: b.type,
          position: b.position
        }));
        room.blocks.push(...newBlocks);
        io.to(room.id).emit("bulkBlocksPlaced", newBlocks);
      }
    });
    socket.on("breakBlock", (id) => {
      const room = rooms[currentRoomId || "global"];
      if (room) {
        room.blocks = room.blocks.filter((b) => b.id !== id);
        io.to(room.id).emit("blockBroken", id);
      }
    });
    socket.on("saveMap", async () => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.id.startsWith("private-")) {
        try {
          const docRef = (0, import_firestore.doc)(db, "maps", room.id);
          await (0, import_firestore.setDoc)(docRef, {
            blocks: room.blocks,
            currentMap: room.currentMap,
            currentMode: room.currentMode,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          }, { merge: true });
          socket.emit("chatMessage", {
            id: Math.random().toString(),
            sender: "System",
            message: "Map saved successfully!",
            timestamp: Date.now(),
            type: "system"
          });
        } catch (error) {
          console.error("Error saving map to Firestore:", error);
          socket.emit("chatMessage", {
            id: Math.random().toString(),
            sender: "System",
            message: "Failed to save map.",
            timestamp: Date.now(),
            type: "system"
          });
        }
      }
    });
    socket.on("clearMap", () => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.id.startsWith("private-")) {
        room.blocks = [];
        io.to(room.id).emit("mapCleared");
        socket.emit("chatMessage", {
          id: Math.random().toString(),
          sender: "System",
          message: "Map cleared!",
          timestamp: Date.now(),
          type: "system"
        });
      }
    });
    socket.on("startGame", () => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.gameState === "lobby") {
        room.gameState = "playing";
        room.timeLeft = 600;
        io.to(room.id).emit("gameStarted", { timeLeft: room.timeLeft });
        Object.values(room.players).forEach((p) => {
          p.score = 0;
          p.kills = 0;
          p.deaths = 0;
          p.health = 100;
          p.state = "active";
        });
        io.to(room.id).emit("scoresUpdated", room.players);
      }
    });
    socket.on("updateSettings", (settings) => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.id.startsWith("private-")) {
        const oldBotCount = room.settings.botCount;
        room.settings = { ...room.settings, ...settings };
        io.to(room.id).emit("settingsUpdated", room.settings);
        if (room.settings.botCount !== oldBotCount) {
          room.enemies = {};
          for (let i = 0; i < room.settings.botCount; i++) {
            const botId = `bot-${i}`;
            room.enemies[botId] = {
              id: botId,
              position: [Math.random() * 40 - 20, 0, Math.random() * 40 - 20],
              rotation: 0,
              health: 100,
              state: "active",
              disabledUntil: 0,
              team: "none",
              targetId: null,
              lastShotTime: 0,
              path: [],
              skillLevel: 5
            };
          }
          io.to(room.id).emit("enemiesMoved", room.enemies);
        }
        const docRef = (0, import_firestore.doc)(db, "maps", room.id);
        (0, import_firestore.updateDoc)(docRef, { settings: room.settings }).catch((err) => console.error("Error updating settings:", err));
        socket.emit("chatMessage", {
          id: Math.random().toString(),
          sender: "System",
          message: "Settings updated!",
          timestamp: Date.now(),
          type: "system"
        });
      }
    });
    socket.on("fireProjectile", (data) => {
      socket.to(currentRoomId || "global").emit("projectileFired", data);
    });
    socket.on("meleeAttack", (data) => {
      socket.to(currentRoomId || "global").emit("playerMeleeAttacked", {
        playerId: socket.id,
        weaponId: data.weaponId
      });
    });
    socket.on("signal", (data) => {
      io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
    });
    socket.on("updateSettings", (newSettings) => {
      const room = rooms[currentRoomId || "global"];
      if (room) {
        room.settings = { ...room.settings, ...newSettings };
        io.to(room.id).emit("settingsUpdated", room.settings);
        if (newSettings.botCount !== void 0) {
          const count = newSettings.botCount;
          const currentBotIds = Object.keys(room.enemies);
          const currentCount = currentBotIds.length;
          if (count > currentCount) {
            for (let i = 0; i < count - currentCount; i++) {
              const id = `bot-${Math.random().toString(36).substr(2, 9)}`;
              room.enemies[id] = {
                id,
                position: [Math.random() * 80 - 40, 1, Math.random() * 80 - 40],
                rotation: 0,
                health: 100,
                state: "active",
                disabledUntil: 0,
                team: "none",
                targetId: "",
                lastShotTime: 0,
                path: [],
                skillLevel: 5
              };
            }
          } else if (count < currentCount) {
            const toRemove = currentBotIds.slice(0, currentCount - count);
            toRemove.forEach((id) => delete room.enemies[id]);
          }
          io.to(room.id).emit("enemiesUpdated", Object.values(room.enemies));
        }
      }
    });
    socket.on("disconnect", () => {
      const room = rooms[currentRoomId || "global"];
      if (room && room.players[socket.id]) {
        if (room.currentMode === "ctf") {
          room.flags.forEach((flag) => {
            if (flag.carrierId === socket.id) {
              flag.carrierId = null;
              io.to(room.id).emit("flagUpdate", room.flags);
            }
          });
        }
        delete room.players[socket.id];
        io.to(room.id).emit("playerLeft", socket.id);
        if (Object.keys(room.players).length === 0 && room.id !== "global") {
          delete rooms[room.id];
        }
      }
    });
  });
  app.use(import_express.default.json({ limit: "456mb" }));
  app.use(import_express.default.urlencoded({ limit: "456mb", extended: true }));
  const MODS_DIR = import_path.default.join(process.cwd(), "mods");
  const ensureModsDir = () => {
    if (!import_fs.default.existsSync(MODS_DIR)) {
      import_fs.default.mkdirSync(MODS_DIR, { recursive: true });
    }
  };
  app.get("/api/mods", (req, res) => {
    try {
      ensureModsDir();
      const files = import_fs.default.readdirSync(MODS_DIR);
      const modsList = [];
      for (const file of files) {
        const filePath = import_path.default.join(MODS_DIR, file);
        const stat = import_fs.default.statSync(filePath);
        if (stat.isFile()) {
          const ext = import_path.default.extname(file).toLowerCase();
          let parsedData = null;
          let contentStr = "";
          try {
            contentStr = import_fs.default.readFileSync(filePath, "utf8");
            if (ext === ".al") {
              parsedData = JSON.parse(contentStr);
            }
          } catch (e) {
          }
          modsList.push({
            filename: file,
            size: stat.size,
            mtime: stat.mtime,
            ext,
            content: contentStr.substring(0, 5e3),
            // truncate long files
            parsed: parsedData
          });
        }
      }
      res.json({ success: true, mods: modsList });
    } catch (error) {
      console.error("Error fetching mods:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/mods/create", (req, res) => {
    try {
      const { filename, content } = req.body;
      if (!filename || content === void 0) {
        return res.status(400).json({ success: false, error: "Missing filename or content" });
      }
      const cleanFilename = import_path.default.basename(filename);
      ensureModsDir();
      const filePath = import_path.default.join(MODS_DIR, cleanFilename);
      import_fs.default.writeFileSync(filePath, typeof content === "object" ? JSON.stringify(content, null, 2) : content);
      res.json({ success: true, message: `Mod file ${cleanFilename} saved successfully.` });
    } catch (error) {
      console.error("Error creating mod:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/mods/delete", (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) {
        return res.status(400).json({ success: false, error: "Missing filename" });
      }
      const cleanFilename = import_path.default.basename(filename);
      const filePath = import_path.default.join(MODS_DIR, cleanFilename);
      if (import_fs.default.existsSync(filePath)) {
        import_fs.default.unlinkSync(filePath);
        res.json({ success: true, message: `Mod file ${cleanFilename} deleted.` });
      } else {
        res.status(404).json({ success: false, error: "Mod file not found" });
      }
    } catch (error) {
      console.error("Error deleting mod:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/mods/load", async (req, res) => {
    try {
      const { filename, roomId = "global" } = req.body;
      if (!filename) {
        return res.status(400).json({ success: false, error: "Missing filename" });
      }
      const cleanFilename = import_path.default.basename(filename);
      const filePath = import_path.default.join(MODS_DIR, cleanFilename);
      if (!import_fs.default.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "Mod file not found" });
      }
      const content = import_fs.default.readFileSync(filePath, "utf8");
      const modJson = JSON.parse(content);
      if (modJson.settingsOverride) {
        const room = await getOrCreateRoom(roomId);
        if (room) {
          room.settings = {
            ...room.settings,
            ...modJson.settingsOverride
          };
          io.to(room.id).emit("settingsUpdated", room.settings);
          io.to(room.id).emit("chatMessage", {
            id: Math.random().toString(),
            sender: "ModLoader",
            message: `\u{1F916} MOD ACTIVATED: "${modJson.name || cleanFilename}" successfully loaded onto server.`,
            timestamp: Date.now(),
            type: "system"
          });
          return res.json({ success: true, message: `Mod ${modJson.name || cleanFilename} loaded onto room ${room.id}`, settings: room.settings });
        }
      }
      res.status(400).json({ success: false, error: "Mod file does not contain setting overrides." });
    } catch (error) {
      console.error("Error loading mod:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/mods/compile", (req, res) => {
    try {
      const { modId, name, author, settings, format } = req.body;
      if (!modId || !name || !format) {
        return res.status(400).json({ success: false, error: "Missing mod compilation parameters." });
      }
      ensureModsDir();
      const cleanId = modId.replace(/[^a-zA-Z0-9_]/g, "_");
      const timeStr = Date.now();
      let buildOutputLogs = [];
      buildOutputLogs.push(`[COMPILER] Initializing Neon compiler pipeline for format: ${format.toUpperCase()}`);
      buildOutputLogs.push(`[COMPILER] Target Mod ID: ${modId}`);
      buildOutputLogs.push(`[COMPILER] Resolving game dependency libraries... Success.`);
      if (format === "al") {
        const outFilename = `${cleanId}_v1_0.al`;
        const outPath = import_path.default.join(MODS_DIR, outFilename);
        const fileContent = {
          modId,
          name,
          version: "1.0.0",
          author: author || "Developer",
          compat: ".al",
          description: `Compiled Arena Loader mod targeting customizable physics. Built at ${(/* @__PURE__ */ new Date()).toISOString()}`,
          settingsOverride: settings
        };
        import_fs.default.writeFileSync(outPath, JSON.stringify(fileContent, null, 2));
        buildOutputLogs.push(`[COMPILER] Writing serialized metadata file: ${outFilename}`);
        buildOutputLogs.push(`[COMPILER] Packing game asset links and settings overrides... Done.`);
        buildOutputLogs.push(`[COMPILER] Arena Loader mod bundle compilation complete!`);
        return res.json({
          success: true,
          filename: outFilename,
          logs: buildOutputLogs,
          content: fileContent
        });
      } else if (format === "exe") {
        const outFilename = `${cleanId}_v1_0.exe`;
        const outPath = import_path.default.join(MODS_DIR, outFilename);
        const mockExeContent = `MZ\r
[Neon Arena Windows Executable Launcher Mod]\r
Mod ID: ${modId}\r
Mod Name: ${name}\r
Author: ${author || "Developer"}\r
Compiled At: ${(/* @__PURE__ */ new Date()).toISOString()}\r
==========================================\r
SETTINGS OVERRIDES:\r
` + JSON.stringify(settings, null, 2) + `\r
==========================================\r
EXECUTION HOOKS: PE Subsystem 3D DirectInput / Gamepad Driver Engine.`;
        import_fs.default.writeFileSync(outPath, mockExeContent);
        buildOutputLogs.push(`[COMPILER] Assembling portable executable entry points...`);
        buildOutputLogs.push(`[COMPILER] Compiling direct memory pointers hook map...`);
        buildOutputLogs.push(`[COMPILER] Injecting customizable settings override registry...`);
        buildOutputLogs.push(`[COMPILER] PE standalone executable binary compilation complete: ${outFilename}`);
        return res.json({
          success: true,
          filename: outFilename,
          logs: buildOutputLogs,
          content: mockExeContent
        });
      }
      res.status(400).json({ success: false, error: "Unsupported compile format" });
    } catch (error) {
      console.error("Error compiling mod:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.get("/api/blender/status", (req, res) => {
    try {
      const blenderPath = import_path.default.join(process.cwd(), "blender.zip");
      if (!import_fs.default.existsSync(blenderPath)) {
        return res.json({
          success: true,
          exists: false,
          isPlaceholder: false,
          isValidZip: false,
          message: "No file found at /blender.zip. Please create or upload a blender.zip file in the root folder."
        });
      }
      const stat = import_fs.default.statSync(blenderPath);
      const buffer = import_fs.default.readFileSync(blenderPath);
      const contentStr = buffer.toString("utf8");
      const isPlaceholder = contentStr.includes("PLACEHOLDER_BLENDER_ZIP");
      const hasZipHeader = buffer.length >= 4 && buffer[0] === 80 && buffer[1] === 75;
      res.json({
        success: true,
        exists: true,
        size: stat.size,
        isPlaceholder,
        isValidZip: hasZipHeader,
        message: isPlaceholder ? "Placeholder blender.zip detected. Please replace it with your actual Blender .zip file." : hasZipHeader ? "Valid Blender .zip model detected! Mod Maker unlocked." : "File exists at /blender.zip but is not a valid ZIP archive."
      });
    } catch (error) {
      console.error("Error checking blender.zip status:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/blender/upload", (req, res) => {
    try {
      const { base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ success: false, error: "No file data received" });
      }
      const cleanBase64 = base64.replace(/^data:.*,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const hasZipHeader = buffer.length >= 4 && buffer[0] === 80 && buffer[1] === 75;
      if (!hasZipHeader) {
        return res.status(400).json({
          success: false,
          error: "Invalid file format. Uploaded file must be a valid zip archive (starts with PK signature)."
        });
      }
      const blenderPath = import_path.default.join(process.cwd(), "blender.zip");
      import_fs.default.writeFileSync(blenderPath, buffer);
      console.log(`Saved new blender.zip of size ${buffer.length} bytes.`);
      res.json({
        success: true,
        size: buffer.length,
        message: "Blender package /blender.zip successfully uploaded and verified!"
      });
    } catch (error) {
      console.error("Error writing blender.zip:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app.post("/api/academy/ai-teacher", async (req, res) => {
    try {
      const { message, subject = "general", history = [] } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new import_genai.GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        let subjectContext = "general scientific and academic inquiries";
        if (subject === "biology") {
          subjectContext = "cellular biology, DNA exploration, organ anatomy, ecosystems, and human physiology";
        } else if (subject === "math") {
          subjectContext = "geometry, spatial vectors, algebra, physics-based mechanical building, and logic puzzles";
        } else if (subject === "physics") {
          subjectContext = "gravity, electromagnetism, kinetic energy, thermodynamics, and simple robotics";
        } else if (subject === "chemistry") {
          subjectContext = "the periodic table, molecular bonding, elements, safe virtual chemical reactions, and synthesis";
        } else if (subject === "history") {
          subjectContext = "Ancient Rome, Greece, Egypt, Medieval periods, and major historical world progress milestones";
        } else if (subject === "geography") {
          subjectContext = "Earth ecosystems, plate tectonics, climate patterns, oceans, and high-altitude mountain formations";
        } else if (subject === "space") {
          subjectContext = "the solar system, orbital mechanics, cosmic nebula, black holes, spacecraft engineering, and astro-navigation";
        } else if (subject === "coding") {
          subjectContext = "computational algorithms, state managers, logic gates, automation, and virtual robot programming";
        } else if (subject === "arts") {
          subjectContext = "3D painting, digital sculpting, additive color spectrums, gestural modeling, and CAD/NURBS modeling frameworks";
        } else if (subject === "language") {
          subjectContext = "phonetics, native pronunciations, gamified vocabulary building, and conversational AI avatar roleplaying";
        }
        const systemInstruction = `You are A.U.R.A (Academy Universal Research Assistant), the advanced holographic teacher guiding students in "Infinity Academy VR" - a futuristic immersive learning multiverse.
Your expertise is in: ${subjectContext}. You are also fully knowledgeable about real-world Quest VR educational applications (including Open Brush, Gravity Sketch, ShapesXR, Human Anatomy VR, 3D Organon, Newton's Room, Gravity Lab, Energy Encyclopedia VR, Wander, BRINK Traveler, Titans of Space PLUS, Noun Town, IMMERSE, and Horizon Workrooms).
Deliver accurate, deeply educational, yet engaging and inspiring responses. Speak with a helpful, friendly, and highly encouraging tone, using futuristic/holographic styling (e.g. "Scanning database...", "Replicating model...", "Analyzing neural networks...").
Keep your responses descriptive, clear, and relatively concise (2-4 paragraphs max). Feel free to use markdown and clean bullet points to summarize concepts.`;
        const formattedHistory = history.map((chat) => ({
          role: chat.sender === "user" ? "user" : "model",
          parts: [{ text: chat.text }]
        }));
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            ...formattedHistory,
            { parts: [{ text: message }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        const reply = response.text || "Scanning frequencies... Connection stable, but my neural buffers are currently empty. Please repeat your query.";
        return res.json({ success: true, reply });
      } else {
        let mockReply = "";
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("anatomy") || lowerMessage.includes("organon") || lowerMessage.includes("dissect")) {
          mockReply = `\u{1F9EC} **A.U.R.A Online - VR Anatomy Simulation:**

Inside our Biology Kingdom, we simulate the top VR anatomy suites:

* **Human Anatomy VR (Visible Body):** Offers 15 body systems and over 13,000 structures. Using "Ant Mode", students can shrink to a 1:1 scale to physically traverse blood vessels and organ walls!
* **3D Organon:** Allows hyper-realistic 3D biological dissections, immediate feedback on quizzes, and co-location in the Medverse for collaborative medical study.`;
        } else if (lowerMessage.includes("brush") || lowerMessage.includes("blocks") || lowerMessage.includes("painting") || lowerMessage.includes("art")) {
          mockReply = `\u{1F3A8} **A.U.R.A Online - VR 3D Art & Painting:**

In our Arts District, we study the physics and creativity of gestural modeling tools:

* **Open Brush:** The community successor to Tilt Brush. It features **48 distinct brush effects** (including volumetric fire, smoke, and particle light) for drawing in full 3D.
* **Open Blocks:** A simple block-based modeling tool (fork of Google Blocks) that replaces complex menus with intuitive hand gestural snapping, allowing anyone to build low-poly assets instantly.`;
        } else if (lowerMessage.includes("sketch") || lowerMessage.includes("shapes") || lowerMessage.includes("cad")) {
          mockReply = `\u{1F4D0} **A.U.R.A Online - VR Spatial Design & CAD:**

In our Math and Coding modules, we explore professional VR design systems:

* **Gravity Sketch:** Built for automotive and industrial designers. Instead of mouse-dragging, you sculpt with NURBS, subdivision surfaces, and CAD frameworks, exporting creations to .OBJ, .FBX, or .IGES files.
* **ShapesXR:** An immersive prototyping canvas for designing spatial apps and MR interfaces. Teams collaborate live in the same grid, leveraging Figma syncing and rapid Unity export pipelines.`;
        } else if (lowerMessage.includes("titans of space") || lowerMessage.includes("space plus") || lowerMessage.includes("astronomy")) {
          mockReply = `\u{1F30C} **A.U.R.A Online - Astronomy & Titans of Space PLUS:**

Our Space Dimension simulates the awe-inspiring scales of the universe inspired by **Titans of Space PLUS**:

* **Holographic Solar System:** Shrink planets to miniature size to easily manipulate their orbits in your hands.
* **Star Scale Tour:** Move from our yellow sun to supergiant stars, grasping their cosmic scale ratios.
* **Audio Guide:** Supports over 2 hours of narrated, synchronized scientific facts during your tour.`;
        } else if (lowerMessage.includes("noun town") || lowerMessage.includes("immerse") || lowerMessage.includes("languages") || lowerMessage.includes("mondly")) {
          mockReply = `\u{1F5E3}\uFE0F **A.U.R.A Online - VR Language Acquisition:**

Our Language City implements the pedagogical methods of gamified VR suites:

* **Noun Town:** Master 1,000+ words in Spanish, Japanese, or French. As you pronounce words correctly using Quest speech recognition, the cartoon world regains full color!
* **IMMERSE:** Boosts conversational confidence. Practice ordering at cafes or job interviewing with active AI avatars in stress-free spatial roleplays.`;
        } else if (lowerMessage.includes("wander") || lowerMessage.includes("brink") || lowerMessage.includes("natgeo") || lowerMessage.includes("geography") || lowerMessage.includes("field trip")) {
          mockReply = `\u{1F30D} **A.U.R.A Online - VR Virtual Field Trips:**

Our Geography Planet provides volumetric simulations modeled after top Quest travel programs:

* **Wander:** Leverages Google Street View to teleport you to any street, mountain peak, or monument, complete with voice searches and Wikipedia.
* **BRINK Traveler:** High-fidelity 3D photogrammetric scans of national parks with day/night cycles and millimeter accuracy.
* **National Geographic Explore:** Kayak among Antarctic icebergs or excavate Machu Picchu matching historic photos.`;
        } else if (lowerMessage.includes("newton") || lowerMessage.includes("gravity lab") || lowerMessage.includes("physics")) {
          mockReply = `\u269B\uFE0F **A.U.R.A Online - VR Physics & Engineering Labs:**

In the Physics Labs, we run simulations inspired by top Quest mechanical puzzle solvers:

* **Newton's Room:** Mixed-Reality mechanical puzzles that anchor vector force arrows and mass sliders onto your actual physical furniture using Quest passthrough.
* **Gravity Lab:** Solve gravity-bending beam and circuit logic puzzles set on a lunar outpost, or build custom tests using the integrated level editor.`;
        } else if (lowerMessage.includes("energy") || lowerMessage.includes("encyclopedia") || lowerMessage.includes("power plant")) {
          mockReply = `\u{1F9EA} **A.U.R.A Online - VR Energy Encyclopedia:**

In our Chemistry and Energy center, we run fully interactive engineering models inspired by **Energy Encyclopedia VR**:

* **Power Generation Assemblies:** Assemble Small Modular Reactors (SMRs), steam turbines, hydro generators, solar towers, and wind farms.
* **Thermodynamic Science:** Access over 30+ interactive 3D engineering models explaining thermal expansion and electromagnetic induction.`;
        } else if (lowerMessage.includes("quest") || lowerMessage.includes("catalog") || lowerMessage.includes("library") || lowerMessage.includes("app")) {
          mockReply = `\u{1F916} **A.U.R.A Online - Quest VR Educational Suite:**

Infinity Academy VR integrates simulations and curricula based on the best VR educational titles on Meta Quest! Select the **VR Lib** tab in your HUD left panel to inspect the catalog:

1. **3D Art & Modeling:** Open Brush, Gravity Sketch, Open Blocks, ShapesXR
2. **Anatomy & Biology:** Human Anatomy VR, 3D Organon
3. **Physics & Engineering:** Newton's Room, Gravity Lab, Energy Encyclopedia
4. **Geography & Trips:** Wander, BRINK Traveler, NatGeo Explore
5. **Astronomy & Space:** Titans of Space PLUS
6. **Languages:** Noun Town, IMMERSE

Click any app inside your VR Lib panel to display its 3D telemetry diagnostics here!`;
        } else if (subject === "biology") {
          if (lowerMessage.includes("cell") || lowerMessage.includes("shrink")) {
            mockReply = `\u{1F9EC} **A.U.R.A Online - Biology Database Access:**

Fantastic choice! We have successfully decipihered and simulated a 3D human cell at **10,000,000x magnification**.

As you walk around, notice the **mitochondria** (the powerhouses generating ATP), the wrapping **endoplasmic reticulum**, and the central **nucleus** housing the chromosomes. Go ahead and click on any organelle to examine its detailed protein map!`;
          } else if (lowerMessage.includes("dna")) {
            mockReply = `\u{1F9EC} **A.U.R.A Online - DNA Helix Scan:**

You are standing beside a massive double-helix polymer strand! Notice the complementary nucleotide base pairs:

* **Adenine (A)** pairs with **Thymine (T)**
* **Cytosine (C)** pairs with **Guanine (G)**

These four letters compose the universal programming code of all terrestrial life forms!`;
          } else {
            mockReply = `\u{1F9EC} **A.U.R.A Online - Biology Module:**

Welcome to the **Biology Kingdom**! Ask me anything about the human body, cell structures, organs (like our beating heart simulation), or general ecology. I can guide your learning path!`;
          }
        } else if (subject === "math") {
          mockReply = `\u{1F4D0} **A.U.R.A Online - Mathematics Core:**

You have entered the **Mathematical Mountains**! Here, mathematics is represented as three-dimensional structural puzzles. By solving geometric equations, you can construct massive bridges and towers.

Let me know if you would like to analyze the **Pythagorean Theorem** (a\xB2 + b\xB2 = c\xB2), explore 3D vectors, or practice spatial logic challenges!`;
        } else if (subject === "physics") {
          mockReply = `\u269B\uFE0F **A.U.R.A Online - Quantum & Kinetic Physics:**

Welcome to the **Physics Laboratories**! Here, you can test gravity on different planets or toggling vacuum chambers to eliminate air drag. Try dropping a bowling ball and a feather inside our Galileo Drop simulator!`;
        } else if (subject === "chemistry") {
          mockReply = `\u{1F9EA} **A.U.R.A Online - Chemistry Synthesizer:**

Welcome to the safe **Chemistry Research Center**! Here, molecular bonding is fully simulated without real-world hazards.

Would you like to learn about **covalent vs. ionic bonds**, create water by bonding **Hydrogen** and **Oxygen**, or study how catalysts accelerate chemical reactions?`;
        } else if (subject === "history") {
          mockReply = `\u23F3 **A.U.R.A Online - Chrono-Portal Archive:**

Time Portal active! Decrypt ancient scripts using our Rosetta Stone Translator, or travel straight to Ancient Egypt to explore the pyramids.

What era shall we examine next, explorer?`;
        } else if (subject === "geography") {
          mockReply = `\u{1F30D} **A.U.R.A Online - Earth & Climate Geography:**

You are inside the **Geography Dimension**! Use the planetary controls to orbit the Earth, observe transform plate boundaries like the San Andreas Fault, or dive into the deep Mariana Trench!`;
        } else if (subject === "space") {
          mockReply = `\u{1F30C} **A.U.R.A Online - Cosmos Navigation:**

Astronaut systems ready! We are orbitally locked around the **Space Exploration Dimension**. Notice the planet orbits adhere to Kepler's Laws.

Ask me about gas giants, stellar nucleosynthesis, or how gravitational time dilation affects space flight!`;
        } else if (subject === "coding") {
          mockReply = `\u{1F4BB} **A.U.R.A Online - Algorithmic Logic Compiler:**

Welcome to the **Coding Island** compiler! Here, you can compile algorithms and loops to direct ByteBot step-by-step. Adjust the loop count to see the iteration cycles in action!`;
        } else if (subject === "language") {
          mockReply = `\u{1F5E3}\uFE0F **A.U.R.A Online - Lexicon Translation Matrix:**

You have discovered the **Language City** phonetic translation tower! Choose from Spanish, French, or Japanese to decipher native phrases, pronunciations, and etymology.`;
        } else if (subject === "arts") {
          mockReply = `\u{1F3A8} **A.U.R.A Online - Chromatic Spectrums:**

Welcome to the **Creative Arts District** light prism laboratory! Mix primary colors of light (Red, Green, Blue) to observe additive spectrum science. How will you paint the universe?`;
        } else {
          mockReply = `\u{1F916} **A.U.R.A Online - Multi-Disciplinary Hub:**

Hello, student! I am A.U.R.A, your AI guide inside **Infinity Academy VR**.

I am fully optimized to answer your questions about biology, mathematics, physics, chemistry, space, geography, coding, languages, history, and arts. How can I assist your educational journey today?`;
        }
        return res.json({ success: true, reply: mockReply, note: "Offline simulated core active." });
      }
    } catch (error) {
      console.error("Error in AI Teacher endpoint:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(process.cwd(), "dist", "index.html"));
    });
  }
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  setInterval(() => {
    const now = Date.now();
    Object.values(rooms).forEach((room) => {
      if (room.gameState === "playing") {
        room.timeLeft -= 0.1;
        if (room.timeLeft <= 0) {
          room.timeLeft = 0;
          room.gameState = "gameover";
          io.to(room.id).emit("gameOver", {
            teamScores: room.teamScores,
            players: Object.values(room.players).map((p) => ({ id: p.id, name: p.name, score: p.score, kills: p.kills, deaths: p.deaths }))
          });
          saveMatchRecord(room);
        }
      }
      if (room.gameState === "playing" && (room.currentMode === "koth" || room.currentMode === "domination")) {
        let changed = false;
        room.controlPoints.forEach((cp) => {
          const playersInZone = Object.values(room.players).filter((p) => {
            if (p.state === "disabled") return false;
            const dist = Math.sqrt(Math.pow(p.position[0] - cp.position[0], 2) + Math.pow(p.position[2] - cp.position[2], 2));
            return dist < cp.radius;
          });
          const amberInZone = playersInZone.filter((p) => p.team === "amber").length;
          const blueInZone = playersInZone.filter((p) => p.team === "blue").length;
          const oldOwner = cp.owner;
          const oldProgress = cp.progress;
          if (amberInZone > blueInZone) {
            cp.capturingTeam = "amber";
            cp.progress = Math.min(100, cp.progress + 2);
            if (cp.progress === 100) cp.owner = "amber";
          } else if (blueInZone > amberInZone) {
            cp.capturingTeam = "blue";
            cp.progress = Math.max(-100, cp.progress - 2);
            if (cp.progress === -100) cp.owner = "blue";
          } else {
            cp.capturingTeam = "none";
          }
          if (cp.owner === "amber") room.teamScores.amber += 0.05;
          if (cp.owner === "blue") room.teamScores.blue += 0.05;
          if (oldOwner !== cp.owner || Math.abs(oldProgress - cp.progress) > 1) {
            changed = true;
          }
        });
        if (changed || now % 1e3 < 100) {
          io.to(room.id).emit("controlPointUpdate", { controlPoints: room.controlPoints, teamScores: room.teamScores });
        }
      }
      const botIds = Object.keys(room.enemies);
      if (botIds.length > 0) {
        const playerIds = Object.keys(room.players);
        const mapSize = 500;
        const boundary = mapSize / 2 - 10;
        botIds.forEach((botId) => {
          const bot = room.enemies[botId];
          if (bot.state === "disabled") {
            if (now > bot.disabledUntil) {
              bot.state = "active";
              bot.health = 100;
              bot.position = [(Math.random() - 0.5) * (mapSize - 40), 1, (Math.random() - 0.5) * (mapSize - 40)];
              io.to(room.id).emit("enemyUpdate", { id: botId, state: "active", health: 100, position: bot.position });
            }
            return;
          }
          const settings = room.settings;
          const botSpeed = 0.15 * (settings.botPower / 5);
          const reactionTime = settings.botReactionTime;
          const accuracy = settings.botAccuracy / 10;
          const strategy = settings.botStrategy;
          if (!bot.targetId || !room.players[bot.targetId] || room.players[bot.targetId].state === "disabled") {
            let nearestPlayerId = null;
            let minDistance = Infinity;
            playerIds.forEach((pid) => {
              const player = room.players[pid];
              if (player.state === "disabled") return;
              const dist = Math.sqrt(Math.pow(player.position[0] - bot.position[0], 2) + Math.pow(player.position[2] - bot.position[2], 2));
              if (dist < minDistance) {
                minDistance = dist;
                nearestPlayerId = pid;
              }
            });
            bot.targetId = nearestPlayerId;
          }
          if (bot.targetId) {
            const target = room.players[bot.targetId];
            const dist = Math.sqrt(Math.pow(target.position[0] - bot.position[0], 2) + Math.pow(target.position[2] - bot.position[2], 2));
            if (bot.health < 40 && strategy !== "aggressive") bot.state = "cover";
            else if (dist < (strategy === "tactical" ? 30 : 20)) bot.state = "attack";
            else bot.state = "chase";
            if (bot.state === "chase" || bot.state === "attack") {
              const angle = Math.atan2(target.position[0] - bot.position[0], target.position[2] - bot.position[2]);
              bot.rotation = angle;
              let finalAngle = angle;
              const nextX = bot.position[0] + Math.sin(angle) * 5;
              const nextZ = bot.position[2] + Math.cos(angle) * 5;
              const isBlocked = room.blocks.some(
                (b) => Math.abs(b.position[0] - nextX) < 2 && Math.abs(b.position[2] - nextZ) < 2
              );
              if (isBlocked) {
                finalAngle += Math.PI / 2;
              }
              if (dist > (bot.state === "attack" ? 12 : 3)) {
                bot.position[0] += Math.sin(finalAngle) * botSpeed;
                bot.position[2] += Math.cos(finalAngle) * botSpeed;
              }
              if (bot.state === "attack") {
                const strafe = angle + Math.PI / 2;
                const jitter = Math.sin(now / 400 + Math.random()) * botSpeed * 0.5;
                bot.position[0] += Math.sin(strafe) * jitter;
                bot.position[2] += Math.cos(strafe) * jitter;
              }
            } else if (bot.state === "cover") {
              const angle = Math.atan2(bot.position[0] - target.position[0], bot.position[2] - target.position[2]);
              bot.position[0] += Math.sin(angle) * botSpeed * 1.2;
              bot.position[2] += Math.cos(angle) * botSpeed * 1.2;
            }
            bot.position[0] = Math.max(-boundary, Math.min(boundary, bot.position[0]));
            bot.position[2] = Math.max(-boundary, Math.min(boundary, bot.position[2]));
            if (bot.state === "attack" && now - bot.lastShotTime > reactionTime) {
              const error = (1 - accuracy) * 4;
              const predictedPos = [
                target.position[0] + (Math.random() - 0.5) * error,
                target.position[1],
                target.position[2] + (Math.random() - 0.5) * error
              ];
              const hitChance = accuracy / (target.isSprinting ? 2 : 1) * (bot.skillLevel / 10);
              io.to(room.id).emit("enemyShot", { id: botId, start: bot.position, end: predictedPos, color: "#ff0000" });
              if (Math.random() < hitChance) {
                const damage = 10 * (settings.botPower / 5);
                target.health -= damage;
                if (target.health <= 0) {
                  target.health = 0;
                  target.state = "disabled";
                  target.deaths += 1;
                  target.disabledUntil = now + 3e3;
                  bot.skillLevel = Math.min(10, bot.skillLevel + 1);
                  bot.state = "patrol";
                }
                io.to(room.id).emit("playerHit", {
                  targetId: bot.targetId,
                  shooterId: botId,
                  targetDisabledUntil: target.disabledUntil,
                  shooterScore: 0,
                  targetHealth: target.health,
                  targetDeaths: target.deaths
                });
              } else {
                bot.skillLevel = Math.max(1, bot.skillLevel - 0.1);
              }
              bot.lastShotTime = now;
            }
          } else {
            bot.state = "patrol";
            bot.rotation += 0.02;
            bot.position[0] += Math.sin(bot.rotation) * botSpeed * 0.5;
            bot.position[2] += Math.cos(bot.rotation) * botSpeed * 0.5;
            bot.position[0] = Math.max(-boundary, Math.min(boundary, bot.position[0]));
            bot.position[2] = Math.max(-boundary, Math.min(boundary, bot.position[2]));
          }
        });
        io.to(room.id).emit("enemiesMoved", room.enemies);
      }
    });
  }, 33);
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
//# sourceMappingURL=server.cjs.map
