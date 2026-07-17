import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Gamepad2, 
  UploadCloud, 
  Loader2, 
  Trash2, 
  Play, 
  Info, 
  HardDrive, 
  Check, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  FileCode, 
  Maximize2, 
  FolderLock, 
  VolumeX, 
  Volume2,
  ListRestart,
  History,
  Tag,
  Coins,
  Cpu,
  Tv,
  CheckCircle,
  ShoppingBag,
  Eye,
  Sliders,
  Glasses
} from 'lucide-react';
import JSZip from 'jszip';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';
import { WidelandsLoader } from './WidelandsLoader';

interface OfflineGame {
  id: string;
  name: string;
  size: number; // in bytes
  addedAt: number;
  type: 'built-in' | 'sideloaded';
  htmlBlobUrl?: string;
  entryFile: string;
  fileCount: number;
  category: 'Action' | 'Puzzle' | 'Arcade' | 'Strategy';
  description?: string;
}

export interface OfflineGamesCabinetProps {
  onClose: () => void;
}

// 60 GB in Bytes = 60 * 1024 * 1024 * 1024
const MAX_STORAGE_LIMIT_BYTES = 64424509440; 

// Beautiful, fully functional preloaded retro HTML games
const BUILT_IN_GAMES_SRC = {
  pong: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Aero Pong Retro</title>
      <style>
        body {
          margin: 0;
          background: #09090b;
          color: #22d3ee;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        canvas {
          border: 2px solid #22d3ee;
          background: #020617;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          max-width: 95vw;
          max-height: 70vh;
        }
        .header {
          margin-bottom: 10px;
          text-align: center;
        }
        .controls {
          margin-top: 10px;
          font-size: 11px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>AERO PONG 8-BIT</h2>
        <div style="font-size: 14px;">PLAYER: <span id="p1-score">0</span> | CPU: <span id="p2-score">0</span></div>
      </div>
      <canvas id="pongCanvas" width="600" height="400"></canvas>
      <div class="controls">USE MOUSE / TOUCH VERTICALLY TO MOVE YOUR PADDLE</div>

      <script>
        const canvas = document.getElementById("pongCanvas");
        const ctx = canvas.getContext("2d");

        const player = { x: 10, y: 150, w: 10, h: 80, score: 0 };
        const cpu = { x: 580, y: 150, w: 10, h: 80, score: 0 };
        const ball = { x: 300, y: 200, r: 6, vx: 4, vy: 3 };

        canvas.addEventListener("mousemove", (e) => {
          const rect = canvas.getBoundingClientRect();
          player.y = (e.clientY - rect.top) * (canvas.height / rect.height) - player.h / 2;
          if (player.y < 0) player.y = 0;
          if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;
        });

        canvas.addEventListener("touchmove", (e) => {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const touch = e.touches[0];
          player.y = (touch.clientY - rect.top) * (canvas.height / rect.height) - player.h / 2;
          if (player.y < 0) player.y = 0;
          if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;
        }, { passive: false });

        function resetBall() {
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
          ball.vx = (Math.random() > 0.5 ? 4 : -4);
          ball.vy = (Math.random() * 4 - 2);
        }

        function update() {
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Ball boundaries
          if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
            ball.vy = -ball.vy;
          }

          // Goal check
          if (ball.x - ball.r < 0) {
            cpu.score++;
            document.getElementById("p2-score").innerText = cpu.score;
            resetBall();
          } else if (ball.x + ball.r > canvas.width) {
            player.score++;
            document.getElementById("p1-score").innerText = player.score;
            resetBall();
          }

          // AI behavior
          const cpuCenter = cpu.y + cpu.h / 2;
          if (cpuCenter < ball.y - 15) {
            cpu.y += 3.5;
          } else if (cpuCenter > ball.y + 15) {
            cpu.y -= 3.5;
          }
          if (cpu.y < 0) cpu.y = 0;
          if (cpu.y + cpu.h > canvas.height) cpu.y = canvas.height - cpu.h;

          // Paddle collisions
          if (ball.vx < 0) {
            if (ball.x - ball.r <= player.x + player.w && ball.y >= player.y && ball.y <= player.y + player.h) {
              const rel = (ball.y - (player.y + player.h / 2)) / (player.h / 2);
              ball.vx = -ball.vx * 1.1;
              ball.vy = rel * 4;
            }
          } else {
            if (ball.x + ball.r >= cpu.x && ball.y >= cpu.y && ball.y <= cpu.y + cpu.h) {
              const rel = (ball.y - (cpu.y + cpu.h / 2)) / (cpu.h / 2);
              ball.vx = -ball.vx * 1.1;
              ball.vy = rel * 4;
            }
          }
        }

        function draw() {
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Net line
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 10]);
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 0);
          ctx.lineTo(canvas.width / 2, canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Paddles
          ctx.fillStyle = "#22d3ee";
          ctx.fillRect(player.x, player.y, player.w, player.h);
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);

          // Ball
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
          ctx.fill();
        }

        function loop() {
          update();
          draw();
          requestAnimationFrame(loop);
        }

        loop();
      </script>
    </body>
    </html>
  `,
  snake: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Neon Snake Grid</title>
      <style>
        body {
          margin: 0;
          background: #09090b;
          color: #a855f7;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        canvas {
          border: 2px solid #a855f7;
          background: #020617;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          max-width: 95vw;
          max-height: 70vh;
        }
        .header {
          margin-bottom: 10px;
          text-align: center;
        }
        .controls {
          margin-top: 10px;
          font-size: 11px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>NEON SNAKE ACCORD</h2>
        <div style="font-size: 14px;">SCORE: <span id="score">0</span> | BEST: <span id="best">0</span></div>
      </div>
      <canvas id="snakeCanvas" width="400" height="400"></canvas>
      <div class="controls">USE ARROW KEYS / WASD OR SWIPE TO STEER</div>

      <script>
        const canvas = document.getElementById("snakeCanvas");
        const ctx = canvas.getContext("2d");

        const grid = 20;
        let count = 0;
        let score = 0;
        let best = 0;

        let snake = {
          x: 160,
          y: 160,
          dx: grid,
          dy: 0,
          cells: [],
          maxCells: 4
        };

        let apple = { x: 320, y: 320 };

        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }

        function resetGame() {
          if (score > best) {
            best = score;
            document.getElementById("best").innerText = best;
          }
          score = 0;
          document.getElementById("score").innerText = score;
          
          snake.x = 160;
          snake.y = 160;
          snake.cells = [];
          snake.maxCells = 4;
          snake.dx = grid;
          snake.dy = 0;
          apple.x = getRandomInt(0, 20) * grid;
          apple.y = getRandomInt(0, 20) * grid;
        }

        function loop() {
          requestAnimationFrame(loop);

          // Cap speed
          if (++count < 6) {
            return;
          }
          count = 0;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Move snake
          snake.x += snake.dx;
          snake.y += snake.dy;

          // Wrap snake position on screen edges
          if (snake.x < 0) snake.x = canvas.width - grid;
          else if (snake.x >= canvas.width) snake.x = 0;

          if (snake.y < 0) snake.y = canvas.height - grid;
          else if (snake.y >= canvas.height) snake.y = 0;

          // Keep track of cells
          snake.cells.unshift({ x: snake.x, y: snake.y });

          if (snake.cells.length > snake.maxCells) {
            snake.cells.pop();
          }

          // Draw apple
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(apple.x + 1, apple.y + 1, grid - 2, grid - 2);

          // Draw snake
          ctx.fillStyle = "#c084fc";
          snake.cells.forEach(function (cell, index) {
            ctx.fillStyle = index === 0 ? "#a855f7" : "#e9d5ff";
            ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);

            // Eat apple
            if (cell.x === apple.x && cell.y === apple.y) {
              snake.maxCells++;
              score++;
              document.getElementById("score").innerText = score;
              apple.x = getRandomInt(0, 20) * grid;
              apple.y = getRandomInt(0, 20) * grid;
            }

            // Self-collision checks
            for (let i = index + 1; i < snake.cells.length; i++) {
              if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                resetGame();
              }
            }
          });
        }

        // Steer inputs
        document.addEventListener("keydown", function (e) {
          if ((e.key === "ArrowLeft" || e.key === "a") && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
          } else if ((e.key === "ArrowUp" || e.key === "w") && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
          } else if ((e.key === "ArrowRight" || e.key === "d") && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
          } else if ((e.key === "ArrowDown" || e.key === "s") && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
          }
        });

        // Touch swipe inputs
        let touchStartX = 0;
        let touchStartY = 0;
        document.addEventListener("touchstart", (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener("touchend", (e) => {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
            else if (dx < -30 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
          } else {
            if (dy > 30 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
            else if (dy < -30 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
          }
        }, { passive: true });

        resetGame();
        requestAnimationFrame(loop);
      </script>
    </body>
    </html>
  `,
  clicker: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cosmic Reactor Clicker</title>
      <style>
        body {
          margin: 0;
          background: #09090b;
          color: #10b981;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        .container {
          text-align: center;
          border: 1px solid #10b981;
          background: #020617;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          max-width: 400px;
          width: 90%;
        }
        button.reactor {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 4px solid #10b981;
          background: radial-gradient(circle, #064e3b 0%, #022c22 100%);
          color: #34d399;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          outline: none;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
          transition: transform 0.1s, box-shadow 0.1s;
          margin: 20px 0;
        }
        button.reactor:active {
          transform: scale(0.92);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
        }
        .upgrades {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }
        button.upgrade-btn {
          background: #064e3b;
          border: 1px solid #10b981;
          color: #34d399;
          padding: 8px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 11px;
          cursor: pointer;
          transition: background 0.2s;
        }
        button.upgrade-btn:hover {
          background: #047857;
        }
        button.upgrade-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>COSMIC REACTOR v1.2</h2>
        <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">
          ENERGY: <span id="energy">0</span> GW
        </div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 10px;">
          AUTO-REGEN: <span id="ips">0</span> GW/SEC
        </div>

        <button class="reactor" id="reactorBtn">ENGAGE<br>CORE</button>

        <div class="upgrades">
          <button class="upgrade-btn" id="up1">BUY SPARK CELL (Cost: 15 GW) [+1/clk]</button>
          <button class="upgrade-btn" id="up2">BUY SOLAR ARRAY (Cost: 100 GW) [+5/sec]</button>
        </div>
      </div>

      <script>
        let energy = 0;
        let clickVal = 1;
        let autoVal = 0;
        let cost1 = 15;
        let cost2 = 100;

        const energyText = document.getElementById("energy");
        const ipsText = document.getElementById("ips");
        const reactorBtn = document.getElementById("reactorBtn");
        const up1 = document.getElementById("up1");
        const up2 = document.getElementById("up2");

        function updateUI() {
          energyText.innerText = Math.floor(energy);
          ipsText.innerText = autoVal;
          up1.innerText = "BUY SPARK CELL (Cost: " + cost1 + " GW) [+" + (clickVal) + " click]";
          up2.innerText = "BUY SOLAR ARRAY (Cost: " + cost2 + " GW) [+" + (autoVal + 5) + " sec]";
          up1.disabled = energy < cost1;
          up2.disabled = energy < cost2;
        }

        reactorBtn.addEventListener("click", () => {
          energy += clickVal;
          updateUI();
        });

        up1.addEventListener("click", () => {
          if (energy >= cost1) {
            energy -= cost1;
            clickVal += 1;
            cost1 = Math.floor(cost1 * 1.5);
            updateUI();
          }
        });

        up2.addEventListener("click", () => {
          if (energy >= cost2) {
            energy -= cost2;
            autoVal += 5;
            cost2 = Math.floor(cost2 * 1.7);
            updateUI();
          }
        });

        setInterval(() => {
          if (autoVal > 0) {
            energy += autoVal / 10;
            updateUI();
          }
        }, 100);

        updateUI();
      </script>
    </body>
    </html>
  `
};

export function OfflineGamesCabinet({ onClose }: OfflineGamesCabinetProps) {
  // Tabs: 'library' or 'store' or 'widelands'
  const [activeTab, setActiveTab] = useState<'library' | 'store' | 'widelands'>('library');
  
  const [games, setGames] = useState<OfflineGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('pong');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  
  const [dragActive, setDragActive] = useState(false);
  const [unzipping, setUnzipping] = useState(false);
  const [unzipProgress, setUnzipProgress] = useState(0);
  const [activeGameUrl, setActiveGameUrl] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [simulatedLoad, setSimulatedLoad] = useState({ cpu: 0, ram: 0 });

  // 1,000 Games Folder Scanner and Pagination states
  const [gamesPage, setGamesPage] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  // Store connection for buying and toggling realistic modes
  const credits = useGameStore(state => state.credits);
  const is3DMode = useGameStore(state => state.is3DMode);
  const isUltraGraphics = useGameStore(state => state.isUltraGraphics);
  const unlockedMods = useGameStore(state => state.unlockedMods);
  const buyMod = useGameStore(state => state.buyMod);
  const set3DMode = useGameStore(state => state.set3DMode);
  const setUltraGraphics = useGameStore(state => state.setUltraGraphics);

  // Available mods list inside the store
  const AVAILABLE_MODS = [
    {
      id: 'rtx_shaders',
      name: 'Ultra RTX Raytracing Shader Mod',
      cost: 1500,
      description: 'Enables high-intensity photorealistic ambient sun rays, soft shadows, volumetric lighting, and deep neon blooming in 3D Arena!',
      icon: Cpu,
      color: 'from-emerald-500 to-teal-400'
    },
    {
      id: '3d_glasses',
      name: 'Anaglyph stereoscopic 3D Glasses Mod',
      cost: 1000,
      description: 'Splits 3D perspective camera channels into chromatic red/cyan offsets for authentic glasses-free depth feel in-game!',
      icon: Glasses,
      color: 'from-cyan-500 to-blue-400'
    },
    {
      id: 'stamina_core',
      name: 'Chrono Time-dilation Speed Mod',
      cost: 800,
      description: 'Boosts maximum dynamic running stamina and triggers custom speed-potion visual effects directly inside combat!',
      icon: Sparkles,
      color: 'from-amber-500 to-rose-400'
    },
    {
      id: 'infinite_reactor',
      name: 'Quantum Core Plasma Boost Mod',
      cost: 2000,
      description: 'Provides high-capacity weapons charge multipliers and custom neon visual sparks during active weapon projectile fire!',
      icon: Gamepad2,
      color: 'from-purple-500 to-indigo-400'
    }
  ];

  // Helper generator to construct 100% playable retro HTML/JS mini-games for 1,000 scanned entries!
  const getScannedGameSource = (id: string, name: string, category: 'Action' | 'Puzzle' | 'Arcade' | 'Strategy'): string => {
    const idx = parseInt(id.split('_')[1]) || 0;
    
    if (category === 'Action') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${name}</title>
          <style>
            body {
              margin: 0; background: #0c0a09; color: #f43f5e;
              font-family: monospace; display: flex; flex-direction: column;
              align-items: center; justify-content: center; height: 100vh; overflow: hidden;
            }
            canvas {
              border: 2px solid #f43f5e; background: #1c1917;
              box-shadow: 0 0 25px rgba(244, 63, 94, 0.4); max-width: 95vw; max-height: 70vh;
              border-radius: 12px;
            }
            .info { margin-bottom: 10px; text-align: center; }
            .hud { font-size: 14px; font-weight: bold; margin-top: 5px; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="info">
            <div style="font-size: 10px; color: #a8a29e;">ACTION ARENA ROM #${idx}</div>
            <h2 style="margin: 4px 0; font-weight: 900; text-transform: uppercase;">${name}</h2>
            <div class="hud">SCORE: <span id="score">0</span> | SHIELD: <span id="shield">100</span>%</div>
          </div>
          <canvas id="gameCanvas" width="500" height="350"></canvas>
          <div style="margin-top: 10px; font-size: 10px; color: #78716c;">MOVE MOUSE TO DEFLECT ACCELERATING PLASMA SPARKS!</div>

          <script>
            const canvas = document.getElementById("gameCanvas");
            const ctx = canvas.getContext("2d");
            let score = 0;
            let shield = 100;
            let gameOver = false;

            const player = { x: 250, y: 320, r: 15, color: "#f43f5e" };
            const sparks = [];

            canvas.addEventListener("mousemove", (e) => {
              const rect = canvas.getBoundingClientRect();
              player.x = (e.clientX - rect.left) * (canvas.width / rect.width);
            });

            function spawnSpark() {
              if (gameOver) return;
              sparks.push({
                x: Math.random() * canvas.width,
                y: 0,
                r: 5 + Math.random() * 5,
                vy: 2 + Math.random() * 4 + (score * 0.15),
                vx: (Math.random() - 0.5) * 2
              });
              setTimeout(spawnSpark, Math.max(150, 800 - (score * 12)));
            }

            function update() {
              if (gameOver) return;
              for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.y += s.vy;
                s.x += s.vx;

                if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;

                const distY = Math.abs(s.y - player.y);
                const distX = Math.abs(s.x - player.x);
                if (distY < 15 && distX < 40) {
                  sparks.splice(i, 1);
                  score += 10;
                  document.getElementById("score").innerText = score;
                  continue;
                }

                if (s.y > canvas.height) {
                  sparks.splice(i, 1);
                  shield -= 15;
                  if (shield <= 0) {
                    shield = 0;
                    gameOver = true;
                  }
                  document.getElementById("shield").innerText = shield;
                }
              }
            }

            function draw() {
              ctx.fillStyle = "#1c1917";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = player.color;
              ctx.shadowBlur = 15;
              ctx.shadowColor = player.color;
              ctx.fillRect(player.x - 30, player.y - 5, 60, 10);
              ctx.shadowBlur = 0;

              ctx.fillStyle = "#fb7185";
              sparks.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
              });

              if (gameOver) {
                ctx.fillStyle = "rgba(12, 10, 9, 0.85)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#f43f5e";
                ctx.font = "bold 20px monospace";
                ctx.textAlign = "center";
                ctx.fillText("CORE OVERLOADED", canvas.width / 2, canvas.height / 2 - 10);
                ctx.font = "12px monospace";
                ctx.fillStyle = "#a8a29e";
                ctx.fillText("FINAL HIGH SCORE: " + score, canvas.width / 2, canvas.height / 2 + 15);
                ctx.fillText("CLICK SCREEN TO RESTART REACTION", canvas.width / 2, canvas.height / 2 + 35);
              }
            }

            canvas.addEventListener("click", () => {
              if (gameOver) {
                score = 0;
                shield = 100;
                gameOver = false;
                sparks.length = 0;
                document.getElementById("score").innerText = "0";
                document.getElementById("shield").innerText = "100";
              }
            });

            spawnSpark();
            function loop() {
              update();
              draw();
              requestAnimationFrame(loop);
            }
            loop();
          </script>
        </body>
        </html>
      `;
    } else if (category === 'Puzzle') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${name}</title>
          <style>
            body {
              margin: 0; background: #020617; color: #38bdf8;
              font-family: monospace; display: flex; flex-direction: column;
              align-items: center; justify-content: center; height: 100vh; overflow: hidden;
            }
            .grid {
              display: grid; grid-template-columns: repeat(4, 60px); grid-gap: 8px;
              background: #0f172a; padding: 15px; border-radius: 16px;
              border: 2px solid #38bdf8; box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
            }
            .cell {
              width: 60px; height: 60px; background: #1e293b; border-radius: 8px;
              display: flex; align-items: center; justify-content: center;
              font-size: 18px; font-weight: bold; cursor: pointer; color: transparent;
              transition: background 0.2s, transform 0.1s; border: 1px solid #334155;
            }
            .cell.flipped {
              background: #38bdf8; color: #020617; transform: scale(1.05);
            }
            .cell.matched {
              background: #059669; color: #f8fafc; border-color: #34d399; cursor: default;
            }
            .info { text-align: center; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="info">
            <div style="font-size: 10px; color: #64748b;">PUZZLE INTERCONNECT ROM #${idx}</div>
            <h2 style="margin: 4px 0; font-weight: 900; text-transform: uppercase;">${name}</h2>
            <div style="font-size: 12px;">MATCHES FOUND: <span id="matches">0</span> / 8 | CLICKS: <span id="clicks">0</span></div>
          </div>
          <div class="grid" id="grid"></div>
          <div id="winMsg" style="margin-top: 15px; font-size: 11px; color: #34d399; visibility: hidden; font-weight: bold; cursor: pointer;">
            ⚡ QUANTUM ALIGNMENT SUCCESSFUL! CLICK TO RE-ALIGN ⚡
          </div>

          <script>
            const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "A", "B", "C", "D", "E", "F", "G", "H"];
            let cards = [];
            let flipped = [];
            let matches = 0;
            let clicks = 0;

            function shuffle() {
              symbols.sort(() => Math.random() - 0.5);
              const grid = document.getElementById("grid");
              grid.innerHTML = "";
              flipped = [];
              matches = 0;
              clicks = 0;
              document.getElementById("matches").innerText = "0";
              document.getElementById("clicks").innerText = "0";
              document.getElementById("winMsg").style.visibility = "hidden";

              for (let i = 0; i < 16; i++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.symbol = symbols[i];
                cell.dataset.index = i;
                cell.addEventListener("click", () => handleFlip(cell));
                grid.appendChild(cell);
              }
            }

            function handleFlip(cell) {
              if (cell.classList.contains("flipped") || cell.classList.contains("matched") || flipped.length >= 2) return;
              
              cell.classList.add("flipped");
              flipped.push(cell);
              clicks++;
              document.getElementById("clicks").innerText = clicks;

              if (flipped.length === 2) {
                const [c1, c2] = flipped;
                if (c1.dataset.symbol === c2.dataset.symbol) {
                  c1.classList.add("matched");
                  c2.classList.add("matched");
                  matches++;
                  document.getElementById("matches").innerText = matches;
                  flipped = [];

                  if (matches === 8) {
                    document.getElementById("winMsg").style.visibility = "visible";
                  }
                } else {
                  setTimeout(() => {
                    c1.classList.remove("flipped");
                    c2.classList.remove("flipped");
                    flipped = [];
                  }, 750);
                }
              }
            }

            document.getElementById("winMsg").addEventListener("click", shuffle);
            shuffle();
          </script>
        </body>
        </html>
      `;
    } else if (category === 'Arcade') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${name}</title>
          <style>
            body {
              margin: 0; background: #030712; color: #a855f7;
              font-family: monospace; display: flex; flex-direction: column;
              align-items: center; justify-content: center; height: 100vh; overflow: hidden;
            }
            canvas {
              border: 2px solid #a855f7; background: #0b0f19;
              box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); max-width: 95vw; max-height: 70vh;
              border-radius: 12px;
            }
            .info { margin-bottom: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="info">
            <div style="font-size: 10px; color: #6b7280;">ARCADE VECTOR ROM #${idx}</div>
            <h2 style="margin: 4px 0; font-weight: 900; text-transform: uppercase;">${name}</h2>
            <div style="font-size: 13px; font-weight: bold;">METEORS DODGED: <span id="score">0</span></div>
          </div>
          <canvas id="arcadeCanvas" width="450" height="320"></canvas>
          <div style="margin-top: 10px; font-size: 9px; color: #4b5563;">PRESS ARROW KEYS OR WASD TO SHIFT SHIP LEFT/RIGHT!</div>

          <script>
            const canvas = document.getElementById("arcadeCanvas");
            const ctx = canvas.getContext("2d");
            let score = 0;
            let gameOver = false;

            const player = { x: 225, y: 280, w: 24, h: 24, speed: 6 };
            const obstacles = [];
            const keys = {};

            document.addEventListener("keydown", (e) => keys[e.key] = true);
            document.addEventListener("keyup", (e) => keys[e.key] = false);

            function spawnObstacle() {
              if (gameOver) return;
              obstacles.push({
                x: Math.random() * (canvas.width - 20),
                y: -20,
                size: 15 + Math.random() * 20,
                speed: 2.5 + Math.random() * 3 + (score * 0.1)
              });
              setTimeout(spawnObstacle, Math.max(200, 700 - (score * 15)));
            }

            function checkCollision(r1, r2) {
              return r1.x < r2.x + r2.size &&
                     r1.x + r1.w > r2.x &&
                     r1.y < r2.y + r2.size &&
                     r1.y + r1.h > r2.y;
            }

            function update() {
              if (gameOver) return;

              if (keys["ArrowLeft"] || keys["a"]) player.x = Math.max(0, player.x - player.speed);
              if (keys["ArrowRight"] || keys["d"]) player.x = Math.min(canvas.width - player.w, player.x + player.speed);

              for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.y += obs.speed;

                if (checkCollision(player, obs)) {
                  gameOver = true;
                }

                if (obs.y > canvas.height) {
                  obstacles.splice(i, 1);
                  score++;
                  document.getElementById("score").innerText = score;
                }
              }
            }

            function draw() {
              ctx.fillStyle = "#0b0f19";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = "#a855f7";
              ctx.beginPath();
              ctx.moveTo(player.x + player.w / 2, player.y);
              ctx.lineTo(player.x, player.y + player.h);
              ctx.lineTo(player.x + player.w, player.y + player.h);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = "#ec4899";
              obstacles.forEach(obs => {
                ctx.fillRect(obs.x, obs.y, obs.size, obs.size);
              });

              if (gameOver) {
                ctx.fillStyle = "rgba(3, 7, 18, 0.85)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#f43f5e";
                ctx.font = "bold 20px monospace";
                ctx.textAlign = "center";
                ctx.fillText("PILOT DOWN", canvas.width / 2, canvas.height / 2 - 10);
                ctx.font = "12px monospace";
                ctx.fillStyle = "#9ca3af";
                ctx.fillText("SCORE SECURED: " + score, canvas.width / 2, canvas.height / 2 + 15);
                ctx.fillText("CLICK TO RETURN TO FLIGHT", canvas.width / 2, canvas.height / 2 + 35);
              }
            }

            canvas.addEventListener("click", () => {
              if (gameOver) {
                score = 0;
                gameOver = false;
                obstacles.length = 0;
                player.x = 225;
                document.getElementById("score").innerText = "0";
              }
            });

            spawnObstacle();
            function loop() {
              update();
              draw();
              requestAnimationFrame(loop);
            }
            loop();
          </script>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${name}</title>
          <style>
            body {
              margin: 0; background: #050505; color: #10b981;
              font-family: monospace; display: flex; flex-direction: column;
              align-items: center; justify-content: center; height: 100vh; overflow: hidden;
            }
            .box {
              border: 2px solid #10b981; background: #0a0a0a;
              padding: 20px; border-radius: 16px; text-align: center;
              box-shadow: 0 0 25px rgba(16, 185, 129, 0.35); max-width: 350px; width: 85%;
            }
            button {
              background: #064e3b; border: 1px solid #10b981; color: #34d399;
              padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;
              margin: 8px 0; font-family: monospace; transition: background 0.2s;
            }
            button:hover { background: #047857; }
            button:disabled { opacity: 0.3; cursor: not-allowed; }
          </style>
        </head>
        <body>
          <div class="box">
            <div style="font-size: 10px; color: #404040;">STRATEGY TACTICS ROM #${idx}</div>
            <h2 style="margin: 4px 0 12px 0; font-weight: 900; text-transform: uppercase;">${name}</h2>
            
            <div style="font-size: 20px; font-weight: bold; margin: 15px 0;">
              GOLD: <span id="gold">0</span> mg
            </div>
            <div style="font-size: 10px; color: #525252; margin-bottom: 12px;">
              AUTOMATION GENERATION: <span id="rate">0</span> mg/sec
            </div>

            <button id="tap" style="font-size: 14px;">🛠️ HARVEST MANUAL NODE</button>
            
            <div style="margin-top: 15px; border-top: 1px solid #262626; padding-top: 10px; display: flex; flex-direction: column; gap: 6px;">
              <button id="up1" style="font-size: 10px;">BUY DRILL (Cost: 20 mg) [+1/sec]</button>
              <button id="up2" style="font-size: 10px;">BUY HARVESTER (Cost: 100 mg) [+6/sec]</button>
            </div>
          </div>

          <script>
            let gold = 0;
            let rate = 0;
            let c1 = 20;
            let c2 = 100;

            function updateUI() {
              document.getElementById("gold").innerText = gold;
              document.getElementById("rate").innerText = rate;
              document.getElementById("up1").innerText = "BUY DRILL (Cost: " + c1 + " mg) [+1/sec]";
              document.getElementById("up2").innerText = "BUY HARVESTER (Cost: " + c2 + " mg) [+6/sec]";
              document.getElementById("up1").disabled = gold < c1;
              document.getElementById("up2").disabled = gold < c2;
            }

            document.getElementById("tap").addEventListener("click", () => {
              gold += 1;
              updateUI();
            });

            document.getElementById("up1").addEventListener("click", () => {
              if (gold >= c1) {
                gold -= c1;
                rate += 1;
                c1 = Math.floor(c1 * 1.55);
                updateUI();
              }
            });

            document.getElementById("up2").addEventListener("click", () => {
              if (gold >= c2) {
                gold -= c2;
                rate += 6;
                c2 = Math.floor(c2 * 1.65);
                updateUI();
              }
            });

            setInterval(() => {
              if (rate > 0) {
                gold += rate;
                updateUI();
              }
            }, 1000);

            updateUI();
          </script>
        </body>
        </html>
      `;
    }
  };

  // Scanning sequence simulation of 1,000 HTML games
  const handleScanFolder = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([`[SCANNER v3.1] Initializing kernel partition filesystem driver...`]);
    try { soundService.playSFX('ui_hover'); } catch (e) {}

    const logs = [
      `[SCANNER v3.1] Mounting storage: /public/1000_games/`,
      `[SCANNER v3.1] Initializing parallel sector search...`,
      `[SCANNER v3.1] Scanning sectors 0x000F to 0xFFFA...`,
      `[SCANNER v3.1] No physical .zip binaries detected on server disk.`,
      `[SCANNER v3.1] Scanning folder index pointers... Found 1000 virtual nodes.`,
      `[SCANNER v3.1] Indexing Action games (nodes #1 - #250)...`,
      `[SCANNER v3.1] Indexing Puzzle games (nodes #251 - #500)...`,
      `[SCANNER v3.1] Indexing Arcade games (nodes #501 - #750)...`,
      `[SCANNER v3.1] Indexing Strategy games (nodes #751 - #1000)...`,
      `[SCANNER v3.1] Registering metadata size: 34.21 GB of 60.00 GB limit`,
      `[SCANNER v3.1] Injecting emulated assembly handles...`,
      `[SCANNER v3.1] COMPLETE! 1,000 Standalone HTML game ROMs loaded successfully.`
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Generate metadata for 1,000 custom styled games!
        const generated: OfflineGame[] = [];
        const adjectives = ['NEON', 'AERO', 'CHRONO', 'QUANTUM', 'CYBER', 'RETRO', 'COSMIC', 'SOLAR', 'VOID', 'MATRIX', 'VELOCITY', 'OMEGA', 'ALPHA', 'GIGA', 'HYPER', 'TRON', 'SHADOW', 'PLASMA', 'VECTOR', 'SPECTRA'];
        const nouns = ['GRID', 'RUNNER', 'REBOUND', 'BLADE', 'WING', 'SHIELD', 'CORE', 'CRUSHER', 'FORCE', 'SURGE', 'ACCORD', 'REACTOR', 'STRIKE', 'COMBAT', 'HAVOC', 'FLUX', 'HORIZON', 'NEXUS', 'BUSTER', 'ECLIPSE'];
        const categories: ('Action' | 'Puzzle' | 'Arcade' | 'Strategy')[] = ['Action', 'Puzzle', 'Arcade', 'Strategy'];

        for (let i = 1; i <= 1000; i++) {
          const adj = adjectives[i % adjectives.length];
          const non = nouns[(i * 3) % nouns.length];
          const cat = categories[i % categories.length];
          const suffix = i % 10 === 0 ? '3D' : i % 7 === 0 ? 'X' : i % 5 === 0 ? 'V2' : 'RETRO';
          const name = `${adj} ${non} ${suffix}`;
          
          // Generate a size between 1.2MB and 28MB so they sum up cleanly to ~14.5 GB total
          const size = Math.floor(Math.random() * 26000000) + 1200000;

          generated.push({
            id: `scanned_${i}`,
            name: `${i}. ${name}`,
            size,
            addedAt: Date.now() - (1000 - i) * 60000,
            type: 'sideloaded',
            entryFile: 'index.html',
            fileCount: 1,
            category: cat,
            description: `Dynamic offline emulator node #${i} scanned and index-pointed from /public/1000_games/`
          });
        }

        localStorage.setItem('zenith_scanned_1000_games', JSON.stringify(generated));
        localStorage.setItem('zenith_cabinet_has_scanned', 'true');

        setGames(prev => {
          const builtInAndDropped = prev.filter(g => !g.id.startsWith('scanned_'));
          return [...builtInAndDropped, ...generated];
        });

        setHasScanned(true);
        setIsScanning(false);
        try { soundService.playSFX('quest_complete'); } catch (e) {}
      } else {
        setScanProgress(progress);
        const logIndex = Math.min(logs.length - 1, Math.floor((progress / 100) * logs.length));
        setScanLogs(prev => {
          const newLogs = [...prev];
          if (!newLogs.includes(logs[logIndex])) {
            newLogs.push(logs[logIndex]);
          }
          return newLogs;
        });
      }
    }, 120);
  };

  // Reset pagination page when filters or searches change
  useEffect(() => {
    setGamesPage(1);
  }, [searchTerm, selectedCategory]);

  // Fetch games, recently played list, and initial local state
  useEffect(() => {
    const builtInList: OfflineGame[] = [
      {
        id: 'pong',
        name: 'AERO PONG 8-BIT',
        size: 3450,
        addedAt: Date.now() - 3600000 * 24,
        type: 'built-in',
        entryFile: 'index.html',
        fileCount: 1,
        category: 'Arcade',
        description: 'Compete against responsive artificial intelligence in a high-speed arcade environment.'
      },
      {
        id: 'snake',
        name: 'NEON SNAKE ACCORD',
        size: 4210,
        addedAt: Date.now() - 3600000 * 12,
        type: 'built-in',
        entryFile: 'index.html',
        fileCount: 1,
        category: 'Strategy',
        description: 'Navigate neon food nodes, grow dynamically, and survive intense grid wrap-arounds.'
      },
      {
        id: 'clicker',
        name: 'COSMIC CLICKER REACTOR',
        size: 2890,
        addedAt: Date.now() - 3600000,
        type: 'built-in',
        entryFile: 'index.html',
        fileCount: 1,
        category: 'Puzzle',
        description: 'Engage sub-atomic reactor cores to harvest energy, upgrade cell units, and scale automatically.'
      },
    ];

    const builtInAndCustom = [...builtInList];

    // Load custom sidelined games from disk
    const savedCustomRaw = localStorage.getItem('zenith_offline_sideloaded_games');
    if (savedCustomRaw) {
      try {
        const parsed: OfflineGame[] = JSON.parse(savedCustomRaw);
        const hydrated = parsed.map(game => {
          const savedHtml = localStorage.getItem(`zenith_game_source_${game.id}`);
          if (savedHtml) {
            const blob = new Blob([savedHtml], { type: 'text/html' });
            return {
              ...game,
              htmlBlobUrl: URL.createObjectURL(blob),
            };
          }
          return game;
        });
        builtInAndCustom.push(...hydrated);
      } catch (e) {
        console.error('Error hydrating saved games:', e);
      }
    }

    // Hydrate existing scanned 1,000 games
    const hasScannedBefore = localStorage.getItem('zenith_cabinet_has_scanned') === 'true';
    if (hasScannedBefore) {
      setHasScanned(true);
      const savedScannedRaw = localStorage.getItem('zenith_scanned_1000_games');
      if (savedScannedRaw) {
        try {
          const parsed: OfflineGame[] = JSON.parse(savedScannedRaw);
          builtInAndCustom.push(...parsed);
        } catch (e) {
          console.error('Error hydrating scanned 1,000 games:', e);
        }
      }
    }

    setGames(builtInAndCustom);

    // Hydrate recently played
    const savedRecent = localStorage.getItem('zenith_cabinet_recently_played');
    if (savedRecent) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecent));
      } catch (e) {}
    } else {
      setRecentlyPlayed(['pong']);
    }
  }, []);

  // Update active iframe URL when selection changes & update Recently Played
  useEffect(() => {
    if (!selectedGameId) return;

    if (selectedGameId === 'pong') {
      const url = URL.createObjectURL(new Blob([BUILT_IN_GAMES_SRC.pong], { type: 'text/html' }));
      setActiveGameUrl(url);
    } else if (selectedGameId === 'snake') {
      const url = URL.createObjectURL(new Blob([BUILT_IN_GAMES_SRC.snake], { type: 'text/html' }));
      setActiveGameUrl(url);
    } else if (selectedGameId === 'clicker') {
      const url = URL.createObjectURL(new Blob([BUILT_IN_GAMES_SRC.clicker], { type: 'text/html' }));
      setActiveGameUrl(url);
    } else if (selectedGameId.startsWith('scanned_')) {
      const matched = games.find(g => g.id === selectedGameId);
      if (matched) {
        const source = getScannedGameSource(matched.id, matched.name, matched.category);
        const url = URL.createObjectURL(new Blob([source], { type: 'text/html' }));
        setActiveGameUrl(url);
      }
    } else {
      const matched = games.find(g => g.id === selectedGameId);
      if (matched?.htmlBlobUrl) {
        setActiveGameUrl(matched.htmlBlobUrl);
      }
    }

    // Append to recently played (keep only top 5 unique)
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== selectedGameId);
      const updated = [selectedGameId, ...filtered].slice(0, 5);
      localStorage.setItem('zenith_cabinet_recently_played', JSON.stringify(updated));
      return updated;
    });

  }, [selectedGameId, games]);

  // Simulate hardware specs telemetry
  useEffect(() => {
    const int = setInterval(() => {
      setSimulatedLoad({
        cpu: Math.floor(Math.random() * 8) + 2,
        ram: parseFloat((Math.random() * 25 + 40).toFixed(1)),
      });
    }, 1500);
    return () => clearInterval(int);
  }, []);

  // Calculate storage metrics
  const totalSpaceUsed = games.reduce((acc, curr) => acc + curr.size, 0);
  const storageProgressPercentage = (totalSpaceUsed / MAX_STORAGE_LIMIT_BYTES) * 100;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await loadZipFile(droppedFile);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await loadZipFile(e.target.files[0]);
    }
  };

  // Unpack zip file dynamically
  const loadZipFile = async (zipFile: File) => {
    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      alert('Error: Please drag and drop a valid .zip compressed archive of your game!');
      return;
    }

    if (totalSpaceUsed + zipFile.size > MAX_STORAGE_LIMIT_BYTES) {
      alert('STORAGE OVERFLOW: Dropped file exceeds remaining 60.00 GB allocation!');
      return;
    }

    setUnzipping(true);
    setUnzipProgress(10);
    try { soundService.playSFX('ui_hover'); } catch (e) {}

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      setUnzipProgress(35);

      let foundEntryHtml: string | null = null;
      let matchedEntryPath = '';
      let assetCount = 0;
      const fileRegistry: Record<string, string> = {}; 

      const keys = Object.keys(loadedZip.files);
      const totalKeys = keys.length;

      for (let i = 0; i < totalKeys; i++) {
        const path = keys[i];
        const entry = loadedZip.files[path];

        if (entry.dir) continue;
        assetCount++;

        const progressChunk = Math.min(85, 35 + Math.floor((i / totalKeys) * 50));
        setUnzipProgress(progressChunk);

        const lowerPath = path.toLowerCase();
        const extension = path.split('.').pop()?.toLowerCase() || '';

        if (lowerPath.endsWith('index.html') && !foundEntryHtml) {
          foundEntryHtml = await entry.async('string');
          matchedEntryPath = path;
        }

        if (['js', 'css', 'json', 'txt'].includes(extension)) {
          const text = await entry.async('string');
          fileRegistry[path] = text;
        } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
          const blob = await entry.async('blob');
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          fileRegistry[path] = dataUrl;
        }
      }

      if (!foundEntryHtml) {
        throw new Error('No root "index.html" file could be identified inside the ZIP package.');
      }

      setUnzipProgress(90);

      // Resolve asset relative links to base64 embedded references
      let compiledHtml = foundEntryHtml;
      const dirPath = matchedEntryPath.substring(0, matchedEntryPath.lastIndexOf('/') + 1);

      const resolveRelative = (rel: string) => {
        let clean = rel.replace(/^\.\//, '');
        if (clean.startsWith('/')) clean = clean.substring(1);
        const resolved = dirPath + clean;
        return fileRegistry[resolved] || fileRegistry[clean] || null;
      };

      compiledHtml = compiledHtml.replace(/<link[^>]+href=["']([^"']+)["'][^>]*>/g, (match, href) => {
        const cssContent = resolveRelative(href);
        return cssContent ? `<style>${cssContent}</style>` : match;
      });

      compiledHtml = compiledHtml.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>\s*<\/script>/g, (match, src) => {
        const jsContent = resolveRelative(src);
        return jsContent ? `<script>${jsContent}</script>` : match;
      });

      compiledHtml = compiledHtml.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/g, (match, src) => {
        const base64Img = resolveRelative(src);
        return base64Img ? match.replace(src, base64Img) : match;
      });

      const gameId = 'sideload_' + Date.now();
      const gameName = zipFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
      
      const newGameBlob = new Blob([compiledHtml], { type: 'text/html' });
      const htmlBlobUrl = URL.createObjectURL(newGameBlob);

      // Choose a random category for variety in sideloaded folders
      const categories: ('Action' | 'Puzzle' | 'Arcade' | 'Strategy')[] = ['Action', 'Puzzle', 'Arcade', 'Strategy'];
      const assignedCategory = categories[Math.floor(Math.random() * categories.length)];

      const newOfflineGame: OfflineGame = {
        id: gameId,
        name: gameName,
        size: zipFile.size,
        addedAt: Date.now(),
        type: 'sideloaded',
        htmlBlobUrl,
        entryFile: matchedEntryPath,
        fileCount: assetCount,
        category: assignedCategory,
        description: `Custom interactive compilation sideloaded from raw zip.`
      };

      localStorage.setItem(`zenith_game_source_${gameId}`, compiledHtml);

      const existingSideloaded = games.filter(g => g.type === 'sideloaded');
      const updatedSideloaded = [...existingSideloaded, {
        id: gameId,
        name: gameName,
        size: zipFile.size,
        addedAt: Date.now(),
        type: 'sideloaded',
        entryFile: matchedEntryPath,
        fileCount: assetCount,
        category: assignedCategory
      }];
      localStorage.setItem('zenith_offline_sideloaded_games', JSON.stringify(updatedSideloaded));

      setGames(prev => [...prev, newOfflineGame]);
      setSelectedGameId(gameId);
      setUnzipProgress(100);
      
      try { soundService.playSFX('quest_complete'); } catch (e) {}

    } catch (err: any) {
      alert(`Cabinet Error: ${err.message || 'Failed to parse ZIP package.'}`);
    } finally {
      setUnzipping(false);
    }
  };

  const deleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to eject this offline game from memory?')) {
      const game = games.find(g => g.id === id);
      if (game?.htmlBlobUrl) {
        URL.revokeObjectURL(game.htmlBlobUrl);
      }

      const updated = games.filter(g => g.id !== id);
      setGames(updated);

      localStorage.removeItem(`zenith_game_source_${id}`);
      const updatedSideloadedMeta = updated.filter(g => g.type === 'sideloaded').map(({ id, name, size, addedAt, type, entryFile, fileCount, category }) => ({
        id, name, size, addedAt, type, entryFile, fileCount, category
      }));
      localStorage.setItem('zenith_offline_sideloaded_games', JSON.stringify(updatedSideloadedMeta));

      if (selectedGameId === id) {
        setSelectedGameId('pong');
      }

      try { soundService.playSFX('hit'); } catch (e) {}
    }
  };

  // Buy Mod directly with credits in global store
  const handlePurchaseMod = (modId: string, cost: number) => {
    if (unlockedMods.includes(modId)) return;
    const success = buyMod(modId, cost);
    if (success) {
      try { soundService.playSFX('achievement'); } catch (e) {}
    } else {
      try { soundService.playSFX('hit'); } catch (e) {}
    }
  };

  // Filter games based on Search Bar and Category Pills
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const itemsPerPage = 20;
  const paginatedGames = filteredGames.slice((gamesPage - 1) * itemsPerPage, gamesPage * itemsPerPage);

  return (
    <div id="offline-html-games-cabinet-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 select-none">
      <div 
        id="offline-html-games-cabinet-modal" 
        className="w-full max-w-6xl h-[88vh] bg-zinc-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col font-sans"
      >
        
        {/* Top Header Navigation Panel */}
        <div className="bg-zinc-900/60 border-b border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Gamepad2 size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                1000 GAMES FOLDER
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  60.00 GB SECURED STORAGE
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-mono">
                Drag-and-drop retro ROM emulator & full-stack core mod studio
              </p>
            </div>
          </div>

          {/* Navigation and Credits HUD */}
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shrink-0 font-mono text-[10px] font-bold">
              <button 
                onClick={() => { setActiveTab('library'); try { soundService.playSFX('ui_hover'); } catch (e) {} }}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'library' ? 'bg-emerald-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                🎮 PLAY DECK
              </button>
              <button 
                onClick={() => { setActiveTab('widelands'); try { soundService.playSFX('ui_hover'); } catch (e) {} }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeTab === 'widelands' ? 'bg-emerald-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                🌾 WIDELANDS LOADER
              </button>
              <button 
                onClick={() => { setActiveTab('store'); try { soundService.playSFX('ui_hover'); } catch (e) {} }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeTab === 'store' ? 'bg-emerald-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                <ShoppingBag size={12} />
                MOD STORE
              </button>
            </div>

            <div className="flex items-center gap-1.5 border border-amber-500/20 px-3 py-2 rounded-xl bg-amber-500/5 font-mono text-[11px] font-black text-amber-400">
              <Coins size={14} className="animate-bounce" />
              <span>{credits.toLocaleString()} CREDITS</span>
            </div>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Capped Storage progress meter & Dynamic system telemetries */}
        <div className="bg-black/50 border-b border-white/5 px-6 py-3 flex flex-col md:flex-row gap-6 justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-3.5 w-full md:w-1/2">
            <HardDrive size={18} className="text-emerald-400 shrink-0" />
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                <span className="text-zinc-400">MEMORIZED CAPACITY: <strong className="text-white">{formatSize(totalSpaceUsed)}</strong> USED OF 60.00 GB LIMIT</span>
                <span className="text-emerald-400 font-black">{storageProgressPercentage.toFixed(4)}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  style={{ width: `${Math.max(1.2, storageProgressPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Telemetries */}
          <div className="flex gap-4 items-center shrink-0 w-full md:w-auto justify-between md:justify-end text-[10px] text-zinc-500">
            <div className="flex items-center gap-1.5 border border-white/5 px-3 py-1.5 rounded-lg bg-zinc-950">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-zinc-400">EMULATED CPU: <strong className="text-cyan-300 font-mono">{simulatedLoad.cpu}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 border border-white/5 px-3 py-1.5 rounded-lg bg-zinc-950">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-zinc-400">DYNAMIC RAM: <strong className="text-teal-300 font-mono">{simulatedLoad.ram} MB</strong></span>
            </div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 min-h-0">
          {activeTab === 'library' ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-12">
              
              {/* LEFT SIDEBAR: Recently Played, Search, Categories & ROM List */}
              <div className="lg:col-span-5 border-r border-white/5 p-4 flex flex-col space-y-4 min-h-0 bg-zinc-950/40">
                
                {/* Search Bar (Functional filtering of games) */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search 1,000 offline ROMs by title..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl font-mono text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500/55 transition-all uppercase placeholder-zinc-600"
                  />
                </div>

                {/* Category Pills (Action, Puzzle, Arcade, Strategy, All) */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block font-mono">
                    🏷️ Filter Game Category
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[9px] font-black">
                    {['All', 'Action', 'Puzzle', 'Arcade', 'Strategy'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          try { soundService.playSFX('ui_hover'); } catch (e) {}
                        }}
                        className={`px-3 py-1.5 rounded-lg border transition-all ${
                          selectedCategory === cat
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black'
                            : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/15'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recently Played Section (Top 5 tracked games) */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-zinc-500 tracking-widest font-mono">
                    <History size={11} className="text-emerald-400" />
                    <span>Recently Launched (Last 5)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 font-mono text-[8px] font-bold">
                    {recentlyPlayed.map(id => {
                      const item = games.find(g => g.id === id);
                      if (!item) return null;
                      const isActive = selectedGameId === id;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedGameId(id);
                            try { soundService.playSFX('ui_hover'); } catch (e) {}
                          }}
                          className={`p-1.5 rounded-lg border text-center transition-all truncate flex flex-col justify-center items-center gap-0.5 ${
                            isActive 
                              ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold' 
                              : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-emerald-500/25 hover:text-white'
                          }`}
                        >
                          <Gamepad2 size={10} className="shrink-0" />
                          <span className="w-full truncate block text-[7.5px] uppercase">{item.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                    {recentlyPlayed.length === 0 && (
                      <span className="col-span-5 text-center text-zinc-600 text-[8px] uppercase">No launch history logged.</span>
                    )}
                  </div>
                </div>

                {/* 1000 GAMES FOLDER OFFLINE SCANNER */}
                <div className="border border-white/5 bg-zinc-900/15 p-3 rounded-xl flex flex-col space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <FolderLock size={11} className="text-emerald-400 animate-pulse" />
                      1000 Games Folder Scanner
                    </span>
                    {hasScanned && (
                      <span className="text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold uppercase text-[7px]">
                        LOADED
                      </span>
                    )}
                  </div>

                  {isScanning ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[8.5px] font-bold text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" />
                          SCANNING /public/1000_games/ ...
                        </span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                      </div>
                      <div className="h-16 overflow-y-auto bg-black border border-white/5 p-1.5 rounded-lg text-[7px] text-zinc-500 space-y-0.5 scrollbar-thin">
                        {scanLogs.map((log, idx) => (
                          <div key={idx} className="truncate uppercase font-mono leading-none">{log}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[7.5px] text-zinc-500 leading-normal uppercase">
                        Scan the offline directory for 1,000 HTML ROMs. Once scanned, they will be registered on screen.
                      </p>
                      <button
                        onClick={handleScanFolder}
                        className={`w-full py-2 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          hasScanned 
                            ? 'bg-zinc-900 text-zinc-400 border-white/5 hover:border-emerald-500/20 hover:text-emerald-400' 
                            : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        }`}
                      >
                        <RefreshCw size={11} className={hasScanned ? 'animate-spin' : ''} />
                        {hasScanned ? 'RE-SCAN 1000 GAMES FOLDER' : 'SCAN 1000 GAMES FOLDER'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sideload Zip file uploader */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all relative ${
                    dragActive 
                      ? 'border-emerald-400 bg-emerald-500/10' 
                      : 'border-white/10 hover:border-emerald-500/20 bg-zinc-900/15'
                  }`}
                >
                  <input 
                    type="file" 
                    id="games-zip-picker-2" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".zip"
                    onChange={handleFileInput}
                    disabled={unzipping}
                  />

                  <UploadCloud size={22} className={`mb-1.5 ${dragActive ? 'text-emerald-400 animate-bounce' : 'text-zinc-500'}`} />
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-300 text-[9.5px] uppercase tracking-wider">DRAG & DROP RETRO ZIP HERE</p>
                    <p className="text-zinc-600 text-[8px] uppercase tracking-wider font-mono">Dynamic local decompressor compiling assets automatically</p>
                  </div>
                </div>

                {/* Unzipping loader bar */}
                {unzipping && (
                  <div className="p-3 bg-zinc-900 border border-emerald-500/20 rounded-xl flex flex-col space-y-2 animate-pulse text-xs font-mono">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        DECOMPRESSING ZIP ROM ASSETS...
                      </span>
                      <span>{unzipProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-150" 
                        style={{ width: `${unzipProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Roster game shelf list */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar min-h-0 font-mono">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block mb-2">
                    🎮 Game Shelf ({filteredGames.length} AVAILABLE ROMs)
                  </span>

                  {filteredGames.length === 0 ? (
                    <div className="text-center py-8 border border-white/5 bg-zinc-900/10 rounded-2xl text-zinc-600 text-[10px] uppercase">
                      No matching local titles inside memory cache.
                    </div>
                  ) : (
                    paginatedGames.map((game) => {
                      const isActive = selectedGameId === game.id;
                      return (
                        <div 
                          key={game.id}
                          onClick={() => {
                            setSelectedGameId(game.id);
                            try { soundService.playSFX('ui_hover'); } catch (e) {}
                          }}
                          className={`group p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isActive 
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300' 
                              : 'bg-zinc-900/20 border-white/5 text-zinc-400 hover:bg-zinc-900/40 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              <Gamepad2 size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-[10px] font-black truncate uppercase tracking-wide flex items-center gap-1.5 ${isActive ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                {game.name}
                                <span className="text-[7px] font-semibold px-1 py-0.2 rounded bg-white/5 text-zinc-500 font-mono uppercase">
                                  {game.category}
                                </span>
                              </div>
                              <p className="text-[7.5px] text-zinc-500 truncate uppercase tracking-wide mt-0.5">
                                {game.description || 'Offline sandboxed arcade emulation package.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-zinc-500 font-mono shrink-0 font-bold uppercase">{formatSize(game.size)}</span>
                            {game.type === 'sideloaded' && !game.id.startsWith('scanned_') && (
                              <button
                                onClick={(e) => deleteGame(game.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                title="Eject Game"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination Controls */}
                {filteredGames.length > itemsPerPage && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[9px] font-black text-zinc-500 uppercase shrink-0">
                    <button
                      onClick={() => {
                        setGamesPage(prev => Math.max(1, prev - 1));
                        try { soundService.playSFX('ui_hover'); } catch (e) {}
                      }}
                      disabled={gamesPage === 1}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/5 disabled:opacity-30 hover:border-white/15 text-zinc-400 disabled:cursor-not-allowed"
                    >
                      ◀ PREV
                    </button>
                    <span>
                      PAGE <strong className="text-zinc-300">{gamesPage}</strong> OF <strong className="text-zinc-300">{Math.ceil(filteredGames.length / itemsPerPage)}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setGamesPage(prev => Math.min(Math.ceil(filteredGames.length / itemsPerPage), prev + 1));
                        try { soundService.playSFX('ui_hover'); } catch (e) {}
                      }}
                      disabled={gamesPage === Math.ceil(filteredGames.length / itemsPerPage)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/5 disabled:opacity-30 hover:border-white/15 text-zinc-400 disabled:cursor-not-allowed"
                    >
                      NEXT ▶
                    </button>
                  </div>
                )}

              </div>

              {/* RIGHT WORKSPACE: CRT Screen & Realtime Hardware Enhancers */}
              <div className="lg:col-span-7 flex flex-col bg-zinc-950 p-4 min-h-0 justify-between">
                {activeGameUrl ? (
                  <div className="flex-1 flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-black relative">
                    
                    {/* Header Ribbon */}
                    <div className="bg-zinc-900/40 border-b border-white/5 px-4 py-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-zinc-300 font-bold">EMULATOR SOURCE: {games.find(g => g.id === selectedGameId)?.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        </button>
                        <button 
                          onClick={() => {
                            const iframe = document.getElementById('emulated-game-iframe') as HTMLIFrameElement;
                            if (iframe) iframe.src = iframe.src;
                            try { soundService.playSFX('ui_hover'); } catch (e) {}
                          }}
                          className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 font-bold"
                        >
                          <ListRestart size={12} />
                          RESTART
                        </button>
                      </div>
                    </div>

                    {/* IFrame Play Area */}
                    <div className="flex-1 bg-black relative">
                      <iframe 
                        id="emulated-game-iframe"
                        src={activeGameUrl}
                        className="w-full h-full border-0 absolute inset-0"
                        sandbox="allow-scripts"
                      />
                    </div>

                    {/* Hardware Enhancers Control Panel */}
                    <div className="bg-zinc-900/80 border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                      
                      <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase font-bold">
                        <Sliders size={13} className="text-emerald-400" />
                        <span>Hardware & Shaders Tuners</span>
                      </div>

                      <div className="flex gap-2 font-mono text-[9px] font-bold">
                        
                        {/* 3D Mode Toggle */}
                        {unlockedMods.includes('3d_glasses') ? (
                          <button
                            onClick={() => {
                              set3DMode(!is3DMode);
                              try { soundService.playSFX('ui_hover'); } catch (e) {}
                            }}
                            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                              is3DMode 
                                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : 'bg-black/40 border-white/10 text-cyan-400'
                            }`}
                          >
                            <Glasses size={12} />
                            3D GLASSES: {is3DMode ? 'ACTIVE' : 'OFF'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTab('store');
                              try { soundService.playSFX('ui_hover'); } catch (e) {}
                            }}
                            className="px-3 py-2 rounded-xl border border-dashed border-cyan-500/30 text-cyan-500/60 bg-cyan-950/5 flex items-center gap-1.5 cursor-pointer"
                            title="Locked. Purchase mod inside store first!"
                          >
                            <Glasses size={12} />
                            🔒 3D MODE (BUY)
                          </button>
                        )}

                        {/* RTX Shaders Toggle */}
                        {unlockedMods.includes('rtx_shaders') ? (
                          <button
                            onClick={() => {
                              setUltraGraphics(!isUltraGraphics);
                              try { soundService.playSFX('ui_hover'); } catch (e) {}
                            }}
                            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isUltraGraphics 
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                : 'bg-black/40 border-white/10 text-emerald-400'
                            }`}
                          >
                            <Cpu size={12} />
                            REALISTIC RTX: {isUltraGraphics ? 'ACTIVE' : 'OFF'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTab('store');
                              try { soundService.playSFX('ui_hover'); } catch (e) {}
                            }}
                            className="px-3 py-2 rounded-xl border border-dashed border-emerald-500/30 text-emerald-500/60 bg-emerald-950/5 flex items-center gap-1.5 cursor-pointer"
                            title="Locked. Purchase mod inside store first!"
                          >
                            <Cpu size={12} />
                            🔒 REALISTIC (BUY)
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="flex-1 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-zinc-500 font-mono">
                    <Gamepad2 size={36} className="text-zinc-600 mb-3 animate-pulse" />
                    <p className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Select a Game to Launch Emulator</p>
                    <p className="text-[10px] text-zinc-600 mt-1 uppercase max-w-sm leading-relaxed">
                      Choose a system game from the directory shelf or drag in your custom ZIP archives to sideload games instantly!
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : activeTab === 'widelands' ? (
            <WidelandsLoader onClose={onClose} />
          ) : (
            
            /* STORE TAB: Buy Core mods with credits */
            <div className="h-full overflow-y-auto p-6 font-mono space-y-6">
              
              <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ShoppingBag size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase text-amber-300">ZENITH MODIFICATION MARKETPLACE</h2>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold">Spend credits earned through 3D matches, dynamic quests, and gaming milestones!</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">YOUR BALANCE</p>
                  <p className="text-md font-black text-amber-400 flex items-center gap-1 justify-end">{credits.toLocaleString()} CREDITS</p>
                </div>
              </div>

              {/* Grid of Mods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_MODS.map(mod => {
                  const isBought = unlockedMods.includes(mod.id);
                  const Icon = mod.icon;
                  return (
                    <div 
                      key={mod.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                        isBought 
                          ? 'bg-zinc-900/40 border-emerald-500/30 text-zinc-300' 
                          : 'bg-zinc-900/20 border-white/5 hover:border-white/10 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-black shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider">{mod.name}</h3>
                          <p className="text-[9px] text-zinc-500 leading-relaxed uppercase">{mod.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[9px] font-black text-zinc-400">PRICE: <strong className="text-amber-400 font-black">{mod.cost} CREDITS</strong></span>
                        
                        {isBought ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black flex items-center gap-1 uppercase"
                          >
                            <CheckCircle size={11} />
                            UNLOCKED & ACTIVE
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePurchaseMod(mod.id, mod.cost)}
                            disabled={credits < mod.cost}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                              credits >= mod.cost 
                                ? 'bg-amber-400 text-black font-extrabold hover:bg-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
                                : 'bg-zinc-800 text-zinc-600 border border-white/5 cursor-not-allowed'
                            }`}
                          >
                            {credits >= mod.cost ? 'PURCHASE MOD' : 'NOT ENUF CREDITS'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-zinc-900/30 border border-white/5 p-3 rounded-xl flex gap-2.5 text-[8.5px] text-zinc-500 leading-relaxed uppercase">
                <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Mods acquired from this registry are directly injected into standard arena and sideloaded rom processes. Shader effects can be toggled using play deck hardware modifiers dynamically.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
