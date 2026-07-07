import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Search, Download, Terminal, Settings2, Info, Sparkles } from 'lucide-react';
import { AURUM_DOMINION_DOSSIER } from '../data/dossier';

interface DossierModalProps {
  onClose: () => void;
}

export function DossierModal({ onClose }: DossierModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('full');

  const handleCopy = () => {
    navigator.clipboard.writeText(AURUM_DOMINION_DOSSIER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sections mapped out of the large text block for high scanability navigation
  const sections = useMemo(() => {
    return [
      { id: 'full', label: 'FULL DOSSIER' },
      { id: 'summary', label: '1. EXECUTIVE SUMMARY' },
      { id: 'history', label: '2. HISTORY & TIMELINE' },
      { id: 'schematic', label: '3. SCHEMATIC: ENTRANCE' },
      { id: 'shafts', label: '4. CENTRAL SHAFTS' },
      { id: 'sectors', label: '5. FIVE LEVEL SECTORS' },
      { id: 'economy', label: '6. MERCHANTS & VENDORS' },
      { id: 'bosses', label: '7. BOSS ENCOUNTER GUIDE' },
      { id: 'procedural', label: '8. MINECRAFT PROCEDURAL CODE' },
      { id: 'printing', label: '9. 3D PRINTING MANUAL' },
      { id: 'stg', label: '10. COMBAT GUIDE & METAS' }
    ];
  }, []);

  const displayedContent = useMemo(() => {
    if (activeTab === 'full') {
      if (!searchQuery) return AURUM_DOMINION_DOSSIER;
      
      // If searching, filter lines containing search query
      const lines = AURUM_DOMINION_DOSSIER.split('\n');
      const matched = lines.filter(line => 
        line.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matched.length > 0 
        ? `--- WORD SEARCH SEARCH RESULTS FOR "${searchQuery.toUpperCase()}" (${matched.length} MATCHES) ---\n\n` + matched.join('\n')
        : `--- NO MATCHES FOUND FOR "${searchQuery}" ---`;
    }

    // Extract particular section to make it highly legible
    const lines = AURUM_DOMINION_DOSSIER.split('\n');
    let titleMarker = '';
    switch (activeTab) {
      case 'summary': titleMarker = '1. EXECUTIVE SUMMARY'; break;
      case 'history': titleMarker = '2. HISTORICAL TIMELINE'; break;
      case 'schematic': titleMarker = '3. REGIONAL SCHEMATIC'; break;
      case 'shafts': titleMarker = '4. ARCHITECTURAL LIFELINE'; break;
      case 'sectors': titleMarker = '5. FIVE SECTOR LEVEL'; break;
      case 'economy': titleMarker = '6. ECONOMY, MERCHANTS'; break;
      case 'bosses': titleMarker = '7. ADVANCED BOSS ENCOUNTER'; break;
      case 'procedural': titleMarker = '8. PROCEDURAL MAP GENERATION'; break;
      case 'printing': titleMarker = '9. 3D PRINTING & MODEL'; break;
      case 'stg': titleMarker = '10. STRATEGY GUIDE'; break;
    }

    const sectionStartIndex = lines.findIndex(line => line.includes(titleMarker));
    if (sectionStartIndex === -1) return AURUM_DOMINION_DOSSIER;

    // Grab everything until the next equal line marker block
    const resultingLines = [];
    resultingLines.push(lines[sectionStartIndex]);
    for (let i = sectionStartIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('====') && i > sectionStartIndex + 2) {
        break; // Next header
      }
      resultingLines.push(lines[i]);
    }

    const compiledText = resultingLines.join('\n');
    if (!searchQuery) return compiledText;

    // Filter compiled text lines
    const subLines = compiledText.split('\n');
    const matched = subLines.filter(line => 
      line.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matched.length > 0 
      ? `--- ACCORDIAN SEARCH: "${searchQuery.toUpperCase()}" INSIDE THIS SECTION (${matched.length} MATCHES) ---\n\n` + matched.join('\n')
      : `--- NO MATCHES IN THIS SECTION ---\nOriginal matching context empty. Try searching in "FULL DOSSIER" tab.`;
  }, [activeTab, searchQuery]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/98 z-[150] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl overflow-hidden font-sans"
    >
      <div className="bg-zinc-950 border border-amber-500/30 rounded-[2.5rem] w-full max-w-7xl h-[90vh] flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.15)] overflow-hidden relative">
        {/* Dynamic Matrix Cyber grid overlay in background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.06),rgba(0,0,0,0))] pointer-events-none" />
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/5 p-6 md:px-8 gap-4 z-10 bg-zinc-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-widest bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">TACTICAL FILES</span>
                <span className="text-[9px] font-mono tracking-widest bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full">COPYABLE MAP DESIGN</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                AURUM DOMINION <span className="text-amber-400 text-sm md:text-base font-medium">dossier</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Instant clipboard copy button */}
            <button
              onClick={handleCopy}
              className={`px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                  : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied Entire GDD!' : 'Copy GDD (5k words)'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-xl text-white/50 hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search bar row */}
        <div className="px-6 md:px-8 py-4 border-b border-white/5 bg-zinc-900/20 flex flex-col sm:flex-row items-center gap-4 z-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search concepts inside dossier (e.g. Boss, Minecraft, Decimation, Level 100)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-amber-500/80 hover:text-amber-400"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono tracking-wider w-full sm:w-auto shrink-0 justify-end">
            <Info size={12} className="text-amber-500/70" />
            <span>Interactive document synchronized with real-world map anchors!</span>
          </div>
        </div>

        {/* Content body split layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left panel: Quick navigating tabs list */}
          <div className="w-full lg:w-80 border-r border-white/5 bg-black/60 p-4 overflow-y-auto shrink-0 flex gap-2 lg:flex-col custom-scrollbar">
            <span className="hidden lg:block text-[9px] font-black tracking-widest text-white/30 px-3 py-1.5 uppercase mb-2">INTELLIGENCE NAVINDEX</span>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id);
                  // Play dynamic interface noise
                  try {
                    const audio = new Audio();
                    audio.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
                    audio.volume = 0.05;
                    audio.play();
                  } catch (e) {}
                }}
                className={`text-[10px] font-black uppercase text-left py-3 px-3.5 rounded-xl transition-all duration-200 shrink-0 cursor-pointer flex items-center justify-between gap-2 border ${
                  activeTab === sec.id
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold shadow-[inset_0_0_10px_rgba(245,158,11,0.06)] scale-[1.01]'
                    : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <span className="truncate">{sec.label}</span>
                {activeTab === sec.id && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />}
              </button>
            ))}
          </div>

          {/* Right panel: Live render console block */}
          <div className="flex-1 bg-black/40 p-6 overflow-auto custom-scrollbar flex flex-col relative">
            <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-amber-500/50 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
              ASCII FEED v4.2.19
            </div>
            
            <pre className="text-xs md:text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
              {displayedContent}
            </pre>
          </div>
        </div>

        {/* Bottom utility status footer bar */}
        <div className="border-t border-white/5 px-6 md:px-8 py-3 bg-zinc-950/60 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-white/30 tracking-widest">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-flicker shrink-0" />
            <span>SECURE ENCRYPTED NETWORK FEED</span>
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <span>CHAR LENGTH: {AURUM_DOMINION_DOSSIER.length}</span>
            <span>WORDS: ~5000</span>
            <span>PORT EXPORTS: OBJ/MTL COMPATIBLE</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
