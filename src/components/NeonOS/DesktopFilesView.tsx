import React, { useState } from 'react';
import { 
  Folder, File, HardDrive, Cloud, Usb, Search, Lock, Share2, 
  Trash2, Download, Eye, Sparkles, Filter, CheckCircle2
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface FileItem {
  id: string;
  name: string;
  category: 'docs' | 'media' | 'games' | 'projects' | 'backups';
  sizeMB: number;
  date: string;
  encrypted: boolean;
  location: string;
}

const INITIAL_FILES: FileItem[] = [
  { id: 'f1', name: 'warzone_tactical_briefing.pdf', category: 'docs', sizeMB: 14.2, date: 'Today, 10:14 AM', encrypted: true, location: 'Cloud Vault' },
  { id: 'f2', name: 'tank_ricochet_highlight_4k.mp4', category: 'media', sizeMB: 480.0, date: 'Today, 08:30 AM', encrypted: false, location: 'NVMe Root' },
  { id: 'f3', name: 'emperor_q3_financial_audit.xlsx', category: 'docs', sizeMB: 8.5, date: 'Yesterday', encrypted: true, location: 'Cloud Vault' },
  { id: 'f4', name: 'titan_t90m_mesh_rigged.gltf', category: 'projects', sizeMB: 125.0, date: 'Sep 28, 2026', encrypted: false, location: 'USB-C SanDisk' },
  { id: 'f5', name: 'neon_arena_full_backup_v2.tar.gz', category: 'backups', sizeMB: 8400.0, date: 'Sep 27, 2026', encrypted: true, location: 'USB-C Samsung' },
  { id: 'f6', name: 'rooftop_parkour_speedrun_ghost.dat', category: 'games', sizeMB: 32.4, date: 'Sep 26, 2026', encrypted: false, location: 'NVMe Root' }
];

export const DesktopFilesView: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('ui_click');
    setTimeout(() => setToast(null), 3000);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-blue-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/40 rounded-xl text-blue-400">
            <Folder size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-blue-400 uppercase tracking-tight">NEON UNIFIED FILE ECOSYSTEM</h2>
              <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                AES-256 ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Documents • 4K Media • 3D Projects • System Backups • USB-C External Storage Pools
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search across all files & drives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-blue-300 placeholder-zinc-500 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {toast && (
        <div className="bg-blue-500 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="col-span-3 border-r border-white/10 p-5 space-y-4 bg-zinc-900/40 overflow-y-auto text-xs">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">LOCATIONS</span>
          <div className="space-y-1">
            {[
              { id: 'all', label: 'All Files', icon: HardDrive },
              { id: 'docs', label: 'Documents & Briefs', icon: File },
              { id: 'media', label: 'Videos & 4K Clips', icon: Folder },
              { id: 'projects', label: '3D & Blender Projects', icon: Folder },
              { id: 'games', label: 'Game Data & Saves', icon: Folder },
              { id: 'backups', label: 'Full System Backups', icon: Cloud }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                  selectedCategory === cat.id ? 'bg-blue-500 text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <cat.icon size={15} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DRIVES</span>
            <div className="space-y-1 mt-2 text-zinc-400">
              <div className="p-2 flex items-center gap-2 text-[11px]"><HardDrive size={14} className="text-purple-400" /> NVMe Gen5 (868 GB)</div>
              <div className="p-2 flex items-center gap-2 text-[11px]"><Usb size={14} className="text-cyan-400" /> USB-C SanDisk (750 GB)</div>
              <div className="p-2 flex items-center gap-2 text-[11px]"><Cloud size={14} className="text-emerald-400" /> Neon Cloud (3.4 TB)</div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="col-span-9 p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase pb-2 border-b border-white/10 font-bold">
            <span className="flex-1">File Name</span>
            <span className="w-32">Location</span>
            <span className="w-24">Size</span>
            <span className="w-32">Modified</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between text-xs transition-all"
            >
              <div className="flex-1 flex items-center gap-2.5 pr-2">
                <File size={16} className="text-blue-400 flex-shrink-0" />
                <span className="font-bold text-white truncate">{file.name}</span>
                {file.encrypted && (
                  <span title="AES-256 Encrypted">
                    <Lock size={12} className="text-amber-400 flex-shrink-0" />
                  </span>
                )}
              </div>
              <span className="w-32 text-zinc-400 text-[11px]">{file.location}</span>
              <span className="w-24 text-zinc-300 font-bold">{file.sizeMB > 1024 ? `${(file.sizeMB / 1024).toFixed(1)} GB` : `${file.sizeMB} MB`}</span>
              <span className="w-32 text-zinc-500 text-[11px]">{file.date}</span>
              <div className="w-20 flex items-center justify-end gap-2">
                <button
                  onClick={() => showToast(`Opened file ${file.name}`)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white"
                  title="Preview"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => showToast(`Generated encrypted share link for ${file.name}`)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white"
                  title="Share"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
