import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Folder, FolderPlus, FileCode, Play, Terminal, 
  Cpu, Code2, Save, Sparkles, Check, ChevronRight, ChevronDown,
  Wrench, Layers, Settings, MessageSquare, ShieldAlert, FileText, Trash2
} from 'lucide-react';
import { useGameStore } from '../store';
import { soundService } from '../services/soundService';
import { BlenderZipUpload } from './BlenderZipUpload';

// Define structures
interface VirtualFile {
  name: string;
  type: 'code' | 'json' | 'asset' | 'text';
  content: string;
  extension: 'cs' | 'cpp' | 'py' | 'json' | 'obj' | 'png' | 'txt';
}

interface VirtualFolder {
  name: string;
  files: VirtualFile[];
  subfolders?: Record<string, VirtualFolder>;
}

export interface VirtualWorld {
  id: string;
  name: string;
  created: string;
  folders: {
    mods: {
      name: string;
      files: VirtualFile[];
      subfolders: {
        models: {
          name: string;
          files: VirtualFile[];
        }
      }
    };
    builds: {
      name: string;
      files: VirtualFile[];
    };
    bots: {
      name: string;
      files: VirtualFile[];
    };
    code: {
      name: string;
      files: VirtualFile[];
    };
  };
  information: string; // information.json content
}

interface WorldAndModdingStudioProps {
  onClose: () => void;
}

// Predefined C#, Python, C++, and config templates
const TEMPLATES = {
  cs_speed: `using System;
using UnityEngine;
using UnityEngine.XR.OpenXR;

namespace InfinityAcademy.Mods 
{
    // C# OpenXR Kinetic Controller
    public class PhysicsOverride : MonoBehaviour 
    {
        public const float SPEED_MULTIPLIER = 3.5f;
        public const float GRAVITY_MULTIPLIER = 0.4f;
        public const string MOD_ID = "com.unity.xr.kinetic";

        void Start() 
        {
            Debug.Log("[C# MOD] OpenXR physics injected. Speed set to 3.5x, Gravity to 40%.");
        }
    }
}`,
  cs_balanced: `using System;
using UnityEngine;

namespace InfinityAcademy.Mods 
{
    public class LightPhysics : MonoBehaviour 
    {
        public const float SPEED_MULTIPLIER = 1.4f;
        public const float GRAVITY_MULTIPLIER = 0.85f;
        public const string MOD_ID = "com.unity.xr.light";

        void Start() 
        {
            Debug.Log("[C# MOD] Safe gravity limits established. Commencing gameplay.");
        }
    }
}`,
  py_havoc: `# Infinity Academy VR Modding Engine
# Python Bot & Weapon Overdrive Mod

def on_world_load():
    # Toggle infinite clip & ammunition
    set_infinite_ammo(True)
    
    # Firearm bullet damage multiplier
    set_damage_multiplier(5.0)
    
    # Giant experimental robots configuration
    set_bot_scale(2.4)
    set_bot_speed_multiplier(1.9)
    set_aggressive_bots(True)
    
    print("[PYTHON MOD] Absolute havoc active: Inf Ammo, 5x Damage, 2.4x Bot Sizes.")`,
  py_ghost: `# Python Ghost & Passive Stealth Mod
# Perfect for exploratory testing

def on_world_load():
    set_infinite_ammo(True)
    set_damage_multiplier(1.0)
    
    # Tiny, slow, passive training robots
    set_bot_scale(0.5)
    set_bot_speed_multiplier(0.4)
    set_aggressive_bots(False)
    
    print("[PYTHON MOD] Ghost training protocol initiated: Mini, slow training bots.")`,
  cpp_neon: `// C++ Immersive Graphics Overlay
#include <iostream>
#include "GameHooks.h"

extern "C" void OnWorldInit() {
    // Override color matrix triggers
    GameHooks::SetWeaponColor("#ff0077"); // Hot pink laser lines
    GameHooks::SetSkyColor("#070211");    // Deep cosmic night
    GameHooks::SetMapTheme("neon_grid");  // Cyber theme blocks
    
    std::cout << "[C++ ENGINE] Graphics hooks successfully bound. Violet-Neon arrays primed." << std::endl;
}`,
  cpp_golden: `// C++ Golden Age Visual Shader
#include <iostream>
#include "GameHooks.h"

extern "C" void OnWorldInit() {
    GameHooks::SetWeaponColor("#ffd700"); // Solid pure gold laser rays
    GameHooks::SetSkyColor("#1a1100");    // Warm golden hour sunset
    GameHooks::SetMapTheme("aurum");      // Golden blocks
    
    std::cout << "[C++ ENGINE] Golden theme applied: Aurum core active." << std::endl;
}`,
  obj_weapon: `# Wavefront OBJ Exporter v4.1
# Custom Laser Rifle Mesh configuration
o LaserSaber_Modded
v 0.0000 1.0000 0.0000
v 0.5000 0.0000 0.0000
v -0.5000 0.0000 0.0000
# High resolution emitter lines mapped
vn 0.0000 1.0000 0.0000
f 1//1 2//1 3//1
# Mesh override bound to current hotbar`,
  png_block: `# Simulated texture mapping properties
[TextureCoords]
AccentColor = "#00ffff"
GlowIntensity = 2.5
TileScale = 4.0
Roughness = 0.1`,
  build_map: `{
  "world_name": "My Custom Voxel Sandbox",
  "block_count": 142,
  "theme": "cybercity",
  "starting_pos": [0, 2, 0],
  "structural_nodes": [
    { "type": "neon_grid", "pos": [0, 0, -5], "scale": [2, 4, 2] },
    { "type": "concrete", "pos": [-5, 0, -5], "scale": [1, 8, 1] },
    { "type": "quartz", "pos": [5, 0, -5], "scale": [1, 8, 1] }
  ]
}`,
  bots_config: `{
  "bot_difficulty": "expert",
  "bot_count": 8,
  "bot_behavior": "aggressive_hunting",
  "shield_regeneration": true,
  "tactical_pings_frequency": 0.85
}`
};

