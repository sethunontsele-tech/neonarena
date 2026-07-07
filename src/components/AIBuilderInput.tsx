import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { useGameStore } from '../store';
import { askGeminiToBuild } from '../services/geminiService';
import { soundService } from '../services/soundService';

export const AIBuilderInput = () => {
  const isBuildMode = useGameStore(state => state.isBuildMode);
  const playerPosition = useGameStore(state => state.playerPosition);
  const bulkPlaceBlocks = useGameStore(state => state.bulkPlaceBlocks);
  const addEvent = useGameStore(state => state.addEvent);
  
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    soundService.playSFX('ui_click');
    addEvent(`AI Builder: Processing request...`);

    try {
      const blocks = await askGeminiToBuild(prompt, playerPosition);
      if (blocks && blocks.length > 0) {
        bulkPlaceBlocks(blocks);
        addEvent(`AI Builder: Success! Placed ${blocks.length} blocks.`);
        setPrompt('');
        setIsOpen(false);
      } else {
        addEvent(`AI Builder: Could not generate structure. Try a different prompt.`);
      }
    } catch (error) {
      console.error(error);
      addEvent(`AI Builder: Error occurred during generation.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBuildMode) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-32 z-[80] pointer-events-auto">
      <AnimatePresence>
        {isOpen ? (
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onSubmit={handleBuild}
            className="bg-zinc-950/90 border border-white/20 p-2 rounded-2xl backdrop-blur-xl flex items-center gap-2 w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="pl-3 text-blue-400">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Ask Gemini to build something..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-transparent border-none text-white font-bold text-sm py-2 focus:outline-none placeholder:text-white/20"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/30 hover:text-white"
            >
              <X size={18} />
            </button>
          </motion.form>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsOpen(true)}
            className="bg-blue-600/20 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] group"
          >
            <Sparkles size={16} className="group-hover:animate-pulse" />
            AI Build Assistant
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
