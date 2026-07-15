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

    // Command parser
    const args = trimmedInput.split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        addOutput('=================== HELP LOG ===================', 'system');
        addOutput('help                       : Display this guide', 'info');
        addOutput('ls                         : List available templates and scripts', 'info');
        addOutput('cat <file>                 : Print file contents', 'info');
        addOutput('run <script>               : Execute interactive script (e.g., run scripts/gravity_shift.sh)', 'info');
        addOutput('load <template>            : Load an arena structure or weapons deck', 'info');
        addOutput('theme <matrix|amber|cobalt|cyberpunk> : Adjust CLI design color scheme', 'info');
        addOutput('clear                      : Wipe terminal console history', 'info');
        addOutput('coins <amount>             : Add instant sandbox gold coins', 'info');
        addOutput('heal                       : Instantly restore Operator health to 100%', 'info');
        addOutput('exit                       : Close operator modding shell', 'info');
        addOutput('================================================', 'system');
        break;

      case 'ls':
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

      case 'cat':
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

      case 'run':
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

      case 'load':
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

      case 'theme':
        const newTheme = args[1]?.toLowerCase();
        if (newTheme === 'matrix' || newTheme === 'amber' || newTheme === 'cobalt' || newTheme === 'cyberpunk') {
          setTerminalTheme(newTheme as any);
          addOutput(`Theme modified to [${newTheme.toUpperCase()}] successfully.`, 'success');
        } else {
          addOutput('Error: Invalid theme. Options: matrix, amber, cobalt, cyberpunk', 'error');
        }
        break;

      case 'clear':
        setOutputs([]);
        break;

      case 'coins':
        const amt = parseInt(args[1]);
        if (!isNaN(amt)) {
          useGameStore.getState().addCoins(amt);
          addOutput(`Successfully credited ${amt} Coins to Operator account!`, 'success');
          soundService.playSFX('achievement');
        } else {
          addOutput('Error: Invalid amount. Usage: coins <number>', 'error');
        }
        break;

      case 'heal':
        useGameStore.setState({ health: 100 });
        addOutput('Operator vitals normalized at 100%. All systems structural integrity restored.', 'success');
        soundService.playSFX('powerup');
        break;

      case 'exit':
        onClose();
        break;

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 150 }}
        className={`w-full max-w-5xl h-[80vh] flex flex-col rounded-3xl border ${themeStyles.bg} ${themeStyles.glow} overflow-hidden font-mono text-sm`}
      >
        {/* Terminal Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${themeStyles.header}`}>
          <div className="flex items-center gap-3">
            <TerminalIcon size={18} className="animate-pulse" />
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
        <div className="flex-1 flex overflow-hidden">
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
