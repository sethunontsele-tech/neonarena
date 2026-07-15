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
  // Tabs: 'library' or 'store'
  const [activeTab, setActiveTab] = useState<'library' | 'store'>('library');
  
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

    // Load custom sidelined games from disk
    const savedCustomRaw = localStorage.getItem('zenith_offline_sideloaded_games');
    const builtInAndCustom = [...builtInList];
    
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

    setGames(builtInAndCustom);

    // Hydrate recently played
    const savedRecent = localStorage.getItem('zenith_cabinet_recently_played');
    if (savedRecent) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecent));
      } catch (e) {}
    } else {
      // Default initial recently played
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
                    filteredGames.map((game) => {
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
                            {game.type === 'sideloaded' && (
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
