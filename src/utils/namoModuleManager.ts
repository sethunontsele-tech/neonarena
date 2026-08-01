import { NamoModule } from '../components/NeonArenaModStudio';

export interface ModuleFile {
  path: string;
  name: string;
  category: keyof NamoModule['folderContents'];
  content: string;
}

export interface ModuleFolderBuildResult {
  module: NamoModule;
  files: ModuleFile[];
  summary: string;
}

/**
 * Builds a standardized 18-category modular folder structure for any Educational App, Game, or Feature module
 * in Neon Arena (.namo architecture).
 */
export function generate400Modules(): NamoModule[] {
  const categories = [
    { type: 'educational' as const, prefix: 'edu_', namePrefixes: ['Quantum', 'Astro', 'Bio', 'Neuro', 'Chem', 'Geo', 'Math', 'History', 'Language', 'Robotics', 'Genetics', 'Thermodynamics', 'Cosmology', 'Aero', 'Optics', 'Ecology', 'Oceanography', 'Microbiology', 'Nanotech', 'Logic', 'AI Ethics', 'Calculus', 'Anatomy', 'Paleontology', 'Seismology'] },
    { type: 'game' as const, prefix: 'game_', namePrefixes: ['Cyber', 'Neon', 'Hyper', 'Void', 'Quantum', 'Titan', 'Apex', 'Phantom', 'Inferno', 'Starlight', 'Eclipse', 'Omega', 'Vortex', 'Shadow', 'Solar', 'Chrono', 'Pulse', 'Velocity', 'Aether', 'Rift', 'Nexus', 'Glitch', 'Matrix', 'Horizon', 'Overdrive'] },
    { type: 'simulation' as const, prefix: 'sim_', namePrefixes: ['Fluid', 'Gravity', 'Atmosphere', 'BlackHole', 'Particle', 'Thermal', 'Magnetic', 'Ecosystem', 'Traffic', 'Economic', 'Neural', 'Aerodynamic', 'Orbit', 'Wave', 'Plasma', 'Supernova', 'Subatomic', 'Cellular', 'Climatic', 'Tectonic', 'QuantumState', 'OpticBeam', 'Acoustic', 'Kinetic', 'Tidal'] },
    { type: 'utility' as const, prefix: 'util_', namePrefixes: ['AudioSynth', 'VFXProfiler', 'MemoryOptimizer', 'NetworkInspector', 'ShaderCompiler', 'PhysicsDebugger', 'AssetBundler', 'TelemetryLogger', 'FPSMonitor', 'LocalizationSync', 'StateInspector', 'HotReloader', 'TextureCompressor', 'MeshSimplifier', 'FontRasterizer', 'RenderPipeline', 'InputMapper', 'SoundMatrix', 'UIBuilder', 'CrashReporter', 'CloudSync', 'SecurityFilter', 'LatencyTuner', 'CacheEngine', 'GarbageCollector'] },
    { type: 'custom' as const, prefix: 'feat_', namePrefixes: ['Portal', 'Teleport', 'Shield', 'Laser', 'PlasmaGun', 'Jetpack', 'GrapplingHook', 'TimeDilation', 'Cloaking', 'Hologram', 'EMP', 'ForceField', 'OrbitalStrike', 'DroneSwarm', 'MechSuit', 'NanobotHeal', 'SoundCannon', 'GravityWell', 'ThermalSight', 'PhaseShift', 'EnergyBlade', 'TractorBeam', 'SonicBoom', 'VortexCannon', 'MagnetGlove'] }
  ];

  const suffixes = ['Academy', 'Simulator', 'Arena', 'Engine', 'Core', 'System', 'Studio', 'Lab', 'Protocol', 'Matrix', 'Hub', 'Explorer', 'Workbench', 'Toolkit', 'Suite', 'Network'];

  const modules: NamoModule[] = [];
  let count = 0;

  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const cat = categories[catIdx];
    for (let pIdx = 0; pIdx < cat.namePrefixes.length; pIdx++) {
      for (let sIdx = 0; sIdx < suffixes.length; sIdx++) {
        if (count >= 400) break;
        count++;
        const pName = cat.namePrefixes[pIdx];
        const sName = suffixes[sIdx];
        const fullName = `${pName} ${sName} (${cat.type === 'educational' ? 'Educational App' : cat.type === 'game' ? 'Full Game' : cat.type === 'simulation' ? 'Simulation Engine' : cat.type === 'utility' ? 'Dev Utility' : 'Feature Module'})`;
        const cleanId = `${cat.prefix}${pName.toLowerCase()}_${sName.toLowerCase()}_${count}`;
        const folder = `/features/${cleanId}/`;

        modules.push({
          id: cleanId,
          name: fullName,
          version: `1.${(count % 9) + 1}.0`,
          status: 'LOADED',
          folder,
          dependencies: count % 3 === 0 ? ['feat_spatial_physics'] : count % 5 === 0 ? ['feat_vfx_core'] : [],
          lastAction: `Hot-swappable module #${count} initialized in NamoRegistry`,
          folderContents: {
            code: [`${cleanId}.namo`, `${cleanId}_handler.cs`],
            models: [`${cleanId}_mesh.gltf`],
            textures: [`${cleanId}_diffuse.dds`],
            materials: [`mat_${cleanId}.mat`],
            audio: [`${cleanId}_ambient.ogg`],
            music: [`${cleanId}_soundtrack.wav`],
            sfx: [`${cleanId}_sfx.wav`],
            ui: [`${cleanId}_hud.json`],
            fonts: ['Orbitron-Medium.ttf'],
            icons: [`icon_${cleanId}.png`],
            animations: [`anim_${cleanId}.anim`],
            vfx: [`vfx_${cleanId}.particle`],
            shaders: [`shader_${cleanId}.hlsl`],
            config: ['config.json'],
            localization: ['en-US.json', 'es-ES.json'],
            documentation: ['README.md', 'SPECIFICATION.md'],
            tests: [`test_${cleanId}.namotest`],
            manifest: ['manifest.json', 'feature.namo']
          }
        });
      }
      if (count >= 400) break;
    }
    if (count >= 400) break;
  }

  return modules;
}

