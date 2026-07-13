import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, FolderOpen, Sparkles, ShieldAlert } from 'lucide-react';
import { CustomCharacterFolder } from './CustomCharacterFolder';

interface CharacterFolderModalProps {
  onClose: () => void;
}

export function CharacterFolderModal({ onClose }: CharacterFolderModalProps) {
  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-md overflow-hidden font-sans pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="bg-zinc-950/95 border border-amber-500/35 w-full max-w-2xl rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Glowing Accents */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-sm" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-amber-400 hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer"
          title="Close Customizer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <FolderOpen className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              CHARACTER STORAGE MATRIX
            </h2>
          </div>
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            Drag & Drop custom 3D models to swap your avatar skins in real-time
          </p>
        </div>

        {/* Content Folder */}
        <CustomCharacterFolder />

        {/* Security / Performance Disclaimer */}
        <div className="flex gap-2.5 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-[9px] text-amber-400/70 leading-normal">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block mb-0.5">MATRIX RENDERING PERFORMANCE</span>
            Custom models are rendered client-side using customized Three.js buffers. Highly complex meshes with over 100,000 polygons or unoptimized material references may impact framerates.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
