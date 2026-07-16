import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore, BlockType } from '../store';
import { soundService } from '../services/soundService';
import { Terminal as TerminalIcon, X, Folder, FileCode, Play, Code, Cpu, Sparkles, HelpCircle, FileText } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
}

interface CommandOutput {
  text: string;
  type: 'input' | 'system' | 'success' | 'error' | 'info';
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FileSystemItem>;
  action?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    { text: 'ZENITH_VR OS [Version 12.0.481]', type: 'system' },
    { text: '(c) Zenith Multiverse Corporation. All rights reserved.', type: 'system' },
    { text: 'Secure Sandbox Connection Established.', type: 'system' },
    { text: 'Type "help" to view a list of available developer commands, or click any template below to load it.', type: 'info' },
  ]);
  const [currentDir, setCurrentDir] = useState<string>('root');
  const [terminalTheme, setTerminalTheme] = useState<'amber' | 'matrix' | 'cyberpunk' | 'cobalt'>('matrix');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Modding & Simulation States
  const [shakeActive, setShakeActive] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'mild' | 'medium' | 'heavy'>('medium');
  const [activeBossbar, setActiveBossbar] = useState<{ id: string; name: string; value: number } | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [weatherEffect, setWeatherEffect] = useState<'clear' | 'rain' | 'storm'>('clear');
  const [hudVisible, setHudVisible] = useState(true);
  const [activeEffects, setActiveEffects] = useState<Record<string, { duration: number; level: number }>>({});
  const [scoreboardObjective, setScoreboardObjective] = useState<string | null>(null);
  const [scoreboardPlayers, setScoreboardPlayers] = useState<Record<string, number>>({ 'Operator': 100, 'RogueBot_1': 45, 'RogueBot_2': 12 });
  const [isBanned, setIsBanned] = useState<Record<string, boolean>>({});
  const [isOpped, setIsOpped] = useState<Record<string, boolean>>({ 'Operator': true });
  const [isWhitelisted, setIsWhitelisted] = useState<Record<string, boolean>>({ 'Operator': true });
  const [timeOfDay, setTimeOfDay] = useState<number>(6000); // 6000 is noon
  const [dayLock, setDayLock] = useState<boolean>(false);
  const [volumeAreas, setVolumeAreas] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Record<string, number>>({ speed: 1.0, maxHealth: 100, damage: 25 });
  const [gamerules, setGamerules] = useState<Record<string, boolean | string | number>>({ keepInventory: true, mobGriefing: false, doDaylightCycle: true });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addOutput = (text: string, type: 'input' | 'system' | 'success' | 'error' | 'info' = 'info') => {
    setOutputs(prev => [...prev, { text, type }]);
  };

  // Virtual File System & Templates
  const VFS: Record<string, FileSystemItem> = {
    'README.md': {
      name: 'README.md',
      type: 'file',
      content: `# Sandboxing Terminal
Welcome to the Zenith Modding Shell!
This CLI gives direct interface to the Three.js physics sandbox and gameplay parameters.

Available Executable Scripts:
- run scripts/gravity_shift.sh : Diminishes gravitational constants
- run scripts/high_speed.sh    : Speeds up gameplay dynamics
- run scripts/god_stamina.sh   : Infinite power-stamina simulation

Available Loadout Presets:
- load templates/stealth.json  : Equips Silent-Ninja hotbar configuration
- load templates/juggernaut.json: Equips Heavy Battle-Suit weapons
- load templates/wizard.json     : Equips Arcane Spell-casting arrays

Available Arena Presets:
- load templates/castle.json     : Construct modular castle battlements
- load templates/tower.json      : Spawns high-altitude observation tower
`,
    },
    'scripts/gravity_shift.sh': {
      name: 'gravity_shift.sh',
      type: 'file',
      content: '#!/bin/bash\n# Zenith Sandbox Modification Script\necho "DECREASING WORLD GRAVITY CONSTANT..."\nset_gravity 4.0\nset_jump_height 12.0\nplay_sound dimension_shift',
      action: () => {
        const store = useGameStore.getState();
        store.setGravity(4.0);
        store.setJumpHeight(12.0);
        store.addEvent('🌌 [GRAVITY SHIFT] Gravity decreased to 4.0G, Jump Height elevated to 12.0m via CLI Terminal!');
        soundService.playSFX('dimension_shift');
      }
    },
    'scripts/high_speed.sh': {
      name: 'high_speed.sh',
      type: 'file',
      content: '#!/bin/bash\n# Overclocking biological pacing\necho "OVERCLOCKING MOTILITY ENGINE..."\nset_speed_modifier 2.5\nplay_sound powerup',
      action: () => {
        const store = useGameStore.getState();
        store.addEvent('⚡ [SPEED OVERCLOCK] Motility engine speed modifier increased to 2.5x via Terminal!');
        soundService.playSFX('powerup');
      }
    },
    'scripts/god_stamina.sh': {
      name: 'god_stamina.sh',
      type: 'file',
      content: '#!/bin/bash\n# Infinite Stamina Matrix\necho "INJECTING GOD-MODE STAMINA INHIBITORS..."\nset_stamina_regen 100\nplay_sound achievement',
      action: () => {
        const store = useGameStore.getState();
        // Set stamina to maximum and make it refill instantly
        useGameStore.setState({ stamina: 100 });
        store.addEvent('👑 [GOD-MODE STAMINA] Infinite energy matrix synchronized successfully!');
        soundService.playSFX('achievement');
      }
    },
    'templates/loadouts/stealth.json': {
      name: 'stealth.json',
      type: 'file',
      content: '{\n  "weapons": ["sword", "shotgun", "pistol"],\n  "description": "Silent but lethal close-quarters kit"\n}',
      action: () => {
        useGameStore.setState({ hotbar: ['sword', 'shotgun', 'pistol'] });
        useGameStore.getState().addEvent('🎒 [LOADOUT LOADED] Stealth Operative deck synchronized successfully!');
        soundService.playSFX('quest_complete');
      }
    },
    'templates/loadouts/juggernaut.json': {
      name: 'juggernaut.json',
      type: 'file',
      content: '{\n  "weapons": ["rpg", "shotgun", "smg"],\n  "description": "Heavy siege and demolition loadout"\n}',
      action: () => {
        useGameStore.setState({ hotbar: ['rpg', 'shotgun', 'smg'] });
        useGameStore.getState().addEvent('🎒 [LOADOUT LOADED] Heavy Demolition Juggernaut kit deployed!');
        soundService.playSFX('quest_complete');
      }
    },
    'templates/loadouts/wizard.json': {
      name: 'wizard.json',
      type: 'file',
      content: '{\n  "weapons": ["sniper", "pistol", "sword"],\n  "description": "Spellcasting focus deck"\n}',
      action: () => {
        useGameStore.setState({ hotbar: ['sniper', 'pistol', 'sword'] });
        useGameStore.getState().addEvent('🎒 [LOADOUT LOADED] Arcane Spellcasting deck equipped successfully!');
        soundService.playSFX('quest_complete');
      }
    },
    'templates/arenas/castle.json': {
      name: 'castle.json',
      type: 'file',
      content: '{\n  "type": "bricks",\n  "structure": "Castle defensive walls",\n  "blocks": 48\n}',
      action: () => {
        const store = useGameStore.getState();
        const startPos = store.playerPosition || [0, 0, 0];
        const newBlocks = [];
        // Construct neat brick battlements
        for (let x = -4; x <= 4; x++) {
          for (let y = 0; y < 3; y++) {
            if (y === 2 && x % 2 !== 0) continue; // castle battlements gaps
            newBlocks.push({
              id: `cli-castle-${x}-${y}-${Date.now()}`,
              type: 'bricks' as BlockType,
              position: [startPos[0] + x, startPos[1] + y, startPos[2] - 5] as [number, number, number]
            });
          }
        }
        store.setWorldBlocks([...store.worldBlocks, ...newBlocks]);
        store.addEvent('🏰 [CLI CONSTRUCT] Defensive brick battlements spawned relative to your position!');
        soundService.playSFX('quest_complete');
      }
    },
    'templates/arenas/tower.json': {
      name: 'tower.json',
      type: 'file',
      content: '{\n  "type": "quartz",\n  "structure": "Observation Tower",\n  "blocks": 25\n}',
      action: () => {
        const store = useGameStore.getState();
        const startPos = store.playerPosition || [0, 0, 0];
        const newBlocks = [];
        // Construct solid quartz tower
        for (let y = 0; y < 8; y++) {
          newBlocks.push({
            id: `cli-tower-${y}-${Date.now()}`,
            type: 'quartz' as BlockType,
            position: [startPos[0] + 3, startPos[1] + y, startPos[2] - 3] as [number, number, number]
          });
        }
        store.setWorldBlocks([...store.worldBlocks, ...newBlocks]);
        store.addEvent('🗼 [CLI CONSTRUCT] Observation Tower structure spawned relative to your position!');
        soundService.playSFX('quest_complete');
      }
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Save to history
    const newHistory = [trimmedInput, ...history].slice(0, 50);
    setHistory(newHistory);
    setHistoryIndex(-1);

    addOutput(`> ${trimmedInput}`, 'input');
    setInput('');

    // Pre-parse: strip leading slash, support nested execute
    let sanitizedInput = trimmedInput;
    if (sanitizedInput.startsWith('/')) {
      sanitizedInput = sanitizedInput.substring(1);
    }

    let executeContext = '';
    if (sanitizedInput.toLowerCase().startsWith('execute ')) {
      const runIndex = sanitizedInput.toLowerCase().indexOf(' run ');
      if (runIndex !== -1) {
        executeContext = sanitizedInput.substring(8, runIndex);
        sanitizedInput = sanitizedInput.substring(runIndex + 5).trim();
        addOutput(`[Execute Context: ${executeContext.toUpperCase()}]`, 'system');
      } else {
        addOutput('Error: Execute command requires "run" subcommand. Usage: execute <modifiers> run <command>', 'error');
        return;
      }
    }

    const args = sanitizedInput.split(' ');
    const command = args[0].toLowerCase();
    const store = useGameStore.getState();

    switch (command) {
      // 1. PLAYER & INVENTORY COMMANDS
      case 'ability': {
        const abilityName = args[1]?.toLowerCase();
        const value = args[2]?.toLowerCase() !== 'false';
        if (!abilityName) {
          addOutput('Usage: ability <speed|jump|flight|god> [true|false]', 'info');
        } else {
          if (abilityName === 'speed') {
            store.setSprintSpeed?.(value ? 12.0 : 6.0);
            addOutput(`Ability 'speed' updated to ${value}. Speed modifier adjusted.`, 'success');
          } else if (abilityName === 'jump') {
            store.setJumpHeight?.(value ? 15.0 : 7.0);
            addOutput(`Ability 'jump' updated to ${value}. Jump height adjusted.`, 'success');
          } else if (abilityName === 'flight') {
            store.setGravity?.(value ? 0.0 : -9.81);
            addOutput(`Ability 'flight' updated to ${value}. Zero-gravity simulation active.`, 'success');
          } else if (abilityName === 'god') {
            useGameStore.setState({ health: 100, stamina: 100 });
            addOutput(`Ability 'god' updated to ${value}. Infinite stamina and full health secured.`, 'success');
          } else {
            addOutput(`Unknown ability: '${abilityName}'.`, 'error');
          }
          soundService.playSFX('achievement');
        }
        break;
      }

      case 'advancement': {
        const action = args[1]?.toLowerCase();
        const target = args[2];
        const adv = args[3];
        if (!action || !target) {
          addOutput('Usage: advancement <grant|revoke> <player> <achievement|everything>', 'info');
        } else {
          if (action === 'grant') {
            store.addCoins(500);
            useGameStore.setState({ xp: store.xp + 1000 });
            addOutput(`Advancement granted successfully! Received 500 Coins and 1,000 XP!`, 'success');
            store.addEvent(`🏆 [ADVANCEMENT] Granted ${target} achievement: ${adv || 'Operator Excellence'}`);
            soundService.playSFX('quest_complete');
          } else {
            addOutput(`Revoked advancement parameters from ${target}.`, 'system');
          }
        }
        break;
      }

      case 'clear': {
        const target = args[1]?.toLowerCase();
        if (target === 'inventory') {
          useGameStore.setState({ hotbar: ['sword'] });
          addOutput('Hotbar cleared. Basic cyber defense sword remains equipped.', 'success');
        } else {
          setOutputs([]);
        }
        break;
      }

      case 'enchant': {
        const enchantType = args[1]?.toLowerCase();
        const level = parseInt(args[2] || '1');
        if (!enchantType) {
          addOutput('Usage: enchant <critical|vampirism|haste|range> <level>', 'info');
        } else {
          addOutput(`Successfully enchanted active weapon with modification: [${enchantType.toUpperCase()} LVL ${level}]!`, 'success');
          store.addEvent(`✨ [ENCHANT] Hotbar weapons modified with ${enchantType} power-matrix level ${level}!`);
          soundService.playSFX('achievement');
        }
        break;
      }

      case 'experience':
      case 'xp': {
        const action = args[1]?.toLowerCase();
        const amt = parseInt(args[2] || '100');
        if (!action) {
          addOutput('Usage: xp <add|set|query> [amount]', 'info');
        } else if (action === 'add') {
          useGameStore.setState({ xp: store.xp + amt });
          addOutput(`Added ${amt} experience points to Operator.`, 'success');
          soundService.playSFX('powerup');
        } else if (action === 'set') {
          useGameStore.setState({ xp: amt });
          addOutput(`Operator experience level set to ${amt} XP.`, 'success');
        } else {
          addOutput(`Current experience balance: ${store.xp} XP.`, 'info');
        }
        break;
      }

      case 'gamemode': {
        const mode = args[1]?.toLowerCase();
        if (!mode) {
          addOutput('Usage: gamemode <survival|creative|spectator|adventure>', 'info');
        } else {
          if (mode === 'creative') {
            store.setGravity?.(0.0);
            useGameStore.setState({ stamina: 100 });
            addOutput('Gamemode set to CREATIVE. Low-gravity floating & infinite stamina active.', 'success');
          } else if (mode === 'spectator') {
            useGameStore.setState({ playerState: 'disabled' });
            addOutput('Gamemode set to SPECTATOR. Ghost cam active.', 'success');
          } else {
            store.setGravity?.(-9.81);
            useGameStore.setState({ playerState: 'active' });
            addOutput(`Gamemode set to ${mode.toUpperCase()}. Survival combat matrices online.`, 'success');
          }
          soundService.playSFX('dimension_shift');
        }
        break;
      }

      case 'give': {
        const weapon = args[1]?.toLowerCase();
        if (!weapon) {
          addOutput('Usage: give <weapon_name> [amount]', 'info');
        } else {
          const currentHotbar = store.hotbar || [];
          if (currentHotbar.length < 5) {
            useGameStore.setState({ hotbar: [...currentHotbar, weapon as any] });
            addOutput(`Conjured ${weapon.toUpperCase()} weapon into active hotbar slot.`, 'success');
          } else {
            useGameStore.setState({ hotbar: [weapon as any, ...currentHotbar.slice(1)] });
            addOutput(`Hotbar full. Replaced active primary slot with ${weapon.toUpperCase()}.`, 'success');
          }
          soundService.playSFX('quest_complete');
        }
        break;
      }

      case 'item':
      case 'replaceitem': {
        const action = args[1]?.toLowerCase();
        const slotIdx = parseInt(args[2] || '0');
        const weapon = args[3];
        if (!action || isNaN(slotIdx) || !weapon) {
          addOutput('Usage: replaceitem slot <index> <weapon_name>', 'info');
        } else {
          const currentHotbar = [...(store.hotbar || [])];
          if (slotIdx >= 0 && slotIdx < 5) {
            currentHotbar[slotIdx] = weapon as any;
            useGameStore.setState({ hotbar: currentHotbar });
            addOutput(`Successfully replaced Hotbar Slot ${slotIdx} with ${weapon.toUpperCase()}!`, 'success');
            soundService.playSFX('ui_click');
          } else {
            addOutput('Error: Hotbar slot out of range. Expected 0-4.', 'error');
          }
        }
        break;
      }

      case 'loot': {
        const sub = args[1]?.toLowerCase();
        const tier = args[2]?.toLowerCase() || 'rare';
        if (!sub) {
          addOutput('Usage: loot spawn <common|rare|epic|legendary>', 'info');
        } else {
          const lootMap: Record<string, string[]> = {
            common: ['pistol', 'shield_potion', 'medkit'],
            rare: ['smg', 'shotgun', 'speed_potion'],
            epic: ['sniper', 'sword', 'xp_potion'],
            legendary: ['rpg', 'raygun', 'minigun']
          };
          const choices = lootMap[tier] || lootMap.rare;
          const wonItem = choices[Math.floor(Math.random() * choices.length)];
          addOutput(`🎁 LOOT DROP SPUN: Converted neon particle matrix into [${wonItem.toUpperCase()} (${tier.toUpperCase()})]!`, 'success');
          soundService.playSFX('achievement');
        }
        break;
      }

      case 'me': {
        const emoteMsg = args.slice(1).join(' ');
        if (!emoteMsg) {
          addOutput('Usage: me <action_message>', 'info');
        } else {
          addOutput(`* Operator ${emoteMsg}`, 'success');
          soundService.playSFX('ui_click');
        }
        break;
      }

      case 'msg':
      case 'tell':
      case 'w': {
        const player = args[1];
        const msgText = args.slice(2).join(' ');
        if (!player || !msgText) {
          addOutput('Usage: msg <player> <text>', 'info');
        } else {
          addOutput(`[Private encrypt to ${player}]: ${msgText}`, 'success');
          soundService.playSFX('ui_click');
        }
        break;
      }

      case 'recipe': {
        const action = args[1]?.toLowerCase();
        const recipeName = args[2];
        if (!action || !recipeName) {
          addOutput('Usage: recipe <give|take> <recipe_name>', 'info');
        } else {
          addOutput(`Recipe logic updated: ${action === 'give' ? 'Unlocked' : 'Locked'} schematics for [${recipeName.toUpperCase()}].`, 'success');
          soundService.playSFX('quest_complete');
        }
        break;
      }

      case 'say': {
        const broadcast = args.slice(1).join(' ');
        if (!broadcast) {
          addOutput('Usage: say <message>', 'info');
        } else {
          addOutput(`[Server Announcement] Operator: ${broadcast}`, 'info');
          store.addEvent(`📢 [ANNOUNCEMENT] ${broadcast}`);
          soundService.playSFX('powerup');
        }
        break;
      }

      case 'title':
      case 'titleraw': {
        const text = args.slice(1).join(' ');
        if (!text) {
          setActiveTitle(null);
          addOutput('Title overlay cleared.', 'system');
        } else {
          setActiveTitle(text.toUpperCase());
          addOutput(`Screen HUD Title broadcast activated: "${text}"`, 'success');
          soundService.playSFX('achievement');
          setTimeout(() => setActiveTitle(null), 4000);
        }
        break;
      }

      // 2. WORLD & ENVIRONMENT COMMANDS
      case 'alwaysday':
      case 'daylock': {
        const value = args[1]?.toLowerCase() !== 'false';
        setDayLock(value);
        addOutput(`Daylight lock state updated to ${value}. Cycle paused at high noon.`, 'success');
        break;
      }

      case 'camera':
      case 'camerashake': {
        const intensity = args[1]?.toLowerCase() || 'medium';
        const duration = parseInt(args[2] || '3');
        if (intensity === 'mild' || intensity === 'medium' || intensity === 'heavy') {
          setShakeIntensity(intensity as any);
          setShakeActive(true);
          addOutput(`🎬 Initiating visual viewport camera shake [Intensity: ${intensity.toUpperCase()}] for ${duration}s!`, 'success');
          soundService.playSFX('dimension_shift');
          setTimeout(() => setShakeActive(false), duration * 1000);
        } else {
          addOutput('Usage: camerashake <mild|medium|heavy> [duration_seconds]', 'info');
        }
        break;
      }

      case 'clone': {
        addOutput(`Voxel Cloning Engine active: Cloned 64 structural nodes to target vector coordinates.`, 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'difficulty': {
        const diff = args[1]?.toLowerCase();
        if (!diff) {
          addOutput('Usage: difficulty <peaceful|easy|normal|hard|brutal>', 'info');
        } else {
          addOutput(`Threat matrix level re-configured to [${diff.toUpperCase()}]. AI hazard behaviors recalibrated.`, 'success');
          soundService.playSFX('dimension_shift');
        }
        break;
      }

      case 'fill': {
        const blockType = args[7] || 'quartz';
        addOutput(`Constructing mass voxel matrix: Filled coordinate grid with ${blockType.toUpperCase()} nodes.`, 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'fillbiome': {
        const biome = args[1] || 'neon_cyber';
        addOutput(`Environmental matrix shift: Recalibrated terrain rendering coordinates to biome template [${biome.toUpperCase()}].`, 'success');
        soundService.playSFX('dimension_shift');
        break;
      }

      case 'fog': {
        const density = parseFloat(args[1] || '0.02');
        addOutput(`Volumetric rendering adjustments: Fog density updated to ${density} Units.`, 'success');
        break;
      }

      case 'gamerule': {
        const rule = args[1];
        const val = args[2];
        if (!rule) {
          addOutput('Usage: gamerule <rule> <value>', 'info');
        } else {
          setGamerules(prev => ({ ...prev, [rule]: val === 'true' ? true : val === 'false' ? false : val }));
          addOutput(`Gamerule database updated: ${rule} = ${val}`, 'success');
        }
        break;
      }

      case 'locate': {
        const target = args[1] || 'bot';
        addOutput(`Scanning neural network... Target [${target.toUpperCase()}] localized at coordinates: [X: 14.5, Y: 1.0, Z: -42.8]`, 'success');
        soundService.playSFX('ui_click');
        break;
      }

      case 'particle': {
        const type = args[1] || 'spark';
        addOutput(`Vector graphics test: Discharged simulated particle vortex burst of type [${type.toUpperCase()}].`, 'success');
        soundService.playSFX('powerup');
        break;
      }

      case 'place':
      case 'setblock': {
        const blockType = args[4] || 'bricks';
        const startPos = store.playerPosition || [0, 0, 0];
        const newBlock = {
          id: `cli-setblock-${Date.now()}`,
          type: blockType as BlockType,
          position: [startPos[0], startPos[1], startPos[2] - 3] as [number, number, number]
        };
        store.setWorldBlocks([...store.worldBlocks, newBlock]);
        addOutput(`Voxel block placed: Spawned ${blockType.toUpperCase()} 3 meters ahead of player position.`, 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'playsound': {
        const sound = args[1] || 'powerup';
        soundService.playSFX(sound as any);
        addOutput(`Audio driver check: Played audio sample '${sound}'.`, 'success');
        break;
      }

      case 'stopsound': {
        addOutput('Audio driver check: Suspended all active voice threads.', 'success');
        break;
      }

      case 'seed': {
        addOutput(`Universe Seed: [${Math.floor(Math.random() * 1e16)}] (Generated dynamically via cryptograph module)`, 'success');
        break;
      }

      case 'setworldspawn':
      case 'spawnpoint': {
        addOutput('Coordinate tracker: Reassigned player master respawn matrix anchor to current coordinates.', 'success');
        soundService.playSFX('ui_click');
        break;
      }

      case 'structure': {
        const type = args[1]?.toLowerCase();
        if (type === 'castle') {
          VFS['templates/arenas/castle.json'].action?.();
        } else if (type === 'tower') {
          VFS['templates/arenas/tower.json'].action?.();
        } else {
          addOutput('Usage: structure <castle|tower>', 'info');
        }
        break;
      }

      case 'time': {
        const sub = args[1]?.toLowerCase();
        const val = parseInt(args[2] || '6000');
        if (sub === 'set') {
          setTimeOfDay(val);
          addOutput(`Time set to ${val} ticks.`, 'success');
        } else {
          addOutput('Usage: time set <ticks>', 'info');
        }
        break;
      }

      case 'toggledownfall':
      case 'weather': {
        const type = args[1]?.toLowerCase() || 'rain';
        if (type === 'clear') {
          setWeatherEffect('clear');
          addOutput('Weather matrix: Dispersion field activated. Clearing skies.', 'success');
        } else if (type === 'storm') {
          setWeatherEffect('storm');
          addOutput('Weather matrix: Neon thunderstorm activated! Visual matrix interference incoming.', 'success');
          soundService.playSFX('dimension_shift');
        } else {
          setWeatherEffect('rain');
          addOutput('Weather matrix: Liquid precipitation sequence initialized.', 'success');
        }
        break;
      }

      case 'worldborder': {
        addOutput('Grid boundaries: Shield radius confined to 120-meter perimeter.', 'success');
        break;
      }

      // 3. ENTITIES & COMBAT COMMANDS
      case 'attribute': {
        const attr = args[1]?.toLowerCase();
        const val = parseFloat(args[2] || '1.0');
        if (!attr) {
          addOutput('Usage: attribute <speed|health|damage> <value>', 'info');
        } else {
          setAttributes(prev => ({ ...prev, [attr]: val }));
          if (attr === 'speed') store.setSprintSpeed?.(6.0 * val);
          addOutput(`Modifying player core attributes: ${attr.toUpperCase()} set to ${val}x factor.`, 'success');
          soundService.playSFX('powerup');
        }
        break;
      }

      case 'bossbar': {
        const action = args[1]?.toLowerCase();
        const id = args[2] || 'boss';
        const value = parseInt(args[3] || '100');
        if (action === 'create' || action === 'set') {
          setActiveBossbar({ id, name: args[3] || 'ELITE WITHER SENTRY', value });
          addOutput(`Bossbar [${id.toUpperCase()}] established at ${value}% health!`, 'success');
          soundService.playSFX('dimension_shift');
        } else if (action === 'remove') {
          setActiveBossbar(null);
          addOutput('Bossbar elements cleared from HUD.', 'system');
        } else {
          addOutput('Usage: bossbar <create|set|remove> <id> [name] [value]', 'info');
        }
        break;
      }

      case 'clearspawnpoint': {
        addOutput('Local coordinates anchor deleted. Reverting to default world spawn coordinate grid.', 'success');
        break;
      }

      case 'damage': {
        const amount = parseInt(args[1] || '10');
        const target = args[2] || 'player';
        if (target === 'player') {
          useGameStore.setState({ health: Math.max(0, store.health - amount) });
          addOutput(`Kinetic blow simulated: Inflicted ${amount} damage on Operator!`, 'error');
          soundService.playSFX('ui_click');
        } else {
          addOutput(`Simulated blow: Inflicted ${amount} impact damage on bot targeting registry.`, 'success');
        }
        break;
      }

      case 'effect': {
        const sub = args[1]?.toLowerCase();
        const effectName = args[2]?.toLowerCase();
        const duration = parseInt(args[3] || '30');
        if (sub === 'give' && effectName) {
          setActiveEffects(prev => ({ ...prev, [effectName]: { duration, level: 1 } }));
          addOutput(`Applied virtual status modifier: [${effectName.toUpperCase()}] active for ${duration}s.`, 'success');
          soundService.playSFX('powerup');
        } else if (sub === 'clear') {
          setActiveEffects({});
          addOutput('Purged all active status effects from Operator.', 'success');
        } else {
          addOutput('Usage: effect <give|clear> <speed|invisibility|strength|slowness> [duration]', 'info');
        }
        break;
      }

      case 'event': {
        const ev = args[1]?.toLowerCase();
        if (ev) {
          store.addEvent?.(`⚠️ [ARENA EVENT TRIGGERED]: ${ev.toUpperCase()} Matrix Cycle Initialized!`);
          addOutput(`Command Center: Initiating arena server-wide event [${ev.toUpperCase()}].`, 'success');
          soundService.playSFX('dimension_shift');
        } else {
          addOutput('Usage: event <glitch|solar_flare|neon_rain>', 'info');
        }
        break;
      }

      case 'kill': {
        const target = args[1]?.toLowerCase() || 'all';
        if (target === 'all') {
          store.addEvent('⚡ [OPERATOR NUKE] Terminated all active rogue bots in arena vicinity!');
          addOutput('Wiping out hostile entities... 8 Enemy operators eliminated instantly.', 'success');
          soundService.playSFX('quest_complete');
        } else {
          useGameStore.setState({ health: 0 });
          addOutput('Self-destruct matrix activated. Respawning...', 'error');
          soundService.playSFX('ui_click');
        }
        break;
      }

      case 'mobevent': {
        addOutput('Cyber bot swarm invasion initialized! Prepare tactical defenses.', 'success');
        store.addEvent('🚨 [INVASION WAVE ACTIVE] Multiple incoming bot operators detected!');
        soundService.playSFX('dimension_shift');
        break;
      }

      case 'playanimation': {
        const anim = args[1]?.toLowerCase() as any;
        if (anim && ['idle', 'run', 'jump', 'shoot', 'reload', 'dance', 'slide', 'dash'].includes(anim)) {
          store.setPlayerAnimation?.(anim);
          addOutput(`Character skeletal rigging tests: Playing track [${anim.toUpperCase()}] animation.`, 'success');
          soundService.playSFX('ui_click');
        } else {
          addOutput('Usage: playanimation <idle|run|jump|shoot|reload|dance|slide|dash>', 'info');
        }
        break;
      }

      case 'ride': {
        addOutput('Boarded cyber hover vehicle unit. Touch navigation keys linked.', 'success');
        soundService.playSFX('powerup');
        break;
      }

      case 'spectate': {
        const active = args[1]?.toLowerCase() !== 'false';
        useGameStore.setState({ playerState: active ? 'disabled' : 'active' });
        addOutput(`Ghost-cam spectate mode toggled to: ${active}`, 'success');
        break;
      }

      case 'summon': {
        const ent = args[1] || 'bot';
        addOutput(`Summoning visual entity: Dispatched holographic operator drone unit of class [${ent.toUpperCase()}] near coordinates.`, 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'teleport':
      case 'tp': {
        addOutput('Vector space re-alignment: Operator coordinates relocated successfully.', 'success');
        soundService.playSFX('dimension_shift');
        break;
      }

      case 'transfer': {
        addOutput('Establishing data tunnel... Routing sandbox credentials to secondary cloud server...', 'info');
        setTimeout(() => addOutput('Transfer failed: Handshake timed out.', 'error'), 1000);
        break;
      }

      // 4. DATA & LOGIC COMMANDS
      case 'data': {
        addOutput(`Entity NBT Matrix: { id: "player", coordinates: [0,0,0], inventory: ["sword"], score: ${store.score} }`, 'info');
        break;
      }

      case 'datapack': {
        addOutput('Registered Datapacks:\n - [Builtin] Core Matrix Scripts (v1.2)\n - [Modded] Custom Shaders (v0.8)', 'success');
        break;
      }

      case 'dialogue': {
        addOutput('Bot operator AI speech module synchronized: [Ready to transmit]', 'success');
        break;
      }

      case 'execute': {
        // Execute is parsed upstream, this case is hit if they just typed execute alone
        addOutput('Usage: execute [as|at|if|unless] <condition> run <command>', 'info');
        break;
      }

      case 'function': {
        const func = args[1];
        if (func && VFS[func]) {
          addOutput(`Running bash automated script [${func}]...`, 'system');
          VFS[func].action?.();
        } else {
          addOutput('Usage: function scripts/gravity_shift.sh', 'info');
        }
        break;
      }

      case 'gametest': {
        addOutput('Compiling physics engine unit tests... All 42 test units are building perfectly GREEN!', 'success');
        break;
      }

      case 'hud': {
        const status = args[1]?.toLowerCase() !== 'hidden';
        setHudVisible(status);
        addOutput(`HUD indicators set to: ${status ? 'VISIBLE' : 'HIDDEN'}`, 'success');
        break;
      }

      case 'inputpermission': {
        addOutput('Joystick input permission matrices locked at Operator level.', 'success');
        break;
      }

      case 'jfr':
      case 'perf': {
        addOutput('--- PERFORMANCE STATS ---', 'system');
        addOutput('Frame Rate : 60.0 FPS stable', 'info');
        addOutput('Draw Calls : 142 calls/frame', 'info');
        addOutput('Memory     : 42 MB allocated heap', 'info');
        break;
      }

      case 'music': {
        addOutput('Cycling synthetic background audio theme loops...', 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'reload': {
        addOutput('Hot reloading game modules... Cleared stale caches, flushed telemetry, verified directories.', 'success');
        soundService.playSFX('powerup');
        break;
      }

      case 'return': {
        addOutput('Process return code: 0 (SUCCESS)', 'success');
        break;
      }

      case 'schedule': {
        const delay = parseInt(args[1] || '2');
        const schedCmd = args.slice(2).join(' ');
        if (!schedCmd) {
          addOutput('Usage: schedule <seconds> <command>', 'info');
        } else {
          addOutput(`Task registered. Executing command in ${delay} seconds...`, 'system');
          setTimeout(() => {
            setInput(schedCmd);
            // Submit command automatically
            const mockEvent = { preventDefault: () => {} } as any;
            handleCommandSubmit(mockEvent);
          }, delay * 1000);
        }
        break;
      }

      case 'scoreboard': {
        const sub = args[1]?.toLowerCase();
        const obj = args[2];
        if (sub === 'objectives') {
          setScoreboardObjective(obj);
          addOutput(`Scoreboard Objective [${obj.toUpperCase()}] initialized.`, 'success');
        } else if (sub === 'players') {
          const act = args[3]?.toLowerCase();
          const pName = args[4] || 'Operator';
          const pVal = parseInt(args[5] || '10');
          if (act === 'set' || act === 'add') {
            setScoreboardPlayers(prev => ({ ...prev, [pName]: pVal }));
            addOutput(`Adjusted ${pName} score to ${pVal}.`, 'success');
          }
        } else {
          addOutput('Usage: scoreboard objectives add <name>\nUsage: scoreboard players set <player> <value>', 'info');
        }
        break;
      }

      case 'script': {
        const scriptCode = args.slice(1).join(' ');
        if (!scriptCode) {
          addOutput('Usage: script <js_code_to_eval>', 'info');
        } else {
          try {
            // Evaluates mathematical expression safely
            const result = new Function(`return ${scriptCode}`)();
            addOutput(`Evaluated: ${result}`, 'success');
          } catch (err: any) {
            addOutput(`Syntax Error: ${err.message}`, 'error');
          }
        }
        break;
      }

      case 'tag': {
        const ent = args[2] || 'target';
        addOutput(`Entity registry updated: Appended tag descriptor [${ent.toUpperCase()}] successfully.`, 'success');
        break;
      }

      case 'team':
      case 'teammsg': {
        addOutput('Clan tactical secure communication feed synchronized.', 'success');
        break;
      }

      case 'testfor':
      case 'testforblock':
      case 'testforblocks': {
        addOutput('Probing spatial vector blocks: Perfect matching signatures localized.', 'success');
        break;
      }

      case 'tick': {
        addOutput('Dilation scaler updated: Operational timescale running at 1.0x (standard tickrate).', 'success');
        break;
      }

      case 'trigger': {
        addOutput('Scoreboard objective event trigger fired.', 'success');
        break;
      }

      case 'volumearea': {
        addOutput('Securing combat workspace volume zones...', 'success');
        break;
      }

      // 5. SERVER ADMINISTRATION
      case '?':
      case 'help': {
        addOutput('=================== MULTIVERSE DEV COMMANDS ===================', 'system');
        addOutput('/ability speed|jump|flight|god  - Adjust developer abilities', 'info');
        addOutput('/xp add|set <amount>            - Gain experience / rank points', 'info');
        addOutput('/give <weapon_name>             - Spawn guns/potions into inventory', 'info');
        addOutput('/weather clear|rain|storm       - Swap environmental conditions', 'info');
        addOutput('/camerashake mild|heavy         - Simulate viewport seismic shaking', 'info');
        addOutput('/bossbar create|remove <boss>   - Overlay neon health widgets', 'info');
        addOutput('/title <text>                   - Overlay flashy HUD alerts', 'info');
        addOutput('/setblock <bricks|quartz>       - Concrete construct structures', 'info');
        addOutput('/kill [all|self]                - Wipe local rogue bot registries', 'info');
        addOutput('/gamemode survival|creative     - Alter player physics matrices', 'info');
        addOutput('/op /deop <player>              - Adjust administrative rights', 'info');
        addOutput('/ban /pardon <player>           - Manage sandbox security lists', 'info');
        addOutput('Type the exact Minecraft commands above! Leading slashes are optional.', 'success');
        addOutput('================================================================', 'system');
        break;
      }

      case 'ban':
      case 'ban-ip': {
        const pName = args[1];
        if (!pName) {
          addOutput('Usage: ban <player>', 'info');
        } else {
          setIsBanned(prev => ({ ...prev, [pName]: true }));
          addOutput(`🔨 Player [${pName.toUpperCase()}] was permanently BANNED from session registry!`, 'error');
          soundService.playSFX('ui_click');
        }
        break;
      }

      case 'banlist': {
        const list = Object.keys(isBanned).filter(k => isBanned[k]).join(', ') || 'No banned records.';
        addOutput(`Banned Operatives: [${list}]`, 'info');
        break;
      }

      case 'changesetting': {
        addOutput('Recalibrating audio volumes and visual preset overrides.', 'success');
        break;
      }

      case 'connect':
      case 'wsserver': {
        addOutput('Attempting connection overlay to telemetry feed socket stream...', 'info');
        setTimeout(() => addOutput('Connected to localhost websocket server.', 'success'), 800);
        break;
      }

      case 'debug': {
        addOutput('Wireframe diagnostic render mode: ACTIVATED.', 'success');
        break;
      }

      case 'defaultgamemode': {
        addOutput('Default multiplayer server policy adjusted to CREATIVE.', 'success');
        break;
      }

      case 'deop': {
        const pName = args[1] || 'Operator';
        setIsOpped(prev => ({ ...prev, [pName]: false }));
        addOutput(`Administrative operator privileges revoked from ${pName}.`, 'success');
        break;
      }

      case 'op': {
        const pName = args[1] || 'Operator';
        setIsOpped(prev => ({ ...prev, [pName]: true }));
        addOutput(`👑 Administrative operator privileges GRANTED to ${pName}!`, 'success');
        soundService.playSFX('achievement');
        break;
      }

      case 'forceload': {
        addOutput('Voxel engine buffer locked: Chunks preserved from memory release.', 'success');
        break;
      }

      case 'kick': {
        const pName = args[1];
        if (!pName) {
          addOutput('Usage: kick <player>', 'info');
        } else {
          addOutput(`👢 Kicked user [${pName.toUpperCase()}] from game server session.`, 'error');
          soundService.playSFX('ui_click');
        }
        break;
      }

      case 'list': {
        addOutput('Connected Operators: Operator, RogueBot_1, RogueBot_2, FriendlyDrone', 'info');
        break;
      }

      case 'pardon':
      case 'pardon-ip': {
        const pName = args[1];
        if (pName) {
          setIsBanned(prev => ({ ...prev, [pName]: false }));
          addOutput(`Pardoned operator [${pName.toUpperCase()}]. Connection credentials re-authorized.`, 'success');
        }
        break;
      }

      case 'publish': {
        addOutput(`Hosting local sandbox! LAN Address: [http://192.168.1.42:3000] (Open to fireteam members)`, 'success');
        break;
      }

      case 'save-all': {
        addOutput('Writing voxel matrix and player inventory cards to session file...', 'success');
        soundService.playSFX('quest_complete');
        break;
      }

      case 'save-off': {
        addOutput('Database auto-saving disabled.', 'system');
        break;
      }

      case 'save-on': {
        addOutput('Database auto-saving enabled.', 'system');
        break;
      }

      case 'setidletimeout': {
        addOutput('Idle timer kick parameters set to 10 minutes.', 'success');
        break;
      }

      case 'setmaxplayers': {
        addOutput('Fireteam maximum connection capacity expanded.', 'success');
        break;
      }

      case 'stop': {
        addOutput('⚠️ SERVER REBOOT MATRIX INITIATED! Shutting down multiplayer thread...', 'error');
        soundService.playSFX('ui_click');
        setTimeout(() => onClose(), 2000);
        break;
      }

      case 'whitelist': {
        addOutput('Authorized registration mode is active.', 'success');
        break;
      }

      // Legacy support for fallback standard commands
      case 'ls': {
        addOutput('Directories & Files:', 'system');
        addOutput(' - README.md (markdown)', 'info');
        addOutput(' - [scripts/]', 'system');
        addOutput('     scripts/gravity_shift.sh', 'success');
        addOutput('     scripts/high_speed.sh', 'success');
        addOutput('     scripts/god_stamina.sh', 'success');
        addOutput(' - [templates/]', 'system');
        addOutput('     templates/loadouts/stealth.json', 'success');
        addOutput('     templates/loadouts/juggernaut.json', 'success');
        addOutput('     templates/loadouts/wizard.json', 'success');
        addOutput('     templates/arenas/castle.json', 'success');
        addOutput('     templates/arenas/tower.json', 'success');
        break;
      }

      case 'cat': {
        const fileToCat = args[1];
        if (!fileToCat) {
          addOutput('Error: Please specify file path. Example: cat README.md', 'error');
        } else if (VFS[fileToCat]) {
          const lines = VFS[fileToCat].content?.split('\n') || [];
          lines.forEach(line => addOutput(line, 'info'));
        } else {
          addOutput(`Error: File "${fileToCat}" not found.`, 'error');
        }
        break;
      }

      case 'run': {
        const scriptToRun = args[1];
        if (!scriptToRun) {
          addOutput('Error: Please specify script path. Example: run scripts/gravity_shift.sh', 'error');
        } else if (VFS[scriptToRun] && scriptToRun.startsWith('scripts/')) {
          addOutput(`Executing ${scriptToRun}...`, 'system');
          VFS[scriptToRun].action?.();
          addOutput('Script executed successfully!', 'success');
        } else {
          addOutput(`Error: Executable script "${scriptToRun}" not found.`, 'error');
        }
        break;
      }

      case 'load': {
        const templateToLoad = args[1];
        if (!templateToLoad) {
          addOutput('Error: Please specify template path. Example: load templates/arenas/castle.json', 'error');
        } else if (VFS[templateToLoad] && templateToLoad.startsWith('templates/')) {
          addOutput(`Loading configuration template ${templateToLoad}...`, 'system');
          VFS[templateToLoad].action?.();
          addOutput('Configuration loaded successfully!', 'success');
        } else {
          addOutput(`Error: Template "${templateToLoad}" not found.`, 'error');
        }
        break;
      }

      case 'theme': {
        const newTheme = args[1]?.toLowerCase();
        if (newTheme === 'matrix' || newTheme === 'amber' || newTheme === 'cobalt' || newTheme === 'cyberpunk') {
          setTerminalTheme(newTheme as any);
          addOutput(`Theme modified to [${newTheme.toUpperCase()}] successfully.`, 'success');
        } else {
          addOutput('Error: Invalid theme. Options: matrix, amber, cobalt, cyberpunk', 'error');
        }
        break;
      }

      case 'coins': {
        const amt = parseInt(args[1]);
        if (!isNaN(amt)) {
          store.addCoins(amt);
          addOutput(`Successfully credited ${amt} Coins to Operator account!`, 'success');
          soundService.playSFX('achievement');
        } else {
          addOutput('Error: Invalid amount. Usage: coins <number>', 'error');
        }
        break;
      }

      case 'heal': {
        useGameStore.setState({ health: 100 });
        addOutput('Operator vitals normalized at 100%. All systems structural integrity restored.', 'success');
        soundService.playSFX('powerup');
        break;
      }

      case 'exit': {
        onClose();
        break;
      }

      default:
        addOutput(`Command unrecognized: "${command}". Type "help" to view operator command matrix.`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Theme styles helper
  const themeStyles = {
    matrix: {
      bg: 'bg-zinc-950/95 border-emerald-500/30 text-emerald-400',
      caret: 'bg-emerald-400',
      header: 'border-emerald-500/20 text-emerald-500 bg-emerald-950/20',
      glow: 'shadow-[0_0_80px_rgba(16,185,129,0.15)]',
      inputColor: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-zinc-950/95 border-amber-500/30 text-amber-500',
      caret: 'bg-amber-500',
      header: 'border-amber-500/20 text-amber-500 bg-amber-950/20',
      glow: 'shadow-[0_0_80px_rgba(245,158,11,0.15)]',
      inputColor: 'text-amber-500',
    },
    cobalt: {
      bg: 'bg-zinc-950/95 border-blue-500/30 text-blue-400',
      caret: 'bg-blue-400',
      header: 'border-blue-500/20 text-blue-500 bg-blue-950/20',
      glow: 'shadow-[0_0_80px_rgba(59,130,246,0.15)]',
      inputColor: 'text-blue-400',
    },
    cyberpunk: {
      bg: 'bg-zinc-950/95 border-fuchsia-500/30 text-fuchsia-400',
      caret: 'bg-fuchsia-400',
      header: 'border-fuchsia-500/20 text-fuchsia-500 bg-fuchsia-950/20',
      glow: 'shadow-[0_0_80px_rgba(217,70,239,0.15)]',
      inputColor: 'text-fuchsia-400',
    },
  }[terminalTheme];

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[150] p-4 pointer-events-auto">
      {/* Styles for shake animations & raindrops */}
      <style>{`
        @keyframes terminal-shake-mild {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-1px, 1px); }
          20%, 40%, 60%, 80% { transform: translate(1px, -1px); }
        }
        @keyframes terminal-shake-medium {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-3px, 2px); }
          20%, 40%, 60%, 80% { transform: translate(3px, -2px); }
        }
        @keyframes terminal-shake-heavy {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-7px, 5px); }
          20%, 40%, 60%, 80% { transform: translate(7px, -5px); }
        }
        .animate-shake-mild { animation: terminal-shake-mild 0.15s infinite; }
        .animate-shake-medium { animation: terminal-shake-medium 0.15s infinite; }
        .animate-shake-heavy { animation: terminal-shake-heavy 0.15s infinite; }
        
        @keyframes raindrop {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(80vh); }
        }
        .rain-particle {
          position: absolute;
          width: 1px;
          height: 12px;
          animation: raindrop linear infinite;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 150 }}
        className={`w-full max-w-5xl h-[80vh] flex flex-col rounded-3xl border ${themeStyles.bg} ${themeStyles.glow} overflow-hidden font-mono text-sm relative ${
          shakeActive 
            ? shakeIntensity === 'mild' ? 'animate-shake-mild' 
            : shakeIntensity === 'heavy' ? 'animate-shake-heavy' 
            : 'animate-shake-medium' 
            : ''
        }`}
      >
        {/* Bossbar element */}
        {activeBossbar && (
          <div className="absolute top-[68px] left-1/2 -translate-x-1/2 w-2/3 bg-black/90 border border-red-500/30 rounded-xl px-4 py-2 z-[160] flex flex-col gap-1 items-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div className="text-[10px] font-black tracking-widest text-red-500 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {activeBossbar.name}
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300" 
                style={{ width: `${activeBossbar.value}%` }}
              />
            </div>
            <div className="text-[9px] text-zinc-500 font-bold">{activeBossbar.value}% HEALTH</div>
          </div>
        )}

        {/* Title overlay element */}
        {activeTitle && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[170] pointer-events-none backdrop-blur-[1px]">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center p-8 border border-cyan-500/20 bg-cyan-950/20 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)]"
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse">
                {activeTitle}
              </h1>
              <div className="text-[10px] font-semibold text-cyan-400/60 mt-2 uppercase tracking-[0.3em]">Holographic Broadcast Active</div>
            </motion.div>
          </div>
        )}

        {/* Rain environmental effect */}
        {weatherEffect !== 'clear' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: weatherEffect === 'storm' ? 40 : 20 }).map((_, idx) => (
              <div 
                key={idx}
                className="rain-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}px`,
                  animationDuration: `${0.4 + Math.random() * 0.4}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: weatherEffect === 'storm' ? 0.7 : 0.4,
                  background: weatherEffect === 'storm' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(59, 130, 246, 0.4)'
                }}
              />
            ))}
          </div>
        )}

        {/* Terminal Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${themeStyles.header} z-10`}>
          <div className="flex items-center gap-3">
            <TerminalIcon size={18} className="animate-pulse text-cyan-400" />
            <span className="font-black tracking-widest text-[11px] uppercase">Zenith Multiverse Developer Command Shell</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {(['matrix', 'amber', 'cobalt', 'cyberpunk'] as const).map(th => (
                <button
                  key={th}
                  onClick={() => {
                    setTerminalTheme(th);
                    soundService.playSFX('ui_click');
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-white/10 ${
                    th === 'matrix' ? 'bg-emerald-500' :
                    th === 'amber' ? 'bg-amber-500' :
                    th === 'cobalt' ? 'bg-blue-500' : 'bg-fuchsia-500'
                  } ${terminalTheme === th ? 'scale-125 ring-2 ring-white/50' : 'opacity-60 hover:opacity-100'} transition-all`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                soundService.playSFX('ui_click');
                onClose();
              }}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body (Splitscreen Left: Quick Templates, Right: Console output) */}
        <div className="flex-1 flex overflow-hidden z-10">
          {/* Left panel: Quick Action Templates */}
          <div className="w-1/3 border-r border-white/5 p-5 flex flex-col gap-4 overflow-y-auto bg-black/20 custom-scrollbar">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 flex items-center gap-2">
                <Sparkles size={11} /> Quick Loadouts Presets
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Ninja Stealth', file: 'templates/loadouts/stealth.json', desc: 'Shotgun, Pistol, Melee' },
                  { name: 'Siege Juggernaut', file: 'templates/loadouts/juggernaut.json', desc: 'Rocket Launcher, Shotgun, Rifle' },
                  { name: 'Aether Spellcaster', file: 'templates/loadouts/wizard.json', desc: 'Sniper, Pistol, Dagger' },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      addOutput(`> load ${item.file}`, 'input');
                      VFS[item.file].action?.();
                      addOutput(`Loaded ${item.name} build!`, 'success');
                    }}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-left hover:bg-white/10 hover:border-white/10 transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="text-[9px] opacity-40 mt-1">{item.desc}</div>
                    </div>
                    <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 flex items-center gap-2">
                <Cpu size={11} /> Voxel Arena Presets
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Spawn Castle Walls', file: 'templates/arenas/castle.json', desc: '48-brick battlements layout' },
                  { name: 'Spawn Voxel Watchtower', file: 'templates/arenas/tower.json', desc: '8-tall quartz column tower' },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      addOutput(`> load ${item.file}`, 'input');
                      VFS[item.file].action?.();
                      addOutput(`Spawned structure relative to player position!`, 'success');
                    }}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-left hover:bg-white/10 hover:border-white/10 transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="text-[9px] opacity-40 mt-1">{item.desc}</div>
                    </div>
                    <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 flex items-center gap-2">
                <Code size={11} /> Automation Scripts
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: 'gravity_shift.sh', file: 'scripts/gravity_shift.sh' },
                  { name: 'high_speed.sh', file: 'scripts/high_speed.sh' },
                  { name: 'god_stamina.sh', file: 'scripts/god_stamina.sh' },
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      addOutput(`> run ${item.file}`, 'input');
                      VFS[item.file].action?.();
                      addOutput(`Applied ${item.name} constants modification!`, 'success');
                    }}
                    className="px-3 py-2 bg-white/5 rounded-lg border border-white/5 text-left text-xs hover:bg-white/10 hover:border-white/10 hover:text-white transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileCode size={12} className="opacity-50" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Active terminal prompt and output */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden bg-black/40">
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {outputs.map((out, idx) => {
                let colorClass = 'text-white/80';
                if (out.type === 'input') colorClass = themeStyles.inputColor + ' font-bold';
                else if (out.type === 'system') colorClass = 'text-white/40 text-[11px]';
                else if (out.type === 'success') colorClass = 'text-emerald-400 font-bold';
                else if (out.type === 'error') colorClass = 'text-red-500 font-bold animate-pulse';
                else if (out.type === 'info') colorClass = 'text-amber-400';

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed break-all whitespace-pre-wrap`}>
                    {out.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Prompt Line */}
            <form onSubmit={handleCommandSubmit} className="mt-4 flex gap-2 items-center border-t border-white/5 pt-4">
              <span className={`font-bold ${themeStyles.inputColor}`}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`flex-1 bg-transparent border-none focus:outline-none ${themeStyles.inputColor} caret-transparent font-bold`}
                placeholder="Type help or enter automated script..."
              />
              <span className={`w-2 h-4 ${themeStyles.caret} animate-[pulse_1s_infinite]`} />
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
