import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, FileArchive, Folder, CheckCircle, 
  Zap, ShieldCheck, Box, Info, Code, ChevronRight, 
  BookOpen, Layers, Check, AlertTriangle
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ImportTutorialModalProps {
  onClose: () => void;
  onInjectSample?: (sampleName: string) => void;
}

export function ImportTutorialModal({ onClose, onInjectSample }: ImportTutorialModalProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'meta' | 'modding' | 'samples'>('structure');

  const playHover = () => {
    try { soundService.playSFX('ui_hover'); } catch (e) {}
  };

  const playClick = () => {
    try { soundService.playSFX('spell'); } catch (e) {}
  };

  const handleInject = (sample: string) => {
    playClick();
    if (onInjectSample) {
      onInjectSample(sample);
    }
  };

  return (
    <div id="import-tutorial-modal" className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6 select-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-zinc-950 border border-amber-500/20 rounded-[2rem] w-full max-w-3xl relative z-10 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden max-h-[90vh] font-mono text-[11px] text-zinc-300"
      >
        {/* Holographic Top Bar */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <BookOpen size={18} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white italic uppercase tracking-wider">
                Universal Asset Import Manual
              </h2>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
                Learn zip hierarchies, extraction structures, and compilation ingestion
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            onMouseEnter={playHover}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 bg-black/40 px-6 shrink-0">
          {[
            { id: 'structure', label: '1. ZIP Directory Layout', icon: Folder },
            { id: 'meta', label: '2. Ingestion Metadata', icon: Layers },
            { id: 'modding', label: '3. Connecting Mods', icon: Code },
            { id: 'samples', label: '4. Quick Test Templates', icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab(tab.id as any); }}
                className={`px-4 py-3.5 font-black uppercase text-[9px] tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  active 
                    ? 'border-amber-400 text-amber-400 bg-white/[0.02]' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-350'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'structure' && (
              <motion.div
                key="structure"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3">
                  <Info className="text-amber-400 shrink-0 mt-0.5" size={16} />
                  <p className="leading-relaxed text-[10.5px]">
                    The Universal Ingestion Engine extracts uploaded ZIP archives recursively to locate game binaries, configurations, 3D meshes (<span className="text-amber-400">.obj</span>, <span className="text-amber-400">.fbx</span>), and textures in parallel. Avoid packaging files inside double folders.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Correct Structure */}
                  <div className="bg-zinc-900/40 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                      <CheckCircle size={14} />
                      Recommended ZIP Layout
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 font-mono text-[9px] text-zinc-400 space-y-1">
                      <div>📁 my-custom-asset.zip</div>
                      <div className="pl-4 text-emerald-400">├── model_mesh.obj (mesh)</div>
                      <div className="pl-4 text-emerald-400">├── diffuse_texture.png (skin)</div>
                      <div className="pl-4 text-cyan-400">├── manifest.json (descriptor)</div>
                      <div className="pl-4 text-zinc-500">├── AndroidManifest.xml (optional)</div>
                      <div className="pl-4 text-zinc-500">└── assets/ (binary directories)</div>
                    </div>
                    <div className="text-[9px] text-zinc-500 leading-normal">
                      ✅ Meshes and texture maps placed directly in root allow instant, lag-free file scanner matching.
                    </div>
                  </div>

                  {/* Incorrect Structure */}
                  <div className="bg-zinc-900/40 border border-red-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase">
                      <AlertTriangle size={14} />
                      Avoid Nested Folders
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 font-mono text-[9px] text-zinc-500 space-y-1">
                      <div>📁 my-custom-asset.zip</div>
                      <div className="pl-4 text-red-400">└── 📁 nested_subfolder/</div>
                      <div className="pl-8">└── 📁 deeper_subfolder/</div>
                      <div className="pl-12">├── model_mesh.obj</div>
                      <div className="pl-12">└── diffuse_texture.png</div>
                    </div>
                    <div className="text-[9px] text-zinc-500 leading-normal">
                      ❌ Triple nesting of folders triggers connection latency, missing texture linkages, or ingest timeout.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'meta' && (
              <motion.div
                key="meta"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                    <Layers size={14} className="text-cyan-400" />
                    How to define custom app metadata in ZIPs
                  </h4>
                  <p className="leading-relaxed text-zinc-400">
                    If your ZIP archive includes a standard text file named <span className="text-amber-400">manifest.json</span> at the root level, the scanner reads custom properties automatically instead of falling back to default values!
                  </p>

                  <div className="bg-black/80 rounded-xl p-4 font-mono text-[9px] text-zinc-300 leading-normal border border-white/5 space-y-1">
                    <div className="text-zinc-500">// Example manifest.json descriptor</div>
                    <div>{"{"}</div>
                    <div className="pl-4"><span className="text-cyan-400">"name"</span>: <span className="text-green-400">"Alien Raptor Companion"</span>,</div>
                    <div className="pl-4"><span className="text-cyan-400">"packageName"</span>: <span className="text-green-400">"com.mod.alienraptor"</span>,</div>
                    <div className="pl-4"><span className="text-cyan-400">"version"</span>: <span className="text-green-400">"1.2.4"</span>,</div>
                    <div className="pl-4"><span className="text-cyan-400">"developer"</span>: <span className="text-green-400">"Dr. Xenon Labs"</span>,</div>
                    <div className="pl-4"><span className="text-cyan-400">"description"</span>: <span className="text-green-400">"Low-poly robotic creature featuring glowing cybernetic details."</span></div>
                    <div>{"}"}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'modding' && (
              <motion.div
                key="modding"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                    <Code size={14} className="text-emerald-400" />
                    Connecting Imported Assets to your Mods
                  </h4>
                  <p className="leading-relaxed text-zinc-400">
                    Once your asset ZIP is successfully sent to the Sandbox server, the mod compiling engine makes it available for scripting logic! Here is how to configure it in C# and Python:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-amber-500 uppercase">A. In C# (Unity Game Hooks)</span>
                      <div className="bg-black/60 rounded-xl p-3 font-mono text-[8.5px] text-zinc-400 border border-white/5 leading-relaxed">
                        <span className="text-blue-400">void</span> <span className="text-amber-300">Start</span>() {"{"}<br />
                        &nbsp;&nbsp;<span className="text-zinc-500">// Custom model overrides applied</span><br />
                        &nbsp;&nbsp;ModelLink.<span className="text-cyan-300">ApplyMesh</span>(<span className="text-green-400">"model_mesh.obj"</span>);<br />
                        {"}"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-green-500 uppercase">B. In Python (Behavioral Scripting)</span>
                      <div className="bg-black/60 rounded-xl p-3 font-mono text-[8.5px] text-zinc-400 border border-white/5 leading-relaxed">
                        <span className="text-blue-400">def</span> <span className="text-green-300">on_world_load</span>():<br />
                        &nbsp;&nbsp;<span className="text-zinc-500"># Set custom visual scales</span><br />
                        &nbsp;&nbsp;set_bot_mesh(<span className="text-green-400">"model_mesh.obj"</span>)<br />
                        &nbsp;&nbsp;set_bot_scale(<span className="text-green-400">1.8</span>)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'samples' && (
              <motion.div
                key="samples"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400 animate-pulse" />
                    Quick Testing Presets
                  </h4>
                  <p className="leading-relaxed text-zinc-400">
                    Don't have a real Blender file ready on your local computer? Choose one of our pre-built, verified 3D zip assets to instantly inject into the import workspace for a test run!
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        name: '20-alienanimal_obj.zip',
                        desc: 'Cybernetic insect model with detailed joint coordinates and laser emission maps.',
                        size: '42.5 KB',
                        type: 'OBJ Model + Textures'
                      },
                      {
                        name: '27-obj.zip',
                        desc: 'Tactical Plasma Rifle custom mod. Full geometry definitions matching baseline weapons.',
                        size: '12.2 KB',
                        type: 'OBJ Model'
                      },
                      {
                        name: 'Controller_ALPHA_0_1.unitypackage.zip',
                        desc: 'OpenXR controller virtual overlay templates. Includes calibration scripts.',
                        size: '1.4 MB',
                        type: 'Sideload Package'
                      }
                    ].map((sample) => (
                      <div 
                        key={sample.name}
                        className="bg-black/40 border border-white/5 hover:border-amber-400/30 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[10px] text-white truncate uppercase">{sample.name}</span>
                            <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10 font-black">
                              {sample.size}
                            </span>
                          </div>
                          <p className="text-[8.5px] text-zinc-500 mt-1 leading-normal">{sample.desc}</p>
                        </div>

                        <button
                          onClick={() => handleInject(sample.name)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-white text-black font-black uppercase text-[8px] tracking-wider rounded-md transition-all cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          Inject Preset
                          <ChevronRight size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/60 shrink-0">
          <div className="flex items-center gap-2 text-zinc-500 text-[8.5px]">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>CRASH GUARD COMPLIANT SANITATION ENFORCED</span>
          </div>

          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-6 py-3 bg-amber-400 hover:bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            I UNDERSTAND
          </button>
        </div>
      </motion.div>
    </div>
  );
}
