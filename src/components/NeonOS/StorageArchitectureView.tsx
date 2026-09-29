import React, { useState } from 'react';
import { 
  HardDrive, Usb, Cloud, ArrowDownToLine, RefreshCw, CheckCircle2,
  Trash2, ShieldAlert, Cpu, Sparkles, FolderArchive, Layers
} from 'lucide-react';
import { StorageDrive } from './types';
import { soundService } from '../../services/soundService';

const INITIAL_DRIVES: StorageDrive[] = [
  { id: 'drive_internal', name: 'Internal Ultra NVMe Gen5 (Neon OS Root)', type: 'internal_nvme', totalGB: 1024, usedGB: 868.93, health: 99, speedMBs: 7400, mountPoint: '/sys/root' },
  { id: 'drive_usbc_1', name: 'SanDisk Extreme Pro 2TB (USB-C 3.2 Gen 2x2)', type: 'external_usbc', totalGB: 2048, usedGB: 750.4, health: 100, speedMBs: 2000, mountPoint: '/mnt/usbc_sandisk' },
  { id: 'drive_usbc_2', name: 'Samsung T7 Shield 4TB (USB-C Expansion)', type: 'external_usbc', totalGB: 4096, usedGB: 1240.0, health: 98, speedMBs: 1050, mountPoint: '/mnt/usbc_samsung' },
  { id: 'drive_cloud', name: 'Neon Decentralized Cloud Pool (10TB Plan)', type: 'cloud_pool', totalGB: 10240, usedGB: 3410.5, health: 100, speedMBs: 500, mountPoint: '/cloud/sync' }
];

export const StorageArchitectureView: React.FC = () => {
  const [drives, setDrives] = useState<StorageDrive[]>(INITIAL_DRIVES);
  const [selectedDrive, setSelectedDrive] = useState<StorageDrive>(INITIAL_DRIVES[0]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    soundService.playSFX('powerup');
    setTimeout(() => setToast(null), 3500);
  };

  const handleFormatDrive = (driveId: string) => {
    setDrives(prev => prev.map(d => {
      if (d.id === driveId && d.type === 'external_usbc') {
        showToast(`Formatted external drive ${d.name} to Neon-FS (High Performance Journaled).`);
        return { ...d, usedGB: 0.1 };
      }
      return d;
    }));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-purple-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/40 rounded-xl text-purple-400">
            <HardDrive size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-purple-400 uppercase tracking-tight">MASSIVE STORAGE ARCHITECTURE</h2>
              <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                MULTI-STORAGE USB-C READY
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Conceptual Suite Footprints: Emperor (400 GB) • Toolbox (300 GB) • Core (200 GB) • App Manager (68.93 GB)
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Discovered USB-C Hotplug drive: NVMe external storage attached.')}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black font-black text-xs uppercase rounded-xl flex items-center gap-2 transition-all"
        >
          <Usb size={16} />
          <span>Mount External USB-C Drive</span>
        </button>
      </div>

      {toast && (
        <div className="bg-purple-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {toast}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Drive Disks */}
        <div className="col-span-5 border-r border-white/10 p-6 space-y-4 overflow-y-auto">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            MOUNTED VOLUMES & PARTITIONS
          </span>

          {drives.map(drive => {
            const isSelected = selectedDrive.id === drive.id;
            const usedPercent = (drive.usedGB / drive.totalGB) * 100;
            return (
              <div
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/15 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {drive.type === 'internal_nvme' ? <HardDrive size={18} className="text-purple-400" /> :
                     drive.type === 'external_usbc' ? <Usb size={18} className="text-cyan-400" /> :
                     <Cloud size={18} className="text-emerald-400" />}
                    <h4 className="text-xs font-black text-white uppercase">{drive.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">{drive.health}% Health</span>
                </div>

                {/* Capacity Bar */}
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full ${usedPercent > 85 ? 'bg-red-500' : 'bg-purple-500'}`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Used: <strong className="text-white">{drive.usedGB.toFixed(1)} GB</strong></span>
                  <span>Free: <strong className="text-emerald-400">{(drive.totalGB - drive.usedGB).toFixed(1)} GB</strong></span>
                  <span>Max: {drive.totalGB} GB</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Storage Architecture Details */}
        <div className="col-span-7 p-6 overflow-y-auto space-y-6">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
              VOLUME INSPECTOR // {selectedDrive.mountPoint}
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
              {selectedDrive.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Transfer Speed: <strong className="text-cyan-400">{selectedDrive.speedMBs} MB/s</strong> • Multi-partition Neon-FS format.
            </p>
          </div>

          {/* Conceptual Footprint Allocation */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black text-white uppercase">NEON ECOSYSTEM FOOTPRINT ALLOCATION</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-300">👑 Emperor Business & Creator Super-App:</span>
                <span className="font-black text-amber-400">400.00 GB</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-300">🧰 Neon Toolbox Giant Suite:</span>
                <span className="font-black text-cyan-400">300.00 GB</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-300">🎮 Neon Arena Core Game Engine:</span>
                <span className="font-black text-purple-400">200.00 GB</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-300">📦 Neon Arena App Manager System:</span>
                <span className="font-black text-emerald-400">68.93 GB</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-300">🎥 Creator 4K Captures & 3D Assets:</span>
                <span className="font-black text-white">150.00 GB</span>
              </div>
            </div>
          </div>

          {/* Drive Management Actions */}
          <div className="flex gap-3">
            {selectedDrive.type === 'external_usbc' && (
              <button
                onClick={() => handleFormatDrive(selectedDrive.id)}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500 hover:text-black border border-red-500/40 text-red-300 font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>Format External Drive</span>
              </button>
            )}
            <button
              onClick={() => showToast(`Synchronized ${selectedDrive.name} with Neon Cloud Storage Pool.`)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Sync All Game Saves to Cloud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