export function WorldAndModdingStudio({ onClose }: WorldAndModdingStudioProps) {
  const addEvent = useGameStore(state => state.addEvent);
  const applyWorldMods = useGameStore(state => state.applyWorldMods);
  const setGameState = useGameStore(state => state.setGameState);
  const setMap = useGameStore(state => state.setMap);

  // Loaded custom worlds state
  const [worlds, setWorlds] = useState<VirtualWorld[]>([]);
  const [activeWorldId, setActiveWorldId] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFilePath, setSelectedFilePath] = useState<string>(''); // format: "worldId/folder/subfolder/filename"
  const [editorContent, setEditorContent] = useState<string>('');
  const [newWorldName, setNewWorldName] = useState<string>('');
  const [compiling, setCompiling] = useState<boolean>(false);
  const [compileLog, setCompileLog] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  const [blenderStatus, setBlenderStatus] = useState<{
    exists: boolean;
    isPlaceholder: boolean;
    isValidZip: boolean;
    size?: number;
    message?: string;
  } | null>(null);

  const checkBlenderStatus = async () => {
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      if (data.success) {
        setBlenderStatus({
          exists: data.exists,
          isPlaceholder: data.isPlaceholder,
          isValidZip: data.isValidZip,
          size: data.size,
          message: data.message
        });
      }
    } catch (e) {
      console.error('Error fetching blender status:', e);
    }
  };

  useEffect(() => {
    checkBlenderStatus();
    const interval = setInterval(checkBlenderStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize from LocalStorage or inject default worlds
  useEffect(() => {
    const saved = localStorage.getItem('infinity_academy_worlds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWorlds(parsed);
        if (parsed.length > 0) {
          setActiveWorldId(parsed[0].id);
        }
      } catch (e) {
        loadDefaultWorlds();
      }
    } else {
      loadDefaultWorlds();
    }
  }, []);

  const loadDefaultWorlds = () => {
    const defaults: VirtualWorld[] = [
      {
        id: 'world-neon-sandbox',
        name: 'Neo-Tokyo Core',
        created: new Date().toLocaleDateString(),
        folders: {
          mods: {
            name: 'mods',
            files: [
              { name: 'physics_override.cs', type: 'code', extension: 'cs', content: TEMPLATES.cs_speed },
              { name: 'bot_ai.py', type: 'code', extension: 'py', content: TEMPLATES.py_havoc }
            ],
            subfolders: {
              models: {
                name: 'models',
                files: [
                  { name: 'weapon_skin.obj', type: 'asset', extension: 'obj', content: TEMPLATES.obj_weapon },
                  { name: 'block_material.png', type: 'asset', extension: 'png', content: TEMPLATES.png_block }
                ]
              }
            }
          },
          builds: {
            name: 'builds',
            files: [
              { name: 'block_map.json', type: 'json', extension: 'json', content: TEMPLATES.build_map }
            ]
          },
          bots: {
            name: 'bots',
            files: [
              { name: 'bot_config.json', type: 'json', extension: 'json', content: TEMPLATES.bots_config }
            ]
          },
          code: {
            name: 'code',
            files: [
              { name: 'procedural_seed.py', type: 'code', extension: 'py', content: `# Procedural terrain generation config\nSEED = 771029\nWIDTH = 500\nHEIGHT = 500` }
            ]
          }
        },
        information: JSON.stringify({
          description: "A dark cyberpunk skyline filled with high-rise grid structures and simulated neon drones.",
          creator: "SysOp",
          version: "1.0.0",
          base_map: "cybercity"
        }, null, 2)
      },
      {
        id: 'world-ancient-arena',
        name: 'Aurum Sandbox',
        created: new Date().toLocaleDateString(),
        folders: {
          mods: {
            name: 'mods',
            files: [
              { name: 'physics_override.cs', type: 'code', extension: 'cs', content: TEMPLATES.cs_balanced },
              { name: 'graphics_hooks.cpp', type: 'code', extension: 'cpp', content: TEMPLATES.cpp_golden }
            ],
            subfolders: {
              models: {
                name: 'models',
                files: [
                  { name: 'shield_mesh.obj', type: 'asset', extension: 'obj', content: TEMPLATES.obj_weapon }
                ]
              }
            }
          },
          builds: {
            name: 'builds',
            files: [
              { name: 'structure_save.json', type: 'json', extension: 'json', content: TEMPLATES.build_map }
            ]
          },
          bots: {
            name: 'bots',
            files: [
              { name: 'training_bots.json', type: 'json', extension: 'json', content: TEMPLATES.bots_config }
            ]
          },
          code: {
            name: 'code',
            files: [
              { name: 'generator.py', type: 'code', extension: 'py', content: `SEED = 1205\nAMB_LIGHT = "#ffaa00"` }
            ]
          }
        },
        information: JSON.stringify({
          description: "An ancient golden colosseum optimized for fluid movement testing and custom asset loading.",
          creator: "Architect_Zero",
          version: "1.2.0",
          base_map: "aurum_dominion"
        }, null, 2)
      }
    ];

    setWorlds(defaults);
    setActiveWorldId(defaults[0].id);
    localStorage.setItem('infinity_academy_worlds', JSON.stringify(defaults));
  };

  // Save changes to LocalStorage
  const saveWorldsToStorage = (updated: VirtualWorld[]) => {
    setWorlds(updated);
    localStorage.setItem('infinity_academy_worlds', JSON.stringify(updated));
  };

  // Toggle tree node expansion
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Handle click on file to load into the editor
  const handleFileClick = (worldId: string, folder: string, subfolder: string | null, fileName: string, content: string) => {
    const p = subfolder ? `${worldId}/${folder}/${subfolder}/${fileName}` : `${worldId}/${folder}/${fileName}`;
    setSelectedFilePath(p);
    setEditorContent(content);
  };

  // Save active file changes
  const handleSaveFile = () => {
    if (!selectedFilePath) return;
    const parts = selectedFilePath.split('/');
    const worldId = parts[0];
    
    const updated = worlds.map(w => {
      if (w.id !== worldId) return w;
      
      const newWorld = { ...w };
      
      // Update the correct file
      if (parts[1] === 'mods') {
        if (parts[2] === 'models') {
          newWorld.folders.mods.subfolders.models.files = newWorld.folders.mods.subfolders.models.files.map(f => 
            f.name === parts[3] ? { ...f, content: editorContent } : f
          );
        } else {
          newWorld.folders.mods.files = newWorld.folders.mods.files.map(f => 
            f.name === parts[2] ? { ...f, content: editorContent } : f
          );
        }
      } else if (parts[1] === 'builds') {
        newWorld.folders.builds.files = newWorld.folders.builds.files.map(f => 
          f.name === parts[2] ? { ...f, content: editorContent } : f
        );
      } else if (parts[1] === 'bots') {
        newWorld.folders.bots.files = newWorld.folders.bots.files.map(f => 
          f.name === parts[2] ? { ...f, content: editorContent } : f
        );
      } else if (parts[1] === 'code') {
        newWorld.folders.code.files = newWorld.folders.code.files.map(f => 
          f.name === parts[2] ? { ...f, content: editorContent } : f
        );
      }
      
      return newWorld;
    });

    saveWorldsToStorage(updated);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2000);
    
    try {
      soundService.playSFX('spell');
    } catch(e){}
  };

  // Create a brand new world folder structure
  const handleCreateWorld = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim()) return;

    const id = 'world-' + newWorldName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newWorld: VirtualWorld = {
      id,
      name: newWorldName.trim(),
      created: new Date().toLocaleDateString(),
      folders: {
        mods: {
          name: 'mods',
          files: [
            { name: 'physics_override.cs', type: 'code', extension: 'cs', content: TEMPLATES.cs_balanced },
            { name: 'bot_ai.py', type: 'code', extension: 'py', content: TEMPLATES.py_ghost }
          ],
          subfolders: {
            models: {
              name: 'models',
              files: [
                { name: 'weapon_mesh.obj', type: 'asset', extension: 'obj', content: TEMPLATES.obj_weapon }
              ]
            }
          }
        },
        builds: {
          name: 'builds',
          files: [
            { name: 'block_map.json', type: 'json', extension: 'json', content: TEMPLATES.build_map }
          ]
        },
        bots: {
          name: 'bots',
          files: [
            { name: 'bot_config.json', type: 'json', extension: 'json', content: TEMPLATES.bots_config }
          ]
        },
        code: {
          name: 'code',
          files: [
            { name: 'main_kernel.py', type: 'code', extension: 'py', content: `# Main World Logic script\ndef init():\n    set_sky_color("#05051a")` }
          ]
        }
      },
      information: JSON.stringify({
        description: `Custom interactive voxel world named ${newWorldName}. Expandable with C#, C++, and Python mods.`,
        creator: "UserOperator",
        version: "1.0.0",
        base_map: "infinite"
      }, null, 2)
    };

    const updated = [...worlds, newWorld];
    saveWorldsToStorage(updated);
    setActiveWorldId(id);
    setNewWorldName('');
    setShowCreateForm(false);
    addEvent(`📁 [WORLD CREATED] Folder initialized: /worlds/${id}/ containing builds, bots, code, and mods/`);
  };

  // Delete a custom world
  const handleDeleteWorld = (worldId: string) => {
    if (worlds.length <= 1) {
      addEvent(`🚫 [ERROR] You must keep at least one world workspace!`);
      return;
    }
    const updated = worlds.filter(w => w.id !== worldId);
    saveWorldsToStorage(updated);
    setActiveWorldId(updated[0].id);
    addEvent(`🗑️ [WORLD DELETED] Removed workspace: ${worldId}`);
  };

  // Compile active mods and inject into standard gameplay
  const handleCompile = async () => {
    const activeWorld = worlds.find(w => w.id === activeWorldId);
    if (!activeWorld) return;

    setCompiling(true);
    setCompileLog([]);

    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setCompileLog([...logs]);
    };

    addLog(`[MOD COMPILER v4.2] Verifying system compilation requirements...`);

    let isZipValid = false;
    let zipSize = 0;
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      isZipValid = data.success && data.exists && !data.isPlaceholder && data.isValidZip;
      zipSize = data.size || 0;
    } catch (e) {
      console.error(e);
    }

    if (!isZipValid) {
      setTimeout(() => {
        addLog(`[CRITICAL COMPILER ERROR] 🔒 MOD MAKER COMPILATION LOCKED!`);
        addLog(`[SYSTEM] File verification failed: No valid Blender .zip found at /blender.zip.`);
        addLog(`[SYSTEM] Please upload or replace the placeholder at "/blender.zip" with your real Blender zip package (e.g. 20-alienanimal_obj.zip or similar model) to unlock the compiling engine.`);
        addLog(`[SYSTEM] Automatically linking Blender zip inputs is currently OFFLINE.`);
        setCompiling(false);
        try {
          soundService.playSFX('hit');
        } catch (e) {}
      }, 500);
      return;
    }

    setTimeout(() => addLog(`[SUCCESS] 🔓 Blender asset package detected at /blender.zip (${(zipSize / 1024).toFixed(1)} KB)! Unpacking assets...`), 100);
    setTimeout(() => addLog(`[MOD COMPILER v4.2] Loading world files from /worlds/${activeWorld.id}/`), 300);
    setTimeout(() => addLog(`[MOD COMPILER] Found root folders: 'mods/', 'builds/', 'bots/', 'code/'`), 500);
    setTimeout(() => addLog(`[MOD COMPILER] scanning C# files in 'mods/'...`), 700);
    
    // Look for variables inside user C# files
    let speedMult = 1.0;
    let gravMult = 1.0;
    let damageMult = 1.0;
    let infAmmo = false;
    let weaponCol = '';
    let skyCol = '';
    let botScale = 1.0;
    let botSpeed = 1.0;
    let aggressiveBots = false;
    let mapTheme = 'default';

    // Parse the C# content in memory
    const csFile = activeWorld.folders.mods.files.find(f => f.name.endsWith('.cs'));
    const csContent = csFile ? csFile.content : '';
    
    const speedMatch = csContent.match(/SPEED_MULTIPLIER\s*=\s*([0-9.]+)/i);
    if (speedMatch) speedMult = parseFloat(speedMatch[1]);
    
    const gravMatch = csContent.match(/GRAVITY_MULTIPLIER\s*=\s*([0-9.]+)/i);
    if (gravMatch) gravMult = parseFloat(gravMatch[1]);

    setTimeout(() => {
      addLog(`[C# TRANSPILES] Compiled ${csFile?.name || 'physics_override.cs'}:`);
      addLog(`   -> SPEED_MULTIPLIER = ${speedMult}x`);
      addLog(`   -> GRAVITY_MULTIPLIER = ${gravMult}x`);
    }, 700);

    // Parse python scripting content
    setTimeout(() => addLog(`[MOD COMPILER] Scanning Python scripting files in 'mods/'...`), 900);
    
    const pyFile = activeWorld.folders.mods.files.find(f => f.name.endsWith('.py'));
    const pyContent = pyFile ? pyFile.content : '';

    if (pyContent.includes('set_infinite_ammo(True)')) infAmmo = true;
    
    const pyDamageMatch = pyContent.match(/set_damage_multiplier\s*\(\s*([0-9.]+)\s*\)/i);
    if (pyDamageMatch) damageMult = parseFloat(pyDamageMatch[1]);

    const pyBotScaleMatch = pyContent.match(/set_bot_scale\s*\(\s*([0-9.]+)\s*\)/i);
    if (pyBotScaleMatch) botScale = parseFloat(pyBotScaleMatch[1]);

    const pyBotSpeedMatch = pyContent.match(/set_bot_speed_multiplier\s*\(\s*([0-9.]+)\s*\)/i);
    if (pyBotSpeedMatch) botSpeed = parseFloat(pyBotSpeedMatch[1]);

    if (pyContent.includes('set_aggressive_bots(True)')) aggressiveBots = true;

    setTimeout(() => {
      addLog(`[PY INTERPRETER] Loaded ${pyFile?.name || 'bot_ai.py'} inside isolated Sandbox WASM:`);
      addLog(`   -> Infinite Ammunition: ${infAmmo ? 'ENABLED' : 'DISABLED'}`);
      addLog(`   -> Weapon Damage boost: ${damageMult}x`);
      addLog(`   -> Giant Robots scale: ${botScale}x`);
      addLog(`   -> Robot movespeed factor: ${botSpeed}x`);
      addLog(`   -> Robot behavioral AI: ${aggressiveBots ? 'AGGRESSIVE HUNTING' : 'PASSIVE TRAINING'}`);
    }, 1100);

    // Parse C++ graphics overrides
    setTimeout(() => addLog(`[MOD COMPILER] Inspecting C++ hooks in 'mods/'...`), 1300);
    
    const cppFile = activeWorld.folders.mods.files.find(f => f.name.endsWith('.cpp'));
    const cppContent = cppFile ? cppFile.content : '';

    const colorMatch = cppContent.match(/SetWeaponColor\s*\(\s*"([^"]+)"\s*\)/i);
    if (colorMatch) weaponCol = colorMatch[1];

    const skyMatch = cppContent.match(/SetSkyColor\s*\(\s*"([^"]+)"\s*\)/i);
    if (skyMatch) skyCol = skyMatch[1];

    const themeMatch = cppContent.match(/SetMapTheme\s*\(\s*"([^"]+)"\s*\)/i);
    if (themeMatch) mapTheme = themeMatch[1];

    setTimeout(() => {
      if (cppFile) {
        addLog(`[C++ COMPILER] Linked graphics entry points from ${cppFile.name}:`);
        if (weaponCol) addLog(`   -> Emissive laser hex code: ${weaponCol}`);
        if (skyCol) addLog(`   -> Panoramic background skybox color: ${skyCol}`);
        if (mapTheme) addLog(`   -> Voxel block style theme overrides: ${mapTheme}`);
      } else {
        addLog(`[C++ COMPILER] No native graphics overrides files found. Skipping...`);
      }
    }, 1500);

    setTimeout(() => {
      addLog(`[BUILD LINKER] Assembling placed structural node maps from builds/block_map.json...`);
      addLog(`[MOD COMPILER] Linking completed successfully! Bypassing crash risks via safety catch brackets.`);
      addLog(`[SUCCESS] 🚀 Injected modded assemblies live! World "${activeWorld.name}" is ready for play.`);
      
      setCompiling(false);
      
      // APPLY THE OVERRIDES TO THE GAME STORE LIVE!
      applyWorldMods({
        speedMultiplier: speedMult,
        gravityMultiplier: gravMult,
        damageMultiplier: damageMult,
        infiniteAmmo: infAmmo,
        color: weaponCol || '#00ffff',
        weapons: [],
        skyColor: skyCol,
        customMesh: '',
        botScale,
        botSpeedMultiplier: botSpeed,
        isAggressiveBots: aggressiveBots,
        mapTheme,
        worldId: activeWorld.id,
        worldName: activeWorld.name
      });
      
      try {
        soundService.playSFX('quest_complete');
      } catch(e){}
    }, 1800);
  };

  const handleLaunchGame = async () => {
    const activeWorld = worlds.find(w => w.id === activeWorldId);
    if (!activeWorld) return;

    // Check Blender zip status
    let isZipValid = false;
    try {
      const response = await fetch('/api/blender/status');
      const data = await response.json();
      isZipValid = data.success && data.exists && !data.isPlaceholder && data.isValidZip;
    } catch (e) {
      console.error(e);
    }

    if (!isZipValid) {
      setCompileLog([
        `[CRITICAL SYSTEM ERROR] 🔒 PLAY LAUNCH BLOCKED!`,
        `[SYSTEM] Cannot launch modded sandbox without a valid Blender model package at /blender.zip.`,
        `[SYSTEM] Please upload or replace "/blender.zip" with your real Blender zip archive to unlock gameplay.`
      ]);
      try {
        soundService.playSFX('hit');
      } catch (e) {}
      return;
    }

    // First ensure we compiled the latest code
    await handleCompile();

    // Set the map based on the base_map configured in information.json or mapTheme override
    let finalMap: any = 'custom_scan';
    try {
      const parsedInfo = JSON.parse(activeWorld.information);
      if (parsedInfo.base_map) {
        finalMap = parsedInfo.base_map;
      }
    } catch(e){}

    setTimeout(() => {
      setMap(finalMap);
      setGameState('open_world');
      addEvent(`🌍 LOADING WORLD: ${activeWorld.name.toUpperCase()} (Mods, builds, and bots injected!)`);
      onClose();
    }, 1900);
  };

  const activeWorld = worlds.find(w => w.id === activeWorldId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-950/98 z-[200] flex flex-col p-6 backdrop-blur-2xl font-sans text-zinc-300"
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-400/30 text-cyan-400">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider italic">
              World Workspace & Modding Studio
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
              Build worlds, compile C#/C++ plugins & python scripts, customize bots & maps
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/5 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* THREE PANEL GRID */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* PANEL 1: WORLD DIRECTORY EXPLORER */}
        <div className="col-span-3 bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Folder size={14} className="text-amber-500" />
              World Workspace Tree
            </h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-[9px] font-black bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all px-2.5 py-1 rounded-md uppercase"
            >
              New World
            </button>
          </div>

          {/* New World Input Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateWorld} className="mb-4 bg-zinc-900/60 p-3 rounded-2xl border border-white/5 space-y-2">
              <div className="text-[8px] font-black text-zinc-500 uppercase">World name</div>
              <input
                type="text"
                value={newWorldName}
                onChange={e => setNewWorldName(e.target.value)}
                placeholder="e.g. My Infinite Sandbox"
                className="w-full text-xs bg-black border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[8px] font-black hover:text-white py-1 px-2 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[8px] font-black bg-cyan-400 text-black px-2.5 py-1 rounded-md uppercase"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Active World Selector / Directories */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {worlds.map(w => {
              const isSelectedWorld = w.id === activeWorldId;
              const pathPrefix = `${w.id}`;
              const isModsExp = expandedFolders[`${pathPrefix}/mods`];
              const isModelsExp = expandedFolders[`${pathPrefix}/mods/models`];
              const isBuildsExp = expandedFolders[`${pathPrefix}/builds`];
              const isBotsExp = expandedFolders[`${pathPrefix}/bots`];
              const isCodeExp = expandedFolders[`${pathPrefix}/code`];

              return (
                <div key={w.id} className={`rounded-2xl border transition-all ${
                  isSelectedWorld ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent'
                }`}>
                  <div 
                    onClick={() => setActiveWorldId(w.id)}
                    className="flex items-center justify-between p-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Folder size={16} className={isSelectedWorld ? 'text-amber-400' : 'text-zinc-500'} />
                      <span className={`text-xs font-black uppercase tracking-wide ${
                        isSelectedWorld ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}>
                        {w.name}
                      </span>
                    </div>
                    {isSelectedWorld && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorld(w.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-all p-1"
                        title="Delete world workspace"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Nested Directories - Render if active */}
                  {isSelectedWorld && (
                    <div className="pl-6 pb-3 space-y-1 text-xs select-none">
                      
                      {/* --- MODS FOLDER --- */}
                      <div>
                        <div 
                          onClick={() => toggleFolder(`${pathPrefix}/mods`)}
                          className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {isModsExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Folder size={13} className="text-cyan-400" />
                          <span className="font-bold text-[10px] uppercase">mods/</span>
                        </div>
                        {isModsExp && (
                          <div className="pl-4 space-y-1 border-l border-white/5 ml-2.5">
                            
                            {/* Models Subfolder */}
                            <div>
                              <div 
                                onClick={() => toggleFolder(`${pathPrefix}/mods/models`)}
                                className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
                              >
                                {isModelsExp ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                <Folder size={12} className="text-cyan-600" />
                                <span className="font-bold text-[9px] uppercase">models/</span>
                              </div>
                              {isModelsExp && (
                                <div className="pl-4 space-y-1 border-l border-white/5 ml-2">
                                  {w.folders.mods.subfolders.models.files.map(f => (
                                    <div 
                                      key={f.name}
                                      onClick={() => handleFileClick(w.id, 'mods', 'models', f.name, f.content)}
                                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                                        selectedFilePath === `${w.id}/mods/models/${f.name}` 
                                          ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                          : 'text-zinc-500 hover:text-zinc-300'
                                      }`}
                                    >
                                      <FileCode size={11} />
                                      <span className="text-[9px] font-mono">{f.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Mods Root files */}
                            {w.folders.mods.files.map(f => (
                              <div 
                                key={f.name}
                                onClick={() => handleFileClick(w.id, 'mods', null, f.name, f.content)}
                                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                                  selectedFilePath === `${w.id}/mods/${f.name}` 
                                    ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <FileCode size={12} className={f.extension === 'cs' ? 'text-amber-500' : 'text-green-500'} />
                                <span className="text-[10px] font-mono">{f.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- BUILDS FOLDER --- */}
                      <div>
                        <div 
                          onClick={() => toggleFolder(`${pathPrefix}/builds`)}
                          className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {isBuildsExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Folder size={13} className="text-zinc-500" />
                          <span className="font-bold text-[10px] uppercase">builds/</span>
                        </div>
                        {isBuildsExp && (
                          <div className="pl-4 space-y-1 border-l border-white/5 ml-2.5">
                            {w.folders.builds.files.map(f => (
                              <div 
                                key={f.name}
                                onClick={() => handleFileClick(w.id, 'builds', null, f.name, f.content)}
                                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                                  selectedFilePath === `${w.id}/builds/${f.name}` 
                                    ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <FileText size={12} className="text-purple-400" />
                                <span className="text-[10px] font-mono">{f.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- BOTS FOLDER --- */}
                      <div>
                        <div 
                          onClick={() => toggleFolder(`${pathPrefix}/bots`)}
                          className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {isBotsExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Folder size={13} className="text-zinc-500" />
                          <span className="font-bold text-[10px] uppercase">bots/</span>
                        </div>
                        {isBotsExp && (
                          <div className="pl-4 space-y-1 border-l border-white/5 ml-2.5">
                            {w.folders.bots.files.map(f => (
                              <div 
                                key={f.name}
                                onClick={() => handleFileClick(w.id, 'bots', null, f.name, f.content)}
                                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                                  selectedFilePath === `${w.id}/bots/${f.name}` 
                                    ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <FileText size={12} className="text-blue-400" />
                                <span className="text-[10px] font-mono">{f.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- CODE FOLDER --- */}
                      <div>
                        <div 
                          onClick={() => toggleFolder(`${pathPrefix}/code`)}
                          className="flex items-center gap-1.5 py-1 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {isCodeExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Folder size={13} className="text-zinc-500" />
                          <span className="font-bold text-[10px] uppercase">code/</span>
                        </div>
                        {isCodeExp && (
                          <div className="pl-4 space-y-1 border-l border-white/5 ml-2.5">
                            {w.folders.code.files.map(f => (
                              <div 
                                key={f.name}
                                onClick={() => handleFileClick(w.id, 'code', null, f.name, f.content)}
                                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                                  selectedFilePath === `${w.id}/code/${f.name}` 
                                    ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <FileCode size={12} className="text-zinc-500" />
                                <span className="text-[10px] font-mono">{f.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* WORLD METADATA INFO FILE */}
                      <div 
                        onClick={() => {
                          setSelectedFilePath(`${w.id}/information.json`);
                          setEditorContent(w.information);
                        }}
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer ${
                          selectedFilePath === `${w.id}/information.json` 
                            ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <FileCode size={12} className="text-teal-400" />
                        <span className="font-bold text-[10px] uppercase font-mono">information.json</span>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: HIGH-FIDELITY CODE EDITOR IDE */}
        <div className="col-span-6 bg-zinc-950/90 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0 relative">
          
          {selectedFilePath ? (
            <>
              {/* Editor Header / Toolbars */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-cyan-400" />
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                    {selectedFilePath}
                  </span>
                </div>
                
                {/* Instant Templates Injection for Fast Modding */}
                <div className="flex items-center gap-2">
                  {selectedFilePath.endsWith('.cs') && (
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'speed') setEditorContent(TEMPLATES.cs_speed);
                        if (e.target.value === 'balanced') setEditorContent(TEMPLATES.cs_balanced);
                      }}
                      className="text-[9px] bg-black border border-white/10 rounded px-2 py-1 font-black uppercase text-amber-400"
                    >
                      <option value="">-- Apply C# Preset --</option>
                      <option value="speed">C# 3.5x Speed & Anti-Gravity</option>
                      <option value="balanced">C# Safe 1.4x Speed</option>
                    </select>
                  )}

                  {selectedFilePath.endsWith('.py') && (
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'havoc') setEditorContent(TEMPLATES.py_havoc);
                        if (e.target.value === 'ghost') setEditorContent(TEMPLATES.py_ghost);
                      }}
                      className="text-[9px] bg-black border border-white/10 rounded px-2 py-1 font-black uppercase text-green-400"
                    >
                      <option value="">-- Apply Python Preset --</option>
                      <option value="havoc">Python Absolute Havoc Bots</option>
                      <option value="ghost">Python Mini Stealth Bots</option>
                    </select>
                  )}

                  {selectedFilePath.endsWith('.cpp') && (
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'neon') setEditorContent(TEMPLATES.cpp_neon);
                        if (e.target.value === 'golden') setEditorContent(TEMPLATES.cpp_golden);
                      }}
                      className="text-[9px] bg-black border border-white/10 rounded px-2 py-1 font-black uppercase text-pink-400"
                    >
                      <option value="">-- Apply C++ Theme Preset --</option>
                      <option value="neon">C++ Violet Neon Overlay</option>
                      <option value="golden">C++ Golden Sunset Theme</option>
                    </select>
                  )}

                  <button
                    onClick={handleSaveFile}
                    className="flex items-center gap-1.5 text-[9px] font-black bg-cyan-400 text-black px-2.5 py-1 rounded hover:bg-cyan-300 transition-all cursor-pointer"
                  >
                    <Save size={12} />
                    SAVE
                  </button>
                </div>
              </div>

              {/* Code TextArea */}
              <div className="flex-1 flex overflow-hidden font-mono text-xs bg-black rounded-2xl border border-white/5 p-4 min-h-0 relative">
                {/* Simulated Gutter */}
                <div className="text-zinc-600 text-right pr-4 select-none border-r border-white/5 mr-4 h-full overflow-hidden shrink-0 space-y-0.5">
                  {Array.from({ length: editorContent.split('\n').length || 1 }).map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
                {/* Main Text Editor Input */}
                <textarea
                  value={editorContent}
                  onChange={e => setEditorContent(e.target.value)}
                  className="flex-1 bg-transparent text-zinc-300 outline-none resize-none overflow-y-auto leading-relaxed h-full custom-scrollbar selection:bg-cyan-500/25 select-text"
                  spellCheck={false}
                />

                {isSuccessToast && (
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-md text-emerald-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                    <Check size={12} />
                    File saved to /worlds/ mods/!
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 border border-dashed border-white/5 rounded-3xl">
              <Code2 size={48} className="text-zinc-600 mb-4 animate-pulse" />
              <h4 className="text-sm font-black uppercase text-zinc-400 tracking-wider">No Active Code File Selected</h4>
              <p className="text-xs max-w-sm mt-2 leading-relaxed">
                Click to expand directories on your left and load C#, C++, Python script files or meta JSON profiles.
              </p>
            </div>
          )}

        </div>

        {/* PANEL 3: COMPILER TERMINAL & RUN CONTROLLER */}
        <div className="col-span-3 bg-black/50 border border-white/5 rounded-3xl p-5 flex flex-col min-h-0">
          <div className="pb-2 border-b border-white/5 mb-3">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Terminal size={14} className="text-cyan-400" />
              System Compile logs
            </h3>
          </div>

          {/* Scrolling Compiler Console Terminal */}
          <div className="flex-1 bg-black/80 rounded-2xl border border-white/5 p-4 overflow-y-auto font-mono text-[9px] leading-relaxed text-zinc-400 space-y-1.5 custom-scrollbar min-h-0">
            {compileLog.length === 0 ? (
              <div className="text-zinc-600 italic">No mod compiler output. Click the Compile button below to scan C#/Python overrides.</div>
            ) : (
              compileLog.map((log, index) => {
                let colorClass = 'text-zinc-400';
                if (log.includes('[SUCCESS]') || log.includes('ENABLED')) colorClass = 'text-emerald-400';
                if (log.includes('[ERROR]') || log.includes('havoc')) colorClass = 'text-red-400';
                if (log.includes('[C#') || log.includes('[C++')) colorClass = 'text-amber-400';
                if (log.includes('[PY')) colorClass = 'text-green-400';

                return (
                  <div key={index} className={colorClass}>
                    {log}
                  </div>
                );
              })
            )}
            {compiling && (
              <div className="text-cyan-400 animate-pulse mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                Executing WebAssembly compilers...
              </div>
            )}
          </div>

          {/* LAUNCH / COMPILE CONTROLS */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
            {/* Blender .zip Upload Zone */}
            <BlenderZipUpload onUploadSuccess={checkBlenderStatus} className="bg-zinc-950/80 border border-white/10" />

            <div className="bg-zinc-950 p-3 rounded-2xl border border-white/5 text-zinc-500 space-y-1.5">
              <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Active World Sandbox</div>
              <div className="text-[10px] font-black text-white uppercase italic">
                {activeWorld?.name || 'NONE SELECTED'}
              </div>
              <div className="text-[8px] font-medium leading-relaxed">
                Clicking Compile generates a secure 3D telemetry configuration, loading placed structures alongside mod values.
              </div>
            </div>

            <button
              onClick={handleCompile}
              disabled={compiling}
              className={`w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                compiling ? 'opacity-50' : ''
              }`}
            >
              <Cpu size={14} className={compiling ? 'animate-spin' : ''} />
              COMPILE ACTIVE MODS
            </button>

            <button
              onClick={handleLaunchGame}
              className="w-full py-4 bg-cyan-400 text-black hover:bg-cyan-300 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              PLAY IN MODDED WORLD
            </button>
          </div>

        </div>

      </div>

      {/* FOOTER METRICS BAR */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-semibold text-zinc-500 tracking-wider shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <Wrench size={13} className="text-cyan-500" />
            Active Platform Backend: <strong className="text-white">OpenXR v1.0.2</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Layers size={13} className="text-amber-500" />
            Virtual Target: <strong className="text-white">Quest 2 / 3 / 3S / Windows PC / Touch</strong>
          </span>
        </div>
        <div>
          Mod Sandbox Protection Level: <strong className="text-emerald-400">CRASH GUARD ACTIVE</strong>
        </div>
      </div>
    </motion.div>
  );
}
