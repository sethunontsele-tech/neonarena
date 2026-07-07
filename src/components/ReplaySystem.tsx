import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, FastForward, Rewind, SkipBack, SkipForward, 
  Camera, Video, Save, X, Clock, Eye, Maximize, Settings
} from 'lucide-react';
import { useGameStore, ReplaySnapshot, EnvironmentState } from '../store';

export const CameraPathEditor: React.FC = () => {
  const points = useGameStore(state => state.cameraPath);
  const setPoints = useGameStore(state => state.setCameraPath);
  const replayTime = useGameStore(state => state.replayTime);
  
  const addPoint = () => {
    const cam = (window as any).camera;
    if (cam) {
      const newPoint = {
        x: cam.position.x,
        y: cam.position.y,
        z: cam.position.z,
        time: replayTime
      };
      setPoints([...points, newPoint]);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-4 w-64">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Camera Path</h4>
        <button onClick={addPoint} className="p-1 bg-amber-500 rounded text-black hover:bg-white transition-colors">
          <Maximize size={14} />
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {points.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-[10px] font-mono text-white/80 bg-white/5 p-2 rounded">
            <span>P{i}</span>
            <span>T: {p.time.toFixed(1)}s</span>
            <button onClick={() => setPoints(points.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReplayControls: React.FC = () => {
  const isReplayPaused = useGameStore(state => state.isReplayPaused);
  const setReplayPaused = useGameStore(state => state.setReplayPaused);
  const replayPlaybackSpeed = useGameStore(state => state.replayPlaybackSpeed);
  const setReplayPlaybackSpeed = useGameStore(state => state.setReplayPlaybackSpeed);
  const replayTime = useGameStore(state => state.replayTime);
  const seekReplay = useGameStore(state => state.seekReplay);
  const currentReplay = useGameStore(state => state.currentReplay);
  
  const isCameraPathEditorOpen = useGameStore(state => state.isCameraPathEditorOpen);
  const setCameraPathEditorOpen = useGameStore(state => state.setCameraPathEditorOpen);
  
  const totalDuration = currentReplay.length > 0 ? currentReplay.length : 100;
  const progress = (replayTime / totalDuration) * 100;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 flex flex-col items-center gap-4">
      <AnimatePresence>
        {isCameraPathEditorOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <CameraPathEditor />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Timeline */}
        <div className="relative h-2 bg-zinc-800 rounded-full mb-6 group cursor-pointer overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
          <input 
            type="range"
            min="0"
            max={totalDuration}
            value={replayTime}
            onChange={(e) => seekReplay(parseInt(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => seekReplay(Math.max(0, replayTime - 10))}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Rewind size={20} />
            </button>
            
            <button 
              onClick={() => setReplayPaused(!isReplayPaused)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isReplayPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
            </button>

            <button 
              onClick={() => seekReplay(Math.min(totalDuration, replayTime + 10))}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <FastForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">
              <Clock size={14} className="text-zinc-500" />
              <span className="text-xs font-mono text-white">
                {Math.floor(replayTime / 60)}:{(replayTime % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[0.5, 1, 2, 4].map(speed => (
                <button
                  key={speed}
                  onClick={() => setReplayPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    replayPlaybackSpeed === speed ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCameraPathEditorOpen(!isCameraPathEditorOpen)}
              className={`p-2 transition-colors ${isCameraPathEditorOpen ? 'text-amber-400' : 'text-zinc-400 hover:text-white'}`}
            >
              <Camera size={20} />
            </button>
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Video size={20} />
            </button>
            <button 
              onClick={() => {
                useGameStore.getState().stopReplay();
                useGameStore.getState().setGameState('lobby');
              }}
              className="p-2 text-red-400 hover:text-red-300 transition-colors ml-4"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ReplayManager: React.FC = () => {
  const isRecording = useGameStore(state => state.isRecording);
  const gameState = useGameStore(state => state.gameState);
  const isReplaying = useGameStore(state => state.isReplaying);
  
  useEffect(() => {
    if (!isRecording || gameState !== 'playing' || isReplaying) return;

    const interval = setInterval(() => {
      const state = useGameStore.getState() as any;
      const snapshot: ReplaySnapshot = {
        timestamp: Date.now(),
        players: { ...state.otherPlayers },
        enemies: [...state.enemies],
        vehicles: { ...state.vehicles },
        environment: { ...state.environment },
        events: [],
        camera: {
          position: [(window as any).camera?.position.x || 0, (window as any).camera?.position.y || 0, (window as any).camera?.position.z || 0],
          rotation: [(window as any).camera?.rotation.x || 0, (window as any).camera?.rotation.y || 0, (window as any).camera?.rotation.z || 0],
          fov: (window as any).camera?.fov || 75
        }
      };
      
      useGameStore.setState(s => ({
        currentReplay: [...s.currentReplay, snapshot]
      }));
    }, 100); // 10Hz recording

    return () => clearInterval(interval);
  }, [isRecording, gameState]);

  return null;
};