export function buildModuleFolder(
  featureName: string = 'Custom Feature Module',
  options: {
    id?: string;
    version?: string;
    dependencies?: string[];
    description?: string;
    categoryType?: 'educational' | 'game' | 'simulation' | 'utility' | 'custom';
  } = {}
): ModuleFolderBuildResult {
  const categoryType = options.categoryType || 'custom';
  const prefix = categoryType === 'educational' ? 'edu_' : categoryType === 'game' ? 'game_' : categoryType === 'simulation' ? 'sim_' : 'feat_';
  
  const cleanId = options.id || `${prefix}${featureName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const version = options.version || '1.0.0';
  const dependencies = options.dependencies || [];
  const folder = `/features/${cleanId}/`;
  const sanitizedName = featureName.trim() || 'Custom Feature Module';

  const folderContents: NamoModule['folderContents'] = {
    code: [`${cleanId}.namo`, `${cleanId}_logic.cs`],
    models: [`${cleanId}_model.gltf`],
    textures: [`${cleanId}_diffuse.png`],
    materials: [`mat_${cleanId}.mat`],
    audio: [`${cleanId}_ambient.ogg`],
    music: [`${cleanId}_theme.wav`],
    sfx: [`${cleanId}_trigger.wav`],
    ui: [`${cleanId}_hud.json`],
    fonts: ['Orbitron-Bold.ttf'],
    icons: [`icon_${cleanId}.png`],
    animations: [`anim_${cleanId}_idle.anim`],
    vfx: [`vfx_${cleanId}_burst.particle`],
    shaders: [`shader_${cleanId}.hlsl`],
    config: ['config.json'],
    localization: ['en-US.json', 'es-ES.json'],
    documentation: ['README.md', 'SPECIFICATION.md'],
    tests: [`test_${cleanId}.namotest`],
    manifest: ['manifest.json', 'feature.namo']
  };

  const module: NamoModule = {
    id: cleanId,
    name: sanitizedName,
    version,
    status: 'LOADED',
    folder,
    dependencies,
    lastAction: `Module folder initialized at ${new Date().toLocaleTimeString()}`,
    folderContents
  };

  const files: ModuleFile[] = [
    {
      path: `${folder}code/${cleanId}.namo`,
      name: `${cleanId}.namo`,
      category: 'code',
      content: `// NAMO Hot-Swappable Script: ${sanitizedName}\n// Version: ${version}\n\nmodule ${cleanId} {\n  export function Initialize() {\n    NamoLogger.Log("Initialized ${sanitizedName}");\n  }\n\n  export function Load() {\n    NamoRegistry.RegisterComponent("${cleanId}");\n  }\n\n  export function Unload() {\n    NamoRegistry.UnregisterComponent("${cleanId}");\n  }\n}`
    },
    {
      path: `${folder}manifest/manifest.json`,
      name: 'manifest.json',
      category: 'manifest',
      content: JSON.stringify({
        id: cleanId,
        name: sanitizedName,
        version,
        schemaVersion: '3.5',
        dependencies,
        author: 'Neon Arena Mod Studio',
        entryPoint: `code/${cleanId}.namo`,
        hotSwappable: true
      }, null, 2)
    },
    {
      path: `${folder}config/config.json`,
      name: 'config.json',
      category: 'config',
      content: JSON.stringify({
        enabled: true,
        updateRateHz: 60,
        settings: {
          intensity: 1.0,
          quality: 'ultra'
        }
      }, null, 2)
    },
    {
      path: `${folder}documentation/README.md`,
      name: 'README.md',
      category: 'documentation',
      content: `# ${sanitizedName}\n\nHot-Swappable NAMO Feature Module v${version}\n\n- **ID**: \`${cleanId}\`\n- **Folder**: \`${folder}\`\n- **Dependencies**: ${dependencies.length > 0 ? dependencies.join(', ') : 'None'}\n`
    },
    {
      path: `${folder}models/${cleanId}_model.gltf`,
      name: `${cleanId}_model.gltf`,
      category: 'models',
      content: `// Binary/JSON GLTF 3D Mesh asset placeholder for ${sanitizedName}`
    },
    {
      path: `${folder}textures/${cleanId}_diffuse.png`,
      name: `${cleanId}_diffuse.png`,
      category: 'textures',
      content: `// Texture asset data [2048x2048 RGBA]`
    },
    {
      path: `${folder}materials/mat_${cleanId}.mat`,
      name: `mat_${cleanId}.mat`,
      category: 'materials',
      content: `shader = "shader_${cleanId}.hlsl"\nroughness = 0.2\nmetalness = 0.8\nemissiveColor = #00F0FF`
    },
    {
      path: `${folder}audio/${cleanId}_ambient.ogg`,
      name: `${cleanId}_ambient.ogg`,
      category: 'audio',
      content: `// Ambient audio loop asset`
    },
    {
      path: `${folder}music/${cleanId}_theme.wav`,
      name: `${cleanId}_theme.wav`,
      category: 'music',
      content: `// Synthwave soundtrack theme asset`
    },
    {
      path: `${folder}sfx/${cleanId}_trigger.wav`,
      name: `${cleanId}_trigger.wav`,
      category: 'sfx',
      content: `// SFX action sound asset`
    },
    {
      path: `${folder}ui/${cleanId}_hud.json`,
      name: `${cleanId}_hud.json`,
      category: 'ui',
      content: JSON.stringify({ type: 'hud_widget', visible: true, anchors: ['top', 'right'] }, null, 2)
    },
    {
      path: `${folder}vfx/vfx_${cleanId}_burst.particle`,
      name: `vfx_${cleanId}_burst.particle`,
      category: 'vfx',
      content: `particles_per_sec = 500\ncolor = #FF00AA\nlifetime = 1.5s`
    },
    {
      path: `${folder}shaders/shader_${cleanId}.hlsl`,
      name: `shader_${cleanId}.hlsl`,
      category: 'shaders',
      content: `cbuffer ConstantBuffer : register(b0) { matrix WorldViewProjection; };\nstruct VS_OUTPUT { float4 Pos : SV_POSITION; };\nVS_OUTPUT VS(float4 Pos : POSITION) { VS_OUTPUT output; output.Pos = mul(Pos, WorldViewProjection); return output; }`
    },
    {
      path: `${folder}localization/en-US.json`,
      name: 'en-US.json',
      category: 'localization',
      content: JSON.stringify({ title: sanitizedName, desc: 'Hot-swappable module' }, null, 2)
    },
    {
      path: `${folder}tests/test_${cleanId}.namotest`,
      name: `test_${cleanId}.namotest`,
      category: 'tests',
      content: `Assert.NotNull(NamoRegistry.Get("${cleanId}"));\nAssert.IsTrue(Module.Status == "LOADED");`
    }
  ];

  return {
    module,
    files,
    summary: `Module folder "${sanitizedName}" (${cleanId}) registered with complete 18-specification directory at ${folder}.`
  };
}
